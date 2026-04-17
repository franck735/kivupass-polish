# KivuPass - Plateforme de billetterie d'événements

## 🚀 Fonctionnalités
- **Rôles** : Participant, Organisateur, Admin
- **Événements** : Création, catalogue, QR tickets
- **Admin** : Users, finance, validation
- **Tech** : React/Vite/Supabase/shadcn/Tanstack Query

## 🛠️ Installation & Setup

### Prérequis
- Bun: `curl -fsSL https://bun.sh/install | bash`
- Supabase CLI: `bunx supabase init`

### Clone & Install
```bash
git clone <repo>
cd kivupass-polish
bun install
```

### Local Supabase
```bash
supabase start
# Note project_id: hikqtxkjrzvbinxefeou
cp .env.example .env
# Ajoute SUPABASE_URL, SUPABASE_ANON_KEY
```

### Développement
```bash
bun run dev  # http://localhost:8080
bun run lint
bun run test
bun run build
```

## 📱 Dashboards
- `/dashboard` : Général
- `/dashboard/participant` : Tickets, explore
- `/dashboard/organizer` : Événements, ventes
- `/dashboard/admin` : Gestion complète

## Déploiement
- Vercel/Netlify (Vite ready)
- Supabase prod DB

## Améliorations en cours
Voir [TODO.md](./TODO.md)

Contribuez ! PR welcome.
