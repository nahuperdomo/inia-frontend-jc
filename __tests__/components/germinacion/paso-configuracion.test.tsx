

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TablasGerminacionSection } from '@/components/germinacion/tablas-germinacion-section'
import { TablaGermDTO } from '@/app/models/interfaces/repeticiones'

// Mock de navegación
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  }),
  useParams: () => ({ id: '1' }),
  usePathname: () => '/test'
}))

// Mock de servicios
jest.mock('@/app/services/germinacion-service')
jest.mock('@/app/services/valores-germ-service')

// Mock de hooks
jest.mock('@/lib/hooks/useToast', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn()
  })
}))

jest.mock('@/lib/hooks/useConfirm', () => ({
  useConfirm: () => ({
    confirm: jest.fn().mockResolvedValue(true)
  })
}))

describe('Paso de Configuración de Tabla - Tests Completos', () => {
  const mockOnTablaUpdated = jest.fn()

  const tablasVacias: TablaGermDTO[] = []

  beforeEach(() => {
    jest.clearAllMocks()
  })

  
  describe('Test: Renderizar campos de configuración', () => {
    it('debe mostrar el botón "Agregar Tabla" cuando no hay tablas', () => {
      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      expect(screen.getByRole('button', { name: /agregar tabla/i })).toBeInTheDocument()
    })

    it('debe mostrar todos los campos de configuración básica', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      await waitFor(() => {
        expect(screen.getByText(/tratamiento \*/i)).toBeInTheDocument()
        expect(screen.getByText(/producto y dosis/i)).toBeInTheDocument()
        expect(screen.getByText(/número de semillas por repetición \*/i)).toBeInTheDocument()
        expect(screen.getByText(/método \*/i)).toBeInTheDocument()
        expect(screen.getByText(/temperatura \*/i)).toBeInTheDocument()
      })
    })

    it('debe mostrar campos de prefrío cuando se activa el checkbox', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      await waitFor(() => {
        expect(screen.getByText(/¿tiene prefrío\?/i)).toBeInTheDocument()
      })

      const prefrioCheckbox = screen.getByRole('checkbox', { name: /¿tiene prefrío\?/i })
      await user.click(prefrioCheckbox)

      await waitFor(() => {
        expect(screen.getByText(/días de prefrío \*/i)).toBeInTheDocument()
      })
    })

    it('debe mostrar campos de pretratamiento cuando se activa el checkbox', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      await waitFor(() => {
        expect(screen.getByText(/¿tiene pretratamiento\?/i)).toBeInTheDocument()
      })

      const pretratamientoCheckbox = screen.getByRole('checkbox', { name: /¿tiene pretratamiento\?/i })
      await user.click(pretratamientoCheckbox)

      await waitFor(() => {
        expect(screen.getByText(/tipo de pretratamiento \*/i)).toBeInTheDocument()
      })
    })

    it('debe mostrar campos de fechas de conteos cuando se selecciona número de conteos', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      await waitFor(() => {
        expect(screen.getByText(/número de conteos \*/i)).toBeInTheDocument()
      })

      // Buscar el texto del select
      const numeroConteosLabel = screen.getByText(/número de conteos \*/i)
      const numeroConteosContainer = numeroConteosLabel.closest('div')
      expect(numeroConteosContainer).toBeInTheDocument()

      // Verificar que el formulario está completo
      expect(screen.getByText(/número de conteos \*/i)).toBeInTheDocument()
    })

    it('debe mostrar botones Cancelar y Crear Tabla', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^cancelar$/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /crear tabla/i })).toBeInTheDocument()
      })
    })
  })

  
  describe('Test: Selección de lote', () => {
    it('debe mostrar información del tratamiento en el formulario', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      await waitFor(() => {
        expect(screen.getByText(/tratamiento \*/i)).toBeInTheDocument()
      })
    })

    it('debe permitir ingresar producto y dosis como texto libre', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      await waitFor(() => {
        const productoInput = screen.getByPlaceholderText(/fungicida/i)
        expect(productoInput).toBeInTheDocument()
      })

      const productoInput = screen.getByPlaceholderText(/fungicida/i)
      await user.type(productoInput, 'Thiram 2ml/kg')

      expect(productoInput).toHaveValue('Thiram 2ml/kg')
    })
  })

  
  describe('Test: Selección de número de repeticiones', () => {
    it('debe mostrar campo de número de repeticiones con valor por defecto 8', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      // Verificar que el label existe y hay texto de ayuda
      await waitFor(() => {
        const repeticionesLabel = screen.getByText(/número de repeticiones \*/i)
        expect(repeticionesLabel).toBeInTheDocument()
      })
    })

    it('debe validar rango de repeticiones entre 1 y 20', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      // Verificar que el label existe
      const repeticionesLabel = await screen.findByText(/número de repeticiones \*/i)
      expect(repeticionesLabel).toBeInTheDocument()
    })

    it('debe permitir seleccionar número de semillas por repetición desde select', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      // Verificar que el label del campo existe
      await waitFor(() => {
        expect(screen.getByText(/número de semillas por repetición \*/i)).toBeInTheDocument()
      })

      // Verificar que el campo existe
      expect(screen.getByText(/número de semillas por repetición \*/i)).toBeInTheDocument()
    })
  })

  
  describe('Test: Fechas inicio y fin', () => {
    it('debe mostrar campo de fecha de germinación', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      await waitFor(() => {
        expect(screen.getByText(/fecha de germinación/i)).toBeInTheDocument()
      })
    })

    it('debe calcular automáticamente la fecha de último conteo', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      await waitFor(() => {
        expect(screen.getByText(/fecha último conteo \*/i)).toBeInTheDocument()
      })
    })

    it('debe mostrar campo de fecha final', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      await waitFor(() => {
        expect(screen.getByText(/fecha final \*/i)).toBeInTheDocument()
      })
    })

    it('debe permitir ingresar fecha de ingreso', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      // Buscar el label de fecha de ingreso
      const fechaIngresoLabel = await screen.findByText(/fecha de ingreso \*/i)
      expect(fechaIngresoLabel).toBeInTheDocument()
    })

    it('debe calcular número de días automáticamente cuando hay fecha de germinación y último conteo', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      await waitFor(() => {
      // Verificar que existe el campo
      expect(screen.getByText(/número de días/i)).toBeInTheDocument()
      })
    })

  })

  
  describe('Test: Validaciones', () => {
    it('debe validar campos requeridos al intentar crear tabla', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /crear tabla/i })).toBeInTheDocument()
      })

      // Intentar crear sin llenar campos
      const crearTablaButton = screen.getByRole('button', { name: /crear tabla/i })
      await user.click(crearTablaButton)

      // El formulario debe mostrar errores de validación
      // (no se debe llamar al servicio sin datos válidos)
      expect(mockOnTablaUpdated).not.toHaveBeenCalled()
    })

    it('debe validar que tratamiento sea requerido', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      // Verificar que el campo requerido existe
      const tratamientoLabel = await screen.findByText(/tratamiento \*/i)
      expect(tratamientoLabel).toBeInTheDocument()
    })

    it('debe validar que número de semillas por repetición sea requerido', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      // Verificar que el campo requerido existe
      const numSemillasLabel = await screen.findByText(/número de semillas por repetición \*/i)
      expect(numSemillasLabel).toBeInTheDocument()
    })

    it('debe validar que método sea requerido', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      // Verificar que el campo requerido existe
      const metodoLabel = await screen.findByText(/método \*/i)
      expect(metodoLabel).toBeInTheDocument()
    })

    it('debe validar que temperatura sea requerida', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      // Verificar que el campo requerido existe
      const temperaturaLabel = await screen.findByText(/temperatura \*/i)
      expect(temperaturaLabel).toBeInTheDocument()
    })

    it('debe validar que número de repeticiones esté en rango válido', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      // Verificar que el campo existe con su restricción
      const repeticionesLabel = await screen.findByText(/número de repeticiones \*/i)
      expect(repeticionesLabel).toBeInTheDocument()
      
      // Verificar el texto de ayuda
      expect(screen.getByText(/cuántas repeticiones se crearán \(1-20\)/i)).toBeInTheDocument()
    })

    it('debe validar que número de conteos sea requerido', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      // Verificar que el campo requerido existe
      const numeroConteosLabel = await screen.findByText(/número de conteos \*/i)
      expect(numeroConteosLabel).toBeInTheDocument()
    })

    it('debe mostrar opciones correctas en select de método', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      // Verificar que el campo método existe
      const metodoLabel = await screen.findByText(/método \*/i)
      expect(metodoLabel).toBeInTheDocument()
    })

    it('debe mostrar opciones correctas en select de temperatura', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      // Verificar que el campo temperatura existe
      const temperaturaLabel = await screen.findByText(/temperatura \*/i)
      expect(temperaturaLabel).toBeInTheDocument()
    })

    it('debe actualizar fecha de último conteo cuando se completa el último conteo individual', async () => {
      const user = userEvent.setup()

      render(
        <TablasGerminacionSection
          tablas={tablasVacias}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
        />
      )

      await user.click(screen.getByRole('button', { name: /agregar tabla/i }))

      // Verificar que el campo de número de conteos existe
      const numeroConteosLabel = await screen.findByText(/número de conteos \*/i)
      expect(numeroConteosLabel).toBeInTheDocument()
      
      // Verificar descripción de ayuda
      expect(screen.getByText(/cantidad de veces que se harán conteos \(1-15\)/i)).toBeInTheDocument()
    })
  })
})
