-- Create emergency_calls table if it doesn't exist
CREATE TABLE IF NOT EXISTS emergency_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caller_name TEXT NOT NULL,
  caller_phone TEXT NOT NULL,
  location TEXT NOT NULL,
  nature TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'dispatched', 'resolved', 'cancelled')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_unit TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create response_units table if it doesn't exist
CREATE TABLE IF NOT EXISTS response_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('patrol', 'ambulance', 'fire', 'tactical')),
  status TEXT NOT NULL CHECK (status IN ('available', 'responding', 'busy', 'out-of-service')),
  location TEXT,
  officers INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for these tables
alter publication supabase_realtime add table emergency_calls;
alter publication supabase_realtime add table response_units;

-- Insert sample emergency calls
INSERT INTO emergency_calls (caller_name, caller_phone, location, nature, priority, status, timestamp, assigned_unit, notes)
VALUES
  ('John Doe', '+2207654321', 'Serrekunda Market, Kanifing', 'Robbery in progress', 'high', 'pending', NOW() - INTERVAL '5 minutes', NULL, NULL),
  ('Jane Smith', '+2207123456', 'Westfield Junction, Serrekunda', 'Traffic accident with injuries', 'medium', 'dispatched', NOW() - INTERVAL '15 minutes', 'Patrol-02', NULL),
  ('Mohammed Jallow', '+2207891234', 'Banjul Ferry Terminal', 'Suspicious package', 'medium', 'dispatched', NOW() - INTERVAL '25 minutes', 'Tactical-01', NULL),
  ('Fatou Ceesay', '+2207345678', 'Senegambia Strip, Kololi', 'Assault', 'high', 'resolved', NOW() - INTERVAL '1 hour', 'Patrol-01', 'Suspect apprehended, victim taken to hospital'),
  ('Lamin Sanneh', '+2207234567', 'Bakau Beach', 'Drowning', 'high', 'resolved', NOW() - INTERVAL '1.5 hours', 'Ambulance-01', 'Victim rescued and given medical attention');

-- Insert sample response units
INSERT INTO response_units (name, type, status, location, officers, last_updated)
VALUES
  ('Patrol-01', 'patrol', 'available', 'Banjul Central', 2, NOW() - INTERVAL '5 minutes'),
  ('Patrol-02', 'patrol', 'responding', 'Westfield Junction', 2, NOW() - INTERVAL '15 minutes'),
  ('Tactical-01', 'tactical', 'responding', 'Banjul Ferry Terminal', 4, NOW() - INTERVAL '25 minutes'),
  ('Ambulance-01', 'ambulance', 'available', 'Serrekunda General Hospital', 2, NOW() - INTERVAL '35 minutes'),
  ('Fire-01', 'fire', 'out-of-service', 'Banjul Fire Station', 4, NOW() - INTERVAL '2 hours');
