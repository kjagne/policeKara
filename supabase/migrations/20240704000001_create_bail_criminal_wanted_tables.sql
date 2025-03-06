-- Create criminals table
CREATE TABLE IF NOT EXISTS criminals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  dob DATE,
  gender VARCHAR(20),
  national_id VARCHAR(100) UNIQUE,
  passport_number VARCHAR(100),
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(100),
  mugshot_url TEXT,
  fingerprint_data TEXT,
  known_associates JSONB,
  gang_affiliation VARCHAR(100),
  bio TEXT,
  current_status VARCHAR(50) CHECK (current_status IN ('At Large', 'In Custody', 'Released', 'Deceased')),
  arrest_history JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bail_records table
CREATE TABLE IF NOT EXISTS bail_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  suspect_id UUID NOT NULL REFERENCES criminals(id) ON DELETE CASCADE,
  bail_amount DECIMAL NOT NULL,
  bail_type VARCHAR(50) NOT NULL CHECK (bail_type IN ('Cash', 'Property', 'Surety', 'Recognizance')),
  bailer_name VARCHAR(255) NOT NULL,
  bailer_contact VARCHAR(100) NOT NULL,
  bailer_relationship VARCHAR(100),
  bailer_address TEXT,
  bailer_id_type VARCHAR(50),
  bailer_id_number VARCHAR(100),
  status VARCHAR(50) NOT NULL CHECK (status IN ('Pending', 'Approved', 'Denied', 'Revoked', 'Completed')),
  court_date TIMESTAMP WITH TIME ZONE,
  detention_start TIMESTAMP WITH TIME ZONE NOT NULL,
  detention_end TIMESTAMP WITH TIME ZONE,
  detention_limit_hours INTEGER DEFAULT 73,
  notes TEXT,
  created_by UUID REFERENCES officers(id),
  assigned_officer UUID REFERENCES officers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wanted_criminals table
CREATE TABLE IF NOT EXISTS wanted_criminals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  criminal_id UUID NOT NULL REFERENCES criminals(id) ON DELETE CASCADE,
  crimes_committed TEXT NOT NULL,
  last_seen_location TEXT,
  last_seen_date TIMESTAMP WITH TIME ZONE,
  danger_level VARCHAR(20) CHECK (danger_level IN ('Low', 'Medium', 'High', 'Extreme')),
  bounty DECIMAL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Wanted', 'Captured')),
  priority INTEGER DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES officers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create criminal_cases link table
CREATE TABLE IF NOT EXISTS criminal_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  criminal_id UUID NOT NULL REFERENCES criminals(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  role VARCHAR(50) CHECK (role IN ('Suspect', 'Witness', 'Victim', 'Person of Interest')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(criminal_id, case_id)
);

-- Create detention_records table
CREATE TABLE IF NOT EXISTS detention_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  criminal_id UUID NOT NULL REFERENCES criminals(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  cell_number VARCHAR(50),
  station_id UUID REFERENCES stations(id) ON DELETE SET NULL,
  detention_start TIMESTAMP WITH TIME ZONE NOT NULL,
  detention_end TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) CHECK (status IN ('Active', 'Released', 'Transferred', 'Escaped')),
  release_reason VARCHAR(100),
  arresting_officer UUID REFERENCES officers(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create criminal_files table for storing documents related to criminals
CREATE TABLE IF NOT EXISTS criminal_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  criminal_id UUID NOT NULL REFERENCES criminals(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  file_url TEXT NOT NULL,
  file_category VARCHAR(50) CHECK (file_category IN ('Mugshot', 'Fingerprint', 'DNA', 'Document', 'Video', 'Other')),
  description TEXT,
  uploaded_by UUID REFERENCES officers(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add realtime support for all tables
alter publication supabase_realtime add table criminals;
alter publication supabase_realtime add table bail_records;
alter publication supabase_realtime add table wanted_criminals;
alter publication supabase_realtime add table criminal_cases;
alter publication supabase_realtime add table detention_records;
alter publication supabase_realtime add table criminal_files;
