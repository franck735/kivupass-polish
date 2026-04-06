
# Plan KivuPass — Construction progressive

## Phase 1 : Fondations (maintenant)
1. **Activer Lovable Cloud** (base de données, auth, storage)
2. **Mettre à jour la palette** vers le doré officiel (#C9A84C) + polices Syne/Inter/Bebas Neue
3. **Créer les tables** : profiles, events, tickets, pub_requests, messages, settings
4. **Configurer RLS** pour chaque table selon les rôles (owner/organizer/attendee)
5. **Refaire la landing page** selon le prompt (sections dans l'ordre : Nav, Hero, Partners, Features, How it works, Events, QR/Sécurité, Témoignages, Tarifs, CTA, Contact, Footer)

## Phase 2 : Authentification
6. **Auth email/password + Google OAuth**
7. **Système de rôles** (owner, organizer, attendee)
8. **Modal auth** avec connexion, inscription, mot de passe oublié
9. **Page /reset-password**

## Phase 3 : Dashboard utilisateur
10. **Layout dashboard** avec sidebar (Mes billets, Événements, Créer billetterie, Profil, Messages, etc.)
11. **Catalogue d'événements** filtrable par catégorie
12. **Page profil** modifiable

## Phase 4 : Flux billets & paiements
13. **Modal d'achat** (3 étapes : résumé → choix opérateur → confirmation)
14. **Upload preuve de paiement** (Supabase Storage)
15. **Billet QR code** + PDF téléchargeable
16. **Flux de création d'événement** pour organisateurs (formulaire 3 étapes + paiement 20$)

## Phase 5 : Admin Panel
17. **Dashboard admin** avec KPIs et graphiques Chart.js
18. **Gestion utilisateurs, billets, événements, demandes**
19. **Messagerie temps réel** (Supabase Realtime)
20. **Exports CSV** et paramètres (taux de change, etc.)

---
*On procède phase par phase. Je commence par la Phase 1 dès validation.*
