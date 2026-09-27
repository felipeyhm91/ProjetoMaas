import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Coins,
  MapPin,
  Route as RouteIcon,
  Sparkles,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/mobility/SiteHeader";
import { brl, fmtMin } from "@/components/mobility/OptionCard";
import { demoStore, type ConfirmedTripInfo } from "@/lib/wallet/demoStore";

const TITLE = "Viagem Confirmada | MaaS Wallet";
const DESC = "Confirmação do pagamento simulado e detalhes da reserva da viagem.";

export const Route = createFileRoute("/confirmacao")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: ConfirmacaoPage,
});

function ConfirmacaoPage() {
  const navigate = useNavigate();
  const [confirmedTrip, setConfirmedTrip] = useState<ConfirmedTripInfo | null>(null);

  useEffect(() => {
    const confirmed = demoStore.getConfirmedTrip();
    if (!confirmed) {
      void navigate({ to: "/planejar" });
    } else {
      setConfirmedTrip(confirmed);
    }
  }, [navigate]);

  if (!confirmedTrip) return null;

  const { option, originLabel, destinationLabel, departTime, transactionId, paidAmount, cashbackEarned, balanceAfter } = confirmedTrip;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success shadow-glow">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success border border-success/30">
            ✅ Pagamento simulado realizado
          </span>
          <h1 className="text-h1 mt-3 text-text-primary">Viagem confirmada!</h1>
          <p className="text-body mt-2 text-text-secondary">
            Sua reserva foi concluída com sucesso no ambiente de demonstração.
          </p>
        </div>

        {/* CARD DE DETALHES DA RESERVA */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          <div className="bg-brand-gradient p-6 text-primary-foreground sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary-foreground/20 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-primary-foreground/80">
                  Comprovante de demonstração
                </p>
                <h2 className="text-h2 mt-1 text-primary-foreground">{option.productName}</h2>
              </div>
              <span className="rounded-md bg-background/20 px-3 py-1 font-mono text-xs font-semibold backdrop-blur-md">
                ID: {transactionId.slice(0, 16)}
              </span>
            </div>

            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-primary-foreground/75">De (Origem)</p>
                <p className="font-semibold text-primary-foreground">{originLabel}</p>
              </div>
              <div>
                <p className="text-xs text-primary-foreground/75">Para (Destino)</p>
                <p className="font-semibold text-primary-foreground">{destinationLabel}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <dl className="grid grid-cols-2 gap-4 border-b border-border pb-6 sm:grid-cols-4 text-small">
              <div>
                <dt className="text-caption text-text-secondary">Horário</dt>
                <dd className="mt-1 font-semibold text-text-primary flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" /> {departTime || "Agora"}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-text-secondary">Duração estimada</dt>
                <dd className="mt-1 font-semibold text-text-primary">{fmtMin(option.estimatedTimeMinutes)}</dd>
              </div>
              <div>
                <dt className="text-caption text-text-secondary">Valor pago</dt>
                <dd className="mt-1 font-semibold text-text-primary">{brl(paidAmount)}</dd>
              </div>
              <div>
                <dt className="text-caption text-text-secondary">Cashback creditado</dt>
                <dd className="mt-1 font-semibold text-success">
                  {cashbackEarned > 0 ? `+ ${brl(cashbackEarned)}` : "R$ 0,00"}
                </dd>
              </div>
            </dl>

            {/* STATUS DO SALDO */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4 text-small">
              <div className="flex items-center gap-2.5">
                <Wallet className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-text-primary">Saldo atualizado na carteira</p>
                  <p className="text-xs text-text-secondary">Disponível para suas próximas viagens</p>
                </div>
              </div>
              <p className="text-metric text-success font-bold">{brl(balanceAfter)}</p>
            </div>

            {/* NOTA TRANSPARENTE */}
            <div className="flex items-center gap-2.5 rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs text-text-primary">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span>
                <strong>DEMONSTRAÇÃO:</strong> O extrato da sua carteira corporativa já foi atualizado localmente com esta transação.
              </span>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
              <Link
                to="/carteira"
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Wallet className="h-4 w-4" /> Ver minha carteira
              </Link>

              <Link
                to="/planejar"
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-6 font-semibold text-text-primary hover:bg-secondary"
              >
                <RouteIcon className="h-4 w-4" /> Planejar outra viagem <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
