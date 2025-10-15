'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Loader2, Filter } from 'lucide-react';
import { exportarLotesConFiltros, descargarArchivo, generarNombreArchivo, ExportacionFiltrosDTO } from '@/app/services/exportacion-service';
import { toast } from 'sonner';

export function DialogExportarConFiltros() {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filtros
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [tiposAnalisis, setTiposAnalisis] = useState<string[]>([]);

  const toggleTipoAnalisis = (tipo: string) => {
    setTiposAnalisis(prev => 
      prev.includes(tipo) 
        ? prev.filter(t => t !== tipo)
        : [...prev, tipo]
    );
  };

  const handleExportar = async () => {
    setIsExporting(true);

    try {
      const filtros: ExportacionFiltrosDTO = {
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        incluirInactivos,
        tiposAnalisis: tiposAnalisis.length > 0 
          ? tiposAnalisis as ('PUREZA' | 'GERMINACION' | 'PMS' | 'TETRAZOLIO' | 'DOSN')[]
          : undefined,
        incluirEncabezados: true,
        incluirColoresEstilo: true,
        formatoFecha: 'dd/MM/yyyy'
      };

      const blob = await exportarLotesConFiltros(filtros);
      const nombreArchivo = generarNombreArchivo('lotes_filtrados');
      
      descargarArchivo(blob, nombreArchivo);

      toast.success('Excel exportado exitosamente', {
        description: `Archivo ${nombreArchivo} descargado con filtros aplicados`
      });

      setOpen(false);
    } catch (error) {
      console.error('Error al exportar con filtros:', error);
      
      if (error instanceof Error) {
        toast.error('Error al exportar Excel', {
          description: error.message
        });
      } else {
        toast.error('Error al exportar Excel');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Exportar con Filtros
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exportar Excel con Filtros</DialogTitle>
          <DialogDescription>
            Configura los filtros para exportar los datos específicos que necesitas
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Rango de fechas */}
          <div className="space-y-2">
            <Label>Rango de Fechas</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="fechaDesde" className="text-xs text-muted-foreground">Desde</Label>
                <Input
                  id="fechaDesde"
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fechaHasta" className="text-xs text-muted-foreground">Hasta</Label>
                <Input
                  id="fechaHasta"
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tipos de análisis */}
          <div className="space-y-2">
            <Label>Tipos de Análisis</Label>
            <div className="space-y-2">
              {['PUREZA', 'GERMINACION', 'PMS', 'TETRAZOLIO', 'DOSN'].map((tipo) => (
                <div key={tipo} className="flex items-center space-x-2">
                  <Checkbox
                    id={tipo}
                    checked={tiposAnalisis.includes(tipo)}
                    onCheckedChange={() => toggleTipoAnalisis(tipo)}
                  />
                  <Label
                    htmlFor={tipo}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {tipo}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Si no seleccionas ninguno, se exportarán todos los tipos
            </p>
          </div>

          {/* Incluir inactivos */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="incluirInactivos"
              checked={incluirInactivos}
              onCheckedChange={(checked) => setIncluirInactivos(checked as boolean)}
            />
            <Label
              htmlFor="incluirInactivos"
              className="text-sm font-normal cursor-pointer"
            >
              Incluir lotes inactivos
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
            Cancelar
          </Button>
          <Button onClick={handleExportar} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
