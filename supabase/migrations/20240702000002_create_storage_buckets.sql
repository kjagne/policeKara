-- Create storage buckets for case files and recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('case-files', 'case-files', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('case-recordings', 'case-recordings', true);

-- Set up security policies for the buckets
CREATE POLICY "Case files are publicly accessible" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'case-files');

CREATE POLICY "Anyone can upload case files" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'case-files');

CREATE POLICY "Case recordings are publicly accessible" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'case-recordings');

CREATE POLICY "Anyone can upload case recordings" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'case-recordings');
