import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare } from "lucide-react";

export const MessagesPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("messages")
      .select("*")
      .or(`from_id.eq.${user.id},to_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMessages(data || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Messages</h1>

      {messages.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare size={48} className="mx-auto mb-3 opacity-40" />
          <p>Aucun message pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-muted-foreground">
                  {m.from_id === user?.id ? "Vous" : "Support"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <p className="text-sm text-foreground">{m.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
