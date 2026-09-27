import type { MobilityOption, Wallet } from "@/lib/mobility/types";
import type { Transaction } from "@/lib/rh/types";
import { mockTransactions } from "@/lib/rh/mock/data";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface SelectedTripInfo {
  option: MobilityOption;
  originLabel: string;
  destinationLabel: string;
  departTime?: string;
  selectedAt: string;
}

export interface ConfirmedTripInfo extends SelectedTripInfo {
  transactionId: string;
  paidAmount: number;
  cashbackEarned: number;
  balanceBefore: number;
  balanceAfter: number;
  confirmedAt: string;
}

// Chaves v2 para isolar qualquer estado residual de execuções anteriores
const STORAGE_KEY_AUTH = "maas_demo_v2_auth";
const STORAGE_KEY_BALANCE = "maas_demo_v2_balance";
const STORAGE_KEY_USED = "maas_demo_v2_used";
const STORAGE_KEY_TRANSACTIONS = "maas_demo_v2_txs";
const STORAGE_KEY_SELECTED_TRIP = "maas_demo_v2_selected_trip";
const STORAGE_KEY_CONFIRMED_TRIP = "maas_demo_v2_confirmed_trip";

const DEFAULT_USER: DemoUser = {
  id: "1",
  name: "Ana Silva",
  email: "demo@maaswallet.com",
  role: "Analista Financeira Sênior",
  department: "Financeiro",
};

export const INITIAL_BALANCE = 240.0;
export const INITIAL_USED = 420.0;
export const INITIAL_LIMIT = 2000.0;

class DemoStoreService {
  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  constructor() {
    // Purga chaves v1 antigas na inicialização se existirem no navegador
    if (this.isBrowser()) {
      try {
        localStorage.removeItem("maas_demo_auth_v1");
        localStorage.removeItem("maas_demo_balance_v1");
        localStorage.removeItem("maas_demo_used_v1");
        localStorage.removeItem("maas_demo_txs_v1");
        localStorage.removeItem("maas_demo_selected_trip_v1");
        localStorage.removeItem("maas_demo_confirmed_trip_v1");
      } catch {
        // ignora se indisponível
      }
    }
  }

