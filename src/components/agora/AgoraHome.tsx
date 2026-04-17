import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Clock3,
  PlusCircle,
  Sparkles,
  Ticket,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AgoraTabId } from "@/lib/agora";

interface AgoraHomeProps {
  onNavigate: (tab: AgoraTabId) => void;
}

export const AgoraHome = ({ onNavigate }: AgoraHomeProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [ownedTickets, setOwnedTickets] = useState<any[]>([]);
  const [salesTickets, setSalesTickets] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      supabase.from("events").select("*").eq("organizer_id", user.id).order("created_at", { ascending: false }),
      supabase.from("tickets").select("*").eq("owner_id", user.id).order("purchased_at", { ascending: false }),
      supabase.from("tickets").select("*").eq("organizer_id", user.id).eq("payment_status", "approved"),
      supabase.from("pub_requests").select("*").eq("organizer_id", user.id).order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]).then(([{ data: eventRows }, { data: ticketRows }, { data: salesRows }, { data: requestRows }, { data: notifRows }]) => {
      setEvents(eventRows || []);
      setOwnedTickets(ticketRows || []);
      setSalesTickets(salesRows || []);
      setRequests(requestRows || []);
      setNotifications(notifRows || []);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeTickets = ownedTickets.filter((ticket) => ticket.payment_status === "approved" && !ticket.validated).length;
  const unreadNotifications = notifications.filter((notif) => !notif.read).length;
  const pendingRequests = requests.filter((request) => request.status === "pending").length;
  const publishedEvents = events.filter((event) => event.approved).length;
  const grossSales = salesTickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);
  const nextTicket = ownedTickets.find((ticket) => ticket.payment_status === "approved");
  const latestEvents = events.slice(0, 3);
  const latestNotifications = notifications.slice(0, 3);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardHeader>
          <Badge variant="outline" className="w-fit border-primary/30 text-primary">Nouveau flux unifié</Badge>
          <CardTitle className="font-syne text-3xl">Bienvenue dans Agora</CardTitle>
          <CardDescription className="max-w-2xl">
            Votre espace unique pour acheter des billets, lancer des événements et gérer votre activité sans changer de tableau de bord.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Button onClick={() => onNavigate("explore")} className="justify-between rounded-xl px-4 py-6">
            Acheter un billet <ArrowRight size={16} />
          </Button>
          <Button onClick={() => onNavigate("create")} variant="outline" className="justify-between rounded-xl px-4 py-6">
            Créer un événement <PlusCircle size={16} />
          </Button>
          <Button onClick={() => onNavigate("tickets")} variant="outline" className="justify-between rounded-xl px-4 py-6">
            Voir mes billets <Ticket size={16} />
          </Button>
          <Button onClick={() => onNavigate("events")} variant="outline" className="justify-between rounded-xl px-4 py-6">
            Gérer mes événements <CalendarDays size={16} />
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Ticket className="text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{activeTickets}</p>
              <p className="text-sm text-muted-foreground">Billets actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <CalendarDays className="text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{publishedEvents}</p>
              <p className="text-sm text-muted-foreground">Événements publiés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Clock3 className="text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingRequests}</p>
              <p className="text-sm text-muted-foreground">Demandes en attente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Wallet className="text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">${grossSales.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Ventes confirmées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {!events.length ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles size={18} className="text-primary" />
              {pendingRequests > 0 ? "Votre premier événement est en route" : "Prêt pour votre premier événement ?"}
            </CardTitle>
            <CardDescription>
              {pendingRequests > 0
                ? "Votre demande est en cours de validation. En attendant, vous pouvez continuer à explorer la plateforme et préparer vos prochains événements."
                : "Agora vous laisse tout faire depuis le même espace. Commencez par configurer vos paiements, puis publiez votre premier événement."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              {[
                "Complétez votre profil Agora et vos moyens de paiement.",
                "Créez votre première billetterie avec affiche, prix et lieu.",
                "Suivez ensuite vos demandes, ventes et validations depuis Agora.",
              ].map((item) => (
                <div key={item} className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => onNavigate("profile")}>Configurer mon profil</Button>
              <Button onClick={() => onNavigate("create")} variant="outline">Créer mon premier événement</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Votre activité récente</CardTitle>
              <CardDescription>Un aperçu rapide de vos derniers événements et actions dans Agora.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => onNavigate("events")}>Voir tout</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestEvents.map((event) => (
              <div key={event.id} className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.date || "Date à confirmer"} · {event.address || "Lieu à confirmer"}
                  </p>
                </div>
                <Badge variant="outline" className={event.approved ? "border-green-500 text-green-400" : "border-primary text-primary"}>
                  {event.approved ? "Publié" : "En révision"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Billetterie personnelle</CardTitle>
              <CardDescription>Vos achats récents et vos prochains billets.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => onNavigate("orders")}>Mes commandes</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextTicket ? (
              <>
                <div className="rounded-xl border border-border p-4">
                  <p className="font-medium text-foreground">{nextTicket.event_title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {nextTicket.event_date || "Date à confirmer"} · {nextTicket.event_address || "Lieu à confirmer"}
                  </p>
                  <p className="mt-2 text-sm font-medium text-primary">
                    {nextTicket.price} {nextTicket.currency}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => onNavigate("tickets")}>Ouvrir mes billets</Button>
                  <Button variant="outline" onClick={() => onNavigate("explore")}>Explorer plus d'événements</Button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                Aucun billet actif pour le moment. Explorez les événements pour effectuer votre premier achat dans Agora.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Alertes & suivi</CardTitle>
              <CardDescription>Les dernières notifications utiles liées à votre compte.</CardDescription>
            </div>
            <Badge variant="outline" className="w-fit">{unreadNotifications} non lues</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestNotifications.length > 0 ? (
              <>
                {latestNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 rounded-xl border border-border p-4">
                    <Bell size={16} className="mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm text-foreground">{notification.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => onNavigate("notifications")}>Voir toutes les notifications</Button>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                Aucune notification pour l'instant. Vous verrez ici les validations, messages et mises à jour d'Agora.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
