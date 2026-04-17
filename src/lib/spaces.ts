import { supabase } from "@/integrations/supabase/client";

export const AGORA_SPACE_NAME = "Agora";
export const ADMIN_SPACE_NAME = "Administration";
export const AGORA_DASHBOARD_PATH = "/dashboard/agora";
export const ADMIN_DASHBOARD_PATH = "/dashboard/admin";
export const AGORA_SOURCE_ROLES = ["participant", "organizer"] as const;

export const isAgoraSourceRole = (role?: string | null) =>
  role === "participant" || role === "organizer";

export const resolveDashboardPath = async (userId: string) => {
  const { data: isOwner } = await supabase.rpc("has_role", { _user_id: userId, _role: "owner" });
  return isOwner ? ADMIN_DASHBOARD_PATH : AGORA_DASHBOARD_PATH;
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
