import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ContactSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("messages").insert({
        from_id: email,
        to_id: "owner_admin",
        text: `[Contact] ${name} (${email}): ${message}`,
        is_system: false,
      });
      if (error) throw error;
      toast.success("Message envoyé avec succès !");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container py-16 md:py-20" id="contact">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-display font-bold text-foreground"
          >
            Contactez-<span className="text-primary">nous</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-muted-foreground mt-2"
          >
            Une question ? Un partenariat ? Écrivez-nous.
          </motion.p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-4 bg-card border border-border rounded-xl p-6"
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="Votre nom complet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="votre@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="Votre message..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Envoyer"}
            <Send className="w-4 h-4" />
          </button>
        </motion.form>

        <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
          <Mail className="w-4 h-4" />
          kivupass@gmail.com
        </p>
      </div>
    </section>
  );
};

export default ContactSection;
