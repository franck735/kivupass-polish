import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

export const AdminRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("pub_requests").select("*").order("created_at", { ascending: false });
    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (req: any) => {
    // Create the event
    await supabase.from("events").insert({
      id: req.event_id,
      title: req.event_title || "Sans titre",
      category: req.event_category || "autre",
      description: req.event_description,
      date: req.event_date,
      time: req.event_time,
      address: req.event_address,
      price: req.event_price || 0,
      currency: req.event_currency || "USD",
      capacity: req.event_capacity,
      image: req.event_image,
      organizer_id: req.organizer_id,
      organizer_name: req.organizer_name,
      payment_name: req.org_pay_name,
      payment_phone: req.org_pay_phone,
      payment_operator: req.org_pay_operator,
      status: "published",
      approved: true,
    });

    await supabase.from("pub_requests").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", req.id);

    // Give organizer role
    if (req.organizer_id) {
      await supabase.from("user_roles").upsert({ user_id: req.organizer_id, role: "organizer" }, { onConflict: "user_id,role" });
    }

    toast.success("Demande approuvée, événement publié !");
    load();
  };

  const reject = async (id: string) => {
    await supabase.from("pub_requests").update({ status: "rejected", rejected_at: new Date().toISOString() }).eq("id", id);
    toast.success("Demande rejetée");
    load();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Demandes de publication ({requests.length})</h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-muted-foreground text-left">
                <th className="p-3">Événement</th><th className="p-3">Organisateur</th><th className="p-3">Prix</th><th className="p-3">Statut</th><th className="p-3">Actions</th>
              </tr></thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-3 font-medium text-foreground">{r.event_title}</td>
                    <td className="p-3 text-muted-foreground">{r.organizer_name || r.organizer_email}</td>
                    <td className="p-3">{r.event_price} {r.event_currency}</td>
                    <td className="p-3">
                      <Badge className={r.status === "approved" ? "bg-green-600/20 text-green-400" : r.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {r.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="text-green-400" onClick={() => approve(r)}><CheckCircle size={16} /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => reject(r.id)}><XCircle size={16} /></Button>
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
    </div>
  );
};
