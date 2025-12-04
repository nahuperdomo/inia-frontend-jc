

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DetalleLotePage from '@/app/listado/lotes/[id]/page'
import * as loteService from '@/app/services/lote-service'
import { LoteDTO } from '@/app/models/interfaces/lote'
import { TipoAnalisis } from '@/app/models/types/enums'
import { toast } from 'sonner'

// Mock de servicios
jest.mock('@/app/services/lote-service')

// Mock de navegación
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn()
    }),
    useParams: () => ({ id: '1' }),
    usePathname: () => '/listado/lotes/1'
}))

// Mock de toast
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn()
    },
    Toaster: () => <div data-testid="toaster">Toaster</div>
}))

// Mock de AuthProvider
const mockUser = { id: 1, username: 'testuser', role: 'analista' }
jest.mock('@/components/auth-provider', () => ({
    useAuth: () => ({
        user: mockUser,
        isAuthenticated: true
    })
}))

describe('DetalleLotePage Tests', () => {
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
            },
            {
                humedadID: 2,
                humedadNombre: 'Humedad Final',
                porcentaje: 11.8
            }
        ],
        activo: true
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUser.role = 'analista'
        jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(mockLote)
    })

    describe('Test: Renderizado y carga de datos', () => {
        it('debe mostrar loading mientras carga los datos', () => {
            jest.spyOn(loteService, 'obtenerLotePorId')
                .mockImplementation(() => new Promise(() => { })) // Never resolves

            render(<DetalleLotePage />)

            expect(screen.getByText('Cargando información del lote...')).toBeInTheDocument()
        })

        it('debe cargar y mostrar los datos del lote', async () => {
            const mockObtenerLote = jest.spyOn(loteService, 'obtenerLotePorId')
                .mockResolvedValue(mockLote)

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(mockObtenerLote).toHaveBeenCalledWith(1)
            })

            await waitFor(() => {
                expect(screen.getByText('Trigo Baguette 10')).toBeInTheDocument()
                expect(screen.getByText('F-2024-001')).toBeInTheDocument()
            })
        })

        it('debe mostrar el badge de activo', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Activo')).toBeInTheDocument()
            })
        })

        it('debe mostrar el badge de inactivo cuando el lote está inactivo', async () => {
            const loteInactivo = { ...mockLote, activo: false }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteInactivo)

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Inactivo')).toBeInTheDocument()
            })
        })

        it('debe mostrar el ID del lote', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText(/ID: 1/i)).toBeInTheDocument()
            })
        })

        it('debe mostrar el botón de editar', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                const editarButtons = screen.getAllByText('Editar')
                expect(editarButtons.length).toBeGreaterThan(0)
            })
        })

        it('debe mostrar el botón volver', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                const volverButtons = screen.getAllByText('Volver')
                expect(volverButtons.length).toBeGreaterThan(0)
            })
        })

        it('debe mostrar error cuando falla la carga', async () => {
            jest.spyOn(loteService, 'obtenerLotePorId')
                .mockRejectedValue(new Error('Error de red'))

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Error al cargar lote')).toBeInTheDocument()
                expect(toast.error).toHaveBeenCalledWith(
                    'Error al cargar lote',
                    expect.objectContaining({
                        description: 'Error de red'
                    })
                )
            })
        })

        it('debe mostrar error cuando el lote no existe', async () => {
            jest.spyOn(loteService, 'obtenerLotePorId')
                .mockResolvedValue(null as any)

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Error al cargar lote')).toBeInTheDocument()
                expect(screen.getByText('Lote no encontrado')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Información Básica', () => {
        it('debe mostrar la sección de información básica', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Información Básica')).toBeInTheDocument()
            })
        })

        it('debe mostrar la ficha del lote', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                const fichaLabels = screen.getAllByText('Ficha')
                expect(fichaLabels.length).toBeGreaterThan(0)
                expect(screen.getAllByText('F-2024-001').length).toBeGreaterThan(0)
            })
        })

        it('debe mostrar el nombre del lote', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Nombre del Lote')).toBeInTheDocument()
                expect(screen.getAllByText('Trigo Baguette 10').length).toBeGreaterThan(0)
            })
        })

        it('debe mostrar el tipo de lote', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Tipo')).toBeInTheDocument()
                expect(screen.getByText('INTERNO')).toBeInTheDocument()
            })
        })

        it('debe mostrar el cultivar', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Cultivar')).toBeInTheDocument()
                expect(screen.getByText('Baguette 10')).toBeInTheDocument()
            })
        })

        it('debe mostrar la especie', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Especie')).toBeInTheDocument()
                expect(screen.getByText('Trigo')).toBeInTheDocument()
            })
        })

        it('debe mostrar la unidad de embolsado', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Unidad Embolsado')).toBeInTheDocument()
                expect(screen.getByText('Bolsa 50kg')).toBeInTheDocument()
            })
        })

        it('debe mostrar los códigos CC y FF', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Código CC')).toBeInTheDocument()
                expect(screen.getByText('CC-001')).toBeInTheDocument()
                expect(screen.getByText('Código FF')).toBeInTheDocument()
                expect(screen.getByText('FF-001')).toBeInTheDocument()
            })
        })

        it('debe mostrar el remitente', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Remitente')).toBeInTheDocument()
                expect(screen.getByText('Transportes ABC')).toBeInTheDocument()
            })
        })

        it('debe mostrar guion cuando no hay nombre de lote', async () => {
            const loteSinNombre = { ...mockLote, nomLote: undefined }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteSinNombre)

            render(<DetalleLotePage />)

            await waitFor(() => {
                const nombreSection = screen.getByText('Nombre del Lote').parentElement
                expect(nombreSection?.textContent).toContain('-')
            })
        })
    })

    describe('Test: Empresa y Cliente', () => {
        it('debe mostrar la sección de empresa y cliente', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Empresa y Cliente')).toBeInTheDocument()
            })
        })

        it('debe mostrar el nombre de la empresa', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Empresa')).toBeInTheDocument()
                expect(screen.getByText('Semillera del Norte')).toBeInTheDocument()
            })
        })

        it('debe mostrar el nombre del cliente', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Cliente')).toBeInTheDocument()
                expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
            })
        })

        it('debe mostrar guion cuando no hay empresa', async () => {
            const loteSinEmpresa = { ...mockLote, empresaNombre: undefined }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteSinEmpresa)

            render(<DetalleLotePage />)

            await waitFor(() => {
                const empresaSection = screen.getByText('Empresa').parentElement
                expect(empresaSection?.textContent).toContain('-')
            })
        })
    })

    describe('Test: Fechas', () => {
        it('debe mostrar la sección de fechas', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Fechas')).toBeInTheDocument()
            })
        })

        it('debe mostrar la fecha de entrega formateada', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Entrega')).toBeInTheDocument()
                expect(screen.getByText('1/3/2024')).toBeInTheDocument()
            })
        })

        it('debe mostrar la fecha de recibo formateada', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Recibo')).toBeInTheDocument()
                expect(screen.getByText('5/3/2024')).toBeInTheDocument()
            })
        })

        it('debe mostrar la fecha de cosecha formateada', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Cosecha')).toBeInTheDocument()
                expect(screen.getByText('15/2/2024')).toBeInTheDocument()
            })
        })

        it('debe mostrar guion cuando no hay fecha', async () => {
            const loteSinFechas = {
                ...mockLote,
                fechaEntrega: undefined,
                fechaCosecha: undefined
            }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteSinFechas)

            render(<DetalleLotePage />)

            await waitFor(() => {
                const fechasCard = screen.getByText('Fechas').closest('div')
                const guiones = fechasCard?.textContent?.match(/-/g)
                expect(guiones?.length).toBeGreaterThan(0)
            })
        })
    })

    describe('Test: Almacenamiento y Estado', () => {
        it('debe mostrar la sección de almacenamiento y estado', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Almacenamiento y Estado')).toBeInTheDocument()
            })
        })

        it('debe mostrar el origen', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Origen')).toBeInTheDocument()
                expect(screen.getByText('Salto')).toBeInTheDocument()
            })
        })

        it('debe mostrar el depósito', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Depósito')).toBeInTheDocument()
                expect(screen.getByText('Depósito Central')).toBeInTheDocument()
            })
        })

        it('debe mostrar el estado', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Estado')).toBeInTheDocument()
                expect(screen.getByText('Almacenado')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Peso y Artículo', () => {
        it('debe mostrar la sección de peso y artículo', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Peso y Artículo')).toBeInTheDocument()
            })
        })

        it('debe mostrar los kilos limpios', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Kilos Limpios')).toBeInTheDocument()
                expect(screen.getByText('1000 kg')).toBeInTheDocument()
            })
        })

        it('debe mostrar el número de artículo', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Número Artículo')).toBeInTheDocument()
                expect(screen.getByText('ART-2024-001')).toBeInTheDocument()
            })
        })

        it('debe mostrar guion cuando no hay kilos limpios', async () => {
            const loteSinKilos = { ...mockLote, kilosLimpios: undefined }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteSinKilos)

            render(<DetalleLotePage />)

            await waitFor(() => {
                const kilosSection = screen.getByText('Kilos Limpios').parentElement
                expect(kilosSection?.textContent).toContain('-')
            })
        })
    })

    describe('Test: Observaciones', () => {
        it('debe mostrar la sección de observaciones cuando existen', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Observaciones')).toBeInTheDocument()
                expect(screen.getByText('Lote de alta calidad')).toBeInTheDocument()
            })
        })

        it('no debe mostrar la sección de observaciones cuando no hay', async () => {
            const loteSinObservaciones = { ...mockLote, observaciones: undefined }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteSinObservaciones)

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.queryByText('Observaciones')).not.toBeInTheDocument()
            })
        })

        it('debe preservar saltos de línea en observaciones', async () => {
            const loteConSaltos = {
                ...mockLote,
                observaciones: 'Línea 1\nLínea 2\nLínea 3'
            }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteConSaltos)

            render(<DetalleLotePage />)

            await waitFor(() => {
                const observacionesText = screen.getByText(/Línea 1/)
                expect(observacionesText).toHaveClass('whitespace-pre-wrap')
            })
        })
    })

    describe('Test: Análisis Asignados', () => {
        it('debe mostrar la sección de análisis asignados', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Análisis Asignados')).toBeInTheDocument()
            })
        })

        it('debe mostrar los tipos de análisis con sus labels correctos', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Pureza Física')).toBeInTheDocument()
                expect(screen.getByText('Germinación')).toBeInTheDocument()
            })
        })

        it('debe mostrar mensaje cuando no hay análisis asignados', async () => {
            const loteSinAnalisis = { ...mockLote, tiposAnalisisAsignados: [] }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteSinAnalisis)

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('No hay tipos de análisis asignados')).toBeInTheDocument()
            })
        })

        it('debe convertir correctamente todos los tipos de análisis', async () => {
            const loteConTodos = {
                ...mockLote,
                tiposAnalisisAsignados: [
                    'PUREZA' as TipoAnalisis,
                    'GERMINACION' as TipoAnalisis,
                    'PMS' as TipoAnalisis,
                    'TETRAZOLIO' as TipoAnalisis,
                    'DOSN' as TipoAnalisis
                ]
            }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteConTodos)

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Pureza Física')).toBeInTheDocument()
                expect(screen.getByText('Germinación')).toBeInTheDocument()
                expect(screen.getByText('Peso de Mil Semillas')).toBeInTheDocument()
                expect(screen.getByText('Tetrazolio')).toBeInTheDocument()
                expect(screen.getByText('DOSN')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Datos de Humedad', () => {
        it('debe mostrar la sección de datos de humedad', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Datos de Humedad')).toBeInTheDocument()
            })
        })

        it('debe mostrar todos los registros de humedad', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Humedad Inicial')).toBeInTheDocument()
                expect(screen.getByText('12.5%')).toBeInTheDocument()
                expect(screen.getByText('Humedad Final')).toBeInTheDocument()
                expect(screen.getByText('11.8%')).toBeInTheDocument()
            })
        })

        it('no debe mostrar la sección cuando no hay datos de humedad', async () => {
            const loteSinHumedad = { ...mockLote, datosHumedad: [] }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteSinHumedad)

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.queryByText('Datos de Humedad')).not.toBeInTheDocument()
            })
        })

        it('debe mostrar ID cuando no hay nombre de humedad', async () => {
            const loteConHumedadSinNombre = {
                ...mockLote,
                datosHumedad: [{
                    humedadID: 1,
                    humedadNombre: undefined,
                    porcentaje: 12.5
                }]
            }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteConHumedadSinNombre)

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText(/Tipo: ID 1/)).toBeInTheDocument()
            })
        })
    })

    describe('Test: Navegación', () => {
        it('debe tener links al listado de lotes', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                const volverLinks = screen.getAllByRole('link').filter(
                    link => link.getAttribute('href') === '/listado/lotes'
                )
                expect(volverLinks.length).toBeGreaterThan(0)
            })
        })

        it('debe tener links a la página de edición', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                const editarLinks = screen.getAllByRole('link').filter(
                    link => link.getAttribute('href') === '/listado/lotes/1/editar'
                )
                expect(editarLinks.length).toBeGreaterThan(0)
            })
        })

        it('debe tener link a crear análisis', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                const analisisLink = screen.getByRole('link', { name: /crear análisis/i })
                expect(analisisLink).toHaveAttribute('href', '/registro/analisis')
            })
        })

        it('debe tener link a ver todos los lotes', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                const todosLink = screen.getByRole('link', { name: /ver todos los lotes/i })
                expect(todosLink).toHaveAttribute('href', '/listado/lotes')
            })
        })
    })

    describe('Test: Acciones según rol de usuario', () => {
        it('debe mostrar botones de editar y crear análisis para analista', async () => {
            mockUser.role = 'analista'

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByRole('link', { name: /editar lote/i })).toBeInTheDocument()
                expect(screen.getByRole('link', { name: /crear análisis/i })).toBeInTheDocument()
            })
        })

        it('no debe mostrar botones de editar y crear para observador', async () => {
            mockUser.role = 'observador'

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.queryByRole('link', { name: /editar lote/i })).not.toBeInTheDocument()
                expect(screen.queryByRole('link', { name: /crear análisis/i })).not.toBeInTheDocument()
            })
        })

        it('debe mostrar todos los botones para administrador', async () => {
            mockUser.role = 'administrador'

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByRole('link', { name: /editar lote/i })).toBeInTheDocument()
                expect(screen.getByRole('link', { name: /crear análisis/i })).toBeInTheDocument()
            })
        })
    })

    describe('Test: Casos edge y valores especiales', () => {
        it('debe manejar lote sin datos de humedad y análisis', async () => {
            const loteMinimo: LoteDTO = {
                loteID: 1,
                ficha: 'F-2024-001',
                nomLote: 'Lote Mínimo',
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

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Lote Mínimo')).toBeInTheDocument()
                expect(screen.queryByText('Datos de Humedad')).not.toBeInTheDocument()
                expect(screen.getByText('No hay tipos de análisis asignados')).toBeInTheDocument()
            })
        })

        it('debe usar ficha como título cuando no hay nombre de lote', async () => {
            const loteSinNombre = {
                ...mockLote,
                nomLote: undefined
            }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteSinNombre)

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('Lote F-2024-001')).toBeInTheDocument()
            })
        })

        it('debe formatear correctamente valores numéricos grandes', async () => {
            const loteGrande = {
                ...mockLote,
                kilosLimpios: 999999
            }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteGrande)

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('999999 kg')).toBeInTheDocument()
            })
        })

        it('debe manejar porcentajes decimales en humedad', async () => {
            const loteDecimal = {
                ...mockLote,
                datosHumedad: [{
                    humedadID: 1,
                    humedadNombre: 'Humedad',
                    porcentaje: 12.567
                }]
            }
            jest.spyOn(loteService, 'obtenerLotePorId').mockResolvedValue(loteDecimal)

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByText('12.567%')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Renderizado del Toaster', () => {
        it('debe renderizar el componente Toaster', async () => {
            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(screen.getByTestId('toaster')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Manejo de errores con mensaje personalizado', () => {
        it('debe mostrar mensaje de error personalizado', async () => {
            jest.spyOn(loteService, 'obtenerLotePorId')
                .mockRejectedValue({ message: 'Error de conexión' })

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Error al cargar lote',
                    expect.objectContaining({
                        description: 'Error de conexión'
                    })
                )
            })
        })

        it('debe mostrar mensaje genérico cuando no hay mensaje de error', async () => {
            jest.spyOn(loteService, 'obtenerLotePorId')
                .mockRejectedValue({})

            render(<DetalleLotePage />)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Error al cargar lote',
                    expect.objectContaining({
                        description: 'No se pudo cargar la información del lote'
                    })
                )
            })
        })
    })
})
