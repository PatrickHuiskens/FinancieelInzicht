import React, { useState, useEffect } from 'react';
import { ArrowDownCircle, TrendingDown, Sparkles, TrendingUp, Calendar, CheckCircle, AlertTriangle, Scale, FileText, Copy } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { getFinancialAdvice } from '../../services/geminiService';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { AppMode } from '../../types';

interface AflosToolProps {
  appMode?: AppMode;
}

// --- Debt Strategy Types ---
interface DebtItem {
  id: string;
  creditor: string;
  totalAmount: number;
  interestRate: number;
  monthlyPayment: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
};

const AflosTool: React.FC<AflosToolProps> = ({ appMode = 'standard' }) => {
  // --- Standard Mode State (Mortgage) ---
  const [hypotheekBedrag, setHypotheekBedrag] = useState<number>(300000);
  const [rente, setRente] = useState<number>(4.0);
  const [resterendeLooptijd, setResterendeLooptijd] = useState<number>(25);
  const [extraAflossing, setExtraAflossing] = useState<number>(250);
  const [besparing, setBesparing] = useState<number>(0);
  const [nieuweLooptijd, setNieuweLooptijd] = useState<number>(0);

  // --- Debt Mode State ---
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(500); 
  const [projectionData, setProjectionData] = useState<any[]>([]);
  const [debtFreeDate, setDebtFreeDate] = useState<string>('');
  const [totalInterestPaid, setTotalInterestPaid] = useState<number>(0);
  
  // USP: Sanering Simulator
  const [showSanering, setShowSanering] = useState<boolean>(false);
  const [saneringsPercentage, setSaneringsPercentage] = useState<number>(0);
  const [afkoopSom, setAfkoopSom] = useState<number>(0);

  // USP: Proposal Generator
  const [showProposal, setShowProposal] = useState<boolean>(false);
  const [proposalText, setProposalText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // --- Shared State ---
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    if (appMode === 'standard') {
      calculateMortgage();
    } else {
      loadDebtsAndCalculate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appMode, hypotheekBedrag, rente, resterendeLooptijd, extraAflossing, monthlyBudget]);

  // --- Standard Mode Logic ---
  const calculateMortgage = () => {
    const r = rente / 100 / 12;
    const n = resterendeLooptijd * 12;
    const maandLast = hypotheekBedrag * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totaalTeBetalenNormaal = maandLast * n;
    
    const nieuweMaandLast = maandLast + extraAflossing;
    // N = -log(1 - (r*P)/A) / log(1+r)
    if (nieuweMaandLast <= hypotheekBedrag * r) {
        setBesparing(0);
        setNieuweLooptijd(99); 
        return;
    }

    const n_nieuw = -Math.log(1 - (r * hypotheekBedrag) / nieuweMaandLast) / Math.log(1 + r);
    const totaalTeBetalenNieuw = nieuweMaandLast * n_nieuw;
    
    setBesparing(Math.max(0, totaalTeBetalenNormaal - totaalTeBetalenNieuw));
    setNieuweLooptijd(n_nieuw / 12);
  };

  // --- Debt Mode Logic ---
  const loadDebtsAndCalculate = () => {
    const saved = localStorage.getItem('debtsData');
    let loadedDebts: DebtItem[] = [];

    if (saved) {
      loadedDebts = JSON.parse(saved);
    } else {
      // Fallback defaults if empty so the chart works immediately for demo purposes if nothing saved
      loadedDebts = [
         { id: '1', creditor: 'Wehkamp Krediet', totalAmount: 1850.50, interestRate: 14.0, monthlyPayment: 45.00 },
         { id: '2', creditor: 'CJIB', totalAmount: 340.00, interestRate: 0, monthlyPayment: 50.00 },
         { id: '3', creditor: 'Dienst Toeslagen', totalAmount: 850.00, interestRate: 4.0, monthlyPayment: 100.00 },
         { id: '4', creditor: 'Roodstand', totalAmount: 1200.00, interestRate: 12.5, monthlyPayment: 50.00 }
      ];
    }
    setDebts(loadedDebts);

    const totalDebt = loadedDebts.reduce((sum, d) => sum + d.totalAmount, 0);

    // If no debt, clear everything
    if (totalDebt <= 0) {
      setProjectionData([]);
      setDebtFreeDate('Schuldenvrij');
      setTotalInterestPaid(0);
      setSaneringsPercentage(0);
      setAfkoopSom(0);
      return;
    }

    // Sanerings berekening (36 maanden x afloscapaciteit)
    const saneringsPot = monthlyBudget * 36;
    setAfkoopSom(saneringsPot);
    setSaneringsPercentage((saneringsPot / totalDebt) * 100);

    // Projection Logic (Strict Budget Simulation)
    let currentDebts = loadedDebts.map(d => ({...d}));
    let month = 0;
    let totalInterest = 0;
    const chartData = [];
    const maxMonths = 360; 

    let totalBalance = totalDebt;
    const initialBalance = totalBalance;
    chartData.push({ month: 0, balance: Math.round(totalBalance) });

    while (totalBalance > 0 && month < maxMonths) {
      month++;
      let monthlyAvailable = monthlyBudget;
      
      // 1. Add Interest
      currentDebts.forEach(debt => {
        if (debt.totalAmount > 0) {
            const interest = (debt.totalAmount * (debt.interestRate / 100)) / 12;
            totalInterest += interest;
            debt.totalAmount += interest;
        }
      });

      // 2. Pay Minimums (Strictly limited by monthlyAvailable)
      for (let debt of currentDebts) {
          if (debt.totalAmount > 0 && monthlyAvailable > 0) {
              const payment = Math.min(debt.totalAmount, debt.monthlyPayment, monthlyAvailable);
              debt.totalAmount -= payment;
              monthlyAvailable -= payment;
          }
      }

      // 3. Pay Extra (Avalanche - Highest Interest First)
      if (monthlyAvailable > 0) {
          const debtsToSort = currentDebts.filter(d => d.totalAmount > 0);
          debtsToSort.sort((a, b) => b.interestRate - a.interestRate);
          
          for (let debt of debtsToSort) {
              const extra = Math.min(debt.totalAmount, monthlyAvailable);
              debt.totalAmount -= extra;
              monthlyAvailable -= extra;
              if (monthlyAvailable <= 0) break;
          }
      }

      totalBalance = currentDebts.reduce((sum, d) => sum + (d.totalAmount > 0.01 ? d.totalAmount : 0), 0);
      
      // Safety break
      if (totalBalance > initialBalance * 2) {
          chartData.push({ month, balance: Math.round(totalBalance) });
          break;
      }
      
      chartData.push({ month, balance: Math.round(totalBalance) });
    }

    setProjectionData(chartData);
    setTotalInterestPaid(totalInterest);
    
    const today = new Date();
    today.setMonth(today.getMonth() + month);
    setDebtFreeDate(month >= maxMonths && totalBalance > 0 ? '> 30 jaar' : new Intl.DateTimeFormat('nl-NL', { month: 'long', year: 'numeric' }).format(today));
  };

  const generateProposal = () => {
    const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
    const percentage = (monthlyBudget * 36 / totalDebt) * 100;
    
    const text = `Betreft: Voorstel tegen finale kwijting inzake dossier [Dossiernummer]

Geachte heer/mevrouw,

Namens mijn cliënt, [Naam Cliënt], doe ik u hierbij een betalingsvoorstel ter afwikkeling van de openstaande vordering(en).

Op basis van de berekende afloscapaciteit kan cliënt een bedrag van ${formatCurrency(monthlyBudget)} per maand reserveren voor de gezamenlijke schuldeisers. Wij stellen voor om dit bedrag gedurende 36 maanden aan te wenden voor een minnelijke schuldenregeling (MSNP).

**Het voorstel luidt als volgt:**
U ontvangt een uitkering van ${percentage.toFixed(2)}% van uw vordering tegen finale kwijting van het restant.

Totale vordering: ${formatCurrency(totalDebt)}
Aangeboden afkoopsom (totaal): ${formatCurrency(monthlyBudget * 36)}

Graag verneem ik binnen 14 dagen of u akkoord gaat met dit voorstel, zodat wij de betalingen in gang kunnen zetten.

Met vriendelijke groet,

[Uw Naam/Organisatie]`;
    setProposalText(text);
    setShowProposal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAiAdvice = async () => {
    setLoadingAi(true);
    let context = '';
    let prompt = '';

    if (appMode === 'standard') {
        context = `Extra aflossen hypotheek: Huidige schuld €${hypotheekBedrag}, Rente ${rente}%, Extra €${extraAflossing}/mnd. Besparing: €${besparing.toFixed(0)}.`;
        prompt = "Is het slim om extra af te lossen of kan ik beter beleggen?";
    } else {
        const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
        context = `Schuldsanering Scenario: Totale schuld €${totalDebt}, Beschikbaar aflosbudget €${monthlyBudget}/mnd. Geschatte datum schuldenvrij: ${debtFreeDate}. Totale rente te betalen: €${totalInterestPaid.toFixed(0)}. Sanering percentage: ${saneringsPercentage.toFixed(1)}%.`;
        prompt = "Vergelijk het reguliere aflostraject met een saneringstraject (MSNP). Welke optie is strategisch beter voor de cliënt en waarom?";
    }

    const advice = await getFinancialAdvice(context, prompt);
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  // --- RENDER STANDARD MODE (Mortgage) ---
  if (appMode === 'standard') {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <ArrowDownCircle className="w-5 h-5 mr-2 text-blue-600" />
            Huidige hypotheek
            </h2>
            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Openstaande schuld</label>
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500">€</span>
                </div>
                <input 
                    type="number" 
                    value={hypotheekBedrag || ''} 
                    onChange={(e) => setHypotheekBedrag(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0"
                />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rente (%)</label>
                <input 
                type="number" 
                step="0.1" 
                value={rente || ''} 
                onChange={(e) => setRente(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resterende looptijd (jaren)</label>
                <input 
                type="number" 
                value={resterendeLooptijd || ''} 
                onChange={(e) => setResterendeLooptijd(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
                />
            </div>
            <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-1">Extra aflossing per maand</label>
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500">€</span>
                </div>
                <input 
                    type="number" 
                    value={extraAflossing || ''} 
                    onChange={(e) => setExtraAflossing(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    placeholder="0"
                />
                </div>
            </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <TrendingDown className="w-5 h-5 mr-2 text-green-600" />
                Resultaat extra aflossen
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="text-xs text-green-800 uppercase font-bold mb-1">Totale besparing</div>
                <div className="text-xl font-bold text-green-700">€ {besparing.toLocaleString('nl-NL', {maximumFractionDigits: 0})}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-xs text-blue-800 uppercase font-bold mb-1">Nieuwe looptijd</div>
                <div className="text-xl font-bold text-blue-700">{nieuweLooptijd.toFixed(1)} jaar</div>
                <div className="text-xs text-blue-500">(-{(resterendeLooptijd - nieuweLooptijd).toFixed(1)} jaar)</div>
                </div>
            </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold text-indigo-900 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                AI advies
                </h3>
                <button
                onClick={handleAiAdvice}
                disabled={loadingAi}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                {loadingAi ? 'Analyseren...' : 'Vraag advies'}
                </button>
            </div>
            
            {aiAdvice ? (
                <div className="bg-white/50 rounded-lg p-2 max-h-60 overflow-y-auto custom-scrollbar">
                <MarkdownRenderer content={aiAdvice} />
                </div>
            ) : (
                <p className="text-sm text-indigo-400 italic">
                Klik op de knop om te zien of extra aflossen verstandig is in jouw situatie.
                </p>
            )}
            </div>
        </div>
        </div>
    );
  }

  // --- RENDER DEBT COUNSELING MODE ---
  const minRequired = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Control Panel */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit space-y-6">
                
                {/* 1. Capaciteit */}
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                      Afbetalingscapaciteit
                  </h2>

                  <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-slate-600">Minimale verplichting</span>
                              <span className="font-semibold text-slate-800">{formatCurrency(minRequired)}</span>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                              Beschikbaar maandbudget
                          </label>
                          <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-slate-500">€</span>
                              </div>
                              <input 
                                  type="number" 
                                  value={monthlyBudget || ''} 
                                  onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)} 
                                  className="w-full pl-7 pr-3 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none text-lg font-bold"
                              />
                          </div>
                          {monthlyBudget >= minRequired ? (
                              monthlyBudget > minRequired && (
                                  <p className="text-xs text-green-600 mt-2 flex items-center">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      {formatCurrency(monthlyBudget - minRequired)} extra aflossing
                                  </p>
                              )
                          ) : (
                              <p className="text-xs text-red-500 mt-2 flex items-center">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Tekort: {formatCurrency(minRequired - monthlyBudget)} onder minimum!
                              </p>
                          )}
                      </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* 2. Sanering Toggle (USP) */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center">
                        <Scale className="w-4 h-4 mr-2 text-indigo-600" />
                        Saneringssimulator (MSNP)
                    </h2>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={showSanering} onChange={() => setShowSanering(!showSanering)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  
                  {showSanering && (
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                       <div className="flex justify-between items-center text-sm mb-2">
                         <span className="text-indigo-800">Afkoopsom (36 mnd)</span>
                         <span className="font-bold text-indigo-900">{formatCurrency(afkoopSom)}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm mb-3">
                         <span className="text-indigo-800">Uitkering aan eisers</span>
                         <span className="font-bold text-indigo-900">{saneringsPercentage.toFixed(1)}%</span>
                       </div>
                       <div className="h-2 bg-indigo-200 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, saneringsPercentage)}%` }}></div>
                       </div>
                       <p className="text-xs text-indigo-600 mt-2">
                         *Schuldeisers ontvangen {saneringsPercentage.toFixed(1)}% van hun vordering tegen finale kwijting.
                       </p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={generateProposal}
                  className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-sm flex items-center justify-center transition-colors shadow-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Genereer conceptbrief
                </button>
            </div>

            {/* Chart & Results Area */}
            <div className="lg:col-span-2 space-y-6">
                 
                 {/* Proposal Modal / Area */}
                 {showProposal && (
                   <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 relative animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                        <h3 className="font-bold text-slate-800 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                          Betalingsvoorstel (MSNP)
                        </h3>
                        <button onClick={() => setShowProposal(false)} className="text-slate-400 hover:text-slate-600"><span className="text-xl">&times;</span></button>
                      </div>
                      <textarea 
                        className="w-full h-64 p-4 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-slate-700"
                        value={proposalText}
                        readOnly
                      />
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={copyToClipboard}
                          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                          {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                          {copied ? 'Gekopieerd!' : 'Kopieer tekst'}
                        </button>
                      </div>
                   </div>
                 )}

                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-slate-500" />
                          Prognose regulier traject
                      </h2>
                      <div className="text-right">
                          <span className="block text-xs text-slate-400 uppercase">Schuldenvrij</span>
                          <span className="font-bold text-orange-600">{debtFreeDate}</span>
                      </div>
                    </div>
                    
                    {/* Fixed height container for Recharts to ensure it renders */}
                    <div className="h-80 w-full">
                        {projectionData.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                  <defs>
                                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.1}/>
                                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                                  </linearGradient>
                                  </defs>
                                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `M${val}`} />
                                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value/1000}k`} />
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                  <RechartsTooltip 
                                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  formatter={(value: number) => [`€ ${value.toLocaleString('nl-NL')}`, 'Restschuld']}
                                  labelFormatter={(val) => `Maand ${val}`}
                                  />
                                  <Area type="monotone" dataKey="balance" name="Restschuld" stroke="#ea580c" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={2} />
                              </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400">
                             <TrendingDown className="w-12 h-12 mb-3 text-slate-200" />
                             <p className="text-sm">Geen openstaande schulden om te projecteren.</p>
                          </div>
                        )}
                    </div>
                 </div>

                 {/* AI Analysis for Debt */}
                 <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-semibold text-orange-900 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-orange-500" />
                        Strategisch advies (AI)
                        </h3>
                        <button
                        onClick={handleAiAdvice}
                        disabled={loadingAi}
                        className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                        {loadingAi ? 'Analyseren...' : 'Vergelijk opties'}
                        </button>
                    </div>
                    
                    {aiAdvice ? (
                        <div className="bg-white/50 rounded-lg p-2 max-h-60 overflow-y-auto custom-scrollbar">
                        <MarkdownRenderer content={aiAdvice} />
                        </div>
                    ) : (
                        <p className="text-sm text-orange-800/60 italic">
                        Laat AI berekenen of sanering (afkoop) voordeliger is dan het reguliere aflostraject.
                        </p>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default AflosTool;