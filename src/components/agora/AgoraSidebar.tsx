import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Home, LogOut } from "lucide-react";
import { AGORA_SPACE_NAME } from "@/lib/spaces";
import { AGORA_MENU_SECTIONS, type AgoraTabId } from "@/lib/agora";

interface Props {
  activeTab: AgoraTabId;
  onTabChange: (tab: AgoraTabId) => void;
  open: boolean;
  onClose: () => void;
}

export const AgoraSidebar = ({ activeTab, onTabChange, open, onClose }: Props) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-sidebar-border bg-sidebar-background transition-transform duration-300 lg:sticky lg:z-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="border-b border-sidebar-border p-6">
          <h2 className="font-syne text-lg font-bold text-primary">KivuPass</h2>
          <p className="mt-1 truncate text-xs text-muted-foreground">{user?.email}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {AGORA_SPACE_NAME}
            </span>
            <span className="text-[11px] text-muted-foreground">Acheter, créer, gérer</span>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto p-3">
          {AGORA_MENU_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      onClose();
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t border-sidebar-border p-3">
          <button
            onClick={() => navigate("/")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Home size={18} />
            Accueil
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};
