// App.js — ALEYART EXAMAI PRO Main Application
// React 18 + React Router v6
import React, { useState, useEffect, useCallback } from 'react';

// ─── CURRICULUM CONSTANTS ────────────────────────────────────────────────────
const CLASSES = {
  'Early Childhood': ['Creche','Nursery 1','Nursery 2','KG1','KG2'],
  'Primary':         ['Basic 1','Basic 2','Basic 3','Basic 4','Basic 5','Basic 6'],
  'Junior High':     ['Basic 7','Basic 8','Basic 9'],
};
const SUBJECTS_PRIMARY = ['English Language','Mathematics','Science','Computing','Creative Arts','RME','History','French','GA/TWI'];
const SUBJECTS_JHS     = ['English Language','Mathematics','Science','Computing','Creative Arts and Design','RME','Social Studies','Career Technology','French','GA/TWI'];
const EXAM_TYPES = ['Weekly Test','Class Test','End of Month Test','Mid-Term Examination','End of Term Examination','Promotion Examination','Entrance Examination','BECE Mock Examination','Custom Examination'];
const DIFFICULTY = ['Easy','Medium','Hard','Mixed'];
const TERMS = ['Term 1','Term 2','Term 3'];
const EARLY_CHILDHOOD = ['Creche','Nursery 1','Nursery 2','KG1','KG2'];
const JHS = ['Basic 7','Basic 8','Basic 9'];
const ROLES = { admin:'Administrator', headteacher:'Headteacher', examofficer:'Examination Officer', teacher:'Teacher' };

const SPECIAL_RULES = {
  'Computing':               'Q1 in Section B must be a PRACTICAL computing task (compulsory).',
  'Science':                 'Q1 in Section B must be a PRACTICAL science experiment (compulsory).',
  'Career Technology':       'Q1 in Section B must be a PRACTICAL career technology task (compulsory).',
  'Creative Arts and Design':'Q1 in Section B must be a PRACTICAL creative arts task (compulsory).',
  'RME':                     'Q1 must be story/case-study/scenario-based (70% real-life). Paper must state: "Answer Question 1 and any other required questions."',
};

const GES_GRADES = [
  {grade:'A1',min:80,label:'Excellent'},  {grade:'B2',min:75,label:'Very Good'},
  {grade:'B3',min:70,label:'Good'},       {grade:'C4',min:65,label:'Credit'},
  {grade:'C5',min:60,label:'Credit'},     {grade:'C6',min:55,label:'Credit'},
  {grade:'D7',min:50,label:'Pass'},       {grade:'E8',min:45,label:'Pass'},
  {grade:'F9',min:0, label:'Fail'},
];

function getGrade(score) {
  return GES_GRADES.find(g => score >= g.min)?.grade || 'F9';
}
function getSubjects(cls) {
  return JHS.includes(cls) ? SUBJECTS_JHS : SUBJECTS_PRIMARY;
}

// ─── DEMO DATA ───────────────────────────────────────────────────────────────
const DEMO_USERS = {
  admin:       { id:1, fullName:'Dr. Kwame Asante',    staffId:'ADM001', role:'admin',       email:'admin@aleyart.edu.gh' },
  headteacher: { id:2, fullName:'Mrs. Abena Asante',   staffId:'HT001',  role:'headteacher', email:'head@aleyart.edu.gh' },
  examofficer: { id:5, fullName:'Mr. Kwame Adjei',     staffId:'EXO001', role:'examofficer', email:'k.adjei@aleyart.edu.gh' },
  teacher:     { id:3, fullName:'Mr. Kofi Boateng',    staffId:'TCH001', role:'teacher',     email:'k.boateng@aleyart.edu.gh' },
};

const DEMO_EXAMS = [
  { id:1,uuid:'ex-001',title:'Basic 9 Mathematics – BECE Mock',      class:{name:'Basic 9'},subject:{name:'Mathematics'},    examType:'BECE Mock',          academicYear:'2024/2025',term:'Term3',totalMarks:100,duration:90, status:'approved',createdBy:{fullName:'Mr. Kofi Boateng',staffId:'TCH001'},  createdAt:'2025-06-08',aiGenerated:true },
  { id:2,uuid:'ex-002',title:'Basic 7 English – End of Term',        class:{name:'Basic 7'},subject:{name:'English Language'},examType:'End of Term',         academicYear:'2024/2025',term:'Term3',totalMarks:100,duration:60, status:'pending', createdBy:{fullName:'Ms. Ama Owusu',staffId:'TCH002'},     createdAt:'2025-06-07',aiGenerated:true },
  { id:3,uuid:'ex-003',title:'Basic 6 Science – Mid-Term',           class:{name:'Basic 6'},subject:{name:'Science'},         examType:'Mid-Term',            academicYear:'2024/2025',term:'Term3',totalMarks:60, duration:45, status:'approved',createdBy:{fullName:'Mr. Kofi Boateng',staffId:'TCH001'},  createdAt:'2025-06-05',aiGenerated:true },
  { id:4,uuid:'ex-004',title:'Basic 8 Social Studies – Class Test',  class:{name:'Basic 8'},subject:{name:'Social Studies'},  examType:'Class Test',          academicYear:'2024/2025',term:'Term3',totalMarks:30, duration:30, status:'draft',   createdBy:{fullName:'Ms. Ama Owusu',staffId:'TCH002'},     createdAt:'2025-06-03',aiGenerated:false },
  { id:5,uuid:'ex-005',title:'Basic 5 Mathematics – Weekly Test',    class:{name:'Basic 5'},subject:{name:'Mathematics'},    examType:'Weekly Test',         academicYear:'2024/2025',term:'Term3',totalMarks:20, duration:20, status:'approved',createdBy:{fullName:'Mrs. Akua Frimpong',staffId:'TCH004'},createdAt:'2025-06-01',aiGenerated:true },
];

const DEMO_STUDENTS = [
  { id:1,admissionNumber:'2024/001',studentId:'STU2401',fullName:'Kwesi Asare',  gender:'Male',  dateOfBirth:'2012-03-15',class:{name:'Basic 7'},parentName:'Mr. Asare Senior',  parentPhone:'+233241234567' },
  { id:2,admissionNumber:'2024/002',studentId:'STU2402',fullName:'Akosua Danso', gender:'Female',dateOfBirth:'2012-07-22',class:{name:'Basic 7'},parentName:'Mrs. Danso',         parentPhone:'+233241234568' },
  { id:3,admissionNumber:'2024/003',studentId:'STU2403',fullName:'Yaw Frimpong', gender:'Male',  dateOfBirth:'2010-11-05',class:{name:'Basic 9'},parentName:'Mr. Frimpong',       parentPhone:'+233241234569' },
  { id:4,admissionNumber:'2024/004',studentId:'STU2404',fullName:'Efua Boateng', gender:'Female',dateOfBirth:'2010-01-18',class:{name:'Basic 9'},parentName:'Mrs. Boateng',       parentPhone:'+233241234570' },
  { id:5,admissionNumber:'2024/005',studentId:'STU2405',fullName:'Nana Adjei',   gender:'Male',  dateOfBirth:'2012-09-30',class:{name:'Basic 7'},parentName:'Mr. Adjei',          parentPhone:'+233241234571' },
  { id:6,admissionNumber:'2024/006',studentId:'STU2406',fullName:'Abena Mensah', gender:'Female',dateOfBirth:'2011-05-12',class:{name:'Basic 8'},parentName:'Mr. Mensah',         parentPhone:'+233241234572' },
];

const DEMO_TEACHERS = [
  { id:1,staffId:'TCH001',fullName:'Mr. Kofi Boateng',  email:'k.boateng@aleyart.edu.gh', phone:'+233241000001',role:'teacher',     position:'Mathematics & Science Teacher',  qualification:'B.Ed. Mathematics',           classes:['Basic 7','Basic 8','Basic 9'],subjects:['Mathematics','Science'] },
  { id:2,staffId:'TCH002',fullName:'Ms. Ama Owusu',     email:'a.owusu@aleyart.edu.gh',   phone:'+233241000002',role:'teacher',     position:'English & RME Teacher',          qualification:'B.Ed. English',               classes:['Basic 6','Basic 7','Basic 8','Basic 9'],subjects:['English Language','RME'] },
  { id:3,staffId:'TCH003',fullName:'Mr. Yaw Asante',    email:'y.asante@aleyart.edu.gh',  phone:'+233241000003',role:'teacher',     position:'Computing Teacher',              qualification:'BSc. Computer Science',       classes:['Basic 5','Basic 6','Basic 7','Basic 8','Basic 9'],subjects:['Computing','Creative Arts and Design'] },
  { id:4,staffId:'TCH004',fullName:'Mrs. Akua Frimpong',email:'a.frimpong@aleyart.edu.gh',phone:'+233241000004',role:'teacher',     position:'Primary Class Teacher',          qualification:'B.Ed. Primary Education',     classes:['Basic 1','Basic 2','Basic 3'],subjects:['English Language','Mathematics','Science'] },
  { id:5,staffId:'EXO001',fullName:'Mr. Kwame Adjei',   email:'k.adjei@aleyart.edu.gh',   phone:'+233241000005',role:'examofficer',position:'Examination Officer',             qualification:'M.Ed. Curriculum & Evaluation',classes:[],subjects:[] },
  { id:6,staffId:'HT001', fullName:'Mrs. Abena Asante', email:'head@aleyart.edu.gh',       phone:'+233241000006',role:'headteacher',position:'Headteacher',                    qualification:'M.Ed. Educational Administration',classes:[],subjects:[] },
];

const DEMO_RESULTS = [
  { id:1,student:{fullName:'Kwesi Asare', studentId:'STU2401'},sectionAScore:32,sectionBScore:46,totalScore:78,grade:'B2',position:3,remarks:'Good performance' },
  { id:2,student:{fullName:'Akosua Danso',studentId:'STU2402'},sectionAScore:38,sectionBScore:54,totalScore:92,grade:'A1',position:1,remarks:'Excellent' },
  { id:3,student:{fullName:'Nana Adjei',  studentId:'STU2405'},sectionAScore:35,sectionBScore:50,totalScore:85,grade:'A1',position:2,remarks:'Very good' },
  { id:4,student:{fullName:'Abena Mensah',studentId:'STU2406'},sectionAScore:28,sectionBScore:42,totalScore:70,grade:'B3',position:4,remarks:'Good' },
  { id:5,student:{fullName:'Yaw Frimpong',studentId:'STU2403'},sectionAScore:22,sectionBScore:33,totalScore:55,grade:'C6',position:5,remarks:'Needs improvement' },
];

