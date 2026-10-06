-- Canonical profile fields used by the application.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS pay_name TEXT,
  ADD COLUMN IF NOT EXISTS pay_phone TEXT,
  ADD COLUMN IF NOT EXISTS pay_operator TEXT;

ALTER TABLE public.pub_requests
  ADD COLUMN IF NOT EXISTS publication_fee_phone TEXT;

-- Restrict role inspection to the signed-in user and administrators.
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN FALSE; END IF;
  IF auth.uid() IS DISTINCT FROM _user_id AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'owner'
  ) THEN RETURN FALSE; END IF;
  RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
END;
$$;
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
-- Public event policies also call this function for anonymous visitors. It
-- returns false for anon because auth.uid() is NULL.
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, anon;

-- Every public table has explicit, role-scoped access rules.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owner can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY profiles_read_self_or_owner ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'owner'));
CREATE POLICY profiles_update_self_or_owner ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'owner'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owner can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owner can manage roles" ON public.user_roles;
CREATE POLICY user_roles_read_self_or_owner ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'owner'));
CREATE POLICY user_roles_owner_manage ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Published events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Organizers can view their own events" ON public.events;
DROP POLICY IF EXISTS "Owner can manage all events" ON public.events;
CREATE POLICY events_read_published_or_owner ON public.events FOR SELECT
  USING ((status = 'published' AND approved = true)
    OR organizer_id = auth.uid()
    OR public.has_role(auth.uid(), 'owner'));
CREATE POLICY events_owner_manage ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Buyers can view their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Organizers can view tickets for their events" ON public.tickets;
DROP POLICY IF EXISTS "Owner can manage all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Authenticated users can create tickets" ON public.tickets;
CREATE POLICY tickets_read_parties ON public.tickets FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR organizer_id = auth.uid() OR public.has_role(auth.uid(), 'owner'));
CREATE POLICY tickets_buyer_create_pending ON public.tickets FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY tickets_owner_manage ON public.tickets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Organizers can view their own requests" ON public.pub_requests;
DROP POLICY IF EXISTS "Authenticated users can create requests" ON public.pub_requests;
DROP POLICY IF EXISTS "Owner can manage all requests" ON public.pub_requests;
CREATE POLICY pub_requests_read_parties ON public.pub_requests FOR SELECT TO authenticated
  USING (organizer_id = auth.uid() OR public.has_role(auth.uid(), 'owner'));
CREATE POLICY pub_requests_organizer_create ON public.pub_requests FOR INSERT TO authenticated
  WITH CHECK (organizer_id = auth.uid());
CREATE POLICY pub_requests_owner_manage ON public.pub_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE OR REPLACE FUNCTION public.prepare_publication_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.organizer_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'A publication request must belong to the signed-in organizer.';
  END IF;
  NEW.status := 'pending';
  NEW.approved_at := NULL;
  NEW.rejected_at := NULL;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS prepare_publication_request ON public.pub_requests;
CREATE TRIGGER prepare_publication_request BEFORE INSERT ON public.pub_requests
FOR EACH ROW EXECUTE FUNCTION public.prepare_publication_request();

CREATE OR REPLACE FUNCTION public.notify_publication_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message, type, read)
  SELECT user_id,
    'Nouvelle demande de publication pour « ' || COALESCE(NEW.event_title, 'un événement') || ' » de ' || COALESCE(NEW.organizer_name, NEW.organizer_email, 'un organisateur') || '.',
    'publication_request', false
  FROM public.user_roles WHERE role = 'owner';
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS pub_request_notify_admins ON public.pub_requests;
CREATE TRIGGER pub_request_notify_admins AFTER INSERT ON public.pub_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_publication_request();

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Owner can manage all messages" ON public.messages;
CREATE POLICY messages_read_parties ON public.messages FOR SELECT TO authenticated
  USING (from_id = auth.uid()::TEXT OR to_id = auth.uid()::TEXT OR public.has_role(auth.uid(), 'owner'));
