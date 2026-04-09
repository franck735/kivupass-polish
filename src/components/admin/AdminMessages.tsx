import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send } from "lucide-react";

export const AdminMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const load = async () => {
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const sendReply = async () => {
    if (!replyTo || !replyText.trim() || !user) return;
    await supabase.from("messages").insert({
      from_id: user.id,
      to_id: replyTo,
      text: replyText.trim(),
    });
    toast.success("Réponse envoyée");
    setReplyTo(null);
    setReplyText("");
    load();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Messages ({messages.length})</h1>

      <div className="space-y-3">
        {messages.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-muted-foreground font-mono">{m.from_id === user?.id ? "Vous" : m.from_id}</span>
                <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("fr-FR")}</span>
              </div>
              <p className="text-sm text-foreground mb-2">{m.text}</p>
              {m.from_id !== user?.id && (
                <Button size="sm" variant="outline" onClick={() => setReplyTo(m.from_id)} className="text-xs">
                  Répondre
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {replyTo && (
        <div className="fixed bottom-4 right-4 left-4 lg:left-72 bg-card border border-border rounded-xl p-4 shadow-lg z-50">
          <p className="text-sm text-muted-foreground mb-2">Répondre à {replyTo.slice(0, 8)}...</p>
          <div className="flex gap-2">
            <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Votre réponse..." rows={2} className="flex-1" />
            <Button onClick={sendReply} disabled={!replyText.trim()}><Send size={16} /></Button>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-xs text-muted-foreground mt-1">Annuler</button>
        </div>
      )}
    </div>
  );
};
