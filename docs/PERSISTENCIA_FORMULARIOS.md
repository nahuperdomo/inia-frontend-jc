# Sistema de Persistencia de Formularios

## 📋 Descripción

Sistema reutilizable y escalable para persistir el estado de formularios en el navegador. Los datos se guardan automáticamente en `sessionStorage` (por defecto) o `localStorage`, evitando que se pierdan al navegar entre tabs o recargar la página.

## 🎯 Características

- ✅ **Persistencia automática**: Los datos se guardan al cambiar
- ✅ **Múltiples storages**: Soporta `sessionStorage` (default) y `localStorage`
- ✅ **Expiración opcional**: Para `localStorage` se puede configurar tiempo de expiración
- ✅ **Sincronización bidireccional**: Entre el estado local y el storage
- ✅ **Type-safe**: Totalmente tipado con TypeScript
- ✅ **Limpieza automática**: Función helper para limpiar datos al completar formularios
- ✅ **Modo edición**: No persiste datos si hay registros precargados

## 📦 Instalación

Los hooks ya están disponibles en el proyecto:

```typescript
import { usePersistentForm, usePersistentArray } from "@/lib/hooks/use-form-persistence"
import { clearDosnStorage } from "@/lib/utils/clear-form-storage"
```

## 🔧 Uso Básico

### Hook `usePersistentForm`

Para campos individuales o grupos de campos:

```typescript
import { usePersistentForm } from "@/lib/hooks/use-form-persistence"

type FormData = {
  nombre: string
  email: string
  edad: number
}

export default function MiComponente() {
  const { formState, updateField, updateFields, resetForm } = usePersistentForm<FormData>({
    storageKey: "mi-formulario-unico", // Clave única
    initialData: {
      nombre: "",
      email: "",
      edad: 0
    },
    storage: "session", // "session" o "local"
    expirationMinutes: 30 // Opcional, solo para localStorage
  })

  return (
    <div>
      <input
        value={formState.nombre}
        onChange={(e) => updateField("nombre", e.target.value)}
      />
      <input
        value={formState.email}
        onChange={(e) => updateField("email", e.target.value)}
      />
    </div>
  )
}
```

### Hook `usePersistentArray`

Para listas dinámicas (malezas, cultivos, etc.):

```typescript
import { usePersistentArray } from "@/lib/hooks/use-form-persistence"

type Item = {
  nombre: string
  cantidad: number
}

export default function ListaDinamica() {
  const { array, setArray, resetArray } = usePersistentArray<Item>(
    "mi-lista-items",
    [{ nombre: "", cantidad: 0 }] // Valor inicial
  )

  const agregarItem = () => {
    setArray([...array, { nombre: "", cantidad: 0 }])
  }

  const actualizarItem = (index: number, campo: keyof Item, valor: any) => {
    const updated = [...array]
    updated[index] = { ...updated[index], [campo]: valor }
    setArray(updated)
  }

  return (
    <div>
      {array.map((item, i) => (
        <div key={i}>
          <input
            value={item.nombre}
            onChange={(e) => actualizarItem(i, "nombre", e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}
```

## 🎨 Ejemplo Real: DOSN

### Campos de Brassica

```typescript
export default function BrassicaSection({ registros, onChangeListados }: Props) {
  const initialBrassicas = registros && registros.length > 0
    ? registros.map((r) => ({ /* mapear datos */ }))
    : [{ contiene: "", entidad: "", numero: "" }]

  // ✅ Solo persiste si no hay registros precargados (modo creación)
  const persistence = usePersistentArray<Brassica>(
    "dosn-brassicas",
    initialBrassicas
  )

  const [brassicas, setBrassicas] = useState<Brassica[]>(
    registros && registros.length > 0 ? initialBrassicas : persistence.array
  )

  // Sincronizar cambios con persistencia
  useEffect(() => {
    if (!registros || registros.length === 0) {
      persistence.setArray(brassicas)
    }
  }, [brassicas])

  // ... resto del componente
}
```

### Campos Generales DOSN

```typescript
export default function DosnFields({ formData, handleInputChange }: Props) {
  const { formState: persistedDosn, updateField } = usePersistentForm({
    storageKey: "dosn-datos-generales",
    initialData: {
      iniaFecha: formData.iniaFecha || "",
      iniaGramos: formData.iniaGramos || "",
      // ... más campos
    }
  })

  // Restaurar datos al montar
  useEffect(() => {
    Object.keys(persistedDosn).forEach((key) => {
      if (!formData[key] && persistedDosn[key]) {
        handleInputChange(key, persistedDosn[key])
      }
    })
  }, [])

  const handleFieldChange = (field: string, value: any) => {
    handleInputChange(field, value)
    updateField(field, value)
  }

  return (
    <Input
      value={formData.iniaFecha}
      onChange={(e) => handleFieldChange("iniaFecha", e.target.value)}
    />
  )
}
```

