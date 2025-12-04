

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Input2FAProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function Input2FA({
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = false,
  className,
}: Input2FAProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sincronizar valor externo con dígitos internos
  useEffect(() => {
    const newDigits = value.padEnd(6, '').split('').slice(0, 6);
    setDigits(newDigits);
  }, [value]);

  // Auto-focus en el primer input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, newValue: string) => {
    // Permitir solo dígitos
    const sanitized = newValue.replace(/[^0-9]/g, '');
    
    if (sanitized.length === 0) {
      // Borrado
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      onChange(newDigits.join(''));
      return;
    }

    if (sanitized.length === 1) {
      // Un solo dígito - comportamiento normal
      const newDigits = [...digits];
      newDigits[index] = sanitized;
      setDigits(newDigits);
      onChange(newDigits.join(''));

      // Auto-advance al siguiente input
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }

      // Si completamos los 6 dígitos, llamar onComplete
      if (index === 5 && newDigits.every(d => d !== '')) {
        onComplete?.(newDigits.join(''));
      }
    } else if (sanitized.length === 6) {
      // Pegado de código completo
      const newDigits = sanitized.split('').slice(0, 6);
      setDigits(newDigits);
      onChange(newDigits.join(''));
      
      // Focus en el último input
      inputRefs.current[5]?.focus();
      
      // Llamar onComplete
      onComplete?.(newDigits.join(''));
    } else if (sanitized.length > 1) {
      // Múltiples dígitos pegados - distribuir
      const newDigits = [...digits];
      const remainingSlots = 6 - index;
      const digitsToPaste = sanitized.slice(0, remainingSlots).split('');
      
      digitsToPaste.forEach((digit, offset) => {
        if (index + offset < 6) {
          newDigits[index + offset] = digit;
        }
      });
      
      setDigits(newDigits);
      onChange(newDigits.join(''));
      
      // Focus en el siguiente input vacío o el último
      const nextEmptyIndex = newDigits.findIndex((d, i) => i > index && d === '');
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(5, index + digitsToPaste.length);
      inputRefs.current[focusIndex]?.focus();
      
      // Si completamos, llamar onComplete
      if (newDigits.every(d => d !== '')) {
        onComplete?.(newDigits.join(''));
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '') {
        // Si está vacío, ir al anterior
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // Borrar el actual
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
        onChange(newDigits.join(''));
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'Delete') {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      onChange(newDigits.join(''));
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const sanitized = pastedData.replace(/[^0-9]/g, '').slice(0, 6);
    
    if (sanitized.length > 0) {
      const newDigits = sanitized.padEnd(6, '').split('').slice(0, 6);
      setDigits(newDigits);
      onChange(sanitized);
      
      // Focus en el último dígito ingresado o el primero vacío
      const focusIndex = Math.min(sanitized.length, 5);
      inputRefs.current[focusIndex]?.focus();
      
      // Si completamos, llamar onComplete
      if (sanitized.length === 6) {
        onComplete?.(sanitized);
      }
    }
  };

  const handleFocus = (index: number) => {
    // Seleccionar el contenido al hacer focus
    inputRefs.current[index]?.select();
  };

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {digits.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={6} // Permitir pegar 6 dígitos
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            'w-12 h-14 text-center text-2xl font-bold',
            'focus:ring-2 focus:ring-primary focus:border-primary',
            error && 'border-red-500 focus:ring-red-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label={`Dígito ${index + 1} del código`}
        />
      ))}
    </div>
  );
}


interface InputRecoveryCodeProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
  className?: string;
}

export function InputRecoveryCode({
  value,
  onChange,
  disabled = false,
  error = false,
  placeholder = 'XXXX-XXXX',
  className,
}: InputRecoveryCodeProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Auto-formatear con guión
    if (newValue.length > 4) {
      newValue = `${newValue.slice(0, 4)}-${newValue.slice(4, 8)}`;
    }
    
    // Limitar a 9 caracteres (incluyendo el guión)
    if (newValue.length <= 9) {
      onChange(newValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    let sanitized = pastedData.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    
    // Formatear con guión
    if (sanitized.length > 4) {
      sanitized = `${sanitized.slice(0, 4)}-${sanitized.slice(4, 8)}`;
    }
    
    onChange(sanitized);
  };

  return (
    <Input
      type="text"
      value={value}
      onChange={handleChange}
      onPaste={handlePaste}
      disabled={disabled}
      placeholder={placeholder}
      maxLength={9}
      className={cn(
        'text-center text-lg font-mono tracking-widest uppercase',
        error && 'border-red-500 focus:ring-red-500',
        className
      )}
    />
  );
}
