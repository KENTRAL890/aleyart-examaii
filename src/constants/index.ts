// Constants for ALEYART EXAMAI PRO

import { ClassLevel, Subject } from '../types';

export const SCHOOL_DEFAULTS = {
  name: 'ALEYART ACADEMY',
  motto: 'SEEKING WISDOM',
  logo: '',
  address: '',
  telephone: '',
  email: '',
  website: ''
};

export const CLASS_LEVELS: ClassLevel[] = [
  // Early Childhood
  { id: 'creche', name: 'Crèche', level: 'early_childhood', order: 1 },
  { id: 'nursery1', name: 'Nursery 1', level: 'early_childhood', order: 2 },
  { id: 'nursery2', name: 'Nursery 2', level: 'early_childhood', order: 3 },
  { id: 'kg1', name: 'KG1', level: 'early_childhood', order: 4 },
  { id: 'kg2', name: 'KG2', level: 'early_childhood', order: 5 },
  // Primary
  { id: 'basic1', name: 'Basic 1', level: 'primary', order: 6 },
  { id: 'basic2', name: 'Basic 2', level: 'primary', order: 7 },
  { id: 'basic3', name: 'Basic 3', level: 'primary', order: 8 },
  { id: 'basic4', name: 'Basic 4', level: 'primary', order: 9 },
  { id: 'basic5', name: 'Basic 5', level: 'primary', order: 10 },
  { id: 'basic6', name: 'Basic 6', level: 'primary', order: 11 },
  // JHS
  { id: 'basic7', name: 'Basic 7', level: 'jhs', order: 12 },
  { id: 'basic8', name: 'Basic 8', level: 'jhs', order: 13 },
  { id: 'basic9', name: 'Basic 9', level: 'jhs', order: 14 },
];

export const EARLY_CHILDHOOD_CLASSES = ['creche', 'nursery1', 'nursery2', 'kg1', 'kg2'];
export const PRIMARY_CLASSES = ['basic1', 'basic2', 'basic3', 'basic4', 'basic5', 'basic6'];
export const JHS_CLASSES = ['basic7', 'basic8', 'basic9'];

export const SUBJECTS: Subject[] = [
  // Primary Subjects (Basic 1-6)
  { id: 'english', name: 'English Language', code: 'ENG', applicableClasses: [...PRIMARY_CLASSES, ...JHS_CLASSES] },
  { id: 'mathematics', name: 'Mathematics', code: 'MATH', applicableClasses: [...PRIMARY_CLASSES, ...JHS_CLASSES] },
  { id: 'science', name: 'Science', code: 'SCI', applicableClasses: [...PRIMARY_CLASSES, ...JHS_CLASSES], hasPractical: true, practicalRule: 'Question 1 must be compulsory and practical-based' },
  { id: 'computing', name: 'Computing', code: 'ICT', applicableClasses: [...PRIMARY_CLASSES, ...JHS_CLASSES], hasPractical: true, practicalRule: 'Question 1 must be compulsory and practical-based' },
  { id: 'creative_arts', name: 'Creative Arts', code: 'CA', applicableClasses: PRIMARY_CLASSES },
  { id: 'creative_arts_design', name: 'Creative Arts and Design', code: 'CAD', applicableClasses: JHS_CLASSES, hasPractical: true, practicalRule: 'Question 1 must be compulsory and practical-based' },
  { id: 'rme', name: 'RME', code: 'RME', applicableClasses: [...PRIMARY_CLASSES, ...JHS_CLASSES], hasPractical: true, practicalRule: 'Question 1 must be story/scenario/case study based' },
  { id: 'history', name: 'History', code: 'HIST', applicableClasses: PRIMARY_CLASSES },
  { id: 'social_studies', name: 'Social Studies', code: 'SS', applicableClasses: JHS_CLASSES },
  { id: 'career_tech', name: 'Career Technology', code: 'CT', applicableClasses: JHS_CLASSES, hasPractical: true, practicalRule: 'Question 1 must be compulsory and practical-based' },
  { id: 'french', name: 'French', code: 'FRE', applicableClasses: [...PRIMARY_CLASSES, ...JHS_CLASSES] },
  { id: 'ga_twi', name: 'Ga/Twi', code: 'GT', applicableClasses: [...PRIMARY_CLASSES, ...JHS_CLASSES] },
];

