/**
 * Modelo canônico de mobilidade. Todo provider é normalizado para estes tipos.
 * Nenhum dado aqui é enviado ao provedor sem passar pelo Gateway (backend).
 */

export interface Location {
  latitude: number;
  longitude: number;
  label?: string;
}

export type ProviderId = "UBER" | "99" | "BIKE" | "PUBLIC_TRANSPORT";

export type Modal =
  | "RIDE_HAILING"
  | "BUS"
  | "METRO"
  | "TRAIN"
  | "BIKE"
  | "MULTIMODAL";

export type DataSource = "LIVE" | "SANDBOX" | "MOCK";

export interface MobilitySegment {
  modal: Modal;
  provider: ProviderId;
  description: string;
  duration: number;
  price: number;
  distanceKm?: number;
}

import type { CrowdingInfo, ScheduleRecommendation } from "./crowdingData";

export interface MobilityOption {
  id: string;
  provider: ProviderId;
  modal: Modal;
  productName: string;
  estimatedPrice: number;
  currency: "BRL";
  estimatedTimeMinutes: number;
  etaMinutes?: number;
  distanceKm?: number;
  transfers?: number;
  cashback?: number;
  co2Kg?: number;
  available: boolean;
  corporateEligible: boolean;
  corporateRestrictionReason?: string;
  corporatePolicyMessage?: string;
  crowding?: CrowdingInfo;
  dataSource: DataSource;
  segments?: MobilitySegment[];
  /** 0-100, preenchido pelo Recommendation Engine */
  mobilityScore?: number;
  /** Pontos de cada critério (soma = mobilityScore, ± arredondamento). */
  scoreBreakdown?: ScoreBreakdown;
  /** Economia estimada vs. carro individual */
  savingsVsCar?: number;
}

export interface Availability {
  available: boolean;
  details?: string;
  nearestStationMeters?: number;
  vehiclesAvailable?: number;
  docksAvailable?: number;
  dataSource: DataSource;
}

export interface ProviderStatus {
  provider: ProviderId;
  healthy: boolean;
  dataSource: DataSource;
  message?: string;
  latencyMs?: number;
}

/** Adapter Pattern: contrato único para qualquer fornecedor de mobilidade. */
export interface MobilityProvider {
  readonly id: ProviderId;
  getEstimate(origin: Location, destination: Location): Promise<MobilityOption[]>;
  getAvailability(location: Location): Promise<Availability>;
  getStatus(): Promise<ProviderStatus>;
}

export interface CorporatePolicy {
  allowedModals: Modal[];
  rideHailingAllowedAfterHour: number | null;
  monthlyLimit: number;
  monthlyUsed: number;
  maxPerTripRideHailing: number;
  maxPerTripPublicTransport?: number | null;
}

export interface Wallet {
  balance: number;
  currency: "BRL";
  policy: CorporatePolicy;
}

export interface SearchRequest {
  origin: Location;
  destination: Location;
  /** hora local 0-23, usada para regras de política */
  hourOfDay?: number;
}

export interface SearchResponse {
  requestId: string;
  generatedAt: string;
  wallet: Wallet;
  recommended: MobilityOption | null;
  explanation: string;
  scheduleRecommendation?: ScheduleRecommendation | null;
  options: MobilityOption[];
  providers: ProviderStatus[];
}

export interface ScoreBreakdown {
  price: { points: number; max: number };
  time: { points: number; max: number };
  sustainability: { points: number; max: number };
  policy: { points: number; max: number };
  cashback: { points: number; max: number };
}
