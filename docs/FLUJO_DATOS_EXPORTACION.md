#  Flujo de Datos - Exportación Excel

## Diagrama del Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO FRONTEND                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 1. Click en botón "Exportar"
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              COMPONENTE REACT (Frontend)                        │
│  • BotonExportarExcel.tsx                                       │
│  • DialogExportarConFiltros.tsx                                 │
│                                                                  │
│  Estado: isExporting = true                                     │
│  Acción: Llama a exportacion-service                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 2. Ejecuta función async
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            SERVICIO DE EXPORTACIÓN (Frontend)                   │
│  exportacion-service.ts                                         │
│                                                                  │
│  • Obtiene token JWT de localStorage                            │
│  • Construye URL con parámetros/body                            │
│  • Configura headers (Authorization, Content-Type)              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 3. HTTP Request
                         │    GET /api/exportaciones/excel
                         │    o POST /api/exportaciones/excel/avanzado
                         │    Headers: { Authorization: Bearer <token> }
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  RED / INTERNET                                 │
│  localhost:3000 (Frontend) → localhost:8080 (Backend)           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 4. Request llega al backend
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│          SPRING BOOT SECURITY (Backend)                         │
│  JWT Authentication Filter                                      │
│                                                                  │
│  • Valida token JWT                                             │
│  • Verifica roles (ADMIN, ANALISTA, OBSERVADOR)                 │
│  • Extrae información del usuario                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 5. Autenticación exitosa
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            CONTROLADOR REST (Backend)                           │
│  ExportacionController.java                                     │
│  @RestController @RequestMapping("/api/exportaciones")          │
│                                                                  │
│  Endpoints disponibles:                                         │
│  • @GetMapping("/excel")                                        │
│  • @GetMapping("/excel/lote/{loteId}")                          │
│  • @PostMapping("/excel/personalizado")                         │
│  • @PostMapping("/excel/avanzado")                              │
│                                                                  │
│  • Recibe parámetros/DTO                                        │
│  • Valida entrada                                               │
│  • Llama al servicio                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 6. Llama al servicio
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              SERVICIO DE EXPORTACIÓN (Backend)                  │
│  ExportacionExcelService.java                                   │
│  @Service                                                       │
│                                                                  │
│  Métodos principales:                                           │
│  • generarReporteExcel(List<Long> loteIds)                      │
│  • generarReporteExcelAvanzado(ExportacionRequestDTO)           │
│  • obtenerDatosParaExportacion(loteIds)                         │
│  • obtenerDatosConFiltros(solicitud)                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 7. Consulta base de datos
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REPOSITORIOS JPA                             │
│  • LoteRepository                                               │
│  • PurezaRepository                                             │
│  • GerminacionRepository                                        │
│  • PmsRepository                                                │
│  • TetrazolioRepository                                         │
│  • DosnRepository                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 8. Query SQL a la DB
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                                │
│  PostgreSQL / MySQL / H2                                        │
│                                                                  │
│  Tablas consultadas:                                            │
│  • lote                                                         │
│  • pureza                                                       │
│  • germinacion                                                  │
│  • pms                                                          │
│  • tetrazolio                                                   │
│  • dosn                                                         │
│  • listado (malezas y otros cultivos)                           │
│  • cultivar                                                     │
│  • especie                                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 9. Retorna entidades JPA
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            MAPEO DE DATOS (Backend Service)                     │
│  ExportacionExcelService.java                                   │
│                                                                  │
│  Métodos de mapeo:                                              │
│  • mapearDatosBasicosLote()                                     │
│  • mapearDatosPureza()                                          │
│  • mapearDatosGerminacion()                                     │
│  • mapearDatosPms()                                             │
│  • mapearDatosTetrazolio()                                      │
│  • mapearDatosDosn()                                            │
│                                                                  │
│  Resultado: List<DatosExportacionExcelDTO>                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 10. Genera Excel con Apache POI
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            GENERACIÓN EXCEL (Apache POI)                        │
│  ExportacionExcelService.java                                   │
│                                                                  │
│  Proceso:                                                       │
│  1. new XSSFWorkbook()                                          │
│  2. createSheet("Análisis de Semillas")                         │
│  3. crearEstilos (headers, data, colores)                       │
│  4. crearEncabezados (fila 0 y 1)                               │
│  5. Para cada DTO:                                              │
│     • crearFilaDatos()                                          │
│     • Llenar celdas con valores                                 │
│     • Aplicar estilos                                           │
│  6. ajustarAnchoColumnas()                                      │
│  7. workbook.write(ByteArrayOutputStream)                       │
│                                                                  │
│  Resultado: byte[] (archivo Excel)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 11. Retorna byte[]
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            RESPUESTA HTTP (Backend Controller)                  │
│  ExportacionController.java                                     │
│                                                                  │
│  • Genera nombre de archivo con timestamp                       │
│  • Configura headers HTTP:                                      │
│    - Content-Type: application/octet-stream                     │
│    - Content-Disposition: attachment; filename="..."            │
│    - Content-Length: <tamaño del archivo>                       │
│  • Retorna ResponseEntity<byte[]>                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 12. HTTP Response
                         │     Status: 200 OK
                         │     Body: byte[] (archivo Excel)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  RED / INTERNET                                 │
