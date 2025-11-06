# Sistema 2FA Frontend - Documentación de Implementación

## 📋 Resumen

Se ha implementado completamente el frontend para el sistema de autenticación de dos factores (2FA) con Google Authenticator, incluyendo:

- ✅ Login con soporte para 2FA y dispositivos de confianza
- ✅ Recuperación de contraseña con doble verificación
- ✅ Device fingerprinting para identificación de dispositivos
- ✅ Componentes UI especializados para códigos 2FA

---

## 📁 Archivos Creados/Modificados

### 1. Librerías y Servicios

#### `lib/fingerprint.ts` ✨ NUEVO
**Propósito**: Generar identificadores únicos de dispositivos usando FingerprintJS

**Funciones principales:**
```typescript
// Genera fingerprint único del dispositivo
getDeviceFingerprint(): Promise<string>

// Pre-carga el agente (optimización)
preloadFingerprint(): Promise<void>

// Obtiene info legible del dispositivo
getDeviceInfo(): object
```

**Características:**
- Usa FingerprintJS para fingerprinting robusto
- Fallback a método básico si FingerprintJS falla
- Canvas, WebGL, Audio fingerprinting
- Parser de User-Agent incluido

**Dependencias:**
```bash
npm install @fingerprintjs/fingerprintjs
```

---

#### `app/services/auth-2fa-service.ts` ✨ NUEVO
**Propósito**: Cliente para endpoints de autenticación 2FA del backend

**Funciones principales:**
```typescript
// Login con soporte 2FA
login2FA(credentials: Login2FARequest): Promise<Login2FAResponse | Requires2FAResponse>

// Solicitar código de recuperación
forgotPassword(email: string): Promise<ForgotPasswordResponse>

// Resetear contraseña con doble verificación
resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse>

// Validaciones
validateTotpCodeFormat(code: string): boolean
validateRecoveryCodeFormat(code: string): boolean
validatePasswordStrength(password: string): object
formatRecoveryCode(code: string): string
```

**Interfaces TypeScript:**
```typescript
interface Login2FARequest {
  usuario: string;
  password: string;
  totpCode?: string;
  deviceFingerprint?: string;
  trustDevice?: boolean;
}

interface Requires2FAResponse {
  requires2FA: boolean;
  mensaje: string;
  userId: number;
}
```

**Endpoint consumido:**
- `POST /api/login-2fa`
- `POST /api/forgot-password`
- `POST /api/reset-password`

---

### 2. Componentes UI

#### `components/ui/input-2fa.tsx` ✨ NUEVO
**Propósito**: Inputs especializados para códigos de autenticación

**Componentes exportados:**

**`<Input2FA />`** - Código TOTP de 6 dígitos
```typescript
<Input2FA
  value={totpCode}
  onChange={setTotpCode}
  onComplete={(code) => {
    // Auto-submit cuando se completa
  }}
  disabled={isLoading}
  error={hasError}
  autoFocus
/>
```

**Características:**
- 6 inputs individuales para cada dígito
- Auto-advance al siguiente input
- Soporte para pegar código completo
- Navegación con flechas/Backspace
- Auto-submit al completar
- Diseño visual optimizado

**`<InputRecoveryCode />`** - Código de recuperación XXXX-XXXX
```typescript
<InputRecoveryCode
  value={recoveryCode}
  onChange={setRecoveryCode}
  disabled={isLoading}
  error={hasError}
  placeholder="XXXX-XXXX"
/>
```

**Características:**
- Auto-formateo con guión
- Solo alfanuméricos mayúsculas
- Máximo 8 caracteres + guión
- Soporte para pegar código

---

#### `components/ui/progress.tsx` ✨ NUEVO
**Propósito**: Barra de progreso para indicador de fortaleza de contraseña

```typescript
<Progress value={75} className="h-2 bg-green-100" />
```

---

### 3. Páginas

#### `app/login/page.tsx` ✏️ MODIFICADO
**Propósito**: Página de login con soporte completo para 2FA

