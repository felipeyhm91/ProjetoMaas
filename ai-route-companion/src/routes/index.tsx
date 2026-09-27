import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/mobility/SiteHeader";
import {
  ArrowRight, Building2, BusFront, CarFront, Footprints, Leaf, MapPin, Navigation,
  Radio, Scale, Search, ShieldCheck, Sparkles, TrainFront, FlaskConical, Layers,
} from "lucide-react";

const TITLE = "MaaS Wallet — A melhor forma de chegar ao seu destino";
const DESC = "Compare tempo, custo, emissões e regras da sua empresa em uma única jornada multimodal.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const DEMO_SEGMENTS = [
  { icon: Footprints, label: "Caminhada", detail: "Até a estação" },
  { icon: TrainFront, label: "Metrô", detail: "Linha 2 → Tietê" },
  { icon: BusFront, label: "Ônibus", detail: "Rodoviário" },
  { icon: CarFront, label: "Carro por app", detail: "Trecho final" },
];

const STEPS = [
  { icon: Search, title: "Informe sua viagem", text: "Origem, destino e horário." },
  { icon: Scale, title: "Compare alternativas", text: "Tempo, custo, CO₂ e política lado a lado." },
  { icon: Sparkles, title: "Receba uma recomendação", text: "Score explicado em linguagem simples." },
  { icon: Navigation, title: "Acompanhe sua jornada", text: "Cada trecho, do início ao fim." },
];

const PILLARS = [
  { icon: Layers, title: "Multimodalidade", text: "Integração completa entre metrô, ônibus, bicicleta e aplicativo." },
  { icon: Sparkles, title: "Recomendação Inteligente", text: "Score determinístico combinando custo, tempo, CO₂ e política." },
  { icon: Building2, title: "Carteira Corporativa", text: "Gestão unificada de créditos e regras da empresa." },
  { icon: Navigation, title: "Lotação & Horários", text: "Previsão de ocupação e horários alternativos para evitar o pico." },
  { icon: Leaf, title: "Sustentabilidade & CO₂", text: "Estímulo a deslocamentos limpos e cashback por escolha eco." },
  { icon: ShieldCheck, title: "Transparência Total", text: "Identificação clara de dados em tempo real, estimativa e simulação." },
];

const SOURCES = [
  { icon: Radio, title: "Tempo real", text: "Dados ao vivo do provedor.", cls: "text-success border-success/30 bg-success/10" },
  { icon: ShieldCheck, title: "Fonte oficial", text: "Publicado por operadores e órgãos.", cls: "text-info border-info/30 bg-info/10" },
  { icon: Scale, title: "Estimativa", text: "Calculado a partir de parâmetros conhecidos.", cls: "text-warning border-warning/30 bg-warning/10" },
  { icon: FlaskConical, title: "Simulação", text: "Dados ilustrativos, nunca apresentados como reais.", cls: "text-text-secondary border-border bg-muted" },
];

function DemoBadge() {
  return (
    <span className="text-caption inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-text-secondary">
      <FlaskConical className="h-3.5 w-3.5" aria-hidden /> Demonstração · dados simulados
    </span>
  );
}

function CtaPrimary({ children = "Planejar viagem" }: { children?: string }) {
  return (
    <Link to="/planejar" className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
      {children} <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* HERO */}
        <section aria-labelledby="hero-title" className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:pt-20 lg:grid-cols-[1.1fr_1fr]">
          <div className="min-w-0">
            <p className="text-caption text-primary">Mobilidade corporativa multimodal & inteligente</p>
            <h1 id="hero-title" className="text-display mt-4 text-text-primary">A melhor forma de chegar ao seu destino.</h1>
            <p className="text-body mt-5 max-w-xl text-lg text-text-secondary">
              Planeje sua viagem, escolha o melhor modal e evite horários de maior lotação. Compare tempo, custo, emissões e regras da sua empresa em um só lugar.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaPrimary />
              <Link to="/rh" className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-surface px-6 font-semibold text-text-primary transition-colors hover:bg-secondary">
                Explorar plataforma
              </Link>
            </div>
          </div>

          {/* DEMO JOURNEY */}
          <figure aria-label="Exemplo de viagem multimodal de Av. Paulista a Ubatuba" className="min-w-0 rounded-xl border border-border bg-surface p-5 shadow-soft sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-caption text-text-secondary">Jornada exemplo</span>
              <DemoBadge />
            </div>
            <ol className="mt-5 space-y-0">
              <li className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><MapPin className="h-4 w-4" aria-hidden /></span>
                <div className="min-w-0"><p className="text-small text-text-secondary">Origem</p><p className="truncate font-semibold text-text-primary">Av. Paulista, São Paulo</p></div>
              </li>
              {DEMO_SEGMENTS.map((s) => (
                <li key={s.label} className="ml-[17px] flex items-center gap-4 border-l-2 border-dashed border-primary/40 py-3 pl-6">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent text-primary"><s.icon className="h-4 w-4" aria-hidden /></span>
                  <div className="min-w-0"><p className="text-small font-semibold text-text-primary">{s.label}</p><p className="text-small text-text-secondary">{s.detail}</p></div>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success text-eco-foreground"><MapPin className="h-4 w-4" aria-hidden /></span>
                <div className="min-w-0"><p className="text-small text-text-secondary">Destino</p><p className="truncate font-semibold text-text-primary">Ubatuba, SP</p></div>
              </li>
            </ol>
            <figcaption className="text-small mt-5 border-t border-border pt-4 text-text-secondary">
              Cenário sugerido. Endereços e rota são consultados no Google; alternativas sem
              integração oficial são identificadas como demonstração.
            </figcaption>
          </figure>
        </section>

        {/* COMO FUNCIONA */}
        <section aria-labelledby="how-title" className="border-y border-border bg-surface/60">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 id="how-title" className="text-h2 text-text-primary">Como funciona</h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-metric text-primary">{String(i + 1).padStart(2, "0")}</span>
                    <span className="h-px flex-1 bg-border" aria-hidden />
                    <s.icon className="h-5 w-5 shrink-0 text-text-secondary" aria-hidden />
                  </div>
                  <h3 className="text-h3 mt-4 text-text-primary">{s.title}</h3>
                  <p className="text-small mt-1 text-text-secondary">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* POR QUE */}
        <section aria-labelledby="why-title" className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="why-title" className="text-h2 text-text-primary">Por que MaaS Wallet?</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.title} className="bg-background p-6">
                <p.icon className="h-5 w-5 text-primary" aria-hidden />
                <h3 className="text-caption mt-4 text-text-primary">{p.title}</h3>
                <p className="text-small mt-2 text-text-secondary">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* RECOMENDAÇÃO */}
        <section aria-labelledby="rec-title" className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 lg:grid-cols-2">
          <div className="min-w-0">
            <h2 id="rec-title" className="text-h2 text-text-primary">Uma recomendação que você entende</h2>
            <p className="text-body mt-4 text-text-secondary">
              O score é calculado por regras determinísticas que pesam tempo, custo, emissões e a política da empresa. A explicação em linguagem natural é gerada por IA a partir desse resultado.
            </p>
          </div>
          <article className="min-w-0 rounded-xl border border-primary/30 bg-surface p-6 shadow-glow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-caption inline-flex items-center gap-1.5 text-primary"><Sparkles className="h-4 w-4" aria-hidden /> Recomendação MaaS</span>
              <DemoBadge />
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[["Score", "—"], ["Tempo", "—"], ["Custo", "—"], ["CO₂", "—"]].map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-caption text-text-secondary">{k}</dt>
                  <dd className="text-metric mt-2 text-text-primary">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-small mt-6 border-t border-border pt-4 text-text-secondary">
              Exemplo de formato. Os valores aparecem ao planejar uma viagem real, junto com o motivo da escolha.
            </p>
          </article>
        </section>

        {/* TRANSPARÊNCIA */}
        <section aria-labelledby="src-title" className="border-t border-border bg-surface/60">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 id="src-title" className="text-h2 text-text-primary">Transparência nos dados</h2>
            <p className="text-body mt-3 max-w-2xl text-text-secondary">As informações vêm de fontes diferentes. Cada dado mostra de onde veio.</p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SOURCES.map((s) => (
                <li key={s.title} className="rounded-lg border border-border bg-background p-5">
                  <span className={`text-caption inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${s.cls}`}>
                    <s.icon className="h-3.5 w-3.5" aria-hidden /> {s.title}
                  </span>
                  <p className="text-small mt-3 text-text-secondary">{s.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA FINAL */}
        <section aria-labelledby="cta-title" className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 id="cta-title" className="text-h1 text-text-primary">Planeje sua próxima viagem</h2>
          <div className="mt-8 flex justify-center"><CtaPrimary /></div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-small text-text-secondary">
        MaaS Wallet · dados sempre exibidos com sua origem.
      </footer>
    </div>
  );
}
