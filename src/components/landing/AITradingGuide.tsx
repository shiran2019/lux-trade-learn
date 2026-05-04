import { useState } from "react";
import {
  Brain, Bot, Zap, MessageSquare, Code2, TrendingUp, ChevronDown, ChevronUp,
  ExternalLink, Sparkles, Shield, BarChart2, Target, BookOpen, Copy, Check,
  ArrowRight, Cpu, Globe, Activity, Search, Layers,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PUBLIC_AI_TOOLS = [
  {
    name: "ChatGPT",
    provider: "OpenAI",
    url: "https://chat.openai.com",
    icon: MessageSquare,
    iconColor: "bg-bull/10 text-bull",
    accentColor: "border-bull/20",
    badge: "Most Popular",
    badgeColor: "bg-bull/10 text-bull",
    model: "GPT-4o",
    bestFor: ["Market analysis explanations", "Understanding news impact", "Backtesting logic validation", "Learning trading concepts"],
    prompt: "Explain how rising US interest rates typically affect EUR/USD price action. Be educational and include historical context.",
  },
  {
    name: "Claude",
    provider: "Anthropic",
    url: "https://claude.ai",
    icon: Brain,
    iconColor: "bg-gold/10 text-gold",
    accentColor: "border-gold/25",
    badge: "Best for Analysis",
    badgeColor: "bg-gold/15 text-gold",
    model: "Claude 3.5 Sonnet",
    bestFor: ["Deep fundamental analysis", "Reading long economic reports", "Multi-step trade planning", "Risk scenario modelling"],
    prompt: "I'm long EURUSD at 1.085. My stop is at 1.0820 and TP at 1.0950. Analyse my risk-to-reward and suggest improvements.",
  },
  {
    name: "Gemini",
    provider: "Google",
    url: "https://gemini.google.com",
    icon: Sparkles,
    iconColor: "bg-neon/10 text-neon",
    accentColor: "border-neon/20",
    badge: "Real-time Web",
    badgeColor: "bg-neon/10 text-neon",
    model: "Gemini 1.5 Pro",
    bestFor: ["Real-time economic news", "Fed meeting summaries", "Earnings & macro data", "Cross-market correlation"],
    prompt: "What major economic events are scheduled this week that could impact USD pairs? Summarise expected market impact.",
  },
  {
    name: "Perplexity AI",
    provider: "Perplexity",
    url: "https://perplexity.ai",
    icon: Search,
    iconColor: "bg-violet/10 text-violet",
    accentColor: "border-violet/20",
    badge: "Research Tool",
    badgeColor: "bg-violet/10 text-violet",
    model: "Sonar Pro",
    bestFor: ["Live market news research", "Fact-checking indicators", "Finding broker comparisons", "Economic calendar research"],
    prompt: "What is the current market consensus on the Fed's next interest rate decision and how is this priced into USD?",
  },
];

const AI_MODELS_COMPARISON = [
  { feature: "Real-time market data", chatgpt: false, claude: false, gemini: true, perplexity: true },
  { feature: "Chart image analysis", chatgpt: true, claude: true, gemini: true, perplexity: false },
  { feature: "Long document reading", chatgpt: true, claude: "best", gemini: true, perplexity: false },
  { feature: "Code for trading bots", chatgpt: "best", claude: true, gemini: true, perplexity: false },
  { feature: "Economic research", chatgpt: true, claude: true, gemini: true, perplexity: "best" },
  { feature: "Trade journal review", chatgpt: true, claude: "best", gemini: true, perplexity: false },
];

const PROMPT_TEMPLATES = [
  {
    category: "Chart Analysis",
    icon: <BarChart2 className="h-4 w-4" />,
    color: "text-primary bg-primary/10",
    prompts: [
      { title: "Trend Analysis", text: "I'm looking at EUR/USD on the 4H chart. The price has formed three consecutive higher highs and higher lows over 2 weeks. The 20 EMA is below price and pointing up. What does this tell me about the current trend and where should I look for entries?" },
      { title: "Support/Resistance", text: "Explain support and resistance to me as if I'm a complete beginner. Then tell me: if price approaches a level 3 times, is it more likely to break or bounce?" },
      { title: "Candlestick Patterns", text: "What does a bearish engulfing candlestick tell me about market psychology? When is it a reliable signal vs when should I ignore it?" },
    ],
  },
  {
    category: "Risk Management",
    icon: <Shield className="h-4 w-4" />,
    color: "text-bull bg-bull/10",
    prompts: [
      { title: "Position Sizing", text: "I have a $5,000 account and want to risk 1.5% per trade. My stop loss is 30 pips on EURUSD. What lot size should I use? Walk me through the calculation step by step." },
      { title: "Drawdown Recovery", text: "I've lost 20% of my trading account over 2 weeks. Explain: 1) how much % gain I need to recover, 2) what this means psychologically, 3) a step-by-step plan to rebuild responsibly." },
      { title: "Trade Evaluation", text: "I want to evaluate a trade I took. BUY GBPUSD at 1.2650, stop loss 1.2610, take profit 1.2730. Was this a good risk-to-reward setup? What could I improve?" },
    ],
  },
  {
    category: "Market Education",
    icon: <BookOpen className="h-4 w-4" />,
    color: "text-gold bg-gold/10",
    prompts: [
      { title: "Economic Concepts", text: "Explain how inflation data (CPI) affects currency prices. Give me a simple cause-and-effect chain and a real historical example." },
      { title: "Indicator Deep Dive", text: "I use RSI on the 1H chart. Explain: what RSI actually measures, why 70/30 aren't always the best levels, and how divergence works with a practical example." },
      { title: "Trading Psychology", text: "I keep closing trades too early out of fear. Explain the psychology behind this, what it costs me statistically, and 3 practical techniques to improve." },
    ],
  },
];

const AI_BOTS_OVERVIEW = [
  {
    name: "MetaTrader Expert Advisors (EAs)",
    level: "Beginner-friendly",
    levelColor: "text-bull bg-bull/10",
    icon: <Activity className="h-5 w-5" />,
    desc: "Pre-built or custom automated scripts that run inside MetaTrader 4/5. Thousands of free EAs exist in the MT marketplace. Use AI (ChatGPT/Claude) to explain or modify EA code.",
    pros: ["No coding required to use pre-built EAs", "Runs 24/7 on VPS", "Huge community & marketplace"],
    cons: ["Most free EAs are over-optimised", "Requires understanding of settings", "Needs a VPS to run continuously"],
    useAI: "Ask ChatGPT: 'Explain what this MetaTrader EA code does' and paste the MQL4 code.",
  },
  {
    name: "Python Trading Bots",
    level: "Intermediate",
    levelColor: "text-primary bg-primary/10",
    icon: <Code2 className="h-5 w-5" />,
    desc: "Build fully custom bots using Python libraries like CCXT (crypto), Oanda API (forex), or Alpaca (stocks). Use AI to generate and debug code — even non-programmers can build basic bots.",
    pros: ["Full customisation & flexibility", "AI can write most of the code", "Connect to any broker API"],
    cons: ["Requires basic Python understanding", "Risk of bugs causing real losses", "Needs server to run 24/7"],
    useAI: "Ask Claude: 'Write a Python script that connects to OANDA API, fetches EURUSD 1H candles, and signals a buy when RSI(14) crosses below 30.'",
  },
  {
    name: "No-Code Bot Platforms",
    level: "Beginner",
    levelColor: "text-bull bg-bull/10",
    icon: <Zap className="h-5 w-5" />,
    desc: "Platforms like 3Commas, Pionex, TradingView Alerts → webhooks allow building bots visually with no coding. Connect TradingView Pine Script signals to auto-execute trades.",
    pros: ["Zero coding needed", "Visual strategy builder", "TradingView integration"],
    cons: ["Mostly crypto-focused", "Monthly subscription fees", "Limited strategy complexity"],
    useAI: "Ask ChatGPT: 'Write a TradingView Pine Script that alerts when price crosses above the 200 EMA with RSI above 50.'",
  },
  {
    name: "AI-Powered Analysis Platforms",
    level: "Advanced",
    levelColor: "text-gold bg-gold/10",
    icon: <Brain className="h-5 w-5" />,
    desc: "Dedicated platforms like TrendSpider, Trade Ideas, and Kavout use machine learning to scan markets, detect patterns, and generate trade ideas automatically.",
    pros: ["Professional-grade AI scanning", "Pattern recognition across thousands of assets", "Backtesting included"],
    cons: ["Expensive ($50-$250/month)", "Steep learning curve", "AI signals still need human judgement"],
    useAI: "Use alongside ChatGPT: copy AI platform output into ChatGPT for deeper explanation of why a pattern was flagged.",
  },
];

const WORKFLOW_STEPS = [
  { step: "01", title: "Morning Market Brief", tool: "Perplexity / Gemini", color: "bg-primary/15 text-primary", desc: "Ask: 'What economic events are releasing today? How might they affect major USD pairs?' Get a 2-minute brief before the session opens." },
  { step: "02", title: "Chart Reading Help", tool: "ChatGPT / Claude", color: "bg-bull/15 text-bull", desc: "Screenshot your chart setup and upload to ChatGPT-4o or Claude. Ask: 'What do you see on this chart? What would you watch for?' as a second opinion." },
  { step: "03", title: "Trade Plan Validation", tool: "Claude", color: "bg-gold/15 text-gold", desc: "Describe your trade setup, entry, stop loss and take profit. Ask Claude to stress-test your reasoning and identify weaknesses in the setup." },
  { step: "04", title: "Post-Trade Journal Review", tool: "ChatGPT / Claude", color: "bg-[oklch(0.55_0.22_295/0.15)] text-violet", desc: "Paste your trade notes into AI weekly. Ask: 'Analyse my last 10 trades. What patterns do you see in my mistakes? What should I focus on improving?'" },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-secondary transition-colors">
      {copied ? <><Check className="h-3 w-3 text-bull" /> Copied</> : <><Copy className="h-3 w-3" /> Copy prompt</>}
    </button>
  );
}

