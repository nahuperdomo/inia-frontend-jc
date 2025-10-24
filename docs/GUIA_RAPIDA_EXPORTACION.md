# 🚀 Guía Rápida: Exportación Excel

## ✅ Estado de la Conexión

**Backend ↔ Frontend: CONECTADO Y FUNCIONAL** ✨

---

## 📦 ¿Qué está incluido?

### Backend (Java Spring Boot)
- ✅ `ExportacionController.java` - 4 endpoints REST
- ✅ `ExportacionExcelService.java` - Lógica de generación Excel
- ✅ `ExportacionRequestDTO.java` - DTO para filtros
- ✅ Apache POI integrado para generar archivos Excel
- ✅ Autenticación JWT
- ✅ CORS habilitado

### Frontend (Next.js + TypeScript)
- ✅ `exportacion-service.ts` - Cliente API
- ✅ `BotonExportarExcel` - Componente botón simple
- ✅ `DialogExportarConFiltros` - Componente con filtros
- ✅ Página `/reportes` - UI completa
- ✅ Manejo de errores con toasts
- ✅ Loading states

---

## 🎯 Cómo Usar

### 1️⃣ Inicia el Backend

```bash
cd inia-backend
./mvnw spring-boot:run
```

**Windows PowerShell:**
```powershell
cd inia-backend
.\mvnw.cmd spring-boot:run
```

**Verificar:** El backend debe estar en `http://localhost:8080`

---

### 2️⃣ Inicia el Frontend

```bash
cd inia-frontend-jc
pnpm dev
# o
npm run dev
```

**Verificar:** El frontend debe estar en `http://localhost:3000`

---

### 3️⃣ Navega a Reportes

Abre tu navegador en:
```
http://localhost:3000/reportes
```

---

### 4️⃣ Exporta Datos

#### Opción A: Exportación Simple
1. Busca la sección "Prueba de Exportación a Excel"
2. Click en **"Exportar Todos los Lotes"**
3. Se descargará automáticamente un archivo `.xlsx`

#### Opción B: Exportación con Filtros
1. Busca la sección "Prueba de Exportación a Excel"
2. Click en **"Exportar con Filtros"**
3. Configura los filtros:
   - **Rango de fechas** (opcional)
   - **Tipos de análisis** (marca los que quieras incluir)
   - **Incluir lotes inactivos** (checkbox)
4. Click en **"Exportar"**
5. Se descargará automáticamente un archivo `.xlsx` filtrado

---

## 🧪 Prueba Rápida desde la Consola del Navegador

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Pega este código:

```javascript
// Copiar y pegar el contenido de scripts/test-exportacion.js
```

O simplemente carga el script en el navegador.

---

## 📋 Endpoints Disponibles

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/exportaciones/excel` | GET | Exportar todos los lotes activos |
| `/api/exportaciones/excel?loteIds=1,2,3` | GET | Exportar lotes específicos |
| `/api/exportaciones/excel/lote/{id}` | GET | Exportar un lote individual |
| `/api/exportaciones/excel/avanzado` | POST | Exportar con filtros avanzados |

---

## 🔑 Autenticación

**Todos los endpoints requieren autenticación JWT.**

Para probar desde Postman o similar:

```http
GET http://localhost:8080/api/exportaciones/excel
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

Obtén el token desde:
1. Inicia sesión en la aplicación
2. Abre DevTools (F12)
3. Console → escribe `localStorage.getItem('token')`

---

## 🎨 Formato del Excel

El archivo Excel generado incluye:

### Datos por Columnas:
- **A-I:** Datos básicos (Especie, Variedad, Lote, etc.)
- **J-O:** Pureza INIA (SP%, MI%, OC%, M%, MT%, MTC%)
- **P-U:** Pureza INASE (destacado en amarillo)
- **V-Y:** Descripción (textos descriptivos)
- **Z-AD:** DOSN INIA
- **AE-AI:** DOSN INASE (destacado en amarillo)
- **AJ:** PMS (Peso de Mil Semillas)
- **AK:** Fecha Análisis
- **AL:** TS (Tratamiento Semillas)
- **AM-AR:** Germinación INIA
- **AS-AX:** Germinación INASE (destacado en amarillo)
- **AY-AZ:** Viabilidad (Tetrazolio)

### Estilos:
- ✨ Encabezados con fondo gris
- ✨ Datos INASE resaltados en amarillo
- ✨ Bordes en todas las celdas
- ✨ Fechas formateadas (dd/MM/yyyy)
- ✨ Columnas auto-ajustadas

---

## 🛠️ Configuración

### Variables de Entorno (Frontend)

Archivo: `.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Para producción:**
```bash
NEXT_PUBLIC_API_URL=https://tu-backend.com
```

---

## 🐛 Solución de Problemas

### ❌ "No hay token de autenticación"
**Solución:** Inicia sesión en la aplicación primero.

### ❌ "Error 401 Unauthorized"
**Solución:** 
- Token expirado → Vuelve a iniciar sesión
- Usuario sin permisos → Necesitas rol ADMIN, ANALISTA u OBSERVADOR

### ❌ "Error 500 Internal Server Error"
**Solución:**
- Revisa los logs del backend
- Verifica que haya lotes con datos de análisis en la DB

### ❌ "Network request failed" o "CORS error"
**Solución:**
- Verifica que el backend esté corriendo
- Verifica la URL en `.env.local`
- El backend ya tiene CORS habilitado con `@CrossOrigin(origins = "*")`

### ❌ Excel se descarga vacío o con 0 bytes
**Solución:**
- No hay lotes que cumplan con los filtros
- Los lotes no tienen análisis asociados
- Revisa los logs del backend: `System.out.println` en el servicio

---

## 📖 Documentación Completa

Para más detalles, consulta:
- **Conexión detallada:** `docs/EXPORTACION_EXCEL_CONEXION.md`
- **Script de prueba:** `scripts/test-exportacion.js`

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs del backend** en la consola donde ejecutaste Spring Boot
2. **Revisa la consola del navegador** (F12 → Console)
3. **Verifica que ambos servicios estén corriendo** (backend en :8080, frontend en :3000)
4. **Asegúrate de estar logueado** (token JWT en localStorage)

---

## ✨ Características Destacadas

- 🚀 **Rápido:** Genera Excel en segundos
- 🎨 **Profesional:** Formato con estilos y colores
- 🔍 **Filtros avanzados:** Por fecha, tipo de análisis, estado
- 📊 **Completo:** Incluye todos los tipos de análisis (Pureza, Germinación, PMS, DOSN, Tetrazolio)
- 🔐 **Seguro:** Autenticación JWT requerida
- 🎯 **Flexible:** Exporta todos los lotes o selecciona específicos
- 💾 **Descarga automática:** No necesitas guardar manualmente

---

## 🎉 ¡Listo para Usar!

Tu sistema de exportación a Excel está completamente operativo.

**Próximos pasos sugeridos:**
1. Prueba exportar todos los lotes
2. Prueba exportar con filtros de fecha
3. Prueba exportar solo ciertos tipos de análisis
4. Revisa el Excel generado y ajusta estilos si es necesario

---

**Desarrollado con ❤️ para INIA**
