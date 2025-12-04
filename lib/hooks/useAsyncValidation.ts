
import { useCallback, useState, useRef } from 'react';
import { validarFichaUnica, validarNombreLoteUnico } from '../validations/lotes-async-validation';

interface AsyncValidationState {
  fichaError?: string;
  nomLoteError?: string;
  isValidating: boolean;
}

export function useAsyncValidation(loteId?: number) {
  const [state, setState] = useState<AsyncValidationState>({
    isValidating: false,
  });

  const fichaTimeoutRef = useRef<NodeJS.Timeout>();
  const nomLoteTimeoutRef = useRef<NodeJS.Timeout>();

  const validateFicha = useCallback(async (ficha: string) => {
    if (!ficha) {
      setState(prev => ({ ...prev, fichaError: undefined }));
      return null;
    }
    
    // Clear previous timeout
    if (fichaTimeoutRef.current) {
      clearTimeout(fichaTimeoutRef.current);
    }

    return new Promise<string | null>((resolve) => {
      fichaTimeoutRef.current = setTimeout(async () => {
        setState(prev => ({ ...prev, isValidating: true }));
        try {
          const esValida = await validarFichaUnica(ficha, loteId);
          const error = !esValida ? 'Esta ficha ya está registrada' : null;
          setState(prev => ({
            ...prev,
            fichaError: error || undefined,
          }));
          resolve(error);
        } catch (error) {
          console.error('Error al validar ficha:', error);
          resolve(null);
        } finally {
          setState(prev => ({ ...prev, isValidating: false }));
        }
      }, 500);
    });
  }, [loteId]);

  const validateNomLote = useCallback(async (nomLote: string) => {
    if (!nomLote) {
      setState(prev => ({ ...prev, nomLoteError: undefined }));
      return null;
    }
    
    // Clear previous timeout
    if (nomLoteTimeoutRef.current) {
      clearTimeout(nomLoteTimeoutRef.current);
    }

    return new Promise<string | null>((resolve) => {
      nomLoteTimeoutRef.current = setTimeout(async () => {
        setState(prev => ({ ...prev, isValidating: true }));
        try {
          const esValido = await validarNombreLoteUnico(nomLote, loteId);
          const error = !esValido ? 'Este nombre de lote ya está registrado' : null;
          setState(prev => ({
            ...prev,
            nomLoteError: error || undefined,
          }));
          resolve(error);
        } catch (error) {
          console.error('Error al validar nombre de lote:', error);
          resolve(null);
        } finally {
          setState(prev => ({ ...prev, isValidating: false }));
        }
      }, 500);
    });
  }, [loteId]);

  const clearValidation = useCallback((field?: 'ficha' | 'nomLote') => {
    if (field) {
      setState(prev => ({
        ...prev,
        [`${field}Error`]: undefined,
      }));
    } else {
      setState({
        isValidating: false,
      });
    }
  }, []);

  return {
    validateFicha,
    validateNomLote,
    clearValidation,
    ...state,
  };
}