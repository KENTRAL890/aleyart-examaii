/**
 * Database Service for ALEYART EXAMAI PRO
 * 
 * This service provides a centralized data store that can work in two modes:
 * 1. LOCAL MODE: Uses localStorage (data not shared between users)
 * 2. CLOUD MODE: Uses Supabase (data shared between all users)
 * 
 * To enable CLOUD MODE with real shared data:
 * 1. Create a free account at https://supabase.com
 * 2. Create a new project
 * 3. Get your project URL and anon key from Settings > API
 * 4. Set the environment variables in .env file
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration - Set these in your .env file for cloud mode
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
const isCloudMode = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Initialize Supabase client if configured
let supabase: SupabaseClient | null = null;
if (isCloudMode) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ CLOUD MODE: Data will be shared between all users');
} else {
  console.log('⚠️ LOCAL MODE: Data stored in browser only (not shared)');
  console.log('To enable shared data, configure Supabase in .env file');
}

// Storage key for localStorage
const STORAGE_KEY = 'aleyart_examai_data';

// Data types
export interface DatabaseData {
  examinations: any[];
  markingSchemes: any[];
  questionBank: any[];
  teachers: any[];
  students: any[];
  results: any[];
  omrSheets: any[];
  answerBooklets: any[];
  schoolSettings: any;
  auditLogs: any[];
}

const defaultData: DatabaseData = {
  examinations: [],
  markingSchemes: [],
  questionBank: [],
  teachers: [],
  students: [],
  results: [],
  omrSheets: [],
  answerBooklets: [],
  schoolSettings: {
    name: 'ALEYART ACADEMY',
    motto: 'SEEKING WISDOM',
    logo: '',
    address: '',
    telephone: '',
    email: '',
    website: ''
  },
  auditLogs: []
};

/**
 * Database Service Class
 * Provides unified interface for both local and cloud storage
 */
class DatabaseService {
  private isCloud: boolean;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.isCloud = isCloudMode;
    
