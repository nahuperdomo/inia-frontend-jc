

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ListadoLotesPage from '@/app/listado/lotes/page'
import * as loteService from '@/app/services/lote-service'
import * as cultivarService from '@/app/services/cultivar-service'
import { toast } from 'sonner'

// Mock de servicios
jest.mock('@/app/services/lote-service')
jest.mock('@/app/services/cultivar-service')

// Mock de navegación
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
        back: jest.fn()
    }),
    usePathname: () => '/listado/lotes',
    useSearchParams: () => new URLSearchParams()
}))

// Mock de toast
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn()
    }
}))

// Mock de AuthProvider
const mockUser = { id: 1, username: 'testuser', role: 'analista' }
jest.mock('@/components/auth-provider', () => ({
    useAuth: () => ({
        user: mockUser,
        isAuthenticated: true
    })
}))

// Mock de componentes
jest.mock('@/components/pagination', () => {
    return function MockPagination({ currentPage, totalPages, onPageChange }: any) {
        return (
            <div data-testid="pagination">
                <button onClick={() => onPageChange(0)} disabled={currentPage === 0}>
                    First
                </button>
                <span>Page {currentPage + 1} of {totalPages}</span>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
                    Next
                </button>
            </div>
        )
    }
})

jest.mock('@/components/ui/combobox', () => {
    return function MockCombobox({ value, onValueChange, options, placeholder }: any) {
        return (
            <select
                data-testid="cultivar-combobox"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                aria-label={placeholder}
            >
                {options.map((opt: any) => (
                    <option key={opt.id} value={opt.id}>
                        {opt.nombre}
                    </option>
                ))}
            </select>
        )
    }
})

