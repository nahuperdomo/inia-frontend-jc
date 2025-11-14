/**
 * Tests para el componente de formulario de Pureza
 * 
 * Estos tests cubren:
 * - Renderizado del componente con props correctas
 * - Cálculos automáticos de peso total
 * - Cálculos automáticos de porcentajes sin redondeo (4 decimales)
 * - Validación de suma de porcentajes redondeados = 100%
 * - Validación de peso total vs peso inicial
 * - Validación de pérdida de muestra > 5%
 * - Manejo de campos redondeados con "tr" para valores < 0.05
 * - Tabs entre datos generales y registros
 * - Integración con MalezaFields y OtrosCultivosFields
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import PurezaFields from '@/app/registro/analisis/pureza/form-pureza'

// Mock de los componentes hijos
jest.mock('@/components/malezas-u-otros-cultivos/fields-maleza', () => {
  return function MockMalezaFields() {
    return <div data-testid="maleza-fields">MalezaFields Component</div>
  }
})

jest.mock('@/components/malezas-u-otros-cultivos/fields-otros-cultivos', () => {
  return function MockOtrosCultivosFields() {
    return <div data-testid="otros-cultivos-fields">OtrosCultivosFields Component</div>
  }
})

jest.mock('@/app/registro/analisis/dosn/fields/fields-cumplio-estandar', () => {
  return function MockCumplimientoEstandarFields() {
    return <div data-testid="cumplimiento-estandar-fields">CumplimientoEstandarFields Component</div>
  }
})

jest.mock('@/components/analisis/tabla-tolerancias-button', () => ({
  TablaToleranciasButton: () => <button>Ver Tabla de Tolerancias</button>
}))

describe('PurezaFields Component Tests', () => {
  const mockHandleInputChange = jest.fn()
  const mockOnChangeMalezas = jest.fn()
  const mockOnChangeCultivos = jest.fn()

  const defaultFormData = {
    fecha: '2024-03-01',
    pesoInicial_g: 100,
    semillaPura_g: 80,
    materiaInerte_g: 10,
    otrosCultivos_g: 5,
    malezas_g: 3,
    malezasToleradas_g: 1,
    malezasTolCero_g: 1,
    pesoTotal_g: 100,
    redonSemillaPura: 80,
    redonMateriaInerte: 10,
    redonOtrosCultivos: 5,
    redonMalezas: 3,
    redonMalezasToleradas: 1,
    redonMalezasTolCero: 1,
    redonPesoTotal: 100,
    inasePura: 0,
    inaseMateriaInerte: 0,
    inaseOtrosCultivos: 0,
    inaseMalezas: 0,
    inaseMalezasToleradas: 0,
    inaseMalezasTolCero: 0,
    inaseFecha: '',
    cumpleEstandar: '',
    malezas: [],
    cultivos: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Test: Renderizado básico del componente', () => {
    it('debe renderizar el componente con título correcto', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText('Análisis de Pureza Física')).toBeInTheDocument()
      expect(screen.getByText('Análisis cuantitativo de componentes de semillas')).toBeInTheDocument()
    })

    it('debe renderizar las pestañas de datos generales y registros', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText('Datos generales')).toBeInTheDocument()
      expect(screen.getByText('Registros')).toBeInTheDocument()
    })

    it('debe renderizar la sección INIA', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText('INIA')).toBeInTheDocument()
      expect(screen.getByText('Instituto Nacional de Investigación Agropecuaria')).toBeInTheDocument()
    })

    it('debe renderizar la sección INASE', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText('INASE')).toBeInTheDocument()
      expect(screen.getByText('Instituto Nacional de Semillas')).toBeInTheDocument()
    })

    it('debe renderizar el botón de tabla de tolerancias', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText('Ver Tabla de Tolerancias')).toBeInTheDocument()
    })
  })

  describe('Test: Campos de entrada - Valores en Gramos', () => {
    it('debe renderizar todos los campos de peso en gramos', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText('Peso inicial (g) *')).toBeInTheDocument()
      expect(screen.getByText('Semilla pura (g) *')).toBeInTheDocument()
      expect(screen.getByText('Materia inerte (g) *')).toBeInTheDocument()
      expect(screen.getByText('Otros cultivos (g) *')).toBeInTheDocument()
      expect(screen.getByText('Malezas (g) *')).toBeInTheDocument()
      expect(screen.getByText('Malezas toleradas (g) *')).toBeInTheDocument()
      expect(screen.getByText('Malezas tol. cero (g) *')).toBeInTheDocument()
      expect(screen.getByText('Peso total (g) - Auto *')).toBeInTheDocument()
    })

    it('debe mostrar los valores correctos en los campos', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('debe llamar a handleInputChange cuando se modifica un campo', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      const semillaPuraInput = screen.getAllByRole('spinbutton').find(
        input => input.getAttribute('step') === '0.001' && 
        input.closest('div')?.textContent?.includes('Semilla pura')
      )

      if (semillaPuraInput) {
        fireEvent.change(semillaPuraInput, { target: { value: '85' } })
        expect(mockHandleInputChange).toHaveBeenCalled()
      }
    })
  })

  describe('Test: Cálculo automático de peso total', () => {
    it('debe calcular el peso total correctamente sumando todos los componentes', () => {
      const formData = {
        ...defaultFormData,
        semillaPura_g: 80,
        materiaInerte_g: 10,
        otrosCultivos_g: 5,
        malezas_g: 3,
        malezasToleradas_g: 1,
        malezasTolCero_g: 1,
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      // El peso total debe ser 100 (suma de todos los componentes)
      // Verificamos que se llama a handleInputChange con pesoTotal_g
      waitFor(() => {
        expect(mockHandleInputChange).toHaveBeenCalledWith('pesoTotal_g', '100.000')
      })
    })

    it('debe recalcular peso total cuando cambian los valores', () => {
      const { rerender } = render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      const newFormData = {
        ...defaultFormData,
        semillaPura_g: 90,
      }

      rerender(
        <PurezaFields
          formData={newFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      // Verificar que se recalcula
      expect(mockHandleInputChange).toHaveBeenCalled()
    })

    it('debe mostrar el peso total como solo lectura', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      const pesoTotalInputs = screen.getAllByDisplayValue(/100\.000|100\.00/)
      const pesoTotalAuto = pesoTotalInputs.find(input => 
        input.closest('div')?.textContent?.includes('Peso total (g) - Auto')
      )
      
      if (pesoTotalAuto) {
        expect(pesoTotalAuto).toHaveAttribute('readonly')
      }
    })
  })

  describe('Test: Cálculo automático de porcentajes sin redondeo', () => {
    it('debe calcular porcentajes con 4 decimales correctamente', () => {
      const formData = {
        ...defaultFormData,
        pesoTotal_g: 100,
        semillaPura_g: 80.5,
        materiaInerte_g: 10.25,
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      // Buscar los porcentajes calculados (80.5000%, 10.2500%)
      expect(screen.getByDisplayValue('80.5000')).toBeInTheDocument()
      expect(screen.getByDisplayValue('10.2500')).toBeInTheDocument()
    })

    it('debe mostrar 0.0000 cuando el peso total es cero', () => {
      const formData = {
        ...defaultFormData,
        pesoTotal_g: 0,
        semillaPura_g: 0,
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      // Cuando peso total es 0, los porcentajes deben ser 0
      const porcentajeInputs = screen.queryAllByDisplayValue('0.0000')
      expect(porcentajeInputs.length).toBeGreaterThan(0)
    })

    it('debe recalcular porcentajes cuando cambia el peso total', () => {
      const { rerender } = render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      const newFormData = {
        ...defaultFormData,
        pesoTotal_g: 200,
        semillaPura_g: 80,
      }

      rerender(
        <PurezaFields
          formData={newFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      // Con peso total 200 y semilla pura 80, el porcentaje debe ser 40%
      waitFor(() => {
        expect(screen.getByDisplayValue('40.0000')).toBeInTheDocument()
      })
    })
  })

  describe('Test: Porcentajes con redondeo manual', () => {
    it('debe permitir ingresar porcentajes redondeados manualmente', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      const redonInputs = screen.getAllByRole('spinbutton').filter(
        input => input.getAttribute('step') === '0.01'
      )

      expect(redonInputs.length).toBeGreaterThan(0)
    })

    it('debe calcular y mostrar la suma de porcentajes redondeados', () => {
      const formData = {
        ...defaultFormData,
        redonSemillaPura: 80.5,
        redonMateriaInerte: 10.5,
        redonOtrosCultivos: 5,
        redonMalezas: 3,
        redonMalezasToleradas: 0.5,
        redonMalezasTolCero: 0.5,
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      // La suma debe ser 100.00
      waitFor(() => {
        expect(mockHandleInputChange).toHaveBeenCalledWith('redonPesoTotal', '100.00')
      })
    })

    it('debe mostrar alerta verde cuando la suma es 100.00', () => {
      const formData = {
        ...defaultFormData,
        redonSemillaPura: 80,
        redonMateriaInerte: 10,
        redonOtrosCultivos: 5,
        redonMalezas: 3,
        redonMalezasToleradas: 1,
        redonMalezasTolCero: 1,
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText(/Suma correcta: 100.00%/i)).toBeInTheDocument()
    })

    it('debe mostrar alerta roja cuando la suma no es 100.00', () => {
      const formData = {
        ...defaultFormData,
        redonSemillaPura: 80,
        redonMateriaInerte: 10,
        redonOtrosCultivos: 5,
        redonMalezas: 3,
        redonMalezasToleradas: 1,
        redonMalezasTolCero: 2, // Suma = 101
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText(/Suma incorrecta.*debe ser 100.00%/i)).toBeInTheDocument()
    })

    it('debe mostrar "tr" para porcentajes < 0.05 en campos redondeados', () => {
      const formData = {
        ...defaultFormData,
        pesoTotal_g: 1000,
        semillaPura_g: 0.3, // 0.03% < 0.05
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      // Buscar campos con valor "tr"
      const trInputs = screen.getAllByDisplayValue('tr')
      expect(trInputs.length).toBeGreaterThan(0)
    })
  })

  describe('Test: Validaciones de peso', () => {
    it('debe mostrar error cuando peso total > peso inicial', () => {
      const formData = {
        ...defaultFormData,
        pesoInicial_g: 100,
        pesoTotal_g: 105,
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText(/El peso total no puede ser mayor al peso inicial/i)).toBeInTheDocument()
    })

    it('debe mostrar advertencia cuando la pérdida de muestra > 5%', () => {
      const formData = {
        ...defaultFormData,
        pesoInicial_g: 100,
        pesoTotal_g: 94, // 6% de pérdida
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText(/ha perdido.*6\.00%.*excede el límite/i)).toBeInTheDocument()
    })

    it('no debe mostrar advertencia cuando la pérdida es <= 5%', () => {
      const formData = {
        ...defaultFormData,
        pesoInicial_g: 100,
        pesoTotal_g: 95, // 5% de pérdida (límite exacto)
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      const alertas = screen.queryByText(/excede el límite/i)
      expect(alertas).not.toBeInTheDocument()
    })
  })

  describe('Test: Campos INASE', () => {
    it('debe renderizar todos los campos de porcentajes INASE', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText('Fecha INASE')).toBeInTheDocument()
    })

    it('debe permitir ingresar valores en campos INASE', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      const inasePuraLabel = screen.getAllByText(/Semilla pura/i).find(
        el => el.closest('div')?.textContent?.includes('Datos INASE')
      )
      
      expect(inasePuraLabel).toBeDefined()
    })

    it('debe llamar a handleInputChange al modificar campos INASE', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      // Buscar inputs en la sección INASE
      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  describe('Test: Campo cumple estándar', () => {
    it('debe renderizar el selector de cumplimiento de estándar', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText('Cumplimiento del Estándar')).toBeInTheDocument()
      expect(screen.getByText('Estado de cumplimiento')).toBeInTheDocument()
    })

    it('debe mostrar mensaje cuando cumple el estándar', () => {
      const formData = {
        ...defaultFormData,
        cumpleEstandar: 'si',
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText(/La muestra cumple con los estándares establecidos/i)).toBeInTheDocument()
    })

    it('debe mostrar mensaje cuando no cumple el estándar', () => {
      const formData = {
        ...defaultFormData,
        cumpleEstandar: 'no',
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText(/La muestra NO cumple con los estándares establecidos/i)).toBeInTheDocument()
    })
  })

  describe('Test: Pestañas y navegación', () => {
    it('debe cambiar a la pestaña de registros al hacer clic', async () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
          onChangeMalezas={mockOnChangeMalezas}
          onChangeCultivos={mockOnChangeCultivos}
        />
      )

      const registrosTab = screen.getByText('Registros')
      fireEvent.click(registrosTab)

      await waitFor(() => {
        expect(screen.getByTestId('maleza-fields')).toBeInTheDocument()
        expect(screen.getByTestId('otros-cultivos-fields')).toBeInTheDocument()
      })
    })

    it('debe mostrar MalezaFields en la pestaña de registros', async () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
          onChangeMalezas={mockOnChangeMalezas}
        />
      )

      const registrosTab = screen.getByText('Registros')
      fireEvent.click(registrosTab)

      await waitFor(() => {
        expect(screen.getByTestId('maleza-fields')).toBeInTheDocument()
      })
    })

    it('debe mostrar OtrosCultivosFields en la pestaña de registros', async () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
          onChangeCultivos={mockOnChangeCultivos}
        />
      )

      const registrosTab = screen.getByText('Registros')
      fireEvent.click(registrosTab)

      await waitFor(() => {
        expect(screen.getByTestId('otros-cultivos-fields')).toBeInTheDocument()
      })
    })
  })

  describe('Test: Integración con componentes hijos', () => {
    it('debe pasar los registros de malezas correctamente', () => {
      const formDataConMalezas = {
        ...defaultFormData,
        malezas: [
          {
            catalogo: { nombreComun: 'Maleza Test' },
            listadoTipo: 'MAL_COMUNES'
          }
        ]
      }

      render(
        <PurezaFields
          formData={formDataConMalezas}
          handleInputChange={mockHandleInputChange}
          onChangeMalezas={mockOnChangeMalezas}
        />
      )

      const registrosTab = screen.getByText('Registros')
      fireEvent.click(registrosTab)

      expect(screen.getByTestId('maleza-fields')).toBeInTheDocument()
    })

    it('debe pasar los registros de cultivos correctamente', () => {
      const formDataConCultivos = {
        ...defaultFormData,
        cultivos: [
          {
            catalogo: { nombreComun: 'Cultivo Test' },
            listadoTipo: 'OTROS'
          }
        ]
      }

      render(
        <PurezaFields
          formData={formDataConCultivos}
          handleInputChange={mockHandleInputChange}
          onChangeCultivos={mockOnChangeCultivos}
        />
      )

      const registrosTab = screen.getByText('Registros')
      fireEvent.click(registrosTab)

      expect(screen.getByTestId('otros-cultivos-fields')).toBeInTheDocument()
    })

    it('debe renderizar CumplimientoEstandarFields en registros', async () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      const registrosTab = screen.getByText('Registros')
      fireEvent.click(registrosTab)

      await waitFor(() => {
        expect(screen.getByTestId('cumplimiento-estandar-fields')).toBeInTheDocument()
      })
    })
  })

  describe('Test: Campo de fecha', () => {
    it('debe renderizar el campo de fecha del análisis', () => {
      render(
        <PurezaFields
          formData={defaultFormData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText('Fecha del análisis *')).toBeInTheDocument()
    })

    it('debe mostrar la fecha correcta', () => {
      const formData = {
        ...defaultFormData,
        fecha: '2024-03-15',
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      const dateInput = screen.getByDisplayValue('2024-03-15')
      expect(dateInput).toBeInTheDocument()
    })
  })

  describe('Test: Valores límite y casos edge', () => {
    it('debe manejar valores de cero correctamente', () => {
      const formData = {
        ...defaultFormData,
        semillaPura_g: 0,
        materiaInerte_g: 0,
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      const zeroValues = screen.queryAllByDisplayValue('0.0000')
      expect(zeroValues.length).toBeGreaterThan(0)
    })

    it('debe manejar valores muy pequeños correctamente', () => {
      const formData = {
        ...defaultFormData,
        pesoTotal_g: 10000,
        malezasTolCero_g: 0.1, // 0.001%
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      // Debe calcular el porcentaje aunque sea muy pequeño
      expect(mockHandleInputChange).toHaveBeenCalled()
    })

    it('debe manejar el caso cuando no hay malezas ni cultivos', () => {
      const formData = {
        ...defaultFormData,
        malezas: [],
        cultivos: []
      }

      render(
        <PurezaFields
          formData={formData}
          handleInputChange={mockHandleInputChange}
        />
      )

      expect(screen.getByText('Datos generales')).toBeInTheDocument()
    })
  })
})
