import { useState, useEffect, useRef, useCallback } from "react";
import { TrendingUp, TrendingDown, X, CheckCircle, AlertCircle, Clock, Target, HelpCircle } from "lucide-react";
import { Trade, calcPnL, isSLHit, isTPHit, Candle } from "./marketEngine";
import { useTour, Tour, TRADE_SIM_STEPS } from "./Tour";

interface Props {
  currentPrice: number;
  currentCandle: Candle | null;
  onTradeOpened?: (trade: Trade) => void;
  onTradeClosed?: (trade: Trade, pnl: number, reason: "sl" | "tp" | "manual") => void;
}

interface ClosedTradeResult {
  trade: Trade;
  pnl: number;
  reason: "sl" | "tp" | "manual";
  duration: number; // seconds
}

// ─── Trade Feedback Component ─────────────────────────────────────────────────

function TradeFeedback({ result, onClose }: { result: ClosedTradeResult; onClose: () => void }) {
  const { trade, pnl, reason, duration } = result;
  const won = pnl > 0;
  const rr = Math.abs((trade.tp - trade.entryPrice) / (trade.entryPrice - trade.sl));
  const actualRR = Math.abs(pnl / (Math.abs(trade.sl - trade.entryPrice) * 10000 * 10 * trade.lots));

  const lessons: { icon: React.ReactNode; label: string; text: string; good: boolean }[] = [];

  // Evaluate the trade
  if (reason === "tp") lessons.push({ icon: <CheckCircle className="h-4 w-4" />, label: "Target Hit", text: "You held the trade to your take profit — excellent discipline!", good: true });
  if (reason === "sl") lessons.push({ icon: <AlertCircle className="h-4 w-4" />, label: "Stop Loss Hit", text: "Your stop loss protected your account. Cutting losses is part of professional trading.", good: true });
  if (reason === "manual") {
    if (won) lessons.push({ icon: <CheckCircle className="h-4 w-4" />, label: "Manual Close (Profit)", text: "You closed in profit. Consider: did you exit too early, or at the right time?", good: true });
    else lessons.push({ icon: <AlertCircle className="h-4 w-4" />, label: "Manual Close (Loss)", text: "You closed at a loss before your stop. This can be useful — but avoid emotional exits.", good: false });
  }

  if (rr >= 1.5) lessons.push({ icon: <CheckCircle className="h-4 w-4" />, label: "Good R:R Setup", text: `You targeted a ${rr.toFixed(1)}:1 risk-to-reward ratio. Consistently doing this is key to profitability.`, good: true });
  else lessons.push({ icon: <AlertCircle className="h-4 w-4" />, label: "Low R:R Ratio", text: `R:R was ${rr.toFixed(1)}:1. Aim for at least 1.5:1 to be profitable even with a 50% win rate.`, good: false });

  if (trade.lots <= 0.5) lessons.push({ icon: <CheckCircle className="h-4 w-4" />, label: "Reasonable Size", text: "Small lot size = controlled risk. Good habit for learning.", good: true });
  else lessons.push({ icon: <AlertCircle className="h-4 w-4" />, label: "Large Position", text: `${trade.lots} lots is significant. Always size positions based on your risk tolerance.`, good: false });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-[var(--shadow-elevated)]"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className={`mb-1 text-xs font-semibold uppercase tracking-wider ${won ? "text-bull" : "text-bear"}`}>
              {won ? "Winning Trade" : "Losing Trade"}
            </div>
            <div className={`font-display text-3xl font-bold ${won ? "text-bull" : "text-bear"}`}>
              {pnl > 0 ? "+" : ""}${pnl.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {trade.side.toUpperCase()} {trade.lots} lots · {Math.floor(duration / 60)}m {duration % 60}s
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-secondary/40 p-3">
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground">Entry</div>
            <div className="font-mono text-xs font-semibold">{trade.entryPrice.toFixed(5)}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground">Closed via</div>
            <div className={`text-xs font-semibold ${reason === "tp" ? "text-bull" : reason === "sl" ? "text-bear" : "text-primary"}`}>
              {reason === "tp" ? "Take Profit" : reason === "sl" ? "Stop Loss" : "Manual"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground">R:R Targeted</div>
            <div className={`text-xs font-semibold ${rr >= 1.5 ? "text-bull" : "text-bear"}`}>{rr.toFixed(1)}:1</div>
          </div>
        </div>

        {/* Lessons */}
        <div className="mb-4 space-y-2">
          <div className="text-xs font-semibold text-foreground">What you can learn:</div>
          {lessons.map((l, i) => (
            <div key={i} className={`flex gap-2.5 rounded-lg p-2.5 ${l.good ? "bg-bull/5 border border-bull/15" : "bg-bear/5 border border-bear/15"}`}>
              <div className={`mt-0.5 shrink-0 ${l.good ? "text-bull" : "text-bear"}`}>{l.icon}</div>
              <div>
                <div className={`text-xs font-semibold ${l.good ? "text-bull" : "text-bear"}`}>{l.label}</div>
                <div className="text-xs text-muted-foreground">{l.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-muted-foreground text-center">
          This is a simulation. No real money involved. Learn safely.
        </div>
        <button onClick={onClose}
          className="mt-3 w-full rounded-lg border border-primary/20 bg-primary/5 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
          Continue Practicing
        </button>
      </div>
    </div>
  );
}

// ─── Live P&L Ticker ──────────────────────────────────────────────────────────

function PnLTicker({ pnl, prevPnl }: { pnl: number; prevPnl: number }) {
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (pnl > prevPnl) setFlash("up");
    else if (pnl < prevPnl) setFlash("down");
    const t = setTimeout(() => setFlash(null), 300);
    return () => clearTimeout(t);
  }, [pnl, prevPnl]);

  return (
    <div className={`transition-colors duration-300 font-display text-3xl font-bold ${
      flash === "up" ? "text-bull" : flash === "down" ? "text-bear" : pnl >= 0 ? "text-bull" : "text-bear"
    }`}>
      {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
    </div>
  );
}

// ─── Risk Bar ─────────────────────────────────────────────────────────────────

function RiskBar({ sl, entry, current, side }: { sl: number; entry: number; current: number; side: "buy" | "sell" }) {
  const maxRisk = Math.abs(entry - sl);
  if (maxRisk === 0) return null;

  const currentDist = side === "buy" ? current - entry : entry - current;
  const pct = Math.max(-100, Math.min(100, (currentDist / maxRisk) * 100));

  return (
    <div className="mt-1">
      <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
        <span>SL zone</span>
        <span className={pct >= 0 ? "text-bull" : "text-bear"}>
          {pct >= 0 ? "▲ " : "▼ "}{Math.abs(pct).toFixed(0)}% toward {pct >= 0 ? "TP" : "SL"}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
        <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
        <div
          className={`absolute top-0 h-full rounded-full transition-all duration-500 ${pct >= 0 ? "bg-bull" : "bg-bear"}`}
          style={{
            left: pct >= 0 ? "50%" : `${50 + pct}%`,
            width: `${Math.abs(pct) / 2}%`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Main TradePanel ──────────────────────────────────────────────────────────

export function TradePanel({ currentPrice, currentCandle, onTradeOpened, onTradeClosed }: Props) {
  const tour = useTour(TRADE_SIM_STEPS);
  const containerRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [lots, setLots] = useState(0.1);
  const [slPips, setSlPips] = useState(20);
  const [tpPips, setTpPips] = useState(40);
  const [activeTrade, setActiveTrade] = useState<Trade | null>(null);
  const [livePrice, setLivePrice] = useState(currentPrice);
  const [pnl, setPnl] = useState(0);
  const [prevPnl, setPrevPnl] = useState(0);
  const [closedResult, setClosedResult] = useState<ClosedTradeResult | null>(null);
  const tradeStartTime = useRef<number>(0);

  // Sync live price
  useEffect(() => { setLivePrice(currentPrice); }, [currentPrice]);

  // Update P&L
  useEffect(() => {
    if (!activeTrade) return;
    setPrevPnl(pnl);
    setPnl(calcPnL(activeTrade, livePrice));
  }, [livePrice, activeTrade]);

  // Check SL/TP
  useEffect(() => {
    if (!activeTrade || !currentCandle) return;
    if (isSLHit(activeTrade, currentCandle)) closeTrade("sl");
    else if (isTPHit(activeTrade, currentCandle)) closeTrade("tp");
  }, [currentCandle, activeTrade]);

  const pipSize = 0.0001; // For EUR/USD
  const slPrice = side === "buy" ? currentPrice - slPips * pipSize : currentPrice + slPips * pipSize;
  const tpPrice = side === "buy" ? currentPrice + tpPips * pipSize : currentPrice - tpPips * pipSize;
  const rr = tpPips / slPips;
  const maxLoss = slPips * 10 * lots; // $10 per pip per standard lot, scaled by lots

  const openTrade = useCallback(() => {
    if (activeTrade) return;
    const trade: Trade = {
      id: Math.random().toString(36).slice(2),
      side,
      lots,
      entryPrice: currentPrice,
      sl: slPrice,
      tp: tpPrice,
      openTime: Date.now(),
    };
    setActiveTrade(trade);
    tradeStartTime.current = Date.now();
    setPnl(0);
    setPrevPnl(0);
    onTradeOpened?.(trade);
  }, [activeTrade, side, lots, currentPrice, slPrice, tpPrice, onTradeOpened]);

  const closeTrade = useCallback((reason: "sl" | "tp" | "manual") => {
    if (!activeTrade) return;
    const finalPnl = calcPnL(activeTrade, livePrice);
    const duration = Math.floor((Date.now() - tradeStartTime.current) / 1000);
    const result: ClosedTradeResult = { trade: activeTrade, pnl: finalPnl, reason, duration };
    setClosedResult(result);
    setActiveTrade(null);
    setPnl(0);
    onTradeClosed?.(activeTrade, finalPnl, reason);
  }, [activeTrade, livePrice, onTradeClosed]);

  return (
    <>
      <div ref={containerRef} className="flex flex-col gap-4 relative overflow-hidden">
        <Tour active={tour.active} stepIndex={tour.stepIndex} steps={tour.steps} onNext={tour.next} onPrev={tour.prev} onClose={tour.stop} containerRef={containerRef} />
        {/* Live price */}
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-primary font-medium">Trade Simulator</div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold">{livePrice.toFixed(5)}</span>
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-bull" />
            <button onClick={tour.start} className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors" title="Take Trade Simulator tour">
              <HelpCircle className="h-3 w-3" /> Tour
            </button>
          </div>
        </div>

        {/* Active trade display */}
        {activeTrade && (
          <div className={`rounded-lg border p-3 ${pnl >= 0 ? "border-bull/20 bg-bull/5" : "border-bear/20 bg-bear/5"}`}>
            <div className="mb-2 flex items-center justify-between">
              <div className={`text-xs font-semibold uppercase ${activeTrade.side === "buy" ? "text-bull" : "text-bear"}`}>
                {activeTrade.side === "buy" ? <TrendingUp className="inline h-3.5 w-3.5 mr-1" /> : <TrendingDown className="inline h-3.5 w-3.5 mr-1" />}
                {activeTrade.side.toUpperCase()} {activeTrade.lots} lots
              </div>
              <button onClick={() => closeTrade("manual")}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium bg-secondary hover:bg-secondary/70 transition-colors">
                <X className="h-3 w-3" /> Close
              </button>
            </div>

            <div className="mb-2 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] text-muted-foreground">Entry</div>
                <div className="font-mono text-xs">{activeTrade.entryPrice.toFixed(5)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">SL</div>
                <div className="font-mono text-xs text-bear">{activeTrade.sl.toFixed(5)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">TP</div>
                <div className="font-mono text-xs text-bull">{activeTrade.tp.toFixed(5)}</div>
              </div>
            </div>

            <PnLTicker pnl={pnl} prevPnl={prevPnl} />
            <div className="text-xs text-muted-foreground">{Math.abs(pnl / maxLoss * 100).toFixed(1)}% of max risk</div>
            <RiskBar sl={activeTrade.sl} entry={activeTrade.entryPrice} current={livePrice} side={activeTrade.side} />
          </div>
        )}

        {/* Trade entry form */}
        {!activeTrade && (
          <>
            {/* Buy / Sell toggle */}
            <div data-tour="tp-side-toggle" className="grid grid-cols-2 gap-1.5 rounded-lg bg-secondary/50 p-1">
              <button onClick={() => setSide("buy")}
                className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold transition-all ${
                  side === "buy" ? "bg-bull text-white shadow-[var(--shadow-glow-bull)]" : "text-muted-foreground hover:text-bull"
                }`}>
                <TrendingUp className="h-4 w-4" /> Buy
              </button>
              <button onClick={() => setSide("sell")}
                className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold transition-all ${
                  side === "sell" ? "bg-bear text-white" : "text-muted-foreground hover:text-bear"
                }`}>
                <TrendingDown className="h-4 w-4" /> Sell
              </button>
            </div>

            {/* Lot size */}
            <div data-tour="tp-lots">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">Lot size</span>
                <span className="font-medium">{lots.toFixed(2)}</span>
              </div>
              <input type="range" min={0.01} max={1} step={0.01} value={lots}
                onChange={(e) => setLots(+e.target.value)}
                className="w-full accent-primary" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0.01 (micro)</span><span>0.10 (mini)</span><span>1.00 (standard)</span>
              </div>
            </div>

            {/* Stop Loss */}
            <div data-tour="tp-sl">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">Stop Loss</span>
                <span className="text-bear font-medium">{slPips} pips · {slPrice.toFixed(5)}</span>
              </div>
              <input type="range" min={5} max={100} step={5} value={slPips}
                onChange={(e) => setSlPips(+e.target.value)}
                className="w-full accent-[oklch(0.6_0.23_25)]" />
            </div>

            {/* Take Profit */}
            <div data-tour="tp-tp">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">Take Profit</span>
                <span className="text-bull font-medium">{tpPips} pips · {tpPrice.toFixed(5)}</span>
              </div>
              <input type="range" min={5} max={200} step={5} value={tpPips}
                onChange={(e) => setTpPips(+e.target.value)}
                className="w-full accent-[oklch(0.6_0.17_158)]" />
            </div>

            {/* R:R summary */}
            <div data-tour="tp-rr" className="rounded-lg bg-secondary/40 p-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[10px] text-muted-foreground">R:R Ratio</div>
                  <div className={`font-display text-lg font-bold ${rr >= 1.5 ? "text-bull" : rr >= 1 ? "text-primary" : "text-bear"}`}>
                    {rr.toFixed(1)}:1
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Max Loss</div>
                  <div className="font-display text-lg font-bold text-bear">${maxLoss.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Potential</div>
                  <div className="font-display text-lg font-bold text-bull">+${(tpPips * 10 * lots).toFixed(0)}</div>
                </div>
              </div>
              {rr < 1 && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-bear">
                  <AlertCircle className="h-3 w-3" />
                  R:R below 1:1 — risk outweighs reward. Consider widening TP or tightening SL.
                </div>
              )}
            </div>

            {/* Execute button */}
            <button data-tour="tp-execute" onClick={openTrade}
              className={`w-full rounded-lg py-3 font-display text-sm font-bold text-white transition-all ${
                side === "buy"
                  ? "bg-bull hover:bg-bull/90 shadow-[var(--shadow-glow-bull)] hover:shadow-[var(--shadow-glow-bull)]"
                  : "bg-bear hover:bg-bear/90"
              }`}>
              {side === "buy" ? <TrendingUp className="inline h-4 w-4 mr-1.5" /> : <TrendingDown className="inline h-4 w-4 mr-1.5" />}
              Open {side.toUpperCase()} Trade (Simulation)
            </button>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Target className="h-3 w-3" />
              Simulated trade only. No real money. For learning purposes.
            </div>
          </>
        )}

        {/* Trade statistics hint */}
        <div className="rounded-lg border border-primary/10 bg-primary/5 p-3 text-xs">
          <div className="mb-1 font-semibold text-primary">Why R:R matters</div>
          <div className="text-muted-foreground">
            With a 2:1 risk-to-reward ratio, you only need to win <span className="font-medium text-foreground">34% of trades</span> to break even.
            At 1:1, you need 50%. This is why professionals focus on R:R, not just win rate.
          </div>
        </div>
      </div>

      {/* Feedback modal */}
      {closedResult && (
        <TradeFeedback result={closedResult} onClose={() => setClosedResult(null)} />
      )}
    </>
  );
}
