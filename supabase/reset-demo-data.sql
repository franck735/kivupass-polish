-- Nettoyage complet des données métier présentes (événements, demandes,
-- billets, paiements, messages, notifications, fichiers) et des comptes.
-- CONSERVATION : le compte francknyengele735@gmail.com doit déjà avoir le rôle owner.
-- À exécuter une seule fois dans Supabase > SQL Editor, après avoir vérifié le projet.
-- Les réglages de la plateforme et le compte owner sont conservés.

BEGIN;

DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id
  INTO admin_id
  FROM auth.users
  WHERE lower(email) = lower('francknyengele735@gmail.com');

  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Compte admin introuvable. Nettoyage annulé.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = admin_id AND role::text = 'owner'
  ) THEN
    RAISE EXCEPTION 'Le compte admin ne possède pas le rôle owner. Nettoyage annulé.';
  END IF;

  -- Retirer les fichiers de démonstration des espaces de stockage.
  DELETE FROM storage.objects
  WHERE bucket_id IN ('payment-proofs', 'publication-proofs', 'event-posters');

  -- Vider les données transactionnelles avant les événements référencés.
  DELETE FROM public.orders;
  DELETE FROM public.payouts;
  DELETE FROM public.ticket_types;
  DELETE FROM public.tickets;
  DELETE FROM public.pub_requests;
  DELETE FROM public.messages;
  DELETE FROM public.notifications;
  DELETE FROM public.events;

  -- Supprimer tous les utilisateurs sauf l'admin; profils et rôles liés
  -- sont supprimés automatiquement par les clés étrangères du schéma.
  DELETE FROM auth.users WHERE id <> admin_id;

  -- L'admin garde uniquement son rôle owner.
  DELETE FROM public.user_roles
  WHERE user_id = admin_id AND role::text <> 'owner';
END;
$$;

COMMIT;
