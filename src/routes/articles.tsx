import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/landing/PageShell";
import { Articles } from "@/components/landing/Articles";

export const Route = createFileRoute("/articles")({
  component: ArticlesPage,
  head: () => ({
    meta: [
      { title: "Articles & Learning Hub — AI Forex Academy" },
      { name: "description", content: "Fresh, focused articles on forex basics, technical analysis, risk management, and trading psychology." },
    ],
  }),
});

function ArticlesPage() {
  return (
    <PageShell
      eyebrow="Learning Hub"
      title={<>Fresh, focused <span className="text-gradient-gold">articles</span></>}
      description="Curated reading on technical analysis, risk, psychology, and the fundamentals."
    >
      <Articles />
    </PageShell>
  );
}
