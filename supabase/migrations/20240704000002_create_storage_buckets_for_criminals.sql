-- Create storage buckets for criminal files, mugshots, and fingerprints
INSERT INTO storage.buckets (id, name, public) VALUES ('criminal-files', 'criminal-files', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('mugshots', 'mugshots', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('fingerprints', 'fingerprints', true);

-- Set up security policies for the buckets
CREATE POLICY "Criminal files are publicly accessible" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'criminal-files');

CREATE POLICY "Anyone can upload criminal files" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'criminal-files');

CREATE POLICY "Mugshots are publicly accessible" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'mugshots');

CREATE POLICY "Anyone can upload mugshots" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'mugshots');

CREATE POLICY "Fingerprints are publicly accessible" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'fingerprints');

CREATE POLICY "Anyone can upload fingerprints" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'fingerprints');
