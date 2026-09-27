import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bike,
  Bus,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  Leaf,
  RotateCcw,
  ShieldCheck,
  TrainFront,
  Wallet,
} from "lucide-react";

import { SiteHeader } from "@/components/mobility/SiteHeader";
import { DemoDataNotice } from "@/components/rh/DemoDataNotice";
import { SourceBadge } from "@/components/rh/SourceBadge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { brl, dateTime } from "@/lib/rh/format";
import { demoStore } from "@/lib/wallet/demoStore";
import { employeeWalletService } from "@/lib/wallet/services";

const TITLE = "Minha carteira | MaaS Wallet";
const DESCRIPTION =
  "Consulte saldo, uso recente, política de mobilidade e impacto sustentável do benefício corporativo.";

export const Route = createFileRoute("/carteira")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CarteiraPage,
});

const TRANSACTION_STATUS = {
  CONFIRMADA: { label: "Confirmada", className: "text-success", icon: CheckCircle2 },
  PENDENTE: { label: "Pendente", className: "text-warning", icon: Clock3 },
  ESTORNADA: { label: "Estornada", className: "text-error", icon: RotateCcw },
} as const;

function TransportIcon({ modal }: { modal: string }) {
  if (modal === "Metrô" || modal === "Trem") return <TrainFront className="h-4 w-4" aria-hidden />;
  if (modal === "Ônibus") return <Bus className="h-4 w-4" aria-hidden />;
  if (modal === "Bicicleta") return <Bike className="h-4 w-4" aria-hidden />;
  return <Car className="h-4 w-4" aria-hidden />;
}

