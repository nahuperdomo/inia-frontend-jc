import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import GerminacionDetailPage from '@/app/listado/analisis/germinacion/[id]/page'
import { 
  obtenerGerminacionPorId,
  obtenerTablasGerminacion 
} from '@/app/services/germinacion-service'
import { GerminacionDTO } from '@/app/models/interfaces/germinacion'
import { TablaGermDTO, RepGermDTO } from '@/app/models/interfaces/repeticiones'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn()
  })
}))

// Mock the services
jest.mock('@/app/services/germinacion-service')
const mockedObtenerGerminacionPorId = obtenerGerminacionPorId as jest.MockedFunction<typeof obtenerGerminacionPorId>
const mockedObtenerTablasGerminacion = obtenerTablasGerminacion as jest.MockedFunction<typeof obtenerTablasGerminacion>

// Mock components
jest.mock('@/components/analisis/tabla-tolerancias-button', () => ({
  TablaToleranciasButton: ({ title }: { title: string }) => <button>{title}</button>
}))

jest.mock('@/components/analisis/analisis-info-general-card', () => ({
  AnalisisInfoGeneralCard: ({ analisisID }: { analisisID: number }) => (
    <div data-testid="analisis-info-general-card">Info General {analisisID}</div>
  )
}))

jest.mock('@/components/analisis/analysis-history-card', () => ({
  AnalysisHistoryCard: ({ analisisId }: { analisisId: number }) => (
    <div data-testid="analysis-history-card">History {analisisId}</div>
  )
}))

const mockGerminacion: GerminacionDTO = {
  analisisID: 1,
  estado: 'EN_PROCESO',
  lote: 'LOTE-001',
  ficha: 'FICHA-001',
  idLote: 10,
  cultivarNombre: 'Trigo Pan',
  especieNombre: 'Triticum aestivum',
  fechaInicio: '2024-01-15T10:00:00Z',
  fechaFin: undefined,
  comentarios: 'Análisis en proceso',
  historial: []
}

const mockRepeticion: RepGermDTO = {
  repGermID: 1,
  numRep: 1,
  normales: [10, 15, 20],
  anormales: 5,
  duras: 2,
  frescas: 1,
  muertas: 7,
  total: 50
}

const mockTabla: TablaGermDTO = {
  tablaGermID: 1,
  numeroTabla: 1,
  finalizada: false,
  metodo: 'Papel',
  temperatura: 25,
  numSemillasPRep: 50,
  total: 200,
  tratamiento: 'Sin tratamiento',
  productoYDosis: '',
  tienePrefrio: false,
  descripcionPrefrio: undefined,
  diasPrefrio: 0,
  tienePretratamiento: false,
  descripcionPretratamiento: undefined,
  fechaIngreso: '2024-01-14T10:00:00Z',
  fechaGerminacion: '2024-01-15T10:00:00Z',
  fechaUltConteo: '2024-01-22T10:00:00Z',
  fechaFinal: undefined,
  numDias: 7,
  numeroRepeticiones: 1,
  numeroConteos: 3,
  fechaConteos: ['2024-01-16T10:00:00Z', '2024-01-18T10:00:00Z', '2024-01-20T10:00:00Z'],
  promedioSinRedondeo: [45, 5, 2, 1, 7],
  promediosSinRedPorConteo: [15, 15, 15],
  repGerm: [mockRepeticion],
  valoresGerm: [{
    valorGermID: 1,
    instituto: 'INIA',
    normales: 90,
    anormales: 5,
    duras: 2,
    frescas: 1,
    muertas: 2,
    germinacion: 90
  }],
  porcentajeNormalesConRedondeo: 90,
  porcentajeAnormalesConRedondeo: 5,
  porcentajeDurasConRedondeo: 2,
  porcentajeFrescasConRedondeo: 1,
  porcentajeMuertasConRedondeo: 2
}

