// ─── Market Simulation Engine ───────────────────────────────────────────────
// Generates realistic forex price data with different market behaviors.
// Pure utility — no React imports.

export type MarketScenario = "trending_up" | "trending_down" | "ranging" | "volatile";
export type Timeframe = "1M" | "5M" | "15M" | "1H" | "4H" | "1D";

export const TIMEFRAME_MS: Record<Timeframe, number> = {
  "1M": 60_000,
  "5M": 300_000,
  "15M": 900_000,
  "1H": 3_600_000,
  "4H": 14_400_000,
  "1D": 86_400_000,
};

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export interface SRLevels {
  support: number[];
  resistance: number[];
}

export function formatTime(ts: number, tf: Timeframe): string {
  const d = new Date(ts);
  if (tf === "1D") return `${d.getMonth() + 1}/${d.getDate()}`;
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function nextCandle(
  scenario: MarketScenario,
  prevClose: number,
  timestamp: number,
  tf: Timeframe = "15M"
): Candle {
  const tfM = tf === "1D" ? 3.5 : tf === "4H" ? 2 : tf === "1H" ? 1.5 : 1;
  let drift = 0;
  let vol = 0.0006 * tfM;

  switch (scenario) {
    case "trending_up":
      drift = 0.00028 * tfM;
      vol = 0.0005 * tfM;
      break;
    case "trending_down":
      drift = -0.00028 * tfM;
      vol = 0.0005 * tfM;
      break;
    case "ranging": {
      const mean = 1.085;
      drift = (mean - prevClose) * 0.12;
      vol = 0.00035 * tfM;
      break;
    }
    case "volatile":
      drift = (Math.random() - 0.5) * 0.003 * tfM;
      vol = 0.002 * tfM;
      break;
  }

  const open = prevClose;
  const change = drift + (Math.random() - 0.48) * vol * 2;
  const close = open + change;
  const w = 0.3 + Math.random() * 0.7;
  const high = Math.max(open, close) + Math.random() * vol * w;
  const low = Math.min(open, close) - Math.random() * vol * w;

  return {
    time: formatTime(timestamp, tf),
    timestamp,
    open: +open.toFixed(5),
    close: +close.toFixed(5),
    high: +high.toFixed(5),
    low: +low.toFixed(5),
    volume: Math.floor(300 + Math.random() * 2500),
  };
}

export function generateCandles(
  scenario: MarketScenario,
  count = 60,
  basePrice = 1.085,
  tf: Timeframe = "15M"
): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice;
  const now = Date.now();
  const ms = TIMEFRAME_MS[tf];

  for (let i = count - 1; i >= 0; i--) {
    const c = nextCandle(scenario, price, now - i * ms, tf);
    candles.push(c);
    price = c.close;
  }
  return candles;
}

// ─── Technical Indicators ────────────────────────────────────────────────────

function emaArr(values: number[], period: number): (number | null)[] {
  const res: (number | null)[] = Array(values.length).fill(null);
  if (values.length < period) return res;
  const k = 2 / (period + 1);
  let v = values.slice(0, period).reduce((s, x) => s + x, 0) / period;
  res[period - 1] = v;
  for (let i = period; i < values.length; i++) {
    v = values[i] * k + v * (1 - k);
    res[i] = +v.toFixed(5);
  }
  return res;
}

export function calcSMA(candles: Candle[], period: number): (number | null)[] {
  return candles.map((_, i) => {
    if (i < period - 1) return null;
    return +(candles.slice(i - period + 1, i + 1).reduce((s, c) => s + c.close, 0) / period).toFixed(5);
  });
}

export function calcEMA(candles: Candle[], period: number): (number | null)[] {
  return emaArr(candles.map((c) => c.close), period);
}

export function calcRSI(candles: Candle[], period = 14): (number | null)[] {
  const res: (number | null)[] = Array(candles.length).fill(null);
  if (candles.length <= period) return res;

  let ag = 0, al = 0;
  for (let i = 1; i <= period; i++) {
    const d = candles[i].close - candles[i - 1].close;
    if (d > 0) ag += d; else al -= d;
  }
  ag /= period; al /= period;

  for (let i = period; i < candles.length; i++) {
    if (i > period) {
      const d = candles[i].close - candles[i - 1].close;
      ag = (ag * (period - 1) + Math.max(0, d)) / period;
      al = (al * (period - 1) + Math.max(0, -d)) / period;
    }
    const rs = al === 0 ? 100 : ag / al;
    res[i] = +(100 - 100 / (1 + rs)).toFixed(2);
  }
  return res;
}

