//+------------------------------------------------------------------+
//| MASTERYAI_GOLD_SCALPER.mq5 (MT5 Hedging, compile-safe, live)     |
//| MASTERYAI Gold Scalper — MTF weighted vote + lifetime cap         |
//+------------------------------------------------------------------+
#property strict
#property version   "5.10"
#property description "MASTERYAI Gold Scalper — D1+H4+M30 weighted vote, EA lifetime profit cap, session TP, fast grid."

#include <Trade/Trade.mqh>
CTrade trade;

//==================== ❗ Visible Inputs ====================
// Access gate
input int security_key = 2026;                // security_key

// Strategy mode
enum eApproachMode { SingleRound=0, Duel=1, OnlyBuy=2, OnlySell=3 };
input eApproachMode Direction = SingleRound;  // Strategy approach

// Core risk/logic knobs
input double Base_Gap_Pips        = 3.00;     // Base gap
input int    Take_Profit          = 5;        // TP 
input int    Stop_Loss            = 30;       // SL

input bool   Use_Trailing_Stop    = true;     // Use Trailing Stop
input int    Trail_Stop_Pips      = 4;        // Trail Stop Pips
input int    Trail_Step_Pips      = 1;        // Trail Step Pips

input int    Max_Drawdown_Pct     = 100;      // Max Drawdown (% from balance)
input int    Max_Trades           = 100;      // Max Trade Count

input bool   AI_Adaptive          = false;    // AI-based Gap Prediction
input bool   UseDynamicGap        = false;    // Dynamic Gap

// Session profit target (this run)
// Profit_Target_Amount = $ from EQUITY at attach.
// Example: start equity=40, set 1.00 -> target equity=41.
input double Profit_Target_Amount = 0.0;      // Profit Target

// Lifetime max profit cap for THIS EA (MagicNumber-based, net closed profit)
// Example: set 1000 -> once EA has made $1000 total net, no new entries.
input bool   Use_Max_Profit_Limit = true;    // Use Max Profit Limit
input double Max_Profit_Limit     = 1000.0;  // Max Profit Limit

// Lot size
input double Lot_Size             = 0.01;     // Lot Size

// Display
input int    UI_Scale             = 1;        // UI Scale (1=Normal  2=Mac/HiDPI Retina)

//==================== 🔒 Hardcoded (not visible in Inputs) ====================
const string    VELOX_TAG                = "VELOX";
const long      MagicNumber              = 777123;
const bool      ShowDashboard            = true;
const bool      OpenImmediatelyOnAttach  = true;
const int       MinMillisBetweenEntries  = 800;     // throttle (ms)
// PipSizePrice is now dynamic — computed in OnInit() per symbol
const int       SlippagePoints           = 10;
const bool      ContinuousEntries        = true;    // grid enabled

// Timeframes used for direction prediction
const ENUM_TIMEFRAMES TF_Strong          = PERIOD_M15; // strongest signal
const ENUM_TIMEFRAMES TF_Medium          = PERIOD_M5;  // medium signal
const ENUM_TIMEFRAMES TF_Light           = PERIOD_M30; // light signal

// Extra timeframe kept for swings/fibs
const ENUM_TIMEFRAMES TF_Signal          = PERIOD_M30; // swings/fibs

// Strategy filters
const int       EMA_Filter_Period        = 50;
const int       RSI_Period               = 14;
const int       ATR_Period               = 14;
const double    StrongTrend_ATR_Mult     = 1.2;
const double    Pullback_RSI_Zone        = 10.0;
const int       SwingLookbackBars        = 50;
const double    FibTouchTolerancePips    = 1.0;

// Weighted voting (M15 + M5 + M30)
const int       W_Strong                 = 3;
const int       W_Medium                 = 2;
const int       W_Light                  = 1;
const string    BOT_NAME               = "MASTERYAI Gold Scalper";

//==================== Globals ====================
int      g_digits              = 0;
double   g_point               = 0.0;
double   g_pipSizePrice        = 0.10;   // 1 pip in price units — set dynamically in OnInit()

bool     g_didImmediate        = false;
int      g_currentRoundDir     = 0;     // +1 buy, -1 sell, 0 none
datetime g_roundStart          = 0;

double   lastBuyAnchor         = 0.0;
double   lastSellAnchor        = 0.0;

ulong    gTickets[];
ulong    lastOrderMS           = 0;

// Adaptive (for AI_Adaptive)
int    g_resultsRingSize       = 0;
int    g_resultsHead           = 0;
int    g_resultsCount          = 0;
uchar  g_results[];                     // 1=win, 0=loss

// Map ticket -> intended dir at entry (reserved, not heavily used here)
int    gDirsByTicketCount      = 0;
ulong  gDirsTickets[];
int    gDirsDir[];

// Session profit tracking
double g_startEquity           = 0.0;
bool   g_profitTargetHit       = false;

// Drawdown tracking
bool   g_drawdownHit           = false;  

// Lifetime EA profit tracking (from history, MagicNumber-based)
double g_totalProfitSoFar      = 0.0;
bool   g_maxProfitLimitHit     = false;

// Indicator handles
int    hEMA_Strong = INVALID_HANDLE;
int    hRSI_Strong = INVALID_HANDLE;
int    hATR_Strong = INVALID_HANDLE;
int    hEMA_Medium = INVALID_HANDLE;
int    hRSI_Medium = INVALID_HANDLE;
int    hEMA_Light = INVALID_HANDLE;
int    hRSI_Light = INVALID_HANDLE;

//==================== Prototypes ====================
void   UpdateDashboard();
void   UpdateMaxProfitTracker();
bool   MaxProfitLimitReached();

//==================== Utils ====================
int    Digs()                 { return g_digits; }
double Norm(double p)         { return NormalizeDouble(p, g_digits); }
double PipsToPrice(double p)  { return p * g_pipSizePrice; }