function WalletLoading() {
  return (
    <div aria-label="Carregando carteira" aria-busy="true" className="mt-6 space-y-4">
      <div className="h-48 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

function CarteiraPage() {
  const query = useQuery({
    queryKey: ["employee-wallet"],
    queryFn: () => employeeWalletService.getCurrent(),
  });

  const data = query.data;
  const remainingLimit = data ? Math.max(0, data.policy.monthlyLimit - data.policy.monthlyUsed) : 0;
  const usagePercent = data
    ? Math.min(100, Math.round((data.policy.monthlyUsed / data.policy.monthlyLimit) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-caption text-primary">Benefício corporativo</p>
            <h1 className="text-h1 mt-2 text-text-primary">Minha carteira</h1>
            <p className="text-body mt-2 text-text-secondary">
              Saldo, uso e regras da sua mobilidade em um só lugar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                demoStore.resetDemoData();
                void query.refetch();
              }}
              className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3.5 text-xs font-semibold text-text-secondary hover:bg-secondary hover:text-text-primary transition-colors"
              title="Restaurar estado inicial da demonstração (R$ 240,00 saldo / R$ 2.000,00 limite)"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restaurar demonstração
            </button>
            <Button asChild>
              <Link to="/planejar">
                Planejar viagem <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </header>

        {query.isLoading ? <WalletLoading /> : null}
        {query.isError ? (
          <div className="mt-6">
            <ErrorState
              description="Tente carregar os dados da carteira novamente."
              onRetry={() => void query.refetch()}
            />
          </div>
        ) : null}

        {data ? (
          <div className="mt-6 space-y-6">
            <DemoDataNotice text="Dados de demonstração. O saldo, as transações e as regras abaixo não representam movimentações financeiras reais." />

            <section
              aria-labelledby="wallet-summary"
              className="overflow-hidden rounded-lg border border-border bg-surface shadow-soft"
            >
              <div className="grid gap-px bg-border lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
                <div className="bg-card p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-3">
                    <p id="wallet-summary" className="text-caption text-text-secondary">
                      Saldo disponível
                    </p>
                    <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/15 text-primary">
                      <Wallet className="h-5 w-5" aria-hidden />
                    </span>
                  </div>
                  <p className="mt-5 font-display text-4xl font-bold text-text-primary">
                    {brl(data.wallet.balance)}
                  </p>
                  <p className="text-small mt-2 text-text-secondary">
                    Disponível para viagens elegíveis.
                  </p>
                </div>
                {[
                  ["Utilizado", brl(data.policy.monthlyUsed), `${usagePercent}% do limite`],
                  [
                    "Limite mensal",
                    brl(data.policy.monthlyLimit),
                    `${brl(remainingLimit)} restante`,
                  ],
                  ["Período", data.period, "Mês atual"],
                ].map(([label, value, hint]) => (
                  <div key={label} className="bg-card p-6">
                    <p className="text-caption text-text-secondary">{label}</p>
                    <p className="text-metric mt-5 text-text-primary">{value}</p>
                    <p className="text-small mt-2 text-text-secondary">{hint}</p>
                  </div>
                ))}
              </div>
              <div className="bg-card px-6 pb-6 sm:px-8">
                <div
                  className="h-2 overflow-hidden rounded-full bg-secondary"
                  role="progressbar"
                  aria-label="Uso do limite mensal"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={usagePercent}
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <section
                aria-labelledby="recent-usage"
                className="rounded-lg border border-border bg-surface p-5 shadow-soft sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 id="recent-usage" className="text-h3 text-text-primary">
                      Uso recente
                    </h2>
                    <p className="text-small mt-1 text-text-secondary">
                      Viagens registradas para {data.employeeName}.
                    </p>
                  </div>
                  <SourceBadge source={data.source} />
                </div>

                {data.recentTransactions.length ? (
                  <ul className="mt-5 divide-y divide-border">
                    {data.recentTransactions.map((transaction) => {
                      const status = TRANSACTION_STATUS[transaction.status];
                      const StatusIcon = status.icon;
                      return (
                        <li
                          key={transaction.id}
                          className="grid gap-3 py-4 first:pt-0 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
                        >
                          <span className="grid h-10 w-10 place-items-center rounded-md bg-accent text-primary">
                            <TransportIcon modal={transaction.modal} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-small font-semibold text-text-primary">
                              {transaction.modal}
                            </p>
                            <p className="text-small truncate text-text-secondary">
                              {transaction.origin} → {transaction.destination}
                            </p>
                            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-text-secondary">
                              <CalendarDays className="h-3.5 w-3.5" aria-hidden />{" "}
                              {dateTime(transaction.date)}
                            </p>
                          </div>
                          <div className="sm:text-right">
                            <p className="font-semibold text-text-primary">
                              {brl(transaction.amount)}
                            </p>
                            <p
                              className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${status.className}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" aria-hidden /> {status.label}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="mt-5">
                    <EmptyState
                      title="Nenhuma transação no período"
                      description="Quando houver uso da carteira, as viagens aparecerão aqui."
                    />
                  </div>
                )}
              </section>

              <div className="space-y-6">
                <section
                  aria-labelledby="mobility-policy"
                  className="rounded-lg border border-border bg-surface p-5 shadow-soft sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-success/15 text-success">
                      <ShieldCheck className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h2 id="mobility-policy" className="text-h3 text-text-primary">
                        Política de mobilidade
                      </h2>
                      <p className="text-small mt-1 text-success">Ativa · dados de demonstração</p>
                    </div>
                  </div>
                  <dl className="mt-5 space-y-3 text-small">
                    <div className="flex justify-between gap-4">
                      <dt className="text-text-secondary">Modal por aplicativo</dt>
                      <dd className="text-right text-text-primary">
                        Após {data.policy.rideHailingAllowedAfterHour}h
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-text-secondary">Teto por viagem de carro</dt>
                      <dd className="text-right text-text-primary">
                        {brl(data.policy.maxPerTripRideHailing)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-text-secondary">Teto transporte público</dt>
                      <dd className="text-right text-text-primary">
                        {data.policy.maxPerTripPublicTransport ? brl(data.policy.maxPerTripPublicTransport) : "Sem teto específico"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-text-secondary">Modais permitidos</dt>
                      <dd className="text-right text-text-primary">
                        {data.policy.allowedModals.length}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section
                  aria-labelledby="sustainability"
                  className="rounded-lg border border-border bg-surface p-5 shadow-soft sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-success/15 text-success">
                      <Leaf className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h2 id="sustainability" className="text-h3 text-text-primary">
                        Sustentabilidade
                      </h2>
                      <p className="text-small mt-1 text-text-secondary">
                        Impacto do período demonstrativo.
                      </p>
                    </div>
                  </div>
                  <p className="text-metric mt-5 text-success">
                    {data.co2AvoidedKg.toLocaleString("pt-BR")} kg
                  </p>
                  <p className="text-small mt-1 text-text-secondary">de CO₂ evitado</p>
                  <div className="mt-5 rounded-md bg-accent/30 p-3">
                    <p className="text-small font-semibold text-text-primary">
                      {data.cashbackCampaign.name}
                    </p>
                    <p className="text-small mt-1 text-text-secondary">
                      {data.cashbackCampaign.description}
                    </p>
                  </div>
                </section>
              </div>
            </div>

            <section
              aria-label="Jornada corporativa"
              className="rounded-lg border border-border bg-surface p-5 sm:p-6"
            >
              <p className="text-caption text-primary">Como o benefício se conecta</p>
              <ol className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {["Colaborador", "Viagem", "Carteira", "Política", "Empresa", "Gestão"].map(
                  (item, index) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-small font-semibold text-text-primary"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs text-primary">
                        {index + 1}
                      </span>
                      {item}
                      {index < 5 ? (
                        <ArrowRight
                          className="ml-auto hidden h-4 w-4 text-text-secondary lg:block"
                          aria-hidden
                        />
                      ) : null}
                    </li>
                  ),
                )}
              </ol>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
