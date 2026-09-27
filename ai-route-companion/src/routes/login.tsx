import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Route as RouteIcon, ShieldCheck, ArrowRight, Lock, Mail, Sparkles } from "lucide-react";
import { demoStore } from "@/lib/wallet/demoStore";

const TITLE = "Login | MaaS Wallet";
const DESC = "Entre para acessar seu planejamento e carteira de mobilidade corporativa.";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@maaswallet.com");
  const [password, setPassword] = useState("demo123");
  const [keepConnected, setKeepConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = demoStore.login(email, password);
      if (!res.success) {
        setError(res.message || "Credenciais de demonstração inválidas.");
        setLoading(false);
      } else {
        void navigate({ to: "/planejar" });
      }
    }, 400);
  };

  const fillDemo = () => {
    setEmail("demo@maaswallet.com");
    setPassword("demo123");
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-gradient text-primary-foreground">
              <RouteIcon className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-display text-base font-bold text-text-primary">
              MaaS Wallet
            </span>
          </Link>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
            Ambiente de Demonstração
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
              <RouteIcon className="h-6 w-6" aria-hidden />
            </div>
            <h1 className="text-h2 font-bold text-text-primary">MaaS Wallet</h1>
            <p className="text-body mt-2 text-text-secondary">
              Entre para acessar sua mobilidade corporativa
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
            <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-text-primary">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Credenciais de Demonstração:
                </span>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  Preencher dados
                </button>
              </div>
              <p className="mt-1 font-mono text-text-secondary">
                E-mail: demo@maaswallet.com · Senha: demo123
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-small font-semibold text-text-primary" htmlFor="email">
                  E-mail corporativo
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-text-secondary" aria-hidden />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    className="focus-ring w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-3 text-small text-text-primary placeholder:text-text-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="text-small font-semibold text-text-primary" htmlFor="password">
                  Senha
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-text-secondary" aria-hidden />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="focus-ring w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-3 text-small text-text-primary placeholder:text-text-secondary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 font-medium text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepConnected}
                    onChange={(e) => setKeepConnected(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  Manter conectado
                </label>
                <span className="text-text-secondary">Autenticação MOCK</span>
              </div>

              {error && (
                <div role="alert" className="rounded-md border border-error/30 bg-error/10 p-3 text-xs text-error font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 font-semibold text-primary-foreground transition-opacity hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? "Entrando…" : "Entrar"}
                {!loading && <ArrowRight className="h-4 w-4" aria-hidden />}
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span>Demonstração de alta fidelidade — Nenhum dado sensível é armazenado.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
