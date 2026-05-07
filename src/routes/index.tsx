import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { LearningPath } from "@/components/landing/LearningPath";
import { Playground } from "@/components/landing/Playground";
import { Trust } from "@/components/landing/Trust";
import { FreeTools } from "@/components/landing/FreeTools";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "TradeMasteryAI | Free Forex Trading Tools, AI Education & Gold Scalper Strategies" },
      { name: "description", content: "Learn forex trading with free AI tools, premium gold scalper strategies, interactive simulators, and real-time analysis. US trading education platform." },
      { name: "keywords", content: "free forex trading, forex education, AI trading tools, gold scalper, technical analysis, forex simulator, forex strategy, online trading platform, currency trading, US traders" },
      { property: "og:title", content: "TradeMasteryAI | Free Forex Trading & AI Tools" },
      { property: "og:description", content: "Master forex with free AI tools, gold scalper strategies, and interactive trading simulators. Education-first platform for US traders." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://trademasteryai.com/" },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
         <FreeTools preview={true} />
        {/* <Features /> */}
     {/* /\   <LearningPath /> */}
        <Playground />
       
        <Trust />
      </main>
      <Footer />
    </div>
  );
}
