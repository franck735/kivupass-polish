import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QrCode, Search, CheckCircle, XCircle, AlertCircle, Camera, CameraOff } from "lucide-react";

type ScanResult = { status: "valid" | "used" | "unpaid" | "invalid"; message: string; ticket?: any };
type DetectorWindow = Window & { BarcodeDetector?: new (options?: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> } };

export const OrganizerValidation = () => {
  const { user } = useAuth();
  const [ticketId, setTicketId] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const busyRef = useRef(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  const handleSearch = useCallback(async (value = ticketId) => {
    const id = value.trim();
    if (!id || !user || busyRef.current) return;
    busyRef.current = true;
    setSearching(true);
    setResult(null);
    const { data, error } = await supabase.from("tickets").select("*")
      .eq("id", id).eq("organizer_id", user.id).single();
    setSearching(false);
    busyRef.current = false;
    if (error || !data) {
      setResult({ status: "invalid", message: "Billet introuvable ou non rattaché à votre compte." });
      return;
    }
    if (data.validated) setResult({ status: "used", message: "Ce billet a déjà été utilisé.", ticket: data });
    else if (data.payment_status !== "approved") setResult({ status: "unpaid", message: "Le paiement de ce billet n'est pas confirmé.", ticket: data });
    else setResult({ status: "valid", message: "Billet valide. Vous pouvez autoriser l'entrée.", ticket: data });
  }, [ticketId, user]);

  const startCamera = async () => {
    setCameraError("");
    const Detector = (window as DetectorWindow).BarcodeDetector;
    if (!Detector) {
      setCameraError("La lecture QR par caméra n'est pas prise en charge par ce navigateur. Saisissez l'identifiant du billet.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("L'accès caméra est indisponible. Ouvrez cette page en HTTPS et autorisez la caméra.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
    } catch (error) {
      setCameraError(error instanceof Error && error.name === "NotAllowedError" ? "Autorisez l'accès à la caméra dans les réglages du navigateur." : "Caméra inaccessible. Vérifiez qu'elle n'est pas déjà utilisée.");
    }
  };

  useEffect(() => {
    if (!cameraOn || !streamRef.current || !videoRef.current) return;
    const Detector = (window as DetectorWindow).BarcodeDetector;
    if (!Detector) return;
    let cancelled = false;
    let timer = 0;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    const detector = new Detector({ formats: ["qr_code"] });
    const scan = async () => {
      if (cancelled) return;
      try {
        const value = (await detector.detect(video))[0]?.rawValue;
        if (value) {
          let id = value.trim();
          try { const parsed = JSON.parse(value); id = parsed.id || parsed.ticket_id || id; } catch { /* QR may contain a plain ticket ID or URL. */ }
          try { const url = new URL(id); id = url.searchParams.get("ticket") || url.searchParams.get("id") || url.pathname.split("/").filter(Boolean).at(-1) || id; } catch { /* Keep the scanned ID. */ }
          setTicketId(id);
          stopCamera();
          void handleSearch(id);
          return;
        }
      } catch { /* Continue scanning the next frame. */ }
      if (!cancelled) timer = window.setTimeout(scan, 250);
    };
    void video.play().then(scan).catch(() => setCameraError("Impossible de démarrer la vidéo. Vérifiez l'autorisation caméra."));
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [cameraOn, handleSearch, stopCamera]);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((track) => track.stop()); }, []);

  const handleValidate = async () => {
    if (!result?.ticket || result.status !== "valid") return;
    const { data, error } = await supabase.from("tickets").update({ validated: true, validated_at: new Date().toISOString() })
      .eq("id", result.ticket.id).eq("organizer_id", user?.id).eq("validated", false).eq("payment_status", "approved").select("id");
    if (error) toast.error("Validation impossible : " + error.message);
    else if (!data?.length) {
      toast.error("Ce billet vient d'être utilisé ou n'est plus valide.");
      setResult({ ...result, status: "used", message: "Ce billet a déjà été utilisé.", ticket: { ...result.ticket, validated: true } });
    } else {
      toast.success("Billet validé avec succès.");
      setResult({ ...result, status: "used", message: "Billet marqué comme utilisé.", ticket: { ...result.ticket, validated: true } });
    }
  };

  const statusIcon = result?.status === "valid" ? <CheckCircle size={42} className="mx-auto text-green-600" /> : result?.status === "used" ? <AlertCircle size={42} className="mx-auto text-amber-600" /> : result ? <XCircle size={42} className="mx-auto text-destructive" /> : null;

  return <div className="max-w-xl space-y-6">
    <header><p className="text-sm font-medium text-primary">ACCÈS ÉVÉNEMENT</p><h1 className="font-syne font-bold text-3xl text-foreground mt-1">Valider un billet</h1><p className="text-muted-foreground mt-2">Scannez le QR code ou saisissez l'identifiant pour vérifier le billet.</p></header>
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><QrCode size={20} /> Vérification sécurisée</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2"><Input aria-label="Identifiant du billet" placeholder="Identifiant du billet" value={ticketId} onChange={(e) => setTicketId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void handleSearch()} />
          <Button onClick={() => void handleSearch()} disabled={searching || !ticketId.trim()} className="gap-2"><Search size={16} />{searching ? "Vérification…" : "Vérifier"}</Button></div>
        <div className="flex justify-center"><Button variant="outline" onClick={cameraOn ? stopCamera : startCamera} className="gap-2">{cameraOn ? <CameraOff size={16} /> : <Camera size={16} />}{cameraOn ? "Arrêter la caméra" : "Scanner avec la caméra"}</Button></div>
        {cameraError && <p role="status" className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">{cameraError}</p>}
        {cameraOn && <div className="overflow-hidden rounded-xl bg-slate-950"><video ref={videoRef} autoPlay playsInline muted className="w-full max-h-80 object-cover" /><p className="bg-slate-950 text-white text-center text-sm p-2">Placez le QR code dans le champ de la caméra</p></div>}
        {result && <div role="status" className={`rounded-xl border p-5 text-center space-y-3 ${result.status === "valid" ? "border-green-200 bg-green-50" : result.status === "used" ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"}`}>
          {statusIcon}<p className="font-semibold text-foreground">{result.message}</p>
          {result.ticket && <div className="text-sm text-muted-foreground space-y-1 text-left border-t border-border pt-3"><p><strong>Événement :</strong> {result.ticket.event_title}</p><p><strong>Acheteur :</strong> {result.ticket.owner_name || result.ticket.owner_email}</p><p><strong>Téléphone :</strong> {result.ticket.owner_phone || "—"}</p></div>}
          {result.status === "valid" && <Button onClick={handleValidate} className="mt-2 gap-2"><CheckCircle size={16} />Confirmer l'entrée</Button>}
        </div>}
      </CardContent>
    </Card>
  </div>;
};
