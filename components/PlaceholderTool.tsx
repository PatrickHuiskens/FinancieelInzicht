import React from 'react';
import { Hammer } from 'lucide-react';

interface PlaceholderProps {
  title: string;
}

const PlaceholderTool: React.FC<PlaceholderProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
      <div className="bg-slate-50 p-4 rounded-full mb-4">
        <Hammer className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 max-w-md">
        Deze tool wordt momenteel gebouwd. Probeer de ZZP Belastingtool of de Vermogensgroei calculator voor een demo.
      </p>
    </div>
  );
};

export default PlaceholderTool;
