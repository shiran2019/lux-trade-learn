import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/landing/PageShell";
import { AdvancedPlayground } from "@/components/trading/AdvancedPlayground";

export const Route = createFileRoute("/tools")({
  component: ToolsPage,
  head: () => ({
    meta: [
      { title: "Trading Playground | Free Forex Simulator & AI Analysis Tools" },
      { name: "description", content: "Free forex trading simulator with live candlestick charts, technical indicators, risk analysis, and AI-powered trend explanations. Practice forex trading safely." },
      { name: "keywords", content: "forex simulator, trading playground, live charts, technical indicators, forex practice, risk management, trading tools, candlestick charts, AI analysis" },
      { property: "og:title", content: "Trading Playground | Free Forex Simulator" },
      { property: "og:description", content: "Practice forex trading with free simulator featuring live charts, multiple technical indicators, and AI analysis tools." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function ToolsPage() {
  return (
    <PageShell
      eyebrow="Interactive Playground"
      title={<>Your visual <span className="text-gradient-gold">learning lab</span></>}
      description="Live charts, simulated trades, risk visualization, and guided scenarios. Learn how markets really work — safely."
    >
      <AdvancedPlayground />
    </PageShell>
  );
}
