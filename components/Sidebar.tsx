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
  ChevronRight,
  PieChart,
  Landmark,
  User,
  Briefcase,
  FileText,
  Scale
} from 'lucide-react';
import { MenuItem, ToolId, AppMode } from '../types';

interface SidebarProps {
  activeTool: ToolId;
  onSelectTool: (id: ToolId) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
}

const MENU_ITEMS: MenuItem[] = [
  // --- Overzicht ---
  { id: ToolId.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard', category: 'Overzicht' },
  { id: ToolId.BUDGET, label: 'Budgetbeheer', icon: 'Wallet', category: 'Overzicht' },
  
  // --- Schulden (Specifiek voor Bewind) ---
  { id: ToolId.SCHULDEN, label: 'Dossier opbouw', icon: 'FileText', category: 'Schulden', restrictedTo: ['debt_counseling'] },
  { id: ToolId.AFLOSSEN, label: 'Sanering & strategie', icon: 'Scale', category: 'Schulden', restrictedTo: ['debt_counseling'] },
  
  // --- Calculators ---
  { id: ToolId.ZZP_TAX, label: 'ZZP belasting', icon: 'Calculator', category: 'Calculators', restrictedTo: ['standard'] },
  { id: ToolId.KOSTENVERDELER, label: 'Kostenverdeler', icon: 'Users', category: 'Calculators' },
  { id: ToolId.VAKANTIE, label: 'Vakantie', icon: 'Palmtree', category: 'Calculators' },
  { id: ToolId.MIN_BALANCE, label: 'Buffer checker', icon: 'ShieldCheck', category: 'Calculators' },
  { id: ToolId.STUDIESCHULD, label: 'Studieschuld', icon: 'GraduationCap', category: 'Calculators' },
  

  // --- Toekomst (Specifiek voor Standaard) ---
  { id: ToolId.VERMOGEN, label: 'Vermogensgroei', icon: 'TrendingUp', category: 'Toekomst', restrictedTo: ['standard'] },
  { id: ToolId.BELEGGEN, label: 'Beleggen', icon: 'PiggyBank', category: 'Toekomst', restrictedTo: ['standard'] },
  { id: ToolId.HYPOTHEEK, label: 'Hypotheek', icon: 'Home', category: 'Toekomst', restrictedTo: ['standard'] },
  { id: ToolId.AFLOSSEN, label: 'Hypotheek aflossen', icon: 'ArrowDownCircle', category: 'Toekomst', restrictedTo: ['standard'] },
  { id: ToolId.PENSIOEN, label: 'Pensioen', icon: 'Clock', category: 'Toekomst', restrictedTo: ['standard'] },
];

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Wallet, Users, TrendingDown, Calculator, 
  Palmtree, TrendingUp, Home, PiggyBank, Clock, ArrowDownCircle, ShieldCheck, GraduationCap, Landmark, FileText, Scale
};

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool, isOpen, setIsOpen, appMode, setAppMode }) => {
  
  // Filter items based on current mode
  const filteredItems = MENU_ITEMS.filter(item => {
    if (!item.restrictedTo) return true;
    return item.restrictedTo.includes(appMode);
  });

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    // Avoid duplicates
    if (!acc[item.category].find(i => i.id === item.id)) {
        acc[item.category].push(item);
    }
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Define Category Order based on Mode
  const categories = appMode === 'standard' 
    ? ['Overzicht', 'Calculators', 'Toekomst'] 
    : ['Overzicht', 'Schulden', 'Calculators'];

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
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg ${appMode === 'standard' ? 'bg-indigo-600 shadow-indigo-900/50' : 'bg-orange-600 shadow-orange-900/50'}`}>
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-lg tracking-tight text-white leading-tight">Financieel</span>
              <span className="block text-xs text-slate-400 font-medium tracking-wide">Inzicht NL</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Switcher (Profile) */}
        <div className="px-4 py-4">
           <div className="bg-slate-800 rounded-lg p-1 flex">
              <button 
                onClick={() => setAppMode('standard')}
                className={`flex-1 flex items-center justify-center py-2 rounded-md text-xs font-medium transition-all ${
                    appMode === 'standard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Standaard / ZZP"
              >
                <User className="w-3 h-3 mr-1.5" /> Standaard
              </button>
              <button 
                onClick={() => setAppMode('debt_counseling')}
                className={`flex-1 flex items-center justify-center py-2 rounded-md text-xs font-medium transition-all ${
                    appMode === 'debt_counseling' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Schuldhulpverlening / Bewind"
              >
                <Briefcase className="w-3 h-3 mr-1.5" /> Bewind
              </button>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar">
          {categories.map((category) => (
            groupedItems[category]?.length > 0 && (
              <div key={category}>
                <h3 className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
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
                          w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                          ${isActive 
                            ? appMode === 'standard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' : 'bg-orange-600 text-white shadow-md shadow-orange-900/20'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="mb-3 px-4">
            <span className="text-xs font-medium text-slate-500 block mb-1">Huidige weergave</span>
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800 p-2 rounded border border-slate-700">
               {appMode === 'standard' 
                 ? <span className="flex items-center gap-1"><User className="w-3 h-3"/> Particulier / ZZP</span> 
                 : <span className="flex items-center gap-1 text-orange-400"><Landmark className="w-3 h-3"/> Schuldhulpverlening</span>
               }
            </div>
          </div>
          <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white w-full rounded-xl hover:bg-slate-800 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span>Uitloggen</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;