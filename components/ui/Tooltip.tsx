import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom'; // Simplified to vertical positions for better mobile support
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Position logic
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent border-[6px]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent border-[6px]',
  };

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} w-max max-w-[200px] sm:max-w-[250px]`}>
          <div className="relative bg-slate-800 text-white text-xs leading-relaxed rounded-md py-2 px-3 shadow-xl text-center whitespace-normal break-words">
            {content}
            <div className={`absolute w-0 h-0 ${arrowClasses[position]}`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;