import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Download } from "lucide-react";
import { exportCSV } from "@/lib/csv";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const AdminTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofView, setProofView] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("tickets").select("*").order("purchased_at", { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    await supabase.from("tickets").update({ payment_status: "approved", payment_approved: true, approved_at: new Date().toISOString() }).eq("id", id);
    toast.success("Billet approuvé");
    load();
  };

  const reject = async (id: string) => {
    await supabase.from("tickets").update({ payment_status: "rejected", rejected_at: new Date().toISOString() }).eq("id", id);
    toast.success("Billet rejeté");
    load();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-syne font-bold text-2xl text-foreground">Billets ({tickets.length})</h1>
        <Button size="sm" variant="outline" onClick={() => exportCSV(tickets, "billets")} className="gap-1"><Download size={14} />CSV</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-muted-foreground text-left">
                <th className="p-3">Événement</th><th className="p-3">Acheteur</th><th className="p-3">Prix</th><th className="p-3">Statut</th><th className="p-3">Preuve</th><th className="p-3">Actions</th>
              </tr></thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-3 font-medium text-foreground">{t.event_title}</td>
                    <td className="p-3 text-muted-foreground">{t.owner_name || t.owner_email}</td>
                    <td className="p-3">{t.price} {t.currency}</td>
                    <td className="p-3">
                      <Badge className={t.payment_status === "approved" ? "bg-green-600/20 text-green-400" : t.payment_status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}>
                        {t.payment_status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {t.proof_image_url ? (
                        <Button size="sm" variant="ghost" onClick={() => setProofView(t.proof_image_url)}><Eye size={14} /></Button>
                      ) : "—"}
                    </td>
                    <td className="p-3">
                      {t.payment_status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="text-green-400" onClick={() => approve(t.id)}><CheckCircle size={16} /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => reject(t.id)}><XCircle size={16} /></Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!proofView} onOpenChange={() => setProofView(null)}>
        <DialogContent><DialogHeader><DialogTitle>Preuve de paiement</DialogTitle></DialogHeader>
          {proofView && <img src={proofView} alt="Preuve" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};
