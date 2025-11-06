"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Leaf, UserPlus, Shield, Smartphone, Download, Copy, Key, AlertTriangle } from "lucide-react"
import { toast } from 'sonner'
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/components/auth-provider"
import { getDeviceFingerprint } from "@/lib/fingerprint"
import { login2FA, type Login2FAResponse, type Requires2FAResponse, type Requires2FASetupResponse, formatBackupCode, setupInitial2FA, verifyInitial2FA } from "@/app/services/auth-2fa-service"
import { Input2FA } from "@/components/ui/input-2fa"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    usuario: "",
    password: "",
  })
  const [requires2FA, setRequires2FA] = useState(false)
  const [requires2FASetup, setRequires2FASetup] = useState(false)
  const [setupData, setSetupData] = useState<{
    qrCodeUrl: string;
    secret: string;
    email: string;
  } | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [totpCode, setTotpCode] = useState("")
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [trustDevice, setTrustDevice] = useState(true)
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const { refresh } = useAuth()

  // Generar device fingerprint al cargar la página
  useEffect(() => {
    async function loadFingerprint() {
      try {
        const fingerprint = await getDeviceFingerprint()
        setDeviceFingerprint(fingerprint)
        console.log('📱 [Login] Device fingerprint generado')
      } catch (error) {
        console.error('⚠️ [Login] Error generando fingerprint:', error)
        // No bloqueamos el login si falla el fingerprint
      }
    }
    loadFingerprint()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Si estamos en el flujo de setup inicial, manejar la verificación
      if (requires2FASetup && setupData) {
        await handleVerifyInitial2FA()
        return
      }

      const loginData = {
        usuario: credentials.usuario,
        password: credentials.password,
        deviceFingerprint: deviceFingerprint || undefined,
        totpCode: requires2FA && totpCode ? totpCode : undefined,
        trustDevice: requires2FA && trustDevice ? trustDevice : undefined,
      }

      const result = await login2FA(loginData)

      // Verificar si requiere setup de 2FA (OBLIGATORIO)
      if ('requires2FASetup' in result && result.requires2FASetup) {
        console.log('⚠️ [Login] Usuario DEBE activar 2FA')
        await handleSetupInitial2FA()
        return
      }

      // Verificar si requiere cambio de credenciales (admin first-login)
      if ('requiresCredentialChange' in result && result.requiresCredentialChange) {
        console.log('⚠️ [Login] Requiere cambio de credenciales (primer acceso admin)')
        console.log('🎫 [Login] Token recibido, redirigiendo...')
        
        // Redirigir con el token en la URL (el token no es sensible, solo un ID temporal)
        window.location.href = `/admin-setup?token=${result.setupToken}`
        return
      }

      // Verificar si requiere código 2FA
      if ('requires2FA' in result && result.requires2FA) {
        console.log('🔐 [Login] Se requiere código 2FA')
        setRequires2FA(true)
        toast.info('Autenticación de dos factores', {
          description: 'Ingresa el código de Google Authenticator',
          duration: 5000,
        })
        return
      }

      // Login exitoso
      const data = result as Login2FAResponse
      console.log('✅ [Login] Login exitoso')
      console.log('👤 [Login] Usuario:', data.usuario.nombre)
      console.log('🔐 [Login] Tiene 2FA:', data.usuario.has2FA)

      // Refrescar contexto de autenticación
      await refresh()

      toast.success('Bienvenido', {
        description: `Hola ${data.usuario.nombres} ${data.usuario.apellidos}`,
        duration: 3000,
      })

      // Redirigir al dashboard
      setTimeout(() => {
        router.push("/dashboard")
        
        // Fallback por si router.push no funciona
        setTimeout(() => {
          if (window.location.pathname === "/login") {
            window.location.href = "/dashboard"
          }
        }, 1000)
      }, 100)

    } catch (error: any) {
      console.error('❌ [Login] Error:', error)
      
      let errorMsg = 'Error de autenticación'
      let errorDescription = 'Verifica tus credenciales e intenta nuevamente'
      
      const errorText = error.message || error.toString()
      
      if (errorText.includes('Credenciales incorrectas')) {
        errorMsg = 'Credenciales incorrectas'
        errorDescription = 'El usuario/email o contraseña son incorrectos'
      } else if (errorText.includes('Código de autenticación inválido')) {
        errorMsg = 'Código 2FA inválido'
        errorDescription = 'El código de Google Authenticator es incorrecto'
      } else if (errorText.includes('pendiente de aprobación')) {
        errorMsg = 'Acceso no disponible'
        errorDescription = 'Tu cuenta está pendiente de aprobación'
      } else if (errorText.includes('No se puede iniciar sesión')) {
        errorMsg = 'Acceso no disponible'
        errorDescription = 'Contacta al administrador'
      }
      
      setErrorMessage(`${errorMsg}: ${errorDescription}`)
      
      toast.error(errorMsg, {
        description: errorDescription,
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetupInitial2FA = async () => {
    try {
      const data = await setupInitial2FA(credentials.usuario, credentials.password)
      
      console.log('✅ [Login] Setup 2FA iniciado')
      setSetupData({
        qrCodeUrl: data.data.qrCodeDataUrl,
        secret: data.data.secret,
        email: data.email
      })
      setRequires2FASetup(true)
      
      toast.info('Configuración de 2FA', {
        description: 'Escanea el código QR con Google Authenticator',
        duration: 5000,
      })
    } catch (error: any) {
      console.error('❌ [Login] Error en setup 2FA:', error)
      toast.error('Error', {
        description: error.message || 'No se pudo iniciar la configuración de 2FA',
      })
      setIsLoading(false)
    }
  }

  const handleVerifyInitial2FA = async () => {
    if (totpCode.length !== 6) {
      toast.error('Error', { description: 'Ingresa el código de 6 dígitos' })
      setIsLoading(false)
      return
    }

    try {
      const data = await verifyInitial2FA(setupData!.email, totpCode)
      
      console.log('✅ [Login] 2FA activado y login exitoso')
      console.log('🎫 [Login] Códigos de respaldo recibidos:', data.totalCodes)
      
      // Guardar códigos de respaldo para mostrar
      setBackupCodes(data.backupCodes)
      setShowBackupCodes(true)
      
      // Refrescar contexto de autenticación
      await refresh()
      
      toast.success('¡2FA Activado!', {
        description: 'Autenticación configurada correctamente. GUARDA los códigos de respaldo.',
        duration: 10000,
      })
      
      // Redirigir al dashboard después de que guarde los códigos
      // El usuario cerrará el modal de códigos manualmente
    } catch (error: any) {
      console.error('❌ [Login] Error verificando código inicial:', error)
      toast.error('Error', {
        description: error.message || 'Código de verificación inválido',
      })
      setIsLoading(false)
    }
  }

  const copyBackupCodes = () => {
    const text = backupCodes.join('\n')
    navigator.clipboard.writeText(text)
    toast.success('Copiado', {
      description: 'Códigos copiados al portapapeles',
    })
  }

  const downloadBackupCodes = () => {
    const text = `CÓDIGOS DE RESPALDO - INIA
Generados: ${new Date().toLocaleString()}

IMPORTANTE: Guarda estos códigos en un lugar seguro.
Cada código solo se puede usar UNA VEZ.

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

NO COMPARTAS ESTOS CÓDIGOS CON NADIE.
`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inia-backup-codes-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Descargado', {
      description: 'Códigos guardados en archivo de texto',
    })
  }

  const handleSavedBackupCodes = () => {
    setShowBackupCodes(false)
    router.push("/dashboard")
  }

  // Reset del estado 2FA si se cambia el usuario
  useEffect(() => {
    if (requires2FA) {
      setRequires2FA(false)
      setTotpCode("")
    }
  }, [credentials.usuario])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary rounded-full p-3">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-balance">Sistema INIA</CardTitle>
            <CardDescription className="text-pretty">Instituto Nacional de Innovación Agropecuaria</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!requires2FA && !requires2FASetup ? (
              <>
                {/* Paso 1: Credenciales básicas */}
                <div className="space-y-2">
                  <Label htmlFor="usuario">Usuario o Email</Label>
                  <Input
                    id="usuario"
                    type="text"
                    placeholder="Ingresa tu usuario o email"
                    value={credentials.usuario}
                    onChange={(e) => setCredentials((prev) => ({ ...prev, usuario: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-primary hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            ) : requires2FASetup && setupData ? (
              <>
                {/* Setup Inicial de 2FA (Obligatorio) */}
                <div className="space-y-4">
                  <Alert className="border-yellow-500">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>2FA Obligatorio:</strong> Para usar el sistema, debes activar la autenticación de dos factores.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-center">Paso 1: Escanea este código QR</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Abre Google Authenticator en tu teléfono y escanea el código
                    </p>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <img src={setupData.qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-center">Paso 2: Guarda este código secreto</h3>
                    <div className="p-3 bg-muted rounded-md font-mono text-sm break-all text-center">
                      {setupData.secret}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Guárdalo por seguridad (si pierdes el teléfono)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-center">Paso 3: Ingresa el código</h3>
                    <Label htmlFor="setupCode">Código de verificación</Label>
                    <input
                      id="setupCode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                        setTotpCode(value)
                      }}
                      placeholder="123456"
                      autoFocus
                      disabled={isLoading}
                      className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none disabled:opacity-50"
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      Código de 6 dígitos de Google Authenticator
                    </p>
                  </div>
                </div>
              </>
            ) : requires2FA ? (
              <>
                {/* Paso 2: Código 2FA */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm font-medium">Autenticación de Dos Factores</span>
                  </div>

                  {!useBackupCode ? (
                    <>
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Ingresa el código de 6 dígitos de tu aplicación Google Authenticator
                        </p>
                        <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground">
                          <Smartphone className="h-4 w-4" />
                          <span>Abre Google Authenticator en tu teléfono</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="totpCode">Código de autenticación</Label>
                        <input
                          id="totpCode"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={totpCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                            setTotpCode(value)
                          }}
                          placeholder="123456"
                          autoFocus
                          disabled={isLoading}
                          className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none disabled:opacity-50"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUseBackupCode(true)
                          setTotpCode("")
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                        disabled={isLoading}
                      >
                        ¿Perdiste tu teléfono? Usa un código de respaldo
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Ingresa uno de tus códigos de respaldo de 12 caracteres
                        </p>
                        <p className="text-xs text-yellow-600">
                          Cada código solo se puede usar UNA VEZ
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="backupCode">Código de respaldo</Label>
                        <input
                          id="backupCode"
                          type="text"
                          maxLength={14}
                          value={totpCode}
                          onChange={(e) => {
                            const formatted = formatBackupCode(e.target.value)
                            setTotpCode(formatted)
                          }}
                          placeholder="XXXX-XXXX-XXXX"
                          autoFocus
                          disabled={isLoading}
                          className="w-full px-4 py-3 text-center text-xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none disabled:opacity-50 uppercase"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUseBackupCode(false)
                          setTotpCode("")
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                        disabled={isLoading}
                      >
                        ← Usar código de Google Authenticator
                      </button>
                    </>
                  )}

                  <div className="flex items-center space-x-2 bg-muted p-3 rounded-md">
                    <Checkbox
                      id="trustDevice"
                      checked={trustDevice}
                      onCheckedChange={(checked) => setTrustDevice(checked as boolean)}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="trustDevice"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Confiar en este dispositivo por 60 días
                    </label>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setRequires2FA(false)
                      setTotpCode("")
                      setUseBackupCode(false)
                      setErrorMessage(null)
                    }}
                    className="w-full"
                    disabled={isLoading}
                  >
                    ← Volver a ingresar credenciales
                  </Button>
                </div>
              </>
            ) : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" size={16} />
                  {requires2FASetup ? 'Activando 2FA...' : requires2FA ? 'Verificando código...' : 'Iniciando sesión...'}
                </>
              ) : (
                requires2FASetup ? 'Activar 2FA y continuar' : requires2FA ? 'Verificar código' : 'Iniciar sesión'
              )}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                ¿No tienes una cuenta?
              </span>
            </div>
          </div>

          <a
            href="/registro/usuario"
            className="no-underline w-full block"
          >
            <div className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md flex items-center justify-center py-2 px-4">
              <UserPlus className="mr-2 h-4 w-4" />
              Registrar nuevo usuario
            </div>
          </a>
        </CardContent>
      </Card>

      {/* Modal de Códigos de Respaldo */}
      {showBackupCodes && backupCodes.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-yellow-500 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Key className="w-5 h-5" />
                ⚠️ CÓDIGOS DE RESPALDO - GUÁRDALOS AHORA
              </CardTitle>
              <CardDescription className="text-red-600 font-semibold">
                Estos códigos se muestran SOLO UNA VEZ. Guárdalos en un lugar seguro.
                Cada código solo se puede usar una vez.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                    <span className="text-gray-500 font-bold w-6">{index + 1}.</span>
                    <span className="font-bold text-lg tracking-wider">{code}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button onClick={downloadBackupCodes} variant="default">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar como .txt
                </Button>
                <Button onClick={copyBackupCodes} variant="outline">
                  <Copy className="w-4 w-4 mr-2" />
                  Copiar al portapapeles
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>¿Para qué sirven?</strong> Si pierdes tu teléfono o no tienes acceso a Google Authenticator,
                  podrás usar estos códigos para iniciar sesión o recuperar tu contraseña.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleSavedBackupCodes} 
                variant="default"
                className="w-full"
              >
                Ya guardé los códigos, continuar al sistema
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