  getAuth(): { isAuthenticated: boolean; user: DemoUser } {
    if (!this.isBrowser()) {
      return { isAuthenticated: true, user: DEFAULT_USER };
    }
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          isAuthenticated: Boolean(parsed.isAuthenticated),
          user: parsed.user || DEFAULT_USER,
        };
      } catch {
        // fallback
      }
    }
    return { isAuthenticated: true, user: DEFAULT_USER };
  }

  login(email: string, password: string): { success: boolean; message?: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === "demo@maaswallet.com" && password !== "demo123") {
      return { success: false, message: "Senha incorreta para a conta de demonstração (use demo123)." };
    }

    // Reinicia o estado inicial limpo da demonstração ao logar como Ana Silva
    this.resetDemoData();

    const user: DemoUser = {
      id: "1",
      name: "Ana Silva",
      email: cleanEmail || "demo@maaswallet.com",
      role: "Analista Financeira Sênior",
      department: "Financeiro",
    };

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ isAuthenticated: true, user }));
    }
    return { success: true };
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(STORAGE_KEY_AUTH);
      localStorage.removeItem(STORAGE_KEY_BALANCE);
      localStorage.removeItem(STORAGE_KEY_USED);
      localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEY_SELECTED_TRIP);
      localStorage.removeItem(STORAGE_KEY_CONFIRMED_TRIP);
    }
  }

  resetDemoData(): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEY_BALANCE, String(INITIAL_BALANCE));
      localStorage.setItem(STORAGE_KEY_USED, String(INITIAL_USED));
      localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEY_SELECTED_TRIP);
      localStorage.removeItem(STORAGE_KEY_CONFIRMED_TRIP);
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ isAuthenticated: true, user: DEFAULT_USER }));
    }
  }

  getBalance(): number {
    if (!this.isBrowser()) return INITIAL_BALANCE;
    const val = localStorage.getItem(STORAGE_KEY_BALANCE);
    return val !== null ? Number(val) || INITIAL_BALANCE : INITIAL_BALANCE;
  }

  getMonthlyUsed(): number {
    if (!this.isBrowser()) return INITIAL_USED;
    const val = localStorage.getItem(STORAGE_KEY_USED);
    return val !== null ? Number(val) || INITIAL_USED : INITIAL_USED;
  }

  getMonthlyLimit(): number {
    return INITIAL_LIMIT;
  }

  getRecentTransactions(): Transaction[] {
    if (!this.isBrowser()) return mockTransactions;
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (raw) {
      try {
        const customTxs = JSON.parse(raw) as Transaction[];
        return [...customTxs, ...mockTransactions];
      } catch {
        // fallback
      }
    }
    return mockTransactions;
  }

  setSelectedTrip(tripInfo: SelectedTripInfo): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEY_SELECTED_TRIP, JSON.stringify(tripInfo));
    }
  }

  getSelectedTrip(): SelectedTripInfo | null {
    if (!this.isBrowser()) return null;
    const raw = localStorage.getItem(STORAGE_KEY_SELECTED_TRIP);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SelectedTripInfo;
    } catch {
      return null;
    }
  }

  setConfirmedTrip(confirmed: ConfirmedTripInfo): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEY_CONFIRMED_TRIP, JSON.stringify(confirmed));
    }
  }

  getConfirmedTrip(): ConfirmedTripInfo | null {
    if (!this.isBrowser()) return null;
    const raw = localStorage.getItem(STORAGE_KEY_CONFIRMED_TRIP);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ConfirmedTripInfo;
    } catch {
      return null;
    }
  }

  processPayment(selectedTrip: SelectedTripInfo): {
    success: boolean;
    error?: string;
    confirmedTrip?: ConfirmedTripInfo;
  } {
    const currentBalance = this.getBalance();
    const tripCost = selectedTrip.option.estimatedPrice;

    if (!selectedTrip.option.corporateEligible) {
      return {
        success: false,
        error: "Esta viagem está fora da política corporativa e não pode ser paga via MaaS Wallet.",
      };
    }

    if (tripCost > currentBalance) {
      return {
        success: false,
        error: "Saldo insuficiente para esta viagem.",
      };
    }

    const cashbackEarned = selectedTrip.option.cashback || 0;
    const balanceBefore = currentBalance;
    const balanceAfter = Number((currentBalance - tripCost + cashbackEarned).toFixed(2));
    const newUsed = Number((this.getMonthlyUsed() + tripCost).toFixed(2));

    const txId = `tx-demo-${Date.now()}`;
    const newTransaction: Transaction = {
      id: txId,
      date: new Date().toISOString(),
      employeeId: "1",
      employeeName: this.getAuth().user.name,
      modal: selectedTrip.option.productName || selectedTrip.option.provider,
      origin: selectedTrip.originLabel,
      destination: selectedTrip.destinationLabel,
      amount: tripCost,
      cashback: cashbackEarned,
      source: "MOCK",
      status: "CONFIRMADA",
    };

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEY_BALANCE, String(balanceAfter));
      localStorage.setItem(STORAGE_KEY_USED, String(newUsed));

      // Salva transação local no início da lista
      const existingRaw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      const existing: Transaction[] = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([newTransaction, ...existing]));
    }

    const confirmed: ConfirmedTripInfo = {
      ...selectedTrip,
      transactionId: txId,
      paidAmount: tripCost,
      cashbackEarned,
      balanceBefore,
      balanceAfter,
      confirmedAt: new Date().toISOString(),
    };

    this.setConfirmedTrip(confirmed);

    return {
      success: true,
      confirmedTrip: confirmed,
    };
  }

  getWallet(): Wallet {
    const balance = this.getBalance();
    const monthlyUsed = this.getMonthlyUsed();
    return {
      balance,
      currency: "BRL",
      policy: {
        allowedModals: ["BUS", "METRO", "TRAIN", "BIKE", "MULTIMODAL", "RIDE_HAILING"],
        rideHailingAllowedAfterHour: 20,
        monthlyLimit: INITIAL_LIMIT,
        monthlyUsed,
        maxPerTripRideHailing: 60,
        maxPerTripPublicTransport: 150,
      },
    };
  }
}

export const demoStore = new DemoStoreService();
