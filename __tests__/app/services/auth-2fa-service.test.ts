import {
  login2FA,
  setupInitial2FA,
  verifyInitial2FA,
  forgotPassword,
  resetPassword,
  regenerateBackupCodes,
  type Login2FARequest,
  type Login2FAResponse,
  type Requires2FAResponse,
  type Requires2FASetupResponse,
} from '@/app/services/auth-2fa-service'

// Mock global fetch
global.fetch = jest.fn()

describe('auth-2fa-service', () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('login2FA', () => {
    it('debe hacer login con credenciales válidas sin 2FA', async () => {
      const mockResponse: Login2FAResponse = {
        mensaje: 'Login exitoso',
        usuario: {
          id: 1,
          nombre: 'Test User',
          nombres: 'Test',
          apellidos: 'User',
          email: 'test@test.com',
          roles: ['ANALISTA'],
          has2FA: false,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'password123',
      }

      const result = await login2FA(credentials)

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/auth/login-2fa`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(credentials),
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('debe retornar error con credenciales inválidas', async () => {
      const mockError = { error: 'Credenciales inválidas' }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify(mockError),
      })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'wrong-password',
      }

      await expect(login2FA(credentials)).rejects.toThrow('Credenciales inválidas')
    })

    it('debe requerir código TOTP cuando usuario tiene 2FA habilitado', async () => {
      const mockResponse: Requires2FAResponse = {
        requires2FA: true,
        mensaje: 'Se requiere código de autenticación',
        userId: 1,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => JSON.stringify(mockResponse),
      })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'password123',
      }

      const result = await login2FA(credentials)

      expect(result).toEqual(mockResponse)
      expect('requires2FA' in result && result.requires2FA).toBe(true)
    })

    it('debe hacer login con código TOTP válido', async () => {
      const mockResponse: Login2FAResponse = {
        mensaje: 'Login exitoso',
        usuario: {
          id: 1,
          nombre: 'Test User',
          nombres: 'Test',
          apellidos: 'User',
          email: 'test@test.com',
          roles: ['ADMINISTRADOR'],
          has2FA: true,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'password123',
        totpCode: '123456',
        deviceFingerprint: 'test-fingerprint',
        trustDevice: true,
      }

      const result = await login2FA(credentials)

      expect(result).toEqual(mockResponse)
      expect('usuario' in result && result.usuario.has2FA).toBe(true)
    })

    it('debe manejar error de red', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('NetworkError: Failed to fetch')
      )

      // Mock fallback a login tradicional
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          mensaje: 'Login exitoso',
          usuario: {
            id: 1,
            nombre: 'Test User',
            nombres: 'Test',
            apellidos: 'User',
            email: 'test@test.com',
            roles: ['ANALISTA'],
          },
        }),
      })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'password123',
      }

      const result = await login2FA(credentials)

      expect('usuario' in result && result.usuario.has2FA).toBe(false)
    })
  })

  describe('setupInitial2FA', () => {
    it('debe generar QR code para configuración inicial', async () => {
      const mockResponse = {
        mensaje: 'Setup 2FA iniciado',
        data: {
          secret: 'SECRET123',
          qrCodeDataUrl: 'data:image/png;base64,ABC123',
          issuer: 'INIA',
          accountName: 'test@test.com',
        },
        userId: 1,
        email: 'test@test.com',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      })

      const result = await setupInitial2FA('test@test.com', 'password123')

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/auth/2fa/setup-initial`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            email: 'test@test.com',
            password: 'password123',
          }),
        })
      )

      expect(result.data.secret).toBe('SECRET123')
      expect(result.data.qrCodeDataUrl).toContain('data:image/png')
    })

    it('debe manejar error con credenciales inválidas', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ error: 'Credenciales inválidas' }),
      })

      await expect(setupInitial2FA('test@test.com', 'wrong')).rejects.toThrow(
        'Credenciales inválidas'
      )
    })
  })

  describe('verifyInitial2FA', () => {
    it('debe verificar código válido y activar 2FA', async () => {
      const mockResponse = {
        mensaje: '2FA activado exitosamente',
        totpEnabled: true,
        backupCodes: ['CODE1', 'CODE2', 'CODE3'],
        totalCodes: 10,
        usuario: {
          id: 1,
          nombre: 'Test User',
          nombres: 'Test',
          apellidos: 'User',
          email: 'test@test.com',
          roles: ['ANALISTA'],
          has2FA: true,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      })

      const result = await verifyInitial2FA('test@test.com', '123456')

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/auth/2fa/verify-initial`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@test.com',
            totpCode: '123456',
          }),
        })
      )

      expect(result.totpEnabled).toBe(true)
      expect(result.backupCodes).toHaveLength(3)
      expect(result.usuario.has2FA).toBe(true)
    })

    it('debe rechazar código inválido', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: 'Código TOTP inválido' }),
      })

      await expect(verifyInitial2FA('test@test.com', '000000')).rejects.toThrow(
        'Código TOTP inválido'
      )
    })
  })

  describe('forgotPassword', () => {
    it('debe enviar código de recuperación por email', async () => {
      const mockResponse = {
        mensaje: 'Código de recuperación enviado por email',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      })

      const result = await forgotPassword('test@test.com')

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/auth/forgot-password`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@test.com' }),
        })
      )

      expect(result.mensaje).toContain('enviado')
    })

    it('debe rechazar email no registrado', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ error: 'Usuario no encontrado' }),
      })

      await expect(forgotPassword('noexiste@test.com')).rejects.toThrow(
        'Usuario no encontrado'
      )
    })
  })

  describe('resetPassword', () => {
    it('debe resetear contraseña con códigos válidos', async () => {
      const mockResponse = {
        mensaje: 'Contraseña actualizada exitosamente',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      })

      const result = await resetPassword({
        email: 'test@test.com',
        recoveryCode: 'ABCD-1234',
        totpCode: '123456',
        newPassword: 'newpassword123',
      })

      expect(result.mensaje).toContain('exitosamente')
    })

    it('debe rechazar código de recuperación inválido', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Código de recuperación inválido o expirado' }),
      })

      await expect(
        resetPassword({
          email: 'test@test.com',
          recoveryCode: 'WRONG-CODE',
          totpCode: '123456',
          newPassword: 'newpassword123',
        })
      ).rejects.toThrow(/código de recuperación|expirado/i)
    })

    it('debe rechazar código TOTP inválido', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Código de autenticación inválido' }),
      })

      await expect(
        resetPassword({
          email: 'test@test.com',
          recoveryCode: 'ABCD-1234',
          totpCode: '000000',
          newPassword: 'newpassword123',
        })
      ).rejects.toThrow(/código.*autenticación.*inválido|Google Authenticator.*incorrecto/i)
    })
  })

  describe('regenerateBackupCodes', () => {
    it('debe regenerar códigos de respaldo con TOTP válido', async () => {
      const mockResponse = {
        mensaje: 'Códigos regenerados exitosamente',
        backupCodes: [
          'CODE1',
          'CODE2',
          'CODE3',
          'CODE4',
          'CODE5',
          'CODE6',
          'CODE7',
          'CODE8',
          'CODE9',
          'CODE10',
        ],
        totalCodes: 10,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      })

      const result = await regenerateBackupCodes('123456')

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/auth/2fa/backup-codes/regenerate`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ totpCode: '123456' }),
        })
      )

      expect(result.backupCodes).toHaveLength(10)
      expect(result.totalCodes).toBe(10)
    })

    it('debe rechazar código TOTP inválido', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: 'Código TOTP inválido' }),
      })

      await expect(regenerateBackupCodes('000000')).rejects.toThrow('Código TOTP inválido')
    })
  })

  describe('getBackupCodesCount', () => {
    it('debe obtener el conteo de códigos disponibles', async () => {
      const mockResponse = {
        availableCodes: 8,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      })

      const { getBackupCodesCount } = await import('@/app/services/auth-2fa-service')
      const result = await getBackupCodesCount()

      expect(result.availableCodes).toBe(8)
    })

    it('debe incluir advertencia cuando quedan pocos códigos', async () => {
      const mockResponse = {
        availableCodes: 2,
        warning: 'Quedan pocos códigos de respaldo',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      })

      const { getBackupCodesCount } = await import('@/app/services/auth-2fa-service')
      const result = await getBackupCodesCount()

      expect(result.availableCodes).toBe(2)
      expect(result.warning).toBe('Quedan pocos códigos de respaldo')
    })
  })

  describe('completeAdminSetup', () => {
    it('debe completar configuración inicial del admin', async () => {
      const mockResponse = {
        mensaje: 'Configuración completada',
        backupCodes: ['CODE1', 'CODE2'],
        totalCodes: 10,
        usuario: {
          id: 1,
          nombre: 'Admin',
          nombres: 'Admin',
          apellidos: 'Test',
          email: 'admin@test.com',
          roles: ['ADMINISTRADOR'],
          has2FA: true,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      })

      const { completeAdminSetup } = await import('@/app/services/auth-2fa-service')
      const result = await completeAdminSetup({
        currentPassword: 'temp123',
        newEmail: 'admin@test.com',
        newPassword: 'NewPass123!',
        totpCode: '123456',
      })

      expect(result.usuario.has2FA).toBe(true)
      expect(result.totalCodes).toBe(10)
    })
  })

  describe('getAdminSetupData', () => {
    it('debe obtener datos de setup con token válido', async () => {
      const mockResponse = {
        userId: 1,
        nombre: 'Admin',
        qrCodeDataUrl: 'data:image/png;base64,ABC',
        totpSecret: 'SECRET123',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      })

      const { getAdminSetupData } = await import('@/app/services/auth-2fa-service')
      const result = await getAdminSetupData('valid-token')

      expect(result.qrCodeDataUrl).toContain('data:image/png')
      expect(result.totpSecret).toBe('SECRET123')
    })

    it('debe rechazar token inválido', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Token inválido o expirado' }),
      })

      const { getAdminSetupData } = await import('@/app/services/auth-2fa-service')
      await expect(getAdminSetupData('invalid-token')).rejects.toThrow('Token inválido')
    })
  })

  describe('Funciones de validación y formato', () => {
    const {
      validateTotpCodeFormat,
      validateBackupCodeFormat,
      formatBackupCode,
      validateRecoveryCodeFormat,
      formatRecoveryCode,
      validatePasswordStrength,
    } = require('@/app/services/auth-2fa-service')

    describe('validateTotpCodeFormat', () => {
      it('debe validar código TOTP de 6 dígitos', () => {
        expect(validateTotpCodeFormat('123456')).toBe(true)
        expect(validateTotpCodeFormat('000000')).toBe(true)
      })

      it('debe rechazar códigos inválidos', () => {
        expect(validateTotpCodeFormat('12345')).toBe(false)
        expect(validateTotpCodeFormat('1234567')).toBe(false)
        expect(validateTotpCodeFormat('abcdef')).toBe(false)
        expect(validateTotpCodeFormat('12-34-56')).toBe(false)
      })
    })

    describe('validateBackupCodeFormat', () => {
      it('debe validar código de respaldo de 12 caracteres', () => {
        expect(validateBackupCodeFormat('ABCD1234EFGH')).toBe(true)
        expect(validateBackupCodeFormat('ABCD-1234-EFGH')).toBe(true)
      })

      it('debe rechazar códigos inválidos', () => {
        expect(validateBackupCodeFormat('SHORT')).toBe(false)
        expect(validateBackupCodeFormat('ABCD-1234')).toBe(false)
      })
    })

    describe('formatBackupCode', () => {
      it('debe formatear código de respaldo', () => {
        expect(formatBackupCode('ABCD1234EFGH')).toBe('ABCD-1234-EFGH')
        expect(formatBackupCode('abcd1234efgh')).toBe('ABCD-1234-EFGH')
      })

      it('debe formatear código parcial', () => {
        expect(formatBackupCode('ABCD12')).toBe('ABCD-12')
        expect(formatBackupCode('ABC')).toBe('ABC')
      })
    })

    describe('validateRecoveryCodeFormat', () => {
      it('debe validar código de recuperación de 8 caracteres', () => {
        expect(validateRecoveryCodeFormat('ABCD1234')).toBe(true)
        expect(validateRecoveryCodeFormat('ABCD-1234')).toBe(true)
      })

      it('debe rechazar códigos inválidos', () => {
        expect(validateRecoveryCodeFormat('SHORT')).toBe(false)
        expect(validateRecoveryCodeFormat('TOOLONGCODE')).toBe(false)
      })
    })

    describe('formatRecoveryCode', () => {
      it('debe formatear código de recuperación', () => {
        expect(formatRecoveryCode('ABCD1234')).toBe('ABCD-1234')
        expect(formatRecoveryCode('abcd1234')).toBe('ABCD-1234')
      })

      it('debe manejar código parcial', () => {
        expect(formatRecoveryCode('ABC')).toBe('ABC')
      })
    })

    describe('validatePasswordStrength', () => {
      it('debe rechazar contraseña corta', () => {
        const result = validatePasswordStrength('Short1')
        expect(result.isValid).toBe(false)
        expect(result.strength).toBe('weak')
      })

      it('debe detectar contraseña débil', () => {
        const result = validatePasswordStrength('password')
        expect(result.isValid).toBe(true)
        expect(result.strength).toBe('weak')
      })

      it('debe detectar contraseña media', () => {
        const result = validatePasswordStrength('Password123')
        expect(result.isValid).toBe(true)
        expect(result.strength).toBe('medium')
      })

      it('debe detectar contraseña fuerte', () => {
        const result = validatePasswordStrength('Password123!')
        expect(result.isValid).toBe(true)
        expect(result.strength).toBe('strong')
      })
    })
  })

  describe('login2FA - Casos especiales de respuesta 403', () => {
    it('debe manejar requiresCredentialChange (admin first-login)', async () => {
      const mockResponse = {
        requiresCredentialChange: true,
        userId: 1,
        mensaje: 'Debe cambiar credenciales',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => JSON.stringify(mockResponse),
      })

      const credentials: Login2FARequest = {
        usuario: 'admin@test.com',
        password: 'tempPassword',
      }

      const result = await login2FA(credentials)
      expect(result).toEqual(mockResponse)
      expect('requiresCredentialChange' in result).toBe(true)
    })

    it('debe manejar requires2FASetup', async () => {
      const mockResponse = {
        requires2FASetup: true,
        userId: 2,
        mensaje: 'Debe configurar 2FA',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => JSON.stringify(mockResponse),
      })

      const credentials: Login2FARequest = {
        usuario: 'user@test.com',
        password: 'password123',
      }

      const result = await login2FA(credentials)
      expect(result).toEqual(mockResponse)
      expect('requires2FASetup' in result).toBe(true)
    })

    it('debe manejar respuesta 403 vacía', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => '',
      })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'password123',
      }

      await expect(login2FA(credentials)).rejects.toThrow('respuesta vacía')
    })

    it('debe manejar respuesta 403 con JSON inválido', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => 'Invalid JSON {',
      })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'password123',
      }

      await expect(login2FA(credentials)).rejects.toThrow('respuesta inválida')
    })

    it('debe manejar respuesta 403 desconocida', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => JSON.stringify({ unknown: true }),
      })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'password123',
      }

      await expect(login2FA(credentials)).rejects.toThrow('respuesta inválida')
    })
  })

  describe('login2FA - Fallback a login tradicional', () => {
    it('debe usar login tradicional cuando endpoint 404', async () => {
      const mockTradicionalResponse = {
        usuario: {
          id: 1,
          nombre: 'Test User',
          nombres: 'Test',
          apellidos: 'User',
          email: 'test@test.com',
          roles: ['ANALISTA'],
          usuarioID: 1,
        },
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockTradicionalResponse,
        })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'password123',
      }

      const result = await login2FA(credentials)
      expect('usuario' in result && result.usuario.has2FA).toBe(false)
      expect('mensaje' in result && result.mensaje).toBe('Login exitoso')
    })

    it('debe usar login tradicional en error de red', async () => {
      const mockTradicionalResponse = {
        usuario: {
          id: 1,
          nombre: 'Test',
          nombres: 'Test',
          apellidos: 'User',
          email: 'test@test.com',
          roles: ['ANALISTA'],
          usuarioID: 1,
        },
      }

      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('NetworkError'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTradicionalResponse,
        })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'password123',
      }

      const result = await login2FA(credentials)
      expect('usuario' in result && result.usuario.has2FA).toBe(false)
    })

    it('debe manejar error en login tradicional', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Credenciales incorrectas' }),
        })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'wrongpassword',
      }

      await expect(login2FA(credentials)).rejects.toThrow('Credenciales incorrectas')
    })

    it('debe manejar login tradicional con respuesta text', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => { throw new Error('Not JSON') },
          text: async () => 'Server error',
        })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'password123',
      }

      await expect(login2FA(credentials)).rejects.toThrow('Server error')
    })

    it('debe usar mensaje por defecto en login tradicional sin respuesta', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => { throw new Error('Not JSON') },
          text: async () => { throw new Error('No text') },
        })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'password123',
      }

      await expect(login2FA(credentials)).rejects.toThrow('Error de autenticación')
    })
  })

  describe('login2FA - Manejo de errores en respuestas', () => {
    it('debe manejar respuesta error vacía', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => '',
      })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'wrongpassword',
      }

      await expect(login2FA(credentials)).rejects.toThrow('sin respuesta')
    })

    it('debe manejar respuesta error con JSON inválido', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Plain text error',
      })

      const credentials: Login2FARequest = {
        usuario: 'test@test.com',
        password: 'password123',
      }

      await expect(login2FA(credentials)).rejects.toThrow('Plain text error')
    })
  })

  describe('forgotPassword - Casos de error adicionales', () => {
    it('debe manejar respuesta error vacía', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => '',
      })

      await expect(forgotPassword('test@test.com')).rejects.toThrow('sin respuesta')
    })

    it('debe manejar error con texto plano', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server error occurred',
      })

      await expect(forgotPassword('test@test.com')).rejects.toThrow('Server error occurred')
    })
  })

  describe('resetPassword - Mensajes de error personalizados', () => {
    it('debe personalizar mensaje de código de recuperación inválido', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'código de recuperación inválido' }),
      })

      await expect(resetPassword({
        email: 'test@test.com',
        recoveryCode: 'WRONG123',
        totpCode: '123456',
        newPassword: 'NewPass123!',
      })).rejects.toThrow('El código de recuperación es incorrecto')
    })

    it('debe personalizar mensaje de código expirado', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'El código ha expirado' }),
      })

      await expect(resetPassword({
        email: 'test@test.com',
        recoveryCode: 'ABCD1234',
        totpCode: '123456',
        newPassword: 'NewPass123!',
      })).rejects.toThrow('El código de recuperación ha expirado. Solicita uno nuevo.')
    })

    it('debe personalizar mensaje de código de autenticación inválido', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'código de autenticación inválido' }),
      })

      await expect(resetPassword({
        email: 'test@test.com',
        recoveryCode: 'ABCD1234',
        totpCode: '000000',
        newPassword: 'NewPass123!',
      })).rejects.toThrow('El código de Google Authenticator es incorrecto')
    })

    it('debe personalizar mensaje de contraseña débil', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'La contraseña es muy débil' }),
      })

      await expect(resetPassword({
        email: 'test@test.com',
        recoveryCode: 'ABCD1234',
        totpCode: '123456',
        newPassword: 'weak',
      })).rejects.toThrow('La contraseña debe tener mínimo 8 caracteres')
    })

    it('debe usar mensaje genérico si no coincide con patrones', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Error desconocido del servidor' }),
      })

      await expect(resetPassword({
        email: 'test@test.com',
        recoveryCode: 'ABCD1234',
        totpCode: '123456',
        newPassword: 'NewPass123!',
      })).rejects.toThrow('Error desconocido del servidor')
    })
  })

  describe('setupInitial2FA - Casos de error adicionales', () => {
    it('debe manejar respuesta error vacía', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => '',
      })

      await expect(setupInitial2FA('test@test.com', 'password')).rejects.toThrow('sin respuesta')
    })
  })

  describe('getBackupCodesCount - Casos de error adicionales', () => {
    it('debe manejar respuesta error vacía', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => '',
      })

      const { getBackupCodesCount } = require('@/app/services/auth-2fa-service')
      await expect(getBackupCodesCount()).rejects.toThrow('sin respuesta')
    })

    it('debe manejar error con texto plano', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'No autorizado',
      })

      const { getBackupCodesCount } = require('@/app/services/auth-2fa-service')
      await expect(getBackupCodesCount()).rejects.toThrow('No autorizado')
    })
  })

  describe('formatBackupCode - Casos edge', () => {
    it('debe formatear código de 4 dígitos', () => {
      const { formatBackupCode } = require('@/app/services/auth-2fa-service')
      expect(formatBackupCode('ABCD')).toBe('ABCD')
    })

    it('debe formatear código de 8 dígitos', () => {
      const { formatBackupCode } = require('@/app/services/auth-2fa-service')
      expect(formatBackupCode('ABCD5678')).toBe('ABCD-5678')
    })

    it('debe formatear código completo de 12 dígitos', () => {
      const { formatBackupCode } = require('@/app/services/auth-2fa-service')
      expect(formatBackupCode('ABCD56789012')).toBe('ABCD-5678-9012')
    })

    it('debe limpiar caracteres no permitidos', () => {
      const { formatBackupCode } = require('@/app/services/auth-2fa-service')
      expect(formatBackupCode('AB-CD-56_78')).toBe('ABCD-5678')
    })
  })

  describe('formatRecoveryCode - Casos edge', () => {
    it('debe formatear código corto', () => {
      const { formatRecoveryCode } = require('@/app/services/auth-2fa-service')
      expect(formatRecoveryCode('AB')).toBe('AB')
    })

    it('debe formatear código de 4 caracteres', () => {
      const { formatRecoveryCode } = require('@/app/services/auth-2fa-service')
      expect(formatRecoveryCode('ABCD')).toBe('ABCD')
    })

    it('debe limpiar caracteres no permitidos', () => {
      const { formatRecoveryCode } = require('@/app/services/auth-2fa-service')
      expect(formatRecoveryCode('AB-CD_12.34')).toBe('ABCD-1234')
    })
  })

  describe('validatePasswordStrength - Casos completos', () => {
    it('debe detectar criterios de validación individuales', () => {
      const { validatePasswordStrength } = require('@/app/services/auth-2fa-service')
      
      // Solo minúsculas
      const weak1 = validatePasswordStrength('abcdefgh')
      expect(weak1.strength).toBe('weak')
      expect(weak1.isValid).toBe(true)
      
      // Minúsculas + Mayúsculas
      const weak2 = validatePasswordStrength('Abcdefgh')
      expect(weak2.strength).toBe('weak')
      
      // Minúsculas + números
      const weak3 = validatePasswordStrength('abcdef12')
      expect(weak3.strength).toBe('weak')
    })

    it('debe detectar contraseña con 3 criterios (medium)', () => {
      const { validatePasswordStrength } = require('@/app/services/auth-2fa-service')
      
      // Minúsculas + Mayúsculas + números
      const medium = validatePasswordStrength('Password123')
      expect(medium.strength).toBe('medium')
      expect(medium.message).toBe('Contraseña aceptable')
    })

    it('debe detectar contraseña con 4 criterios (strong)', () => {
      const { validatePasswordStrength } = require('@/app/services/auth-2fa-service')
      
      // Minúsculas + Mayúsculas + números + símbolos
      const strong = validatePasswordStrength('Password123!')
      expect(strong.strength).toBe('strong')
      expect(strong.message).toBe('Contraseña fuerte')
    })

    it('debe validar diferentes caracteres especiales', () => {
      const { validatePasswordStrength } = require('@/app/services/auth-2fa-service')
      
      expect(validatePasswordStrength('Pass123@').strength).toBe('strong')
      expect(validatePasswordStrength('Pass123#').strength).toBe('strong')
      expect(validatePasswordStrength('Pass123$').strength).toBe('strong')
      expect(validatePasswordStrength('Pass123%').strength).toBe('strong')
    })
  })

  describe('completeAdminSetup - Casos de error', () => {
    it('debe manejar error sin mensaje', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({}),
      })

      const { completeAdminSetup } = require('@/app/services/auth-2fa-service')
      await expect(completeAdminSetup({
        currentPassword: 'temp',
        newEmail: 'admin@test.com',
        newPassword: 'NewPass123!',
        totpCode: '123456',
      })).rejects.toThrow('Error al completar configuración')
    })
  })

  describe('Validación de códigos - Casos adicionales', () => {
    it('validateBackupCodeFormat - debe permitir minúsculas', () => {
      const { validateBackupCodeFormat } = require('@/app/services/auth-2fa-service')
      expect(validateBackupCodeFormat('abcd5678wxyz')).toBe(true)
    })

    it('validateRecoveryCodeFormat - debe permitir minúsculas', () => {
      const { validateRecoveryCodeFormat } = require('@/app/services/auth-2fa-service')
      expect(validateRecoveryCodeFormat('abcd1234')).toBe(true)
      expect(validateRecoveryCodeFormat('abcd-1234')).toBe(true)
    })

    it('validateBackupCodeFormat - debe rechazar longitud incorrecta', () => {
      const { validateBackupCodeFormat } = require('@/app/services/auth-2fa-service')
      expect(validateBackupCodeFormat('ABCD5678')).toBe(false) // Muy corto
      expect(validateBackupCodeFormat('ABCD5678WXYZ1')).toBe(false) // Muy largo
    })

    it('validateRecoveryCodeFormat - debe rechazar longitud incorrecta', () => {
      const { validateRecoveryCodeFormat } = require('@/app/services/auth-2fa-service')
      expect(validateRecoveryCodeFormat('ABCD12')).toBe(false) // Muy corto
      expect(validateRecoveryCodeFormat('ABCD12345')).toBe(false) // Muy largo
    })
  })
})