describe('ListadoLotesPage Tests', () => {
    const mockLotes = [
        {
            loteID: 1,
            ficha: 'F-2024-001',
            nomLote: 'Trigo Baguette 10',
            cultivarNombre: 'Baguette 10',
            especieNombre: 'Trigo',
            activo: true,
        },
        {
            loteID: 2,
            ficha: 'F-2024-002',
            nomLote: 'Soja DM 48',
            cultivarNombre: 'DM 48',
            especieNombre: 'Soja',
            activo: true,
        },
        {
            loteID: 3,
            ficha: 'F-2024-003',
            nomLote: 'Maíz Colorado',
            cultivarNombre: 'Colorado',
            especieNombre: 'Maíz',
            activo: false,
        }
    ]

    const mockPaginatedResponse = {
        content: mockLotes,
        totalElements: 3,
        totalPages: 1,
        last: true,
        first: true,
        number: 0
    }

    const mockEstadisticas = {
        total: 3,
        activos: 2,
        inactivos: 1
    }

    const mockCultivares = [
        { cultivarID: 1, nombre: 'Baguette 10', especieID: 1, activo: true },
        { cultivarID: 2, nombre: 'DM 48', especieID: 2, activo: true },
        { cultivarID: 3, nombre: 'Colorado', especieID: 3, activo: true }
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockUser.role = 'analista'
        jest.spyOn(loteService, 'obtenerLotesPaginadas').mockResolvedValue(mockPaginatedResponse)
        jest.spyOn(loteService, 'obtenerEstadisticasLotes').mockResolvedValue(mockEstadisticas)
        jest.spyOn(cultivarService, 'obtenerTodosCultivares').mockResolvedValue(mockCultivares)
    })

    describe('Test: Renderizado básico', () => {
        it('debe renderizar el título y descripción de la página', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(screen.getByText('Listado de Lotes')).toBeInTheDocument()
            })

            expect(screen.getByText('Consulta y administra todos los lotes registrados')).toBeInTheDocument()
        })

        it('debe renderizar el botón de nuevo lote', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const nuevoButton = screen.getByRole('link', { name: /nuevo lote/i })
                expect(nuevoButton).toBeInTheDocument()
                expect(nuevoButton).toHaveAttribute('href', '/registro/lotes')
            })
        })

        it('debe renderizar el botón volver', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const volverLink = screen.getByRole('link', { name: /volver/i })
                expect(volverLink).toBeInTheDocument()
                expect(volverLink).toHaveAttribute('href', '/listado')
            })
        })

        it('debe mostrar las tarjetas de estadísticas', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(screen.getByText('Total Lotes')).toBeInTheDocument()
                expect(screen.getByText('Activos')).toBeInTheDocument()
                expect(screen.getByText('Inactivos')).toBeInTheDocument()
                expect(screen.getByText('Con Análisis')).toBeInTheDocument()
            })
        })

        it('no debe mostrar el botón de nuevo lote para observadores', async () => {
            mockUser.role = 'observador'

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const nuevoButton = screen.queryByRole('link', { name: /nuevo lote/i })
                expect(nuevoButton).not.toBeInTheDocument()
            })
        })
    })

    describe('Test: Carga de datos', () => {
        it('debe cargar los lotes al montar el componente', async () => {
            const mockObtenerLotes = jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue(mockPaginatedResponse)

            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(mockObtenerLotes).toHaveBeenCalledWith(
                    0,
                    10,
                    '',
                    null,
                    'todos'
                )
            })
        })

        it('debe cargar las estadísticas al montar el componente', async () => {
            const mockObtenerEstadisticas = jest.spyOn(loteService, 'obtenerEstadisticasLotes')
                .mockResolvedValue(mockEstadisticas)

            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(mockObtenerEstadisticas).toHaveBeenCalled()
            })
        })

        it('debe cargar los cultivares para el filtro', async () => {
            const mockObtenerCultivares = jest.spyOn(cultivarService, 'obtenerTodosCultivares')
                .mockResolvedValue(mockCultivares)

            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(mockObtenerCultivares).toHaveBeenCalledWith(true) // Solo activos
            })
        })

        it('debe mostrar los lotes en la tabla', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(screen.getByText('Trigo Baguette 10')).toBeInTheDocument()
                expect(screen.getByText('Soja DM 48')).toBeInTheDocument()
                expect(screen.getByText('Maíz Colorado')).toBeInTheDocument()
            })
        })

        it('debe mostrar las fichas de los lotes', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(screen.getByText('F-2024-001')).toBeInTheDocument()
                expect(screen.getByText('F-2024-002')).toBeInTheDocument()
                expect(screen.getByText('F-2024-003')).toBeInTheDocument()
            })
        })

        it('debe mostrar los cultivares de los lotes', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(screen.getAllByText('Baguette 10').length).toBeGreaterThan(0)
                expect(screen.getAllByText('DM 48').length).toBeGreaterThan(0)
                expect(screen.getAllByText('Colorado').length).toBeGreaterThan(0)
            })
        })

        it('debe mostrar las especies de los lotes', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(screen.getByText('Trigo')).toBeInTheDocument()
                expect(screen.getByText('Soja')).toBeInTheDocument()
                expect(screen.getByText('Maíz')).toBeInTheDocument()
            })
        })

        it('debe mostrar el badge de estado correcto', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const activoBadges = screen.getAllByText('Activo')
                const inactivoBadges = screen.getAllByText('Inactivo')
                expect(activoBadges.length).toBe(2)
                expect(inactivoBadges.length).toBe(1)
            })
        })

        it('debe manejar error al cargar lotes', async () => {
            jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockRejectedValue(new Error('Error de red'))

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching lotes:', expect.any(Error))
                expect(screen.getByText('Error al cargar los lotes. Intente nuevamente más tarde.')).toBeInTheDocument()
            })

            consoleErrorSpy.mockRestore()
        })

        it('debe manejar error al cargar cultivares', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
            jest.spyOn(cultivarService, 'obtenerTodosCultivares')
                .mockRejectedValue(new Error('Error cultivares'))

            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Error obteniendo cultivares:', expect.any(Error))
            })

            consoleErrorSpy.mockRestore()
        })
    })

    describe('Test: Estadísticas', () => {
        it('debe mostrar correctamente el total de lotes', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const totalCard = screen.getByText('Total Lotes').closest('div')
                expect(totalCard?.textContent).toContain('3')
            })
        })

        it('debe mostrar correctamente los lotes activos', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const activosCard = screen.getByText('Activos').closest('div')
                expect(activosCard?.textContent).toContain('2')
            })
        })

        it('debe mostrar correctamente los lotes inactivos', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const inactivosCard = screen.getByText('Inactivos').closest('div')
                expect(inactivosCard?.textContent).toContain('1')
            })
        })

        it('debe mostrar 0 en "Con Análisis" por defecto', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const analisisCard = screen.getByText('Con Análisis').closest('div')
                expect(analisisCard?.textContent).toContain('0')
            })
        })

        it('debe manejar error al cargar estadísticas', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
            jest.spyOn(loteService, 'obtenerEstadisticasLotes')
                .mockRejectedValue(new Error('Error estadísticas'))

            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Error obteniendo estadísticas:', expect.any(Error))
            })

            consoleErrorSpy.mockRestore()
        })
    })

    describe('Test: Búsqueda y filtrado', () => {
        it('debe tener campo de búsqueda', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText(/Buscar por ficha, nombre de lote, cultivar o especie/i)
                expect(searchInput).toBeInTheDocument()
            })
        })

        it('debe actualizar el término de búsqueda al escribir', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText(/Buscar por ficha, nombre de lote, cultivar o especie/i)
                fireEvent.change(searchInput, { target: { value: 'Trigo' } })
                expect(searchInput).toHaveValue('Trigo')
            })
        })

        it('debe buscar al presionar Enter', async () => {
            const mockObtenerLotes = jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue(mockPaginatedResponse)

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText(/Buscar por ficha, nombre de lote, cultivar o especie/i)
                fireEvent.change(searchInput, { target: { value: 'Trigo' } })
                fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' })
            })

            await waitFor(() => {
                expect(mockObtenerLotes).toHaveBeenCalledWith(
                    0,
                    10,
                    'Trigo',
                    null,
                    'todos'
                )
            })
        })

        it('debe buscar al hacer clic en el botón de búsqueda', async () => {
            const mockObtenerLotes = jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue(mockPaginatedResponse)

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText(/Buscar por ficha, nombre de lote, cultivar o especie/i)
                fireEvent.change(searchInput, { target: { value: 'Soja' } })

                const searchButtons = screen.getAllByRole('button')
                const searchButton = searchButtons.find(btn => btn.querySelector('svg'))
                if (searchButton) {
                    fireEvent.click(searchButton)
                }
            })

            await waitFor(() => {
                expect(mockObtenerLotes).toHaveBeenCalledWith(
                    0,
                    10,
                    'Soja',
                    null,
                    'todos'
                )
            })
        })

        it('debe filtrar por estado activo', async () => {
            const mockObtenerLotes = jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue(mockPaginatedResponse)

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const estadoSelect = screen.getByDisplayValue(/todos los estados/i)
                fireEvent.change(estadoSelect, { target: { value: 'Activo' } })
            })

            await waitFor(() => {
                expect(mockObtenerLotes).toHaveBeenCalledWith(
                    0,
                    10,
                    '',
                    true,
                    'todos'
                )
            })
        })

        it('debe filtrar por estado inactivo', async () => {
            const mockObtenerLotes = jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue(mockPaginatedResponse)

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const estadoSelect = screen.getByDisplayValue(/todos los estados/i)
                fireEvent.change(estadoSelect, { target: { value: 'Inactivo' } })
            })

            await waitFor(() => {
                expect(mockObtenerLotes).toHaveBeenCalledWith(
                    0,
                    10,
                    '',
                    false,
                    'todos'
                )
            })
        })

        it('debe filtrar por cultivar', async () => {
            const mockObtenerLotes = jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue(mockPaginatedResponse)

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const cultivarCombobox = screen.getByTestId('cultivar-combobox')
                fireEvent.change(cultivarCombobox, { target: { value: 'Baguette 10' } })
            })

            await waitFor(() => {
                expect(mockObtenerLotes).toHaveBeenCalledWith(
                    0,
                    10,
                    '',
                    null,
                    'Baguette 10'
                )
            })
        })

        it('debe mostrar opción "Todos los cultivares" en el combobox', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const cultivarCombobox = screen.getByTestId('cultivar-combobox')
                const todosOption = Array.from(cultivarCombobox.querySelectorAll('option')).find(
                    opt => opt.textContent === 'Todos los cultivares'
                )
                expect(todosOption).toBeInTheDocument()
            })
        })

        it('debe combinar búsqueda y filtros', async () => {
            const mockObtenerLotes = jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue(mockPaginatedResponse)

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText(/Buscar por ficha, nombre de lote, cultivar o especie/i)
                fireEvent.change(searchInput, { target: { value: 'F-2024' } })

                const estadoSelect = screen.getByDisplayValue(/todos los estados/i)
                fireEvent.change(estadoSelect, { target: { value: 'Activo' } })

                fireEvent.keyDown(searchInput, { key: 'Enter' })
            })

            await waitFor(() => {
                expect(mockObtenerLotes).toHaveBeenCalledWith(
                    0,
                    10,
                    'F-2024',
                    true,
                    'todos'
                )
            })
        })
    })

    describe('Test: Paginación', () => {
        it('debe mostrar el componente de paginación', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(screen.getByTestId('pagination')).toBeInTheDocument()
            })
        })

        it('debe mostrar información de resultados', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(screen.getByText(/Mostrando 1 a 3 de 3 resultados/i)).toBeInTheDocument()
            })
        })

        it('debe cambiar de página al hacer clic en paginación', async () => {
            const mockMultiPage = {
                ...mockPaginatedResponse,
                totalPages: 2,
                totalElements: 20,
                last: false
            }

            jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue(mockMultiPage)

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const nextButton = screen.getByRole('button', { name: /next/i })
                fireEvent.click(nextButton)
            })

            await waitFor(() => {
                expect(loteService.obtenerLotesPaginadas).toHaveBeenCalled()
            })
        })

        it('debe resetear a página 0 al cambiar filtros', async () => {
            const mockObtenerLotes = jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue(mockPaginatedResponse)

            render(<ListadoLotesPage />)

            // Cambiar filtro
            await waitFor(() => {
                const estadoSelect = screen.getByDisplayValue(/todos los estados/i)
                fireEvent.change(estadoSelect, { target: { value: 'Activo' } })
            })

            await waitFor(() => {
                // Debe llamar con página 0
                expect(mockObtenerLotes).toHaveBeenCalledWith(0, 10, '', true, 'todos')
            })
        })
    })

    describe('Test: Acciones en la tabla', () => {
        it('debe mostrar botón de ver para cada lote', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const verButtons = screen.getAllByTitle('Ver detalles')
                expect(verButtons.length).toBe(3)
            })
        })

        it('debe mostrar botón de editar solo para lotes activos', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const editarButtons = screen.getAllByTitle('Editar')
                expect(editarButtons.length).toBe(2) // Solo los 2 activos
            })
        })

        it('no debe mostrar botón de editar para lotes inactivos', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const table = screen.getByRole('table')
                const rows = table.querySelectorAll('tbody tr')

                // La tercera fila es el lote inactivo
                const inactiveRow = rows[2]
                const editButton = inactiveRow.querySelector('[title="Editar"]')
                expect(editButton).not.toBeInTheDocument()
            })
        })

        it('debe navegar a la página de detalle al hacer clic en ver', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const verLinks = screen.getAllByRole('link').filter(
                    link => link.getAttribute('href')?.match(/\/listado\/lotes\/\d+$/)
                )
                expect(verLinks.length).toBeGreaterThan(0)
                expect(verLinks[0]).toHaveAttribute('href', '/listado/lotes/1')
            })
        })

        it('debe navegar a la página de edición al hacer clic en editar', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                const editarLinks = screen.getAllByRole('link').filter(
                    link => link.getAttribute('href')?.includes('/editar')
                )
                expect(editarLinks.length).toBeGreaterThan(0)
                expect(editarLinks[0]).toHaveAttribute('href', '/listado/lotes/1/editar')
            })
        })

        it('no debe mostrar botón editar para observadores', async () => {
            mockUser.role = 'observador'

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const editarButtons = screen.queryAllByTitle('Editar')
                expect(editarButtons.length).toBe(0)
            })
        })
    })

    describe('Test: Desactivar/Reactivar (Solo Admin)', () => {
        it('debe mostrar botón de desactivar para administrador en lotes activos', async () => {
            mockUser.role = 'administrador'

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const deleteButtons = screen.getAllByTitle('Desactivar')
                expect(deleteButtons.length).toBe(2) // 2 lotes activos
            })
        })

        it('debe mostrar botón de reactivar para administrador en lotes inactivos', async () => {
            mockUser.role = 'administrador'

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const reactivarButtons = screen.getAllByTitle('Reactivar')
                expect(reactivarButtons.length).toBe(1) // 1 lote inactivo
            })
        })

        it('no debe mostrar botones de desactivar/reactivar para usuario normal', async () => {
            mockUser.role = 'analista'

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const deleteButtons = screen.queryAllByTitle('Desactivar')
                const reactivarButtons = screen.queryAllByTitle('Reactivar')
                expect(deleteButtons.length).toBe(0)
                expect(reactivarButtons.length).toBe(0)
            })
        })

        it('debe desactivar un lote correctamente', async () => {
            mockUser.role = 'administrador'
            global.confirm = jest.fn(() => true)

            const mockEliminar = jest.spyOn(loteService, 'eliminarLote')
                .mockResolvedValue(undefined)

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const deleteButtons = screen.getAllByTitle('Desactivar')
                fireEvent.click(deleteButtons[0])
            })

            await waitFor(() => {
                expect(mockEliminar).toHaveBeenCalledWith(1)
                expect(toast.success).toHaveBeenCalledWith('Lote desactivado exitosamente')
            })
        })

        it('debe reactivar un lote correctamente', async () => {
            mockUser.role = 'administrador'

            const mockActivar = jest.spyOn(loteService, 'activarLote')
                .mockResolvedValue({ loteID: 3, activo: true } as any)

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const reactivarButton = screen.getByTitle('Reactivar')
                fireEvent.click(reactivarButton)
            })

            await waitFor(() => {
                expect(mockActivar).toHaveBeenCalledWith(3)
                expect(toast.success).toHaveBeenCalledWith('Lote reactivado exitosamente')
            })
        })

        it('debe cancelar desactivación si el usuario no confirma', async () => {
            mockUser.role = 'administrador'
            global.confirm = jest.fn(() => false)

            const mockEliminar = jest.spyOn(loteService, 'eliminarLote')

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const deleteButtons = screen.getAllByTitle('Desactivar')
                fireEvent.click(deleteButtons[0])
            })

            expect(mockEliminar).not.toHaveBeenCalled()
        })

        it('debe manejar error al desactivar lote', async () => {
            mockUser.role = 'administrador'
            global.confirm = jest.fn(() => true)

            jest.spyOn(loteService, 'eliminarLote')
                .mockRejectedValue({ message: 'Error al desactivar' })

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const deleteButtons = screen.getAllByTitle('Desactivar')
                fireEvent.click(deleteButtons[0])
            })

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Error al desactivar lote',
                    expect.objectContaining({
                        description: 'Error al desactivar'
                    })
                )
            })
        })

        it('debe manejar error al reactivar lote', async () => {
            mockUser.role = 'administrador'

            jest.spyOn(loteService, 'activarLote')
                .mockRejectedValue({ message: 'Error al reactivar' })

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const reactivarButton = screen.getByTitle('Reactivar')
                fireEvent.click(reactivarButton)
            })

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Error al reactivar lote',
                    expect.objectContaining({
                        description: 'Error al reactivar'
                    })
                )
            })
        })

        it('debe recargar la lista después de desactivar', async () => {
            mockUser.role = 'administrador'
            global.confirm = jest.fn(() => true)

            const mockObtenerLotes = jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue(mockPaginatedResponse)

            jest.spyOn(loteService, 'eliminarLote').mockResolvedValue(undefined)

            render(<ListadoLotesPage />)

            // Esperar carga inicial
            await waitFor(() => {
                expect(mockObtenerLotes).toHaveBeenCalledTimes(1)
            })

            // Desactivar lote
            await waitFor(() => {
                const deleteButtons = screen.getAllByTitle('Desactivar')
                fireEvent.click(deleteButtons[0])
            })

            // Debe recargar la lista
            await waitFor(() => {
                expect(mockObtenerLotes).toHaveBeenCalledTimes(2)
            })
        })

        it('debe recargar la lista después de reactivar', async () => {
            mockUser.role = 'administrador'

            const mockObtenerLotes = jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue(mockPaginatedResponse)

            jest.spyOn(loteService, 'activarLote').mockResolvedValue({ loteID: 3 } as any)

            render(<ListadoLotesPage />)

            // Esperar carga inicial
            await waitFor(() => {
                expect(mockObtenerLotes).toHaveBeenCalledTimes(1)
            })

            // Reactivar lote
            await waitFor(() => {
                const reactivarButton = screen.getByTitle('Reactivar')
                fireEvent.click(reactivarButton)
            })

            // Debe recargar la lista
            await waitFor(() => {
                expect(mockObtenerLotes).toHaveBeenCalledTimes(2)
            })
        })
    })

    describe('Test: Estados vacíos', () => {
        it('debe mostrar mensaje cuando no hay lotes', async () => {
            jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue({
                    content: [],
                    totalElements: 0,
                    totalPages: 0,
                    last: true,
                    first: true,
                    number: 0
                })

            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(screen.getByText('No se encontraron lotes que coincidan con los criterios de búsqueda.')).toBeInTheDocument()
            })
        })

        it('debe mostrar 0 en estadísticas cuando no hay lotes', async () => {
            jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue({
                    content: [],
                    totalElements: 0,
                    totalPages: 0,
                    last: true,
                    first: true,
                    number: 0
                })

            jest.spyOn(loteService, 'obtenerEstadisticasLotes')
                .mockResolvedValue({ total: 0, activos: 0, inactivos: 0 })

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const totalCard = screen.getByText('Total Lotes').closest('div')
                expect(totalCard?.textContent).toContain('0')
            })
        })

        it('debe mostrar "Mostrando 0 de 0 resultados" cuando no hay datos', async () => {
            jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue({
                    content: [],
                    totalElements: 0,
                    totalPages: 0,
                    last: true,
                    first: true,
                    number: 0
                })

            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(screen.getByText(/Mostrando 0 de 0 resultados/i)).toBeInTheDocument()
            })
        })
    })

    describe('Test: Manejo de valores nulos', () => {
        it('debe mostrar guion cuando no hay ficha', async () => {
            const loteSinFicha = [{
                ...mockLotes[0],
                ficha: '' as any
            }]

            jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue({
                    ...mockPaginatedResponse,
                    content: loteSinFicha
                })

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const table = screen.getByRole('table')
                expect(table.textContent).toContain('-')
            })
        })

        it('debe mostrar guion cuando no hay cultivar', async () => {
            const loteSinCultivar = [{
                ...mockLotes[0],
                cultivarNombre: undefined
            }]

            jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue({
                    ...mockPaginatedResponse,
                    content: loteSinCultivar
                })

            render(<ListadoLotesPage />)

            await waitFor(() => {
                const table = screen.getByRole('table')
                expect(table.textContent).toContain('-')
            })
        })
    })

    describe('Test: Loading states', () => {
        it('debe mostrar loader mientras carga los lotes', async () => {
            jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

            render(<ListadoLotesPage />)

            expect(screen.getByText('Cargando datos de lotes...')).toBeInTheDocument()
        })

        it('debe mostrar "Cargando..." en las estadísticas mientras carga', async () => {
            jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

            render(<ListadoLotesPage />)

            const loadingTexts = screen.getAllByText('Cargando...')
            expect(loadingTexts.length).toBeGreaterThan(0)
        })
    })

    describe('Test: Botón de reintentar', () => {
        it('debe mostrar botón de reintentar cuando hay error', async () => {
            jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockRejectedValue(new Error('Error de red'))

            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(screen.getByText('Reintentar')).toBeInTheDocument()
            })
        })
    })

    describe('Test: Descripción de resultados', () => {
        it('debe mostrar "3 lotes encontrados" correctamente', async () => {
            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(screen.getByText('3 lotes encontrados')).toBeInTheDocument()
            })
        })

        it('debe mostrar "1 lote encontrado" en singular', async () => {
            jest.spyOn(loteService, 'obtenerLotesPaginadas')
                .mockResolvedValue({
                    ...mockPaginatedResponse,
                    content: [mockLotes[0]],
                    totalElements: 1
                })

            render(<ListadoLotesPage />)

            await waitFor(() => {
                expect(screen.getByText('1 lote encontrado')).toBeInTheDocument()
            })
        })
    })
})
