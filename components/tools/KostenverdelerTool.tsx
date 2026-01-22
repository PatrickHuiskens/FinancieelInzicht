import React, { useState, useEffect } from 'react';
import { Users, PieChart, Info } from 'lucide-react';

const KostenverdelerTool: React.FC = () => {
  const [inkomenA, setInkomenA] = useState<number>(3000);
  const [inkomenB, setInkomenB] = useState<number>(2500);
  const [gezamenlijkeKosten, setGezamenlijkeKosten] = useState<number>(2000);
  
  const [ratioA, setRatioA] = useState<number>(0);
  const [ratioB, setRatioB] = useState<number>(0);
  const [bedragA, setBedragA] = useState<number>(0);
  const [bedragB, setBedragB] = useState<number>(0);

  useEffect(() => {
    const totaalInkomen = inkomenA + inkomenB;
    if (totaalInkomen > 0) {
      const rA = (inkomenA / totaalInkomen) * 100;
      const rB = (inkomenB / totaalInkomen) * 100;
      setRatioA(rA);
      setRatioB(rB);
      setBedragA((rA / 100) * gezamenlijkeKosten);
      setBedragB((rB / 100) * gezamenlijkeKosten);
    }
  }, [inkomenA, inkomenB, gezamenlijkeKosten]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Inkomens & kosten
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Netto inkomen partner A</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">€</span>
              </div>
              <input 
                type="number" 
                value={inkomenA || ''} 
                onChange={(e) => setInkomenA(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Netto inkomen partner B</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">€</span>
              </div>
              <input 
                type="number" 
                value={inkomenB || ''} 
                onChange={(e) => setInkomenB(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gezamenlijke vaste lasten</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">€</span>
              </div>
              <input 
                type="number" 
                value={gezamenlijkeKosten || ''} 
                onChange={(e) => setGezamenlijkeKosten(e.target.value === '' ? 0 : parseFloat(e.target.value))}
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
            <PieChart className="w-5 h-5 mr-2 text-green-600" />
            Verdeling naar draagkracht
          </h2>
          
          <div className="space-y-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    Partner A
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {ratioA.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200">
                <div style={{ width: `${ratioA}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                 <div className="text-xs text-blue-800 uppercase font-bold mb-1">Partner A betaalt</div>
                 <div className="text-xl font-bold text-blue-900">€ {bedragA.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
               </div>
               <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                 <div className="text-xs text-purple-800 uppercase font-bold mb-1">Partner B betaalt</div>
                 <div className="text-xl font-bold text-purple-900">€ {bedragB.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
               </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-medium text-slate-700 mb-2">50/50 Verdeling (ter vergelijking)</h3>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Beide partners:</span>
                <span>€ {(gezamenlijkeKosten / 2).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KostenverdelerTool;