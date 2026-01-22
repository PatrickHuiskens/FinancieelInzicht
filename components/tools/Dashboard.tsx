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
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {infoText && (
        <Tooltip content={infoText} position="bottom">
           <HelpCircle className="w-4 h-4 text-slate-300 hover:text-slate-500 cursor-help" />
        </Tooltip>
      )}
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-1">{title}</h3>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-xs text-slate-400 flex items-center gap-1 flex-wrap">
        <span>{subValue}</span>
        {trendText && <span className="text-slate-300 mx-1 hidden sm:inline">|</span>}
        {trendText && <span className="text-xs font-medium text-slate-500">{trendText}</span>}
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
      <div>
        <h2 className="text-xl font-bold text-slate-800">Financieel overzicht</h2>
        <p className="text-slate-500 text-sm">Real-time inzicht gebaseerd op je standaard budget.</p>
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
          subValue="Vaste lasten & extra's" 
          icon={Activity} 
          color="bg-red-600"
          infoText="Totale uitgaven per maand gebaseerd op je budget."
        />
        <StatCard 
          title="Budgetruimte" 
          value={formatCurrency(stats.balance)} 
          subValue="Vrij te besteden" 
          icon={TrendingUp} 
          color={stats.balance >= 0 ? "bg-purple-600" : "bg-red-500"}
          infoText="Wat je overhoudt na alle geregistreerde uitgaven (Inkomen - Uitgaven)."
        />
        <StatCard 
          title="Potentiële spaarquote" 
          value={formatCurrency(stats.savingsPotential)} 
          subValue="Mogelijk spaarbedrag" 
          icon={TrendingDown} 
          color="bg-green-600"
          infoText="Dit is gelijk aan je budgetruimte. Dit bedrag zou je theoretisch kunnen sparen of beleggen."
          trendText={stats.totalIncome > 0 ? `${Math.round((stats.savingsPotential / stats.totalIncome) * 100)}% van inkomen` : ''}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto lg:h-96">
        
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-96 lg:h-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              Cashflow trend 
              <Tooltip content="Historische data (In deze demo hardcoded, later gekoppeld aan database)">
                <Info className="w-4 h-4 text-slate-400" />
              </Tooltip>
            </h3>
            <div className="flex gap-2">
              <span className="flex items-center text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1"/> Inkomsten</span>
              <span className="flex items-center text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-slate-300 mr-1"/> Uitgaven</span>
            </div>
          </div>
          <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
                  cursor={{fill: '#f8fafc'}}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="inkomsten" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="uitgaven" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 opacity-10 blur-3xl rounded-full transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-2">Snel aan de slag</h3>
            <p className="text-slate-400 text-sm mb-6">Gebruik de tools om direct inzicht te krijgen in je situatie.</p>
            
            <div className="space-y-3">
              <div 
                onClick={() => onNavigate(ToolId.PENSIOEN)}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <span className="text-sm font-medium">Bereken jaarruimte</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div 
                onClick={() => onNavigate(ToolId.HYPOTHEEK)}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <span className="text-sm font-medium">Hypotheek check</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div 
                onClick={() => onNavigate(ToolId.BUDGET)}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <span className="text-sm font-medium">Update budget</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                Volgende afschrijving
                <Tooltip content="Gebaseerd op de 'Dag' die je bij je budget items hebt ingevuld." position="top">
                  <Info className="w-3 h-3 text-slate-500 cursor-help" />
                </Tooltip>
              </span>
              {nextPayment ? (
                 <span className="text-sm font-bold">{formatCurrency(nextPayment.amount)} ({nextPayment.name})</span>
              ) : (
                 <span className="text-sm font-bold text-slate-500">Geen data</span>
              )}
            </div>
            {nextPayment ? (
               <>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-500 h-full w-3/4 rounded-full"></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 text-right">
                  {nextPayment.daysLeft === 0 ? 'Vandaag' : `Over ${nextPayment.daysLeft} dagen`}
                </p>
               </>
            ) : (
              <p className="text-[10px] text-slate-500 mt-1 text-right">Vul 'Dag' in bij budget items</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;