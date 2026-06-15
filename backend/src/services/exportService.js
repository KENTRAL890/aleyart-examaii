// exportService.js — PDF, DOCX, XLSX export for ALEYART EXAMAI PRO
// Backend export utilities using jsPDF, docx, and xlsx

const SCHOOL_HEADER = {
  name: 'ALEYART ACADEMY',
  motto: 'SEEKING WISDOM',
};

// ─── XLSX EXPORT (Results) ────────────────────────────────────────────────────
async function exportResultsXLSX(results, examination) {
  const XLSX = require('xlsx');

  const headerRows = [
    [`ALEYART ACADEMY — ${SCHOOL_HEADER.motto}`],
    [`Examination: ${examination.title}`],
    [`Class: ${examination.class?.name}  |  Subject: ${examination.subject?.name}  |  Total Marks: ${examination.totalMarks}`],
    [`Academic Year: ${examination.academicYear}  |  Term: ${examination.term}`],
    [],
    ['Position', 'Student ID', 'Full Name', 'Sec A', 'Sec B', 'Sec C', 'Total Score', 'Grade', 'Remarks'],
  ];

  const dataRows = results.map(r => [
    r.position || '',
    r.student?.studentId || '',
    r.student?.fullName || '',
    r.sectionAScore ?? '',
    r.sectionBScore ?? '',
    r.sectionCScore ?? '',
    r.totalScore ?? '',
    r.grade || '',
    r.remarks || '',
  ]);

  const summaryRows = [
    [],
    ['SUMMARY'],
    ['Total Students', results.length],
    ['Highest Score', Math.max(...results.map(r => r.totalScore || 0))],
    ['Lowest Score', Math.min(...results.map(r => r.totalScore || 0))],
    ['Class Average', (results.reduce((s, r) => s + (r.totalScore || 0), 0) / results.length).toFixed(1)],
    ['Passed (≥50%)', results.filter(r => (r.totalScore || 0) >= examination.totalMarks * 0.5).length],
  ];

  const allRows = [...headerRows, ...dataRows, ...summaryRows];
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Column widths
  ws['!cols'] = [{ wch: 8 }, { wch: 12 }, { wch: 28 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 8 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Results');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

// ─── DOCX EXPORT (Exam Paper) ─────────────────────────────────────────────────
async function exportExamDOCX(examination, sections, schoolConfig) {
  const {
    Document, Paragraph, TextRun, HeadingLevel, AlignmentType,
    Table, TableRow, TableCell, BorderStyle, WidthType, Packer
  } = require('docx');

  const school = {
    name: schoolConfig?.school_name || SCHOOL_HEADER.name,
    motto: schoolConfig?.school_motto || SCHOOL_HEADER.motto,
    address: schoolConfig?.school_address || '',
    phone: schoolConfig?.school_phone || '',
    email: schoolConfig?.school_email || '',
  };

  const children = [];

  // Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'REPUBLIC OF GHANA — GHANA EDUCATION SERVICE', size: 18, bold: false, color: '666666' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: school.name, size: 32, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Motto: "${school.motto}"`, size: 20, italics: true, color: '444444' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `${school.address}  |  Tel: ${school.phone}  |  ${school.email}`, size: 16, color: '666666' })],
    }),
    new Paragraph({ children: [new TextRun({ text: '', size: 4 })] }),
  );

  // Exam info table
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Class: ${examination.class?.name}`, bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Subject: ${examination.subject?.name}`, bold: true })] })] }),
        ]}),
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Examination: ${examination.examType}` })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Academic Year: ${examination.academicYear}` })] })] }),
        ]}),
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Term: ${examination.term}` })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Duration: ${examination.duration} minutes` })] })] }),
        ]}),
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Total Marks: ${examination.totalMarks}` })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Teacher: ${examination.teacherName || ''}` })] })] }),
        ]}),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),
  );

  // Candidate info
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Name: ____________________________________   ', bold: true }),
        new TextRun({ text: 'Index No.: __________________', bold: true }),
      ],
    }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),
    new Paragraph({
      children: [new TextRun({ text: 'Answer ALL questions in Section A. Answer Question 1 and any other required questions in Section B.', italics: true, size: 20 })],
    }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),
  );

  // Sections and Questions
  for (const section of sections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: `SECTION ${section.sectionLetter} — ${section.title?.toUpperCase() || ''} [${section.totalMarks} Marks]`, bold: true, underline: {} })],
      }),
    );

    for (const q of section.questions || []) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${q.sortOrder}. `, bold: true }),
            new TextRun({ text: q.questionText }),
            new TextRun({ text: `  [${q.marks} mark${q.marks !== 1 ? 's' : ''}]`, color: '666666' }),
          ],
          spacing: { before: 120, after: 80 },
        }),
      );

      // MCQ options
      if (q.options?.length) {
        for (const opt of q.options) {
          children.push(
            new Paragraph({
              indent: { left: 360 },
              children: [new TextRun({ text: `(${opt.optionKey})  ${opt.optionText}` })],
              spacing: { after: 40 },
            }),
          );
        }
      }

      // Sub-parts
      if (q.subParts?.length) {
        for (const sp of q.subParts) {
          children.push(
            new Paragraph({
              indent: { left: 360 },
              children: [
                new TextRun({ text: `(${sp.partLabel})  `, bold: true }),
                new TextRun({ text: sp.questionText }),
                new TextRun({ text: `  [${sp.marks} mark${sp.marks !== 1 ? 's' : ''}]`, color: '666666' }),
              ],
              spacing: { after: 60 },
            }),
          );
          // Answer lines
          for (let i = 0; i < 3; i++) {
            children.push(new Paragraph({
              children: [new TextRun({ text: '_______________________________________________________________________________' })],
              spacing: { after: 80 },
            }));
          }
        }
      }
    }
    children.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
  }

  // Footer
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `— End of Examination — ${school.name} · ${school.motto} —`, italics: true, color: '666666' })],
      spacing: { before: 400 },
    }),
  );

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
      },
      children,
    }],
  });

  return await Packer.toBuffer(doc);
}

// ─── MARKING SCHEME DOCX ──────────────────────────────────────────────────────
async function exportMarkingSchemeDOCX(examination, schemeItems, schoolConfig) {
  const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, ShadingType } = require('docx');

  const school = {
    name: schoolConfig?.school_name || SCHOOL_HEADER.name,
    motto: schoolConfig?.school_motto || SCHOOL_HEADER.motto,
  };

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: '065f46' },
      children: [new TextRun({ text: 'CONFIDENTIAL — FOR EXAMINERS ONLY', bold: true, color: 'FFFFFF', size: 20 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `${school.name} — MARKING SCHEME`, size: 28, bold: true })],
      spacing: { before: 200 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `${examination.subject?.name} · ${examination.class?.name} · ${examination.examType}`, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `${examination.academicYear} | ${examination.term} | Total: ${examination.totalMarks} marks`, size: 18, color: '444444' })],
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: '⚠ This marking scheme contains EXACT CORRECT ANSWERS for every question. Do not distribute to students.',
        bold: true, color: '991b1b', size: 18,
      })],
      spacing: { after: 200 },
    }),
  ];

  // Section A answers
  const secAItems = schemeItems.filter(i => i.sectionLetter === 'A');
  if (secAItems.length) {
    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'SECTION A — ANSWERS', bold: true, underline: {} })] }),
    );
    let answerLine = '';
    secAItems.forEach((item, idx) => {
      answerLine += `Q${item.questionNumber}: ${item.correctAnswer}    `;
      if ((idx + 1) % 5 === 0 || idx === secAItems.length - 1) {
        children.push(new Paragraph({ children: [new TextRun({ text: answerLine.trim(), font: 'Courier New' })] }));
        answerLine = '';
      }
    });
    children.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
  }

  // Section B+ detailed answers
  const secBItems = schemeItems.filter(i => i.sectionLetter !== 'A');
  if (secBItems.length) {
    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'SECTION B — DETAILED SOLUTIONS', bold: true, underline: {} })] }),
    );
    for (const item of secBItems) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Question ${item.questionNumber} [${item.marksAllocated} marks]: `, bold: true }),
            new TextRun({ text: item.questionText?.slice(0, 100) + (item.questionText?.length > 100 ? '…' : '') }),
          ],
          spacing: { before: 200, after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `✓ ANSWER: ${item.correctAnswer}`, bold: true, color: '065f46' })],
          spacing: { after: 60 },
        }),
      );
      if (item.fullSolution) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `WORKING:\n${item.fullSolution}`, font: 'Courier New', size: 18, color: '334155' })],
          spacing: { after: 60 },
        }));
      }
      if (item.marksBreakdown) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `Marks: ${item.marksBreakdown}`, italics: true, color: '666666', size: 18 })],
          spacing: { after: 120 },
        }));
      }
    }
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `— End of Marking Scheme — ${school.name} · ${school.motto} —`, italics: true, color: '666666' })],
      spacing: { before: 400 },
    }),
  );

  const doc = new Document({
    sections: [{ children }],
  });
  return await Packer.toBuffer(doc);
}

module.exports = { exportResultsXLSX, exportExamDOCX, exportMarkingSchemeDOCX };