**Flujos implementados:**

**Flujo 1: Login sin 2FA** (usuario tradicional)
```
Usuario/Password → Login directo → Dashboard
```

**Flujo 2: Login con 2FA + Dispositivo de confianza**
```
Usuario/Password + Fingerprint → 
Backend verifica dispositivo es de confianza → 
Login directo → Dashboard
```

**Flujo 3: Login con 2FA + Dispositivo nuevo**
```
Usuario/Password + Fingerprint → 
Backend responde requires2FA: true → 
Mostrar input de código 2FA → 
Usuario ingresa código de Google Auth → 
Verificar código → 
Opcional: Guardar como dispositivo de confianza → 
Dashboard
```

**Características:**
- Device fingerprint generado automáticamente al cargar
- Estado `requires2FA` para mostrar/ocultar input de código
- Checkbox "Confiar en este dispositivo por 30 días"
- Auto-submit al completar código 2FA
- Botón "Volver" para cambiar credenciales
- Link a "¿Olvidaste tu contraseña?"

**Mejoras visuales:**
- Icono Shield para indicar 2FA
- Icono Smartphone con instrucción de Google Authenticator
- Input2FA con 6 campos individuales
- Mensajes de error específicos

**Estados del formulario:**
```typescript
const [requires2FA, setRequires2FA] = useState(false)
const [totpCode, setTotpCode] = useState("")
const [trustDevice, setTrustDevice] = useState(true)
const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null)
```

---

#### `app/forgot-password/page.tsx` ✨ NUEVO
**Propósito**: Solicitar código de recuperación de contraseña

**Flujo:**
```
Usuario ingresa email → 
Backend valida (email existe + tiene 2FA habilitado) → 
Genera código 8 caracteres → 
Envía email con código → 
Redirige a /reset-password?email=...
```

**Características:**
- Validación de email en tiempo real
- Alert informativo sobre requisitos (2FA habilitado)
- Estado de éxito con auto-redirect
- Mensajes de error específicos:
  - Email no existe
  - Usuario no tiene 2FA habilitado
  - Cuenta inactiva

**Pantalla de éxito:**
- Alert verde con check
- Muestra email donde se envió el código
- Indica validez de 10 minutos
- Botón "Continuar" a reset-password
- Auto-redirect en 2 segundos

**UI/UX:**
- Icono Mail en input
- Alert azul con requisitos
- Botón "Volver al login"
- Loading state con spinner

---

#### `app/reset-password/page.tsx` ✨ NUEVO
**Propósito**: Resetear contraseña con doble verificación (email + 2FA)

**Flujo:**
```
Usuario llega desde forgot-password (email pre-llenado) → 
Ingresa código de recuperación (email) → 
Ingresa código de Google Authenticator → 
Ingresa nueva contraseña + confirmación → 
Backend valida códigos + no expirados → 
Cambia contraseña → 
Revoca TODOS los dispositivos de confianza → 
Redirige a login
```

**Características:**

**Formulario completo:**
1. **Email** - Pre-llenado desde query param
2. **Código de Recuperación** - Input especial XXXX-XXXX
3. **Código 2FA** - Input2FA de 6 dígitos
4. **Nueva Contraseña** - Con indicador de fortaleza
5. **Confirmar Contraseña** - Validación de coincidencia

**Validaciones en tiempo real:**
```typescript
// Formato de código de recuperación
validateRecoveryCodeFormat(recoveryCode)

// Formato de código TOTP
validateTotpCodeFormat(totpCode)

// Fortaleza de contraseña
const validation = validatePasswordStrength(newPassword)
// → { isValid, strength: 'weak'|'medium'|'strong', message }

// Coincidencia de contraseñas
const passwordsMatch = newPassword === confirmPassword
```

**Indicador de fortaleza visual:**
- Barra de progreso con color:
  - Rojo (33%) - Débil
  - Amarillo (66%) - Media
  - Verde (100%) - Fuerte
