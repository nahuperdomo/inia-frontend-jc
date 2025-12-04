

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';


export async function exportarLotesExcel(loteIds?: number[]): Promise<Blob> {
  const params = loteIds && loteIds.length > 0 
    ? `?loteIds=${loteIds.join(',')}` 
    : '';

  const response = await fetch(`${API_BASE_URL}/api/exportaciones/excel${params}`, {
    method: 'GET',
    credentials: 'include', // Envía cookies HttpOnly automáticamente
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al exportar: ${response.status} - ${errorText}`);
  }

  return await response.blob();
}


export async function exportarLoteEspecificoExcel(loteId: number): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/exportaciones/excel/lote/${loteId}`, {
    method: 'GET',
    credentials: 'include', // Envía cookies HttpOnly automáticamente
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al exportar lote: ${response.status} - ${errorText}`);
  }

  return await response.blob();
}


export async function exportarLotesConFiltros(filtros: ExportacionFiltrosDTO): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/exportaciones/excel/avanzado`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Envía cookies HttpOnly automáticamente
    body: JSON.stringify(filtros),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al exportar con filtros: ${response.status} - ${errorText}`);
  }

  return await response.blob();
}


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


export function generarNombreArchivo(prefijo: string = 'analisis'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefijo}_${timestamp}.xlsx`;
}


export function generarResumenFiltros(filtros: ExportacionFiltrosDTO): ResumenFiltros {
  const filtrosAplicados: string[] = [];
  const advertencias: string[] = [];
  
  // Analizar rango de fechas
  if (filtros.fechaDesde || filtros.fechaHasta) {
    const desde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
    const hasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : new Date();
    
    if (desde && hasta) {
      const diasDiferencia = Math.floor((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diasDiferencia > 365) {
        advertencias.push('Rango de fechas mayor a 1 año - La exportación puede tardar');
      } else if (diasDiferencia > 180) {
        advertencias.push('Rango de fechas mayor a 6 meses - Puede generar un archivo grande');
      }
      
      filtrosAplicados.push(`Fechas: ${desde.toLocaleDateString('es-ES')} - ${hasta.toLocaleDateString('es-ES')}`);
    } else if (desde) {
      filtrosAplicados.push(`Desde: ${desde.toLocaleDateString('es-ES')}`);
    } else if (filtros.fechaHasta) {
      filtrosAplicados.push(`Hasta: ${hasta.toLocaleDateString('es-ES')}`);
    }
  } else {
    filtrosAplicados.push('Todas las fechas');
    advertencias.push('Sin filtro de fechas - Se exportarán todos los registros históricos');
  }
  
  // Tipos de análisis
  if (filtros.tiposAnalisis && filtros.tiposAnalisis.length > 0) {
    filtrosAplicados.push(`Tipos: ${filtros.tiposAnalisis.join(', ')}`);
  } else {
    filtrosAplicados.push('Todos los tipos de análisis');
  }
  
  // Lotes activos/inactivos
  if (filtros.incluirInactivos) {
    filtrosAplicados.push('Incluye lotes activos e inactivos');
  } else {
    filtrosAplicados.push('Solo lotes activos');
  }
  
  return {
    filtrosAplicados,
    advertencias,
    tieneFiltros: !!(filtros.fechaDesde || filtros.fechaHasta || 
                     (filtros.tiposAnalisis && filtros.tiposAnalisis.length > 0))
  };
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

// Tipos para resumen de filtros (frontend only)
export interface ResumenFiltros {
  filtrosAplicados: string[];
  advertencias: string[];
  tieneFiltros: boolean;
}
