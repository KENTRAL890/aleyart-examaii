// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const ROLE_PERMISSIONS = {
  admin:       ['*'],
  headteacher: ['exam:view','exam:approve','exam:print','exam:export','report:view','user:view'],
  examofficer: ['exam:create','exam:edit','exam:print','exam:export','repo:manage','question:manage'],
  teacher:     ['exam:create','exam:save','exam:edit','exam:print','exam:export','repo:view','question:view'],
};

function hasPermission(role, permission) {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes('*') || perms.includes(permission);
}

// NOTE: prisma is required lazily (inside function) to avoid "not initialized" error
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided' });

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lazy-require prisma to avoid module-load-time crash
    const prisma = require('../utils/prisma');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id:true, uuid:true, fullName:true, email:true, role:true, staffId:true, isActive:true }
    });

    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: 'Invalid or inactive account' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, message: 'Token invalid or expired' });
    next(err);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role))
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!hasPermission(req.user?.role, permission))
      return res.status(403).json({ success: false, message: `Missing permission: ${permission}` });
    next();
  };
}

module.exports = { authenticate, authorize, requirePermission, hasPermission };
