import React, { useState, useEffect } from 'react';
import { ArrowDownCircle, TrendingDown, Sparkles } from 'lucide-react';
import { getFinancialAdvice } from '../../services/geminiService';
import MarkdownRenderer from '../ui/MarkdownRenderer';

const AflosTool: React.FC = () => {
  const [hypotheekBedrag, setHypotheekBedrag] = useState<number>(300000);
  const [rente, setRente] = useState<number>(4.0);
  const [resterendeLooptijd, setResterendeLooptijd] = useState<number>(25);
  const [extraAflossing, setExtraAflossing] = useState<number>(250);
  
  const [besparing, setBesparing] = useState<number>(0);
  const [nieuweLooptijd, setNieuweLooptijd] = useState<number>(0);
  
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    const r = rente / 100 / 12;
    const n = resterendeLooptijd * 12;
    const maandLast = hypotheekBedrag * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totaalTeBetalenNormaal = maandLast * n;
    
    const nieuweMaandLast = maandLast + extraAflossing;
    const n_nieuw = -Math.log(1 - (r * hypotheekBedrag) / nieuweMaandLast) / Math.log(1 + r);
    
    const totaalTeBetalenNieuw = nieuweMaandLast * n_nieuw;
    
    setBesparing(Math.max(0, totaalTeBetalenNormaal - totaalTeBetalenNieuw));
    setNieuweLooptijd(n_nieuw / 12);

  }, [hypotheekBedrag, rente, resterendeLooptijd, extraAflossing]);

  const handleAiAdvice = async () => {
    setLoadingAi(true);
    const context = `
      Extra aflossen hypotheek:
      Huidige schuld: €${hypotheekBedrag}
      Rente: ${rente}%
      Extra aflossing: €${extraAflossing} per maand
      
      Resultaat:
      Geschatte rentebesparing: €${besparing.toFixed(0)}
      Looptijd verkorting: ${(resterendeLooptijd - nieuweLooptijd).toFixed(1)} jaar
    `;
    const advice = await getFinancialAdvice(context, "Is het slim om extra af te lossen of kan ik beter beleggen? Geef advies.");
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <ArrowDownCircle className="w-5 h-5 mr-2 text-blue-600" />
          Huidige hypotheek
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Openstaande schuld</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">€</span>
              </div>
              <input 
                type="number" 
                value={hypotheekBedrag || ''} 
                onChange={(e) => setHypotheekBedrag(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rente (%)</label>
            <input 
              type="number" 
              step="0.1" 
              value={rente || ''} 
              onChange={(e) => setRente(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resterende looptijd (jaren)</label>
            <input 
              type="number" 
              value={resterendeLooptijd || ''} 
              onChange={(e) => setResterendeLooptijd(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0"
            />
          </div>
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-1">Extra aflossing per maand</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">€</span>
              </div>
              <input 
                type="number" 
                value={extraAflossing || ''} 
                onChange={(e) => setExtraAflossing(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-green-600" />
            Resultaat extra aflossen
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
             <div className="p-4 bg-green-50 rounded-lg border border-green-100">
               <div className="text-xs text-green-800 uppercase font-bold mb-1">Totale besparing</div>
               <div className="text-xl font-bold text-green-700">€ {besparing.toLocaleString('nl-NL', {maximumFractionDigits: 0})}</div>
             </div>
             <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
               <div className="text-xs text-blue-800 uppercase font-bold mb-1">Nieuwe looptijd</div>
               <div className="text-xl font-bold text-blue-700">{nieuweLooptijd.toFixed(1)} Jaar</div>
               <div className="text-xs text-blue-500">(-{(resterendeLooptijd - nieuweLooptijd).toFixed(1)} jaar)</div>
             </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-indigo-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
              AI advies
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
              Klik op de knop om te zien of extra aflossen verstandig is in jouw situatie.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AflosTool;