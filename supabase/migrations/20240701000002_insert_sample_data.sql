-- Insert sample data for The Gambia police system

-- Sample stations
INSERT INTO stations (name, address, district, officers, vehicles, status)
VALUES
  ('Banjul Central Police Station', 'Independence Drive, Banjul', 'Banjul', 45, 12, 'active'),
  ('Serrekunda Police Station', 'Serrekunda Market Road, Serrekunda', 'Kanifing', 32, 8, 'active'),
  ('Bakau Police Station', 'Atlantic Road, Bakau', 'Bakau', 28, 6, 'maintenance'),
  ('Brikama Police Station', 'Brikama Highway, Brikama', 'West Coast', 30, 7, 'active'),
  ('Farafenni Police Station', 'Main Street, Farafenni', 'North Bank', 15, 4, 'active');

-- Sample officers
INSERT INTO officers (badge_number, first_name, last_name, rank, status, contact_number, email)
VALUES
  ('GPF-1001', 'Modou', 'Jallow', 'Inspector', 'active', '+220 7123456', 'modou.jallow@police.gov.gm'),
  ('GPF-1002', 'Fatou', 'Ceesay', 'Sergeant', 'active', '+220 7234567', 'fatou.ceesay@police.gov.gm'),
  ('GPF-1003', 'Lamin', 'Sanneh', 'Constable', 'active', '+220 7345678', 'lamin.sanneh@police.gov.gm'),
  ('GPF-1004', 'Isatou', 'Touray', 'Inspector', 'active', '+220 7456789', 'isatou.touray@police.gov.gm'),
  ('GPF-1005', 'Omar', 'Bah', 'Sergeant', 'active', '+220 7567890', 'omar.bah@police.gov.gm'),
  ('GPF-1006', 'Mariama', 'Jammeh', 'Constable', 'active', '+220 7678901', 'mariama.jammeh@police.gov.gm'),
  ('GPF-1007', 'Ebrima', 'Jobe', 'Constable', 'active', '+220 7789012', 'ebrima.jobe@police.gov.gm'),
  ('GPF-1008', 'Awa', 'Njie', 'Sergeant', 'active', '+220 7890123', 'awa.njie@police.gov.gm');

-- Sample cases
INSERT INTO cases (title, description, status, date_created, last_updated, assigned_officers)
VALUES
  ('Market Theft Investigation', 'Investigation of multiple thefts at Serrekunda Market', 'open', '2023-06-15', '2023-07-01', '["GPF-1001", "GPF-1003"]'),
  ('Traffic Accident on Banjul Highway', 'Multi-vehicle collision near Westfield Junction', 'open', '2023-06-20', '2023-06-25', '["GPF-1002", "GPF-1005"]'),
  ('Residential Burglary in Bakau', 'Break-in at residence on Atlantic Road', 'pending', '2023-06-10', '2023-06-30', '["GPF-1004"]'),
  ('Assault Case at Senegambia Strip', 'Physical altercation outside nightclub', 'closed', '2023-05-20', '2023-06-15', '["GPF-1006", "GPF-1007"]'),
  ('Drug Trafficking Investigation', 'Suspected drug smuggling at Banjul Port', 'open', '2023-06-01', '2023-07-02', '["GPF-1001", "GPF-1008"]');

-- Sample evidence
INSERT INTO evidence (case_id, name, type, date_collected, location, status, description)
VALUES
  ((SELECT id FROM cases WHERE title = 'Market Theft Investigation' LIMIT 1), 'Security Camera Footage', 'Video', '2023-06-16', 'Serrekunda Market', 'processing', 'CCTV footage from market entrance'),
  ((SELECT id FROM cases WHERE title = 'Market Theft Investigation' LIMIT 1), 'Fingerprints', 'Forensic', '2023-06-17', 'Stall #23', 'analyzed', 'Fingerprints from cash register'),
  ((SELECT id FROM cases WHERE title = 'Traffic Accident on Banjul Highway' LIMIT 1), 'Vehicle Debris', 'Physical', '2023-06-20', 'Westfield Junction', 'collected', 'Debris from accident scene'),
  ((SELECT id FROM cases WHERE title = 'Residential Burglary in Bakau' LIMIT 1), 'Door Lock', 'Physical', '2023-06-11', 'Victim residence', 'analyzed', 'Damaged lock from front door'),
  ((SELECT id FROM cases WHERE title = 'Assault Case at Senegambia Strip' LIMIT 1), 'Witness Statements', 'Document', '2023-05-21', 'Senegambia Strip', 'processed', 'Statements from three witnesses');

