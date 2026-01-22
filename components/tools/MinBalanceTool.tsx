import React, { useState, useEffect } from 'react';
import { Wallet, ShieldAlert, CheckCircle, ChevronDown } from 'lucide-react';

const MinBalanceTool: React.FC = () => {
  const [household, setHousehold] = useState<'single' | 'couple'>('single');
  const [children, setChildren] = useState<number>(0);
  const [carValue, setCarValue] = useState<number>(15000);
  const [homeValue, setHomeValue] = useState<number>(350000);
  const [hasHome, setHasHome] = useState<boolean>(true);
  const [hasCar, setHasCar] = useState<boolean>(true);

  const [buffer, setBuffer] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<any>({
    inventory: 0,
    home: 0,
    car: 0,
    unforeseen: 0
  });

  useEffect(() => {
    let replacementBuffer = 1000; 
    if (household === 'couple') replacementBuffer += 500;
    replacementBuffer += children * 250;

    let maintenanceHome = 0;
    if (hasHome) {
      maintenanceHome = homeValue * 0.005; 
    }

    let maintenanceCar = 0;
    if (hasCar) {
      maintenanceCar = 1000; 
      if (carValue > 10000) maintenanceCar += 500;
    }

    const unforeseen = 1000; 

    const total = replacementBuffer + maintenanceHome + maintenanceCar + unforeseen;
    
    setBuffer(total);
    setBreakdown({
      inventory: replacementBuffer,
      home: maintenanceHome,
      car: maintenanceCar,
      unforeseen
    });
  }, [household, children, carValue, homeValue, hasHome, hasCar]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Wallet className="w-5 h-5 mr-2 text-blue-600" />
          Huishoudprofiel
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Samenstelling</label>
            <div className="relative">
              <select 
                value={household} 
                onChange={(e) => setHousehold(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-blue-500 focus:outline-none appearance-none pr-8"
              >
                <option value="single">Alleenstaand</option>
                <option value="couple">Samenwonend</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Aantal kinderen</label>
            <input 
              type="number" 
              value={children || ''} 
              onChange={(e) => setChildren(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-blue-500 focus:outline-none"
              placeholder="0"
            />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-slate-700">Koophuis?</span>
            <input type="checkbox" checked={hasHome} onChange={(e) => setHasHome(e.target.checked)} className="h-5 w-5 accent-blue-600 cursor-pointer rounded" />
          </div>
          {hasHome && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Woningwaarde</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500">€</span>
                </div>
                <input 
                  type="number" 
                  value={homeValue || ''} 
                  onChange={(e) => setHomeValue(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-slate-700">Auto bezit?</span>
            <input type="checkbox" checked={hasCar} onChange={(e) => setHasCar(e.target.checked)} className="h-5 w-5 accent-blue-600 cursor-pointer rounded" />
          </div>
          {hasCar && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dagwaarde auto</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500">€</span>
                </div>
                <input 
                  type="number" 
                  value={carValue || ''} 
                  onChange={(e) => setCarValue(e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2 text-orange-600" />
            Advies bufferhoogte
          </h2>
          
          <div className="text-center py-6 bg-orange-50 rounded-xl border border-orange-100 mb-6">
            <p className="text-sm text-orange-700 uppercase font-semibold">Minimaal aanbevolen spaargeld</p>
            <h3 className="text-4xl font-bold text-orange-600 mt-2">€ {buffer.toLocaleString('nl-NL', {maximumFractionDigits: 0})}</h3>
          </div>

          <h3 className="text-sm font-semibold text-slate-700 mb-3">Opbouw van de buffer</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Vervanging inboedel</span>
              <span className="font-medium">€ {breakdown.inventory.toLocaleString('nl-NL')}</span>
            </div>
            <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Onvoorzien</span>
              <span className="font-medium">€ {breakdown.unforeseen.toLocaleString('nl-NL')}</span>
            </div>
            {hasHome && (
              <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Onderhoud huis (reservering)</span>
                <span className="font-medium">€ {breakdown.home.toLocaleString('nl-NL', {maximumFractionDigits: 0})}</span>
              </div>
            )}
             {hasCar && (
              <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Onderhoud/reparatie auto</span>
                <span className="font-medium">€ {breakdown.car.toLocaleString('nl-NL')}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-start text-xs text-slate-500">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            <p>Dit is een richtlijn gebaseerd op gemiddelde kosten. Voor specifieke situaties (zoals oude huizen of luxe auto's) kan een hogere buffer verstandig zijn.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinBalanceTool;