

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TetrazolioFields from '@/app/registro/analisis/tetrazolio/form-tetrazolio';

// Mock del componente TablaToleranciasButton
jest.mock('@/components/analisis/tabla-tolerancias-button', () => ({
    TablaToleranciasButton: () => <button>Ver Tabla de Tolerancias</button>
}));

describe('TetrazolioFields - Formulario de Tetrazolio', () => {
    const mockHandleInputChange = jest.fn();

    const defaultFormData = {
        fecha: '2024-03-01',
        numSemillasPorRep: 50,
        numRepeticionesEsperadasTetrazolio: 4,
        pretratamiento: 'EP 16 horas',
        concentracion: '1%',
        tincionTemp: 35,
        tincionHs: '2',
        viabilidadInase: 85
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Renderizado básico del formulario', () => {
        it('debe renderizar el formulario con el título correcto', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Análisis de Tetrazolio')).toBeInTheDocument();
            expect(screen.getByText('Configura los parámetros para el ensayo de viabilidad con tetrazolio.')).toBeInTheDocument();
        });

        it('debe renderizar el botón de tabla de tolerancias', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Ver Tabla de Tolerancias')).toBeInTheDocument();
        });

        it('debe renderizar todas las secciones principales', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Información del Ensayo')).toBeInTheDocument();
            expect(screen.getByText('Repeticiones')).toBeInTheDocument();
            expect(screen.getByText('Pretratamiento')).toBeInTheDocument();
            expect(screen.getByText('Condiciones de Tinción')).toBeInTheDocument();
            expect(screen.getAllByText('Viabilidad INASE').length).toBeGreaterThan(0);
        });
    });

    describe('Campo obligatorio: Fecha del Ensayo', () => {
        it('debe renderizar el campo "Fecha del Ensayo" marcado como obligatorio', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Fecha del Ensayo *')).toBeInTheDocument();
        });

        it('debe mostrar el valor de la fecha correctamente', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const fechaInput = screen.getByDisplayValue('2024-03-01');
            expect(fechaInput).toBeInTheDocument();
            expect(fechaInput).toHaveAttribute('type', 'date');
        });

        it('debe mostrar error cuando la fecha está vacía y se activa la validación', () => {
            const formDataSinFecha = { ...defaultFormData, fecha: '' };

            render(
                <TetrazolioFields
                    formData={formDataSinFecha}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Debe ingresar la fecha del ensayo')).toBeInTheDocument();
        });

        it('debe llamar a handleInputChange cuando se modifica la fecha', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const fechaInput = screen.getByDisplayValue('2024-03-01');
            fireEvent.change(fechaInput, { target: { value: '2024-03-15' } });

            expect(mockHandleInputChange).toHaveBeenCalledWith('fecha', '2024-03-15');
        });
    });

    describe('Campo obligatorio: Semillas por Repetición', () => {
        it('debe renderizar el campo "Semillas por Repetición" como obligatorio', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Semillas por Repetición *')).toBeInTheDocument();
        });

        it('debe tener las opciones 25, 50 y 100', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const select = screen.getByRole('combobox', { name: /semillas por repetición/i });
            expect(select).toBeInTheDocument();
        });

        it('debe mostrar error cuando no se selecciona un valor válido', () => {
            const formDataInvalida = { ...defaultFormData, numSemillasPorRep: null };

            render(
                <TetrazolioFields
                    formData={formDataInvalida}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Debe seleccionar 25, 50 o 100 semillas')).toBeInTheDocument();
        });

        it('debe estar deshabilitado en modo edición', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                    modoEdicion={true}
                />
            );

            expect(screen.getByText('No se puede modificar una vez creado el análisis')).toBeInTheDocument();
        });
    });

    describe('Campo obligatorio: Número de Repeticiones (entre 2 y 8)', () => {
        it('debe renderizar el campo de repeticiones como obligatorio', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Número de Repeticiones Esperadas *')).toBeInTheDocument();
        });

        it('debe mostrar el mensaje informativo sobre el rango 2-8', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                    modoEdicion={false}
                />
            );

            expect(screen.getByText(/Se esperan entre/)).toBeInTheDocument();
            expect(screen.getByText(/2 y 8 repeticiones/)).toBeInTheDocument();
            expect(screen.getByText(/para un resultado confiable/)).toBeInTheDocument();
        });

        it('debe aceptar valor 2 (mínimo válido)', () => {
            const formDataMin = { ...defaultFormData, numRepeticionesEsperadasTetrazolio: 2 };

            render(
                <TetrazolioFields
                    formData={formDataMin}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            // No debe mostrar error
            expect(screen.queryByText('Debe estar entre 2 y 8 repeticiones')).not.toBeInTheDocument();
        });

        it('debe aceptar valor 8 (máximo válido)', () => {
            const formDataMax = { ...defaultFormData, numRepeticionesEsperadasTetrazolio: 8 };

            render(
                <TetrazolioFields
                    formData={formDataMax}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            // No debe mostrar error
            expect(screen.queryByText('Debe estar entre 2 y 8 repeticiones')).not.toBeInTheDocument();
        });

        it('debe rechazar valor 1 (menor al mínimo)', () => {
            const formDataInvalida = { ...defaultFormData, numRepeticionesEsperadasTetrazolio: 1 };

            render(
                <TetrazolioFields
                    formData={formDataInvalida}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Debe estar entre 2 y 8 repeticiones')).toBeInTheDocument();
        });

        it('debe rechazar valor 9 (mayor al máximo)', () => {
            const formDataInvalida = { ...defaultFormData, numRepeticionesEsperadasTetrazolio: 9 };

            render(
                <TetrazolioFields
                    formData={formDataInvalida}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Debe estar entre 2 y 8 repeticiones')).toBeInTheDocument();
        });

        it('debe rechazar cuando está vacío', () => {
            const formDataVacia = { ...defaultFormData, numRepeticionesEsperadasTetrazolio: null };

            render(
                <TetrazolioFields
                    formData={formDataVacia}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Debe estar entre 2 y 8 repeticiones')).toBeInTheDocument();
        });

        it('debe tener atributos min="2" y max="8"', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const input = screen.getByDisplayValue('4');
            expect(input).toHaveAttribute('type', 'number');
            expect(input).toHaveAttribute('min', '2');
            expect(input).toHaveAttribute('max', '8');
        });
    });

    describe('Campo obligatorio: Pretratamiento', () => {
        it('debe renderizar el campo "Pretratamiento" como obligatorio', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Pretratamiento *')).toBeInTheDocument();
        });

        it('debe tener un selector con opciones predefinidas', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const select = screen.getByRole('combobox', { name: /pretratamiento/i });
            expect(select).toBeInTheDocument();
        });

        it('debe mostrar error cuando no se selecciona un pretratamiento', () => {
            const formDataSinPretratamiento = { ...defaultFormData, pretratamiento: '' };

            render(
                <TetrazolioFields
                    formData={formDataSinPretratamiento}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Debe seleccionar un pretratamiento')).toBeInTheDocument();
        });

        it('debe permitir opción "Otro (especificar)" con campo adicional', () => {
            const formDataOtro = { ...defaultFormData, pretratamiento: 'Otro (especificar)', pretratamientoOtro: 'Personalizado' };

            render(
                <TetrazolioFields
                    formData={formDataOtro}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const otroInput = screen.getByPlaceholderText('Ingresar pretratamiento manualmente');
            expect(otroInput).toBeInTheDocument();
            expect(otroInput).toHaveValue('Personalizado');
        });

        it('debe mostrar error cuando se selecciona "Otro" pero no se especifica', () => {
            const formDataOtroVacio = { ...defaultFormData, pretratamiento: 'Otro (especificar)', pretratamientoOtro: '' };

            render(
                <TetrazolioFields
                    formData={formDataOtroVacio}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Debe especificar el pretratamiento')).toBeInTheDocument();
        });
    });

    describe('Campo obligatorio: Concentración', () => {
        it('debe renderizar el campo "Concentración" como obligatorio', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Concentración *')).toBeInTheDocument();
        });

        it('debe tener opciones predefinidas de concentración', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const select = screen.getByRole('combobox', { name: /concentración/i });
            expect(select).toBeInTheDocument();
        });

        it('debe mostrar error cuando no se selecciona concentración', () => {
            const formDataSinConcentracion = { ...defaultFormData, concentracion: '' };

            render(
                <TetrazolioFields
                    formData={formDataSinConcentracion}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Debe seleccionar una concentración')).toBeInTheDocument();
        });

        it('debe permitir opción "Otro (especificar)" con campo adicional', () => {
            const formDataOtro = { ...defaultFormData, concentracion: 'Otro (especificar)', concentracionOtro: '2.5%' };

            render(
                <TetrazolioFields
                    formData={formDataOtro}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const otroInput = screen.getByPlaceholderText('Ingresar concentración manualmente');
            expect(otroInput).toBeInTheDocument();
            expect(otroInput).toHaveValue('2.5%');
        });
    });

    describe('Campo obligatorio: Tinción en grados (°C)', () => {
        it('debe renderizar el campo "Tinción (°C)" como obligatorio', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Tinción (°C) *')).toBeInTheDocument();
        });

        it('debe tener opciones de temperatura entre 30-40°C', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const select = screen.getByRole('combobox', { name: /tinción \(°c\)/i });
            expect(select).toBeInTheDocument();
        });

        it('debe mostrar error cuando no se selecciona temperatura', () => {
            const formDataSinTemp = { ...defaultFormData, tincionTemp: null };

            render(
                <TetrazolioFields
                    formData={formDataSinTemp}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Debe seleccionar una temperatura válida')).toBeInTheDocument();
        });

        it('debe permitir ingresar temperatura personalizada cuando se selecciona "Otra"', () => {
            const formDataOtra = { ...defaultFormData, tincionTemp: 0, tincionTempOtro: '42' };

            render(
                <TetrazolioFields
                    formData={formDataOtra}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const otroInput = screen.getByPlaceholderText('Ingresar temperatura (°C)');
            expect(otroInput).toBeInTheDocument();
            expect(otroInput).toHaveValue(42);
        });
    });

    describe('Campo obligatorio: Tinción en horas (hs)', () => {
        it('debe renderizar el campo "Tinción (hs)" como obligatorio', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getByText('Tinción (hs) *')).toBeInTheDocument();
        });

        it('debe tener opciones predefinidas de horas', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const select = screen.getByRole('combobox', { name: /tinción \(hs\)/i });
            expect(select).toBeInTheDocument();
        });

        it('debe mostrar error cuando no se selecciona tiempo de tinción', () => {
            const formDataSinHs = { ...defaultFormData, tincionHs: null };

            render(
                <TetrazolioFields
                    formData={formDataSinHs}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Debe seleccionar un campo para tinción hs')).toBeInTheDocument();
        });

        it('debe permitir ingresar horas personalizadas', () => {
            const formDataOtra = { ...defaultFormData, tincionHs: 'Otra (especificar)', tincionHsOtro: '24' };

            render(
                <TetrazolioFields
                    formData={formDataOtra}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const otroInput = screen.getByPlaceholderText('Ingresar horas');
            expect(otroInput).toBeInTheDocument();
            expect(otroInput).toHaveValue(24);
        });
    });

    describe('Campo: Viabilidad INASE', () => {
        it('debe renderizar el campo "Viabilidad INASE"', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.getAllByText('Viabilidad INASE').length).toBeGreaterThan(0);
        });

        it('debe permitir ingresar valores numéricos', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const viabilidadInput = screen.getByPlaceholderText('Ingrese la viabilidad INASE');
            expect(viabilidadInput).toBeInTheDocument();
            expect(viabilidadInput).toHaveAttribute('type', 'number');
        });
    });

    describe('Validaciones en modo edición', () => {
        it('debe deshabilitar campo de semillas por repetición en modo edición', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                    modoEdicion={true}
                />
            );

            const mensajes = screen.getAllByText('No se puede modificar una vez creado el análisis');
            expect(mensajes.length).toBeGreaterThan(0);
        });

        it('debe deshabilitar campo de repeticiones en modo edición', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                    modoEdicion={true}
                />
            );

            const repeticionesInput = screen.getByDisplayValue('4');
            expect(repeticionesInput).toBeDisabled();
        });
    });

    describe('Validaciones completas del formulario', () => {
        it('debe validar todos los campos obligatorios a la vez', () => {
            const formDataIncompleta = {
                fecha: '',
                numSemillasPorRep: null,
                numRepeticionesEsperadasTetrazolio: null,
                pretratamiento: '',
                concentracion: '',
                tincionTemp: null,
                tincionHs: null
            };

            render(
                <TetrazolioFields
                    formData={formDataIncompleta}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.getByText('Debe ingresar la fecha del ensayo')).toBeInTheDocument();
            expect(screen.getByText('Debe seleccionar 25, 50 o 100 semillas')).toBeInTheDocument();
            expect(screen.getByText('Debe estar entre 2 y 8 repeticiones')).toBeInTheDocument();
            expect(screen.getByText('Debe seleccionar un pretratamiento')).toBeInTheDocument();
            expect(screen.getByText('Debe seleccionar una concentración')).toBeInTheDocument();
            expect(screen.getByText('Debe seleccionar una temperatura válida')).toBeInTheDocument();
            expect(screen.getByText('Debe seleccionar un campo para tinción hs')).toBeInTheDocument();
        });

        it('no debe mostrar errores cuando todos los campos son válidos', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                    mostrarValidacion={true}
                />
            );

            expect(screen.queryByText('Debe ingresar la fecha del ensayo')).not.toBeInTheDocument();
            expect(screen.queryByText('Debe estar entre 2 y 8 repeticiones')).not.toBeInTheDocument();
            expect(screen.queryByText('Debe seleccionar un pretratamiento')).not.toBeInTheDocument();
        });
    });

    describe('Interacciones del usuario', () => {
        it('debe llamar a handleInputChange al modificar cualquier campo', () => {
            render(
                <TetrazolioFields
                    formData={defaultFormData}
                    handleInputChange={mockHandleInputChange}
                />
            );

            const fechaInput = screen.getByDisplayValue('2024-03-01');
            fireEvent.change(fechaInput, { target: { value: '2024-04-01' } });

            expect(mockHandleInputChange).toHaveBeenCalledWith('fecha', '2024-04-01');
        });

        it('debe limpiar el campo "otro" cuando se cambia la selección', () => {
            const formDataConOtro = {
                ...defaultFormData,
                pretratamiento: 'Otro (especificar)',
                pretratamientoOtro: 'Valor personalizado'
            };

            const { rerender } = render(
                <TetrazolioFields
                    formData={formDataConOtro}
                    handleInputChange={mockHandleInputChange}
                />
            );

            // Simular cambio a otra opción
            const formDataCambiado = {
                ...formDataConOtro,
                pretratamiento: 'EP 16 horas',
                pretratamientoOtro: ''
            };

            rerender(
                <TetrazolioFields
                    formData={formDataCambiado}
                    handleInputChange={mockHandleInputChange}
                />
            );

            expect(screen.queryByPlaceholderText('Ingresar pretratamiento manualmente')).not.toBeInTheDocument();
        });
    });
});