-- Sample suspects
INSERT INTO suspects (case_id, name, age, gender, status, description, last_known_location)
VALUES
  ((SELECT id FROM cases WHERE title = 'Market Theft Investigation' LIMIT 1), 'Unknown Suspect', 25, 'Male', 'wanted', 'Approximately 5'10", slim build, wearing dark clothing', 'Serrekunda area'),
  ((SELECT id FROM cases WHERE title = 'Residential Burglary in Bakau' LIMIT 1), 'John Doe', 30, 'Male', 'under investigation', 'Medium build, has a distinctive scar on left cheek', 'Bakau New Town'),
  ((SELECT id FROM cases WHERE title = 'Assault Case at Senegambia Strip' LIMIT 1), 'James Smith', 28, 'Male', 'in custody', 'Tourist from UK, staying at Kairaba Hotel', 'Kololi'),
  ((SELECT id FROM cases WHERE title = 'Drug Trafficking Investigation' LIMIT 1), 'Unknown Female', 35, 'Female', 'wanted', 'Approximately 5'6", heavy build, traveling with blue luggage', 'Banjul Port area');

-- Sample reports
INSERT INTO reports (title, type, description, incident_date, location, officer_id, department_id, submitted_date, status)
VALUES
  ('Weekly Patrol Report - Serrekunda', 'Summary', 'Summary of patrol activities in Serrekunda area', '2023-06-30', 'Serrekunda', 'GPF-1001', 'DEPT-001', '2023-07-01', 'approved'),
  ('Traffic Accident Investigation Report', 'Incident', 'Detailed report of multi-vehicle collision investigation', '2023-06-20', 'Westfield Junction', 'GPF-1002', 'DEPT-001', '2023-06-25', 'pending review'),
  ('Burglary Evidence Collection Report', 'Evidence', 'Documentation of evidence collected at burglary scene', '2023-06-11', 'Bakau', 'GPF-1004', 'DEPT-001', '2023-06-12', 'approved'),
  ('Monthly Crime Statistics - Banjul', 'Summary', 'Monthly compilation of crime incidents in Banjul', '2023-06-30', 'Banjul', 'GPF-1008', 'DEPT-001', '2023-07-02', 'pending review'),
  ('Assault Case Witness Interview', 'Investigation', 'Transcript of witness interviews for assault case', '2023-05-22', 'Senegambia', 'GPF-1006', 'DEPT-001', '2023-05-23', 'approved');

-- Sample crime statistics
INSERT INTO crime_statistics (date, region, category, count, time_of_day)
VALUES
  ('2023-06-01', 'Banjul', 'Theft', 12, 'Evening'),
  ('2023-06-01', 'Serrekunda', 'Theft', 18, 'Evening'),
  ('2023-06-01', 'Bakau', 'Theft', 8, 'Night'),
  ('2023-06-01', 'Brikama', 'Theft', 10, 'Afternoon'),
  ('2023-06-01', 'Banjul', 'Assault', 5, 'Night'),
  ('2023-06-01', 'Serrekunda', 'Assault', 9, 'Night'),
  ('2023-06-01', 'Bakau', 'Assault', 4, 'Evening'),
  ('2023-06-01', 'Banjul', 'Burglary', 7, 'Night'),
  ('2023-06-01', 'Serrekunda', 'Burglary', 11, 'Night'),
  ('2023-06-01', 'Bakau', 'Burglary', 6, 'Night'),
  ('2023-06-01', 'Banjul', 'Drug Offenses', 3, 'Afternoon'),
  ('2023-06-01', 'Serrekunda', 'Drug Offenses', 6, 'Evening'),
  ('2023-06-01', 'Banjul', 'Fraud', 4, 'Afternoon'),
  ('2023-06-01', 'Serrekunda', 'Fraud', 5, 'Morning');

-- Sample datasets
INSERT INTO datasets (name, type, lastUpdated, size, description)
VALUES
  ('Crime Records 2023', 'Historical', '2023-06-30', '1.2 GB', 'Comprehensive crime records for The Gambia in 2023'),
  ('Officer Performance Data', 'Performance', '2023-06-25', '450 MB', 'Performance metrics for all officers'),
  ('Resource Allocation Metrics', 'Resource', '2023-06-28', '320 MB', 'Data on resource distribution across stations'),
  ('Patrol Patterns 2020-2023', 'Historical', '2023-06-15', '2.1 GB', 'Historical patrol routes and effectiveness analysis'),
  ('Emergency Response Times', 'Performance', '2023-06-29', '780 MB', 'Response time data for emergency calls');

-- Sample emergency calls
INSERT INTO emergency_calls (call_time, caller_name, caller_phone, location, description, priority, status)
VALUES
  ('2023-07-01 08:15:00+00', 'Abdou Sowe', '+220 7123123', 'Serrekunda Market', 'Reported theft in progress', 'High', 'assigned'),
  ('2023-07-01 09:30:00+00', 'Fatima Bah', '+220 7234234', 'Kairaba Avenue', 'Traffic accident with injuries', 'High', 'assigned'),
  ('2023-07-01 10:45:00+00', 'Anonymous', NULL, 'Bakau Beach', 'Suspicious activity near tourist area', 'Medium', 'pending'),
  ('2023-07-01 12:00:00+00', 'Ibrahim Jallow', '+220 7345345', 'Banjul Ferry Terminal', 'Lost child', 'High', 'assigned'),
  ('2023-07-01 14:30:00+00', 'Amie Ceesay', '+220 7456456', 'Westfield Junction', 'Traffic signal malfunction causing congestion', 'Medium', 'pending');

-- Sample emergency units
INSERT INTO emergency_units (unit_name, unit_type, status, current_location, assigned_call_id)
VALUES
  ('Patrol Unit 1', 'Patrol', 'assigned', 'Serrekunda', (SELECT id FROM emergency_calls WHERE caller_name = 'Abdou Sowe' LIMIT 1)),
  ('Patrol Unit 2', 'Patrol', 'assigned', 'Kairaba Avenue', (SELECT id FROM emergency_calls WHERE caller_name = 'Fatima Bah' LIMIT 1)),
  ('Patrol Unit 3', 'Patrol', 'available', 'Banjul Central', NULL),
  ('Emergency Response 1', 'Emergency', 'assigned', 'Banjul Ferry Terminal', (SELECT id FROM emergency_calls WHERE caller_name = 'Ibrahim Jallow' LIMIT 1)),
  ('Emergency Response 2', 'Emergency', 'available', 'Bakau Station', NULL);
