

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


export async function login2FA(
  credentials: Login2FARequest
): Promise<Login2FAResponse | Requires2FAResponse | Requires2FASetupResponse | RequiresCredentialChangeResponse> {


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
    // Respuesta exitosa (200)
    if (response.ok) {
      const data: Login2FAResponse = await response.json();
      return data;
    }

    // Requiere código 2FA o cambio de credenciales (403)
    if (response.status === 403) {
      const responseText = await response.text();

      if (!responseText || responseText.trim() === '') {
        throw new Error('Error del servidor: respuesta vacía. Verifica que el backend tenga el endpoint /api/v1/auth/login-2fa implementado correctamente.');
      }

      try {
        const data = JSON.parse(responseText);

        // Verificar si requiere cambio de credenciales (admin first-login)
        if ('requiresCredentialChange' in data && data.requiresCredentialChange) {
          return data as RequiresCredentialChangeResponse;
        }

        // Verificar si requiere setup de 2FA
        if ('requires2FASetup' in data && data.requires2FASetup) {
          return data as Requires2FASetupResponse;
        }

        // Verificar si requiere código 2FA
        if ('requires2FA' in data && data.requires2FA) {
          return data as Requires2FAResponse;
        }

        // Si no coincide con ningún tipo conocido
        throw new Error('Respuesta inesperada del servidor');
      } catch (parseError) {
        throw new Error('Error del servidor: respuesta inválida');
      }
    }

    // Si es 404, el endpoint no existe, usar fallback
    if (response.status === 404) {
      console.warn(' [Auth2FA] Endpoint /api/v1/auth/login-2fa no encontrado, usando login tradicional');
      return await loginTradicional(credentials.usuario, credentials.password);
    }

    // Error de autenticación (401) o cualquier otro error
    const responseText = await response.text();
    if (!responseText || responseText.trim() === '') {
      throw new Error(`Error del servidor (${response.status}): sin respuesta`);
    }

    try {
      const errorData: ErrorResponse = JSON.parse(responseText);
      console.error(' [Auth2FA] Error:', errorData.error);
      throw new Error(errorData.error || 'Error de autenticación');
    } catch (parseError) {
      console.error(' [Auth2FA] Error parseando respuesta:', parseError);
      throw new Error(responseText || 'Error de autenticación');
    }
  } catch (error: any) {
    // Si es error de red o endpoint no disponible, usar login tradicional
    if (error.message?.includes('fetch') || error.message?.includes('NetworkError')) {
      console.warn(' [Auth2FA] Error de red, intentando login tradicional');
      return await loginTradicional(credentials.usuario, credentials.password);
    }
    throw error;
  }
}


async function loginTradicional(usuario: string, password: string): Promise<Login2FAResponse> {

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


export async function forgotPassword(
  email: string
): Promise<ForgotPasswordResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/recuperar-contrasena`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  if (response.ok) {
    const data: ForgotPasswordResponse = await response.json();
    return data;
  }

  // Error - manejar respuesta vacía
  const responseText = await response.text();
  if (!responseText || responseText.trim() === '') {
    throw new Error(`Error del servidor (${response.status}): sin respuesta`);
  }

  try {
    const errorData: ErrorResponse = JSON.parse(responseText);
    throw new Error(errorData.error || 'Error al solicitar código de recuperación');
  } catch (parseError) {
    throw new Error(responseText || 'Error al solicitar código de recuperación');
  }
}


export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/restablecer-contrasena`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (response.ok) {
    const result: ResetPasswordResponse = await response.json();
    return result;
  }

  // Error
  const errorData: ErrorResponse = await response.json();
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
}> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/setup-initial`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  }

  // Error
  const responseText = await response.text();

  if (!responseText || responseText.trim() === '') {
    throw new Error(`Error del servidor (${response.status}): sin respuesta`);
  }

  try {
    const errorData: ErrorResponse = JSON.parse(responseText);
    console.error(' [Auth2FA] Error:', errorData.error);
    throw new Error(errorData.error || 'Error al iniciar setup 2FA');
  } catch (parseError) {
    console.error(' [Auth2FA] Error parseando respuesta:', parseError);
    throw new Error(responseText || 'Error al iniciar setup 2FA');
  }
}


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
}> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/verify-initial`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, totpCode }),
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  }

  // Error
  const responseText = await response.text();
  if (!responseText || responseText.trim() === '') {
    throw new Error(`Error del servidor (${response.status}): sin respuesta`);
  }

  try {
    const errorData: ErrorResponse = JSON.parse(responseText);
    console.error(' [Auth2FA] Error:', errorData.error);
    throw new Error(errorData.error || 'Error al verificar código');
  } catch (parseError) {
    console.error(' [Auth2FA] Error parseando respuesta:', parseError);
    throw new Error(responseText || 'Error al verificar código');
  }
}


