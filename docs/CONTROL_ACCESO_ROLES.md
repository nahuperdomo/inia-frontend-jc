# Sistema de Control de Acceso Basado en Roles (RBAC)

## 📋 Descripción General

Este sistema implementa un control de acceso completo basado en roles para la aplicación INIA, con dos capas de protección:

1. **Protección de rutas**: Redirige usuarios no autorizados a una página de error 403
2. **Ocultación de componentes**: Esconde botones y secciones según permisos del usuario

## 🎭 Roles del Sistema

### Observador
- **Permisos**: Solo lectura
- **Acceso**: Dashboard, Listado, Reportes
- **Restricciones**: No puede crear, editar, eliminar, aprobar ni recibir notificaciones

### Analista
- **Permisos**: Crear y editar análisis, finalizar análisis
- **Acceso**: Dashboard, Registro, Listado, Reportes, Notificaciones
- **Restricciones**: No puede aprobar análisis, gestionar usuarios, ni ver administración

### Administrador
- **Permisos**: Acceso completo
- **Acceso**: Todas las páginas y funcionalidades
- **Funciones exclusivas**: Aprobar análisis, gestionar usuarios, configuración del sistema

## 🛠️ Componentes del Sistema

### 1. Hook `usePermissions`

Hook principal para verificar permisos.

**Ubicación**: `lib/hooks/usePermissions.ts`

**Funciones disponibles**:

```typescript
const {
  user,
  isLoading,
  canAccessRoute,      // Verificar acceso a rutas
  canUseFeature,       // Verificar acceso a funcionalidades
  hasRole,             // Verificar si tiene un rol específico
  isAdmin,             // ¿Es administrador?
  isAnalista,          // ¿Es analista?
  isObservador         // ¿Es observador?
} = usePermissions()
```

**Ejemplo de uso**:

```typescript
import { usePermissions } from "@/lib/hooks/usePermissions"

function MiComponente() {
  const { canUseFeature, isAdmin } = usePermissions()

  if (canUseFeature("aprobar-analisis")) {
    // Mostrar botón de aprobar
  }

  if (isAdmin()) {
    // Mostrar panel de administración
  }
}
```

### 2. Componente `RouteGuard`

Protege rutas completas. Redirige a `/acceso-denegado` si el usuario no tiene permiso.

**Ubicación**: `components/route-guard.tsx`

**Uso en DashboardLayout**:

```tsx
import { RouteGuard } from "@/components/route-guard"

<main className="flex-1">
  <RouteGuard>
    {children}
  </RouteGuard>
</main>
```

**Comportamiento**:
- ✅ Usuario con permiso: Muestra la página normalmente
- ❌ Usuario sin permiso: Redirige a `/acceso-denegado`
- ⏳ Cargando: Muestra spinner mientras verifica

### 3. Componente `Restricted`

Oculta componentes según permisos de funcionalidad.

**Ubicación**: `components/restricted.tsx`

**Variantes disponibles**:

#### a) Por Funcionalidad (Recomendado)

```tsx
import { Restricted } from "@/components/restricted"

// Mostrar solo si puede aprobar análisis (admins)
<Restricted feature="aprobar-analisis">
  <Button onClick={aprobar}>Aprobar Análisis</Button>
</Restricted>

// Mostrar solo si puede finalizar análisis (analistas y admins)
<Restricted feature="finalizar-analisis">
  <Button onClick={finalizar}>Finalizar</Button>
</Restricted>

// Mostrar solo si puede crear lotes (analistas y admins)
<Restricted feature="crear-lote">
  <Button onClick={crear}>Nuevo Lote</Button>
</Restricted>
```

#### b) Por Rol

```tsx
import { AdminOnly, AnalistaOnly, ObservadorOnly, HideForRoles } from "@/components/restricted"

// Solo para administradores
<AdminOnly>
  <PanelAdministracion />
</AdminOnly>

// Solo para analistas
<AnalistaOnly>
  <FormularioRegistro />
</AnalistaOnly>

// Solo para observadores
<ObservadorOnly>
  <MensajeSoloLectura />
</ObservadorOnly>

// Ocultar para ciertos roles
<HideForRoles roles={["observador"]}>
  <BotonEditar />
</HideForRoles>
```

#### c) Con Fallback

```tsx
<Restricted 
  feature="editar-analisis"
  fallback={<p className="text-gray-500">No tienes permisos para editar</p>}
>
  <FormularioEdicion />
</Restricted>
```

