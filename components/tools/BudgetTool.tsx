import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Wallet, TrendingDown, Sparkles, ChevronDown, ChevronUp, GripVertical, Calendar, ArrowLeft, ArrowRight, Copy, RotateCcw, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { getFinancialAdvice } from '../../services/geminiService';
import MarkdownRenderer from '../ui/MarkdownRenderer';

// --- Types ---
export interface SubItem {
  id: string;
  name: string;
  amount: number;
  paymentDay?: number; // Day of the month (1-31)
}

export interface BudgetGroup {
  id: string;
  name: string;
  type: 'income' | 'expense';
  items: SubItem[];
}

// Data structure for storage
interface BudgetData {
  template: BudgetGroup[]; // The "Standard"
  months: Record<string, BudgetGroup[]>; // "2024-03": [...]
}

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

// --- Helper Functions ---
const getMonthKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const formatMonthName = (date: Date) => {
  return new Intl.DateTimeFormat('nl-NL', { month: 'long', year: 'numeric' }).format(date);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
};

// Deep copy to prevent reference issues when copying template to month
const deepCopyGroups = (groups: BudgetGroup[]): BudgetGroup[] => {
  return JSON.parse(JSON.stringify(groups));
};

const DEFAULT_TEMPLATE: BudgetGroup[] = [
  {
    id: 'inc-1',
    name: 'Inkomen',
    type: 'income',
    items: [
      { id: '1', name: 'Salaris', amount: 3200, paymentDay: 24 },
      { id: '2', name: 'Zorgtoeslag', amount: 120, paymentDay: 20 }
    ]
  },
  {
    id: 'exp-1',
    name: 'Wonen',
    type: 'expense',
    items: [
      { id: '3', name: 'Huur/Hypotheek', amount: 1100, paymentDay: 1 },
      { id: '4', name: 'Energie & Water', amount: 150, paymentDay: 15 },
      { id: '5', name: 'Internet & TV', amount: 60, paymentDay: 28 }
    ]
  },
  {
    id: 'exp-2',
    name: 'Boodschappen',
    type: 'expense',
    items: [
      { id: '6', name: 'Supermarkt', amount: 400 },
      { id: '7', name: 'Drogist', amount: 50 }
    ]
  }
];

// --- Components ---

