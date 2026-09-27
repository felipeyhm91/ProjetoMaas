import type { RouteResult } from "@/lib/maps/types";

/** Resumo da viagem calculada pela fonte oficial Google Routes. */
export function RouteSummary({ route }: { route: RouteResult }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Sua viagem</h2>
        <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
          Fonte oficial
        </span>
      </div>
      <p className="mt-1 text-base font-semibold text-foreground">
        {route.origin.formattedAddress} → {route.destination.formattedAddress}
      </p>
      <div className="mt-3 flex flex-wrap gap-6 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Distância</p>
          <p className="text-lg font-bold text-foreground">
            {route.distanceKm.toFixed(1).replace(".", ",")} km
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Duração estimada</p>
          <p className="text-lg font-bold text-foreground">{route.durationMinutes} min</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Fonte</p>
          <p className="text-lg font-bold text-eco">Google Routes</p>
        </div>
      </div>

      {route.steps && route.steps.length > 0 && (
        <ol className="mt-4 space-y-1 border-l-2 border-border pl-4 text-sm text-muted-foreground">
          {route.steps.map((s, i) => (
            <li key={i}>
              {s.mode === "WALK" ? "🚶" : "🚇"} {s.description}
              {s.departureStop ? ` · embarque em ${s.departureStop}` : ""}
              {s.arrivalStop ? ` · desembarque em ${s.arrivalStop}` : ""}
              {s.departureTime ? ` · sai ${s.departureTime}` : ""} — {s.durationMinutes} min
              {s.distanceKm ? ` · ${s.distanceKm.toFixed(1)} km` : ""}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
