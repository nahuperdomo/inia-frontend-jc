'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input2FA } from '@/components/ui/input-2fa'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Shield, ShieldCheck, ShieldAlert, Smartphone, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Setup2FAResponse {
  secret: string
  qrCodeDataUrl: string
  issuer: string
  accountName: string
}

interface Status2FAResponse {
  totpEnabled: boolean
  hasSecret: boolean
}

interface TrustedDevice {
  id: number
  deviceName: string
  userAgent: string
  ipAddress: string
  createdAt: string
  lastUsedAt: string
  expiresAt: string
  active: boolean
}

export default function Configuracion2FAPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [has2FA, setHas2FA] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  
  // Setup 2FA
  const [showSetup, setShowSetup] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  
  // Dispositivos de confianza
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([])
  const [loadingDevices, setLoadingDevices] = useState(false)

  // Verificar estado actual del 2FA
  useEffect(() => {
    checkStatus()
    loadTrustedDevices()
  }, [])

  const checkStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/status`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data: Status2FAResponse = await response.json()
        console.log('📊 Status 2FA:', data)
        setHas2FA(data.totpEnabled || false)
      } else {
        console.warn('⚠️ No se pudo verificar estado 2FA, asumiendo false')
        setHas2FA(false)
      }
    } catch (error) {
      console.error('Error verificando estado 2FA:', error)
      setHas2FA(false)
    } finally {
      setCheckingStatus(false)
    }
  }

  const loadTrustedDevices = async () => {
    try {
      setLoadingDevices(true)
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/trusted-devices`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📱 Dispositivos de confianza recibidos:', data)
        
        // El backend devuelve { devices: [...], count: X }
        const devices = data.devices || data
        setTrustedDevices(Array.isArray(devices) ? devices : [])
      } else {
        console.warn('⚠️ No se pudieron cargar dispositivos')
        setTrustedDevices([])
      }
    } catch (error) {
      console.error('Error cargando dispositivos:', error)
      setTrustedDevices([])
    } finally {
      setLoadingDevices(false)
    }
  }

  const handleSetup2FA = async () => {
    try {
      setLoading(true)
      console.log('🔐 Iniciando setup 2FA...')
      console.log('📡 URL:', `${API_BASE_URL}/api/v1/auth/2fa/setup`)
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/setup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        
        let errorMessage = 'Error al generar código QR'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      const responseText = await response.text()
      console.log('📄 Response:', responseText)
      
      if (!responseText) {
        throw new Error('Respuesta vacía del servidor')
      }
      
      const data = JSON.parse(responseText)
      console.log('✅ Data recibida:', data)
      
      // El backend responde con { data: { secret, qrCodeDataUrl, ... }, mensaje: "..." }
      const setupData = data.data || data
      
      if (setupData.secret && setupData.qrCodeDataUrl) {
        console.log('✅ Configurando QR y secret...')
        console.log('QR URL length:', setupData.qrCodeDataUrl.length)
        console.log('Secret:', setupData.secret)
        
        setQrCodeUrl(setupData.qrCodeDataUrl)
        setSecret(setupData.secret)
        setShowSetup(true)
        
        console.log('✅ Estados actualizados - showSetup debería ser true')

        toast.success('Código QR generado', {
          description: 'Escanea el código con Google Authenticator',
        })
      } else {
        console.error('❌ Respuesta inválida:', data)
        throw new Error('Respuesta del servidor sin QR code')
      }
    } catch (error: any) {
      console.error('❌ Error en setup 2FA:', error)
      toast.error('Error', {
        description: error.message || 'No se pudo generar el código QR',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Error', { description: 'Ingresa el código de 6 dígitos' })
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ totpCode: verificationCode }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Código inválido')
      }

      toast.success('¡2FA Activado!', {
        description: 'Autenticación de dos factores configurada correctamente',
        duration: 5000,
      })

      setHas2FA(true)
      setShowSetup(false)
      setQrCodeUrl(null)
      setSecret(null)
      setVerificationCode('')
    } catch (error: any) {
      console.error('Error verificando código:', error)
      toast.error('Error', {
        description: error.message || 'Código de verificación inválido',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm('¿Estás seguro de desactivar la autenticación de dos factores?\n\nEsto hará tu cuenta menos segura.')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/disable`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Error al desactivar 2FA')
      }

      toast.success('2FA Desactivado', {
        description: 'Autenticación de dos factores desactivada',
      })

      setHas2FA(false)
    } catch (error) {
      console.error('Error desactivando 2FA:', error)
      toast.error('Error', {
        description: 'No se pudo desactivar el 2FA',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeDevice = async (deviceId: number) => {
    if (!confirm('¿Deseas revocar este dispositivo de confianza?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/trusted-devices/${deviceId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Error al revocar dispositivo')
      }

      toast.success('Dispositivo revocado', {
        description: 'El dispositivo ya no es de confianza',
      })

      loadTrustedDevices()
    } catch (error) {
      console.error('Error revocando dispositivo:', error)
      toast.error('Error', {
        description: 'No se pudo revocar el dispositivo',
      })
    }
  }

  const handleRevokeAllDevices = async () => {
    if (!confirm('¿Deseas revocar TODOS los dispositivos de confianza?\n\nDeberás ingresar el código 2FA en todos tus dispositivos la próxima vez.')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/trusted-devices`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Error al revocar dispositivos')
      }

      toast.success('Dispositivos revocados', {
        description: 'Todos los dispositivos de confianza han sido revocados',
      })

      setTrustedDevices([])
    } catch (error) {
      console.error('Error revocando dispositivos:', error)
      toast.error('Error', {
        description: 'No se pudieron revocar los dispositivos',
      })
    }
  }

  if (checkingStatus) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  console.log('🎨 Render - showSetup:', showSetup, 'qrCodeUrl:', !!qrCodeUrl, 'has2FA:', has2FA)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-3 flex-1">
            <Link href="/perfil">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="bg-primary rounded-full p-2">
              <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold">Autenticación de Dos Factores</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                Protege tu cuenta con Google Authenticator
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        {/* Estado actual del 2FA */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {has2FA ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  2FA Activado
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 text-yellow-600" />
                  2FA Desactivado
                </>
              )}
            </CardTitle>
            <CardDescription>
              {has2FA
                ? 'Tu cuenta está protegida con autenticación de dos factores'
                : 'Activa 2FA para mayor seguridad en tu cuenta'}
            </CardDescription>
          </CardHeader>
        <CardContent>
          {/* Botón para activar 2FA (cuando NO está activado y NO está en proceso de setup) */}
          {has2FA === false && !showSetup && (
            <div className="space-y-4">
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Necesitarás Google Authenticator instalado en tu teléfono.
                  <br />
                  Descárgalo desde{' '}
                  <a
                    href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    Google Play
                  </a>{' '}
                  o{' '}
                  <a
                    href="https://apps.apple.com/app/google-authenticator/id388497605"
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    App Store
                  </a>
                </AlertDescription>
              </Alert>
              <Button onClick={handleSetup2FA} disabled={loading}>
                {loading ? 'Generando...' : 'Activar 2FA'}
              </Button>
            </div>
          )}

          {/* Formulario de setup con QR (cuando está en proceso de setup) */}
          {showSetup && qrCodeUrl && secret && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Paso 1: Escanea este código QR</h3>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Paso 2: Guarda este código secreto (por seguridad)</h3>
                <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                  {secret}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Paso 3: Ingresa el código de 6 dígitos</h3>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                    setVerificationCode(value)
                  }}
                  placeholder="123456"
                  autoFocus
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <p className="text-sm text-muted-foreground">
                  Ingresa el código de 6 dígitos que aparece en Google Authenticator
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleVerify2FA} disabled={loading || verificationCode.length !== 6}>
                  {loading ? 'Verificando...' : 'Verificar y Activar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSetup(false)
                    setQrCodeUrl(null)
                    setSecret(null)
                    setVerificationCode('')
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    // Regenerar QR - útil si hubo error
                    setShowSetup(false)
                    setQrCodeUrl(null)
                    setSecret(null)
                    setVerificationCode('')
                    await handleSetup2FA()
                  }}
                >
                  🔄 Generar Nuevo QR
                </Button>
              </div>
            </div>
          )}

          {has2FA && (
            <Button variant="destructive" onClick={handleDisable2FA} disabled={loading}>
              {loading ? 'Desactivando...' : 'Desactivar 2FA'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Dispositivos de confianza */}
      {has2FA && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Dispositivos de Confianza
            </CardTitle>
            <CardDescription>
              Dispositivos en los que no necesitas ingresar el código 2FA
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDevices ? (
              <p className="text-muted-foreground">Cargando dispositivos...</p>
            ) : trustedDevices.length === 0 ? (
              <p className="text-muted-foreground">No tienes dispositivos de confianza</p>
            ) : (
              <div className="space-y-4">
                {trustedDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{device.deviceName}</p>
                      <p className="text-sm text-muted-foreground">
                        Último acceso: {device.lastUsedAt ? new Date(device.lastUsedAt).toLocaleString('es-UY') : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expira: {device.expiresAt ? new Date(device.expiresAt).toLocaleDateString('es-UY') : 'N/A'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevokeDevice(device.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={handleRevokeAllDevices}>
                  Revocar todos los dispositivos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}
