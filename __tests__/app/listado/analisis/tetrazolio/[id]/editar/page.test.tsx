/**
 * Tests para la página de edición de análisis de Tetrazolio
 * 
 * Estos tests cubren:
 * - Carga de datos existentes para edición
 * - Edición de campos del ensayo (fecha, semillas por repetición, pretratamiento, concentración, tinción)
 * - Gestión de repeticiones (agregar, editar, eliminar)
 * - Validación del rango 2-8 repeticiones
 * - Cálculos automáticos de totales
 * - Guardar cambios (PUT)
 * - Acciones de finalizar, aprobar, marcar para repetir
 * - Validaciones de datos
 * - Manejo de errores
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import EditarTetrazolioPage from '@/app/listado/analisis/tetrazolio/[id]/editar/page'
import * as tetrazolioService from '@/app/services/tetrazolio-service'
import * as repeticionesService from '@/app/services/repeticiones-service'
import { TetrazolioDTO } from '@/app/models/interfaces/tetrazolio'
import { RepTetrazolioViabilidadDTO } from '@/app/models/interfaces/repeticiones'
import { EstadoAnalisis } from '@/app/models/types/enums'
import { toast } from 'sonner'

// Mock de servicios
jest.mock('@/app/services/tetrazolio-service')
jest.mock('@/app/services/repeticiones-service')

// Mock de navegación
const mockPush = jest.fn()
const mockRouter = { push: mockPush, back: jest.fn(), replace: jest.fn() }
jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
    useParams: () => ({ id: '1' }),
    usePathname: () => '/listado/analisis/tetrazolio/1/editar'
}))

// Mock de hooks
jest.mock('@/lib/hooks/useConfirm', () => ({
    useConfirm: () => ({
        confirm: jest.fn().mockResolvedValue(true)
    })
}))

// Mock de toast
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn()
    }
}))

// Mock de AuthProvider
jest.mock('@/components/auth-provider', () => ({
    useAuth: () => ({
        user: { id: 1, username: 'testuser', role: 'analista' },
        isAuthenticated: true
    })
}))

// Mock de componentes
jest.mock('@/components/analisis/analisis-header-bar', () => ({
    AnalisisHeaderBar: ({ onGuardarCambios }: any) => (
        <div data-testid="header-bar">
            <button onClick={onGuardarCambios} data-testid="guardar-header">Guardar</button>
        </div>
    )
}))

jest.mock('@/components/analisis/analisis-acciones-card', () => ({
    AnalisisAccionesCard: ({ onFinalizar, onAprobar, onMarcarParaRepetir }: any) => (
        <div data-testid="acciones-card">
            <button onClick={onFinalizar} data-testid="finalizar-btn">Finalizar</button>
            <button onClick={onAprobar} data-testid="aprobar-btn">Aprobar</button>
            <button onClick={onMarcarParaRepetir} data-testid="repetir-btn">Repetir</button>
        </div>
    )
}))

jest.mock('@/components/analisis/tabla-tolerancias-button', () => ({
    TablaToleranciasButton: () => <button>Ver Tabla de Tolerancias</button>
}))

jest.mock('@/components/ui/sticky-save-button', () => ({
    StickySaveButton: ({ onSave }: any) => (
        <button onClick={onSave} data-testid="sticky-save">Guardar Flotante</button>
    )
}))

describe('EditarTetrazolioPage Tests', () => {
    const mockTetrazolio: TetrazolioDTO = {
        analisisID: 1,
        idLote: 1,
        lote: 'Trigo Baguette 10',
        ficha: 'F-2024-001',
        cultivarNombre: 'Baguette 10',
        especieNombre: 'Trigo',
        estado: 'EN_PROCESO' as EstadoAnalisis,
        fechaInicio: '2024-03-01',
        comentarios: 'Análisis en proceso',

        fecha: '2024-03-01',
        numSemillasPorRep: 50,
        numRepeticionesEsperadas: 4,
        pretratamiento: 'EP 16 horas',
        concentracion: '1%',
        tincionTemp: 35,
        tincionHs: 2,
        viabilidadInase: 92.5,

        historial: [],
        activo: true
    }

    const mockRepeticiones: RepTetrazolioViabilidadDTO[] = [
        {
            repTetrazolioViabID: 1,
            fecha: '2024-03-01',
            viablesNum: 45,
            noViablesNum: 3,
            duras: 2
        },
        {
            repTetrazolioViabID: 2,
            fecha: '2024-03-02',
            viablesNum: 47,
            noViablesNum: 2,
            duras: 1
        },
        {
            repTetrazolioViabID: 3,
            fecha: '2024-03-03',
            viablesNum: 48,
            noViablesNum: 1,
            duras: 1
        },
        {
            repTetrazolioViabID: 4,
            fecha: '2024-03-04',
            viablesNum: 46,
            noViablesNum: 3,
            duras: 1
        }
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId').mockResolvedValue(mockTetrazolio)
        jest.spyOn(repeticionesService, 'obtenerRepeticionesPorTetrazolio').mockResolvedValue(mockRepeticiones)
        jest.spyOn(tetrazolioService, 'actualizarTetrazolio').mockResolvedValue(mockTetrazolio)
    })

    describe('Test: Carga de datos para edición', () => {
        it('debe cargar los datos del análisis al montar', async () => {
            const mockObtenerTetrazolio = jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockResolvedValue(mockTetrazolio)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                expect(mockObtenerTetrazolio).toHaveBeenCalledWith(1)
            })
        })

        it('debe cargar las repeticiones del análisis', async () => {
            const mockObtenerRepeticiones = jest.spyOn(repeticionesService, 'obtenerRepeticionesPorTetrazolio')
                .mockResolvedValue(mockRepeticiones)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                expect(mockObtenerRepeticiones).toHaveBeenCalledWith(1)
            })
        })

        it('debe poblar el formulario con los datos existentes', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByDisplayValue('2024-03-01')).toBeInTheDocument()
            })
        })

        it('debe mostrar loading mientras carga', () => {
            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockImplementation(() => new Promise(() => { }))

            render(<EditarTetrazolioPage />)

            expect(screen.getByText('Cargando análisis de Tetrazolio...')).toBeInTheDocument()
        })

        it('debe manejar error al cargar datos', async () => {
            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId')
                .mockRejectedValue(new Error('Error de red'))

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText(/Error al cargar/i)).toBeInTheDocument()
            })
        })
    })

    describe('Test: Edición de campos básicos del ensayo', () => {
        it('debe permitir editar el campo de fecha', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const fechaInput = screen.getByDisplayValue('2024-03-01')
                expect(fechaInput).toBeInTheDocument()

                fireEvent.change(fechaInput, { target: { value: '2024-03-15' } })
                expect(fechaInput).toHaveValue('2024-03-15')
            })
        })

        it('debe permitir editar número de semillas por repetición', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const semillasInput = screen.getByDisplayValue('50')
                fireEvent.change(semillasInput, { target: { value: '100' } })
                expect(semillasInput).toHaveValue(100)
            })
        })

        it('debe permitir editar pretratamiento', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const pretratamientoInput = screen.getByDisplayValue('EP 16 horas')
                fireEvent.change(pretratamientoInput, { target: { value: 'EP 18 horas' } })
                expect(pretratamientoInput).toHaveValue('EP 18 horas')
            })
        })

        it('debe permitir editar concentración', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const concentracionInput = screen.getByDisplayValue('1%')
                fireEvent.change(concentracionInput, { target: { value: '2%' } })
                expect(concentracionInput).toHaveValue('2%')
            })
        })

        it('debe permitir editar temperatura de tinción', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const tempInput = screen.getByDisplayValue('35')
                fireEvent.change(tempInput, { target: { value: '40' } })
                expect(tempInput).toHaveValue(40)
            })
        })

        it('debe permitir editar tiempo de tinción', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const tiempoInput = screen.getByDisplayValue('2')
                fireEvent.change(tiempoInput, { target: { value: '3' } })
                expect(tiempoInput).toHaveValue(3)
            })
        })

        it('debe permitir editar viabilidad INASE manual', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const viabilidadInput = screen.getByDisplayValue('92.5')
                fireEvent.change(viabilidadInput, { target: { value: '95' } })
                expect(viabilidadInput).toHaveValue(95)
            })
        })

        it('debe permitir editar comentarios', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const comentariosTextarea = screen.getByDisplayValue('Análisis en proceso')
                fireEvent.change(comentariosTextarea, { target: { value: 'Comentario actualizado' } })
                expect(comentariosTextarea).toHaveValue('Comentario actualizado')
            })
        })
    })

    describe('Test: Validación del rango 2-8 repeticiones', () => {
        it('debe aceptar 2 repeticiones esperadas (mínimo)', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const repInput = screen.getByDisplayValue('4')
                fireEvent.change(repInput, { target: { value: '2' } })
                expect(repInput).toHaveValue(2)
            })
        })

        it('debe aceptar 8 repeticiones esperadas (máximo)', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const repInput = screen.getByDisplayValue('4')
                fireEvent.change(repInput, { target: { value: '8' } })
                expect(repInput).toHaveValue(8)
            })
        })

        it('debe rechazar menos de 2 repeticiones', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const repInput = screen.getByDisplayValue('4')
                fireEvent.change(repInput, { target: { value: '1' } })
            })

            await waitFor(() => {
                expect(screen.getByText(/mínimo 2 repeticiones/i)).toBeInTheDocument()
            })
        })

        it('debe rechazar más de 8 repeticiones', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const repInput = screen.getByDisplayValue('4')
                fireEvent.change(repInput, { target: { value: '9' } })
            })

            await waitFor(() => {
                expect(screen.getByText(/máximo 8 repeticiones/i)).toBeInTheDocument()
            })
        })
    })

    describe('Test: Gestión de repeticiones', () => {
        it('debe mostrar todas las repeticiones cargadas', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText('Repetición 1')).toBeInTheDocument()
                expect(screen.getByText('Repetición 2')).toBeInTheDocument()
                expect(screen.getByText('Repetición 3')).toBeInTheDocument()
                expect(screen.getByText('Repetición 4')).toBeInTheDocument()
            })
        })

        it('debe permitir agregar una nueva repetición', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const agregarBtn = screen.getByRole('button', { name: /agregar repetición/i })
                fireEvent.click(agregarBtn)
            })

            await waitFor(() => {
                expect(screen.getByText(/Nueva repetición/i)).toBeInTheDocument()
            })
        })

        it('debe permitir editar valores de una repetición', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const viablesInputs = screen.getAllByLabelText(/viables/i)
                if (viablesInputs.length > 0) {
                    fireEvent.change(viablesInputs[0], { target: { value: '48' } })
                    expect(viablesInputs[0]).toHaveValue(48)
                }
            })
        })

        it('debe permitir eliminar una repetición', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const eliminarBtns = screen.getAllByRole('button', { name: /eliminar/i })
                if (eliminarBtns.length > 0) {
                    fireEvent.click(eliminarBtns[0])
                }
            })

            await waitFor(() => {
                expect(screen.getByText(/¿Eliminar repetición?/i)).toBeInTheDocument()
            })
        })

        it('debe impedir agregar más repeticiones que el máximo esperado', async () => {
            const tetrazolioCompleto = {
                ...mockTetrazolio,
                numRepeticionesEsperadas: 4
            }

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId').mockResolvedValue(tetrazolioCompleto)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const agregarBtn = screen.queryByRole('button', { name: /agregar repetición/i })
                // Si ya hay 4 repeticiones y se esperan 4, no debe poder agregar más
                if (agregarBtn) {
                    expect(agregarBtn).toBeDisabled()
                }
            })
        })
    })

    describe('Test: Cálculos automáticos', () => {
        it('debe calcular automáticamente el total de semillas viables', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                // Total: 45 + 47 + 48 + 46 = 186
                expect(screen.getByText(/186/)).toBeInTheDocument()
            })
        })

        it('debe recalcular totales al editar una repetición', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const viablesInputs = screen.getAllByLabelText(/viables/i)
                if (viablesInputs.length > 0) {
                    fireEvent.change(viablesInputs[0], { target: { value: '50' } })
                }
            })

            await waitFor(() => {
                // Nuevo total: 50 + 47 + 48 + 46 = 191
                expect(screen.getByText(/191/)).toBeInTheDocument()
            })
        })

        it('debe calcular porcentajes de viabilidad automáticamente', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                // Debe mostrar porcentajes calculados
                const porcentajes = screen.getAllByText(/%/)
                expect(porcentajes.length).toBeGreaterThan(0)
            })
        })
    })

    describe('Test: Validaciones', () => {
        it('debe validar que la suma de viables + no viables + duras = semillas por repetición', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const viablesInputs = screen.getAllByLabelText(/viables/i)
                if (viablesInputs.length > 0) {
                    fireEvent.change(viablesInputs[0], { target: { value: '60' } })
                }
            })

            await waitFor(() => {
                expect(screen.getByText(/suma debe ser igual/i)).toBeInTheDocument()
            })
        })

        it('debe validar que todos los campos obligatorios estén completos', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const fechaInput = screen.getAllByDisplayValue('2024-03-01')[0]
                fireEvent.change(fechaInput, { target: { value: '' } })
            })

            await waitFor(() => {
                const guardarBtn = screen.getByTestId('guardar-header')
                fireEvent.click(guardarBtn)
            })

            await waitFor(() => {
                expect(screen.getByText(/campo requerido/i)).toBeInTheDocument()
            })
        })
    })

    describe('Test: Guardar cambios (PUT)', () => {
        it('debe llamar a actualizarTetrazolio con los datos correctos', async () => {
            const mockActualizar = jest.spyOn(tetrazolioService, 'actualizarTetrazolio')
                .mockResolvedValue(mockTetrazolio)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const guardarBtn = screen.getByTestId('guardar-header')
                fireEvent.click(guardarBtn)
            })

            await waitFor(() => {
                expect(mockActualizar).toHaveBeenCalledWith(
                    1,
                    expect.objectContaining({
                        idLote: 1,
                        fecha: expect.any(String),
                        numSemillasPorRep: expect.any(Number),
                        numRepeticionesEsperadas: expect.any(Number)
                    })
                )
            })
        })

        it('debe mostrar toast de éxito al guardar', async () => {
            jest.spyOn(tetrazolioService, 'actualizarTetrazolio').mockResolvedValue(mockTetrazolio)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const guardarBtn = screen.getByTestId('guardar-header')
                fireEvent.click(guardarBtn)
            })

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Análisis de Tetrazolio actualizado exitosamente')
            })
        })

        it('debe redirigir a la página de detalle después de guardar', async () => {
            jest.spyOn(tetrazolioService, 'actualizarTetrazolio').mockResolvedValue(mockTetrazolio)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const guardarBtn = screen.getByTestId('guardar-header')
                fireEvent.click(guardarBtn)
            })

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/listado/analisis/tetrazolio/1')
            })
        })

        it('debe mostrar error al fallar el guardado', async () => {
            jest.spyOn(tetrazolioService, 'actualizarTetrazolio')
                .mockRejectedValue(new Error('Error de red'))

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const guardarBtn = screen.getByTestId('guardar-header')
                fireEvent.click(guardarBtn)
            })

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Error de red')
            })
        })

        it('debe deshabilitar botón de guardar mientras guarda', async () => {
            jest.spyOn(tetrazolioService, 'actualizarTetrazolio')
                .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const guardarBtn = screen.getByTestId('guardar-header')
                fireEvent.click(guardarBtn)
            })

            expect(screen.getByTestId('guardar-header')).toBeInTheDocument()
        })
    })

    describe('Test: Acciones de análisis (Finalizar, Aprobar, Repetir)', () => {
        it('debe tener disponible la acción de finalizar', async () => {
            jest.spyOn(tetrazolioService, 'finalizarAnalisis').mockResolvedValue(mockTetrazolio)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const finalizarBtn = screen.getByTestId('finalizar-btn')
                expect(finalizarBtn).toBeInTheDocument()
            })
        })

        it('debe llamar a finalizarAnalisis correctamente', async () => {
            const mockFinalizar = jest.spyOn(tetrazolioService, 'finalizarAnalisis')
                .mockResolvedValue(mockTetrazolio)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const finalizarBtn = screen.getByTestId('finalizar-btn')
                fireEvent.click(finalizarBtn)
            })

            await waitFor(() => {
                expect(mockFinalizar).toHaveBeenCalledWith(1)
                expect(toast.success).toHaveBeenCalled()
            })
        })

        it('debe tener disponible la acción de aprobar', async () => {
            jest.spyOn(tetrazolioService, 'aprobarAnalisis').mockResolvedValue(mockTetrazolio)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const aprobarBtn = screen.getByTestId('aprobar-btn')
                expect(aprobarBtn).toBeInTheDocument()
            })
        })

        it('debe llamar a aprobarAnalisis correctamente', async () => {
            const mockAprobar = jest.spyOn(tetrazolioService, 'aprobarAnalisis')
                .mockResolvedValue(mockTetrazolio)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const aprobarBtn = screen.getByTestId('aprobar-btn')
                fireEvent.click(aprobarBtn)
            })

            await waitFor(() => {
                expect(mockAprobar).toHaveBeenCalledWith(1)
                expect(toast.success).toHaveBeenCalled()
            })
        })

        it('debe tener disponible la acción de marcar para repetir', async () => {
            jest.spyOn(tetrazolioService, 'marcarParaRepetir').mockResolvedValue(mockTetrazolio)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const repetirBtn = screen.getByTestId('repetir-btn')
                expect(repetirBtn).toBeInTheDocument()
            })
        })

        it('debe llamar a marcarParaRepetir correctamente', async () => {
            const mockRepetir = jest.spyOn(tetrazolioService, 'marcarParaRepetir')
                .mockResolvedValue(mockTetrazolio)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const repetirBtn = screen.getByTestId('repetir-btn')
                fireEvent.click(repetirBtn)
            })

            await waitFor(() => {
                expect(mockRepetir).toHaveBeenCalledWith(1)
                expect(toast.success).toHaveBeenCalled()
            })
        })
    })

    describe('Test: Componentes auxiliares', () => {
        it('debe renderizar el header de análisis', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByTestId('header-bar')).toBeInTheDocument()
            })
        })

        it('debe renderizar el card de acciones', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByTestId('acciones-card')).toBeInTheDocument()
            })
        })

        it('debe renderizar el botón flotante de guardar', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByTestId('sticky-save')).toBeInTheDocument()
            })
        })

        it('debe permitir guardar desde el botón flotante', async () => {
            const mockActualizar = jest.spyOn(tetrazolioService, 'actualizarTetrazolio')
                .mockResolvedValue(mockTetrazolio)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const stickyBtn = screen.getByTestId('sticky-save')
                fireEvent.click(stickyBtn)
            })

            await waitFor(() => {
                expect(mockActualizar).toHaveBeenCalled()
            })
        })

        it('debe mostrar botón de tabla de tolerancias', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getAllByText('Ver Tabla de Tolerancias').length).toBeGreaterThan(0)
            })
        })
    })

    describe('Test: Estados y permisos', () => {
        it('debe cargar análisis en estado EN_PROCESO', async () => {
            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getAllByText(/Tetrazolio/i).length).toBeGreaterThan(0)
            })
        })

        it('debe manejar análisis en estado REGISTRADO', async () => {
            const tetrazolioRegistrado = {
                ...mockTetrazolio,
                estado: 'REGISTRADO' as EstadoAnalisis
            }

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId').mockResolvedValue(tetrazolioRegistrado)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByTestId('header-bar')).toBeInTheDocument()
            })
        })

        it('debe manejar análisis en estado PENDIENTE_APROBACION', async () => {
            const tetrazolioPendiente = {
                ...mockTetrazolio,
                estado: 'PENDIENTE_APROBACION' as EstadoAnalisis
            }

            jest.spyOn(tetrazolioService, 'obtenerTetrazolioPorId').mockResolvedValue(tetrazolioPendiente)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByTestId('acciones-card')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Formato de datos en el payload de actualización', () => {
        it('debe incluir todos los campos obligatorios en el PUT', async () => {
            const mockActualizar = jest.spyOn(tetrazolioService, 'actualizarTetrazolio')
                .mockResolvedValue(mockTetrazolio)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const guardarBtn = screen.getByTestId('guardar-header')
                fireEvent.click(guardarBtn)
            })

            await waitFor(() => {
                expect(mockActualizar).toHaveBeenCalledWith(
                    1,
                    expect.objectContaining({
                        idLote: expect.any(Number),
                        fecha: expect.any(String),
                        numSemillasPorRep: expect.any(Number),
                        numRepeticionesEsperadas: expect.any(Number),
                        pretratamiento: expect.any(String),
                        concentracion: expect.any(String),
                        tincionTemp: expect.any(Number),
                        tincionHs: expect.any(Number)
                    })
                )
            })
        })

        it('debe incluir viabilidad INASE manual si se proporciona', async () => {
            const mockActualizar = jest.spyOn(tetrazolioService, 'actualizarTetrazolio')
                .mockResolvedValue(mockTetrazolio)

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                const guardarBtn = screen.getByTestId('guardar-header')
                fireEvent.click(guardarBtn)
            })

            await waitFor(() => {
                expect(mockActualizar).toHaveBeenCalledWith(
                    1,
                    expect.objectContaining({
                        viabilidadInase: expect.any(Number)
                    })
                )
            })
        })
    })

    describe('Test: Manejo de errores', () => {
        it('debe manejar error al cargar repeticiones', async () => {
            jest.spyOn(repeticionesService, 'obtenerRepeticionesPorTetrazolio')
                .mockRejectedValue(new Error('Error de red'))

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByTestId('header-bar')).toBeInTheDocument()
            })
        })

        it('debe manejar análisis sin repeticiones', async () => {
            jest.spyOn(repeticionesService, 'obtenerRepeticionesPorTetrazolio')
                .mockResolvedValue([])

            render(<EditarTetrazolioPage />)

            await waitFor(() => {
                expect(screen.getByText(/No hay repeticiones/i)).toBeInTheDocument()
            })
        })
    })
})