CREATE POLICY messages_sender_create ON public.messages FOR INSERT TO authenticated
  WITH CHECK (from_id = auth.uid()::TEXT AND from_id <> to_id);
CREATE POLICY messages_receiver_read_update ON public.messages FOR UPDATE TO authenticated
  USING (to_id = auth.uid()::TEXT OR public.has_role(auth.uid(), 'owner'))
  WITH CHECK (to_id = auth.uid()::TEXT OR public.has_role(auth.uid(), 'owner'));
REVOKE UPDATE ON public.messages FROM authenticated;
GRANT UPDATE (read) ON public.messages TO authenticated;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Owner can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY notifications_read_own_or_owner ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'owner'));
CREATE POLICY notifications_update_own ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'owner'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'owner'));
CREATE POLICY notifications_owner_manage ON public.notifications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'owner'));
REVOKE UPDATE ON public.notifications FROM authenticated;
GRANT UPDATE (read) ON public.notifications TO authenticated;

DROP POLICY IF EXISTS "Settings are readable by everyone" ON public.settings;
DROP POLICY IF EXISTS "Owner can manage settings" ON public.settings;
CREATE POLICY settings_read_public ON public.settings FOR SELECT USING (true);
CREATE POLICY settings_owner_manage ON public.settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'owner'));

-- Lock down legacy commerce tables as well, even though the current checkout
-- flow uses tickets directly.
DROP POLICY IF EXISTS "Published event ticket types viewable by everyone" ON public.ticket_types;
DROP POLICY IF EXISTS "Organizers can manage their ticket types" ON public.ticket_types;
DROP POLICY IF EXISTS "Owner can manage all ticket types" ON public.ticket_types;
CREATE POLICY ticket_types_read_published ON public.ticket_types FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.status = 'published' AND e.approved = true)
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid())
    OR public.has_role(auth.uid(), 'owner'));
CREATE POLICY ticket_types_manage_parties ON public.ticket_types FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner') OR EXISTS (
    SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'owner') OR EXISTS (
    SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid()));

DROP POLICY IF EXISTS "Buyers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Organizers can view orders for their events" ON public.orders;
DROP POLICY IF EXISTS "Owner can manage all orders" ON public.orders;
CREATE POLICY orders_read_parties ON public.orders FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR public.has_role(auth.uid(), 'owner') OR EXISTS (
    SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid()));
CREATE POLICY orders_buyer_create_pending ON public.orders FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid() AND payment_status = 'pending');
CREATE POLICY orders_owner_manage ON public.orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));

DROP POLICY IF EXISTS "Organizers can view their own payouts" ON public.payouts;
DROP POLICY IF EXISTS "Owner can manage all payouts" ON public.payouts;
CREATE POLICY payouts_read_parties ON public.payouts FOR SELECT TO authenticated
  USING (organizer_id = auth.uid() OR public.has_role(auth.uid(), 'owner'));
CREATE POLICY payouts_owner_manage ON public.payouts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));

-- Serialize purchases per event and enforce its published capacity.
CREATE OR REPLACE FUNCTION public.prepare_ticket_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_row public.events%ROWTYPE;
  sold_count BIGINT;
BEGIN
  IF NEW.owner_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'A ticket purchase must belong to the signed-in participant.';
  END IF;
  SELECT * INTO event_row FROM public.events
  WHERE id = NEW.event_id AND status = 'published' AND approved = true FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'This event is not available for ticket purchases.'; END IF;
  SELECT count(*) INTO sold_count FROM public.tickets
  WHERE event_id = NEW.event_id AND payment_status <> 'rejected';
  IF event_row.capacity IS NOT NULL AND sold_count >= event_row.capacity THEN
    RAISE EXCEPTION 'This event has reached its ticket capacity.';
  END IF;
  NEW.event_title := event_row.title;
  NEW.event_date := event_row.date;
  NEW.event_time := event_row.time;
  NEW.event_address := event_row.address;
  NEW.organizer_id := event_row.organizer_id;
  NEW.organizer_name := event_row.organizer_name;
  NEW.price := event_row.price;
  NEW.currency := event_row.currency;
  NEW.org_pay_phone := event_row.payment_phone;
  NEW.org_pay_operator := event_row.payment_operator;
  NEW.payment_status := 'pending';
  NEW.payment_approved := false;
  NEW.approved_at := NULL;
  NEW.rejected_at := NULL;
  NEW.issued_at := NULL;
  NEW.validated := false;
  NEW.validated_at := NULL;
  RETURN NEW;
