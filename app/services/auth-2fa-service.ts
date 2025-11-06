/**
 * Servicio de Autenticación con 2FA
 * 
 * Maneja todas las operaciones relacionadas con autenticación de dos factores:
 * - Login con soporte 2FA
 * - Recuperación de contraseña
 * - Reset de contraseña con doble verificación
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ===== TIPOS Y INTERFACES =====

export interface Login2FARequest {
  usuario: string;
  password: string;
  totpCode?: string;
  deviceFingerprint?: string;
  trustDevice?: boolean;
}

export interface Login2FAResponse {
  mensaje: string;
  usuario: {
    id: number;
    nombre: string;
    nombres: string;
    apellidos: string;
    email: string;
    roles: string[];
    has2FA: boolean;
  };
}

export interface Requires2FAResponse {
  requires2FA: boolean;
  mensaje: string;
  userId: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  mensaje: string;
}

export interface ResetPasswordRequest {
  email: string;
  recoveryCode: string;
  totpCode: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  mensaje: string;
}

export interface ErrorResponse {
  error: string;
}

// ===== FUNCIONES DEL SERVICIO =====

/**
 * Login con soporte para autenticación de dos factores
 * 
 * Flujo:
 * 1. Si el usuario NO tiene 2FA → Login directo
 * 2. Si el usuario tiene 2FA + dispositivo de confianza → Login directo
 * 3. Si el usuario tiene 2FA + dispositivo nuevo → Requiere código TOTP
 * 
 * @param credentials Credenciales de login con datos opcionales de 2FA
 * @returns Datos del usuario o respuesta requiriendo 2FA
 * @throws Error si las credenciales son incorrectas o el código 2FA es inválido
 */
export async function login2FA(
  credentials: Login2FARequest
): Promise<Login2FAResponse | Requires2FAResponse> {
  console.log('🔐 [Auth2FA] Iniciando login con 2FA...');
  console.log('📧 [Auth2FA] Usuario:', credentials.usuario);
  console.log('🔑 [Auth2FA] Tiene código TOTP:', !!credentials.totpCode);
  console.log('📱 [Auth2FA] Tiene fingerprint:', !!credentials.deviceFingerprint);
  
  // Intentar primero con el endpoint nuevo de 2FA
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', // CRÍTICO: permite recibir cookies HttpOnly
      body: JSON.stringify(credentials),
    });

    console.log('📡 [Auth2FA] Status de respuesta:', response.status);

    // Respuesta exitosa (200)
    if (response.ok) {
      const data: Login2FAResponse = await response.json();
      console.log('✅ [Auth2FA] Login exitoso');
      console.log('👤 [Auth2FA] Usuario:', data.usuario.nombre);
      console.log('🔐 [Auth2FA] Tiene 2FA habilitado:', data.usuario.has2FA);
      return data;
    }

    // Requiere código 2FA (403)
    if (response.status === 403) {
      const responseText = await response.text();
      console.log('📄 [Auth2FA] Respuesta 403:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.error('❌ [Auth2FA] Respuesta vacía del backend en 403');
        throw new Error('Error del servidor: respuesta vacía. Verifica que el backend tenga el endpoint /api/v1/auth/login-2fa implementado correctamente.');
      }
      
      try {
        const data: Requires2FAResponse = JSON.parse(responseText);
        console.log('🔐 [Auth2FA] Se requiere código 2FA');
        console.log('👤 [Auth2FA] User ID:', data.userId);
        return data;
      } catch (parseError) {
        console.error('❌ [Auth2FA] Error parseando JSON 403:', parseError);
        throw new Error('Error del servidor: respuesta inválida');
      }
    }

    // Si es 404, el endpoint no existe, usar fallback
    if (response.status === 404) {
      console.warn('⚠️ [Auth2FA] Endpoint /api/v1/auth/login-2fa no encontrado, usando login tradicional');
      return await loginTradicional(credentials.usuario, credentials.password);
    }

    // Error de autenticación (401) o cualquier otro error
    const responseText = await response.text();
    console.log('📄 [Auth2FA] Respuesta error:', responseText);
    
    if (!responseText || responseText.trim() === '') {
      throw new Error(`Error del servidor (${response.status}): sin respuesta`);
    }
    
    try {
      const errorData: ErrorResponse = JSON.parse(responseText);
      console.error('❌ [Auth2FA] Error:', errorData.error);
      throw new Error(errorData.error || 'Error de autenticación');
    } catch (parseError) {
      console.error('❌ [Auth2FA] Error parseando respuesta:', parseError);
      throw new Error(responseText || 'Error de autenticación');
    }
  } catch (error: any) {
    // Si es error de red o endpoint no disponible, usar login tradicional
    if (error.message?.includes('fetch') || error.message?.includes('NetworkError')) {
      console.warn('⚠️ [Auth2FA] Error de red, intentando login tradicional');
      return await loginTradicional(credentials.usuario, credentials.password);
    }
    throw error;
  }
}

