-- Insert sample stations
INSERT INTO stations (name, address, district, officers, vehicles, status)
VALUES
  ('Central Police Station', '123 Main Street, Downtown', 'Central', 45, 12, 'active'),
  ('Northside Precinct', '789 North Avenue, Northside', 'North', 32, 8, 'active'),
  ('Eastside Station', '456 East Boulevard, Eastside', 'East', 28, 6, 'maintenance'),
  ('Westside Outpost', '321 West Road, Westside', 'West', 15, 4, 'inactive')
ON CONFLICT DO NOTHING;

-- Insert sample officers
INSERT INTO officers (name, badge, rank, department, status, performance, join_date)
VALUES
  ('John Smith', 'PD-5421', 'Officer', 'Patrol', 'active', 85, '2020-06-15'),
  ('Maria Rodriguez', 'PD-6234', 'Sergeant', 'Detective', 'active', 92, '2018-03-22'),
  ('David Chen', 'PD-7845', 'Officer', 'K-9 Unit', 'active', 78, '2021-01-10'),
  ('Sarah Johnson', 'PD-4532', 'Lieutenant', 'SWAT', 'on-leave', 88, '2015-11-05'),
  ('Michael Brown', 'PD-3217', 'Officer', 'Traffic', 'active', 72, '2022-05-18')
ON CONFLICT DO NOTHING;

-- Insert sample cases
INSERT INTO cases (title, description, status, date_created, last_updated, assigned_officers)
VALUES
  ('Robbery Investigation', 'Convenience store robbery on Main Street', 'open', '2023-06-10', '2023-06-15', '["John Smith", "Maria Rodriguez"]'),
  ('Vehicle Theft', 'Car stolen from downtown parking garage', 'open', '2023-06-12', '2023-06-14', '["David Chen"]'),
  ('Vandalism Report', 'Graffiti on public buildings in Westside', 'pending', '2023-06-08', '2023-06-13', '["Michael Brown"]'),
  ('Assault Case', 'Bar fight resulting in injuries', 'closed', '2023-05-28', '2023-06-05', '["Sarah Johnson", "John Smith"]')
ON CONFLICT DO NOTHING;

-- Insert sample evidence
INSERT INTO evidence (case_id, name, type, date_collected, location, status, description)
SELECT
  c.id,
  'Security Footage',
  'Video',
  '2023-06-10',
  'Main Street Store',
  'collected',
  'CCTV footage showing suspect entering the store'
FROM cases c
WHERE c.title = 'Robbery Investigation'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO evidence (case_id, name, type, date_collected, location, status, description)
SELECT
  c.id,
  'Fingerprints',
  'Forensic',
  '2023-06-12',
  'Vehicle Door Handle',
  'analyzing',
  'Fingerprints lifted from driver side door handle'
FROM cases c
WHERE c.title = 'Vehicle Theft'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample suspects
INSERT INTO suspects (case_id, name, age, gender, status, description, last_known_location)
SELECT
  c.id,
  'John Doe',
  32,
  'Male',
  'wanted',
  'Approximately 6ft tall, wearing dark clothing and a mask',
  'Last seen heading east on Main Street'
FROM cases c
WHERE c.title = 'Robbery Investigation'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO suspects (case_id, name, age, gender, status, description, last_known_location)
SELECT
  c.id,
  'Jane Smith',
  28,
  'Female',
  'under investigation',
  'Blonde hair, medium build, tattoo on right arm',
  'Northside apartment complex'
FROM cases c
WHERE c.title = 'Assault Case'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample crime statistics
INSERT INTO crime_statistics (date, category, count, region, time_of_day)
VALUES
  ('2023-06-01', 'Theft', 12, 'Downtown', 'Evening'),
  ('2023-06-01', 'Assault', 5, 'Downtown', 'Night'),
  ('2023-06-01', 'Vandalism', 8, 'Northside', 'Night'),
  ('2023-06-02', 'Theft', 9, 'Eastside', 'Afternoon'),
  ('2023-06-02', 'Drug Offenses', 6, 'Westside', 'Evening'),
  ('2023-06-03', 'Burglary', 4, 'Northside', 'Night'),
  ('2023-06-03', 'Theft', 11, 'Downtown', 'Afternoon'),
  ('2023-06-04', 'Assault', 7, 'Westside', 'Night'),
  ('2023-06-04', 'Fraud', 3, 'Eastside', 'Morning')
ON CONFLICT DO NOTHING;

-- Insert sample emergency calls
INSERT INTO emergency_calls (caller_name, phone_number, location, description, priority, status, created_at)
VALUES
  ('John Smith', '555-123-4567', '123 Main St, Downtown', 'Reported break-in at a convenience store', 'high', 'pending', NOW() - INTERVAL '30 minutes'),
  ('Mary Johnson', '555-987-6543', '456 Oak Ave, Northside', 'Traffic accident with injuries', 'high', 'dispatched', NOW() - INTERVAL '1 hour'),
  ('Robert Davis', '555-456-7890', '789 Pine Rd, Westside', 'Suspicious person in the neighborhood', 'medium', 'pending', NOW() - INTERVAL '15 minutes'),
  ('Sarah Wilson', '555-789-0123', '101 Elm St, Eastside', 'Noise complaint from apartment building', 'low', 'resolved', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- Insert sample emergency units
INSERT INTO emergency_units (name, type, status, location, last_updated)
VALUES
  ('Patrol Unit 1', 'patrol', 'available', 'Downtown District', NOW()),
  ('Patrol Unit 2', 'patrol', 'responding', 'En route to 456 Oak Ave', NOW() - INTERVAL '10 minutes'),
  ('Ambulance 1', 'ambulance', 'responding', 'En route to 456 Oak Ave', NOW() - INTERVAL '12 minutes'),
  ('SWAT Team', 'swat', 'available', 'Central Station', NOW() - INTERVAL '45 minutes')
ON CONFLICT DO NOTHING;

-- Insert sample datasets
INSERT INTO datasets (name, last_updated, size, type, description)
VALUES
  ('Crime Records 2023', '2023-12-15', '1.2 GB', 'Historical', 'Annual crime records for statistical analysis'),
  ('Officer Performance Data', '2023-11-30', '450 MB', 'Performance', 'Officer performance metrics and evaluations'),
  ('Resource Allocation Metrics', '2023-12-01', '320 MB', 'Resource', 'Data on resource distribution and utilization'),
  ('Patrol Patterns 2020-2023', '2023-10-15', '2.1 GB', 'Historical', 'Historical patrol routes and effectiveness analysis'),
  ('Emergency Response Times', '2023-12-10', '780 MB', 'Performance', 'Response time data for emergency calls')
ON CONFLICT DO NOTHING;
