import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, ResponsiveContainer,
  ReferenceLine, Tooltip, Cell,
} from "recharts";
import {
  Play, Pause, TrendingUp, TrendingDown, Activity, Minus,
  BarChart2, Zap, ChevronUp, ChevronDown, Eye, EyeOff, HelpCircle,
} from "lucide-react";
import {
  Candle, MarketScenario, Timeframe, generateCandles, nextCandle,
  calcSMA, calcEMA, calcRSI, calcMACD, findSRLevels, detectTrend, detectBreakout,
  calcBollingerBands, calcStochastic, calcIchimoku, calcATR,
  TIMEFRAME_MS,
} from "./marketEngine";
import { useTour, Tour, LIVE_CHART_STEPS } from "./Tour";

interface Props {
  onPriceUpdate?: (price: number, candle: Candle) => void;
}

type Indicator = "none" | "ma" | "rsi" | "macd" | "bb" | "stoch" | "ichimoku" | "atr";

const SCENARIOS: { id: MarketScenario; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "trending_up", label: "Uptrend", icon: <TrendingUp className="h-3.5 w-3.5" />, desc: "Market making higher highs & higher lows" },
  { id: "trending_down", label: "Downtrend", icon: <TrendingDown className="h-3.5 w-3.5" />, desc: "Market making lower highs & lower lows" },
  { id: "ranging", label: "Ranging", icon: <Minus className="h-3.5 w-3.5" />, desc: "Price bouncing between support & resistance" },
  { id: "volatile", label: "Volatile", icon: <Zap className="h-3.5 w-3.5" />, desc: "High volatility — news event simulation" },
];

const TIMEFRAMES: Timeframe[] = ["1M", "5M", "15M", "1H", "4H", "1D"];

// ─── Custom Candlestick SVG Renderer ─────────────────────────────────────────

interface CandleSVGProps {
  candles: Candle[];
  width: number;
  height: number;
  padL?: number;
  padR?: number;
  padT?: number;
  padB?: number;
  sma20?: (number | null)[];
  sma50?: (number | null)[];
  ema20?: (number | null)[];
  srLevels?: { support: number[]; resistance: number[] };
  bbands?: { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] };
  ichimoku?: { tenkan: (number | null)[]; kijun: (number | null)[]; senkouA: (number | null)[]; senkouB: (number | null)[]; chikou: (number | null)[] };
  showMA: boolean;
  highlightLast?: boolean;
}

