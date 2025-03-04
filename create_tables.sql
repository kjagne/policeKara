CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role VARCHAR NOT NULL CHECK (role IN ('admin', 'officer', 'analyst')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.officers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  badge VARCHAR NOT NULL,
  rank VARCHAR NOT NULL,
  department VARCHAR NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('active', 'on-leave', 'suspended')),
  performance INTEGER NOT NULL,
  join_date DATE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  address VARCHAR NOT NULL,
  district VARCHAR NOT NULL,
  officers INTEGER NOT NULL,
  vehicles INTEGER NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('open', 'closed', 'pending')),
  date_created DATE NOT NULL,
  last_updated DATE NOT NULL,
  description TEXT NOT NULL,
  assigned_officers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id),
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  date_collected DATE NOT NULL,
  location VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.suspects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES public.cases(id),
  name VARCHAR NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  description TEXT NOT NULL,
  last_known_location VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  description TEXT NOT NULL,
  incident_date DATE NOT NULL,
  location VARCHAR NOT NULL,
  involved_parties TEXT,
  evidence_refs TEXT,
  officer_id VARCHAR NOT NULL,
  department_id VARCHAR NOT NULL,
  submitted_date DATE NOT NULL,
  status VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crime_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  category VARCHAR NOT NULL,
  count INTEGER NOT NULL,
  region VARCHAR NOT NULL,
  time_of_day VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  last_updated DATE NOT NULL,
  size VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  description TEXT,
  source VARCHAR,
  format VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crime_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

-- Create policies for development (open access)
CREATE POLICY Allow full access to all users ON public.profiles FOR ALL USING (true);
CREATE POLICY Allow full access to all users ON public.officers FOR ALL USING (true);
CREATE POLICY Allow full access to all users ON public.stations FOR ALL USING (true);
CREATE POLICY Allow full access to all users ON public.cases FOR ALL USING (true);
CREATE POLICY Allow full access to all users ON public.evidence FOR ALL USING (true);
CREATE POLICY Allow full access to all users ON public.suspects FOR ALL USING (true);
CREATE POLICY Allow full access to all users ON public.reports FOR ALL USING (true);
CREATE POLICY Allow full access to all users ON public.crime_statistics FOR ALL USING (true);
CREATE POLICY Allow full access to all users ON public.datasets FOR ALL USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.officers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.evidence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.suspects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crime_statistics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.datasets;

