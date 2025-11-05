# Conexión de Exportación Excel - Backend ↔ Frontend

##  Resumen de la Conexión

Este documento explica cómo está conectada la funcionalidad de exportación de Excel entre el backend (Spring Boot) y el frontend (Next.js).

---

##  Arquitectura de la Conexión

### Backend (Spring Boot)

**Controlador:** `ExportacionController.java`
- **Ubicación:** `src/main/java/utec/proyectofinal/Proyecto/Final/UTEC/controllers/`
- **Ruta base:** `/api/exportaciones`

**Servicio:** `ExportacionExcelService.java`
- **Ubicación:** `src/main/java/utec/proyectofinal/Proyecto/Final/UTEC/services/`
- **Tecnología:** Apache POI (para generar archivos Excel)

### Frontend (Next.js)

**Servicio de Exportación:** `exportacion-service.ts`
- **Ubicación:** `app/services/`
- **Responsabilidad:** Comunicación HTTP con el backend

**Componentes UI:**
1. `BotonExportarExcel` - Botón simple para exportar
2. `DialogExportarConFiltros` - Diálogo con filtros avanzados

**Página de Reportes:** `app/reportes/page.tsx`

---

##  Endpoints Disponibles

### 1. Exportar Todos los Lotes Activos

**Backend:**
```java
@GetMapping("/excel")
GET /api/exportaciones/excel
```

**Frontend:**
```typescript
exportarLotesExcel()
// Sin parámetros: exporta todos los lotes activos
```

**Uso en componente:**
```tsx
<BotonExportarExcel 
  variant="default" 
  textoBoton="Exportar Todos los Lotes"
/>
```

---

### 2. Exportar Lotes Específicos

**Backend:**
```java
@GetMapping("/excel")
GET /api/exportaciones/excel?loteIds=1,2,3
```

**Frontend:**
```typescript
exportarLotesExcel([1, 2, 3])
// Con array de IDs de lotes
```

**Uso en componente:**
```tsx
<BotonExportarExcel 
  loteIds={[1, 2, 3]}
  textoBoton="Exportar Lotes Seleccionados"
/>
```

---

### 3. Exportar un Lote Individual

**Backend:**
```java
@GetMapping("/excel/lote/{loteId}")
GET /api/exportaciones/excel/lote/123
```

**Frontend:**
```typescript
exportarLoteEspecificoExcel(123)
```

---

### 4. Exportar con Filtros Avanzados ⭐

**Backend:**
```java
@PostMapping("/excel/avanzado")
POST /api/exportaciones/excel/avanzado
Content-Type: application/json
```

**Request Body (ExportacionRequestDTO):**
```json
{
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

**Frontend:**
```typescript
const filtros: ExportacionFiltrosDTO = {
  fechaDesde: '2024-01-01',
  fechaHasta: '2024-12-31',
  tiposAnalisis: ['PUREZA', 'GERMINACION'],
  incluirInactivos: false,
  incluirEncabezados: true
};

exportarLotesConFiltros(filtros)
```

**Uso en componente:**
```tsx
<DialogExportarConFiltros />
```

---

##  Autenticación

Todos los endpoints requieren autenticación JWT:

```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

El token se obtiene desde `localStorage.getItem('token')`.

### Permisos Requeridos
- `ROLE_ADMIN`
- `ROLE_ANALISTA`
- `ROLE_OBSERVADOR`

---

##  Estructura del Excel Generado

El Excel generado incluye:

### Hojas y Columnas

**Columnas A-I:** Datos Básicos
- Especie
- Variedad
- Lote
- Deposito
- N° de artículo
- N° análisis
- Nro. Ficha
- Kilos
- H% (Humedad)

**Columnas J-O:** Pureza INIA
- SP% (Semilla Pura)
- MI% (Materia Inerte)
- OC% (Otros Cultivos)
- M% (Malezas)
- MT% (Malezas Toleradas)
- MTC% (Materia Total)

**Columnas P-U:** Pureza INASE (destacado en amarillo)

**Columnas V-Y:** Descripción
- Detalle de malezas, otros cultivos, etc.

**Columnas Z-AD:** DOSN (Determinación de Otras Semillas por Número)

**Columnas AE-AI:** DOSN-I (INASE)

**Columna AJ:** PMS (Peso de Mil Semillas)

**Columna AK:** Fecha Análisis

**Columna AL:** TS (Tratamiento Semillas)

**Columnas AM-AR:** Germinación INIA
- PN%, AN%, D%, F%, M%, G%

**Columnas AS-AX:** Germinación INASE (destacado en amarillo)

**Columnas AY-AZ:** Viabilidad (Tetrazolio)
- V% (Viabilidad INIA)
- V-I% (Viabilidad INASE)

### Estilos Aplicados
- ✅ Encabezados con fondo gris
- ✅ Datos INASE resaltados en amarillo
- ✅ Bordes en todas las celdas
- ✅ Formato de fechas: dd/MM/yyyy
- ✅ Ajuste automático de columnas

---

##  Flujo de Exportación

