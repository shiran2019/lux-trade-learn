import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/landing/PageShell";
import { Playground } from "@/components/landing/Playground";

export const Route = createFileRoute("/tools")({
  component: ToolsPage,
  head: () => ({
    meta: [
      { title: "Trading Tools & Playground — AI Forex Academy" },
      { name: "description", content: "Hands-on candlestick simulator, risk calculator, currency strength meter, and strategy tester." },
    ],
  }),
});

function ToolsPage() {
  return (
    <PageShell
      eyebrow="Interactive Tools"
      title={<>Practice in our <span className="text-gradient-gold">live playground</span></>}
      description="Real charts, real mechanics, zero risk. Master the mechanics before you trade live."
    >
      <Playground />
    </PageShell>
  );
}