//==================== Ticket store ====================
int  FindTicketIdx(ulong t)
{
   for(int i=0;i<ArraySize(gTickets);++i)
      if(gTickets[i]==t) return i;
   return -1;
}
void AddTicket(ulong t)
{
   if(FindTicketIdx(t)<0){
      int n=ArraySize(gTickets);
      ArrayResize(gTickets,n+1);
      gTickets[n]=t;
   }
}
void RemoveTicket(ulong t)
{
   int i=FindTicketIdx(t);
   if(i<0) return;
   int n=ArraySize(gTickets);
   for(int k=i+1;k<n;k++)
      gTickets[k-1]=gTickets[k];
   ArrayResize(gTickets,n-1);
}
int MyOpenTrades()
{
   int cnt = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(!PositionSelectByTicket(ticket))
         continue;

      // Count only this EA's positions, on this symbol
      long   magic  = PositionGetInteger(POSITION_MAGIC);
      string symbol = PositionGetString(POSITION_SYMBOL);

      if(magic == MagicNumber && symbol == _Symbol)
         cnt++;
   }
   return cnt;
}


//==================== Access Gate (Key + Account) ====================
bool GateOK()
{
   if(security_key!=2026){
      Print("Access denied: invalid security_key");
      return false;
   }

   const long mode  = (long)AccountInfoInteger(ACCOUNT_TRADE_MODE);
   // ACCOUNT_TRADE_MODE: 0=DEMO, 1=CONTEST, 2=REAL
   // All account types (DEMO, CONTEST, REAL) are now free
   return true;
}

//==================== Live safety: perms & volume ====================
bool TradingAllowed()
{
   if(!MQLInfoInteger(MQL_TRADE_ALLOWED)){ Print("Algo trading disabled in EA settings"); return false; }
   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED)){ Print("Algo trading disabled in terminal"); return false; }
   if(!AccountInfoInteger(ACCOUNT_TRADE_EXPERT)){ Print("Broker disallows expert trading on this account"); return false; }

   ENUM_SYMBOL_TRADE_MODE mode = (ENUM_SYMBOL_TRADE_MODE)SymbolInfoInteger(_Symbol, SYMBOL_TRADE_MODE);
   if(mode != SYMBOL_TRADE_MODE_FULL){
      Print("Symbol trade mode not full (mode=", (int)mode, ") — live trading blocked by broker.");
      return false;
   }
   return true;
}

double NormalizeLots(double lots)
{
   double minlot = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double maxlot = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   double step   = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);

   if(minlot<=0.0) minlot=0.01;
   if(step<=0.0)   step=0.01;
   if(maxlot<=0.0) maxlot=100.0;

   double v = MathMax(minlot, MathMin(maxlot, lots));
   v = MathFloor((v + 1e-12)/step)*step;  // snap
   int prec = (int)MathMax(0, (int)MathRound(-MathLog10(step)+0.5));
   v = NormalizeDouble(v, prec);
   return v;
}
bool VolumeOK(double &lots_out)
{
   double v = NormalizeLots(Lot_Size);
   double minlot = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   if(v < minlot - 1e-12){
      Print("Lot too small for broker. LotSize=",Lot_Size," min=",minlot);
      return false;
   }
   lots_out = v;
   return true;
}

//==================== Broker stop distance ====================
double MinStopDistancePrice()
{
   int stops  = (int)SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
   int freeze = (int)SymbolInfoInteger(_Symbol, SYMBOL_TRADE_FREEZE_LEVEL);
   int pts = MathMax(stops, freeze);
   if(pts<=0) return 0.0;
   return pts * SymbolInfoDouble(_Symbol, SYMBOL_POINT);
}
void BrokerSafeStops(bool isBuy, const double price, double &sl, double &tp)
{
   double md=MinStopDistancePrice();
   if(md<=0) return;

   if(isBuy){
      if(price-sl < md) sl = price-md;
      if(tp-price < md) tp = price+md;
   }else{
      if(sl-price < md) sl = price+md;
      if(price-tp < md) tp = price-md;
   }
   sl=Norm(sl); tp=Norm(tp);
}

//==================== Throttle ====================
bool ThrottleOK()
{
   ulong now = GetMicrosecondCount()/1000ULL; // ms
   if(lastOrderMS==0 || (now-lastOrderMS) >= (ulong)MinMillisBetweenEntries){
      lastOrderMS=now;
      return true;
   }
   return false;
}

//==================== Close all VELOX positions ====================
bool CloseAllPositions()
{
   bool any = false;
   trade.SetExpertMagicNumber(MagicNumber);
   trade.SetDeviationInPoints(SlippagePoints);

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(!PositionSelectByTicket(ticket))
         continue;

      if(PositionGetInteger(POSITION_MAGIC) != MagicNumber)
         continue; // only EA positions

      double vol = PositionGetDouble(POSITION_VOLUME);
      if(vol <= 0.0) continue;

      bool ok = trade.PositionClose(ticket);
      if(!ok)
         Print("CloseAllPositions: failed to close ticket ", ticket,
               " ret=", trade.ResultRetcode(), " err=", GetLastError());
      else
         any = true;
   }
   return any;
}

//==================== EA Lifetime Profit (MagicNumber-based) ====================
double GetEAAccumulatedProfit()
{
   double sum = 0.0;
   datetime from = 0;
   datetime to   = TimeCurrent();

   if(!HistorySelect(from, to))
      return 0.0;

   uint total = HistoryDealsTotal();
   for(uint i=0; i<total; i++)
   {
      ulong dealTicket = HistoryDealGetTicket(i);
      long  magic      = (long)HistoryDealGetInteger(dealTicket, DEAL_MAGIC);
      if(magic != MagicNumber)
         continue;

      int entry = (int)HistoryDealGetInteger(dealTicket, DEAL_ENTRY);
      if(entry == DEAL_ENTRY_IN)
         continue; // only exits/partials

      double profit = HistoryDealGetDouble(dealTicket, DEAL_PROFIT)
                    + HistoryDealGetDouble(dealTicket, DEAL_SWAP)
                    + HistoryDealGetDouble(dealTicket, DEAL_COMMISSION);
      sum += profit;
   }
   return sum;
}

void UpdateMaxProfitTracker()
{
   g_totalProfitSoFar = GetEAAccumulatedProfit();

   if(!Use_Max_Profit_Limit || Max_Profit_Limit <= 0.0)
      return;

   if(!g_maxProfitLimitHit && g_totalProfitSoFar >= Max_Profit_Limit)
   {
      g_maxProfitLimitHit = true;
      Print("VELOX: Max profit limit reached. EA total net profit=",
            DoubleToString(g_totalProfitSoFar,2),
            " / Limit=", DoubleToString(Max_Profit_Limit,2),
            ". No further trades will be opened.");
   }
}

