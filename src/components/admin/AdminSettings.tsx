import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";

const settingKeys = [
  { key: "exchange_rate_usd_cdf", label: "Taux de change USD → CDF" },
  { key: "pub_fee_usd", label: "Frais de publication (USD)" },
  { key: "support_phone", label: "Téléphone support" },
  { key: "support_email", label: "Email support" },
];

export const AdminSettings = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("settings").select("*").then(({ data }) => {
      const map: Record<string, string> = {};
      (data || []).forEach((s) => { map[s.key] = s.value || ""; });
      setValues(map);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    for (const { key } of settingKeys) {
      await supabase.from("settings").upsert({ key, value: values[key] || "" }, { onConflict: "key" });
    }
    setSaving(false);
    toast.success("Paramètres sauvegardés");
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-lg">
      <h1 className="font-syne font-bold text-2xl text-foreground mb-6">Paramètres</h1>
      <Card>
        <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {settingKeys.map(({ key, label }) => (
            <div key={key}>
              <label className="text-sm text-muted-foreground mb-1 block">{label}</label>
              <Input value={values[key] || ""} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} />
            </div>
          ))}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save size={16} />{saving ? "Sauvegarde..." : "Enregistrer"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
