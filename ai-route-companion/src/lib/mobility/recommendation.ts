import type { MobilityOption } from "./types";

/**
 * MobilityRecommendationService
 * Score determinístico 0–100. A IA generativa NÃO participa desta decisão.
 *
 * Preço 30% · Tempo 25% · Sustentabilidade 20% · Política 15% · Cashback 10%
 */

const WEIGHTS = {
  price: 0.3,
  time: 0.25,
  sustainability: 0.2,
  policy: 0.15,
  cashback: 0.1,
};

function normalizeInverse(value: number, min: number, max: number): number {
  if (max <= min) return 1;
  return 1 - (value - min) / (max - min);
}

export function scoreOptions(options: MobilityOption[]): MobilityOption[] {
  const avail = options.filter((o) => o.available);
  if (avail.length === 0) return options;

  const prices = avail.map((o) => o.estimatedPrice);
  const times = avail.map((o) => o.estimatedTimeMinutes);
  const co2 = avail.flatMap((o) => (o.co2Kg === undefined ? [] : [o.co2Kg]));
  const cashbacks = avail.map((o) => o.cashback ?? 0);

  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const maxC = co2.length > 0 ? Math.max(...co2) : 0;
  const maxCb = Math.max(...cashbacks);

  return options.map((o) => {
    if (!o.available) return o;
    const price = normalizeInverse(o.estimatedPrice, minP, maxP);
    const time = normalizeInverse(o.estimatedTimeMinutes, minT, maxT);
    const hasSustainability = o.co2Kg !== undefined && maxC > 0;
    const sustainability =
      hasSustainability && o.co2Kg !== undefined ? 1 - o.co2Kg / maxC : 0;
    const policy = o.corporateEligible ? 1 : 0.15;
    const hasCashback = o.cashback !== undefined && maxCb > 0;
    const cashback = hasCashback && o.cashback !== undefined ? o.cashback / maxCb : 0;

    const activeWeight =
      WEIGHTS.price +
      WEIGHTS.time +
      WEIGHTS.policy +
      (hasSustainability ? WEIGHTS.sustainability : 0) +
      (hasCashback ? WEIGHTS.cashback : 0);

    const score =
      (price * WEIGHTS.price +
        time * WEIGHTS.time +
        sustainability * WEIGHTS.sustainability +
        policy * WEIGHTS.policy +
        cashback * WEIGHTS.cashback) /
      activeWeight;

    const pts = (v: number, w: number, used = true) => ({
      points: used ? Math.round((v * w * 100) / activeWeight) : 0,
      max: used ? Math.round((w * 100) / activeWeight) : 0,
    });
    return {
      ...o,
      mobilityScore: Math.round(score * 100),
      scoreBreakdown: {
        price: pts(price, WEIGHTS.price),
        time: pts(time, WEIGHTS.time),
        sustainability: pts(sustainability, WEIGHTS.sustainability, hasSustainability),
        policy: pts(policy, WEIGHTS.policy),
        cashback: pts(cashback, WEIGHTS.cashback, hasCashback),
      },
    };
  });
}

export function pickRecommended(options: MobilityOption[]): MobilityOption | null {
  const eligible = options
    .filter((o) => o.available && o.corporateEligible)
    .sort((a, b) => (b.mobilityScore ?? 0) - (a.mobilityScore ?? 0));
  return eligible[0] ?? null;
}
