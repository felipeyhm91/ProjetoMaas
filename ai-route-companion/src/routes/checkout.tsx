import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  AlertTriangle,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Wallet,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/mobility/SiteHeader";
import { DataSourceBadge } from "@/components/mobility/DataSourceBadge";
import { brl, fmtMin } from "@/components/mobility/OptionCard";
import { demoStore, type SelectedTripInfo } from "@/lib/wallet/demoStore";

const TITLE = "Checkout da Viagem | MaaS Wallet";
const DESC = "Revise e confirme a reserva da sua viagem multimodal.";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const [selectedTrip, setSelectedTrip] = useState<SelectedTripInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const trip = demoStore.getSelectedTrip();
    if (!trip) {
      void navigate({ to: "/planejar" });
    } else {
      setSelectedTrip(trip);
    }
  }, [navigate]);

  if (!selectedTrip) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto flex max-w-6xl items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  const { option, originLabel, destinationLabel, departTime } = selectedTrip;
  const currentBalance = demoStore.getBalance();
  const tripCost = option.estimatedPrice;
  const cashbackEarned = option.cashback || 0;
  const balanceAfter = Number((currentBalance - tripCost + cashbackEarned).toFixed(2));
  const hasBalance = currentBalance >= tripCost;

  const handleConfirmPayment = () => {
    setPaymentError(null);
    setLoading(true);

    setTimeout(() => {
      const res = demoStore.processPayment(selectedTrip);
      if (!res.success) {
        setPaymentError(res.error || "Não foi possível processar o pagamento simulado.");
        setLoading(false);
      } else {
        void navigate({ to: "/confirmacao" });
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {/* HEADER DA PÁGINA */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/planejar"
              className="focus-ring inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao planejamento
            </Link>
            <h1 className="text-h1 mt-2 text-text-primary">Revise sua viagem</h1>
            <p className="text-body mt-1 text-text-secondary">
              Confira os detalhes e autorize a reserva pela sua carteira corporativa.
            </p>
          </div>

          <div className="rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning border border-warning/30">
            SIMULAÇÃO / DEMO
          </div>
        </div>

        {/* ALERTA DE AMBIENTE DE DEMONSTRAÇÃO */}
        <div role="status" className="mt-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-text-primary">
          <Sparkles className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <p className="text-small">
            <strong className="font-semibold text-primary">Ambiente de demonstração:</strong> Nenhum pagamento real será processado e nenhum valor financeiro externo será cobrado.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* DETALHES DA VIAGEM SELECIONADA */}
          <section aria-label="Detalhes da viagem" className="space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-soft">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <span className="text-caption text-primary font-medium">Opção selecionada</span>
                  <h2 className="text-h2 text-text-primary">{option.productName}</h2>
                </div>
                <DataSourceBadge source={option.dataSource} />
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-caption text-text-secondary">Origem</p>
                    <p className="text-small font-semibold text-text-primary">{originLabel}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <div>
                    <p className="text-caption text-text-secondary">Destino</p>
                    <p className="text-small font-semibold text-text-primary">{destinationLabel}</p>
                  </div>
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
                <div>
                  <dt className="text-caption text-text-secondary">Horário</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-small font-semibold text-text-primary">
                    <Clock className="h-4 w-4 text-primary" /> {departTime || "Agora"}
                  </dd>
                </div>
                <div>
                  <dt className="text-caption text-text-secondary">Duração</dt>
                  <dd className="mt-1 text-small font-semibold text-text-primary">
                    {fmtMin(option.estimatedTimeMinutes)}
                  </dd>
                </div>
                <div>
                  <dt className="text-caption text-text-secondary">Custo</dt>
                  <dd className="mt-1 text-small font-semibold text-text-primary">
                    {brl(option.estimatedPrice)}
                  </dd>
                </div>
                <div>
                  <dt className="text-caption text-text-secondary">Cashback</dt>
                  <dd className="mt-1 text-small font-semibold text-success">
                    {cashbackEarned > 0 ? `+ ${brl(cashbackEarned)}` : "R$ 0,00"}
                  </dd>
                </div>
              </dl>

              {option.crowding && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent/30 p-3 text-xs text-text-primary">
                  <Users className="h-4 w-4 text-primary" />
                  <span>
                    Lotação estimada: <strong className="font-semibold">{option.crowding.label} ({option.crowding.occupancyPercent}%)</strong>
                  </span>
                </div>
              )}

              <div className="mt-5 rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-success">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="h-4 w-4" /> Política corporativa
                </div>
                <p className="mt-1 text-text-primary">
                  {option.corporatePolicyMessage || "Viagem totalmente elegível dentro dos parâmetros da política da empresa."}
                </p>
              </div>
            </div>
          </section>

          {/* CHECKOUT / FORMA DE PAGAMENTO */}
          <section aria-label="Pagamento simulado" className="space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-soft">
              <h2 className="text-h3 border-b border-border pb-3 text-text-primary">
                Pagamento
              </h2>

              <div className="mt-4">
                <p className="text-caption text-text-secondary">Forma de pagamento</p>
                <div className="mt-2 flex items-center justify-between rounded-lg border border-primary/40 bg-primary/10 p-3.5 text-text-primary">
                  <div className="flex items-center gap-2.5">
                    <Wallet className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-small font-semibold">Carteira MaaS</p>
                      <p className="text-[11px] text-text-secondary">Benefício Corporativo Tech Solutions</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              </div>

              {/* RESUMO FINANCEIRO */}
              <div className="mt-6 space-y-3 rounded-lg border border-border bg-background p-4 text-small">
                <div className="flex justify-between text-text-secondary">
                  <span>Saldo disponível</span>
                  <span className="font-semibold text-text-primary">{brl(currentBalance)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Valor da viagem</span>
                  <span className="font-semibold text-error">- {brl(tripCost)}</span>
                </div>
                {cashbackEarned > 0 && (
                  <div className="flex justify-between text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5 text-success" /> Cashback a receber
                    </span>
                    <span className="font-semibold text-success">+ {brl(cashbackEarned)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-3 font-semibold text-text-primary">
                  <span>Saldo estimado após viagem</span>
                  <span className={balanceAfter >= 0 ? "text-success" : "text-error"}>
                    {brl(balanceAfter)}
                  </span>
                </div>
              </div>

              {/* ERROS E BLOQUEIOS */}
              {!hasBalance && (
                <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error font-medium">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Saldo insuficiente para esta viagem.</p>
                    <p className="mt-0.5 text-text-secondary">
                      Seu saldo de {brl(currentBalance)} não cobre o custo de {brl(tripCost)}.
                    </p>
                  </div>
                </div>
              )}

              {paymentError && (
                <div role="alert" className="mt-4 rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error font-medium">
                  {paymentError}
                </div>
              )}

              {/* BOTÃO PRINCIPAL */}
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={loading || !hasBalance || !option.corporateEligible}
                className="focus-ring mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-primary-foreground transition-opacity hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando pagamento simulado…
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Pagar e confirmar viagem
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[11px] text-text-secondary">
                Ao clicar em confirmar, a simulação descontará o valor do seu saldo corporativo local.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
