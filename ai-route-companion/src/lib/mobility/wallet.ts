import type { Wallet } from "./types";
import { round2 } from "./geo";

export function balanceAfterTrip(wallet: Wallet, tripCost: number): number {
  return round2(Math.max(0, wallet.balance - tripCost));
}
