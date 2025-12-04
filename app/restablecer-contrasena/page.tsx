"use client"

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Leaf, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff, Shield, Mail, Key } from 'lucide-react'
import { toast } from 'sonner'
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  resetPassword,
  validatePasswordStrength,
  validateRecoveryCodeFormat,
  validateTotpCodeFormat,
  validateBackupCodeFormat,
  formatBackupCode
} from "@/app/services/auth-2fa-service"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Validación de contraseña en tiempo real
  const passwordValidation = validatePasswordStrength(newPassword)
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0

  const isFormValid =
    email &&
    validateRecoveryCodeFormat(recoveryCode) &&
    (useBackupCode ? validateBackupCodeFormat(totpCode) : validateTotpCodeFormat(totpCode)) &&
    passwordValidation.isValid &&
    passwordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) {
      toast.error('Formulario incompleto', {
        description: 'Por favor completa todos los campos correctamente',
      })
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const result = await resetPassword({
        email,
        recoveryCode: recoveryCode.replace(/-/g, ''), // Remover guión
        totpCode,
        newPassword,
      })
      setIsSuccess(true)

      toast.success('Contraseña actualizada', {
        description: 'Tu contraseña ha sido cambiada exitosamente',
        duration: 5000,
      })

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (error: any) {
      console.error(' [ResetPassword] Error:', error)

      let errorMsg = 'Error al resetear contraseña'

      const errorText = error.message || error.toString()

      if (errorText.includes('código de recuperación') && errorText.includes('incorrecto')) {
        errorMsg = 'El código de recuperación es incorrecto'
      } else if (errorText.includes('expirado')) {
        errorMsg = 'El código de recuperación ha expirado (10 min). Solicita uno nuevo'
      } else if (errorText.includes('código de Google Authenticator')) {
        errorMsg = 'El código de Google Authenticator es incorrecto'
      } else if (errorText.includes('contraseña') && errorText.includes('igual') && errorText.includes('actual')) {
        errorMsg = 'La nueva contraseña no puede ser igual a la contraseña actual'
      } else if (errorText.includes('contraseña') && errorText.includes('caracteres')) {
        errorMsg = 'La contraseña debe tener mínimo 8 caracteres'
      } else if (errorText.includes('contraseña') && errorText.includes('letra')) {
        errorMsg = 'La contraseña debe contener al menos una letra y un número'
      } else if (errorText.includes('no existe') || errorText.includes('No se encontró')) {
        errorMsg = 'No se encontró una cuenta con este email'
      }

      setErrorMessage(errorMsg)

      toast.error('Error', {
        description: errorMsg,
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

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
            <CardTitle className="text-2xl font-bold">
              {isSuccess ? '¡Contraseña Actualizada!' : 'Restablecer Contraseña'}
            </CardTitle>
            <CardDescription className="text-pretty">
              {isSuccess
                ? 'Ahora puedes iniciar sesión con tu nueva contraseña'
                : 'Ingresa el código de recuperación y tu código 2FA'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {isSuccess ? (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <p className="font-medium mb-2">Contraseña actualizada exitosamente</p>
                  <p className="text-sm">
                    Todos tus dispositivos de confianza han sido revocados por seguridad.
                  </p>
                  <p className="text-sm mt-2 text-muted-foreground">
                    Redirigiendo al inicio de sesión...
                  </p>
                </AlertDescription>
              </Alert>

              <Link href="/login" className="w-full block">
                <Button className="w-full">
                  Ir al inicio de sesión
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex gap-2">
                  <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 space-y-1">
                    <p className="font-medium">Verificación de doble factor requerida</p>
                    <p>Por seguridad, necesitas:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Código de recuperación (email)</li>
                      <li>Código de Google Authenticator</li>
                    </ul>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu.email@inia.org.uy"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Código de Recuperación */}
                <div className="space-y-2">
                  <Label htmlFor="recoveryCode">Código de Recuperación</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="recoveryCode"
                      type="text"
                      placeholder="XXXX-XXXX"
                      value={recoveryCode}
                      onChange={(e) => {
                        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                        if (value.length > 4) {
                          value = value.slice(0, 4) + '-' + value.slice(4, 8)
                        }
                        setRecoveryCode(value)
                      }}
                      maxLength={9}
                      required
                      disabled={isLoading}
                      className="pl-10 text-center font-mono text-lg tracking-wider"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Código de 8 caracteres enviado a tu email (formato: XXXX-XXXX)
                  </p>
                  {recoveryCode.length > 0 && recoveryCode.length < 9 && (
                    <p className="text-xs text-amber-600">
                      Ingresa los 8 caracteres del código
                    </p>
                  )}
                </div>

                {/* Código 2FA o Código de Respaldo */}
                <div className="space-y-2">
                  {!useBackupCode ? (
                    <>
                      <Label htmlFor="totpCode">Código de Google Authenticator</Label>
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
                        disabled={isLoading}
                        className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none disabled:opacity-50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Código de 6 dígitos de tu aplicación Google Authenticator
                      </p>
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
                      <Label htmlFor="backupCode">Código de Respaldo</Label>
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
                        disabled={isLoading}
                        className="w-full px-4 py-3 text-center text-xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none disabled:opacity-50 uppercase"
                      />
                      <p className="text-xs text-muted-foreground">
                        Código de respaldo de 12 caracteres (se usa solo UNA VEZ)
                      </p>
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
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Nueva contraseña</p>

                  {/* Nueva Contraseña */}
                  <div className="space-y-2 mb-3">
                    <Label htmlFor="newPassword">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className={newPassword && !passwordValidation.isValid ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Error si no es válida */}
                    {newPassword && !passwordValidation.isValid && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">{passwordValidation.message}</p>
                      </div>
                    )}

                    {/* Indicador de fortaleza solo si es válida */}
                    {newPassword && passwordValidation.isValid && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={
                              passwordValidation.strength === 'weak' ? 33 :
                                passwordValidation.strength === 'medium' ? 66 : 100
                            }
                            className={`h-2 ${passwordValidation.strength === 'weak' ? 'bg-red-100' :
                                passwordValidation.strength === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                              }`}
                          />
                          <span className={`text-xs font-medium ${passwordValidation.strength === 'weak' ? 'text-red-600' :
                              passwordValidation.strength === 'medium' ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                            {passwordValidation.strength === 'weak' ? 'Débil' :
                              passwordValidation.strength === 'medium' ? 'Media' : 'Fuerte'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {passwordValidation.message}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirmar Contraseña */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className={confirmPassword && !passwordsMatch ? 'border-red-500' : ''}
                    />
                    {confirmPassword && !passwordsMatch && (
                      <p className="text-xs text-red-500">
                        Las contraseñas no coinciden
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2" size={16} />
                      Actualizando contraseña...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Restablecer contraseña
                    </>
                  )}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
              </div>

              <div className="space-y-2">
                <Link href="/recuperar-contrasena" className="w-full block">
                  <Button variant="ghost" className="w-full text-sm">
                    ¿No recibiste el código? Solicitar nuevo código
                  </Button>
                </Link>

                <Link href="/login" className="w-full block">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
