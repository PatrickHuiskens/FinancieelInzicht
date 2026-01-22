import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Sparkles, PartyPopper } from 'lucide-react';
import { getFinancialAdvice } from '../../services/geminiService';
import MarkdownRenderer from '../ui/MarkdownRenderer';

const PensioenTool: React.FC = () => {
  const [huidigeLeeftijd, setHuidigeLeeftijd] = useState<number>(35);
  const [pensioenLeeftijd, setPensioenLeeftijd] = useState<number>(68);
  const [huidigVermogen, setHuidigVermogen] = useState<number>(20000);
  const [maandelijkseInleg, setMaandelijkseInleg] = useState<number>(200);
  const [gewenstInkomen, setGewenstInkomen] = useState<number>(3000);
  const [verwachteAOW, setVerwachteAOW] = useState<number>(1400); 
  
  const [tekort, setTekort] = useState<number>(0);
  const [eindKapitaal, setEindKapitaal] = useState<number>(0);
  
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    const jaren = pensioenLeeftijd - huidigeLeeftijd;
    const rendement = 0.05; 
    
    let fv = huidigVermogen * Math.pow(1 + rendement, jaren);
    fv += maandelijkseInleg * 12 * ((Math.pow(1 + rendement, jaren) - 1) / rendement);
    
    setEindKapitaal(fv);

    const gapPerMonth = Math.max(0, gewenstInkomen - verwachteAOW);
    const uitkeringsJaren = 20;
    const rekenRenteUitkering = 0.03; 
    
    const benodigdKapitaal = (gapPerMonth * 12) * (1 - Math.pow(1 + rekenRenteUitkering, -uitkeringsJaren)) / rekenRenteUitkering;
    
    setTekort(Math.max(0, benodigdKapitaal - fv));

  }, [huidigeLeeftijd, pensioenLeeftijd, huidigVermogen, maandelijkseInleg, gewenstInkomen, verwachteAOW]);

  const handleAiAdvice = async () => {
    setLoadingAi(true);
    const context = `
      Pensioen analyse:
      Leeftijd: ${huidigeLeeftijd} -> ${pensioenLeeftijd}
      Geschat eindkapitaal: €${eindKapitaal.toFixed(0)}
      Gewenst inkomen: €${gewenstInkomen} p/m
      Verwachte AOW: €${verwachteAOW} p/m
      
      Resultaat:
      Pensioengat (kapitaaltekort): €${tekort.toFixed(0)}
    `;
    const advice = await getFinancialAdvice(context, "Heb ik een pensioengat en wat zijn slimme manieren om dit op te lossen (lijfrente, beleggen, etc)?");
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Jouw situatie
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leeftijd nu</label>
                <input 
                  type="number" 
                  value={huidigeLeeftijd || ''} 
                  onChange={(e) => setHuidigeLeeftijd(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="0"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pensioenleeftijd</label>
                <input 
                  type="number" 
                  value={pensioenLeeftijd || ''} 
                  onChange={(e) => setPensioenLeeftijd(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="0"
                />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Huidig belegd vermogen</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">€</span>
              </div>
              <input 
                type="number" 
                value={huidigVermogen || ''} 
                onChange={(e) => setHuidigVermogen(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
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
                value={maandelijkseInleg || ''} 
                onChange={(e) => setMaandelijkseInleg(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                placeholder="0"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gewenst netto inkomen p/m</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500">€</span>
                  </div>
                  <input 
                    type="number" 
                    value={gewenstInkomen || ''} 
                    onChange={(e) => setGewenstInkomen(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    placeholder="0"
                  />
                </div>
             </div>
             <div className="mt-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Verwachte AOW p/m</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500">€</span>
                  </div>
                  <input 
                    type="number" 
                    value={verwachteAOW || ''} 
                    onChange={(e) => setVerwachteAOW(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    placeholder="0"
                  />
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Pensioen analyse
          </h2>
          
          <div className="space-y-4">
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Geschat vermogen op {pensioenLeeftijd}:</span>
                <span className="font-bold text-slate-800">€ {eindKapitaal.toLocaleString('nl-NL', {maximumFractionDigits: 0})}</span>
             </div>
             
             {tekort > 0 ? (
                <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-center">
                    <p className="text-sm text-red-700 font-semibold uppercase">Geschat kapitaaltekort</p>
                    <h3 className="text-3xl font-bold text-red-600 mt-2">€ {tekort.toLocaleString('nl-NL', {maximumFractionDigits: 0})}</h3>
                    <p className="text-xs text-red-500 mt-2">Je komt waarschijnlijk geld tekort voor je gewenste levensstijl.</p>
                </div>
             ) : (
                <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
                    <p className="text-sm text-green-700 font-semibold uppercase">Geen tekort</p>
                    <h3 className="text-xl font-bold text-green-600 mt-2 flex items-center justify-center gap-2">
                      <PartyPopper className="w-6 h-6" /> Je zit op koers!
                    </h3>
                </div>
             )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-indigo-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
              AI pensioenadvies
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
              Klik op de knop om te zien hoe je dit pensioengat kunt dichten.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PensioenTool;