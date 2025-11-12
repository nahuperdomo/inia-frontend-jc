# Guía de ESLint - Detección de Código No Utilizado

## Configuración

Se ha configurado ESLint 9 con las siguientes características:

- ✅ **Detección de imports no utilizados** (incluyendo funciones del backend)
- ✅ **Detección de variables no utilizadas**
- ✅ **Detección de funciones no utilizadas**
- ✅ **Detección de tipos/interfaces importados pero no usados**
- ✅ **Detección de imports duplicados**
- ✅ Warnings para `console.log` (solo permite `console.warn` y `console.error`)
- ✅ Detección de uso de `any` en TypeScript

## 🎯 Detectar Funciones Importadas del Backend

ESLint ahora detecta automáticamente:

1. **Funciones importadas de `lib/` que no se usan**
2. **Tipos/interfaces importados pero no utilizados**
3. **Componentes importados pero no renderizados**
4. **Hooks importados pero no llamados**

### Ejemplo de salida:

```
app/login/page.tsx
   18:48  warning  'Requires2FAResponse' is defined but never used       unused-imports/no-unused-imports
   18:74  warning  'Requires2FASetupResponse' is defined but never used  unused-imports/no-unused-imports
   19:10  warning  'Input2FA' is defined but never used                  unused-imports/no-unused-imports
```

## Scripts Disponibles

### 1. Lint Normal (Warnings)
```bash
npm run lint
```
Ejecuta ESLint en todo el proyecto y muestra warnings para código no utilizado.

### 2. Lint con Auto-Fix
```bash
npm run lint:fix
```
Ejecuta ESLint y **automáticamente elimina** los imports no utilizados y corrige otros problemas automáticamente.

### 3. Lint Estricto
```bash
npm run lint:strict
```
Falla si encuentra cualquier warning. Útil para CI/CD.

### 4. Lint Solo Código No Utilizado
```bash
npm run lint:unused
```
Ejecuta ESLint mostrando **errores** (no warnings) solo para imports y variables no utilizados.

### 5. Generar Reporte JSON
```bash
npm run lint:report
```
Genera un archivo `eslint-report.json` con todos los problemas encontrados. Útil para análisis automatizado.

### 6. Lint de un Archivo Específico
```bash
npx eslint app/login/page.tsx
npx eslint app/login/page.tsx --fix
```

## Reglas Configuradas

### Variables y Funciones No Utilizadas

```javascript
@typescript-eslint/no-unused-vars
unused-imports/no-unused-imports
unused-imports/no-unused-vars
```

**Nota:** Puedes prefixar variables con `_` para indicar que intencionalmente no se usan:
```typescript
const _unusedVar = "esto no generará warning"
function myFunction(_unusedParam: string) { }
```

## 🔍 Ejemplos de lo que Detecta

### 1. Funciones Importadas del Backend No Usadas
```typescript
// ❌ ESLint advertirá sobre esto:
import { validarFichaUnica, validarNombreLoteUnico } from "@/lib/validations/lotes-async-validation"

// Solo usas validarFichaUnica, no validarNombreLoteUnico
const result = await validarFichaUnica(ficha);
```

**Solución automática con `npm run lint:fix`:**
```typescript
// ✅ ESLint eliminará el import no usado:
import { validarFichaUnica } from "@/lib/validations/lotes-async-validation"

const result = await validarFichaUnica(ficha);
```

### 2. Tipos/Interfaces Importados No Usados
```typescript
// ❌ ESLint advertirá:
import { LoteFormData, loteValidationSchema, OtroTipo } from "@/lib/validations/lotes-validation"

// Solo usas LoteFormData y loteValidationSchema, no OtroTipo
const formData: LoteFormData = { ... };
```

### 3. Variables Definidas pero No Usadas
```typescript
// ❌ ESLint advertirá:
const handleSubmit = async () => {
  const unusedVariable = "esto no se usa";
  const result = await fetchData();
  return result;
};
```

### 4. Funciones Definidas pero No Llamadas
```typescript
// ❌ ESLint advertirá:
const Component = () => {
  const unusedFunction = () => {
    console.log("nunca se llama");
  };
  
  return <div>Hello</div>;
};
```

### 5. Imports Duplicados
```typescript
// ❌ ESLint advertirá:
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Button as Btn } from "@/components/ui/button" // Duplicado!
```

## Otras Reglas

- `no-console`: Advierte sobre `console.log`, permite `console.warn` y `console.error`
- `prefer-const`: Sugiere usar `const` en lugar de `let` cuando es posible
- `@typescript-eslint/no-explicit-any`: Advierte sobre el uso de `any`

## Ejemplo de Uso

### Encontrar todas las funciones del backend no utilizadas:
```bash
npm run lint
```

Esto mostrará warnings como:
```
app/login/page.tsx
   18:48  warning  'Requires2FAResponse' is defined but never used       unused-imports/no-unused-imports
   19:10  warning  'Input2FA' is defined but never used                  unused-imports/no-unused-imports
```

### Limpiar automáticamente imports no utilizados:
```bash
npm run lint:fix
```

Esto **eliminará automáticamente** todos los imports que no estés usando, incluyendo:
- Funciones importadas de `lib/`
- Tipos/interfaces no utilizados
- Componentes no renderizados
- Hooks no llamados

### Ver todos los warnings:
```bash
npm run lint
```

### Limpiar imports automáticamente:
```bash
npm run lint:fix
```

### Ver solo problemas de código no utilizado:
```bash
npm run lint:unused
```

## Archivos Ignorados

Los siguientes directorios/archivos son ignorados por ESLint:
- `node_modules/**`
- `.next/**`
- `out/**`
- `dist/**`
- `build/**`
- `coverage/**`
- `public/**`
- `*.config.js`
- `*.config.mjs`
- `*.config.ts`
- `next-env.d.ts`

## Integración con VS Code

Para ver los warnings de ESLint en tiempo real en VS Code:

1. Instala la extensión "ESLint" de Microsoft
2. Los warnings aparecerán como líneas onduladas en el código
3. Puedes hacer clic derecho → "Fix all auto-fixable problems" para corregir automáticamente

## Ejemplo de Salida

```
C:\Nadia\ProyectoFinal\inia-frontend-jc\app\login\page.tsx
   18:48  warning  'Requires2FAResponse' is defined but never used       unused-imports/no-unused-imports
   18:74  warning  'Requires2FASetupResponse' is defined but never used  unused-imports/no-unused-imports
   19:10  warning  'Input2FA' is defined but never used                  unused-imports/no-unused-imports

✖ 3 problems (0 errors, 3 warnings)
  0 errors and 3 warnings potentially fixable with the `--fix` option.
```

## Recomendaciones

1. **Antes de hacer commit:** Ejecuta `npm run lint:fix` para limpiar automáticamente
2. **Revisión periódica:** Ejecuta `npm run lint` regularmente para mantener el código limpio
3. **CI/CD:** Usa `npm run lint:strict` en tu pipeline de CI/CD para prevenir merge de código con warnings

## Solución de Problemas

### Si encuentras muchos warnings:
```bash
# Corregir automáticamente lo que se pueda
npm run lint:fix

# Ver qué queda por corregir manualmente
npm run lint
```

### Para ver warnings de un directorio específico:
```bash
npx eslint app/login/**/*.tsx
npx eslint components/**/*.tsx --fix
```