END;
$$;

-- Notifications are created by trusted triggers and RPCs, never arbitrary clients.
CREATE OR REPLACE FUNCTION public.notify_message_recipient()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient UUID;
BEGIN
  IF NEW.to_id = 'admin' THEN
    INSERT INTO public.notifications (user_id, message, type, read)
    SELECT user_id, 'Nouveau message de ' || COALESCE((SELECT name FROM public.profiles WHERE id::TEXT = NEW.from_id), 'un utilisateur') || '.', 'message', false
    FROM public.user_roles WHERE role = 'owner';
  ELSE
    BEGIN
      recipient := NEW.to_id::UUID;
    EXCEPTION WHEN invalid_text_representation THEN
      RETURN NEW;
    END;
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = recipient) THEN
      INSERT INTO public.notifications (user_id, message, type, read)
      VALUES (recipient, 'Vous avez reçu un nouveau message.', 'message', false);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS messages_notify_recipient ON public.messages;
CREATE TRIGGER messages_notify_recipient AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_message_recipient();

-- Payment decisions and publication approvals are atomic and admin-only.
CREATE OR REPLACE FUNCTION public.decide_ticket_payment(_ticket_id TEXT, _decision TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ticket_row public.tickets%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'owner') OR _decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Only an administrator can decide a ticket payment.';
  END IF;
  UPDATE public.tickets
  SET payment_status = _decision,
      payment_approved = (_decision = 'approved'),
      approved_at = CASE WHEN _decision = 'approved' THEN now() ELSE NULL END,
      rejected_at = CASE WHEN _decision = 'rejected' THEN now() ELSE NULL END
  WHERE id = _ticket_id AND payment_status = 'pending'
  RETURNING * INTO ticket_row;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  IF ticket_row.owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, message, type, read)
    VALUES (ticket_row.owner_id,
      CASE WHEN _decision = 'approved'
        THEN 'Votre paiement pour « ' || COALESCE(ticket_row.event_title, 'votre événement') || ' » est approuvé. L’organisateur prépare maintenant votre billet.'
        ELSE 'Votre paiement pour « ' || COALESCE(ticket_row.event_title, 'votre événement') || ' » a été refusé. Consultez votre commande.' END,
      'ticket_' || _decision, false);
  END IF;
  IF ticket_row.organizer_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, message, type, read)
    VALUES (ticket_row.organizer_id,
      CASE WHEN _decision = 'approved'
        THEN 'Paiement approuvé pour « ' || COALESCE(ticket_row.event_title, 'votre événement') || ' ». Vous pouvez envoyer le billet au participant.'
        ELSE 'Paiement refusé pour « ' || COALESCE(ticket_row.event_title, 'votre événement') || ' » par l’administration.' END,
      'ticket_' || _decision, false);
  END IF;
  RETURN TRUE;
