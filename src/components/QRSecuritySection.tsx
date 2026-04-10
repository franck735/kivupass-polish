import { motion } from "framer-motion";
import { ShieldCheck, QrCode, CheckCircle2 } from "lucide-react";

const QRSecuritySection = () => (
  <section className="container py-10 md:py-14">
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-display font-bold text-foreground mb-4">
          Sécurité <span className="text-primary">anti-fraude</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Chaque billet KivuPass est protégé par un QR Code unique qui ne peut être validé qu'une seule fois.
          Fini les copies et les fraudes à l'entrée.
        </p>
        <ul className="space-y-3">
          {[
            "QR Code unique par billet",
            "Validation instantanée à l'entrée",
            "Impossible à dupliquer ou falsifier",
            "Historique de validation en temps réel",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center justify-center"
      >
        <div className="relative">
          <div className="w-64 h-64 bg-card border border-border rounded-2xl flex items-center justify-center">
            <QrCode className="w-32 h-32 text-primary/30" />
          </div>
          <div className="absolute -top-4 -right-4 bg-primary rounded-xl p-3">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default QRSecuritySection;