│  localhost:8080 (Backend) → localhost:3000 (Frontend)           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 13. Response llega al frontend
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            SERVICIO DE EXPORTACIÓN (Frontend)                   │
│  exportacion-service.ts                                         │
│                                                                  │
│  • Verifica response.ok                                         │
│  • Convierte a Blob: await response.blob()                      │
│  • Retorna Blob al componente                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 14. Blob recibido
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              COMPONENTE REACT (Frontend)                        │
│  BotonExportarExcel.tsx / DialogExportarConFiltros.tsx          │
│                                                                  │
│  • Genera nombre de archivo                                     │
│  • Llama a descargarArchivo(blob, nombre)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 15. Descarga archivo
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            DESCARGA DE ARCHIVO (Frontend)                       │
│  exportacion-service.ts → descargarArchivo()                    │
│                                                                  │
│  Proceso:                                                       │
│  1. URL.createObjectURL(blob)                                   │
│  2. document.createElement('a')                                 │
│  3. link.href = url                                             │
│  4. link.download = nombreArchivo                               │
│  5. link.click()                                                │
│  6. URL.revokeObjectURL(url)                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 16. Archivo descargado
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              NOTIFICACIÓN AL USUARIO                            │
│  • toast.success("Excel exportado exitosamente")                │
│  • Estado: isExporting = false                                  │
│  • Botón vuelve a estado normal                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 17. Usuario ve archivo descargado
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE ARCHIVOS                          │
│  Carpeta de Descargas del navegador                             │
│  Archivo: analisis_semillas_20241015_143052.xlsx                │
│  Tamaño: ~50-500 KB (depende de cantidad de lotes)              │
└─────────────────────────────────────────────────────────────────┘
```

---

##  Detalle de las Estructuras de Datos

### Frontend → Backend

#### Request GET simple:
```
GET /api/exportaciones/excel
Headers: {
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
}
```

#### Request GET con parámetros:
```
GET /api/exportaciones/excel?loteIds=1,2,3
Headers: {
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
}
```

#### Request POST con filtros:
```
POST /api/exportaciones/excel/avanzado
Headers: {
  Content-Type: application/json,
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
}
Body: {
  "loteIds": [1, 2, 3],
  "fechaDesde": "2024-01-01",
  "fechaHasta": "2024-12-31",
  "especieIds": [1, 2],
  "cultivarIds": [5, 10],
  "incluirInactivos": false,
  "tiposAnalisis": ["PUREZA", "GERMINACION", "PMS"],
  "incluirEncabezados": true,
  "incluirColoresEstilo": true,
  "formatoFecha": "dd/MM/yyyy"
}
```

### Backend → Frontend

#### Response exitosa:
```
Status: 200 OK
Headers: {
  Content-Type: application/octet-stream,
  Content-Disposition: attachment; filename="analisis_semillas_20241015_143052.xlsx",
  Content-Length: 156742
}
Body: <binary data del archivo Excel>
```

#### Response error 401:
```
Status: 401 Unauthorized
Body: "Token inválido o expirado"
```

#### Response error 500:
```
Status: 500 Internal Server Error
Body: "Error al generar archivo Excel: ..."
```

---

##  Transformación de Datos

### 1. Entidad JPA (Base de Datos)
```java
Lote {
  loteID: 1,
  ficha: "LOTE-2024-001",
  kilosLimpios: 500.5,
  cultivar: Cultivar {
    nombre: "Don Mario",
    especie: Especie {
      nombreComun: "Soja"
    }
  }
}
```

### 2. DTO Intermedio (Backend)
```java
DatosExportacionExcelDTO {
  especie: "Soja",
  variedad: "Don Mario",
  lote: "LOTE-2024-001",
  kilos: "500.5",
  purezaSemillaPura: 98.5,
  germinacionTotal: 95.0,
  pms: 180.5,
  // ... más campos
}
```

### 3. Celda Excel (Archivo generado)
```
| A      | B          | C              | ... | J     |
|--------|------------|----------------|-----|-------|
| Soja   | Don Mario  | LOTE-2024-001  | ... | 98.5  |
```

### 4. Archivo Descargado (Usuario)
```
 Descargas/
  └── analisis_semillas_20241015_143052.xlsx
      • Tamaño: 156 KB
      • Formato: Excel 2007+ (.xlsx)
      • Hojas: 1 ("Análisis de Semillas")
      • Filas: 2 (encabezados) + N (datos)
      • Columnas: 52 (A hasta AZ)
