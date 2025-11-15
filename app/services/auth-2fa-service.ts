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

export interface Requires2FASetupResponse {
  requires2FASetup: boolean;
  mensaje: string;
  userId: number;
  email: string;
  nombre: string;
}

export interface RequiresCredentialChangeResponse {
  requiresCredentialChange: boolean;
  mensaje: string;
  setupToken: string;  // Solo el token, no los datos sensibles
}

export interface AdminSetupData {
  userId: number;
  nombre: string;
  qrCodeDataUrl: string;
  totpSecret: string;
}

export interface CompleteAdminSetupRequest {
  currentPassword: string;
  newEmail: string;
  newPassword: string;
  totpCode: string;
}

export interface CompleteAdminSetupResponse {
  mensaje: string;
  backupCodes: string[];
  totalCodes: number;
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

export interface BackupCodesResponse {
  mensaje: string;
  backupCodes: string[];
  totalCodes: number;
}

export interface BackupCodesCountResponse {
  availableCodes: number;
  warning?: string;
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
 * 4. Si es admin con credenciales temporales → Requiere cambio de credenciales
 *
 * @param credentials Credenciales de login con datos opcionales de 2FA
 * @returns Datos del usuario o respuesta requiriendo 2FA/setup/cambio de credenciales
 * @throws Error si las credenciales son incorrectas o el código 2FA es inválido
 */
export async function login2FA(
  credentials: Login2FARequest
): Promise<Login2FAResponse | Requires2FAResponse | Requires2FASetupResponse | RequiresCredentialChangeResponse> {  // Intentar primero con el endpoint nuevo de 2FA
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', // CRÍTICO: permite recibir cookies HttpOnly
      body: JSON.stringify(credentials),
    });    // Respuesta exitosa (200)
    if (response.ok) {
      const data: Login2FAResponse = await response.json();      return data;
    }

    // Requiere código 2FA o cambio de credenciales (403)
    if (response.status === 403) {
      const responseText = await response.text();      if (!responseText || responseText.trim() === '') {
        console.error('❌ [Auth2FA] Respuesta vacía del backend en 403');
        throw new Error('Error del servidor: respuesta vacía. Verifica que el backend tenga el endpoint /api/v1/auth/login-2fa implementado correctamente.');
      }

      try {
        const data = JSON.parse(responseText);

        // Verificar si requiere cambio de credenciales (admin first-login)
        if ('requiresCredentialChange' in data && data.requiresCredentialChange) {');          return data as RequiresCredentialChangeResponse;
        }

        // Verificar si requiere setup de 2FA
        if ('requires2FASetup' in data && data.requires2FASetup) {          return data as Requires2FASetupResponse;
        }

        // Verificar si requiere código 2FA
        if ('requires2FA' in data && data.requires2FA) {          return data as Requires2FAResponse;
        }

        // Si no coincide con ningún tipo conocido
        console.error('❌ [Auth2FA] Respuesta 403 desconocida:', data);
        throw new Error('Respuesta inesperada del servidor');
      } catch (parseError) {
        console.error('❌ [Auth2FA] Error parseando JSON 403:', parseError);
        throw new Error('Error del servidor: respuesta inválida');
      }
    }
    if (response.status === 404) {
      console.warn('⚠️ [Auth2FA] Endpoint /api/v1/auth/login-2fa no encontrado, usando login tradicional');
      return await loginTradicional(credentials.usuario, credentials.password);
    }

