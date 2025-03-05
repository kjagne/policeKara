-- Create tables for cases, evidence, suspects, reports, crime_statistics, datasets, emergency_calls, emergency_units, profiles

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  date_created DATE NOT NULL DEFAULT CURRENT_DATE,
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_officers JSONB DEFAULT '[]'::jsonb
);

-- Evidence table
CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  date_collected DATE NOT NULL DEFAULT CURRENT_DATE,
  location TEXT,
  status TEXT DEFAULT 'collected',
  description TEXT
);

-- Suspects table
CREATE TABLE IF NOT EXISTS suspects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  status TEXT DEFAULT 'under investigation',
  description TEXT,
  last_known_location TEXT
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  incident_date DATE,
  location TEXT,
  involved_parties TEXT,
  evidence_refs TEXT,
  officer_id TEXT,
  department_id TEXT,
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending review'
);

-- Crime statistics table
CREATE TABLE IF NOT EXISTS crime_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  region TEXT NOT NULL,
  category TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  time_of_day TEXT
);

-- Datasets table
CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  lastUpdated DATE NOT NULL DEFAULT CURRENT_DATE,
  size TEXT NOT NULL,
  description TEXT
);

-- Emergency calls table
CREATE TABLE IF NOT EXISTS emergency_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  caller_name TEXT,
  caller_phone TEXT,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Emergency units table
CREATE TABLE IF NOT EXISTS emergency_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_name TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  current_location TEXT,
  assigned_call_id UUID REFERENCES emergency_calls(id) ON DELETE SET NULL
);

-- Officers table
CREATE TABLE IF NOT EXISTS officers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  rank TEXT NOT NULL,
  station_id UUID REFERENCES stations(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  contact_number TEXT,
  email TEXT
);

-- Stations table (if not already created)
CREATE TABLE IF NOT EXISTS stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  officers INTEGER DEFAULT 0,
  vehicles INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
);

-- Enable realtime for all tables
alter publication supabase_realtime add table cases;
alter publication supabase_realtime add table evidence;
alter publication supabase_realtime add table suspects;
alter publication supabase_realtime add table reports;
alter publication supabase_realtime add table crime_statistics;
alter publication supabase_realtime add table datasets;
alter publication supabase_realtime add table emergency_calls;
alter publication supabase_realtime add table emergency_units;
alter publication supabase_realtime add table officers;
alter publication supabase_realtime add table stations;
