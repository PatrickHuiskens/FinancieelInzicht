import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingDown, TrendingUp, Activity, ArrowRight, Info, HelpCircle } from 'lucide-react';
import { BudgetGroup, SubItem } from './BudgetTool';
import Tooltip from '../ui/Tooltip';
import { ToolId } from '../../types';

const cashflowData = [
  { name: 'Jan', inkomsten: 4500, uitgaven: 3200 },
  { name: 'Feb', inkomsten: 4600, uitgaven: 3800 },
  { name: 'Mrt', inkomsten: 4800, uitgaven: 3100 },
  { name: 'Apr', inkomsten: 4500, uitgaven: 2900 },
  { name: 'Mei', inkomsten: 4500, uitgaven: 4100 },
  { name: 'Jun', inkomsten: 5200, uitgaven: 3300 },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsPotential: number;
}

interface DashboardProps {
  onNavigate: (toolId: ToolId) => void;
}

const StatCard: React.FC<{
  title: string;
  value: string;
  subValue: string;
  icon: React.ElementType;
  color: string;
  infoText?: string;
  trendText?: string;
}> = ({ title, value, subValue, icon: Icon, color, infoText, trendText }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3.5 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {infoText && (
        <Tooltip content={infoText} position="bottom">
           <HelpCircle className="w-5 h-5 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
        </Tooltip>
      )}
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <div className="text-3xl font-bold text-slate-800 mb-1 tracking-tight">{value}</div>
      <div className="text-xs text-slate-400 flex items-center gap-1 flex-wrap mt-2">
        <span className="bg-slate-50 px-2 py-0.5 rounded text-slate-500 font-medium">{subValue}</span>
        {trendText && <span className="text-slate-300 mx-1 hidden sm:inline">&bull;</span>}
        {trendText && <span className="text-xs font-medium text-green-600 flex items-center">{trendText}</span>}
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [nextPayment, setNextPayment] = useState<{name: string, amount: number, daysLeft: number} | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    savingsPotential: 0
  });

  useEffect(() => {
    const savedData = localStorage.getItem('budgetData_v2');
    if (!savedData) return;

    try {
      const parsedData = JSON.parse(savedData);
      const groups: BudgetGroup[] = parsedData.template || [];
      
      let income = 0;
      let expenses = 0;
      const expenseItems: SubItem[] = [];

      groups.forEach(group => {
        const groupTotal = group.items.reduce((sum, item) => sum + item.amount, 0);
        if (group.type === 'income') {
          income += groupTotal;
        } else {
          expenses += groupTotal;
          expenseItems.push(...group.items);
        }
      });

      setStats({
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
        savingsPotential: Math.max(0, income - expenses)
      });

      const today = new Date();
      const currentDay = today.getDate();
      
      let nextUp: {name: string, amount: number, daysLeft: number} | null = null;
      let minDaysDiff = 999;

      expenseItems.forEach(item => {
        if (item.paymentDay) {
          let diff = item.paymentDay - currentDay;
          if (diff < 0) {
            diff += 30;
          }

          if (diff < minDaysDiff) {
            minDaysDiff = diff;
            nextUp = {
              name: item.name,
              amount: item.amount,
              daysLeft: diff
            };
          }
        }
      });

      setNextPayment(nextUp);

    } catch (e) {
      console.error("Error calculating dashboard data", e);
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400 opacity-20 blur-2xl rounded-full transform -translate-x-1/4 translate-y-1/4"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Financieel overzicht</h2>
            <p className="text-indigo-100 max-w-xl">
              Welkom terug. Hier is een real-time analyse van je financiële gezondheid gebaseerd op je budget instellingen.
            </p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={() => onNavigate(ToolId.BUDGET)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm transition-colors border border-white/10"
             >
               Wijzig Budget
             </button>
             <button 
                onClick={() => onNavigate(ToolId.ZZP_TAX)}
                className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-50 transition-colors"
             >
               Nieuwe Berekening
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Totaal inkomen" 
          value={formatCurrency(stats.totalIncome)} 
          subValue="Per maand" 
          icon={Wallet} 
          color="bg-blue-600"
          infoText="Totaal van alle inkomstenbronnen uit je standaard budget."
        />
        <StatCard 
          title="Totaal uitgaven" 
          value={formatCurrency(stats.totalExpenses)} 
          subValue="Vaste lasten" 
          icon={Activity} 
          color="bg-pink-500"
          infoText="Totale uitgaven per maand gebaseerd op je budget."
        />
        <StatCard 
          title="Vrij besteedbaar" 
          value={formatCurrency(stats.balance)} 
          subValue="Saldo" 
          icon={TrendingUp} 
          color={stats.balance >= 0 ? "bg-indigo-600" : "bg-red-500"}
          infoText="Wat je overhoudt na alle geregistreerde uitgaven (Inkomen - Uitgaven)."
        />
        <StatCard 
          title="Spaarquote" 
          value={stats.totalIncome > 0 ? `${Math.round((stats.savingsPotential / stats.totalIncome) * 100)}%` : '0%'} 
          subValue={formatCurrency(stats.savingsPotential)} 
          icon={TrendingDown} 
          color="bg-emerald-500"
          infoText="Percentage van je inkomen dat je theoretisch kunt sparen."
          trendText="Mogelijk"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Cashflow Trend</h3>
              <p className="text-sm text-slate-400">Inkomsten vs. Uitgaven per maand</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                 <span className="text-sm font-medium text-slate-600">Inkomsten</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                 <span className="text-sm font-medium text-slate-600">Uitgaven</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowData} barGap={8} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="inkomsten" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="uitgaven" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Status Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Aankomend</h3>
          
          {nextPayment ? (
             <div className="mb-8 p-5 bg-blue-50/50 border border-blue-100 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full opacity-50 transform translate-x-8 -translate-y-8"></div>
                <div className="relative z-10">
                   <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 block">Volgende afschrijving</span>
                   <div className="text-2xl font-bold text-slate-800 mb-1">{nextPayment.name}</div>
                   <div className="text-lg font-semibold text-blue-600 mb-3">{formatCurrency(nextPayment.amount)}</div>
                   
                   <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white h-2 rounded-full overflow-hidden border border-blue-100">
                         <div className="bg-blue-500 h-full rounded-full" style={{width: '75%'}}></div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                        {nextPayment.daysLeft === 0 ? 'Vandaag' : `${nextPayment.daysLeft} dagen`}
                      </span>
                   </div>
                </div>
             </div>
          ) : (
            <div className="mb-8 p-5 bg-slate-50 border border-slate-100 rounded-xl text-center">
               <p className="text-sm text-slate-500">Geen aankomende betalingen gevonden. <br/>Vul betalingsdagen in bij je budget.</p>
            </div>
          )}

          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Snelle Navigatie</h3>
          <div className="flex-1 space-y-3">
             <button 
               onClick={() => onNavigate(ToolId.PENSIOEN)}
               className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all group text-left"
             >
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                   <TrendingUp className="w-4 h-4" />
                 </div>
                 <span className="font-medium text-slate-700 group-hover:text-indigo-900">Pensioen Check</span>
               </div>
               <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
             </button>
             
             <button 
               onClick={() => onNavigate(ToolId.HYPOTHEEK)}
               className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all group text-left"
             >
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-pink-100 text-pink-600 rounded-lg group-hover:bg-pink-600 group-hover:text-white transition-colors">
                   <TrendingDown className="w-4 h-4" />
                 </div>
                 <span className="font-medium text-slate-700 group-hover:text-pink-900">Hypotheek</span>
               </div>
               <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-pink-400" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;