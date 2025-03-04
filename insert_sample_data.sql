-- Insert sample data for officers
INSERT INTO public.officers (name, badge, rank, department, status, performance, join_date)
VALUES 
('John Smith', 'B-1234', 'Sergeant', 'Patrol', 'active', 92, '2015-03-12'),
('Maria Rodriguez', 'B-2345', 'Officer', 'K-9 Unit', 'active', 88, '2018-06-23'),
('David Chen', 'B-3456', 'Lieutenant', 'Detective', 'active', 95, '2010-11-05'),
('Sarah Johnson', 'B-4567', 'Officer', 'Traffic', 'on-leave', 78, '2019-02-18'),
('Michael Brown', 'B-5678', 'Officer', 'Patrol', 'active', 82, '2017-09-30'),
('Lisa Wilson', 'B-6789', 'Captain', 'SWAT', 'active', 91, '2008-04-15'),
('Robert Davis', 'B-7890', 'Officer', 'Patrol', 'suspended', 65, '2020-01-10');

-- Insert sample data for stations
INSERT INTO public.stations (name, address, district, officers, vehicles, status)
VALUES
('Central Police Station', '123 Main Street, Downtown', 'Central', 45, 12, 'active'),
('Northside Precinct', '789 North Avenue, Northside', 'North', 32, 8, 'active'),
('Eastside Station', '456 East Boulevard, Eastside', 'East', 28, 6, 'maintenance'),
('Westside Outpost', '321 West Road, Westside', 'West', 15, 4, 'inactive');

-- Insert sample data for cases
INSERT INTO public.cases (title, status, date_created, last_updated, description, assigned_officers)
VALUES
('Downtown Robbery', 'open', '2023-05-15', '2023-06-02', 'Armed robbery at First National Bank on Main Street', '[Officer Johnson, Detective Smith]'),
('Vehicle Theft', 'pending', '2023-05-20', '2023-05-25', 'Stolen vehicle reported at Westside Mall parking lot', '[Officer Williams]'),
('Residential Burglary', 'closed', '2023-04-10', '2023-05-30', 'Break-in at 123 Oak Street, jewelry and electronics stolen', '[Detective Brown, Officer Davis]');

-- Insert sample data for evidence
INSERT INTO public.evidence (case_id, name, type, date_collected, location, status, description)
VALUES
((SELECT id FROM public.cases WHERE title = 'Downtown Robbery' LIMIT 1), 'Security Camera Footage', 'Video', '2023-05-15', 'Bank Vault', 'Processing', 'CCTV footage showing suspect entering the bank'),
((SELECT id FROM public.cases WHERE title = 'Downtown Robbery' LIMIT 1), 'Fingerprints', 'Physical', '2023-05-15', 'Counter Surface', 'Analyzed', 'Partial fingerprints found on the counter'),
((SELECT id FROM public.cases WHERE title = 'Vehicle Theft' LIMIT 1), 'Tire Marks', 'Physical', '2023-05-20', 'Parking Lot', 'Collected', 'Tire marks found at the scene');

-- Insert sample data for suspects
INSERT INTO public.suspects (case_id, name, age, gender, status, description, last_known_location)
VALUES
((SELECT id FROM public.cases WHERE title = 'Downtown Robbery' LIMIT 1), 'John Doe', 32, 'Male', 'Wanted', 'Approximately 6ft tall, medium build, last seen wearing a black hoodie', 'Downtown area'),
((SELECT id FROM public.cases WHERE title = 'Vehicle Theft' LIMIT 1), 'Jane Smith', 28, 'Female', 'Under Investigation', 'Blonde hair, slim build, tattoo on right arm', 'Westside Apartments');

-- Insert sample data for reports
INSERT INTO public.reports (title, type, description, incident_date, location, involved_parties, evidence_refs, officer_id, department_id, submitted_date, status)
VALUES
('Robbery Investigation Report', 'Investigation', 'Detailed report of the downtown bank robbery investigation', '2023-05-15', '123 Main Street', 'John Doe, Bank Staff', 'E-001, E-002', 'OFF-123', 'DEPT-001', '2023-05-15', 'Approved'),
('Traffic Incident Report', 'Incident', 'Report of a traffic accident at Main and 5th', '2023-06-22', 'Main St & 5th Ave', 'Multiple Drivers', 'None', 'OFF-123', 'DEPT-001', '2023-06-22', 'Pending Review'),
('Monthly Patrol Summary', 'Summary', 'Summary of patrol activities for June 2023', '2023-07-01', 'Downtown District', 'Patrol Officers', 'None', 'OFF-123', 'DEPT-001', '2023-07-01', 'Approved');

-- Insert sample data for crime statistics
INSERT INTO public.crime_statistics (date, category, count, region, time_of_day)
VALUES
('2023-06-01', 'Theft', 24, 'Downtown', 'Evening'),
('2023-06-01', 'Assault', 12, 'Downtown', 'Night'),
('2023-06-01', 'Burglary', 8, 'North District', 'Night'),
('2023-06-01', 'Vandalism', 15, 'East District', 'Evening'),
('2023-06-01', 'Drug Offenses', 10, 'West District', 'Afternoon');

-- Insert sample data for datasets
INSERT INTO public.datasets (name, last_updated, size, type, description)
VALUES
('Crime Records 2023', '2023-12-15', '1.2 GB', 'Historical', 'Comprehensive crime records for the year 2023'),
('Officer Performance Data', '2023-11-30', '450 MB', 'Performance', 'Performance metrics for all officers'),
('Resource Allocation Metrics', '2023-12-01', '320 MB', 'Resource', 'Data on resource allocation across districts'),
('Patrol Patterns 2020-2023', '2023-10-15', '2.1 GB', 'Historical', 'Historical patrol patterns over 3 years'),
('Emergency Response Times', '2023-12-10', '780 MB', 'Performance', 'Response time data for emergency calls');

