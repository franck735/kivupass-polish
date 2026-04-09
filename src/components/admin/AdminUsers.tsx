import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportCSV } from "@/lib/csv";

export const AdminUsers = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);
      setProfiles(p || []);
      setRoles(r || []);
      setLoading(false);
    };
    load();
  }, []);

  const getUserRoles = (userId: string) => roles.filter((r) => r.user_id === userId).map((r) => r.role);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-syne font-bold text-2xl text-foreground">Utilisateurs ({profiles.length})</h1>
        <Button size="sm" variant="outline" onClick={() => exportCSV(profiles, "utilisateurs")} className="gap-1"><Download size={14} />CSV</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-muted-foreground text-left">
                <th className="p-3">Nom</th><th className="p-3">Email</th><th className="p-3">Téléphone</th><th className="p-3">Rôles</th><th className="p-3">Inscrit le</th>
              </tr></thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-3 font-medium text-foreground">{p.name || "—"}</td>
                    <td className="p-3 text-muted-foreground">{p.email}</td>
                    <td className="p-3 text-muted-foreground">{p.phone || "—"}</td>
                    <td className="p-3">{getUserRoles(p.id).map((r) => (
                      <Badge key={r} variant="outline" className="mr-1 text-xs">{r}</Badge>
                    ))}</td>
                    <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
