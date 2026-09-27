import type { CorporatePolicy, Wallet } from "@/lib/mobility/types";
import type { DataSource, Transaction } from "@/lib/rh/types";

export interface EmployeeWalletView {
  wallet: Wallet;
  policy: CorporatePolicy;
  period: string;
  employeeName: string;
  recentTransactions: Transaction[];
  cashbackCampaign: {
    name: string;
    description: string;
  };
  co2AvoidedKg: number;
  source: DataSource;
}