bool MaxProfitLimitReached()
{
   if(!Use_Max_Profit_Limit || Max_Profit_Limit <= 0.0)
      return false;

   UpdateMaxProfitTracker();   // refresh from history
   return g_maxProfitLimitHit;
}

//==================== Profit / DD helpers ====================

// Session profit target: profit from equity at OnInit
bool ProfitLimitHit()
{
   if(Profit_Target_Amount <= 0.0)
      return false; // OFF

   if(g_profitTargetHit)
      return true;  // already triggered

   double eq     = AccountInfoDouble(ACCOUNT_EQUITY);
   double profit = eq - g_startEquity;

   if(profit >= Profit_Target_Amount)
   {
      Print("VELOX: Session profit target reached (",
            DoubleToString(profit,2), " >= ",
            DoubleToString(Profit_Target_Amount,2),
            "). Closing all VELOX positions & halting.");
      CloseAllPositions();
      g_profitTargetHit = true;
      return true;
   }
   return false;
}

bool DrawdownExceeded()
{
   // 0 or negative = OFF
   if(Max_Drawdown_Pct <= 0.0)
      return false;

   // Already hit once in this session
   if(g_drawdownHit)
      return true;

   double eq = AccountInfoDouble(ACCOUNT_EQUITY);
   if(g_startEquity <= 0.0)
      return false;

   // Loss from starting equity
   double loss  = g_startEquity - eq;
   if(loss <= 0.0)
      return false;  // no drawdown yet

   double ddPct = loss / g_startEquity * 100.0;

   if(ddPct >= Max_Drawdown_Pct)
   {
      Print("VELOX: Max drawdown reached (",
            DoubleToString(ddPct,2)," % >= ",
            DoubleToString(Max_Drawdown_Pct,2),
            " %). Closing all VELOX positions & halting.");

      CloseAllPositions();
      g_drawdownHit = true;
      return true;
   }

   return false;
}


//==================== Series (MT5 price access) ====================
double CloseTF(ENUM_TIMEFRAMES tf,int sh){ double b[]; if(CopyClose(_Symbol,tf,sh,1,b)!=1) return 0; return b[0]; }
double OpenTF (ENUM_TIMEFRAMES tf,int sh){ double b[]; if(CopyOpen (_Symbol,tf,sh,1,b)!=1) return 0; return b[0]; }
double HighTF (ENUM_TIMEFRAMES tf,int sh){ double b[]; if(CopyHigh (_Symbol,tf,sh,1,b)!=1) return 0; return b[0]; }
double LowTF  (ENUM_TIMEFRAMES tf,int sh){ double b[]; if(CopyLow  (_Symbol,tf,sh,1,b)!=1) return 0; return b[0]; }

//==================== Indicator helpers ====================
// Strong (M15)
bool EMA1_Strong(double &e){ double a[]; if(CopyBuffer(hEMA_Strong,0,1,1,a)<1) return false; e=a[0]; return true; }
bool EMA2_Strong(double &e0,double &e1){
   double a[],b[];
   if(CopyBuffer(hEMA_Strong,0,1,1,a)<1) return false;
   if(CopyBuffer(hEMA_Strong,0,2,1,b)<1) return false;
   e0=a[0]; e1=b[0]; return true;
}
bool RSI1_Strong(double &r){ double a[]; if(CopyBuffer(hRSI_Strong,0,1,1,a)<1) return false; r=a[0]; return true; }
bool ATRnowAvgStrong(double &an,double &av){
   double a[50];
   int g=CopyBuffer(hATR_Strong,0,1,50,a);
   if(g<=0) return false;
   an=a[0];
   double s=0;
   for(int i=0;i<g;i++) s+=a[i];
   av=(g>0)?(s/g):an;
   return true;
}

// Medium (M5)
bool EMA1_Medium(double &e){ double a[]; if(CopyBuffer(hEMA_Medium,0,1,1,a)<1) return false; e=a[0]; return true; }
bool RSI1_Medium(double &r){ double a[]; if(CopyBuffer(hRSI_Medium,0,1,1,a)<1) return false; r=a[0]; return true; }

// Light (M30)
bool EMA1_Light(double &e){ double a[]; if(CopyBuffer(hEMA_Light,0,1,1,a)<1) return false; e=a[0]; return true; }
bool RSI1_Light(double &r){ double a[]; if(CopyBuffer(hRSI_Light,0,1,1,a)<1) return false; r=a[0]; return true; }

//==================== Swings / fibs ====================
int EMAFilterBiasStrong(){
   double e=0;
   if(!EMA1_Strong(e)) return 0;
   double c=CloseTF(TF_Strong,1);
   if(c>e) return +1;
   if(c<e) return -1;
   return 0;
}
int EMAFilterBiasMedium(){
   double e=0;
   if(!EMA1_Medium(e)) return 0;
   double c=CloseTF(TF_Medium,1);
   if(c>e) return +1;
   if(c<e) return -1;
   return 0;
}
int EMAFilterBiasLight(){
   double e=0;
   if(!EMA1_Light(e)) return 0;
   double c=CloseTF(TF_Light,1);
   if(c>e) return +1;
   if(c<e) return -1;
   return 0;
}
bool FindSwing(int lb,double &hi,double &lo){
   const double NEG_HUGE = -1.0e100;
   const double POS_HUGE =  1.0e100;
   hi=NEG_HUGE; lo=POS_HUGE;
   int bars=MathMax(lb,10);
   for(int i=1;i<=bars;i++){
      double H=HighTF(TF_Signal,i), L=LowTF(TF_Signal,i);
      if(H==0.0 || L==0.0) continue;
      if(H>hi) hi=H;
      if(L<lo) lo=L;
   }
   return (hi>NEG_HUGE/2.0 && lo<POS_HUGE/2.0 && hi>lo);
}
void FibUp  (double hi,double lo,double &f38,double &f50,double &f61){ f38=hi-0.382*(hi-lo); f50=hi-0.5*(hi-lo); f61=hi-0.618*(hi-lo); }
void FibDown(double hi,double lo,double &f38,double &f50,double &f61){ f38=lo+0.382*(hi-lo); f50=lo+0.5*(hi-lo); f61=lo+0.618*(hi-lo); }
bool Touch(double p,double lv,double tol){ return (MathAbs(p-lv)<=tol); }

