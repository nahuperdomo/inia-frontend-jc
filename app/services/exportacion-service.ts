/**
 * Servicio para exportación de datos a Excel
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Exporta todos los lotes activos o lotes específicos a Excel
 */
export async function exportarLotesExcel(loteIds?: number[]): Promise<Blob> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const params = loteIds && loteIds.length > 0 
    ? `?loteIds=${loteIds.join(',')}` 
    : '';

  const response = await fetch(`${API_BASE_URL}/api/exportaciones/excel${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al exportar: ${response.status} - ${errorText}`);
  }

  return await response.blob();
}

/**
 * Exporta un lote específico a Excel
 */
export async function exportarLoteEspecificoExcel(loteId: number): Promise<Blob> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/api/exportaciones/excel/lote/${loteId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al exportar lote: ${response.status} - ${errorText}`);
  }

  return await response.blob();
}

/**
 * Exporta lotes con filtros avanzados
 */
export async function exportarLotesConFiltros(filtros: ExportacionFiltrosDTO): Promise<Blob> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/api/exportaciones/excel/avanzado`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(filtros),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al exportar con filtros: ${response.status} - ${errorText}`);
  }

  return await response.blob();
}

/**
 * Descarga un blob como archivo
 */
export function descargarArchivo(blob: Blob, nombreArchivo: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Genera un nombre de archivo con timestamp
 */
export function generarNombreArchivo(prefijo: string = 'analisis'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefijo}_${timestamp}.xlsx`;
}

// Tipos para filtros de exportación
export interface ExportacionFiltrosDTO {
  loteIds?: number[];
  fechaDesde?: string;
  fechaHasta?: string;
  especieIds?: number[];
  cultivarIds?: number[];
  incluirInactivos?: boolean;
  tiposAnalisis?: ('PUREZA' | 'GERMINACION' | 'PMS' | 'TETRAZOLIO' | 'DOSN')[];
  incluirEncabezados?: boolean;
  incluirColoresEstilo?: boolean;
  formatoFecha?: string;
}
