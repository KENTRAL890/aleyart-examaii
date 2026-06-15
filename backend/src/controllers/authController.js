// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function getPrisma() { return require('../utils/prisma'); }

function generateTokens(userId, role) {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
  return { accessToken, refreshToken };
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'LOGIN', resource: 'auth', ipAddress: req.ip }
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, uuid: user.uuid, fullName: user.fullName, email: user.email, role: user.role, staffId: user.staffId },
        accessToken,
        refreshToken
      }
    });
  } catch (err) { next(err); }
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { staffId, fullName, email, password, role, phone, qualification, position } = req.body;
    if (!staffId || !fullName || !email || !password)
      return res.status(400).json({ success: false, message: 'Required fields missing' });

    const prisma = getPrisma();
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { staffId, fullName, email: email.toLowerCase(), password: hashed, role: role || 'teacher', phone, qualification, position }
    });

    await prisma.auditLog.create({
      data: { userId: req.user.id, action: 'CREATE_USER', resource: 'users', resourceId: String(user.id) }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { id: user.id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch (err) { next(err); }
}

// POST /api/auth/refresh
async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Refresh token required' });

    const prisma = getPrisma();
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date())
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: 'User not found' });

    const { accessToken, refreshToken: newRefresh } = generateTokens(user.id, user.role);
    await prisma.refreshToken.delete({ where: { token } });
    await prisma.refreshToken.create({
      data: { token: newRefresh, userId: user.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({ success: true, data: { accessToken, refreshToken: newRefresh } });
  } catch (err) { next(err); }
}

// POST /api/auth/logout
async function logout(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    const prisma = getPrisma();
    if (token) await prisma.refreshToken.deleteMany({ where: { token } });
    await prisma.auditLog.create({
      data: { userId: req.user.id, action: 'LOGOUT', resource: 'auth', ipAddress: req.ip }
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id:true, uuid:true, staffId:true, fullName:true, email:true, phone:true, role:true, qualification:true, position:true, lastLogin:true, avatar:true }
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

// PUT /api/auth/change-password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password incorrect' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
}

module.exports = { login, register, refreshToken, logout, me, changePassword };
