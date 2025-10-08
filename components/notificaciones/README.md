# Sistema de Notificaciones - Documentación

## Descripción General

Sistema profesional y reutilizable para el manejo de notificaciones en la aplicación INIA. Incluye componentes modulares, hooks personalizados, y un proveedor de contexto para gestión de estado global.

## Estructura de Archivos

```
components/notificaciones/
├── index.ts                     # Exportaciones principales
├── NotificationProvider.tsx     # Contexto y proveedor global
├── NotificationDropdown.tsx     # Dropdown principal
├── NotificationItem.tsx         # Componente individual
├── NotificationBadge.tsx        # Badge de contador
├── NotificationIcon.tsx         # Iconos dinámicos
└── README.md                   # Este archivo

lib/
├── hooks/
│   └── use-notifications.ts    # Hook personalizado
└── utils/
    └── notification-utils.ts   # Utilidades y helpers
```

## Instalación y Configuración

### 1. Configurar el Proveedor

Envolver la aplicación con el `NotificationProvider`:

```tsx
// app/layout.tsx o componente raíz
import { NotificationProvider } from '@/components/notificaciones';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <NotificationProvider
          autoRefreshInterval={30000}
          enableAutoRefresh={true}
        >
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
```

### 2. Usar el Dropdown en el Header

```tsx
// components/header.tsx
import { NotificationDropdown } from '@/components/notificaciones';

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Mi App</h1>
      
      <div className="flex items-center gap-4">
        <NotificationDropdown
          onNotificationClick={(notification) => {
            console.log('Clicked:', notification);
            // Navegar a detalles o realizar acción
          }}
          onViewAll={() => {
            // Navegar a página de notificaciones
            router.push('/notificaciones');
          }}
        />
      </div>
    </header>
  );
}
```

## Componentes Principales

### NotificationDropdown

Componente principal que muestra el dropdown de notificaciones.

```tsx
<NotificationDropdown
  className="custom-class"
  triggerClassName="trigger-custom"
  dropdownClassName="dropdown-custom"
  maxHeight="max-h-96"
  showViewAllButton={true}
  onViewAll={() => router.push('/notificaciones')}
  onNotificationClick={(notification) => handleClick(notification)}
/>
```

**Props:**
- `className`: Clases CSS para el contenedor
- `triggerClassName`: Clases para el botón trigger
- `dropdownClassName`: Clases para el panel dropdown
- `maxHeight`: Altura máxima del contenido
- `showViewAllButton`: Mostrar botón "Ver todas"
- `onViewAll`: Callback al hacer clic en "Ver todas"
- `onNotificationClick`: Callback al hacer clic en una notificación

### NotificationItem

Componente individual para mostrar cada notificación.

```tsx
<NotificationItem
  notification={notification}
  onMarkAsRead={(id) => markAsRead(id)}
  onDelete={(id) => deleteNotification(id)}
  onViewDetails={(notification) => viewDetails(notification)}
  showActions={true}
  compact={false}
  className="custom-item"
/>
```

### NotificationBadge

Badge para mostrar contadores de notificaciones.

```tsx
// Badge básico
<NotificationBadge
  count={5}
  variant="default"
  size="md"
  position="top-right"
>
  <Bell className="w-5 h-5" />
</NotificationBadge>

// Badge especializado para notificaciones
<NotificationCountBadge
  unreadCount={3}
  totalCount={10}
  showTotal={false}
  pulse={true}
>
  <BellIcon />
</NotificationCountBadge>
```

### NotificationIcon

Iconos dinámicos según el tipo de notificación.

```tsx
// Icono por tipo
<NotificationIcon
  type="ANALISIS_FINALIZADO"
  size="md"
  withBackground={true}
  animated={true}
/>

// Icono interactivo
<InteractiveNotificationIcon
  hasNotifications={true}
  hasUnread={true}
  onClick={() => setDropdownOpen(true)}
/>
```

## Hooks Personalizados

### useNotificationContext

Hook principal para acceder al contexto de notificaciones.

```tsx
const {
  notifications,
  unreadCount,
  totalCount,
  loading,
  error,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  refreshNotifications
} = useNotificationContext();
```

### useNotificationBadge

Hook especializado para badges.

```tsx
const {
  unreadCount,
  totalCount,
  hasUnread,
  hasNotifications,
  loading
} = useNotificationBadge();
```

### useNotificationDropdown

Hook para el dropdown con paginación.

```tsx
const {
  notifications,
  loading,
  error,
  pagination,
  actions,
  dropdown
} = useNotificationDropdown();
```

