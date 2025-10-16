# 📚 INIA Frontend - Guía de Uso

Sistema de gestión de lotes y análisis de semillas para INIA (Instituto Nacional de Investigación Agropecuaria).

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ 
- pnpm (recomendado) o npm
- Backend de INIA corriendo en `http://localhost:8080` (o configurar `NEXT_PUBLIC_API_URL`)

### Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Ejecutar en desarrollo accesible desde red local
pnpm dev:network

# Compilar para producción
pnpm build

# Iniciar producción
pnpm start
```

### Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 📋 Funcionalidades Principales

### 1. **Autenticación**
- **Login**: `/login`
- **Registro**: `/registro`
- Sistema de tokens JWT almacenados en localStorage
- Provider de autenticación global (`AuthProvider`)

### 2. **Dashboard**
- **Ruta**: `/dashboard`
- Vista general del sistema
- Estadísticas de lotes y análisis
- Notificaciones recientes

### 3. **Gestión de Lotes**

#### Listado de Lotes
- **Ruta**: `/listado`
- Tabla con todos los lotes registrados
- Filtros por cultivo, fecha, estado
- Paginación
- Búsqueda en tiempo real

#### Crear/Editar Lote
- Formularios con validación
- Soporte para múltiples tipos de análisis:
  - Pureza
  - Germinación
  - PMS (Peso de Mil Semillas)
  - Tetrazolio
  - DOSN

### 4. **📊 Exportación a Excel**

El sistema cuenta con una potente funcionalidad de exportación a Excel con múltiples opciones:

#### 4.1 Exportación Simple
```tsx
import { BotonExportarExcel } from '@/components/exportar-excel-btn';

// Exportar todos los lotes
<BotonExportarExcel />

// Exportar lotes específicos
<BotonExportarExcel loteIds={[1, 2, 3]} />
```

#### 4.2 Exportación con Filtros Avanzados
```tsx
import { DialogExportarConFiltros } from '@/components/dialog-exportar-filtros';

<DialogExportarConFiltros />
```

**Filtros disponibles:**
- ✅ Rango de fechas (desde/hasta)
- ✅ Incluir lotes inactivos
- ✅ Filtrar por tipos de análisis (Pureza, Germinación, PMS, Tetrazolio, DOSN)
- ✅ Opciones de formato y estilo

#### 4.3 API de Exportación

**Servicio**: `app/services/exportacion-service.ts`

```typescript
// Exportar todos los lotes o lotes específicos
await exportarLotesExcel([1, 2, 3]);

// Exportar un lote específico
await exportarLoteEspecificoExcel(123);

// Exportar con filtros avanzados
await exportarLotesConFiltros({
  fechaDesde: '2024-01-01',
  fechaHasta: '2024-12-31',
  incluirInactivos: false,
  tiposAnalisis: ['PUREZA', 'GERMINACION'],
  incluirEncabezados: true,
  incluirColoresEstilo: true,
  formatoFecha: 'dd/MM/yyyy'
});
```

**Endpoints del Backend:**
- `GET /api/exportaciones/excel` - Exportar todos los lotes activos
- `GET /api/exportaciones/excel?loteIds=1,2,3` - Exportar lotes específicos
- `GET /api/exportaciones/excel/lote/{id}` - Exportar un lote
- `POST /api/exportaciones/excel/avanzado` - Exportar con filtros avanzados

**Características del Excel generado:**
- 📑 Todas las columnas del formato estándar INIA (52 columnas totales)
  - **A-I**: Datos básicos (Especie, Variedad, Lote, Depósito, etc.)
  - **J-O**: Pureza INIA (SP%, MI%, OC%, M%, MT.%, M.T.C%)
  - **P-U**: Pureza INASE (SP-I%, MI-I%, OC-I%, M%, M.T-I%, M.T.C%)
  - **V-Y**: Descripción (MI, OC, MT, MTC)
  - **Z-AD**: DOSN (OC, M, MT, MTC, DB)
  - **AE-AI**: DOSN-I (OC, M, MT, MTC, DB)
  - **AJ-AL**: PMS, Fecha Análisis, TS
  - **AM-AR**: Germinación (PN%, AN%, D%, F%, M%, G%)
  - **AS-AX**: Germinación -I (PN-I%, AN-I%, D-I%, F-I%, M-I%, G-I%)
  - **AY-AZ**: Viabilidad (V%, V-I%)
- 🎨 Estilos y colores personalizados (gris para INIA, amarillo para INASE)
- 📊 Encabezados con celdas combinadas
- ✅ Validación de datos
- 📅 Formatos de fecha personalizables (dd/MM/yyyy)

### 5. **Reportes**
- **Ruta**: `/reportes`
- Generación de reportes mensuales
- Estadísticas de pureza
- Análisis de productividad
- Visualización con gráficos (recharts)
- **🆕 Botón de prueba de exportación**

### 6. **Administración**
- **Ruta**: `/administracion`
- Gestión de usuarios
- Configuración del sistema
- Permisos y roles

### 7. **Notificaciones**
- **Ruta**: `/notificaciones`
- Centro de notificaciones
- Alertas del sistema
- Notificaciones push (PWA)

## 🎨 Componentes UI

El proyecto usa **shadcn/ui** con Radix UI y Tailwind CSS.

### Componentes Principales

```tsx
// Botones
import { Button } from '@/components/ui/button';

