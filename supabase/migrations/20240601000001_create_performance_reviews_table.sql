-- Create performance_reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  officer_id UUID NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES officers(id),
  review_date DATE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT NOT NULL,
  strengths TEXT,
  areas_for_improvement TEXT,
  goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add auth_user_id column to officers table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'officers' AND column_name = 'auth_user_id') THEN
    ALTER TABLE officers ADD COLUMN auth_user_id UUID;
  END IF;
END $$;

-- Enable realtime for performance_reviews
ALTER PUBLICATION supabase_realtime ADD TABLE performance_reviews;