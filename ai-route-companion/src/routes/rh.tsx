import { Outlet, createFileRoute } from "@tanstack/react-router";

import { RhShell } from "@/components/rh/RhShell";
import { RhSessionProvider } from "@/lib/rh/rbac";
import { companyContext } from "@/lib/rh/services";

export const Route = createFileRoute("/rh")({
  head: () => ({
    meta: [
      { title: "Portal RH | MaaS Corporate AI" },
      {
        name: "description",
        content: "Gestão demonstrativa de mobilidade, benefícios, políticas e indicadores corporativos.",
      },
      { property: "og:title", content: "Portal RH | MaaS Corporate AI" },
      {
        property: "og:description",
        content: "Visão corporativa demonstrativa do programa de mobilidade MaaS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RhLayout,
});

function RhLayout() {
  return (
    <RhSessionProvider company={companyContext.company}>
      <RhShell>
        <Outlet />
      </RhShell>
    </RhSessionProvider>
  );
}