function ToolCard({ tool }: { tool: typeof PUBLIC_AI_TOOLS[0] }) {
  const [open, setOpen] = useState(false);
  const Icon = tool.icon;
  return (
    <div className={`glass-strong rounded-xl border p-5 transition-all hover-lift ${tool.accentColor}`}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tool.iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display font-bold">{tool.name}</div>
              <div className="text-xs text-muted-foreground">{tool.provider} · {tool.model}</div>
            </div>
        </div>
        <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${tool.badgeColor}`}>{tool.badge}</span>
      </div>

      <ul className="mb-3 space-y-1">
        {tool.bestFor.map((b) => (
          <li key={b} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-current opacity-40 shrink-0" />
            {b}
          </li>
        ))}
      </ul>

      <button onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-xs font-medium hover:bg-secondary transition-colors">
        <span>Sample prompt</span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="mt-2 rounded-lg border border-border/60 bg-background/60 p-3">
          <p className="text-xs text-foreground/80 italic leading-relaxed">"{tool.prompt}"</p>
          <div className="mt-2 flex items-center justify-between">
            <CopyButton text={tool.prompt} />
            <a href={tool.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-primary hover:underline">
              Open {tool.name} <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function ComparisonTable() {
  const renderVal = (v: boolean | string) => {
    if (v === "best") return <span className="inline-flex items-center gap-1 rounded-md bg-bull/10 px-1.5 py-0.5 text-[10px] font-bold text-bull">★ Best</span>;
    if (v === true) return <span className="text-bull text-sm">✓</span>;
    return <span className="text-muted-foreground/40 text-sm">—</span>;
  };
  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/60 bg-secondary/40">
            <th className="px-4 py-3 text-left text-muted-foreground font-medium">Feature</th>
            {["ChatGPT", "Claude", "Gemini", "Perplexity"].map((h) => (
              <th key={h} className="px-4 py-3 text-center font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {AI_MODELS_COMPARISON.map((row, i) => (
            <tr key={row.feature} className={`border-b border-border/40 ${i % 2 === 0 ? "bg-background/30" : ""}`}>
              <td className="px-4 py-2.5 font-medium text-foreground/80">{row.feature}</td>
              <td className="px-4 py-2.5 text-center">{renderVal(row.chatgpt)}</td>
              <td className="px-4 py-2.5 text-center">{renderVal(row.claude)}</td>
              <td className="px-4 py-2.5 text-center">{renderVal(row.gemini)}</td>
              <td className="px-4 py-2.5 text-center">{renderVal(row.perplexity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PromptLibrary() {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);
  const cat = PROMPT_TEMPLATES[activeTab];

  return (
    <div>
      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl border border-border/60 bg-secondary/30 p-1">
        {PROMPT_TEMPLATES.map((t, i) => (
          <button key={t.category} onClick={() => { setActiveTab(i); setExpandedPrompt(null); }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all ${
              activeTab === i ? "bg-white shadow-sm text-foreground dark:text-black border border-border/40" : "text-muted-foreground hover:text-foreground"
            }`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-md ${cat.color} ${activeTab === i ? "" : "opacity-60"}`}>
              {t.icon}
            </span>
            <span className="hidden sm:inline">{t.category}</span>
          </button>
        ))}
      </div>

      {/* Prompts */}
      <div className="space-y-2">
        {cat.prompts.map((p, i) => (
          <div key={p.title} className="rounded-xl border border-border/60 overflow-hidden">
            <button onClick={() => setExpandedPrompt(expandedPrompt === i ? null : i)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ${cat.color}`}>{i + 1}</div>
                <span className="text-sm font-medium">{p.title}</span>
              </div>
              {expandedPrompt === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {expandedPrompt === i && (
              <div className="border-t border-border/40 bg-secondary/20 px-4 pb-4 pt-3">
                <div className="mb-3 rounded-lg border border-dashed border-border bg-background/60 p-3">
                  <p className="text-xs leading-relaxed text-foreground/80 italic">"{p.text}"</p>
                </div>
                <div className="flex items-center justify-between">
                  <CopyButton text={p.text} />
                  <span className="text-[10px] text-muted-foreground">Works best with ChatGPT or Claude</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BotCard({ bot }: { bot: typeof AI_BOTS_OVERVIEW[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-strong rounded-xl p-5">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {bot.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-display text-sm font-bold">{bot.name}</div>
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${bot.levelColor}`}>{bot.level}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{bot.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="mb-1 text-[10px] font-semibold text-bull uppercase tracking-wide">Pros</div>
          <ul className="space-y-0.5">
            {bot.pros.map((p) => <li key={p} className="flex items-start gap-1 text-xs text-muted-foreground"><span className="text-bull mt-0.5">+</span>{p}</li>)}
          </ul>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-semibold text-bear uppercase tracking-wide">Cons</div>
          <ul className="space-y-0.5">
            {bot.cons.map((c) => <li key={c} className="flex items-start gap-1 text-xs text-muted-foreground"><span className="text-bear mt-0.5">−</span>{c}</li>)}
          </ul>
        </div>
      </div>

      <button onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg bg-primary/5 border border-primary/15 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
        <Sparkles className="h-3.5 w-3.5" />
        <span>How to use AI with this</span>
        {open ? <ChevronUp className="h-3.5 w-3.5 ml-auto" /> : <ChevronDown className="h-3.5 w-3.5 ml-auto" />}
      </button>
      {open && (
        <div className="mt-2 rounded-lg border border-primary/15 bg-primary/5 p-3">
          <p className="text-xs text-foreground/80 italic leading-relaxed">"{bot.useAI}"</p>
          <CopyButton text={bot.useAI} />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AITradingGuide() {
  return (
    <div className="mx-auto max-w-7xl space-y-20 px-4 py-16">

      {/* ── 1. Hero stats row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: <Brain className="h-5 w-5" />, value: "4+", label: "Free AI tools you can use today", color: "text-primary bg-primary/10" },
          { icon: <MessageSquare className="h-5 w-5" />, value: "12+", label: "Ready-to-use prompt templates", color: "text-bull bg-bull/10" },
          { icon: <Bot className="h-5 w-5" />, value: "4", label: "Types of AI trading bots", color: "text-gold bg-gold/10" },
          { icon: <Zap className="h-5 w-5" />, value: "0$", label: "Cost to start with AI analysis", color: "text-violet bg-violet/10" },
        ].map((s) => (
          <div key={s.label} className="glass-strong rounded-xl p-4 text-center">
            <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>{s.icon}</div>
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── 2. Public AI Tools ────────────────────────────────────────── */}
      <section>
        <div className="mb-2 inline-block rounded-md border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-widest text-primary">Free to use now</div>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Public AI tools for <span className="text-gradient-gold">trading education</span></h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">These publicly available AI assistants can transform how you learn trading concepts, analyse setups, and review your decisions — at zero cost.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PUBLIC_AI_TOOLS.map((tool) => <ToolCard key={tool.name} tool={tool} />)}
        </div>
      </section>

      {/* ── 3. Comparison Table ───────────────────────────────────────── */}
      <section>
        <div className="mb-2 inline-block rounded-md border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-widest text-primary">At a glance</div>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Which AI for which <span className="text-gradient-gold">trading task?</span></h2>
        <p className="mt-3 mb-6 max-w-2xl text-muted-foreground">Each model has different strengths. Use the right tool for the right job.</p>
        <ComparisonTable />
        <p className="mt-3 text-xs text-muted-foreground">★ Best = strongest capability in this category. ✓ = supported. — = not available or unreliable.</p>
      </section>

      {/* ── 4. Prompt Library ─────────────────────────────────────────── */}
      <section>
        <div className="mb-2 inline-block rounded-md border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-widest text-primary">Copy & paste</div>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Prompt library for <span className="text-gradient-gold">traders</span></h2>
        <p className="mt-3 mb-6 max-w-2xl text-muted-foreground">The quality of AI output depends entirely on how you ask. These templates are crafted to get clear, educational, actionable answers.</p>
        <PromptLibrary />
      </section>

      {/* ── 5. AI Workflow ────────────────────────────────────────────── */}
      <section>
        <div className="mb-2 inline-block rounded-md border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-widest text-primary">Daily workflow</div>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Build an <span className="text-gradient-gold">AI-assisted</span> trading routine</h2>
        <p className="mt-3 mb-8 max-w-2xl text-muted-foreground">Integrate free AI tools into your daily routine without overhauling how you trade. Each step takes under 5 minutes.</p>

        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* connecting line */}
          <div className="absolute left-0 right-0 top-8 hidden h-px lg:block" style={{ background: "linear-gradient(90deg, transparent, oklch(0.32 0.13 268 / 0.3), transparent)" }} />
          {WORKFLOW_STEPS.map((w) => (
            <div key={w.step} className="glass-strong relative rounded-xl p-5">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl font-display text-lg font-bold ${w.color}`}>{w.step}</div>
              <div className="font-semibold text-sm mb-1">{w.title}</div>
              <div className="mb-2 text-[11px] font-medium text-primary">{w.tool}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. AI Bots Overview ───────────────────────────────────────── */}
      <section>
        <div className="mb-2 inline-block rounded-md border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-widest text-primary">Automation</div>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">AI trading bots — <span className="text-gradient-gold">what's real</span></h2>
        <p className="mt-3 mb-8 max-w-2xl text-muted-foreground">From simple MetaTrader scripts to Python algorithms — a clear-eyed guide to what AI bots actually do, their limits, and how to use AI to build or understand them.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {AI_BOTS_OVERVIEW.map((bot) => <BotCard key={bot.name} bot={bot} />)}
        </div>

        {/* Warning card */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-bear/20 bg-bear/5 p-4">
          <Shield className="h-5 w-5 shrink-0 text-bear mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-bear mb-1">Reality check on "AI trading bots"</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Most bots sold online as "AI-powered" are simple rule-based systems with no real AI. A bot that works on historical data often fails on live markets (overfitting). 
              The safest approach: use AI as an educational tool first — learn to trade manually before automating. Never deploy a bot with capital you aren't prepared to lose entirely.
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. Getting Started CTA ────────────────────────────────────── */}
      {/* <section className="relative overflow-hidden rounded-2xl p-8 text-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <Cpu className="h-3.5 w-3.5" /> Start today — completely free
          </div>
          <h3 className="font-display text-2xl font-bold sm:text-3xl">Your AI trading tutor is one <span className="text-gradient-gold">prompt away</span></h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">Open ChatGPT or Claude right now. Describe a recent trade you took and ask for feedback. That's it. That's the starting point.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-primary)" }}>
              Open ChatGPT <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a href="https://claude.ai" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors">
              Open Claude <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">Educational use only · Not financial advice · No real money involved</p>
        </div>
      </section> */}

    </div>
  );
}
