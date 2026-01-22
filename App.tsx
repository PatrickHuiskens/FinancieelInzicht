import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import { ToolId } from './types';
import ZZPTool from './components/tools/ZZPTool';
import WealthTool from './components/tools/WealthTool';
import InvestingTool from './components/tools/InvestingTool';
import Dashboard from './components/tools/Dashboard';
import BudgetTool from './components/tools/BudgetTool';
import KostenverdelerTool from './components/tools/KostenverdelerTool';
import MinBalanceTool from './components/tools/MinBalanceTool';
import VakantieTool from './components/tools/VakantieTool';
import HypotheekTool from './components/tools/HypotheekTool';
import AflosTool from './components/tools/AflosTool';
import PensioenTool from './components/tools/PensioenTool';
import StudieschuldTool from './components/tools/StudieschuldTool';
import PlaceholderTool from './components/PlaceholderTool';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolId>(ToolId.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTool) {
      case ToolId.DASHBOARD:
        return <Dashboard onNavigate={setActiveTool} />;
      case ToolId.BUDGET:
        return <BudgetTool />;
      case ToolId.ZZP_TAX:
        return <ZZPTool />;
      case ToolId.VERMOGEN:
        return <WealthTool />;
      case ToolId.BELEGGEN:
        return <InvestingTool />;
      case ToolId.KOSTENVERDELER:
        return <KostenverdelerTool />;
      case ToolId.MIN_BALANCE:
        return <MinBalanceTool />;
      case ToolId.VAKANTIE:
        return <VakantieTool />;
      case ToolId.HYPOTHEEK:
        return <HypotheekTool />;
      case ToolId.AFLOSSEN:
        return <AflosTool />;
      case ToolId.PENSIOEN:
        return <PensioenTool />;
      case ToolId.STUDIESCHULD:
        return <StudieschuldTool />;
      default:
        return <PlaceholderTool title={activeTool.replace('_', ' ').toUpperCase()} />;
    }
  };

  const getTitle = () => {
    switch (activeTool) {
      case ToolId.ZZP_TAX: return 'ZZP Belasting Calculator';
      case ToolId.VERMOGEN: return 'Vermogensgroei Planner';
      case ToolId.BELEGGEN: return 'Sparen vs. Beleggen';
      case ToolId.DASHBOARD: return 'Financieel Dashboard';
      case ToolId.BUDGET: return 'Budgetruimte & Invoer';
      case ToolId.KOSTENVERDELER: return 'Eerlijke Kostenverdeler';
      case ToolId.MIN_BALANCE: return 'Minimale Buffer Calculator';
      case ToolId.VAKANTIE: return 'Vakantiekosten Calculator';
      case ToolId.HYPOTHEEK: return 'Maximale Hypotheek Berekenen';
      case ToolId.AFLOSSEN: return 'Extra Aflossen Calculator';
      case ToolId.PENSIOEN: return 'Pensioengat & Lijfrente Tool';
      case ToolId.STUDIESCHULD: return 'Studieschuld & Draagkracht';
      default: return 'Tool';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeTool={activeTool} 
        onSelectTool={setActiveTool} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 lg:hidden p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">Financieel Inzicht</h1>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Desktop Header & Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 hidden lg:block">
              <h1 className="text-2xl font-bold text-slate-900">{getTitle()}</h1>
              <p className="text-slate-500 mt-1">
                {activeTool === ToolId.DASHBOARD ? 'Welkom terug! Hier is je financieel overzicht.' : 'Bereken en plan je financiële toekomst.'}
              </p>
            </div>
            
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;