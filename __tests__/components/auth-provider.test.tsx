import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/components/auth-provider'
import * as authService from '@/app/services/auth-service'
import * as apiService from '@/app/services/api'

// Mock de los servicios
jest.mock('@/app/services/auth-service')
jest.mock('@/app/services/api')

// Componente de prueba para acceder al contexto
function TestComponent() {
  const { user, login, logout, isLoading, hasPermission, isRole, refresh } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="user">{user ? user.name : 'no-user'}</div>
      <div data-testid="email">{user?.email || 'no-email'}</div>
      <div data-testid="role">{user?.role || 'no-role'}</div>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={() => login('observador@test.com', 'password')} data-testid="login-with-observador">Login Observador</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => refresh()}>Refresh</button>
      <div data-testid="has-register">{hasPermission('register_sample') ? 'yes' : 'no'}</div>
      <div data-testid="has-manage-users">{hasPermission('manage_users') ? 'yes' : 'no'}</div>
      <div data-testid="is-admin">{isRole('administrador') ? 'yes' : 'no'}</div>
    </div>
  )
}

describe('AuthProvider', () => {
  const mockUsuarioCompleto = {
    usuarioID: 1,
    email: 'admin@inia.cl',
    nombreCompleto: 'Admin Test',
    nombre: 'Admin',
    nombres: 'Admin',
    apellidos: 'Test',
    rol: 'ADMINISTRADOR',
    roles: ['ADMINISTRADOR'],
  }

  const mockUsuarioAnalista = {
    usuarioID: 2,
    email: 'analista@inia.cl',
    nombreCompleto: 'Analista Test',
    nombre: 'Analista',
    nombres: 'Analista',
    apellidos: 'Test',
    rol: 'ANALISTA',
    roles: ['ANALISTA'],
  }

  const mockUsuarioObservador = {
    usuarioID: 3,
    email: 'observador@inia.cl',
    nombreCompleto: 'Observador Test',
    nombre: 'Observador',
    nombres: 'Observador',
    apellidos: 'Test',
    rol: 'OBSERVADOR',
    roles: ['OBSERVADOR'],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    
    // Mock por defecto: sin usuario autenticado
    ;(authService.obtenerPerfil as jest.Mock).mockRejectedValue(new Error('No autenticado'))
  })

  describe('Renderizado inicial', () => {
    it('debe renderizar con usuario autenticado', async () => {
      ;(authService.obtenerPerfil as jest.Mock).mockResolvedValue(mockUsuarioCompleto)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      expect(screen.getByTestId('user')).toHaveTextContent('Admin Test')
      expect(screen.getByTestId('email')).toHaveTextContent('admin@inia.cl')
      expect(screen.getByTestId('role')).toHaveTextContent('administrador')
    })

    it('debe renderizar sin usuario (null)', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
      expect(screen.getByTestId('email')).toHaveTextContent('no-email')
      expect(screen.getByTestId('role')).toHaveTextContent('no-role')
    })
  })

  describe('Función login', () => {
    it('debe actualizar usuario al hacer login con email admin', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      const loginButton = screen.getByText('Login')
      
      await act(async () => {
        loginButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).not.toHaveTextContent('no-user')
        expect(screen.getByTestId('email')).toHaveTextContent('test@test.com')
        expect(screen.getByTestId('role')).toHaveTextContent('analista')
      })
    })

    it('debe asignar rol analista por defecto', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      const loginButton = screen.getByText('Login')
      
      await act(async () => {
        loginButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('role')).toHaveTextContent('analista')
      })
    })
  })

  describe('Función logout', () => {
    it('debe limpiar estado al hacer logout', async () => {
      ;(authService.obtenerPerfil as jest.Mock).mockResolvedValue(mockUsuarioCompleto)
      ;(apiService.apiFetch as jest.Mock).mockResolvedValue({ ok: true })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Admin Test')
      })

      const logoutButton = screen.getByText('Logout')
      
      await act(async () => {
        logoutButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user')
        expect(apiService.apiFetch).toHaveBeenCalledWith('/api/v1/auth/logout', { method: 'POST' })
      })
    })

    it('debe limpiar localStorage al hacer logout', async () => {
      ;(authService.obtenerPerfil as jest.Mock).mockResolvedValue(mockUsuarioCompleto)
      ;(apiService.apiFetch as jest.Mock).mockResolvedValue({ ok: true })
      
      localStorage.setItem('inia-user', JSON.stringify({ name: 'test' }))
      localStorage.setItem('usuario', 'test')

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Admin Test')
      })

      const logoutButton = screen.getByText('Logout')
      
      await act(async () => {
        logoutButton.click()
      })

      await waitFor(() => {
        expect(localStorage.getItem('inia-user')).toBeNull()
        expect(localStorage.getItem('usuario')).toBeNull()
      })
    })
  })

  describe('Función refresh', () => {
    it('debe actualizar token y usuario', async () => {
      let callCount = 0
      ;(authService.obtenerPerfil as jest.Mock).mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve(mockUsuarioAnalista)
        }
        return Promise.resolve(mockUsuarioCompleto)
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Analista Test')
      })

      const refreshButton = screen.getByText('Refresh')
      
      await act(async () => {
        refreshButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Admin Test')
        expect(screen.getByTestId('role')).toHaveTextContent('administrador')
      })
    })
  })

  describe('Persistencia y permisos', () => {
    it('debe verificar permisos según rol administrador', async () => {
      ;(authService.obtenerPerfil as jest.Mock).mockResolvedValue(mockUsuarioCompleto)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('has-register')).toHaveTextContent('yes')
        expect(screen.getByTestId('has-manage-users')).toHaveTextContent('yes')
        expect(screen.getByTestId('is-admin')).toHaveTextContent('yes')
      })
    })

    it('debe verificar permisos según rol analista', async () => {
      ;(authService.obtenerPerfil as jest.Mock).mockResolvedValue(mockUsuarioAnalista)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('has-register')).toHaveTextContent('yes')
        expect(screen.getByTestId('has-manage-users')).toHaveTextContent('no')
        expect(screen.getByTestId('is-admin')).toHaveTextContent('no')
      })
    })

    it('debe verificar permisos según rol observador', async () => {
      ;(authService.obtenerPerfil as jest.Mock).mockResolvedValue(mockUsuarioObservador)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('has-register')).toHaveTextContent('no')
        expect(screen.getByTestId('has-manage-users')).toHaveTextContent('no')
        expect(screen.getByTestId('is-admin')).toHaveTextContent('no')
      })
    })
  })

  describe('Hook useAuth', () => {
    it('debe lanzar error si se usa fuera del provider', () => {
      // Suprimir console.error para este test
      const originalError = console.error
      console.error = jest.fn()

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')

      console.error = originalError
    })

    it('debe ser accesible dentro del provider', async () => {
      ;(authService.obtenerPerfil as jest.Mock).mockResolvedValue(mockUsuarioCompleto)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Admin Test')
      })

      expect(screen.getByText('Login')).toBeInTheDocument()
      expect(screen.getByText('Logout')).toBeInTheDocument()
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })
  })

  describe('Manejo de errores en logout', () => {
    it('debe continuar con limpieza local si logout backend falla', async () => {
      ;(authService.obtenerPerfil as jest.Mock).mockResolvedValue(mockUsuarioCompleto)
      ;(apiService.apiFetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Admin Test')
      })

      const logoutButton = screen.getByText('Logout')
      
      await act(async () => {
        logoutButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user')
      })
    })
  })

  describe('Casos edge de inicialización', () => {
    it('debe manejar sessionStorage.clear() error', async () => {
      const originalClear = Storage.prototype.clear
      Storage.prototype.clear = jest.fn(() => {
        throw new Error('Storage error')
      })

      ;(authService.obtenerPerfil as jest.Mock).mockResolvedValue(mockUsuarioCompleto)
      ;(apiService.apiFetch as jest.Mock).mockResolvedValue({ ok: true })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Admin Test')
      })

      const logoutButton = screen.getByText('Logout')
      
      await act(async () => {
        logoutButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user')
      })

      Storage.prototype.clear = originalClear
    })

    it('debe manejar localStorage.removeItem() error', async () => {
      const originalRemoveItem = Storage.prototype.removeItem
      Storage.prototype.removeItem = jest.fn(() => {
        throw new Error('Storage error')
      })

      ;(authService.obtenerPerfil as jest.Mock).mockResolvedValue(mockUsuarioCompleto)
      ;(apiService.apiFetch as jest.Mock).mockResolvedValue({ ok: true })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Admin Test')
      })

      const logoutButton = screen.getByText('Logout')
      
      await act(async () => {
        logoutButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user')
      })

      Storage.prototype.removeItem = originalRemoveItem
    })
  })

  describe('Login con diferentes tipos de usuarios', () => {
    it('debe asignar rol observador cuando el email contiene "observador"', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      const loginWithObservador = screen.getByTestId('login-with-observador')
      
      await act(async () => {
        loginWithObservador.click()
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      await waitFor(() => {
        expect(screen.getByTestId('role')).toHaveTextContent('observador')
        expect(screen.getByTestId('user')).toHaveTextContent('Cliente Externo')
      })
    })
  })

  describe('Persistencia y recuperación de sesión', () => {
    it('debe intentar cargar sesión al inicializar sin usuario previo', async () => {
      ;(authService.obtenerPerfil as jest.Mock).mockRejectedValue(new Error('No autenticado'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user')
      })
    })
  })

  describe('hasPermission - Casos sin usuario', () => {
    it('debe retornar false cuando no hay usuario', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      expect(screen.getByTestId('has-register')).toHaveTextContent('no')
      expect(screen.getByTestId('has-manage-users')).toHaveTextContent('no')
    })
  })
})