## 🧹 Limpieza de Storage

Después de un registro exitoso, limpia el storage para evitar conflictos:

```typescript
import { clearDosnStorage } from "@/lib/utils/clear-form-storage"

const handleSubmit = async () => {
  try {
    const result = await registrarAnalisis(payload, "dosn")
    
    toast.success("Análisis registrado exitosamente")
    
    // ✅ Limpiar storage
    clearDosnStorage()
    
    router.push(`/listado/analisis/dosn/${result.analisisID}`)
  } catch (error) {
    toast.error("Error al registrar")
  }
}
```

### Funciones de Limpieza Disponibles

```typescript
import {
  clearDosnStorage,           // Limpia todos los datos de DOSN
  clearGerminacionStorage,    // Limpia datos de Germinación
  clearTetrazolioStorage,     // Limpia datos de Tetrazolio
  clearPurezaStorage,         // Limpia datos de Pureza
  clearAllFormsStorage        // Limpia TODOS los formularios
} from "@/lib/utils/clear-form-storage"
```

## 🔑 Claves de Storage Usadas

### DOSN
- `dosn-datos-generales`
- `dosn-brassicas`
- `dosn-otros-cultivos`
- `dosn-malezas-Malezas`
- `dosn-cuscuta`
- `dosn-cumple-estandar`

### Germinación
- `germinacion-datos-generales`

### Tetrazolio
- `tetrazolio-datos-generales`

### Pureza
- `pureza-datos-generales`
- `pureza-malezas`

## ⚙️ Configuración Avanzada

### Expiración Automática

```typescript
usePersistentForm({
  storageKey: "mi-form",
  initialData: {},
  storage: "local",          // Usar localStorage
  expirationMinutes: 60      // Expira en 1 hora
})
```

### Manejo Manual de Persistencia

```typescript
const { formState, updateFields, clearStorage } = usePersistentForm({
  storageKey: "mi-form",
  initialData: {}
})

// Actualizar múltiples campos a la vez
updateFields({
  campo1: "valor1",
  campo2: "valor2"
})

// Limpiar manualmente
clearStorage()
```

## 🐛 Debugging

Los hooks incluyen logs para facilitar el debugging:

```typescript
// En la consola verás:
"✅ Storage de DOSN limpiado exitosamente"
"Error loading from storage: [error details]"
"Error saving to storage: [error details]"
```

## 📊 Diferencias: sessionStorage vs localStorage

| Característica | sessionStorage | localStorage |
|---------------|----------------|--------------|
| **Duración** | Hasta cerrar pestaña | Permanente |
| **Compartido entre pestañas** | ❌ No | ✅ Sí |
| **Ideal para** | Formularios temporales | Datos persistentes |
| **Expiración** | No necesaria | Configurable |

## 🚀 Mejores Prácticas

1. **Usa claves únicas**: Evita colisiones con otros formularios
2. **Limpia después del submit**: Previene datos antiguos
3. **sessionStorage para formularios**: Más seguro y no contamina
4. **localStorage para preferencias**: Configuraciones del usuario
5. **Modo edición**: No persistas si hay datos precargados

## 📝 Ejemplo Completo

Ver archivos de referencia:
- `/lib/hooks/use-form-persistence.ts` - Hooks principales
- `/lib/utils/clear-form-storage.ts` - Funciones de limpieza
- `/app/registro/analisis/dosn/fields/fields-brassica.tsx` - Ejemplo con arrays
- `/app/registro/analisis/dosn/form-dosn.tsx` - Ejemplo con campos generales

## 🤝 Contribuir

Para agregar persistencia a un nuevo formulario:

1. Identifica qué datos necesitas persistir
2. Usa `usePersistentForm` o `usePersistentArray` según corresponda
3. Agrega una clave única en `storageKey`
4. Crea función de limpieza en `clear-form-storage.ts`
5. Llama a la limpieza después del submit exitoso

## ❓ FAQ

**P: ¿Por qué usar sessionStorage y no solo el estado de React?**
R: React pierde el estado al cambiar de tab o recargar. sessionStorage lo preserva durante la sesión.

**P: ¿Qué pasa si el usuario tiene el storage deshabilitado?**
R: Los hooks manejan el error gracefully y continúan sin persistencia.

**P: ¿Se puede persistir entre diferentes páginas?**
R: Sí, pero solo con localStorage. sessionStorage es por pestaña.

**P: ¿Cuántos datos puedo guardar?**
R: sessionStorage/localStorage tienen límite de ~5-10MB dependiendo del navegador.

---

**Desarrollado para INIA** - Sistema de gestión de análisis de semillas