END;
$$;
REVOKE ALL ON FUNCTION public.decide_ticket_payment(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decide_ticket_payment(TEXT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.decide_publication_request(_request_id TEXT, _decision TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_row public.pub_requests%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'owner') OR _decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Only an administrator can decide a publication request.';
  END IF;
  SELECT * INTO request_row FROM public.pub_requests
  WHERE id = _request_id AND status = 'pending' FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  IF _decision = 'approved' THEN
    INSERT INTO public.events (id, title, category, description, date, time, address, price, currency, capacity, image,
      organizer_id, organizer_name, payment_name, payment_phone, payment_operator, status, approved)
    VALUES (request_row.event_id, COALESCE(request_row.event_title, 'Sans titre'), COALESCE(request_row.event_category, 'autre'),
      request_row.event_description, request_row.event_date, request_row.event_time, request_row.event_address,
      COALESCE(request_row.event_price, 0), COALESCE(request_row.event_currency, 'USD'), request_row.event_capacity,
      request_row.event_image, request_row.organizer_id, request_row.organizer_name, request_row.org_pay_name,
      request_row.org_pay_phone, request_row.org_pay_operator, 'published', true);
    INSERT INTO public.user_roles (user_id, role) VALUES (request_row.organizer_id, 'organizer') ON CONFLICT DO NOTHING;
  END IF;

  UPDATE public.pub_requests SET status = _decision,
    approved_at = CASE WHEN _decision = 'approved' THEN now() ELSE NULL END,
    rejected_at = CASE WHEN _decision = 'rejected' THEN now() ELSE NULL END
  WHERE id = _request_id;
  INSERT INTO public.notifications (user_id, message, type, read)
  VALUES (request_row.organizer_id,
    CASE WHEN _decision = 'approved'
      THEN 'Votre événement « ' || COALESCE(request_row.event_title, 'Sans titre') || ' » est approuvé et publié.'
      ELSE 'Votre demande pour « ' || COALESCE(request_row.event_title, 'Sans titre') || ' » a été refusée par l’administration.' END,
    'publication_' || _decision, false);
  RETURN TRUE;
END;
$$;
REVOKE ALL ON FUNCTION public.decide_publication_request(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decide_publication_request(TEXT, TEXT) TO authenticated;

-- Issuing a ticket also notifies its buyer in the same transaction.
CREATE OR REPLACE FUNCTION public.issue_ticket(_ticket_id TEXT)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ticket_row public.tickets%ROWTYPE;
BEGIN
  UPDATE public.tickets SET issued_at = now()
  WHERE id = _ticket_id AND organizer_id = auth.uid()
    AND payment_status = 'approved' AND issued_at IS NULL
  RETURNING * INTO ticket_row;
  IF NOT FOUND THEN RETURN NULL; END IF;
  INSERT INTO public.notifications (user_id, message, type, read)
  VALUES (ticket_row.owner_id,
    'Votre billet pour « ' || COALESCE(ticket_row.event_title, 'l’événement') || ' » a été envoyé. Retrouvez son QR code dans Mes billets.',
    'ticket_issued', false);
  RETURN ticket_row.issued_at;
END;
$$;
REVOKE ALL ON FUNCTION public.issue_ticket(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_ticket(TEXT) TO authenticated;

-- Buckets: event artwork is public; transaction proofs stay private.
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false), ('publication-proofs', 'publication-proofs', false), ('event-posters', 'event-posters', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own proofs" ON storage.objects;
DROP POLICY IF EXISTS payment_proofs_insert_own ON storage.objects;
DROP POLICY IF EXISTS payment_proofs_read_parties ON storage.objects;
CREATE POLICY payment_proofs_insert_own ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY payment_proofs_read_parties ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs' AND (
    (storage.foldername(name))[1] = auth.uid()::TEXT OR public.has_role(auth.uid(), 'owner')
  ));

DROP POLICY IF EXISTS publication_proofs_insert_own ON storage.objects;
DROP POLICY IF EXISTS publication_proofs_read_parties ON storage.objects;
CREATE POLICY publication_proofs_insert_own ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'publication-proofs' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY publication_proofs_read_parties ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'publication-proofs' AND (
    (storage.foldername(name))[1] = auth.uid()::TEXT OR public.has_role(auth.uid(), 'owner')
  ));

DROP POLICY IF EXISTS event_posters_insert_owner_folder ON storage.objects;
CREATE POLICY event_posters_insert_owner_folder ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-posters' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

-- Realtime feeds used by the dashboards and inboxes.
DO $$
DECLARE table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['notifications', 'profiles', 'messages', 'tickets', 'pub_requests', 'events'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = table_name
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
    END IF;
  END LOOP;
END;
$$;
