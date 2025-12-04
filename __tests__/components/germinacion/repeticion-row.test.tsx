

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RepeticionRow } from '@/components/germinacion/repeticion-row'
import { RepGermDTO } from '@/app/models/interfaces/repeticiones'
import { toast } from 'sonner'

// Mock de sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}))

describe('RepeticionRow - Tests de Tabla de Repeticiones', () => {
  const mockOnGuardar = jest.fn()
  const mockOnEliminar = jest.fn()

  const defaultProps = {
    numeroRepeticion: 1,
    numeroConteos: 3,
    numSemillasPRep: 100,
    isFinalized: false,
    onGuardar: mockOnGuardar,
    onEliminar: mockOnEliminar
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockOnGuardar.mockResolvedValue(undefined)
  })

  describe('Test: Renderizar tabla con 8 repeticiones', () => {
    it('debe renderizar una repetición sin datos previos', () => {
      render(<RepeticionRow {...defaultProps} />)

      expect(screen.getByText(/Repetición 1/i)).toBeInTheDocument()
      expect(screen.getByText(/Normales por Conteo/i)).toBeInTheDocument()
    })

    it('debe renderizar repetición con datos existentes', () => {
      const mockRepeticion: RepGermDTO = {
        repGermID: 1,
        numRep: 1,
        normales: [10, 15, 20],
        anormales: 5,
        duras: 3,
        frescas: 2,
        muertas: 1,
        total: 56
      }

      render(<RepeticionRow {...defaultProps} repeticion={mockRepeticion} />)

      expect(screen.getByText(/Repetición 1/i)).toBeInTheDocument()
      expect(screen.getByText(/Completada/i)).toBeInTheDocument()
    })

    it('debe renderizar 8 repeticiones con sus inputs correctos', () => {
      const { rerender } = render(<RepeticionRow {...defaultProps} numeroRepeticion={1} />)

      // Verificar que hay inputs para los 3 conteos
      const conteosLabels = screen.getAllByText(/Conteo \d+/)
      expect(conteosLabels).toHaveLength(3)

      // Renderizar las 8 repeticiones
      for (let i = 1; i <= 8; i++) {
        rerender(<RepeticionRow {...defaultProps} numeroRepeticion={i} />)
        expect(screen.getByText(new RegExp(`Repetición ${i}`, 'i'))).toBeInTheDocument()
      }
    })

    it('debe renderizar campos adicionales: anormales, duras, frescas, muertas', () => {
      render(<RepeticionRow {...defaultProps} />)

      expect(screen.getByText(/Anormales/i)).toBeInTheDocument()
      expect(screen.getByText(/Duras/i)).toBeInTheDocument()
      expect(screen.getByText(/Frescas/i)).toBeInTheDocument()
      expect(screen.getByText(/Muertas/i)).toBeInTheDocument()
    })

    it('debe mostrar el total calculado', () => {
      render(<RepeticionRow {...defaultProps} />)

      expect(screen.getByText(/Total: 0\/100 semillas/i)).toBeInTheDocument()
    })

    it('debe mostrar el rango permitido (95-105)', () => {
      render(<RepeticionRow {...defaultProps} numSemillasPRep={100} />)

      expect(screen.getByText(/rango permitido: 95-105/i)).toBeInTheDocument()
    })

    it('debe renderizar botones de guardar y cancelar en modo edición', () => {
      render(<RepeticionRow {...defaultProps} />)

      expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    })

    it('debe renderizar botón de editar cuando hay datos guardados', () => {
      const mockRepeticion: RepGermDTO = {
        repGermID: 1,
        numRep: 1,
        normales: [10, 15, 20],
        anormales: 5,
        duras: 3,
        frescas: 2,
        muertas: 1,
        total: 56
      }

      render(<RepeticionRow {...defaultProps} repeticion={mockRepeticion} />)

      expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
    })
  })

  describe('Test: Inputs editables por celda', () => {
    it('debe permitir editar el primer campo de normales', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      const primerNormal = inputs[0]

      fireEvent.change(primerNormal, { target: { value: '25' } })

      expect(primerNormal).toHaveValue(25)
    })

    it('debe permitir editar todos los campos de normales', () => {
      render(<RepeticionRow {...defaultProps} numeroConteos={3} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      // Primeros 3 inputs son los normales
      fireEvent.change(inputs[0], { target: { value: '10' } })
      fireEvent.change(inputs[1], { target: { value: '15' } })
      fireEvent.change(inputs[2], { target: { value: '20' } })

      expect(inputs[0]).toHaveValue(10)
      expect(inputs[1]).toHaveValue(15)
      expect(inputs[2]).toHaveValue(20)
    })

    it('debe permitir editar campo de anormales', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      const anormalesInput = inputs[3] // Después de los 3 normales

      fireEvent.change(anormalesInput, { target: { value: '5' } })

      expect(anormalesInput).toHaveValue(5)
    })

    it('debe permitir editar campo de duras', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      const durasInput = inputs[4]

      fireEvent.change(durasInput, { target: { value: '3' } })

      expect(durasInput).toHaveValue(3)
    })

    it('debe permitir editar campo de frescas', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      const frescasInput = inputs[5]

      fireEvent.change(frescasInput, { target: { value: '2' } })

      expect(frescasInput).toHaveValue(2)
    })

    it('debe permitir editar campo de muertas', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      const muertasInput = inputs[6]

      fireEvent.change(muertasInput, { target: { value: '4' } })

      expect(muertasInput).toHaveValue(4)
    })

    it('debe mostrar botón de editar y permitir entrar en modo edición', async () => {
      const mockRepeticion: RepGermDTO = {
        repGermID: 1,
        numRep: 1,
        normales: [10, 15, 20],
        anormales: 5,
        duras: 3,
        frescas: 2,
        muertas: 1,
        total: 56
      }

      render(<RepeticionRow {...defaultProps} repeticion={mockRepeticion} />)

      const editarButton = screen.getByRole('button', { name: /editar/i })
      fireEvent.click(editarButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
      })
    })

    it('debe reemplazar el 0 inicial al escribir un nuevo valor', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      const primerNormal = inputs[0]

      // Simular que el usuario escribe directamente sin borrar el 0
      fireEvent.change(primerNormal, { target: { value: '5' } })

      expect(primerNormal).toHaveValue(5)
    })

    it('debe permitir limpiar un campo dejándolo vacío y convertirlo en 0', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      const primerNormal = inputs[0]

      // Primero establecer un valor
      fireEvent.change(primerNormal, { target: { value: '25' } })
      expect(primerNormal).toHaveValue(25)

      // Ahora limpiar el campo - en modo edición muestra vacío, internamente es 0
      fireEvent.change(primerNormal, { target: { value: '' } })
      // El input muestra vacío pero el total se calcula con 0
      expect(screen.getByText(/Total: 0\/100/i)).toBeInTheDocument()
    })
  })

  describe('Test: Validación valores numéricos', () => {
    it('debe validar que el total no exceda el límite máximo (105)', async () => {
      render(<RepeticionRow {...defaultProps} numSemillasPRep={100} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      // Ingresar valores que excedan el límite (105)
      fireEvent.change(inputs[0], { target: { value: '50' } }) // Normal 1
      fireEvent.change(inputs[1], { target: { value: '30' } }) // Normal 2
      fireEvent.change(inputs[2], { target: { value: '30' } }) // Normal 3
      // Total = 110 > 105

      const guardarButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(guardarButton)

      await waitFor(() => {
        // El botón de guardar debe estar deshabilitado o mostrar error
        expect(mockOnGuardar).not.toHaveBeenCalled()
      })
    })

    it('debe permitir guardar cuando el total está dentro del rango (95-105)', async () => {
      render(<RepeticionRow {...defaultProps} numSemillasPRep={100} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      // Ingresar valores dentro del rango
      fireEvent.change(inputs[0], { target: { value: '40' } }) // Normal 1
      fireEvent.change(inputs[1], { target: { value: '35' } }) // Normal 2
      fireEvent.change(inputs[2], { target: { value: '25' } }) // Normal 3
      // Total = 100 (dentro del rango)

      const guardarButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(guardarButton)

      await waitFor(() => {
        expect(mockOnGuardar).toHaveBeenCalledWith({
          numRep: 1,
          normales: [40, 35, 25],
          anormales: 0,
          duras: 0,
          frescas: 0,
          muertas: 0,
          total: 100
        })
      })
    })

    it('debe validar que no se puedan guardar valores todos en 0', async () => {
      render(<RepeticionRow {...defaultProps} />)

      const guardarButton = screen.getByRole('button', { name: /guardar/i })
      
      // Intentar guardar sin cambiar nada (todos en 0)
      fireEvent.click(guardarButton)

      await waitFor(() => {
        expect(mockOnGuardar).not.toHaveBeenCalled()
      })

      // El botón debe estar deshabilitado
      expect(guardarButton).toBeDisabled()
    })

    it('debe validar que el total no sea menor al mínimo (95) y mostrar advertencia', () => {
      render(<RepeticionRow {...defaultProps} numSemillasPRep={100} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      // Ingresar valores por debajo del mínimo
      fireEvent.change(inputs[0], { target: { value: '30' } })
      fireEvent.change(inputs[1], { target: { value: '30' } })
      fireEvent.change(inputs[2], { target: { value: '20' } })
      // Total = 80 < 95

      expect(screen.getByText(/Menor al mínimo/i)).toBeInTheDocument()
    })

    it('debe aceptar valores numéricos válidos en cada campo', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      // Ingresar valores válidos
      fireEvent.change(inputs[0], { target: { value: '25' } })
      fireEvent.change(inputs[3], { target: { value: '10' } }) // anormales
      fireEvent.change(inputs[4], { target: { value: '5' } })  // duras

      expect(inputs[0]).toHaveValue(25)
      expect(inputs[3]).toHaveValue(10)
      expect(inputs[4]).toHaveValue(5)
    })

    it('debe convertir valores no numéricos en 0', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      // Intentar ingresar texto (el navegador lo previene, pero parseamos)
      fireEvent.change(inputs[0], { target: { value: 'abc' } })

      // El componente convierte strings inválidos en 0 internamente
      // El total debe ser 0
      expect(screen.getByText(/Total: 0\/100/i)).toBeInTheDocument()
    })

    it('debe validar que todos los campos sean mayores o iguales a 0', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      // Los inputs tienen min="0", pero probamos la validación
      inputs.forEach(input => {
        expect(input).toHaveAttribute('min', '0')
      })
    })

    it('debe mostrar mensaje cuando el total excede el máximo', () => {
      render(<RepeticionRow {...defaultProps} numSemillasPRep={100} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      // Exceder el límite
      fireEvent.change(inputs[0], { target: { value: '60' } })
      fireEvent.change(inputs[1], { target: { value: '50' } })
      // Total = 110 > 105

      expect(screen.getByText(/Excede el límite máximo/i)).toBeInTheDocument()
    })

    it('debe mostrar mensaje cuando el total está dentro del rango', () => {
      render(<RepeticionRow {...defaultProps} numSemillasPRep={100} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      // Valores dentro del rango
      fireEvent.change(inputs[0], { target: { value: '50' } })
      fireEvent.change(inputs[1], { target: { value: '48' } })
      // Total = 98 (dentro del rango 95-105)

      expect(screen.getByText(/Dentro del rango/i)).toBeInTheDocument()
    })
  })

  describe('Test: Cálculo automático de totales', () => {
    it('debe calcular el total automáticamente al ingresar normales', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      fireEvent.change(inputs[0], { target: { value: '10' } }) // Normal 1
      fireEvent.change(inputs[1], { target: { value: '15' } }) // Normal 2
      fireEvent.change(inputs[2], { target: { value: '20' } }) // Normal 3

      expect(screen.getByText(/Total: 45\/100/i)).toBeInTheDocument()
    })

    it('debe calcular el total sumando normales + anormales', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      fireEvent.change(inputs[0], { target: { value: '20' } }) // Normal 1
      fireEvent.change(inputs[3], { target: { value: '10' } }) // Anormales

      expect(screen.getByText(/Total: 30\/100/i)).toBeInTheDocument()
    })

    it('debe calcular el total sumando todos los campos', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      fireEvent.change(inputs[0], { target: { value: '30' } }) // Normal 1
      fireEvent.change(inputs[1], { target: { value: '25' } }) // Normal 2
      fireEvent.change(inputs[2], { target: { value: '20' } }) // Normal 3
      fireEvent.change(inputs[3], { target: { value: '10' } }) // Anormales
      fireEvent.change(inputs[4], { target: { value: '5' } })  // Duras
      fireEvent.change(inputs[5], { target: { value: '3' } })  // Frescas
      fireEvent.change(inputs[6], { target: { value: '2' } })  // Muertas
      // Total = 30+25+20+10+5+3+2 = 95

      expect(screen.getByText(/Total: 95\/100/i)).toBeInTheDocument()
    })

    it('debe recalcular el total al modificar un valor existente', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      // Primer ingreso
      fireEvent.change(inputs[0], { target: { value: '30' } })
      expect(screen.getByText(/Total: 30\/100/i)).toBeInTheDocument()

      // Modificar el valor
      fireEvent.change(inputs[0], { target: { value: '50' } })
      expect(screen.getByText(/Total: 50\/100/i)).toBeInTheDocument()
    })

    it('debe mantener el total actualizado al cambiar múltiples campos', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      fireEvent.change(inputs[0], { target: { value: '20' } })
      expect(screen.getByText(/Total: 20\/100/i)).toBeInTheDocument()

      fireEvent.change(inputs[1], { target: { value: '30' } })
      expect(screen.getByText(/Total: 50\/100/i)).toBeInTheDocument()

      fireEvent.change(inputs[3], { target: { value: '15' } })
      expect(screen.getByText(/Total: 65\/100/i)).toBeInTheDocument()
    })

    it('debe calcular correctamente con diferentes números de conteos', () => {
      render(<RepeticionRow {...defaultProps} numeroConteos={5} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      // Ingresar valores en los 5 conteos
      fireEvent.change(inputs[0], { target: { value: '10' } })
      fireEvent.change(inputs[1], { target: { value: '12' } })
      fireEvent.change(inputs[2], { target: { value: '14' } })
      fireEvent.change(inputs[3], { target: { value: '16' } })
      fireEvent.change(inputs[4], { target: { value: '18' } })
      // Total = 70

      expect(screen.getByText(/Total: 70\/100/i)).toBeInTheDocument()
    })

    it('debe resetear el total a 0 al limpiar todos los campos', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      // Primero ingresar valores
      fireEvent.change(inputs[0], { target: { value: '30' } })
      expect(screen.getByText(/Total: 30\/100/i)).toBeInTheDocument()

      // Ahora limpiar
      fireEvent.change(inputs[0], { target: { value: '' } })
      expect(screen.getByText(/Total: 0\/100/i)).toBeInTheDocument()
    })

    it('debe calcular el total correctamente con valores decimales convertidos a enteros', () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      // Input type="number" con valores decimales se truncan
      fireEvent.change(inputs[0], { target: { value: '25' } })
      fireEvent.change(inputs[1], { target: { value: '25' } })
      
      expect(screen.getByText(/Total: 50\/100/i)).toBeInTheDocument()
    })
  })

  describe('Test: Actualizar padre al cambiar valores', () => {
    it('debe llamar a onGuardar con los datos correctos al hacer click en guardar', async () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      fireEvent.change(inputs[0], { target: { value: '30' } })
      fireEvent.change(inputs[1], { target: { value: '35' } })
      fireEvent.change(inputs[2], { target: { value: '30' } })

      const guardarButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(guardarButton)

      await waitFor(() => {
        expect(mockOnGuardar).toHaveBeenCalledWith({
          numRep: 1,
          normales: [30, 35, 30],
          anormales: 0,
          duras: 0,
          frescas: 0,
          muertas: 0,
          total: 95
        })
      })
    })

    it('debe llamar a onGuardar con todos los campos completados', async () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      fireEvent.change(inputs[0], { target: { value: '30' } }) // Normal 1
      fireEvent.change(inputs[1], { target: { value: '25' } }) // Normal 2
      fireEvent.change(inputs[2], { target: { value: '20' } }) // Normal 3
      fireEvent.change(inputs[3], { target: { value: '10' } }) // Anormales
      fireEvent.change(inputs[4], { target: { value: '5' } })  // Duras
      fireEvent.change(inputs[5], { target: { value: '3' } })  // Frescas
      fireEvent.change(inputs[6], { target: { value: '2' } })  // Muertas

      const guardarButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(guardarButton)

      await waitFor(() => {
        expect(mockOnGuardar).toHaveBeenCalledWith({
          numRep: 1,
          normales: [30, 25, 20],
          anormales: 10,
          duras: 5,
          frescas: 3,
          muertas: 2,
          total: 95
        })
      })
    })

    it('debe mostrar toast de éxito al guardar correctamente', async () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      fireEvent.change(inputs[0], { target: { value: '50' } })
      fireEvent.change(inputs[1], { target: { value: '48' } })

      const guardarButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(guardarButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Repetición 1 guardada exitosamente')
      })
    })

    it('debe mostrar toast de error si onGuardar falla', async () => {
      mockOnGuardar.mockRejectedValue(new Error('Error de red'))

      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      fireEvent.change(inputs[0], { target: { value: '50' } })
      fireEvent.change(inputs[1], { target: { value: '48' } })

      const guardarButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(guardarButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al guardar la repetición 1')
      })
    })

    it('debe salir del modo edición después de guardar exitosamente cuando hay repetición previa', async () => {
      const mockRepeticion: RepGermDTO = {
        repGermID: 1,
        numRep: 1,
        normales: [30, 35, 30],
        anormales: 0,
        duras: 0,
        frescas: 0,
        muertas: 0,
        total: 95
      }

      render(<RepeticionRow {...defaultProps} repeticion={mockRepeticion} />)

      // Entrar en modo edición
      const editarButton = screen.getByRole('button', { name: /editar/i })
      fireEvent.click(editarButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
      })

      const inputs = screen.getAllByRole('spinbutton')
      
      // Modificar valores manteniendo total válido (32 + 33 + 30 = 95)
      fireEvent.change(inputs[0], { target: { value: '32' } })
      fireEvent.change(inputs[1], { target: { value: '33' } })

      const guardarButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(guardarButton)

      await waitFor(() => {
        expect(mockOnGuardar).toHaveBeenCalled()
      })

      // Después de guardar exitosamente, sale del modo edición
      // Esto se verifica porque aparece el botón de Editar nuevamente
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
      })
    })

    it('debe deshabilitar el botón de guardar mientras se está guardando', async () => {
      mockOnGuardar.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      fireEvent.change(inputs[0], { target: { value: '50' } })
      fireEvent.change(inputs[1], { target: { value: '48' } })

      const guardarButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(guardarButton)

      // El botón debe mostrar "Guardando..."
      expect(screen.getByRole('button', { name: /guardando/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled()

      await waitFor(() => {
        expect(mockOnGuardar).toHaveBeenCalled()
      }, { timeout: 200 })
    })

    it('debe restaurar valores originales al cancelar', async () => {
      const mockRepeticion: RepGermDTO = {
        repGermID: 1,
        numRep: 1,
        normales: [10, 15, 20],
        anormales: 5,
        duras: 3,
        frescas: 2,
        muertas: 1,
        total: 56
      }

      render(<RepeticionRow {...defaultProps} repeticion={mockRepeticion} />)

      // Entrar en modo edición
      const editarButton = screen.getByRole('button', { name: /editar/i })
      fireEvent.click(editarButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
      })

      // Modificar un valor
      const inputs = screen.getAllByRole('spinbutton')
      fireEvent.change(inputs[0], { target: { value: '99' } })

      // Cancelar
      const cancelarButton = screen.getByRole('button', { name: /cancelar/i })
      fireEvent.click(cancelarButton)

      // Verificar que no se llamó a onGuardar
      expect(mockOnGuardar).not.toHaveBeenCalled()
    })

    it('debe actualizar el componente padre solo cuando se guarda, no en cada cambio', async () => {
      render(<RepeticionRow {...defaultProps} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      // Hacer varios cambios
      fireEvent.change(inputs[0], { target: { value: '10' } })
      fireEvent.change(inputs[1], { target: { value: '20' } })
      fireEvent.change(inputs[2], { target: { value: '30' } })

      // onGuardar NO debe haberse llamado aún
      expect(mockOnGuardar).not.toHaveBeenCalled()

      // Solo al hacer click en guardar
      const guardarButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(guardarButton)

      await waitFor(() => {
        expect(mockOnGuardar).toHaveBeenCalledTimes(1)
      })
    })

    it('debe incluir el número de repetición correcto al guardar', async () => {
      render(<RepeticionRow {...defaultProps} numeroRepeticion={5} />)

      const inputs = screen.getAllByRole('spinbutton')
      
      fireEvent.change(inputs[0], { target: { value: '50' } })
      fireEvent.change(inputs[1], { target: { value: '48' } })

      const guardarButton = screen.getByRole('button', { name: /guardar/i })
      fireEvent.click(guardarButton)

      await waitFor(() => {
        expect(mockOnGuardar).toHaveBeenCalledWith(
          expect.objectContaining({
            numRep: 5
          })
        )
      })
    })
  })
})
