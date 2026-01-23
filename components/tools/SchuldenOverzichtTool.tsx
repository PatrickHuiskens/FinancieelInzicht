import React, { useState, useEffect } from 'react';
import { Landmark, Plus, Trash2, AlertTriangle, FileText, PieChart } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { getFinancialAdvice } from '../../services/geminiService';
import MarkdownRenderer from '../ui/MarkdownRenderer';

interface DebtItem {
  id: string;
  creditor: string;
  totalAmount: number;
  interestRate: number;
  monthlyPayment: number;
  description?: string;
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#3b82f6', '#6366f1'];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
};

const SchuldenOverzichtTool: React.FC = () => {
  const [debts, setDebts] = useState<DebtItem[]>(() => {
    const saved = localStorage.getItem('debtsData');
    return saved ? JSON.parse(saved) : [
      { id: '1', creditor: 'Wehkamp Krediet', totalAmount: 1850.50, interestRate: 14.0, monthlyPayment: 45.00 },
      { id: '2', creditor: 'CJIB (Verkeersboete)', totalAmount: 340.00, interestRate: 0, monthlyPayment: 50.00 },
      { id: '3', creditor: 'Dienst Toeslagen (Terugvordering)', totalAmount: 850.00, interestRate: 4.0, monthlyPayment: 100.00 },
      { id: '4', creditor: 'ING Roodstand', totalAmount: 1200.00, interestRate: 12.5, monthlyPayment: 0 }
    ];
  });

  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('debtsData', JSON.stringify(debts));
  }, [debts]);

  const addDebt = () => {
    const newDebt: DebtItem = {
      id: Date.now().toString(),
      creditor: 'Nieuwe schuldeiser',
      totalAmount: 0,
      interestRate: 0,
      monthlyPayment: 0
    };
    setDebts([...debts, newDebt]);
  };

  const updateDebt = (id: string, field: keyof DebtItem, value: any) => {
    setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const deleteDebt = (id: string) => {
    if (confirm('Weet je zeker dat je deze schuld wilt verwijderen?')) {
      setDebts(debts.filter(d => d.id !== id));
    }
  };

  const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalMonthly = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const weightedInterest = totalDebt > 0 
    ? debts.reduce((sum, d) => sum + (d.interestRate * d.totalAmount), 0) / totalDebt 
    : 0;

  const chartData = debts.map(d => ({
    name: d.creditor,
    value: d.totalAmount
  })).filter(d => d.value > 0);

  const handleAiAdvice = async () => {
    setLoadingAi(true);
    const context = `
      Schuldenoverzicht Cliënt:
      Totale schuld: €${totalDebt}
      Huidige maandelijkse aflossing: €${totalMonthly}
      Gemiddelde rente: ${weightedInterest.toFixed(1)}%
      
      Schuldeisers:
      ${debts.map(d => `- ${d.creditor}: €${d.totalAmount} (${d.interestRate}%, €${d.monthlyPayment}/mnd)`).join('\n')}
    `;
    const advice = await getFinancialAdvice(context, "Analyseer deze schuldenlast. Wat is de meest logische volgorde van aflossen? Zijn er specifieke Nederlandse regelingen waar ik op moet letten bij deze schuldeisers (CJIB, Toeslagen)?");
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Input List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                 <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-slate-600" />
                  Dossier schulden
                </h2>
                <p className="text-xs text-slate-400 mt-1">Beheer hier alle openstaande vorderingen en betalingsregelingen.</p>
              </div>
              <button 
                onClick={addDebt}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Toevoegen
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Schuldeiser</th>
                    <th className="px-4 py-3">Openstaand</th>
                    <th className="px-4 py-3">Rente %</th>
                    <th className="px-4 py-3">Maandbedrag</th>
                    <th className="px-4 py-3 rounded-r-lg w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map((debt) => (
                    <tr key={debt.id} className="group transition-colors">
                      <td className="px-2 py-2">
                        <input 
                          value={debt.creditor}
                          onChange={(e) => updateDebt(debt.id, 'creditor', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none shadow-sm text-sm font-medium"
                          placeholder="Naam schuldeiser"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <span className="text-slate-500">€</span>
                           </div>
                           <input 
                              type="number"
                              value={debt.totalAmount || ''}
                              onChange={(e) => updateDebt(debt.id, 'totalAmount', parseFloat(e.target.value))}
                              className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none shadow-sm text-sm"
                              placeholder="0"
                            />
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <input 
                          type="number"
                          value={debt.interestRate || ''}
                          onChange={(e) => updateDebt(debt.id, 'interestRate', parseFloat(e.target.value))}
                          className="w-20 bg-white border border-slate-200 rounded-md px-3 py-2 text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none shadow-sm text-sm"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-2 py-2">
                         <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <span className="text-slate-500">€</span>
                           </div>
                           <input 
                              type="number"
                              value={debt.monthlyPayment || ''}
                              onChange={(e) => updateDebt(debt.id, 'monthlyPayment', parseFloat(e.target.value))}
                              className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none shadow-sm text-sm"
                              placeholder="0"
                            />
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <button 
                          onClick={() => deleteDebt(debt.id)}
                          className="text-slate-300 hover:text-red-500 p-2 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {debts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                        Nog geen schulden toegevoegd aan het dossier.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* AI Advies Block */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-100">
             <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold text-red-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Dossier analyse (AI)
              </h3>
              <button
                onClick={handleAiAdvice}
                disabled={loadingAi}
                className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loadingAi ? 'Analyseren...' : 'Scan dossier'}
              </button>
            </div>
            {aiAdvice ? (
              <div className="bg-white/60 rounded-lg p-4 max-h-60 overflow-y-auto custom-scrollbar">
                <MarkdownRenderer content={aiAdvice} />
              </div>
            ) : (
              <p className="text-sm text-red-700/60 italic">
                Laat AI het dossier scannen op prioriteiten en betalingsrisico's.
              </p>
            )}
          </div>
        </div>

        {/* Right: Summary Cards */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Financieel overzicht</h3>
              
              <div className="mb-6 text-center">
                <span className="block text-3xl font-bold text-slate-800">{formatCurrency(totalDebt)}</span>
                <span className="text-sm text-slate-500">Totale vordering</span>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 text-sm">Huidige aflossing (Totaal)</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(totalMonthly)}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 text-sm">Gem. Rente</span>
                    <span className="font-semibold text-orange-600">{weightedInterest.toFixed(1)}%</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 text-sm">Aantal eisers</span>
                    <span className="font-semibold text-slate-800">{debts.length}</span>
                 </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                 <h4 className="text-xs font-bold text-slate-700 mb-4 flex items-center">
                   <PieChart className="w-4 h-4 mr-2" /> Verdeling schuldenlast
                 </h4>
                 <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                      </RePieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>

           <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                 <Landmark className="w-6 h-6 text-blue-600 mt-1" />
                 <div>
                   <h4 className="font-semibold text-blue-900 mb-1">Budgetbeheer</h4>
                   <p className="text-xs text-blue-700 leading-relaxed">
                     Dit dossier is actief. Wijzigingen in de vorderingen worden direct meegenomen in de 'Aflosstrategie' tool.
                   </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SchuldenOverzichtTool;