```
┌─────────────────┐
│  Usuario hace   │
│  click en botón │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Componente React       │
│  (BotonExportarExcel o  │
│   DialogExportarFiltros)│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  exportacion-service.ts │
│  - Obtiene token        │
│  - Hace fetch al API    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Backend API            │
│  ExportacionController  │
│  /api/exportaciones/*   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  ExportacionExcelService│
│  - Obtiene datos de DB  │
│  - Genera Excel con POI │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Retorna byte[]         │
│  (archivo Excel)        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Frontend recibe Blob   │
│  - Crea URL temporal    │
│  - Descarga automática  │
└─────────────────────────┘
```

---

##  Cómo Probar

### 1. Asegúrate que el backend esté corriendo
```bash
cd inia-backend
./mvnw spring-boot:run
# O en Windows:
mvnw.cmd spring-boot:run
```

El backend debe estar en: `http://localhost:8080`

### 2. Asegúrate que el frontend esté corriendo
```bash
cd inia-frontend-jc
npm run dev
# o
pnpm dev
```

El frontend debe estar en: `http://localhost:3000`

### 3. Navega a la página de reportes
```
http://localhost:3000/reportes
```

### 4. Prueba las exportaciones

#### Exportación Simple:
1. Click en "Exportar Todos los Lotes"
2. Se descargará un archivo `.xlsx` con todos los lotes activos

#### Exportación con Filtros:
1. Click en "Exportar con Filtros"
2. Configura:
   - Rango de fechas (opcional)
   - Tipos de análisis (PUREZA, GERMINACION, etc.)
   - Incluir lotes inactivos (checkbox)
3. Click en "Exportar"
4. Se descargará un archivo `.xlsx` con los datos filtrados

---

##  Troubleshooting

### Error: "No hay token de autenticación"
**Solución:** Asegúrate de estar logueado. El token JWT debe estar en localStorage.

### Error: "Error al exportar: 401"
**Solución:** 
- Token expirado, vuelve a iniciar sesión
- Usuario sin permisos suficientes

### Error: "Error al exportar: 500"
**Solución:** 
- Revisa los logs del backend
- Verifica que los lotes tengan datos de análisis
- Comprueba la conexión a la base de datos

### Error: "Network request failed"
**Solución:**
- Backend no está corriendo
- Verifica la URL en `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8080`
- Revisa CORS en el backend (ya está configurado con `@CrossOrigin`)

### Excel se descarga vacío
**Solución:**
- No hay lotes que cumplan con los filtros
- Los lotes no tienen análisis asociados
- Revisa los logs del backend para ver qué datos se están exportando

---

##  Variables de Entorno

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend (application.properties)
```properties
# Ya configurado en tu proyecto
server.port=8080
spring.application.name=Proyecto-Final-UTEC
```

---

##  Personalización

### Cambiar el formato de fecha
En `ExportacionFiltrosDTO`:
```typescript
formatoFecha: 'dd/MM/yyyy'  // Formato español
// o
formatoFecha: 'MM/dd/yyyy'  // Formato estadounidense
```

### Agregar nuevos filtros
1. Actualiza `ExportacionRequestDTO.java` (backend)
2. Actualiza `ExportacionFiltrosDTO` (frontend)
3. Actualiza el formulario en `DialogExportarConFiltros`

### Cambiar estilos del Excel
Edita los métodos en `ExportacionExcelService.java`:
- `crearEstiloEncabezado()`
- `crearEstiloEncabezadoAmarillo()`
- `crearEstiloSubEncabezado()`
- `crearEstiloData()`

---

## ✅ Checklist de Conexión

- [x] Backend tiene controlador `ExportacionController`
- [x] Backend tiene servicio `ExportacionExcelService`
- [x] Frontend tiene servicio `exportacion-service.ts`
- [x] Frontend tiene componente `BotonExportarExcel`
- [x] Frontend tiene componente `DialogExportarConFiltros`
- [x] Variable de entorno `NEXT_PUBLIC_API_URL` configurada
- [x] CORS habilitado en backend (`@CrossOrigin`)
- [x] Autenticación JWT implementada
- [x] Página de reportes (`/reportes`) integra los componentes

---

##  Endpoints Resumidos

| Método | Endpoint | Descripción | Componente |
|--------|----------|-------------|------------|
| GET | `/api/exportaciones/excel` | Todos los lotes activos | `BotonExportarExcel` |
| GET | `/api/exportaciones/excel?loteIds=1,2,3` | Lotes específicos | `BotonExportarExcel` |
| GET | `/api/exportaciones/excel/lote/{id}` | Un lote individual | - |
| POST | `/api/exportaciones/excel/avanzado` | Con filtros avanzados | `DialogExportarConFiltros` |

---

##  Recursos Adicionales

- **Apache POI Documentation:** https://poi.apache.org/
- **Next.js Environment Variables:** https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- **Fetch API (Blob):** https://developer.mozilla.org/en-US/docs/Web/API/Blob

---

##  ¡La Conexión Está Lista!

Tu sistema de exportación a Excel está completamente funcional y conectado entre el backend y el frontend. 

**Características implementadas:**
- ✅ Exportación simple
- ✅ Exportación con filtros avanzados
- ✅ Autenticación JWT
- ✅ Manejo de errores
- ✅ UI/UX con toasts y loading states
- ✅ Formato Excel profesional
- ✅ Múltiples tipos de análisis

**Para usar:**
1. Inicia el backend
2. Inicia el frontend
3. Ve a `/reportes`
4. ¡Exporta tus datos!
