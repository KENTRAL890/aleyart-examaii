// Type definitions for ALEYART EXAMAI PRO

export type UserRole = 'administrator' | 'headteacher' | 'examination_officer' | 'teacher';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  staffId: string;
  phone: string;
  qualification: string;
  position: string;
  assignedClasses: string[];
  assignedSubjects: string[];
  createdAt: string;
  avatar?: string;
}

export interface SchoolSettings {
  name: string;
  motto: string;
  logo: string;
  address: string;
  telephone: string;
  email: string;
  website: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  staffId: string;
  email: string;
  phone: string;
  qualification: string;
  position: string;
  assignedClasses: string[];
  assignedSubjects: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  studentId: string;
  admissionNumber: string;
  fullName: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  classId: string;
  className: string;
  photograph: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  createdAt: string;
}

export type EducationalLevel = 'early_childhood' | 'primary' | 'jhs';

export interface ClassLevel {
  id: string;
  name: string;
  level: EducationalLevel;
  order: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  applicableClasses: string[];
  hasLiterature?: boolean;
  literatureText?: string;
  hasPractical?: boolean;
  practicalRule?: string;
}

export type ExaminationType = 
  | 'class_test'
  | 'weekly_test'
  | 'end_of_month_test'
  | 'mid_term'
  | 'end_of_term'
  | 'promotion'
  | 'entrance_basic6'
  | 'transitional_basic8'
  | 'bece_mock'
  | 'custom';

export type QuestionType = 
  | 'multiple_choice'
  | 'fill_blank'
  | 'true_false'
  | 'matching'
  | 'short_answer'
  | 'essay'
  | 'theory'
  | 'practical'
  | 'case_study'
  | 'comprehension'
  | 'summary'
  | 'composition'
  | 'application'
  | 'problem_solving';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface SubQuestion {
  id: string;
  label: string;
  text: string;
  marks: number;
  answer: string;
  workings?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  instructions?: string;
  options?: QuestionOption[];
  subQuestions?: SubQuestion[];
  answer: string;
  workings?: string;
  marks: number;
  topic: string;
  subtopic?: string;
  difficulty: DifficultyLevel;
  isCompulsory?: boolean;
  isPractical?: boolean;
  imageUrl?: string;
}

export interface ExamSection {
  id: string;
  name: string;
  label: string;
  instructions: string;
  questionType: 'objective' | 'subjective';
  questions: Question[];
  totalMarks: number;
  columns: 1 | 2;
  hasVerticalDivider: boolean;
}

export interface Examination {
  id: string;
  title: string;
  academicYear: string;
  term: '1' | '2' | '3';
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  examinationType: ExaminationType;
  teacherId: string;
  teacherName: string;
  duration: number;
  totalMarks: number;
  date: string;
  sections: ExamSection[];
  status: 'draft' | 'saved' | 'approved' | 'published';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface MarkingScheme {
  id: string;
  examinationId: string;
  sections: MarkingSection[];
  createdAt: string;
  updatedAt: string;
}

export interface MarkingSection {
  sectionId: string;
  sectionName: string;
  answers: MarkingAnswer[];
}

export interface MarkingAnswer {
  questionId: string;
  questionNumber: number;
  questionText: string;
  answer: string;
  workings?: string;
  marks: number;
  subAnswers?: SubAnswer[];
}

export interface SubAnswer {
  subQuestionId: string;
  label: string;
  answer: string;
  workings?: string;
  marks: number;
}

export interface OMRSheet {
  id: string;
  examinationId: string;
  studentId?: string;
  studentName: string;
  candidateNumber: string;
  indexNumber: string;
  subject: string;
  className: string;
  date: string;
  numberOfQuestions: number;
  optionsPerQuestion: 4 | 5;
}

export interface AnswerBooklet {
  id: string;
  type: 'standard' | 'lined' | 'graph' | 'branded';
  pages: number;
  includeSchoolInfo: boolean;
  studentInfo?: {
    name: string;
    candidateNumber: string;
    subject: string;
    className: string;
  };
}

export interface QuestionBankEntry {
  id: string;
  question: Question;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  topic: string;
  subtopic?: string;
  teacherId: string;
  teacherName: string;
  academicYear: string;
  term: string;
  difficulty: DifficultyLevel;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface ExamResult {
  id: string;
  examinationId: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  remarks: string;
  sectionScores: SectionScore[];
  createdAt: string;
}

export interface SectionScore {
  sectionName: string;
  totalMarks: number;
  obtainedMarks: number;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}