const DEMO_QUESTIONS = [
  { id:1,questionId:'Q-MATH-001',subject:{name:'Mathematics'},    forClass:'Basic 7',topic:'Algebra',       questionType:'MultipleChoice',difficulty:'Medium',questionText:'If 3x + 7 = 22, what is the value of x?',                                                                                                                                marks:1, createdBy:{fullName:'Mr. K. Boateng'},createdAt:'2025-06-08' },
  { id:2,questionId:'Q-ENG-001', subject:{name:'English Language'},forClass:'Basic 9',topic:'Comprehension', questionType:'Essay',         difficulty:'Hard',  questionText:'Read the passage carefully and answer questions on theme, character, and setting.',                                                                                             marks:15,createdBy:{fullName:'Ms. A. Owusu'},   createdAt:'2025-06-07' },
  { id:3,questionId:'Q-SCI-001', subject:{name:'Science'},         forClass:'Basic 8',topic:'Biology',       questionType:'Practical',     difficulty:'Medium',questionText:'PRACTICAL (Compulsory): Set up an experiment to test for starch in food samples. Describe the procedure, expected results, and draw a labelled diagram.',                  marks:20,createdBy:{fullName:'Mr. K. Boateng'},createdAt:'2025-06-06' },
  { id:4,questionId:'Q-MATH-002',subject:{name:'Mathematics'},    forClass:'Basic 6',topic:'Geometry',       questionType:'ShortAnswer',   difficulty:'Easy',  questionText:'Calculate the area of a rectangle with length 12 cm and width 8 cm. Show all working.',                                                                                    marks:5, createdBy:{fullName:'Mrs. A. Frimpong'},createdAt:'2025-06-05' },
  { id:5,questionId:'Q-RME-001', subject:{name:'RME'},             forClass:'Basic 9',topic:'Moral Values',  questionType:'CaseStudy',     difficulty:'Medium',questionText:'Adwoa discovers her best friend Kofi is copying answers during exams. As a good friend who values honesty, what advice would you give? Use religious and moral principles.',marks:15,createdBy:{fullName:'Ms. A. Owusu'},   createdAt:'2025-06-04' },
  { id:6,questionId:'Q-COMP-001',subject:{name:'Computing'},       forClass:'Basic 7',topic:'Microsoft Word', questionType:'Practical',     difficulty:'Easy',  questionText:'PRACTICAL (Compulsory): Open Microsoft Word and type a one-page formal letter to your headteacher requesting permission to form a Computer Club. Format correctly.',   marks:20,createdBy:{fullName:'Mr. Y. Asante'},  createdAt:'2025-06-03' },
];

