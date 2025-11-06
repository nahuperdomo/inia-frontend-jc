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
import { Leaf, UserPlus, Shield, Smartphone } from "lucide-react"
import { toast } from 'sonner'
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/components/auth-provider"
import { getDeviceFingerprint } from "@/lib/fingerprint"
import { login2FA, type Login2FAResponse, type Requires2FAResponse } from "@/app/services/auth-2fa-service"
import { Input2FA } from "@/components/ui/input-2fa"

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    usuario: "",
    password: "",
  })
  const [requires2FA, setRequires2FA] = useState(false)
  const [totpCode, setTotpCode] = useState("")
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
      const loginData = {
        usuario: credentials.usuario,
        password: credentials.password,
        deviceFingerprint: deviceFingerprint || undefined,
        totpCode: requires2FA && totpCode ? totpCode : undefined,
        trustDevice: requires2FA && trustDevice ? trustDevice : undefined,
      }

      const result = await login2FA(loginData)

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
            {!requires2FA ? (
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
            ) : (
              <>
                {/* Paso 2: Código 2FA */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm font-medium">Autenticación de Dos Factores</span>
                  </div>

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
                      setErrorMessage(null)
                    }}
                    className="w-full"
                    disabled={isLoading}
                  >
                    ← Volver a ingresar credenciales
                  </Button>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" size={16} />
                  {requires2FA ? 'Verificando código...' : 'Iniciando sesión...'}
                </>
              ) : (
                requires2FA ? 'Verificar código' : 'Iniciar sesión'
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
    </div>
  )
}