/**
 * Login tradicional (fallback cuando endpoint 2FA no está disponible)
 */
async function loginTradicional(usuario: string, password: string): Promise<Login2FAResponse> {
  console.log('🔄 [Auth2FA] Usando login tradicional');
  
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ usuario, password }),
  });

  if (!response.ok) {
    let errorMessage = 'Error de autenticación';
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      try {
        errorMessage = await response.text();
      } catch {
        // Usar mensaje por defecto
      }
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Transformar respuesta al formato esperado
  return {
    mensaje: 'Login exitoso',
    usuario: {
      id: data.usuario.id || data.usuario.usuarioID,
      nombre: data.usuario.nombre,
      nombres: data.usuario.nombres,
      apellidos: data.usuario.apellidos,
      email: data.usuario.email,
      roles: data.usuario.roles || [],
      has2FA: false, // Login tradicional no tiene 2FA
    },
  };
}

/**
 * Solicita un código de recuperación de contraseña
 * 
 * El backend:
 * 1. Verifica que el email exista y tenga 2FA habilitado
 * 2. Genera un código de 8 caracteres (formato: XXXX-XXXX)
 * 3. Hashea el código con BCrypt y lo guarda en BD
 * 4. Envía el código por email (validez: 10 minutos)
 * 
 * @param email Email del usuario
 * @returns Mensaje de confirmación
 * @throws Error si el email no existe o el usuario no tiene 2FA habilitado
 */
export async function forgotPassword(
  email: string
): Promise<ForgotPasswordResponse> {
  console.log('📧 [Auth2FA] Solicitando código de recuperación para:', email);
  
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });

  console.log('📡 [Auth2FA] Status de respuesta:', response.status);

  if (response.ok) {
    const data: ForgotPasswordResponse = await response.json();
    console.log('✅ [Auth2FA] Código de recuperación enviado');
    console.log('📨 [Auth2FA]', data.mensaje);
    return data;
  }

  // Error - manejar respuesta vacía
  const responseText = await response.text();
  console.log('📄 [Auth2FA] Respuesta error:', responseText);
  
  if (!responseText || responseText.trim() === '') {
    throw new Error(`Error del servidor (${response.status}): sin respuesta`);
  }
  
  try {
    const errorData: ErrorResponse = JSON.parse(responseText);
    console.error('❌ [Auth2FA] Error:', errorData.error);
    throw new Error(errorData.error || 'Error al solicitar código de recuperación');
  } catch (parseError) {
    console.error('❌ [Auth2FA] Error parseando respuesta:', parseError);
    throw new Error(responseText || 'Error al solicitar código de recuperación');
  }
}

