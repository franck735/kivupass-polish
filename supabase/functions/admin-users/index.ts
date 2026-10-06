import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "Méthode non autorisée." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("Authorization");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization) return json(401, { error: "Session admin requise." });

  const caller = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const { data: { user }, error: authError } = await caller.auth.getUser();
  if (authError || !user) return json(401, { error: "Session expirée. Reconnectez-vous." });

  const { data: isOwner, error: roleError } = await caller.rpc("has_role", { _user_id: user.id, _role: "owner" });
  if (roleError || !isOwner) return json(403, { error: "Seul un administrateur peut gérer les comptes." });

  let body: { action?: string; email?: string; password?: string; name?: string; phone?: string; role?: string; user_id?: string };
  try { body = await request.json(); } catch { return json(400, { error: "Requête invalide." }); }
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

  if (body.action === "delete") {
    if (!body.user_id || body.user_id === user.id) return json(400, { error: "Identifiant invalide. Vous ne pouvez pas supprimer votre propre compte." });
    const { error } = await admin.auth.admin.deleteUser(body.user_id);
    return error ? json(400, { error: error.message }) : json(200, { success: true });
  }

  if (body.action !== "create") return json(400, { error: "Action inconnue." });
  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim();
  const role = body.role;
  if (!email || !name || !body.password || body.password.length < 6 || !["participant", "organizer", "owner"].includes(role || "")) {
    return json(400, { error: "Renseignez un nom, un e-mail, un mot de passe d’au moins 6 caractères et un rôle valide." });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: body.password,
    email_confirm: true,
    user_metadata: { full_name: name, phone: body.phone?.trim() || "" },
  });
  if (createError || !created.user) return json(400, { error: createError?.message || "Le compte n’a pas pu être créé." });

  // New signups receive the database's attendee role from the auth trigger.
  // Organizers and additional admins receive the extra role needed for their space.
  const databaseRole = role === "participant" ? "attendee" : role;
  const { error: roleInsertError } = await admin.from("user_roles").upsert(
    { user_id: created.user.id, role: databaseRole },
    { onConflict: "user_id,role" },
  );
  if (roleInsertError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return json(500, { error: "Le rôle du compte n’a pas pu être enregistré." });
  }

  if (role !== "participant") {
    await admin.from("user_roles").delete().eq("user_id", created.user.id).eq("role", "attendee");
  }

  if (body.phone?.trim()) {
    await admin.from("profiles").update({ phone: body.phone.trim() }).eq("id", created.user.id);
  }
  return json(200, { success: true, user_id: created.user.id });
});