//==================== Adaptivity helpers ====================
void ResultsInit(){
   g_resultsRingSize = MathMax(10, 50);
   ArrayResize(g_results, g_resultsRingSize);
   ArrayInitialize(g_results, 0);
   g_resultsHead  = 0;
   g_resultsCount = 0;
}
void ResultsPush(bool win){
   if(g_resultsRingSize<=0) ResultsInit();
   g_results[g_resultsHead] = (uchar)(win ? 1 : 0);
   g_resultsHead = (g_resultsHead + 1) % g_resultsRingSize;
   g_resultsCount = MathMin(g_resultsCount + 1, g_resultsRingSize);
}
double CurrentAccuracy(){
   if(!AI_Adaptive) return 0.5;
   if(g_resultsCount==0) return 0.5;
   int sum=0;
   for(int i=0;i<g_resultsCount;i++) sum += (int)g_results[i];
   return (double)sum / (double)g_resultsCount;
}
double AccuracyGapFactor(double acc){
   if(!AI_Adaptive) return 1.0;
   const double GoodThresh=0.60, BadThresh=0.45, GapTightenFactor=0.70, GapWidenFactor=1.50;
   if(acc>=GoodThresh) return GapTightenFactor;
   if(acc<=BadThresh)  return GapWidenFactor;
   double mid = (GoodThresh+BadThresh)/2.0;
   if(acc==mid) return 1.0;
   if(acc<mid){
      double t = (acc-BadThresh)/MathMax(1e-6,(mid-BadThresh));
      return GapWidenFactor + (1.0-GapWidenFactor)*t;
   }else{
      double t = (acc-mid)/MathMax(1e-6,(GoodThresh-mid));
      return 1.0 + (GapTightenFactor-1.0)*t;
   }
}
int DynamicMaxTrades(double acc){
   if(!AI_Adaptive) return Max_Trades;
   const double MaxTradesBoost=1.50, MaxTradesCut=0.50, GoodThresh=0.60, BadThresh=0.45;
   double factor = 1.0;
   if(acc>=GoodThresh) factor = MaxTradesBoost;
   else if(acc<=BadThresh) factor = MaxTradesCut;
   int cap = (int)MathFloor(Max_Trades * factor);
   return MathMax(1, cap);
}

//==================== Prediction & Gap (Weighted Vote) ====================
int PredictDirection()
{
   int d = EMAFilterBiasStrong(); // M15 vs EMA50
   int f = EMAFilterBiasMedium(); // M5 vs EMA50
   int s = EMAFilterBiasLight();   // M30 vs EMA50

   int score = d*W_Strong + f*W_Medium + s*W_Light;

   if(score > 0) return +1;
   if(score < 0) return -1;

   // Tie-breaker: average RSI from M15 + M5
   double rF=50.0, rS=50.0;
   RSI1_Strong(rF);
   RSI1_Medium(rS);
   double rAvg = (rF + rS) / 2.0;

   if(rAvg > 55.0) return +1;
   if(rAvg < 45.0) return -1;

   // Final fallback: random
   return ((MathRand() % 2) == 0 ? +1 : -1);

}

double DynamicGap()
{
   double gap=Base_Gap_Pips;
   if(!UseDynamicGap) return MathMax(0.1, gap);

   double e0=0,e1=0; bool okE=EMA2_Strong(e0,e1);
   double rF=50.0;   RSI1_Strong(rF);
   double an=0,av=0; ATRnowAvgStrong(an,av);

   double slope = okE ? MathAbs(e0-e1) : 0.0;
   bool strong  = (an>0.0 && av>0.0 && an>av*StrongTrend_ATR_Mult);
   bool pullbk  = (MathAbs(rF-50.0)<=Pullback_RSI_Zone);
   bool range   = (!strong && slope < (g_pipSizePrice*5.0));

   if(strong) gap *= 0.75;
   if(pullbk) gap *= 1.50;
   if(range)  gap *= 2.00;

   double g = MathMin(10000.0, MathMax(0.1, gap));
   double acc = CurrentAccuracy();
   double f   = AccuracyGapFactor(acc);
   return MathMin(10000.0, MathMax(0.1, g*f));
}

bool DistanceOK(bool isBuy,double gap)
{
   MqlTick t; if(!SymbolInfoTick(_Symbol,t)) return false;
   double px = isBuy ? t.ask : t.bid;
   double anchor = isBuy ? lastBuyAnchor : lastSellAnchor;
   if(anchor<=0.0) return true;
   return (MathAbs(px-anchor) >= PipsToPrice(gap));
}

//==================== Risk check (AI-aware) ====================
bool RiskOK()
{
   if(ProfitLimitHit())        return false; // session hit
   if(MaxProfitLimitReached()) return false; // lifetime hit
   if(DrawdownExceeded())      return false;

   double acc = CurrentAccuracy();
   int dynCap = DynamicMaxTrades(acc);
   if(MyOpenTrades() >= dynCap) return false;

   return true;
}

//==================== Trade ops ====================
void DrawArrow(bool isBuy,double price)
{
   if(!ShowDashboard) return;
   string nm = isBuy ? ("VELOX_BUY_"+(string)TimeCurrent())
                     : ("VELOX_SELL_"+(string)TimeCurrent());
   ENUM_OBJECT type  = isBuy ? OBJ_ARROW_BUY : OBJ_ARROW_SELL;
   ObjectCreate(0,nm,type,0,TimeCurrent(),price);
   color col = isBuy ? clrLime : clrTomato;
   ObjectSetInteger(0,nm,OBJPROP_COLOR,col);
}
void LogTradeResult(const string ctx)
{
   uint rc = trade.ResultRetcode();
   if(rc!=10009 && rc!=10008)
      Print(ctx, " failed. retcode=", rc,
            " (", trade.ResultRetcodeDescription(),
            ")  lastErr=", GetLastError());
}

