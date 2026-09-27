import type { MobilityOption } from "./types";
import type { SelectedPlace } from "../maps/types";
import { round2 } from "./geo";

/**
 * Dados e configurações centralizadas para o cenário de demonstração
 * de mobilidade intermunicipal.
 */

export const DEMO_SCENARIO_PAULISTA_UBATUBA = {
  id: "paulista-ubatuba",
  name: "Av. Paulista → Ubatuba",
  origin: {
    placeId: "demo-paulista",
    formattedAddress: "Av. Paulista, São Paulo - SP",
    latitude: -23.5615,
    longitude: -46.6559,
  } satisfies SelectedPlace,
  destination: {
    placeId: "demo-ubatuba",
    formattedAddress: "Ubatuba, SP",
    latitude: -23.4339,
    longitude: -45.0834,
  } satisfies SelectedPlace,
};

export const INTERCITY_DEMO_CONFIG = {
  maxUrbanKm: 80,
  busFareBase: 35,
  busFarePerKm: 0.38,
  busSpeedMinutesPerKm: 1.4,
  busTerminalTransferMin: 30,
  busTerminalTransferPrice: 5.2,
  co2KgPerKm: 0.045,
  cashbackRate: 0.03,
};

/**
 * Constrói a opção simulada de transporte público intermunicipal (ônibus rodoviário).
 */
export function buildIntercityBusOption(
  km: number,
  seedValue: number,
): MobilityOption {
  const cfg = INTERCITY_DEMO_CONFIG;
  // Custo total padronizado de R$ 118,60 (Tarifa rodoviária R$ 113,40 + Traslado urbano R$ 5,20)
  const totalPrice = 118.6;
  const transferPrice = cfg.busTerminalTransferPrice; // 5.20
  const intercityPrice = round2(totalPrice - transferPrice); // 113.40
  const totalMinutes = Math.round(km * cfg.busSpeedMinutesPerKm + 45);
  const intercityMinutes = Math.round(km * cfg.busSpeedMinutesPerKm + 15);
  const intercityKm = round2(Math.max(1, km - 8));

  return {
    id: "pt-intercity-bus",
    provider: "PUBLIC_TRANSPORT",
    modal: "MULTIMODAL",
    productName: "Ônibus rodoviário",
    estimatedPrice: totalPrice,
    currency: "BRL",
    estimatedTimeMinutes: totalMinutes,
    etaMinutes: Math.max(15, Math.round(20 + seedValue * 15)),
    distanceKm: round2(km),
    transfers: 1,
    cashback: round2(totalPrice * cfg.cashbackRate),
    co2Kg: round2(km * cfg.co2KgPerKm),
    available: true,
    corporateEligible: true,
    dataSource: "MOCK",
    segments: [
      {
        modal: "METRO",
        provider: "PUBLIC_TRANSPORT",
        description: "Metrô/Ônibus urbano até o Terminal Rodoviário",
        duration: cfg.busTerminalTransferMin,
        price: transferPrice,
        distanceKm: 8,
      },
      {
        modal: "BUS",
        provider: "PUBLIC_TRANSPORT",
        description: "Ônibus rodoviário até o Terminal de Ubatuba",
        duration: intercityMinutes,
        price: intercityPrice,
        distanceKm: intercityKm,
      },
    ],
  };
}
