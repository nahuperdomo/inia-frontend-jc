'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Shield, ShieldCheck, ShieldAlert, Smartphone, Trash2, Download, Copy, RefreshCw, Key } from 'lucide-react'
import { regenerateBackupCodes, getBackupCodesCount } from '@/app/services/auth-2fa-service'

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

  // Códigos de respaldo
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [availableCodesCount, setAvailableCodesCount] = useState<number>(0)
  const [regenerateCode, setRegenerateCode] = useState('')

  // Verificar estado actual del 2FA
  useEffect(() => {
    checkStatus()
    loadTrustedDevices()
  }, [])

  // Cargar códigos de respaldo cuando cambia el estado de 2FA
  useEffect(() => {
    if (has2FA && !checkingStatus) {
      loadBackupCodesCount()
    }
  }, [has2FA, checkingStatus])

  const checkStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/status`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data: Status2FAResponse = await response.json()        setHas2FA(data.totpEnabled || false)
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
        const data = await response.json()        // El backend devuelve { devices: [...], count: X }
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

  const loadBackupCodesCount = async () => {
    try {
      const data = await getBackupCodesCount()
      setAvailableCodesCount(data.availableCodes)

      if (data.warning) {
        toast.warning('Códigos de respaldo', {
          description: data.warning,
        })
      }
    } catch (error) {
      console.error('Error cargando conteo de códigos:', error)
    }
  }

  const handleSetup2FA = async () => {
    try {
      setLoading(true)      const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/setup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })      if (!response.ok) {
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

      const responseText = await response.text()      if (!responseText) {
        throw new Error('Respuesta vacía del servidor')
      }

      const data = JSON.parse(responseText)      // El backend responde con { data: { secret, qrCodeDataUrl, ... }, mensaje: "..." }
      const setupData = data.data || data

      if (setupData.secret && setupData.qrCodeDataUrl) {        setQrCodeUrl(setupData.qrCodeDataUrl)
        setSecret(setupData.secret)
        setShowSetup(true)        toast.success('Código QR generado', {
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

      const data = await response.json()

      // Verificar si el backend devolvió códigos de respaldo
      if (data.backupCodes && data.backupCodes.length > 0) {        setBackupCodes(data.backupCodes)
        setShowBackupCodes(true)
        setAvailableCodesCount(data.backupCodes.length)
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



  const handleRegenerateBackupCodes = async () => {
    if (regenerateCode.length !== 6) {
      toast.error('Error', { description: 'Ingresa el código de 6 dígitos de Google Authenticator' })
      return
    }

    if (!confirm('¿Estás seguro de regenerar los códigos de respaldo?\n\nTodos los códigos anteriores serán INVALIDADOS.')) {
      return
    }

    try {
      setLoading(true)
      const data = await regenerateBackupCodes(regenerateCode)

      setBackupCodes(data.backupCodes)
      setShowBackupCodes(true)
      setAvailableCodesCount(data.totalCodes)
      setRegenerateCode('')

      toast.success('Códigos regenerados', {
        description: `${data.totalCodes} nuevos códigos generados. Los anteriores fueron invalidados.`,
        duration: 5000,
      })
    } catch (error: any) {
      console.error('Error regenerando códigos:', error)
      toast.error('Error', {
        description: error.message || 'No se pudieron regenerar los códigos',
      })
    } finally {
      setLoading(false)
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
  }  return (
    <>
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
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Autenticación de Dos Factores Obligatoria:</strong> El 2FA está activado y es obligatorio para todos los usuarios por políticas de seguridad. No se puede desactivar.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

        {/* Códigos de Respaldo */}
        {showBackupCodes && backupCodes.length > 0 && (
          <Card className="border-yellow-500 border-2">
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
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar al portapapeles
                </Button>
                <Button
                  onClick={() => {
                    setShowBackupCodes(false)
                    setBackupCodes([])
                  }}
                  variant="secondary"
                >
                  Ya los guardé
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>¿Para qué sirven?</strong> Si pierdes tu teléfono o no tienes acceso a Google Authenticator,
                  podrás usar estos códigos para iniciar sesión o recuperar tu contraseña.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Regenerar códigos de respaldo */}
        {has2FA && !showBackupCodes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Códigos de Respaldo
              </CardTitle>
              <CardDescription>
                Tienes {availableCodesCount} códigos de respaldo disponibles.
                {availableCodesCount <= 2 && availableCodesCount > 0 && (
                  <span className="text-yellow-600 font-semibold"> ⚠️ Considera regenerarlos.</span>
                )}
                {availableCodesCount === 0 && (
                  <span className="text-red-600 font-semibold"> ⚠️ No tienes códigos disponibles. Regenera inmediatamente.</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Los códigos de respaldo te permiten iniciar sesión si pierdes acceso a Google Authenticator.
                  Al regenerarlos, todos los códigos anteriores serán invalidados.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm font-medium">Código de Google Authenticator</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={regenerateCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                    setRegenerateCode(value)
                  }}
                  placeholder="123456"
                  className="w-full max-w-xs px-4 py-2 text-center text-lg font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <Button
                onClick={handleRegenerateBackupCodes}
                disabled={loading || regenerateCode.length !== 6}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {loading ? 'Regenerando...' : 'Regenerar Códigos de Respaldo'}
              </Button>
            </CardContent>
          </Card>
        )}

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
    </>
  )
}
