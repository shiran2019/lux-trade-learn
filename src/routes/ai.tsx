import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/landing/PageShell";
import { AITradingGuide } from "@/components/landing/AITradingGuide";

export const Route = createFileRoute("/ai")({
  component: AIPage,
  head: () => ({
    meta: [
      { title: "AI Trading Tools | ChatGPT & AI Bots for Forex | Free Tools" },
      { name: "description", content: "Learn forex with free AI trading tools. Use ChatGPT, Claude, Gemini for trading analysis. Prompt templates, AI bot guides, and AI-assisted trading workflow." },
      { name: "keywords", content: "AI trading tools, ChatGPT trading, forex AI bot, automated trading, AI analysis, forex bot, free trading tools, AI assistance, machine learning trading" },
      { property: "og:title", content: "AI Trading Tools & Bots | Free Forex AI Analysis" },
      { property: "og:description", content: "Use free AI tools for forex trading. ChatGPT, Claude, Gemini bots, prompt templates, and daily AI-assisted trading workflow." },
    ],
  }),
});

function AIPage() {
  return (
    <PageShell
      eyebrow="AI for Trading"
      title={<>Use AI to learn trading <span className="text-gradient-gold">smarter & faster</span></>}
      description="Public AI tools, ready-to-use prompt templates, bot types explained, and a daily AI-assisted trading workflow — all free."
    >
      <AITradingGuide />
    </PageShell>
  );
}