/**
 * Resetea la contraseña usando código de recuperación + código Google Authenticator
 * 
 * Requiere:
 * - Código de recuperación enviado por email (10 min de validez)
 * - Código TOTP de Google Authenticator (6 dígitos)
 * - Nueva contraseña (mínimo 8 caracteres)
 * 
 * El backend:
 * 1. Valida el código de recuperación (BCrypt compare)
 * 2. Verifica que no haya expirado
 * 3. Valida el código TOTP
 * 4. Cambia la contraseña (BCrypt hash)
 * 5. **REVOCA TODOS los dispositivos de confianza** (seguridad)
 * 6. Limpia el código de recuperación de la BD
 * 
 * @param data Datos de reset (email, códigos, nueva password)
 * @returns Mensaje de confirmación
 * @throws Error si los códigos son inválidos, expirados o la contraseña es débil
 */
export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  console.log('🔐 [Auth2FA] Reseteando contraseña para:', data.email);
  console.log('🔑 [Auth2FA] Código de recuperación:', data.recoveryCode.substring(0, 4) + '****');
  console.log('🔐 [Auth2FA] Código TOTP proporcionado:', !!data.totpCode);
  
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  console.log('📡 [Auth2FA] Status de respuesta:', response.status);

  if (response.ok) {
    const result: ResetPasswordResponse = await response.json();
    console.log('✅ [Auth2FA] Contraseña actualizada exitosamente');
    console.log('🔒 [Auth2FA] Todos los dispositivos de confianza fueron revocados');
    return result;
  }

  // Error
  const errorData: ErrorResponse = await response.json();
  console.error('❌ [Auth2FA] Error:', errorData.error);
  
  // Personalizar mensajes de error
  let errorMessage = errorData.error || 'Error al resetear contraseña';
  
  if (errorMessage.includes('código de recuperación inválido')) {
    errorMessage = 'El código de recuperación es incorrecto';
  } else if (errorMessage.includes('expirado')) {
    errorMessage = 'El código de recuperación ha expirado. Solicita uno nuevo.';
  } else if (errorMessage.includes('código de autenticación inválido')) {
    errorMessage = 'El código de Google Authenticator es incorrecto';
  } else if (errorMessage.includes('contraseña')) {
    errorMessage = 'La contraseña debe tener mínimo 8 caracteres';
  }
  
  throw new Error(errorMessage);
}

/**
 * Valida el formato de un código TOTP (6 dígitos numéricos)
 * 
 * @param code Código a validar
 * @returns true si el formato es válido
 */
export function validateTotpCodeFormat(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * Valida el formato de un código de recuperación (formato: XXXX-XXXX o XXXXXXXX)
 * 
 * @param code Código a validar
 * @returns true si el formato es válido
 */
export function validateRecoveryCodeFormat(code: string): boolean {
  // Permitir con o sin guión
  const cleanCode = code.replace(/-/g, '');
  return /^[A-Z0-9]{8}$/i.test(cleanCode);
}

/**
 * Formatea un código de recuperación al formato XXXX-XXXX
 * 
 * @param code Código sin formato
 * @returns Código formateado
 */
export function formatRecoveryCode(code: string): string {
  const cleanCode = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  if (cleanCode.length > 4) {
    return `${cleanCode.substring(0, 4)}-${cleanCode.substring(4, 8)}`;
  }
  
  return cleanCode;
}

/**
 * Valida fortaleza de contraseña
 * 
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula (recomendado)
 * - Al menos un número (recomendado)
 * 
 * @param password Contraseña a validar
 * @returns Objeto con validación y mensaje
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      strength: 'weak',
      message: 'La contraseña debe tener mínimo 8 caracteres',
    };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const criteriaCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
  
  if (criteriaCount <= 2) {
    return {
      isValid: true,
      strength: 'weak',
      message: 'Contraseña débil. Considera agregar mayúsculas, números o símbolos.',
    };
  }
  
  if (criteriaCount === 3) {
    return {
      isValid: true,
      strength: 'medium',
      message: 'Contraseña aceptable',
    };
  }
  
  return {
    isValid: true,
    strength: 'strong',
    message: 'Contraseña fuerte',
  };
}
