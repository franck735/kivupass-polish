import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send, Bell } from "lucide-react";
import { ADMIN_SPACE_NAME, AGORA_SOURCE_ROLES, AGORA_SPACE_NAME } from "@/lib/spaces";

export const AdminNotifications = () => {
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);

    let userIds: string[] = [];

    if (targetRole === "all") {
      const { data } = await supabase.from("profiles").select("id");
      userIds = (data || []).map((p) => p.id);
    } else if (targetRole === "agora") {
      const responses = await Promise.all(
        AGORA_SOURCE_ROLES.map((role) =>
          supabase.from("user_roles").select("user_id").eq("role", role)
        )
      );
      userIds = Array.from(
        new Set(responses.flatMap(({ data }) => (data || []).map((row) => row.user_id)))
      );
    } else {
      const { data } = await supabase.from("user_roles").select("user_id").eq("role", "owner");
      userIds = (data || []).map((r) => r.user_id);
    }

    if (userIds.length === 0) {
      toast.error("Aucun utilisateur trouvé.");
      setSending(false);
      return;
    }

    const notifs = userIds.map((uid) => ({
      user_id: uid,
      message: message.trim(),
      type: "broadcast",
    }));

    const { error } = await supabase.from("notifications").insert(notifs);
    setSending(false);

    if (error) toast.error("Erreur : " + error.message);
    else { toast.success(`Notification envoyée à ${userIds.length} utilisateurs`); setMessage(""); }
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Notifications & diffusions</h1>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell size={20} /> Envoyer une notification</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Destinataires</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tous les utilisateurs</option>
              <option value="agora">{AGORA_SPACE_NAME} uniquement</option>
              <option value="owner">{ADMIN_SPACE_NAME} uniquement</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Message</label>
            <Textarea
              placeholder="Écrivez votre message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          <Button onClick={handleSend} disabled={sending || !message.trim()} className="gap-2">
            <Send size={16} /> {sending ? "Envoi..." : "Envoyer"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