export interface MACDResult {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
}

export function calcMACD(candles: Candle[]): MACDResult {
  const prices = candles.map((c) => c.close);
  const ema12 = emaArr(prices, 12);
  const ema26 = emaArr(prices, 26);
  const macd = prices.map((_, i) =>
    ema12[i] != null && ema26[i] != null ? +((ema12[i] as number) - (ema26[i] as number)).toFixed(5) : null
  );
  const sig = emaArr(macd.map((v) => v ?? 0), 9);
  const hist = macd.map((m, i) =>
    m != null && sig[i] != null ? +(m - (sig[i] as number)).toFixed(5) : null
  );
  return { macd, signal: sig, histogram: hist };
}

// ─── Support & Resistance ────────────────────────────────────────────────────

export function findSRLevels(candles: Candle[], lookback = 4): SRLevels {
  const res: number[] = [];
  const sup: number[] = [];

  for (let i = lookback; i < candles.length - lookback; i++) {
    let isH = true, isL = true;
    for (let j = 1; j <= lookback; j++) {
      if (candles[i].high <= candles[i - j].high || candles[i].high <= candles[i + j].high) isH = false;
      if (candles[i].low >= candles[i - j].low || candles[i].low >= candles[i + j].low) isL = false;
    }
    if (isH) res.push(candles[i].high);
    if (isL) sup.push(candles[i].low);
  }
  return { resistance: res.slice(-3), support: sup.slice(-3) };
}

// ─── Trade P&L ───────────────────────────────────────────────────────────────

export interface Trade {
  id: string;
  side: "buy" | "sell";
  lots: number;
  entryPrice: number;
  sl: number;
  tp: number;
  openTime: number;
}

export function calcPnL(trade: Trade, currentPrice: number): number {
  const pipValue = 10 * trade.lots; // USD per pip for standard lot (simplified)
  const priceDiff = trade.side === "buy"
    ? currentPrice - trade.entryPrice
    : trade.entryPrice - currentPrice;
  return +(priceDiff * 10000 * pipValue).toFixed(2);
}

export function isSLHit(trade: Trade, candle: Candle): boolean {
  if (trade.side === "buy") return candle.low <= trade.sl;
  return candle.high >= trade.sl;
}

export function isTPHit(trade: Trade, candle: Candle): boolean {
  if (trade.side === "buy") return candle.high >= trade.tp;
  return candle.low <= trade.tp;
}

// ─── Market Analysis Helpers ─────────────────────────────────────────────────

export type TrendDirection = "uptrend" | "downtrend" | "ranging";

export function detectTrend(candles: Candle[], lookback = 20): TrendDirection {
  if (candles.length < lookback) return "ranging";
  const slice = candles.slice(-lookback);
  const first = slice[0].close;
  const last = slice[slice.length - 1].close;
  const change = (last - first) / first;
  if (change > 0.003) return "uptrend";
  if (change < -0.003) return "downtrend";
  return "ranging";
}

export function detectBreakout(candles: Candle[], srLevels: SRLevels): "breakout_up" | "breakout_down" | null {
  if (!candles.length) return null;
  const last = candles[candles.length - 1];
  for (const r of srLevels.resistance) {
    if (last.close > r && candles[candles.length - 2]?.close <= r) return "breakout_up";
  }
  for (const s of srLevels.support) {
    if (last.close < s && candles[candles.length - 2]?.close >= s) return "breakout_down";
  }
  return null;
}

// ─── Advanced Indicators ──────────────────────────────────────────────────────

export interface BollingerBands {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
}

export function calcBollingerBands(candles: Candle[], period = 20, stdDev = 2): BollingerBands {
  const sma = calcSMA(candles, period);
  const upper: (number | null)[] = Array(candles.length).fill(null);
  const lower: (number | null)[] = Array(candles.length).fill(null);

  for (let i = period - 1; i < candles.length; i++) {
    if (sma[i] === null) continue;
    const slice = candles.slice(i - period + 1, i + 1);
    const mean = sma[i] as number;
    const variance = slice.reduce((sum, c) => sum + Math.pow(c.close - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    upper[i] = +(mean + std * stdDev).toFixed(5);
    lower[i] = +(mean - std * stdDev).toFixed(5);
  }
  return { upper, middle: sma, lower };
}

export interface StochasticResult {
  k: (number | null)[];
  d: (number | null)[];
}

export function calcStochastic(candles: Candle[], period = 14, smoothK = 3, smoothD = 3): StochasticResult {
  const k: (number | null)[] = Array(candles.length).fill(null);
  const rawK: (number | null)[] = Array(candles.length).fill(null);

  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const high = Math.max(...slice.map((c) => c.high));
    const low = Math.min(...slice.map((c) => c.low));
    const close = candles[i].close;
    rawK[i] = high === low ? 50 : ((close - low) / (high - low)) * 100;
  }

  // Smooth K
  const smoothedK = emaArr(rawK.map((v) => v ?? 0), smoothK);
  for (let i = 0; i < smoothedK.length; i++) {
    k[i] = rawK[i] !== null ? +Math.max(0, Math.min(100, smoothedK[i])).toFixed(2) : null;
  }

  // D = SMA of K
  const d = emaArr(k.map((v) => v ?? 0), smoothD);
  return { k, d: d.map((v) => v !== null ? +Math.max(0, Math.min(100, v)).toFixed(2) : null) };
}

export interface IchimokuResult {
  tenkan: (number | null)[];    // 9-period high-low avg
  kijun: (number | null)[];     // 26-period high-low avg
  senkouA: (number | null)[];   // (tenkan + kijun) / 2
  senkouB: (number | null)[];   // 52-period high-low avg
  chikou: (number | null)[];    // close shifted back 26
}

export function calcIchimoku(candles: Candle[]): IchimokuResult {
  const tenkan: (number | null)[] = Array(candles.length).fill(null);
  const kijun: (number | null)[] = Array(candles.length).fill(null);
  const senkouA: (number | null)[] = Array(candles.length).fill(null);
  const senkouB: (number | null)[] = Array(candles.length).fill(null);
  const chikou: (number | null)[] = Array(candles.length).fill(null);

  for (let i = 8; i < candles.length; i++) {
    const slice9 = candles.slice(i - 8, i + 1);
    const high9 = Math.max(...slice9.map((c) => c.high));
    const low9 = Math.min(...slice9.map((c) => c.low));
    tenkan[i] = +((high9 + low9) / 2).toFixed(5);
  }

  for (let i = 25; i < candles.length; i++) {
    const slice26 = candles.slice(i - 25, i + 1);
    const high26 = Math.max(...slice26.map((c) => c.high));
    const low26 = Math.min(...slice26.map((c) => c.low));
    kijun[i] = +((high26 + low26) / 2).toFixed(5);
  }

  for (let i = 25; i < candles.length; i++) {
    if (tenkan[i] !== null && kijun[i] !== null) {
      senkouA[i] = +(((tenkan[i] as number) + (kijun[i] as number)) / 2).toFixed(5);
    }
  }

  for (let i = 51; i < candles.length; i++) {
    const slice52 = candles.slice(i - 51, i + 1);
    const high52 = Math.max(...slice52.map((c) => c.high));
    const low52 = Math.min(...slice52.map((c) => c.low));
    senkouB[i] = +((high52 + low52) / 2).toFixed(5);
  }

  for (let i = 0; i < candles.length - 26; i++) {
    chikou[i + 26] = candles[i].close;
  }

  return { tenkan, kijun, senkouA, senkouB, chikou };
}

export function calcATR(candles: Candle[], period = 14): (number | null)[] {
  const tr: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    let truRange = high - low;
    if (i > 0) {
      truRange = Math.max(truRange, Math.abs(high - candles[i - 1].close));
      truRange = Math.max(truRange, Math.abs(low - candles[i - 1].close));
    }
    tr.push(truRange);
  }
  return emaArr(tr, period);
}