- Mensaje descriptivo de la fortaleza
- Se muestra en tiempo real al escribir

**Mensajes de error específicos:**
- "Código de recuperación incorrecto"
- "Código ha expirado (10 min). Solicita uno nuevo"
- "Código de Google Authenticator incorrecto"
- "Contraseña debe tener mínimo 8 caracteres"
- "Email no existe"

**Pantalla de éxito:**
- Alert verde con check
- Mensaje: "Todos tus dispositivos de confianza han sido revocados por seguridad"
- Auto-redirect a login en 3 segundos

**UI/UX:**
- Iconos contextuales (Mail, Key, Shield)
- Alert amber con advertencia de doble verificación
- Botón show/hide password
- Progress bar para fortaleza
- Link "¿No recibiste el código?" → forgot-password
- Botón "Volver al login"
- Suspense boundary con loading spinner

---

## 🎨 Componentes Visuales Clave

### Input de Código 2FA
```
┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │
└───┘ └───┘ └───┘ └───┘ └───┘ └───┘
```

### Input de Código de Recuperación
```
┌─────────────────────┐
│    ABCD-1234        │
└─────────────────────┘
```

### Indicador de Fortaleza de Contraseña
```
Débil:   ▓▓▓░░░░░░  33%  🔴
Media:   ▓▓▓▓▓▓░░░  66%  🟡
Fuerte:  ▓▓▓▓▓▓▓▓▓ 100%  🟢
```

---

## 🔄 Flujos Completos

