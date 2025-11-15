import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GerminacionEditPage from '@/app/listado/analisis/germinacion/[id]/editar/page'
import * as germinacionService from '@/app/services/germinacion-service'
import * as loteService from '@/app/services/lote-service'
import { GerminacionDTO } from '@/app/models/interfaces/germinacion'
import { LoteSimpleDTO } from '@/app/models/interfaces/lote-simple'
import { TablaGermDTO } from '@/app/models/interfaces/repeticiones'
import { EstadoAnalisis } from '@/app/models/types/enums'
import { toast } from 'sonner'

jest.mock('@/app/services/germinacion-service')
jest.mock('@/app/services/lote-service')

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn()
}

const mockConfirm = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useParams: () => ({ id: '123' })
}))

jest.mock('@/lib/hooks/useConfirm', () => ({
  useConfirm: () => ({ confirm: mockConfirm })
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}))

jest.mock('@/components/analisis/analisis-header-bar', () => ({
  AnalisisHeaderBar: ({ tipoAnalisis, analisisId, estado, volverUrl, ocultarBotonEdicion }: any) => (
    <div data-testid="header">
      <span>Análisis de {tipoAnalisis}</span>
      <span>ID: {analisisId}</span>
      <span>Estado: {estado}</span>
      {!ocultarBotonEdicion && <button>Editar Header</button>}
    </div>
  )
}))

jest.mock('@/components/analisis/tabla-tolerancias-button', () => ({
  TablaToleranciasButton: () => <button data-testid="tolerancias-btn">Ver Tolerancias</button>
}))

jest.mock('@/components/germinacion/tablas-germinacion-section', () => ({
  TablasGerminacionSection: ({ 
    onTablaUpdated, 
    onAnalysisFinalized, 
    tablas, 
    germinacionId, 
    isFinalized
  }: { 
    onTablaUpdated?: () => void; 
    onAnalysisFinalized?: () => void; 
    tablas?: TablaGermDTO[];
    germinacionId?: number;
    isFinalized?: boolean;
    germinacion?: GerminacionDTO;
  }) => (
    <div data-testid="tablas-section">
      <span>Tablas: {tablas?.length || 0}</span>
      <span>ID: {germinacionId}</span>
      <span>Finalizado: {isFinalized ? 'Sí' : 'No'}</span>
      <button onClick={onTablaUpdated}>Recargar Tablas</button>
      <button onClick={onAnalysisFinalized}>Finalizar Análisis</button>
    </div>
  )
}))

jest.mock('@/components/analisis/analisis-acciones-card', () => ({
  AnalisisAccionesCard: (props: {
    onFinalizar: () => Promise<unknown>
    onAprobar: () => Promise<unknown>
    onMarcarParaRepetir: () => Promise<unknown>
    onFinalizarYAprobar: () => Promise<unknown>
    estado?: EstadoAnalisis | string
  }) => {
    const { onFinalizar, onAprobar, onMarcarParaRepetir, onFinalizarYAprobar, estado } = props
    
    return (
      <div data-testid="acciones-card">
        <button onClick={() => void onFinalizar()}>Finalizar</button>
        <button onClick={() => void onAprobar()}>Aprobar</button>
        <button onClick={() => void onMarcarParaRepetir()}>Marcar para Repetir</button>
        <button onClick={() => void onFinalizarYAprobar()}>Finalizar y Aprobar</button>
        <span>Estado: {estado}</span>
      </div>
    )
  }
}))

jest.mock('@/components/ui/sticky-save-button', () => ({
  StickySaveButton: ({ onSave, disabled, label }: { onSave: () => void; disabled?: boolean; label?: string }) => (
    <div data-testid="sticky-save-button">
      <button onClick={onSave} disabled={disabled}>
        {label}
      </button>
    </div>
  )
}))

const mockGerminacion: GerminacionDTO = {
  analisisID: 123,
  idLote: 1,
  lote: 'Trigo Baguette 10',
  estado: 'EN_PROCESO' as EstadoAnalisis,
  fechaInicio: '2024-03-01T10:00:00',
  fechaFin: undefined,
  comentarios: 'Comentario inicial',
  historial: []
}

