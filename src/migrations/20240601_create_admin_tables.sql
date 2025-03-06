-- Create stations table
CREATE TABLE IF NOT EXISTS stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  district TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create officers table
CREATE TABLE IF NOT EXISTS officers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  badge TEXT NOT NULL UNIQUE,
  rank TEXT NOT NULL,
  department TEXT NOT NULL,
  station_id UUID REFERENCES stations(id),
  email TEXT,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  date_joined DATE,
  status TEXT NOT NULL DEFAULT 'active',
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_officer_id UUID REFERENCES officers(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create criminals table
CREATE TABLE IF NOT EXISTS criminals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  national_id TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  phone TEXT,
  current_status TEXT DEFAULT 'unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case_suspects table (linking cases to criminals)
CREATE TABLE IF NOT EXISTS case_suspects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  criminal_id UUID NOT NULL REFERENCES criminals(id) ON DELETE CASCADE,
  role TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(case_id, criminal_id)
);

-- Create evidence table
CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  location TEXT,
  collected_by UUID REFERENCES officers(id),
  collection_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  station_id UUID REFERENCES stations(id),
  assigned_officer_id UUID REFERENCES officers(id),
  serial_number TEXT,
  acquisition_date DATE,
  last_maintenance DATE,
  next_maintenance DATE,
  condition TEXT NOT NULL DEFAULT 'good',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  maintenance_date DATE NOT NULL,
  maintenance_type TEXT NOT NULL,
  description TEXT NOT NULL,
  cost DECIMAL(10,2),
  performed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  content JSONB NOT NULL,
  officer_id UUID REFERENCES officers(id),
  case_id UUID REFERENCES cases(id),
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency_calls table
CREATE TABLE IF NOT EXISTS emergency_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caller_name TEXT,
  caller_phone TEXT,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_officer_id UUID REFERENCES officers(id),
  response_time INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create detention_records table
CREATE TABLE IF NOT EXISTS detention_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  criminal_id UUID NOT NULL REFERENCES criminals(id),
  case_id UUID REFERENCES cases(id),
  cell_number TEXT,
  station_id UUID REFERENCES stations(id),
  detention_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  detention_end TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  release_reason TEXT,
  arresting_officer UUID REFERENCES officers(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bail_records table
CREATE TABLE IF NOT EXISTS bail_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id),
  suspect_id UUID NOT NULL REFERENCES criminals(id),
  bail_amount DECIMAL(10,2) NOT NULL,
  bail_type TEXT NOT NULL,
  bailer_name TEXT NOT NULL,
  bailer_contact TEXT NOT NULL,
  bailer_relationship TEXT,
  bailer_address TEXT,
  bailer_id_type TEXT,
  bailer_id_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  court_date DATE,
  detention_start TIMESTAMP WITH TIME ZONE NOT NULL,
  detention_end TIMESTAMP WITH TIME ZONE,
  detention_limit_hours INTEGER NOT NULL DEFAULT 73,
  notes TEXT,
  created_by UUID REFERENCES officers(id),
  assigned_officer UUID REFERENCES officers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE criminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_suspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE detention_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bail_records ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Public read access" ON stations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON officers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON cases FOR SELECT USING (true);
CREATE POLICY "Public read access" ON criminals FOR SELECT USING (true);
CREATE POLICY "Public read access" ON case_suspects FOR SELECT USING (true);
CREATE POLICY "Public read access" ON evidence FOR SELECT USING (true);
CREATE POLICY "Public read access" ON resources FOR SELECT USING (true);
CREATE POLICY "Public read access" ON maintenance_records FOR SELECT USING (true);
CREATE POLICY "Public read access" ON reports FOR SELECT USING (true);
CREATE POLICY "Public read access" ON emergency_calls FOR SELECT USING (true);
CREATE POLICY "Public read access" ON detention_records FOR SELECT USING (true);
CREATE POLICY "Public read access" ON bail_records FOR SELECT USING (true);

-- Create policies for insert/update/delete (for demo purposes)
CREATE POLICY "Public insert access" ON stations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON stations FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON stations FOR DELETE USING (true);

CREATE POLICY "Public insert access" ON officers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON officers FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON officers FOR DELETE USING (true);

CREATE POLICY "Public insert access" ON cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON cases FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON cases FOR DELETE USING (true);

CREATE POLICY "Public insert access" ON criminals FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON criminals FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON criminals FOR DELETE USING (true);

CREATE POLICY "Public insert access" ON case_suspects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON case_suspects FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON case_suspects FOR DELETE USING (true);

CREATE POLICY "Public insert access" ON evidence FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON evidence FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON evidence FOR DELETE USING (true);

CREATE POLICY "Public insert access" ON resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON resources FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON resources FOR DELETE USING (true);

CREATE POLICY "Public insert access" ON maintenance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON maintenance_records FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON maintenance_records FOR DELETE USING (true);

CREATE POLICY "Public insert access" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON reports FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON reports FOR DELETE USING (true);

CREATE POLICY "Public insert access" ON emergency_calls FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON emergency_calls FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON emergency_calls FOR DELETE USING (true);

CREATE POLICY "Public insert access" ON detention_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON detention_records FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON detention_records FOR DELETE USING (true);

CREATE POLICY "Public insert access" ON bail_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON bail_records FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON bail_records FOR DELETE USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE stations;
ALTER PUBLICATION supabase_realtime ADD TABLE officers;
ALTER PUBLICATION supabase_realtime ADD TABLE cases;
ALTER PUBLICATION supabase_realtime ADD TABLE criminals;
ALTER PUBLICATION supabase_realtime ADD TABLE case_suspects;
ALTER PUBLICATION supabase_realtime ADD TABLE evidence;
ALTER PUBLICATION supabase_realtime ADD TABLE resources;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE detention_records;
ALTER PUBLICATION supabase_realtime ADD TABLE bail_records;