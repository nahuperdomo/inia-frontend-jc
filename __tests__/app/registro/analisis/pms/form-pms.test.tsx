import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PmsFields from '@/app/registro/analisis/pms/form-pms';

describe('PmsFields Component', () => {
  const mockHandleInputChange = jest.fn();
  
  const defaultFormData = {
    numRepeticionesEsperadasPms: 8,
    numTandas: 1,
    esSemillaBrozosa: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar el componente correctamente', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getByText('Análisis de Peso de Mil Semillas (PMS)')).toBeInTheDocument();
      expect(screen.getByText('Configura los parámetros para el análisis de peso de mil semillas')).toBeInTheDocument();
    });

    it('debe mostrar los campos de configuración de repeticiones', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getByText('Configuración de Repeticiones')).toBeInTheDocument();
      expect(screen.getByDisplayValue('8')).toBeInTheDocument(); // numRepeticionesEsperadas
      expect(screen.getByDisplayValue('1')).toBeInTheDocument(); // numTandas
    });

    it('debe mostrar el campo de tipo de semilla', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getByText('Tipo de Semilla')).toBeInTheDocument();
      expect(screen.getByText(/¿Es semilla brozosa?/i)).toBeInTheDocument();
    });

    it('debe mostrar el resumen de configuración', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getByText('Configuración de PMS Lista')).toBeInTheDocument();
      expect(screen.getByText(/Se crearán/i)).toBeInTheDocument();
      expect(screen.getByText(/Iniciará con/i)).toBeInTheDocument();
    });
  });

  describe('Campo de repeticiones esperadas', () => {
    it('debe mostrar el valor inicial correctamente', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const input = screen.getByDisplayValue('8') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('8');
    });

    it('debe actualizar el valor cuando el usuario escribe', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const input = screen.getByDisplayValue('8');
      fireEvent.change(input, { target: { value: '10' } });

      expect(mockHandleInputChange).toHaveBeenCalledWith('numRepeticionesEsperadasPms', 10);
    });

    it('debe limitar el valor mínimo a 4', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const input = screen.getByDisplayValue('8');
      fireEvent.change(input, { target: { value: '2' } });

      expect(mockHandleInputChange).toHaveBeenCalledWith('numRepeticionesEsperadasPms', 4);
    });

    it('debe limitar el valor máximo a 20', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const input = screen.getByDisplayValue('8');
      fireEvent.change(input, { target: { value: '25' } });

      expect(mockHandleInputChange).toHaveBeenCalledWith('numRepeticionesEsperadasPms', 20);
    });

    it('debe manejar campo vacío', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const input = screen.getByDisplayValue('8');
      fireEvent.change(input, { target: { value: '' } });

      expect(mockHandleInputChange).toHaveBeenCalledWith('numRepeticionesEsperadasPms', undefined);
    });

    it('debe mostrar mensaje de error con valor inválido', () => {
      const invalidFormData = {
        ...defaultFormData,
        numRepeticionesEsperadasPms: 2,
      };

      render(
        <PmsFields 
          formData={invalidFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getByText(/Debe especificar un número válido de repeticiones/i)).toBeInTheDocument();
    });

    it('debe mostrar el campo como requerido', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const input = screen.getByDisplayValue('8');
      expect(input).toHaveAttribute('required');
    });
  });

  describe('Campo de número de tandas', () => {
    it('debe mostrar el valor fijo de 1', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const input = screen.getByLabelText(/Número de Tandas/i) as HTMLInputElement;
      expect(input.value).toBe('1');
    });

    it('debe estar deshabilitado', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const input = screen.getByLabelText(/Número de Tandas/i);
      expect(input).toBeDisabled();
    });

    it('debe ser de solo lectura', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const input = screen.getByLabelText(/Número de Tandas/i);
      expect(input).toHaveAttribute('readOnly');
    });
  });

  describe('Campo de semilla brozosa', () => {
    it('debe mostrar el checkbox no marcado por defecto', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const checkbox = screen.getByRole('checkbox', { name: /¿Es semilla brozosa?/i });
      expect(checkbox).not.toBeChecked();
    });

    it('debe mostrar el checkbox marcado cuando está activo', () => {
      const formDataWithBrozosa = {
        ...defaultFormData,
        esSemillaBrozosa: true,
      };

      render(
        <PmsFields 
          formData={formDataWithBrozosa} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const checkbox = screen.getByRole('checkbox', { name: /¿Es semilla brozosa?/i });
      expect(checkbox).toBeChecked();
    });

    it('debe actualizar el valor cuando se hace clic', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const checkbox = screen.getByRole('checkbox', { name: /¿Es semilla brozosa?/i });
      fireEvent.click(checkbox);

      expect(mockHandleInputChange).toHaveBeenCalledWith('esSemillaBrozosa', true);
    });

    it('debe mostrar la descripción del campo', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getByText(/Marca esta opción si la semilla es brozosa/i)).toBeInTheDocument();
      expect(screen.getByText(/Esto afecta el umbral del coeficiente de variación permitido/i)).toBeInTheDocument();
    });
  });

  describe('Resumen de configuración', () => {
    it('debe mostrar configuración válida', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getByText('Configuración de PMS Lista')).toBeInTheDocument();
      expect(screen.getByText(/8 repeticiones/i)).toBeInTheDocument();
      expect(screen.getAllByText(/1 tanda/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Tipo de semilla:/i).parentElement?.textContent).toContain('Normal');
      expect(screen.getByText(/Umbral CV:/i).parentElement?.textContent).toContain('≤ 4%');
    });

    it('debe mostrar umbral CV correcto para semilla normal', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getByText(/≤ 4%/i)).toBeInTheDocument();
    });

    it('debe mostrar umbral CV correcto para semilla brozosa', () => {
      const formDataBrozosa = {
        ...defaultFormData,
        esSemillaBrozosa: true,
      };

      render(
        <PmsFields 
          formData={formDataBrozosa} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getByText(/≤ 6%/i)).toBeInTheDocument();
    });

    it('debe mostrar tipo de semilla brozosa en resumen', () => {
      const formDataBrozosa = {
        ...defaultFormData,
        esSemillaBrozosa: true,
      };

      render(
        <PmsFields 
          formData={formDataBrozosa} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getAllByText(/Brozosa/i).length).toBeGreaterThan(0);
    });

    it('debe mostrar configuración incompleta con valor inválido', () => {
      const invalidFormData = {
        ...defaultFormData,
        numRepeticionesEsperadasPms: 2,
      };

      render(
        <PmsFields 
          formData={invalidFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getByText('Configuración Incompleta')).toBeInTheDocument();
      expect(screen.getByText(/corrige la configuración antes de crear/i)).toBeInTheDocument();
    });

    it('debe mostrar 0 repeticiones cuando no está definido', () => {
      const emptyFormData = {
        numTandas: 1,
        esSemillaBrozosa: false,
      };

      render(
        <PmsFields 
          formData={emptyFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getByText(/0 repeticiones/i)).toBeInTheDocument();
    });
  });

  describe('Valores por defecto en useEffect', () => {
    it('debe establecer numTandas a 1 si no está definido', () => {
      const formDataWithoutTandas = {
        numRepeticionesEsperadasPms: 8,
        esSemillaBrozosa: false,
      };

      render(
        <PmsFields 
          formData={formDataWithoutTandas} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(mockHandleInputChange).toHaveBeenCalledWith('numTandas', 1);
    });

    it('debe establecer esSemillaBrozosa a false si no está definido', () => {
      const formDataWithoutBrozosa = {
        numRepeticionesEsperadasPms: 8,
        numTandas: 1,
      };

      render(
        <PmsFields 
          formData={formDataWithoutBrozosa} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(mockHandleInputChange).toHaveBeenCalledWith('esSemillaBrozosa', false);
    });

    it('no debe sobrescribir numTandas si ya es 1', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      // Verificar que no se llama innecesariamente
      const tandasCalls = mockHandleInputChange.mock.calls.filter(
        call => call[0] === 'numTandas'
      );
      expect(tandasCalls.length).toBe(0);
    });
  });

  describe('Validaciones', () => {
    it('debe validar repeticiones en rango válido (4-20)', () => {
      const validValues = [4, 8, 12, 16, 20];

      validValues.forEach(value => {
        const { unmount } = render(
          <PmsFields 
            formData={{ ...defaultFormData, numRepeticionesEsperadasPms: value }} 
            handleInputChange={mockHandleInputChange} 
          />
        );

        expect(screen.getByText('Configuración de PMS Lista')).toBeInTheDocument();
        expect(screen.queryByText(/Debe especificar un número válido/i)).not.toBeInTheDocument();
        
        unmount();
      });
    });

    it('debe invalidar repeticiones fuera de rango', () => {
      const invalidValues = [0, 2, 3, 21, 25];

      invalidValues.forEach(value => {
        const { unmount } = render(
          <PmsFields 
            formData={{ ...defaultFormData, numRepeticionesEsperadasPms: value }} 
            handleInputChange={mockHandleInputChange} 
          />
        );

        expect(screen.getByText('Configuración Incompleta')).toBeInTheDocument();
        
        unmount();
      });
    });

    it('debe manejar valores null/undefined correctamente', () => {
      const formDataWithNull = {
        ...defaultFormData,
        numRepeticionesEsperadasPms: null,
      };

      render(
        <PmsFields 
          formData={formDataWithNull} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getByText('Configuración Incompleta')).toBeInTheDocument();
    });
  });

  describe('Botón de tabla de tolerancias', () => {
    it('debe renderizar el botón de tabla de tolerancias', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getByText('Ver Tabla de Tolerancias')).toBeInTheDocument();
    });
  });

  describe('Estilos condicionales', () => {
    it('debe aplicar estilos de error cuando las repeticiones son inválidas', () => {
      const invalidFormData = {
        ...defaultFormData,
        numRepeticionesEsperadasPms: 2,
      };

      render(
        <PmsFields 
          formData={invalidFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const input = screen.getByDisplayValue('2');
      expect(input.className).toContain('border-red-500');
    });

    it('debe aplicar estilos correctos al resumen cuando es válido', () => {
      render(
        <PmsFields 
          formData={defaultFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const titulo = screen.getByText('Configuración de PMS Lista');
      expect(titulo).toHaveClass('text-blue-900');
    });

    it('debe aplicar estilos de error al resumen cuando es inválido', () => {
      const invalidFormData = {
        ...defaultFormData,
        numRepeticionesEsperadasPms: 2,
      };

      render(
        <PmsFields 
          formData={invalidFormData} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      const titulo = screen.getByText('Configuración Incompleta');
      expect(titulo).toHaveClass('text-red-900');
    });
  });

  describe('Props faltantes o incorrectas', () => {
    it('debe manejar formData vacío', () => {
      render(
        <PmsFields 
          formData={{}} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      expect(screen.getByText('Configuración Incompleta')).toBeInTheDocument();
    });

    it('debe manejar formData null', () => {
      render(
        <PmsFields 
          formData={null} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      // Debe renderizar sin crashear
      expect(screen.getByText('Análisis de Peso de Mil Semillas (PMS)')).toBeInTheDocument();
    });

    it('debe manejar formData undefined', () => {
      render(
        <PmsFields 
          formData={undefined} 
          handleInputChange={mockHandleInputChange} 
        />
      );

      // Debe renderizar sin crashear
      expect(screen.getByText('Análisis de Peso de Mil Semillas (PMS)')).toBeInTheDocument();
    });
  });
});
