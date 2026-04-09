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

  const qrData = JSON.stringify({
    id: ticket.id,
    event: ticket.event_id,
    owner: ticket.owner_id,
  });

  const isApproved = ticket.payment_status === "approved";

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

          {isApproved ? (
            <div className="flex flex-col items-center gap-3">
              <div className="bg-background p-4 rounded-xl border border-border inline-block">
                <QRCodeSVG value={qrData} size={180} level="H" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <CheckCircle size={14} />
                Billet validé
              </div>
            </div>
          ) : (
            <div className="py-6 text-muted-foreground">
              <p className="text-sm">Le QR code sera disponible une fois le paiement approuvé.</p>
              <Badge className="mt-2 bg-primary/20 text-primary">{ticket.payment_status}</Badge>
            </div>
          )}

          <p className="text-xs text-muted-foreground font-mono break-all">ID: {ticket.id}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
