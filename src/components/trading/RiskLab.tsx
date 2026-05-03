import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Info, TrendingUp, TrendingDown, HelpCircle } from "lucide-react";
import { useTour, Tour, RISK_LAB_STEPS } from "./Tour";

const LEVERAGE_OPTIONS = [1, 10, 30, 50, 100, 200, 500];
const BALANCE_PRESETS = [500, 1000, 5000, 10000, 50000];

// ─── Balance Bar ──────────────────────────────────────────────────────────────

function BalanceBar({ balance, risk, potentialLoss, potentialGain }: {
  balance: number; risk: number; potentialLoss: number; potentialGain: number;
}) {
  const lossPct = Math.min(100, (potentialLoss / balance) * 100);
  const gainPct = Math.min(100, (potentialGain / balance) * 100);

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <span className="text-muted-foreground">Account balance</span>
        <span className="font-semibold">${balance.toLocaleString()}</span>
      </div>
      {/* Main bar */}
      <div className="relative h-8 overflow-hidden rounded-lg bg-secondary">
        {/* Safe zone */}
        <div className="absolute inset-y-0 left-0 rounded-lg bg-secondary" style={{ width: "100%" }} />
        {/* Potential gain */}
        <div
          className="absolute inset-y-0 transition-all duration-500"
          style={{
            right: 0,
            width: `${gainPct}%`,
            background: "linear-gradient(90deg, oklch(0.6 0.17 158 / 0.2), oklch(0.6 0.17 158 / 0.4))",
            borderLeft: "2px solid oklch(0.6 0.17 158 / 0.6)",
          }}
        />
        {/* Risk zone */}
        <div
          className="absolute inset-y-0 left-0 transition-all duration-500"
          style={{
            width: `${lossPct}%`,
            background: "linear-gradient(90deg, oklch(0.6 0.23 25 / 0.35), oklch(0.6 0.23 25 / 0.15))",
            borderRight: "2px solid oklch(0.6 0.23 25 / 0.6)",
          }}
        />
        {/* Labels */}
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <span className="text-xs font-semibold text-bear">-${potentialLoss.toFixed(0)} risk</span>
          <span className="text-xs font-semibold text-bull">+${potentialGain.toFixed(0)} target</span>
        </div>
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span className="text-bear">{lossPct.toFixed(1)}% of account at risk</span>
        <span className="text-bull">{gainPct.toFixed(1)}% target gain</span>
      </div>
    </div>
  );
}

// ─── Leverage Magnifier Visual ────────────────────────────────────────────────

