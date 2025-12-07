-- Enable pgcrypto for UUID generation
CREATE EXTENSION pgcrypto;
-- =========================
-- TABLES
-- =========================

-- Committees table
CREATE TABLE IF NOT EXISTS committees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  committee_id uuid REFERENCES committees(id) ON DELETE SET NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Weeks table
CREATE TABLE IF NOT EXISTS weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id uuid NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  content text DEFAULT '',
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(committee_id, week_number)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id uuid NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date date,
  submission_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id uuid NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_id uuid REFERENCES weeks(id) ON DELETE SET NULL,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'excused')),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(committee_id, user_id, date)
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id uuid NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id uuid NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  given_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_profiles_committee ON profiles(committee_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_weeks_committee ON weeks(committee_id);
CREATE INDEX IF NOT EXISTS idx_projects_committee ON projects(committee_id);
CREATE INDEX IF NOT EXISTS idx_projects_assigned ON projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_attendance_committee ON attendance(committee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_committee ON announcements(committee_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_committee ON feedback(committee_id);

-- =========================
-- RLS POLICIES (GENERIC)
-- =========================

-- Enable RLS
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Example generic policies
-- Replace 'current_user_id' with the UUID of the logged-in user in your app logic

-- Committees: only allow viewing if user belongs to the committee
CREATE POLICY view_committee ON committees FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.committee_id = committees.id AND p.id = current_setting('app.current_user_id')::uuid
  ));

-- Profiles: users can view profiles in the same committee
CREATE POLICY view_profiles ON profiles FOR SELECT
  USING (committee_id IN (
    SELECT committee_id FROM profiles WHERE id = current_setting('app.current_user_id')::uuid
  ));

-- Users can update their own profile
CREATE POLICY update_own_profile ON profiles FOR UPDATE
  USING (id = current_setting('app.current_user_id')::uuid)
  WITH CHECK (id = current_setting('app.current_user_id')::uuid);

-- Weeks: allow viewing weeks in user's committee
CREATE POLICY view_weeks ON weeks FOR SELECT
  USING (committee_id IN (
    SELECT committee_id FROM profiles WHERE id = current_setting('app.current_user_id')::uuid
  ));

-- Projects: allow viewing projects in user's committee
CREATE POLICY view_projects ON projects FOR SELECT
  USING (committee_id IN (
    SELECT committee_id FROM profiles WHERE id = current_setting('app.current_user_id')::uuid
  ));

-- Members can update their own projects
CREATE POLICY update_own_projects ON projects FOR UPDATE
  USING (assigned_to = current_setting('app.current_user_id')::uuid)
  WITH CHECK (assigned_to = current_setting('app.current_user_id')::uuid);

-- Attendance: allow viewing attendance in user's committee
CREATE POLICY view_attendance ON attendance FOR SELECT
  USING (committee_id IN (
    SELECT committee_id FROM profiles WHERE id = current_setting('app.current_user_id')::uuid
  ));

-- Announcements: view committee announcements
CREATE POLICY view_announcements ON announcements FOR SELECT
  USING (committee_id IN (
    SELECT committee_id FROM profiles WHERE id = current_setting('app.current_user_id')::uuid
  ));

-- Feedback: users can view their own feedback
CREATE POLICY view_own_feedback ON feedback FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Admins policies would be similar, check your app logic for 'role' column
