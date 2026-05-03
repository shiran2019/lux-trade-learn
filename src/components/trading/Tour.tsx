import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronRight, ChevronLeft, BarChart2, TrendingUp, Calculator, BookOpen, Lightbulb, Play } from "lucide-react";

// ─── Tour Step Definition ─────────────────────────────────────────────────────

export interface TourStep {
  target: string;           // data-tour attribute value
  title: string;
  content: string;
  icon: React.ReactNode;
  position: "top" | "bottom" | "left" | "right" | "center";
  highlight?: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "welcome",
    title: "Welcome to the Learning Lab",
    content: "This is your personal trading simulator. You'll learn how real markets move, practice reading charts, manage risk, and work through guided scenarios — all with zero real money involved.",
    icon: <Play className="h-5 w-5" />,
    position: "center",
  },
  {
    target: "level-badge",
    title: "Your Learning Level",
    content: "You start as a Beginner. As you explore and feel comfortable, click 'Unlock next level' to access more tools. Beginner → Intermediate unlocks the Trade Simulator.",
    icon: <Lightbulb className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "tab-chart",
    title: "Live Chart Tab",
    content: "The Live Chart shows EUR/USD price moving in real time. Switch between 4 market scenarios: Uptrend, Downtrend, Ranging, and Volatile. Watch how markets behave differently in each scenario.",
    icon: <BarChart2 className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "tab-risk",
    title: "Risk Lab Tab",
    content: "The Risk Lab lets you visually understand position sizing and leverage. Change your account balance, risk %, and lot size to see exactly how much you're putting on the line before placing any trade.",
    icon: <Calculator className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "tab-scenarios",
    title: "Scenario Lab Tab",
    content: "Scenario Lab presents real trading situations with multiple-choice answers. You'll see a live chart, read the setup, and choose what you think happens next. The answer reveals the underlying concept.",
    icon: <BookOpen className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "tab-trade",
    title: "Trade Simulator (Unlocks at Intermediate)",
    content: "Once you reach Intermediate level, you can open simulated Buy/Sell trades. Set a Stop Loss and Take Profit, then watch your P&L update live. The system auto-closes if your SL or TP is hit.",
    icon: <TrendingUp className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "chart-scenarios",
    title: "Switching Market Scenarios",
    content: "Inside the Live Chart, use the scenario buttons (Uptrend / Downtrend / Ranging / Volatile) to switch market conditions. Each scenario teaches different price behaviour and trading setups.",
    icon: <BarChart2 className="h-5 w-5" />,
    position: "center",
  },
  {
    target: "chart-indicators",
    title: "Advanced Chart Indicators",
    content: "Switch between 8 indicator views: Clean, MA (Moving Averages), Bollinger Bands (volatility), RSI (momentum), Stochastic (momentum), MACD (trend), Ichimoku (support/resistance), and ATR (volatility). Each shows different aspects of price action.",
    icon: <Lightbulb className="h-5 w-5" />,
    position: "center",
  },
  {
    target: "ai-analysis",
    title: "AI Analysis Button",
    content: "Click 'AI Analysis' on the chart to get a contextual breakdown of the current market: trend direction, RSI reading, key levels, and what to watch for. Educational only — not trading advice.",
    icon: <Lightbulb className="h-5 w-5" />,
    position: "center",
  },
  {
    target: "finish",
    title: "You're ready to explore!",
    content: "Start with the Live Chart — watch the market move, change scenarios, and try the indicators. When you're comfortable, head to Scenario Lab and test your understanding. There's no wrong way to learn here.",
    icon: <Play className="h-5 w-5" />,
    position: "center",
  },
];

// ─── Spotlight Overlay ────────────────────────────────────────────────────────

interface SpotlightProps {
  targetEl: HTMLElement | null;
  visible: boolean;
  containerEl?: HTMLDivElement | null;
}

