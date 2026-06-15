// src/controllers/exportController.js
function getPrisma() { return require('../utils/prisma'); }

async function getSchoolConfig() {
  const prisma = getPrisma();
  const configs = await prisma.schoolConfig.findMany();
  return Object.fromEntries(configs.map(c => [c.key, c.value]));
}

async function exportExamAsDocx(req, res, next) {
  try {
    const prisma = getPrisma();
    const { exportExamDOCX } = require('../services/exportService');
    const exam = await prisma.examination.findUnique({
      where: { uuid: req.params.uuid },
      include: {
        class: true, subject: true,
        sections: { include: { questions: { include: { options: { orderBy: { sortOrder: 'asc' } }, subParts: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }
      }
    });
    if (!exam) return res.status(404).json({ success: false, message: 'Examination not found' });
    const schoolConfig = await getSchoolConfig();
    const buffer = await exportExamDOCX(exam, exam.sections, schoolConfig);
    const filename = `${(exam.title || 'Exam').replace(/[^a-z0-9]/gi,'_')}_ExamPaper.docx`;
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition',`attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) { next(err); }
}

async function exportMarkingSchemeAsDocx(req, res, next) {
  try {
    const prisma = getPrisma();
    const { exportMarkingSchemeDOCX } = require('../services/exportService');
    const exam = await prisma.examination.findUnique({
      where: { uuid: req.params.uuid },
      include: { class: true, subject: true, markingScheme: { include: { items: { orderBy: { sortOrder: 'asc' } } } } }
    });
    if (!exam?.markingScheme) return res.status(404).json({ success: false, message: 'Marking scheme not found' });
    const schoolConfig = await getSchoolConfig();
    const buffer = await exportMarkingSchemeDOCX(exam, exam.markingScheme.items, schoolConfig);
    const filename = `${(exam.title || 'Exam').replace(/[^a-z0-9]/gi,'_')}_MarkingScheme_CONFIDENTIAL.docx`;
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition',`attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) { next(err); }
}

async function exportResultsAsXlsx(req, res, next) {
  try {
    const prisma = getPrisma();
    const { exportResultsXLSX } = require('../services/exportService');
    const examId = parseInt(req.params.examinationId);
    const [results, exam] = await Promise.all([
      prisma.result.findMany({ where: { examinationId: examId }, include: { student: { include: { class: true } } }, orderBy: { position: 'asc' } }),
      prisma.examination.findUnique({ where: { id: examId }, include: { class: true, subject: true } })
    ]);
    if (!exam) return res.status(404).json({ success: false, message: 'Examination not found' });
    const buffer = await exportResultsXLSX(results, exam);
    const filename = `${(exam.title || 'Results').replace(/[^a-z0-9]/gi,'_')}_Results.xlsx`;
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition',`attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) { next(err); }
}

async function exportQuestionBankAsXlsx(req, res, next) {
  try {
    const XLSX = require('xlsx');
    const prisma = getPrisma();
    const { subjectId, cls } = req.query;
    const where = { isActive: true };
    if (subjectId) where.subjectId = parseInt(subjectId);
    if (cls) where.forClass = cls;
    const questions = await prisma.question.findMany({ where, include: { subject: true, createdBy: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' } });
    const rows = [
      ['ALEYART ACADEMY — QUESTION BANK','','','','','','SEEKING WISDOM'],
      ['Question ID','Subject','Class','Topic','Type','Difficulty','Question Text','Marks','Created By','Date'],
      ...questions.map(q => [q.questionId, q.subject?.name, q.forClass, q.topic, q.questionType, q.difficulty, q.questionText, q.marks, q.createdBy?.fullName, q.createdAt?.toISOString().slice(0,10)])
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{wch:16},{wch:20},{wch:10},{wch:20},{wch:18},{wch:10},{wch:60},{wch:8},{wch:20},{wch:12}];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Question Bank');
    const buffer = XLSX.write(wb, { type:'buffer', bookType:'xlsx' });
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition','attachment; filename="ALEYART_Question_Bank.xlsx"');
    res.send(buffer);
  } catch (err) { next(err); }
}

module.exports = { exportExamAsDocx, exportMarkingSchemeAsDocx, exportResultsAsXlsx, exportQuestionBankAsXlsx };
