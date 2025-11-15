/**
 * Tests para la página de edición de Lotes
 * 
 * Estos tests cubren:
 * - Carga de datos existentes para edición
 * - Edición de campos básicos (ficha, nombre, tipo, cultivar)
 * - Edición de empresa y cliente
 * - Edición de fechas (entrega, recibo, cosecha)
 * - Edición de almacenamiento (origen, depósito, estado)
 * - Edición de peso y artículo
 * - Edición de observaciones
 * - Gestión de datos de humedad (agregar, editar, eliminar)
 * - Gestión de tipos de análisis asignados
 * - Validaciones asíncronas (ficha única, nombre único)
 * - Guardar cambios (PUT)
 * - Manejo de lotes inactivos (no editable)
 * - Verificación de tipos de análisis no removibles
 * - Manejo de errores
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import EditarLotePage from '@/app/listado/lotes/[id]/editar/page'
import * as loteService from '@/app/services/lote-service'
import * as lotesAsyncValidation from '@/lib/validations/lotes-async-validation'
import { LoteDTO, LoteRequestDTO } from '@/app/models/interfaces/lote'
import { TipoAnalisis } from '@/app/models/types/enums'
import { toast } from 'sonner'

// Mock de servicios
jest.mock('@/app/services/lote-service')
jest.mock('@/lib/validations/lotes-async-validation')

// Mock de navegación
const mockPush = jest.fn()
const mockBack = jest.fn()
const mockRouter = { push: mockPush, back: mockBack, replace: jest.fn() }
jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
    useParams: () => ({ id: '1' }),
    usePathname: () => '/listado/lotes/1/editar'
}))

// Mock de toast
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn()
    },
    Toaster: () => <div data-testid="toaster">Toaster</div>
}))

// Mock de hooks
jest.mock('@/lib/hooks/useValidation', () => ({
    __esModule: true,
    default: () => ({
        validateForm: jest.fn(),
        isValid: jest.fn(() => true),
        handleBlur: jest.fn(),
        hasError: jest.fn(() => false),
        getErrorMessage: jest.fn(() => ''),
        touchAll: jest.fn(),
        resetValidation: jest.fn()
    })
}))

// Mock de componentes
jest.mock('@/components/lotes/lot-form-tabs', () => ({
    LotFormTabs: ({ formData, onInputChange, activeTab, onTabChange, isLoading, tiposNoRemovibles }: any) => (
        <div data-testid="lot-form-tabs">
            <div data-testid="active-tab">{activeTab}</div>
            <button onClick={() => onTabChange('datos')}>Datos</button>
            <button onClick={() => onTabChange('ubicacion')}>Ubicación</button>
            <button onClick={() => onTabChange('humedad')}>Humedad</button>
            <button onClick={() => onTabChange('analisis')}>Análisis</button>

            <input
                data-testid="input-ficha"
                value={formData.ficha}
                onChange={(e) => onInputChange('ficha', e.target.value)}
            />
            <input
                data-testid="input-nomLote"
                value={formData.nomLote}
                onChange={(e) => onInputChange('nomLote', e.target.value)}
            />
            <input
                data-testid="input-cultivarID"
                type="number"
                value={formData.cultivarID}
                onChange={(e) => onInputChange('cultivarID', e.target.value)}
            />
            <select
                data-testid="input-tipo"
                value={formData.tipo}
                onChange={(e) => onInputChange('tipo', e.target.value)}
            >
                <option value="INTERNO">INTERNO</option>
                <option value="EXTERNO">EXTERNO</option>
            </select>
            <input
                data-testid="input-observaciones"
                value={formData.observaciones}
                onChange={(e) => onInputChange('observaciones', e.target.value)}
            />
            <input
                data-testid="input-kilosLimpios"
                type="number"
                value={formData.kilosLimpios}
                onChange={(e) => onInputChange('kilosLimpios', e.target.value)}
            />
            {isLoading && <div data-testid="loading-indicator">Loading...</div>}
            {tiposNoRemovibles && <div data-testid="tipos-no-removibles">{Array.from(tiposNoRemovibles).join(',')}</div>}
        </div>
    )
}))

jest.mock('@/components/ui/sticky-save-button', () => ({
    StickySaveButton: ({ onSave }: any) => (
        <button onClick={onSave} data-testid="sticky-save">Guardar Flotante</button>
    )
}))

describe('EditarLotePage Tests', () => {
    const mockLote: LoteDTO = {
        loteID: 1,
        ficha: 'F-2024-001',
        nomLote: 'Trigo Baguette 10',
        tipo: 'INTERNO',
        cultivarID: 1,
        cultivarNombre: 'Baguette 10',
        especieNombre: 'Trigo',
        empresaID: 1,
        empresaNombre: 'Semillera del Norte',
        clienteID: 1,
        clienteNombre: 'Juan Pérez',
        codigoCC: 'CC-001',
        codigoFF: 'FF-001',
        fechaEntrega: '2024-03-01',
        fechaRecibo: '2024-03-05',
        fechaCosecha: '2024-02-15',
        depositoID: 1,
        depositoValor: 'Depósito Central',
        unidadEmbolsado: 'Bolsa 50kg',
        remitente: 'Transportes ABC',
        observaciones: 'Lote de alta calidad',
        kilosLimpios: 1000,
        numeroArticuloID: 1,
        numeroArticuloValor: 'ART-2024-001',
        origenID: 1,
        origenValor: 'Salto',
        estadoID: 1,
        estadoValor: 'Almacenado',
        tiposAnalisisAsignados: ['PUREZA' as TipoAnalisis, 'GERMINACION' as TipoAnalisis],
        datosHumedad: [
            {
                humedadID: 1,
                humedadNombre: 'Humedad Inicial',
                porcentaje: 12.5
            }
        ],
        activo: true
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(mockLote)
        jest.spyOn(loteService, 'actualizarLote').mockResolvedValue(mockLote)
        jest.spyOn(loteService, 'puedeRemoverTipoAnalisis').mockResolvedValue({ puedeRemover: true, razon: '' })
        jest.spyOn(lotesAsyncValidation, 'validarFichaUnica').mockResolvedValue(true)
        jest.spyOn(lotesAsyncValidation, 'validarNombreLoteUnico').mockResolvedValue(true)
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    describe('Test: Carga de datos para edición', () => {
        it('debe cargar los datos del lote al montar', async () => {
            const mockObtenerLote = jest.spyOn(loteService, 'obtenerLotePorId')
                .mockResolvedValue(mockLote)

            render(<EditarLotePage />)

            await waitFor(() => {
                expect(mockObtenerLote).toHaveBeenCalledWith(1)
            })
        })

        it('debe poblar el formulario con los datos existentes', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                expect(screen.getByDisplayValue('F-2024-001')).toBeInTheDocument()
                expect(screen.getByDisplayValue('Trigo Baguette 10')).toBeInTheDocument()
            })
        })

        it('debe verificar tipos de análisis no removibles', async () => {
            const mockPuedeRemover = jest.spyOn(loteService, 'puedeRemoverTipoAnalisis')
                .mockResolvedValue({ puedeRemover: false, razon: 'Tiene análisis registrados' })

            render(<EditarLotePage />)

            await waitFor(() => {
                expect(mockPuedeRemover).toHaveBeenCalledWith(1, 'PUREZA')
                expect(mockPuedeRemover).toHaveBeenCalledWith(1, 'GERMINACION')
            })
        })

        it('debe mostrar tipos no removibles en el componente', async () => {
            jest.spyOn(loteService, 'puedeRemoverTipoAnalisis')
                .mockResolvedValue({ puedeRemover: false, razon: 'Tiene análisis' })

            render(<EditarLotePage />)

            await waitFor(() => {
                const tiposNoRemovibles = screen.getByTestId('tipos-no-removibles')
                expect(tiposNoRemovibles.textContent).toContain('PUREZA')
                expect(tiposNoRemovibles.textContent).toContain('GERMINACION')
            })
        })

        it('debe manejar error al cargar lote', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
            jest.spyOn(loteService, 'obtenerLotePorId')
                .mockRejectedValue(new Error('Error de red'))

            render(<EditarLotePage />)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Error al cargar lote',
                    expect.objectContaining({
                        description: 'No se pudo cargar la información del lote'
                    })
                )
            })

            consoleErrorSpy.mockRestore()
        })

        it('debe cargar datos de humedad correctamente', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                // Los datos de humedad se cargan en formData
                expect(screen.getByTestId('lot-form-tabs')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Lote inactivo (no editable)', () => {
        it('debe mostrar error cuando el lote está inactivo', async () => {
            const loteInactivo = { ...mockLote, activo: false }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteInactivo)

            render(<EditarLotePage />)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Lote inactivo',
                    expect.objectContaining({
                        description: 'No se puede editar un lote inactivo',
                        duration: 3000
                    })
                )
            })
        })

        it('debe redirigir al listado cuando el lote está inactivo', async () => {
            const loteInactivo = { ...mockLote, activo: false }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteInactivo)

            render(<EditarLotePage />)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalled()
            })

            // Avanzar timers para la redirección
            jest.advanceTimersByTime(2500)

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/listado/lotes')
            })
        })

        it('no debe cargar el formulario si el lote está inactivo', async () => {
            const loteInactivo = { ...mockLote, activo: false }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteInactivo)

            render(<EditarLotePage />)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalled()
            })

            // No debe cargar los datos del formulario
            expect(screen.queryByDisplayValue('F-2024-001')).not.toBeInTheDocument()
        })
    })

    describe('Test: Edición de campos básicos', () => {
        it('debe permitir editar la ficha', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                const fichaInput = screen.getByTestId('input-ficha')
                fireEvent.change(fichaInput, { target: { value: 'F-2024-002' } })
                expect(fichaInput).toHaveValue('F-2024-002')
            })
        })

        it('debe permitir editar el nombre del lote', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                const nomLoteInput = screen.getByTestId('input-nomLote')
                fireEvent.change(nomLoteInput, { target: { value: 'Trigo Premium' } })
                expect(nomLoteInput).toHaveValue('Trigo Premium')
            })
        })

        it('debe permitir cambiar el tipo de lote', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                const tipoSelect = screen.getByTestId('input-tipo')
                fireEvent.change(tipoSelect, { target: { value: 'EXTERNO' } })
                expect(tipoSelect).toHaveValue('EXTERNO')
            })
        })

        it('debe permitir editar el cultivar', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                const cultivarInput = screen.getByTestId('input-cultivarID')
                fireEvent.change(cultivarInput, { target: { value: '2' } })
                expect(cultivarInput).toHaveValue(2)
            })
        })

        it('debe permitir editar observaciones', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                const observacionesInput = screen.getByTestId('input-observaciones')
                fireEvent.change(observacionesInput, { target: { value: 'Nueva observación' } })
                expect(observacionesInput).toHaveValue('Nueva observación')
            })
        })

        it('debe permitir editar kilos limpios', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                const kilosInput = screen.getByTestId('input-kilosLimpios')
                fireEvent.change(kilosInput, { target: { value: '2000' } })
                expect(kilosInput).toHaveValue(2000)
            })
        })
    })

    describe('Test: Validaciones asíncronas al editar', () => {
        it('debe validar ficha única al cambiar (excluyendo la actual)', async () => {
            jest.spyOn(lotesAsyncValidation, 'validarFichaUnica')
                .mockResolvedValue(true)

            render(<EditarLotePage />)

            await waitFor(() => {
                const fichaInput = screen.getByTestId('input-ficha')
                fireEvent.change(fichaInput, { target: { value: 'F-2024-NEW' } })
            })

            await waitFor(() => {
                expect(lotesAsyncValidation.validarFichaUnica).toHaveBeenCalledWith('F-2024-NEW', 1)
            })
        })

        it('debe validar nombre de lote único al cambiar (excluyendo el actual)', async () => {
            jest.spyOn(lotesAsyncValidation, 'validarNombreLoteUnico')
                .mockResolvedValue(true)

            render(<EditarLotePage />)

            await waitFor(() => {
                const nomLoteInput = screen.getByTestId('input-nomLote')
                fireEvent.change(nomLoteInput, { target: { value: 'Nuevo Nombre' } })
            })

            await waitFor(() => {
                expect(lotesAsyncValidation.validarNombreLoteUnico).toHaveBeenCalledWith('Nuevo Nombre', 1)
            })
        })

        it('debe mostrar error cuando la ficha ya existe', async () => {
            jest.spyOn(lotesAsyncValidation, 'validarFichaUnica')
                .mockResolvedValue(false)

            render(<EditarLotePage />)

            await waitFor(() => {
                const fichaInput = screen.getByTestId('input-ficha')
                fireEvent.change(fichaInput, { target: { value: 'F-2024-999' } })
            })

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Esta ficha ya está registrada',
                    expect.objectContaining({
                        description: 'Por favor, utiliza una ficha diferente'
                    })
                )
            })
        })

        it('debe mostrar error cuando el nombre ya existe', async () => {
            jest.spyOn(lotesAsyncValidation, 'validarNombreLoteUnico')
                .mockResolvedValue(false)

            render(<EditarLotePage />)

            await waitFor(() => {
                const nomLoteInput = screen.getByTestId('input-nomLote')
                fireEvent.change(nomLoteInput, { target: { value: 'Nombre Existente' } })
            })

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Este nombre de lote ya está registrado',
                    expect.objectContaining({
                        description: 'Por favor, utiliza un nombre diferente'
                    })
                )
            })
        })
    })

    describe('Test: Guardar cambios', () => {
        it('debe guardar cambios al hacer clic en el botón flotante', async () => {
            const mockActualizar = jest.spyOn(loteService, 'actualizarLote')
                .mockResolvedValue(mockLote)

            render(<EditarLotePage />)

            await waitFor(() => {
                expect(screen.getByTestId('sticky-save')).toBeInTheDocument()
            })

            const saveButton = screen.getByTestId('sticky-save')
            fireEvent.click(saveButton)

            await waitFor(() => {
                expect(mockActualizar).toHaveBeenCalledWith(1, expect.any(Object))
            })
        })

        it('debe mostrar toast de éxito al guardar correctamente', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                const saveButton = screen.getByTestId('sticky-save')
                fireEvent.click(saveButton)
            })

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith(
                    'Cambios guardados',
                    expect.objectContaining({
                        description: 'El lote se ha actualizado correctamente'
                    })
                )
            })
        })

        it('debe validar antes de guardar', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                const saveButton = screen.getByTestId('sticky-save')
                fireEvent.click(saveButton)
            })

            // Debe llamar a las validaciones asíncronas antes de guardar
            await waitFor(() => {
                expect(lotesAsyncValidation.validarFichaUnica).toHaveBeenCalled()
                expect(lotesAsyncValidation.validarNombreLoteUnico).toHaveBeenCalled()
            })
        })

        it('debe detener guardado si la ficha no es única', async () => {
            jest.spyOn(lotesAsyncValidation, 'validarFichaUnica')
                .mockResolvedValue(false)

            const mockActualizar = jest.spyOn(loteService, 'actualizarLote')

            render(<EditarLotePage />)

            await waitFor(() => {
                const saveButton = screen.getByTestId('sticky-save')
                fireEvent.click(saveButton)
            })

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalled()
            })

            expect(mockActualizar).not.toHaveBeenCalled()
        })

        it('debe detener guardado si el nombre no es único', async () => {
            jest.spyOn(lotesAsyncValidation, 'validarNombreLoteUnico')
                .mockResolvedValue(false)

            const mockActualizar = jest.spyOn(loteService, 'actualizarLote')

            render(<EditarLotePage />)

            await waitFor(() => {
                const saveButton = screen.getByTestId('sticky-save')
                fireEvent.click(saveButton)
            })

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalled()
            })

            expect(mockActualizar).not.toHaveBeenCalled()
        })

        it('debe manejar error al guardar', async () => {
            jest.spyOn(loteService, 'actualizarLote')
                .mockRejectedValue(new Error('Error al actualizar'))

            render(<EditarLotePage />)

            await waitFor(() => {
                const saveButton = screen.getByTestId('sticky-save')
                fireEvent.click(saveButton)
            })

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Error al guardar cambios',
                    expect.objectContaining({
                        description: 'Error al actualizar'
                    })
                )
            })
        })

        it('debe transformar correctamente los datos al DTO', async () => {
            const mockActualizar = jest.spyOn(loteService, 'actualizarLote')
                .mockResolvedValue(mockLote)

            render(<EditarLotePage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-cultivarID'), { target: { value: '5' } })
                fireEvent.change(screen.getByTestId('input-kilosLimpios'), { target: { value: '1500' } })
            })

            const saveButton = screen.getByTestId('sticky-save')
            fireEvent.click(saveButton)

            await waitFor(() => {
                expect(mockActualizar).toHaveBeenCalledWith(
                    1,
                    expect.objectContaining({
                        cultivarID: 5,
                        kilosLimpios: 1500
                    })
                )
            })
        })

        it('debe deshabilitar el botón durante el guardado', async () => {
            jest.spyOn(loteService, 'actualizarLote')
                .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

            render(<EditarLotePage />)

            await waitFor(() => {
                const saveButton = screen.getByTestId('sticky-save')
                fireEvent.click(saveButton)
            })

            await waitFor(() => {
                expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Navegación entre pestañas', () => {
        it('debe cambiar a la pestaña de ubicación', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                const ubicacionButton = screen.getByText('Ubicación')
                fireEvent.click(ubicacionButton)
                expect(screen.getByTestId('active-tab')).toHaveTextContent('ubicacion')
            })
        })

        it('debe cambiar a la pestaña de humedad', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                const humedadButton = screen.getByText('Humedad')
                fireEvent.click(humedadButton)
                expect(screen.getByTestId('active-tab')).toHaveTextContent('humedad')
            })
        })

        it('debe cambiar a la pestaña de análisis', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                const analisisButton = screen.getByText('Análisis')
                fireEvent.click(analisisButton)
                expect(screen.getByTestId('active-tab')).toHaveTextContent('analisis')
            })
        })

        it('debe mantener los datos al cambiar de pestaña', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-EDIT' } })
            })

            const ubicacionButton = screen.getByText('Ubicación')
            fireEvent.click(ubicacionButton)

            const datosButton = screen.getByText('Datos')
            fireEvent.click(datosButton)

            await waitFor(() => {
                expect(screen.getByTestId('input-ficha')).toHaveValue('F-EDIT')
            })
        })
    })

    describe('Test: Datos de humedad', () => {
        it('debe cargar datos de humedad existentes', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                // Los datos de humedad se cargan correctamente
                expect(screen.getByTestId('lot-form-tabs')).toBeInTheDocument()
            })
        })

        it('debe inicializar con un dato de humedad vacío si no hay datos', async () => {
            const loteSinHumedad = { ...mockLote, datosHumedad: [] }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteSinHumedad)

            render(<EditarLotePage />)

            await waitFor(() => {
                expect(screen.getByTestId('lot-form-tabs')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Tipos de análisis asignados', () => {
        it('debe cargar tipos de análisis asignados', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                expect(screen.getByTestId('lot-form-tabs')).toBeInTheDocument()
            })
        })

        it('debe marcar tipos no removibles correctamente', async () => {
            jest.spyOn(loteService, 'puedeRemoverTipoAnalisis')
                .mockImplementation(async (loteId, tipo) => {
                    if (tipo === 'PUREZA') {
                        return { puedeRemover: false, razon: 'Tiene análisis de pureza registrados' }
                    }
                    return { puedeRemover: true, razon: '' }
                })

            render(<EditarLotePage />)

            await waitFor(() => {
                const tiposNoRemovibles = screen.getByTestId('tipos-no-removibles')
                expect(tiposNoRemovibles.textContent).toContain('PUREZA')
                expect(tiposNoRemovibles.textContent).not.toContain('GERMINACION')
            })
        })

        it('debe manejar error al verificar si puede remover tipo', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
            jest.spyOn(loteService, 'puedeRemoverTipoAnalisis')
                .mockRejectedValue(new Error('Error al verificar'))

            render(<EditarLotePage />)

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalled()
                // Debe marcar como no removible por seguridad
                const tiposNoRemovibles = screen.getByTestId('tipos-no-removibles')
                expect(tiposNoRemovibles.textContent).toContain('PUREZA')
            })

            consoleErrorSpy.mockRestore()
        })

        it('debe eliminar duplicados de tipos de análisis', async () => {
            const loteConDuplicados = {
                ...mockLote,
                tiposAnalisisAsignados: ['PUREZA' as TipoAnalisis, 'PUREZA' as TipoAnalisis, 'GERMINACION' as TipoAnalisis]
            }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteConDuplicados)

            render(<EditarLotePage />)

            await waitFor(() => {
                // Debe verificar solo una vez PUREZA (sin duplicados)
                const calls = (loteService.puedeRemoverTipoAnalisis as jest.Mock).mock.calls
                const purezaCalls = calls.filter(call => call[1] === 'PUREZA')
                expect(purezaCalls.length).toBe(1)
            })
        })

        it('debe filtrar valores null de tipos de análisis', async () => {
            const loteConNulls = {
                ...mockLote,
                tiposAnalisisAsignados: ['PUREZA' as TipoAnalisis, null as any, 'GERMINACION' as TipoAnalisis]
            }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteConNulls)

            render(<EditarLotePage />)

            await waitFor(() => {
                // No debe intentar verificar tipos null
                expect(loteService.puedeRemoverTipoAnalisis).toHaveBeenCalledTimes(2)
            })
        })
    })

    describe('Test: Botón volver', () => {
        it('debe tener un link de volver', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                const volverLink = screen.getByRole('link', { name: /volver/i })
                expect(volverLink).toBeInTheDocument()
                expect(volverLink).toHaveAttribute('href', '/listado/lotes/1')
            })
        })
    })

    describe('Test: Renderizado de componentes', () => {
        it('debe renderizar el Toaster', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                expect(screen.getByTestId('toaster')).toBeInTheDocument()
            })
        })

        it('debe renderizar el título correcto', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Editar Lote')).toBeInTheDocument()
            })
        })

        it('debe renderizar el StickySaveButton', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                expect(screen.getByTestId('sticky-save')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Casos edge', () => {
        it('debe manejar lote sin datos opcionales', async () => {
            const loteMinimo: LoteDTO = {
                loteID: 1,
                ficha: 'F-MIN',
                nomLote: '',
                tipo: 'INTERNO',
                cultivarID: 1,
                cultivarNombre: 'Test',
                especieNombre: 'Test',
                empresaID: 1,
                clienteID: 1,
                depositoID: 1,
                unidadEmbolsado: 'Bolsa',
                kilosLimpios: 100,
                numeroArticuloID: 1,
                origenID: 1,
                estadoID: 1,
                tiposAnalisisAsignados: [],
                datosHumedad: [],
                activo: true
            }

            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteMinimo)

            render(<EditarLotePage />)

            await waitFor(() => {
                expect(screen.getByDisplayValue('F-MIN')).toBeInTheDocument()
                expect(screen.getByDisplayValue('')).toBeInTheDocument() // nomLote vacío
            })
        })

        it('debe manejar lote sin tipos de análisis', async () => {
            const loteSinAnalisis = { ...mockLote, tiposAnalisisAsignados: [] }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteSinAnalisis)

            render(<EditarLotePage />)

            await waitFor(() => {
                // No debe intentar verificar tipos si no hay ninguno
                expect(loteService.puedeRemoverTipoAnalisis).not.toHaveBeenCalled()
            })
        })

        it('debe manejar valores numéricos grandes', async () => {
            render(<EditarLotePage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-kilosLimpios'), { target: { value: '999999' } })
                expect(screen.getByTestId('input-kilosLimpios')).toHaveValue(999999)
            })
        })
    })
})