function Spotlight({ targetEl, visible, containerEl }: SpotlightProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!targetEl || !visible) { setRect(null); return; }
    const update = () => {
      setRect(targetEl.getBoundingClientRect());
      if (containerEl) {
        setContainerRect(containerEl.getBoundingClientRect());
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [targetEl, visible, containerEl]);

  if (!rect || !visible) return null;

  const pad = 6;
  const useContainer = !!containerEl && containerRect;

  return (
    <div className={`pointer-events-none z-[998] ${useContainer ? "absolute" : "fixed"} inset-0`} aria-hidden
      style={useContainer ? { left: 0, top: 0, width: "100%", height: "100%" } : {}}>
      {/* Dark overlay with cut-out */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {useContainer && containerRect ? (
              <rect
                x={rect.left - containerRect.left - pad} y={rect.top - containerRect.top - pad}
                width={rect.width + pad * 2} height={rect.height + pad * 2}
                rx={10} fill="black"
              />
            ) : (
              <rect
                x={rect.left - pad} y={rect.top - pad}
                width={rect.width + pad * 2} height={rect.height + pad * 2}
                rx={10} fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="oklch(0.1 0.02 268 / 0.65)" mask="url(#spotlight-mask)" />
      </svg>
      {/* Glowing border around target */}
      <div
        className="absolute rounded-xl transition-all duration-300"
        style={{
          left: useContainer && containerRect ? (rect.left - containerRect.left - pad) : (rect.left - pad),
          top: useContainer && containerRect ? (rect.top - containerRect.top - pad) : (rect.top - pad),
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: "0 0 0 2px oklch(0.74 0.17 78), 0 0 24px 4px oklch(0.74 0.17 78 / 0.4)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ─── Tour Tooltip ─────────────────────────────────────────────────────────────

interface TooltipProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  targetEl: HTMLElement | null;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

function TourTooltip({ step, stepIndex, totalSteps, targetEl, onNext, onPrev, onClose }: TooltipProps) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  useEffect(() => {
    if (step.position === "center" || !targetEl) {
      // Center on screen
      setPos({
        top: window.innerHeight / 2 - 140,
        left: window.innerWidth / 2 - 170,
      });
      return;
    }
    const rect = targetEl.getBoundingClientRect();
    const tw = 340;
    const th = 240;
    const gap = 16;
    let top = 0, left = 0;

    if (step.position === "bottom") {
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - tw / 2;
    } else if (step.position === "top") {
      top = rect.top - th - gap;
      left = rect.left + rect.width / 2 - tw / 2;
    } else if (step.position === "right") {
      top = rect.top + rect.height / 2 - th / 2;
      left = rect.right + gap;
    } else if (step.position === "left") {
      top = rect.top + rect.height / 2 - th / 2;
      left = rect.left - tw - gap;
    }

    // Clamp to viewport
    left = Math.max(12, Math.min(left, window.innerWidth - tw - 12));
    top = Math.max(80, Math.min(top, window.innerHeight - th - 12));
    setPos({ top, left });
  }, [step, targetEl]);

  const progress = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[999] w-[340px] rounded-2xl border border-primary/20 bg-card shadow-[var(--shadow-elevated)] animate-fade-up"
      style={{ top: pos.top, left: pos.left }}
    >
      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-t-2xl bg-secondary">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "var(--gradient-gold)" }} />
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {step.icon}
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                Step {stepIndex + 1} of {totalSteps}
              </div>
              <div className="font-display text-sm font-bold leading-tight">{step.title}</div>
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <p className="text-xs leading-relaxed text-muted-foreground">{step.content}</p>

        {/* Step dots */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                i === stepIndex ? "w-5 bg-primary" : i < stepIndex ? "w-1.5 bg-primary/40" : "w-1.5 bg-secondary"
              }`} />
            ))}
          </div>

          <div className="flex gap-2">
            {!isFirst && (
              <button onClick={onPrev}
                className="flex items-center gap-1 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
            <button onClick={isLast ? onClose : onNext}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: isLast ? "var(--gradient-gold)" : "var(--gradient-primary)", boxShadow: "var(--shadow-glow-primary)" }}>
              {isLast ? "Start exploring!" : <><span>Next</span><ChevronRight className="h-3.5 w-3.5" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Per-Tab Tour Step Arrays ─────────────────────────────────────────────────

export const LIVE_CHART_STEPS: TourStep[] = [
  {
    target: "lc-welcome",
    title: "Welcome to the Live Chart",
    content: "This is a live EUR/USD simulation. The price updates every 1.2 seconds. You can switch scenarios, change timeframes, add indicators, and get an AI explanation of what's happening — all in real time.",
    icon: <BarChart2 className="h-5 w-5" />,
    position: "center",
  },
  {
    target: "lc-scenarios",
    title: "Market Scenarios",
    content: "Switch between 4 different market conditions: Uptrend (higher highs & lows), Downtrend (lower highs & lows), Ranging (price bouncing between levels), and Volatile (news-event simulation). Each teaches different patterns.",
    icon: <TrendingUp className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "lc-timeframes",
    title: "Timeframes (1M → 1D)",
    content: "Each button changes the candle interval. 1M = 1-minute candles (fast, noisy). 1D = daily candles (slow, cleaner). Beginners: use 1H or 4H. Short-term traders use 5M–15M. Long-term traders use 4H–1D.",
    icon: <BarChart2 className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "lc-indicators",
    title: "Chart Indicators (Select Multiple!)",
    content: "Click any indicator button to toggle it ON/OFF. You can select multiple indicators at the same time to compare different perspectives! Try combining MA + RSI or BB + MACD to see how different tools confirm each other.",
    icon: <Lightbulb className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "lc-sr-btn",
    title: "Support & Resistance Overlay",
    content: "Toggle horizontal S/R lines on the chart. Green lines = support (price tends to bounce up here). Red lines = resistance (price tends to reverse down here). These are key areas traders watch.",
    icon: <Lightbulb className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "lc-ai-btn",
    title: "Indicator Analysis Panel",
    content: "Click this to open detailed explanations for selected indicators. When you select MA, RSI, MACD, Bollinger Bands, etc., this panel shows what EACH indicator says about the current trend — plain-English analysis with exact values and what to do next.",
    icon: <Play className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "lc-live-btn",
    title: "Live / Pause Control",
    content: "Green 'Live' = chart is ticking every 1.2s. Click to Pause and study the chart without it moving. Pause is useful when you're reading an indicator or want to understand a candle pattern without the chart changing.",
    icon: <Play className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "lc-trend-badge",
    title: "Trend & Breakout Badges",
    content: "These auto-update badges show the detected trend direction (Uptrend / Downtrend / Ranging) and flash a Breakout alert when price breaks through a key S/R level. Watch for these during the Volatile scenario.",
    icon: <TrendingUp className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "lc-finish",
    title: "Try it yourself!",
    content: "Switch to 'Ranging' scenario + 1H timeframe, turn on MA, and enable S/R levels. Watch how price bounces between the green (support) and red (resistance) lines — that's a classic range trade setup.",
    icon: <Play className="h-5 w-5" />,
    position: "center",
  },
];

export const TRADE_SIM_STEPS: TourStep[] = [
  {
    target: "tp-welcome",
    title: "Welcome to the Trade Simulator",
    content: "Here you practice placing real trades — with zero real money. You'll pick a direction, set your Stop Loss and Take Profit, then watch your P&L update live as the market moves. After close, you get an educational breakdown.",
    icon: <TrendingUp className="h-5 w-5" />,
    position: "center",
  },
  {
    target: "tp-side-toggle",
    title: "Buy or Sell?",
    content: "Buy (long) = you profit when price goes UP. Sell (short) = you profit when price goes DOWN. Choose based on the scenario: uptrend → lean Buy, downtrend → lean Sell. Your direction is set before opening the trade.",
    icon: <TrendingUp className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "tp-lots",
    title: "Lot Size — Your Position Size",
    content: "0.01 = micro lot (smallest, ~$0.10/pip). 0.10 = mini lot (~$1/pip). 1.00 = standard lot (~$10/pip). Start with 0.01–0.10 while learning. Lot size directly controls how much you gain or lose per pip of price movement.",
    icon: <Calculator className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "tp-sl",
    title: "Stop Loss — Your Safety Net",
    content: "If the market moves this many pips against you, the trade closes automatically to limit your loss. E.g., 20 pips SL on a Buy at 1.0850 = trade closes if price drops to 1.0830. ALWAYS set a stop loss — it protects your account.",
    icon: <Lightbulb className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "tp-tp",
    title: "Take Profit — Your Target",
    content: "If price reaches your target, the trade closes automatically to lock in profit. E.g., 40 pips TP on a Buy at 1.0850 = closes at 1.0890. A good rule: your TP should be at least 1.5× your SL distance (1.5:1 R:R or better).",
    icon: <Lightbulb className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "tp-rr",
    title: "Risk:Reward Summary",
    content: "This card auto-calculates your setup quality. R:R Ratio: how much you risk vs. how much you could win. Max Loss: worst case dollar amount. With 2:1 R:R, you only need to win 34% of trades to be profitable overall.",
    icon: <Calculator className="h-5 w-5" />,
    position: "top",
    highlight: true,
  },
  {
    target: "tp-execute",
    title: "Open Trade & Watch It Live",
    content: "Click to open the simulated position. Your P&L will flash green/red with every price tick. The trade closes when SL or TP is hit — or manually click 'Close'. After close, you'll see a detailed educational breakdown of your trade.",
    icon: <Play className="h-5 w-5" />,
    position: "top",
    highlight: true,
  },
];

export const RISK_LAB_STEPS: TourStep[] = [
  {
    target: "rl-welcome",
    title: "Welcome to the Risk Lab",
    content: "Risk management is the #1 skill that separates consistent traders from gamblers. This lab lets you visually see exactly what your position size, leverage, and stop loss mean in dollar terms — before you ever place a trade.",
    icon: <Calculator className="h-5 w-5" />,
    position: "center",
  },
  {
    target: "rl-balance",
    title: "Account Balance",
    content: "Select a preset or enter a custom balance. This is your starting capital. All risk calculations are based on a % of this balance. Try $1,000 to start — it's a common beginner account size.",
    icon: <Calculator className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "rl-leverage",
    title: "Leverage — The Double-Edged Sword",
    content: "Leverage lets you control a larger position with less capital. 30:1 means $1,000 controls $30,000. Higher leverage = bigger gains AND bigger losses. Brokers offer up to 500:1 — but professionals rarely use above 10:1. Watch the ⚠️ warning levels.",
    icon: <Lightbulb className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "rl-sliders",
    title: "Risk % and Stop Loss",
    content: "Risk % = what percentage of your account you're willing to lose on one trade. The green-to-red scale shows safe to dangerous ranges. 1–2% is professional standard. Stop loss pips = how far price can go against you. Together they calculate your exact position size.",
    icon: <Lightbulb className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "rl-metrics",
    title: "Position Size & Margin Cards",
    content: "These 4 cards update in real time. Position Size = how many lots you should trade. Margin Required = capital locked by the broker. Max Loss = worst case $ if SL hits. Target Profit = best case $ if TP hits. The balance bar shows this visually.",
    icon: <BarChart2 className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "rl-loss-sim",
    title: "Consecutive Loss Simulator",
    content: "Click 'Simulate 20 losses' to see how your balance shrinks with repeated losing trades at your current risk %. At 2% risk, even 20 losses still leaves you 67% of your capital. At 10% risk, 20 losses wipes you to near zero. This is why % risk matters.",
    icon: <Lightbulb className="h-5 w-5" />,
    position: "top",
    highlight: true,
  },
];

export const SCENARIO_STEPS: TourStep[] = [
  {
    target: "sl-welcome",
    title: "Welcome to Scenario Lab",
    content: "Each scenario presents a real trading situation with a live chart and a question. You pick the most likely outcome, then see if you were right — and crucially, WHY. This builds the pattern recognition that experienced traders use automatically.",
    icon: <BookOpen className="h-5 w-5" />,
    position: "center",
  },
  {
    target: "sl-filter",
    title: "Difficulty Filter",
    content: "Filter scenarios by level. Beginner = foundational concepts (support/resistance, trends). Intermediate = more nuanced setups (breakouts, news events). Advanced = complex multi-factor scenarios. Start at Beginner and progress in order.",
    icon: <Lightbulb className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "sl-progress",
    title: "Your Progress",
    content: "The progress bar tracks how many scenarios you've completed and how many you answered correctly. Correct answers turn green, wrong ones turn red in the scenario picker below. Aim to understand why each answer is right — not just memorize.",
    icon: <BarChart2 className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "sl-picker",
    title: "Scenario Picker",
    content: "These numbered buttons let you jump to any scenario. ✓ = you answered correctly. ✗ = incorrect. Highlighted blue = currently active. You can revisit scenarios as many times as you want — understanding the lesson matters more than the score.",
    icon: <BookOpen className="h-5 w-5" />,
    position: "bottom",
    highlight: true,
  },
  {
    target: "sl-card",
    title: "How to Use a Scenario",
    content: "1. Read the scenario description and setup. 2. Study the mini chart — it shows the actual market condition. 3. Read the question carefully. 4. Pick your answer. 5. Click 'Reveal Answer' to see the explanation. The lesson at the bottom explains the core concept.",
    icon: <Play className="h-5 w-5" />,
    position: "top",
    highlight: true,
  },
];

// ─── Main Tour Hook ───────────────────────────────────────────────────────────

export function useTour(steps: TourStep[] = TOUR_STEPS) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const start = useCallback(() => { setStepIndex(0); setActive(true); }, []);
  const stop = useCallback(() => setActive(false), []);
  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i >= steps.length - 1) { setActive(false); return i; }
      return i + 1;
    });
  }, [steps.length]);
  const prev = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), []);

  return { active, stepIndex, steps, start, stop, next, prev };
}

// ─── Tour Component (renders overlay + tooltip) ───────────────────────────────

interface TourProps {
  active: boolean;
  stepIndex: number;
  steps: TourStep[];
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function Tour({ active, stepIndex, steps, onNext, onPrev, onClose, containerRef }: TourProps) {
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);
  const step = steps[stepIndex];

  useEffect(() => {
    if (!active || !step) return;
    if (step.position === "center" || !step.highlight) {
      setTargetEl(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${step.target}"]`) as HTMLElement | null;
    setTargetEl(el);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [active, step, stepIndex]);

  // Close on Escape
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, onClose]);

  if (!active || !step) return null;

  return (
    <>
      <Spotlight targetEl={targetEl} visible={!!targetEl} containerEl={containerRef?.current} />
      {/* Click-blocker for center steps */}
      {!targetEl && (
        <div className="fixed inset-0 z-[998] bg-[oklch(0.1_0.02_268/0.65)]" onClick={onClose} />
      )}
      <TourTooltip
        step={step} stepIndex={stepIndex} totalSteps={steps.length}
        targetEl={targetEl} onNext={onNext} onPrev={onPrev} onClose={onClose}
      />
    </>
  );
}
