import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertTriangle,
  Leaf,
  Lightbulb,
  Route as RouteIcon,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DemoDataNotice } from "@/components/rh/DemoDataNotice";
import { RhKpiCard } from "@/components/rh/RhKpiCard";
import { RhPageHeader, RhSection } from "@/components/rh/RhSection";
import { RH_CHART_COLORS } from "@/components/rh/RhShell";
import { Button } from "@/components/ui/button";
import { brl, brlCompact, num, pct } from "@/lib/rh/format";
import { rhDashboardService } from "@/lib/rh/services";
import type { AlertKind } from "@/lib/rh/types";
import mobilityNetwork from "@/assets/mobility-network-night.jpg";

export const Route = createFileRoute("/rh/")({
  head: () => ({
    meta: [
      { title: "Gestão de Mobilidade — Portal RH | MaaS Corporate AI" },
      {
        name: "description",
        content:
          "Acompanhe benefícios, custos, cashback e comportamento de mobilidade dos colaboradores da sua empresa.",
      },
      { property: "og:title", content: "Gestão de Mobilidade — Portal RH" },
      {
        property: "og:description",
        content: "Dashboard corporativo de créditos, gastos por modal e alertas inteligentes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RhDashboard,
});

const ALERT_ICON: Record<AlertKind, typeof Lightbulb> = {
  BUDGET: AlertTriangle,
  SAVING: Lightbulb,
  SUSTAINABILITY: Leaf,
  ANOMALY: AlertTriangle,
};

function RhDashboard() {
  const [months, setMonths] = useState<3 | 6 | 12>(6);
  const { data } = useQuery({
    queryKey: ["rh", "dashboard"],
    queryFn: () => rhDashboardService.getDashboard(),
  });
  const { data: history } = useQuery({
    queryKey: ["rh", "spend", months],
    queryFn: () => rhDashboardService.getSpendHistory(months),
  });
  const { data: overview } = useQuery({
    queryKey: ["rh", "corporate-overview"],
    queryFn: () => rhDashboardService.getCorporateOverview(),
  });

  if (!data || !overview) {
    return <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />;
  }

  const k = data.kpis;

  return (
    <div className="space-y-6">
      <section className="relative min-h-48 overflow-hidden rounded-lg border border-border">
        <img
          src={mobilityNetwork}
          alt="Rede urbana conectada monitorada pelo portal de mobilidade"
          width={1600}
          height={900}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklab,var(--background)_84%,transparent)_55%,color-mix(in_oklab,var(--background)_30%,transparent)_100%)]" />
        <div className="relative z-10 flex min-h-48 max-w-xl flex-col justify-center p-6 sm:p-8">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            <span className="signal-pulse h-2 w-2 rounded-full bg-primary" /> OPERAÇÃO CONECTADA
          </p>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Inteligência para cada deslocamento
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Visibilidade unificada sobre custos, pessoas, modais e impacto ambiental.
          </p>
        </div>
      </section>
      <RhPageHeader
        title="Gestão de Mobilidade"
        subtitle="Visão consolidada da mobilidade dos colaboradores."
        action={
          <Button asChild variant="outline">
            <Link to="/rh/intelligence">Ver MaaS Intelligence</Link>
          </Button>
        }
      />

      <DemoDataNotice />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <RhKpiCard
          label="Gasto no período"
          value={brlCompact(overview.spend)}
          hint="Créditos utilizados"
          icon={<Wallet className="h-4 w-4" />}
        />
        <RhKpiCard
          label="Colaboradores"
          value={num(overview.employees)}
          hint="Ativos no programa"
          icon={<Users className="h-4 w-4" />}
        />
        <RhKpiCard
          label="Viagens"
          value={num(overview.trips)}
          hint="No mês atual"
          icon={<RouteIcon className="h-4 w-4" />}
        />
        <RhKpiCard
          label="CO₂ evitado"
          value={`${num(overview.co2AvoidedKg)} kg`}
          hint="Impacto estimado no período"
          accent="eco"
          icon={<Leaf className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <RhSection
          className="xl:col-span-3"
          title="Gastos com mobilidade"
          description="Evolução do custo total do programa."
          action={
            <div className="flex rounded-xl border border-border p-0.5">
              {([3, 6, 12] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    months === m
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m} meses
                </button>
              ))}
            </div>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history ?? []} margin={{ left: 4, right: 4, top: 8 }}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  fontSize={12}
                />
                <Tooltip
                  formatter={(v: number) => [brlCompact(v), "Gasto"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  fill="url(#spendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </RhSection>

        <RhSection
          className="xl:col-span-2"
          title="Como nossos colaboradores estão se deslocando?"
          description="Distribuição das viagens e custo por modal."
        >
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.modalShare}
                  dataKey="share"
                  nameKey="modal"
                  innerRadius={45}
                  outerRadius={72}
                  paddingAngle={3}
                >
                  {data.modalShare.map((_, i) => (
                    <Cell key={i} fill={RH_CHART_COLORS[i % RH_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, n: string) => [`${v}%`, n]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {data.modalShare.map((m, i) => (
              <li key={m.modal} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: RH_CHART_COLORS[i % RH_CHART_COLORS.length] }}
                />
                <span className="text-foreground">
                  {m.icon} {m.modal}
                </span>
                <span className="ml-auto text-muted-foreground">
                  {m.share}% · {brlCompact(m.cost)}
                </span>
              </li>
            ))}
          </ul>
        </RhSection>
      </div>

      <RhSection
        title="Distribuição de demanda & lotação"
        description="Acompanhamento da concentração de deslocamentos por faixa horária."
        action={<span className="text-xs text-muted-foreground">Demonstração MOCK</span>}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Pico Manhã (07h-09h)", "38%", "Ocupação alta", "text-error"],
            ["Fora de Pico (09h-17h)", "24%", "Ocupação moderada", "text-warning"],
            ["Pico Tarde (17h-19h)", "32%", "Ocupação alta", "text-error"],
            ["Flexível / Noite (19h-23h)", "6%", "Baixa ocupação · +2% Cashback", "text-success"],
          ].map(([label, share, hint, color]) => (
            <div key={String(label)} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{share}</p>
              <p className={`mt-1 text-xs font-medium ${color}`}>{hint}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-accent/20 p-3 text-xs text-muted-foreground">
          💡 <strong>Inteligência MaaS:</strong> Incentivos de cashback e recomendação de horários reduziram a concentração no pico de fim da tarde em 14%.
        </p>
      </RhSection>

      <div className="grid gap-4 xl:grid-cols-2">
        <RhSection
          title="Conformidade das políticas"
          description="Cobertura dos colaboradores pelas políticas configuradas neste cenário."
          action={<span className="text-xs text-muted-foreground">Simulação</span>}
        >
          <div className="space-y-4">
            {[
              ["Dentro da política", overview.policyCoverage.covered, "bg-eco"],
              ["Requer revisão", overview.policyCoverage.review, "bg-warning"],
              ["Fora da política", overview.policyCoverage.uncovered, "bg-destructive"],
            ].map(([label, value, color]) => (
              <div key={String(label)}>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{label}</span>
                  <span className="font-semibold text-foreground">{pct(Number(value))}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${Number(value)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/rh/politicas">
              <ShieldCheck className="h-4 w-4" /> Ver políticas
            </Link>
          </Button>
        </RhSection>

        <RhSection
          title="Sustentabilidade"
          description="Impacto agregado da mobilidade corporativa no período."
          action={<span className="text-xs text-muted-foreground">Estimativa demonstrativa</span>}
        >
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-muted-foreground">CO₂ total evitado</dt>
              <dd className="mt-1 text-xl font-bold text-eco">{num(overview.co2AvoidedKg)} kg</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Participação sustentável</dt>
              <dd className="mt-1 text-xl font-bold text-foreground">
                {pct(overview.sustainableShare, 0)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Evolução</dt>
              <dd className="mt-1 text-xl font-bold text-foreground">
                +{pct(overview.sustainableEvolution, 0)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Menor impacto</dt>
              <dd className="mt-1 text-xl font-bold text-foreground">
                {overview.lowestImpactModal.modal}
              </dd>
            </div>
          </dl>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/rh/esg">
              <Leaf className="h-4 w-4" /> Ver sustentabilidade
            </Link>
          </Button>
        </RhSection>
      </div>

      <RhSection
        title="Alertas"
        description="Sinais identificados automaticamente no período. Anomalias são classificadas como análise necessária, nunca como fraude."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {data.alerts.map((a) => {
            const Icon = ALERT_ICON[a.kind];
            return (
              <div
                key={a.id}
                className={`flex gap-3 rounded-xl border p-4 ${
                  a.severity === "attention"
                    ? "border-warning/40 bg-warning/10"
                    : "border-border bg-secondary/50"
                }`}
              >
                <Icon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    a.severity === "attention" ? "text-warning" : "text-primary"
                  }`}
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{a.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </RhSection>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            to: "/rh/colaboradores",
            title: "Colaboradores",
            text: "Saldos, limites e perfis individuais.",
          },
          {
            to: "/rh/creditos",
            title: "Créditos e Carteira",
            text: `Saldo corporativo de ${brl(k.availableBalance)}.`,
          },
          {
            to: "/rh/politicas",
            title: "Políticas",
            text: "Regras de modal, horário e teto por viagem.",
          },
        ].map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/40"
          >
            <p className="font-display text-sm font-semibold text-foreground">{c.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
