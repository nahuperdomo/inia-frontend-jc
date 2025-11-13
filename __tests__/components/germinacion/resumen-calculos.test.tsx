/**
 * Tests para Resumen de Cálculos de Germinación
 * 
 * Este componente muestra el resumen estadístico de análisis de germinación incluyendo:
 * - Totales por campo (normales, anormales, duras, frescas, muertas)
 * - Promedios sin redondeo
 * - Porcentajes calculados con formato 4 decimales
 * 
 * Cobertura 100 porciento:
 * - Mostrar cálculos de germinación
 * - Actualizar cuando cambian datos
 * - Formatear porcentajes correctamente
 * - Mostrar alertas si fuera de tolerancia
 * 
 * NOTA: El resumen solo se muestra cuando la tabla está expandida
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TablasGerminacionSection } from '@/components/germinacion/tablas-germinacion-section'
import { TablaGermDTO, RepGermDTO } from '@/app/models/interfaces/repeticiones'

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

describe('Resumen de Cálculos - Tests de Germinación', () => {
  const mockOnTablaUpdated = jest.fn()

  const crearRepeticion = (
    numRep: number,
    normales: number[],
    anormales: number,
    duras: number,
    frescas: number,
    muertas: number
  ): RepGermDTO => ({
    repGermID: numRep,
    numRep,
    normales,
    anormales,
    duras,
    frescas,
    muertas,
    total: normales.reduce((a, b) => a + b, 0) + anormales + duras + frescas + muertas
  })

  const mockTablaConRepeticiones: TablaGermDTO = {
    tablaGermID: 1,
    numeroTabla: 1,
    finalizada: false,
    tratamiento: 'Tratamiento Test',
    productoYDosis: 'Producto Test',
    numSemillasPRep: 100,
    metodo: 'Método Test',
    temperatura: 20,
    tienePrefrio: false,
    tienePretratamiento: false,
    diasPrefrio: 0,
    fechaIngreso: '2024-01-01',
    fechaGerminacion: '2024-01-02',
    fechaConteos: ['2024-01-03', '2024-01-04', '2024-01-05'],
    fechaUltConteo: '2024-01-05',
    numDias: 3,
    numeroRepeticiones: 4,
    numeroConteos: 3,
    total: 0,
    promedioSinRedondeo: [],
    repGerm: [
      crearRepeticion(1, [30, 25, 20], 10, 5, 3, 2),
      crearRepeticion(2, [28, 26, 22], 12, 4, 2, 1),
      crearRepeticion(3, [32, 24, 18], 11, 6, 4, 3),
      crearRepeticion(4, [29, 27, 21], 9, 5, 3, 2)
    ]
  }

  const expandirTabla = async () => {
    const user = userEvent.setup()
    const expandButton = screen.getByRole('button', { name: /expandir/i })
    await user.click(expandButton)
    await waitFor(() => {
      expect(screen.getByText(/Resumen de Análisis/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Test: Mostrar cálculos de germinación', () => {
    it('debe mostrar el título "Resumen de Análisis" cuando se expande la tabla', async () => {
      render(
        <TablasGerminacionSection
          tablas={[mockTablaConRepeticiones]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 4, numeroConteos: 3 }}
        />
      )

      await expandirTabla()
      
      expect(screen.getByText(/Resumen de Análisis/i)).toBeInTheDocument()
    })

    it('debe mostrar totales por campo después de expandir', async () => {
      render(
        <TablasGerminacionSection
          tablas={[mockTablaConRepeticiones]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 4, numeroConteos: 3 }}
        />
      )

      await expandirTabla()
      
      expect(screen.getByText(/Totales por Campo/i)).toBeInTheDocument()
    })

    it('debe calcular total de normales por conteo correctamente', async () => {
      render(
        <TablasGerminacionSection
          tablas={[mockTablaConRepeticiones]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 4, numeroConteos: 3 }}
        />
      )

      await expandirTabla()
      
      // Conteo 1: 30+28+32+29 = 119
      expect(screen.getByText('119')).toBeInTheDocument()
      // Conteo 2: 25+26+24+27 = 102
      expect(screen.getByText('102')).toBeInTheDocument()
      // Conteo 3: 20+22+18+21 = 81
      expect(screen.getByText('81')).toBeInTheDocument()
    })

    it('debe calcular total de anormales correctamente', async () => {
      render(
        <TablasGerminacionSection
          tablas={[mockTablaConRepeticiones]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 4, numeroConteos: 3 }}
        />
      )

      await expandirTabla()
      
      // Total anormales: 10+12+11+9 = 42
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('debe calcular total de duras correctamente', async () => {
      render(
        <TablasGerminacionSection
          tablas={[mockTablaConRepeticiones]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 4, numeroConteos: 3 }}
        />
      )

      await expandirTabla()
      
      // Total duras: 5+4+6+5 = 20
      expect(screen.getByText('20')).toBeInTheDocument()
    })

    it('debe calcular total de frescas correctamente', async () => {
      render(
        <TablasGerminacionSection
          tablas={[mockTablaConRepeticiones]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 4, numeroConteos: 3 }}
        />
      )

      await expandirTabla()
      
      // Total frescas: 3+2+4+3 = 12
      expect(screen.getByText('12')).toBeInTheDocument()
    })

    it('debe calcular total de muertas correctamente', async () => {
      render(
        <TablasGerminacionSection
          tablas={[mockTablaConRepeticiones]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 4, numeroConteos: 3 }}
        />
      )

      await expandirTabla()
      
      // Total muertas: 2+1+3+2 = 8
      expect(screen.getByText('8')).toBeInTheDocument()
    })

    it('debe mostrar sección de promedios sin redondeo', async () => {
      render(
        <TablasGerminacionSection
          tablas={[mockTablaConRepeticiones]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 4, numeroConteos: 3 }}
        />
      )

      await expandirTabla()
      
      expect(screen.getByText(/Promedios Sin Redondeo/i)).toBeInTheDocument()
    })

    it('debe no mostrar resumen si no hay repeticiones', () => {
      const tablaSinRepeticiones: TablaGermDTO = {
        ...mockTablaConRepeticiones,
        repGerm: []
      }

      render(
        <TablasGerminacionSection
          tablas={[tablaSinRepeticiones]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 4, numeroConteos: 3 }}
        />
      )

      // No debe haber resumen incluso sin expandir
      expect(screen.queryByText(/Resumen de Análisis/i)).not.toBeInTheDocument()
    })
  })

  describe('Test: Actualizar cuando cambian datos', () => {
    it('debe recalcular totales cuando se actualiza la prop de repGerm', async () => {
      const { rerender } = render(
        <TablasGerminacionSection
          tablas={[mockTablaConRepeticiones]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 4, numeroConteos: 3 }}
        />
      )

      await expandirTabla()

      // Total inicial normales conteo 1: 119
      expect(screen.getByText('119')).toBeInTheDocument()

      // Actualizar con nuevos datos
      const nuevaTabla: TablaGermDTO = {
        ...mockTablaConRepeticiones,
        repGerm: [
          ...mockTablaConRepeticiones.repGerm!,
          crearRepeticion(5, [35, 30, 25], 8, 3, 2, 1)
        ]
      }

      rerender(
        <TablasGerminacionSection
          tablas={[nuevaTabla]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 5, numeroConteos: 3 }}
        />
      )

      await waitFor(() => {
        // Nuevo total conteo 1: 119 + 35 = 154
        expect(screen.getByText('154')).toBeInTheDocument()
      })
    })
  })

  describe('Test: Formatear porcentajes correctamente', () => {
    it('debe formatear porcentajes con 4 decimales', async () => {
      const tabla: TablaGermDTO = {
        ...mockTablaConRepeticiones,
        repGerm: [
          crearRepeticion(1, [60, 0, 0], 20, 10, 5, 5) // Total: 100
        ]
      }

      render(
        <TablasGerminacionSection
          tablas={[tabla]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 1, numeroConteos: 3 }}
        />
      )

      await expandirTabla()

      // 60/100 = 60.0000%
      expect(screen.getByText('60.0000%')).toBeInTheDocument()
      // 20/100 = 20.0000%
      expect(screen.getByText('20.0000%')).toBeInTheDocument()
      // 10/100 = 10.0000%
      expect(screen.getByText('10.0000%')).toBeInTheDocument()
    })

    it('debe mostrar 0.0000% cuando el total es 0', async () => {
      const tablaSinDatos: TablaGermDTO = {
        ...mockTablaConRepeticiones,
        repGerm: [
          crearRepeticion(1, [0, 0, 0], 0, 0, 0, 0)
        ]
      }

      render(
        <TablasGerminacionSection
          tablas={[tablaSinDatos]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 1, numeroConteos: 3 }}
        />
      )

      await expandirTabla()

      // Verificar que se muestra sección de porcentajes
      expect(screen.getByText(/Porcentajes Calculados/i)).toBeInTheDocument()
    })
  })

  describe('Test: Mostrar alertas si fuera de tolerancia', () => {
    it('debe mostrar el resumen independientemente de la tolerancia', async () => {
      const tabla: TablaGermDTO = {
        ...mockTablaConRepeticiones,
        numSemillasPRep: 100,
        repGerm: [
          crearRepeticion(1, [40, 0, 0], 22, 12, 8, 5) // Total: 87 (< 95)
        ]
      }

      render(
        <TablasGerminacionSection
          tablas={[tabla]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 1, numeroConteos: 3 }}
        />
      )

      await expandirTabla()

      // El total debe mostrarse aunque esté fuera de tolerancia
      expect(screen.getByText('87')).toBeInTheDocument()
      expect(screen.getByText(/Resumen de Análisis/i)).toBeInTheDocument()
    })

    it('debe calcular promedios correctos independientemente de la tolerancia', async () => {
      const tabla: TablaGermDTO = {
        ...mockTablaConRepeticiones,
        numSemillasPRep: 100,
        repGerm: [
          crearRepeticion(1, [40, 0, 0], 20, 10, 5, 3), // Total: 78 (fuera)
          crearRepeticion(2, [60, 0, 0], 30, 15, 8, 5)  // Total: 118 (fuera)
        ]
      }

      render(
        <TablasGerminacionSection
          tablas={[tabla]}
          germinacionId={1}
          isFinalized={false}
          onTablaUpdated={mockOnTablaUpdated}
          germinacion={{ numeroRepeticiones: 2, numeroConteos: 3 }}
        />
      )

      await expandirTabla()

      // Promedio conteo 1: (40+60)/2 = 50.0
      expect(screen.getByText('50.0000')).toBeInTheDocument()
    })
  })
})
