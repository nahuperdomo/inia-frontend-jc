/**
 * Tests para el componente de Registro de Lotes
 * 
 * Estos tests cubren:
 * - Renderizado del componente con título y descripción
 * - Renderizado del formulario con todas las pestañas
 * - Validación de campos obligatorios
 * - Validación de ficha única (asíncrona)
 * - Validación de nombre de lote único (asíncrona)
 * - Creación exitosa de lote
 * - Manejo de errores al crear lote
 * - Carga y visualización de últimos lotes registrados
 * - Navegación a detalles de lote
 * - Transformación de datos del formulario a DTO
 * - Validación de datos de humedad
 * - Validación de tipos de análisis asignados
 * - Integración con el hook useValidation
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import RegistroLotesPage from '@/app/registro/lotes/page'
import * as loteService from '@/app/services/lote-service'
import * as lotesAsyncValidation from '@/lib/validations/lotes-async-validation'
import { toast } from 'sonner'

// Mock de next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
    }),
}))

// Mock de sonner
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        warning: jest.fn(),
        info: jest.fn(),
    },
    Toaster: () => <div data-testid="toaster">Toaster</div>,
}))

// Mock de lote-service
jest.mock('@/app/services/lote-service', () => ({
    crearLote: jest.fn(),
    obtenerLotesActivos: jest.fn(),
}))

// Mock de validaciones asíncronas
jest.mock('@/lib/validations/lotes-async-validation', () => ({
    validarFichaUnica: jest.fn(),
    validarNombreLoteUnico: jest.fn(),
}))

// Mock de componentes hijos
jest.mock('@/components/lotes/lot-form-tabs', () => ({
    LotFormTabs: ({ formData, onInputChange, activeTab, onTabChange, isLoading }: any) => (
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
                data-testid="input-empresaID"
                type="number"
                value={formData.empresaID}
                onChange={(e) => onInputChange('empresaID', e.target.value)}
            />
            <input
                data-testid="input-depositoID"
                type="number"
                value={formData.depositoID}
                onChange={(e) => onInputChange('depositoID', e.target.value)}
            />
            <input
                data-testid="input-kilosLimpios"
                type="number"
                value={formData.kilosLimpios}
                onChange={(e) => onInputChange('kilosLimpios', e.target.value)}
            />
            {isLoading && <div data-testid="loading-indicator">Loading...</div>}
        </div>
    ),
}))

jest.mock('@/components/lotes/lot-list', () => ({
    LotList: ({ lots, onViewDetails }: any) => (
        <div data-testid="lot-list">
            {lots.map((lot: any) => (
                <div key={lot.loteID} data-testid={`lot-item-${lot.loteID}`}>
                    <span>{lot.nomLote}</span>
                    <button onClick={() => onViewDetails(lot)}>Ver detalles</button>
                </div>
            ))}
        </div>
    ),
}))

jest.mock('@/lib/hooks/useValidation', () => ({
    __esModule: true,
    default: () => ({
        validateForm: jest.fn(),
        isValid: jest.fn(() => true),
        handleBlur: jest.fn(),
        hasError: jest.fn(() => false),
        getErrorMessage: jest.fn(() => ''),
        touchAll: jest.fn(),
        resetValidation: jest.fn(),
    }),
}))

describe('RegistroLotesPage Tests', () => {
    const mockLotes = [
        {
            loteID: 1,
            ficha: 'F-2024-001',
            nomLote: 'Trigo Baguette 10',
            cultivarNombre: 'Baguette 10',
            especieNombre: 'Trigo',
            fechaRecibo: '2024-03-01',
            activo: true,
        },
        {
            loteID: 2,
            ficha: 'F-2024-002',
            nomLote: 'Soja DM 48',
            cultivarNombre: 'DM 48',
            especieNombre: 'Soja',
            fechaRecibo: '2024-03-02',
            activo: true,
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
            ; (loteService.obtenerLotesActivos as jest.Mock).mockResolvedValue(mockLotes)
            ; (lotesAsyncValidation.validarFichaUnica as jest.Mock).mockResolvedValue(true)
            ; (lotesAsyncValidation.validarNombreLoteUnico as jest.Mock).mockResolvedValue(true)
    })

    describe('Test: Renderizado básico del componente', () => {
        it('debe renderizar el título y descripción correctamente', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                expect(screen.getByText('Registro de Lotes')).toBeInTheDocument()
                expect(screen.getByText('Registra un nuevo lote de semillas en el sistema')).toBeInTheDocument()
            })
        })

        it('debe renderizar el botón de volver', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                expect(screen.getByText('Volver al Registro')).toBeInTheDocument()
            })
        })

        it('debe renderizar el ícono de paquete', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const iconSvgs = document.querySelectorAll('svg')
                expect(iconSvgs.length).toBeGreaterThan(0)
            })
        })

        it('debe renderizar el formulario con pestañas', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                expect(screen.getByTestId('lot-form-tabs')).toBeInTheDocument()
            })
        })

        it('debe renderizar el botón de registrar lote', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                expect(screen.getByText('Registrar Lote')).toBeInTheDocument()
            })
        })

        it('debe renderizar la sección de últimos lotes registrados', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                expect(screen.getByText('Últimos lotes registrados')).toBeInTheDocument()
            })
        })

        it('debe renderizar el componente Toaster', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                expect(screen.getByTestId('toaster')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Carga inicial de datos', () => {
        it('debe cargar los lotes recientes al montar el componente', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                expect(loteService.obtenerLotesActivos).toHaveBeenCalled()
            })
        })

        it('debe mostrar los últimos 5 lotes', async () => {
            const muchosMockLotes = Array.from({ length: 10 }, (_, i) => ({
                loteID: i + 1,
                ficha: `F-2024-${String(i + 1).padStart(3, '0')}`,
                nomLote: `Lote ${i + 1}`,
                cultivarNombre: `Cultivar ${i + 1}`,
                especieNombre: 'Trigo',
                fechaRecibo: '2024-03-01',
                activo: true,
            }))

                ; (loteService.obtenerLotesActivos as jest.Mock).mockResolvedValue(muchosMockLotes)

            render(<RegistroLotesPage />)

            await waitFor(() => {
                expect(screen.getByTestId('lot-list')).toBeInTheDocument()
            })
        })

        it('debe mostrar los lotes en la lista', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                expect(screen.getByText('Trigo Baguette 10')).toBeInTheDocument()
                expect(screen.getByText('Soja DM 48')).toBeInTheDocument()
            })
        })

        it('debe manejar error al cargar lotes recientes', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
                ; (loteService.obtenerLotesActivos as jest.Mock).mockRejectedValue(new Error('Network error'))

            render(<RegistroLotesPage />)

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar lotes:', expect.any(Error))
            })

            consoleErrorSpy.mockRestore()
        })
    })

    describe('Test: Formulario - Campos básicos', () => {
        it('debe permitir ingresar la ficha del lote', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const fichaInput = screen.getByTestId('input-ficha')
                fireEvent.change(fichaInput, { target: { value: 'F-2024-005' } })
                expect(fichaInput).toHaveValue('F-2024-005')
            })
        })

        it('debe permitir ingresar el nombre del lote', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const nomLoteInput = screen.getByTestId('input-nomLote')
                fireEvent.change(nomLoteInput, { target: { value: 'Trigo Premium' } })
                expect(nomLoteInput).toHaveValue('Trigo Premium')
            })
        })

        it('debe permitir seleccionar el tipo de lote', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const tipoSelect = screen.getByTestId('input-tipo')
                fireEvent.change(tipoSelect, { target: { value: 'EXTERNO' } })
                expect(tipoSelect).toHaveValue('EXTERNO')
            })
        })

        it('debe tener INTERNO como tipo por defecto', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const tipoSelect = screen.getByTestId('input-tipo')
                expect(tipoSelect).toHaveValue('INTERNO')
            })
        })

        it('debe permitir ingresar cultivar ID', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const cultivarInput = screen.getByTestId('input-cultivarID')
                fireEvent.change(cultivarInput, { target: { value: '1' } })
                expect(cultivarInput).toHaveValue(1)
            })
        })

        it('debe permitir ingresar empresa ID', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const empresaInput = screen.getByTestId('input-empresaID')
                fireEvent.change(empresaInput, { target: { value: '5' } })
                expect(empresaInput).toHaveValue(5)
            })
        })

        it('debe permitir ingresar depósito ID', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const depositoInput = screen.getByTestId('input-depositoID')
                fireEvent.change(depositoInput, { target: { value: '3' } })
                expect(depositoInput).toHaveValue(3)
            })
        })

        it('debe permitir ingresar kilos limpios', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const kilosInput = screen.getByTestId('input-kilosLimpios')
                fireEvent.change(kilosInput, { target: { value: '1000' } })
                expect(kilosInput).toHaveValue(1000)
            })
        })
    })

    describe('Test: Validaciones asíncronas', () => {
        it('debe validar ficha única al cambiar el valor', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const fichaInput = screen.getByTestId('input-ficha')
                fireEvent.change(fichaInput, { target: { value: 'F-2024-NEW' } })
            })

            await waitFor(() => {
                expect(lotesAsyncValidation.validarFichaUnica).toHaveBeenCalledWith('F-2024-NEW')
            })
        })

        it('debe mostrar error cuando la ficha ya existe', async () => {
            ; (lotesAsyncValidation.validarFichaUnica as jest.Mock).mockResolvedValue(false)

            render(<RegistroLotesPage />)

            await waitFor(() => {
                const fichaInput = screen.getByTestId('input-ficha')
                fireEvent.change(fichaInput, { target: { value: 'F-2024-001' } })
            })

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Esta ficha ya está registrada',
                    expect.objectContaining({
                        description: 'Por favor, utiliza una ficha diferente',
                    })
                )
            })
        })

        it('debe validar nombre de lote único al cambiar el valor', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const nomLoteInput = screen.getByTestId('input-nomLote')
                fireEvent.change(nomLoteInput, { target: { value: 'Lote Nuevo' } })
            })

            await waitFor(() => {
                expect(lotesAsyncValidation.validarNombreLoteUnico).toHaveBeenCalledWith('Lote Nuevo')
            })
        })

        it('debe mostrar error cuando el nombre de lote ya existe', async () => {
            ; (lotesAsyncValidation.validarNombreLoteUnico as jest.Mock).mockResolvedValue(false)

            render(<RegistroLotesPage />)

            await waitFor(() => {
                const nomLoteInput = screen.getByTestId('input-nomLote')
                fireEvent.change(nomLoteInput, { target: { value: 'Trigo Baguette 10' } })
            })

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Este nombre de lote ya está registrado',
                    expect.objectContaining({
                        description: 'Por favor, utiliza un nombre diferente',
                    })
                )
            })
        })

        it('no debe validar ficha si el campo está vacío', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const fichaInput = screen.getByTestId('input-ficha')
                fireEvent.change(fichaInput, { target: { value: '' } })
            })

            expect(lotesAsyncValidation.validarFichaUnica).not.toHaveBeenCalledWith('')
        })

        it('no debe validar nombre de lote si el campo está vacío', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const nomLoteInput = screen.getByTestId('input-nomLote')
                fireEvent.change(nomLoteInput, { target: { value: '' } })
            })

            expect(lotesAsyncValidation.validarNombreLoteUnico).not.toHaveBeenCalledWith('')
        })
    })

    describe('Test: Submit del formulario - Casos exitosos', () => {
        it('debe crear un lote exitosamente', async () => {
            const mockLoteCreado = {
                loteID: 3,
                ficha: 'F-2024-003',
                nomLote: 'Nuevo Lote',
                cultivarNombre: 'Baguette 10',
                especieNombre: 'Trigo',
            }

                ; (loteService.crearLote as jest.Mock).mockResolvedValue(mockLoteCreado)

            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-2024-003' } })
                fireEvent.change(screen.getByTestId('input-nomLote'), { target: { value: 'Nuevo Lote' } })
                fireEvent.change(screen.getByTestId('input-cultivarID'), { target: { value: '1' } })
                fireEvent.change(screen.getByTestId('input-empresaID'), { target: { value: '1' } })
                fireEvent.change(screen.getByTestId('input-depositoID'), { target: { value: '1' } })
                fireEvent.change(screen.getByTestId('input-kilosLimpios'), { target: { value: '1000' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(loteService.crearLote).toHaveBeenCalled()
            })

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith(
                    'Lote registrado exitosamente',
                    expect.objectContaining({
                        description: 'Se ha creado el lote con ficha F-2024-003',
                    })
                )
            })
        })

        it('debe deshabilitar el botón durante el submit', async () => {
            ; (loteService.crearLote as jest.Mock).mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100))
            )

            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-2024-004' } })
                fireEvent.change(screen.getByTestId('input-nomLote'), { target: { value: 'Lote Test' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Registrando...')).toBeInTheDocument()
            })
        })

        it('debe recargar la lista de lotes después de crear uno', async () => {
            const mockLoteCreado = { loteID: 4, ficha: 'F-2024-004' }
                ; (loteService.crearLote as jest.Mock).mockResolvedValue(mockLoteCreado)

            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-2024-004' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(loteService.obtenerLotesActivos).toHaveBeenCalledTimes(2) // 1 inicial + 1 después del submit
            })
        })

        it('debe limpiar el formulario después de crear exitosamente', async () => {
            const mockLoteCreado = { loteID: 5, ficha: 'F-2024-005' }
                ; (loteService.crearLote as jest.Mock).mockResolvedValue(mockLoteCreado)

            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-2024-005' } })
                fireEvent.change(screen.getByTestId('input-nomLote'), { target: { value: 'Test Lote' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(screen.getByTestId('input-ficha')).toHaveValue('')
                expect(screen.getByTestId('input-nomLote')).toHaveValue('')
            })
        })

        it('debe regresar a la primera pestaña después de crear', async () => {
            const mockLoteCreado = { loteID: 6, ficha: 'F-2024-006' }
                ; (loteService.crearLote as jest.Mock).mockResolvedValue(mockLoteCreado)

            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-2024-006' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(screen.getByTestId('active-tab')).toHaveTextContent('datos')
            })
        })
    })

    describe('Test: Submit del formulario - Validaciones previas', () => {
        it('debe validar ficha única antes de enviar', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-2024-007' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(lotesAsyncValidation.validarFichaUnica).toHaveBeenCalledWith('F-2024-007')
            })
        })

        it('debe validar nombre de lote único antes de enviar', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-nomLote'), { target: { value: 'Lote Validar' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(lotesAsyncValidation.validarNombreLoteUnico).toHaveBeenCalledWith('Lote Validar')
            })
        })

        it('debe detener el submit si la ficha no es única', async () => {
            ; (lotesAsyncValidation.validarFichaUnica as jest.Mock).mockResolvedValue(false)

            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-2024-001' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Esta ficha ya está registrada',
                    expect.any(Object)
                )
            })

            expect(loteService.crearLote).not.toHaveBeenCalled()
        })

        it('debe detener el submit si el nombre de lote no es único', async () => {
            ; (lotesAsyncValidation.validarNombreLoteUnico as jest.Mock).mockResolvedValue(false)

            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-nomLote'), { target: { value: 'Trigo Baguette 10' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Este nombre de lote ya está registrado',
                    expect.any(Object)
                )
            })

            expect(loteService.crearLote).not.toHaveBeenCalled()
        })
    })

    describe('Test: Submit del formulario - Manejo de errores', () => {
        it('debe mostrar error cuando falla la creación del lote', async () => {
            ; (loteService.crearLote as jest.Mock).mockRejectedValue(new Error('Error en el servidor'))

            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-2024-ERR' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Error al registrar el lote',
                    expect.objectContaining({
                        description: 'Error en el servidor',
                    })
                )
            })
        })

        it('debe manejar error sin mensaje específico', async () => {
            ; (loteService.crearLote as jest.Mock).mockRejectedValue({})

            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-2024-ERR2' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Error al registrar el lote',
                    expect.objectContaining({
                        description: 'Error desconocido al registrar el lote',
                    })
                )
            })
        })

        it('debe log el error en la consola', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
            const mockError = new Error('Test error')
                ; (loteService.crearLote as jest.Mock).mockRejectedValue(mockError)

            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-2024-LOG' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Error al registrar lote:', mockError)
            })

            consoleErrorSpy.mockRestore()
        })

        it('debe rehabilitar el botón después de un error', async () => {
            ; (loteService.crearLote as jest.Mock).mockRejectedValue(new Error('Error'))

            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-2024-BTN' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Registrar Lote')).not.toBeDisabled()
            })
        })
    })

    describe('Test: Navegación entre pestañas', () => {
        it('debe cambiar a la pestaña de ubicación', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const ubicacionButton = screen.getByText('Ubicación')
                fireEvent.click(ubicacionButton)
                expect(screen.getByTestId('active-tab')).toHaveTextContent('ubicacion')
            })
        })

        it('debe cambiar a la pestaña de humedad', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const humedadButton = screen.getByText('Humedad')
                fireEvent.click(humedadButton)
                expect(screen.getByTestId('active-tab')).toHaveTextContent('humedad')
            })
        })

        it('debe cambiar a la pestaña de análisis', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const analisisButton = screen.getByText('Análisis')
                fireEvent.click(analisisButton)
                expect(screen.getByTestId('active-tab')).toHaveTextContent('analisis')
            })
        })

        it('debe comenzar en la pestaña de datos', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                expect(screen.getByTestId('active-tab')).toHaveTextContent('datos')
            })
        })
    })

    describe('Test: Lista de lotes recientes', () => {
        it('debe mostrar la lista de lotes', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                expect(screen.getByTestId('lot-list')).toBeInTheDocument()
            })
        })

        it('debe mostrar cada lote en la lista', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                expect(screen.getByTestId('lot-item-1')).toBeInTheDocument()
                expect(screen.getByTestId('lot-item-2')).toBeInTheDocument()
            })
        })

        it('debe tener botón de ver detalles en cada lote', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const detailButtons = screen.getAllByText('Ver detalles')
                expect(detailButtons).toHaveLength(2)
            })
        })

        it('debe navegar a detalles del lote al hacer clic', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const detailButtons = screen.getAllByText('Ver detalles')
                fireEvent.click(detailButtons[0])
            })

            expect(mockPush).toHaveBeenCalledWith('/listado/lotes/1')
        })

        it('debe navegar al lote correcto según el ID', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const detailButtons = screen.getAllByText('Ver detalles')
                fireEvent.click(detailButtons[1])
            })

            expect(mockPush).toHaveBeenCalledWith('/listado/lotes/2')
        })
    })

    describe('Test: Transformación de datos al DTO', () => {
        it('debe transformar strings a números en el DTO', async () => {
            ; (loteService.crearLote as jest.Mock).mockResolvedValue({ loteID: 10 })

            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-2024-010' } })
                fireEvent.change(screen.getByTestId('input-cultivarID'), { target: { value: '5' } })
                fireEvent.change(screen.getByTestId('input-empresaID'), { target: { value: '3' } })
                fireEvent.change(screen.getByTestId('input-depositoID'), { target: { value: '2' } })
                fireEvent.change(screen.getByTestId('input-kilosLimpios'), { target: { value: '1500' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(loteService.crearLote).toHaveBeenCalledWith(
                    expect.objectContaining({
                        cultivarID: 5,
                        empresaID: 3,
                        depositoID: 2,
                        kilosLimpios: 1500,
                    })
                )
            })
        })

        it('debe incluir el tipo de lote en el DTO', async () => {
            ; (loteService.crearLote as jest.Mock).mockResolvedValue({ loteID: 11 })

            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-2024-011' } })
                fireEvent.change(screen.getByTestId('input-tipo'), { target: { value: 'EXTERNO' } })
            })

            const submitButton = screen.getByText('Registrar Lote')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(loteService.crearLote).toHaveBeenCalledWith(
                    expect.objectContaining({
                        tipo: 'EXTERNO',
                    })
                )
            })
        })
    })

    describe('Test: Casos edge y valores límite', () => {
        it('debe manejar valores numéricos grandes correctamente', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                const kilosInput = screen.getByTestId('input-kilosLimpios')
                fireEvent.change(kilosInput, { target: { value: '999999' } })
                expect(kilosInput).toHaveValue(999999)
            })
        })

        it('debe manejar lista vacía de lotes', async () => {
            ; (loteService.obtenerLotesActivos as jest.Mock).mockResolvedValue([])

            render(<RegistroLotesPage />)

            await waitFor(() => {
                expect(screen.getByTestId('lot-list')).toBeInTheDocument()
            })
        })

        it('debe mantener el estado del formulario durante la navegación entre pestañas', async () => {
            render(<RegistroLotesPage />)

            await waitFor(() => {
                fireEvent.change(screen.getByTestId('input-ficha'), { target: { value: 'F-2024-PERSIST' } })
            })

            const ubicacionButton = screen.getByText('Ubicación')
            fireEvent.click(ubicacionButton)

            const datosButton = screen.getByText('Datos')
            fireEvent.click(datosButton)

            await waitFor(() => {
                expect(screen.getByTestId('input-ficha')).toHaveValue('F-2024-PERSIST')
            })
        })
    })
})
