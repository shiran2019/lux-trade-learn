import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { LearningPath } from "@/components/landing/LearningPath";
import { Playground } from "@/components/landing/Playground";
import { AITools } from "@/components/landing/AITools";
import { Articles } from "@/components/landing/Articles";
import { Trust } from "@/components/landing/Trust";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AI Forex Trading Academy — Learn Trading Visually with AI" },
      { name: "description", content: "Master forex trading step-by-step with AI tutors, interactive charts, risk tools, and real-time playgrounds. Education first." },
      { property: "og:title", content: "AI Forex Trading Academy" },
      { property: "og:description", content: "Learn forex trading visually with AI — interactive courses, charts, and risk tools." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <LearningPath />
        <Playground />
        <AITools />
        <Articles />
        <Trust />
      </main>
      <Footer />
    </div>
  );
}
