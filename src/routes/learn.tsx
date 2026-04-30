import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/landing/PageShell";
import { LearningPath } from "@/components/landing/LearningPath";
import { Features } from "@/components/landing/Features";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
  head: () => ({
    meta: [
      { title: "Learn Forex — AI Forex Academy" },
      { name: "description", content: "Structured forex courses from beginner to advanced. Visual lessons, AI feedback, and a clear roadmap." },
    ],
  }),
});

function LearnPage() {
  return (
    <PageShell
      eyebrow="Curriculum"
      title={<>Learn forex, the <span className="text-gradient-gold">visual way</span></>}
      description="A clear, gradual progression from absolute beginner to confident, disciplined trader."
    >
      <LearningPath />
      <Features />
    </PageShell>
  );
}
