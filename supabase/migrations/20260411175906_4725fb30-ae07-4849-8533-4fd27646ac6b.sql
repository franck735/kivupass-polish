
-- ticket_types table
CREATE TABLE public.ticket_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Standard',
  price_usd NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 100,
  sold INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published event ticket types viewable by everyone"
  ON public.ticket_types FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events WHERE events.id = ticket_types.event_id AND events.status = 'published' AND events.approved = true)
  );

CREATE POLICY "Organizers can manage their ticket types"
  ON public.ticket_types FOR ALL USING (
    EXISTS (SELECT 1 FROM public.events WHERE events.id = ticket_types.event_id AND events.organizer_id = auth.uid())
  );

CREATE POLICY "Owner can manage all ticket types"
  ON public.ticket_types FOR ALL USING (has_role(auth.uid(), 'owner'::app_role));

-- orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  event_id TEXT REFERENCES public.events(id),
  ticket_id TEXT REFERENCES public.tickets(id),
  ticket_type_id UUID REFERENCES public.ticket_types(id),
  amount_usd NUMERIC NOT NULL DEFAULT 0,
  amount_cdf NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'mobile_money',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their own orders"
  ON public.orders FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can create orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Organizers can view orders for their events"
  ON public.orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events WHERE events.id = orders.event_id AND events.organizer_id = auth.uid())
  );

CREATE POLICY "Owner can manage all orders"
  ON public.orders FOR ALL USING (has_role(auth.uid(), 'owner'::app_role));

-- payouts table
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL,
  event_id TEXT REFERENCES public.events(id),
  gross_usd NUMERIC NOT NULL DEFAULT 0,
  commission_usd NUMERIC NOT NULL DEFAULT 0,
  net_usd NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can view their own payouts"
  ON public.payouts FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Owner can manage all payouts"
  ON public.payouts FOR ALL USING (has_role(auth.uid(), 'owner'::app_role));

-- notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owner can manage all notifications"
  ON public.notifications FOR ALL USING (has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT WITH CHECK (true);
