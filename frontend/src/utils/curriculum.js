// src/utils/curriculum.js — Ghana NaCCA / GES curriculum constants
export const CLASSES = {
  'Early Childhood': ['Creche', 'Nursery 1', 'Nursery 2', 'KG1', 'KG2'],
  Primary:           ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6'],
  'Junior High':     ['Basic 7', 'Basic 8', 'Basic 9'],
};

export const SUBJECTS_PRIMARY = [
  'English Language', 'Mathematics', 'Science', 'Computing',
  'Creative Arts', 'RME', 'History', 'French', 'GA/TWI',
];

export const SUBJECTS_JHS = [
  'English Language', 'Mathematics', 'Science', 'Computing',
  'Creative Arts and Design', 'RME', 'Social Studies',
  'Career Technology', 'French', 'GA/TWI',
];

export const EXAM_TYPES = [
  'Weekly Test', 'Class Test', 'End of Month Test',
  'Mid-Term Examination', 'End of Term Examination',
  'Promotion Examination', 'Entrance Examination',
  'Transitional Examination', 'BECE Mock Examination', 'Custom Examination',
];

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard', 'Mixed'];

export const TERMS = ['Term 1', 'Term 2', 'Term 3'];

export const QUESTION_TYPES = [
  'Multiple Choice (A–D)', 'Fill in the Blank', 'True or False', 'Matching',
  'Short Answer', 'Essay', 'Theory', 'Practical', 'Comprehension',
  'Summary', 'Composition', 'Case Study', 'Problem Solving',
];

export const EARLY_CHILDHOOD = ['Creche', 'Nursery 1', 'Nursery 2', 'KG1', 'KG2'];
export const JHS_CLASSES = ['Basic 7', 'Basic 8', 'Basic 9'];

// Subjects that have special Q1 rules
export const SPECIAL_SUBJECT_RULES = {
  'Computing': {
    q1Must: 'practical',
    instruction: 'Question 1 must be a PRACTICAL computing task (compulsory).',
  },
  'Science': {
    q1Must: 'practical',
    instruction: 'Question 1 must be a PRACTICAL science experiment (compulsory).',
  },
  'Career Technology': {
    q1Must: 'practical',
    instruction: 'Question 1 must be a PRACTICAL career technology task (compulsory).',
  },
  'Creative Arts and Design': {
    q1Must: 'practical',
    instruction: 'Question 1 must be a PRACTICAL creative arts task (compulsory).',
  },
  'RME': {
    q1Must: 'scenario',
    instruction: 'Question 1 must be story/case-study/scenario-based (70% real-life situations). Paper must state: "Answer Question 1 and any other required questions."',
  },
};

// English Language JHS structure
export const ENGLISH_JHS_STRUCTURE = {
  sectionA: { marks: 40, description: 'Grammar + Objective Questions' },
  sectionB: { marks: 15, description: 'Grammar Questions' },
  sectionC: { marks: 15, description: 'Comprehension — "The Beacon of Light"' },
  sectionD: {
    marks: 30,
    breakdown: { summary: 10, composition: 10, literature: 10 },
    description: 'Summary (10) + Composition (10) + Literature (10)',
  },
  total: 100,
};

// Ghana GES grading scale
export const GES_GRADES = [
  { grade: 'A1', min: 80, max: 100, label: 'Excellent',  color: '#065f46' },
  { grade: 'B2', min: 75, max: 79,  label: 'Very Good',  color: '#047857' },
  { grade: 'B3', min: 70, max: 74,  label: 'Good',       color: '#059669' },
  { grade: 'C4', min: 65, max: 69,  label: 'Credit',     color: '#0369a1' },
  { grade: 'C5', min: 60, max: 64,  label: 'Credit',     color: '#1d4ed8' },
  { grade: 'C6', min: 55, max: 59,  label: 'Credit',     color: '#4f46e5' },
  { grade: 'D7', min: 50, max: 54,  label: 'Pass',       color: '#92400e' },
  { grade: 'E8', min: 45, max: 49,  label: 'Pass',       color: '#b45309' },
  { grade: 'F9', min: 0,  max: 44,  label: 'Fail',       color: '#991b1b' },
];

export function getGrade(score, totalMarks = 100) {
  const pct = (score / totalMarks) * 100;
  return GES_GRADES.find(g => pct >= g.min && pct <= g.max) || GES_GRADES[GES_GRADES.length - 1];
}

export function getSubjects(className) {
  return JHS_CLASSES.includes(className) ? SUBJECTS_JHS : SUBJECTS_PRIMARY;
}

export function isEarlyChildhood(className) {
  return EARLY_CHILDHOOD.includes(className);
}

export function isJHS(className) {
  return JHS_CLASSES.includes(className);
}

export function getEducationalLevel(className) {
  if (EARLY_CHILDHOOD.includes(className)) return 'EarlyChildhood';
  if (JHS_CLASSES.includes(className))     return 'JuniorHighSchool';
  return 'Primary';
}

export function hasSpecialRule(subject) {
  return subject in SPECIAL_SUBJECT_RULES;
}

export function getSpecialRule(subject) {
  return SPECIAL_SUBJECT_RULES[subject] || null;
}

// Academic years
export function getAcademicYears(count = 4) {
  const current = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => `${current - i}/${current - i + 1}`);
}
