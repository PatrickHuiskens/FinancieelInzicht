import React, { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, PiggyBank, HelpCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { getFinancialAdvice } from '../../services/geminiService';
import Tooltip from '../ui/Tooltip';
import MarkdownRenderer from '../ui/MarkdownRenderer';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
};

const WealthTool: React.FC = () => {
  const [startAmount, setStartAmount] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [years, setYears] = useState<number>(20);
  const [returnRate, setReturnRate] = useState<number>(7);
  
  const [data, setData] = useState<any[]>([]);
  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [totalInvested, setTotalInvested] = useState<number>(0);
  
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    calculateGrowth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAmount, monthlyContribution, years, returnRate]);

  const calculateGrowth = () => {
    let currentAmount = startAmount;
    let invested = startAmount;
    const chartData = [];
    
    chartData.push({
      year: 0,
      waarde: Math.round(currentAmount),
      inleg: Math.round(invested)
    });

    for (let i = 1; i <= years; i++) {
      for (let m = 0; m < 12; m++) {
        currentAmount += monthlyContribution;
        currentAmount *= (1 + (returnRate / 100 / 12));
        invested += monthlyContribution;
      }
      
      chartData.push({
        year: i,
        waarde: Math.round(currentAmount),
        inleg: Math.round(invested)
      });
    }

    setData(chartData);
    setFinalAmount(currentAmount);
    setTotalInvested(invested);
  };

  const handleAiAdvice = async () => {
    setLoadingAi(true);
    const context = `
      Vermogensgroei scenario:
      Startbedrag: €${startAmount}
      Maandelijkse inleg: €${monthlyContribution}
      Looptijd: ${years} jaar
      Rendement: ${returnRate}%
      
      Resultaat na ${years} jaar:
      Totaal vermogen: €${finalAmount.toFixed(0)}
      Eigen inleg: €${totalInvested.toFixed(0)}
      Rendement (winst): €${(finalAmount - totalInvested).toFixed(0)}
    `;
    const advice = await getFinancialAdvice(context, "Wat is je advies over dit beleggingsscenario? Is het realistisch en wat zijn de risico's?");
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <PiggyBank className="w-5 h-5 mr-2 text-blue-600" />
            Instellingen
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
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Looptijd (jaren): {years}</label>
              <input 
                type="range" 
                min="1" max="50"
                value={years} 
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-1">
                Verwacht rendement (%): {returnRate}%
                <Tooltip content="Historisch gemiddelde aandelenmarkt is ~7% (na inflatie). Sparen is ~1-3%.">
                  <HelpCircle className="w-3 h-3 ml-2 text-slate-400 cursor-help" />
                </Tooltip>
              </label>
              <input 
                type="range" 
                min="1" max="15" step="0.5"
                value={returnRate} 
                onChange={(e) => setReturnRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Defensief (3%)</span>
                <span>Neutraal (7%)</span>
                <span>Offensief (10%+)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
             <div className="text-sm text-green-800 mb-1">Verwacht eindbedrag</div>
             <div className="text-2xl font-bold text-green-700">{formatCurrency(finalAmount)}</div>
             <div className="text-xs text-green-600 mt-1">
               Winst: {formatCurrency(finalAmount - totalInvested)}
             </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col">
           <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Vermogensontwikkeling
          </h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `€${value/1000}k`} />
                <RechartsTooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Line type="monotone" dataKey="waarde" name="Totale waarde" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="inleg" name="Eigen inleg" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-indigo-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
              AI vermogensanalyse
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
             <div className="bg-white/50 rounded-lg p-2">
               <MarkdownRenderer content={aiAdvice} />
             </div>
          ) : (
             <p className="text-sm text-indigo-400 italic">
              Klik op de knop om te zien wat de AI vindt van dit beleggingsplan en het risicoprofiel.
            </p>
          )}
        </div>
    </div>
  );
};

export default WealthTool;