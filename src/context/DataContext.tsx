import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  SchoolSettings,
  Teacher,
  Student,
  Examination,
  MarkingScheme,
  QuestionBankEntry,
  OMRSheet,
  AnswerBooklet,
  ExamResult,
  AuditLog,
} from '../types';
import { SCHOOL_DEFAULTS } from '../constants';

// Supabase Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const isCloudMode = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Initialize Supabase client
let supabase: SupabaseClient | null = null;
if (isCloudMode) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ CLOUD MODE ENABLED: Data will be shared between all users!');
} else {
  console.log('⚠️ LOCAL MODE: Data stored in browser only. Configure Supabase for shared data.');
}

interface DataContextType {
  // Cloud Mode Status
  isCloudMode: boolean;
  
  // School Settings
  schoolSettings: SchoolSettings;
  updateSchoolSettings: (settings: Partial<SchoolSettings>) => void;
  
  // Teachers
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>) => Teacher;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  
  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => Student;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  // Examinations
  examinations: Examination[];
  addExamination: (exam: Omit<Examination, 'id' | 'createdAt' | 'updatedAt'>) => Examination;
  updateExamination: (id: string, exam: Partial<Examination>) => void;
  deleteExamination: (id: string) => void;
  getExamination: (id: string) => Examination | undefined;
  
  // Marking Schemes
  markingSchemes: MarkingScheme[];
  addMarkingScheme: (scheme: Omit<MarkingScheme, 'id' | 'createdAt' | 'updatedAt'>) => MarkingScheme;
  updateMarkingScheme: (id: string, scheme: Partial<MarkingScheme>) => void;
  getMarkingSchemeByExam: (examId: string) => MarkingScheme | undefined;
  
  // Question Bank
  questionBank: QuestionBankEntry[];
  addToQuestionBank: (entry: Omit<QuestionBankEntry, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => QuestionBankEntry;
  searchQuestionBank: (filters: Partial<QuestionBankEntry>) => QuestionBankEntry[];
  
  // OMR Sheets
  omrSheets: OMRSheet[];
  generateOMRSheet: (sheet: Omit<OMRSheet, 'id'>) => OMRSheet;
  
  // Answer Booklets
  answerBooklets: AnswerBooklet[];
  generateAnswerBooklet: (booklet: Omit<AnswerBooklet, 'id'>) => AnswerBooklet;
  
  // Results
  results: ExamResult[];
  addResult: (result: Omit<ExamResult, 'id' | 'createdAt'>) => ExamResult;
  
  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  
  // Refresh data from cloud
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'aleyart_data';

interface StoredData {
  schoolSettings: SchoolSettings;
  teachers: Teacher[];
  students: Student[];
  examinations: Examination[];
  markingSchemes: MarkingScheme[];
  questionBank: QuestionBankEntry[];
  omrSheets: OMRSheet[];
  answerBooklets: AnswerBooklet[];
  results: ExamResult[];
  auditLogs: AuditLog[];
}

const defaultData: StoredData = {
  schoolSettings: SCHOOL_DEFAULTS,
  teachers: [],
  students: [],
  examinations: [],
  markingSchemes: [],
  questionBank: [],
  omrSheets: [],
  answerBooklets: [],
  results: [],
  auditLogs: [],
};

const getLocalData = (): StoredData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return { ...defaultData, ...JSON.parse(saved) };
    } catch {
      console.error('Failed to parse saved data');
    }
  }
  return defaultData;
};

const saveLocalData = (data: StoredData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<StoredData>(getLocalData);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Supabase
  const fetchCloudData = useCallback(async () => {
    if (!isCloudMode || !supabase) return;

    try {
      console.log('📡 Fetching data from cloud...');
      
      const [
        { data: examinations, error: examError },
        { data: markingSchemes, error: msError },
        { data: questionBank, error: qbError },
        { data: teachers, error: teacherError },
        { data: students, error: studentError },
        { data: results, error: resultError },
        { data: schoolSettings, error: settingsError }
      ] = await Promise.all([
        supabase.from('examinations').select('*').order('created_at', { ascending: false }),
        supabase.from('marking_schemes').select('*'),
        supabase.from('question_bank').select('*').order('created_at', { ascending: false }),
        supabase.from('teachers').select('*').order('full_name'),
        supabase.from('students').select('*').order('full_name'),
        supabase.from('results').select('*'),
        supabase.from('school_settings').select('*').eq('id', 1).single()
      ]);

      // Log any errors
      if (examError) console.error('Examinations error:', examError);
      if (msError) console.error('Marking schemes error:', msError);
      if (qbError) console.error('Question bank error:', qbError);
      if (teacherError) console.error('Teachers error:', teacherError);
      if (studentError) console.error('Students error:', studentError);
      if (resultError) console.error('Results error:', resultError);
      if (settingsError && settingsError.code !== 'PGRST116') console.error('Settings error:', settingsError);

      // Transform data from snake_case to camelCase
      const transformedExams = (examinations || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        academicYear: e.academic_year,
        term: e.term,
        classId: e.class_id,
        className: e.class_name,
        subjectId: e.subject_id,
        subjectName: e.subject_name,
        examinationType: e.examination_type,
        teacherId: e.teacher_id,
        teacherName: e.teacher_name,
        duration: e.duration,
        totalMarks: e.total_marks,
        date: e.date,
        sections: e.sections || [],
        status: e.status,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
        createdBy: e.created_by,
        lastModifiedBy: e.last_modified_by,
      }));

      const transformedSchemes = (markingSchemes || []).map((m: any) => ({
        id: m.id,
        examinationId: m.examination_id,
        sections: m.sections || [],
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      }));

      const transformedQuestions = (questionBank || []).map((q: any) => ({
        id: q.id,
        question: q.question,
        subjectId: q.subject_id,
        subjectName: q.subject_name,
        classId: q.class_id,
        className: q.class_name,
        topic: q.topic,
        subtopic: q.subtopic,
        teacherId: q.teacher_id,
        teacherName: q.teacher_name,
        academicYear: q.academic_year,
        term: q.term,
        difficulty: q.difficulty,
        createdAt: q.created_at,
        updatedAt: q.updated_at,
        usageCount: q.usage_count || 0,
      }));

      const transformedTeachers = (teachers || []).map((t: any) => ({
        id: t.id,
        fullName: t.full_name,
        staffId: t.staff_id,
        email: t.email,
        phone: t.phone,
        qualification: t.qualification,
        position: t.position,
        assignedClasses: t.assigned_classes || [],
        assignedSubjects: t.assigned_subjects || [],
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));

      const transformedStudents = (students || []).map((s: any) => ({
        id: s.id,
        studentId: s.student_id,
        admissionNumber: s.admission_number,
        fullName: s.full_name,
        gender: s.gender,
        dateOfBirth: s.date_of_birth,
        classId: s.class_id,
        className: s.class_name,
        photograph: s.photograph,
        parentName: s.parent_name,
        parentPhone: s.parent_phone,
        parentEmail: s.parent_email,
        address: s.address,
        createdAt: s.created_at,
      }));

      const transformedSettings = schoolSettings ? {
        name: schoolSettings.name || SCHOOL_DEFAULTS.name,
        motto: schoolSettings.motto || SCHOOL_DEFAULTS.motto,
        logo: schoolSettings.logo || '',
        address: schoolSettings.address || '',
        telephone: schoolSettings.telephone || '',
        email: schoolSettings.email || '',
        website: schoolSettings.website || '',
      } : SCHOOL_DEFAULTS;

      setData(prev => ({
        ...prev,
        examinations: transformedExams,
        markingSchemes: transformedSchemes,
        questionBank: transformedQuestions,
        teachers: transformedTeachers,
        students: transformedStudents,
        results: results || [],
        schoolSettings: transformedSettings,
      }));

      console.log('✅ Cloud data loaded:', {
        examinations: transformedExams.length,
        questions: transformedQuestions.length,
        teachers: transformedTeachers.length,
        students: transformedStudents.length,
      });

    } catch (error) {
      console.error('❌ Error fetching cloud data:', error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const init = async () => {
      if (isCloudMode) {
        await fetchCloudData();
      }
      setIsLoading(false);
    };
    init();
  }, [fetchCloudData]);

  // Set up realtime subscription
  useEffect(() => {
    if (!isCloudMode || !supabase) return;

    console.log('🔄 Setting up realtime sync...');

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'examinations' }, () => {
        console.log('📥 Examinations updated - refreshing...');
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'question_bank' }, () => {
        console.log('📥 Question bank updated - refreshing...');
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, () => {
        console.log('📥 Teachers updated - refreshing...');
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        console.log('📥 Students updated - refreshing...');
        fetchCloudData();
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [fetchCloudData]);

  // Save to localStorage as backup
  useEffect(() => {
    saveLocalData(data);
  }, [data]);

  // School Settings
  const updateSchoolSettings = async (settings: Partial<SchoolSettings>) => {
    const newSettings = { ...data.schoolSettings, ...settings };
    setData((prev) => ({ ...prev, schoolSettings: newSettings }));

    if (isCloudMode && supabase) {
      await supabase.from('school_settings').upsert({
        id: 1,
        name: newSettings.name,
        motto: newSettings.motto,
        logo: newSettings.logo,
        address: newSettings.address,
        telephone: newSettings.telephone,
        email: newSettings.email,
        website: newSettings.website,
        updated_at: new Date().toISOString(),
      });
    }
  };

  // Teachers
  const addTeacher = (teacher: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Teacher => {
    const newTeacher: Teacher = {
      ...teacher,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, teachers: [...prev.teachers, newTeacher] }));

    if (isCloudMode && supabase) {
      supabase.from('teachers').insert({
        id: newTeacher.id,
        full_name: newTeacher.fullName,
        staff_id: newTeacher.staffId,
        email: newTeacher.email,
        phone: newTeacher.phone,
        qualification: newTeacher.qualification,
        position: newTeacher.position,
        assigned_classes: newTeacher.assignedClasses,
        assigned_subjects: newTeacher.assignedSubjects,
        created_at: newTeacher.createdAt,
        updated_at: newTeacher.updatedAt,
      }).then(({ error }) => {
        if (error) console.error('Error saving teacher:', error);
        else console.log('✅ Teacher saved to cloud');
      });
    }

    return newTeacher;
  };

  const updateTeacher = (id: string, teacher: Partial<Teacher>) => {
    const updatedAt = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      teachers: prev.teachers.map((t) =>
        t.id === id ? { ...t, ...teacher, updatedAt } : t
      ),
    }));

    if (isCloudMode && supabase) {
      const updateData: any = { updated_at: updatedAt };
      if (teacher.fullName) updateData.full_name = teacher.fullName;
      if (teacher.staffId) updateData.staff_id = teacher.staffId;
      if (teacher.email) updateData.email = teacher.email;
      if (teacher.phone) updateData.phone = teacher.phone;
      if (teacher.qualification) updateData.qualification = teacher.qualification;
      if (teacher.position) updateData.position = teacher.position;
      if (teacher.assignedClasses) updateData.assigned_classes = teacher.assignedClasses;
      if (teacher.assignedSubjects) updateData.assigned_subjects = teacher.assignedSubjects;

      supabase.from('teachers').update(updateData).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating teacher:', error);
      });
    }
  };

  const deleteTeacher = (id: string) => {
    setData((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.id !== id),
    }));

    if (isCloudMode && supabase) {
      supabase.from('teachers').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting teacher:', error);
      });
    }
  };

  // Students
  const addStudent = (student: Omit<Student, 'id' | 'createdAt'>): Student => {
    const newStudent: Student = {
      ...student,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, students: [...prev.students, newStudent] }));

    if (isCloudMode && supabase) {
      supabase.from('students').insert({
        id: newStudent.id,
        student_id: newStudent.studentId,
        admission_number: newStudent.admissionNumber,
        full_name: newStudent.fullName,
        gender: newStudent.gender,
        date_of_birth: newStudent.dateOfBirth,
        class_id: newStudent.classId,
        class_name: newStudent.className,
        photograph: newStudent.photograph,
        parent_name: newStudent.parentName,
        parent_phone: newStudent.parentPhone,
        parent_email: newStudent.parentEmail,
        address: newStudent.address,
        created_at: newStudent.createdAt,
      }).then(({ error }) => {
        if (error) console.error('Error saving student:', error);
        else console.log('✅ Student saved to cloud');
      });
    }

    return newStudent;
  };

  const updateStudent = (id: string, student: Partial<Student>) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === id ? { ...s, ...student } : s)),
    }));

    if (isCloudMode && supabase) {
      const updateData: any = {};
      if (student.fullName) updateData.full_name = student.fullName;
      if (student.studentId) updateData.student_id = student.studentId;
      if (student.className) updateData.class_name = student.className;
      if (student.classId) updateData.class_id = student.classId;
      // Add other fields as needed

      supabase.from('students').update(updateData).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating student:', error);
      });
    }
  };

  const deleteStudent = (id: string) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
    }));

    if (isCloudMode && supabase) {
      supabase.from('students').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting student:', error);
      });
    }
  };

  // Examinations
  const addExamination = (exam: Omit<Examination, 'id' | 'createdAt' | 'updatedAt'>): Examination => {
    const newExam: Examination = {
      ...exam,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, examinations: [newExam, ...prev.examinations] }));

    if (isCloudMode && supabase) {
      supabase.from('examinations').insert({
        id: newExam.id,
        title: newExam.title,
        academic_year: newExam.academicYear,
        term: newExam.term,
        class_id: newExam.classId,
        class_name: newExam.className,
        subject_id: newExam.subjectId,
        subject_name: newExam.subjectName,
        examination_type: newExam.examinationType,
        teacher_id: newExam.teacherId,
        teacher_name: newExam.teacherName,
        duration: newExam.duration,
        total_marks: newExam.totalMarks,
        date: newExam.date,
        sections: newExam.sections,
        status: newExam.status,
        created_at: newExam.createdAt,
        updated_at: newExam.updatedAt,
        created_by: newExam.createdBy,
        last_modified_by: newExam.lastModifiedBy,
      }).then(({ error }) => {
        if (error) console.error('Error saving examination:', error);
        else console.log('✅ Examination saved to cloud - visible to all users!');
      });
    }

    return newExam;
  };

  const updateExamination = (id: string, exam: Partial<Examination>) => {
    const updatedAt = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      examinations: prev.examinations.map((e) =>
        e.id === id ? { ...e, ...exam, updatedAt } : e
      ),
    }));

    if (isCloudMode && supabase) {
      const updateData: any = { updated_at: updatedAt };
      if (exam.title) updateData.title = exam.title;
      if (exam.status) updateData.status = exam.status;
      if (exam.sections) updateData.sections = exam.sections;
      if (exam.totalMarks) updateData.total_marks = exam.totalMarks;

      supabase.from('examinations').update(updateData).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating examination:', error);
      });
    }
  };

  const deleteExamination = (id: string) => {
    setData((prev) => ({
      ...prev,
      examinations: prev.examinations.filter((e) => e.id !== id),
      markingSchemes: prev.markingSchemes.filter((m) => m.examinationId !== id),
    }));

    if (isCloudMode && supabase) {
      // Marking schemes will be deleted automatically due to CASCADE
      supabase.from('examinations').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting examination:', error);
        else console.log('✅ Examination deleted from cloud');
      });
    }
  };

  const getExamination = (id: string): Examination | undefined => {
    return data.examinations.find((e) => e.id === id);
  };

  // Marking Schemes
  const addMarkingScheme = (scheme: Omit<MarkingScheme, 'id' | 'createdAt' | 'updatedAt'>): MarkingScheme => {
    const newScheme: MarkingScheme = {
      ...scheme,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, markingSchemes: [...prev.markingSchemes, newScheme] }));

    if (isCloudMode && supabase) {
      supabase.from('marking_schemes').insert({
        id: newScheme.id,
        examination_id: newScheme.examinationId,
        sections: newScheme.sections,
        created_at: newScheme.createdAt,
        updated_at: newScheme.updatedAt,
      }).then(({ error }) => {
        if (error) console.error('Error saving marking scheme:', error);
        else console.log('✅ Marking scheme saved to cloud');
      });
    }

    return newScheme;
  };

  const updateMarkingScheme = (id: string, scheme: Partial<MarkingScheme>) => {
    const updatedAt = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      markingSchemes: prev.markingSchemes.map((m) =>
        m.id === id ? { ...m, ...scheme, updatedAt } : m
      ),
    }));

    if (isCloudMode && supabase) {
      supabase.from('marking_schemes').update({
        sections: scheme.sections,
        updated_at: updatedAt,
      }).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating marking scheme:', error);
      });
    }
  };

  const getMarkingSchemeByExam = (examId: string): MarkingScheme | undefined => {
    return data.markingSchemes.find((m) => m.examinationId === examId);
  };

  // Question Bank
  const addToQuestionBank = (entry: Omit<QuestionBankEntry, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): QuestionBankEntry => {
    const newEntry: QuestionBankEntry = {
      ...entry,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };
    setData((prev) => ({ ...prev, questionBank: [newEntry, ...prev.questionBank] }));

    if (isCloudMode && supabase) {
      supabase.from('question_bank').insert({
        id: newEntry.id,
        question: newEntry.question,
        subject_id: newEntry.subjectId,
        subject_name: newEntry.subjectName,
        class_id: newEntry.classId,
        class_name: newEntry.className,
        topic: newEntry.topic,
        subtopic: newEntry.subtopic,
        teacher_id: newEntry.teacherId,
        teacher_name: newEntry.teacherName,
        academic_year: newEntry.academicYear,
        term: newEntry.term,
        difficulty: newEntry.difficulty,
        created_at: newEntry.createdAt,
        updated_at: newEntry.updatedAt,
        usage_count: 0,
      }).then(({ error }) => {
        if (error) console.error('Error saving to question bank:', error);
        else console.log('✅ Question added to shared question bank');
      });
    }

    return newEntry;
  };

  const searchQuestionBank = (filters: Partial<QuestionBankEntry>): QuestionBankEntry[] => {
    return data.questionBank.filter((entry) => {
      for (const [key, value] of Object.entries(filters)) {
        if (value && entry[key as keyof QuestionBankEntry] !== value) {
          return false;
        }
      }
      return true;
    });
  };

  // OMR Sheets
  const generateOMRSheet = (sheet: Omit<OMRSheet, 'id'>): OMRSheet => {
    const newSheet: OMRSheet = { ...sheet, id: uuidv4() };
    setData((prev) => ({ ...prev, omrSheets: [...prev.omrSheets, newSheet] }));
    return newSheet;
  };

  // Answer Booklets
  const generateAnswerBooklet = (booklet: Omit<AnswerBooklet, 'id'>): AnswerBooklet => {
    const newBooklet: AnswerBooklet = { ...booklet, id: uuidv4() };
    setData((prev) => ({ ...prev, answerBooklets: [...prev.answerBooklets, newBooklet] }));
    return newBooklet;
  };

  // Results
  const addResult = (result: Omit<ExamResult, 'id' | 'createdAt'>): ExamResult => {
    const newResult: ExamResult = {
      ...result,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, results: [...prev.results, newResult] }));

    if (isCloudMode && supabase) {
      supabase.from('results').insert({
        id: newResult.id,
        examination_id: newResult.examinationId,
        student_id: newResult.studentId,
        student_name: newResult.studentName,
        class_name: newResult.className,
        subject: newResult.subject,
        total_marks: newResult.totalMarks,
        obtained_marks: newResult.obtainedMarks,
        percentage: newResult.percentage,
        grade: newResult.grade,
        remarks: newResult.remarks,
        section_scores: newResult.sectionScores,
        created_at: newResult.createdAt,
      }).then(({ error }) => {
        if (error) console.error('Error saving result:', error);
      });
    }

    return newResult;
  };

  // Audit Logs
  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, auditLogs: [newLog, ...prev.auditLogs].slice(0, 1000) }));
  };

  // Manual refresh function
  const refreshData = async () => {
    if (isCloudMode) {
      await fetchCloudData();
    }
  };

  if (isLoading && isCloudMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared data...</p>
          <p className="text-sm text-gray-400 mt-2">ALEYART ACADEMY - SEEKING WISDOM</p>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider
      value={{
        isCloudMode,
        schoolSettings: data.schoolSettings,
        updateSchoolSettings,
        teachers: data.teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        students: data.students,
        addStudent,
        updateStudent,
        deleteStudent,
        examinations: data.examinations,
        addExamination,
        updateExamination,
        deleteExamination,
        getExamination,
        markingSchemes: data.markingSchemes,
        addMarkingScheme,
        updateMarkingScheme,
        getMarkingSchemeByExam,
        questionBank: data.questionBank,
        addToQuestionBank,
        searchQuestionBank,
        omrSheets: data.omrSheets,
        generateOMRSheet,
        answerBooklets: data.answerBooklets,
        generateAnswerBooklet,
        results: data.results,
        addResult,
        auditLogs: data.auditLogs,
        addAuditLog,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
