import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/landing/PageShell";
import { AITools } from "@/components/landing/AITools";

export const Route = createFileRoute("/ai")({
  component: AIPage,
  head: () => ({
    meta: [
      { title: "AI Tutor & Tools — AI Forex Academy" },
      { name: "description", content: "Personalized AI feedback on your trades, charts, and journal. Learn faster with an AI tutor." },
    ],
  }),
});

function AIPage() {
  return (
    <PageShell
      eyebrow="AI Suite"
      title={<>An AI tutor that <span className="text-gradient-gold">trades alongside you</span></>}
      description="Ask questions in plain English, paste screenshots of trades, and get personalized feedback in seconds."
    >
      <AITools />
    </PageShell>
  );
}
