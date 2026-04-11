import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, QrCode } from "lucide-react";

export const AdminValidationLog = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("tickets").select("*").eq("validated", true).order("validated_at", { ascending: false })
      .then(({ data }) => { setTickets(data || []); setLoading(false); });
  }, []);

  const filtered = tickets.filter((t) =>
    !search || (t.event_title || "").toLowerCase().includes(search.toLowerCase()) || (t.owner_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Journal de validation</h1>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <QrCode size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucun billet validé.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-muted-foreground text-left">
                  <th className="p-3">Événement</th><th className="p-3">Participant</th><th className="p-3">Organisateur</th><th className="p-3">Validé le</th>
                </tr></thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-border hover:bg-muted/30">
                      <td className="p-3 font-medium text-foreground">{t.event_title}</td>
                      <td className="p-3 text-muted-foreground">{t.owner_name || t.owner_email}</td>
                      <td className="p-3 text-muted-foreground">{t.organizer_name || "—"}</td>
                      <td className="p-3 text-muted-foreground">{t.validated_at ? new Date(t.validated_at).toLocaleString("fr-FR") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