function CandleSVG({
  candles, width, height, padL = 8, padR = 60, padT = 12, padB = 24,
  sma20, sma50, ema20, srLevels, bbands, ichimoku, showMA, highlightLast,
}: CandleSVGProps) {
  if (!candles.length) return null;

  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const visible = candles.slice(-60);
  const candleW = Math.max(3, innerW / visible.length);
  const bodyW = Math.max(2, candleW * 0.6);

  const allPrices = visible.flatMap((c) => [c.high, c.low]);
  const rawMin = Math.min(...allPrices);
  const rawMax = Math.max(...allPrices);
  const priceRange = rawMax - rawMin || 0.001;
  const padding = priceRange * 0.05;
  const minP = rawMin - padding;
  const maxP = rawMax + padding;

  const py = (price: number) => padT + ((maxP - price) / (maxP - minP)) * innerH;
  const px = (i: number) => padL + (i + 0.5) * candleW;

  // Price labels (y-axis)
  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks }, (_, i) => {
    const p = minP + (i / (yTicks - 1)) * (maxP - minP);
    return { price: p, y: py(p) };
  });

  // X-axis: show every Nth label
  const xLabelEvery = Math.max(1, Math.floor(visible.length / 6));

  return (
    <svg width={width} height={height} className="select-none">
      {/* Grid lines */}
      {yLabels.map(({ y }, i) => (
        <line key={i} x1={padL} x2={width - padR} y1={y} y2={y}
          stroke="oklch(0.18 0.025 260 / 0.07)" strokeWidth={1} />
      ))}

      {/* S/R Levels */}
      {srLevels?.resistance.map((r, i) => (
        <g key={`r${i}`}>
          <line x1={padL} x2={width - padR} y1={py(r)} y2={py(r)}
            stroke="oklch(0.6 0.23 25 / 0.5)" strokeWidth={1} strokeDasharray="4 4" />
          <text x={width - padR + 3} y={py(r) + 4} fontSize={9} fill="oklch(0.6 0.23 25)" fontFamily="monospace">R</text>
        </g>
      ))}
      {srLevels?.support.map((s, i) => (
        <g key={`s${i}`}>
          <line x1={padL} x2={width - padR} y1={py(s)} y2={py(s)}
            stroke="oklch(0.6 0.17 158 / 0.5)" strokeWidth={1} strokeDasharray="4 4" />
          <text x={width - padR + 3} y={py(s) + 4} fontSize={9} fill="oklch(0.6 0.17 158)" fontFamily="monospace">S</text>
        </g>
      ))}

      {/* MA Lines */}
      {showMA && sma20 && (() => {
        const offset = candles.length - visible.length;
        const pts = visible.map((_, i) => {
          const v = sma20[i + offset];
          return v != null ? `${px(i)},${py(v)}` : null;
        }).filter(Boolean);
        if (pts.length < 2) return null;
        const d = "M" + pts.join(" L");
        return <path d={d} fill="none" stroke="oklch(0.32 0.13 268 / 0.8)" strokeWidth={1.5} />;
      })()}

      {showMA && sma50 && (() => {
        const offset = candles.length - visible.length;
        const pts = visible.map((_, i) => {
          const v = sma50[i + offset];
          return v != null ? `${px(i)},${py(v)}` : null;
        }).filter(Boolean);
        if (pts.length < 2) return null;
        const d = "M" + pts.join(" L");
        return <path d={d} fill="none" stroke="oklch(0.74 0.17 78 / 0.8)" strokeWidth={1.5} strokeDasharray="4 3" />;
      })()}

      {/* Bollinger Bands */}
      {bbands && (() => {
        const offset = candles.length - visible.length;
        const upper = visible.map((_, i) => {
          const v = bbands.upper[i + offset];
          return v != null ? `${px(i)},${py(v)}` : null;
        }).filter(Boolean);
        const lower = visible.map((_, i) => {
          const v = bbands.lower[i + offset];
          return v != null ? `${px(i)},${py(v)}` : null;
        }).filter(Boolean);
        const middle = visible.map((_, i) => {
          const v = bbands.middle[i + offset];
          return v != null ? `${px(i)},${py(v)}` : null;
        }).filter(Boolean);

        return (
          <>
            {upper.length >= 2 && <path d={"M" + upper.join(" L")} fill="none" stroke="oklch(0.32 0.13 268 / 0.5)" strokeWidth={1} strokeDasharray="2 2" />}
            {lower.length >= 2 && <path d={"M" + lower.join(" L")} fill="none" stroke="oklch(0.32 0.13 268 / 0.5)" strokeWidth={1} strokeDasharray="2 2" />}
            {upper.length >= 2 && lower.length >= 2 && (
              <defs>
                <linearGradient id="bbandsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.32 0.13 268)" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="oklch(0.32 0.13 268)" stopOpacity="0.02" />
                </linearGradient>
              </defs>
            )}
            {middle.length >= 2 && <path d={"M" + middle.join(" L")} fill="none" stroke="oklch(0.32 0.13 268 / 0.8)" strokeWidth={1.5} />}
          </>
        );
      })()}

      {/* Ichimoku */}
      {ichimoku && (() => {
        const offset = candles.length - visible.length;
        const tenkan = visible.map((_, i) => {
          const v = ichimoku.tenkan[i + offset];
          return v != null ? `${px(i)},${py(v)}` : null;
        }).filter(Boolean);
        const kijun = visible.map((_, i) => {
          const v = ichimoku.kijun[i + offset];
          return v != null ? `${px(i)},${py(v)}` : null;
        }).filter(Boolean);

        return (
          <>
            {tenkan.length >= 2 && <path d={"M" + tenkan.join(" L")} fill="none" stroke="oklch(0.6 0.17 158 / 0.7)" strokeWidth={1.5} />}
            {kijun.length >= 2 && <path d={"M" + kijun.join(" L")} fill="none" stroke="oklch(0.6 0.23 25 / 0.7)" strokeWidth={1.5} />}
          </>
        );
      })()}

      {/* Candlesticks */}
      {visible.map((c, i) => {
        const bull = c.close >= c.open;
        const color = bull ? "oklch(0.6 0.17 158)" : "oklch(0.6 0.23 25)";
        const cx = px(i);
        const highY = py(c.high);
        const lowY = py(c.low);
        const bodyTop = py(Math.max(c.open, c.close));
        const bodyBot = py(Math.min(c.open, c.close));
        const bodyH = Math.max(1, bodyBot - bodyTop);
        const bx = cx - bodyW / 2;
        const isLast = highlightLast && i === visible.length - 1;

        return (
          <g key={c.timestamp}>
            {/* Wick */}
            <line x1={cx} y1={highY} x2={cx} y2={lowY} stroke={color} strokeWidth={1.5} opacity={isLast ? 1 : 0.85} />
            {/* Body */}
            <rect x={bx} y={bodyTop} width={bodyW} height={bodyH} fill={color} opacity={isLast ? 1 : 0.85}
              rx={0.5} style={isLast ? { filter: `drop-shadow(0 0 4px ${color})` } : undefined} />
          </g>
        );
      })}

      {/* Y-axis labels */}
      {yLabels.map(({ price, y }, i) => (
        <text key={i} x={width - padR + 6} y={y + 4} fontSize={10} fill="oklch(0.45 0.03 265)"
          fontFamily="monospace">{price.toFixed(5)}</text>
      ))}

      {/* X-axis labels */}
      {visible.map((c, i) => {
        if (i % xLabelEvery !== 0) return null;
        return (
          <text key={c.timestamp} x={px(i)} y={height - 6} fontSize={9} fill="oklch(0.45 0.03 265)"
            textAnchor="middle" fontFamily="monospace">{c.time}</text>
        );
      })}
    </svg>
  );
}

// ─── RSI Sub-chart ────────────────────────────────────────────────────────────