// ─── AI GENERATION ───────────────────────────────────────────────────────────
async function callClaudeAI(config) {
  const specialRule = SPECIAL_RULES[config.subject] || '';
  const isJHS = JHS.includes(config.cls);
  const engJHS = config.subject === 'English Language' && isJHS;

  // Calculate marks per question for Section B
  const secBTotalMarks = parseInt(config.totalMarks) - (parseInt(config.numMCQ) * parseInt(config.marksPerMCQ || 1));
  const marksPerSubQ = Math.floor(secBTotalMarks / parseInt(config.numSubjective));

  const prompt = `You are a professional Ghanaian examination setter for ALEYART ACADEMY strictly following NaCCA Standards-Based Curriculum (GES/SBC/CCP).

CRITICAL RULES — YOU MUST FOLLOW ALL OF THESE:
1. NEVER write "model answer", "suggested answer", "reference answer", "sample answer", "possible answer", "accept any reasonable answer" or similar phrases ANYWHERE.
2. EVERY question in BOTH Section A and Section B MUST have the EXACT correct answer that a student is expected to write.
3. For Mathematics and Science: show EVERY step of working. Write the actual numbers, actual calculations, actual final answer.
4. For English: write the exact grammatical rule, exact definition, exact words expected.
5. For multiple choice: state which option (A/B/C/D) is correct AND write out the full correct option text.
6. Sub-parts must each have their own complete exact answer.
7. Return ONLY valid JSON — no markdown, no backticks, no explanation outside the JSON.

EXAMINATION PARAMETERS:
Class: ${config.cls}
Subject: ${config.subject}
Examination Type: ${config.examType}
Term: ${config.term} | Academic Year: ${config.year}
Topics: ${config.topics}
Difficulty: ${config.difficulty}
Duration: ${config.duration} minutes
Total Marks: ${config.totalMarks}

SECTION A: Generate exactly ${config.numMCQ} Multiple Choice Questions
- Each question worth ${config.marksPerMCQ || 1} mark
- 4 options each (A, B, C, D)
- State the EXACT correct option letter AND full text of that option

SECTION B: Generate exactly ${config.numSubjective} Subjective Questions  
- Each question worth approximately ${marksPerSubQ} marks
- Each question must have sub-parts (a), (b), (c) with individual marks
- Marks per sub-part must add up to the question total
- EXACT correct answer required for EVERY sub-part — not hints, not guidelines

${specialRule ? `SPECIAL CURRICULUM RULE FOR ${config.subject.toUpperCase()}: ${specialRule}` : ''}
${engJHS ? `ENGLISH LANGUAGE JHS STRUCTURE:
- Section A (40 marks): Grammar and Objective questions
- Section B: Comprehension passage from "The Beacon of Light" with questions
- Include: Summary, Composition, Literature questions
- Total must equal ${config.totalMarks} marks` : ''}

Return this EXACT JSON structure:
{
  "title": "ALEYART ACADEMY — ${config.subject} ${config.examType} — ${config.cls} — ${config.term} ${config.year}",
  "sectionA": [
    {
      "num": 1,
      "question": "full question text here",
      "options": {"A": "option A text", "B": "option B text", "C": "option C text", "D": "option D text"},
      "correct": "B",
      "correctText": "exact full text of the correct option B",
      "marks": ${config.marksPerMCQ || 1},
      "topic": "topic name"
    }
  ],
  "sectionB": [
    {
      "num": 1,
      "isCompulsory": true,
      "question": "full main question text",
      "totalMarks": ${marksPerSubQ},
      "subParts": [
        {
          "part": "a",
          "question": "sub-question text",
          "marks": 5,
          "correctAnswer": "THE EXACT COMPLETE ANSWER — write it as if you are the student writing the perfect answer. No hints. No guidelines. The actual answer.",
          "fullWorking": "For calculations: Step 1: [exact step]\\nStep 2: [exact step]\\nStep 3: [exact step]\\nFinal Answer: [exact result with units]"
        }
      ]
    }
  ]
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.map(b => b.text || '').join('') || '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --pri:#1e40af;--pri-l:#eff6ff;--pri-d:#1e3a8a;--pri-m:#3b82f6;
  --acc:#7c3aed;--acc-l:#f5f3ff;
  --gold:#b45309;--gold-l:#fffbeb;
  --suc:#065f46;--suc-l:#ecfdf5;--suc-m:#059669;
  --dan:#991b1b;--dan-l:#fef2f2;
  --warn:#92400e;--warn-l:#fffbeb;
  --ink:#0f172a;--muted:#64748b;--soft:#94a3b8;
  --bg:#f8fafc;--card:#fff;
  --border:#e2e8f0;--border-s:#cbd5e1;
  --sb:240px;--tb:60px;
  --r:10px;--r-sm:6px;--r-lg:14px;
  --sh:0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04);
  --sh-md:0 4px 16px rgba(0,0,0,.10);
  --sh-lg:0 10px 40px rgba(0,0,0,.15);
}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--ink);font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased}
/* Layout */
.app{display:flex;min-height:100vh}
.sidebar{width:var(--sb);background:#0f172a;color:#e2e8f0;display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:100;overflow-y:auto}
.main{margin-left:var(--sb);flex:1;display:flex;flex-direction:column;min-height:100vh}
.topbar{height:var(--tb);background:var(--card);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:50;box-shadow:var(--sh)}
.content{padding:24px;flex:1}
/* Sidebar */
.sb-logo{padding:18px 16px 14px;border-bottom:1px solid rgba(255,255,255,.07)}
.sb-logo-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.sb-crest{width:34px;height:34px;background:linear-gradient(135deg,#3b82f6,#7c3aed);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.sb-logo h2{font-family:'Playfair Display',serif;font-size:13px;color:#f8fafc;line-height:1.3}
.sb-logo p{font-size:9.5px;color:#64748b;letter-spacing:.08em;text-transform:uppercase}
.sb-badge{display:inline-flex;align-items:center;gap:5px;font-size:10px;background:rgba(124,58,237,.2);color:#c4b5fd;border-radius:5px;padding:3px 8px;margin-top:4px}
.nav-grp{padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.nav-lbl{font-size:9.5px;color:#475569;text-transform:uppercase;letter-spacing:.09em;padding:7px 16px 3px;font-weight:600}
.nav-item{display:flex;align-items:center;gap:9px;padding:7px 16px;font-size:13px;color:#94a3b8;cursor:pointer;transition:.15s;user-select:none;border-left:2px solid transparent}
.nav-item:hover{background:rgba(255,255,255,.04);color:#cbd5e1}
.nav-item.active{background:rgba(59,130,246,.12);color:#93c5fd;border-left-color:#3b82f6}
.nav-item .ni{font-size:14px;width:18px;text-align:center;flex-shrink:0}
.sb-user{margin-top:auto;padding:12px 16px;border-top:1px solid rgba(255,255,255,.07)}
.sb-user-name{font-size:12px;font-weight:500;color:#e2e8f0;margin-bottom:1px}
.sb-user-role{font-size:10px;color:#64748b}
.sb-user-id{font-size:10px;color:#475569;font-family:'JetBrains Mono',monospace}
/* Cards */
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px;box-shadow:var(--sh)}
.card-title{font-size:14px;font-weight:600;margin-bottom:14px;color:var(--ink)}
/* Stats */
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px}
.stat{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:16px;box-shadow:var(--sh);position:relative;overflow:hidden}
.stat::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:var(--r) var(--r) 0 0}
.stat.blue::before{background:var(--pri-m)} .stat.purple::before{background:var(--acc)} .stat.green::before{background:var(--suc-m)}
.stat.amber::before{background:#f59e0b} .stat.red::before{background:#ef4444} .stat.slate::before{background:#64748b}
.stat-icon{font-size:24px;margin-bottom:10px}
.stat-num{font-size:28px;font-weight:700;line-height:1;margin-bottom:4px}
.stat-label{font-size:12px;color:var(--muted)}
.stat.blue .stat-num{color:var(--pri)} .stat.purple .stat-num{color:var(--acc)} .stat.green .stat-num{color:var(--suc)}
.stat.amber .stat-num{color:var(--gold)} .stat.red .stat-num{color:var(--dan)} .stat.slate .stat-num{color:#475569}
/* Buttons */
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:var(--r-sm);font-size:13px;font-weight:500;cursor:pointer;border:1px solid transparent;transition:.15s;white-space:nowrap;user-select:none;font-family:inherit}
.btn:disabled{opacity:.5;cursor:not-allowed}
.btn-primary{background:var(--pri);color:#fff} .btn-primary:hover:not(:disabled){background:var(--pri-d)}
.btn-outline{background:transparent;color:var(--ink);border-color:var(--border-s)} .btn-outline:hover:not(:disabled){background:var(--bg)}
.btn-ghost{background:transparent;color:var(--muted);border:none;padding:5px 8px} .btn-ghost:hover:not(:disabled){background:var(--bg);color:var(--ink)}
.btn-success{background:var(--suc);color:#fff} .btn-success:hover:not(:disabled){background:#047857}
.btn-danger{background:var(--dan);color:#fff}
.btn-gold{background:var(--gold);color:#fff} .btn-gold:hover:not(:disabled){background:#92400e}
.btn-purple{background:var(--acc);color:#fff} .btn-purple:hover:not(:disabled){background:#6d28d9}
.btn-sm{padding:4px 10px;font-size:12px} .btn-lg{padding:10px 22px;font-size:14px}
.btn-group{display:flex;gap:6px;flex-wrap:wrap}
/* Forms */
.form-group{margin-bottom:14px}
.form-label{display:block;font-size:11px;font-weight:600;color:var(--muted);margin-bottom:5px;text-transform:uppercase;letter-spacing:.05em}
.form-ctrl{width:100%;padding:8px 12px;border:1px solid var(--border-s);border-radius:var(--r-sm);font-size:13px;font-family:'Inter',sans-serif;background:var(--card);color:var(--ink);transition:.15s}
.form-ctrl:focus{outline:none;border-color:var(--pri);box-shadow:0 0 0 3px rgba(30,64,175,.08)}
.form-ctrl::placeholder{color:var(--soft)}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.form-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
/* Tables */
.table-wrap{overflow-x:auto;border-radius:var(--r);border:1px solid var(--border)}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:var(--bg);color:var(--muted);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;padding:10px 14px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap}
td{padding:10px 14px;border-bottom:1px solid var(--border);vertical-align:middle}
tr:last-child td{border-bottom:none}
tbody tr:hover td{background:#fafbfc}
/* Badges */
.badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500;white-space:nowrap}
.badge-blue{background:#dbeafe;color:#1e40af} .badge-green{background:#d1fae5;color:#065f46} .badge-purple{background:#ede9fe;color:#5b21b6}
.badge-amber{background:#fef3c7;color:#92400e} .badge-red{background:#fee2e2;color:#991b1b} .badge-gray{background:#f1f5f9;color:#475569}
.badge-teal{background:#ccfbf1;color:#0f766e} .badge-pink{background:#fce7f3;color:#9d174d}
/* Tabs */
.tabs{display:flex;border-bottom:2px solid var(--border);margin-bottom:20px;overflow-x:auto}
.tab{padding:9px 18px;font-size:13px;font-weight:500;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:.15s;white-space:nowrap}
.tab.active{color:var(--pri);border-bottom-color:var(--pri)} .tab:hover:not(.active){color:var(--ink)}
/* Alerts */
.alert{border-radius:var(--r-sm);padding:10px 14px;font-size:13px;display:flex;align-items:flex-start;gap:8px;margin-bottom:14px}
.alert-info{background:#eff6ff;border:1px solid #bfdbfe;color:var(--pri)}
.alert-warn{background:var(--warn-l);border:1px solid #fcd34d;color:var(--warn)}
.alert-success{background:var(--suc-l);border:1px solid #6ee7b7;color:var(--suc)}
.alert-danger{background:var(--dan-l);border:1px solid #fca5a5;color:var(--dan)}
/* Spinner */
.spinner{width:18px;height:18px;border:2px solid rgba(0,0,0,.1);border-top-color:currentColor;border-radius:50%;animation:spin .65s linear infinite;flex-shrink:0}
@keyframes spin{to{transform:rotate(360deg)}}
.gen-bar{display:flex;align-items:center;gap:12px;background:white;border:1px solid #c7d2fe;border-radius:var(--r-sm);padding:14px 16px;color:var(--pri);font-size:13px}
/* Steps */
.steps{display:flex;align-items:center;margin-bottom:24px;gap:0}
.step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0}
.step-dot.done{background:var(--suc);color:#fff} .step-dot.active{background:var(--pri);color:#fff;box-shadow:0 0 0 3px rgba(30,64,175,.2)} .step-dot.todo{background:var(--bg);color:var(--muted);border:2px solid var(--border-s)}
.step-lbl{font-size:11px;color:var(--muted);margin-left:8px;white-space:nowrap} .step-lbl.active{color:var(--pri);font-weight:600}
.step-line{flex:1;height:2px;background:var(--border);margin:0 8px} .step-line.done{background:var(--suc)}
/* AI panel */
.ai-panel{background:linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%);border:1px solid #c7d2fe;border-radius:var(--r);padding:18px 20px;margin-bottom:20px}
/* Exam paper */
.ep{background:#fff;border:1px solid #d1d5db;border-radius:6px;padding:36px 40px;max-width:800px;margin:0 auto;font-family:'Times New Roman',serif;line-height:1.75;font-size:13px}
.ep-head{text-align:center;border-bottom:2.5px double #000;padding-bottom:14px;margin-bottom:18px}
.ep-school{font-size:20px;font-weight:bold;letter-spacing:.05em} .ep-motto{font-size:12px;font-style:italic;color:#555;margin-top:2px} .ep-contact{font-size:11px;color:#666;margin-top:4px}
.ep-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;font-size:12.5px;margin-bottom:14px}
.ep-cand{border:1px solid #000;padding:8px 12px;font-size:12.5px;margin-bottom:12px;display:flex;gap:24px}
.ep-inst{font-style:italic;font-size:11.5px;margin-bottom:14px;color:#333}
.ep-sec{font-weight:bold;font-size:14px;text-decoration:underline;text-transform:uppercase;margin:20px 0 10px}
.ep-cols{display:grid;grid-template-columns:1fr 1fr;gap:0}
.ep-col-r{border-left:1px solid #000;padding-left:16px}
.ep-q{margin-bottom:12px}
.ep-opts{margin-top:4px;padding-left:18px;display:grid;grid-template-columns:1fr 1fr;gap:0} .ep-opt{font-size:12px}
.ep-line{border-bottom:1px solid #bbb;margin-bottom:10px;min-height:20px}
.ep-sub{margin:6px 0 6px 16px}
.ep-foot{margin-top:24px;border-top:1px solid #000;padding-top:8px;font-size:11px;display:flex;justify-content:space-between;font-style:italic;color:#555}
/* Marking scheme */
.ms-head{background:linear-gradient(135deg,#065f46,#047857);color:#fff;border-radius:var(--r);padding:18px 22px;margin-bottom:16px}
.ms-a-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px;margin-bottom:16px}
.ms-a-item{background:var(--suc-l);border:1px solid #6ee7b7;border-radius:6px;padding:5px 10px;display:flex;gap:8px;align-items:center;font-size:12px}
.ms-b-item{background:var(--suc-l);border:1px solid #6ee7b7;border-radius:var(--r);padding:14px 16px;margin-bottom:10px}
.ms-b-sub{padding-left:12px;border-left:3px solid #6ee7b7;margin-bottom:8px}
.ms-marks{display:inline-flex;align-items:center;background:var(--suc);color:#fff;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;margin-top:6px}
/* OMR */
.omr{background:#fff;border:2px solid #374151;border-radius:6px;padding:24px;max-width:600px;font-family:Arial,sans-serif}
.omr-school{text-align:center;font-weight:bold;font-size:16px;border:2px solid #000;padding:10px;margin-bottom:14px}
.omr-fields{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px}
.omr-field{border:1px solid #666;padding:5px 8px;font-size:11px}
.omr-qs{display:grid;grid-template-columns:repeat(2,1fr);gap:4px 24px}
.omr-qrow{display:flex;align-items:center;gap:6px}
.omr-qn{font-size:10px;font-weight:700;min-width:20px;text-align:right}
.omr-bub{width:20px;height:20px;border:1.5px solid #374151;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;cursor:pointer;transition:.1s;user-select:none}
.omr-bub.filled{background:#111;color:#fff}
/* Answer booklet */
.booklet{background:#fff;border:2px solid #000;max-width:600px;font-family:Arial,sans-serif}
.booklet-cover{padding:20px;border-bottom:3px double #000}
.booklet-school{font-weight:bold;font-size:18px;text-align:center} .booklet-motto{font-style:italic;font-size:12px;text-align:center;margin-bottom:10px}
.booklet-fields{display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px}
.booklet-field{border:1px solid #000;padding:5px 8px}
.booklet-pages{padding:16px}
.booklet-line{border-bottom:1px solid #c0c0c0;min-height:22px;margin-bottom:2px}
/* Modal */
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px)}
.modal{background:var(--card);border-radius:var(--r-lg);max-width:580px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:var(--sh-lg)}
.modal-head{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.modal-title{font-size:15px;font-weight:600} .modal-body{padding:20px} .modal-foot{padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px}
/* Login */
.login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#312e81 100%);padding:20px}
.login-card{background:#fff;border-radius:16px;padding:36px;width:400px;max-width:100%;box-shadow:0 25px 60px rgba(0,0,0,.4)}
.login-crest{width:60px;height:60px;background:linear-gradient(135deg,var(--pri),var(--acc));border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 12px}
.login-school{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;text-align:center;color:var(--ink)}
.login-motto{font-size:11px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;text-align:center;margin-top:2px;margin-bottom:20px}
.login-role-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px}
.login-role-btn{padding:10px;border:2px solid var(--border);border-radius:var(--r-sm);cursor:pointer;text-align:center;transition:.15s;background:#fff}
.login-role-btn:hover{border-color:var(--pri-m);background:var(--pri-l)} .login-role-btn.sel{border-color:var(--pri);background:var(--pri-l)}
.role-icon{font-size:20px;margin-bottom:4px} .role-label{font-size:11px;font-weight:600;color:var(--ink)}
/* Dashboard */
.db-banner{background:linear-gradient(135deg,#1e3a8a 0%,#1e40af 60%,#3730a3 100%);border-radius:var(--r-lg);padding:22px 26px;margin-bottom:20px;color:#fff;display:flex;justify-content:space-between;align-items:flex-start}
/* Q boxes */
.q-box{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;margin-bottom:10px;transition:.15s}
.q-box:hover{border-color:var(--border-s);box-shadow:var(--sh)} .q-box.compulsory{border-left:3px solid var(--dan)}
/* Toast */
.toast{position:fixed;bottom:20px;right:20px;background:#1e293b;color:#fff;border-radius:var(--r-sm);padding:10px 16px;font-size:13px;z-index:999;display:flex;align-items:center;gap:8px;box-shadow:var(--sh-md);animation:slideUp .3s ease}
.toast.success{background:var(--suc)} .toast.error{background:var(--dan)}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
/* Page */
.page-hd{margin-bottom:20px}
.page-title{font-size:20px;font-weight:700;color:var(--ink)}
.page-sub{font-size:13px;color:var(--muted);margin-top:3px}
.sec-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.text-muted{color:var(--muted)} .text-sm{font-size:12px} .mono{font-family:'JetBrains Mono',monospace;font-size:12px}
@media print{.sidebar,.topbar,.no-print,.btn{display:none!important}.main{margin-left:0!important}.content{padding:0!important}}
@media(max-width:900px){.sidebar{transform:translateX(-100%)}.main{margin-left:0}.form-row,.form-row-3{grid-template-columns:1fr}.ep-cols{grid-template-columns:1fr}.ep-col-r{border-left:none;padding-left:0;border-top:1px solid #000;padding-top:12px;margin-top:12px}}
`;

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV = [
  { group:'Main',         items:[{ id:'dashboard',  icon:'🏠', label:'Dashboard' }] },
  { group:'Examinations', items:[
    { id:'generate',   icon:'✨', label:'Generate Exam (AI)' },
    { id:'repository', icon:'📂', label:'Examination Repository' },
    { id:'markscheme', icon:'✅', label:'Marking Schemes' },
    { id:'omr',        icon:'🔵', label:'OMR Sheets' },
    { id:'booklet',    icon:'📓', label:'Answer Booklets' },
  ]},
  { group:'Question Bank',items:[{ id:'questions',  icon:'🗂️', label:'Question Bank' }] },
  { group:'Management',   items:[
    { id:'students',   icon:'👥', label:'Students' },
    { id:'teachers',   icon:'👨‍🏫', label:'Teachers' },
    { id:'results',    icon:'📊', label:'Results & Reports' },
  ]},
  { group:'System',       items:[{ id:'settings',   icon:'⚙️', label:'School Settings' }] },
];

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return <div className={`toast ${type}`}>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} {msg}</div>;
}

