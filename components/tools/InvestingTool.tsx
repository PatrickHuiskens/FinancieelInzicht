import React, { useState, useEffect } from 'react';
import { TrendingUp, PiggyBank, ArrowRightLeft, Sparkles, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getFinancialAdvice } from '../../services/geminiService';
import MarkdownRenderer from '../ui/MarkdownRenderer';

const InvestingTool: React.FC = () => {
  const [startAmount, setStartAmount] = useState<number>(5000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(250);
  const [years, setYears] = useState<number>(15);
  const [savingsRate, setSavingsRate] = useState<number>(2.0); // 2% spaarrente
  const [investRate, setInvestRate] = useState<number>(7.0); // 7% beleggingsrendement
  
  const [data, setData] = useState<any[]>([]);
  const [result, setResult] = useState<any>({});
  
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    calculateComparison();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAmount, monthlyContribution, years, savingsRate, investRate]);

  const calculateComparison = () => {
    let balanceSavings = startAmount;
    let balanceInvest = startAmount;
    let totalInvested = startAmount;
    
    const chartData = [];
    
    chartData.push({
      year: 0,
      sparen: Math.round(balanceSavings),
      beleggen: Math.round(balanceInvest),
      inleg: Math.round(totalInvested)
    });

    for (let i = 1; i <= years; i++) {
      for (let m = 0; m < 12; m++) {
        balanceSavings *= (1 + (savingsRate / 100 / 12));
        balanceInvest *= (1 + (investRate / 100 / 12));
        
        balanceSavings += monthlyContribution;
        balanceInvest += monthlyContribution;
        totalInvested += monthlyContribution;
      }
      
      chartData.push({
        year: i,
        sparen: Math.round(balanceSavings),
        beleggen: Math.round(balanceInvest),
        inleg: Math.round(totalInvested)
      });
    }

    setData(chartData);
    setResult({
      finalSavings: balanceSavings,
      finalInvest: balanceInvest,
      difference: balanceInvest - balanceSavings,
      totalInvested
    });
  };

  const handleAiAdvice = async () => {
    setLoadingAi(true);
    const context = `
      Vergelijking Sparen vs Beleggen (${years} jaar):
      Inleg: Start €${startAmount} + €${monthlyContribution}/mnd
      Totaal ingelegd: €${result.totalInvested.toFixed(0)}
      
      Scenario Sparen (${savingsRate}%): Eindbedrag €${result.finalSavings.toFixed(0)}
      Scenario Beleggen (${investRate}%): Eindbedrag €${result.finalInvest.toFixed(0)}
      
      Verschil (Winst door beleggen): €${result.difference.toFixed(0)}
    `;
    const advice = await getFinancialAdvice(context, "Vergelijk de risico's en voordelen van beide opties. Is het verschil de moeite waard?");
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-1 space-y-6">
        <div>
           <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <ArrowRightLeft className="w-5 h-5 mr-2 text-blue-600" />
            Parameters
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Startbedrag</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500">€</span>
                </div>
                <input 
                  type="number" 
                  value={startAmount || ''} 
                  onChange={(e) => setStartAmount(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Maandelijkse inleg</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500">€</span>
                </div>
                <input 
                  type="number" 
                  value={monthlyContribution || ''} 
                  onChange={(e) => setMonthlyContribution(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Looptijd (jaren): {years}</label>
              <input type="range" min="1" max="40" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
           <h3 className="text-sm font-semibold text-slate-800 mb-3">Rendement scenarios</h3>
           <div className="space-y-4">
             <div>
                <label className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>Spaarrente</span>
                  <span className="font-bold">{savingsRate}%</span>
                </label>
                <input type="range" min="0" max="5" step="0.1" value={savingsRate} onChange={(e) => setSavingsRate(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500" />
             </div>
             <div>
                <label className="flex justify-between text-sm text-blue-600 mb-1">
                  <span>Beleggingsrendement</span>
                  <span className="font-bold">{investRate}%</span>
                </label>
                <input type="range" min="0" max="15" step="0.1" value={investRate} onChange={(e) => setInvestRate(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
             </div>
           </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Sparen vs. Beleggen
            </h2>
             <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-semibold">Verschil na {years} jaar</span>
                <div className="text-xl font-bold text-green-600">+ € {result.difference ? result.difference.toLocaleString('nl-NL', {maximumFractionDigits: 0}) : 0}</div>
             </div>
           </div>
           
           <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value/1000}k`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   formatter={(value: number) => [`€ ${value.toLocaleString('nl-NL')}`, '']}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="beleggen" name={`Beleggen (${investRate}%)`} stroke="#2563eb" fillOpacity={1} fill="url(#colorInvest)" strokeWidth={2} />
                <Area type="monotone" dataKey="sparen" name={`Sparen (${savingsRate}%)`} stroke="#64748b" fillOpacity={1} fill="url(#colorSave)" strokeWidth={2} />
                <Area type="monotone" dataKey="inleg" name="Eigen inleg" stroke="#cbd5e1" fill="none" strokeDasharray="5 5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
           </div>
        </div>

        {/* Info / AI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Stat Blocks */}
           <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                    <span className="text-sm text-slate-600">Eindbedrag sparen</span>
                 </div>
                 <span className="font-semibold text-slate-800">€ {result.finalSavings ? result.finalSavings.toLocaleString('nl-NL', {maximumFractionDigits: 0}) : 0}</span>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="text-sm text-slate-600">Eindbedrag beleggen</span>
                 </div>
                 <span className="font-bold text-blue-700">€ {result.finalInvest ? result.finalInvest.toLocaleString('nl-NL', {maximumFractionDigits: 0}) : 0}</span>
              </div>
              <div className="pt-4 border-t border-slate-200 mt-2">
                 <div className="flex items-start gap-2 text-xs text-slate-500">
                    <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <p>Historisch gezien levert beleggen meer op, maar resultaten uit het verleden bieden geen garantie. Beleggen brengt risico's met zich mee.</p>
                 </div>
              </div>
           </div>

           {/* AI Advice */}
           <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold text-indigo-900 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                AI adviseur
              </h3>
              <button
                onClick={handleAiAdvice}
                disabled={loadingAi}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loadingAi ? '...' : 'Advies'}
              </button>
            </div>
            {aiAdvice ? (
              <div className="bg-white/50 rounded-lg p-2 max-h-60 overflow-y-auto custom-scrollbar">
                <MarkdownRenderer content={aiAdvice} />
              </div>
            ) : (
              <p className="text-xs text-indigo-400 italic">
                Twijfel je tussen sparen of beleggen? Vraag de AI om een risico-analyse.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestingTool;