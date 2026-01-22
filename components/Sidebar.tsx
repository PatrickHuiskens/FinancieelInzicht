import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  TrendingDown, 
  Calculator, 
  Palmtree, 
  TrendingUp, 
  Home, 
  PiggyBank, 
  Clock,
  ArrowDownCircle,
  ShieldCheck,
  GraduationCap,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { MenuItem, ToolId } from '../types';

interface SidebarProps {
  activeTool: ToolId;
  onSelectTool: (id: ToolId) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const MENU_ITEMS: MenuItem[] = [
  { id: ToolId.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard', category: 'Overzicht' },
  { id: ToolId.BUDGET, label: 'Mijn Budget', icon: 'Wallet', category: 'Overzicht' },
  
  { id: ToolId.ZZP_TAX, label: 'ZZP Belasting', icon: 'Calculator', category: 'Calculators' },
  { id: ToolId.KOSTENVERDELER, label: 'Kostenverdeler', icon: 'Users', category: 'Calculators' },
  { id: ToolId.VAKANTIE, label: 'Vakantie', icon: 'Palmtree', category: 'Calculators' },
  { id: ToolId.MIN_BALANCE, label: 'Buffer Checker', icon: 'ShieldCheck', category: 'Calculators' },
  { id: ToolId.STUDIESCHULD, label: 'Studieschuld', icon: 'GraduationCap', category: 'Calculators' },
  
  { id: ToolId.VERMOGEN, label: 'Vermogensgroei', icon: 'TrendingUp', category: 'Toekomst' },
  { id: ToolId.BELEGGEN, label: 'Beleggen', icon: 'PiggyBank', category: 'Toekomst' },
  { id: ToolId.HYPOTHEEK, label: 'Hypotheek', icon: 'Home', category: 'Toekomst' },
  { id: ToolId.AFLOSSEN, label: 'Aflossen', icon: 'ArrowDownCircle', category: 'Toekomst' },
  { id: ToolId.PENSIOEN, label: 'Pensioen', icon: 'Clock', category: 'Toekomst' },
];

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Wallet, Users, TrendingDown, Calculator, 
  Palmtree, TrendingUp, Home, PiggyBank, Clock, ArrowDownCircle, ShieldCheck, GraduationCap
};

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool, isOpen, setIsOpen }) => {
  // Group items by category
  const groupedItems = MENU_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const categories = ['Overzicht', 'Calculators', 'Toekomst'];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">Financieel<span className="text-indigo-600">Inzicht</span></span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {category}
              </h3>
              <div className="space-y-1">
                {groupedItems[category]?.map((item) => {
                  const Icon = iconMap[item.icon] || Calculator;
                  const isActive = activeTool === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTool(item.id);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 w-full rounded-lg hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Uitloggen</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