### 4. Página de Error 403

**Ubicación**: `app/acceso-denegado/page.tsx`

Muestra un mensaje amigable cuando el usuario intenta acceder a una página sin permiso.

**Características**:
- 🛡️ Icono de escudo con alerta
- 👤 Muestra el rol actual del usuario
- 🔙 Botón para volver atrás
- 🏠 Botón para ir al inicio

## 📊 Mapeo de Permisos

### Permisos de Rutas (ROUTE_PERMISSIONS)

```typescript
const ROUTE_PERMISSIONS = {
  // Rutas públicas
  "/dashboard": ["analista", "administrador", "observador"],
  "/listado": ["analista", "administrador", "observador"],
  "/reportes": ["analista", "administrador", "observador"],
  
  // Rutas para analistas y admins
  "/registro": ["analista", "administrador"],
  "/notificaciones": ["analista", "administrador"],
  
  // Rutas solo para admins
  "/administracion": ["administrador"],
  "/administracion/usuarios": ["administrador"],
  "/administracion/configuracion": ["administrador"],
}
```

### Permisos de Funcionalidades (FEATURE_PERMISSIONS)

```typescript
const FEATURE_PERMISSIONS = {
  // Análisis
  "aprobar-analisis": ["administrador"],
  "finalizar-analisis": ["analista", "administrador"],
  "marcar-repetir": ["administrador"],
  "editar-analisis": ["analista", "administrador"],
  "eliminar-analisis": ["administrador"],
  
  // Lotes
  "crear-lote": ["analista", "administrador"],
  "editar-lote": ["analista", "administrador"],
  "eliminar-lote": ["administrador"],
  
  // Otros
  "registrar-analisis": ["analista", "administrador"],
  "ver-reportes": ["analista", "administrador", "observador"],
  "exportar-excel": ["analista", "administrador"],
  "ver-notificaciones": ["analista", "administrador"],
  "gestionar-usuarios": ["administrador"],
}
```

## 🎯 Ejemplos Prácticos

### Ejemplo 1: Botón de Aprobar (Solo Admin)

```tsx
import { Restricted } from "@/components/restricted"

function AccionesAnalisis() {
  return (
    <div className="flex gap-2">
      {/* Visible para todos con permiso de finalizar */}
      <Restricted feature="finalizar-analisis">
        <Button onClick={handleFinalizar}>
          Finalizar
        </Button>
      </Restricted>
      
      {/* Solo visible para admins */}
      <Restricted feature="aprobar-analisis">
        <Button onClick={handleAprobar}>
          Aprobar
        </Button>
      </Restricted>
    </div>
  )
}
```

### Ejemplo 2: Sección Completa de Admin

```tsx
import { AdminOnly } from "@/components/restricted"

function PaginaConfiguracion() {
  return (
    <div>
      <h1>Configuración</h1>
      
      {/* Esta sección completa solo la ven admins */}
      <AdminOnly>
        <div className="bg-red-50 p-4">
          <h2>Configuración Avanzada</h2>
          <p>Esta sección es solo para administradores</p>
          <Button onClick={resetearSistema}>
            Resetear Sistema
          </Button>
        </div>
      </AdminOnly>
    </div>
  )
}
```

### Ejemplo 3: Menú Condicional

```tsx
import { usePermissions } from "@/lib/hooks/usePermissions"

function MenuNavegacion() {
  const { canUseFeature, isAdmin } = usePermissions()
  
  return (
    <nav>
      <Link href="/dashboard">Inicio</Link>
      <Link href="/listado">Listado</Link>
      
      {canUseFeature("registrar-analisis") && (
        <Link href="/registro">Registro</Link>
      )}
      
      {isAdmin() && (
        <Link href="/administracion">Administración</Link>
      )}
    </nav>
  )
}
```

### Ejemplo 4: Formulario con Campos Condicionales

```tsx
import { Restricted } from "@/components/restricted"

function FormularioAnalisis() {
  return (
    <form>
      <Input label="Número de Lote" />
      <Input label="Fecha" />
      
      {/* Campo solo visible para analistas y admins */}
      <Restricted feature="editar-analisis">
        <Select label="Estado" options={estados} />
      </Restricted>
      
      {/* Campo solo visible para admins */}
      <Restricted feature="aprobar-analisis">
        <Checkbox label="Aprobar automáticamente" />
      </Restricted>
      
      <Button type="submit">Guardar</Button>
    </form>
  )
}
```

