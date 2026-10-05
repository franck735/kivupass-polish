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
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border bg-white shadow-[4px_0_18px_rgba(15,23,42,0.03)] transition-transform duration-300 lg:sticky lg:z-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="border-b border-sidebar-border px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground shadow-sm">KP</div>
            <div><h2 className="font-syne text-lg font-bold leading-tight text-foreground">Kivu<span className="text-primary">Pass</span></h2><p className="text-[11px] font-medium text-muted-foreground">Espace Agora</p></div>
          </div>
          <div className="mt-4 flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{(user?.full_name || user?.email || "K").slice(0, 1).toUpperCase()}</div>
            <div className="min-w-0"><p className="truncate text-xs font-semibold text-foreground">{user?.full_name || "Mon compte"}</p><p className="truncate text-[11px] text-muted-foreground">{user?.email}</p></div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {AGORA_SPACE_NAME}
            </span>
          </div>
        </div>

        <nav aria-label="Navigation Agora" className="flex-1 space-y-5 overflow-y-auto p-3">
          {AGORA_MENU_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/75">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    aria-current={activeTab === item.id ? "page" : undefined}
                    onClick={() => {
                      onTabChange(item.id);
                      onClose();
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10"
                        : "text-slate-600 hover:bg-slate-50 hover:text-foreground"
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