function RSIChart({ rsi }: { rsi: (number | null)[] }) {
  const data = rsi.slice(-60).map((v, i) => ({ i, rsi: v }));
  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">RSI (14)</span>
        <span className="text-xs text-muted-foreground">— Overbought &gt;70 · Oversold &lt;30</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <ComposedChart data={data} margin={{ top: 4, right: 60, left: 8, bottom: 4 }}>
          <defs>
            <linearGradient id="rsiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.32 0.13 268)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="oklch(0.32 0.13 268)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="i" hide />
          <YAxis domain={[0, 100]} width={0} hide />
          <ReferenceLine y={70} stroke="oklch(0.6 0.23 25 / 0.4)" strokeDasharray="3 3" />
          <ReferenceLine y={30} stroke="oklch(0.6 0.17 158 / 0.4)" strokeDasharray="3 3" />
          <Area type="monotone" dataKey="rsi" stroke="oklch(0.32 0.13 268)" strokeWidth={1.5}
            fill="url(#rsiGrad)" dot={false} connectNulls />
          <Tooltip
            contentStyle={{ background: "white", border: "1px solid oklch(0.9 0.012 260)", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}
            formatter={(v: number) => [v?.toFixed(1), "RSI"]}
            labelFormatter={() => ""}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex justify-between px-2 text-[10px] text-muted-foreground">
        <span className="text-bull">30 — Oversold</span>
        <span className="text-bear">70 — Overbought</span>
      </div>
    </div>
  );
}

// ─── MACD Sub-chart ───────────────────────────────────────────────────────────

