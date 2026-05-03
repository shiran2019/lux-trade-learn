import { useState, useEffect, useRef } from "react";
import { ChevronRight, CheckCircle, XCircle, RotateCcw, Star, BookOpen, TrendingUp, TrendingDown, Minus, Zap, HelpCircle } from "lucide-react";
import { generateCandles, nextCandle, TIMEFRAME_MS, MarketScenario } from "./marketEngine";
import { useTour, Tour, SCENARIO_STEPS } from "./Tour";

interface ScenarioChoice {
  id: string;
  label: string;
  correct: boolean;
  explanation: string;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  setup: string;
  question: string;
  chartScenario: MarketScenario;
  chartPriceBase: number;
  choices: ScenarioChoice[];
  lesson: string;
  concept: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

const SCENARIOS: Scenario[] = [
  {
    id: "support_bounce",
    title: "Support Bounce or Breakdown?",
    concept: "Support & Resistance",
    difficulty: "beginner",
    description: "Price has been in a downtrend and is now touching a key support level for the second time.",
    setup: "EUR/USD is at 1.0850 — a level where price bounced strongly 3 weeks ago. Buyers are defending this zone.",
    question: "Price is retesting the 1.0850 support zone. What is the most likely outcome?",
    chartScenario: "ranging",
    chartPriceBase: 1.085,
    choices: [
      { id: "a", label: "Bounce — buyers step in at support, price rallies", correct: true, explanation: "Correct! Support levels often hold on retests, especially when the level has a history of strong reactions. Buyers who missed the first bounce tend to place orders here." },
      { id: "b", label: "Breakdown — price crashes through, trend continues down", correct: false, explanation: "Not wrong in principle — but without clear bearish pressure, a bounce is statistically more likely on first retest. Look for rejection wicks and bullish candles as confirmation." },
      { id: "c", label: "No movement — price consolidates at the level", correct: false, explanation: "Price rarely stays frozen at a key level. Either buyers or sellers will win. Watch volume and candlestick patterns to determine direction." },
    ],
    lesson: "Support levels represent areas where demand exceeds supply. The more times a level holds, the stronger it is — until it isn't. Always look for confirmation candles before trading.",
  },
  {
    id: "trend_continuation",
    title: "Trend Pullback or Reversal?",
    concept: "Trend Analysis",
    difficulty: "beginner",
    description: "EUR/USD has been making higher highs and higher lows in a clear uptrend. Price pulls back after a big green candle.",
    setup: "After 15 consecutive sessions of upward movement, price dips back 30 pips. The 20-period MA is below current price.",
    question: "Price pulls back during an uptrend. As a trend trader, what should you expect?",
    chartScenario: "trending_up",
    chartPriceBase: 1.082,
    choices: [
      { id: "a", label: "Continuation — the pullback is temporary, trend resumes", correct: true, explanation: "Correct! In a healthy uptrend, pullbacks to moving averages or previous support are buying opportunities. 'The trend is your friend' — experienced traders buy these dips." },
      { id: "b", label: "Full reversal — uptrend is over, go short now", correct: false, explanation: "One pullback doesn't signal a reversal. You'd need a break of structure (lower low below previous swing low) to confirm trend change. Reversals require evidence." },
      { id: "c", label: "Wait — exit all trades and sit out", correct: false, explanation: "Waiting during a pullback is reasonable, but not the most opportunistic. Trend traders use pullbacks to find better entry prices with tighter stops." },
    ],
    lesson: "In a healthy trend, pullbacks are normal. The key is to distinguish between a correction (30-50% of the previous move) and a reversal (break of structure). Higher highs + higher lows = uptrend is intact.",
  },
  {
    id: "breakout_fake",
    title: "Real Breakout or Fakeout?",
    concept: "Breakouts",
    difficulty: "intermediate",
    description: "Price has been ranging between 1.0820 and 1.0880 for two weeks. A candle just closed above 1.0880.",
    setup: "EUR/USD breaks above the 1.0880 resistance level with a large bullish candle. Volume is average.",
    question: "A candle closes above resistance. Is this a real breakout?",
    chartScenario: "volatile",
    chartPriceBase: 1.088,
    choices: [
      { id: "a", label: "Yes — enter immediately, breakout confirmed!", correct: false, explanation: "Not so fast! Many breakouts fail, especially with average volume. A 'fakeout' is common — price briefly breaks a level then reverses back inside the range." },
      { id: "b", label: "Wait for retest — let price pull back to the broken level", correct: true, explanation: "Correct! Waiting for the retest (former resistance becomes new support) is the professional approach. It offers better entry price, tighter stop loss, and reduces fakeout risk." },
      { id: "c", label: "Ignore it — breakouts rarely work", correct: false, explanation: "Breakouts absolutely work — but they require confirmation. High volume breakouts with momentum continuation have strong follow-through." },
    ],
    lesson: "The retest strategy: After a breakout, wait for price to pull back to the broken level (now acting as support). This confirms the breakout and provides a better risk-to-reward entry.",
  },
  {
    id: "high_volatility",
    title: "Trading Through a News Event",
    concept: "Volatility & Risk",
    difficulty: "intermediate",
    description: "The US Non-Farm Payrolls (NFP) report is releasing in 10 minutes. You have an open buy position.",
    setup: "EUR/USD is near your take profit. Spreads have widened from 0.7 to 5.0 pips. Price is choppy.",
    question: "NFP is releasing in 10 minutes. Your trade is in profit. What do you do?",
    chartScenario: "volatile",
    chartPriceBase: 1.086,
    choices: [
      { id: "a", label: "Hold — let it run, NFP could push it further", correct: false, explanation: "High-risk approach. NFP can cause 50-150 pip swings instantly in either direction. You could lose all profit in seconds. Experience helps here." },
      { id: "b", label: "Close or secure profit before the release", correct: true, explanation: "Smart risk management. Locking in profit before high-impact news removes uncertainty. Professionals often reduce position size or close entirely before major events." },
      { id: "c", label: "Add more positions — more volatility = more profit", correct: false, explanation: "Very dangerous. Volatility cuts both ways. Spreads widen, slippage increases, and unpredictable moves can wipe profits and more. News trading requires specialized knowledge." },
    ],
    lesson: "Major news events (NFP, CPI, central bank decisions) create unpredictable volatility. Many experienced traders avoid trading 30 minutes before and after major releases. Capital preservation first.",
  },
  {
    id: "risk_too_high",
    title: "Sizing the Position Correctly",
    concept: "Position Sizing",
    difficulty: "beginner",
    description: "You have a $5,000 account and found a great setup on EUR/USD with a 30-pip stop loss.",
    setup: "You're excited about this trade. Your friend says to bet big to make big gains. You're considering 5 lots.",
    question: "With $5,000 and a 30-pip SL, what's the appropriate position size?",
    chartScenario: "ranging",
    chartPriceBase: 1.085,
    choices: [
      { id: "a", label: "0.33 lots — risk 2% of account ($100)", correct: true, explanation: "Correct! 2% risk on $5,000 = $100. At 30 pips × $10/pip per standard lot, you can trade 0.33 lots. This keeps losses manageable and your account survives bad runs." },
      { id: "b", label: "5 lots — bigger size = bigger profits", correct: false, explanation: "5 lots with a 30-pip SL = $1,500 loss if stopped out. That's 30% of your account on one trade! Even if the setup is perfect, losses happen. This approach leads to account destruction." },
      { id: "c", label: "1 lot — round numbers feel right", correct: false, explanation: "1 lot would risk $300 (6% of account) on this trade. While not catastrophic, it's above the recommended 1-2% threshold. One losing streak could severely damage your capital." },
    ],
    lesson: "Position sizing is the most important skill in trading. The formula: Risk Amount = Account × Risk% ÷ (Stop Pips × Pip Value). Start with 1-2% risk per trade. This is not exciting — that's the point.",
  },
  {
    id: "reversal_signals",
    title: "Spotting a Trend Reversal",
    concept: "Reversal Patterns",
    difficulty: "advanced",
    description: "EUR/USD has been in a strong downtrend for 6 weeks. Today, a large bullish candle forms on the weekly chart, engulfing the previous 3 bearish candles.",
    setup: "The bullish engulfing candle forms right at a major weekly support zone from 3 years ago. RSI is at 28 (oversold).",
    question: "Strong bullish signal at major support with oversold RSI. What's the trade approach?",
    chartScenario: "trending_up",
    chartPriceBase: 1.075,
    choices: [
      { id: "a", label: "Aggressive long immediately — reversal confirmed", correct: false, explanation: "Patience is required even with strong signals. Wait for the following candle to confirm. A single bullish engulfing can still fail if bearish momentum is too strong." },
      { id: "b", label: "Look for entry on the next candle with confirmation", correct: true, explanation: "Correct! A top-down approach: weekly signal identifies potential reversal, then use daily/4H to find precise entry. Confirmation (follow-through bullish candle, break above recent high) reduces risk." },
      { id: "c", label: "Ignore it — downtrends always continue", correct: false, explanation: "Every trend ends. Multiple confluence signals (engulfing + key support + oversold RSI) significantly increase probability of at least a major correction, if not full reversal." },
    ],
    lesson: "Reversal trading requires multiple confluences: key level + pattern + indicator signal + timeframe alignment. The more factors that agree, the higher the probability. Top-down analysis (weekly → daily → entry on 4H/1H) is the professional method.",
  },
];

// ─── Mini Animated Chart for Scenario ────────────────────────────────────────

function ScenarioMiniChart({ scenario, base }: { scenario: MarketScenario; base: number }) {
  const [candles, setCandles] = useState(() => generateCandles(scenario, 30, base, "1H"));
  const [running, setRunning] = useState(true);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCandles(generateCandles(scenario, 30, base, "1H"));
  }, [scenario, base]);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const next = nextCandle(scenario, last.close, last.timestamp + TIMEFRAME_MS["1H"], "1H");
        return [...prev.slice(-35), next];
      });
    }, 1500);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, scenario]);

  const visible = candles.slice(-25);
  const prices = visible.flatMap((c) => [c.high, c.low]);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 0.001;
  const W = 280, H = 80, pad = 4;

  const py = (p: number) => pad + ((maxP - p) / range) * (H - pad * 2);
  const bw = (W - 8) / visible.length;

  return (
    <div className="relative rounded-lg border border-border/60 bg-secondary/20 p-2">
      <div className="absolute right-2 top-2 flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bull inline-block" />
        <span className="text-[10px] text-muted-foreground">Live</span>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
        {visible.map((c, i) => {
          const bull = c.close >= c.open;
          const color = bull ? "oklch(0.6 0.17 158)" : "oklch(0.6 0.23 25)";
          const cx = 4 + (i + 0.5) * bw;
          return (
            <g key={c.timestamp}>
              <line x1={cx} y1={py(c.high)} x2={cx} y2={py(c.low)} stroke={color} strokeWidth={1} />
              <rect x={cx - bw * 0.3} y={py(Math.max(c.open, c.close))} width={bw * 0.6}
                height={Math.max(1, py(Math.min(c.open, c.close)) - py(Math.max(c.open, c.close)))}
                fill={color} rx={0.5} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Scenario Card ────────────────────────────────────────────────────────────

function ScenarioCard({
  scenario, onComplete
}: {
  scenario: Scenario;
  onComplete: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const correctChoice = scenario.choices.find((c) => c.correct)!;
  const selectedChoice = scenario.choices.find((c) => c.id === selected);

  const handleReveal = () => {
    if (!selected) return;
    setRevealed(true);
    setSimulating(true);
    setTimeout(() => setSimulating(false), 2000);
    setTimeout(() => onComplete(selectedChoice?.correct ?? false), 500);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold shrink-0 ${
          scenario.difficulty === "beginner" ? "bg-bull/15 text-bull" :
          scenario.difficulty === "intermediate" ? "bg-primary/15 text-primary" :
          "bg-gold/15 text-gold"
        }`}>
          {scenario.difficulty === "beginner" ? "B" : scenario.difficulty === "intermediate" ? "I" : "A"}
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">{scenario.concept}</div>
          <h3 className="font-display text-base font-semibold">{scenario.title}</h3>
        </div>
      </div>

      {/* Chart */}
      <ScenarioMiniChart scenario={scenario.chartScenario} base={scenario.chartPriceBase} />

      {/* Setup */}
      <div className="rounded-lg border border-primary/10 bg-primary/5 p-3">
        <div className="mb-1 text-[10px] font-semibold uppercase text-primary">Scenario Setup</div>
        <p className="text-xs text-foreground/80">{scenario.description}</p>
        <p className="mt-1 text-xs text-muted-foreground">{scenario.setup}</p>
      </div>

      {/* Question */}
      <div className="font-medium text-sm">{scenario.question}</div>

      {/* Choices */}
      <div className="space-y-2">
        {scenario.choices.map((choice) => {
          const isSelected = selected === choice.id;
          const showResult = revealed;
          const isCorrect = choice.correct;
          const isWrong = isSelected && !isCorrect && showResult;
          const isRight = isCorrect && showResult;

          return (
            <button key={choice.id} onClick={() => !revealed && setSelected(choice.id)}
              disabled={revealed}
              className={`w-full rounded-lg border p-3 text-left text-sm transition-all ${
                isRight ? "border-bull/30 bg-bull/8 text-bull" :
                isWrong ? "border-bear/30 bg-bear/8 text-bear" :
                isSelected ? "border-primary/30 bg-primary/8 text-primary" :
                "border-border/60 hover:border-primary/20 hover:bg-secondary/40 text-foreground"
              } ${revealed ? "cursor-default" : "cursor-pointer"}`}>
              <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold border ${
                  isRight ? "border-bull bg-bull text-white" :
                  isWrong ? "border-bear bg-bear text-white" :
                  isSelected ? "border-primary bg-primary/15 text-primary" :
                  "border-border text-muted-foreground"
                }`}>
                  {isRight ? "✓" : isWrong ? "✗" : choice.id.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div>{choice.label}</div>
                  {revealed && isSelected && (
                    <div className={`mt-1.5 text-xs ${isCorrect ? "text-bull/80" : "text-bear/80"}`}>
                      {choice.explanation}
                    </div>
                  )}
                  {revealed && !isSelected && isCorrect && (
                    <div className="mt-1.5 text-xs text-bull/80">{choice.explanation}</div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm / Lesson */}
      {!revealed ? (
        <button onClick={handleReveal} disabled={!selected}
          className={`w-full rounded-lg py-2.5 font-semibold text-sm transition-all ${
            selected ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-glow-primary)]" : "bg-secondary text-muted-foreground cursor-not-allowed"
          }`}>
          {selected ? "Reveal Answer" : "Choose an option above"}
        </button>
      ) : (
        <div className={`rounded-lg border p-3 ${selectedChoice?.correct ? "border-bull/20 bg-bull/5" : "border-bear/20 bg-bear/5"}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {selectedChoice?.correct
              ? <CheckCircle className="h-4 w-4 text-bull" />
              : <XCircle className="h-4 w-4 text-bear" />}
            <span className={`text-xs font-semibold ${selectedChoice?.correct ? "text-bull" : "text-bear"}`}>
              {selectedChoice?.correct ? "Great thinking!" : "Good attempt — here's what to know:"}
            </span>
          </div>
          <p className="text-xs text-foreground/80">{scenario.lesson}</p>
        </div>
      )}
    </div>
  );
}

// ─── Progress Tracker ─────────────────────────────────────────────────────────

function ProgressBar({ completed, total, correct }: { completed: number; total: number; correct: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="mb-1 flex justify-between text-[11px]">
          <span className="text-muted-foreground">{completed}/{total} scenarios</span>
          <span className="text-bull font-medium">{correct} correct</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(completed / total) * 100}%` }} />
        </div>
      </div>
      {completed === total && (
        <div className="flex items-center gap-1 text-xs font-semibold text-gold">
          <Star className="h-4 w-4 fill-current" />
          Complete!
        </div>
      )}
    </div>
  );
}

// ─── Main ScenarioLab ─────────────────────────────────────────────────────────

export function ScenarioLab() {
  const tour = useTour(SCENARIO_STEPS);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");

  const filtered = SCENARIOS.filter((s) => filter === "all" || s.difficulty === filter);
  const current = filtered[currentIdx];
  const completed = Object.keys(completedMap).length;
  const correct = Object.values(completedMap).filter(Boolean).length;

  const handleComplete = (isCorrect: boolean) => {
    if (current && !completedMap[current.id]) {
      setCompletedMap((prev) => ({ ...prev, [current.id]: isCorrect }));
    }
  };

  const handleNext = () => {
    if (currentIdx < filtered.length - 1) setCurrentIdx((i) => i + 1);
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-4 relative overflow-hidden">
      <Tour active={tour.active} stepIndex={tour.stepIndex} steps={tour.steps} onNext={tour.next} onPrev={tour.prev} onClose={tour.stop} containerRef={containerRef} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-primary font-medium">Scenario Lab</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            {SCENARIOS.length} scenarios
          </div>
          <button onClick={tour.start} className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors" title="Take Scenario Lab tour">
            <HelpCircle className="h-3 w-3" /> Tour
          </button>
        </div>
      </div>

      {/* Filter */}
      <div data-tour="sl-filter" className="flex gap-1.5">
        {(["all", "beginner", "intermediate", "advanced"] as const).map((f) => (
          <button key={f} onClick={() => { setFilter(f); setCurrentIdx(0); }}
            className={`rounded-md px-2.5 py-1 text-xs capitalize font-medium transition-colors ${
              filter === f ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-secondary border border-transparent"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div data-tour="sl-progress">
        <ProgressBar completed={completed} total={SCENARIOS.length} correct={correct} />
      </div>

      {/* Scenario picker row */}
      <div data-tour="sl-picker" className="flex gap-1.5 overflow-x-auto pb-1">
        {filtered.map((s, i) => {
          const done = completedMap[s.id] !== undefined;
          const isCorrect = completedMap[s.id];
          return (
            <button key={s.id} onClick={() => setCurrentIdx(i)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all border ${
                i === currentIdx ? "border-primary bg-primary/15 text-primary" :
                done && isCorrect ? "border-bull/30 bg-bull/10 text-bull" :
                done && !isCorrect ? "border-bear/30 bg-bear/10 text-bear" :
                "border-border/60 text-muted-foreground hover:border-primary/20"
              }`}>
              {done ? (isCorrect ? "✓" : "✗") : i + 1}
            </button>
          );
        })}
      </div>

      {/* Current scenario */}
      {current && (
        <div data-tour="sl-card" className="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
          <ScenarioCard key={current.id} scenario={current} onComplete={handleComplete} />
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={handlePrev} disabled={currentIdx === 0}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-30">
          ← Previous
        </button>
        <span className="text-xs text-muted-foreground">{currentIdx + 1} of {filtered.length}</span>
        <button onClick={handleNext} disabled={currentIdx === filtered.length - 1}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/15 transition-colors disabled:opacity-30">
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Concepts guide */}
      <div className="rounded-lg border border-primary/10 bg-primary/5 p-3">
        <div className="mb-2 text-xs font-semibold text-primary">Concepts covered in scenarios</div>
        <div className="flex flex-wrap gap-1.5">
          {["Support & Resistance", "Trend Analysis", "Breakouts", "Volatility & Risk", "Position Sizing", "Reversal Patterns"].map((c) => (
            <span key={c} className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
