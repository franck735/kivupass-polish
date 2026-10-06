import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, CheckCircle } from "lucide-react";

interface TicketQRProps {
  ticket: any;
  open: boolean;
  onClose: () => void;
}

export const TicketQR = ({ ticket, open, onClose }: TicketQRProps) => {
  if (!ticket) return null;

  // Keep the payload compact and stable so scanner apps can read the ticket ID directly.
  const qrData = String(ticket.id || "");

  const isIssued = ticket.payment_status === "approved" && (Boolean(ticket.issued_at) || ticket.issued_at === undefined);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="font-syne">Mon Billet</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <h3 className="font-semibold text-foreground text-lg">{ticket.event_title}</h3>

          <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
            {ticket.event_date && <span className="flex items-center gap-1"><Calendar size={12} />{ticket.event_date}</span>}
            {ticket.event_address && <span className="flex items-center gap-1"><MapPin size={12} />{ticket.event_address}</span>}
          </div>

          {isIssued ? (
            <div className="flex flex-col items-center gap-3">
              <div className="inline-flex max-w-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <QRCodeSVG value={qrData} size={260} level="H" includeMargin title={`QR code officiel du billet ${ticket.id}`} role="img" aria-label={`QR code du billet ${ticket.id}`} />
              </div>
              <div className="flex items-center gap-1 text-green-700 text-sm font-semibold">
                <CheckCircle size={14} />
                Billet émis · prêt à présenter à l’entrée
              </div>
            </div>
          ) : (
            <div className="py-6 text-muted-foreground">
              <p className="text-sm">{ticket.payment_status === "approved" ? "Paiement approuvé. L’organisateur doit encore émettre le billet." : "Le billet sera disponible après approbation du paiement par l’administration et envoi par l’organisateur."}</p>
              <Badge className="mt-2 bg-primary/20 text-primary">{ticket.payment_status === "approved" ? "En attente d’émission" : ticket.payment_status === "rejected" ? "Paiement refusé" : "Paiement en vérification"}</Badge>
            </div>
          )}

          <p className="text-xs text-muted-foreground font-mono break-all">ID: {ticket.id}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