bool OpenBuy()
{
   if(!TradingAllowed() || !GateOK() || ProfitLimitHit() || MaxProfitLimitReached())
      return false;

   double lots=0.0; if(!VolumeOK(lots)) return false;

   MqlTick t; if(!SymbolInfoTick(_Symbol,t)) return false;
   double ask=t.ask;

   double sl=Norm(ask-PipsToPrice(Stop_Loss));
   double tp=Norm(ask+PipsToPrice(Take_Profit));
   BrokerSafeStops(true,ask,sl,tp);

   trade.SetExpertMagicNumber(MagicNumber);
   trade.SetDeviationInPoints(SlippagePoints);

   bool ok = trade.Buy(
   lots,
   _Symbol,
   0,
   sl,
   tp,
   BOT_NAME + " BUY"
);

   if(ok){
      lastBuyAnchor=ask;
      DrawArrow(true, ask);
   } else LogTradeResult("Buy");
   return ok;
}
bool OpenSell()
{
   if(!TradingAllowed() || !GateOK() || ProfitLimitHit() || MaxProfitLimitReached())
      return false;

   double lots=0.0; if(!VolumeOK(lots)) return false;

   MqlTick t; if(!SymbolInfoTick(_Symbol,t)) return false;
   double bid=t.bid;

   double sl=Norm(bid+PipsToPrice(Stop_Loss));
   double tp=Norm(bid-PipsToPrice(Take_Profit));
   BrokerSafeStops(false,bid,sl,tp);

   trade.SetExpertMagicNumber(MagicNumber);
   trade.SetDeviationInPoints(SlippagePoints);

   bool ok = trade.Sell(
   lots,
   _Symbol,
   0,
   sl,
   tp,
   BOT_NAME + " SELL"
);

   if(ok){
      lastSellAnchor=bid;
      DrawArrow(false, bid);
   } else LogTradeResult("Sell");
   return ok;
}

//==================== Trailing per ticket ====================
bool ModifySLTP(ulong ticket, double newSL, double newTP)
{
   MqlTradeRequest req; MqlTradeResult res; ZeroMemory(req); ZeroMemory(res);
   req.action   = TRADE_ACTION_SLTP;
   req.position = ticket;
   req.symbol   = _Symbol;
   req.sl       = newSL;
   req.tp       = newTP;
   req.magic    = MagicNumber;

   long fill=(long)SymbolInfoInteger(_Symbol, SYMBOL_FILLING_MODE);
   if(fill==SYMBOL_FILLING_FOK)      req.type_filling=ORDER_FILLING_FOK;
   else if(fill==SYMBOL_FILLING_IOC) req.type_filling=ORDER_FILLING_IOC;
   else                              req.type_filling=ORDER_FILLING_RETURN;

   bool ok=OrderSend(req,res);
   if(!ok || (res.retcode!=10009 && res.retcode!=10008))
      Print("SLTP modify failed ticket=",ticket," ret=",res.retcode," lastErr=",GetLastError());
   return ok;
}
void Trailing()
{
   if(!Use_Trailing_Stop) return;

   double trail = PipsToPrice(Trail_Stop_Pips);
   double step  = PipsToPrice(Trail_Step_Pips);

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(!PositionSelectByTicket(ticket))
         continue;

      // Only manage this EA's positions on this symbol
      long   magic  = PositionGetInteger(POSITION_MAGIC);
      string symbol = PositionGetString(POSITION_SYMBOL);
      if(magic != MagicNumber || symbol != _Symbol)
         continue;

      long   type = PositionGetInteger(POSITION_TYPE);
      double open = PositionGetDouble(POSITION_PRICE_OPEN);
      double sl   = PositionGetDouble(POSITION_SL);
      double tp   = PositionGetDouble(POSITION_TP);

      MqlTick tick;
      if(!SymbolInfoTick(_Symbol, tick))
         continue;

      double price = (type == POSITION_TYPE_BUY ? tick.bid : tick.ask);

      if(type == POSITION_TYPE_BUY)
      {
         double newSL = price - trail;

         if(((sl == 0.0) || (newSL > sl + step)) && ((price - open) > trail))
            ModifySLTP(ticket, Norm(newSL), tp);
      }
      else if(type == POSITION_TYPE_SELL)
      {
         double newSL = price + trail;

         if(((sl == 0.0) || (newSL < sl - step)) && ((open - price) > trail))
            ModifySLTP(ticket, Norm(newSL), tp);
      }
   }
}


//==================== Strategy gates (optional fibs, not wired into core loop) ====================
void PutHL(const string name,double price,color c)
{
   if(ObjectFind(0,name)==-1)
      ObjectCreate(0,name,OBJ_HLINE,0,0,price);
   ObjectSetDouble(0,name,OBJPROP_PRICE,price);
   ObjectSetInteger(0,name,OBJPROP_COLOR,c);
}
void DrawFibs(bool bull,double f38,double f50,double f61)
{
   if(!ShowDashboard) return;
   string p=bull?"B":"S";
   PutHL("VELOX_F38_"+p,f38,bull?clrDodgerBlue:clrTomato);
   PutHL("VELOX_F50_"+p,f50,bull?clrRoyalBlue:clrOrangeRed);
   PutHL("VELOX_F61_"+p,f61,bull?clrBlue:clrFireBrick);
}

