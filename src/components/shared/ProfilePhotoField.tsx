import { useRef, useState } from "react";
import { Camera, ImagePlus, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

interface ProfilePhotoFieldProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

const resizePhoto = (file: File) => new Promise<string>((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Impossible de lire cette image."));
      return;
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(objectUrl);
    resolve(canvas.toDataURL("image/jpeg", 0.82));
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error("Cette image ne peut pas être ouverte."));
  };
  image.src = objectUrl;
});

export const ProfilePhotoField = ({ name, value, onChange }: ProfilePhotoFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Choisissez une photo au format JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("La photo doit faire moins de 8 Mo.");
      return;
    }
    setProcessing(true);
    try {
      onChange(await resizePhoto(file));
      toast.success("Photo ajoutée. Enregistrez le profil pour la conserver.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de traiter cette image.");
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/25 p-4 sm:flex-row sm:items-center">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-card bg-primary/10 shadow-sm">
        {value ? <img src={value} alt={`Photo de ${name || "profil"}`} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-primary"><UserRound size={34} /></div>}
        <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground"><Camera size={13} /></span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">Photo de profil</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">JPG, PNG ou WebP · 8 Mo maximum. L’image est réduite pour le profil.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void handleFile(event.target.files?.[0])} />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={processing} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"><ImagePlus size={14} />{processing ? "Préparation…" : value ? "Changer la photo" : "Ajouter une photo"}</button>
          {value && <button type="button" onClick={() => onChange("")} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-destructive"><Trash2 size={14} />Supprimer</button>}
        </div>
      </div>
    </div>
  );
};
