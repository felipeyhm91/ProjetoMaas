import { ACTIVE_CAMPAIGN } from "@/lib/mobility/policy";
import { MOCK_PERIOD, mockEmployees } from "@/lib/rh/mock/data";
import { demoStore } from "./demoStore";
import type { EmployeeWalletView } from "./types";

const delay = <T>(data: T, ms = 150): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const employeeWalletService = {
  getCurrent: async (): Promise<EmployeeWalletView> => {
    const employee = mockEmployees[0];
    if (!employee) throw new Error("Carteira de demonstração indisponível.");

    const wallet = demoStore.getWallet();
    const recentTransactions = demoStore.getRecentTransactions();
    const auth = demoStore.getAuth();

    return delay({
      wallet,
      policy: wallet.policy,
      period: MOCK_PERIOD,
      employeeName: auth.user.name || employee.name,
      recentTransactions,
      cashbackCampaign: {
        name: ACTIVE_CAMPAIGN.name,
        description: ACTIVE_CAMPAIGN.description,
      },
      co2AvoidedKg: employee.co2AvoidedKg,
      source: "MOCK",
    });
  },
};
