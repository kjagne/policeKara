-- Create bail_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS bail_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id),
  suspect_id UUID REFERENCES criminals(id),
  bail_amount DECIMAL(10, 2) NOT NULL,
  bail_type TEXT NOT NULL CHECK (bail_type IN ('Cash', 'Property', 'Surety', 'Recognizance')),
  bailer_name TEXT NOT NULL,
  bailer_contact TEXT NOT NULL,
  bailer_relationship TEXT,
  bailer_address TEXT,
  bailer_id_type TEXT,
  bailer_id_number TEXT,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Approved', 'Denied', 'Revoked', 'Completed')),
  court_date TIMESTAMP WITH TIME ZONE,
  detention_start TIMESTAMP WITH TIME ZONE NOT NULL,
  detention_end TIMESTAMP WITH TIME ZONE,
  detention_limit_hours INTEGER NOT NULL DEFAULT 73,
  notes TEXT,
  created_by UUID REFERENCES officers(id),
  assigned_officer UUID REFERENCES officers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create detention_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS detention_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  criminal_id UUID NOT NULL REFERENCES criminals(id),
  case_id UUID REFERENCES cases(id),
  cell_number TEXT,
  station_id UUID REFERENCES stations(id),
  detention_start TIMESTAMP WITH TIME ZONE NOT NULL,
  detention_end TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Released', 'Transferred', 'Escaped')),
  release_reason TEXT,
  arresting_officer UUID REFERENCES officers(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for these tables
alter publication supabase_realtime add table bail_records;
alter publication supabase_realtime add table detention_records;

-- Create sample data for bail_records
INSERT INTO bail_records (case_id, suspect_id, bail_amount, bail_type, bailer_name, bailer_contact, status, detention_start, created_by)
SELECT 
  (SELECT id FROM cases ORDER BY RANDOM() LIMIT 1),
  (SELECT id FROM criminals ORDER BY RANDOM() LIMIT 1),
  FLOOR(RANDOM() * 10000 + 1000)::DECIMAL,
  (ARRAY['Cash', 'Property', 'Surety', 'Recognizance'])[FLOOR(RANDOM() * 4 + 1)],
  'Bailer ' || i,
  '+220' || LPAD(FLOOR(RANDOM() * 10000000)::TEXT, 7, '0'),
  (ARRAY['Pending', 'Approved', 'Denied', 'Completed'])[FLOOR(RANDOM() * 4 + 1)],
  NOW() - (INTERVAL '1 day' * FLOOR(RANDOM() * 10)),
  (SELECT id FROM officers ORDER BY RANDOM() LIMIT 1)
FROM generate_series(1, 10) i;

-- Create sample data for detention_records
INSERT INTO detention_records (criminal_id, case_id, cell_number, station_id, detention_start, status, arresting_officer)
SELECT 
  (SELECT id FROM criminals ORDER BY RANDOM() LIMIT 1),
  (SELECT id FROM cases ORDER BY RANDOM() LIMIT 1),
  'Cell-' || LPAD(FLOOR(RANDOM() * 100)::TEXT, 3, '0'),
  (SELECT id FROM stations ORDER BY RANDOM() LIMIT 1),
  NOW() - (INTERVAL '1 day' * FLOOR(RANDOM() * 5)),
  (ARRAY['Active', 'Released', 'Transferred'])[FLOOR(RANDOM() * 3 + 1)],
  (SELECT id FROM officers ORDER BY RANDOM() LIMIT 1)
FROM generate_series(1, 15) i;

-- Create some detention records that are approaching the 73-hour limit
INSERT INTO detention_records (criminal_id, case_id, cell_number, station_id, detention_start, status, arresting_officer)
SELECT 
  (SELECT id FROM criminals ORDER BY RANDOM() LIMIT 1),
  (SELECT id FROM cases ORDER BY RANDOM() LIMIT 1),
  'Cell-' || LPAD(FLOOR(RANDOM() * 100)::TEXT, 3, '0'),
  (SELECT id FROM stations ORDER BY RANDOM() LIMIT 1),
  NOW() - (INTERVAL '1 hour' * 65),  -- About 8 hours remaining
  'Active',
  (SELECT id FROM officers ORDER BY RANDOM() LIMIT 1)
FROM generate_series(1, 3) i;

-- Create some detention records that have exceeded the 73-hour limit
INSERT INTO detention_records (criminal_id, case_id, cell_number, station_id, detention_start, status, arresting_officer)
SELECT 
  (SELECT id FROM criminals ORDER BY RANDOM() LIMIT 1),
  (SELECT id FROM cases ORDER BY RANDOM() LIMIT 1),
  'Cell-' || LPAD(FLOOR(RANDOM() * 100)::TEXT, 3, '0'),
  (SELECT id FROM stations ORDER BY RANDOM() LIMIT 1),
  NOW() - (INTERVAL '1 hour' * 80),  -- 7 hours past limit
  'Active',
  (SELECT id FROM officers ORDER BY RANDOM() LIMIT 1)
FROM generate_series(1, 2) i;
