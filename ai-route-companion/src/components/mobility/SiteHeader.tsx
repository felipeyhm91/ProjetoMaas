import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Route as RouteIcon, User, LogIn } from "lucide-react";
import { demoStore, type DemoUser } from "@/lib/wallet/demoStore";

const NAV = [
  { to: "/", label: "Início", exact: true },
  { to: "/planejar", label: "Planejar viagem", exact: false },
  { to: "/carteira", label: "Minha carteira", exact: false },
  { to: "/rh", label: "Portal RH", exact: false },
] as const;

export function SiteHeader() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<{ isAuthenticated: boolean; user: DemoUser }>({
    isAuthenticated: true,
    user: demoStore.getAuth().user,
  });

  useEffect(() => {
    setAuthState(demoStore.getAuth());
  }, []);

  const handleLogout = () => {
    demoStore.logout();
    setAuthState({ isAuthenticated: false, user: demoStore.getAuth().user });
    void navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/"
          className="focus-ring flex min-w-0 items-center gap-2 rounded-md"
          aria-label="MaaS Wallet — início"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-gradient text-primary-foreground">
            <RouteIcon className="h-5 w-5" aria-hidden />
          </span>
          <span className="truncate font-display text-base font-bold text-text-primary">
            MaaS Wallet
          </span>
        </Link>

        <nav aria-label="Principal" className="flex items-center gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.exact }}
              className={`focus-ring inline-flex min-h-11 items-center rounded-md px-2.5 font-medium text-text-secondary transition-colors hover:bg-secondary hover:text-text-primary sm:px-3 [&.active]:text-primary ${n.to === "/" ? "hidden sm:inline-flex" : ""}`}
            >
              {n.to === "/planejar" ? (
                <>
                  <span className="sm:hidden">Planejar</span>
                  <span className="hidden sm:inline">{n.label}</span>
                </>
              ) : n.to === "/carteira" ? (
                <>
                  <span className="sm:hidden">Carteira</span>
                  <span className="hidden sm:inline">{n.label}</span>
                </>
              ) : n.to === "/rh" ? (
                <>
                  <span className="sm:hidden">RH</span>
                  <span className="hidden sm:inline">{n.label}</span>
                </>
              ) : (
                n.label
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {authState.isAuthenticated ? (
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <div className="hidden flex-col text-right sm:flex">
                <span className="text-xs font-semibold text-text-primary">
                  {authState.user.name}
                </span>
                <span className="text-[10px] text-text-secondary">Colaborador</span>
              </div>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                {authState.user.name ? authState.user.name.charAt(0) : "U"}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                title="Sair da conta de demonstração"
                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-secondary hover:text-error transition-colors"
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <LogIn className="h-3.5 w-3.5" /> Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
