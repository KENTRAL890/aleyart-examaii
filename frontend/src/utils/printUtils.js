// src/utils/printUtils.js — Client-side PDF/print utilities for ALEYART EXAMAI PRO
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SCHOOL = {
  name: 'ALEYART ACADEMY',
  motto: 'SEEKING WISDOM',
};

function getSchoolInfo(config = {}) {
  return {
    name:    config.school_name    || SCHOOL.name,
    motto:   config.school_motto   || SCHOOL.motto,
    address: config.school_address || 'P.O. Box 123, Accra, Ghana',
    phone:   config.school_phone   || '+233 24 000 0000',
    email:   config.school_email   || 'info@aleyartacademy.edu.gh',
  };
}

// ─── PRINT — triggers browser print dialog ────────────────────────────────────
export function printElement(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const original = document.body.innerHTML;
  document.body.innerHTML = el.innerHTML;
  window.print();
  document.body.innerHTML = original;
  window.location.reload();
}

// ─── PDF — Examination Paper ──────────────────────────────────────────────────
export function generateExamPDF(examination, sections, schoolConfig = {}) {
  const school = getSchoolInfo(schoolConfig);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210; // A4 width mm
  const margin = 18;
  let y = margin;

  const LINE = (ypos, x1 = margin, x2 = W - margin, lw = 0.3) => {
    doc.setLineWidth(lw);
    doc.line(x1, ypos, x2, ypos);
  };

  // ── Header ──
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text('REPUBLIC OF GHANA · GHANA EDUCATION SERVICE', W / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(school.name, W / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(80);
  doc.text(`Motto: "${school.motto}"`, W / 2, y, { align: 'center' });
  y += 4;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${school.address}  |  Tel: ${school.phone}  |  ${school.email}`, W / 2, y, { align: 'center' });
  y += 3;

  LINE(y, margin, W - margin, 0.8);
  y += 5;

  // ── Exam info grid ──
  doc.setFontSize(10);
  doc.setTextColor(0);
  const col = (W - 2 * margin) / 2;
  const info = [
    [`Class: ${examination.class?.name}`,           `Subject: ${examination.subject?.name}`],
    [`Examination: ${examination.examType}`,         `Academic Year: ${examination.academicYear}`],
    [`Term: ${examination.term}`,                   `Duration: ${examination.duration} minutes`],
    [`Total Marks: ${examination.totalMarks}`,       `Teacher: ${examination.teacherName || ''}`],
    [`Date: ______________________`,                 ``],
  ];
  info.forEach(([left, right]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(left, margin, y);
    if (right) doc.text(right, margin + col, y);
    y += 5;
  });

  LINE(y);
  y += 4;

  // ── Candidate fields ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Name: ___________________________________________', margin, y);
  doc.text('Index No.: ______________', margin + 110, y);
  y += 6;
  LINE(y);
  y += 4;

  // ── Instructions ──
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text('Answer ALL questions in Section A. Answer Question 1 and any other required questions in Section B.', margin, y, { maxWidth: W - 2 * margin });
  y += 7;
  doc.setTextColor(0);

  // ── Sections ──
  for (const section of sections) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`SECTION ${section.sectionLetter} — ${(section.title || '').toUpperCase()} [${section.totalMarks} Marks]`, margin, y);
    y += 4;
    LINE(y);
    y += 5;

    for (const q of section.questions || []) {
      // Check for page overflow
      if (y > 265) { doc.addPage(); y = margin; }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const qHead = `${q.sortOrder}. `;
      doc.text(qHead, margin, y);

      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(q.questionText, W - 2 * margin - 8);
      doc.text(lines, margin + 6, y);
      y += lines.length * 5;

      // MCQ options in 2 columns
      if (q.options?.length) {
        const half = Math.ceil(q.options.length / 2);
        q.options.forEach((opt, i) => {
          const cx = i < half ? margin + 10 : margin + 10 + col;
          const cy = y + (i % half) * 5;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(`(${opt.optionKey})  ${opt.optionText}`, cx, cy, { maxWidth: col - 10 });
        });
        y += Math.ceil(q.options.length / 2) * 5 + 3;
      }

      // Sub-parts
      if (q.subParts?.length) {
        for (const sp of q.subParts) {
          if (y > 265) { doc.addPage(); y = margin; }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(`    (${sp.partLabel})`, margin + 4, y);
          doc.setFont('helvetica', 'normal');
          const spLines = doc.splitTextToSize(sp.questionText + `  [${sp.marks} marks]`, W - 2 * margin - 20);
          doc.text(spLines, margin + 14, y);
          y += spLines.length * 5;
          // Answer lines
          for (let l = 0; l < 3; l++) {
            LINE(y + l * 7 + 2, margin + 8, W - margin);
          }
          y += 25;
        }
      }
      y += 3;
    }
  }

  // ── Footer ──
  if (y > 260) { doc.addPage(); y = 260; }
  LINE(270);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120);
  doc.text('— End of Examination —', margin, 274);
  doc.text(`${school.name} · ${school.motto}`, W - margin, 274, { align: 'right' });

  // ── Page numbers ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(`Page ${p} of ${pageCount}`, W / 2, 288, { align: 'center' });
  }

  const filename = `${examination.title?.replace(/[^a-z0-9]/gi, '_') || 'Exam'}_Paper.pdf`;
  doc.save(filename);
}

// ─── PDF — Marking Scheme ─────────────────────────────────────────────────────
export function generateMarkingSchemePDF(examination, schemeItems, schoolConfig = {}) {
  const school = getSchoolInfo(schoolConfig);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 15;
  let y = margin;

  // CONFIDENTIAL banner
  doc.setFillColor(6, 95, 70);
  doc.rect(0, 0, W, 12, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CONFIDENTIAL — FOR EXAMINERS ONLY · DO NOT DISTRIBUTE TO STUDENTS', W / 2, 8, { align: 'center' });
  y = 18;

  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${school.name}`, W / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(13);
  doc.text('MARKING SCHEME', W / 2, y, { align: 'center' });
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`${examination.subject?.name} · ${examination.class?.name} · ${examination.examType}`, W / 2, y, { align: 'center' });
  y += 4;
  doc.text(`${examination.academicYear} | ${examination.term} | Total Marks: ${examination.totalMarks}`, W / 2, y, { align: 'center' });
  y += 6;
  doc.setLineWidth(0.8);
  doc.line(margin, y, W - margin, y);
  y += 5;

  // Section A table
  const secA = schemeItems.filter(i => i.sectionLetter === 'A');
  if (secA.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('SECTION A — MULTIPLE CHOICE ANSWERS', margin, y);
    y += 6;

    doc.autoTable({
      startY: y,
      head: [['Q.No.', 'Answer', 'Correct Option Text', 'Marks']],
      body: secA.map(item => [
        `Q${item.questionNumber}`,
        item.correctAnswer.split('.')[0],
        (item.correctAnswer.split('.')[1] || item.correctAnswer).trim().slice(0, 60),
        `${item.marksAllocated} mk`
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [6, 95, 70], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 18, fontStyle: 'bold' }, 3: { cellWidth: 18, halign: 'center' } },
      margin: { left: margin, right: margin },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Section B detailed solutions
  const secB = schemeItems.filter(i => i.sectionLetter !== 'A');
  if (secB.length) {
    if (y > 240) { doc.addPage(); y = margin; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('SECTION B — DETAILED SOLUTIONS', margin, y);
    y += 6;

    for (const item of secB) {
      if (y > 255) { doc.addPage(); y = margin; }

      // Question header
      doc.setFillColor(240, 253, 244);
      doc.rect(margin, y - 2, W - 2 * margin, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(6, 95, 70);
      doc.text(`Question ${item.questionNumber} [${item.marksAllocated} marks]`, margin + 2, y + 3);
      y += 9;

      // Question text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60);
      const qLines = doc.splitTextToSize(item.questionText?.slice(0, 200) || '', W - 2 * margin);
      doc.text(qLines, margin + 2, y);
      y += qLines.length * 4.5 + 2;

      // Correct answer
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(6, 95, 70);
      doc.text('✓ ANSWER:', margin + 2, y);
      doc.setFont('helvetica', 'normal');
      const ansLines = doc.splitTextToSize(item.correctAnswer || '', W - 2 * margin - 20);
      doc.text(ansLines, margin + 22, y);
      y += ansLines.length * 5 + 2;

      // Working
      if (item.fullSolution) {
        doc.setFont('courier', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(80);
        const wLines = doc.splitTextToSize(item.fullSolution.slice(0, 400), W - 2 * margin - 4);
        doc.text(wLines, margin + 4, y);
        y += wLines.length * 4.5 + 2;
      }

      // Marks breakdown
      if (item.marksBreakdown) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(100);
        doc.text(`Marks: ${item.marksBreakdown}`, margin + 4, y);
        y += 4;
      }
      y += 4;
    }
  }

  const filename = `${examination.title?.replace(/[^a-z0-9]/gi, '_') || 'Exam'}_MarkingScheme_CONFIDENTIAL.pdf`;
  doc.save(filename);
}

// ─── PDF — Results Report ─────────────────────────────────────────────────────
export function generateResultsPDF(examination, results, schoolConfig = {}) {
  const school = getSchoolInfo(schoolConfig);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297; const H = 210;
  const margin = 15;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(school.name, W / 2, 14, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`"${school.motto}"`, W / 2, 19, { align: 'center' });
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('EXAMINATION RESULTS SHEET', W / 2, 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${examination.subject?.name} · ${examination.class?.name} · ${examination.examType} · ${examination.academicYear} · ${examination.term}`, W / 2, 30, { align: 'center' });

  doc.line(margin, 33, W - margin, 33);

  const avg = (results.reduce((s, r) => s + (r.totalScore || 0), 0) / results.length).toFixed(1);
  doc.setFontSize(9);
  doc.text(`Total Students: ${results.length}  |  Class Average: ${avg}%  |  Total Marks: ${examination.totalMarks}`, margin, 38);

  doc.autoTable({
    startY: 42,
    head: [['Pos.', 'Student ID', 'Full Name', 'Sec A', 'Sec B', 'Sec C', 'Total', '%', 'Grade', 'Remarks']],
    body: [...results]
      .sort((a, b) => (a.position || 99) - (b.position || 99))
      .map(r => [
        r.position || '',
        r.student?.studentId || '',
        r.student?.fullName || '',
        r.sectionAScore ?? '',
        r.sectionBScore ?? '',
        r.sectionCScore ?? '',
        r.totalScore ?? '',
        `${r.totalScore ?? 0}%`,
        r.grade || '',
        r.remarks || '',
      ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 22, font: 'courier' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 14, halign: 'center' },
      8: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  });

  const footY = doc.lastAutoTable.finalY + 6;
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(`Generated by ALEYART EXAMAI PRO · ${new Date().toLocaleDateString('en-GH')}`, margin, footY);
  doc.text(`${school.name} · ${school.motto}`, W - margin, footY, { align: 'right' });

  const filename = `${examination.title?.replace(/[^a-z0-9]/gi, '_') || 'Results'}_Results.pdf`;
  doc.save(filename);
}

// ─── OMR SHEET PDF ────────────────────────────────────────────────────────────
export function generateOMRPDF(examination, numQuestions = 40, schoolConfig = {}) {
  const school = getSchoolInfo(schoolConfig);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 15;

  // Header
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, W, 14, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(school.name, W / 2, 6, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`"${school.motto}"`, W / 2, 11, { align: 'center' });

  let y = 20;
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('OPTICAL MARK RECOGNITION (OMR) ANSWER SHEET', W / 2, y, { align: 'center' });
  y += 6;

  // Candidate fields
  const fields = [
    ['Student Name:', '_______________________________', 'Admission No.:', '_______________'],
    ['Class:', examination.class?.name || '_________', 'Subject:', examination.subject?.name || '_________'],
    ['Index No.:', '_______________', 'Date:', '_______________'],
  ];

  doc.setFontSize(9);
  fields.forEach(([k1, v1, k2, v2]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(k1, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(v1, margin + 28, y);
    doc.setFont('helvetica', 'bold');
    doc.text(k2, margin + 100, y);
    doc.setFont('helvetica', 'normal');
    doc.text(v2, margin + 125, y);
    y += 6;
  });

  y += 2;
  doc.setFillColor(254, 243, 199);
  doc.rect(margin, y - 3, W - 2 * margin, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(92, 40, 14);
  doc.text('USE A DARK PENCIL ONLY. SHADE THE CIRCLE COMPLETELY. ERASE CLEANLY IF YOU CHANGE YOUR ANSWER.', W / 2, y + 2, { align: 'center' });
  y += 10;

  // Bubble grid — 2 columns, each column: Q.No + A B C D
  doc.setTextColor(0);
  const bubbleR = 3.5;
  const bubbleSpacing = 9;
  const colW = (W - 2 * margin) / 2;
  const questions = Math.min(numQuestions, 60);

  for (let q = 1; q <= questions; q++) {
    const colIdx = q <= Math.ceil(questions / 2) ? 0 : 1;
    const rowIdx = q <= Math.ceil(questions / 2) ? q - 1 : q - Math.ceil(questions / 2) - 1;
    const cx = margin + colIdx * colW;
    const cy = y + rowIdx * 9;

    // Check page overflow
    if (cy > 270) break;

    // Q number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${q}.`, cx, cy + 2, { align: 'right' });

    // Bubbles A B C D
    'ABCD'.split('').forEach((letter, li) => {
      const bx = cx + 4 + li * bubbleSpacing;
      doc.setLineWidth(0.4);
      doc.setDrawColor(50);
      doc.circle(bx, cy, bubbleR);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(letter, bx, cy + 2.5, { align: 'center' });
    });
  }

  y = y + Math.ceil(questions / 2) * 9 + 6;

  // Footer
  doc.setLineWidth(0.5);
  doc.line(margin, y, W - margin, y);
  y += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(`ALEYART ACADEMY — Seeking Wisdom · ExamAI Pro · ${examination.academicYear || ''}`, W / 2, y, { align: 'center' });

  doc.save(`${examination.class?.name || 'Class'}_${examination.subject?.name || 'Subject'}_OMR_Sheet.pdf`);
}
