# ALEYART EXAMAI PRO - Shared Data Setup Guide

## The Problem
By default, the application stores data in the browser's localStorage, which means:
- ❌ Data is NOT shared between users
- ❌ Each user/browser has its own separate data
- ❌ Teacher A's saved exams are invisible to Teacher B

## The Solution: Supabase (Free Cloud Database)

Supabase is a free, open-source Firebase alternative that provides:
- ✅ Real-time database with instant syncing
- ✅ All users see the same data
- ✅ Free tier with 500MB database
- ✅ No credit card required

---

## Setup Instructions (10 minutes)

### Step 1: Create Supabase Account

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"**
3. Sign up with GitHub (easiest) or email

### Step 2: Create New Project

1. Click **"New Project"**
2. Enter project details:
   - **Name:** `aleyart-examai`
   - **Database Password:** (create a strong password)
   - **Region:** Choose closest to Ghana (e.g., Frankfurt or London)
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup

### Step 3: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste this SQL:

```sql
-- School Settings Table
CREATE TABLE school_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT DEFAULT 'ALEYART ACADEMY',
  motto TEXT DEFAULT 'SEEKING WISDOM',
  logo TEXT,
  address TEXT,
  telephone TEXT,
  email TEXT,
  website TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO school_settings (id, name, motto) VALUES (1, 'ALEYART ACADEMY', 'SEEKING WISDOM');

-- Teachers Table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  staff_id TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  qualification TEXT,
  position TEXT,
  assigned_classes TEXT[],
  assigned_subjects TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Students Table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT UNIQUE,
  admission_number TEXT,
  full_name TEXT NOT NULL,
  gender TEXT,
  date_of_birth DATE,
  class_id TEXT,
  class_name TEXT,
  photograph TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Examinations Table
CREATE TABLE examinations (
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
  date DATE,
  sections JSONB,
  status TEXT DEFAULT 'saved',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT,
  last_modified_by TEXT
);

-- Marking Schemes Table
CREATE TABLE marking_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id UUID REFERENCES examinations(id) ON DELETE CASCADE,
  sections JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Question Bank Table
CREATE TABLE question_bank (
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0
);

-- Results Table
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id UUID REFERENCES examinations(id),
  student_id UUID REFERENCES students(id),
  student_name TEXT,
  class_name TEXT,
  subject TEXT,
  total_marks INTEGER,
  obtained_marks INTEGER,
  percentage DECIMAL,
  grade TEXT,
  remarks TEXT,
  section_scores JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marking_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all authenticated operations (for school use)
CREATE POLICY "Allow all for school_settings" ON school_settings FOR ALL USING (true);
CREATE POLICY "Allow all for teachers" ON teachers FOR ALL USING (true);
CREATE POLICY "Allow all for students" ON students FOR ALL USING (true);
CREATE POLICY "Allow all for examinations" ON examinations FOR ALL USING (true);
CREATE POLICY "Allow all for marking_schemes" ON marking_schemes FOR ALL USING (true);
CREATE POLICY "Allow all for question_bank" ON question_bank FOR ALL USING (true);
CREATE POLICY "Allow all for results" ON results FOR ALL USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE examinations;
ALTER PUBLICATION supabase_realtime ADD TABLE marking_schemes;
ALTER PUBLICATION supabase_realtime ADD TABLE question_bank;
ALTER PUBLICATION supabase_realtime ADD TABLE teachers;
ALTER PUBLICATION supabase_realtime ADD TABLE students;
```

4. Click **"Run"** to execute

### Step 4: Get Your API Keys

1. Go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### Step 5: Configure Your Application

1. Create a file named `.env` in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-key-here
```

2. Replace the values with your actual Supabase credentials

### Step 6: Deploy with Environment Variables

**For Vercel:**
1. Go to your project → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
3. Redeploy

**For Netlify:**
1. Go to Site Settings → Environment Variables
2. Add the same variables
3. Trigger redeploy

---

## Testing Shared Data

After setup:

1. Open the app in **Browser A** (e.g., Chrome)
2. Login as Administrator
3. Generate and save an examination
4. Open the app in **Browser B** (e.g., Firefox or another device)
5. Login as Teacher
6. Check the **Examination Repository** - you should see the exam!

---

## Verification

When the app starts, check the browser console:
- ✅ `CLOUD MODE: Data will be shared between all users` - Working!
- ⚠️ `LOCAL MODE: Data stored in browser only` - Not configured yet

---

## Cost

**Free Tier Includes:**
- 500 MB database
- 2 GB bandwidth/month
- 50,000 monthly active users
- Unlimited API requests

This is more than enough for a school!

---

## Troubleshooting

### "Data not syncing between users"
- Verify environment variables are set correctly
- Check browser console for errors
- Ensure tables were created successfully in Supabase

### "Cannot connect to database"
- Check if Supabase project is active
- Verify API keys are correct
- Check network connection

### "Permission denied errors"
- Make sure RLS policies were created
- Run the SQL script again if needed

---

## Alternative: Self-Hosted Option

If you prefer to host your own database:

1. Install Supabase locally using Docker
2. Or use any PostgreSQL database with the same schema
3. Modify `src/services/database.ts` to connect to your server

---

## Support

For issues:
1. Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Verify all SQL was executed successfully
3. Check browser console for error messages

---

*ALEYART ACADEMY - SEEKING WISDOM*
*Now with Real-Time Shared Data!*
