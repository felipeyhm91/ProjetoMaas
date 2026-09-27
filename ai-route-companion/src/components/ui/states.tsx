import { AlertTriangle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface p-8 text-center">
      <Inbox className="h-6 w-6 text-text-secondary" aria-hidden />
      <p className="text-h3 text-text-primary">{title}</p>
      {description && <p className="text-small max-w-sm text-text-secondary">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Não foi possível carregar esta informação.",
  description,
  onRetry,
}: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-error/30 bg-error/10 p-8 text-center">
      <AlertTriangle className="h-6 w-6 text-error" aria-hidden />
      <p className="text-h3 text-text-primary">{title}</p>
      {description && <p className="text-small max-w-sm text-text-secondary">{description}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="focus-ring min-h-11 rounded-md border border-border px-4 text-small font-semibold text-text-primary hover:bg-secondary">
          Tentar novamente
        </button>
      )}
    </div>
  );
}