describe('GerminacionDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ===== LOADING STATES =====
  describe('Loading states', () => {
    it('debe mostrar loading spinner mientras carga los datos', () => {
      mockedObtenerGerminacionPorId.mockImplementation(() => new Promise(() => {}))
      mockedObtenerTablasGerminacion.mockImplementation(() => new Promise(() => {}))
      
      render(<GerminacionDetailPage />)
      
      expect(screen.getByText('Cargando análisis')).toBeInTheDocument()
      expect(screen.getByText('Obteniendo detalles de germinación...')).toBeInTheDocument()
    })
  })

  // ===== ERROR STATES =====
  describe('Error states', () => {
    it('debe mostrar error cuando falla obtenerGerminacionPorId', async () => {
      mockedObtenerGerminacionPorId.mockRejectedValue(new Error('Error de red'))
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('No se pudo cargar el análisis')).toBeInTheDocument()
      })
    })

    it('debe mostrar mensaje cuando germinacion es null', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(undefined as never)
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('No se pudo cargar el análisis')).toBeInTheDocument()
        expect(screen.getByText('El análisis solicitado no existe')).toBeInTheDocument()
      })
    })

    it('debe mostrar botón de volver en estado de error', async () => {
      mockedObtenerGerminacionPorId.mockRejectedValue(new Error('Error'))
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        const volverButtons = screen.getAllByText('Volver al listado')
        expect(volverButtons.length).toBeGreaterThan(0)
      })
    })
  })

  // ===== SUCCESSFUL DATA LOADING =====
  describe('Successful data loading', () => {
    it('debe cargar y mostrar la información de germinación correctamente', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Análisis de Germinación #1/i)).toBeInTheDocument()
      })
    })

    it('debe mostrar el estado del análisis con badge correcto', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('En Proceso')).toBeInTheDocument()
      })
    })

    it('debe mostrar ficha y lote correctamente', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        // Ficha muestra idLote (10) o analisisID si idLote es undefined
        const fichas = screen.getAllByText('10')
        expect(fichas.length).toBeGreaterThan(0)
        const lotes = screen.getAllByText('LOTE-001')
        expect(lotes.length).toBeGreaterThan(0)
      })
    })

    it('debe renderizar el componente AnalisisInfoGeneralCard', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByTestId('analisis-info-general-card')).toBeInTheDocument()
        expect(screen.getByText('Info General 1')).toBeInTheDocument()
      })
    })

    it('debe renderizar el componente AnalysisHistoryCard', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByTestId('analysis-history-card')).toBeInTheDocument()
        expect(screen.getByText('History 1')).toBeInTheDocument()
      })
    })

    it('debe mostrar botón de editar análisis', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Editar análisis')).toBeInTheDocument()
      })
    })

    it('debe mostrar TablaToleranciasButton', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Ver Tabla de Tolerancias')).toBeInTheDocument()
      })
    })
  })

  // ===== ESTADO BADGES =====
  describe('Estado badges', () => {
    it('debe mostrar badge correcto para estado APROBADO', async () => {
      const germinacionAprobada = { ...mockGerminacion, estado: 'APROBADO' as const }
      mockedObtenerGerminacionPorId.mockResolvedValue(germinacionAprobada)
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Aprobado')).toBeInTheDocument()
      })
    })

    it('debe mostrar badge correcto para estado PENDIENTE_APROBACION', async () => {
      const germinacionPendiente = { ...mockGerminacion, estado: 'PENDIENTE_APROBACION' as const }
      mockedObtenerGerminacionPorId.mockResolvedValue(germinacionPendiente)
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Pendiente de Aprobación')).toBeInTheDocument()
      })
    })

    it('debe mostrar badge correcto para estado PARA_REPETIR', async () => {
      const germinacionRepetir = { ...mockGerminacion, estado: 'A_REPETIR' as const }
      mockedObtenerGerminacionPorId.mockResolvedValue(germinacionRepetir)
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('A Repetir')).toBeInTheDocument()
      })
    })
  })

  // ===== TABLAS SECTION =====
  describe('Tablas section', () => {
    it('debe mostrar mensaje cuando no hay tablas', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('No hay tablas de germinación registradas')).toBeInTheDocument()
      })
    })

    it('debe mostrar el número correcto de tablas', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('1 tablas')).toBeInTheDocument()
      })
    })

    it('debe mostrar estadísticas de tablas finalizadas', async () => {
      const tablaFinalizada = { ...mockTabla, finalizada: true }
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([tablaFinalizada])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        const ones = screen.getAllByText('1')
        expect(ones.length).toBeGreaterThan(0)
        expect(screen.getByText('Tablas Finalizadas')).toBeInTheDocument()
      })
    })

    it('debe mostrar múltiples tablas correctamente', async () => {
      const tabla2 = { ...mockTabla, tablaGermID: 2, numeroTabla: 2 }
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla, tabla2])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('2 tablas')).toBeInTheDocument()
        expect(screen.getByText('Tabla 1')).toBeInTheDocument()
        expect(screen.getByText('Tabla 2')).toBeInTheDocument()
      })
    })
  })

  // ===== TABLA DETAILS =====
  describe('Tabla details', () => {
    it('debe mostrar información básica de la tabla', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Tabla 1')).toBeInTheDocument()
        expect(screen.getByText('Sin tratamiento')).toBeInTheDocument()
        expect(screen.getByText('Papel')).toBeInTheDocument()
      })
    })

    it('debe mostrar badge de estado de tabla', async () => {
      const tablaEnProceso = { ...mockTabla, finalizada: false }
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([tablaEnProceso])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        const enProcesoBadges = screen.getAllByText('En Proceso')
        // Debe haber al menos 2: uno en el badge del análisis y otro en el badge de la tabla
        expect(enProcesoBadges.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('debe mostrar badge Finalizada cuando tabla está finalizada', async () => {
      const tablaFinalizada = { ...mockTabla, finalizada: true }
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([tablaFinalizada])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        const finalizadaBadges = screen.getAllByText('Finalizada')
        expect(finalizadaBadges.length).toBeGreaterThan(0)
      })
    })

    it('debe mostrar temperatura correctamente', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/25°C/i)).toBeInTheDocument()
      })
    })

    it('debe mostrar número de semillas por repetición', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        const cincuenta = screen.getAllByText('50')
        expect(cincuenta.length).toBeGreaterThan(0)
        expect(screen.getByText('Semillas/Rep')).toBeInTheDocument()
      })
    })

    it('debe mostrar días de análisis', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/7 días/i)).toBeInTheDocument()
      })
    })

    it('debe mostrar información de prefrío cuando existe', async () => {
      const tablaConPrefrio = {
        ...mockTabla,
        tienePrefrio: true,
        descripcionPrefrio: 'Prefrío a 5°C',
        diasPrefrio: 3
      }
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([tablaConPrefrio])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        const siElements = screen.getAllByText('Sí')
        expect(siElements.length).toBeGreaterThan(0)
        expect(screen.getByText('Prefrío a 5°C')).toBeInTheDocument()
        expect(screen.getByText('(3 días)')).toBeInTheDocument()
      })
    })

    it('debe mostrar información de pretratamiento cuando existe', async () => {
      const tablaConPretratamiento = {
        ...mockTabla,
        tienePretratamiento: true,
        descripcionPretratamiento: 'Escarificación mecánica',
        diasPretratamiento: 1
      }
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([tablaConPretratamiento])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        const siElements = screen.getAllByText('Sí')
        expect(siElements.length).toBeGreaterThan(0)
        expect(screen.getByText('Escarificación mecánica')).toBeInTheDocument()
        expect(screen.getByText('(1 días)')).toBeInTheDocument()
      })
    })

    it('debe mostrar producto y dosis cuando existe', async () => {
      const tablaConProducto = {
        ...mockTabla,
        productoYDosis: 'Fungicida XYZ - 2ml/L'
      }
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([tablaConProducto])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Producto y Dosis')).toBeInTheDocument()
        expect(screen.getByText('Fungicida XYZ - 2ml/L')).toBeInTheDocument()
      })
    })
  })

  // ===== FECHAS Y CONTEOS =====
  describe('Fechas y conteos', () => {
    it('debe mostrar cronograma de conteos', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Cronograma de Conteos \(3\)/i)).toBeInTheDocument()
      })
    })

    it('debe mostrar el número correcto de conteos en el cronograma', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('C1')).toBeInTheDocument()
        expect(screen.getByText('C2')).toBeInTheDocument()
        expect(screen.getByText('C3')).toBeInTheDocument()
      })
    })
  })

  // ===== REPETICIONES =====
  describe('Repeticiones', () => {
    it('debe mostrar información de repeticiones', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Repeticiones de Tabla')).toBeInTheDocument()
        expect(screen.getByText('1 repeticiones')).toBeInTheDocument()
      })
    })

    it('debe mostrar datos de normales en las repeticiones', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        const diez = screen.getAllByText('10')
        expect(diez.length).toBeGreaterThan(0)
        const quince = screen.getAllByText('15')
        expect(quince.length).toBeGreaterThan(0)
        const veinte = screen.getAllByText('20')
        expect(veinte.length).toBeGreaterThan(0)
      })
    })

    it('debe mostrar múltiples repeticiones correctamente', async () => {
      const repeticion2: RepGermDTO = {
        repGermID: 2,
        numRep: 2,
        normales: [12, 14, 18],
        anormales: 4,
        duras: 1,
        frescas: 2,
        muertas: 9,
        total: 50
      }
      const tablaConMultiplesReps = {
        ...mockTabla,
        repGerm: [mockRepeticion, repeticion2]
      }
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([tablaConMultiplesReps])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('2 repeticiones')).toBeInTheDocument()
      })
    })
  })

  // ===== PROMEDIOS Y PORCENTAJES =====
  describe('Promedios y porcentajes', () => {
    it('debe mostrar promedios calculados de normales', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Promedios Calculados (Sin Redondeo)')).toBeInTheDocument()
        expect(screen.getByText('Promedio Normales')).toBeInTheDocument()
      })
    })

    it('debe mostrar porcentajes calculados', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Porcentajes Calculados (Sin Redondeo)')).toBeInTheDocument()
      })
    })

    it('debe mostrar porcentajes con redondeo cuando existen', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Porcentajes con Redondeo')).toBeInTheDocument()
        const noventa = screen.getAllByText('90%')
        expect(noventa.length).toBeGreaterThan(0)
        const cinco = screen.getAllByText('5%')
        expect(cinco.length).toBeGreaterThan(0)
        const dos = screen.getAllByText('2%')
        expect(dos.length).toBeGreaterThan(0)
        const uno = screen.getAllByText('1%')
        expect(uno.length).toBeGreaterThan(0)
      })
    })
  })

  // ===== VALORES INIA/INASE =====
  describe('Valores INIA/INASE', () => {
    it('debe mostrar valores de institutos cuando existen', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Valores INIA/INASE')).toBeInTheDocument()
        expect(screen.getByText('INIA')).toBeInTheDocument()
      })
    })

    it('debe mostrar porcentajes de germinación por instituto', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([mockTabla])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Germinación')).toBeInTheDocument()
      })
    })
  })

  // ===== NAVIGATION =====
  describe('Navigation', () => {
    it('debe tener link a la página de edición', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        const editButton = screen.getByText('Editar análisis')
        expect(editButton.closest('a')).toHaveAttribute('href', '/listado/analisis/germinacion/1/editar')
      })
    })

    it('debe tener botones de volver al listado', async () => {
      mockedObtenerGerminacionPorId.mockResolvedValue(mockGerminacion)
      mockedObtenerTablasGerminacion.mockResolvedValue([])
      
      render(<GerminacionDetailPage />)
      
      await waitFor(() => {
        const volverButtons = screen.getAllByText('Volver')
        expect(volverButtons.length).toBeGreaterThan(0)
      })
    })
  })
})