const BudgetGroupCard: React.FC<{
  group: BudgetGroup;
  onUpdateGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
  onAddItem: (groupId: string) => void;
  onUpdateItem: (groupId: string, itemId: string, field: keyof SubItem, value: any) => void;
  onDeleteItem: (groupId: string, itemId: string) => void;
}> = ({ group, onUpdateGroup, onDeleteGroup, onAddItem, onUpdateItem, onDeleteItem }) => {
  const [isOpen, setIsOpen] = useState(true);
  const total = group.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-4 transition-all hover:shadow-md">
      {/* Group Header */}
      <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center flex-1 gap-3 overflow-hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <input
            className="bg-transparent font-semibold text-slate-700 focus:outline-none focus:border-b focus:border-blue-500 px-1 placeholder-slate-400 w-full min-w-[80px] max-w-[200px]"
            value={group.name}
            onChange={(e) => onUpdateGroup(group.id, e.target.value)}
            placeholder="Groep naam"
          />
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 uppercase tracking-wider hidden sm:inline-block flex-shrink-0">
            {group.items.length} items
          </span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className={`font-bold ${group.type === 'income' ? 'text-green-600' : 'text-slate-700'}`}>
            {formatCurrency(total)}
          </span>
          <button 
            onClick={() => onDeleteGroup(group.id)}
            className="text-slate-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Items List */}
      {isOpen && (
        <div className="p-2">
          {group.items.length === 0 && (
            <div className="text-center py-4 text-sm text-slate-400 italic">
              Nog geen items in deze groep.
            </div>
          )}
          
          <div className="space-y-1">
            {group.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg group">
                <GripVertical className="w-4 h-4 text-slate-300 cursor-move flex-shrink-0" />
                
                {/* Name Input */}
                <input
                  className="flex-1 bg-transparent text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-100 rounded px-2 py-1 placeholder-slate-400 min-w-[80px]"
                  value={item.name}
                  onChange={(e) => onUpdateItem(group.id, item.id, 'name', e.target.value)}
                  placeholder="Omschrijving"
                />

                {/* Date Input */}
                <div className="relative w-16 flex-shrink-0" title="Dag van afschrijving/storting">
                  <Calendar className="absolute left-1.5 top-1.5 w-3 h-3 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="w-full bg-transparent text-xs text-center font-medium text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-100 rounded pl-4 pr-1 py-1"
                    value={item.paymentDay || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1 && val <= 31) {
                         onUpdateItem(group.id, item.id, 'paymentDay', val);
                      } else if (e.target.value === '') {
                         onUpdateItem(group.id, item.id, 'paymentDay', undefined);
                      }
                    }}
                    placeholder="Dag"
                  />
                </div>

                {/* Amount Input */}
                <div className="relative w-24 flex-shrink-0">
                  <span className="absolute left-2 top-1.5 text-slate-400 text-xs">€</span>
                  <input
                    type="number"
                    className="w-full bg-transparent text-sm text-right font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-100 rounded px-2 py-1"
                    value={item.amount || ''}
                    onChange={(e) => onUpdateItem(group.id, item.id, 'amount', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    placeholder="0"
                  />
                </div>

                <button 
                  onClick={() => onDeleteItem(group.id, item.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => onAddItem(group.id)}
            className="w-full mt-2 py-2 flex items-center justify-center text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors border border-dashed border-slate-200 hover:border-blue-200"
          >
            <Plus className="w-3 h-3 mr-1" /> Voeg item toe aan {group.name}
          </button>
        </div>
      )}
    </div>
  );
};

const BudgetTool: React.FC = () => {
  // --- State ---
  const [viewMode, setViewMode] = useState<'template' | 'month'>('month');
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>('cards');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const [data, setData] = useState<BudgetData>(() => {
    try {
      const saved = localStorage.getItem('budgetData_v2');
      if (saved) return JSON.parse(saved);
      const oldGroups = localStorage.getItem('budgetGroups');
      return {
        template: oldGroups ? JSON.parse(oldGroups) : DEFAULT_TEMPLATE,
        months: {}
      };
    } catch (e) {
      return { template: DEFAULT_TEMPLATE, months: {} };
    }
  });

  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Determine current groups
  const currentMonthKey = getMonthKey(currentDate);
  let activeGroups: BudgetGroup[] = [];
  
  if (viewMode === 'template') {
    activeGroups = data.template;
  } else {
    if (!data.months[currentMonthKey]) {
      activeGroups = deepCopyGroups(data.template);
    } else {
      activeGroups = data.months[currentMonthKey];
    }
  }

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('budgetData_v2', JSON.stringify(data));
  }, [data]);

  // --- Navigation & Actions ---

  const handleNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(next);
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(prev);
  };

  const updateData = (newGroups: BudgetGroup[]) => {
    if (viewMode === 'template') {
      setData(prev => ({ ...prev, template: newGroups }));
    } else {
      setData(prev => ({
        ...prev,
        months: {
          ...prev.months,
          [currentMonthKey]: newGroups
        }
      }));
    }
  };

  const resetMonthToTemplate = () => {
    if (confirm('Weet je zeker dat je deze maand wilt resetten naar de standaard? Alle wijzigingen voor deze maand gaan verloren.')) {
      setData(prev => {
        const newMonths = { ...prev.months };
        delete newMonths[currentMonthKey];
        return { ...prev, months: newMonths };
      });
    }
  };

  // --- CRUD Operations ---
  const addGroup = (type: 'income' | 'expense') => {
    const newGroup: BudgetGroup = {
      id: Date.now().toString(),
      name: type === 'income' ? 'Nieuwe inkomsten' : 'Nieuwe groep',
      type,
      items: []
    };
    updateData([...activeGroups, newGroup]);
  };

  const updateGroup = (id: string, name: string) => {
    updateData(activeGroups.map(g => g.id === id ? { ...g, name } : g));
  };

  const deleteGroup = (id: string) => {
    updateData(activeGroups.filter(g => g.id !== id));
  };

  const addItem = (groupId: string) => {
    const newItem: SubItem = {
      id: Date.now().toString(),
      name: '',
      amount: 0
    };
    updateData(activeGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, items: [...g.items, newItem] };
      }
      return g;
    }));
  };

  const updateItem = (groupId: string, itemId: string, field: keyof SubItem, value: any) => {
    updateData(activeGroups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          items: g.items.map(i => i.id === itemId ? { ...i, [field]: value } : i)
        };
      }
      return g;
    }));
  };

  const deleteItem = (groupId: string, itemId: string) => {
    updateData(activeGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, items: g.items.filter(i => i.id !== itemId) };
      }
      return g;
    }));
  };

  // --- Calculations ---
  const incomeGroups = activeGroups.filter(g => g.type === 'income');
  const expenseGroups = activeGroups.filter(g => g.type === 'expense');

  const totalIncome = incomeGroups.reduce((sum, g) => sum + g.items.reduce((s, i) => s + i.amount, 0), 0);
  const totalExpenses = expenseGroups.reduce((sum, g) => sum + g.items.reduce((s, i) => s + i.amount, 0), 0);
  const budgetRuimte = totalIncome - totalExpenses;

  const chartData = expenseGroups.map((g) => ({
    name: g.name,
    value: g.items.reduce((sum, i) => sum + i.amount, 0)
  })).filter(d => d.value > 0);

  // --- AI ---
  const handleAiAdvice = async () => {
    setLoadingAi(true);
    const breakdown = expenseGroups.map(g => {
      const gTotal = g.items.reduce((s, i) => s + i.amount, 0);
      return `${g.name}: €${gTotal} (Details: ${g.items.map(i => `${i.name}: ${i.amount}`).join(', ')})`;
    }).join('\n');

    const context = `
      Budget Analyse (${viewMode === 'template' ? 'Standaard sjabloon' : formatMonthName(currentDate)}):
      Totaal inkomen: €${totalIncome}
      Totaal uitgaven: €${totalExpenses}
      Vrij besteedbaar: €${budgetRuimte}
      
      Uitgaven per categorie:
      ${breakdown}
    `;
    const advice = await getFinancialAdvice(context, "Analyseer mijn budget. Zijn er opvallende zaken en waar kan ik besparen?");
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  // --- Render Views ---

  const renderTableView = (groups: BudgetGroup[]) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Omschrijving</th>
              <th className="px-4 py-3 w-32 text-center">Dag</th>
              <th className="px-6 py-3 w-40 text-right">Bedrag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {groups.map(group => {
              const groupTotal = group.items.reduce((sum, i) => sum + i.amount, 0);
              return (
                <React.Fragment key={group.id}>
                  {/* Group Header */}
                  <tr className="bg-slate-50/60">
                    <td className="px-6 py-2.5 font-bold text-slate-800 flex items-center gap-2">
                       {group.name}
                       <span className={`text-[10px] font-normal px-1.5 py-0.5 rounded border ${group.type === 'income' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                         {group.type === 'income' ? 'INK' : 'UIT'}
                       </span>
                    </td>
                    <td className="px-4 py-2.5"></td>
                    <td className="px-6 py-2.5 text-right font-semibold text-slate-600 bg-slate-100/50 border-l border-slate-200/50">
                      {formatCurrency(groupTotal)}
                    </td>
                  </tr>
                  
                  {/* Items */}
                  {group.items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-2 text-slate-400 italic text-xs pl-10">Geen items</td>
                    </tr>
                  ) : (
                    group.items.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-2 text-slate-700 pl-10 border-l-4 border-transparent hover:border-slate-200">
                          {item.name || <span className="text-slate-300 italic">Naamloos</span>}
                        </td>
                        <td className="px-4 py-2 text-center text-slate-500">
                          {item.paymentDay ? <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-xs">{item.paymentDay}e</span> : '-'}
                        </td>
                        <td className={`px-6 py-2 text-right font-medium ${group.type === 'income' ? 'text-green-600' : 'text-slate-700'} border-l border-slate-50`}>
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </React.Fragment>
              );
            })}
            {/* Grand Totals Footer */}
             <tr className="bg-slate-900 text-white font-bold">
              <td className="px-6 py-3 text-right" colSpan={2}>Totaal {groups[0]?.type === 'income' ? 'Inkomsten' : 'Uitgaven'}</td>
              <td className="px-6 py-3 text-right">
                {formatCurrency(groups.reduce((sum, g) => sum + g.items.reduce((s, i) => s + i.amount, 0), 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      
      {/* Left Column: Editor */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* Top Controls: Toggle and Month Selector */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col xl:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-start">
             {/* Month/Template Toggle */}
            <div className="bg-slate-100 p-1 rounded-lg flex items-center">
               <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
               >
                 Maand
               </button>
               <button
                  onClick={() => setViewMode('template')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'template' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
               >
                 Standaard
               </button>
            </div>

             {/* View Mode Toggle (Card/Table) */}
             <div className="bg-slate-100 p-1 rounded-lg flex items-center">
               <button
                  onClick={() => setDisplayMode('cards')}
                  className={`p-1.5 rounded-md transition-all ${
                    displayMode === 'cards' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Kaart weergave (Bewerken)"
               >
                 <LayoutGrid className="w-4 h-4" />
               </button>
               <button
                  onClick={() => setDisplayMode('table')}
                  className={`p-1.5 rounded-md transition-all ${
                    displayMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Tabel weergave (Excel overzicht)"
               >
                 <TableIcon className="w-4 h-4" />
               </button>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full xl:w-auto justify-center">
             {viewMode === 'month' ? (
              <div className="flex items-center gap-4">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-500"><ArrowLeft className="w-5 h-5"/></button>
                <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span>{formatMonthName(currentDate)}</span>
                </div>
                <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-500"><ArrowRight className="w-5 h-5"/></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
                <Copy className="w-5 h-5 text-indigo-600" />
                <span>Standaard sjabloon</span>
              </div>
            )}
          </div>

          <div className="w-full xl:w-auto flex justify-end">
            {viewMode === 'month' && (
              <button 
                onClick={resetMonthToTemplate}
                className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1"
                title="Reset naar standaard sjabloon"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 pb-10 custom-scrollbar">
          
          {displayMode === 'cards' ? (
            <>
              {/* Cards View (Editable) */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-green-600" />
                    Inkomsten
                  </h2>
                  <button 
                    onClick={() => addGroup('income')}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-green-600 transition-colors shadow-sm"
                  >
                    + Groep
                  </button>
                </div>
                <div className="space-y-4">
                  {incomeGroups.map(group => (
                    <BudgetGroupCard 
                      key={group.id} 
                      group={group} 
                      onUpdateGroup={updateGroup}
                      onDeleteGroup={deleteGroup}
                      onAddItem={addItem}
                      onUpdateItem={updateItem}
                      onDeleteItem={deleteItem}
                    />
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                    Uitgaven
                  </h2>
                   <button 
                    onClick={() => addGroup('expense')}
                    className="px-3 py-1.5 bg-slate-900 text-sm font-medium text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Nieuwe categorie
                  </button>
                </div>
                <div className="space-y-4">
                  {expenseGroups.map(group => (
                    <BudgetGroupCard 
                      key={group.id} 
                      group={group} 
                      onUpdateGroup={updateGroup}
                      onDeleteGroup={deleteGroup}
                      onAddItem={addItem}
                      onUpdateItem={updateItem}
                      onDeleteItem={deleteItem}
                    />
                  ))}
                </div>
              </section>
            </>
          ) : (
             <>
               {/* Table View (Read-only Overview) */}
               <section className="mb-8">
                 <h2 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                    <Wallet className="w-5 h-5 mr-2 text-green-600" />
                    Inkomsten Overzicht
                  </h2>
                  {renderTableView(incomeGroups)}
               </section>

               <section>
                 <h2 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                    <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                    Uitgaven Overzicht
                  </h2>
                  {renderTableView(expenseGroups)}
               </section>
             </>
          )}

        </div>

      </div>

      {/* Right Column: Sticky Summary */}
      <div className="lg:w-96 flex-shrink-0 space-y-6">
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
             {viewMode === 'template' ? 'Standaard overzicht' : `Overzicht ${formatMonthName(currentDate)}`}
          </h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Inkomen</span>
              <span className="font-semibold text-green-600">+ {formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Uitgaven</span>
              <span className="font-semibold text-red-500">- {formatCurrency(totalExpenses)}</span>
            </div>
            <div className="h-px bg-slate-100 my-2" />
            <div className="flex justify-between items-end">
              <span className="text-slate-800 font-medium">Budgetruimte</span>
              <span className={`text-2xl font-bold ${budgetRuimte >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(budgetRuimte)}
              </span>
            </div>
          </div>

          <div className="h-48 mb-6 relative">
             <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
              </RePieChart>
            </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="block text-xs text-slate-400">Totaal</span>
                  <span className="block text-sm font-bold text-slate-700">{formatCurrency(totalExpenses).split(',')[0]}</span>
                </div>
             </div>
          </div>

          <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-100">
             <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-indigo-900 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-indigo-500" /> AI coach
                </h4>
                <button
                  onClick={handleAiAdvice}
                  disabled={loadingAi}
                  className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loadingAi ? '...' : 'Analyseer'}
                </button>
             </div>
             {aiAdvice ? (
                <div className="text-xs text-slate-600 max-h-40 overflow-y-auto custom-scrollbar">
                  <MarkdownRenderer content={aiAdvice} />
                </div>
             ) : (
               <p className="text-xs text-slate-400 italic">Klik op analyseer voor bespaartips.</p>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BudgetTool;