export async function regenerateBackupCodes(
  totpCode: string
): Promise<BackupCodesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/backup-codes/regenerate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify({ totpCode }),
  });


  if (response.ok) {
    const data: BackupCodesResponse = await response.json();
    return data;
  }

  // Error
  const responseText = await response.text();

  if (!responseText || responseText.trim() === '') {
    throw new Error(`Error del servidor (${response.status}): sin respuesta`);
  }

  try {
    const errorData: ErrorResponse = JSON.parse(responseText);
    console.error(' [Auth2FA] Error:', errorData.error);
    throw new Error(errorData.error || 'Error al regenerar códigos de respaldo');
  } catch (parseError) {
    console.error(' [Auth2FA] Error parseando respuesta:', parseError);
    throw new Error(responseText || 'Error al regenerar códigos de respaldo');
  }
}


export async function getBackupCodesCount(): Promise<BackupCodesCountResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/backup-codes/count`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include', 
  });
  if (response.ok) {
    const data: BackupCodesCountResponse = await response.json();
    if (data.warning) {
      console.warn(' [Auth2FA]', data.warning);
    }
    return data;
  }

  // Error
  const responseText = await response.text();
  if (!responseText || responseText.trim() === '') {
    throw new Error(`Error del servidor (${response.status}): sin respuesta`);
  }

  try {
    const errorData: ErrorResponse = JSON.parse(responseText);
    throw new Error(errorData.error || 'Error al obtener conteo de códigos');
  } catch (parseError) {
    throw new Error(responseText || 'Error al obtener conteo de códigos');
  }
}


export function validateTotpCodeFormat(code: string): boolean {
  return /^\d{6}$/.test(code);
}


export function validateBackupCodeFormat(code: string): boolean {
  // Permitir con o sin guiones
  const cleanCode = code.replace(/-/g, '');
  return /^[A-Z0-9]{12}$/i.test(cleanCode);
}


export function formatBackupCode(code: string): string {
  const cleanCode = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();

  if (cleanCode.length > 8) {
    return `${cleanCode.substring(0, 4)}-${cleanCode.substring(4, 8)}-${cleanCode.substring(8, 12)}`;
  } else if (cleanCode.length > 4) {
    return `${cleanCode.substring(0, 4)}-${cleanCode.substring(4)}`;
  }

  return cleanCode;
}


export function validateRecoveryCodeFormat(code: string): boolean {
  // Permitir con o sin guión
  const cleanCode = code.replace(/-/g, '');
  return /^[A-Z0-9]{8}$/i.test(cleanCode);
}


export function formatRecoveryCode(code: string): string {
  const cleanCode = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();

  if (cleanCode.length > 4) {
    return `${cleanCode.substring(0, 4)}-${cleanCode.substring(4, 8)}`;
  }

  return cleanCode;
}


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


export async function completeAdminSetup(
  data: CompleteAdminSetupRequest
): Promise<CompleteAdminSetupResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/admin/complete-setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });


  if (response.ok) {
    const result: CompleteAdminSetupResponse = await response.json();
    return result;
  }

  // Error
  const errorData: ErrorResponse = await response.json();
  console.error(' [Auth2FA] Error:', errorData.error);
  throw new Error(errorData.error || 'Error al completar configuración');
}


export async function getAdminSetupData(token: string): Promise<AdminSetupData> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/admin/setup-data/${token}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  if (response.ok) {
    const data: AdminSetupData = await response.json();
    return data;
  }

  // Error
  const errorData: ErrorResponse = await response.json();
  console.error(' [Auth2FA] Error:', errorData.error);
  throw new Error(errorData.error || 'Token inválido o expirado');
}
