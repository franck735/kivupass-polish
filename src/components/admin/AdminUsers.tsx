import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfilePhotoField } from "@/components/shared/ProfilePhotoField";
import { toast } from "sonner";
import { Download, Filter, MoreHorizontal, Plus, Search, Trash2, Users } from "lucide-react";
import { exportCSV } from "@/lib/csv";
import { mapRolesToSpaces } from "@/lib/spaces";

type UserProfile = { id: string; name?: string; email: string; phone?: string; avatar_url?: string; role?: string; status?: string; created_at: string };
type UserRole = { user_id: string; role: string };

export const AdminUsers = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState<"participant" | "organizer" | "owner">("participant");
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = async () => {
    const [{ data: userProfiles }, { data: userRoles }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);
    setProfiles((userProfiles || []) as UserProfile[]);
    setRoles((userRoles || []) as UserRole[]);
    setLoading(false);
  };

  useEffect(() => { void loadUsers(); }, []);

  const rolesFor = (userId: string) => roles.filter((role) => role.user_id === userId).map((role) => role.role);
  const roleLabel = (profile: UserProfile) => mapRolesToSpaces(rolesFor(profile.id)).join(" · ") || (profile.role === "organizer" ? "Agora" : profile.role === "owner" ? "Administration" : "Participant");

  const counts = useMemo(() => ({
    all: profiles.length,
    participants: profiles.filter((profile) => rolesFor(profile.id).some((role) => role === "participant" || role === "attendee") || (!rolesFor(profile.id).length && profile.role === "participant")).length,
    organizers: profiles.filter((profile) => rolesFor(profile.id).includes("organizer") || profile.role === "organizer").length,
    owners: profiles.filter((profile) => rolesFor(profile.id).includes("owner") || profile.role === "owner").length,
  }), [profiles, roles]);

  const visibleProfiles = useMemo(() => profiles.filter((profile) => {
    const profileRoles = rolesFor(profile.id);
    const matchesRole = filter === "all"
      || (filter === "participants" && (profileRoles.some((role) => role === "participant" || role === "attendee") || (!profileRoles.length && profile.role === "participant")))
      || (filter === "organizers" && (profileRoles.includes("organizer") || profile.role === "organizer"))
      || (filter === "owners" && (profileRoles.includes("owner") || profile.role === "owner"));
    const term = query.trim().toLocaleLowerCase("fr");
    return matchesRole && (!term || `${profile.name || ""} ${profile.email} ${profile.phone || ""}`.toLocaleLowerCase("fr").includes(term));
  }), [profiles, roles, filter, query]);

  const openProfile = (profile: UserProfile) => {
    setConfirmDelete(false);
    setSelected(profile);
    setName(profile.name || "");
    setPhone(profile.phone || "");
    setAvatar(profile.avatar_url || "");
  };

  const createUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdding(true);
    const { error } = await supabase.functions.invoke("admin-users", { body: {
      action: "create", email: addEmail.trim().toLocaleLowerCase("fr"), password: addPassword,
      name: addName.trim(), phone: addPhone.trim(), role: addRole,
    } });
    setAdding(false);
    if (error) { toast.error(error.message || "Impossible de créer cet utilisateur."); return; }
    setAddOpen(false);
    setAddName(""); setAddEmail(""); setAddPhone(""); setAddPassword(""); setAddRole("participant");
    await loadUsers();
    toast.success("Utilisateur ajouté.");
  };

  const deleteUser = async () => {
    if (!selected) return;
    setDeleting(true);
    const { error } = await supabase.functions.invoke("admin-users", { body: { action: "delete", user_id: selected.id } });
    setDeleting(false);
    if (error) { toast.error(error.message || "Impossible de supprimer cet utilisateur."); return; }
    setProfiles((current) => current.filter((profile) => profile.id !== selected.id));
    setRoles((current) => current.filter((role) => role.user_id !== selected.id));
    setSelected(null); setConfirmDelete(false);
    toast.success("Utilisateur supprimé.");
  };

  const saveProfile = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name: name.trim(), phone: phone.trim(), avatar_url: avatar || null }).eq("id", selected.id);
    setSaving(false);
    if (error) { toast.error("Impossible de mettre à jour le profil."); return; }
    setProfiles((current) => current.map((profile) => profile.id === selected.id ? { ...profile, name: name.trim(), phone: phone.trim(), avatar_url: avatar || undefined } : profile));
    setSelected(null);
    toast.success("Profil utilisateur mis à jour.");
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  const summary = [
    { id: "all", title: "Tous les utilisateurs", count: counts.all },
    { id: "participants", title: "Participants", count: counts.participants },
    { id: "organizers", title: "Organisateurs", count: counts.organizers },
    { id: "owners", title: "Administrateurs", count: counts.owners },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-medium text-slate-400">KivuPass <span className="mx-1">/</span> Gestion</p><h1 className="mt-1 font-syne text-2xl font-bold tracking-tight text-slate-900">Utilisateurs</h1><p className="mt-1 text-sm text-slate-500">Consultez et mettez à jour les profils inscrits sur la plateforme.</p></div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto"><Button size="sm" onClick={() => setAddOpen(true)} className="gap-2 rounded-xl bg-[#247f76] text-white hover:bg-[#1d6d65]"><Plus size={14} />Ajouter un utilisateur</Button><Button size="sm" variant="outline" onClick={() => exportCSV(profiles, "utilisateurs")} className="gap-2 rounded-xl border-slate-200 bg-white text-slate-700"><Download size={14} />Exporter CSV</Button></div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4" aria-label="Résumé des utilisateurs">
        {summary.map((item) => <button type="button" key={item.id} onClick={() => setFilter(item.id)} className={`rounded-2xl border bg-white p-4 text-left shadow-[0_2px_8px_rgba(15,23,42,.025)] transition hover:border-[#8bc8bd] ${filter === item.id ? "border-[#278e83] ring-2 ring-[#278e83]/10" : "border-slate-200"}`}><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-500">{item.title}</span><Users size={16} className="text-[#278e83]" /></div><span className="mt-2 block font-syne text-2xl font-bold text-slate-900">{item.count}</span></button>)}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,.025)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="font-syne text-base font-bold text-slate-900">Tous les comptes <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 align-middle text-[10px] font-semibold text-slate-500">{visibleProfiles.length}</span></h2><p className="mt-1 text-xs text-slate-500">Sélectionnez un utilisateur pour modifier ses coordonnées ou sa photo.</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un utilisateur" className="h-9 w-full rounded-lg border-slate-200 bg-slate-50 pl-9 text-xs sm:w-56" /></label><button type="button" onClick={() => setFilter(filter === "all" ? "participants" : "all")} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Filter size={14} />{filter === "all" ? "Filtrer" : summary.find((item) => item.id === filter)?.title}</button></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead><tr className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400"><th className="px-6 py-3">Utilisateur</th><th className="px-4 py-3">Téléphone</th><th className="px-4 py-3">Espace</th><th className="px-4 py-3">Inscription</th><th className="px-6 py-3 text-right">Profil</th></tr></thead><tbody>{visibleProfiles.map((profile) => <tr key={profile.id} className="border-t border-slate-100 transition hover:bg-slate-50/60">
          <td className="px-6 py-3"><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e7f4f1] font-semibold text-[#278e83]">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : (profile.name || profile.email).slice(0, 1).toLocaleUpperCase("fr")}</span><span className="min-w-0"><span className="block truncate font-semibold text-slate-800">{profile.name || "Utilisateur"}</span><span className="mt-1 block truncate text-[10px] text-slate-400">{profile.email}</span></span></div></td>
          <td className="px-4 py-3 text-slate-500">{profile.phone || "—"}</td><td className="px-4 py-3"><span className="inline-flex rounded-full bg-[#eaf5f2] px-2.5 py-1 text-[10px] font-semibold text-[#278e83]">{roleLabel(profile)}</span></td><td className="px-4 py-3 text-slate-500">{profile.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR") : "—"}</td><td className="px-6 py-3 text-right"><button type="button" onClick={() => openProfile(profile)} aria-label={`Modifier ${profile.name || profile.email}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><MoreHorizontal size={17} /></button></td>
        </tr>)}</tbody></table>
          {visibleProfiles.length === 0 && <div className="px-6 py-12 text-center"><p className="text-sm font-medium text-slate-600">Aucun utilisateur trouvé.</p><p className="mt-1 text-xs text-slate-400">Essayez un autre nom, une autre adresse ou un filtre différent.</p></div>}
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-h-[90dvh] max-w-xl overflow-y-auto rounded-2xl border-slate-200 bg-white p-0">
          {selected && <>
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 pr-12"><DialogHeader><DialogTitle className="font-syne text-xl text-slate-900">{confirmDelete ? "Supprimer cet utilisateur ?" : "Profil utilisateur"}</DialogTitle><DialogDescription>{confirmDelete ? `Le compte de ${selected.name || selected.email} et ses informations de profil seront supprimés.` : `Modifiez les informations de ${selected.name || selected.email}. Le rôle reste géré par l’administration.`}</DialogDescription></DialogHeader></div>
            {confirmDelete ? <div className="px-6 py-5"><p className="text-sm text-slate-600">Cette action est définitive. Le compte ne pourra plus se connecter.</p></div> : <div className="space-y-5 px-6 py-5">
              <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#e7f4f1] font-semibold text-[#278e83]">{avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : (name || selected.email).slice(0, 1).toLocaleUpperCase("fr")}</span><div><p className="text-sm font-semibold text-slate-800">{selected.name || "Utilisateur"}</p><p className="text-xs text-slate-500">{selected.email}</p></div></div>
              <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-xs font-semibold text-slate-600">Nom complet<Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom de l’utilisateur" className="h-10 border-slate-200 bg-slate-50 text-sm" /></label><label className="space-y-1.5 text-xs font-semibold text-slate-600">Téléphone<Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+243…" className="h-10 border-slate-200 bg-slate-50 text-sm" /></label><label className="space-y-1.5 text-xs font-semibold text-slate-600 sm:col-span-2">Adresse e-mail<Input value={selected.email} disabled className="h-10 border-slate-200 bg-slate-100 text-sm text-slate-500" /></label></div>
              <ProfilePhotoField name={name} value={avatar} onChange={setAvatar} />
            </div>}
            <DialogFooter className="flex-col-reverse border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-between"><div>{confirmDelete ? <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)} className="rounded-lg border-slate-200">Annuler</Button> : <Button type="button" variant="outline" onClick={() => setConfirmDelete(true)} className="gap-2 rounded-lg border-red-200 text-red-700 hover:bg-red-50"><Trash2 size={14} />Supprimer</Button>}</div><div className="flex gap-2">{!confirmDelete && <Button type="button" variant="outline" onClick={() => setSelected(null)} className="rounded-lg border-slate-200">Fermer</Button>}{confirmDelete ? <Button type="button" onClick={() => void deleteUser()} disabled={deleting} className="rounded-lg bg-red-600 text-white hover:bg-red-700">{deleting ? "Suppression…" : "Confirmer la suppression"}</Button> : <Button type="button" onClick={() => void saveProfile()} disabled={saving} className="rounded-lg bg-[#247f76] text-white hover:bg-[#1d6d65]">{saving ? "Enregistrement…" : "Enregistrer"}</Button>}</div></DialogFooter>
          </>}
        </DialogContent>
      </Dialog>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto rounded-2xl border-slate-200 bg-white p-0">
          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 pr-12"><DialogHeader><DialogTitle className="font-syne text-xl text-slate-900">Ajouter un utilisateur</DialogTitle><DialogDescription>Créez un compte et choisissez son espace d’accès.</DialogDescription></DialogHeader></div>
          <form onSubmit={(event) => void createUser(event)}>
            <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Nom complet<Input required value={addName} onChange={(event) => setAddName(event.target.value)} placeholder="Nom de l’utilisateur" className="h-10 border-slate-200 bg-slate-50 text-sm" /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Adresse e-mail<Input required type="email" value={addEmail} onChange={(event) => setAddEmail(event.target.value)} placeholder="nom@exemple.com" className="h-10 border-slate-200 bg-slate-50 text-sm" /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Téléphone (facultatif)<Input value={addPhone} onChange={(event) => setAddPhone(event.target.value)} placeholder="+243…" className="h-10 border-slate-200 bg-slate-50 text-sm" /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Rôle<select value={addRole} onChange={(event) => setAddRole(event.target.value as typeof addRole)} className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm"><option value="participant">Participant</option><option value="organizer">Organisateur</option><option value="owner">Administrateur</option></select></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600 sm:col-span-2">Mot de passe temporaire<Input required minLength={6} type="password" value={addPassword} onChange={(event) => setAddPassword(event.target.value)} placeholder="Au moins 6 caractères" className="h-10 border-slate-200 bg-slate-50 text-sm" /></label>
            </div>
            <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-6 py-4"><Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="rounded-lg border-slate-200">Annuler</Button><Button type="submit" disabled={adding} className="gap-2 rounded-lg bg-[#247f76] text-white hover:bg-[#1d6d65]"><Plus size={14} />{adding ? "Création…" : "Créer le compte"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