// Formularios
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Diálogos
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

// Tarjetas
import { Card, CardHeader, CardContent } from '@/components/ui/card';

// Tablas
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';

// Notificaciones
import { toast } from 'sonner';
```

## 🔄 Estado y Datos

### React Query (TanStack Query)
- Caché automático de datos
- Refetch automático
- Optimistic updates
- DevTools incluidas

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Ejemplo de uso
const { data, isLoading, error } = useQuery({
  queryKey: ['lotes'],
  queryFn: fetchLotes
});
```

### Context Providers

- **AuthProvider**: Gestión de autenticación
- **ThemeProvider**: Sistema de temas (light/dark)
- **LoadingProvider**: Estados de carga globales

## 📱 PWA (Progressive Web App)

El frontend es una PWA completa:
- ✅ Instalable en dispositivos
- ✅ Funciona offline
- ✅ Notificaciones push
- ✅ Actualizaciones automáticas

Componente: `components/pwa-install.tsx`

## 🌐 Modo Offline

- Detección automática de conexión
- Indicador visual de estado
- Sincronización al reconectar

Componente: `components/network-status.tsx`

## 🎯 Estructura del Proyecto

```
inia-frontend-jc/
├── app/                          # Rutas de Next.js 13+ App Router
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Página de inicio
│   ├── administracion/          # Módulo de administración
│   ├── dashboard/               # Dashboard principal
│   ├── listado/                 # Listado de lotes
│   ├── login/                   # Autenticación
│   ├── models/                  # Tipos TypeScript
│   ├── notificaciones/          # Centro de notificaciones
│   ├── registro/                # Registro de usuarios
│   ├── reportes/                # Generación de reportes
│   └── services/                # Servicios API
│       └── exportacion-service.ts  # 📊 Servicio de exportación
├── components/                   # Componentes reutilizables
│   ├── ui/                      # Componentes UI (shadcn)
│   ├── forms/                   # Formularios
│   ├── exportar-excel-btn.tsx   # 📊 Botón exportación simple
│   └── dialog-exportar-filtros.tsx  # 📊 Diálogo filtros avanzados
├── lib/                         # Utilidades
│   └── api-client.ts            # Cliente HTTP
└── public/                      # Archivos estáticos
```

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18
- **Estilos**: Tailwind CSS
- **Componentes**: shadcn/ui + Radix UI
- **Formularios**: React Hook Form + Zod
- **Estado**: TanStack Query (React Query)
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **Notificaciones**: Sonner
- **Fechas**: date-fns

## 📦 Scripts Disponibles

```bash
# Desarrollo
pnpm dev                 # Modo desarrollo (localhost:3000)
pnpm dev:network        # Accesible desde red local

# Producción
pnpm build              # Compilar
pnpm start              # Iniciar servidor producción
pnpm start:network      # Producción en red local

# Calidad de código
pnpm lint               # Ejecutar ESLint
```

## 🔐 Autenticación y Seguridad

### Flujo de Autenticación

1. Usuario ingresa credenciales en `/login`
2. Backend valida y retorna token JWT
3. Token se almacena en `localStorage`
4. Token se incluye en header `Authorization: Bearer {token}` en todas las peticiones
5. Middleware valida token en rutas protegidas

### Protección de Rutas

```tsx
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  
  if (!token && !isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

## 🧪 Pruebas y Desarrollo

### Probar Exportación de Excel

1. Ir a `/reportes`
2. Buscar la sección "Prueba de Exportación"
3. Hacer clic en "Exportar Excel de Prueba"
4. Se descargará un archivo Excel con datos de ejemplo

### Modo de Red Local

Para probar desde otros dispositivos en la red:

```bash
pnpm dev:network
# Acceder desde: http://<tu-ip>:3000
```

## 📞 Soporte y Documentación

- **Backend README**: Ver `inia-backend/EXPORTACION_EXCEL_README.md`
- **Documentación API**: `http://localhost:8080/swagger-ui.html`

## 🚨 Solución de Problemas

### Error: "No hay token de autenticación"
- Verificar que el usuario esté logueado
- Revisar que el token esté en localStorage

### Error: "Error al exportar"
- Verificar que el backend esté corriendo
- Revisar la consola del navegador para más detalles
- Verificar la variable `NEXT_PUBLIC_API_URL`

### Excel no se descarga
- Verificar que el navegador permita descargas automáticas
- Revisar la consola para errores de CORS

### PWA no se instala
- Solo funciona en HTTPS (o localhost)
- Verificar que el navegador soporte PWA
- Revisar el archivo `manifest.json`

## 📈 Próximas Funcionalidades

- [ ] Exportación a PDF
- [ ] Importación masiva desde Excel
- [ ] Sistema de plantillas de reportes
- [ ] Notificaciones por email
- [ ] Integración con servicios externos
- [ ] Dashboard analítico avanzado

---

**Desarrollado con ❤️ para INIA**