    // Set up real-time subscription for cloud mode
    if (this.isCloud && supabase) {
      this.setupRealtimeSubscription();
    }
  }

  /**
   * Check if running in cloud mode
   */
  getIsCloudMode(): boolean {
    return this.isCloud;
  }

  /**
   * Subscribe to data changes
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all subscribers of data changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  /**
   * Setup real-time subscription for Supabase
   */
  private setupRealtimeSubscription(): void {
    if (!supabase) return;

    // Subscribe to all table changes
    const tables = ['examinations', 'marking_schemes', 'question_bank', 'teachers', 'students'];
    
    tables.forEach(table => {
      supabase!
        .channel(`${table}_changes`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          this.notifyListeners();
        })
        .subscribe();
    });
  }

  /**
   * Get all data
   */
  async getAllData(): Promise<DatabaseData> {
    if (this.isCloud && supabase) {
      return this.getCloudData();
    }
    return this.getLocalData();
  }

  /**
   * Get data from localStorage
   */
  private getLocalData(): DatabaseData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultData, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error reading local data:', error);
    }
    return defaultData;
  }

  /**
   * Get data from Supabase
   */
  private async getCloudData(): Promise<DatabaseData> {
    if (!supabase) return defaultData;

    try {
      const [
        { data: examinations },
        { data: markingSchemes },
        { data: questionBank },
        { data: teachers },
        { data: students },
        { data: results },
        { data: schoolSettings }
      ] = await Promise.all([
        supabase.from('examinations').select('*').order('created_at', { ascending: false }),
        supabase.from('marking_schemes').select('*'),
        supabase.from('question_bank').select('*').order('created_at', { ascending: false }),
        supabase.from('teachers').select('*'),
        supabase.from('students').select('*'),
        supabase.from('results').select('*'),
        supabase.from('school_settings').select('*').single()
      ]);

      return {
        examinations: examinations || [],
        markingSchemes: markingSchemes || [],
        questionBank: questionBank || [],
        teachers: teachers || [],
        students: students || [],
        results: results || [],
        omrSheets: [],
        answerBooklets: [],
        schoolSettings: schoolSettings || defaultData.schoolSettings,
        auditLogs: []
      };
    } catch (error) {
      console.error('Error fetching cloud data:', error);
      return this.getLocalData(); // Fallback to local
    }
  }

  /**
   * Save all data
   */
  async saveAllData(data: DatabaseData): Promise<void> {
    // Always save to local as backup
    this.saveLocalData(data);
    
    if (this.isCloud && supabase) {
      await this.saveCloudData(data);
    }
    
    this.notifyListeners();
  }

  /**
   * Save data to localStorage
   */
  private saveLocalData(data: DatabaseData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving local data:', error);
    }
  }

  /**
   * Save data to Supabase
   */
  private async saveCloudData(_data: DatabaseData): Promise<void> {
    // Cloud saves are handled per-operation for efficiency
    // This method is called for full sync
  }

  // ============ EXAMINATIONS ============

  async saveExamination(examination: any): Promise<any> {
    if (this.isCloud && supabase) {
      const { data, error } = await supabase
        .from('examinations')
        .upsert(examination)
        .select()
        .single();
      
      if (error) {
        console.error('Error saving examination to cloud:', error);
        // Fallback to local
        return this.saveExaminationLocal(examination);
      }
      this.notifyListeners();
      return data;
    }
    
    return this.saveExaminationLocal(examination);
  }

  private saveExaminationLocal(examination: any): any {
    const data = this.getLocalData();
    const index = data.examinations.findIndex((e: any) => e.id === examination.id);
    
    if (index >= 0) {
      data.examinations[index] = examination;
    } else {
      data.examinations.unshift(examination);
    }
    
    this.saveLocalData(data);
    this.notifyListeners();
    return examination;
  }

  async deleteExamination(id: string): Promise<void> {
    if (this.isCloud && supabase) {
      await supabase.from('examinations').delete().eq('id', id);
      await supabase.from('marking_schemes').delete().eq('examination_id', id);
    }
    
    const data = this.getLocalData();
    data.examinations = data.examinations.filter((e: any) => e.id !== id);
    data.markingSchemes = data.markingSchemes.filter((m: any) => m.examinationId !== id);
    this.saveLocalData(data);
    this.notifyListeners();
  }

  // ============ MARKING SCHEMES ============

  async saveMarkingScheme(scheme: any): Promise<any> {
    if (this.isCloud && supabase) {
      const { data, error } = await supabase
        .from('marking_schemes')
        .upsert({
          ...scheme,
          examination_id: scheme.examinationId,
          sections: JSON.stringify(scheme.sections)
        })
        .select()
        .single();
      
      if (!error) {
        this.notifyListeners();
        return data;
      }
    }
    
    // Local save
    const localData = this.getLocalData();
    const index = localData.markingSchemes.findIndex((m: any) => m.id === scheme.id);
    
    if (index >= 0) {
      localData.markingSchemes[index] = scheme;
    } else {
      localData.markingSchemes.push(scheme);
    }
    
    this.saveLocalData(localData);
    this.notifyListeners();
    return scheme;
  }

  // ============ QUESTION BANK ============

  async saveToQuestionBank(entry: any): Promise<any> {
    if (this.isCloud && supabase) {
      const { data, error } = await supabase
        .from('question_bank')
        .upsert({
          ...entry,
          question: JSON.stringify(entry.question)
        })
        .select()
        .single();
      
      if (!error) {
        this.notifyListeners();
        return data;
      }
    }
    
    // Local save
    const localData = this.getLocalData();
    localData.questionBank.unshift(entry);
    this.saveLocalData(localData);
    this.notifyListeners();
    return entry;
  }

  // ============ TEACHERS ============

  async saveTeacher(teacher: any): Promise<any> {
    if (this.isCloud && supabase) {
      const { data, error } = await supabase
        .from('teachers')
        .upsert(teacher)
        .select()
        .single();
      
      if (!error) {
        this.notifyListeners();
        return data;
      }
    }
    
    const localData = this.getLocalData();
    const index = localData.teachers.findIndex((t: any) => t.id === teacher.id);
    
    if (index >= 0) {
      localData.teachers[index] = teacher;
    } else {
      localData.teachers.push(teacher);
    }
    
    this.saveLocalData(localData);
    this.notifyListeners();
    return teacher;
  }

  async deleteTeacher(id: string): Promise<void> {
    if (this.isCloud && supabase) {
      await supabase.from('teachers').delete().eq('id', id);
    }
    
    const data = this.getLocalData();
    data.teachers = data.teachers.filter((t: any) => t.id !== id);
    this.saveLocalData(data);
    this.notifyListeners();
  }

  // ============ STUDENTS ============

  async saveStudent(student: any): Promise<any> {
    if (this.isCloud && supabase) {
      const { data, error } = await supabase
        .from('students')
        .upsert(student)
        .select()
        .single();
      
      if (!error) {
        this.notifyListeners();
        return data;
      }
    }
    
    const localData = this.getLocalData();
    const index = localData.students.findIndex((s: any) => s.id === student.id);
    
    if (index >= 0) {
      localData.students[index] = student;
    } else {
      localData.students.push(student);
    }
    
    this.saveLocalData(localData);
    this.notifyListeners();
    return student;
  }

  async deleteStudent(id: string): Promise<void> {
    if (this.isCloud && supabase) {
      await supabase.from('students').delete().eq('id', id);
    }
    
    const data = this.getLocalData();
    data.students = data.students.filter((s: any) => s.id !== id);
    this.saveLocalData(data);
    this.notifyListeners();
  }

  // ============ SCHOOL SETTINGS ============

  async saveSchoolSettings(settings: any): Promise<void> {
    if (this.isCloud && supabase) {
      await supabase.from('school_settings').upsert({ id: 1, ...settings });
    }
    
    const data = this.getLocalData();
    data.schoolSettings = { ...data.schoolSettings, ...settings };
    this.saveLocalData(data);
    this.notifyListeners();
  }
}

// Export singleton instance
export const db = new DatabaseService();

// Export helper to check mode
export const isUsingCloudStorage = () => db.getIsCloudMode();
