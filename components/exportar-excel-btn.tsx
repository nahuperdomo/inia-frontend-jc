'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { exportarLotesExcel, descargarArchivo, generarNombreArchivo } from '@/app/services/exportacion-service';
import { toast } from 'sonner';

interface BotonExportarExcelProps {
  loteIds?: number[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  textoBoton?: string;
}

export function BotonExportarExcel({
  loteIds,
  variant = 'outline',
  size = 'default',
  className = '',
  textoBoton = 'Exportar'
}: BotonExportarExcelProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportar = async () => {
    setIsExporting(true);

    try {
      // Llamar al servicio de exportación
      const blob = await exportarLotesExcel(loteIds);

      // Generar nombre de archivo
      const nombreArchivo = loteIds && loteIds.length > 0
        ? generarNombreArchivo(`lotes_${loteIds.length}`)
        : generarNombreArchivo('todos_los_lotes');

      // Descargar archivo
      descargarArchivo(blob, nombreArchivo);

      toast.success('Excel exportado exitosamente', {
        description: `Archivo ${nombreArchivo} descargado`
      });
    } catch (error) {
      console.error('Error al exportar Excel:', error);

      if (error instanceof Error) {
        toast.error('Error al exportar Excel', {
          description: error.message
        });
      } else {
        toast.error('Error al exportar Excel', {
          description: 'Ocurrió un error inesperado'
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleExportar}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          {textoBoton}
        </>
      )}
    </Button>
  );
}
