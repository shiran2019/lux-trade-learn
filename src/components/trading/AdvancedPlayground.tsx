import { useState, useCallback, useRef, useEffect } from "react";
import { BarChart2, TrendingUp, Calculator, BookOpen, Lock, Star, ChevronRight, Award, HelpCircle } from "lucide-react";
import { LiveChart } from "./LiveChart";
import { TradePanel } from "./TradePanel";
import { RiskLab } from "./RiskLab";
import { ScenarioLab } from "./ScenarioLab";
import { Candle, Trade } from "./marketEngine";
import { Tour, useTour } from "./Tour";

type Tab = "chart" | "trade" | "risk" | "scenarios";
type Level = "beginner" | "intermediate" | "practice";

const LEVEL_CONFIG: Record<Level, { label: string; desc: string; color: string; tabs: Tab[] }> = {
  beginner: {
    label: "Beginner",
    desc: "Learn to read charts and understand market behavior",
    color: "text-bull",
    tabs: ["chart", "risk", "scenarios"],
  },
  intermediate: {
    label: "Intermediate",
    desc: "Add indicators, practice scenarios, and enter your first trades",
    color: "text-primary",
    tabs: ["chart", "trade", "risk", "scenarios"],
  },
  practice: {
    label: "Practice Mode",
    desc: "Full playground — all tools unlocked",
    color: "text-gold",
    tabs: ["chart", "trade", "risk", "scenarios"],
  },
};

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  desc: string;
  minLevel: Level;
}

const TABS: TabConfig[] = [
  { id: "chart", label: "Live Chart", icon: <BarChart2 className="h-4 w-4" />, desc: "Real-time market simulation with indicators", minLevel: "beginner" },
  { id: "trade", label: "Trade Sim", icon: <TrendingUp className="h-4 w-4" />, desc: "Practice buy/sell with live P&L feedback", minLevel: "intermediate" },
  { id: "risk", label: "Risk Lab", icon: <Calculator className="h-4 w-4" />, desc: "Visual risk & leverage calculator", minLevel: "beginner" },
  { id: "scenarios", label: "Scenarios", icon: <BookOpen className="h-4 w-4" />, desc: "Guided learning through real market situations", minLevel: "beginner" },
];

const LEVEL_ORDER: Level[] = ["beginner", "intermediate", "practice"];

function isLevelUnlocked(tab: TabConfig, currentLevel: Level): boolean {
  const tabLevelIdx = LEVEL_ORDER.indexOf(tab.minLevel);
  const currentLevelIdx = LEVEL_ORDER.indexOf(currentLevel);
  return currentLevelIdx >= tabLevelIdx;
}

// ─── Level Badge ──────────────────────────────────────────────────────────────

function LevelBadge({ level, onUpgrade }: { level: Level; onUpgrade: () => void }) {
  const cfg = LEVEL_CONFIG[level];
  const isMax = level === "practice";

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
        level === "beginner" ? "border-bull/20 bg-bull/8 text-bull" :
        level === "intermediate" ? "border-primary/20 bg-primary/8 text-primary" :
        "border-gold/30 bg-gold/10 text-gold"
      }`}>
        {level === "practice" ? <Star className="h-3.5 w-3.5 fill-current" /> : <Award className="h-3.5 w-3.5" />}
        {cfg.label}
      </div>
      {!isMax && (
        <button onClick={onUpgrade}
          className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-primary hover:bg-primary/10 transition-colors">
          Unlock next level <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ─── Session Stats Bar ────────────────────────────────────────────────────────

interface SessionStats {
  tradesOpened: number;
  tradesClosed: number;
  totalPnl: number;
  wins: number;
  losses: number;
}

function SessionStatsBar({ stats }: { stats: SessionStats }) {
  if (stats.tradesClosed === 0) return null;
  const winRate = stats.tradesClosed > 0 ? (stats.wins / stats.tradesClosed) * 100 : 0;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/60 bg-secondary/30 px-4 py-2 text-xs">
      <div className="text-muted-foreground">Session:</div>
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">Trades:</span>
        <span className="font-semibold">{stats.tradesClosed}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">P&L:</span>
        <span className={`font-semibold ${stats.totalPnl >= 0 ? "text-bull" : "text-bear"}`}>
          {stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">Win rate:</span>
        <span className={`font-semibold ${winRate >= 50 ? "text-bull" : "text-bear"}`}>{winRate.toFixed(0)}%</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-bull">{stats.wins}W</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-bear">{stats.losses}L</span>
      </div>
    </div>
  );
}

// ─── Main AdvancedPlayground ──────────────────────────────────────────────────

export function AdvancedPlayground() {
  const [activeTab, setActiveTab] = useState<Tab>("chart");
  const [level, setLevel] = useState<Level>("beginner");
  const [currentPrice, setCurrentPrice] = useState(1.085);
  const [currentCandle, setCurrentCandle] = useState<Candle | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    tradesOpened: 0, tradesClosed: 0, totalPnl: 0, wins: 0, losses: 0,
  });
  const [showLevelModal, setShowLevelModal] = useState(false);
  const tour = useTour();

  // Auto-start tour on first page load only
  useEffect(() => {
    const tourShown = localStorage.getItem("tourShown");
    if (!tourShown) {
      tour.start();
      localStorage.setItem("tourShown", "true");
    }
  }, []);

  const handlePriceUpdate = useCallback((price: number, candle: Candle) => {
    setCurrentPrice(price);
    setCurrentCandle(candle);
  }, []);

  const handleTradeOpened = useCallback((_trade: Trade) => {
    setSessionStats((s) => ({ ...s, tradesOpened: s.tradesOpened + 1 }));
  }, []);

  const handleTradeClosed = useCallback((_trade: Trade, pnl: number, _reason: string) => {
    setSessionStats((s) => ({
      ...s,
      tradesClosed: s.tradesClosed + 1,
      totalPnl: +(s.totalPnl + pnl).toFixed(2),
      wins: s.wins + (pnl > 0 ? 1 : 0),
      losses: s.losses + (pnl <= 0 ? 1 : 0),
    }));
  }, []);

  const upgradeLevel = () => {
    const idx = LEVEL_ORDER.indexOf(level);
    if (idx < LEVEL_ORDER.length - 1) {
      setLevel(LEVEL_ORDER[idx + 1]);
      setShowLevelModal(true);
      setTimeout(() => setShowLevelModal(false), 3000);
    }
  };

  const availableTabs = TABS.filter((t) => isLevelUnlocked(t, level));
  const lockedTabs = TABS.filter((t) => !isLevelUnlocked(t, level));

  return (
    <div className="flex flex-col gap-4">
      {/* Tour overlay */}
      <Tour
        active={tour.active} stepIndex={tour.stepIndex} steps={tour.steps}
        onNext={tour.next} onPrev={tour.prev} onClose={tour.stop}
      />

      {/* Level upgrade toast */}
      {showLevelModal && (
        <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-xl border border-primary/20 bg-white px-4 py-3 shadow-[var(--shadow-elevated)] animate-fade-up">
          <Star className="h-5 w-5 text-gold fill-current" />
          <div>
            <div className="text-sm font-semibold">Level Up!</div>
            <div className="text-xs text-muted-foreground">{LEVEL_CONFIG[level].label} unlocked — {LEVEL_CONFIG[level].desc}</div>
          </div>
        </div>
      )}

      {/* Level + stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div data-tour="level-badge">
          <LevelBadge level={level} onUpgrade={upgradeLevel} />
        </div>
        <div className="flex items-center gap-2">
          <SessionStatsBar stats={sessionStats} />
          <button
            onClick={tour.start}
            className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
            title="Start guided tour"
          >
            <HelpCircle className="h-3.5 w-3.5" /> Tour
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border/60 bg-secondary/30 p-1">
        {TABS.map((tab) => {
          const unlocked = isLevelUnlocked(tab, level);
          const isActive = activeTab === tab.id && unlocked;

          return (
            <button key={tab.id}
              data-tour={`tab-${tab.id}`}
              onClick={() => unlocked && setActiveTab(tab.id)}
              disabled={!unlocked}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                isActive
                  ? "bg-white text-foreground dark:text-black shadow-sm border border-border/40"
                  : unlocked
                  ? "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  : "text-muted-foreground/40 cursor-not-allowed"
              }`}
              title={!unlocked ? `Unlock by advancing to ${tab.minLevel} level` : tab.desc}>
              {!unlocked && <Lock className="h-3 w-3" />}
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Locked tab hint */}
      {lockedTabs.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3 shrink-0" />
          <span>
            <span className="font-medium text-foreground">
              {lockedTabs.map((t) => t.label).join(", ")}
            </span>{" "}
            unlock at {lockedTabs[0].minLevel} level.
          </span>
          <button onClick={upgradeLevel} className="ml-auto text-primary hover:underline font-medium">
            Advance now →
          </button>
        </div>
      )}

      {/* Tab content */}
      <div className="min-h-[480px]">
        {/* Chart + Trade side-by-side on large screens */}
        {activeTab === "chart" && (
          <div className={`grid gap-5 ${level !== "beginner" ? "xl:grid-cols-[1fr_320px]" : ""}`}>
            <div className="glass-strong rounded-xl p-5">
              <LiveChart onPriceUpdate={handlePriceUpdate} />
            </div>
            {level !== "beginner" && (
              <div className="glass-strong rounded-xl p-5">
                <TradePanel
                  currentPrice={currentPrice}
                  currentCandle={currentCandle}
                  onTradeOpened={handleTradeOpened}
                  onTradeClosed={handleTradeClosed}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "trade" && (
          <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
            <div className="glass-strong rounded-xl p-5">
              <LiveChart onPriceUpdate={handlePriceUpdate} />
            </div>
            <div className="glass-strong rounded-xl p-5">
              <TradePanel
                currentPrice={currentPrice}
                currentCandle={currentCandle}
                onTradeOpened={handleTradeOpened}
                onTradeClosed={handleTradeClosed}
              />
            </div>
          </div>
        )}

        {activeTab === "risk" && (
          <div className="glass-strong rounded-xl p-5">
            <RiskLab />
          </div>
        )}

        {activeTab === "scenarios" && (
          <div className="glass-strong rounded-xl p-5">
            <ScenarioLab />
          </div>
        )}
      </div>

      {/* Educational footer */}
      <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-medium text-primary">Safe Learning Environment.</span>{" "}
        All prices, trades, and market scenarios are simulated. No real money is involved.
        This playground is designed to build understanding of market mechanics — not to provide trading signals or financial advice.
        {" "}<button onClick={tour.start} className="text-primary underline hover:no-underline font-medium">Take the guided tour</button> to learn how each section works.
      </div>
    </div>
  );
}
