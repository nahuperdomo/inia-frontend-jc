# Especificaciones para v0: Página de Análisis de Germinación

## 🎯 Objetivo
Crear una página completa para gestionar análisis de germinación con múltiples pasos secuenciales y validaciones complejas.

## 📋 Componentes Requeridos

### 1. **Formulario Principal - Crear Análisis de Germinación**
```typescript
interface GerminacionRequestDTO {
  idLote: number;
  fechaInicioGerm: string; // date
  fechaConteos: string[]; // array de fechas (no-null)
  fechaUltConteo: string; // date
  numeroRepeticiones: number; // > 0, controla cuántas RepGerm crear
  numeroConteos: number; // > 0, controla tamaño del array normales[]
  numDias: string;
  comentarios?: string;
}
```

**Campos del formulario:**
- Select para Lote (obtener de `/api/lotes`)
- DatePicker para `fechaInicioGerm`
- Componente especial para `fechaConteos[]` (array dinámico de fechas)
- DatePicker para `fechaUltConteo`
- Input numérico para `numeroRepeticiones` (min: 1)
- Input numérico para `numeroConteos` (min: 1)
- Input para `numDias`
- TextArea para `comentarios`

### 2. **Gestión de Tablas de Germinación**
```typescript
interface TablaGermRequestDTO {
  tratamiento: string;
  productoYDosis: string;
  numSemillasPRep: number; // límite para validar repeticiones
  metodo: string;
  temperatura: number;
  prefrio: string;
  pretratamiento: string;
  total: number;
}
```

**UI requerida:**
- Lista de tablas existentes con estado `finalizada: boolean`
- Botón "Crear Nueva Tabla"
- Modal/formulario para crear tabla con todos los campos
- Indicador visual de progreso por tabla

### 3. **Repeticiones por Tabla (Componente Complejo)**
```typescript
interface RepGermRequestDTO {
  numRep: number; // auto-generado en backend
  normales: number[]; // array con tamaño = numeroConteos
  anormales: number;
  duras: number;
  frescas: number;
  muertas: number;
  total: number; // calculado automáticamente
}
```

**Diseño UI:**
```
Tabla: Control - Repetición 1 de 4
┌─────────────────────────────────────────────┐
│ Normales por Conteo:                        │
│ Conteo 1: [__] Conteo 2: [__] Conteo 3: [__]│
│                                             │
│ Anormales: [__] Duras: [__]                 │
│ Frescas: [__] Muertas: [__]                 │
│                                             │
│ Total: 45/100 semillas ✅                   │
└─────────────────────────────────────────────┘
```

**Validaciones en tiempo real:**
- Array `normales[]` debe tener exactamente `numeroConteos` elementos
- `total` no puede exceder `numSemillasPRep`
- Mostrar progreso: "Repetición X de Y completada ✅"

### 4. **Porcentajes con Redondeo (Paso Final)**
```typescript
interface PorcentajesRedondeoRequestDTO {
  porcentajeNormalesConRedondeo: number;
  porcentajeAnormalesConRedondeo: number;
  porcentajeDurasConRedondeo: number;
  porcentajeFrescasConRedondeo: number;
  porcentajeMuertasConRedondeo: number;
}
```

**UI requerida:**
- Solo habilitado cuando todas las repeticiones estén completas
- 5 inputs numéricos con validación que sumen 100%
- Mostrar cálculo automático vs. porcentajes ingresados
- Botón "Finalizar Tabla" (solo si suma 100%)

## 🔄 Flujo de Estados en la UI

### Estado 1: Análisis Creado
```
✅ Análisis de Germinación Creado
📋 Estado: REGISTRADO
🎯 Siguiente: Crear tablas de germinación
```

### Estado 2: Tablas en Desarrollo
```
📊 Tabla 1: Control
├── ✅ Parámetros configurados
├── 🔄 Repeticiones: 2/4 completadas
└── ⏳ Pendiente: completar repeticiones

📊 Tabla 2: Tratamiento A
├── ⏳ Pendiente: crear repeticiones
```

### Estado 3: Listo para Porcentajes
```
📊 Tabla 1: Control
├── ✅ 4/4 repeticiones completas
├── 🎯 Acción: Ingresar porcentajes con redondeo
└── 📊 Promedios automáticos calculados
```