## 🔍 Testing

### Verificar Protección de Rutas

1. **Como Observador**:
   - ✅ Puede acceder: `/dashboard`, `/listado`, `/reportes`
   - ❌ No puede acceder: `/registro`, `/administracion`, `/notificaciones`
   - Redirige a `/acceso-denegado`

2. **Como Analista**:
   - ✅ Puede acceder: `/dashboard`, `/listado`, `/reportes`, `/registro`, `/notificaciones`
   - ❌ No puede acceder: `/administracion`
   - Redirige a `/acceso-denegado`

3. **Como Administrador**:
   - ✅ Puede acceder: Todas las rutas

### Verificar Ocultación de Botones

1. **Login como Observador**:
   - No debe ver: Botones de Finalizar, Aprobar, Editar, Eliminar
   - No debe ver: Icono de notificaciones
   - No debe ver: Link de "Registro" en menú

2. **Login como Analista**:
   - Debe ver: Botón de Finalizar
   - No debe ver: Botón de Aprobar
   - No debe ver: Sección de gestión de usuarios

3. **Login como Administrador**:
   - Debe ver: Todos los botones y secciones

### Test Manual en Navegador

```javascript
// En la consola del navegador:
// 1. Verificar usuario actual
console.log(JSON.parse(localStorage.getItem('inia-user')))

// 2. Intentar acceder a ruta restringida
// Como observador, navegar a: /administracion
// Debe redirigir a /acceso-denegado

// 3. Verificar permisos
// Abrir React DevTools y buscar el contexto de Auth
// Verificar que user.role coincide con el esperado
```

## 📝 Añadir Nuevos Permisos

### 1. Agregar Nueva Ruta Protegida

En `lib/hooks/usePermissions.ts`:

```typescript
const ROUTE_PERMISSIONS = {
  // ... rutas existentes
  "/nueva-ruta": ["analista", "administrador"],
  "/nueva-ruta/detalle/:id": ["administrador"], // Solo admins
} as const
```

### 2. Agregar Nueva Funcionalidad

En `lib/hooks/usePermissions.ts`:

```typescript
const FEATURE_PERMISSIONS = {
  // ... funcionalidades existentes
  "nueva-funcionalidad": ["analista", "administrador"],
  "funcionalidad-admin": ["administrador"],
} as const
```

### 3. Usar en Componentes

```tsx
import { Restricted } from "@/components/restricted"

<Restricted feature="nueva-funcionalidad">
  <Button>Nueva Acción</Button>
</Restricted>
```

## ⚠️ Notas Importantes

1. **Siempre usar permisos en Backend**: Este sistema es solo para UX. El backend debe validar TODOS los permisos.

2. **No confiar en el frontend**: Los usuarios pueden manipular el código del navegador. Siempre validar en el servidor.

3. **Testing exhaustivo**: Probar todos los roles en todas las páginas críticas.

4. **Consistencia**: Usar los mismos nombres de permisos en frontend y backend.

5. **Documentar cambios**: Al agregar nuevos permisos, actualizar esta documentación.

## 🔄 Flujo Completo de Validación

```
Usuario intenta acceder a /administracion
         ↓
1. RouteGuard intercepta la navegación
         ↓
2. usePermissions verifica canAccessRoute("/administracion")
         ↓
3. Consulta ROUTE_PERMISSIONS["/administracion"]
         ↓
4. Compara user.role con roles permitidos
         ↓
   ┌─────────┴─────────┐
   ✅ Tiene permiso    ❌ No tiene permiso
   │                    │
   Muestra página      Redirige a /acceso-denegado
```

## 🎨 Personalización

### Cambiar Página de Error

Editar `app/acceso-denegado/page.tsx` para personalizar el diseño.

### Agregar Logging

En `components/route-guard.tsx`:

```typescript
useEffect(() => {
  const hasAccess = canAccessRoute(pathname)
  
  // Agregar logging
  if (!hasAccess) {
    console.warn(`Usuario ${user?.username} intentó acceder a ${pathname}`)
    // Enviar a servicio de analytics
  }
}, [pathname])
```

## 📞 Soporte

Para problemas o preguntas sobre el sistema de permisos:
1. Revisar esta documentación
2. Verificar console.log en el navegador
3. Revisar que el usuario tenga el rol correcto en el backend
4. Verificar que los permisos estén correctamente definidos en usePermissions.ts
