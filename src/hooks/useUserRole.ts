import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "owner" | "organizer" | "attendee" | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setRole(null); setLoading(false); return; }

    const check = async () => {
      const { data: isOwner } = await supabase.rpc("has_role", { _user_id: user.id, _role: "owner" });
      if (isOwner) { setRole("owner"); setLoading(false); return; }

      const { data: isOrganizer } = await supabase.rpc("has_role", { _user_id: user.id, _role: "organizer" });
      if (isOrganizer) { setRole("organizer"); setLoading(false); return; }

      setRole("attendee");
      setLoading(false);
    };
    check();
  }, [user]);

  return { role, loading };
};
