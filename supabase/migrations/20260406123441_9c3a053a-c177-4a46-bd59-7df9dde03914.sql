
-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('owner', 'organizer', 'attendee');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'attendee',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
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

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Owner can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Owner can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Events table
CREATE TABLE public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'autre',
  address TEXT,
  date TEXT,
  time TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  capacity INT,
  description TEXT,
  image TEXT,
  organizer TEXT,
  organizer_id UUID REFERENCES auth.users(id),
  organizer_name TEXT,
  payment_phone TEXT,
  payment_name TEXT,
  payment_operator TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published events are viewable by everyone" ON public.events
  FOR SELECT USING (status = 'published' AND approved = true);

CREATE POLICY "Organizers can view their own events" ON public.events
  FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Owner can manage all events" ON public.events
  FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Tickets table
CREATE TABLE public.tickets (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id),
  event_title TEXT,
  event_date TEXT,
  event_time TEXT,
  event_address TEXT,
  price NUMERIC,
  currency TEXT DEFAULT 'USD',
  organizer_id UUID REFERENCES auth.users(id),
  organizer_name TEXT,
  owner_id UUID REFERENCES auth.users(id),
  owner_name TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  payment_method TEXT,
  payment_phone TEXT,
  tx_ref TEXT,
  proof_image_url TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  validated BOOLEAN DEFAULT false,
  validated_at TIMESTAMPTZ,
  reversal_done BOOLEAN DEFAULT false,
  reversal_tx_ref TEXT,
  reversal_amount NUMERIC,
  reversal_at TIMESTAMPTZ,
  org_pay_phone TEXT,
  org_pay_operator TEXT,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their own tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Organizers can view tickets for their events" ON public.tickets
  FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Owner can manage all tickets" ON public.tickets
  FOR ALL USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Authenticated users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Pub requests table
CREATE TABLE public.pub_requests (
  id TEXT PRIMARY KEY,
  event_id TEXT,
  event_title TEXT,
  event_category TEXT,
  event_address TEXT,
  event_date TEXT,
  event_time TEXT,
  event_price NUMERIC,
  event_currency TEXT DEFAULT 'USD',
  event_capacity INT,
  event_description TEXT,
  event_image TEXT,
  organizer_id UUID REFERENCES auth.users(id),
  organizer_name TEXT,
  organizer_email TEXT,
  organizer_phone TEXT,
  org_pay_phone TEXT,
  org_pay_name TEXT,
  org_pay_operator TEXT,
  pay_phone TEXT,
  pay_operator TEXT,
  tx_ref TEXT,
  proof_image TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ
);

ALTER TABLE public.pub_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can view their own requests" ON public.pub_requests
  FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Authenticated users can create requests" ON public.pub_requests
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Owner can manage all requests" ON public.pub_requests
  FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  text TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (
    auth.uid()::text = from_id OR auth.uid()::text = to_id
    OR public.has_role(auth.uid(), 'owner')
  );

CREATE POLICY "Authenticated users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid()::text = from_id);

CREATE POLICY "Owner can manage all messages" ON public.messages
  FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Settings table
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are readable by everyone" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Owner can manage settings" ON public.settings
  FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Trigger for profiles updated_at
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

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'attendee');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false);

CREATE POLICY "Users can upload payment proofs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their own proofs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-proofs' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'owner')
    )
  );

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
  ('exchange_rate_usd_cdf', '2500'),
  ('owner_payment_number', '+243 979 728 411'),
  ('owner_payment_name', 'Franck Axel Dubois'),
  ('publication_fee_usd', '20'),
  ('platform_commission_pct', '15');

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pub_requests;
