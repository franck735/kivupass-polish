import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserCodeReader, BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QrCode, Search, CheckCircle, XCircle, AlertCircle, Camera, CameraOff, ImageUp, RefreshCw } from "lucide-react";

type ScanResult = { status: "valid" | "used" | "unpaid" | "invalid"; message: string; ticket?: any };

const ticketIdFromQr = (rawValue: string) => {
  const value = rawValue.trim();
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "string") return parsed.trim();
    if (parsed && typeof parsed === "object") {
      const id = parsed.ticket_id || parsed.ticketId || parsed.id;
      if (id) return String(id).trim();
    }
  } catch { /* A standard QR often contains a plain ID or URL. */ }
  if (value.startsWith("KIVUPASS:TICKET:")) return value.slice("KIVUPASS:TICKET:".length).trim();
  try {
    const url = new URL(value);
    const id = url.searchParams.get("ticket") || url.searchParams.get("ticket_id") || url.searchParams.get("id");
    if (id) return id.trim();
    const route = url.pathname.match(/\/(?:ticket|tickets)\/([^/]+)/i);
    if (route) return decodeURIComponent(route[1]);
  } catch { /* Treat remaining payloads as an opaque ticket ID. */ }
  return value;
};

export const OrganizerValidation = () => {
  const { user } = useAuth();
  const [ticketId, setTicketId] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [validating, setValidating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<BrowserQRCodeReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const busyRef = useRef(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!scannerRef.current) scannerRef.current = new BrowserQRCodeReader();

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setCameraOn(false);
  }, []);

  const handleSearch = useCallback(async (value: string) => {
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
      setResult({ status: "invalid", message: "Billet introuvable ou non rattaché à cet événement." });
      return;
    }
    if (data.validated) setResult({ status: "used", message: "Ce billet a déjà été utilisé.", ticket: data });
    else if (data.payment_status !== "approved") setResult({ status: "unpaid", message: "Paiement non approuvé par l’administration. Entrée refusée.", ticket: data });
    else if (!data.issued_at) setResult({ status: "unpaid", message: "Ce billet n’a pas encore été envoyé par l’organisateur. Entrée refusée.", ticket: data });
    else setResult({ status: "valid", message: "Billet authentique et actif. Vous pouvez confirmer l’entrée.", ticket: data });
  }, [user]);

  const startCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("La caméra nécessite une connexion HTTPS (ou localhost) et un navigateur qui autorise l’accès vidéo.");
      return;
    }
    try {
      // Request permission first so mobile browsers reveal camera labels and IDs.
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      stream.getTracks().forEach((track) => track.stop());
      const devices = await BrowserCodeReader.listVideoInputDevices();
      setCameraDevices(devices);
      const rearCamera = devices.find((device) => /back|rear|environment|arrière|trasera/i.test(device.label));
      setSelectedCameraId((current) => current || rearCamera?.deviceId || devices[0]?.deviceId || "");
      setCameraOn(true);
    } catch (error) {
      setCameraError(error instanceof Error && error.name === "NotAllowedError"
        ? "Autorisez l’accès à la caméra dans les réglages du navigateur, puis réessayez."
        : "Caméra inaccessible. Vérifiez qu’elle n’est pas déjà utilisée et que la page est en HTTPS.");
    }
  };

  useEffect(() => {
    if (!cameraOn || !videoRef.current || !scannerRef.current) return;
    let active = true;
    const video = videoRef.current;
    void scannerRef.current.decodeFromVideoDevice(selectedCameraId || undefined, video, (decoded) => {
      if (!active || !decoded) return;
      const decodedId = ticketIdFromQr(decoded.getText());
      if (!decodedId) return;
      active = false;
      setTicketId(decodedId);
      controlsRef.current?.stop();
      controlsRef.current = null;
      setCameraOn(false);
      void handleSearch(decodedId);
    }).then((controls) => {
      controlsRef.current = controls;
      if (!active) { controls.stop(); controlsRef.current = null; }
    }).catch((error: unknown) => {
      if (!active) return;
      setCameraOn(false);
      const name = error instanceof Error ? error.name : "";
      setCameraError(name === "NotAllowedError"
        ? "Autorisez l’accès à la caméra dans votre navigateur."
        : "Impossible de démarrer le lecteur. Vérifiez la caméra, son autorisation et la connexion HTTPS.");
    });
    return () => {
      active = false;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [cameraOn, selectedCameraId, handleSearch]);

  useEffect(() => () => { controlsRef.current?.stop(); }, []);

  const scanImage = async (file?: File) => {
    if (!file || !scannerRef.current) return;
    setCameraError("");
    setSearching(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      try {
        const decoded = await scannerRef.current.decodeFromImageUrl(imageUrl);
        const decodedId = ticketIdFromQr(decoded.getText());
        setTicketId(decodedId);
        await handleSearch(decodedId);
      } finally { URL.revokeObjectURL(imageUrl); }
    } catch {
      setResult({ status: "invalid", message: "Aucun QR code lisible n’a été trouvé dans cette image." });
    } finally { setSearching(false); }
  };

  const handleValidate = async () => {
    if (!result?.ticket || result.status !== "valid" || validating) return;
    setValidating(true);
    const { data, error } = await supabase.rpc("validate_ticket", { _ticket_id: result.ticket.id });
    setValidating(false);
    if (error || !data) {
      toast.error("Ce billet vient d’être utilisé ou n’est plus valide.");
      setResult({ ...result, status: "used", message: "Billet déjà utilisé ou validation refusée.", ticket: { ...result.ticket, validated: true } });
    } else {
      toast.success("Entrée validée. Ce QR code ne pourra plus être réutilisé.");
      setResult({ ...result, status: "used", message: "Entrée confirmée. Billet marqué comme utilisé.", ticket: { ...result.ticket, validated: true } });
    }
  };

  const resetScan = () => { setResult(null); setTicketId(""); };
  const statusIcon = result?.status === "valid" ? <CheckCircle size={42} className="mx-auto text-green-600" /> : result?.status === "used" ? <AlertCircle size={42} className="mx-auto text-amber-600" /> : result ? <XCircle size={42} className="mx-auto text-destructive" /> : null;

  return <div className="max-w-xl space-y-6">
    <header><p className="text-sm font-medium text-primary">ACCÈS ÉVÉNEMENT</p><h1 className="mt-1 font-syne text-3xl font-bold text-foreground">Valider un billet</h1><p className="mt-2 text-muted-foreground">Scannez le QR code, importez une photo ou saisissez le numéro du billet.</p></header>
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><QrCode size={20} />Lecteur QR sécurisé</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2"><Input aria-label="Identifiant du billet" placeholder="Identifiant du billet" value={ticketId} onChange={(event) => setTicketId(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void handleSearch(ticketId)} />
          <Button onClick={() => void handleSearch(ticketId)} disabled={searching || !ticketId.trim()} className="gap-2"><Search size={16} />{searching ? "Vérification…" : "Vérifier"}</Button></div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={cameraOn ? stopCamera : () => void startCamera()} className="gap-2">{cameraOn ? <CameraOff size={16} /> : <Camera size={16} />}{cameraOn ? "Arrêter le scanner" : "Ouvrir la caméra"}</Button>
          <Button variant="outline" onClick={() => imageInputRef.current?.click()} disabled={searching} className="gap-2"><ImageUp size={16} />Importer une image QR</Button>
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { void scanImage(event.target.files?.[0]); event.currentTarget.value = ""; }} />
        </div>
        {cameraDevices.length > 1 && cameraOn && <label className="block text-xs font-medium text-slate-600">Caméra utilisée<select value={selectedCameraId} onChange={(event) => setSelectedCameraId(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">{cameraDevices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Caméra ${index + 1}`}</option>)}</select></label>}
        {cameraError && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{cameraError}</p>}
        {cameraOn && <div className="relative overflow-hidden rounded-xl bg-slate-950"><video ref={videoRef} autoPlay playsInline muted className="max-h-96 w-full object-cover" /><div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="h-56 w-56 rounded-2xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" /></div><p className="bg-slate-950 p-2 text-center text-sm text-white">Centrez le QR code dans le cadre</p></div>}
        {result && <div role="status" className={`space-y-3 rounded-xl border p-5 text-center ${result.status === "valid" ? "border-green-200 bg-green-50" : result.status === "used" ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"}`}>
          {statusIcon}<p className="font-semibold text-foreground">{result.message}</p>
          {result.ticket && <div className="space-y-1 border-t border-border pt-3 text-left text-sm text-muted-foreground"><p><strong>Événement :</strong> {result.ticket.event_title}</p><p><strong>Acheteur :</strong> {result.ticket.owner_name || result.ticket.owner_email}</p><p><strong>Téléphone :</strong> {result.ticket.owner_phone || "—"}</p><p><strong>Référence :</strong> <span className="font-mono">{result.ticket.id}</span></p></div>}
          {result.status === "valid" && <Button onClick={() => void handleValidate()} disabled={validating} className="mt-2 w-full gap-2"><CheckCircle size={16} />{validating ? "Validation…" : "Confirmer l’entrée"}</Button>}
          {result.status !== "valid" && <Button variant="outline" onClick={resetScan} className="gap-2"><RefreshCw size={15} />Scanner un autre billet</Button>}
        </div>}
      </CardContent>
    </Card>
  </div>;
};
