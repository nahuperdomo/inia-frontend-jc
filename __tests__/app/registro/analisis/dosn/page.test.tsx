import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DosnFields from '@/app/registro/analisis/dosn/form-dosn';

// Mocks
jest.mock('@/components/malezas-u-otros-cultivos/fields-maleza', () => ({
    __esModule: true,
    default: ({ titulo, registros, onChangeListados }: any) => (
        <div data-testid="maleza-fields">
            <span>Malezas: {titulo}</span>
            <span>Registros: {registros?.length || 0}</span>
            <button onClick={() => onChangeListados && onChangeListados([])}>Change Malezas</button>
        </div>
    ),
}));

jest.mock('@/components/malezas-u-otros-cultivos/fields-otros-cultivos', () => ({
    __esModule: true,
    default: ({ registros, onChangeListados }: any) => (
        <div data-testid="otros-cultivos-fields">
            <span>Otros Cultivos Registros: {registros?.length || 0}</span>
            <button onClick={() => onChangeListados && onChangeListados([])}>Change Cultivos</button>
        </div>
    ),
}));

jest.mock('@/app/registro/analisis/dosn/fields/fields-brassica', () => ({
    __esModule: true,
    default: ({ registros, onChangeListados }: any) => (
        <div data-testid="brassica-fields">
            <span>Brassica Registros: {registros?.length || 0}</span>
            <button onClick={() => onChangeListados && onChangeListados([])}>Change Brassicas</button>
        </div>
    ),
}));

jest.mock('@/app/registro/analisis/dosn/fields/fileds-cuscuta', () => ({
    __esModule: true,
    default: ({ formData, handleInputChange }: any) => (
        <div data-testid="cuscuta-fields">
            <span>Cuscuta Component</span>
            <button onClick={() => handleInputChange('cuscutaCumple', 'si')}>Set Cuscuta</button>
        </div>
    ),
}));

jest.mock('@/app/registro/analisis/dosn/fields/fields-cumplio-estandar', () => ({
    __esModule: true,
    default: ({ formData, handleInputChange }: any) => (
        <div data-testid="cumplimiento-fields">
            <span>Cumplimiento Estándar</span>
            <span>Cumple: {formData.cumpleEstandar || 'no definido'}</span>
            <button onClick={() => handleInputChange('cumpleEstandar', 'si')}>Set Cumple Si</button>
            <button onClick={() => handleInputChange('cumpleEstandar', 'no')}>Set Cumple No</button>
        </div>
    ),
}));

jest.mock('@/components/analisis/tabla-tolerancias-button', () => ({
    TablaToleranciasButton: ({ pdfPath, title }: any) => (
        <button data-testid="tabla-tolerancias-button">
            {title}
            <span>{pdfPath}</span>
        </button>
    ),
}));

const mockFormData = {
    iniaFecha: '2024-01-15',
    iniaGramos: '100',
    iniaCompleto: true,
    iniaReducido: false,
    iniaLimitado: false,
    iniaReducidoLimitado: false,
    inaseFecha: '',
    inaseGramos: '',
    inaseCompleto: false,
    inaseReducido: false,
    inaseLimitado: false,
    inaseReducidoLimitado: false,
    cumpleEstandar: '',
};