//==================== Lifecycle ====================
int OnInit()
{
   g_digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
   g_point  = SymbolInfoDouble(_Symbol, SYMBOL_POINT);

   // Dynamic pip size: for gold, 1 pip = $0.10 price movement.
   // 2-digit quotes (e.g. 3300.12, point=0.01) -> 10 * point = 0.10
   // 3-digit quotes (e.g. 3300.123, point=0.001) -> 100 * point = 0.10
   // Formula: pip = point * 10^(digits-1) capped to give 0.10 equivalent
   if(g_digits <= 2)
      g_pipSizePrice = g_point * 10.0;
   else
      g_pipSizePrice = g_point * 100.0;

   Print("VELOX: Symbol=", _Symbol, " Digits=", g_digits, " Point=",
         DoubleToString(g_point, g_digits+1),
         " PipSize=", DoubleToString(g_pipSizePrice, 4));

   long fill=(long)SymbolInfoInteger(_Symbol,SYMBOL_FILLING_MODE);
   if(fill==SYMBOL_FILLING_FOK)      trade.SetTypeFilling(ORDER_FILLING_FOK);
   else if(fill==SYMBOL_FILLING_IOC) trade.SetTypeFilling(ORDER_FILLING_IOC);
   else                              trade.SetTypeFilling(ORDER_FILLING_RETURN);
   trade.SetAsyncMode(false);

   trade.SetExpertMagicNumber(MagicNumber);
   trade.SetDeviationInPoints(SlippagePoints);

   // Indicators
   hEMA_Strong = iMA(_Symbol,TF_Strong,EMA_Filter_Period,0,MODE_EMA,PRICE_CLOSE);
   hRSI_Strong = iRSI(_Symbol,TF_Strong,RSI_Period,PRICE_CLOSE);
   hATR_Strong = iATR(_Symbol,TF_Strong,ATR_Period);

   hEMA_Medium = iMA(_Symbol,TF_Medium,EMA_Filter_Period,0,MODE_EMA,PRICE_CLOSE);
   hRSI_Medium = iRSI(_Symbol,TF_Medium,RSI_Period,PRICE_CLOSE);
   hEMA_Light  = iMA(_Symbol,TF_Light,EMA_Filter_Period,0,MODE_EMA,PRICE_CLOSE);
   hRSI_Light  = iRSI(_Symbol,TF_Light,RSI_Period,PRICE_CLOSE);

   if(hEMA_Strong==INVALID_HANDLE || hRSI_Strong==INVALID_HANDLE || hATR_Strong==INVALID_HANDLE ||
      hEMA_Medium==INVALID_HANDLE || hRSI_Medium==INVALID_HANDLE ||
      hEMA_Light==INVALID_HANDLE || hRSI_Light==INVALID_HANDLE)
   {
      Print("Indicator init failed");
      return INIT_FAILED;
   }

   ArrayResize(gTickets,0);
   g_didImmediate        = false;
   lastOrderMS           = 0;
   lastBuyAnchor         = 0.0;
   lastSellAnchor        = 0.0;
   g_currentRoundDir     = 0;
   g_roundStart          = 0;

   ResultsInit();
   gDirsByTicketCount    = 0;
   ArrayResize(gDirsTickets,0);
   ArrayResize(gDirsDir,0);

   // Session anchor
  // Session anchor
   g_startEquity         = AccountInfoDouble(ACCOUNT_EQUITY);
   g_profitTargetHit     = false;
   g_drawdownHit         = false;


   // Lifetime EA profit snapshot
   UpdateMaxProfitTracker();

   Print("VELOX SCALPER (XAU) V4.7 ready on ",_Symbol,
         " Lot=",DoubleToString(Lot_Size,2),
         " BaseGap=",DoubleToString(Base_Gap_Pips,1),"p TP=",Take_Profit,"p SL=",Stop_Loss,"p",
         " AI=", (AI_Adaptive?"ON":"OFF"),
         " PT(Session)=", DoubleToString(Profit_Target_Amount,2),
         " MaxP(Lifetime)=",
         (Use_Max_Profit_Limit?DoubleToString(Max_Profit_Limit,2):"OFF"),
         " EA_Profit_So_Far=", DoubleToString(g_totalProfitSoFar,2));
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   UpdateMaxProfitTracker();

   if(ShowDashboard){
      string names[]={
         // New VX_* dashboard objects
         "VX_BG","VX_TITLE","VX_SYMBOL","VX_LOT",
         "VX_S1","VX_STATUS_V",
         "VX_DIR_L","VX_DIR_V","VX_OPN_L","VX_OPN_V",
         "VX_S2","VX_ACHDR","VX_ACTYP","VX_ACLGN",
         "VX_BAL_L","VX_BAL_V","VX_EQ_L","VX_EQ_V",
         "VX_MG_L","VX_MG_V","VX_FM_L","VX_FM_V",
         "VX_FLT_L","VX_FLT_V",
         "VX_S3","VX_CFHDR",
         "VX_GAP_L","VX_GAP_V","VX_DYN_L","VX_DYN_V",
         "VX_AI_L","VX_AI_V",
         "VX_S4","VX_MPHDR","VX_MP_V",
         "VX_S5","VX_FOOT",
         // Legacy fib objects (DrawFibs)
         "VELOX_F38_B","VELOX_F50_B","VELOX_F61_B",
         "VELOX_F38_S","VELOX_F50_S","VELOX_F61_S"
      };
      for(int i=0;i<ArraySize(names);i++)
         if(ObjectFind(0,names[i])!=-1)
            ObjectDelete(0,names[i]);
   }
   Comment("");
}

//==================== Main ====================
void OnTick()
{
   // Manage existing positions (trailing)
   Trailing();

   // Hard profit stops: if either is hit, skip all trading logic
   if(ProfitLimitHit() || MaxProfitLimitReached()){
      UpdateMaxProfitTracker();
      UpdateDashboard();
      return;
   }

   // Immediate single shot on attach
   if(OpenImmediatelyOnAttach && !g_didImmediate && RiskOK() && ThrottleOK()){
      if(Direction==SingleRound){
         g_currentRoundDir = PredictDirection();
         g_roundStart = TimeCurrent();
         if(g_currentRoundDir>0) OpenBuy(); else OpenSell();
      }else if(Direction==Duel){
         int d=PredictDirection();
         if(d>0) OpenBuy(); else OpenSell();
      }else if(Direction==OnlyBuy){
         OpenBuy();
      }else if(Direction==OnlySell){
         OpenSell();
      }
      g_didImmediate=true;
   }

   if(!ContinuousEntries && !UseDynamicGap){
      UpdateMaxProfitTracker();
      UpdateDashboard();
      return;
   }

   if(!RiskOK() || !ThrottleOK()){
      UpdateMaxProfitTracker();
      UpdateDashboard();
      return;
   }

   double gap = DynamicGap();

   // Decide direction for this cycle (weighted vote)
   int cycleDir=0;
   if(Direction==SingleRound){
      if(g_currentRoundDir==0){
         g_currentRoundDir = PredictDirection();
         g_roundStart = TimeCurrent();
      }
      cycleDir=g_currentRoundDir;
   }else if(Direction==Duel){
      cycleDir=PredictDirection();
   }else if(Direction==OnlyBuy){
      cycleDir=+1;
   }else if(Direction==OnlySell){
      cycleDir=-1;
   }

   // Order logic (direction + gap based)
   if(Direction==SingleRound){
      if(cycleDir>0 && DistanceOK(true, gap))   OpenBuy();
      if(cycleDir<0 && DistanceOK(false,gap))   OpenSell();
   }else if(Direction==Duel){
      if(DistanceOK(true, gap))                 OpenBuy();
      if(DistanceOK(false,gap))                 OpenSell();
   }else if(Direction==OnlyBuy){
      if(DistanceOK(true, gap))                 OpenBuy();
   }else if(Direction==OnlySell){
      if(DistanceOK(false,gap))                 OpenSell();
   }

   UpdateMaxProfitTracker();
   UpdateDashboard();
}

