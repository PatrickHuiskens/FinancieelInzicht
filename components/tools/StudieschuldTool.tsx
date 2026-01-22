import React, { useState, useEffect } from 'react';
import { GraduationCap, Sparkles, AlertCircle, ChevronDown, Info, HelpCircle } from 'lucide-react';
import { getFinancialAdvice } from '../../services/geminiService';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import Tooltip from '../ui/Tooltip';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(amount);
};

const StudieschuldTool: React.FC = () => {
  // Inputs
  const [huidigeSchuld, setHuidigeSchuld] = useState<number>(25000);
  const [rente, setRente] = useState<number>(2.56); // 2024 rate SF35 approx
  const [stelsel, setStelsel] = useState<'sf15' | 'sf35'>('sf35');
  const [inkomen, setInkomen] = useState<number>(35000);
  const [partnerInkomen, setPartnerInkomen] = useState<number>(0);
  
  // Results
  const [maandbedragVolledig, setMaandbedragVolledig] = useState<number>(0);
  const [draagkrachtBedrag, setDraagkrachtBedrag] = useState<number>(0);
  const [teBetalen, setTeBetalen] = useState<number>(0);
  const [looptijdJaren, setLooptijdJaren] = useState<number>(35);
  const [totaleRente, setTotaleRente] = useState<number>(0);

  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [huidigeSchuld, rente, stelsel, inkomen, partnerInkomen]);

  const calculate = () => {
    const looptijdMaanden = stelsel === 'sf35' ? 420 : 180; // 35 or 15 years
    setLooptijdJaren(stelsel === 'sf35' ? 35 : 15);

    const r = rente / 100 / 12;
    
    // Annuity calculation (Wettelijk maandbedrag)
    let annuity = 0;
    if (r === 0) {
      annuity = huidigeSchuld / looptijdMaanden;
    } else {
      annuity = huidigeSchuld * (r * Math.pow(1 + r, looptijdMaanden)) / (Math.pow(1 + r, looptijdMaanden) - 1);
    }
    
    // Draagkracht calculation (Ability to pay)
    // Simplified approximation of DUO rules 2024
    const minimumLoonJaar = 28000; // Approx baseline
    const draagkrachtVrijeVoet = partnerInkomen > 0 ? minimumLoonJaar * 1.43 : minimumLoonJaar;
    
    const gezamenlijkInkomen = inkomen + partnerInkomen;
    const meerInkomen = Math.max(0, gezamenlijkInkomen - draagkrachtVrijeVoet);
    
    let berekendeDraagkracht = 0;
    if (stelsel === 'sf35') {
      // SF35: 4% of income above threshold
      berekendeDraagkracht = (meerInkomen * 0.04) / 12;
    } else {
      // SF15: 12% of income above threshold
      berekendeDraagkracht = (meerInkomen * 0.12) / 12;
    }

    const daadwerkelijkBedrag = Math.min(annuity, berekendeDraagkracht);
    
    // Total interest estimation (simplified, assuming constant payment)
    const estimatedTotalPayment = daadwerkelijkBedrag * looptijdMaanden;
    // Note: If draagkracht is low, debt might be forgiven at end, so total interest isn't straightforward
    // This is a rough projection if they pay the calculated amount for full term
    const totalInterestPaid = Math.max(0, estimatedTotalPayment - huidigeSchuld);

    setMaandbedragVolledig(annuity);
    setDraagkrachtBedrag(berekendeDraagkracht);
    setTeBetalen(daadwerkelijkBedrag);
    setTotaleRente(totalInterestPaid);
  };

  const handleAiAdvice = async () => {
    setLoadingAi(true);
    const context = `
      Studieschuld Analyse:
      Huidige schuld: €${huidigeSchuld}
      Rentepercentage: ${rente}%
      Stelsel: ${stelsel === 'sf35' ? 'Leenstelsel (35 jaar)' : 'Oud stelsel (15 jaar)'}
      Gezamenlijk Inkomen: €${inkomen + partnerInkomen}
      
      Resultaten:
      Wettelijk maandbedrag (annuïtair): €${maandbedragVolledig.toFixed(2)}
      Maandbedrag op basis van draagkracht: €${draagkrachtBedrag.toFixed(2)}
      Daadwerkelijk te betalen per maand: €${teBetalen.toFixed(2)}
    `;
    const advice = await getFinancialAdvice(context, "Is het verstandig om extra af te lossen op mijn studieschuld gezien de rente en inflatie? Of kan ik beter beleggen/sparen? Wat is de impact op een hypotheek?");
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
          Mijn studieschuld
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resterende schuld</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">€</span>
              </div>
              <input 
                type="number" 
                value={huidigeSchuld || ''} 
                onChange={(e) => setHuidigeSchuld(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rentepercentage (%)</label>
            <input 
              type="number" 
              step="0.01"
              value={rente || ''} 
              onChange={(e) => setRente(e.target.value === '' ? 0 : parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0.00"
            />
            <p className="text-xs text-slate-400 mt-1">Huidige rente (2024): 2,56% (SF35) of 2,95% (SF15).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Terugbetalingsregels</label>
            <div className="relative">
              <select 
                value={stelsel} 
                onChange={(e) => setStelsel(e.target.value as 'sf15' | 'sf35')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-blue-500 focus:outline-none appearance-none pr-8"
              >
                <option value="sf35">Leenstelsel (35 jaar, nieuw)</option>
                <option value="sf15">Basisbeurs (15 jaar, oud)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
               Inkomen & draagkracht
               <Tooltip content="DUO kijkt naar je verzamelinkomen van 2 jaar geleden, maar voor deze tool gebruiken we je huidige schatting.">
                 <Info className="w-3 h-3 ml-2 text-slate-400 cursor-help" />
               </Tooltip>
            </h3>
            <div className="space-y-3">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bruto jaarinkomen</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500">€</span>
                  </div>
                  <input 
                    type="number" 
                    value={inkomen || ''} 
                    onChange={(e) => setInkomen(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bruto jaarinkomen partner</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500">€</span>
                  </div>
                  <input 
                    type="number" 
                    value={partnerInkomen || ''} 
                    onChange={(e) => setPartnerInkomen(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Laat leeg als je alleenstaande bent.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-indigo-600" />
            Maandbedrag & aflossing
          </h2>
          
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 text-center mb-6">
             <p className="text-sm text-indigo-700 uppercase font-semibold">Te betalen per maand</p>
             <h3 className="text-4xl font-bold text-indigo-800 mt-2">{formatCurrency(teBetalen)}</h3>
             {teBetalen < maandbedragVolledig && (
                <div className="mt-2 inline-flex items-center px-2 py-1 bg-white rounded text-xs text-indigo-600 border border-indigo-200">
                  Verlaagd door draagkracht
                </div>
             )}
          </div>

          <div className="space-y-3">
             <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-600">Wettelijk maandbedrag (zonder draagkracht)</span>
                <span className="font-medium text-slate-500">{formatCurrency(maandbedragVolledig)}</span>
             </div>
             <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-600">Maximaal o.b.v. inkomen</span>
                <span className="font-medium text-slate-500">{formatCurrency(draagkrachtBedrag)}</span>
             </div>
             <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-slate-600">Looptijd</span>
                <span className="font-medium text-slate-800">{looptijdJaren} jaar</span>
             </div>
          </div>

           <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-start gap-2">
               <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
               <p className="text-xs text-slate-500 leading-relaxed">
                 Betaal je alleen het minimale bedrag? Dan is dit een schatting. Als je inkomen stijgt, gaat je maandbedrag omhoog (tot maximaal het wettelijk maandbedrag). Restschuld na {looptijdJaren} jaar wordt kwijtgescholden.
               </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-indigo-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
              AI schuldadvies
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
              Klik op de knop voor advies over extra aflossen vs. beleggen en de impact op je hypotheek.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudieschuldTool;