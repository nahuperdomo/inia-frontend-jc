"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, Shield, Smartphone, Download, Copy, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from 'sonner'
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { 
  completeAdminSetup, 
  getAdminSetupData,
  type AdminSetupData,
  validatePasswordStrength,
  formatBackupCode
} from "@/app/services/auth-2fa-service"
import { validarEmailUnico } from "@/app/services/auth-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from 'next/image'

export default function AdminSetupPage() {
  const [setupInfo, setSetupInfo] = useState<AdminSetupData | null>(null)
  const [formData, setFormData] = useState({
    currentPassword: 'admin123',
    newEmail: '',
    newPassword: '',
    confirmPassword: '',
    totpCode: ''
  })
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    message: string;
  } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  // NO usar useAuth() aquí porque el usuario aún no está autenticado
  
  // Usar ref para evitar doble llamada en Strict Mode (React 18)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    // Si ya se cargó, no hacer nada (previene doble llamada en desarrollo)
    if (hasLoadedRef.current) {
      return
    }
    
    async function loadSetupData() {
      // Obtener token de los query params
      const token = searchParams.get('token')
      
      if (!token) {
        console.error('❌ [AdminSetup] No se encontró token')
        router.push('/login')
        return
      }

      try {
        console.log('🎫 [AdminSetup] Obteniendo datos con token...')
        
        // Marcar como cargado ANTES de hacer la llamada
        hasLoadedRef.current = true
        
        // Solicitar datos al backend usando el token (un solo uso)
        const setupData = await getAdminSetupData(token)
        setSetupInfo(setupData)
        
        console.log('✅ [AdminSetup] Datos de configuración cargados de forma segura')
        
        // Limpiar token de la URL por seguridad
        window.history.replaceState({}, '', '/admin-setup')
      } catch (error: any) {
        console.error('❌ [AdminSetup] Error obteniendo datos:', error)
        toast.error('Error', {
          description: error.message || 'Token inválido o expirado',
          duration: 5000,
        })
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => router.push('/login'), 2000)
      }
    }

    loadSetupData()
  }, [router, searchParams])

  useEffect(() => {
    // Validar contraseña en tiempo real
    if (formData.newPassword) {
      const validation = validatePasswordStrength(formData.newPassword)
      setPasswordStrength(validation)
    } else {
      setPasswordStrength(null)
    }
  }, [formData.newPassword])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateEmailField = async () => {
    const email = formData.newEmail.trim()
    
    if (!email) {
      return
    }

    // Validar formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setValidationErrors(prev => ({
        ...prev,
        newEmail: 'El formato del email no es válido'
      }))
      return
    }

    // Validar unicidad con el backend
    const disponible = await validarEmailUnico(email)
    if (!disponible) {
      setValidationErrors(prev => ({
        ...prev,
        newEmail: 'Este email ya está registrado'
      }))
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.newEmail
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validaciones
      if (!formData.newEmail) {
        throw new Error('El email es requerido')
      }

      if (validationErrors.newEmail) {
        throw new Error('Por favor corrige los errores en el formulario')
      }

      if (!formData.newPassword || formData.newPassword.length < 8) {
        throw new Error('La contraseña debe tener mínimo 8 caracteres')
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      if (!formData.totpCode || formData.totpCode.length !== 6) {
        throw new Error('Debes ingresar el código de 6 dígitos de Google Authenticator')
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.newEmail)) {
        throw new Error('El formato del email no es válido')
      }

      console.log('🔐 [AdminSetup] Completando configuración...')

      const result = await completeAdminSetup({
        currentPassword: formData.currentPassword,
        newEmail: formData.newEmail,
        newPassword: formData.newPassword,
        totpCode: formData.totpCode
      })

      console.log('✅ [AdminSetup] Configuración completada exitosamente')
      
      // Mostrar códigos de respaldo
      setBackupCodes(result.backupCodes)
      setShowBackupCodes(true)

      toast.success('Configuración completada', {
        description: 'Tu cuenta ha sido configurada exitosamente',
        duration: 3000,
      })

    } catch (error: any) {
      console.error('❌ [AdminSetup] Error:', error)
      
      const errorMsg = error.message || 'Error al completar configuración'
      
      toast.error('Error', {
        description: errorMsg,
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadBackupCodes = () => {
    const text = backupCodes.map((code, i) => `${i + 1}. ${formatBackupCode(code)}`).join('\n')
    const blob = new Blob([
      '🔐 CÓDIGOS DE RESPALDO - INIA\n\n',
      'IMPORTANTE: Guarda estos códigos en un lugar seguro.\n',
      'Cada código solo puede usarse UNA vez.\n\n',
      text,
      '\n\nFecha de generación: ' + new Date().toLocaleString('es-UY')
    ], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inia-backup-codes-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Códigos descargados')
  }

  const copyBackupCodes = async () => {
    const text = backupCodes.map((code, i) => `${i + 1}. ${formatBackupCode(code)}`).join('\n')
    await navigator.clipboard.writeText(text)
    toast.success('Códigos copiados al portapapeles')
  }

  const handleBackupCodesComplete = () => {
    setShowBackupCodes(false)
    // Usar window.location para forzar recarga y que auth-provider reconozca las cookies
    window.location.href = '/dashboard'
  }

  if (!setupInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Modal de códigos de respaldo
  if (showBackupCodes && backupCodes.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="h-6 w-6 text-green-600" />
              Códigos de Respaldo Generados
            </CardTitle>
            <CardDescription>
              Guarda estos códigos en un lugar seguro. Cada uno puede usarse solo UNA vez.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                <strong>¡IMPORTANTE!</strong> Descarga o copia estos códigos ahora.
                No podrás verlos nuevamente.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-64 overflow-y-auto">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded border font-mono text-sm"
                >
                  <span className="text-gray-500 dark:text-gray-400 min-w-[24px]">
                    {index + 1}.
                  </span>
                  <span className="font-semibold">{formatBackupCode(code)}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={downloadBackupCodes}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={copyBackupCodes}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
            </div>

            <Button
              type="button"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleBackupCodesComplete}
            >
              He guardado mis códigos
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Leaf className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Configuración Inicial - Administrador</CardTitle>
          <CardDescription>
            Configura tus credenciales personales y activa la autenticación de dos factores
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-300">
              Por seguridad, debes cambiar el email y contraseña temporales y configurar
              Google Authenticator (2FA) antes de acceder al sistema.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Columnas: Formulario y QR */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Formulario */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newEmail">Nuevo Email *</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="tu-email@inia.gub.uy"
                    value={formData.newEmail}
                    onChange={(e) => handleInputChange('newEmail', e.target.value)}
                    onBlur={validateEmailField}
                    className={validationErrors.newEmail ? 'border-red-500' : ''}
                    required
                    autoComplete="email"
                  />
                  {validationErrors.newEmail && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.newEmail}
                    </p>
                  )}
                  {!validationErrors.newEmail && formData.newEmail && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Este email se usará para notificaciones del sistema
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordStrength && (
                    <div className="flex items-center gap-2">
                      <div className={`h-2 flex-1 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700`}>
                        <div
                          className={`h-full transition-all ${
                            passwordStrength.strength === 'weak' ? 'bg-red-500 w-1/3' :
                            passwordStrength.strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                            'bg-green-500 w-full'
                          }`}
                        />
                      </div>
                      <span className={`text-xs ${
                        passwordStrength.strength === 'weak' ? 'text-red-600 dark:text-red-400' :
                        passwordStrength.strength === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-green-600 dark:text-green-400'
                      }`}>
                        {passwordStrength.message}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>
              </div>

              {/* QR Code y Secret */}
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-green-600" />
                    Configurar Google Authenticator
                  </h3>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      1. Descarga Google Authenticator en tu teléfono
                    </p>
                    
                    <div className="flex gap-2">
                      <a
                        href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Android
                      </a>
                      <span className="text-xs text-gray-400">|</span>
                      <a
                        href="https://apps.apple.com/app/google-authenticator/id388497605"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        iOS
                      </a>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      2. Escanea este código QR
                    </p>

                    <div className="flex justify-center p-4 bg-white rounded">
                      {setupInfo.qrCodeDataUrl && (
                        <Image
                          src={setupInfo.qrCodeDataUrl}
                          alt="QR Code para 2FA"
                          width={200}
                          height={200}
                          className="border-2 border-gray-200"
                        />
                      )}
                    </div>

                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                        ¿No puedes escanear? Ingresa manualmente
                      </summary>
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs break-all">
                        {setupInfo.totpSecret}
                      </div>
                    </details>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totpCode">Código de Verificación (6 dígitos) *</Label>
                  <Input
                    id="totpCode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={formData.totpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                      handleInputChange('totpCode', value)
                    }}
                    className="text-center text-2xl tracking-widest font-mono"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Ingresa el código de 6 dígitos que aparece en Google Authenticator
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading || !formData.newEmail || !formData.newPassword || 
                        formData.newPassword !== formData.confirmPassword || formData.totpCode.length !== 6 ||
                        Object.keys(validationErrors).length > 0}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Configurando...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Completar Configuración
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
