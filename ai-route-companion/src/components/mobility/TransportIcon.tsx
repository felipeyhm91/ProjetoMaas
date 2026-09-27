import { Bike, BusFront, CarFront, Footprints, Shuffle, TrainFront, TramFront } from "lucide-react";
import type { Modal } from "@/lib/mobility/types";

const ICONS = {
  RIDE_HAILING: CarFront,
  BUS: BusFront,
  METRO: TramFront,
  TRAIN: TrainFront,
  BIKE: Bike,
  MULTIMODAL: Shuffle,
  WALK: Footprints,
} as const;

export const MODAL_LABEL: Record<Modal | "WALK", string> = {
  RIDE_HAILING: "Carro por app",
  BUS: "Ônibus",
  METRO: "Metrô",
  TRAIN: "Trem",
  BIKE: "Bicicleta",
  MULTIMODAL: "Multimodal",
  WALK: "Caminhada",
};

export function TransportIcon({ modal, className = "h-4 w-4" }: { modal: Modal | "WALK"; className?: string }) {
  const Icon = ICONS[modal] ?? Shuffle;
  return <Icon className={className} aria-label={MODAL_LABEL[modal]} />;
}