export const ENGLISH_COMPONENTS = {
  primary: ['Grammar', 'Reading Comprehension', 'Composition', 'Vocabulary', 'Spelling', 'Punctuation', 'Capitalization', 'Oral Language'],
  jhs: ['Grammar', 'Comprehension', 'Summary', 'Composition', 'Literature']
};

export const ENGLISH_STRUCTURE = {
  objective: 40,
  grammar: 15,
  comprehension: 15,
  summary: 10,
  composition: 10,
  literature: 10,
  total: 100
};

export const LITERATURE_TEXT = 'The Beacon of Light';

export const EXAMINATION_TYPES = [
  { id: 'class_test', name: 'Class Test' },
  { id: 'weekly_test', name: 'Weekly Test' },
  { id: 'end_of_month_test', name: 'End of Month Test' },
  { id: 'mid_term', name: 'Mid-Term Examination' },
  { id: 'end_of_term', name: 'End of Term Examination' },
  { id: 'promotion', name: 'Promotion Examination' },
  { id: 'entrance_basic6', name: 'Entrance Examination (Basic 6)' },
  { id: 'transitional_basic8', name: 'Transitional Examination (Basic 8)' },
  { id: 'bece_mock', name: 'BECE Mock Examination (Basic 9)' },
  { id: 'custom', name: 'Custom Examination' },
];

export const QUESTION_TYPES = [
  { id: 'multiple_choice', name: 'Multiple Choice', category: 'objective' },
  { id: 'fill_blank', name: 'Fill in the Blank', category: 'objective' },
  { id: 'true_false', name: 'True or False', category: 'objective' },
  { id: 'matching', name: 'Matching Questions', category: 'objective' },
  { id: 'short_answer', name: 'Short Answer', category: 'subjective' },
  { id: 'essay', name: 'Essay', category: 'subjective' },
  { id: 'theory', name: 'Theory', category: 'subjective' },
  { id: 'practical', name: 'Practical', category: 'subjective' },
  { id: 'case_study', name: 'Case Study', category: 'subjective' },
  { id: 'comprehension', name: 'Comprehension', category: 'subjective' },
  { id: 'summary', name: 'Summary', category: 'subjective' },
  { id: 'composition', name: 'Composition', category: 'subjective' },
  { id: 'application', name: 'Application', category: 'subjective' },
  { id: 'problem_solving', name: 'Problem Solving', category: 'subjective' },
];

export const DIFFICULTY_LEVELS = [
  { id: 'easy', name: 'Easy' },
  { id: 'medium', name: 'Medium' },
  { id: 'hard', name: 'Hard' },
];

export const ACADEMIC_YEARS = [
  '2023/2024',
  '2024/2025',
  '2025/2026',
  '2026/2027',
];

export const TERMS = [
  { id: '1', name: 'First Term' },
  { id: '2', name: 'Second Term' },
  { id: '3', name: 'Third Term' },
];

export const EARLY_CHILDHOOD_ASSESSMENTS = {
  creche: {
    methods: ['Observation', 'Development Tracking'],
    areas: ['Motor Skills', 'Social Development', 'Language Development', 'Cognitive Development']
  },
  nursery: {
    methods: ['Oral Assessment', 'Observation', 'Practical Activities'],
    areas: ['Counting', 'Shapes', 'Colours', 'Storytelling', 'Rhymes', 'Drawing']
  },
  kg: {
    methods: ['Oral Assessment', 'Observation', 'Practical Activities'],
    areas: ['Literacy', 'Numeracy', 'Environmental Studies', 'Psychosocial Development', 'Physical Development']
  }
};