```

---

## ⏱️ Tiempos Estimados

| Etapa | Tiempo |
|-------|--------|
| Click del usuario → Request HTTP | < 10 ms |
| Request → Autenticación JWT | 5-20 ms |
| Consultas a base de datos | 50-500 ms |
| Mapeo de datos | 10-100 ms |
| Generación Excel (Apache POI) | 100-1000 ms |
| Transferencia HTTP | 10-200 ms |
| Descarga en navegador | < 50 ms |
| **TOTAL** | **~200-2000 ms** |

*Los tiempos varían según la cantidad de lotes y análisis.*

---

##  Seguridad

### Puntos de validación:

1. **Frontend:** Token en localStorage
2. **Backend Security Filter:** Validación JWT
3. **Backend Controller:** Verificación de roles con `@PreAuthorize`
4. **Backend Service:** Filtrado de datos según permisos
5. **Base de datos:** Solo datos del usuario autenticado (si aplica)

### Roles permitidos:
- ✅ ROLE_ADMIN
- ✅ ROLE_ANALISTA
- ✅ ROLE_OBSERVADOR
- ❌ ROLE_USER (sin acceso)

---

##  Formato y Estilos

### Colores aplicados:
- **Encabezados:** Gris claro (#D9D9D9)
- **Datos INASE:** Amarillo (#FFFF00)
- **Bordes:** Todos los lados, línea fina
- **Fuente:** Arial 11pt (encabezados bold)

### Alineación:
- **Encabezados:** Centrado
- **Datos texto:** Izquierda
- **Datos numéricos:** Derecha (automático)

### Anchos de columna:
- **Columnas A-H:** Auto-ajustado (mínimo 3000 unidades)
- **Columnas I-AZ:** Ancho fijo 2500 unidades

---

##  Optimizaciones Futuras

1. **Caché:** Cachear datos de especies/cultivares
2. **Paginación:** Exportar en lotes para archivos grandes
3. **Async:** Generar Excel en background con cola de tareas
4. **Compresión:** Comprimir antes de enviar (gzip)
5. **Streaming:** Streaming de datos para archivos muy grandes
6. **Notificaciones:** Email cuando el archivo esté listo

---

**Última actualización:** 2024-10-15