### useNotificationStats

Hook para estadísticas de notificaciones.

```tsx
const {
  total,
  unread,
  read,
  unreadPercentage,
  byType,
  todayCount
} = useNotificationStats();
```

## Utilidades

### Formateo de Fechas

```tsx
import { formatNotificationDate, formatNotificationDateTime } from '@/components/notificaciones';

const relativeTime = formatNotificationDate('2024-01-01T10:00:00Z'); // "Hace 2h"
const fullDateTime = formatNotificationDateTime('2024-01-01T10:00:00Z'); // "01/01/2024 10:00"
```

### Filtros

```tsx
import { filterNotifications, sortNotifications } from '@/components/notificaciones';

const unreadOnly = filterNotifications.unread(notifications);
const byType = filterNotifications.byType(notifications, 'ANALISIS_FINALIZADO');
const recent = filterNotifications.recent(notifications, 24); // últimas 24 horas

const sorted = sortNotifications.byDate(notifications, false); // más recientes primero
```

### Configuración de Tipos

```tsx
import { getNotificationTypeConfig } from '@/components/notificaciones';

const config = getNotificationTypeConfig('USUARIO_REGISTRO');
// { icon: 'User', color: 'text-blue-600', bgColor: 'bg-blue-50', ... }
```

## Ejemplos de Uso Avanzado

### Página Completa de Notificaciones

```tsx
// pages/notificaciones.tsx
import { 
  useNotificationContext,
  NotificationItem,
  filterNotifications,
  sortNotifications
} from '@/components/notificaciones';

export default function NotificationsPage() {
  const { notifications, loading, markAsRead, deleteNotification } = useNotificationContext();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  const filteredNotifications = useMemo(() => {
    let filtered = filterNotifications[filter](notifications);
    return sortNotifications.byDate(filtered, false);
  }, [notifications, filter]);
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Notificaciones</h1>
      
      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {['all', 'unread', 'read'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            className={cn(
              'px-3 py-1 rounded text-sm',
              filter === filterType ? 'bg-blue-600 text-white' : 'bg-gray-200'
            )}
          >
            {filterType === 'all' ? 'Todas' : filterType === 'unread' ? 'No leídas' : 'Leídas'}
          </button>
        ))}
      </div>
      
      {/* Lista */}
      <div className="space-y-2">
        {filteredNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            className="border rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
```

### Badge Personalizado en Sidebar

```tsx
// components/sidebar.tsx
import { useNotificationBadge, NotificationDot } from '@/components/notificaciones';

export default function Sidebar() {
  const { hasUnread } = useNotificationBadge();
  
  return (
    <nav className="sidebar">
      <Link href="/notificaciones" className="flex items-center gap-2">
        Notificaciones
        <NotificationDot active={hasUnread} pulse={true} />
      </Link>
    </nav>
  );
}
```

## Personalización

### Temas y Estilos

Todos los componentes usan clases de Tailwind CSS y pueden ser personalizados:

```tsx
<NotificationDropdown
  triggerClassName="bg-purple-100 hover:bg-purple-200"
  dropdownClassName="border-purple-200 shadow-purple-100"
/>
```

### Tipos de Notificación Personalizados

Extender las utilidades para nuevos tipos:

```tsx
// lib/utils/notification-utils.ts
export const customNotificationConfig = {
  ...notificationTypeConfig,
  MI_NUEVO_TIPO: {
    icon: 'CustomIcon',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Mi Nuevo Tipo'
  }
};
```

## Consideraciones de Rendimiento

1. **Auto-refresh**: Se puede deshabilitar si no es necesario
2. **Paginación**: Los componentes manejan paginación automáticamente
3. **Memorización**: Los hooks usan `useMemo` y `useCallback` para optimización
4. **Lazy loading**: Las notificaciones se cargan bajo demanda

## Troubleshooting

### Error: "useNotificationContext debe usarse dentro de NotificationProvider"

Asegúrate de que el componente esté envuelto en el `NotificationProvider`.

### Las notificaciones no se actualizan automáticamente

Verifica que `enableAutoRefresh` esté en `true` y que el intervalo sea adecuado.

### Problemas de tipos TypeScript

Asegúrate de que los tipos de `@/app/models` estén correctamente definidos y exportados.

## Roadmap

- [ ] Soporte para notificaciones push
- [ ] Filtros avanzados por fecha
- [ ] Notificaciones agrupadas
- [ ] Sonidos de notificación
- [ ] Modo offline
- [ ] Internacionalización (i18n)