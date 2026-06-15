// src/controllers/examinationController.js
const { generateExamination, generateMarkingScheme } = require('../services/aiService');
function getPrisma() { return require('../utils/prisma'); }

const EARLY_CHILDHOOD = ['Creche','Nursery 1','Nursery 2','KG1','KG2'];

// GET /api/examinations
async function listExaminations(req, res, next) {
  try {
    const prisma = getPrisma();
    const { status, classId, subjectId, examType, search, page = 1, limit = 20 } = req.query;
    const where = { isShared: true };
    if (status)    where.status    = status;
    if (classId)   where.classId   = parseInt(classId);
    if (subjectId) where.subjectId = parseInt(subjectId);
    if (examType)  where.examType  = examType;
    if (search)    where.title     = { contains: search };

    const [exams, total] = await Promise.all([
      prisma.examination.findMany({
        where,
        include: {
          class:      { select: { name: true } },
          subject:    { select: { name: true } },
          createdBy:  { select: { fullName: true, staffId: true } },
          modifiedBy: { select: { fullName: true } },
          _count:     { select: { sections: true, results: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.examination.count({ where })
    ]);

    res.json({ success: true, data: exams, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
}

// GET /api/examinations/:uuid
async function getExamination(req, res, next) {
  try {
    const prisma = getPrisma();
    const exam = await prisma.examination.findUnique({
      where: { uuid: req.params.uuid },
      include: {
        class:   true,
        subject: true,
        createdBy:  { select: { fullName: true, staffId: true, email: true } },
        modifiedBy: { select: { fullName: true } },
        sections: {
          include: { questions: { include: { options: true, subParts: true }, orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' }
        },
        markingScheme: { include: { items: { orderBy: { sortOrder: 'asc' } } } }
      }
    });
    if (!exam) return res.status(404).json({ success: false, message: 'Examination not found' });
    res.json({ success: true, data: exam });
  } catch (err) { next(err); }
}

// POST /api/examinations/generate
async function generateExam(req, res, next) {
  try {
    const prisma = getPrisma();
    const config = req.body;
    const { cls, subject: subjectName, classId, subjectId } = config;

    if (EARLY_CHILDHOOD.includes(cls)) {
      return res.status(400).json({
        success: false,
        message: `Formal examinations are not generated for ${cls}. Early Childhood uses observation-based assessment per GES policy.`
      });
    }

    const aiResult = await generateExamination({ ...config, teacherName: req.user.fullName });
    if (!aiResult.success)
      return res.status(500).json({ success: false, message: 'AI generation failed', error: aiResult.error });

    const examData = aiResult.data;

    const exam = await prisma.examination.create({
      data: {
        title:       examData.title || `${subjectName} - ${config.examType}`,
        academicYear: config.academicYear,
        term:         config.term?.replace(/\s+/g,'') || 'Term1',
        classId:      parseInt(classId),
        subjectId:    parseInt(subjectId),
        examType:     config.examType?.replace(/\s+/g,'') || 'ClassTest',
        duration:     parseInt(config.duration) || 60,
        totalMarks:   parseInt(config.totalMarks) || 100,
        difficulty:   config.difficulty || 'Mixed',
        topics:       config.topics,
        teacherName:  req.user.fullName,
        status:       'draft',
        isShared:     true,
        aiGenerated:  true,
        hasSectionA:  true,
        hasSectionB:  true,
        sectionAMarks: (examData.sectionA || []).length,
        sectionBMarks: parseInt(config.totalMarks) - (examData.sectionA || []).length,
        createdById:  req.user.id
      }
    });

    // Save Section A
    if (examData.sectionA?.length) {
      const secA = await prisma.examSection.create({
        data: { examinationId: exam.id, sectionLetter:'A', title:'Objective Questions', twoColumns:true, totalMarks: examData.sectionA.length, sortOrder: 1 }
      });
      for (const q of examData.sectionA) {
        const question = await prisma.question.create({
          data: {
            questionId:   `Q-${exam.id}-A-${q.num}`,
            subjectId:    parseInt(subjectId),
            sectionId:    secA.id,
            questionType: 'MultipleChoice',
            difficulty:   config.difficulty || 'Mixed',
            topic:        q.topic || config.topics?.split(',')[0]?.trim() || 'General',
            questionText: q.question,
            marks:        q.marks || 1,
            sortOrder:    q.num,
            academicYear: config.academicYear,
            term:         config.term?.replace(/\s+/g,'') || 'Term1',
            forClass:     cls,
            aiGenerated:  true,
            createdById:  req.user.id
          }
        });
        if (q.options) {
          for (const [key, text] of Object.entries(q.options)) {
            await prisma.questionOption.create({
              data: { questionId: question.id, optionKey: key, optionText: text, isCorrect: key === q.correct }
            });
          }
        }
      }
    }

    // Save Section B
    if (examData.sectionB?.length) {
      const secB = await prisma.examSection.create({
        data: { examinationId: exam.id, sectionLetter:'B', title:'Subjective Questions', twoColumns:false, totalMarks: parseInt(config.totalMarks) - (examData.sectionA?.length || 0), sortOrder: 2 }
      });
      for (const q of examData.sectionB) {
        const question = await prisma.question.create({
          data: {
            questionId:   `Q-${exam.id}-B-${q.num}`,
            subjectId:    parseInt(subjectId),
            sectionId:    secB.id,
            questionType: 'ShortAnswer',
            difficulty:   config.difficulty || 'Mixed',
            topic:        config.topics?.split(',')[0]?.trim() || 'General',
            questionText: q.question,
            marks:        q.totalMarks || q.marks || 10,
            sortOrder:    q.num,
            isCompulsory: q.isCompulsory || q.num === 1,
            academicYear: config.academicYear,
            term:         config.term?.replace(/\s+/g,'') || 'Term1',
            forClass:     cls,
            aiGenerated:  true,
            createdById:  req.user.id
          }
        });
        if (q.subParts?.length) {
          for (const sp of q.subParts) {
            await prisma.questionSubPart.create({
              data: { questionId: question.id, partLabel: sp.part, questionText: sp.question, marks: sp.marks, sortOrder: ['a','b','c','d'].indexOf(sp.part) }
            });
          }
        }
      }
    }

    // Auto marking scheme
    const schemeResult = await generateMarkingScheme(
      { subject: { name: subjectName }, class: { name: cls }, totalMarks: parseInt(config.totalMarks) },
      examData
    );
    let schemeGenerated = false;
    if (schemeResult.success) {
      const scheme = await prisma.markingScheme.create({
        data: { examinationId: exam.id, title: `Marking Scheme — ${examData.title}`, totalMarks: parseInt(config.totalMarks), isConfidential: true, aiGenerated: true }
      });
      for (const item of schemeResult.data.schemeItems || []) {
        await prisma.schemeItem.create({
          data: {
            schemeId:       scheme.id,
            questionNumber: item.questionNumber,
            questionText:   item.questionText,
            correctAnswer:  item.correctAnswer,
            fullSolution:   item.fullSolution,
            calculations:   item.calculations,
            marksAllocated: item.marksAllocated || 1,
            marksBreakdown: item.marksBreakdown,
            sectionLetter:  item.sectionLetter || 'A',
            sortOrder:      parseInt(item.questionNumber) || 0
          }
        });
      }
      schemeGenerated = true;
    }

    await prisma.auditLog.create({
      data: { userId: req.user.id, action: 'GENERATE_EXAM', resource: 'examinations', resourceId: String(exam.id) }
    });

    res.status(201).json({
      success: true,
      message: 'Examination generated successfully',
      data: { examId: exam.id, uuid: exam.uuid, title: exam.title, examData, schemeGenerated }
    });
  } catch (err) { next(err); }
}

// PUT /api/examinations/:uuid/approve
async function approveExamination(req, res, next) {
  try {
    const prisma = getPrisma();
    const exam = await prisma.examination.update({
      where: { uuid: req.params.uuid },
      data: { status: 'approved', modifiedById: req.user.id }
    });
    await prisma.auditLog.create({ data: { userId: req.user.id, action: 'APPROVE_EXAM', resource: 'examinations', resourceId: String(exam.id) } });
    res.json({ success: true, message: 'Examination approved', data: exam });
  } catch (err) { next(err); }
}

// PUT /api/examinations/:uuid
async function updateExamination(req, res, next) {
  try {
    const prisma = getPrisma();
    const exam = await prisma.examination.update({
      where: { uuid: req.params.uuid },
      data: { ...req.body, modifiedById: req.user.id }
    });
    res.json({ success: true, message: 'Examination updated', data: exam });
  } catch (err) { next(err); }
}

// DELETE /api/examinations/:uuid
async function deleteExamination(req, res, next) {
  try {
    const prisma = getPrisma();
    await prisma.examination.delete({ where: { uuid: req.params.uuid } });
    res.json({ success: true, message: 'Examination deleted' });
  } catch (err) { next(err); }
}

// POST /api/examinations/:uuid/duplicate
async function duplicateExamination(req, res, next) {
  try {
    const prisma = getPrisma();
    const original = await prisma.examination.findUnique({
      where: { uuid: req.params.uuid },
      include: { sections: { include: { questions: { include: { options: true, subParts: true } } } } }
    });
    if (!original) return res.status(404).json({ success: false, message: 'Examination not found' });

    const { id, uuid, createdAt, updatedAt, createdById, modifiedById, sections, ...rest } = original;
    const newExam = await prisma.examination.create({
      data: { ...rest, title: `Copy of ${original.title}`, status: 'draft', createdById: req.user.id, modifiedById: null }
    });

    for (const sec of sections) {
      const { id: sId, examinationId, questions, ...secRest } = sec;
      const newSec = await prisma.examSection.create({ data: { ...secRest, examinationId: newExam.id } });
      for (const q of questions) {
        const { id: qId, sectionId, options, subParts, createdById: cId, ...qRest } = q;
        const newQ = await prisma.question.create({
          data: { ...qRest, questionId: `${q.questionId}-COPY`, sectionId: newSec.id, createdById: req.user.id }
        });
        for (const opt of options) {
          const { id: oId, questionId, ...optRest } = opt;
          await prisma.questionOption.create({ data: { ...optRest, questionId: newQ.id } });
        }
        for (const sp of subParts) {
          const { id: spId, questionId, schemeItems, ...spRest } = sp;
          await prisma.questionSubPart.create({ data: { ...spRest, questionId: newQ.id } });
        }
      }
    }

    res.status(201).json({ success: true, message: 'Examination duplicated', data: { uuid: newExam.uuid } });
  } catch (err) { next(err); }
}

module.exports = { listExaminations, getExamination, generateExam, approveExamination, updateExamination, deleteExamination, duplicateExamination };
