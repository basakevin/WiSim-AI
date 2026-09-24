import React from 'react';
import { BrainCircuit } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const WiSimLogo: React.FC<LogoProps> = ({ className = 'h-6 w-6', size = 24 }) => {
  return (
    <div className="relative flex items-center justify-center">
      <BrainCircuit 
        size={size} 
        className={`${className} text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]`} 
      />
    </div>
  );
};
