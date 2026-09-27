import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { demoStore } from "@/lib/wallet/demoStore";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Search,
  Wallet,
  Zap,
  PiggyBank,
  Leaf,
  Scale,
  Check,
  FlaskConical,
  Clock,
} from "lucide-react";
import { SiteHeader } from "@/components/mobility/SiteHeader";
import { OptionCard, brl, fmtMin } from "@/components/mobility/OptionCard";
import { MobilityRecommendation } from "@/components/mobility/MobilityRecommendation";
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete";
import { CurrentLocationButton } from "@/components/maps/CurrentLocationButton";
import { RouteSummary } from "@/components/maps/RouteSummary";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { searchMobility } from "@/lib/mobility/search.functions";
import { computeRoute } from "@/lib/maps/maps.functions";
import type { MobilityOption, SearchResponse } from "@/lib/mobility/types";
import type { RouteResult, SelectedPlace } from "@/lib/maps/types";
import { DATA_SOURCE_LABEL, PROVIDER_LABEL } from "@/lib/mobility/dataSource";
import { DEMO_SCENARIO_PAULISTA_UBATUBA } from "@/lib/mobility/demoData";
import { DEMO_SCENARIO_PAULISTA_FARIA_LIMA } from "@/lib/mobility/crowdingData";

const TITLE = "Planeje sua viagem | MaaS Wallet";
const DESC =
  "Compare diferentes formas de chegar ao seu destino: tempo, custo, CO₂ e política da empresa.";

export const Route = createFileRoute("/planejar")({
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
  component: Planejar,
});

type Pref = "BEST" | "FASTEST" | "CHEAPEST" | "GREENEST";
const PREFS: { key: Pref; label: string; icon: typeof Zap }[] = [
  { key: "FASTEST", label: "Mais rápida", icon: Zap },
  { key: "CHEAPEST", label: "Mais econômica", icon: PiggyBank },
  { key: "GREENEST", label: "Menor CO₂", icon: Leaf },
  { key: "BEST", label: "Melhor equilíbrio", icon: Scale },
];

type TimeMode = "NOW" | "DEPART";

function sortOptions(options: MobilityOption[], pref: Pref) {
  const c = [...options];
  if (pref === "FASTEST") return c.sort((a, b) => a.estimatedTimeMinutes - b.estimatedTimeMinutes);
  if (pref === "CHEAPEST") return c.sort((a, b) => a.estimatedPrice - b.estimatedPrice);
  if (pref === "GREENEST") return c.sort((a, b) => (a.co2Kg ?? 0) - (b.co2Kg ?? 0));
  return c.sort((a, b) => (b.mobilityScore ?? 0) - (a.mobilityScore ?? 0));
}

const LOADING_STEPS = [
  "Consultando endereços e rota no Google Routes",
  "Calculando score e recomendação com as opções disponíveis",
];

const DEMO_ORIGIN = DEMO_SCENARIO_PAULISTA_UBATUBA.origin.formattedAddress;
const DEMO_DESTINATION = DEMO_SCENARIO_PAULISTA_UBATUBA.destination.formattedAddress;

