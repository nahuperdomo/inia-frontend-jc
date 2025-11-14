"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Leaf, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { forgotPassword } from "@/app/services/auth-2fa-service"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const result = await forgotPassword(email)

      console.log('✅ [ForgotPassword] Código enviado exitosamente')

      setIsSuccess(true)

      toast.success('Código enviado', {
        description: 'Revisa tu correo electrónico',
        duration: 5000,
      })

      // Redirigir a reset-password después de 2 segundos
      setTimeout(() => {
        router.push(`/restablecer-contrasena?email=${encodeURIComponent(email)}`)
      }, 2000)

    } catch (error: any) {
      console.error('❌ [ForgotPassword] Error:', error)

      let errorMsg = 'Error al solicitar código'

      const errorText = error.message || error.toString()

      if (errorText.includes('no existe') || errorText.includes('No se encontró')) {
        errorMsg = 'No se encontró una cuenta con este email'
      } else if (errorText.includes('no tiene 2FA') || errorText.includes('2FA no habilitado')) {
        errorMsg = 'Esta cuenta no tiene autenticación de dos factores habilitada'
      } else if (errorText.includes('inactivo')) {
        errorMsg = 'Esta cuenta está inactiva. Contacta al administrador'
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
              {isSuccess ? '¡Código Enviado!' : '¿Olvidaste tu contraseña?'}
            </CardTitle>
            <CardDescription className="text-pretty">
              {isSuccess
                ? 'Hemos enviado un código de recuperación a tu email'
                : 'Te enviaremos un código de recuperación por email'
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
                  <p className="font-medium mb-2">Código enviado exitosamente</p>
                  <p className="text-sm">
                    Revisa tu bandeja de entrada en <strong>{email}</strong>
                  </p>
                  <p className="text-sm mt-2 text-muted-foreground">
                    El código es válido por <strong>10 minutos</strong>
                  </p>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-sm text-center text-muted-foreground">
                  Redirigiendo al formulario de recuperación...
                </p>
              </div>

              <Link href={`/restablecer-contrasena?email=${encodeURIComponent(email)}`} className="w-full block">
                <Button className="w-full">
                  Continuar al formulario de recuperación
                </Button>
              </Link>

              <Link href="/login" className="w-full block">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesión
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

              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex gap-2">
                  <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 space-y-1">
                    <p className="font-medium">Requisitos para recuperar contraseña:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Debes tener autenticación de dos factores (2FA) habilitada</li>
                      <li>Necesitarás el código del email + Google Authenticator</li>
                      <li>El código es válido por 10 minutos</li>
                    </ul>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu.email@inia.org.uy"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresa el email asociado a tu cuenta
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2" size={16} />
                      Enviando código...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar código de recuperación
                    </>
                  )}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
              </div>

              <Link href="/login" className="w-full block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesión
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
