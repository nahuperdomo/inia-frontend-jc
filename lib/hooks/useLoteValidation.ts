/**
 * Hook personalizado para validación de formulario de lotes
 */
import { useCallback, useState } from 'react';
import { ValidationSchema } from './useValidation';
import { useAsyncValidation } from './useAsyncValidation';
import { LoteFormData } from '../validations/lotes-validation';

export function useLoteValidation(
  formData: LoteFormData,
  schema: ValidationSchema<LoteFormData>,
  loteId?: number
) {
  const {
    validateFicha,
    validateNomLote,
    fichaError,
    nomLoteError,
    isValidating,
    clearValidation,
  } = useAsyncValidation(loteId);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback(
    (field: keyof LoteFormData, value: any) => {
      const validator = schema[field];
      if (!validator) return null;
      return validator(value, formData);
    },
    [schema, formData]
  );

  const handleInputChange = useCallback(
    async (field: keyof LoteFormData, value: any) => {
      setTouched(prev => ({ ...prev, [field]: true }));

      // Validación síncrona
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error || '' }));

      // Validación asíncrona para campos específicos
      if (field === 'ficha' && value) {
        validateFicha(value);
      } else if (field === 'nomLote' && value) {
        validateNomLote(value);
      }
    },
    [validateField, validateFicha, validateNomLote]
  );

  const hasError = useCallback(
    (field: string) => {
      return (
        (touched[field] && errors[field]) ||
        (field === 'ficha' && fichaError) ||
        (field === 'nomLote' && nomLoteError)
      );
    },
    [touched, errors, fichaError, nomLoteError]
  );

  const getErrorMessage = useCallback(
    (field: string) => {
      if (field === 'ficha' && fichaError) return fichaError;
      if (field === 'nomLote' && nomLoteError) return nomLoteError;
      return errors[field] || '';
    },
    [errors, fichaError, nomLoteError]
  );

  const isValid = useCallback(() => {
    // Verificar errores síncronos
    const hasErrors = Object.keys(errors).some(key => errors[key]);
    // Verificar errores asíncronos
    const hasAsyncErrors = fichaError || nomLoteError;
    // Verificar si se está validando
    return !hasErrors && !hasAsyncErrors && !isValidating;
  }, [errors, fichaError, nomLoteError, isValidating]);

  const touchAll = useCallback(() => {
    const newTouched: Record<string, boolean> = {};
    const newErrors: Record<string, string> = {};

    Object.keys(schema).forEach(field => {
      newTouched[field] = true;
      const error = validateField(field as keyof LoteFormData, formData[field as keyof LoteFormData]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);
  }, [schema, formData, validateField]);

  return {
    handleInputChange,
    hasError,
    getErrorMessage,
    isValid: isValid(),
    touchAll,
    isValidating,
  };
}