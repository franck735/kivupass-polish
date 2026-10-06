import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "owner" | "organizer" | "participant" | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setRole(null); setLoading(false); return; }
    let active = true;
    setLoading(true);
    const check = async () => {
      try {
        // The authenticated user is allowed to read their own role rows. Read
        // them directly first so routing does not silently demote an admin if
        // the RPC is unavailable or its result is stale.
        const { data: rows, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        if (!active) return;
        if (!rolesError && rows) {
          const roles = rows.map(({ role }) => role as string);
          if (roles.includes("owner")) { setRole("owner"); return; }
          if (roles.includes("organizer")) { setRole("organizer"); return; }
          if (roles.includes("attendee") || roles.includes("participant")) { setRole("participant"); return; }
        }

        const { data: isOwner, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "owner" });
        if (!active) return;
        if (error) console.error("Impossible de lire le rôle du compte :", error);
        if (isOwner) { setRole("owner"); return; }
        const { data: isOrganizer, error: organizerError } = await supabase.rpc("has_role", { _user_id: user.id, _role: "organizer" });
        if (!active) return;
        if (organizerError) console.error("Impossible de lire le rôle organisateur :", organizerError);
        setRole(isOrganizer ? "organizer" : "participant");
      } catch (error) {
        if (!active) return;
        console.error("Erreur pendant la résolution du rôle :", error);
        setRole("participant");
      } finally {
        if (active) setLoading(false);
      }
    };
    void check();
    return () => { active = false; };
  }, [user]);

  return { role, loading };
};
