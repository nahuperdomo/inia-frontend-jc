import { apiFetch } from '@/lib/api-client'

// Mock de fetch global
global.fetch = jest.fn()

describe('API Client Tests', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()
    // Limpiar cookies
    document.cookie = ''
  })

  describe('GET Requests', () => {
    it('debe hacer una petición GET exitosa', async () => {
      // Arrange
      const mockData = { id: 1, nombre: 'Test Lote' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      } as Response)

      // Act
      const result = await apiFetch('/lotes/1')

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/lotes/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockData)
    })

    it('debe manejar errores 404', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Not Found' }),
      } as Response)

      // Act & Assert
      await expect(apiFetch('/lotes/999', { skipErrorHandling: true }))
        .rejects.toMatchObject({
          status: 404,
          message: 'Not Found'
        })
    })
  })

  describe('POST Requests', () => {
    it('debe hacer una petición POST exitosa', async () => {
      // Arrange
      const newLote = { codigo: 'L001', especie: 'Trigo' }
      const mockResponse = { id: 1, ...newLote }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      } as Response)

      // Act
      const result = await apiFetch('/lotes', {
        method: 'POST',
        body: JSON.stringify(newLote),
      })

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/lotes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newLote),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('debe manejar errores de validación (400)', async () => {
      // Arrange
      const invalidData = { codigo: '' }
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ 
          message: 'Validación fallida',
          errors: ['Código es requerido'] 
        }),
      } as Response)

      // Act & Assert
      await expect(apiFetch('/lotes', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        skipErrorHandling: true,
      })).rejects.toMatchObject({
        status: 400,
        errors: ['Código es requerido']
      })
    })
  })

  describe('Authentication & Authorization', () => {
    it('debe incluir el token de autorización en headers', async () => {
      // Arrange
      const mockToken = 'mock-jwt-token'
      document.cookie = `token=${mockToken}`
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      } as Response)

      // Act
      await apiFetch('/protected-route')

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      )
    })

    it('debe manejar errores 401 (Unauthorized)', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Unauthorized' }),
      } as Response)

      // Act & Assert
      await expect(apiFetch('/protected-route', { skipErrorHandling: true }))
        .rejects.toMatchObject({
          status: 401,
          message: 'Unauthorized'
        })
    })

    it('debe manejar errores 403 (Forbidden)', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Forbidden' }),
      } as Response)

      // Act & Assert
      await expect(apiFetch('/admin-route', { skipErrorHandling: true }))
        .rejects.toMatchObject({
          status: 403,
          message: 'Forbidden'
        })
    })
  })

  describe('Error Handling', () => {
    it('debe manejar errores de servidor (500)', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Internal Server Error' }),
      } as Response)

      // Act & Assert
      await expect(apiFetch('/error-endpoint', { skipErrorHandling: true }))
        .rejects.toMatchObject({
          status: 500,
          message: 'Internal Server Error'
        })
    })

    it('debe manejar errores de red', async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      // Act & Assert
      await expect(apiFetch('/any-route', { skipErrorHandling: true }))
        .rejects.toThrow('Network Error')
    })
  })
})
