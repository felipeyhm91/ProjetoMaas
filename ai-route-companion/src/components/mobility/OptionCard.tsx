import { useState } from "react";
import { ChevronDown, Sparkles, ArrowRight, AlertTriangle } from "lucide-react";
import type { MobilityOption, Wallet } from "@/lib/mobility/types";
import { balanceAfterTrip } from "@/lib/mobility/wallet";
import { DataSourceBadge } from "./DataSourceBadge";
import { TransportIcon, MODAL_LABEL } from "./TransportIcon";
import { RouteScore } from "./RouteScore";

export const brl = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
export const fmtMin = (m: number) =>
  m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m} min`;

/** RouteCard: resumo + jornada visual + detalhes expansíveis (timeline e score). */
export function OptionCard({
  option,
  highlighted = false,
  selected = false,
  onSelect,
  onChooseTrip,
  wallet,
  originLabel,
  destinationLabel,
}: {
  option: MobilityOption;
  highlighted?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onChooseTrip?: (option: MobilityOption) => void;
  wallet?: Wallet;
  originLabel?: string;
  destinationLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const modals = option.segments?.length ? option.segments.map((s) => s.modal) : [option.modal];
  const detailsId = `details-${option.id}`;

  return (
    <article
      onClick={onSelect}
      className={`rounded-xl border bg-surface p-5 transition-colors ${
        highlighted ? "border-primary/50 shadow-glow" : "border-border hover:border-primary/30"
      } ${selected ? "ring-2 ring-ring" : ""} ${option.available ? "" : "opacity-60"}`}
    >
      {highlighted && (
        <p className="text-caption mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-primary-foreground">
          <Sparkles className="h-3.5 w-3.5" aria-hidden /> Recomendação MaaS
        </p>
      )}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="text-h3 truncate text-text-primary">{option.productName}</h3>
          <p className="text-small text-text-secondary">
            {option.provider === "PUBLIC_TRANSPORT" ? "Transporte público" : option.provider}
            {option.distanceKm ? ` · ${option.distanceKm.toFixed(1).replace(".", ",")} km` : ""}
          </p>
        </div>
        {option.available && option.mobilityScore !== undefined && (
          <div className="text-right">
            <span className="text-metric text-primary">{option.mobilityScore}</span>
            <span className="text-small text-text-secondary">/100</span>
          </div>
        )}
      </header>

      <ol className="mt-4 flex flex-wrap items-center gap-1.5" aria-label="Jornada">
        {modals.map((m, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-text-secondary" aria-hidden>
                →
              </span>
            )}
            <span className="grid h-8 w-8 place-items-center rounded-md bg-accent text-primary">
              <TransportIcon modal={m} />
            </span>
          </li>
        ))}
      </ol>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <dt className="text-caption text-text-secondary">Tempo</dt>
          <dd className="mt-1 text-lg font-bold text-text-primary">
            {option.available ? fmtMin(option.estimatedTimeMinutes) : "Não disponível"}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-text-secondary">Custo</dt>
          <dd className="mt-1 text-lg font-bold text-text-primary">
            {option.available ? brl(option.estimatedPrice) : "Não disponível"}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-text-secondary">CO₂</dt>
          <dd className="mt-1 text-lg font-bold text-text-primary">
            {option.available && option.co2Kg !== undefined
              ? `${option.co2Kg.toFixed(2).replace(".", ",")} kg`
              : "Não disponível"}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-text-secondary">Conexões</dt>
          <dd className="mt-1 text-lg font-bold text-text-primary">
            {option.available ? (option.transfers ?? "Não disponível") : "Não disponível"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <DataSourceBadge source={option.dataSource} />
        {option.available && option.crowding ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold ${
              option.crowding.level === "LOW"
                ? "bg-success/10 text-success border-success/30"
                : option.crowding.level === "MODERATE"
                ? "bg-warning/10 text-warning border-warning/30"
                : "bg-error/10 text-error border-error/30"
            }`}
            title="Estimativa de lotação demonstrativa"
          >
            Lotação: {option.crowding.label} ({option.crowding.occupancyPercent}%)
          </span>
        ) : null}
        {option.available && option.cashback ? (
          <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-accent-foreground">
            Cashback {brl(option.cashback)}
          </span>
        ) : null}
        {option.available ? (
          <span
            className={`rounded-full px-2 py-0.5 font-medium ${option.corporateEligible ? "bg-success/15 text-success" : "bg-error/15 text-error"}`}
          >
            Política de demonstração · {option.corporateEligible ? "Dentro" : "Fora"}
          </span>
        ) : null}
        {!option.available && (
          <span className="rounded-full bg-error/15 px-2 py-0.5 font-medium text-error">
            Indisponível
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        {onChooseTrip && option.available ? (
          option.corporateEligible ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChooseTrip(option);
              }}
              className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 font-semibold transition-colors ${
                highlighted
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
                  : "bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30"
              }`}
            >
              Escolher esta viagem <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              disabled
              title="Opção fora da política corporativa da empresa"
              className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-md border border-error/30 bg-error/10 px-4 text-xs font-semibold text-error opacity-80"
            >
              <AlertTriangle className="h-4 w-4" aria-hidden />
              Fora da política corporativa
            </button>
          )
        ) : null}

        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
            onSelect?.();
          }}
          className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-4 text-small font-semibold text-text-primary hover:bg-secondary"
        >
          {open ? "Ocultar detalhes" : "Ver detalhes"}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>

      {open && (
        <div
          id={detailsId}
          className="mt-5 grid gap-6 border-t border-border pt-5 md:grid-cols-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="min-w-0">
            <h4 className="text-caption text-text-secondary">Detalhes da jornada</h4>
            {originLabel ? (
              <p className="text-small mt-3 font-semibold text-text-primary">● {originLabel}</p>
            ) : null}
            {option.segments?.length ? (
              <ol className="mt-3">
                {option.segments.map((s, i) => (
                  <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-primary">
                      <TransportIcon modal={s.modal} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-small font-semibold text-text-primary">
                        {MODAL_LABEL[s.modal]}
                      </p>
                      <p className="text-small text-text-secondary">{s.description}</p>
                      <p className="text-small text-text-secondary">
                        {s.duration} min · {brl(s.price)}
                        {s.distanceKm ? ` · ${s.distanceKm.toFixed(1).replace(".", ",")} km` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-small mt-3 text-text-secondary">
                Trecho único de {MODAL_LABEL[option.modal].toLowerCase()} ·{" "}
                {fmtMin(option.estimatedTimeMinutes)}. O provedor não informou etapas detalhadas.
              </p>
            )}
            {destinationLabel ? (
              <p className="text-small mt-3 font-semibold text-text-primary">● {destinationLabel}</p>
            ) : null}
            <p className="mt-3 flex items-center gap-2 text-[11px] text-text-secondary">
              Origem do dado: <DataSourceBadge source={option.dataSource} />
            </p>
          </div>
          <div className="min-w-0">
            <h4 className="text-caption text-text-secondary">Como a rota foi avaliada</h4>
            <div className="mt-3">
              <RouteScore score={option.mobilityScore} breakdown={option.scoreBreakdown} />
            </div>
          </div>
          <div className="min-w-0 md:col-span-2">
            <h4 className="text-caption text-text-secondary">Política de demonstração</h4>
            <div
              className={`mt-3 rounded-md border p-4 ${option.available && option.corporateEligible ? "border-success/30 bg-success/10" : "border-error/30 bg-error/10"}`}
            >
              <p
                className={`text-small font-semibold ${option.available && option.corporateEligible ? "text-success" : "text-error"}`}
              >
                {!option.available
                  ? "Modal não disponível para esta consulta"
                  : option.corporateEligible
                  ? `✓ ${option.corporatePolicyMessage || "Viagem elegível pela política corporativa"}`
                  : `✕ ${option.corporatePolicyMessage || "Viagem fora da política corporativa"}`}
              </p>
              {option.corporateRestrictionReason ? (
                <p className="text-small mt-1 text-text-secondary">
                  {option.corporateRestrictionReason}
                </p>
              ) : null}
              {wallet && option.available ? (
                <dl className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-caption text-text-secondary">Custo da viagem</dt>
                    <dd className="mt-1 font-semibold text-text-primary">
                      {brl(option.estimatedPrice)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-caption text-text-secondary">Saldo atual</dt>
                    <dd className="mt-1 font-semibold text-text-primary">{brl(wallet.balance)}</dd>
                  </div>
                  <div>
                    <dt className="text-caption text-text-secondary">Saldo após a viagem</dt>
                    <dd className="mt-1 font-semibold text-text-primary">
                      {brl(balanceAfterTrip(wallet, option.estimatedPrice))}
                    </dd>
                  </div>
                </dl>
              ) : null}
              <p className="mt-3 text-[11px] text-text-secondary">
                Cálculo com carteira de demonstração. Nenhuma cobrança é realizada.
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