### Estado 4: Tabla Finalizada
```
📊 Tabla 1: Control ✅ FINALIZADA
├── ✅ Porcentajes: 100% validado
├── 📅 Fecha final: 2025-01-15
└── 🔒 No modificable
```

## 🛠️ Endpoints de la API

```typescript
// Análisis principal
POST /api/germinacion - crear
PUT /api/germinacion/{id} - actualizar
DELETE /api/germinacion/{id} - eliminar (soft delete)
PUT /api/germinacion/{id}/finalizar - finalizar análisis

// Tablas
POST /api/germinacion/{id}/tabla - crear tabla
GET /api/germinacion/{id}/tabla - listar tablas
PUT /api/germinacion/{germinacionId}/tabla/{tablaId} - actualizar
DELETE /api/germinacion/{germinacionId}/tabla/{tablaId} - eliminar
PUT /api/germinacion/{germinacionId}/tabla/{tablaId}/finalizar - finalizar tabla
PUT /api/germinacion/{germinacionId}/tabla/{tablaId}/porcentajes - actualizar porcentajes
GET /api/germinacion/{germinacionId}/tabla/{tablaId}/puede-ingresar-porcentajes - validar

// Repeticiones
POST /api/germinacion/{germinacionId}/tabla/{tablaId}/repeticion - crear
GET /api/germinacion/{germinacionId}/tabla/{tablaId}/repeticion - listar
PUT /api/germinacion/{germinacionId}/tabla/{tablaId}/repeticion/{repId} - actualizar
DELETE /api/germinacion/{germinacionId}/tabla/{tablaId}/repeticion/{repId} - eliminar
GET /api/germinacion/{germinacionId}/tabla/{tablaId}/repeticion/contar - contar

// Valores por instituto
GET /api/valores-germ/tabla/{tablaId} - obtener todos
PUT /api/valores-germ/{id} - actualizar valores específicos
GET /api/valores-germ/tabla/{tablaId}/inia - obtener INIA
GET /api/valores-germ/tabla/{tablaId}/inase - obtener INASE
```

## 🎨 Diseño de Componentes Recomendado

### Layout Principal
```
┌─────────────────────────────────────────────────┐
│ 🧪 Análisis de Germinación - Lote #123          │
├─────────────────────────────────────────────────┤
│ [Paso 1] [Paso 2] [Paso 3] [Paso 4] [Final]    │ ← Progress Steps
├─────────────────────────────────────────────────┤
│                                                 │
│           CONTENIDO DINÁMICO                    │
│              POR PASO                           │
│                                                 │
├─────────────────────────────────────────────────┤
│ [← Anterior] [Guardar] [Siguiente →] [Finalizar]│
└─────────────────────────────────────────────────┘
```

### Componente de Repetición (Más Detallado)
```typescript
interface RepeticionFormProps {
  tablaId: number;
  numeroConteos: number;
  numSemillasPRep: number;
  onComplete: (repeticion: RepGermDTO) => void;
}

// Mostrar inputs dinámicos según numeroConteos
// Validar total en tiempo real
// Deshabilitar si excede numSemillasPRep
```

## ⚠️ Validaciones Críticas para Implementar

1. **Fechas de Conteo**: No permitir fechas null en el array
2. **Número de Repeticiones**: Controlar cuántas se pueden crear
3. **Array Normales**: Siempre debe tener `numeroConteos` elementos
4. **Total por Repetición**: No exceder `numSemillasPRep`
5. **Porcentajes**: Deben sumar exactamente 100%
6. **Estados**: Validar permisos según el estado del análisis

## 🚀 Funcionalidades Avanzadas

### Progreso Visual
- Progress bar por tabla
- Checkmarks por repetición completada  
- Indicadores de estado (🟢 completo, 🟡 en progreso, ⚪ pendiente)

### Cálculos en Tiempo Real
- Total automático por repetición
- Validación de límites
- Preview de porcentajes automáticos vs manuales

### Navegación Inteligente
- Deshabilitar pasos futuros hasta completar el actual
- Botones contextuales según el estado
- Confirmaciones antes de finalizar

Este documento te permitirá pedirle a v0 que construya una interfaz completa y funcional para el proceso de germinación con todas las validaciones y flujos necesarios.