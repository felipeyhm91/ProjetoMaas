import type { Modal, DataSource } from "./types";
import type { SelectedPlace } from "../maps/types";

export type CrowdingLevel = "LOW" | "MODERATE" | "HIGH";

export const CROWDING_LABEL: Record<CrowdingLevel, string> = {
  LOW: "Baixa",
  MODERATE: "Moderada",
  HIGH: "Alta",
};

export const CROWDING_CLASS: Record<CrowdingLevel, string> = {
  LOW: "bg-success/15 text-success border-success/30",
  MODERATE: "bg-warning/15 text-warning border-warning/30",
  HIGH: "bg-error/15 text-error border-error/30",
};

export interface CrowdingInfo {
  level: CrowdingLevel;
  label: string;
  occupancyPercent: number;
  peakHourWarning?: string;
  recommendedDepartureTime?: string;
  crowdingReductionPercent?: number;
  dataSource: DataSource;
}

export interface ScheduleRecommendation {
  currentHour: number;
  isPeakHour: boolean;
  alternativeTime: string;
  occupancyReductionPercent: number;
  message: string;
  dataSource: DataSource;
}

export const DEMO_SCENARIO_PAULISTA_FARIA_LIMA = {
  id: "paulista-faria-lima",
  name: "Av. Paulista → Faria Lima (Urbano / Pico)",
  origin: {
    placeId: "demo-paulista-urbano",
    formattedAddress: "Av. Paulista, São Paulo - SP",
    latitude: -23.5615,
    longitude: -46.6559,
  } satisfies SelectedPlace,
  destination: {
    placeId: "demo-faria-lima-urbano",
    formattedAddress: "Av. Brig. Faria Lima, São Paulo - SP",
    latitude: -23.5874,
    longitude: -46.6811,
  } satisfies SelectedPlace,
};

/**
 * Estima o nível de lotação/ocupação para determinado modal e horário.
 * Todos os dados são marcados explicitamente como demonstração (MOCK).
 */
export function estimateCrowding(
  modal: Modal,
  hourOfDay: number,
): CrowdingInfo {
  const isPeak = (hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 17 && hourOfDay <= 19);

  let level: CrowdingLevel = "MODERATE";
  let percent = 55;

  if (modal === "BIKE") {
    level = "LOW";
    percent = 22;
  } else if (modal === "RIDE_HAILING") {
    level = isPeak ? "MODERATE" : "LOW";
    percent = isPeak ? 62 : 28;
  } else if (modal === "METRO" || modal === "BUS" || modal === "TRAIN" || modal === "MULTIMODAL") {
    if (isPeak) {
      level = "HIGH";
      percent = 88;
    } else {
      level = "LOW";
      percent = 35;
    }
  }

  const nextHour = hourOfDay >= 23 ? 0 : hourOfDay + 1;
  const recommendedTime = isPeak ? `${String(nextHour).padStart(2, "0")}:15` : undefined;

  return {
    level,
    label: CROWDING_LABEL[level],
    occupancyPercent: percent,
    ...(isPeak && recommendedTime ? { recommendedDepartureTime: recommendedTime } : {}),
    ...(isPeak
      ? {
          peakHourWarning: "Horário de pico: maior ocupação e concentração de passageiros.",
          crowdingReductionPercent: 42,
        }
      : {}),
    dataSource: "MOCK",
  };
}

/**
 * Gera uma recomendação de horário alternativo para reduzir a superlotação.
 */
export function getScheduleRecommendation(hourOfDay: number): ScheduleRecommendation | null {
  const isPeak = (hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 17 && hourOfDay <= 19);
  if (!isPeak) return null;

  const nextHour = hourOfDay >= 23 ? 0 : hourOfDay + 1;
  const alternativeTime = `${String(nextHour).padStart(2, "0")}:15`;

  return {
    currentHour: hourOfDay,
    isPeakHour: true,
    alternativeTime,
    occupancyReductionPercent: 42,
    message: `Saída sugerida às ${alternativeTime}: estimativa de redução de 42% na ocupação do transporte público.`,
    dataSource: "MOCK",
  };
}
