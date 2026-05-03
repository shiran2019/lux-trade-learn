import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/landing/PageShell";
import { LearningPath } from "@/components/landing/LearningPath";
import { Features } from "@/components/landing/Features";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
  head: () => ({
    meta: [
      { title: "Free Forex Trading Courses | Learn to Trade Online | TradeMasteryAI" },
      { name: "description", content: "Structured forex trading courses from beginner to advanced. Free visual lessons, AI-powered feedback, and comprehensive trading roadmap. Perfect for US traders." },
      { name: "keywords", content: "forex courses, forex training, online trading education, forex lessons, technical analysis course, trading strategy, forex for beginners, trading tutorial" },
      { property: "og:title", content: "Free Forex Trading Courses | Learn Online" },
      { property: "og:description", content: "Master forex trading with structured courses, visual lessons, and AI feedback. Education-first platform for all levels." },
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
