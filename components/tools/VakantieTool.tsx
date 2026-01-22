import React, { useState, useEffect } from 'react';
import { Palmtree, Plane, Coffee, Home } from 'lucide-react';

const VakantieTool: React.FC = () => {
  const [persons, setPersons] = useState<number>(2);
  const [days, setDays] = useState<number>(14);
  const [transportCost, setTransportCost] = useState<number>(800);
  const [accommodationCost, setAccommodationCost] = useState<number>(1500);
  const [dailyBudget, setDailyBudget] = useState<number>(75);
  
  const [totalCost, setTotalCost] = useState<number>(0);
  const [perPerson, setPerPerson] = useState<number>(0);

  useEffect(() => {
    const spendingMoney = persons * days * dailyBudget;
    const total = transportCost + accommodationCost + spendingMoney;
    setTotalCost(total);
    setPerPerson(total / (persons || 1));
  }, [persons, days, transportCost, accommodationCost, dailyBudget]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Plane className="w-5 h-5 mr-2 text-blue-600" />
          Reis details
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aantal personen</label>
              <input 
                type="number" 
                value={persons || ''} 
                onChange={(e) => setPersons(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-blue-500 focus:outline-none" 
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aantal dagen</label>
              <input 
                type="number" 
                value={days || ''} 
                onChange={(e) => setDays(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-blue-500 focus:outline-none" 
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vervoer totaal (vliegtickets/benzine)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">€</span>
              </div>
              <input 
                type="number" 
                value={transportCost || ''} 
                onChange={(e) => setTransportCost(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Accommodatie totaal</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500">€</span>
              </div>
              <input 
                type="number" 
                value={accommodationCost || ''} 
                onChange={(e) => setAccommodationCost(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Zakgeld p.p. per dag</label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500">€</span>
                </div>
                <input 
                  type="number" 
                  value={dailyBudget || ''} 
                  onChange={(e) => setDailyBudget(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div className="text-xs text-slate-400 space-x-1 flex-shrink-0">
                <button onClick={() => setDailyBudget(50)} className="px-2 py-2 bg-slate-100 rounded hover:bg-slate-200 text-slate-700">Budget</button>
                <button onClick={() => setDailyBudget(100)} className="px-2 py-2 bg-slate-100 rounded hover:bg-slate-200 text-slate-700">Luxe</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Palmtree className="w-5 h-5 mr-2 text-green-600" />
          Kostenoverzicht
        </h2>
        
        <div className="bg-teal-50 p-6 rounded-xl border border-teal-100 text-center mb-6">
           <p className="text-sm text-teal-700 uppercase font-semibold">Totale vakantiekosten</p>
           <h3 className="text-3xl font-bold text-teal-800 mt-2">€ {totalCost.toLocaleString('nl-NL')}</h3>
           <p className="text-sm text-teal-600 mt-1">€ {perPerson.toLocaleString('nl-NL', {maximumFractionDigits: 0})} per persoon</p>
        </div>

        <div className="space-y-3">
           <div className="flex justify-between items-center border-b border-slate-50 pb-2">
             <div className="flex items-center">
               <Plane className="w-4 h-4 mr-2 text-slate-400" />
               <span className="text-slate-600">Vervoer</span>
             </div>
             <span className="font-medium">€ {transportCost}</span>
           </div>
           <div className="flex justify-between items-center border-b border-slate-50 pb-2">
             <div className="flex items-center">
               <Home className="w-4 h-4 mr-2 text-slate-400" />
               <span className="text-slate-600">Verblijf</span>
             </div>
             <span className="font-medium">€ {accommodationCost}</span>
           </div>
           <div className="flex justify-between items-center pb-2">
             <div className="flex items-center">
               <Coffee className="w-4 h-4 mr-2 text-slate-400" />
               <span className="text-slate-600">Eten & leuke dingen</span>
             </div>
             <span className="font-medium">€ {persons * days * dailyBudget}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VakantieTool;