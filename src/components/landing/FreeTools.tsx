import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Download, X, ArrowRight } from "lucide-react";
import masteryAIImage from "@/images/masteryai.png";
import gtmProImage from "@/images/gtmpro.png";

export function FreeTools({ preview = false }) {
  const [showMasteryModal, setShowMasteryModal] = useState(false);
  const [showGTMModal, setShowGTMModal] = useState(false);

  const handleMasteryDownload = () => {
    const link = document.createElement("a");
    link.href = "/tools/MasteryAI.zip";
    link.download = "MasteryAI.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGTMDownload = () => {
    const link = document.createElement("a");
    link.href = "/tools/GTM pro.zip";
    link.download = "GTM pro.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="space-y-8 sm:space-y-16 px-4 sm:px-6 lg:px-8 sm:py-6 lg:py-8">
      {/* Free Premium Trading Tools Section */}
      <section className="space-y-8 sm:space-y-12" aria-label="Free Premium Trading Tools Download">
        {preview && (
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold">
                Free <span className="text-gradient-gold">Premium Trading Tools</span>
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">Download professional forex trading bots and gold scalper strategies</p>
            </div>
          </div>
        )}

        {/* Gold Scalper Bot Section */}
        {/* Hero with image */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:items-center">
          {/* Left: Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl opacity-30" style={{ background: "var(--gradient-gold)" }} />
              <img
                src={masteryAIImage}
                alt="MasteryAI Gold Scalper Bot"
                className="relative h-auto max-w-xs sm:max-w-sm rounded-lg shadow-2xl"
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="mb-3 inline-block">
                <span className="text-xs font-bold uppercase tracking-widest text-[oklch(0.74_0.17_78)] bg-[oklch(0.74_0.17_78/0.15)] px-3 py-1.5 rounded-full">Premium Tool • Free</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold">
                MasteryAI
                <span className="text-gradient-gold"> Gold Scalper</span>
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
                A professional, AI-assisted scalping system for MetaTrader 5 designed for learning real market behavior in gold (XAUUSD) trading.
              </p>
            </div>

            {/* Key features */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-foreground">What you get:</p>
              <ul className="space-y-2">
                {[
                  "✔ AI-powered entry & exit signals",
                  "✔ Real-time position sizing and risk management",
                  "✔ 24/7 automated trading capability",
                  "✔ MetaTrader 5 (MT5) compatible",
                ].map((feature) => (
                  <li key={feature} className="text-xs sm:text-sm text-muted-foreground">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleMasteryDownload}
                className="group inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-[oklch(0.74_0.17_78)] px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                Download Bot
              </button>
              <button
                onClick={() => setShowMasteryModal(true)}
                className="group inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg border border-border/60 bg-secondary/50 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
              >
                Learn More
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* Modal Backdrop - MasteryAI */}
      {showMasteryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          {/* Modal Content */}
          <div className="bg-background border border-border/60 rounded-xl max-w-2xl max-h-[90vh] overflow-y-auto w-full shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between bg-background border-b border-border/40 p-4 sm:p-6">
              <h2 className="font-display text-lg sm:text-2xl font-bold">How MasteryAI Gold Scalper Works</h2>
              <button
                onClick={() => setShowMasteryModal(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* Trading Strategies */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg text-amber-600 dark:text-amber-400">Trading Strategies</h3>

                {/* Multi-Timeframe */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground">1. Multi-Timeframe Weighted Voting System</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    The bot uses a three-timeframe analysis with weighted voting to ensure robust trend confirmation before entering trades:
                  </p>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "M15 (15-minute) - Strongest signal (weight: 3)",
                      "M5 (5-minute) - Medium signal (weight: 2)",
                      "M30 (30-minute) - Light signal (weight: 1)",
                    ].map((item) => (
                      <li key={item} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical Indicators */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">2. Technical Indicators Used</h4>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "EMA (Exponential Moving Average) - Period 50 for trend filtering",
                      "RSI (Relative Strength Index) - Period 14 for momentum and pullback detection",
                      "ATR (Average True Range) - Period 14 for volatility measurement",
                      "Strong trend multiplier: 1.2x ATR",
                    ].map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Grid Scalping */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">3. Grid Scalping System</h4>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "Continuous entry grid enabled for aggressive scalping",
                      "Base gap: 3 pips between entry points",
                      "Entry throttle: 800ms minimum between orders (prevents over-trading)",
                      "Quick exit targets: 5 pips Take Profit, 30 pips Stop Loss",
                    ].map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Strategy Modes */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">4. Strategy Modes</h4>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "SingleRound - One trade per direction",
                      "Duel - Buy and sell simultaneously (hedging)",
                      "OnlyBuy - Buy signals only",
                      "OnlySell - Sell signals only",
                    ].map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Risk Management */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-amber-600 dark:text-amber-400">Risk Management</h3>
                <ul className="space-y-1.5 ml-4">
                  {[
                    "Trailing Stop: 4-pip trail with 1-pip steps",
                    "Session Profit Target: Dynamic profit goal per session",
                    "Lifetime Profit Cap: Stops trading once $1,000 cumulative profit reached",
                    "Max Drawdown: 100% limit",
                    "Max Trade Count: 100 trades per session",
                  ].map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Usage */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-amber-600 dark:text-amber-400">AI Usage</h3>

                {/* AI-Adaptive Gap */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">AI-Adaptive Gap Prediction (Optional)</h4>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "Feature: AI_Adaptive parameter (currently disabled)",
                      "Purpose: Uses historical trade results to adapt the base gap dynamically",
                      "Implementation: Maintains a ring buffer of recent trade results (wins/losses) to adjust entry spacing",
                    ].map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dynamic Gap */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">Dynamic Gap System (Optional)</h4>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "Feature: UseDynamicGap parameter (currently disabled)",
                      "Purpose: Adjusts trading gap based on market conditions and volatility",
                    ].map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Intelligence Level */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">Intelligence Level</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    While labeled "AI," the current implementation is more intelligent automation rather than true machine learning:
                  </p>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "Pattern recognition using technical indicators",
                      "Weighted voting logic for trend confirmation",
                      "Adaptive parameters based on historical performance",
                      "The \"AI\" aspect primarily refers to the adaptive gap adjustment based on trade history",
                    ].map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border/40 p-4 sm:p-6 bg-secondary/30">
              <button
                onClick={() => setShowMasteryModal(false)}
                className="w-full rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explore More CTA - Preview Mode Only */}
      {preview && (
        <div className="mt-8 sm:mt-12 text-center">
          <Link
            to="/free-tools"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)] transition-all hover:opacity-90 hover:shadow-lg"
          >
            Explore More Free Tools
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* GTM Pro Section - Full View Only */}
      {!preview && (
        <>
      {/* GTM Pro Section */}
      <section className="space-y-8 sm:space-y-12">
        {/* Hero with image */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:items-center">
          {/* Left: Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl opacity-30" style={{ background: "var(--gradient-primary)" }} />
              <img
                src={gtmProImage}
                alt="GTM Pro Gold Scalper"
                className="relative h-auto max-w-xs sm:max-w-sm rounded-lg shadow-2xl"
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="mb-3 inline-block">
                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/15 px-3 py-1.5 rounded-full">Premium Tool • Free</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold">
                GTM Pro
                <span className="text-gradient-gold"> Gold Scalper</span>
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
                A professional swing trading system for MetaTrader 5 that combines multi-timeframe analysis with advanced technical indicators for strategic gold (XAUUSD) trading.
              </p>
            </div>

            {/* Key features */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-foreground">What you get:</p>
              <ul className="space-y-2">
                {[
                  "✔ Multi-timeframe weighted voting (D1 + H4 + H1)",
                  "✔ MACD + Bollinger Bands + Volume analysis",
                  "✔ Swing trading strategy for hours-to-days positions",
                  "✔ Advanced risk management & trailing stops",
                  "✔ MetaTrader 5 (MT5) compatible",
                ].map((feature) => (
                  <li key={feature} className="text-xs sm:text-sm text-muted-foreground">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleGTMDownload}
                className="group inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-primary px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)] transition-all hover:shadow-xl hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                Download Bot
              </button>
              <button
                onClick={() => setShowGTMModal(true)}
                className="group inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg border border-border/60 bg-secondary/50 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
              >
                Learn More
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* Modal Backdrop - GTM Pro */}
      {showGTMModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          {/* Modal Content */}
          <div className="bg-background border border-border/60 rounded-xl max-w-2xl max-h-[90vh] overflow-y-auto w-full shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between bg-background border-b border-border/40 p-4 sm:p-6">
              <h2 className="font-display text-lg sm:text-2xl font-bold">How GTM Pro Gold Scalper Works</h2>
              <button
                onClick={() => setShowGTMModal(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* Multi-Timeframe Analysis */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg text-primary">1. Multi-Timeframe Analysis (D1 + H4 + H1)</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Weighted Voting System for robust trend confirmation:
                </p>
                <ul className="space-y-1.5 ml-4">
                  {[
                    "D1 (Daily) - Weight: 5 (Strongest signal) - Identifies major trend direction",
                    "H4 (4-Hour) - Weight: 3 (Medium signal) - Confirms intermediate moves",
                    "H1 (1-Hour) - Weight: 2 (Light signal) - Fine-tunes entry timing",
                  ].map((item) => (
                    <li key={item} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hybrid Indicator Strategy */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg text-primary">2. Hybrid Indicator Strategy: MACD + Bollinger Bands + Volume</h3>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground">MACD (Moving Average Convergence Divergence)</h4>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "Fast EMA Period: 12 | Slow EMA Period: 26 | Signal Line: 9",
                      "MACD crosses above signal = Bullish momentum",
                      "MACD crosses below signal = Bearish momentum",
                      "Histogram shows magnitude of momentum",
                    ].map((item) => (
                      <li key={item} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground">Bollinger Bands (Volatility & Overbought/Oversold)</h4>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "Period: 20 (20-bar moving average) | Deviation: 2.0 standard deviations",
                      "Price touching upper band = Overbought (potential pullback/reversal)",
                      "Price touching lower band = Oversold (potential bounce/reversal)",
                      "Band squeeze = Low volatility (breakout likely)",
                      "Band expansion = High volatility (strong trend)",
                    ].map((item) => (
                      <li key={item} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground">Volume Analysis</h4>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "Volume SMA Period: 20 bars",
                      "High volume on breakout = Strong momentum confirmation",
                      "Low volume = Weak or questionable move",
                    ].map((item) => (
                      <li key={item} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Entry Conditions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg text-primary">3. Entry Conditions</h3>
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground">Swing Trading Entries (Conservative)</h4>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "Trend Confirmation: MACD shows bullish/bearish cross on D1",
                      "Momentum Confirmation: H4 MACD aligned with D1",
                      "Entry Trigger: H1 pullback touches Bollinger Bands",
                      "Volume Confirmation: Volume above 20-period average",
                      "Swing Detection: Identifies 100-bar swing patterns",
                    ].map((item) => (
                      <li key={item} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground">Strategy Modes</h4>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "SingleRound: One trade per direction",
                      "Duel: Simultaneous buy & sell (hedging allowed)",
                      "OnlyBuy: Buy signals only",
                      "OnlySell: Sell signals only",
                    ].map((item) => (
                      <li key={item} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Exit Strategy */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg text-primary">4. Exit Strategy</h3>
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground">Take Profit & Stop Loss</h4>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "Take Profit: 50 pips (Swing target)",
                      "Stop Loss: 35 pips (Risk protection)",
                      "Risk/Reward Ratio: 1.43:1",
                    ].map((item) => (
                      <li key={item} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground">Trailing Stop</h4>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "Trail Stop: 15 pips | Trail Step: 5 pips",
                      "Locks in profits while letting winners run",
                    ].map((item) => (
                      <li key={item} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Risk Management */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg text-primary">5. Risk Management</h3>
                <ul className="space-y-1.5 ml-4">
                  {[
                    "Max Trades: 20 (Limits total positions per session)",
                    "Max Drawdown: 50% (Stops trading if equity drops 50%)",
                    "Base Gap: 10 pips (Minimum spacing between entries)",
                    "Entry Throttle: 5 seconds (Prevents rapid-fire entries)",
                    "Session Target: Optional daily profit goal",
                    "Lifetime Profit Cap: $1,000 maximum (stops EA after reaching cap)",
                  ].map((item) => (
                    <li key={item} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trade Timing */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg text-primary">6. Trade Timing & Execution</h3>
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground">Swing Focus</h4>
                  <ul className="space-y-1.5 ml-4">
                    {[
                      "Trades are held for hours to days (not minutes)",
                      "Entry spacing: 10+ pips between potential trades",
                      "5-second throttle prevents overtrading",
                      "Grid scalping disabled—quality over quantity",
                    ].map((item) => (
                      <li key={item} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border/40 p-4 sm:p-6 bg-secondary/30">
              <button
                onClick={() => setShowGTMModal(false)}
                className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
