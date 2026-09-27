import type { ScoreBreakdown } from "@/lib/mobility/types";

const ROWS: { key: keyof ScoreBreakdown; label: string }[] = [
  { key: "price", label: "Custo" },
  { key: "time", label: "Tempo" },
  { key: "sustainability", label: "CO₂" },
  { key: "policy", label: "Política" },
  { key: "cashback", label: "Cashback" },
];

export function RouteScore({
  score,
  breakdown,
}: {
  score?: number | undefined;
  breakdown?: ScoreBreakdown | undefined;
}) {
  if (score === undefined) return null;
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-metric text-primary">{score}</span>
        <span className="text-small text-text-secondary">/100</span>
      </div>
      {breakdown && (
        <dl className="mt-4 space-y-2">
          {ROWS.filter(({ key }) => breakdown[key].max > 0).map(({ key, label }) => {
            const { points, max } = breakdown[key];
            return (
              <div
                key={key}
                className="grid grid-cols-[5rem_1fr_3.5rem] items-center gap-3 text-small"
                aria-label={`${label}: ${points} de ${max} pontos`}
              >
                <dt className="text-text-secondary">{label}</dt>
                <dd className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${max ? (points / max) * 100 : 0}%` }}
                  />
                </dd>
                <dd className="text-right font-semibold tabular-nums text-text-primary">
                  {points}/{max}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
      <p className="mt-3 text-[11px] text-text-secondary">
        Calculado por regras fixas (determinístico). A IA não participa do score.
      </p>
    </div>
  );
}