export const TOPICS = {
  english: {
    primary: ['Nouns', 'Verbs', 'Adjectives', 'Adverbs', 'Pronouns', 'Prepositions', 'Conjunctions', 'Tenses', 'Punctuation', 'Comprehension', 'Vocabulary', 'Composition Writing', 'Letter Writing', 'Story Writing'],
    jhs: ['Tenses', 'Sentence Structure', 'Parts of Speech', 'Active and Passive Voice', 'Direct and Indirect Speech', 'Comprehension Passages', 'Summary Writing', 'Essay Writing', 'Letter Writing', 'Narrative Writing', 'Argumentative Writing', 'Descriptive Writing', 'Literature - The Beacon of Light']
  },
  mathematics: {
    primary: ['Numbers', 'Addition', 'Subtraction', 'Multiplication', 'Division', 'Fractions', 'Decimals', 'Measurement', 'Time', 'Money', 'Shapes', 'Patterns', 'Data Handling'],
    jhs: ['Number Operations', 'Algebra', 'Geometry', 'Statistics', 'Probability', 'Trigonometry', 'Mensuration', 'Vectors', 'Sets', 'Linear Equations', 'Quadratic Equations', 'Ratios and Proportions', 'Percentages', 'Indices']
  },
  science: {
    primary: ['Living Things', 'Plants', 'Animals', 'Human Body', 'Matter', 'Energy', 'Water', 'Air', 'Soil', 'Weather', 'Simple Machines'],
    jhs: ['Cells', 'Human Systems', 'Reproduction', 'Ecology', 'Matter and Change', 'Chemical Reactions', 'Forces and Motion', 'Energy Transformation', 'Electricity', 'Magnetism', 'Waves', 'Scientific Method']
  },
  computing: {
    primary: ['Computer Parts', 'Input Devices', 'Output Devices', 'Storage Devices', 'Basic Operations', 'Word Processing', 'Drawing', 'Internet Safety'],
    jhs: ['Computer Hardware', 'Computer Software', 'Operating Systems', 'Word Processing', 'Spreadsheets', 'Databases', 'Programming', 'Algorithms', 'Flowcharts', 'Web Design', 'Internet', 'ICT Ethics']
  },
  rme: {
    all: ['Honesty', 'Respect', 'Integrity', 'Responsibility', 'Citizenship', 'Leadership', 'Peace Building', 'Community Living', 'Family Values', 'Religious Teachings', 'Moral Values', 'Social Responsibility', 'Environmental Stewardship']
  }
};

export const GRADE_SCALE = [
  { min: 80, max: 100, grade: 'A', remarks: 'Excellent' },
  { min: 70, max: 79, grade: 'B', remarks: 'Very Good' },
  { min: 60, max: 69, grade: 'C', remarks: 'Good' },
  { min: 50, max: 59, grade: 'D', remarks: 'Credit' },
  { min: 40, max: 49, grade: 'E', remarks: 'Pass' },
  { min: 0, max: 39, grade: 'F', remarks: 'Fail' },
];

export const ROLE_PERMISSIONS = {
  administrator: {
    canManageUsers: true,
    canManageTeachers: true,
    canManageSubjects: true,
    canManageClasses: true,
    canManageExaminations: true,
    canManageRepository: true,
    canManageQuestionBank: true,
    canManageMarkingSchemes: true,
    canManageOMR: true,
    canManageAnswerBooklets: true,
    canManageResults: true,
    canViewAllRecords: true,
    canEditAllRecords: true,
    canDeleteAllRecords: true,
    canApproveExaminations: true,
  },
  headteacher: {
    canManageUsers: false,
    canManageTeachers: false,
    canManageSubjects: false,
    canManageClasses: false,
    canManageExaminations: false,
    canManageRepository: true,
    canManageQuestionBank: true,
    canManageMarkingSchemes: true,
    canManageOMR: true,
    canManageAnswerBooklets: true,
    canManageResults: true,
    canViewAllRecords: true,
    canEditAllRecords: false,
    canDeleteAllRecords: false,
    canApproveExaminations: true,
  },
  examination_officer: {
    canManageUsers: false,
    canManageTeachers: false,
    canManageSubjects: false,
    canManageClasses: false,
    canManageExaminations: true,
    canManageRepository: true,
    canManageQuestionBank: true,
    canManageMarkingSchemes: true,
    canManageOMR: true,
    canManageAnswerBooklets: true,
    canManageResults: false,
    canViewAllRecords: true,
    canEditAllRecords: true,
    canDeleteAllRecords: false,
    canApproveExaminations: false,
  },
  teacher: {
    canManageUsers: false,
    canManageTeachers: false,
    canManageSubjects: false,
    canManageClasses: false,
    canManageExaminations: true,
    canManageRepository: true,
    canManageQuestionBank: true,
    canManageMarkingSchemes: true,
    canManageOMR: false,
    canManageAnswerBooklets: false,
    canManageResults: false,
    canViewAllRecords: true,
    canEditAllRecords: false,
    canDeleteAllRecords: false,
    canApproveExaminations: false,
  },
};
