import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Bell, Clock3, Inbox, Plus, Search, Send, Users, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Message = { id: string; from_id: string; to_id: string; text: string; created_at: string };
type Profile = { id: string; name?: string; email?: string; avatar_url?: string; role?: string; status?: string };

export const AdminMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("Tous");
  const [sending, setSending] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [recipientQuery, setRecipientQuery] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingGroup, setSendingGroup] = useState(false);

  const load = async () => {
    const [{ data: messageRows }, { data: profileRows }] = await Promise.all([
      supabase.from("messages").select("*").order("created_at", { ascending: true }),
      supabase.from("profiles").select("*"),
    ]);
    setMessages((messageRows || []) as Message[]);
    setProfiles((profileRows || []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);
  useEffect(() => {
    const channel = supabase.channel("admin-inbox").on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => { void load(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const profileFor = (id: string) => profiles.find((profile) => profile.id === id);
  const conversations = useMemo(() => {
    const grouped = new Map<string, Message[]>();
    messages.forEach((message) => {
      const counterpart = message.from_id === user?.id || message.to_id === user?.id || message.to_id === "admin"
        ? (message.from_id === user?.id ? message.to_id : message.from_id)
        : message.from_id;
      if (!counterpart || counterpart === user?.id || counterpart === "admin") return;
      grouped.set(counterpart, [...(grouped.get(counterpart) || []), message]);
    });
    return Array.from(grouped.entries()).map(([id, thread]) => ({ id, messages: thread, last: thread[thread.length - 1] })).sort((a, b) => b.last.created_at.localeCompare(a.last.created_at));
  }, [messages, user?.id]);
  const filtered = conversations.filter((conversation) => {
    const profile = profileFor(conversation.id);
    const name = profile?.name || profile?.email || conversation.id;
    const matchesQuery = `${name} ${profile?.email || ""} ${conversation.last.text}`.toLocaleLowerCase("fr").includes(query.toLocaleLowerCase("fr"));
    if (!matchesQuery) return false;
    if (folder === "Non lus") return conversation.last.to_id === user?.id;
    if (folder === "Organisateurs") return profile?.role === "organizer";
    return true;
  });
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId);
  const selectedProfile = selectedId ? profileFor(selectedId) : undefined;
  const threadMessages = selectedConversation?.messages || [];
  const availableRecipients = profiles
    .filter((profile) => profile.id !== user?.id)
    .filter((profile) => `${profile.name || ""} ${profile.email || ""}`.toLocaleLowerCase("fr").includes(recipientQuery.trim().toLocaleLowerCase("fr")))
    .sort((a, b) => (a.name || a.email || "").localeCompare(b.name || b.email || "", "fr"));

  const toggleRecipient = (id: string) => setSelectedRecipients((current) => current.includes(id) ? current.filter((recipientId) => recipientId !== id) : [...current, id]);
  const toggleVisibleRecipients = () => {
    const visibleIds = availableRecipients.map((profile) => profile.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedRecipients.includes(id));
    setSelectedRecipients((current) => allSelected ? current.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...current, ...visibleIds])));
  };

  const sendToSelected = async () => {
    if (!user || !selectedRecipients.length || !newMessage.trim()) return;
    setSendingGroup(true);
    const body = newMessage.trim();
    const { error } = await supabase.from("messages").insert(selectedRecipients.map((to_id) => ({ from_id: user.id, to_id, text: body })));
    setSendingGroup(false);
    if (error) { toast.error(error.message || "Les messages n’ont pas pu être envoyés."); return; }
    const firstRecipient = selectedRecipients[0];
    setComposeOpen(false);
    setNewMessage(""); setSelectedRecipients([]); setRecipientQuery("");
    await load();
    setSelectedId(firstRecipient);
    toast.success(`Message envoyé à ${selectedRecipients.length} ${selectedRecipients.length === 1 ? "personne" : "personnes"}.`);
  };

  const sendReply = async () => {
    if (!selectedId || !replyText.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({ from_id: user.id, to_id: selectedId, text: replyText.trim() });
    setSending(false);
    if (error) { toast.error(error.message || "La réponse n’a pas pu être envoyée."); return; }
    setReplyText("");
    await load();
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-[#278e83] border-t-transparent" /></div>;

  const folders = [
    { label: "Toutes les conversations", id: "Tous", icon: Inbox, count: conversations.length },
    { label: "À traiter", id: "Non lus", icon: Bell, count: conversations.filter((thread) => thread.last.to_id === user?.id).length },
    { label: "Organisateurs", id: "Organisateurs", icon: Users, count: conversations.filter((thread) => profileFor(thread.id)?.role === "organizer").length },
  ];

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-medium text-slate-400">KivuPass <span className="mx-1">/</span> Gestion</p><h1 className="mt-1 font-syne text-2xl font-bold tracking-tight text-slate-900">Parlons avec vos utilisateurs</h1><p className="text-sm text-slate-500">Retrouvez ici les messages des participants et des organisateurs.</p></div><Button onClick={() => setComposeOpen(true)} className="gap-2 self-start rounded-xl bg-[#247f76] text-white hover:bg-[#1d6d65] sm:self-auto"><Plus size={16}/>Nouveau message</Button></div>
      <div className="grid min-h-[680px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_32px_rgba(15,23,42,.05)] lg:h-[calc(100dvh-235px)] lg:min-h-[620px] lg:grid-cols-[190px_270px_minmax(300px,1fr)] 2xl:grid-cols-[200px_290px_minmax(300px,1fr)_220px]">
        <aside className="border-b border-slate-100 p-4 lg:border-b-0 lg:border-r"><div className="mb-4"><h2 className="font-syne text-base font-bold text-slate-900">Messages</h2><p className="mt-1 text-[11px] text-slate-400">Un espace pour échanger</p></div><div className="mb-5 flex items-center gap-2 rounded-xl bg-[#f4f8f7] px-2.5 py-2"><span className="h-7 w-7 rounded-full bg-[#d7efea] text-center text-[11px] font-semibold leading-7 text-[#278e83]">{(user?.email || "A").slice(0, 1).toUpperCase()}</span><span className="min-w-0 truncate text-xs font-medium text-slate-700">Administration</span></div><div className="space-y-1">{folders.map(({ label, id, icon: Icon, count }) => <button key={id} onClick={() => setFolder(id)} className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-xs transition ${folder === id ? "bg-[#eaf5f2] font-semibold text-[#247f76]" : "text-slate-600 hover:bg-slate-50"}`}><Icon size={15}/><span className="flex-1">{label}</span><span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] text-slate-400">{count}</span></button>)}</div></aside>
        <section className={`border-b border-slate-100 lg:border-b-0 lg:border-r ${selectedId ? "hidden lg:block" : ""}`}><div className="border-b border-slate-100 p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-800">Conversations <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{filtered.length}</span></h2></div><label className="relative block"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un nom ou message" className="h-9 rounded-lg border-0 bg-slate-50 pl-8 text-xs"/></label></div><div className="max-h-[360px] overflow-y-auto lg:max-h-full">{filtered.length === 0 ? <div className="px-4 py-10 text-center"><Inbox size={25} className="mx-auto mb-2 text-slate-300"/><p className="text-xs font-medium text-slate-600">Pas encore de conversation</p><p className="mt-1 text-[10px] leading-4 text-slate-400">Les nouveaux messages apparaîtront ici.</p></div> : filtered.map((conversation) => { const profile = profileFor(conversation.id); const title = profile?.name || profile?.email || `Utilisateur ${conversation.id.slice(0, 6)}`; const active = selectedId === conversation.id; return <button key={conversation.id} onClick={() => setSelectedId(conversation.id)} className={`flex w-full gap-2.5 border-b border-slate-50 px-3 py-3 text-left hover:bg-slate-50 ${active ? "bg-[#eff9f6]" : ""}`}><span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5f2ef] text-xs font-semibold text-[#278e83]">{profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover"/> : title.slice(0,1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-1"><span className="truncate text-xs font-semibold text-slate-800">{title}</span><span className="shrink-0 text-[9px] text-slate-400">{new Date(conversation.last.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span></span><span className="mt-1 block truncate text-[10px] text-slate-500">{conversation.last.text}</span><span className="mt-1 block text-[9px] text-slate-400">{profile?.role === "organizer" ? "Organisateur" : profile?.role === "owner" ? "Administration" : "Utilisateur"}</span></span></button>; })}</div></section>
        <main className={`flex min-h-[520px] flex-col ${!selectedId ? "hidden lg:flex" : ""}`}><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div className="flex min-w-0 items-center gap-3">{selectedId && <button onClick={() => setSelectedId(null)} className="text-slate-400 lg:hidden" aria-label="Retour à la liste"><X size={17}/></button>}<span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5f2ef] text-xs font-semibold text-[#278e83]">{selectedProfile?.avatar_url ? <img src={selectedProfile.avatar_url} alt="" className="h-full w-full object-cover"/> : (selectedProfile?.name || selectedProfile?.email || "?").slice(0,1).toUpperCase()}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-800">{selectedProfile?.name || selectedProfile?.email || "Choisissez une conversation"}</span><span className="block text-[10px] text-slate-400">{selectedProfile?.email || "Vos échanges avec vos utilisateurs apparaîtront ici."}</span></span></div></div>
          <div className="flex-1 space-y-4 overflow-y-auto bg-[#fcfdfd] p-4 sm:p-6">{!selectedId ? <div className="flex h-full min-h-64 flex-col items-center justify-center text-center"><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf5f2] text-[#278e83]"><Inbox size={22}/></div><p className="text-sm font-semibold text-slate-700">Votre boîte de réception</p><p className="mt-1 max-w-xs text-xs text-slate-400">Sélectionnez une conversation pour lire et répondre aux messages.</p></div> : threadMessages.map((message) => { const mine = message.from_id === user?.id; return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] sm:max-w-[72%] ${mine ? "items-end" : "items-start"} flex flex-col`}><div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${mine ? "rounded-br-md bg-[#dff7ea] text-slate-700" : "rounded-bl-md bg-white text-slate-700 shadow-[0_1px_4px_rgba(15,23,42,.08)]"}`}>{message.text}</div><span className="mt-1 px-1 text-[9px] text-slate-400">{mine ? "Vous" : selectedProfile?.name || "Utilisateur"} · {new Date(message.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span></div></div>; })}</div>
          <div className="border-t border-slate-100 bg-white p-3 sm:p-4"><div className="rounded-xl border border-slate-200 bg-white focus-within:border-[#8bc8bd] focus-within:ring-2 focus-within:ring-[#278e83]/10"><Textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendReply(); } }} disabled={!selectedId} placeholder={selectedId ? "Écrivez votre réponse…" : "Sélectionnez une conversation pour répondre"} rows={2} className="min-h-[60px] resize-none border-0 bg-transparent text-sm focus-visible:ring-0"/><div className="flex items-center justify-between px-3 pb-2"><span className="text-[10px] text-slate-400">Votre réponse sera envoyée directement.</span><Button onClick={() => void sendReply()} disabled={!selectedId || !replyText.trim() || sending} size="sm" className="gap-2 rounded-lg bg-[#247f76] text-white hover:bg-[#1d6d65]">{sending ? "Envoi…" : "Envoyer"}<Send size={13}/></Button></div></div><p className="mt-1.5 text-right text-[9px] text-slate-400">Entrée pour envoyer · Maj + Entrée pour une nouvelle ligne</p></div>
        </main>
        <aside className="hidden overflow-y-auto border-l border-slate-100 bg-white p-4 2xl:block"><div className="mb-5 flex items-center justify-between"><h2 className="text-xs font-bold text-slate-800">À propos</h2><span className="text-slate-300"><Users size={14}/></span></div>{selectedId ? <><div className="flex flex-col items-center border-b border-slate-100 pb-5 text-center"><span className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#e5f2ef] text-lg font-semibold text-[#278e83]">{selectedProfile?.avatar_url ? <img src={selectedProfile.avatar_url} alt="" className="h-full w-full object-cover"/> : (selectedProfile?.name || selectedProfile?.email || "?").slice(0,1).toUpperCase()}</span><p className="text-sm font-semibold text-slate-800">{selectedProfile?.name || "Utilisateur"}</p><p className="mt-1 break-all text-[10px] text-slate-400">{selectedProfile?.email || selectedId}</p><span className="mt-2 rounded-full bg-[#eaf5f2] px-2.5 py-1 text-[9px] font-semibold text-[#278e83]">{selectedProfile?.role === "organizer" ? "Organisateur" : selectedProfile?.role === "owner" ? "Administrateur" : "Participant"}</span></div><div className="space-y-4 py-4"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Informations</p><p className="text-[11px] text-slate-500">Statut <span className="float-right font-medium text-emerald-600">{selectedProfile?.status === "suspended" ? "Suspendu" : "Actif"}</span></p><p className="mt-2 text-[11px] text-slate-500">Messages <span className="float-right font-medium text-slate-700">{threadMessages.length}</span></p></div><div className="border-t border-slate-100 pt-4"><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Dernier échange</p><div className="flex gap-2 text-[10px] text-slate-500"><Clock3 size={13}/> {new Date(selectedConversation!.last.created_at).toLocaleDateString("fr-FR")}</div></div></div></> : <div className="py-10 text-center text-xs text-slate-400">Les informations du contact s’afficheront ici.</div>}</aside>
      </div>
      <Dialog open={composeOpen} onOpenChange={(open) => { setComposeOpen(open); if (!open) { setRecipientQuery(""); setSelectedRecipients([]); setNewMessage(""); } }}>
        <DialogContent className="max-h-[90dvh] max-w-xl overflow-y-auto rounded-2xl border-slate-200 bg-white p-0">
          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 pr-12"><DialogHeader><DialogTitle className="font-syne text-xl text-slate-900">Nouveau message</DialogTitle><DialogDescription>Choisissez un ou plusieurs utilisateurs. Chacun recevra le message dans sa messagerie KivuPass.</DialogDescription></DialogHeader></div>
          <div className="space-y-4 px-6 py-5">
            <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-slate-700">Destinataires <span className="ml-1 rounded-full bg-[#eaf5f2] px-2 py-0.5 text-[#247f76]">{selectedRecipients.length} sélectionné{selectedRecipients.length === 1 ? "" : "s"}</span></p><button type="button" onClick={toggleVisibleRecipients} className="text-xs font-semibold text-[#247f76] hover:underline">{availableRecipients.length && availableRecipients.every((profile) => selectedRecipients.includes(profile.id)) ? "Tout désélectionner" : "Tout sélectionner"}</button></div>
            <label className="relative block"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><Input value={recipientQuery} onChange={(event) => setRecipientQuery(event.target.value)} placeholder="Rechercher un nom ou un e-mail" className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 text-sm"/></label>
            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-100">{availableRecipients.length ? availableRecipients.map((profile) => { const checked = selectedRecipients.includes(profile.id); return <label key={profile.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-50 px-3 py-2.5 last:border-0 hover:bg-slate-50"><input type="checkbox" checked={checked} onChange={() => toggleRecipient(profile.id)} className="h-4 w-4 accent-[#278e83]"/><span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#e5f2ef] text-xs font-semibold text-[#278e83]">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover"/> : (profile.name || profile.email || "?").slice(0,1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800">{profile.name || "Utilisateur"}</span><span className="block truncate text-[10px] text-slate-500">{profile.email || "Adresse e-mail non renseignée"}</span></span><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-500">{profile.role === "organizer" ? "Organisateur" : profile.role === "owner" ? "Admin" : "Participant"}</span></label>; }) : <p className="px-4 py-8 text-center text-xs text-slate-500">Aucun utilisateur ne correspond à cette recherche.</p>}</div>
            <label className="block space-y-1.5 text-xs font-semibold text-slate-700">Votre message<Textarea value={newMessage} onChange={(event) => setNewMessage(event.target.value)} placeholder="Bonjour, je vous contacte au sujet de…" rows={4} className="resize-y rounded-xl border-slate-200 bg-slate-50 text-sm font-normal"/></label>
          </div>
          <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-6 py-4"><Button type="button" variant="outline" onClick={() => setComposeOpen(false)} className="rounded-lg border-slate-200">Annuler</Button><Button type="button" onClick={() => void sendToSelected()} disabled={sendingGroup || !selectedRecipients.length || !newMessage.trim()} className="gap-2 rounded-lg bg-[#247f76] text-white hover:bg-[#1d6d65]"><Send size={14}/>{sendingGroup ? "Envoi…" : `Envoyer${selectedRecipients.length ? ` à ${selectedRecipients.length}` : ""}`}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