function MACDChart({ macd, signal, histogram }: { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] }) {
  const data = macd.slice(-60).map((v, i) => ({
    i, macd: v, signal: signal[macd.length - 60 + i], hist: histogram[macd.length - 60 + i],
  }));
  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">MACD (12, 26, 9)</span>
        <span className="text-xs text-muted-foreground">— Crossover = momentum shift</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <ComposedChart data={data} margin={{ top: 4, right: 60, left: 8, bottom: 4 }}>
          <XAxis dataKey="i" hide />
          <YAxis width={0} hide />
          <ReferenceLine y={0} stroke="oklch(0.18 0.025 260 / 0.2)" />
          <Bar dataKey="hist" fill="oklch(0.32 0.13 268)" opacity={0.5} radius={[1, 1, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={(d.hist ?? 0) >= 0 ? "oklch(0.6 0.17 158)" : "oklch(0.6 0.23 25)"} opacity={0.55} />
            ))}
          </Bar>
          <Line type="monotone" dataKey="macd" stroke="oklch(0.32 0.13 268)" strokeWidth={1.5} dot={false} connectNulls />
          <Line type="monotone" dataKey="signal" stroke="oklch(0.74 0.17 78)" strokeWidth={1.5} dot={false} strokeDasharray="3 2" connectNulls />
          <Tooltip
            contentStyle={{ background: "white", border: "1px solid oklch(0.9 0.012 260)", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}
            formatter={(v: number, name: string) => [v?.toFixed(5), name === "hist" ? "Histogram" : name.toUpperCase()]}
            labelFormatter={() => ""}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Stochastic Sub-chart ─────────────────────────────────────────────────────

function StochasticChart({ k, d }: { k: (number | null)[]; d: (number | null)[] }) {
  const data = k.slice(-60).map((v, i) => ({ i, k: v, d: d[k.length - 60 + i] }));
  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Stochastic (14, 3, 3)</span>
        <span className="text-xs text-muted-foreground">— K above D = bullish. K below D = bearish</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <ComposedChart data={data} margin={{ top: 4, right: 60, left: 8, bottom: 4 }}>
          <XAxis dataKey="i" hide />
          <YAxis domain={[0, 100]} width={0} hide />
          <ReferenceLine y={80} stroke="oklch(0.6 0.23 25 / 0.4)" strokeDasharray="3 3" />
          <ReferenceLine y={20} stroke="oklch(0.6 0.17 158 / 0.4)" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="k" stroke="oklch(0.6 0.17 158)" strokeWidth={1.5} dot={false} connectNulls />
          <Line type="monotone" dataKey="d" stroke="oklch(0.74 0.17 78)" strokeWidth={1.5} dot={false} strokeDasharray="3 2" connectNulls />
          <Tooltip
            contentStyle={{ background: "white", border: "1px solid oklch(0.9 0.012 260)", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}
            formatter={(v: number) => [v?.toFixed(1), "Value"]}
            labelFormatter={() => ""}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex justify-between px-2 text-[10px] text-muted-foreground">
        <span className="text-bull">20 — Oversold</span>
        <span className="text-bear">80 — Overbought</span>
      </div>
    </div>
  );
}

// ─── ATR Sub-chart ────────────────────────────────────────────────────────────

function ATRChart({ atr }: { atr: (number | null)[] }) {
  const data = atr.slice(-60).map((v, i) => ({ i, atr: v }));
  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">ATR (14)</span>
        <span className="text-xs text-muted-foreground">— Volatility measure. Higher = more volatile</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <ComposedChart data={data} margin={{ top: 4, right: 60, left: 8, bottom: 4 }}>
          <defs>
            <linearGradient id="atrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.32 0.13 268)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="oklch(0.32 0.13 268)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="i" hide />
          <YAxis width={0} hide />
          <Area type="monotone" dataKey="atr" stroke="oklch(0.32 0.13 268)" strokeWidth={1.5}
            fill="url(#atrGrad)" dot={false} connectNulls />
          <Tooltip
            contentStyle={{ background: "white", border: "1px solid oklch(0.9 0.012 260)", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}
            formatter={(v: number) => [v?.toFixed(5), "ATR"]}
            labelFormatter={() => ""}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── AI Explainer Overlay ─────────────────────────────────────────────────────

interface ExplainerProps {
  trend: string;
  scenario: MarketScenario;
  breakout: string | null;
  currentPrice: number;
  rsiValue: number | null;
  srLevels: { support: number[]; resistance: number[] };
  selectedIndicators: Set<Exclude<Indicator, "none">>;
  sma20: (number | null)[];
  sma50: (number | null)[];
  bbands: { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] };
  stoch: { k: (number | null)[]; d: (number | null)[] };
  macdData: { macd: (number | null)[]; signal: (number | null)[] };
  atr: (number | null)[];
  candles: Candle[];
  onClose: () => void;
}

function AIExplainer({ 
  trend, scenario, breakout, currentPrice, rsiValue, srLevels, selectedIndicators,
  sma20, sma50, bbands, stoch, macdData, atr, candles, onClose 
}: ExplainerProps) {
  const insights: { label: string; text: string; color: string }[] = [];

  if (trend === "uptrend") insights.push({ label: "Trend", text: "Higher highs & higher lows — buyers in control", color: "text-bull" });
  else if (trend === "downtrend") insights.push({ label: "Trend", text: "Lower highs & lower lows — sellers dominating", color: "text-bear" });
  else insights.push({ label: "Trend", text: "Price oscillating — no clear directional bias", color: "text-primary" });

  // MA Analysis
  if (selectedIndicators.has("ma")) {
    const lastSMA20 = sma20[sma20.length - 1];
    const lastSMA50 = sma50[sma50.length - 1];
    if (lastSMA20 != null && lastSMA50 != null) {
      if (currentPrice > lastSMA20 && lastSMA20 > lastSMA50) {
        insights.push({ label: "MA", text: `Price (${currentPrice.toFixed(5)}) > SMA20 (${lastSMA20.toFixed(5)}) > SMA50 (${lastSMA50.toFixed(5)}) — strong uptrend alignment. Bullish.`, color: "text-bull" });
      } else if (currentPrice < lastSMA20 && lastSMA20 < lastSMA50) {
        insights.push({ label: "MA", text: `Price (${currentPrice.toFixed(5)}) < SMA20 (${lastSMA20.toFixed(5)}) < SMA50 (${lastSMA50.toFixed(5)}) — strong downtrend alignment. Bearish.`, color: "text-bear" });
      } else if (lastSMA20 > lastSMA50) {
        insights.push({ label: "MA", text: `SMA20 above SMA50 — short-term trend stronger than medium-term. Uptrend momentum.`, color: "text-bull" });
      } else {
        insights.push({ label: "MA", text: `SMA20 below SMA50 — short-term trend weaker than medium-term. Downtrend momentum.`, color: "text-bear" });
      }
    }
  }

  // Bollinger Bands Analysis
  if (selectedIndicators.has("bb")) {
    const lastBB = { upper: bbands.upper[bbands.upper.length - 1], lower: bbands.lower[bbands.lower.length - 1] };
    if (lastBB.upper != null && lastBB.lower != null) {
      const range = lastBB.upper - lastBB.lower;
      const position = (currentPrice - lastBB.lower) / range;
      if (position > 0.8) {
        insights.push({ label: "BB", text: `Price near upper band (${position.toFixed(2)}% in range) — potentially overbought. Reversal or consolidation possible.`, color: "text-bear" });
      } else if (position < 0.2) {
        insights.push({ label: "BB", text: `Price near lower band (${position.toFixed(2)}% in range) — potentially oversold. Bounce or support hold expected.`, color: "text-bull" });
      } else {
        insights.push({ label: "BB", text: `Price mid-range (${position.toFixed(2)}% in range) — balanced volatility. Consolidation zone.`, color: "text-primary" });
      }
    }
  }

  // RSI Analysis
  if (selectedIndicators.has("rsi") && rsiValue != null) {
    if (rsiValue > 70) insights.push({ label: "RSI", text: `RSI ${rsiValue.toFixed(0)}/100 — OVERBOUGHT. Price may pull back, reverse, or consolidate. Watch for divergence.`, color: "text-bear" });
    else if (rsiValue > 60) insights.push({ label: "RSI", text: `RSI ${rsiValue.toFixed(0)}/100 — Strong momentum but not overbought yet. Uptrend is healthy.`, color: "text-bull" });
    else if (rsiValue > 50) insights.push({ label: "RSI", text: `RSI ${rsiValue.toFixed(0)}/100 — Mild bullish momentum. Sellers still present but buyers slightly ahead.`, color: "text-bull" });
    else if (rsiValue > 40) insights.push({ label: "RSI", text: `RSI ${rsiValue.toFixed(0)}/100 — Neutral-to-bearish. Momentum shifting, watch for breakouts.`, color: "text-muted-foreground" });
    else if (rsiValue > 30) insights.push({ label: "RSI", text: `RSI ${rsiValue.toFixed(0)}/100 — Mild bearish momentum. Sellers dominating but not oversold yet.`, color: "text-bear" });
    else if (rsiValue < 30) insights.push({ label: "RSI", text: `RSI ${rsiValue.toFixed(0)}/100 — OVERSOLD. Price may bounce, reverse, or find support. Reversal setup forming.`, color: "text-bull" });
  }

  // Stochastic Analysis
  if (selectedIndicators.has("stoch")) {
    const lastK = stoch.k[stoch.k.length - 1];
    const lastD = stoch.d[stoch.d.length - 1];
    if (lastK != null && lastD != null) {
      if (lastK > 80) insights.push({ label: "Stoch", text: `K ${lastK.toFixed(0)}/100 > D ${lastD.toFixed(0)} — Overbought zone. Price extended. Pullback or reversal likely.`, color: "text-bear" });
      else if (lastK > lastD && lastK > 50) insights.push({ label: "Stoch", text: `K ${lastK.toFixed(0)} > D ${lastD.toFixed(0)} in upper zone — Bullish momentum. Uptrend strength.`, color: "text-bull" });
      else if (lastK < 20) insights.push({ label: "Stoch", text: `K ${lastK.toFixed(0)}/100 < D ${lastD.toFixed(0)} — Oversold zone. Price depressed. Bounce or support likely.`, color: "text-bull" });
      else if (lastK < lastD && lastK < 50) insights.push({ label: "Stoch", text: `K ${lastK.toFixed(0)} < D ${lastD.toFixed(0)} in lower zone — Bearish momentum. Downtrend strength.`, color: "text-bear" });
      else insights.push({ label: "Stoch", text: `K ${lastK.toFixed(0)} ≈ D ${lastD.toFixed(0)} — Neutral zone. Consolidation or transition phase.`, color: "text-primary" });
    }
  }

  // MACD Analysis
  if (selectedIndicators.has("macd")) {
    const lastMACD = macdData.macd[macdData.macd.length - 1];
    const lastSignal = macdData.signal[macdData.signal.length - 1];
    const prevMACD = macdData.macd[macdData.macd.length - 2];
    if (lastMACD != null && lastSignal != null && prevMACD != null) {
      const histogram = lastMACD - lastSignal;
      const prevHistogram = prevMACD - lastSignal;
      if (lastMACD > lastSignal && histogram > prevHistogram) {
        insights.push({ label: "MACD", text: `MACD above signal & expanding — Strong bullish momentum. Uptrend accelerating.`, color: "text-bull" });
      } else if (lastMACD > lastSignal) {
        insights.push({ label: "MACD", text: `MACD above signal but weakening — Uptrend momentum fading. Reversal coming soon.`, color: "text-primary" });
      } else if (lastMACD < lastSignal && histogram < prevHistogram) {
        insights.push({ label: "MACD", text: `MACD below signal & expanding — Strong bearish momentum. Downtrend accelerating.`, color: "text-bear" });
      } else if (lastMACD < lastSignal) {
        insights.push({ label: "MACD", text: `MACD below signal but weakening — Downtrend momentum fading. Reversal coming soon.`, color: "text-primary" });
      } else {
        insights.push({ label: "MACD", text: `MACD near signal — Neutral zone. Transition between trends.`, color: "text-muted-foreground" });
      }
    }
  }

  // ATR Analysis
  if (selectedIndicators.has("atr")) {
    const lastATR = atr[atr.length - 1];
    const avgATR = atr.slice(-14).reduce((a, b) => a + (b ?? 0), 0) / 14;
    if (lastATR != null && avgATR > 0) {
      if (lastATR > avgATR * 1.5) {
        insights.push({ label: "ATR", text: `ATR ${lastATR.toFixed(5)} — HIGH volatility spike! Price moving fast. Wide stops needed.`, color: "text-bear" });
      } else if (lastATR < avgATR * 0.5) {
        insights.push({ label: "ATR", text: `ATR ${lastATR.toFixed(5)} — LOW volatility. Price tight. Breakout may be coming.`, color: "text-primary" });
      } else {
        insights.push({ label: "ATR", text: `ATR ${lastATR.toFixed(5)} — Normal volatility. Typical market conditions.`, color: "text-primary" });
      }
    }
  }

  // Ichimoku Analysis
  if (selectedIndicators.has("ichimoku")) {
    insights.push({ label: "Ichimoku", text: "Ichimoku displayed on chart above. Green/Red cloud shows dynamic S/R. Price above cloud = bullish, below = bearish.", color: "text-primary" });
  }

  if (rsiValue != null && !selectedIndicators.has("rsi")) {
    if (rsiValue > 70) insights.push({ label: "RSI", text: `RSI at ${rsiValue.toFixed(0)} — overbought zone. Watch for reversal signals`, color: "text-bear" });
    else if (rsiValue < 30) insights.push({ label: "RSI", text: `RSI at ${rsiValue.toFixed(0)} — oversold zone. Potential bounce setup`, color: "text-bull" });
  }

  if (breakout === "breakout_up") insights.push({ label: "Breakout", text: "Price broke above resistance — bullish momentum signal", color: "text-bull" });
  else if (breakout === "breakout_down") insights.push({ label: "Breakout", text: "Price broke below support — bearish continuation possible", color: "text-bear" });

  if (srLevels.resistance.length > 0) {
    const nearR = srLevels.resistance.find((r) => Math.abs(r - currentPrice) / currentPrice < 0.003);
    if (nearR) insights.push({ label: "Level", text: `Price near resistance at ${nearR.toFixed(5)} — expect reaction or breakout`, color: "text-bear" });
  }
  if (srLevels.support.length > 0) {
    const nearS = srLevels.support.find((s) => Math.abs(s - currentPrice) / currentPrice < 0.003);
    if (nearS) insights.push({ label: "Level", text: `Price near support at ${nearS.toFixed(5)} — watch for bounce or breakdown`, color: "text-bull" });
  }

  if (!insights.length) insights.push({ label: "Market", text: "Price is in a consolidation phase — wait for clear signal", color: "text-muted-foreground" });

  return (
    <div className="absolute right-2 top-12 z-10 max-w-sm rounded-lg border border-primary/20 bg-white/95 p-4 shadow-[var(--shadow-elevated)] backdrop-blur-sm max-h-96 overflow-y-auto">
      <div className="mb-3 flex items-center justify-between sticky top-0 bg-white/95">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
            <Activity className="h-3 w-3 text-primary" />
          </div>
          <span className="text-xs font-semibold text-primary">Indicator Analysis</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
      </div>
      <div className="space-y-2">
        {insights.map((ins, i) => (
          <div key={i} className="rounded-md bg-secondary/40 p-2">
            <div className={`mb-0.5 text-[10px] font-semibold uppercase tracking-wider ${ins.color}`}>{ins.label}</div>
            <div className="text-xs text-foreground/80">{ins.text}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[10px] text-muted-foreground">Educational analysis only — not trading advice.</div>
    </div>
  );
}

// ─── Market Behavior Overlay ──────────────────────────────────────────────────

function MarketOverlay({ trend, breakout }: { trend: string; breakout: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
        trend === "uptrend" ? "bg-bull/10 text-bull" :
        trend === "downtrend" ? "bg-bear/10 text-bear" :
        "bg-primary/10 text-primary"
      }`}>
        {trend === "uptrend" ? <ChevronUp className="h-3 w-3" /> :
         trend === "downtrend" ? <ChevronDown className="h-3 w-3" /> :
         <Minus className="h-3 w-3" />}
        {trend === "uptrend" ? "Uptrend" : trend === "downtrend" ? "Downtrend" : "Ranging"}
      </div>
      {breakout && (
        <div className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold animate-pulse ${
          breakout === "breakout_up" ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear"
        }`}>
          <Zap className="h-3 w-3" />
          {breakout === "breakout_up" ? "Breakout ↑" : "Breakdown ↓"}
        </div>
      )}
    </div>
  );
}

// ─── Main LiveChart Component ─────────────────────────────────────────────────

export function LiveChart({ onPriceUpdate }: Props) {
  const tour = useTour(LIVE_CHART_STEPS);
  const [scenario, setScenario] = useState<MarketScenario>("trending_up");
  const [timeframe, setTimeframe] = useState<Timeframe>("15M");
  const [candles, setCandles] = useState<Candle[]>(() => generateCandles("trending_up", 60, 1.085, "15M"));
  const [isLive, setIsLive] = useState(true);
  const [selectedIndicators, setSelectedIndicators] = useState<Set<Exclude<Indicator, "none">>>(new Set(["ma"]));
  const [showSR, setShowSR] = useState(true);
  const [showExplainer, setShowExplainer] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);  // tour scope — outer wrapper
  const chartAreaRef = useRef<HTMLDivElement>(null);  // resize measurement — chart box only
  const [dims, setDims] = useState({ width: 600, height: 280 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resize observer — watches the chart box, NOT the outer container
  useEffect(() => {
    if (!chartAreaRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setDims({ width: Math.max(300, r.width), height: 280 });
    });
    ro.observe(chartAreaRef.current);
    return () => ro.disconnect();
  }, []);

  // Live price feed
  useEffect(() => {
    if (!isLive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const newCandle = nextCandle(scenario, last.close, last.timestamp + TIMEFRAME_MS[timeframe], timeframe);
        const next = [...prev.slice(-80), newCandle];
        onPriceUpdate?.(newCandle.close, newCandle);
        return next;
      });
    }, 1200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isLive, scenario, timeframe, onPriceUpdate]);

  // Reset candles when scenario or timeframe changes
  const handleScenario = useCallback((s: MarketScenario) => {
    setScenario(s);
    setCandles(generateCandles(s, 60, 1.085, timeframe));
  }, [timeframe]);

  const handleTimeframe = useCallback((tf: Timeframe) => {
    setTimeframe(tf);
    setCandles(generateCandles(scenario, 60, 1.085, tf));
  }, [scenario]);

  // Toggle indicator selection
  const toggleIndicator = useCallback((ind: Exclude<Indicator, "none">) => {
    setSelectedIndicators((prev) => {
      const next = new Set(prev);
      if (next.has(ind)) {
        next.delete(ind);
      } else {
        next.add(ind);
      }
      return next;
    });
  }, []);

  // Derived indicators
  const sma20 = useMemo(() => calcSMA(candles, 20), [candles]);
  const sma50 = useMemo(() => calcSMA(candles, 50), [candles]);
  const ema20 = useMemo(() => calcEMA(candles, 20), [candles]);
  const rsi = useMemo(() => calcRSI(candles), [candles]);
  const macdResult = useMemo(() => calcMACD(candles), [candles]);
  const bbands = useMemo(() => calcBollingerBands(candles, 20, 2), [candles]);
  const stoch = useMemo(() => calcStochastic(candles, 14, 3, 3), [candles]);
  const ichimoku = useMemo(() => calcIchimoku(candles), [candles]);
  const atr = useMemo(() => calcATR(candles, 14), [candles]);
  const srLevels = useMemo(() => showSR ? findSRLevels(candles) : { support: [], resistance: [] }, [candles, showSR]);
  const trend = useMemo(() => detectTrend(candles), [candles]);
  const breakout = useMemo(() => detectBreakout(candles, srLevels), [candles, srLevels]);

  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];
  const priceChange = lastCandle && prevCandle ? lastCandle.close - prevCandle.close : 0;
  const priceChangePct = prevCandle ? (priceChange / prevCandle.close) * 100 : 0;
  const lastRSI = rsi[rsi.length - 1];

  return (
    <div ref={containerRef} className="flex flex-col gap-3 relative overflow-hidden">
      <Tour active={tour.active} stepIndex={tour.stepIndex} steps={tour.steps} onNext={tour.next} onPrev={tour.prev} onClose={tour.stop} containerRef={containerRef} />
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="font-display text-lg font-bold">EUR/USD</div>
          <div className={`font-display text-xl font-bold ${priceChange >= 0 ? "text-bull" : "text-bear"}`}>
            {lastCandle?.close.toFixed(5)}
          </div>
          <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${priceChange >= 0 ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"}`}>
            {priceChange >= 0 ? "+" : ""}{priceChangePct.toFixed(3)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div data-tour="lc-trend-badge"><MarketOverlay trend={trend} breakout={breakout} /></div>
          <button onClick={tour.start} className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors" title="Take Live Chart tour">
            <HelpCircle className="h-3 w-3" /> Tour
          </button>
        </div>
      </div>

      {/* Scenario selector */}
      <div data-tour="lc-scenarios" className="flex flex-wrap gap-1.5">
        {SCENARIOS.map((s) => (
          <button key={s.id} onClick={() => handleScenario(s.id)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              scenario === s.id
                ? "bg-primary/15 text-primary border border-primary/30 shadow-[var(--shadow-glow-primary)]"
                : "text-muted-foreground hover:bg-secondary border border-transparent"
            }`}
            title={s.desc}>
            {s.icon}{s.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <button data-tour="lc-sr-btn" onClick={() => setShowSR((v) => !v)}
            className={`rounded-md p-1.5 text-xs transition-colors ${showSR ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary"}`}
            title="Toggle S/R levels">
            {showSR ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <button data-tour="lc-ai-btn" onClick={() => setShowExplainer((v) => !v)}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
              showExplainer ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-secondary border border-transparent"
            }`}>
            <Activity className="h-3.5 w-3.5" /> AI Analysis
          </button>
        </div>
      </div>

      {/* Timeframe + controls */}
      <div className="flex items-center gap-2">
        <div data-tour="lc-timeframes" className="flex gap-0.5">
          {TIMEFRAMES.map((tf) => (
            <button key={tf} onClick={() => handleTimeframe(tf)}
              className={`rounded px-2.5 py-1 text-xs transition-colors ${
                timeframe === tf ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground hover:bg-secondary"
              }`}>{tf}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {/* Indicator tabs */}
          <div data-tour="lc-indicators" className="flex items-center gap-0.5">
          {(["ma", "bb", "rsi", "stoch", "macd", "ichimoku", "atr"] as Exclude<Indicator, "none">[]).map((ind) => {
            const tooltips: Record<Exclude<Indicator, "none">, string> = {
              ma: "Moving Averages (SMA 20/50) — see trend direction at different speeds",
              bb: "Bollinger Bands — identify overbought/oversold zones and volatility levels",
              rsi: "Relative Strength Index — measure momentum and overbought/oversold conditions (0-100)",
              stoch: "Stochastic Oscillator — momentum indicator comparing price to range over time",
              macd: "MACD (Moving Average Convergence Divergence) — spotting momentum shifts and crossovers",
              ichimoku: "Ichimoku Cloud — advanced Japanese method for support/resistance and trend at a glance",
              atr: "Average True Range — measure volatility and optimal stop-loss placement distance",
            };
            return (
            <button key={ind} onClick={() => toggleIndicator(ind)}
              className={`rounded px-2.5 py-1 text-xs transition-colors ${
                selectedIndicators.has(ind) ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground hover:bg-secondary"
              }`}
              title={tooltips[ind]}>
              {ind === "ma" ? "MA" : ind === "bb" ? "BB" : ind === "rsi" ? "RSI" : ind === "stoch" ? "Stoch" : ind === "macd" ? "MACD" : ind === "ichimoku" ? "Ichimoku" : "ATR"}
            </button>
            );
          })}
          <button onClick={() => setSelectedIndicators(new Set())}
            className="rounded px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Clear all indicators">
            ✕ Clear
          </button>
          </div>
          <div className="mx-1 h-4 w-px bg-border" />
          <button data-tour="lc-live-btn" onClick={() => setIsLive((v) => !v)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
              isLive ? "bg-bull/10 text-bull border border-bull/20" : "text-muted-foreground hover:bg-secondary border border-transparent"
            }`}>
            {isLive ? <><Play className="h-3 w-3 fill-current" /> Live</> : <><Pause className="h-3 w-3" /> Paused</>}
          </button>
        </div>
      </div>

      {/* Main chart area */}
      <div className="relative rounded-lg border border-border/60 bg-secondary/20 p-2" ref={chartAreaRef}>
        {isLive && (
          <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-bull" />
            <span className="text-[10px] text-muted-foreground">Live</span>
          </div>
        )}

        {showExplainer && (
          <AIExplainer
            trend={trend} scenario={scenario} breakout={breakout}
            currentPrice={lastCandle?.close ?? 0} rsiValue={lastRSI}
            srLevels={srLevels} selectedIndicators={selectedIndicators}
            sma20={sma20} sma50={sma50} bbands={bbands} stoch={stoch}
            macdData={{ macd: macdResult.macd, signal: macdResult.signal }}
            atr={atr} candles={candles}
            onClose={() => setShowExplainer(false)}
          />
        )}

        <CandleSVG
          candles={candles} width={dims.width - 16} height={dims.height}
          sma20={sma20} sma50={sma50} ema20={ema20}
          srLevels={srLevels}
          bbands={selectedIndicators.has("bb") ? bbands : undefined}
          ichimoku={selectedIndicators.has("ichimoku") ? ichimoku : undefined}
          showMA={selectedIndicators.has("ma")}
          highlightLast={isLive}
        />

        {/* MA legend */}
        {selectedIndicators.has("ma") && (
          <div className="mt-1 flex gap-3 px-2">
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-5 rounded-full bg-primary" />
              <span className="text-[10px] text-muted-foreground">SMA 20</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-5 rounded-full bg-gold" style={{ background: "oklch(0.74 0.17 78)" }} />
              <span className="text-[10px] text-muted-foreground">SMA 50</span>
            </div>
          </div>
        )}

        {/* Bollinger Bands legend */}
        {selectedIndicators.has("bb") && (
          <div className="mt-1 flex gap-3 px-2">
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-5 rounded-full" style={{ background: "oklch(0.32 0.13 268)" }} />
              <span className="text-[10px] text-muted-foreground">Upper/Lower Bands</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-5 rounded-full" style={{ background: "oklch(0.32 0.13 268)", opacity: 0.8 }} />
              <span className="text-[10px] text-muted-foreground">Middle (SMA 20)</span>
            </div>
          </div>
        )}

        {/* Ichimoku legend */}
        {selectedIndicators.has("ichimoku") && (
          <div className="mt-1 flex gap-3 px-2">
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-5 rounded-full" style={{ background: "oklch(0.6 0.17 158)" }} />
              <span className="text-[10px] text-muted-foreground">Tenkan-sen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-5 rounded-full" style={{ background: "oklch(0.6 0.23 25)" }} />
              <span className="text-[10px] text-muted-foreground">Kijun-sen</span>
            </div>
          </div>
        )}
      </div>

      {/* Indicator sub-charts */}
      {selectedIndicators.has("rsi") && <RSIChart rsi={rsi} />}
      {selectedIndicators.has("macd") && <MACDChart macd={macdResult.macd} signal={macdResult.signal} histogram={macdResult.histogram} />}
      {selectedIndicators.has("stoch") && <StochasticChart k={stoch.k} d={stoch.d} />}
      {selectedIndicators.has("atr") && <ATRChart atr={atr} />}

      {/* Scenario education tooltip */}
      <div className="rounded-md border border-primary/10 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium text-primary">{SCENARIOS.find((s) => s.id === scenario)?.label}:</span>{" "}
        {SCENARIOS.find((s) => s.id === scenario)?.desc}
        {showSR && " · S/R levels"}
        {selectedIndicators.has("ma") && " · MA=trends"}
        {selectedIndicators.has("bb") && " · BB=volatility"}
        {selectedIndicators.has("rsi") && " · RSI=momentum"}
        {selectedIndicators.has("stoch") && " · Stoch=K/D"}
        {selectedIndicators.has("macd") && " · MACD=shifts"}
        {selectedIndicators.has("ichimoku") && " · Ichimoku=cloud"}
        {selectedIndicators.has("atr") && " · ATR=volatility"}
      </div>
    </div>
  );
}
