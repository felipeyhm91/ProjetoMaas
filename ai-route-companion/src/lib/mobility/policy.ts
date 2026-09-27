import type { MobilityOption, Wallet } from "./types";
import { round2 } from "./geo";

/**
 * Política corporativa + carteira. Todas as decisões financeiras e de
 * elegibilidade são determinísticas e ficam no backend — nunca na IA.
 */

export const DEFAULT_WALLET: Wallet = {
  balance: 240,
  currency: "BRL",
  policy: {
    allowedModals: ["BUS", "METRO", "TRAIN", "BIKE", "MULTIMODAL", "RIDE_HAILING"],
    rideHailingAllowedAfterHour: 20,
    monthlyLimit: 2000,
    monthlyUsed: 420,
    maxPerTripRideHailing: 60,
    maxPerTripPublicTransport: 150,
  },
};

/** Campanha corporativa ativa de incentivo. */
export const ACTIVE_CAMPAIGN = {
  name: "Semana da Mobilidade Sustentável",
  description: "Transporte público e bicicleta com cashback adicional de 2%.",
  bonusModals: ["BUS", "METRO", "TRAIN", "BIKE", "MULTIMODAL"] as const,
  bonusRate: 0.02,
};

const BASE_CASHBACK_RATE: Record<string, number> = {
  BUS: 0.03,
  METRO: 0.03,
  TRAIN: 0.03,
  MULTIMODAL: 0.03,
  BIKE: 0.05,
  RIDE_HAILING: 0.01,
};

export function applyCashback(option: MobilityOption): MobilityOption {
  const base = BASE_CASHBACK_RATE[option.modal] ?? 0;
  const bonus = (ACTIVE_CAMPAIGN.bonusModals as readonly string[]).includes(option.modal)
    ? ACTIVE_CAMPAIGN.bonusRate
    : 0;
  return { ...option, cashback: round2(option.estimatedPrice * (base + bonus)) };
}

export function applyCorporatePolicy(
  option: MobilityOption,
  wallet: Wallet,
  hourOfDay: number,
): MobilityOption {
  const p = wallet.policy;
  const remaining = p.monthlyLimit - p.monthlyUsed;
  let eligible = true;
  let reason: string | undefined;
  let message = "";

  const isRideHailing = option.modal === "RIDE_HAILING";
  const isPublicOrIntercity =
    option.modal === "BUS" ||
    option.modal === "METRO" ||
    option.modal === "TRAIN" ||
    option.modal === "MULTIMODAL" ||
    option.modal === "BIKE";

  if (!option.available) {
    eligible = false;
    reason = "Modal não disponível para esta consulta.";
    message = "Modal não disponível para esta consulta.";
  } else if (!p.allowedModals.includes(option.modal)) {
    eligible = false;
    reason = "Modal não permitido pela política da empresa.";
    message = "Modal não permitido pela política da empresa.";
  } else if (
    isRideHailing &&
    p.rideHailingAllowedAfterHour !== null &&
    hourOfDay < p.rideHailingAllowedAfterHour
  ) {
    eligible = false;
    reason = `Carro por app permitido pela empresa somente após ${p.rideHailingAllowedAfterHour}h.`;
    message = `Carro por app permitido somente após ${p.rideHailingAllowedAfterHour}h.`;
  } else if (isRideHailing && option.estimatedPrice > p.maxPerTripRideHailing) {
    eligible = false;
    reason = `Valor acima do teto de R$ ${p.maxPerTripRideHailing.toFixed(2).replace(".", ",")} por viagem de carro por app.`;
    message = `Fora da política — valor acima do teto por viagem de carro por app.`;
  } else if (
    p.maxPerTripPublicTransport !== undefined &&
    p.maxPerTripPublicTransport !== null &&
    isPublicOrIntercity &&
    option.estimatedPrice > p.maxPerTripPublicTransport
  ) {
    eligible = false;
    reason = `Valor acima do teto de R$ ${p.maxPerTripPublicTransport.toFixed(2).replace(".", ",")} por viagem de transporte público.`;
    message = `Fora da política — valor acima do teto por viagem de transporte público.`;
  } else if (option.estimatedPrice > wallet.balance) {
    eligible = false;
    reason = "Saldo corporativo insuficiente na carteira.";
    message = "Fora da política — saldo corporativo insuficiente.";
  } else if (option.estimatedPrice > remaining) {
    eligible = false;
    reason = "Limite mensal da empresa atingido.";
    message = "Fora da política — limite mensal da empresa atingido.";
  } else {
    eligible = true;
    if (isRideHailing) {
      message = "Elegível pela política de viagens por aplicativo.";
    } else if (isPublicOrIntercity) {
      message = "Elegível pela política de transporte público e sustentabilidade.";
    } else {
      message = "Viagem dentro da política corporativa.";
    }
  }

  return {
    ...option,
    corporateEligible: eligible,
    ...(reason ? { corporateRestrictionReason: reason } : {}),
    corporatePolicyMessage: message,
  };
}

/** Economia estimada em relação a uma viagem individual de carro. */
export function estimateSavings(option: MobilityOption, carBaseline: number): number {
  return round2(Math.max(0, carBaseline - option.estimatedPrice));
}
