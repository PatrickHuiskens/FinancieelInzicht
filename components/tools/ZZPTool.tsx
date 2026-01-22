import React, { useState, useEffect } from 'react';
import { Calculator, Info, Sparkles, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { getFinancialAdvice } from '../../services/geminiService';
import Tooltip from '../ui/Tooltip';
import MarkdownRenderer from '../ui/MarkdownRenderer';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
};

const ZZPTool: React.FC = () => {
  const [uurtarief, setUurtarief] = useState<number>(75);
  const [urenPerJaar, setUrenPerJaar] = useState<number>(1200);
  const [kosten, setKosten] = useState<number>(5000);
  const [startersAftrek, setStartersAftrek] = useState<boolean>(true);
  
  const [result, setResult] = useState<any>(null);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uurtarief, urenPerJaar, kosten, startersAftrek]);

  const calculate = () => {
    const omzet = uurtarief * urenPerJaar;
    const brutoWinst = omzet - kosten;

    // Self-employed deduction (Zelfstandigenaftrek 2024 approx)
    const zelfstandigenAftrek = urenPerJaar >= 1225 ? 3750 : 0;
    const startersAftrekBedrag = (startersAftrek && urenPerJaar >= 1225) ? 2123 : 0;
    
    let winstNaAftrek = brutoWinst - zelfstandigenAftrek - startersAftrekBedrag;
    if (winstNaAftrek < 0) winstNaAftrek = 0;

    // MKB Profit Exemption (13.31% in 2024)
    const mkbVrijstelling = winstNaAftrek * 0.1331;
    const belastbareWinst = winstNaAftrek - mkbVrijstelling;

    // Simplified Box 1 Tax (2024 model)
    const schijf1Grens = 75518;
    let box1Belasting = 0;
    
    if (belastbareWinst <= schijf1Grens) {
      box1Belasting = belastbareWinst * 0.3697;
    } else {
      box1Belasting = (schijf1Grens * 0.3697) + ((belastbareWinst - schijf1Grens) * 0.4950);
    }

    const algemeneHeffingskorting = Math.max(0, 3362 - (belastbareWinst * 0.06)); 
    const arbeidskorting = Math.max(0, 5532 - (belastbareWinst * 0.03)); 
    
    const totaalKorting = algemeneHeffingskorting + arbeidskorting;
    const teBetalenIB = Math.max(0, box1Belasting - totaalKorting);

    const zvw = Math.min(belastbareWinst, 71628) * 0.0532;

    const nettoInkomen = brutoWinst - teBetalenIB - zvw;

    setResult({
      omzet,
      brutoWinst,
      zelfstandigenAftrek,
      startersAftrekBedrag,
      mkbVrijstelling,
      belastbareWinst,
      teBetalenIB,
      zvw,
      nettoInkomen,
      nettoMaand: nettoInkomen / 12
    });
  };

  const handleAiAdvice = async () => {
    if (!result) return;
    setLoadingAi(true);
    const context = `
      ZZP Berekening 2024:
      Uurtarief: €${uurtarief}
      Uren/jaar: ${urenPerJaar}
      Kosten: €${kosten}
      Starter: ${startersAftrek ? 'Ja' : 'Nee'}
      
      Resultaten:
      Omzet: €${result.omzet}
      Belastbaar inkomen: €${result.belastbareWinst}
      Geschatte Inkomstenbelasting: €${result.teBetalenIB}
      Zvw premie: €${result.zvw}
      Netto jaarinkomen: €${result.nettoInkomen}
    `;
    const advice = await getFinancialAdvice(context, "Hoe kan ik mijn netto inkomen optimaliseren en waar moet ik op letten als ZZP'er met deze cijfers?");
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Parameters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-blue-600" />
          ZZP parameters
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Uurtarief</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">€</span>
              </div>
              <input 
                type="number" 
                value={uurtarief || ''} 
                onChange={(e) => setUurtarief(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-1">
              Declarabele uren per jaar
              <Tooltip content="Minimaal 1225 uur per jaar nodig voor fiscale voordelen zoals zelfstandigenaftrek.">
                <HelpCircle className="w-3 h-3 ml-2 text-slate-400 cursor-help" />
              </Tooltip>
            </label>
            <input 
              type="number" 
              value={urenPerJaar || ''} 
              onChange={(e) => setUrenPerJaar(e.target.value === '' ? 0 : parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0"
            />
            <div className="flex items-center mt-2 text-xs">
              {urenPerJaar >= 1225 ? (
                <span className="flex items-center text-green-600 font-medium">
                  <CheckCircle className="w-3 h-3 mr-1" /> Voldoet aan urencriterium
                </span>
              ) : (
                <span className="flex items-center text-orange-500 font-medium">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Geen zelfstandigenaftrek (&lt; 1225 uur)
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jaarlijkse kosten</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">€</span>
              </div>
              <input 
                type="number" 
                value={kosten || ''} 
                onChange={(e) => setKosten(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex items-center pt-2">
            <input 
              type="checkbox" 
              id="starter"
              checked={startersAftrek} 
              onChange={(e) => setStartersAftrek(e.target.checked)}
              className="h-5 w-5 accent-blue-600 cursor-pointer rounded"
            />
            <label htmlFor="starter" className="ml-2 block text-sm text-slate-700 flex items-center cursor-pointer">
              Recht op startersaftrek
              <Tooltip content="Extra aftrekpost voor startende ondernemers (max 3 keer in eerste 5 jaar).">
                <HelpCircle className="w-3 h-3 ml-1 text-slate-400 cursor-help" />
              </Tooltip>
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {result && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-green-600" />
              Resultaat (schatting 2024)
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Jaaromzet</span>
                <span className="font-medium">{formatCurrency(result.omzet)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Kosten</span>
                <span className="text-red-500">- {formatCurrency(kosten)}</span>
              </div>
               <div className="my-2 border-t border-slate-100"></div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-700">Bruto winst</span>
                <span>{formatCurrency(result.brutoWinst)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 items-center">
                <span className="flex items-center">
                   Aftrekposten
                   <Tooltip content="O.a. Zelfstandigenaftrek, Startersaftrek en MKB-winstvrijstelling.">
                     <HelpCircle className="w-3 h-3 ml-1 text-slate-300" />
                   </Tooltip>
                </span>
                <span>- {formatCurrency(result.zelfstandigenAftrek + result.startersAftrekBedrag + result.mkbVrijstelling)}</span>
              </div>
               <div className="my-2 border-t border-slate-100"></div>
               <div className="flex justify-between text-sm">
                <span className="text-slate-500 flex items-center">
                  Inkomstenbelasting (box 1)
                  <Tooltip content="Belasting over inkomen uit werk en woning.">
                     <HelpCircle className="w-3 h-3 ml-1 text-slate-300" />
                   </Tooltip>
                </span>
                <span className="text-red-500">- {formatCurrency(result.teBetalenIB)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 flex items-center">
                  Zvw premie
                  <Tooltip content="Bijdrage Zorgverzekeringswet (inkomensafhankelijk).">
                     <HelpCircle className="w-3 h-3 ml-1 text-slate-300" />
                   </Tooltip>
                </span>
                <span className="text-red-500">- {formatCurrency(result.zvw)}</span>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                 <div className="flex justify-between text-lg font-bold text-blue-900">
                  <span>Netto jaarinkomen</span>
                  <span>{formatCurrency(result.nettoInkomen)}</span>
                </div>
                 <div className="flex justify-between text-sm text-blue-700 mt-1">
                  <span>Per maand (gem.)</span>
                  <span>{formatCurrency(result.nettoMaand)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-indigo-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
              AI financieel advies
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
              Klik op de knop om een slimme analyse van je ZZP situatie te genereren.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZZPTool;