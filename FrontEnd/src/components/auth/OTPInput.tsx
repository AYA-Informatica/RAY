import React, { useRef, useState, useEffect } from 'react';

interface OTPInputProps {
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ onComplete, disabled }) => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, val: string) => {
    if (disabled) return;
    
    // Only numeric
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    
    // Replace logic handles copy paste partially by just taking last char if typing
    newDigits[index] = val.slice(-1);
    
    setDigits(newDigits);

    // Auto focus next
    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Check completion
    const completeStr = newDigits.join('');
    if (completeStr.length === 6) {
      onComplete(completeStr);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-between">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          className="w-12 h-14 text-center text-xl font-bold bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
        />
      ))}
    </div>
  );
};

export default OTPInput;
