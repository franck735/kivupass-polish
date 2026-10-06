-- An approved payment still needs the organizer to issue the participant's ticket.
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ;

-- Preserve QR access for tickets approved before organizer issuance was introduced.
UPDATE public.tickets SET issued_at = COALESCE(approved_at, purchased_at)
WHERE payment_status = 'approved' AND issued_at IS NULL;

-- Buyers cannot mint approved, issued, or self-priced tickets by changing the request.
CREATE OR REPLACE FUNCTION public.prepare_ticket_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_row public.events%ROWTYPE;
BEGIN
  IF NEW.owner_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'A ticket purchase must belong to the signed-in participant.';
  END IF;

  SELECT * INTO event_row FROM public.events
  WHERE id = NEW.event_id AND status = 'published' AND approved = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'This event is not available for ticket purchases.';
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

DROP TRIGGER IF EXISTS prepare_ticket_purchase ON public.tickets;
CREATE TRIGGER prepare_ticket_purchase
BEFORE INSERT ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.prepare_ticket_purchase();

-- A new purchase is routed to its organizer and every owner account. Keep this
-- server-side so RLS on user_roles cannot prevent the buyer from notifying admins.
CREATE OR REPLACE FUNCTION public.notify_ticket_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_label TEXT := COALESCE(NEW.event_title, 'un événement');
BEGIN
  IF NEW.organizer_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, message, type, read)
    VALUES (NEW.organizer_id, 'Nouvelle demande de billet pour « ' || event_label || ' » de ' || COALESCE(NEW.owner_name, NEW.owner_email, 'un participant') || '. Vérifiez la demande après la décision de paiement de l’administration.', 'ticket_request', false);
  END IF;

  INSERT INTO public.notifications (user_id, message, type, read)
  SELECT user_id, 'Nouvelle demande d’achat pour « ' || event_label || ' » de ' || COALESCE(NEW.owner_name, NEW.owner_email, 'un participant') || '. Vérifiez la preuve et décidez du paiement.', 'ticket_request', false
  FROM public.user_roles
  WHERE role = 'owner' AND user_id IS DISTINCT FROM NEW.organizer_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ticket_purchase_notifications ON public.tickets;
CREATE TRIGGER ticket_purchase_notifications
AFTER INSERT ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.notify_ticket_purchase();

-- Let the organizer issue only their own already-approved tickets.
CREATE OR REPLACE FUNCTION public.issue_ticket(_ticket_id TEXT)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  delivery_time TIMESTAMPTZ;
BEGIN
  UPDATE public.tickets
  SET issued_at = now()
  WHERE id = _ticket_id
    AND organizer_id = auth.uid()
    AND payment_status = 'approved'
    AND issued_at IS NULL
  RETURNING issued_at INTO delivery_time;

  RETURN delivery_time;
END;
$$;

REVOKE ALL ON FUNCTION public.issue_ticket(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.issue_ticket(TEXT) TO authenticated;

-- Consume a valid ticket atomically, so two scanners cannot admit the same code.
CREATE OR REPLACE FUNCTION public.validate_ticket(_ticket_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tickets
  SET validated = true, validated_at = now()
  WHERE id = _ticket_id
    AND organizer_id = auth.uid()
    AND payment_status = 'approved'
    AND issued_at IS NOT NULL
    AND COALESCE(validated, false) = false;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_ticket(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_ticket(TEXT) TO authenticated;