    // Error de autenticación (401) o cualquier otro error
    const responseText = await response.text();    if (!responseText || responseText.trim() === '') {
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
async function loginTradicional(usuario: string, password: string): Promise<Login2FAResponse> {  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
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
): Promise<ForgotPasswordResponse> {  const response = await fetch(`${API_BASE_URL}/api/v1/auth/recuperar-contrasena`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });  if (response.ok) {
    const data: ForgotPasswordResponse = await response.json();    return data;
  }

  // Error - manejar respuesta vacía
  const responseText = await response.text();  if (!responseText || responseText.trim() === '') {
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
): Promise<ResetPasswordResponse> { + '****');  const response = await fetch(`${API_BASE_URL}/api/v1/auth/restablecer-contrasena`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });  if (response.ok) {
    const result: ResetPasswordResponse = await response.json();    return result;
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
 * Setup inicial de 2FA (para usuarios sin autenticación)
 * Se usa cuando el usuario DEBE activar 2FA obligatoriamente
 *
 * @param email Email del usuario
 * @param password Contraseña del usuario
 * @returns Datos para configurar Google Authenticator
 */
export async function setupInitial2FA(
  email: string,
  password: string
): Promise<{
  mensaje: string;
  data: {
    secret: string;
    qrCodeDataUrl: string;
    issuer: string;
    accountName: string;
  };
  userId: number;
  email: string;
}> {  const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/setup-initial`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });  if (response.ok) {
    const data = await response.json();    return data;
  }

  // Error
  const responseText = await response.text();  if (!responseText || responseText.trim() === '') {
    throw new Error(`Error del servidor (${response.status}): sin respuesta`);
  }

  try {
    const errorData: ErrorResponse = JSON.parse(responseText);
    console.error('❌ [Auth2FA] Error:', errorData.error);
    throw new Error(errorData.error || 'Error al iniciar setup 2FA');
  } catch (parseError) {
    console.error('❌ [Auth2FA] Error parseando respuesta:', parseError);
    throw new Error(responseText || 'Error al iniciar setup 2FA');
  }
}

/**
 * Verificar código TOTP inicial y activar 2FA (con login automático)
 *
 * @param email Email del usuario
 * @param totpCode Código TOTP de 6 dígitos
 * @returns Datos de usuario autenticado + códigos de respaldo
 */
export async function verifyInitial2FA(
  email: string,
  totpCode: string
): Promise<{
  mensaje: string;
  totpEnabled: boolean;
  backupCodes: string[];
  totalCodes: number;
  usuario: {
    id: number;
    nombre: string;
    nombres: string;
    apellidos: string;
    email: string;
    roles: string[];
    has2FA: boolean;
  };
}> {  const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/verify-initial`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, totpCode }),
  });  if (response.ok) {
    const data = await response.json();    return data;
  }

  // Error
  const responseText = await response.text();  if (!responseText || responseText.trim() === '') {
    throw new Error(`Error del servidor (${response.status}): sin respuesta`);
  }

  try {
    const errorData: ErrorResponse = JSON.parse(responseText);
    console.error('❌ [Auth2FA] Error:', errorData.error);
    throw new Error(errorData.error || 'Error al verificar código');
  } catch (parseError) {
    console.error('❌ [Auth2FA] Error parseando respuesta:', parseError);
    throw new Error(responseText || 'Error al verificar código');
  }
}

/**
 * Regenera los códigos de respaldo del usuario
 *
 * Requiere:
 * - Usuario autenticado con 2FA habilitado
 * - Código TOTP válido para confirmación
 *
 * El backend:
 * 1. Verifica código TOTP
 * 2. Invalida todos los códigos antiguos
 * 3. Genera 10 nuevos códigos de respaldo
 * 4. Retorna los códigos EN TEXTO PLANO (solo se muestran una vez)
 *
 * @param totpCode Código TOTP para confirmar la operación
 * @returns Nuevos códigos de respaldo
 * @throws Error si el código TOTP es inválido o no tiene 2FA habilitado
 */
export async function regenerateBackupCodes(
  totpCode: string
): Promise<BackupCodesResponse> {  const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/backup-codes/regenerate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include', // CRÍTICO: enviar cookies JWT
    body: JSON.stringify({ totpCode }),
  });  if (response.ok) {
    const data: BackupCodesResponse = await response.json();    return data;
  }

  // Error
  const responseText = await response.text();  if (!responseText || responseText.trim() === '') {
    throw new Error(`Error del servidor (${response.status}): sin respuesta`);
  }

  try {
    const errorData: ErrorResponse = JSON.parse(responseText);
    console.error('❌ [Auth2FA] Error:', errorData.error);
    throw new Error(errorData.error || 'Error al regenerar códigos de respaldo');
  } catch (parseError) {
    console.error('❌ [Auth2FA] Error parseando respuesta:', parseError);
    throw new Error(responseText || 'Error al regenerar códigos de respaldo');
  }
}

/**
 * Obtiene el conteo de códigos de respaldo disponibles
 *
 * Requiere:
 * - Usuario autenticado
 *
 * @returns Cantidad de códigos disponibles (no usados) y advertencias
 */
