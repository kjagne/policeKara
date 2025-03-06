-- Create statements table
CREATE TABLE IF NOT EXISTS statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  person_type VARCHAR(20) NOT NULL CHECK (person_type IN ('suspect', 'victim', 'witness')),
  person_id UUID,
  statement_text TEXT,
  recording_url TEXT,
  recording_filename TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES officers(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create persons table for statement subjects
CREATE TABLE IF NOT EXISTS persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  id_type VARCHAR(50),
  id_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case_files table for file attachments
CREATE TABLE IF NOT EXISTS case_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  file_url TEXT NOT NULL,
  description TEXT,
  uploaded_by UUID REFERENCES officers(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case_evidence table
CREATE TABLE IF NOT EXISTS case_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  evidence_type VARCHAR(100) NOT NULL,
  description TEXT,
  location_found TEXT,
  found_date TIMESTAMP WITH TIME ZONE,
  chain_of_custody JSONB,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_by UUID REFERENCES officers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add realtime support for all tables
alter publication supabase_realtime add table statements;
alter publication supabase_realtime add table persons;
alter publication supabase_realtime add table case_files;
alter publication supabase_realtime add table case_evidence;