### Flujo 1: Login con 2FA (Primera vez en dispositivo)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario ingresa credenciales                            │
│    - usuario: "jperez"                                      │
│    - password: "password123"                                │
│    [Generar fingerprint en background]                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. POST /api/login-2fa                                      │
│    {                                                        │
│      usuario: "jperez",                                     │
│      password: "password123",                               │
│      deviceFingerprint: "abc123..."                         │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend responde 403 Forbidden                           │
│    {                                                        │
│      requires2FA: true,                                     │
│      mensaje: "Se requiere código 2FA",                     │
│      userId: 1                                              │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Frontend muestra Input2FA                                │
│    🔐 Autenticación de Dos Factores                         │
│    "Ingresa el código de Google Authenticator"             │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                  │
│    │   │ │   │ │   │ │   │ │   │ │   │                  │
│    └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                  │
│    ☑ Confiar en este dispositivo por 30 días               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Usuario abre Google Authenticator                        │
│    📱 INIA Sistema                                          │
│       654 321                                               │
│       ⏱ 25s                                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Usuario ingresa código 654321                            │
│    [Auto-submit al completar 6 dígitos]                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. POST /api/login-2fa                                      │
│    {                                                        │
│      usuario: "jperez",                                     │
│      password: "password123",                               │
│      totpCode: "654321",                                    │
│      deviceFingerprint: "abc123...",                        │
│      trustDevice: true                                      │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Backend valida código TOTP                               │
│    ✅ Código válido                                         │
│    ✅ Guarda dispositivo en trusted_devices                │
│    📧 Envía email: "Nuevo dispositivo registrado"          │
│    🍪 Set-Cookie: accessToken, refreshToken                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. Frontend recibe 200 OK                                   │
│    {                                                        │
│      mensaje: "Login exitoso",                              │
│      usuario: { ... }                                       │
│    }                                                        │
│    → Redirige a /dashboard                                 │
└─────────────────────────────────────────────────────────────┘
```

---

### Flujo 2: Login con Dispositivo de Confianza

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario ingresa credenciales                            │
│    [Fingerprint generado: "abc123..." - mismo dispositivo] │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. POST /api/login-2fa                                      │
│    {                                                        │
│      usuario: "jperez",                                     │
│      password: "password123",                               │
│      deviceFingerprint: "abc123..."                         │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend verifica fingerprint                             │
│    ✅ Hash SHA-256 coincide con trusted_devices            │
│    ✅ Dispositivo no expirado (< 30 días)                  │
│    ✅ Actualiza last_used_at                               │
│    ✅ Renueva expires_at (+30 días)                        │
│    🍪 Set-Cookie: accessToken, refreshToken                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Frontend recibe 200 OK (SIN solicitar código 2FA)       │
│    → Redirige directo a /dashboard                         │
└─────────────────────────────────────────────────────────────┘
```

---

### Flujo 3: Recuperación de Contraseña

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario en /login click "¿Olvidaste tu contraseña?"     │
│    → Navega a /forgot-password                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Ingresa email: juan.perez@inia.org.uy                   │
│    Click "Enviar código de recuperación"                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. POST /api/forgot-password                                │
│    { email: "juan.perez@inia.org.uy" }                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend procesa                                          │
│    ✅ Email existe                                          │
│    ✅ Usuario tiene 2FA habilitado                         │
│    🔐 Genera código: "ABCD-1234"                           │
│    🔒 Hash BCrypt → guarda en recovery_code_hash           │
│    ⏱ Expiry: NOW() + 10 minutos                            │
│    📧 Envía email con código                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Usuario recibe email                                     │
│    ┌───────────────────────────────────────────┐           │
│    │ 📧 Código de Recuperación INIA            │           │
│    │                                            │           │
│    │ Código: ABCD-1234                          │           │
│    │ Validez: 10 minutos                        │           │
│    └───────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Frontend muestra éxito y redirige                        │
│    → /reset-password?email=juan.perez@inia.org.uy          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Página reset-password pre-llena email                    │
│    Usuario completa formulario:                             │
│    - Email: juan.perez@inia.org.uy ✅ (pre-llenado)        │
│    - Código recuperación: ABCD-1234                         │
│    - Código 2FA: 789012 (Google Authenticator)             │
│    - Nueva password: NuevaPass123!                          │
│    - Confirmar password: NuevaPass123!                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. POST /api/reset-password                                 │
│    {                                                        │
│      email: "juan.perez@inia.org.uy",                      │
│      recoveryCode: "ABCD1234",                              │
│      totpCode: "789012",                                    │
│      newPassword: "NuevaPass123!"                           │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. Backend valida                                           │
│    ✅ Recovery code válido (BCrypt compare)                │
│    ✅ No expirado (< 10 min)                               │
│    ✅ TOTP code válido                                      │
│    🔒 Cambia password (BCrypt hash)                        │
│    🗑️ Limpia recovery_code_hash                            │
│    🔥 REVOCA todos trusted_devices del usuario             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. Frontend muestra éxito                                  │
│     "Contraseña actualizada exitosamente"                   │
│     "Todos tus dispositivos fueron revocados por seguridad" │
│     → Auto-redirige a /login en 3 segundos                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Manual

### Test 1: Login sin 2FA (Usuario Tradicional)
```bash
# Usuario sin totp_enabled
1. Ir a /login
2. Ingresar usuario/password
3. Click "Iniciar sesión"
✅ Debe redirigir directo a /dashboard (SIN pedir código 2FA)
```

### Test 2: Login con 2FA - Primera Vez
```bash
# Usuario con totp_enabled = true
1. Ir a /login
2. Ingresar usuario/password
3. Click "Iniciar sesión"
✅ Debe mostrar input de código 2FA
4. Abrir Google Authenticator
5. Ingresar código de 6 dígitos
6. Marcar "Confiar en este dispositivo"
7. Click "Verificar código"
✅ Debe redirigir a /dashboard
✅ Verificar email: "Nuevo dispositivo registrado"
```

### Test 3: Login con Dispositivo de Confianza
```bash
# Mismo navegador/dispositivo del Test 2
1. Cerrar sesión
2. Ir a /login
3. Ingresar usuario/password
4. Click "Iniciar sesión"
✅ Debe redirigir directo a /dashboard (SIN pedir código 2FA)
```

### Test 4: Código 2FA Inválido
```bash
1. Login con usuario 2FA
2. Ingresar código incorrecto "000000"
✅ Debe mostrar error: "Código de autenticación inválido"
```

### Test 5: Recuperación de Contraseña - Flujo Completo
```bash
1. Ir a /login
2. Click "¿Olvidaste tu contraseña?"
3. Ingresar email con 2FA habilitado
4. Click "Enviar código"
✅ Debe mostrar éxito y redirigir a /reset-password
✅ Verificar email recibido con código XXXX-XXXX

5. En /reset-password:
   - Email: pre-llenado ✅
   - Código recuperación: ABCD-1234 (del email)
   - Código 2FA: 123456 (Google Auth)
   - Nueva password: Test1234!
   - Confirmar password: Test1234!
6. Click "Restablecer contraseña"
✅ Debe mostrar éxito
✅ Mensaje: "Dispositivos revocados por seguridad"
✅ Auto-redirige a /login

7. Login con nueva contraseña
✅ Debe pedir código 2FA (dispositivos revocados)
```

### Test 6: Código de Recuperación Expirado
```bash
1. Solicitar código forgot-password
2. Esperar 11 minutos
3. Intentar usar el código en reset-password
✅ Error: "Código ha expirado. Solicita uno nuevo"
```

### Test 7: Validación de Contraseñas
```bash
1. En /reset-password, probar passwords:
   - "abc" → ❌ "Mínimo 8 caracteres"
   - "password" → ⚠️ Débil (barra roja)
   - "Password1" → ⚠️ Media (barra amarilla)
   - "Password1!" → ✅ Fuerte (barra verde)
```

---

## 📱 Responsive Design

Todos los componentes son responsive:
- Cards con max-width: 28rem (448px)
- Padding adaptativo
- Input2FA se ajusta en móviles
- Botones full-width en móvil

---

## ♿ Accesibilidad

- Labels con `sr-only` cuando necesario
- `aria-label` en inputs individuales de código 2FA
- `inputMode="numeric"` para teclado numérico en móvil
- Mensajes de error descriptivos
- Focus management en inputs
- Keyboard navigation (flechas, Tab, Backspace)

---

## 🎯 Próximos Pasos (Opcionales)

1. **Panel de Gestión de Dispositivos** (`/configuracion/dispositivos`)
   - Listar dispositivos de confianza
   - Botón "Revocar" por dispositivo
   - Mostrar última IP, fecha de creación, último uso

2. **Configuración de 2FA** (`/configuracion/seguridad`)
   - Setup de Google Authenticator (QR code)
   - Activar/Desactivar 2FA
   - Ver estado de 2FA

3. **Rate Limiting Cliente**
   - Limitar intentos de login fallidos
   - Mostrar mensaje "Demasiados intentos, espera X minutos"

4. **PWA Support**
   - Guardar fingerprint en IndexedDB
   - Funcionar offline (con datos cached)

---

## ✅ Checklist de Deployment

- [x] FingerprintJS instalado
- [x] Todos los componentes creados
- [x] Todas las páginas implementadas
- [x] Servicios 2FA configurados
- [x] TypeScript sin errores
- [ ] Variables de entorno configuradas
- [ ] Testing E2E ejecutado
- [ ] Backend 2FA deployed y funcional
- [ ] Migración SQL ejecutada
- [ ] Email service configurado

---

## 🔗 Archivos Relacionados

**Backend:**
- `inia-backend/DOCUMENTACION_2FA_COMPLETA.md`
- `inia-backend/src/main/resources/db/migration/V2_0__add_2fa_support.sql`

**Frontend:**
- `lib/fingerprint.ts`
- `app/services/auth-2fa-service.ts`
- `components/ui/input-2fa.tsx`
- `app/login/page.tsx`
- `app/forgot-password/page.tsx`
- `app/reset-password/page.tsx`

---

**Implementación completada**: ✅ 100%  
**Fecha**: Noviembre 2025  
**Versión**: 1.0
