import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/landing/PageShell";
import { FreeTools } from "@/components/landing/FreeTools";

export const Route = createFileRoute("/free-tools")({
  component: FreeToolsPage,
  head: () => ({
    meta: [
      { title: "Free Tools — TradeMasteryAI" },
      { name: "description", content: "Free AI Gold Scalper Bot for MetaTrader 5. Learn gold scalping strategies with an educational trading tool designed for real market learning." },
    ],
  }),
});

function FreeToolsPage() {
  return (
    <PageShell
      eyebrow="Free Resources"
      title={<>Premium tools, <span className="text-gradient-gold">zero cost</span></>}
      description="Professional trading tools designed for learning. Get hands-on experience with real strategies."
    >
      <FreeTools />
    </PageShell>
  );
}