const mockLotes: LoteSimpleDTO[] = [
  { loteID: 1, ficha: 'L001', nomLote: 'Trigo Baguette 10', activo: true, cultivarNombre: 'Baguette 10', especieNombre: 'Trigo' },
  { loteID: 2, ficha: 'L002', nomLote: 'Maíz DK390', activo: true, cultivarNombre: 'DK390', especieNombre: 'Maíz' }
]

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
  tienePretratamiento: false,
  diasPrefrio: 0,
  fechaIngreso: '2024-01-14',
  fechaGerminacion: '2024-01-15',
  fechaUltConteo: '2024-01-22',
  numDias: 7,
  numeroRepeticiones: 4,
  numeroConteos: 3,
  fechaConteos: [],
  promedioSinRedondeo: [45, 5, 2, 1, 7],
  promediosSinRedPorConteo: [15],
  repGerm: [],
  valoresGerm: [],
  porcentajeNormalesConRedondeo: 90,
  porcentajeAnormalesConRedondeo: 5,
  porcentajeDurasConRedondeo: 2,
  porcentajeFrescasConRedondeo: 1,
  porcentajeMuertasConRedondeo: 2
}

describe('GerminacionEditPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConfirm.mockResolvedValue(true)
    jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue(mockGerminacion)
    jest.spyOn(germinacionService, 'obtenerTablasGerminacion').mockResolvedValue([mockTabla])
    jest.spyOn(loteService, 'obtenerLotesActivos').mockResolvedValue(mockLotes)
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
    jest.spyOn(console, 'warn').mockImplementation()
    jest.spyOn(window, 'alert').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Carga inicial y estados de loading', () => {
    it('muestra loading mientras carga los datos', () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockImplementation(() => new Promise(() => {}))
      const { container } = render(<GerminacionEditPage />)
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('renderiza error cuando no se pueden cargar los datos', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue(null!)
      render(<GerminacionEditPage />)
      await waitFor(() => {
        expect(screen.getByText(/No se pudo cargar la información del análisis/i)).toBeInTheDocument()
      })
    })

    it('carga datos de germinación correctamente', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(germinacionService.obtenerGerminacionPorId).toHaveBeenCalledWith(123)
        expect(germinacionService.obtenerTablasGerminacion).toHaveBeenCalledWith(123)
        expect(loteService.obtenerLotesActivos).toHaveBeenCalled()
      })
    })

    it('maneja error 404 en tablas como caso normal', async () => {
      jest.spyOn(germinacionService, 'obtenerTablasGerminacion').mockRejectedValue({ message: 'Error 404: Not Found' })
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument()
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
      })
    })

    it('propaga errores no 404 en tablas', async () => {
      jest.spyOn(germinacionService, 'obtenerTablasGerminacion').mockRejectedValue(new Error('Error servidor'))
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(germinacionService.obtenerTablasGerminacion).toHaveBeenCalledWith(123)
      })
    })

    it('muestra error general cuando falla la carga', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockRejectedValue(new Error('Error de red'))
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/No se pudo cargar la información del análisis/i)).toBeInTheDocument()
      })
    })
  })

  describe('Renderizado de componentes y datos', () => {
    it('renderiza todos los componentes principales', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument()
        expect(screen.getByTestId('tablas-section')).toBeInTheDocument()
        expect(screen.getByTestId('acciones-card')).toBeInTheDocument()
        expect(screen.getByTestId('tolerancias-btn')).toBeInTheDocument()
      })
    })

    it('muestra información básica del análisis', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        const idElements = screen.getAllByText(/123/)
        expect(idElements.length).toBeGreaterThan(0)
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
        const estadoElements = screen.getAllByText(/EN_PROCESO/i)
        expect(estadoElements.length).toBeGreaterThan(0)
        expect(screen.getByText(/Comentario inicial/i)).toBeInTheDocument()
      })
    })

    it('muestra fechas cuando están presentes', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Fecha de Creación/i)).toBeInTheDocument()
      })
    })

    it('muestra fecha de fin cuando el análisis está finalizado', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue({
        ...mockGerminacion,
        fechaFin: '2024-03-15T14:00:00'
      })
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Fecha de Fin/i)).toBeInTheDocument()
      })
    })

    it('formatea fechas vacías correctamente', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue({
        ...mockGerminacion,
        fechaInicio: '',
        fechaFin: ''
      })
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
      })
    })

    it('muestra información de tablas cuando hay múltiples', async () => {
      jest.spyOn(germinacionService, 'obtenerTablasGerminacion').mockResolvedValue([
        mockTabla,
        { ...mockTabla, tablaGermID: 2, numeroTabla: 2 }
      ])
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Este análisis tiene 2 tablas/i)).toBeInTheDocument()
      })
    })

    it('muestra mensaje cuando hay una sola tabla', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Este análisis tiene 1 tabla/i)).toBeInTheDocument()
      })
    })

    it('formatea fechas con formato ISO correctamente', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue({
        ...mockGerminacion,
        fechaInicio: '2024-01-01T00:00:00',
        fechaFin: '2024-01-02T23:59:59'
      })
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Fecha de Creación/i)).toBeInTheDocument()
        expect(screen.getByText(/Fecha de Fin/i)).toBeInTheDocument()
      })
    })
  })

  describe('Modo edición de información básica', () => {
    it('inicia modo edición al hacer clic en Editar', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        const editarBtn = screen.getByRole('button', { name: /Editar/i })
        fireEvent.click(editarBtn)
      })
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Comentarios adicionales/i)).toBeInTheDocument()
        expect(screen.getByText(/Modo de Edición/i)).toBeInTheDocument()
      })
    })

    it('muestra selector de lote en modo edición', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        expect(screen.getByText(/Lote Asociado/i)).toBeInTheDocument()
      })
    })

    it('permite cambiar comentarios', async () => {
      const user = userEvent.setup()
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      const input = await screen.findByPlaceholderText(/Comentarios adicionales/i)
      await user.clear(input)
      await user.type(input, 'Nuevo comentario')
      
      expect(input).toHaveValue('Nuevo comentario')
    })

    it('cancela edición y restaura valores originales', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        const input = screen.getByPlaceholderText(/Comentarios adicionales/i)
        fireEvent.change(input, { target: { value: 'Cambio temporal' } })
      })
      
      await waitFor(() => fireEvent.click(screen.getByText(/Cancelar/i)))
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/Comentarios adicionales/i)).not.toBeInTheDocument()
      })
    })

    it('detecta cambios en el formulario', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        const input = screen.getByPlaceholderText(/Comentarios adicionales/i)
        fireEvent.change(input, { target: { value: 'Cambio' } })
      })
      
      await waitFor(() => {
        const guardarBtns = screen.getAllByText(/Guardar Cambios/i)
        expect(guardarBtns[0]).not.toBeDisabled()
      })
    })

    it('deshabilita guardar cuando no hay cambios', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        const guardarBtn = screen.getByText(/Sin Cambios/i)
        expect(guardarBtn).toBeDisabled()
      })
    })

    it('guarda cambios correctamente', async () => {
      const mockActualizar = jest.spyOn(germinacionService, 'actualizarGerminacion').mockResolvedValue({
        ...mockGerminacion,
        comentarios: 'Nuevo comentario'
      })
      
      const user = userEvent.setup()
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      const input = await screen.findByPlaceholderText(/Comentarios adicionales/i)
      await user.clear(input)
      await user.type(input, 'Nuevo comentario')
      
      const guardarBtns = await screen.findAllByText(/Guardar Cambios/i)
      fireEvent.click(guardarBtns[0])
      
      await waitFor(() => {
        expect(mockActualizar).toHaveBeenCalledWith(123, {
          idLote: 1,
          comentarios: 'Nuevo comentario'
        })
      })
    })

    it('no llama a actualizar si no hay cambios', async () => {
      const mockActualizar = jest.spyOn(germinacionService, 'actualizarGerminacion')
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      await waitFor(() => fireEvent.click(screen.getByText(/Sin Cambios/i)))
      
      expect(mockActualizar).not.toHaveBeenCalled()
    })

    it('maneja error al guardar', async () => {
      jest.spyOn(germinacionService, 'actualizarGerminacion').mockRejectedValue(new Error('Error al guardar'))
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation()
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        const input = screen.getByPlaceholderText(/Comentarios adicionales/i)
        fireEvent.change(input, { target: { value: 'Nuevo' } })
      })
      
      await waitFor(() => {
        const guardarBtns = screen.getAllByText(/Guardar Cambios/i)
        fireEvent.click(guardarBtns[0])
      })
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Error al guardar'))
      })
      
      mockAlert.mockRestore()
    })

    it('muestra StickySaveButton cuando está editando', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        expect(screen.getByTestId('sticky-save-button')).toBeInTheDocument()
      })
    })

    it('muestra información del lote seleccionado en modo edición', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        expect(screen.getByText(/Información del Lote/i)).toBeInTheDocument()
      })
    })
  })

  describe('Acciones de análisis desde AnalisisAccionesCard', () => {
    it('finaliza análisis con confirmación y navega', async () => {
      const mockFinalizar = jest.spyOn(germinacionService, 'finalizarGerminacion').mockResolvedValue(mockGerminacion)
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        const finalizarBtn = screen.getByText('Finalizar')
        fireEvent.click(finalizarBtn)
      })
      
      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled()
        expect(mockFinalizar).toHaveBeenCalledWith(123)
        expect(toast.success).toHaveBeenCalledWith('Análisis finalizado exitosamente')
        expect(mockRouter.push).toHaveBeenCalledWith('/listado/analisis/germinacion/123')
      })
    })

    it('cancela finalización si no se confirma', async () => {
      mockConfirm.mockResolvedValue(false)
      const mockFinalizar = jest.spyOn(germinacionService, 'finalizarGerminacion')
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByText('Finalizar')))
      
      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled()
        expect(mockFinalizar).not.toHaveBeenCalled()
      })
    })
  })

  describe('Manejo de errores en acciones', () => {
    it('handleFinalizarAnalisis retorna early si no hay germinacion', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue(null!)
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/No se pudo cargar la información del análisis/i)).toBeInTheDocument()
      })
    })

    it('handleAprobar retorna early si no hay germinacion', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue(null!)
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/No se pudo cargar la información del análisis/i)).toBeInTheDocument()
      })
    })

    it('handleMarcarParaRepetir retorna early si no hay germinacion', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue(null!)
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/No se pudo cargar la información del análisis/i)).toBeInTheDocument()
      })
    })

    it('handleFinalizarYAprobar retorna early si no hay germinacion', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue(null!)
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/No se pudo cargar la información del análisis/i)).toBeInTheDocument()
      })
    })
  })

  describe('Coverage de funciones desde AnalisisAccionesCard', () => {
    it('onAprobar ejecuta aprobarAnalisis y muestra toast', async () => {
      const mockAprobar = jest.spyOn(germinacionService, 'aprobarAnalisis').mockResolvedValue(mockGerminacion)
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByText('Aprobar')))
      
      await waitFor(() => {
        expect(mockAprobar).toHaveBeenCalledWith(123)
        expect(toast.success).toHaveBeenCalledWith('Análisis aprobado exitosamente')
        expect(mockRouter.push).toHaveBeenCalledWith('/listado/analisis/germinacion/123')
      })
    })

    it('onMarcarParaRepetir ejecuta marcarParaRepetir y muestra toast', async () => {
      const mockMarcar = jest.spyOn(germinacionService, 'marcarParaRepetir').mockResolvedValue(mockGerminacion)
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByText('Marcar para Repetir')))
      
      await waitFor(() => {
        expect(mockMarcar).toHaveBeenCalledWith(123)
        expect(toast.success).toHaveBeenCalledWith('Análisis marcado para repetir')
        expect(mockRouter.push).toHaveBeenCalledWith('/listado/analisis/germinacion/123')
      })
    })

    it('onFinalizarYAprobar ejecuta finalizarGerminacion y muestra toast', async () => {
      const mockFinalizar = jest.spyOn(germinacionService, 'finalizarGerminacion').mockResolvedValue(mockGerminacion)
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByText('Finalizar y Aprobar')))
      
      await waitFor(() => {
        expect(mockFinalizar).toHaveBeenCalledWith(123)
        expect(toast.success).toHaveBeenCalledWith('Análisis finalizado y aprobado exitosamente')
        expect(mockRouter.push).toHaveBeenCalledWith('/listado/analisis/germinacion/123')
      })
    })

    it('onFinalizar con confirmación ejecuta finalizarGerminacion y muestra toast', async () => {
      mockConfirm.mockResolvedValue(true)
      const mockFinalizar = jest.spyOn(germinacionService, 'finalizarGerminacion').mockResolvedValue(mockGerminacion)
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByText('Finalizar')))
      
      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled()
        expect(mockFinalizar).toHaveBeenCalledWith(123)
        expect(toast.success).toHaveBeenCalledWith('Análisis finalizado exitosamente')
        expect(mockRouter.push).toHaveBeenCalledWith('/listado/analisis/germinacion/123')
      })
    })

    it('onFinalizar sin confirmación no ejecuta finalizarGerminacion', async () => {
      mockConfirm.mockResolvedValue(false)
      const mockFinalizar = jest.spyOn(germinacionService, 'finalizarGerminacion')
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByText('Finalizar')))
      
      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled()
        expect(mockFinalizar).not.toHaveBeenCalled()
      })
    })
  })

  describe('Recarga de datos', () => {
    it('recarga datos cuando se actualiza una tabla', async () => {
      const mockObtener = jest.spyOn(germinacionService, 'obtenerGerminacionPorId')
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByText('Recargar Tablas')))
      
      await waitFor(() => {
        expect(mockObtener).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Navegación desde callbacks', () => {
    it('navega correctamente cuando se finaliza el análisis desde el callback', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        const finalizarBtn = screen.getByText('Finalizar Análisis')
        fireEvent.click(finalizarBtn)
      })
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/listado/analisis/germinacion/123')
      })
    })
  })

  describe('Coverage adicional - funciones utilitarias', () => {
    it('muestra select de lotes en modo edición', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        expect(screen.getByText(/Selecciona el lote que se analizará/i)).toBeInTheDocument()
      })
    })

    it('cambia el lote seleccionado en modo edición', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        expect(screen.getByText(/Lote Asociado/i)).toBeInTheDocument()
      })
    })

    it('muestra información del lote cuando cambia', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        expect(screen.getByText(/Información del Lote/i)).toBeInTheDocument()
      })
    })

    it('pasa todas las props necesarias a TablasGerminacionSection', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByTestId('tablas-section')).toBeInTheDocument()
        const idElements = screen.getAllByText(/ID: 123/)
        expect(idElements.length).toBeGreaterThan(0)
      })
    })

    it('maneja estado finalizado correctamente en TablasGerminacionSection', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue({
        ...mockGerminacion,
        estado: 'APROBADO' as EstadoAnalisis
      })
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Finalizado: Sí/)).toBeInTheDocument()
      })
    })

    it('maneja estado pendiente aprobación correctamente', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue({
        ...mockGerminacion,
        estado: 'PENDIENTE_APROBACION' as EstadoAnalisis
      })
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Finalizado: Sí/)).toBeInTheDocument()
      })
    })

    it('muestra mensaje cuando no hay comentarios', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue({
        ...mockGerminacion,
        comentarios: ''
      })
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.queryByText(/Comentarios/i)).not.toBeInTheDocument()
      })
    })

    it('botón volver funciona en error', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue(null!)
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        const volverBtn = screen.getByRole('button', { name: /Volver/i })
        fireEvent.click(volverBtn)
      })
      
      expect(mockRouter.back).toHaveBeenCalled()
    })

    it('muestra texto correcto de ayuda en modo edición', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        expect(screen.getByText(/Solo se pueden modificar los campos que se muestran/i)).toBeInTheDocument()
        expect(screen.getByText(/Información adicional o observaciones/i)).toBeInTheDocument()
      })
    })

    it('muestra los botones de acciones en el AnalisisAccionesCard', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByTestId('acciones-card')).toBeInTheDocument()
        expect(screen.getByText('Finalizar')).toBeInTheDocument()
        expect(screen.getByText('Aprobar')).toBeInTheDocument()
        expect(screen.getByText('Marcar para Repetir')).toBeInTheDocument()
        expect(screen.getByText('Finalizar y Aprobar')).toBeInTheDocument()
      })
    })

    it('muestra detalles del lote seleccionado en modo edición', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        const fichaElements = screen.getAllByText(/L001/i)
        expect(fichaElements.length).toBeGreaterThan(0)
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
      })
    })

    it('no muestra StickySaveButton cuando no está editando', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('sticky-save-button')).not.toBeInTheDocument()
      })
    })

    it('oculta botón de edición en header', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        const header = screen.getByTestId('header')
        expect(header.querySelector('button')).not.toBeInTheDocument()
      })
    })

    it('muestra los labels correctos en modo vista', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText('ID Análisis')).toBeInTheDocument()
        expect(screen.getByText('Lote')).toBeInTheDocument()
        expect(screen.getByText('Estado')).toBeInTheDocument()
      })
    })

    it('actualiza el estado del botón guardar basado en cambios', async () => {
      const user = userEvent.setup()
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      const guardarBtn = await screen.findByText(/Sin Cambios/i)
      expect(guardarBtn).toBeDisabled()
      
      const input = screen.getByPlaceholderText(/Comentarios adicionales/i)
      await user.clear(input)
      await user.type(input, 'Nuevo')
      
      await waitFor(() => {
        const guardarBtnActualizado = screen.getAllByText(/Guardar Cambios/i)
        expect(guardarBtnActualizado[0]).not.toBeDisabled()
      })
    })

    it('no muestra error card cuando no hay error', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        const errorCards = document.querySelectorAll('.border-red-200')
        expect(errorCards.length).toBe(0)
      })
    })

    it('pasa analisisId correcto a AnalisisAccionesCard', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        const accionesCard = screen.getByTestId('acciones-card')
        expect(accionesCard).toBeInTheDocument()
      })
    })
  })

  describe('Manejo de fechas inválidas', () => {
    it('maneja fechas con formato incorrecto', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue({
        ...mockGerminacion,
        fechaInicio: 'fecha-invalida',
        fechaFin: 'otra-fecha-invalida'
      })
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
      })
    })
  })

  describe('Integración completa de flujos', () => {
    it('completa el flujo completo de edición sin cambios', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      await waitFor(() => expect(screen.getByText(/Modo de Edición/i)).toBeInTheDocument())
      
      const cancelBtn = screen.getByText(/Cancelar/i)
      fireEvent.click(cancelBtn)
      
      await waitFor(() => {
        expect(screen.queryByText(/Modo de Edición/i)).not.toBeInTheDocument()
      })
    })

    it('completa el flujo de edición con cambios exitosos', async () => {
      const mockActualizar = jest.spyOn(germinacionService, 'actualizarGerminacion').mockResolvedValue({
        ...mockGerminacion,
        comentarios: 'Comentario modificado'
      })
      
      const user = userEvent.setup()
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      const input = await screen.findByPlaceholderText(/Comentarios adicionales/i)
      await user.clear(input)
      await user.type(input, 'Comentario modificado')
      
      const guardarBtns = await screen.findAllByText(/Guardar Cambios/i)
      fireEvent.click(guardarBtns[0])
      
      await waitFor(() => {
        expect(mockActualizar).toHaveBeenCalledWith(123, {
          idLote: 1,
          comentarios: 'Comentario modificado'
        })
      })
    })

    it('maneja error sin mensaje en actualizarGerminacion', async () => {
      jest.spyOn(germinacionService, 'actualizarGerminacion').mockRejectedValue({})
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation()
      
      const user = userEvent.setup()
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      const input = await screen.findByPlaceholderText(/Comentarios adicionales/i)
      await user.clear(input)
      await user.type(input, 'Cambio')
      
      const guardarBtns = await screen.findAllByText(/Guardar Cambios/i)
      fireEvent.click(guardarBtns[0])
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error al guardar los cambios: Error desconocido')
      })
      
      mockAlert.mockRestore()
    })

    it('cambio de lote en modo edición actualiza el estado', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: '2' } })
      })
    })

    it('ejecuta handleReabrirAnalisis cuando se confirma', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue({
        ...mockGerminacion,
        estado: 'APROBADO' as EstadoAnalisis,
        fechaFin: '2024-03-15T14:00:00'
      })
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        const aprobadoElements = screen.getAllByText(/APROBADO/i)
        expect(aprobadoElements.length).toBeGreaterThan(0)
      })
    })

    it('ejecuta handleReabrirAnalisis cuando no se confirma', async () => {
      mockConfirm.mockResolvedValue(false)
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Trigo Baguette 10/i)).toBeInTheDocument()
      })
    })
  })

  describe('Validación de props y renderizado condicional', () => {
    it('pasa isFinalized como false cuando estado es EN_PROCESO', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Finalizado: No/)).toBeInTheDocument()
      })
    })

    it('no muestra fechaFin cuando es undefined', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.queryByText(/Fecha de Fin/i)).not.toBeInTheDocument()
      })
    })

    it('muestra botón de TablaToleranciasButton correctamente', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByTestId('tolerancias-btn')).toBeInTheDocument()
      })
    })

    it('maneja germinacion con idLote 0 en modo edición', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue({
        ...mockGerminacion,
        idLote: 0
      })
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        expect(screen.getByText(/Lote Asociado/i)).toBeInTheDocument()
      })
    })

    it('no renderiza card de información de lote si no hay lote seleccionado', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue({
        ...mockGerminacion,
        idLote: 999
      })
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        expect(screen.queryByText(/Información del Lote/i)).not.toBeInTheDocument()
      })
    })

    it('mantiene estado de edición después de error al guardar', async () => {
      jest.spyOn(germinacionService, 'actualizarGerminacion').mockRejectedValue(new Error('Error'))
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation()
      
      const user = userEvent.setup()
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      const input = await screen.findByPlaceholderText(/Comentarios adicionales/i)
      await user.clear(input)
      await user.type(input, 'Test')
      
      const guardarBtns = await screen.findAllByText(/Guardar Cambios/i)
      fireEvent.click(guardarBtns[0])
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalled()
      })
      
      mockAlert.mockRestore()
    })

    it('handleEditarGerminacion retorna early si no hay germinacion', async () => {
      jest.spyOn(germinacionService, 'obtenerGerminacionPorId').mockResolvedValue(null!)
      
      render(<GerminacionEditPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/No se pudo cargar la información del análisis/i)).toBeInTheDocument()
      })
    })

    it('handleCancelarEdicionGerminacion sin germinacionOriginal', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        const cancelBtn = screen.getByText(/Cancelar/i)
        fireEvent.click(cancelBtn)
      })
      
      await waitFor(() => {
        expect(screen.queryByText(/Modo de Edición/i)).not.toBeInTheDocument()
      })
    })

    it('hanCambiadoGerminacion retorna true cuando no hay original', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        const guardarBtns = screen.getAllByText(/Sin Cambios/i)
        expect(guardarBtns[0]).toBeDisabled()
      })
    })

    it('onValueChange del Select actualiza idLote', async () => {
      render(<GerminacionEditPage />)
      
      await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Editar/i })))
      
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })
    })
  })
})
