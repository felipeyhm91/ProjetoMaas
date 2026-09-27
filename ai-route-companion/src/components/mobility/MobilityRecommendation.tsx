import { Bot } from "lucide-react";
import type { MobilityOption, Wallet } from "@/lib/mobility/types";
import { OptionCard } from "./OptionCard";

/** Recomendação determinística do backend + explicação em linguagem natural (IA). */
export function MobilityRecommendation({
  option,
  explanation,
  selected,
  onSelect,
  onChooseTrip,
  wallet,
  originLabel,
  destinationLabel,
}: {
  option: MobilityOption;
  explanation: string;
  selected: boolean;
  onSelect: () => void;
  onChooseTrip?: (option: MobilityOption) => void;
  wallet?: Wallet;
  originLabel?: string;
  destinationLabel?: string;
}) {
  const reasons: string[] = [];
  if (option.corporateEligible) reasons.push("Dentro da política da empresa");
  if (option.scoreBreakdown) {
    const b = option.scoreBreakdown;
    if (b.price.points === b.price.max) reasons.push("Menor custo entre as opções");
    if (b.time.points === b.time.max) reasons.push("Menor tempo entre as opções");
    if (b.sustainability.points >= b.sustainability.max * 0.9) reasons.push("Baixo impacto de CO₂");
  }

  return (
    <section aria-labelledby="rec-heading" className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="min-w-0">
        <h2 id="rec-heading" className="sr-only">
          Recomendação MaaS
        </h2>
        <OptionCard
          option={option}
          highlighted
          selected={selected}
          onSelect={onSelect}
          {...(onChooseTrip ? { onChooseTrip } : {})}
          {...(originLabel ? { originLabel } : {})}
          {...(destinationLabel ? { destinationLabel } : {})}
          {...(wallet ? { wallet } : {})}
        />
      </div>
      <aside className="min-w-0 rounded-xl border border-border bg-surface p-5">
        <h3 className="text-h3 text-text-primary">Por que recomendamos esta rota?</h3>
        {reasons.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-small">
            {reasons.map((r) => (
              <li key={r} className="text-success">
                ✓ <span className="text-text-primary">{r}</span>
              </li>
            ))}
          </ul>
        )}
        <details className="group mt-4 rounded-lg bg-accent/30 p-4" open>
          <summary className="focus-ring flex cursor-pointer list-none items-center gap-2 rounded text-small font-semibold text-text-primary">
            <Bot className="h-4 w-4 text-primary" aria-hidden /> Interpretação textual por IA
          </summary>
          <p className="text-small mt-2 text-text-secondary">{explanation}</p>
        </details>
        <p className="mt-3 text-[11px] text-text-secondary">
          Os itens marcados vêm dos dados do score. O texto é uma explicação escrita pela IA a
          partir do resultado; ela não escolhe a rota.
        </p>
      </aside>
    </section>
  );
}
