/**
 * Device Fingerprinting Library
 *
 * Genera un identificador único del dispositivo basado en características
 * del navegador y sistema operativo. Este fingerprint se usa para el
 * sistema de dispositivos de confianza (2FA).
 *
 * IMPORTANTE: El fingerprint es un hash generado en el cliente que permite
 * identificar el dispositivo de forma pseudoanónima. El backend hashea
 * este valor con SHA-256 antes de almacenarlo.
 */

import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Instancia singleton del agente de fingerprinting
let fpAgent: any = null;

/**
 * Inicializa el agente de FingerprintJS
 * Esta función debe llamarse una sola vez al inicio de la aplicación
 */
async function initializeFingerprintAgent() {
  if (!fpAgent) {
    try {
      fpAgent = await FingerprintJS.load();    } catch (error) {
      console.error('❌ [Fingerprint] Error inicializando agente:', error);
      throw error;
    }
  }
  return fpAgent;
}

/**
 * Genera un fingerprint único del dispositivo
 *
 * Este fingerprint incluye:
 * - Canvas fingerprinting
 * - WebGL fingerprinting
 * - Audio fingerprinting
 * - Configuración de fuentes
 * - Plugins del navegador
 * - Zona horaria y idioma
 * - Características de hardware (CPU, memoria)
 *
 * @returns {Promise<string>} Fingerprint único del dispositivo
 *
 * @example
 * const fingerprint = await getDeviceFingerprint();
 * */
export async function getDeviceFingerprint(): Promise<string> {
  try {
    // Asegurar que el agente esté inicializado
    const agent = await initializeFingerprintAgent();

    // Obtener el fingerprint
    const result = await agent.get();

    // El visitorId es un hash estable y único para este dispositivo
    const fingerprint = result.visitorId;    return fingerprint;
  } catch (error) {
    console.error('❌ [Fingerprint] Error generando fingerprint:', error);

    // Fallback: generar un ID temporal basado en características básicas
    // NOTA: Este fallback no es tan estable como FingerprintJS
    return generateFallbackFingerprint();
  }
}

/**
 * Genera un fingerprint de respaldo usando características básicas del navegador
 *
 * Esta función se usa como fallback si FingerprintJS falla.
 * NO es tan estable como el fingerprint profesional.
 *
 * @returns {string} Fingerprint básico
 */
function generateFallbackFingerprint(): string {
  console.warn('⚠️ [Fingerprint] Usando método de respaldo (menos estable)');

  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || 'unknown',
    (navigator as any).deviceMemory?.toString() || 'unknown',
  ];

  // Crear un hash simple (NO criptográfico)
  const data = components.join('|');
  let hash = 0;

  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32bit integer
  }

  // Convertir a string hexadecimal
  const fingerprint = Math.abs(hash).toString(16);  return fingerprint;
}

/**
 * Pre-inicializa el agente de fingerprinting en segundo plano
 *
 * Esta función puede llamarse al cargar la aplicación para
 * reducir la latencia al generar el fingerprint posteriormente.
 *
 * @example
 * // En _app.tsx o layout.tsx
 * useEffect(() => {
 *   preloadFingerprint();
 * }, []);
 */
export async function preloadFingerprint(): Promise<void> {
  try {
    await initializeFingerprintAgent();  } catch (error) {
    console.warn('⚠️ [Fingerprint] Error en pre-carga (no crítico):', error);
  }
}

/**
 * Obtiene información adicional del dispositivo para mostrar al usuario
 *
 * @returns {object} Información legible del dispositivo
 */
export function getDeviceInfo() {
  const parser = new UAParser();
  const result = parser.getResult();

  return {
    browser: `${result.browser.name || 'Navegador'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'SO'} ${result.os.version || ''}`.trim(),
    device: result.device.type || 'Desktop',
    vendor: result.device.vendor || 'Desconocido',
  };
}

/**
 * Simple User-Agent Parser (implementación básica)
 * Para evitar dependencia adicional
 */
class UAParser {
  private ua: string;

  constructor(userAgent?: string) {
    this.ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  }

  getResult() {
    return {
      browser: this.getBrowser(),
      os: this.getOS(),
      device: this.getDevice(),
    };
  }

  private getBrowser() {
    const ua = this.ua;

    if (ua.includes('Edg/')) {
      const version = ua.match(/Edg\/([\d.]+)/)?.[1];
      return { name: 'Edge', version };
    }
    if (ua.includes('Chrome/') && !ua.includes('Edg')) {
      const version = ua.match(/Chrome\/([\d.]+)/)?.[1];
      return { name: 'Chrome', version };
    }
    if (ua.includes('Firefox/')) {
      const version = ua.match(/Firefox\/([\d.]+)/)?.[1];
      return { name: 'Firefox', version };
    }
    if (ua.includes('Safari/') && !ua.includes('Chrome')) {
      const version = ua.match(/Version\/([\d.]+)/)?.[1];
      return { name: 'Safari', version };
    }

    return { name: 'Navegador', version: '' };
  }

  private getOS() {
    const ua = this.ua;

    if (ua.includes('Windows NT 10')) return { name: 'Windows', version: '10' };
    if (ua.includes('Windows NT 11')) return { name: 'Windows', version: '11' };
    if (ua.includes('Windows')) return { name: 'Windows', version: '' };

    if (ua.includes('Mac OS X')) {
      const version = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.');
      return { name: 'macOS', version };
    }

    if (ua.includes('Android')) {
      const version = ua.match(/Android ([\d.]+)/)?.[1];
      return { name: 'Android', version };
    }

    if (ua.includes('iPhone') || ua.includes('iPad')) {
      const version = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.');
      return { name: 'iOS', version };
    }

    if (ua.includes('Linux')) return { name: 'Linux', version: '' };

    return { name: 'SO', version: '' };
  }

  private getDevice() {
    const ua = this.ua;

    if (ua.includes('Mobile')) {
      return { type: 'mobile', vendor: '' };
    }
    if (ua.includes('Tablet') || ua.includes('iPad')) {
      return { type: 'tablet', vendor: '' };
    }

    return { type: 'desktop', vendor: '' };
  }
}
