# 🔍 Resumen: ESLint Configurado para Detectar Código No Utilizado

## ✅ ¿Qué se instaló?

Se configuró ESLint 9 con plugins especializados para detectar:

1. **Imports no utilizados** - Detecta funciones, tipos, interfaces del backend que importaste pero no usas
2. **Variables no utilizadas** - Detecta variables definidas pero nunca referenciadas
3. **Funciones no utilizadas** - Detecta funciones definidas pero nunca llamadas
4. **Imports duplicados** - Detecta cuando importas lo mismo dos veces
5. **Console.log** - Advierte sobre console.log (sugiere usar console.warn o console.error)
6. **Uso de `any`** - Advierte sobre el uso de tipos `any` en TypeScript

## 🚀 Comandos Principales

### 1️⃣ Analizar TODO el proyecto
```powershell
cd c:\Nadia\ProyectoFinal\inia-frontend-jc
npm run lint
```

### 2️⃣ **ELIMINAR automáticamente** imports y variables no usadas
```powershell
npm run lint:fix
```
⚠️ **IMPORTANTE**: Esto eliminará automáticamente código. Haz commit antes de ejecutar.

### 3️⃣ Analizar un archivo específico
```powershell
npx eslint app/login/page.tsx
```

### 4️⃣ Analizar una carpeta específica
```powershell
npx eslint app/registro/ --ext .ts,.tsx
npx eslint lib/validations/ --ext .ts
```

### 5️⃣ Generar reporte detallado
```powershell
.\analizar-codigo-no-usado.ps1
```
Esto generará un archivo `reporte-eslint.txt` con todos los problemas.

## 📊 Ejemplo de Salida

Cuando ejecutes `npm run lint`, verás algo como:

```
C:\Nadia\ProyectoFinal\inia-frontend-jc\app\login\page.tsx
   18:48  warning  'Requires2FAResponse' is defined but never used       unused-imports/no-unused-imports
   18:74  warning  'Requires2FASetupResponse' is defined but never used  unused-imports/no-unused-imports
   19:10  warning  'Input2FA' is defined but never used                  unused-imports/no-unused-imports

✖ 3 problems (0 errors, 3 warnings)
  0 errors and 3 warnings potentially fixable with the `--fix` option.
```

Esto significa que importaste estas 3 funciones/tipos pero no las estás usando en el archivo.

## 🎯 Casos de Uso Específicos

### Encontrar funciones del backend no utilizadas
```powershell
# Analizar solo archivos que importan de lib/
npx eslint app/ --ext .ts,.tsx | Select-String "unused-imports"
```

### Limpiar un archivo específico
```powershell
npx eslint app/login/page.tsx --fix
```

### Ver solo imports no utilizados (sin otros warnings)
```powershell
npm run lint:unused
```

## 📁 Archivos Creados

1. **`eslint.config.mjs`** - Configuración de ESLint
2. **`GUIA_ESLINT.md`** - Guía completa con ejemplos
3. **`analizar-codigo-no-usado.ps1`** - Script para generar reportes

## 🛠️ Scripts en package.json

| Script | Descripción |
|--------|-------------|
| `npm run lint` | Analiza todo el proyecto |
| `npm run lint:fix` | Elimina automáticamente código no usado |
| `npm run lint:strict` | Falla si hay warnings (para CI/CD) |
| `npm run lint:unused` | Muestra solo código no utilizado como errores |
| `npm run lint:report` | Genera reporte JSON |

## 💡 Consejos

### Antes de hacer un commit
```powershell
# 1. Ver qué hay que limpiar
npm run lint

# 2. Limpiar automáticamente
npm run lint:fix

# 3. Verificar que todo quedó bien
npm run lint
```

### Ignorar variables intencionalmente no usadas
Si tienes una variable que intencionalmente no usas (por ejemplo, para destructuring), prefíjala con `_`:

```typescript
// ❌ Esto generará warning
const { id, name, unusedField } = data;

// ✅ Esto NO generará warning
const { id, name, _unusedField } = data;
```

### Para funciones
```typescript
// ❌ Esto generará warning
function handleClick(event, unusedParam) { ... }

// ✅ Esto NO generará warning
function handleClick(event, _unusedParam) { ... }
```

## 🔄 Integración con VS Code

Para ver los warnings en tiempo real mientras editas:

1. Instala la extensión "ESLint" en VS Code
2. Los warnings aparecerán como líneas onduladas amarillas
3. Pasa el mouse sobre ellas para ver el mensaje
4. Click derecho → "Fix all auto-fixable problems" para corregir

## 📞 Problemas Comunes

### "No se encontraron problemas pero sé que hay imports no usados"
```powershell
# Asegúrate de estar en el directorio correcto
cd c:\Nadia\ProyectoFinal\inia-frontend-jc

# Ejecuta en un archivo específico
npx eslint app/login/page.tsx
```

### "Eliminó un import que sí necesito"
```powershell
# Revierte el cambio con git
git checkout -- archivo.tsx

# O agrega un comentario para que ESLint lo ignore:
// eslint-disable-next-line unused-imports/no-unused-imports
import { funcionNecesaria } from './lib'
```

### "Quiero desactivar una regla específica"
Edita `eslint.config.mjs` y cambia la regla de `'warn'` a `'off'`.

## 📈 Próximos Pasos

1. **Ejecuta** `npm run lint` para ver el estado actual
2. **Revisa** los warnings para entender qué código no se usa
3. **Ejecuta** `npm run lint:fix` para limpiar automáticamente
4. **Haz commit** de los cambios
5. **Configura** tu editor para ver los warnings en tiempo real

---

**¿Necesitas ayuda?** Consulta `GUIA_ESLINT.md` para ejemplos detallados.
