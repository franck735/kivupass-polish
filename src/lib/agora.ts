import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  CalendarPlus2,
  CalendarSearch,
  LayoutDashboard,
  DollarSign,
  FileText,
  MessageSquare,
  QrCode,
  ShoppingBag,
  Ticket,
  User,
  Users,
} from "lucide-react";

export type AgoraSectionId = "billetterie" | "organisation" | "compte";
export type AgoraTabId =
  | "home"
  | "explore"
  | "tickets"
  | "orders"
  | "create"
  | "events"
  | "requests"
  | "sales"
  | "validate"
  | "attendees"
  | "messages"
  | "notifications"
  | "profile";

export interface AgoraMenuItem {
  id: AgoraTabId;
  label: string;
  icon: LucideIcon;
}

export const AGORA_SECTION_TABS: Array<{
  id: AgoraSectionId;
  label: string;
  description: string;
}> = [
  { id: "billetterie", label: "Billetterie", description: "Acheter, suivre et retrouver vos billets" },
  { id: "organisation", label: "Organisation", description: "Créer, publier et piloter vos événements" },
  { id: "compte", label: "Compte", description: "Profil, notifications et préférences" },
];

export const AGORA_MENU_SECTIONS: Array<{
  title: string;
  items: AgoraMenuItem[];
}> = [
  {
    title: "Vue d'ensemble",
    items: [{ id: "home", label: "Accueil Agora", icon: LayoutDashboard }],
  },
  {
    title: "Billetterie",
    items: [
      { id: "explore", label: "Explorer", icon: CalendarSearch },
      { id: "tickets", label: "Mes billets", icon: Ticket },
      { id: "orders", label: "Mes commandes", icon: ShoppingBag },
    ],
  },
  {
    title: "Organisation",
    items: [
      { id: "create", label: "Créer un événement", icon: CalendarPlus2 },
      { id: "events", label: "Mes événements", icon: CalendarDays },
      { id: "requests", label: "Mes demandes", icon: FileText },
      { id: "sales", label: "Ventes & revenus", icon: DollarSign },
      { id: "validate", label: "Valider les billets", icon: QrCode },
      { id: "attendees", label: "Public & billets", icon: Users },
      { id: "messages", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    title: "Compte",
    items: [
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "profile", label: "Profil Agora", icon: User },
    ],
  },
];

export const AGORA_TAB_SECTION: Record<AgoraTabId, AgoraSectionId> = {
  home: "billetterie",
  explore: "billetterie",
  tickets: "billetterie",
  orders: "billetterie",
  create: "organisation",
  events: "organisation",
  requests: "organisation",
  sales: "organisation",
  validate: "organisation",
  attendees: "organisation",
  messages: "organisation",
  notifications: "compte",
  profile: "compte",
};

export const AGORA_SECTION_DEFAULT_TAB: Record<AgoraSectionId, AgoraTabId> = {
  billetterie: "home",
  organisation: "events",
  compte: "profile",
};

export const AGORA_TAB_META: Record<AgoraTabId, { title: string; description: string }> = {
  home: {
    title: "Accueil Agora",
    description: "Un seul endroit pour acheter des billets, créer des événements et suivre votre activité.",
  },
  explore: {
    title: "Explorer les événements",
    description: "Découvrez les événements publiés et achetez vos billets en quelques clics.",
  },
  tickets: {
    title: "Mes billets",
    description: "Retrouvez vos billets actifs, vos QR codes et votre historique d'accès.",
  },
  orders: {
    title: "Mes commandes",
    description: "Consultez toutes vos transactions, leur statut et vos paiements Mobile Money.",
  },
  create: {
    title: "Créer un événement",
    description: "Préparez une nouvelle billetterie avec vos informations préremplies depuis votre profil Agora.",
  },
  events: {
    title: "Mes événements",
    description: "Pilotez vos événements publiés et gardez un oeil sur leur état.",
  },
  requests: {
    title: "Mes demandes",
    description: "Suivez vos soumissions en attente, validées ou refusées.",
  },
  sales: {
    title: "Ventes & revenus",
    description: "Analysez vos ventes, vos commissions et vos revenus nets.",
  },
  validate: {
    title: "Validation",
    description: "Contrôlez les billets à l'entrée et validez-les en temps réel.",
  },
  attendees: {
    title: "Public & billets",
    description: "Consultez les acheteurs de vos événements et exportez vos listes.",
  },
  messages: {
    title: "Messages",
    description: "Échangez avec l'administration depuis votre espace Agora.",
  },
  notifications: {
    title: "Notifications",
    description: "Suivez les annonces, validations et rappels liés à votre activité.",
  },
  profile: {
    title: "Profil Agora",
    description: "Gérez vos informations personnelles et vos moyens de paiement pour vos prochains événements.",
  },
};

export const getAgoraSection = (tab: AgoraTabId): AgoraSectionId => AGORA_TAB_SECTION[tab];
