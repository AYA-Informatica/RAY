import React from 'react';
import { cn } from '../../lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, className }) => {
  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-gray-600 font-medium z-10 pointer-events-none">
        +250
      </div>
      <input
        type="tel"
        value={value}
        onChange={(e) => {
          // Allow only numbers
          const val = e.target.value.replace(/\D/g, '');
          if (val.length <= 9) onChange(val);
        }}
        placeholder="7XXXXXXXX"
        className="block w-full pl-20 pr-4 py-3.5 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white font-medium"
      />
    </div>
  );
};

export default PhoneInput;