function Planejar() {
  const search = useServerFn(searchMobility);
  const route = useServerFn(computeRoute);

  const [origin, setOrigin] = useState<SelectedPlace | null>(
    DEMO_SCENARIO_PAULISTA_UBATUBA.origin,
  );
  const [destination, setDestination] = useState<SelectedPlace | null>(
    DEMO_SCENARIO_PAULISTA_UBATUBA.destination,
  );
  const [timeMode, setTimeMode] = useState<TimeMode>("NOW");
  const [departTime, setDepartTime] = useState("08:00");
  const [pref, setPref] = useState<Pref>("BEST");
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [step, setStep] = useState(-1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const loading = step >= 0;
  const navigate = useNavigate();

  const handleChooseTrip = (option: MobilityOption) => {
    if (!origin || !destination) return;
    demoStore.setSelectedTrip({
      option,
      originLabel: origin.formattedAddress,
      destinationLabel: destination.formattedAddress,
      departTime: timeMode === "NOW" ? "Agora" : departTime,
      selectedAt: new Date().toISOString(),
    });
    void navigate({ to: "/checkout" });
  };

  const handleSearch = async () => {
    if (!origin || !destination) return;
    setError(null);
    setData(null);
    setRouteResult(null);
    setSelectedId(null);
    setStep(0);
    try {
      try {
        const real = await route({ data: { origin, destination, travelMode: "DRIVE" } });
        setRouteResult(real);
      } catch (routeErr) {
        console.warn("Google Routes não disponível no ambiente:", routeErr);
        setRouteResult(null);
      }
      setStep(1);
      const hour = timeMode === "NOW" ? new Date().getHours() : Number(departTime.split(":")[0]);
      const res = await search({
        data: {
          origin: {
            latitude: origin.latitude,
            longitude: origin.longitude,
            label: origin.formattedAddress,
          },
          destination: {
            latitude: destination.latitude,
            longitude: destination.longitude,
            label: destination.formattedAddress,
          },
          hourOfDay: hour,
        },
      });
      setData(res);
      setSelectedId(res.recommended?.id ?? null);
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : "Não foi possível consultar algumas opções de transporte.",
      );
    } finally {
      setStep(-1);
    }
  };

  const resetTrip = () => {
    setOrigin(null);
    setDestination(null);
    setRouteResult(null);
    setData(null);
    setError(null);
    setInputError(null);
    setSelectedId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sorted = useMemo(() => (data ? sortOptions(data.options, pref) : []), [data, pref]);
  const rest = sorted.filter((o) => o.id !== data?.recommended?.id);
  const avail = data?.options.filter((o) => o.available) ?? [];
  const fastest = avail.length
    ? avail.reduce((a, b) => (a.estimatedTimeMinutes <= b.estimatedTimeMinutes ? a : b))
    : null;
  const cheapest = avail.length
    ? avail.reduce((a, b) => (a.estimatedPrice <= b.estimatedPrice ? a : b))
    : null;
  const greenest = avail.length
    ? avail.reduce((a, b) => ((a.co2Kg ?? 0) <= (b.co2Kg ?? 0) ? a : b))
    : null;
  const unhealthy = data?.providers.filter((p) => !p.healthy) ?? [];
  const hasMock = data?.options.some((o) => o.dataSource !== "LIVE");

  const nextHint = !origin
    ? "Informe sua origem"
    : !destination
      ? "Informe seu destino"
      : !data
        ? "Escolha como quer viajar e busque"
        : "Encontramos estas opções";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-caption text-primary">Cenário sugerido · demonstração</p>
            <h1 className="text-h1 mt-2 text-text-primary">Planeje sua viagem</h1>
            <p className="text-body mt-2 text-text-secondary">
              Compare diferentes formas de chegar ao seu destino.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-text-secondary font-medium">Cenários de demonstração:</span>
              <button
                type="button"
                onClick={() => {
                  setOrigin(DEMO_SCENARIO_PAULISTA_UBATUBA.origin);
                  setDestination(DEMO_SCENARIO_PAULISTA_UBATUBA.destination);
                  setData(null);
                  setRouteResult(null);
                }}
                className={`focus-ring rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  destination?.formattedAddress.includes("Ubatuba")
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-text-secondary hover:bg-secondary"
                }`}
              >
                1. Paulista → Ubatuba (Intermunicipal)
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrigin(DEMO_SCENARIO_PAULISTA_FARIA_LIMA.origin);
                  setDestination(DEMO_SCENARIO_PAULISTA_FARIA_LIMA.destination);
                  setData(null);
                  setRouteResult(null);
                }}
                className={`focus-ring rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  destination?.formattedAddress.includes("Faria Lima")
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-text-secondary hover:bg-secondary"
                }`}
              >
                2. Paulista → Faria Lima (Urbano / Pico)
              </button>
            </div>
          </div>
          {(origin || destination || data || error) && (
            <button
              type="button"
              onClick={resetTrip}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-small font-semibold text-text-primary hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Planejar outra viagem
            </button>
          )}
        </header>

        {/* TRIP SEARCH */}
        <section
          aria-label="Buscar viagem"
          className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-soft sm:p-6"
        >
          <p className="text-caption text-primary" aria-live="polite">
            {nextHint}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="min-w-0">
              <AddressAutocomplete
                label="De onde você está saindo?"
                placeholder="Digite um endereço ou local"
                initialText={DEMO_ORIGIN}
                value={origin}
                onSelect={setOrigin}
                onError={setInputError}
              />
              <CurrentLocationButton onLocated={setOrigin} onError={setInputError} />
            </div>
            <div className="min-w-0">
              <AddressAutocomplete
                label="Para onde você vai?"
                placeholder="Digite seu destino"
                initialText={DEMO_DESTINATION}
                value={destination}
                onSelect={setDestination}
                onError={setInputError}
              />
            </div>
          </div>
          {inputError && (
            <p role="alert" className="text-small mt-3 text-error">
              {inputError}
            </p>
          )}

          <div className="mt-5 grid gap-5 md:grid-cols-[auto_1fr]">
            <fieldset>
              <legend className="text-small font-semibold text-text-primary">Quando?</legend>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {(
                  [
                    ["NOW", "Agora"],
                    ["DEPART", "Horário de saída"],
                  ] as const
                ).map(([k, l]) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={timeMode === k}
                    onClick={() => setTimeMode(k)}
                    className={`focus-ring min-h-11 rounded-md border px-4 text-small font-medium transition-colors ${timeMode === k ? "border-primary bg-primary/15 text-primary" : "border-border text-text-secondary hover:bg-secondary"}`}
                  >
                    {l}
                  </button>
                ))}
                {timeMode === "DEPART" && (
                  <input
                    type="time"
                    aria-label="Horário de saída"
                    value={departTime}
                    onChange={(e) => setDepartTime(e.target.value)}
                    className="focus-ring min-h-11 rounded-md border border-border bg-background px-3 text-small text-text-primary"
                  />
                )}
              </div>
            </fieldset>
            <fieldset className="min-w-0">
              <legend className="text-small font-semibold text-text-primary">Preferência</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PREFS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    aria-pressed={pref === p.key}
                    onClick={() => setPref(p.key)}
                    className={`focus-ring flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-small font-medium transition-colors ${pref === p.key ? "border-primary bg-primary/15 text-primary" : "border-border text-text-secondary hover:bg-secondary"}`}
                  >
                    <p.icon className="h-4 w-4 shrink-0" aria-hidden /> {p.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-text-secondary">
                A preferência ordena a lista. A Recomendação MaaS não muda.
              </p>
            </fieldset>
          </div>

          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={loading || !origin || !destination}
            className="focus-ring mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Search className="h-4 w-4" aria-hidden />
            )}
            {loading ? "Encontrando opções…" : "Encontrar opções"}
          </button>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-secondary">
            <span className="inline-flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" aria-hidden /> Saldo e política corporativa aplicados
              na busca
            </span>
            <span className="inline-flex items-center gap-1">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden /> Carteira de demonstração
            </span>
          </div>
        </section>

        {/* LOADING */}
        {loading && (
          <section
            aria-live="polite"
            aria-busy="true"
            className="mt-6 rounded-xl border border-border bg-surface p-5"
          >
            <p className="text-h3 text-text-primary">Encontrando opções…</p>
            <ol className="mt-3 space-y-2">
              {LOADING_STEPS.map((s, i) => (
                <li
                  key={s}
                  className={`flex items-center gap-2 text-small ${i < step ? "text-success" : i === step ? "text-text-primary" : "text-text-secondary"}`}
                >
                  {i < step ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : i === step ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <span className="h-4 w-4" />
                  )}
                  {s}
                </li>
              ))}
            </ol>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </section>
        )}

        {error && !loading && (
          <div className="mt-6">
            <ErrorState
              title={error}
              description="Verifique os endereços ou tente novamente em instantes."
              onRetry={() => void handleSearch()}
            />
          </div>
        )}

        {!data && !loading && !error && (
          <div className="mt-6">
            <EmptyState
              title="Para onde você quer ir?"
              description="Informe origem e destino para encontrar opções de mobilidade."
            />
          </div>
        )}

        {routeResult && !loading && (
          <div className="mt-6">
            <RouteSummary route={routeResult} />
          </div>
        )}

        {data && !loading && (
          <>
            {data.options.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="Não encontramos opções para essa viagem."
                  description="Tente alterar o horário ou o destino, ou busque novamente."
                />
              </div>
            ) : (
              <>
                <header className="mt-10 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-h2 text-text-primary">Opções para sua viagem</h2>
                    <p className="text-small mt-1 text-text-secondary">
                      {data.options.length}{" "}
                      {data.options.length === 1 ? "opção encontrada" : "opções encontradas"} ·
                      resultado desta consulta
                    </p>
                  </div>
                  <p className="text-small text-text-secondary">
                    Saldo {brl(demoStore.getBalance())} · limite mensal{" "}
                    {brl(demoStore.getMonthlyLimit())}{" "}
                    <span className="text-[11px]">(demonstração)</span>
                  </p>
                </header>

                {(unhealthy.length > 0 || hasMock) && (
                  <p
                    role="status"
                    className="text-small mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3 text-text-primary"
                  >
                    {unhealthy.length > 0 && (
                      <>
                        Algumas fontes estão indisponíveis (
                        {unhealthy.map((p) => p.provider).join(", ")}).{" "}
                      </>
                    )}
                    {hasMock && (
                      <>
                        Parte das opções usa dados simulados ou de sandbox. Veja o selo em cada
                        opção.
                      </>
                    )}
                  </p>
                )}

                {data.scheduleRecommendation && (
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-accent/20 p-4 text-text-primary">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <div>
                      <p className="text-small font-semibold">
                        💡 Recomendação de Horário & Lotação (Demonstração)
                      </p>
                      <p className="text-small mt-1 text-text-secondary">
                        {data.scheduleRecommendation.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* COMPARISON */}
                <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
                  {[
                    [
                      "Mais rápida",
                       fastest ? fmtMin(fastest.estimatedTimeMinutes) : "Não disponível",
                      fastest?.productName,
                    ],
                    [
                      "Mais econômica",
                       cheapest ? brl(cheapest.estimatedPrice) : "Não disponível",
                      cheapest?.productName,
                    ],
                    [
                      "Menor CO₂",
                       greenest?.co2Kg !== undefined
                         ? `${greenest.co2Kg.toFixed(2).replace(".", ",")} kg`
                         : "Não disponível",
                      greenest?.productName,
                    ],
                    [
                      "Recomendação",
                      data.recommended?.mobilityScore !== undefined
                        ? `${data.recommended.mobilityScore}/100`
                         : "Não disponível",
                      data.recommended?.productName,
                    ],
                  ].map(([k, v, n]) => (
                    <div key={k} className="min-w-0 bg-surface p-4">
                      <dt className="text-caption text-text-secondary">{k}</dt>
                      <dd className="text-metric mt-2 text-text-primary">{v}</dd>
                      {n && <dd className="text-small mt-1 truncate text-text-secondary">{n}</dd>}
                    </div>
                  ))}
                </dl>

                {data.recommended ? (
                  <div className="mt-8">
                    <MobilityRecommendation
                      option={data.recommended}
                      explanation={data.explanation}
                      wallet={demoStore.getWallet()}
                      {...(origin ? { originLabel: origin.formattedAddress } : {})}
                      {...(destination ? { destinationLabel: destination.formattedAddress } : {})}
                      selected={selectedId === data.recommended.id}
                      onSelect={() => setSelectedId(data.recommended?.id ?? null)}
                      onChooseTrip={handleChooseTrip}
                    />
                  </div>
                ) : (
                  <p className="text-small mt-6 text-text-secondary">
                    Nenhuma opção dentro da política pôde ser recomendada.
                  </p>
                )}

                <section aria-labelledby="others" className="mt-10">
                  <h2 id="others" className="text-h3 text-text-primary">
                    Outras opções
                  </h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {rest.map((o) => (
                      <OptionCard
                        key={o.id}
                        option={o}
                        wallet={demoStore.getWallet()}
                        {...(origin ? { originLabel: origin.formattedAddress } : {})}
                        {...(destination ? { destinationLabel: destination.formattedAddress } : {})}
                        selected={selectedId === o.id}
                        onSelect={() => setSelectedId(o.id)}
                        onChooseTrip={handleChooseTrip}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}

            <section
              aria-labelledby="providers"
              className="mt-10 rounded-xl border border-border bg-surface p-5"
            >
              <h2 id="providers" className="text-h3 text-text-primary">
                Fontes consultadas
              </h2>
              <ul className="text-small mt-3 space-y-1 text-text-secondary">
                {routeResult ? (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-success" aria-hidden /> Google Places:
                    endereços · Google Routes: distância e duração estimada · fonte oficial
                  </li>
                ) : null}
                {data.providers.map((p) => (
                  <li key={p.provider} className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${p.healthy ? "bg-success" : "bg-error"}`}
                      aria-hidden
                    />
                    {PROVIDER_LABEL[p.provider]}: {DATA_SOURCE_LABEL[p.dataSource]}
                    {p.message ? ` · ${p.message}` : ""}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
