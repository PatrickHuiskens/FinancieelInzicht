import React, { useState, useEffect } from 'react';
import { Home, Percent, Sparkles } from 'lucide-react';
import { getFinancialAdvice } from '../../services/geminiService';
import MarkdownRenderer from '../ui/MarkdownRenderer';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
};

const HypotheekTool: React.FC = () => {
  const [inkomen1, setInkomen1] = useState<number>(45000);
  const [inkomen2, setInkomen2] = useState<number>(30000);
  const [rente, setRente] = useState<number>(4.1);
  const [looptijd, setLooptijd] = useState<number>(30);
  
  const [maxHypotheek, setMaxHypotheek] = useState<number>(0);
  const [maandlast, setMaandlast] = useState<number>(0);
  
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    const totaalInkomen = inkomen1 + inkomen2;
    const factor = rente > 4.5 ? 4.2 : 4.5;
    const maxLening = totaalInkomen * factor;
    
    const maandRente = rente / 100 / 12;
    const aantalBetalingen = looptijd * 12;
    const maandBedrag = maxLening * (maandRente * Math.pow(1 + maandRente, aantalBetalingen)) / (Math.pow(1 + maandRente, aantalBetalingen) - 1);

    setMaxHypotheek(Math.round(maxLening));
    setMaandlast(Math.round(maandBedrag));
  }, [inkomen1, inkomen2, rente, looptijd]);

  const handleAiAdvice = async () => {
    setLoadingAi(true);
    const context = `
      Hypotheek berekening (Schatting):
      Inkomen 1: €${inkomen1}
      Inkomen 2: €${inkomen2}
      Rente: ${rente}%
      
      Resultaat:
      Max Hypotheek: €${maxHypotheek}
      Bruto Maandlast: €${maandlast}
    `;
    const advice = await getFinancialAdvice(context, "Wat is je advies voor het kopen van een huis met deze cijfers in de huidige markt? Is de maandlast verantwoord?");
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Home className="w-5 h-5 mr-2 text-blue-600" />
          Inkomen & rente
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bruto jaarinkomen partner 1</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">€</span>
              </div>
              <input 
                type="number" 
                value={inkomen1 || ''} 
                onChange={(e) => setInkomen1(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-blue-500 focus:outline-none" 
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bruto jaarinkomen partner 2</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">€</span>
              </div>
              <input 
                type="number" 
                value={inkomen2 || ''} 
                onChange={(e) => setInkomen2(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-blue-500 focus:outline-none" 
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hypotheekrente (%)</label>
            <input 
              type="number" 
              step="0.01" 
              value={rente || ''} 
              onChange={(e) => setRente(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-blue-500 focus:outline-none" 
              placeholder="0"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Looptijd (jaren)</label>
            <input 
              type="number" 
              value={looptijd || ''} 
              onChange={(e) => setLooptijd(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-blue-500 focus:outline-none" 
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Percent className="w-5 h-5 mr-2 text-green-600" />
            Indicatie maximale hypotheek
          </h2>
          
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center mb-6">
             <p className="text-sm text-blue-700 uppercase font-semibold">Geschatte leencapaciteit</p>
             <h3 className="text-4xl font-bold text-blue-800 mt-2">{formatCurrency(maxHypotheek)}</h3>
          </div>

          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
             <span className="text-slate-600 font-medium">Bruto maandlast (indicatie)</span>
             <span className="text-lg font-bold text-slate-800">{formatCurrency(maandlast)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">Let op: Dit is een indicatie. Raadpleeg altijd een hypotheekadviseur.</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-indigo-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
              AI adviseur
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
              Klik op de knop om advies te krijgen over de betaalbaarheid en risico's.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HypotheekTool;