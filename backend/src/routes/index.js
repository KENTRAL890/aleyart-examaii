// src/routes/index.js — All API routes
const express  = require('express');
const router   = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { authLimiter, aiLimiter }  = require('../middleware/rateLimiter');

const authCtrl   = require('../controllers/authController');
const examCtrl   = require('../controllers/examinationController');
const dataCtrl   = require('../controllers/dataController');
const exportCtrl = require('../controllers/exportController');

// ─── AUTH ─────────────────────────────────────────────────────────────────────
router.post('/auth/login',           authLimiter, authCtrl.login);
router.post('/auth/refresh',         authCtrl.refreshToken);
router.post('/auth/logout',          authenticate, authCtrl.logout);
router.get ('/auth/me',              authenticate, authCtrl.me);
router.post('/auth/register',        authenticate, authorize('admin'), authCtrl.register);
router.put ('/auth/change-password', authenticate, authCtrl.changePassword);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
router.get('/dashboard/stats', authenticate, dataCtrl.getDashboardStats);

// ─── EXAMINATIONS ─────────────────────────────────────────────────────────────
router.get ('/examinations',                    authenticate, examCtrl.listExaminations);
router.get ('/examinations/:uuid',              authenticate, examCtrl.getExamination);
router.post('/examinations/generate',           authenticate, aiLimiter, examCtrl.generateExam);
router.put ('/examinations/:uuid',              authenticate, examCtrl.updateExamination);
router.put ('/examinations/:uuid/approve',      authenticate, authorize('admin','headteacher'), examCtrl.approveExamination);
router.delete('/examinations/:uuid',            authenticate, authorize('admin','examofficer'), examCtrl.deleteExamination);
router.post('/examinations/:uuid/duplicate',    authenticate, examCtrl.duplicateExamination);

// ─── QUESTION BANK ────────────────────────────────────────────────────────────
router.get('/questions', authenticate, dataCtrl.listQuestions);

// ─── STUDENTS ─────────────────────────────────────────────────────────────────
router.get   ('/students',     authenticate, dataCtrl.listStudents);
router.post  ('/students',     authenticate, authorize('admin','examofficer'), dataCtrl.createStudent);
router.put   ('/students/:id', authenticate, authorize('admin','examofficer'), dataCtrl.updateStudent);
router.delete('/students/:id', authenticate, authorize('admin'),               dataCtrl.deleteStudent);
router.get   ('/students/:id/report', authenticate, dataCtrl.getStudentReport);

// ─── TEACHERS ─────────────────────────────────────────────────────────────────
router.get ('/teachers',                authenticate, dataCtrl.listTeachers);
router.post('/teachers/assign-classes', authenticate, authorize('admin'), dataCtrl.assignClasses);
router.post('/teachers/assign-subjects',authenticate, authorize('admin'), dataCtrl.assignSubjects);

// ─── RESULTS ─────────────────────────────────────────────────────────────────
router.get ('/results', authenticate, dataCtrl.getResults);
router.post('/results', authenticate, dataCtrl.saveResult);

// ─── SCHOOL CONFIG ────────────────────────────────────────────────────────────
router.get('/school/config', authenticate,                       dataCtrl.getSchoolConfig);
router.put('/school/config', authenticate, authorize('admin'),   dataCtrl.updateSchoolConfig);

// ─── EXPORTS ─────────────────────────────────────────────────────────────────
router.get('/export/exam/:uuid/docx',                   authenticate, exportCtrl.exportExamAsDocx);
router.get('/export/exam/:uuid/marking-scheme/docx',    authenticate, authorize('admin','headteacher','examofficer'), exportCtrl.exportMarkingSchemeAsDocx);
router.get('/export/results/:examinationId/xlsx',       authenticate, exportCtrl.exportResultsAsXlsx);
router.get('/export/question-bank/xlsx',                authenticate, exportCtrl.exportQuestionBankAsXlsx);

// ─── REFERENCE DATA ───────────────────────────────────────────────────────────
router.get('/classes', authenticate, async (req, res, next) => {
  try {
    const prisma = require('../utils/prisma');
    const classes = await prisma.class.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, data: classes });
  } catch (err) { next(err); }
});

router.get('/subjects', authenticate, async (req, res, next) => {
  try {
    const prisma = require('../utils/prisma');
    const subjects = await prisma.subject.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    res.json({ success: true, data: subjects });
  } catch (err) { next(err); }
});

module.exports = router;
