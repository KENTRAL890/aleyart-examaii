// src/controllers/dataController.js
function getPrisma() { return require('../utils/prisma'); }

// ─── STUDENTS ─────────────────────────────────────────────────────────────────
async function listStudents(req, res, next) {
  try {
    const prisma = getPrisma();
    const { classId, search, page = 1, limit = 50 } = req.query;
    const where = { isActive: true };
    if (classId) where.classId = parseInt(classId);
    if (search) where.fullName = { contains: search };
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where, include: { class: { select: { name: true } } },
        orderBy: { fullName: 'asc' },
        skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit)
      }),
      prisma.student.count({ where })
    ]);
    res.json({ success: true, data: students, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) { next(err); }
}

async function createStudent(req, res, next) {
  try {
    const prisma = getPrisma();
    const { admissionNumber, fullName, gender, dateOfBirth, classId, parentName, parentPhone, parentEmail, parentAddress } = req.body;
    const count = await prisma.student.count();
    const year = new Date().getFullYear().toString().slice(-2);
    const studentId = `STU${year}${String(count + 1).padStart(4, '0')}`;
    const student = await prisma.student.create({
      data: { admissionNumber, studentId, fullName, gender, dateOfBirth: new Date(dateOfBirth), classId: parseInt(classId), parentName, parentPhone, parentEmail, parentAddress }
    });
    await prisma.auditLog.create({ data: { userId: req.user.id, action: 'CREATE_STUDENT', resource: 'students', resourceId: String(student.id) } });
    res.status(201).json({ success: true, message: 'Student created', data: student });
  } catch (err) { next(err); }
}

async function updateStudent(req, res, next) {
  try {
    const prisma = getPrisma();
    const student = await prisma.student.update({ where: { id: parseInt(req.params.id) }, data: req.body });
    res.json({ success: true, message: 'Student updated', data: student });
  } catch (err) { next(err); }
}

async function deleteStudent(req, res, next) {
  try {
    const prisma = getPrisma();
    await prisma.student.update({ where: { id: parseInt(req.params.id) }, data: { isActive: false } });
    res.json({ success: true, message: 'Student deactivated' });
  } catch (err) { next(err); }
}

async function getStudentReport(req, res, next) {
  try {
    const prisma = getPrisma();
    const student = await prisma.student.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        class: true,
        results: { include: { examination: { include: { subject: true } } }, orderBy: { createdAt: 'desc' } }
      }
    });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) { next(err); }
}

