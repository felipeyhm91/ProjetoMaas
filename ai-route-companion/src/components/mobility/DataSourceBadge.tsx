import type { DataSource } from "@/lib/mobility/types";
import { DATA_SOURCE_LABEL } from "@/lib/mobility/dataSource";

const STYLES: Record<DataSource, string> = {
  LIVE: "bg-success/10 text-success border-success/30",
  SANDBOX: "bg-warning/10 text-warning border-warning/30",
  MOCK: "bg-muted text-text-secondary border-border",
};

const DOT: Record<DataSource, string> = {
  LIVE: "bg-success",
  SANDBOX: "bg-warning",
  MOCK: "bg-text-secondary",
};

export function DataSourceBadge({ source }: { source: DataSource }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STYLES[source]}`}
      title={`Origem do dado: ${DATA_SOURCE_LABEL[source]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[source]}`} aria-hidden />
      {DATA_SOURCE_LABEL[source]}
    </span>
  );
}