function Sidebar({ user, page, setPage, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-row">
          <div className="sb-crest">🏫</div>
          <div><h2>ALEYART ACADEMY</h2><p>Seeking Wisdom</p></div>
        </div>
        <div className="sb-badge">🤖 ExamAI Pro v2.0</div>
      </div>
      {NAV.map(g => (
        <div key={g.group} className="nav-grp">
          <div className="nav-lbl">{g.group}</div>
          {g.items.map(item => (
            <div key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
              <span className="ni">{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </div>
      ))}
      <div className="sb-user">
        <div className="sb-user-name">{user.fullName}</div>
        <div className="sb-user-role">{ROLES[user.role]}</div>
        <div className="sb-user-id mono">{user.staffId}</div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop:8, width:'100%', justifyContent:'center', color:'#64748b' }} onClick={onLogout}>🚪 Sign Out</button>
      </div>
    </aside>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [role, setRole] = useState('teacher');
  const [loading, setLoading] = useState(false);
  const doLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    onLogin({ ...DEMO_USERS[role], role });
  };
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-crest">🏫</div>
        <div className="login-school">ALEYART ACADEMY</div>
        <div className="login-motto">Seeking Wisdom</div>
        <p style={{ textAlign:'center', fontSize:12, color:'#64748b', marginBottom:18 }}>ExamAI Pro v2.0 · GES · NaCCA · SBC · CCP Compliant</p>
        <div style={{ marginBottom:14 }}>
          <div className="form-label" style={{ marginBottom:8 }}>Select Your Role</div>
          <div className="login-role-grid">
            {[['admin','👑','Administrator'],['headteacher','📋','Headteacher'],['examofficer','📝','Exam Officer'],['teacher','👨‍🏫','Teacher']].map(([r, icon, label]) => (
              <div key={r} className={`login-role-btn ${role === r ? 'sel' : ''}`} onClick={() => setRole(r)}>
                <div className="role-icon">{icon}</div>
                <div className="role-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="form-group"><label className="form-label">Email</label><input className="form-ctrl" value={DEMO_USERS[role]?.email} readOnly style={{ background:'var(--bg)' }} /></div>
        <div className="form-group"><label className="form-label">Password</label><input className="form-ctrl" type="password" defaultValue="••••••••" readOnly style={{ background:'var(--bg)' }} /></div>
        <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'11px' }} onClick={doLogin} disabled={loading}>
          {loading ? <><span className="spinner" style={{ borderTopColor:'#fff' }} /> Signing in…</> : `Sign In as ${ROLES[role]}`}
        </button>
        <p style={{ textAlign:'center', fontSize:11, color:'#94a3b8', marginTop:16 }}>© 2025 ALEYART ACADEMY · ExamAI Pro v2.0<br /><span style={{ color:'#64748b' }}>Powered by Claude AI (Anthropic)</span></p>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ user, setPage }) {
  return (
    <div>
      <div className="db-banner">
        <div>
          <p style={{ fontSize:12, opacity:.7, marginBottom:4 }}>Welcome back,</p>
          <h2 style={{ fontSize:22, fontWeight:700 }}>{user.fullName}</h2>
          <p style={{ fontSize:12, opacity:.65, marginTop:4 }}>{ROLES[user.role]} · ALEYART ACADEMY</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:10, opacity:.6, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2 }}>Our Motto</p>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontStyle:'italic' }}>"Seeking Wisdom"</p>
          <p style={{ fontSize:10, opacity:.6, marginTop:4 }}>Academic Year 2024/2025 · Term 3</p>
        </div>
      </div>
      <div className="stats-grid">
        {[['📄','24','Total Examinations','blue'],['👥','312','Students Enrolled','purple'],['👨‍🏫','18','Teaching Staff','green'],['🗂️','486','Question Bank','amber'],['⏳','7','Pending Approval','red'],['🏫','9','Active Classes','slate']].map(([icon,n,l,c]) => (
          <div key={l} className={`stat ${c}`}><div className="stat-icon">{icon}</div><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16 }}>
        <div className="card">
          <div className="sec-hd"><div className="card-title" style={{ margin:0 }}>Recent Examinations</div><span className="badge badge-blue">🌐 Shared Repository</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Examination</th><th>Type</th><th>Status</th></tr></thead>
              <tbody>{DEMO_EXAMS.slice(0,4).map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight:500 }}><span style={{ fontSize:12 }}>{e.title}</span></td>
                  <td><span className="badge badge-gray" style={{ fontSize:10 }}>{e.examType}</span></td>
                  <td><span className={`badge ${e.status === 'approved' ? 'badge-green' : e.status === 'pending' ? 'badge-amber' : 'badge-gray'}`}>{e.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="card" style={{ marginBottom:12 }}>
            <div className="card-title">Quick Actions</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[['✨','Generate New Exam','generate','btn-primary'],['📂','View Repository','repository','btn-outline'],['👥','Students','students','btn-outline'],['📊','Results','results','btn-outline']].map(([icon,label,pg,cls]) => (
                <button key={pg} className={`btn ${cls}`} style={{ justifyContent:'flex-start' }} onClick={() => setPage(pg)}>{icon} {label}</button>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Compliance ✓</div>
            {['Ghana Education Service (GES)','NaCCA Standards-Based Curriculum','Common Core Programme (CCP)','Ghana GES Grading System'].map(c => (
              <div key={c} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, fontSize:12 }}><span style={{ color:'var(--suc)' }}>✓</span><span>{c}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXAM GENERATOR ──────────────────────────────────────────────────────────
function ExamGenerator() {
  const [step, setStep] = useState(1);
  const [cfg, setCfg] = useState({ year:'2024/2025', term:'Term 1', cls:'Basic 7', subject:'Mathematics', examType:'End of Term Examination', difficulty:'Mixed', duration:'60', totalMarks:'100', numMCQ:20, marksPerMCQ:1, numSubjective:5, marksPerSubQ:10, topics:'Number Theory, Algebra, Geometry, Statistics' });
  const [gen, setGen] = useState(false);
  const [genStep, setGenStep] = useState('');
  const [exam, setExam] = useState(null);
  const [view, setView] = useState('paper');
  const [saved, setSaved] = useState(false);
  const [omrBubbles, setOmrBubbles] = useState({});

  const up = (k, v) => setCfg(p => ({ ...p, [k]: v }));
  const subjects = getSubjects(cfg.cls);
  const isEC = EARLY_CHILDHOOD.includes(cfg.cls);
  const specialRule = SPECIAL_RULES[cfg.subject];

  const generate = async () => {
    setGen(true); setGenStep('Connecting to Claude AI…');
    await new Promise(r => setTimeout(r, 400));
    setGenStep('Generating curriculum-compliant questions…');
    const result = await callClaudeAI(cfg);
    setGenStep('Building exact-answer marking scheme…');
    await new Promise(r => setTimeout(r, 300));
    setExam(result || buildFallback(cfg));
    setGen(false); setStep(3);
  };

  const buildFallback = (c) => ({
    title: `${c.subject} – ${c.examType}`,
    sectionA: Array.from({ length: Math.min(c.numMCQ, 10) }, (_, i) => ({
      num: i + 1, question: `Sample question ${i + 1} on ${c.topics.split(',')[0]?.trim()}.`,
      options: { A:'First option', B:'Second option', C:'Third option', D:'Fourth option' },
      correct: ['A','B','C','D'][i % 4], correctText: `Correct answer for Q${i + 1}`, marks: 1, topic: c.topics.split(',')[0]?.trim()
    })),
    sectionB: Array.from({ length: Math.min(c.numSubjective, 4) }, (_, i) => ({
      num: i + 1, isCompulsory: i === 0, totalMarks: i === 0 ? 20 : 15,
      question: i === 0 ? `COMPULSORY — ${c.subject === 'Computing' || c.subject === 'Science' ? 'PRACTICAL: ' : ''}Solve the following problem related to ${c.topics.split(',')[i]?.trim() || c.topics}.` : `Answer any ${c.numSubjective - 1} questions. Question ${i + 1}: Explain the concept of ${c.topics.split(',')[i]?.trim() || 'the given topic'} with examples.`,
      subParts: [
        { part:'a', question:'Explain the concept clearly with appropriate examples.', marks: i === 0 ? 8 : 5, correctAnswer:'The concept is defined as… [complete, curriculum-accurate answer required]', fullWorking:'Step 1: Define the concept\nStep 2: Give relevant examples\nStep 3: Apply to context\nConclusion: Summarise accurately' },
        { part:'b', question:'Apply the concept to solve the given problem showing all working.', marks: i === 0 ? 12 : 10, correctAnswer:'Full solution: [exact working and answer]', fullWorking:'Step 1: Identify given data\nStep 2: Select method\nStep 3: Apply and calculate\nStep 4: Check answer\nAnswer: [exact result]' },
      ]
    }))
  });

  const mcqCount = exam?.sectionA?.length || 0;

  if (step === 1) return (
    <div>
      <div className="page-hd"><div className="page-title">✨ AI Examination Generator</div><div className="page-sub">Generate NaCCA/GES curriculum-compliant examinations powered by Claude AI</div></div>
      <div className="ai-panel">
        <div style={{ fontWeight:600, color:'#1e40af', fontSize:14, marginBottom:4 }}>🤖 Configure Your Examination</div>
        <div style={{ fontSize:12, color:'#3730a3' }}>All settings automatically appear on the exam paper, marking scheme, OMR sheet, and answer booklet.</div>
      </div>
      <div className="card">
        <div className="form-row-3">
          <div className="form-group"><label className="form-label">Academic Year</label><select className="form-ctrl" value={cfg.year} onChange={e => up('year', e.target.value)}>{['2024/2025','2025/2026','2023/2024'].map(y => <option key={y}>{y}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Term</label><select className="form-ctrl" value={cfg.term} onChange={e => up('term', e.target.value)}>{TERMS.map(t => <option key={t}>{t}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Class</label>
            <select className="form-ctrl" value={cfg.cls} onChange={e => { up('cls', e.target.value); up('subject', getSubjects(e.target.value)[0]); }}>
              {Object.entries(CLASSES).map(([g, cls]) => <optgroup key={g} label={g}>{cls.map(c => <option key={c}>{c}</option>)}</optgroup>)}
            </select>
          </div>
        </div>
        {isEC ? (
          <div className="alert alert-warn">⚠️ <div><strong>{cfg.cls}</strong> uses observation-based assessment. No formal examination papers are generated for Early Childhood (Creche–KG2) per GES policy.</div></div>
        ) : (
          <>
            {specialRule && <div className="alert alert-info">📌 <div><strong>Special Curriculum Rule — {cfg.subject}:</strong> {specialRule}</div></div>}
            <div className="form-row">
              <div className="form-group"><label className="form-label">Subject</label><select className="form-ctrl" value={cfg.subject} onChange={e => up('subject', e.target.value)}>{subjects.map(s => <option key={s}>{s}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Examination Type</label><select className="form-ctrl" value={cfg.examType} onChange={e => up('examType', e.target.value)}>{EXAM_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            </div>
            <div className="form-row-3">
              <div className="form-group"><label className="form-label">Duration (min)</label><input className="form-ctrl" type="number" value={cfg.duration} onChange={e => up('duration', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Total Marks</label><input className="form-ctrl" type="number" value={cfg.totalMarks} onChange={e => up('totalMarks', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Difficulty</label><select className="form-ctrl" value={cfg.difficulty} onChange={e => up('difficulty', e.target.value)}>{DIFFICULTY.map(d => <option key={d}>{d}</option>)}</select></div>
            </div>
            {/* Section A */}
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'var(--r)', padding:'14px 16px', marginBottom:12 }}>
              <div style={{ fontWeight:600, fontSize:13, color:'#1e40af', marginBottom:10 }}>📝 Section A — Objective (Multiple Choice)</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Number of Questions</label>
                  <input className="form-ctrl" type="number" min="5" max="60" value={cfg.numMCQ} onChange={e => up('numMCQ', parseInt(e.target.value)||20)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Marks Per Question</label>
                  <select className="form-ctrl" value={cfg.marksPerMCQ} onChange={e => up('marksPerMCQ', parseInt(e.target.value))}>
                    <option value={1}>1 mark each</option>
                    <option value={2}>2 marks each</option>
                  </select>
                </div>
              </div>
              <div style={{ fontSize:12, color:'#1e40af', fontWeight:500 }}>Section A Total: {(cfg.numMCQ||0) * (cfg.marksPerMCQ||1)} marks</div>
            </div>

            {/* Section B */}
            <div style={{ background:'#ecfdf5', border:'1px solid #6ee7b7', borderRadius:'var(--r)', padding:'14px 16px', marginBottom:12 }}>
              <div style={{ fontWeight:600, fontSize:13, color:'#065f46', marginBottom:10 }}>📋 Section B — Subjective (Q1, 1a, 1b, 1c…)</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Number of Questions</label>
                  <input className="form-ctrl" type="number" min="1" max="10" value={cfg.numSubjective} onChange={e => up('numSubjective', parseInt(e.target.value)||5)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Marks Per Question</label>
                  <input className="form-ctrl" type="number" min="5" max="50" value={cfg.marksPerSubQ} onChange={e => up('marksPerSubQ', parseInt(e.target.value)||10)} />
                </div>
              </div>
              <div style={{ fontSize:12, color:'#065f46', fontWeight:500 }}>Section B Total: {(cfg.numSubjective||0) * (cfg.marksPerSubQ||10)} marks</div>
            </div>

            {/* Marks balance checker */}
            {(() => {
              const secA = (cfg.numMCQ||0) * (cfg.marksPerMCQ||1);
              const secB = (cfg.numSubjective||0) * (cfg.marksPerSubQ||10);
              const total = parseInt(cfg.totalMarks)||100;
              const balanced = secA + secB === total;
              return (
                <div style={{ padding:'8px 12px', borderRadius:'var(--r-sm)', marginBottom:12, fontSize:12, background: balanced ? '#ecfdf5' : '#fef3c7', border:`1px solid ${balanced ? '#6ee7b7' : '#fcd34d'}`, color: balanced ? '#065f46' : '#92400e' }}>
                  {balanced
                    ? `✅ Marks balance: Section A (${secA}) + Section B (${secB}) = ${total} marks ✓`
                    : `⚠️ Marks don't balance: Section A (${secA}) + Section B (${secB}) = ${secA+secB} but Total = ${total}. Adjust to match.`
                  }
                </div>
              );
            })()}

            <div className="form-group"><label className="form-label">Topics / Subtopics</label><textarea className="form-ctrl" rows={2} value={cfg.topics} onChange={e => up('topics', e.target.value)} placeholder="e.g. Number Theory, Algebra, Geometry, Statistics" /></div>
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}><button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>Review & Generate →</button></div>
          </>
        )}
      </div>
    </div>
  );

  if (step === 2) return (
    <div>
      <div className="page-hd"><div className="page-title">✨ Review Configuration</div><div className="page-sub">Confirm settings before AI generation</div></div>
      <div className="card" style={{ marginBottom:14 }}>
        <div className="card-title">Examination Summary</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 24px' }}>
          {[['School','ALEYART ACADEMY'],['Motto','Seeking Wisdom'],['Year',cfg.year],['Term',cfg.term],['Class',cfg.cls],['Subject',cfg.subject],['Type',cfg.examType],['Duration',`${cfg.duration} minutes`],['Total Marks',cfg.totalMarks],['Difficulty',cfg.difficulty],['MCQ Qs',cfg.numMCQ],['Subjective Qs',cfg.numSubjective]].map(([k,v]) => (
            <div key={k} style={{ fontSize:13, display:'flex', gap:8 }}><span style={{ color:'var(--muted)', minWidth:130 }}>{k}:</span><span style={{ fontWeight:500 }}>{v}</span></div>
          ))}
        </div>
        <div style={{ marginTop:12, padding:'8px 12px', background:'var(--bg)', borderRadius:6, fontSize:12 }}><strong>Topics:</strong> {cfg.topics}</div>
      </div>
      {specialRule && <div className="alert alert-info">📌 <div><strong>Applied Rule:</strong> {specialRule}</div></div>}
      <div className="alert alert-info">🤖 <div>Claude AI will generate curriculum-compliant questions plus an <strong>exact-answer marking scheme</strong> with full step-by-step working. Allow 15–45 seconds.</div></div>
      {gen ? (
        <div className="gen-bar"><div className="spinner" /><div><div style={{ fontWeight:500 }}>Generating with Claude AI…</div><div style={{ fontSize:12, color:'var(--muted)' }}>{genStep}</div></div></div>
      ) : (
        <div className="btn-group">
          <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
          <button className="btn btn-primary btn-lg" onClick={generate}>🤖 Generate with AI</button>
        </div>
      )}
    </div>
  );

  // Step 3 — Result
  return (
    <div>
      <div className="sec-hd no-print">
        <div><div className="page-title">📄 {cfg.subject} — {cfg.examType}</div><div className="page-sub">{cfg.cls} · {cfg.term} {cfg.year} · {cfg.totalMarks} marks · {cfg.duration} min</div></div>
        <div className="btn-group">
          <button className="btn btn-outline btn-sm" onClick={() => { setStep(1); setExam(null); setSaved(false); }}>← New Exam</button>
          {!saved ? <button className="btn btn-success btn-sm" onClick={() => setSaved(true)}>💾 Save to Repository</button>
                  : <span className="badge badge-green" style={{ padding:'5px 12px' }}>✓ Saved — Visible to All Users</span>}
          <button className="btn btn-gold btn-sm" onClick={() => window.print()}>🖨️ Print</button>
        </div>
      </div>
      <div className="tabs no-print">
        {[['paper','📄 Exam Paper'],['marking','✅ Marking Scheme'],['omr','🔵 OMR Sheet'],['booklet','📓 Answer Booklet']].map(([k,l]) => (
          <div key={k} className={`tab ${view === k ? 'active' : ''}`} onClick={() => setView(k)}>{l}</div>
        ))}
      </div>

      {view === 'paper' && (
        <div className="ep">
          <div className="ep-head">
            <div style={{ fontSize:10, color:'#777', marginBottom:3 }}>REPUBLIC OF GHANA · GHANA EDUCATION SERVICE</div>
            <div className="ep-school">ALEYART ACADEMY</div>
            <div className="ep-motto">Motto: "Seeking Wisdom"</div>
            <div className="ep-contact">P.O. Box 123, Accra, Ghana · Tel: +233 24 000 0000 · info@aleyartacademy.edu.gh</div>
          </div>
          <div className="ep-grid">
            <span><strong>Class:</strong> {cfg.cls}</span><span><strong>Subject:</strong> {cfg.subject}</span>
            <span><strong>Examination:</strong> {cfg.examType}</span><span><strong>Academic Year:</strong> {cfg.year}</span>
            <span><strong>Term:</strong> {cfg.term}</span><span><strong>Duration:</strong> {cfg.duration} minutes</span>
            <span><strong>Total Marks:</strong> {cfg.totalMarks}</span><span><strong>Date:</strong> ___________________</span>
          </div>
          <div className="ep-cand"><span><strong>Name:</strong> ___________________________________________</span><span><strong>Index No.:</strong> _________________</span></div>
          <div className="ep-inst">Answer ALL questions in Section A. Answer Question 1 and any other required questions in Section B.</div>
          {exam?.sectionA?.length > 0 && (
            <>
              <div className="ep-sec">Section A — Objective Questions [{mcqCount} Marks]</div>
              <p style={{ fontSize:11, fontStyle:'italic', marginBottom:10 }}>Circle the letter of the correct answer. Each question carries 1 mark.</p>
              <div className="ep-cols">
                <div>{exam.sectionA.slice(0, Math.ceil(exam.sectionA.length / 2)).map((q, i) => (
                  <div key={i} className="ep-q"><strong>{q.num}.</strong> {q.question}<div className="ep-opts">{q.options && Object.entries(q.options).map(([k,v]) => <div key={k} className="ep-opt">({k}) {v}</div>)}</div></div>
                ))}</div>
                <div className="ep-col-r">{exam.sectionA.slice(Math.ceil(exam.sectionA.length / 2)).map((q, i) => (
                  <div key={i} className="ep-q"><strong>{q.num}.</strong> {q.question}<div className="ep-opts">{q.options && Object.entries(q.options).map(([k,v]) => <div key={k} className="ep-opt">({k}) {v}</div>)}</div></div>
                ))}</div>
              </div>
            </>
          )}
          {exam?.sectionB?.length > 0 && (
            <>
              <div className="ep-sec" style={{ marginTop:24 }}>Section B — Subjective Questions [{(cfg.numSubjective||0) * (cfg.marksPerSubQ||10)} Marks]</div>
              <p style={{ fontSize:11, fontStyle:'italic', marginBottom:10 }}>Answer Question 1 (Compulsory) and any other {cfg.numSubjective - 1} question(s). Show all working clearly.</p>
              {exam.sectionB.map((q, i) => (
                <div key={i} style={{ marginBottom:24, pageBreakInside:'avoid' }}>
                  {/* Q1, Q2 etc header */}
                  <div style={{ fontWeight:'bold', fontSize:14, marginBottom:6, borderBottom:'1px solid #000', paddingBottom:4 }}>
                    Question {q.num} &nbsp;&nbsp; [{q.totalMarks || cfg.marksPerSubQ} marks]
                    {q.isCompulsory && <span style={{ fontWeight:'bold' }}> — COMPULSORY</span>}
                  </div>
                  {/* Main question text if any */}
                  {q.question && <div style={{ fontSize:13, margin:'6px 0 10px', lineHeight:1.7 }}>{q.question}</div>}
                  {/* Sub-parts: 1a, 1b, 1c */}
                  {q.subParts?.map((sp, j) => (
                    <div key={j} style={{ marginBottom:14, paddingLeft:12 }}>
                      <div style={{ fontWeight:'bold', fontSize:13 }}>
                        {q.num}{sp.part}) &nbsp; {sp.question} &nbsp;
                        <em style={{ fontSize:11, fontWeight:'normal', color:'#555' }}>[{sp.marks} marks]</em>
                      </div>
                      {/* Answer lines */}
                      <div style={{ marginTop:6 }}>
                        {Array.from({ length: sp.marks <= 3 ? 3 : sp.marks <= 6 ? 5 : 8 }, (_, l) => (
                          <div key={l} style={{ borderBottom:'1px solid #aaa', minHeight:22, marginBottom:6 }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
          <div className="ep-foot"><em>— End of Examination —</em><span>ALEYART ACADEMY · Seeking Wisdom</span></div>
        </div>
      )}

      {view === 'marking' && (
        <div style={{ maxWidth:800 }}>
          <div className="ms-head">
            <div style={{ fontSize:10, opacity:.7, marginBottom:4, letterSpacing:'.08em' }}>CONFIDENTIAL — FOR EXAMINERS ONLY · DO NOT DISTRIBUTE TO STUDENTS</div>
            <div style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>MARKING SCHEME</div>
            <div style={{ fontSize:13, opacity:.9 }}>{cfg.subject} · {cfg.cls} · {cfg.examType} · {cfg.year}</div>
            <div style={{ fontSize:11, opacity:.7, marginTop:6 }}>ALEYART ACADEMY — Seeking Wisdom · Total: {cfg.totalMarks} marks</div>
          </div>
          <div className="alert alert-success">✅ <div>This marking scheme contains <strong>EXACT CORRECT ANSWERS</strong> with full step-by-step working. Mark scripts immediately without preparing separate answers.</div></div>
          {exam?.sectionA?.length > 0 && (
            <>
              <div className="card-title">Section A — Multiple Choice Answers (Exact)</div>
              <div style={{ marginBottom:8, fontSize:12, color:'var(--muted)' }}>Each correct answer is shown with the option letter AND the full correct text.</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:6, marginBottom:16 }}>
                {exam.sectionA.map((q, i) => (
                  <div key={i} style={{ background:'#ecfdf5', border:'1px solid #6ee7b7', borderRadius:6, padding:'7px 12px', display:'flex', gap:10, alignItems:'flex-start' }}>
                    <span style={{ color:'#64748b', fontWeight:600, fontSize:11, minWidth:24 }}>Q{q.num}</span>
                    <span style={{ fontWeight:700, color:'#065f46', fontSize:15, minWidth:16 }}>{q.correct}</span>
                    <span style={{ fontSize:12, color:'#065f46', lineHeight:1.4 }}>{q.correctText || (q.options && q.options[q.correct])}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {exam?.sectionB?.length > 0 && (
            <>
              <div className="card-title" style={{ marginTop:16 }}>Section B — Detailed Marking Guide (Exact Answers)</div>
              {exam.sectionB.map((q, i) => (
                <div key={i} className="ms-b-item">
                  {/* Q1 header */}
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:10, color:'#0f172a', borderBottom:'2px solid #6ee7b7', paddingBottom:6 }}>
                    Question {q.num}{q.isCompulsory && ' — COMPULSORY'} &nbsp;[{q.totalMarks || cfg.marksPerSubQ} marks]
                  </div>
                  {/* Main question */}
                  {q.question && (
                    <div style={{ fontSize:12, color:'#475569', marginBottom:10, fontStyle:'italic' }}>{q.question}</div>
                  )}
                  {/* Sub-parts: 1a, 1b, 1c */}
                  {q.subParts?.map((sp, j) => (
                    <div key={j} style={{ marginBottom:14, padding:'10px 14px', background:'white', border:'1px solid #6ee7b7', borderLeft:'4px solid #059669', borderRadius:6 }}>
                      {/* Sub-part label: 1a, 1b, 1c */}
                      <div style={{ fontWeight:700, fontSize:13, color:'#065f46', marginBottom:6 }}>
                        {q.num}{sp.part}) &nbsp;
                        <span style={{ fontWeight:400, color:'#334155' }}>{sp.question}</span>
                        &nbsp;<span style={{ fontSize:11, color:'#64748b' }}>[{sp.marks} mark{sp.marks !== 1 ? 's' : ''}]</span>
                      </div>
                      {/* EXACT ANSWER */}
                      <div style={{ background:'#ecfdf5', borderRadius:5, padding:'8px 12px', marginBottom:6 }}>
                        <div style={{ fontSize:10, fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>✓ Exact Correct Answer:</div>
                        <div style={{ fontSize:13, color:'#065f46', fontWeight:500, lineHeight:1.7 }}>{sp.correctAnswer}</div>
                      </div>
                      {/* Full working */}
                      {sp.fullWorking && (
                        <div style={{ background:'#f8fafc', borderRadius:5, padding:'8px 12px', marginBottom:6 }}>
                          <div style={{ fontSize:10, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>Full Working / Steps:</div>
                          <div style={{ fontSize:12, color:'#334155', fontFamily:"'JetBrains Mono',monospace", whiteSpace:'pre-wrap', lineHeight:1.8 }}>{sp.fullWorking}</div>
                        </div>
                      )}
                      <span className="ms-marks">{sp.marks} mark{sp.marks !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                  <div style={{ textAlign:'right', marginTop:4 }}>
                    <span className="ms-marks">Question {q.num} Total: {q.totalMarks || cfg.marksPerSubQ} marks</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {view === 'omr' && (
        <div className="omr">
          <div className="omr-school">ALEYART ACADEMY<br /><span style={{ fontSize:11, fontWeight:'normal', fontStyle:'italic' }}>Seeking Wisdom</span><br /><span style={{ fontSize:12, fontWeight:'bold' }}>OMR ANSWER SHEET</span></div>
          <div className="omr-fields">
            {[['Student Name','_______________________________'],['Admission No.','_______________'],['Class',cfg.cls],['Subject',cfg.subject],['Index No.','_______________'],['Date',`${cfg.year} · ${cfg.term}`]].map(([k,v],i) => (
              <div key={i} className="omr-field"><strong>{k}:</strong> {v}</div>
            ))}
          </div>
          <div style={{ fontSize:10, fontWeight:'bold', background:'#fef3c7', padding:'6px 10px', borderRadius:4, marginBottom:12 }}>USE A DARK PENCIL. SHADE THE CIRCLE COMPLETELY. ERASE CLEANLY IF YOU CHANGE YOUR ANSWER.</div>
          <div className="omr-qs">
            {Array.from({ length: Math.min(mcqCount, 40) }, (_, i) => i + 1).map(q => (
              <div key={q} className="omr-qrow">
                <span className="omr-qn">{q}.</span>
                {'ABCD'.split('').map(opt => (
                  <div key={opt} className={`omr-bub ${omrBubbles[`${q}-${opt}`] ? 'filled' : ''}`} onClick={() => setOmrBubbles(p => ({ ...p, [`${q}-${opt}`]: !p[`${q}-${opt}`] }))}>{opt}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop:12, borderTop:'1px solid #000', paddingTop:6, fontSize:9, textAlign:'center', color:'#555' }}>ALEYART ACADEMY — Seeking Wisdom · ExamAI Pro · {cfg.year}</div>
        </div>
      )}

      {view === 'booklet' && (
        <div className="booklet">
          <div className="booklet-cover">
            <div className="booklet-school">ALEYART ACADEMY</div>
            <div className="booklet-motto">"Seeking Wisdom"</div>
            <div style={{ textAlign:'center', fontWeight:'bold', fontSize:13, marginBottom:12, textDecoration:'underline' }}>ANSWER BOOKLET</div>
            <div className="booklet-fields">
              {[['Subject:',cfg.subject],['Class:',cfg.cls],['Examination:',cfg.examType],['Academic Year:',cfg.year],['Term:',cfg.term],['Duration:',`${cfg.duration} minutes`],['Student Name:','___________________________'],['Admission No.:','_________________'],['Index No.:','_________________'],['Total Score:','_______ / '+cfg.totalMarks]].map(([k,v],i) => (
                <div key={i} className="booklet-field"><strong>{k}</strong> {v}</div>
              ))}
            </div>
            <div style={{ fontSize:10, marginTop:8, fontStyle:'italic', color:'#555' }}>Write your name and admission number on every page. Use blue or black ink only. Show all working.</div>
          </div>
          <div className="booklet-pages">
            <div style={{ fontSize:11, fontWeight:'bold', marginBottom:8 }}>Page 1 of 8</div>
            {Array.from({ length: 28 }, (_, i) => <div key={i} className="booklet-line" />)}
            <div style={{ textAlign:'center', fontSize:9, marginTop:12, color:'#9ca3af' }}>ALEYART ACADEMY · Seeking Wisdom · {cfg.year}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REPOSITORY ──────────────────────────────────────────────────────────────
function Repository({ user }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const filtered = DEMO_EXAMS.filter(e => (filterStatus === 'all' || e.status === filterStatus) && (e.title.toLowerCase().includes(search.toLowerCase()) || e.subject?.name.toLowerCase().includes(search.toLowerCase())));
  return (
    <div>
      <div className="page-hd"><div className="page-title">📂 Examination Repository</div><div className="page-sub">School-wide shared repository — all saved examinations are visible to all authorised users immediately</div></div>
      <div className="alert alert-info">ℹ️ <div>Examinations saved by any teacher or officer are <strong>immediately visible to all authorised users</strong> upon login. Created By and modification history is tracked for every record.</div></div>
      <div className="card" style={{ marginBottom:14 }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <input className="form-ctrl" style={{ flex:1, minWidth:200 }} placeholder="Search examinations…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-ctrl" style={{ width:160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Examination Title</th><th>Class</th><th>Type</th><th>Marks</th><th>Created By</th><th>Date</th><th>Status</th><th>AI</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(e => (
            <tr key={e.id}>
              <td style={{ fontWeight:500, maxWidth:260 }}><span style={{ fontSize:12 }}>{e.title}</span></td>
              <td><span className="badge badge-gray">{e.class?.name}</span></td>
              <td><span className="badge badge-blue" style={{ fontSize:10 }}>{e.examType}</span></td>
              <td style={{ fontWeight:600 }}>{e.totalMarks}</td>
              <td className="text-sm">{e.createdBy?.fullName}<br /><span className="mono text-muted">{e.createdBy?.staffId}</span></td>
              <td className="text-sm text-muted">{e.createdAt}</td>
              <td><span className={`badge ${e.status === 'approved' ? 'badge-green' : e.status === 'pending' ? 'badge-amber' : 'badge-gray'}`}>{e.status}</span></td>
              <td>{e.aiGenerated && <span className="badge badge-purple" style={{ fontSize:9 }}>🤖 AI</span>}</td>
              <td>
                <div className="btn-group">
                  <button className="btn btn-ghost btn-sm">👁</button>
                  <button className="btn btn-ghost btn-sm">📋</button>
                  <button className="btn btn-ghost btn-sm">🖨️</button>
                  {e.status === 'pending' && ['admin','headteacher'].includes(user.role) && <button className="btn btn-success btn-sm">✓ Approve</button>}
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MARKING SCHEMES ─────────────────────────────────────────────────────────
function MarkingSchemes() {
  return (
    <div>
      <div className="page-hd"><div className="page-title">✅ Marking Schemes</div><div className="page-sub">Confidential — Exact correct answers with full solutions · Examiners only</div></div>
      <div className="alert alert-warn">⚠️ <strong>MANDATORY POLICY:</strong> All marking schemes contain EXACT correct answers — never model, suggested, or possible answers. Full step-by-step solutions always included.</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Examination</th><th>Class</th><th>Subject</th><th>Total Marks</th><th>Date</th><th>AI</th><th>Actions</th></tr></thead>
          <tbody>{DEMO_EXAMS.filter(e => e.status !== 'draft').map(e => (
            <tr key={e.id}>
              <td style={{ fontWeight:500 }}>{e.title}</td>
              <td><span className="badge badge-gray">{e.class?.name}</span></td>
              <td>{e.subject?.name}</td>
              <td style={{ fontWeight:600 }}>{e.totalMarks}</td>
              <td className="text-sm text-muted">{e.createdAt}</td>
              <td>{e.aiGenerated && <span className="badge badge-purple" style={{ fontSize:9 }}>🤖 AI</span>}</td>
              <td><div className="btn-group"><button className="btn btn-ghost btn-sm">👁 View</button><button className="btn btn-ghost btn-sm">🖨️ Print</button><button className="btn btn-ghost btn-sm">📥 DOCX</button></div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ─── OMR PAGE ────────────────────────────────────────────────────────────────
function OMRPage() {
  return (
    <div>
      <div className="page-hd"><div className="page-title">🔵 OMR Sheets</div><div className="page-sub">Generate and print Optical Mark Recognition answer sheets</div></div>
      <div className="alert alert-info">ℹ️ Generate OMR sheets directly from the Exam Generator (Generate Exam → OMR Sheet tab) or select an existing examination below.</div>
      <div className="card"><div className="card-title">Generate OMR Sheet</div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Select Examination</label><select className="form-ctrl">{DEMO_EXAMS.map(e => <option key={e.id}>{e.title}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Number of Questions</label><input className="form-ctrl" type="number" defaultValue={40} /></div>
        </div>
        <button className="btn btn-primary">Generate OMR Sheet</button>
      </div>
    </div>
  );
}

// ─── BOOKLETS ────────────────────────────────────────────────────────────────
function BookletPage() {
  return (
    <div>
      <div className="page-hd"><div className="page-title">📓 Answer Booklets</div><div className="page-sub">Generate school-branded answer booklets for examinations</div></div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
        {[['📓','Standard Booklet','Standard ruled lines, school-branded cover'],['📔','Lined Booklet','Widely-spaced lines for younger pupils'],['📐','Graph Paper Booklet','For Mathematics and Science practical graphs'],['🏫','School-Branded','Full school crest, motto, and branding']].map(([icon,name,desc]) => (
          <div key={name} className="card" style={{ textAlign:'center' }}>
            <div style={{ fontSize:36, marginBottom:8 }}>{icon}</div>
            <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{name}</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginBottom:12 }}>{desc}</div>
            <button className="btn btn-outline btn-sm" style={{ width:'100%' }}>Generate</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── QUESTION BANK ───────────────────────────────────────────────────────────
function QuestionBank() {
  const [search, setSearch] = useState('');
  const [filterSub, setFilterSub] = useState('All');
  const filtered = DEMO_QUESTIONS.filter(q => (filterSub === 'All' || q.subject?.name === filterSub) && (q.questionText.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase())));
  const typeColor = { MultipleChoice:'badge-blue', Essay:'badge-purple', Practical:'badge-green', ShortAnswer:'badge-amber', CaseStudy:'badge-teal' };
  return (
    <div>
      <div className="sec-hd"><div><div className="page-title">🗂️ Question Bank</div><div className="page-sub">486 questions · Shared school-wide · All subjects & classes</div></div><button className="btn btn-primary">+ Add Question</button></div>
      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[['486','Total Questions','blue'],['12','Subjects','purple'],['9','Classes','green'],['6','Contributors','amber']].map(([n,l,c]) => (
          <div key={l} className={`stat ${c}`}><div className="stat-num" style={{ fontSize:24 }}>{n}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>
      <div className="card" style={{ marginBottom:14 }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <input className="form-ctrl" style={{ flex:1, minWidth:200 }} placeholder="Search questions, topics…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-ctrl" style={{ width:180 }} value={filterSub} onChange={e => setFilterSub(e.target.value)}>
            <option value="All">All Subjects</option>
            {[...SUBJECTS_PRIMARY,...SUBJECTS_JHS].filter((v,i,a) => a.indexOf(v) === i).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {filtered.map((q, i) => (
        <div key={i} className={`q-box ${q.questionType === 'Practical' ? 'compulsory' : ''}`}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, flexWrap:'wrap', gap:6 }}>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              <span className="mono text-muted" style={{ fontSize:10 }}>{q.questionId}</span>
              <span className={`badge ${typeColor[q.questionType] || 'badge-gray'}`}>{q.questionType}</span>
              <span className="badge badge-gray">{q.subject?.name}</span>
              <span className="badge badge-gray">{q.forClass}</span>
              <span className={`badge ${q.difficulty === 'Hard' ? 'badge-red' : q.difficulty === 'Easy' ? 'badge-green' : 'badge-amber'}`}>{q.difficulty}</span>
            </div>
            <div className="btn-group"><button className="btn btn-ghost btn-sm">+ Add to Exam</button><button className="btn btn-ghost btn-sm">✏️</button></div>
          </div>
          <div style={{ fontSize:13, lineHeight:1.6 }}>{q.questionText}</div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:6, display:'flex', gap:10 }}>
            <span>📚 {q.topic}</span><span>👤 {q.createdBy?.fullName}</span><span>📅 {q.createdAt}</span><span style={{ fontWeight:600, color:'var(--pri)' }}>[{q.marks} mark{q.marks !== 1 ? 's' : ''}]</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── STUDENTS ────────────────────────────────────────────────────────────────
function Students({ user }) {
  const [students, setStudents] = useState(DEMO_STUDENTS);
  const [search, setSearch] = useState('');
  const [filterCls, setFilterCls] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fullName:'', admissionNumber:'', gender:'Male', dateOfBirth:'', cls:'Basic 7', parentName:'', parentPhone:'' });
  const canEdit = ['admin','examofficer'].includes(user.role);
  const filtered = students.filter(s => (filterCls === 'All' || s.class?.name === filterCls) && (s.fullName.toLowerCase().includes(search.toLowerCase()) || (s.admissionNumber || '').includes(search)));
  const add = () => {
    if (!form.fullName) return;
    setStudents(p => [...p, { ...form, id: p.length + 1, studentId: `STU${Date.now().toString().slice(-4)}`, class: { name: form.cls } }]);
    setShowAdd(false);
    setForm({ fullName:'', admissionNumber:'', gender:'Male', dateOfBirth:'', cls:'Basic 7', parentName:'', parentPhone:'' });
  };
  return (
    <div>
      <div className="sec-hd"><div><div className="page-title">👥 Student Management</div><div className="page-sub">{students.length} students enrolled</div></div>{canEdit && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Student</button>}</div>
      <div className="card" style={{ marginBottom:14 }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <input className="form-ctrl" style={{ flex:1, minWidth:200 }} placeholder="Search by name or admission number…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-ctrl" style={{ width:160 }} value={filterCls} onChange={e => setFilterCls(e.target.value)}>
            <option value="All">All Classes</option>
            {Object.values(CLASSES).flat().map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Adm. No.</th><th>Student ID</th><th>Full Name</th><th>Gender</th><th>DOB</th><th>Class</th><th>Parent</th>{canEdit && <th>Actions</th>}</tr></thead>
          <tbody>{filtered.map(s => (
            <tr key={s.id}>
              <td className="mono">{s.admissionNumber}</td>
              <td className="mono" style={{ color:'var(--pri)' }}>{s.studentId}</td>
              <td style={{ fontWeight:500 }}>{s.fullName}</td>
              <td><span className={`badge ${s.gender === 'Male' ? 'badge-blue' : 'badge-pink'}`}>{s.gender}</span></td>
              <td className="text-sm text-muted">{s.dateOfBirth}</td>
              <td><span className="badge badge-gray">{s.class?.name}</span></td>
              <td className="text-sm">{s.parentName}<br /><span className="text-muted">{s.parentPhone}</span></td>
              {canEdit && <td><div className="btn-group"><button className="btn btn-ghost btn-sm">✏️</button><button className="btn btn-ghost btn-sm" style={{ color:'var(--dan)' }}>🗑</button></div></td>}
            </tr>
          ))}</tbody>
        </table>
      </div>
      {showAdd && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-head"><span className="modal-title">Add New Student</span><button className="btn btn-ghost" onClick={() => setShowAdd(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-row"><div className="form-group"><label className="form-label">Full Name *</label><input className="form-ctrl" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} /></div><div className="form-group"><label className="form-label">Admission No.</label><input className="form-ctrl" value={form.admissionNumber} onChange={e => setForm(p => ({ ...p, admissionNumber: e.target.value }))} placeholder="e.g. 2025/001" /></div></div>
              <div className="form-row"><div className="form-group"><label className="form-label">Gender</label><select className="form-ctrl" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}><option>Male</option><option>Female</option></select></div><div className="form-group"><label className="form-label">Date of Birth</label><input className="form-ctrl" type="date" value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} /></div></div>
              <div className="form-group"><label className="form-label">Class</label><select className="form-ctrl" value={form.cls} onChange={e => setForm(p => ({ ...p, cls: e.target.value }))}>{Object.entries(CLASSES).map(([g,cls]) => <optgroup key={g} label={g}>{cls.map(c => <option key={c}>{c}</option>)}</optgroup>)}</select></div>
              <div className="form-row"><div className="form-group"><label className="form-label">Parent/Guardian Name</label><input className="form-ctrl" value={form.parentName} onChange={e => setForm(p => ({ ...p, parentName: e.target.value }))} /></div><div className="form-group"><label className="form-label">Parent Phone</label><input className="form-ctrl" value={form.parentPhone} onChange={e => setForm(p => ({ ...p, parentPhone: e.target.value }))} placeholder="+233 24 000 0000" /></div></div>
            </div>
            <div className="modal-foot"><button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={add}>Add Student</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TEACHERS ────────────────────────────────────────────────────────────────
function Teachers({ user }) {
  const roleColor = { teacher:'badge-blue', examofficer:'badge-green', headteacher:'badge-purple', admin:'badge-amber' };
  return (
    <div>
      <div className="sec-hd"><div><div className="page-title">👨‍🏫 Teacher Management</div><div className="page-sub">{DEMO_TEACHERS.length} staff members</div></div>{user.role === 'admin' && <button className="btn btn-primary">+ Add Staff</button>}</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Staff ID</th><th>Full Name</th><th>Role</th><th>Position</th><th>Subjects</th><th>Classes</th><th>Email</th><th>Actions</th></tr></thead>
          <tbody>{DEMO_TEACHERS.map(t => (
            <tr key={t.id}>
              <td className="mono" style={{ color:'var(--pri)' }}>{t.staffId}</td>
              <td style={{ fontWeight:500 }}>{t.fullName}</td>
              <td><span className={`badge ${roleColor[t.role] || 'badge-gray'}`}>{ROLES[t.role]}</span></td>
              <td className="text-sm">{t.position}</td>
              <td>{(t.subjects || []).map(s => <span key={s} className="badge badge-blue" style={{ marginRight:2, fontSize:10 }}>{s}</span>)}</td>
              <td>{(t.classes || []).slice(0,3).map(c => <span key={c} className="badge badge-gray" style={{ marginRight:2, fontSize:10 }}>{c}</span>)}{(t.classes?.length || 0) > 3 && <span className="text-muted text-sm">+{t.classes.length - 3}</span>}</td>
              <td className="text-sm text-muted">{t.email}</td>
              <td><div className="btn-group"><button className="btn btn-ghost btn-sm">✏️ Edit</button>{user.role === 'admin' && <button className="btn btn-ghost btn-sm">📚 Assign</button>}</div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ─── RESULTS ─────────────────────────────────────────────────────────────────
function Results() {
  const avg = (DEMO_RESULTS.reduce((s, r) => s + (r.totalScore || 0), 0) / DEMO_RESULTS.length).toFixed(1);
  const top = [...DEMO_RESULTS].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))[0];
  const gradeColor = g => g?.startsWith('A') ? 'badge-green' : g?.startsWith('B') ? 'badge-blue' : g?.startsWith('C') ? 'badge-amber' : 'badge-red';
  return (
    <div>
      <div className="sec-hd"><div><div className="page-title">📊 Results & Reports</div><div className="page-sub">Basic 7 · End of Term 3 · 2024/2025 · 100 marks</div></div>
        <div className="btn-group"><button className="btn btn-outline btn-sm">📥 Import</button><button className="btn btn-primary btn-sm">📤 Export XLSX</button><button className="btn btn-gold btn-sm" onClick={() => window.print()}>🖨️ Print</button></div>
      </div>
      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[[`${avg}%`,'Class Average','blue'],[top?.student?.fullName?.split(' ')[0] || '—','Top Student','green'],[`${DEMO_RESULTS.filter(r => (r.totalScore || 0) >= 50).length}/${DEMO_RESULTS.length}`,'Passed (≥50%)','amber'],[`${DEMO_RESULTS.filter(r => (r.totalScore || 0) < 50).length}`,'Below 50%','red']].map(([n,l,c]) => (
          <div key={l} className={`stat ${c}`}><div className="stat-num" style={{ fontSize:22 }}>{n}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Pos.</th><th>Student ID</th><th>Full Name</th><th>Sec A</th><th>Sec B</th><th>Total</th><th>Grade</th><th>Remarks</th></tr></thead>
          <tbody>{[...DEMO_RESULTS].sort((a, b) => (a.position || 99) - (b.position || 99)).map((r, i) => (
            <tr key={i}>
              <td><span className={`badge ${r.position === 1 ? 'badge-amber' : r.position === 2 ? 'badge-gray' : r.position === 3 ? 'badge-teal' : 'badge-gray'}`}>{r.position}</span></td>
              <td className="mono">{r.student?.studentId}</td>
              <td style={{ fontWeight:500 }}>{r.student?.fullName}</td>
              <td style={{ textAlign:'center' }}>{r.sectionAScore}</td>
              <td style={{ textAlign:'center' }}>{r.sectionBScore}</td>
              <td style={{ textAlign:'center', fontWeight:700 }}>{r.totalScore}</td>
              <td><span className={`badge ${gradeColor(r.grade)}`}>{r.grade}</span></td>
              <td className="text-sm text-muted">{r.remarks}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="card" style={{ marginTop:14 }}>
        <div className="card-title">GES Ghana Grading Scale</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))', gap:8 }}>
          {GES_GRADES.map(g => (
            <div key={g.grade} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 10px', fontSize:12 }}>
              <div style={{ fontWeight:700, color:g.min >= 70 ? 'var(--suc)' : g.min >= 50 ? 'var(--gold)' : 'var(--dan)' }}>{g.grade}</div>
              <div style={{ color:'var(--muted)' }}>{g.min}%{g.grade === 'A1' ? '–100%' : '+'}</div>
              <div style={{ fontSize:10, color:'var(--soft)' }}>{g.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
function Settings({ school, setSchool, showToast }) {
  const [form, setForm] = useState({ ...school });
  const save = () => { setSchool(form); showToast('School information saved successfully!', 'success'); };
  return (
    <div>
      <div className="page-hd"><div className="page-title">⚙️ School Settings</div><div className="page-sub">Manage school information, branding, and system configuration</div></div>
      <div className="card" style={{ marginBottom:14 }}>
        <div className="card-title">School Information</div>
        <div className="alert alert-info">ℹ️ All information below automatically appears on examination papers, marking schemes, OMR sheets, answer booklets, and all exported documents.</div>
        <div className="form-row"><div className="form-group"><label className="form-label">School Name</label><input className="form-ctrl" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div><div className="form-group"><label className="form-label">School Motto</label><input className="form-ctrl" value={form.motto} onChange={e => setForm(p => ({ ...p, motto: e.target.value }))} /></div></div>
        <div className="form-group"><label className="form-label">School Address</label><input className="form-ctrl" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
        <div className="form-row-3"><div className="form-group"><label className="form-label">Telephone</label><input className="form-ctrl" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div><div className="form-group"><label className="form-label">Email</label><input className="form-ctrl" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div><div className="form-group"><label className="form-label">Website</label><input className="form-ctrl" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} /></div></div>
        <div className="form-group"><label className="form-label">School Logo</label>
          <div style={{ border:'2px dashed var(--border-s)', borderRadius:'var(--r)', padding:24, textAlign:'center', color:'var(--muted)' }}>
            <div style={{ fontSize:40, marginBottom:8 }}>🏫</div>
            <div style={{ fontWeight:500 }}>Click to upload school logo</div>
            <div style={{ fontSize:12, marginTop:4 }}>PNG, JPG, or SVG · 200×200px recommended</div>
            <button className="btn btn-outline btn-sm" style={{ marginTop:12 }}>📁 Choose File</button>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end' }}><button className="btn btn-primary" onClick={save}>💾 Save School Information</button></div>
      </div>
      <div className="card">
        <div className="card-title">System Information</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 24px' }}>
          {[['System','ALEYART EXAMAI PRO v2.0'],['AI Engine','Claude (Anthropic)'],['Frontend','React 18 + CSS3'],['Backend','Node.js 20 + Express.js'],['Database','MySQL 8 + Prisma ORM'],['Auth','JWT + RBAC + bcrypt (12 rounds)'],['Curriculum','NaCCA Standards-Based Curriculum'],['Compliance','GES · NaCCA · SBC · CCP'],['Exports','PDF · DOCX · XLSX'],['Deployment','Docker + Nginx + PM2 + Ubuntu']].map(([k,v]) => (
            <div key={k} style={{ fontSize:13, display:'flex', gap:8 }}><span style={{ color:'var(--muted)', minWidth:120 }}>{k}:</span><span style={{ fontWeight:500 }}>{v}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
const DEFAULT_SCHOOL = { name:'ALEYART ACADEMY', motto:'SEEKING WISDOM', address:'P.O. Box 123, Accra, Ghana', phone:'+233 24 000 0000', email:'info@aleyartacademy.edu.gh', website:'www.aleyartacademy.edu.gh' };

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [school, setSchool] = useState(DEFAULT_SCHOOL);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => setToast({ msg, type }), []);
  const pageLabel = NAV.flatMap(g => g.items).find(i => i.id === page)?.label || 'Dashboard';

  if (!user) return <><style>{CSS}</style><LoginPage onLogin={setUser} /></>;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <Sidebar user={user} page={page} setPage={setPage} onLogout={() => { setUser(null); setPage('dashboard'); }} />
        <main className="main">
          <header className="topbar no-print">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:14, fontWeight:600 }}>{pageLabel}</span>
              <span style={{ color:'var(--border-s)' }}>›</span>
              <span style={{ fontSize:12, color:'var(--muted)' }}>ALEYART ACADEMY</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:12, color:'var(--muted)' }}>Term 3 · 2024/2025</span>
              <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:'5px 12px' }}>
                <div style={{ width:26, height:26, background:'#eff6ff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>👤</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, lineHeight:1.2 }}>{user.fullName.split(' ').slice(0,2).join(' ')}</div>
                  <div style={{ fontSize:10, color:'var(--muted)' }}>{ROLES[user.role]}</div>
                </div>
              </div>
            </div>
          </header>
          <div className="content">
            {page === 'dashboard'  && <Dashboard user={user} setPage={setPage} />}
            {page === 'generate'   && <ExamGenerator />}
            {page === 'repository' && <Repository user={user} />}
            {page === 'markscheme' && <MarkingSchemes />}
            {page === 'omr'        && <OMRPage />}
            {page === 'booklet'    && <BookletPage />}
            {page === 'questions'  && <QuestionBank />}
            {page === 'students'   && <Students user={user} />}
            {page === 'teachers'   && <Teachers user={user} />}
            {page === 'results'    && <Results />}
            {page === 'settings'   && <Settings school={school} setSchool={setSchool} showToast={showToast} />}
          </div>
        </main>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}
