import { supabase } from "@/integrations/supabase/client";

export const AGORA_SPACE_NAME = "Agora";
export const ADMIN_SPACE_NAME = "Administration";
export const AGORA_DASHBOARD_PATH = "/dashboard/agora";
export const ADMIN_DASHBOARD_PATH = "/dashboard/admin";
export const AGORA_SOURCE_ROLES = ["attendee", "organizer"] as const;

export const isAgoraSourceRole = (role?: string | null) =>
  role === "attendee" || role === "participant" || role === "organizer";

export const resolveDashboardPath = async (userId: string) => {
  try {
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (!rolesError && roles?.some(({ role }) => role === "owner")) {
      return ADMIN_DASHBOARD_PATH;
    }
    const { data: isOwner, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "owner" });
    if (error) {
      console.error("Impossible de vérifier le rôle du compte :", error);
      return "/dashboard";
    }
    return isOwner ? ADMIN_DASHBOARD_PATH : AGORA_DASHBOARD_PATH;
  } catch (error) {
    console.error("Impossible de déterminer l’espace du compte :", error);
    return "/dashboard";
  }
};

export const mapRolesToSpaces = (roles: string[]) => {
  const spaces = new Set<string>();

  if (roles.includes("owner")) {
    spaces.add(ADMIN_SPACE_NAME);
  }

  if (roles.some((role) => isAgoraSourceRole(role))) {
    spaces.add(AGORA_SPACE_NAME);
  }

  return Array.from(spaces);
};