//==================== Dashboard ====================
void PutLabel(const string name,const int y,const string txt,const int sz,const color col,int x=16)
{
   if(ObjectFind(0,name)==-1)
      ObjectCreate(0,name,OBJ_LABEL,0,0,0);
   ObjectSetInteger(0,name,OBJPROP_CORNER,    CORNER_LEFT_UPPER);
   ObjectSetInteger(0,name,OBJPROP_XDISTANCE, x);
   ObjectSetInteger(0,name,OBJPROP_YDISTANCE, y);
   ObjectSetInteger(0,name,OBJPROP_COLOR,     col);
   ObjectSetString (0,name,OBJPROP_TEXT,      txt);
   ObjectSetString (0,name,OBJPROP_FONT,      "Consolas");
   ObjectSetInteger(0,name,OBJPROP_FONTSIZE,  sz);
   ObjectSetInteger(0,name,OBJPROP_SELECTABLE,false);
}

void UpdateDashboard()
{
   if(!ShowDashboard) return;

   int sc = MathMax(1, UI_Scale);   // 1 = normal, 2 = Mac Retina / HiDPI

   // ── Gather live data ─────────────────────────────────────────
   double gap      = DynamicGap();
   long   acc_login= (long)AccountInfoInteger(ACCOUNT_LOGIN);
   long   acc_mode = (long)AccountInfoInteger(ACCOUNT_TRADE_MODE);
   string acc_type = (acc_mode == ACCOUNT_TRADE_MODE_REAL ? "REAL" : "REAL");

   double bal = AccountInfoDouble(ACCOUNT_BALANCE);
   double eq  = AccountInfoDouble(ACCOUNT_EQUITY);
   double mg  = AccountInfoDouble(ACCOUNT_MARGIN);
   double fm  = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   double flt = eq - bal;

   int openNow = (int)MyOpenTrades();
   int dynCap  = (AI_Adaptive ? DynamicMaxTrades(CurrentAccuracy()) : Max_Trades);

   // Direction — respect Direction mode, then fall back to g_currentRoundDir
   string roundTxt;
   color  roundCol;
   if(Direction == OnlyBuy)        { roundTxt = "BUY  ▲"; roundCol = (color)0x00DD55; }
   else if(Direction == OnlySell)  { roundTxt = "SELL ▼"; roundCol = (color)0xFF4433; }
   else if(g_currentRoundDir > 0)  { roundTxt = "BUY  ▲"; roundCol = (color)0x00DD55; }
   else if(g_currentRoundDir < 0)  { roundTxt = "SELL ▼"; roundCol = (color)0xFF4433; }
   else                            { roundTxt = "  —";    roundCol = (color)0x888888; }

   // Status
   string statusTxt = "●  RUNNING";
   color  statusCol = (color)0x00CC44;
   if(g_profitTargetHit)   { statusTxt = "●  PROFIT TARGET HIT";  statusCol = clrGold; }
   if(g_maxProfitLimitHit) { statusTxt = "●  MAX PROFIT HIT";     statusCol = clrGold; }
   if(g_drawdownHit)       { statusTxt = "●  DRAWDOWN HIT";       statusCol = (color)0xFF3322; }

   // ── Scale-aware constants (all in pixels) ────────────────────
   const int PNL_X = 8   * sc;
   const int PNL_Y = 8   * sc;
   // Panel width: wider at sc=2 so right-column text has room
   const int PNL_W = (sc == 1) ? 410 : 500 * sc;
   const int XL    = 14  * sc;   // left label x
   const int XV    = 120 * sc;   // left value x
   const int XR    = (sc == 1) ? 218 : 210 * sc;   // right label x
   const int XRV   = (sc == 1) ? 318 : 310 * sc;   // right value x

   // Font sizes — at sc=2 use ~1.3x base (NOT 2x) to prevent text overflow on Mac
   const int FS_T  = (sc == 1) ? 13 : 17;   // title
   const int FS_H  = (sc == 1) ?  9 : 11;   // section header / label
   const int FS_B  = (sc == 1) ? 10 : 13;   // body value
   const int FS_S  = (sc == 1) ?  8 :  9;   // separator

   const int ROW   = 22 * sc;   // row height
   const int SEC   = 28 * sc;   // section gap
   const int TPAD  = 16 * sc;   // top padding
   const int BPAD  = 22 * sc;   // bottom padding


   // Palette — named constants are platform-safe (correct on Windows & Mac MT5)
   const color C_GOLD  = clrGold;           // Gold  (255,215,0)
   const color C_GDIM  = clrDarkGoldenrod;  // Dim gold (184,134,11)
   const color C_WHITE = (color)0xEEEEEE;   // Off-white — symmetric, safe
   const color C_GRAY  = (color)0x888888;   // Mid gray  — symmetric, safe
   const color C_DIM   = (color)0x383838;   // Dark gray — symmetric, safe
   const color C_BG    = (color)0x0C0C0C;   // Near black— symmetric, safe
   const color C_BDR   = clrSaddleBrown;    // Dark brown border
   const color C_GRN   = clrLimeGreen;      // Green  (50,205,50)
   const color C_RED   = clrTomato;         // Red    (255,99,71)
   const color C_CYAN  = clrDeepSkyBlue;    // Cyan   (0,191,255)
   const color C_ORG   = clrOrange;         // Orange (255,165,0)

   // ── Panel background ─────────────────────────────────────────
   string bg = "VX_BG";
   if(ObjectFind(0,bg)==-1)
   {
      ObjectCreate(0,bg,OBJ_RECTANGLE_LABEL,0,0,0);
      ObjectSetInteger(0,bg,OBJPROP_CORNER,     CORNER_LEFT_UPPER);
      ObjectSetInteger(0,bg,OBJPROP_BGCOLOR,    C_BG);
      ObjectSetInteger(0,bg,OBJPROP_COLOR,      C_BDR);
      ObjectSetInteger(0,bg,OBJPROP_BORDER_TYPE,BORDER_FLAT);
      ObjectSetInteger(0,bg,OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0,bg,OBJPROP_BACK,       false);
   }
   // Position and width updated every tick (supports UI_Scale changes)
   ObjectSetInteger(0,bg,OBJPROP_XDISTANCE, PNL_X);
   ObjectSetInteger(0,bg,OBJPROP_YDISTANCE, PNL_Y);
   ObjectSetInteger(0,bg,OBJPROP_XSIZE,     PNL_W);
   // Height is set precisely at the END of this function — do NOT set it here


   // ── Y cursor ─────────────────────────────────────────────────
   int y = PNL_Y + TPAD;

   // ════ TITLE ══════════════════════════════════════════════════
   PutLabel("VX_TITLE",  y, "◆  VELOX SCALPER  XAU  V5.1", FS_T, C_CYAN, XL);
   y += ROW + 4*sc;
   PutLabel("VX_SYMBOL", y, _Symbol, FS_B, C_GOLD, XL);
   PutLabel("VX_LOT",    y, "Lot: 0.01", FS_B, C_GRAY, XRV);
   y += ROW;
   PutLabel("VX_S1",     y, "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", FS_S, C_DIM, XL);
   y += ROW;

   // ════ STATUS / DIRECTION ═════════════════════════════════════
   PutLabel("VX_STATUS_V",y, statusTxt, FS_B, statusCol, XL);
   y += ROW;
   PutLabel("VX_DIR_L",  y, "Direction :", FS_H, C_GOLD, XL);
   PutLabel("VX_DIR_V",  y, roundTxt, FS_B, roundCol, XV);
   PutLabel("VX_OPN_L",  y, "Positions :", FS_H, C_GOLD, XR);
   PutLabel("VX_OPN_V",  y, (string)openNow+" / "+(string)dynCap, FS_B, C_WHITE, XRV);
   y += SEC;

   // ════ ACCOUNT ════════════════════════════════════════════════
   PutLabel("VX_S2",     y, "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", FS_S, C_DIM, XL);
   y += ROW;
   color accTC = (acc_mode == 2 ? C_GOLD : C_GOLD);
   string acc_type_disp = (acc_mode == 2 ? "REAL" : "REAL");
   PutLabel("VX_ACHDR",  y, "ACCOUNT",       FS_H, C_CYAN, XL);
   PutLabel("VX_ACTYP",  y, acc_type_disp,   FS_B, accTC,  XV);
   PutLabel("VX_ACLGN",  y, "ID: "+(string)acc_login, FS_H, C_CYAN, XR);
   y += ROW;
   PutLabel("VX_BAL_L",  y, "Balance  :", FS_H, C_GOLD, XL);
   PutLabel("VX_BAL_V",  y, "$"+DoubleToString(bal,2), FS_B, C_WHITE, XV);
   PutLabel("VX_EQ_L",   y, "Equity   :", FS_H, C_GOLD, XR);
   PutLabel("VX_EQ_V",   y, "$"+DoubleToString(eq,2),  FS_B, C_WHITE, XRV);
   y += ROW;
   PutLabel("VX_MG_L",   y, "Margin   :", FS_H, C_GOLD, XL);
   PutLabel("VX_MG_V",   y, "$"+DoubleToString(mg,2),  FS_B, C_WHITE, XV);
   PutLabel("VX_FM_L",   y, "Free Mrg :", FS_H, C_GOLD, XR);
   PutLabel("VX_FM_V",   y, "$"+DoubleToString(fm,2),  FS_B, C_WHITE, XRV);
   y += ROW;
   string fltSign  = (flt >= 0.0 ? "+" : "");
   color  fltCol   = (flt >= 0.0 ? C_GRN : C_RED);
   string fltArrow = (flt >= 0.0 ? "  ▲" : "  ▼");
   PutLabel("VX_FLT_L",  y, "Float P/L:", FS_H, C_GOLD, XL);
   PutLabel("VX_FLT_V",  y, fltSign+DoubleToString(flt,2)+fltArrow, FS_B, fltCol, XV);
   y += SEC;

   // ════ SETTINGS ═══════════════════════════════════════════════
   PutLabel("VX_S3",     y, "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", FS_S, C_DIM, XL);
   y += ROW;
   PutLabel("VX_CFHDR",  y, "SETTINGS", FS_H, C_CYAN, XL);
   y += ROW;
   color dynC = (UseDynamicGap ? C_GRN : C_GOLD);
   PutLabel("VX_GAP_L",  y, "Gap      :", FS_H, C_GOLD, XL);
   PutLabel("VX_GAP_V",  y, DoubleToString(gap,1)+" p", FS_B, C_WHITE, XV);
   PutLabel("VX_DYN_L",  y, "Dynamic  :", FS_H, C_GOLD, XR);
   PutLabel("VX_DYN_V",  y, (UseDynamicGap?"ON":"OFF"), FS_B, dynC, XRV);
   y += ROW;
   PutLabel("VX_AI_L",   y, "AI Adapt :", FS_H, C_GOLD, XL);
   PutLabel("VX_AI_V",   y, (AI_Adaptive?"ON":"OFF"), FS_B, C_WHITE, XV);
   y += SEC;

   // ════ LIFETIME PROFIT ════════════════════════════════════════
   if(Use_Max_Profit_Limit && Max_Profit_Limit > 0.0)
   {
      PutLabel("VX_S4",   y, "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", FS_S, C_DIM, XL);
      y += ROW;
      double pct    = MathMin(100.0, MathMax(0.0, g_totalProfitSoFar / Max_Profit_Limit * 100.0));
      color  pctCol = (g_maxProfitLimitHit ? clrGold : (pct > 75.0 ? C_ORG : C_GRN));
      PutLabel("VX_MPHDR",y, "LIFETIME EA PROFIT", FS_H, C_GDIM, XL);
      y += ROW;
      PutLabel("VX_MP_V", y,
               "$"+DoubleToString(g_totalProfitSoFar,2)+
               "  /  $"+DoubleToString(Max_Profit_Limit,2)+
               "  ["+DoubleToString(pct,1)+"%]",
               FS_B, pctCol, XL);
      y += SEC;
   }

   // ════ FOOTER ═════════════════════════════════════════════════
   PutLabel("VX_S5",   y, "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", FS_S, C_DIM, XL);
   y += ROW - 2*sc;
   //PutLabel("VX_FOOT", y, "Magic #"+(string)MagicNumber+"   |   VELOX ANTIGRAVITY", MathMax(7,FS_H - sc), C_DIM, XL);
   y += ROW;

   // ── Fit panel height to content ───────────────────────────────
   ObjectSetInteger(0,bg,OBJPROP_YSIZE,(y - PNL_Y) + BPAD);
   Comment("");
}