function LeverageMagnifier({ leverage, pipMove, lotSize }: { leverage: number; pipMove: number; lotSize: number }) {
  const baseMovement = pipMove * 10; // $10/pip for 1 standard lot
  const leveragedPnl = baseMovement * lotSize;
  const unLeveragedFunds = (lotSize * 100000) / leverage; // margin required

  const bars = [
    { label: "1 pip move", usd: baseMovement * lotSize, color: "bg-primary/60" },
    { label: "5 pip move", usd: baseMovement * lotSize * 5, color: "bg-primary/70" },
    { label: "20 pip move", usd: baseMovement * lotSize * 20, color: "bg-bear/60" },
    { label: "50 pip move", usd: baseMovement * lotSize * 50, color: "bg-bear/80" },
  ];
  const maxVal = Math.max(...bars.map((b) => b.usd));

  return (
    <div>
      <div className="mb-3 text-xs font-semibold text-foreground">
        Price movement impact (×{leverage} leverage)
      </div>
      <div className="space-y-2">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <div className="w-20 text-right text-[11px] text-muted-foreground shrink-0">{b.label}</div>
            <div className="relative flex-1 h-6 overflow-hidden rounded-md bg-secondary">
              <div
                className={`absolute inset-y-0 left-0 ${b.color} rounded-md transition-all duration-500`}
                style={{ width: `${(b.usd / maxVal) * 100}%` }}
              />
              <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold">
                ${b.usd.toFixed(0)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">
        Margin required: <span className="font-semibold text-foreground">${unLeveragedFunds.toFixed(0)}</span> for {lotSize} lot
      </div>
    </div>
  );
}

// ─── Loss Animation ───────────────────────────────────────────────────────────

function LossScenario({ balance, riskPct, leverage }: { balance: number; riskPct: number; leverage: number }) {
  const [simulating, setSimulating] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(balance);
  const [tradesLost, setTradeLost] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCurrentBalance(balance);
    setTradeLost(0);
  }, [balance, riskPct]);

  const runSimulation = () => {
    if (simulating) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSimulating(false);
      setCurrentBalance(balance);
      setTradeLost(0);
      return;
    }
    setSimulating(true);
    let bal = balance;
    let count = 0;
    intervalRef.current = setInterval(() => {
      bal = bal - bal * (riskPct / 100);
      count++;
      setCurrentBalance(bal);
      setTradeLost(count);
      if (bal < balance * 0.1 || count >= 20) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setSimulating(false);
      }
    }, 500);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const pct = (currentBalance / balance) * 100;

  return (
    <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-semibold text-foreground">Consecutive losses impact</div>
        <button onClick={runSimulation}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            simulating ? "bg-bear/15 text-bear" : "bg-primary/10 text-primary hover:bg-primary/15"
          }`}>
          {simulating ? "Reset" : "Simulate 20 losses"}
        </button>
      </div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">Balance after {tradesLost} losses</span>
        <span className={`font-mono font-semibold ${pct > 60 ? "text-bull" : pct > 30 ? "text-primary" : "text-bear"}`}>
          ${currentBalance.toFixed(0)}
        </span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-400 ${pct > 60 ? "bg-bull" : pct > 30 ? "bg-primary" : "bg-bear"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">
        {pct < 50 ? `⚠️ Down ${(100 - pct).toFixed(0)}% — need ${((1 / (pct / 100) - 1) * 100).toFixed(0)}% gain to recover` : `${pct.toFixed(0)}% of starting balance remaining`}
      </div>
    </div>
  );
}

// ─── Main RiskLab Component ───────────────────────────────────────────────────

export function RiskLab() {
  const tour = useTour(RISK_LAB_STEPS);
  const containerRef = useRef<HTMLDivElement>(null);
  const [balance, setBalance] = useState(10000);
  const [riskPct, setRiskPct] = useState(2);
  const [leverage, setLeverage] = useState(30);
  const [rr, setRr] = useState(2);
  const [slPips, setSlPips] = useState(25);
  const [customBalance, setCustomBalance] = useState("");

  const riskAmount = balance * (riskPct / 100);
  const pipValue = 10; // $10/pip per standard lot (EUR/USD)
  const positionSize = riskAmount / (slPips * pipValue);
  const notional = positionSize * 100000;
  const margin = notional / leverage;
  const tpPips = slPips * rr;
  const potentialGain = tpPips * pipValue * positionSize;
  const winRate = 50; // assumption
  const expectedValue = (winRate / 100) * potentialGain - ((100 - winRate) / 100) * riskAmount;

  return (
    <div ref={containerRef} className="flex flex-col gap-5 relative overflow-hidden">
      <Tour active={tour.active} stepIndex={tour.stepIndex} steps={tour.steps} onNext={tour.next} onPrev={tour.prev} onClose={tour.stop} containerRef={containerRef} />
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-primary font-medium">Risk & Leverage Lab</div>
        <button onClick={tour.start} className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors" title="Take Risk Lab tour">
          <HelpCircle className="h-3 w-3" /> Tour
        </button>
      </div>

      {/* Account setup */}
      <div data-tour="rl-balance" className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-semibold text-foreground">Account Balance</div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {BALANCE_PRESETS.map((b) => (
              <button key={b} onClick={() => setBalance(b)}
                className={`rounded-md px-2.5 py-1 text-xs transition-colors ${balance === b ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-secondary border border-transparent"}`}>
                ${b.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Custom: $</span>
            <input type="number" value={customBalance} onChange={(e) => {
              setCustomBalance(e.target.value);
              if (+e.target.value > 0) setBalance(+e.target.value);
            }} placeholder={balance.toString()}
              className="w-28 rounded-md border border-border bg-background px-2 py-1 text-xs" />
          </div>
        </div>

        <div data-tour="rl-leverage">
          <div className="mb-2 text-xs font-semibold text-foreground">Leverage</div>
          <div className="flex flex-wrap gap-1.5">
            {LEVERAGE_OPTIONS.map((lev) => (
              <button key={lev} onClick={() => setLeverage(lev)}
                className={`rounded-md px-2.5 py-1 text-xs transition-colors ${leverage === lev ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-secondary border border-transparent"} ${lev > 100 ? "border-bear/20" : ""}`}>
                {lev}:1{lev > 100 ? " ⚠" : ""}
              </button>
            ))}
          </div>
          {leverage > 100 && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-bear">
              <AlertTriangle className="h-3 w-3" />
              Very high leverage — small moves cause large losses
            </div>
          )}
        </div>
      </div>

      {/* Risk controls */}
      <div data-tour="rl-sliders" className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted-foreground">Risk per trade</span>
            <span className={`font-semibold ${riskPct <= 2 ? "text-bull" : riskPct <= 5 ? "text-primary" : "text-bear"}`}>{riskPct}%</span>
          </div>
          <input type="range" min={0.5} max={10} step={0.5} value={riskPct}
            onChange={(e) => setRiskPct(+e.target.value)}
            className="w-full accent-primary" />
          <div className="flex justify-between text-[10px]">
            <span className="text-bull">0.5% safe</span>
            <span className="text-bear">10% dangerous</span>
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted-foreground">Stop loss (pips)</span>
            <span className="font-semibold">{slPips}</span>
          </div>
          <input type="range" min={5} max={100} step={5} value={slPips}
            onChange={(e) => setSlPips(+e.target.value)}
            className="w-full accent-[oklch(0.6_0.23_25)]" />
        </div>
      </div>

      {/* R:R selector */}
      <div>
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-muted-foreground">Risk:Reward ratio</span>
          <span className={`font-semibold ${rr >= 2 ? "text-bull" : rr >= 1.5 ? "text-primary" : "text-bear"}`}>1:{rr.toFixed(1)}</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 1.5, 2, 3, 5].map((r) => (
            <button key={r} onClick={() => setRr(r)}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${rr === r ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-secondary border border-transparent"}`}>
              1:{r}
            </button>
          ))}
        </div>
      </div>

      {/* Main metrics */}
      <div data-tour="rl-metrics" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Position Size", value: positionSize.toFixed(2) + " lots", sub: `$${notional.toLocaleString(undefined, { maximumFractionDigits: 0 })} notional`, good: true },
          { label: "Margin Required", value: "$" + margin.toFixed(0), sub: `at ${leverage}:1 leverage`, good: margin < balance * 0.3 },
          { label: "Max Loss", value: "$" + riskAmount.toFixed(0), sub: `${riskPct}% of account`, good: riskPct <= 2 },
          { label: "Target Profit", value: "$" + potentialGain.toFixed(0), sub: `at ${tpPips.toFixed(0)} pips TP`, good: true },
        ].map((m) => (
          <div key={m.label} className={`rounded-lg border p-3 ${m.good ? "border-border/60 bg-secondary/30" : "border-bear/20 bg-bear/5"}`}>
            <div className="text-[10px] text-muted-foreground mb-1">{m.label}</div>
            <div className={`font-display text-lg font-bold ${m.good ? "text-foreground" : "text-bear"}`}>{m.value}</div>
            <div className="text-[10px] text-muted-foreground">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Balance bar */}
      <BalanceBar balance={balance} risk={riskPct} potentialLoss={riskAmount} potentialGain={potentialGain} />

      {/* Leverage magnifier */}
      <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
        <LeverageMagnifier leverage={leverage} pipMove={1} lotSize={positionSize} />
      </div>

      {/* Expected value */}
      <div className={`rounded-lg border p-3 ${expectedValue > 0 ? "border-bull/20 bg-bull/5" : "border-bear/20 bg-bear/5"}`}>
        <div className="flex items-center gap-2 mb-1">
          <Info className="h-3.5 w-3.5 text-primary" />
          <div className="text-xs font-semibold">Expected value at 50% win rate</div>
        </div>
        <div className={`font-display text-2xl font-bold ${expectedValue > 0 ? "text-bull" : "text-bear"}`}>
          {expectedValue > 0 ? "+" : ""}${expectedValue.toFixed(2)} per trade
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          {expectedValue > 0
            ? `With a 1:${rr} R:R, you're profitable at 50% win rate. Keep this setup consistent.`
            : `At this R:R ratio, you need >50% win rate to be profitable. Improve your entries or widen TP.`}
        </div>
      </div>

      {/* Consecutive loss simulation */}
      <div data-tour="rl-loss-sim">
        <LossScenario balance={balance} riskPct={riskPct} leverage={leverage} />
      </div>

      {/* Professional risk guidelines */}
      <div className="rounded-lg border border-primary/10 bg-primary/5 p-3 text-xs">
        <div className="mb-2 font-semibold text-primary">Professional Risk Guidelines</div>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {[
            { rule: "Risk 1-2% per trade", why: "Survives 50+ consecutive losses" },
            { rule: "Always set a stop loss", why: "Prevents catastrophic single losses" },
            { rule: "Aim for R:R ≥ 1.5:1", why: "Profitable at <50% win rate" },
            { rule: "Use low leverage to start", why: "Reduces emotional decision-making" },
          ].map((g) => (
            <div key={g.rule} className="flex gap-2">
              <span className="text-bull">✓</span>
              <div>
                <div className="font-medium text-foreground">{g.rule}</div>
                <div className="text-muted-foreground">{g.why}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
