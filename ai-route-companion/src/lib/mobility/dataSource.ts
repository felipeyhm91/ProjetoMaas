import type { DataSource, ProviderId } from "./types";

export const DATA_SOURCE_LABEL: Record<DataSource, string> = {
  LIVE: "Dados do provedor",
  SANDBOX: "Estimativa",
  MOCK: "Dados de demonstração",
};

export const PROVIDER_LABEL: Record<ProviderId, string> = {
  UBER: "Uber",
  "99": "99",
  BIKE: "Bicicleta compartilhada",
  PUBLIC_TRANSPORT: "Transporte público",
};