export async function getBackupCodesCount(): Promise<BackupCodesCountResponse> {  const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/backup-codes/count`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include', // CRÍTICO: enviar cookies JWT
  });  if (response.ok) {
    const data: BackupCodesCountResponse = await response.json();    if (data.warning) {
      console.warn('⚠️ [Auth2FA]', data.warning);
    }
    return data;
  }

  // Error
  const responseText = await response.text();  if (!responseText || responseText.trim() === '') {
    throw new Error(`Error del servidor (${response.status}): sin respuesta`);
  }

  try {
    const errorData: ErrorResponse = JSON.parse(responseText);
    console.error('❌ [Auth2FA] Error:', errorData.error);
    throw new Error(errorData.error || 'Error al obtener conteo de códigos');
  } catch (parseError) {
    console.error('❌ [Auth2FA] Error parseando respuesta:', parseError);
    throw new Error(responseText || 'Error al obtener conteo de códigos');
  }
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
 * Valida el formato de un código de respaldo (formato: XXXX-XXXX-XXXX o 12 caracteres)
 *
 * @param code Código a validar
 * @returns true si el formato es válido
 */
export function validateBackupCodeFormat(code: string): boolean {
  // Permitir con o sin guiones
  const cleanCode = code.replace(/-/g, '');
  return /^[A-Z0-9]{12}$/i.test(cleanCode);
}

/**
 * Formatea un código de respaldo al formato XXXX-XXXX-XXXX
 *
 * @param code Código sin formato
 * @returns Código formateado
 */
export function formatBackupCode(code: string): string {
  const cleanCode = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();

  if (cleanCode.length > 8) {
    return `${cleanCode.substring(0, 4)}-${cleanCode.substring(4, 8)}-${cleanCode.substring(8, 12)}`;
  } else if (cleanCode.length > 4) {
    return `${cleanCode.substring(0, 4)}-${cleanCode.substring(4)}`;
  }

  return cleanCode;
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
  // Requisito 1: Mínimo 8 caracteres
  if (password.length < 8) {
    return {
      isValid: false,
      strength: 'weak',
      message: 'Mínimo 8 caracteres',
    };
  }

  // Requisito 2: Al menos una letra
  const hasLetter = /[a-zA-Z]/.test(password);

  // Requisito 3: Al menos un número
  const hasNumber = /\d/.test(password);

  // Validar requisitos obligatorios
  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      strength: 'weak',
      message: 'Debe contener al menos una letra y un número',
    };
  }

  // Criterios opcionales para medir fortaleza
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLong = password.length >= 12;

  const bonusCriteria = [hasUpperCase && hasLowerCase, hasSpecialChar, isLong].filter(Boolean).length;

  if (bonusCriteria === 0) {
    return {
      isValid: true,
      strength: 'weak',
      message: 'Contraseña débil',
    };
  }

  if (bonusCriteria === 1 || bonusCriteria === 2) {
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

/**
 * Completar configuración inicial del admin
 * Permite al admin cambiar sus credenciales temporales y activar 2FA
 *
 * @param data Datos de configuración (contraseña actual, nuevo email, nueva contraseña, código TOTP)
 * @returns Datos del usuario y códigos de respaldo
 * @throws Error si la configuración falla
 */
export async function completeAdminSetup(
  data: CompleteAdminSetupRequest
): Promise<CompleteAdminSetupResponse> {  const response = await fetch(`${API_BASE_URL}/api/v1/auth/admin/complete-setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });  if (response.ok) {
    const result: CompleteAdminSetupResponse = await response.json();    return result;
  }

  // Error
  const errorData: ErrorResponse = await response.json();
  console.error('❌ [Auth2FA] Error:', errorData.error);
  throw new Error(errorData.error || 'Error al completar configuración');
}

/**
 * Obtener datos de configuración usando token temporal
 * El token es de un solo uso y expira en 5 minutos
 *
 * @param token Token temporal recibido del login
 * @returns Datos necesarios para la configuración (QR, secret, etc.)
 * @throws Error si el token es inválido o expirado
 */
export async function getAdminSetupData(token: string): Promise<AdminSetupData> {  const response = await fetch(`${API_BASE_URL}/api/v1/auth/admin/setup-data/${token}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });  if (response.ok) {
    const data: AdminSetupData = await response.json();    return data;
  }

  // Error
  const errorData: ErrorResponse = await response.json();
  console.error('❌ [Auth2FA] Error:', errorData.error);
  throw new Error(errorData.error || 'Token inválido o expirado');
}
