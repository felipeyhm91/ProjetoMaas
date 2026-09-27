import { applyCorporatePolicy, applyCashback, DEFAULT_WALLET } from "../src/lib/mobility/policy";
import type { MobilityOption, Wallet } from "../src/lib/mobility/types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

console.log("=== EXECUTANDO SUÍTE DE REGRESSÃO DE POLICY ENGINE ===\n");

const baseWallet: Wallet = {
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

// Teste 1: Ride Hailing antes das 20h -> Inelegível
const rideDay: MobilityOption = {
  id: "opt-ride-day",
  provider: "UBER",
  productName: "UberX",
  modal: "RIDE_HAILING",
  estimatedPrice: 35,
  estimatedTimeMinutes: 20,
  co2Kg: 3.5,
  corporateEligible: true,
  available: true,
  dataSource: "MOCK",
};
const resRideDay = applyCorporatePolicy(rideDay, baseWallet, 14);
assert(!resRideDay.corporateEligible, "Ride Hailing antes das 20h deve ser Inelegível");

// Teste 2: Ride Hailing após as 20h abaixo do teto -> Elegível
const resRideNight = applyCorporatePolicy(rideDay, baseWallet, 21);
assert(resRideNight.corporateEligible, "Ride Hailing após as 20h dentro do teto deve ser Elegível");

// Teste 3: Ride Hailing após as 20h acima do teto de R$60 -> Inelegível
const rideExpensive: MobilityOption = { ...rideDay, estimatedPrice: 75 };
const resRideExpensive = applyCorporatePolicy(rideExpensive, baseWallet, 21);
assert(!resRideExpensive.corporateEligible, "Ride Hailing acima do teto (R$60) deve ser Inelegível");

// Teste 4: Ônibus Intermunicipal R$118,60 dentro do teto de transporte público (R$150) -> Elegível
const busIntercity: MobilityOption = {
  id: "opt-bus-ubatuba",
  provider: "PUBLIC_TRANSPORT",
  productName: "Ônibus Rodoviário Pássaro Marron",
  modal: "BUS",
  estimatedPrice: 118.6,
  estimatedTimeMinutes: 240,
  co2Kg: 12.0,
  corporateEligible: true,
  available: true,
  dataSource: "MOCK",
};
const resBusIntercity = applyCorporatePolicy(busIntercity, baseWallet, 10);
assert(resBusIntercity.corporateEligible, "Ônibus Intermunicipal R$118,60 dentro do teto R$150 deve ser Elegível");

// Teste 5: Ônibus acima do teto de R$150 -> Inelegível
const busTooExpensive: MobilityOption = { ...busIntercity, estimatedPrice: 180 };
const resBusTooExpensive = applyCorporatePolicy(busTooExpensive, baseWallet, 10);
assert(!resBusTooExpensive.corporateEligible, "Transporte público acima do teto de R$150 deve ser Inelegível");

// Teste 6: Viagem acima do saldo disponível (R$240) -> Inelegível
const walletLowBalance: Wallet = { ...baseWallet, balance: 50 };
const resLowBalance = applyCorporatePolicy(busIntercity, walletLowBalance, 10);
assert(!resLowBalance.corporateEligible, "Viagem com valor maior que o saldo da carteira deve ser Inelegível");

// Teste 7: Cashback para bicicleta (5% base + 2% bônus = 7%)
const bikeTrip: MobilityOption = {
  id: "opt-bike",
  provider: "BIKE_SHARE",
  productName: "Bicicleta Itaú",
  modal: "BIKE",
  estimatedPrice: 10,
  estimatedTimeMinutes: 15,
  corporateEligible: true,
  available: true,
  dataSource: "MOCK",
};
const bikeCashback = applyCashback(bikeTrip);
assert(bikeCashback.cashback === 0.7, "Cashback de bicicleta deve ser 7% (0.70 BRL para R$10)");

console.log(`\nRESUMO: ${passed} passaram, ${failed} falharam.`);
if (failed > 0) {
  process.exit(1);
}
