-- =============================================
-- ALEYART EXAMAI PRO - Database Setup Script
-- Run this ENTIRE script in Supabase SQL Editor
-- =============================================

-- 1. School Settings Table
CREATE TABLE IF NOT EXISTS school_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT DEFAULT 'ALEYART ACADEMY',
  motto TEXT DEFAULT 'SEEKING WISDOM',
  logo TEXT,
  address TEXT,
  telephone TEXT,
  email TEXT,
  website TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default school settings
INSERT INTO school_settings (id, name, motto) 
VALUES (1, 'ALEYART ACADEMY', 'SEEKING WISDOM')
ON CONFLICT (id) DO NOTHING;

-- 2. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  staff_id TEXT,
  email TEXT,
  phone TEXT,
  qualification TEXT,
  position TEXT,
  assigned_classes JSONB DEFAULT '[]',
  assigned_subjects JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT,
  admission_number TEXT,
  full_name TEXT NOT NULL,
  gender TEXT,
  date_of_birth TEXT,
  class_id TEXT,
  class_name TEXT,
  photograph TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Examinations Table (Main table for all exams)
CREATE TABLE IF NOT EXISTS examinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  academic_year TEXT,
  term TEXT,
  class_id TEXT,
  class_name TEXT,
  subject_id TEXT,
  subject_name TEXT,
  examination_type TEXT,
  teacher_id TEXT,
  teacher_name TEXT,
  duration INTEGER,
  total_marks INTEGER,
  date TEXT,
  sections JSONB DEFAULT '[]',
  status TEXT DEFAULT 'saved',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  last_modified_by TEXT
);

-- 5. Marking Schemes Table
CREATE TABLE IF NOT EXISTS marking_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id UUID REFERENCES examinations(id) ON DELETE CASCADE,
  sections JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Question Bank Table
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question JSONB NOT NULL,
  subject_id TEXT,
  subject_name TEXT,
  class_id TEXT,
  class_name TEXT,
  topic TEXT,
  subtopic TEXT,
  teacher_id TEXT,
  teacher_name TEXT,
  academic_year TEXT,
  term TEXT,
  difficulty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0
);

-- 7. Results Table
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id UUID,
  student_id UUID,
  student_name TEXT,
  class_name TEXT,
  subject TEXT,
  total_marks INTEGER,
  obtained_marks INTEGER,
  percentage DECIMAL,
  grade TEXT,
  remarks TEXT,
  section_scores JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. OMR Sheets Table
CREATE TABLE IF NOT EXISTS omr_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id UUID,
  student_name TEXT,
  candidate_number TEXT,
  index_number TEXT,
  subject TEXT,
  class_name TEXT,
  date TEXT,
  number_of_questions INTEGER,
  options_per_question INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Answer Booklets Table
CREATE TABLE IF NOT EXISTS answer_booklets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT,
  pages INTEGER,
  include_school_info BOOLEAN DEFAULT true,
  student_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY (Required for API access)
-- =============================================

ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marking_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE omr_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_booklets ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE ACCESS POLICIES (Allow all operations for school)
-- =============================================

-- School Settings Policies
DROP POLICY IF EXISTS "Allow all for school_settings" ON school_settings;
CREATE POLICY "Allow all for school_settings" ON school_settings FOR ALL USING (true) WITH CHECK (true);

-- Teachers Policies
DROP POLICY IF EXISTS "Allow all for teachers" ON teachers;
CREATE POLICY "Allow all for teachers" ON teachers FOR ALL USING (true) WITH CHECK (true);

-- Students Policies
DROP POLICY IF EXISTS "Allow all for students" ON students;
CREATE POLICY "Allow all for students" ON students FOR ALL USING (true) WITH CHECK (true);

-- Examinations Policies
DROP POLICY IF EXISTS "Allow all for examinations" ON examinations;
CREATE POLICY "Allow all for examinations" ON examinations FOR ALL USING (true) WITH CHECK (true);

-- Marking Schemes Policies
DROP POLICY IF EXISTS "Allow all for marking_schemes" ON marking_schemes;
CREATE POLICY "Allow all for marking_schemes" ON marking_schemes FOR ALL USING (true) WITH CHECK (true);

-- Question Bank Policies
DROP POLICY IF EXISTS "Allow all for question_bank" ON question_bank;
CREATE POLICY "Allow all for question_bank" ON question_bank FOR ALL USING (true) WITH CHECK (true);

-- Results Policies
DROP POLICY IF EXISTS "Allow all for results" ON results;
CREATE POLICY "Allow all for results" ON results FOR ALL USING (true) WITH CHECK (true);

-- OMR Sheets Policies
DROP POLICY IF EXISTS "Allow all for omr_sheets" ON omr_sheets;
CREATE POLICY "Allow all for omr_sheets" ON omr_sheets FOR ALL USING (true) WITH CHECK (true);

-- Answer Booklets Policies
DROP POLICY IF EXISTS "Allow all for answer_booklets" ON answer_booklets;
CREATE POLICY "Allow all for answer_booklets" ON answer_booklets FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- ENABLE REALTIME (For instant sync between users)
-- =============================================

DO $$
BEGIN
  -- Add tables to realtime publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'examinations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE examinations;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'marking_schemes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE marking_schemes;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'question_bank'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE question_bank;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'teachers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE teachers;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'students'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE students;
  END IF;
END $$;

-- =============================================
-- VERIFICATION: Check tables were created
-- =============================================

SELECT 'SUCCESS! All tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('school_settings', 'teachers', 'students', 'examinations', 'marking_schemes', 'question_bank', 'results', 'omr_sheets', 'answer_booklets')
ORDER BY table_name;
