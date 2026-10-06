# Mise en service Supabase

Le client utilise `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` dans `.env`. Les migrations sous `migrations/` installent le schéma, les règles RLS, le stockage, les notifications automatiques et les RPC de validation. La fonction `admin-users` exige en plus la clé secrète du projet côté Edge Functions.

## Déployer

Depuis un poste connecté au projet `hikqtxkjrzvbinxefeou` avec Supabase CLI :

```sh
supabase login
supabase link --project-ref hikqtxkjrzvbinxefeou
supabase db push
supabase functions deploy admin-users
```

Configurer `SUPABASE_SERVICE_ROLE_KEY` comme secret de la fonction (le runtime fournit déjà `SUPABASE_URL` et `SUPABASE_ANON_KEY`) :

```sh
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<clé-service-role-du-projet>
```

Ne jamais placer cette clé dans `.env` côté navigateur ni dans le dépôt.

## Premier compte administrateur

Les nouveaux comptes sont créés en rôle participant. Après avoir créé ou inscrit le compte qui doit être l’administrateur initial, exécuter une seule fois dans l’éditeur SQL Supabase, en remplaçant l’adresse :

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner'::public.app_role
FROM auth.users
WHERE lower(email) = lower('admin@votre-domaine.com')
ON CONFLICT (user_id, role) DO NOTHING;

DELETE FROM public.user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE lower(email) = lower('admin@votre-domaine.com'))
  AND role = 'attendee';
```

Les utilisateurs locaux de l’ancien stockage navigateur ne sont pas des comptes Auth Supabase. Il faut les créer à nouveau dans le projet Supabase; les mots de passe ne peuvent pas être transférés depuis le navigateur.
