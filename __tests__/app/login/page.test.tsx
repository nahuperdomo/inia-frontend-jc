import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'

// Mock del router de Next.js
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => '/login',
}))

// Mock del auth provider
jest.mock('@/components/auth-provider', () => ({
  useAuth: () => ({
    refresh: jest.fn(),
    user: null,
  }),
}))

// Mock del servicio de 2FA
jest.mock('@/app/services/auth-2fa-service', () => ({
  login2FA: jest.fn(),
  setupInitial2FA: jest.fn(),
  verifyInitial2FA: jest.fn(),
  formatBackupCode: (code: string) => code,
}))

// Mock del fingerprint
jest.mock('@/lib/fingerprint', () => ({
  getDeviceFingerprint: jest.fn().mockResolvedValue('mock-fingerprint'),
}))

// Mock de sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}))

import { login2FA } from '@/app/services/auth-2fa-service'

describe('Login Page', () => {
  const mockLogin2FA = login2FA as jest.MockedFunction<typeof login2FA>

  beforeEach(() => {
    jest.clearAllMocks()
    document.cookie = ''
  })

  it('debe renderizar el formulario de login', () => {
    // Act
    render(<LoginPage />)

    // Assert
    expect(screen.getByPlaceholderText(/usuario/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('debe mostrar error cuando los campos están vacíos', async () => {
    // Arrange
    const user = userEvent.setup()
    mockLogin2FA.mockRejectedValue({ message: 'Campos requeridos' })
    render(<LoginPage />)

    // Act
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    await user.click(submitButton)

    // Assert - El form validation de React Hook Form debería prevenir el submit
    expect(mockLogin2FA).not.toHaveBeenCalled()
  })

  it('debe realizar login exitoso con credenciales válidas', async () => {
    // Arrange
    const user = userEvent.setup()
    mockLogin2FA.mockResolvedValue({
      success: true,
    } as any)

    render(<LoginPage />)

    // Act
    const usernameInput = screen.getByPlaceholderText(/usuario/i)
    const passwordInput = screen.getByPlaceholderText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(mockLogin2FA).toHaveBeenCalledWith({
        usuario: 'testuser',
        password: 'password123',
        deviceFingerprint: 'mock-fingerprint',
        totpCode: undefined,
        trustDevice: undefined,
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('debe mostrar error cuando las credenciales son incorrectas', async () => {
    // Arrange
    const user = userEvent.setup()
    mockLogin2FA.mockRejectedValue({
      message: 'Credenciales inválidas',
    })

    render(<LoginPage />)

    // Act
    const usernameInput = screen.getByPlaceholderText(/usuario/i)
    const passwordInput = screen.getByPlaceholderText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    await user.type(usernameInput, 'wronguser')
    await user.type(passwordInput, 'wrongpass')
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(mockLogin2FA).toHaveBeenCalled()
    })
  })

  it('debe deshabilitar el botón durante el proceso de login', async () => {
    // Arrange
    const user = userEvent.setup()
    mockLogin2FA.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true } as any), 100))
    )

    render(<LoginPage />)

    // Act
    const usernameInput = screen.getByPlaceholderText(/usuario/i)
    const passwordInput = screen.getByPlaceholderText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Assert - El botón debería estar deshabilitado durante la carga
    expect(submitButton).toBeDisabled()
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    }, { timeout: 2000 })
  })

  it('debe tener un link a "Olvidé mi contraseña"', () => {
    // Act
    render(<LoginPage />)

    // Assert
    const forgotPasswordLink = screen.getByText(/¿olvidaste tu contraseña\?/i)
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password')
  })

  it('debe tener un link a registro', () => {
    // Act
    render(<LoginPage />)

    // Assert
    const registerLink = screen.getByText(/registrar nuevo usuario/i)
    expect(registerLink).toBeInTheDocument()
    expect(registerLink.closest('a')).toHaveAttribute('href', '/registro/usuario')
  })
})
