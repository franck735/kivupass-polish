import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";

export const OrganizerMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user) return;
    supabase.from("messages").select("*")
      .or(`from_id.eq.${user.id},to_id.eq.${user.id}`)
      .order("created_at", { ascending: true })
      .then(({ data }) => { setMessages(data || []); setLoading(false); });
  };

  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel("org-msgs").on("postgres_changes", {
      event: "INSERT", schema: "public", table: "messages",
    }, () => load()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const sendMessage = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      from_id: user.id, to_id: "admin", text: text.trim(),
    });
    setSending(false);
    if (error) toast.error(error.message);
    else {
      setText(""); toast.success("Message envoyé à l’administration");
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Messages</h1>

      <Card className="mb-4">
        <CardContent className="p-4 max-h-96 overflow-y-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Aucun message.</p>
            </div>
          ) : messages.map((m) => (
            <div key={m.id} className={`flex ${m.from_id === user?.id ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                m.from_id === user?.id ? "bg-primary/20 text-foreground" : "bg-muted text-foreground"
              }`}>
                <p>{m.text}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleString("fr-FR")}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Textarea
          placeholder="Écrivez un message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          rows={2}
          className="flex-1"
        />
        <Button onClick={sendMessage} disabled={sending} size="icon" className="h-auto">
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};
