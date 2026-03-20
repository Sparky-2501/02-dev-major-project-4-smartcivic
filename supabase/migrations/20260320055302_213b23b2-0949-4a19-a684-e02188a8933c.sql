
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'citizen', 'authority');

-- Create enum for authority domains
CREATE TYPE public.authority_domain AS ENUM (
  'road_department',
  'garbage_management',
  'water_supply',
  'electricity',
  'traffic_department',
  'animal_control',
  'public_infrastructure'
);

-- Create enum for issue status
CREATE TYPE public.issue_status AS ENUM ('reported', 'in_progress', 'resolved');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles per security best practices)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  domain authority_domain,
  UNIQUE (user_id, role)
);

-- Create issues table
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  domain authority_domain NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  status issue_status NOT NULL DEFAULT 'reported',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  proof_image_url TEXT,
  upvote_count INTEGER NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create issue_upvotes table for tracking who upvoted
CREATE TABLE public.issue_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (issue_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_upvotes ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user's domain
CREATE OR REPLACE FUNCTION public.get_user_domain(_user_id UUID)
RETURNS authority_domain
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT domain FROM public.user_roles
  WHERE user_id = _user_id AND role = 'authority'
  LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own role during signup" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id AND role != 'admin');

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Issues policies
CREATE POLICY "Anyone authenticated can view issues" ON public.issues
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Citizens can create issues" ON public.issues
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND public.has_role(auth.uid(), 'citizen')
  );

CREATE POLICY "Authorities can update issues in their domain" ON public.issues
  FOR UPDATE USING (
    (public.has_role(auth.uid(), 'authority') AND domain = public.get_user_domain(auth.uid()))
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can do everything with issues" ON public.issues
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Issue upvotes policies
CREATE POLICY "Authenticated can view upvotes" ON public.issue_upvotes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Citizens can upvote" ON public.issue_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own upvote" ON public.issue_upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-set priority when upvote_count >= 10
CREATE OR REPLACE FUNCTION public.update_issue_priority()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.issues
  SET priority = CASE WHEN (SELECT COUNT(*) FROM public.issue_upvotes WHERE issue_id = NEW.issue_id) >= 10 THEN 'high' ELSE 'normal' END,
      upvote_count = (SELECT COUNT(*) FROM public.issue_upvotes WHERE issue_id = NEW.issue_id)
  WHERE id = NEW.issue_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_priority_on_upvote
  AFTER INSERT OR DELETE ON public.issue_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.update_issue_priority();

-- Create handle_new_user function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
