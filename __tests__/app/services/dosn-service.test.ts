import {
    crearDosn,
    obtenerTodasDosnActivas,
    obtenerDosnPorId,
    actualizarDosn,
    eliminarDosn,
    desactivarDosn,
    activarDosn,
    obtenerDosnPorIdLote,
    obtenerDosnPaginadas,
    obtenerTodosCatalogos,
    finalizarAnalisis,
    aprobarAnalisis,
    marcarParaRepetir,
} from '@/app/services/dosn-service';
import { apiFetch } from '@/app/services/api';
import type { DosnDTO, DosnRequestDTO, ResponseListadoDosn, MalezasCatalogoDTO } from '@/app/models';

// Mock del módulo api
jest.mock('@/app/services/api', () => ({
    apiFetch: jest.fn(),
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe('dosn-service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('crearDosn', () => {
        it('debe crear un nuevo DOSN', async () => {
            const mockRequest: DosnRequestDTO = {
                idLote: 1,
                comentarios: 'Test',
                cumpleEstandar: true,
                fechaINIA: '2024-01-15',
                gramosAnalizadosINIA: 500,
                tipoINIA: ['COMPLETO'],
            };

            const mockResponse: DosnDTO = {
                analisisID: 1,
                estado: 'REGISTRADO',
                fechaInicio: '2024-01-15',
                lote: 'LOTE-001',
                idLote: 1,
                activo: true,
                cumpleEstandar: true,
                historial: [],
            };

            mockApiFetch.mockResolvedValue(mockResponse);

            const result = await crearDosn(mockRequest);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn', {
                method: 'POST',
                body: JSON.stringify(mockRequest),
            });
            expect(result).toEqual(mockResponse);
        });

        it('debe lanzar error si falla la creación', async () => {
            const mockRequest: DosnRequestDTO = {
                idLote: 1,
            };

            mockApiFetch.mockRejectedValue(new Error('Error al crear'));

            await expect(crearDosn(mockRequest)).rejects.toThrow('Error al crear');
        });
    });

    describe('obtenerTodasDosnActivas', () => {
        it('debe obtener todas las DOSN activas', async () => {
            const mockDosns: DosnDTO[] = [
                {
                    analisisID: 1,
                    estado: 'APROBADO',
                    fechaInicio: '2024-01-15',
                    lote: 'LOTE-001',
                    activo: true,
                    historial: [],
                },
                {
                    analisisID: 2,
                    estado: 'EN_PROCESO',
                    fechaInicio: '2024-01-16',
                    lote: 'LOTE-002',
                    activo: true,
                    historial: [],
                },
            ];

            const mockResponse: ResponseListadoDosn = {
                dosns: mockDosns,
            };

            mockApiFetch.mockResolvedValue(mockResponse);

            const result = await obtenerTodasDosnActivas();

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn');
            expect(result).toEqual(mockDosns);
            expect(result).toHaveLength(2);
        });

        it('debe retornar array vacío si no hay dosns en la respuesta', async () => {
            const mockResponse = {};

            mockApiFetch.mockResolvedValue(mockResponse);

            const result = await obtenerTodasDosnActivas();

            expect(result).toEqual([]);
        });

        it('debe retornar array vacío si dosns es null', async () => {
            const mockResponse = { dosns: null };

            mockApiFetch.mockResolvedValue(mockResponse);

            const result = await obtenerTodasDosnActivas();

            expect(result).toEqual([]);
        });
    });

    describe('obtenerDosnPorId', () => {
        it('debe obtener DOSN por ID', async () => {
            const mockDosn: DosnDTO = {
                analisisID: 1,
                estado: 'APROBADO',
                fechaInicio: '2024-01-15',
                lote: 'LOTE-001',
                activo: true,
                historial: [],
                cumpleEstandar: true,
                fechaINIA: '2024-01-16',
                gramosAnalizadosINIA: 500,
                tipoINIA: ['COMPLETO'],
            };

            mockApiFetch.mockResolvedValue(mockDosn);

            const result = await obtenerDosnPorId(1);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/1');
            expect(result).toEqual(mockDosn);
        });

        it('debe llamar con ID correcto', async () => {
            mockApiFetch.mockResolvedValue({} as DosnDTO);

            await obtenerDosnPorId(123);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/123');
        });

        it('debe lanzar error si el DOSN no existe', async () => {
            mockApiFetch.mockRejectedValue(new Error('DOSN no encontrado'));

            await expect(obtenerDosnPorId(999)).rejects.toThrow('DOSN no encontrado');
        });
    });

    describe('actualizarDosn', () => {
        it('debe actualizar un DOSN existente', async () => {
            const mockRequest: DosnRequestDTO = {
                idLote: 1,
                comentarios: 'Actualizado',
                cumpleEstandar: true,
                fechaINIA: '2024-01-15',
                gramosAnalizadosINIA: 600,
                tipoINIA: ['COMPLETO', 'REDUCIDO'],
            };

            const mockResponse: DosnDTO = {
                analisisID: 1,
                estado: 'EN_PROCESO',
                fechaInicio: '2024-01-15',
                lote: 'LOTE-001',
                activo: true,
                cumpleEstandar: true,
                comentarios: 'Actualizado',
                historial: [],
            };

            mockApiFetch.mockResolvedValue(mockResponse);

            const result = await actualizarDosn(1, mockRequest);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/1', {
                method: 'PUT',
                body: JSON.stringify(mockRequest),
            });
            expect(result).toEqual(mockResponse);
        });

        it('debe llamar con ID correcto en la actualización', async () => {
            const mockRequest: DosnRequestDTO = { idLote: 1 };
            mockApiFetch.mockResolvedValue({} as DosnDTO);

            await actualizarDosn(456, mockRequest);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/456', expect.any(Object));
        });

        it('debe lanzar error si falla la actualización', async () => {
            const mockRequest: DosnRequestDTO = { idLote: 1 };
            mockApiFetch.mockRejectedValue(new Error('Error al actualizar'));

            await expect(actualizarDosn(1, mockRequest)).rejects.toThrow('Error al actualizar');
        });
    });

    describe('eliminarDosn', () => {
        it('debe eliminar un DOSN', async () => {
            mockApiFetch.mockResolvedValue(undefined);

            await eliminarDosn(1);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/1', {
                method: 'DELETE',
            });
        });

        it('debe llamar con ID correcto', async () => {
            mockApiFetch.mockResolvedValue(undefined);

            await eliminarDosn(789);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/789', {
                method: 'DELETE',
            });
        });

        it('debe lanzar error si falla la eliminación', async () => {
            mockApiFetch.mockRejectedValue(new Error('Error al eliminar'));

            await expect(eliminarDosn(1)).rejects.toThrow('Error al eliminar');
        });
    });

    describe('desactivarDosn', () => {
        it('debe desactivar un DOSN', async () => {
            mockApiFetch.mockResolvedValue(undefined);

            await desactivarDosn(1);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/1/desactivar', {
                method: 'PUT',
            });
        });

        it('debe llamar con ID correcto', async () => {
            mockApiFetch.mockResolvedValue(undefined);

            await desactivarDosn(321);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/321/desactivar', {
                method: 'PUT',
            });
        });

        it('debe lanzar error si falla la desactivación', async () => {
            mockApiFetch.mockRejectedValue(new Error('Error al desactivar'));

            await expect(desactivarDosn(1)).rejects.toThrow('Error al desactivar');
        });
    });

    describe('activarDosn', () => {
        it('debe activar un DOSN', async () => {
            const mockResponse: DosnDTO = {
                analisisID: 1,
                estado: 'REGISTRADO',
                fechaInicio: '2024-01-15',
                lote: 'LOTE-001',
                activo: true,
                historial: [],
            };

            mockApiFetch.mockResolvedValue(mockResponse);

            const result = await activarDosn(1);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/1/reactivar', {
                method: 'PUT',
            });
            expect(result).toEqual(mockResponse);
        });

        it('debe llamar con ID correcto', async () => {
            mockApiFetch.mockResolvedValue({} as DosnDTO);

            await activarDosn(654);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/654/reactivar', {
                method: 'PUT',
            });
        });

        it('debe lanzar error si falla la activación', async () => {
            mockApiFetch.mockRejectedValue(new Error('Error al activar'));

            await expect(activarDosn(1)).rejects.toThrow('Error al activar');
        });
    });

    describe('obtenerDosnPorIdLote', () => {
        it('debe obtener DOSNs por ID de lote', async () => {
            const mockDosns: DosnDTO[] = [
                {
                    analisisID: 1,
                    estado: 'APROBADO',
                    fechaInicio: '2024-01-15',
                    lote: 'LOTE-001',
                    idLote: 1,
                    activo: true,
                    historial: [],
                },
                {
                    analisisID: 2,
                    estado: 'EN_PROCESO',
                    fechaInicio: '2024-01-16',
                    lote: 'LOTE-001',
                    idLote: 1,
                    activo: true,
                    historial: [],
                },
            ];

            mockApiFetch.mockResolvedValue(mockDosns);

            const result = await obtenerDosnPorIdLote(1);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/lote/1');
            expect(result).toEqual(mockDosns);
            expect(result).toHaveLength(2);
        });

        it('debe llamar con ID de lote correcto', async () => {
            mockApiFetch.mockResolvedValue([]);

            await obtenerDosnPorIdLote(987);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/lote/987');
        });

        it('debe lanzar error si falla la búsqueda', async () => {
            mockApiFetch.mockRejectedValue(new Error('Lote no encontrado'));

            await expect(obtenerDosnPorIdLote(999)).rejects.toThrow('Lote no encontrado');
        });
    });

    describe('obtenerDosnPaginadas', () => {
        it('debe obtener DOSNs paginadas con parámetros por defecto', async () => {
            const mockResponse = {
                content: [
                    {
                        analisisID: 1,
                        estado: 'APROBADO',
                        fechaInicio: '2024-01-15',
                        lote: 'LOTE-001',
                        activo: true,
                        historial: [],
                    },
                ] as DosnDTO[],
                totalElements: 1,
                totalPages: 1,
                last: true,
                first: true,
            };

            mockApiFetch.mockResolvedValue(mockResponse);

            const result = await obtenerDosnPaginadas();

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/listado?page=0&size=10');
            expect(result).toEqual(mockResponse);
        });

        it('debe incluir parámetro de búsqueda', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                last: true,
                first: true,
            });

            await obtenerDosnPaginadas(0, 10, 'LOTE-001');

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/listado?page=0&size=10&search=LOTE-001');
        });

        it('debe incluir parámetro activo true', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                last: true,
                first: true,
            });

            await obtenerDosnPaginadas(0, 10, undefined, true);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/listado?page=0&size=10&activo=true');
        });

        it('debe incluir parámetro activo false', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                last: true,
                first: true,
            });

            await obtenerDosnPaginadas(0, 10, undefined, false);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/listado?page=0&size=10&activo=false');
        });

        it('debe incluir parámetro de estado', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                last: true,
                first: true,
            });

            await obtenerDosnPaginadas(0, 10, undefined, undefined, 'APROBADO');

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/listado?page=0&size=10&estado=APROBADO');
        });

        it('debe incluir parámetro de loteId', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                last: true,
                first: true,
            });

            await obtenerDosnPaginadas(0, 10, undefined, undefined, undefined, 123);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/listado?page=0&size=10&loteId=123');
        });

        it('debe incluir todos los parámetros', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                last: true,
                first: true,
            });

            await obtenerDosnPaginadas(2, 20, 'TEST', true, 'EN_PROCESO', 456);

            expect(mockApiFetch).toHaveBeenCalledWith(
                '/api/dosn/listado?page=2&size=20&search=TEST&activo=true&estado=EN_PROCESO&loteId=456'
            );
        });

        it('debe manejar página y tamaño personalizados', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                last: true,
                first: true,
            });

            await obtenerDosnPaginadas(5, 50);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/listado?page=5&size=50');
        });

        it('debe retornar respuesta con datos de paginación', async () => {
            const mockResponse = {
                content: [
                    { analisisID: 1, lote: 'LOTE-001' } as DosnDTO,
                    { analisisID: 2, lote: 'LOTE-002' } as DosnDTO,
                ],
                totalElements: 50,
                totalPages: 5,
                last: false,
                first: true,
            };

            mockApiFetch.mockResolvedValue(mockResponse);

            const result = await obtenerDosnPaginadas(0, 10);

            expect(result.content).toHaveLength(2);
            expect(result.totalElements).toBe(50);
            expect(result.totalPages).toBe(5);
            expect(result.last).toBe(false);
            expect(result.first).toBe(true);
        });
    });

    describe('obtenerTodosCatalogos', () => {
        it('debe obtener todos los catálogos', async () => {
            const mockCatalogos: MalezasCatalogoDTO[] = [
                {
                    catalogoID: 1,
                    nombreComun: 'Maleza 1',
                    nombreCientifico: 'Maleza scientifica 1',
                    activo: true,
                },
                {
                    catalogoID: 2,
                    nombreComun: 'Maleza 2',
                    nombreCientifico: 'Maleza scientifica 2',
                    activo: true,
                },
            ];

            mockApiFetch.mockResolvedValue(mockCatalogos);

            const result = await obtenerTodosCatalogos();

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/catalogos');
            expect(result).toEqual(mockCatalogos);
            expect(result).toHaveLength(2);
        });

        it('debe retornar array vacío si no hay catálogos', async () => {
            mockApiFetch.mockResolvedValue([]);

            const result = await obtenerTodosCatalogos();

            expect(result).toEqual([]);
        });

        it('debe lanzar error si falla la obtención', async () => {
            mockApiFetch.mockRejectedValue(new Error('Error al obtener catálogos'));

            await expect(obtenerTodosCatalogos()).rejects.toThrow('Error al obtener catálogos');
        });
    });

    describe('finalizarAnalisis', () => {
        it('debe finalizar un análisis', async () => {
            const mockResponse: DosnDTO = {
                analisisID: 1,
                estado: 'PENDIENTE_APROBACION',
                fechaInicio: '2024-01-15',
                fechaFin: '2024-01-20',
                lote: 'LOTE-001',
                activo: true,
                historial: [],
            };

            mockApiFetch.mockResolvedValue(mockResponse);

            const result = await finalizarAnalisis(1);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/1/finalizar', {
                method: 'PUT',
            });
            expect(result).toEqual(mockResponse);
            expect(result.estado).toBe('PENDIENTE_APROBACION');
        });

        it('debe llamar con ID correcto', async () => {
            mockApiFetch.mockResolvedValue({} as DosnDTO);

            await finalizarAnalisis(234);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/234/finalizar', {
                method: 'PUT',
            });
        });

        it('debe lanzar error si falla la finalización', async () => {
            mockApiFetch.mockRejectedValue(new Error('Error al finalizar'));

            await expect(finalizarAnalisis(1)).rejects.toThrow('Error al finalizar');
        });
    });

    describe('aprobarAnalisis', () => {
        it('debe aprobar un análisis', async () => {
            const mockResponse: DosnDTO = {
                analisisID: 1,
                estado: 'APROBADO',
                fechaInicio: '2024-01-15',
                fechaFin: '2024-01-20',
                lote: 'LOTE-001',
                activo: true,
                historial: [],
            };

            mockApiFetch.mockResolvedValue(mockResponse);

            const result = await aprobarAnalisis(1);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/1/aprobar', {
                method: 'PUT',
            });
            expect(result).toEqual(mockResponse);
            expect(result.estado).toBe('APROBADO');
        });

        it('debe llamar con ID correcto', async () => {
            mockApiFetch.mockResolvedValue({} as DosnDTO);

            await aprobarAnalisis(567);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/567/aprobar', {
                method: 'PUT',
            });
        });

        it('debe lanzar error si falla la aprobación', async () => {
            mockApiFetch.mockRejectedValue(new Error('Error al aprobar'));

            await expect(aprobarAnalisis(1)).rejects.toThrow('Error al aprobar');
        });
    });

    describe('marcarParaRepetir', () => {
        it('debe marcar un análisis para repetir', async () => {
            const mockResponse: DosnDTO = {
                analisisID: 1,
                estado: 'A_REPETIR',
                fechaInicio: '2024-01-15',
                lote: 'LOTE-001',
                activo: true,
                historial: [],
            };

            mockApiFetch.mockResolvedValue(mockResponse);

            const result = await marcarParaRepetir(1);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/1/repetir', {
                method: 'PUT',
            });
            expect(result).toEqual(mockResponse);
            expect(result.estado).toBe('A_REPETIR');
        });

        it('debe llamar con ID correcto', async () => {
            mockApiFetch.mockResolvedValue({} as DosnDTO);

            await marcarParaRepetir(890);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/890/repetir', {
                method: 'PUT',
            });
        });

        it('debe lanzar error si falla marcar para repetir', async () => {
            mockApiFetch.mockRejectedValue(new Error('Error al marcar para repetir'));

            await expect(marcarParaRepetir(1)).rejects.toThrow('Error al marcar para repetir');
        });
    });

    describe('Manejo de errores generales', () => {
        it('debe propagar errores de red', async () => {
            mockApiFetch.mockRejectedValue(new Error('Network error'));

            await expect(obtenerDosnPorId(1)).rejects.toThrow('Network error');
            await expect(crearDosn({ idLote: 1 })).rejects.toThrow('Network error');
            await expect(actualizarDosn(1, { idLote: 1 })).rejects.toThrow('Network error');
        });

        it('debe manejar respuestas inesperadas', async () => {
            mockApiFetch.mockResolvedValue(null);

            const result = await obtenerDosnPorId(1);
            expect(result).toBeNull();
        });
    });

    describe('Validación de parámetros', () => {
        it('debe aceptar ID 0', async () => {
            mockApiFetch.mockResolvedValue({} as DosnDTO);

            await obtenerDosnPorId(0);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/0');
        });

        it('debe aceptar números negativos como ID', async () => {
            mockApiFetch.mockResolvedValue({} as DosnDTO);

            await obtenerDosnPorId(-1);

            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/-1');
        });

        it('debe manejar strings vacíos en búsqueda', async () => {
            mockApiFetch.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                last: true,
                first: true,
            });

            await obtenerDosnPaginadas(0, 10, '');

            // No debe incluir el parámetro search si está vacío
            expect(mockApiFetch).toHaveBeenCalledWith('/api/dosn/listado?page=0&size=10');
        });
    });
});