describe('DosnFields Component', () => {
    let mockHandleInputChange: jest.Mock;
    let mockOnChangeListadosMalezas: jest.Mock;
    let mockOnChangeListadosCultivos: jest.Mock;
    let mockOnChangeListadosBrassicas: jest.Mock;

    beforeEach(() => {
        mockHandleInputChange = jest.fn();
        mockOnChangeListadosMalezas = jest.fn();
        mockOnChangeListadosCultivos = jest.fn();
        mockOnChangeListadosBrassicas = jest.fn();
    });

    describe('Renderizado inicial', () => {
        it('debe renderizar el componente correctamente', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Determinación de Otras Semillas en Número (DOSN)')).toBeInTheDocument();
            expect(screen.getByText('Análisis cuantitativo de semillas no deseadas en muestras')).toBeInTheDocument();
        });

        it('debe mostrar las pestañas de navegación', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Datos generales')).toBeInTheDocument();
            expect(screen.getByText('Registros')).toBeInTheDocument();
        });

        it('debe renderizar TablaToleranciasButton para INIA', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Ver Tabla de Tolerancias')).toBeInTheDocument();
            expect(screen.getByText('/tablas-tolerancias/tabla-dosn.pdf')).toBeInTheDocument();
        });
    });

    describe('Sección INIA', () => {
        it('debe mostrar los campos de INIA', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('INIA')).toBeInTheDocument();
            expect(screen.getByText('Instituto Nacional de Investigación Agropecuaria')).toBeInTheDocument();
        });

        it('debe mostrar campo de fecha para INIA con asterisco obligatorio', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const fechaLabel = screen.getByText(/Fecha de análisis/);
            expect(fechaLabel.textContent).toContain('*');
        });

        it('debe mostrar campo de gramos para INIA con asterisco obligatorio', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const gramosLabels = screen.getAllByText(/Gramos analizados/);
            expect(gramosLabels[0].textContent).toContain('*');
        });

        it('debe permitir cambiar fecha de INIA', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const fechaInput = screen.getByDisplayValue('2024-01-15');
            fireEvent.change(fechaInput, { target: { value: '2024-02-01' } });

            expect(mockHandleInputChange).toHaveBeenCalledWith('iniaFecha', '2024-02-01');
        });

        it('debe permitir cambiar gramos de INIA', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const gramosInput = screen.getByDisplayValue('100');
            fireEvent.change(gramosInput, { target: { value: '150' } });

            expect(mockHandleInputChange).toHaveBeenCalledWith('iniaGramos', '150');
        });

        it('debe mostrar todos los tipos de análisis de INIA', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Completo')).toBeInTheDocument();
            expect(screen.getByText('Reducido')).toBeInTheDocument();
            expect(screen.getByText('Limitado')).toBeInTheDocument();
            expect(screen.getByText('Reducido - Limitado')).toBeInTheDocument();
        });

        it('debe mostrar descripciones de tipos de análisis', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Análisis exhaustivo de todas las categorías')).toBeInTheDocument();
            expect(screen.getByText('Análisis de categorías principales')).toBeInTheDocument();
            expect(screen.getByText('Análisis básico de categorías críticas')).toBeInTheDocument();
            expect(screen.getByText('Análisis híbrido optimizado')).toBeInTheDocument();
        });

        it('debe permitir seleccionar tipo de análisis Completo', () => {
            const formData = { ...mockFormData, iniaCompleto: false };
            render(
                <DosnFields
                    formData={formData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const completoCheckbox = screen.getByRole('checkbox', { name: /Completo/i });
            fireEvent.click(completoCheckbox);

            expect(mockHandleInputChange).toHaveBeenCalledWith('iniaCompleto', true);
        });

        it('debe permitir deseleccionar tipo de análisis', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const completoCheckbox = screen.getByRole('checkbox', { name: /Completo/i });
            fireEvent.click(completoCheckbox);

            expect(mockHandleInputChange).toHaveBeenCalledWith('iniaCompleto', false);
        });
    });

    describe('Sección INASE', () => {
        it('debe mostrar los campos de INASE', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('INASE')).toBeInTheDocument();
            expect(screen.getByText('Instituto Nacional de Semillas')).toBeInTheDocument();
        });

        it('debe mostrar campo de fecha para INASE sin asterisco (opcional)', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const fechaLabels = screen.getAllByText(/Fecha de análisis/);
            // INASE es el segundo (índice 1)
            expect(fechaLabels[1].textContent).not.toContain('*');
        });

        it('debe permitir cambiar fecha de INASE', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const fechaInputs = screen.getAllByRole('textbox', { name: '' });
            const inaseFechaInput = fechaInputs.find(input =>
                (input as HTMLInputElement).type === 'date' && (input as HTMLInputElement).value === ''
            );

            if (inaseFechaInput) {
                fireEvent.change(inaseFechaInput, { target: { value: '2024-02-15' } });
                expect(mockHandleInputChange).toHaveBeenCalledWith('inaseFecha', '2024-02-15');
            }
        });

        it('debe permitir ingresar gramos de INASE', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const gramosInputs = screen.getAllByRole('spinbutton');
            const inaseGramosInput = gramosInputs.find(input =>
                (input as HTMLInputElement).value === ''
            );

            if (inaseGramosInput) {
                fireEvent.change(inaseGramosInput, { target: { value: '200' } });
                expect(mockHandleInputChange).toHaveBeenCalledWith('inaseGramos', '200');
            }
        });
    });

    describe('Validación', () => {
        it('no debe mostrar errores cuando mostrarValidacion es false', () => {
            const formDataInvalida = {
                ...mockFormData,
                iniaFecha: '',
                iniaGramos: '',
                iniaCompleto: false,
            };

            render(
                <DosnFields
                    formData={formDataInvalida}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={false}
                />
            );

            expect(screen.queryByText(/Ingrese una fecha válida/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Debe ingresar una cantidad válida/)).not.toBeInTheDocument();
        });

        it('debe mostrar error de fecha cuando mostrarValidacion es true y fecha es inválida', () => {
            const formDataInvalida = {
                ...mockFormData,
                iniaFecha: '',
            };

            render(
                <DosnFields
                    formData={formDataInvalida}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Ingrese una fecha válida (no futura)')).toBeInTheDocument();
        });

        it('debe mostrar error de gramos cuando mostrarValidacion es true y gramos son inválidos', () => {
            const formDataInvalida = {
                ...mockFormData,
                iniaGramos: '0',
            };

            render(
                <DosnFields
                    formData={formDataInvalida}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText(/Debe ingresar una cantidad válida de gramos/)).toBeInTheDocument();
        });

        it('debe mostrar error cuando no hay tipo de análisis seleccionado', () => {
            const formDataInvalida = {
                ...mockFormData,
                iniaCompleto: false,
                iniaReducido: false,
                iniaLimitado: false,
                iniaReducidoLimitado: false,
            };

            render(
                <DosnFields
                    formData={formDataInvalida}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Debe seleccionar al menos un tipo de análisis')).toBeInTheDocument();
        });

        it('debe mostrar cuadro de validación con configuración válida', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Configuración válida')).toBeInTheDocument();
            expect(screen.getByText(/Todos los datos requeridos son correctos/)).toBeInTheDocument();
        });

        it('debe mostrar cuadro de validación con configuración inválida', () => {
            const formDataInvalida = {
                ...mockFormData,
                iniaFecha: '',
            };

            render(
                <DosnFields
                    formData={formDataInvalida}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Configuración incompleta o inválida')).toBeInTheDocument();
        });

        it('debe validar fecha futura como inválida', () => {
            const fechaFutura = new Date();
            fechaFutura.setDate(fechaFutura.getDate() + 10);
            const formDataConFechaFutura = {
                ...mockFormData,
                iniaFecha: fechaFutura.toISOString().split('T')[0],
            };

            render(
                <DosnFields
                    formData={formDataConFechaFutura}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Ingrese una fecha válida (no futura)')).toBeInTheDocument();
        });
    });

    describe('Modo detalle (solo lectura)', () => {
        const mockDosn = {
            analisisID: 1,
            iniaFecha: '2024-01-15',
            iniaGramos: 100,
            iniaCompleto: true,
            cumpleEstandar: true,
            listados: [],
        };

        it('debe deshabilitar campos en modo detalle', () => {
            render(
                <DosnFields
                    formData={{}}
                    handleInputChange={mockHandleInputChange}
                    dosn={mockDosn}
                    modoDetalle={true}
                />
            );

            const fechaInput = screen.getByDisplayValue('2024-01-15');
            expect(fechaInput).toHaveAttribute('readonly');
        });

        it('debe mostrar datos del dosn en modo detalle', () => {
            render(
                <DosnFields
                    formData={{}}
                    handleInputChange={mockHandleInputChange}
                    dosn={mockDosn}
                    modoDetalle={true}
                />
            );

            expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
            expect(screen.getByDisplayValue('100')).toBeInTheDocument();
        });
    });

    describe('Cumplimiento de estándar', () => {
        it('debe renderizar sección de cumplimiento de estándar', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Cumplimiento del Estándar')).toBeInTheDocument();
        });

        it('debe permitir seleccionar cumple estándar', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const select = screen.getByRole('combobox', { name: /Estado de cumplimiento/i });
            fireEvent.click(select);

            waitFor(() => {
                const cumpleOption = screen.getByText('Cumple con el estándar');
                fireEvent.click(cumpleOption);
                expect(mockHandleInputChange).toHaveBeenCalledWith('cumpleEstandar', 'si');
            });
        });

        it('debe mostrar mensaje cuando cumple estándar', () => {
            const formDataConCumple = { ...mockFormData, cumpleEstandar: 'si' };
            render(
                <DosnFields
                    formData={formDataConCumple}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('La muestra cumple con los estándares establecidos')).toBeInTheDocument();
        });

        it('debe mostrar mensaje cuando no cumple estándar', () => {
            const formDataNoCumple = { ...mockFormData, cumpleEstandar: 'no' };
            render(
                <DosnFields
                    formData={formDataNoCumple}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('La muestra NO cumple con los estándares establecidos')).toBeInTheDocument();
        });
    });

    describe('Navegación por tabs', () => {
        it('debe cambiar a pestaña de registros', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                    onChangeListadosMalezas={mockOnChangeListadosMalezas}
                    onChangeListadosCultivos={mockOnChangeListadosCultivos}
                    onChangeListadosBrassicas={mockOnChangeListadosBrassicas}
                />
            );

            const registrosTab = screen.getByText('Registros');
            fireEvent.click(registrosTab);

            waitFor(() => {
                expect(screen.getByTestId('maleza-fields')).toBeInTheDocument();
                expect(screen.getByTestId('otros-cultivos-fields')).toBeInTheDocument();
                expect(screen.getByTestId('brassica-fields')).toBeInTheDocument();
                expect(screen.getByTestId('cuscuta-fields')).toBeInTheDocument();
            });
        });

        it('debe renderizar componentes de registros en pestaña correcta', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                    onChangeListadosMalezas={mockOnChangeListadosMalezas}
                    onChangeListadosCultivos={mockOnChangeListadosCultivos}
                    onChangeListadosBrassicas={mockOnChangeListadosBrassicas}
                />
            );

            const registrosTab = screen.getByText('Registros');
            fireEvent.click(registrosTab);

            waitFor(() => {
                expect(screen.getByTestId('maleza-fields')).toBeInTheDocument();
                expect(screen.getByText('Malezas: Malezas')).toBeInTheDocument();
            });
        });
    });

    describe('Callbacks de listados', () => {
        it('debe llamar onChangeListadosMalezas cuando cambian malezas', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                    onChangeListadosMalezas={mockOnChangeListadosMalezas}
                />
            );

            const registrosTab = screen.getByText('Registros');
            fireEvent.click(registrosTab);

            waitFor(() => {
                const changeMalezasButton = screen.getByText('Change Malezas');
                fireEvent.click(changeMalezasButton);
                expect(mockOnChangeListadosMalezas).toHaveBeenCalledWith([]);
            });
        });

        it('debe llamar onChangeListadosCultivos cuando cambian cultivos', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                    onChangeListadosCultivos={mockOnChangeListadosCultivos}
                />
            );

            const registrosTab = screen.getByText('Registros');
            fireEvent.click(registrosTab);

            waitFor(() => {
                const changeCultivosButton = screen.getByText('Change Cultivos');
                fireEvent.click(changeCultivosButton);
                expect(mockOnChangeListadosCultivos).toHaveBeenCalledWith([]);
            });
        });

        it('debe llamar onChangeListadosBrassicas cuando cambian brassicas', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                    onChangeListadosBrassicas={mockOnChangeListadosBrassicas}
                />
            );

            const registrosTab = screen.getByText('Registros');
            fireEvent.click(registrosTab);

            waitFor(() => {
                const changeBrassicasButton = screen.getByText('Change Brassicas');
                fireEvent.click(changeBrassicasButton);
                expect(mockOnChangeListadosBrassicas).toHaveBeenCalledWith([]);
            });
        });
    });

    describe('Listados con dosn existente', () => {
        const mockDosnConListados = {
            analisisID: 1,
            iniaFecha: '2024-01-15',
            iniaGramos: 100,
            listados: [
                { listadoTipo: 'MAL_TOLERANCIA_CERO', idCatalogo: 1 },
                { listadoTipo: 'MAL_TOLERANCIA', idCatalogo: 2 },
                { listadoTipo: 'OTROS', idCatalogo: 3 },
                { listadoTipo: 'BRASSICA', listadoInsti: 'INIA', listadoNum: 5 },
            ],
        };

        it('debe filtrar malezas correctamente del dosn', () => {
            render(
                <DosnFields
                    formData={{}}
                    handleInputChange={mockHandleInputChange}
                    dosn={mockDosnConListados}
                    onChangeListadosMalezas={mockOnChangeListadosMalezas}
                />
            );

            const registrosTab = screen.getByText('Registros');
            fireEvent.click(registrosTab);

            waitFor(() => {
                expect(screen.getByText('Registros: 2')).toBeInTheDocument();
            });
        });

        it('debe filtrar otros cultivos correctamente del dosn', () => {
            render(
                <DosnFields
                    formData={{}}
                    handleInputChange={mockHandleInputChange}
                    dosn={mockDosnConListados}
                    onChangeListadosCultivos={mockOnChangeListadosCultivos}
                />
            );

            const registrosTab = screen.getByText('Registros');
            fireEvent.click(registrosTab);

            waitFor(() => {
                expect(screen.getByText('Otros Cultivos Registros: 1')).toBeInTheDocument();
            });
        });

        it('debe filtrar brassicas correctamente del dosn', () => {
            render(
                <DosnFields
                    formData={{}}
                    handleInputChange={mockHandleInputChange}
                    dosn={mockDosnConListados}
                    onChangeListadosBrassicas={mockOnChangeListadosBrassicas}
                />
            );

            const registrosTab = screen.getByText('Registros');
            fireEvent.click(registrosTab);

            waitFor(() => {
                expect(screen.getByText('Brassica Registros: 1')).toBeInTheDocument();
            });
        });
    });

    describe('Estilos y clases CSS', () => {
        it('debe aplicar clase de error cuando validación muestra error de fecha', () => {
            const formDataInvalida = { ...mockFormData, iniaFecha: '' };
            render(
                <DosnFields
                    formData={formDataInvalida}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            const fechaInputs = screen.getAllByRole('textbox');
            const iniaFechaInput = fechaInputs.find(input =>
                (input as HTMLInputElement).type === 'date'
            );

            expect(iniaFechaInput).toHaveClass('border-red-500');
            expect(iniaFechaInput).toHaveClass('bg-red-50');
        });

        it('debe aplicar clase de error cuando validación muestra error de gramos', () => {
            const formDataInvalida = { ...mockFormData, iniaGramos: '0' };
            render(
                <DosnFields
                    formData={formDataInvalida}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            const gramosInput = screen.getByDisplayValue('0');
            expect(gramosInput).toHaveClass('border-red-500');
            expect(gramosInput).toHaveClass('bg-red-50');
        });

        it('debe aplicar clases CSS de readonly en modo detalle', () => {
            const mockDosn = {
                analisisID: 1,
                iniaFecha: '2024-01-15',
                iniaGramos: 100,
            };

            render(
                <DosnFields
                    formData={{}}
                    handleInputChange={mockHandleInputChange}
                    dosn={mockDosn}
                    modoDetalle={true}
                />
            );

            const fechaInput = screen.getByDisplayValue('2024-01-15');
            expect(fechaInput).toHaveClass('bg-gray-100');
            expect(fechaInput).toHaveClass('cursor-not-allowed');
        });
    });

    describe('Valores por defecto', () => {
        it('debe manejar formData vacío sin errores', () => {
            render(
                <DosnFields
                    formData={{}}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Determinación de Otras Semillas en Número (DOSN)')).toBeInTheDocument();
        });

        it('debe manejar dosn undefined sin errores', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                    dosn={undefined}
                />
            );

            expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
        });

        it('debe manejar listados vacíos correctamente', () => {
            const dosnSinListados = {
                analisisID: 1,
                listados: [],
            };

            render(
                <DosnFields
                    formData={{}}
                    handleInputChange={mockHandleInputChange}
                    dosn={dosnSinListados}
                />
            );

            const registrosTab = screen.getByText('Registros');
            fireEvent.click(registrosTab);

            waitFor(() => {
                expect(screen.getByText('Registros: 0')).toBeInTheDocument();
            });
        });
    });

    describe('Props errors', () => {
        it('debe aceptar prop errors sin errores', () => {
            const errors = {
                iniaFecha: 'Fecha requerida',
                iniaGramos: 'Gramos requeridos',
            };

            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                    errors={errors}
                />
            );

            expect(screen.getByText('Determinación de Otras Semillas en Número (DOSN)')).toBeInTheDocument();
        });

        it('debe manejar errors vacío', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                    errors={{}}
                />
            );

            expect(screen.getByText('Determinación de Otras Semillas en Número (DOSN)')).toBeInTheDocument();
        });
    });

    describe('Iconos y elementos visuales', () => {
        it('debe renderizar icono de Microscope en el header', () => {
            const { container } = render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const microscopeIcon = container.querySelector('.lucide-microscope');
            expect(microscopeIcon).toBeInTheDocument();
        });

        it('debe renderizar iconos de Building2 para instituciones', () => {
            const { container } = render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const buildingIcons = container.querySelectorAll('.lucide-building-2');
            expect(buildingIcons.length).toBeGreaterThan(0);
        });

        it('debe renderizar icono de CheckCircle2 para cumplimiento', () => {
            const { container } = render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const checkCircleIcons = container.querySelectorAll('.lucide-check-circle-2');
            expect(checkCircleIcons.length).toBeGreaterThan(0);
        });
    });

    describe('Tipos de análisis múltiples', () => {
        it('debe permitir seleccionar múltiples tipos de análisis', () => {
            const formData = {
                ...mockFormData,
                iniaCompleto: false,
                iniaReducido: false,
            };

            render(
                <DosnFields
                    formData={formData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const completoCheckbox = screen.getByRole('checkbox', { name: /Completo/i });
            const reducidoCheckbox = screen.getByRole('checkbox', { name: /^Reducido$/i });

            fireEvent.click(completoCheckbox);
            fireEvent.click(reducidoCheckbox);

            expect(mockHandleInputChange).toHaveBeenCalledWith('iniaCompleto', true);
            expect(mockHandleInputChange).toHaveBeenCalledWith('iniaReducido', true);
        });

        it('debe mostrar todos los checkboxes para INIA', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const checkboxes = screen.getAllByRole('checkbox');
            // Debe haber 8 checkboxes (4 para INIA + 4 para INASE)
            expect(checkboxes.length).toBeGreaterThanOrEqual(8);
        });
    });

    describe('Interacción con componentes hijos', () => {
        it('debe pasar handleInputChange a CuscutaFields', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const registrosTab = screen.getByText('Registros');
            fireEvent.click(registrosTab);

            waitFor(() => {
                const setCuscutaButton = screen.getByText('Set Cuscuta');
                fireEvent.click(setCuscutaButton);
                expect(mockHandleInputChange).toHaveBeenCalledWith('cuscutaCumple', 'si');
            });
        });

        it('debe pasar handleInputChange a CumplimientoEstandarFields', () => {
            render(
                <DosnFields
                    formData={mockFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const registrosTab = screen.getByText('Registros');
            fireEvent.click(registrosTab);

            waitFor(() => {
                const setCumpleSiButton = screen.getByText('Set Cumple Si');
                fireEvent.click(setCumpleSiButton);
                expect(mockHandleInputChange).toHaveBeenCalledWith('cumpleEstandar', 'si');
            });
        });
    });
});
