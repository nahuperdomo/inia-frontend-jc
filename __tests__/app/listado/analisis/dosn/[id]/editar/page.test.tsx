import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditarDosnPage from '@/app/listado/analisis/dosn/[id]/editar/page';
import {
    obtenerDosnPorId,
    actualizarDosn,
    obtenerTodasDosnActivas,
    finalizarAnalisis,
    aprobarAnalisis,
    marcarParaRepetir,
} from '@/app/services/dosn-service';
import * as malezasService from '@/app/services/malezas-service';
import * as especiesService from '@/app/services/especie-service';
import { toast } from 'sonner';
import type { DosnDTO, MalezasCatalogoDTO, EspecieDTO } from '@/app/models';

// Mocks
jest.mock('@/app/services/dosn-service');
jest.mock('@/app/services/malezas-service');
jest.mock('@/app/services/especie-service');
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
    Toaster: () => <div data-testid="toaster" />,
}));

const mockPush = jest.fn();
const mockParams = { id: '1' };

jest.mock('next/navigation', () => ({
    useParams: () => mockParams,
    useRouter: () => ({ push: mockPush }),
}));

jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

jest.mock('@/components/analisis/analisis-header-bar', () => ({
    AnalisisHeaderBar: (props: any) => (
        <div data-testid="analisis-header-bar">
            <span>Tipo: {props.tipoAnalisis}</span>
            <span>ID: {props.analisisId}</span>
            <span>Estado: {props.estado}</span>
            <button onClick={props.onGuardarCambios} disabled={props.guardando}>
                {props.guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={props.onToggleEdicion}>Volver a ver</button>
        </div>
    ),
}));

jest.mock('@/components/analisis/analisis-acciones-card', () => ({
    AnalisisAccionesCard: (props: any) => (
        <div data-testid="analisis-acciones-card">
            <span>Análisis ID: {props.analisisId}</span>
            <span>Estado: {props.estado}</span>
            <button onClick={props.onFinalizar}>Finalizar</button>
            <button onClick={props.onAprobar}>Aprobar</button>
            <button onClick={props.onMarcarParaRepetir}>Marcar para repetir</button>
            <button onClick={props.onFinalizarYAprobar}>Finalizar y aprobar</button>
        </div>
    ),
}));

jest.mock('@/components/analisis/tabla-tolerancias-button', () => ({
    TablaToleranciasButton: ({ pdfPath, title }: any) => (
        <button data-testid="tabla-tolerancias-button">
            {title}
            <span data-pdfpath={pdfPath}></span>
        </button>
    ),
}));

jest.mock('@/components/ui/sticky-save-button', () => ({
    StickySaveButton: ({ onSave, isLoading, label }: any) => (
        <button data-testid="sticky-save-button" onClick={onSave} disabled={isLoading}>
            {label}
        </button>
    ),
}));

const mockObtenerDosnPorId = obtenerDosnPorId as jest.MockedFunction<typeof obtenerDosnPorId>;
const mockActualizarDosn = actualizarDosn as jest.MockedFunction<typeof actualizarDosn>;
const mockObtenerTodasDosnActivas = obtenerTodasDosnActivas as jest.MockedFunction<typeof obtenerTodasDosnActivas>;
const mockFinalizarAnalisis = finalizarAnalisis as jest.MockedFunction<typeof finalizarAnalisis>;
const mockAprobarAnalisis = aprobarAnalisis as jest.MockedFunction<typeof aprobarAnalisis>;
const mockMarcarParaRepetir = marcarParaRepetir as jest.MockedFunction<typeof marcarParaRepetir>;
const mockObtenerTodasMalezas = malezasService.obtenerTodasMalezas as jest.MockedFunction<typeof malezasService.obtenerTodasMalezas>;
const mockObtenerTodasEspecies = especiesService.obtenerTodasEspecies as jest.MockedFunction<typeof especiesService.obtenerTodasEspecies>;

const mockDosnData: DosnDTO = {
    analisisID: 1,
    estado: 'EN_PROCESO',
    fechaInicio: '2024-01-15',
    lote: 'LOTE-001',
    idLote: 1,
    activo: true,
    cumpleEstandar: false,
    comentarios: 'Comentarios de prueba',
    historial: [],
    fechaINIA: '2024-01-16',
    gramosAnalizadosINIA: 500,
    tipoINIA: ['COMPLETO'],
    fechaINASE: '2024-01-17',
    gramosAnalizadosINASE: 300,
    tipoINASE: ['REDUCIDO'],
    cuscutaRegistros: [
        {
            id: 1,
            instituto: 'INIA',
            cuscuta_g: 5,
            cuscutaNum: 10,
            fechaCuscuta: '2024-01-18',
        },
    ],
    listados: [
        {
            listadoID: 1,
            listadoTipo: 'MAL_TOLERANCIA_CERO',
            listadoInsti: 'INIA',
            listadoNum: 5,
            catalogo: {
                catalogoID: 1,
                nombreComun: 'Maleza Test',
                nombreCientifico: 'Maleza scientifica',
                activo: true,
            },
        },
    ],
};

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

const mockEspecies: EspecieDTO[] = [
    {
        especieID: 1,
        nombreComun: 'Especie 1',
        nombreCientifico: 'Especie scientifica 1',
        activo: true,
    },
    {
        especieID: 2,
        nombreComun: 'Especie 2',
        nombreCientifico: 'Especie scientifica 2',
        activo: true,
    },
];

describe('EditarDosnPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockObtenerTodasDosnActivas.mockResolvedValue([mockDosnData]);
        mockObtenerDosnPorId.mockResolvedValue(mockDosnData);
        mockObtenerTodasMalezas.mockResolvedValue(mockCatalogos);
        mockObtenerTodasEspecies.mockResolvedValue(mockEspecies);
        mockActualizarDosn.mockResolvedValue(mockDosnData);
    });

    describe('Estado de carga', () => {
        it('debe mostrar loader mientras carga', () => {
            mockObtenerDosnPorId.mockImplementation(() => new Promise(() => { }));
            render(<EditarDosnPage />);

            expect(screen.getByText('Cargando análisis DOSN...')).toBeInTheDocument();
            expect(screen.getByText('Obteniendo datos del servidor')).toBeInTheDocument();
        });

        it('debe cargar datos del DOSN al iniciar', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(mockObtenerTodasDosnActivas).toHaveBeenCalled();
                expect(mockObtenerDosnPorId).toHaveBeenCalledWith(1);
            });
        });

        it('debe cargar catálogos de malezas', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(mockObtenerTodasMalezas).toHaveBeenCalled();
            });
        });

        it('debe cargar especies', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(mockObtenerTodasEspecies).toHaveBeenCalledWith(true);
            });
        });
    });

    describe('Manejo de errores', () => {
        it('debe mostrar error cuando el DOSN no existe', async () => {
            mockObtenerTodasDosnActivas.mockResolvedValue([]);
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Error al cargar')).toBeInTheDocument();
            });
        });

        it('debe mostrar error cuando falla la carga', async () => {
            mockObtenerDosnPorId.mockRejectedValue(new Error('Error de red'));
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Error al cargar')).toBeInTheDocument();
            });
        });

        it('debe tener botón de reintentar en error', async () => {
            mockObtenerDosnPorId.mockRejectedValue(new Error('Error'));
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Reintentar')).toBeInTheDocument();
            });
        });

        it('debe tener botón de volver en error', async () => {
            mockObtenerDosnPorId.mockRejectedValue(new Error('Error'));
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Volver al listado')).toBeInTheDocument();
            });
        });

        it('debe mostrar error con ID inválido', async () => {
            mockParams.id = 'invalid';
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Error al cargar')).toBeInTheDocument();
            });

            mockParams.id = '1'; // Reset
        });
    });

    describe('Renderizado de componentes', () => {
        it('debe renderizar AnalisisHeaderBar', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByTestId('analisis-header-bar')).toBeInTheDocument();
            });
        });

        it('debe renderizar AnalisisAccionesCard', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByTestId('analisis-acciones-card')).toBeInTheDocument();
            });
        });

        it('debe renderizar StickySaveButton', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByTestId('sticky-save-button')).toBeInTheDocument();
            });
        });

        it('debe renderizar TablaToleranciasButton', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByTestId('tabla-tolerancias-button')).toBeInTheDocument();
            });
        });
    });

    describe('Información del análisis', () => {
        it('debe mostrar ID del análisis', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('1')).toBeInTheDocument();
            });
        });

        it('debe mostrar lote del análisis', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('LOTE-001')).toBeInTheDocument();
            });
        });

        it('debe mostrar estado del análisis', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('EN_PROCESO')).toBeInTheDocument();
            });
        });

        it('debe mostrar checkbox de cumple estándar', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByLabelText('No')).toBeInTheDocument();
            });
        });

        it('debe permitir cambiar cumple estándar', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const checkbox = screen.getByRole('checkbox', { name: /No/i });
                fireEvent.click(checkbox);
            });

            await waitFor(() => {
                expect(screen.getByLabelText('Sí')).toBeInTheDocument();
            });
        });
    });

    describe('Sección de observaciones', () => {
        it('debe mostrar campo de comentarios', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Comentarios adicionales sobre el análisis...')).toBeInTheDocument();
            });
        });

        it('debe mostrar comentarios existentes', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const textarea = screen.getByPlaceholderText('Comentarios adicionales sobre el análisis...') as HTMLTextAreaElement;
                expect(textarea.value).toBe('Comentarios de prueba');
            });
        });

        it('debe permitir editar comentarios', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const textarea = screen.getByPlaceholderText('Comentarios adicionales sobre el análisis...');
                fireEvent.change(textarea, { target: { value: 'Nuevo comentario' } });
            });

            await waitFor(() => {
                const textarea = screen.getByPlaceholderText('Comentarios adicionales sobre el análisis...') as HTMLTextAreaElement;
                expect(textarea.value).toBe('Nuevo comentario');
            });
        });
    });

    describe('Análisis INIA', () => {
        it('debe mostrar título de análisis INIA', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Análisis INIA')).toBeInTheDocument();
            });
        });

        it('debe mostrar campo de fecha INIA', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const input = screen.getByLabelText('Fecha INIA') as HTMLInputElement;
                expect(input.value).toBe('2024-01-16');
            });
        });

        it('debe permitir editar fecha INIA', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const input = screen.getByLabelText('Fecha INIA');
                fireEvent.change(input, { target: { value: '2024-02-01' } });
            });

            await waitFor(() => {
                const input = screen.getByLabelText('Fecha INIA') as HTMLInputElement;
                expect(input.value).toBe('2024-02-01');
            });
        });

        it('debe mostrar gramos analizados INIA', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const input = screen.getByLabelText('Gramos Analizados') as HTMLInputElement;
                expect(input.value).toBe('500');
            });
        });

        it('debe permitir editar gramos INIA', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const input = screen.getByLabelText('Gramos Analizados');
                fireEvent.change(input, { target: { value: '600' } });
            });

            await waitFor(() => {
                const input = screen.getByLabelText('Gramos Analizados') as HTMLInputElement;
                expect(input.value).toBe('600');
            });
        });

        it('debe mostrar checkboxes de tipos INIA', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByLabelText('Completo')).toBeInTheDocument();
                expect(screen.getByLabelText('Reducido')).toBeInTheDocument();
                expect(screen.getByLabelText('Limitado')).toBeInTheDocument();
                expect(screen.getByLabelText('Reducido Limitado')).toBeInTheDocument();
            });
        });

        it('debe marcar tipos seleccionados', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const checkbox = screen.getByLabelText('Completo') as HTMLInputElement;
                expect(checkbox.checked).toBe(true);
            });
        });

        it('debe permitir cambiar tipos INIA', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const checkbox = screen.getByLabelText('Reducido');
                fireEvent.click(checkbox);
            });

            await waitFor(() => {
                const checkbox = screen.getByLabelText('Reducido') as HTMLInputElement;
                expect(checkbox.checked).toBe(true);
            });
        });
    });

    describe('Análisis INASE', () => {
        it('debe mostrar título de análisis INASE', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Análisis INASE')).toBeInTheDocument();
            });
        });

        it('debe mostrar campo de fecha INASE', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const input = screen.getByLabelText('Fecha INASE') as HTMLInputElement;
                expect(input.value).toBe('2024-01-17');
            });
        });

        it('debe permitir cambiar tipos INASE', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                const inaseCheckbox = checkboxes.find(cb =>
                    cb.getAttribute('id')?.startsWith('inase-')
                );
                if (inaseCheckbox) {
                    fireEvent.click(inaseCheckbox);
                }
            });
        });
    });

    describe('Análisis de Cuscuta', () => {
        it('debe mostrar título de análisis de cuscuta', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Análisis de Cuscuta')).toBeInTheDocument();
            });
        });

        it('debe mostrar botón de agregar registro', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Agregar Registro')).toBeInTheDocument();
            });
        });

        it('debe mostrar registros existentes', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText(/Registro 1 - INIA/)).toBeInTheDocument();
            });
        });

        it('debe permitir agregar nuevo registro de cuscuta', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const addButton = screen.getByText('Agregar Registro');
                fireEvent.click(addButton);
            });

            await waitFor(() => {
                const registros = screen.getAllByText(/Registro \d+/);
                expect(registros.length).toBeGreaterThan(1);
            });
        });

        it('debe permitir eliminar registro de cuscuta', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const deleteButtons = screen.getAllByRole('button');
                const trashButton = deleteButtons.find(btn => {
                    const svg = btn.querySelector('svg');
                    return svg && svg.classList.contains('lucide-trash-2');
                });
                if (trashButton) {
                    fireEvent.click(trashButton);
                }
            });
        });

        it('debe mostrar mensaje cuando no hay registros', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                cuscutaRegistros: [],
            });

            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText(/No hay registros de Cuscuta/)).toBeInTheDocument();
            });
        });
    });

    describe('Listados', () => {
        it('debe mostrar título de listados', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Listados')).toBeInTheDocument();
            });
        });

        it('debe mostrar botón de agregar listado', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const buttons = screen.getAllByText('Agregar Listado');
                expect(buttons.length).toBeGreaterThan(0);
            });
        });

        it('debe mostrar listados existentes', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Maleza Test')).toBeInTheDocument();
            });
        });

        it('debe mostrar formulario al hacer clic en agregar listado', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const addButton = screen.getAllByText('Agregar Listado')[0];
                fireEvent.click(addButton);
            });

            await waitFor(() => {
                expect(screen.getByText('Nuevo Listado')).toBeInTheDocument();
            });
        });

        it('debe permitir cancelar agregar listado', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const addButton = screen.getAllByText('Agregar Listado')[0];
                fireEvent.click(addButton);
            });

            await waitFor(() => {
                const cancelButton = screen.getByText('Cancelar');
                fireEvent.click(cancelButton);
            });

            await waitFor(() => {
                expect(screen.queryByText('Nuevo Listado')).not.toBeInTheDocument();
            });
        });

        it('debe mostrar mensaje cuando no hay listados', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                listados: [],
            });

            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('No hay listados registrados')).toBeInTheDocument();
            });
        });

        it('debe permitir eliminar listado', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const deleteButtons = screen.getAllByRole('button');
                const trashButton = deleteButtons.find(btn => {
                    const svg = btn.querySelector('svg');
                    return svg && svg.classList.contains('lucide-trash-2');
                });
                if (trashButton) {
                    fireEvent.click(trashButton);
                }
            });

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Listado eliminado');
            });
        });
    });

    describe('Guardar cambios', () => {
        it('debe tener botón de guardar en header', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Guardar')).toBeInTheDocument();
            });
        });

        it('debe tener botón de guardar flotante', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Guardar Cambios')).toBeInTheDocument();
            });
        });

        it('debe validar campos requeridos antes de guardar', async () => {
            mockObtenerDosnPorId.mockResolvedValue({
                ...mockDosnData,
                tipoINIA: [],
            });

            render(<EditarDosnPage />);

            await waitFor(() => {
                const saveButton = screen.getByText('Guardar');
                fireEvent.click(saveButton);
            });

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Corrija los errores del formulario antes de guardar');
            });
        });

        it('debe llamar a actualizarDosn con datos correctos', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const saveButton = screen.getByText('Guardar');
                fireEvent.click(saveButton);
            });

            await waitFor(() => {
                expect(mockActualizarDosn).toHaveBeenCalledWith(1, expect.objectContaining({
                    idLote: 1,
                    comentarios: 'Comentarios de prueba',
                }));
            });
        });

        it('debe mostrar mensaje de éxito al guardar', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const saveButton = screen.getByText('Guardar');
                fireEvent.click(saveButton);
            });

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Análisis DOSN actualizado correctamente');
            });
        });

        it('debe redirigir después de guardar', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const saveButton = screen.getByText('Guardar');
                fireEvent.click(saveButton);
            });

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/listado/analisis/dosn/1');
            });
        });

        it('debe mostrar error si falla el guardado', async () => {
            mockActualizarDosn.mockRejectedValue(new Error('Error al guardar'));
            render(<EditarDosnPage />);

            await waitFor(() => {
                const saveButton = screen.getByText('Guardar');
                fireEvent.click(saveButton);
            });

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Error al actualizar el análisis DOSN');
            });
        });

        it('debe deshabilitar botón mientras guarda', async () => {
            mockActualizarDosn.mockImplementation(() => new Promise(() => { }));
            render(<EditarDosnPage />);

            await waitFor(() => {
                const saveButton = screen.getByText('Guardar');
                fireEvent.click(saveButton);
            });

            await waitFor(() => {
                expect(screen.getByText('Guardando...')).toBeInTheDocument();
            });
        });
    });

    describe('Acciones del análisis', () => {
        it('debe permitir finalizar análisis', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const finalizarButton = screen.getByText('Finalizar');
                fireEvent.click(finalizarButton);
            });

            await waitFor(() => {
                expect(mockFinalizarAnalisis).toHaveBeenCalledWith(1);
                expect(toast.success).toHaveBeenCalledWith('Análisis finalizado exitosamente');
            });
        });

        it('debe permitir aprobar análisis', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const aprobarButton = screen.getByText('Aprobar');
                fireEvent.click(aprobarButton);
            });

            await waitFor(() => {
                expect(mockAprobarAnalisis).toHaveBeenCalledWith(1);
                expect(toast.success).toHaveBeenCalledWith('Análisis aprobado exitosamente');
            });
        });

        it('debe permitir marcar para repetir', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const repetirButton = screen.getByText('Marcar para repetir');
                fireEvent.click(repetirButton);
            });

            await waitFor(() => {
                expect(mockMarcarParaRepetir).toHaveBeenCalledWith(1);
                expect(toast.success).toHaveBeenCalledWith('Análisis marcado para repetir');
            });
        });

        it('debe permitir finalizar y aprobar', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const finalizarYAprobarButton = screen.getByText('Finalizar y aprobar');
                fireEvent.click(finalizarYAprobarButton);
            });

            await waitFor(() => {
                expect(mockFinalizarAnalisis).toHaveBeenCalledWith(1);
                expect(toast.success).toHaveBeenCalledWith('Análisis finalizado y aprobado exitosamente');
            });
        });

        it('debe redirigir después de finalizar', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const finalizarButton = screen.getByText('Finalizar');
                fireEvent.click(finalizarButton);
            });

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/listado/analisis/dosn/1');
            });
        });
    });

    describe('Validaciones', () => {
        it('debe validar fecha INIA', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const input = screen.getByLabelText('Fecha INIA');
                fireEvent.change(input, { target: { value: '' } });
            });

            await waitFor(() => {
                const saveButton = screen.getByText('Guardar');
                fireEvent.click(saveButton);
            });

            await waitFor(() => {
                expect(screen.getByText(/Ingrese una fecha válida/)).toBeInTheDocument();
            });
        });

        it('debe validar gramos INIA', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const input = screen.getByLabelText('Gramos Analizados');
                fireEvent.change(input, { target: { value: '0' } });
            });

            await waitFor(() => {
                const saveButton = screen.getByText('Guardar');
                fireEvent.click(saveButton);
            });

            await waitFor(() => {
                expect(screen.getByText(/Debe ingresar una cantidad válida/)).toBeInTheDocument();
            });
        });

        it('debe validar tipos de análisis INIA', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const checkbox = screen.getByLabelText('Completo');
                fireEvent.click(checkbox); // Desmarcar el único tipo seleccionado
            });

            await waitFor(() => {
                const saveButton = screen.getByText('Guardar');
                fireEvent.click(saveButton);
            });

            await waitFor(() => {
                expect(screen.getByText(/Debe seleccionar al menos un tipo/)).toBeInTheDocument();
            });
        });
    });

    describe('Navegación', () => {
        it('debe tener botón para volver', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Volver a ver')).toBeInTheDocument();
            });
        });

        it('debe redirigir al hacer clic en volver', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                const volverButton = screen.getByText('Volver a ver');
                fireEvent.click(volverButton);
            });

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/listado/analisis/dosn/1');
            });
        });
    });

    describe('Props de componentes', () => {
        it('debe pasar props correctamente a AnalisisHeaderBar', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Tipo: DOSN')).toBeInTheDocument();
                expect(screen.getByText('ID: 1')).toBeInTheDocument();
                expect(screen.getByText('Estado: EN_PROCESO')).toBeInTheDocument();
            });
        });

        it('debe pasar props correctamente a AnalisisAccionesCard', async () => {
            render(<EditarDosnPage />);

            await waitFor(() => {
                expect(screen.getByText('Análisis ID: 1')).toBeInTheDocument();
            });
        });
    });
});