// ─── TEACHERS ─────────────────────────────────────────────────────────────────
async function listTeachers(req, res, next) {
  try {
    const prisma = getPrisma();
    const users = await prisma.user.findMany({
      where: { role: { in: ['teacher', 'examofficer', 'headteacher'] }, isActive: true },
      include: {
        teacherClasses:  { include: { class:   { select: { name: true } } } },
        teacherSubjects: { include: { subject: { select: { name: true } } } }
      },
      orderBy: { fullName: 'asc' }
    });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
}

async function assignClasses(req, res, next) {
  try {
    const prisma = getPrisma();
    const { userId, classIds } = req.body;
    await prisma.teacherClass.deleteMany({ where: { userId: parseInt(userId) } });
    for (const classId of (classIds || [])) {
      await prisma.teacherClass.create({ data: { userId: parseInt(userId), classId: parseInt(classId) } });
    }
    res.json({ success: true, message: 'Classes assigned successfully' });
  } catch (err) { next(err); }
}

async function assignSubjects(req, res, next) {
  try {
    const prisma = getPrisma();
    const { userId, subjectIds } = req.body;
    await prisma.teacherSubject.deleteMany({ where: { userId: parseInt(userId) } });
    for (const subjectId of (subjectIds || [])) {
      await prisma.teacherSubject.create({ data: { userId: parseInt(userId), subjectId: parseInt(subjectId) } });
    }
    res.json({ success: true, message: 'Subjects assigned successfully' });
  } catch (err) { next(err); }
}

// ─── RESULTS ─────────────────────────────────────────────────────────────────
async function getResults(req, res, next) {
  try {
    const prisma = getPrisma();
    const { examinationId, classId } = req.query;
    const where = {};
    if (examinationId) where.examinationId = parseInt(examinationId);
    if (classId) where.student = { classId: parseInt(classId) };
    const results = await prisma.result.findMany({
      where,
      include: {
        student: { include: { class: { select: { name: true } } } },
        examination: { include: { subject: { select: { name: true } } } }
      },
      orderBy: { position: 'asc' }
    });
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
}

async function saveResult(req, res, next) {
  try {
    const prisma = getPrisma();
    const { studentId, examinationId, sectionAScore, sectionBScore, sectionCScore, sectionDScore, remarks } = req.body;
    const totalScore = (sectionAScore||0) + (sectionBScore||0) + (sectionCScore||0) + (sectionDScore||0);

    let grade = 'F9';
    if (totalScore >= 80) grade = 'A1';
    else if (totalScore >= 75) grade = 'B2';
    else if (totalScore >= 70) grade = 'B3';
    else if (totalScore >= 65) grade = 'C4';
    else if (totalScore >= 60) grade = 'C5';
    else if (totalScore >= 55) grade = 'C6';
    else if (totalScore >= 50) grade = 'D7';
    else if (totalScore >= 45) grade = 'E8';

    const result = await prisma.result.upsert({
      where: { studentId_examinationId: { studentId: parseInt(studentId), examinationId: parseInt(examinationId) } },
      update: { sectionAScore, sectionBScore, sectionCScore, sectionDScore, totalScore, grade, remarks, markedById: req.user.id, markedAt: new Date() },
      create: { studentId: parseInt(studentId), examinationId: parseInt(examinationId), sectionAScore, sectionBScore, sectionCScore, sectionDScore, totalScore, grade, remarks, markedById: req.user.id, markedAt: new Date() }
    });

    const allResults = await prisma.result.findMany({
      where: { examinationId: parseInt(examinationId) }, orderBy: { totalScore: 'desc' }
    });
    for (let i = 0; i < allResults.length; i++) {
      await prisma.result.update({ where: { id: allResults[i].id }, data: { position: i + 1 } });
    }

    res.json({ success: true, message: 'Result saved', data: result });
  } catch (err) { next(err); }
}

// ─── SCHOOL CONFIG ────────────────────────────────────────────────────────────
async function getSchoolConfig(req, res, next) {
  try {
    const prisma = getPrisma();
    const configs = await prisma.schoolConfig.findMany();
    const configMap = {};
    for (const c of configs) configMap[c.key] = c.value;
    res.json({ success: true, data: configMap });
  } catch (err) { next(err); }
}

async function updateSchoolConfig(req, res, next) {
  try {
    const prisma = getPrisma();
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await prisma.schoolConfig.upsert({
        where: { key },
        update: { value: String(value), updatedBy: req.user.id },
        create: { key, value: String(value), updatedBy: req.user.id }
      });
    }
    await prisma.auditLog.create({ data: { userId: req.user.id, action: 'UPDATE_SCHOOL_CONFIG', resource: 'school_config' } });
    res.json({ success: true, message: 'School configuration updated' });
  } catch (err) { next(err); }
}

// ─── QUESTION BANK ────────────────────────────────────────────────────────────
async function listQuestions(req, res, next) {
  try {
    const prisma = getPrisma();
    const { subjectId, cls, topic, difficulty, questionType, search, page = 1, limit = 30 } = req.query;
    const where = { isActive: true };
    if (subjectId) where.subjectId = parseInt(subjectId);
    if (cls)          where.forClass = cls;
    if (topic)        where.topic = { contains: topic };
    if (difficulty)   where.difficulty = difficulty;
    if (questionType) where.questionType = questionType;
    if (search)       where.questionText = { contains: search };
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: { subject: { select: { name: true } }, createdBy: { select: { fullName: true } }, options: true, subParts: true },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit)
      }),
      prisma.question.count({ where })
    ]);
    res.json({ success: true, data: questions, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) { next(err); }
}

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
async function getDashboardStats(req, res, next) {
  try {
    const prisma = getPrisma();
    const [exams, students, teachers, questions, pending, classes] = await Promise.all([
      prisma.examination.count(),
      prisma.student.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: { in: ['teacher','examofficer','headteacher'] }, isActive: true } }),
      prisma.question.count({ where: { isActive: true } }),
      prisma.examination.count({ where: { status: 'pending' } }),
      prisma.class.count({ where: { isActive: true } })
    ]);
    res.json({ success: true, data: { exams, students, teachers, questions, pending, classes } });
  } catch (err) { next(err); }
}

module.exports = {
  listStudents, createStudent, updateStudent, deleteStudent, getStudentReport,
  listTeachers, assignClasses, assignSubjects,
  getResults, saveResult,
  getSchoolConfig, updateSchoolConfig,
  listQuestions, getDashboardStats
};
