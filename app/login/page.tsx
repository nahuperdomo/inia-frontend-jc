"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, UserPlus } from "lucide-react"
import { toast } from 'sonner'
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/components/auth-provider"
export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    usuario: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const { refresh } = useAuth()

  // Servicio de login
  async function login(usuario: string, password: string) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    console.log("🔄 Intentando login con:", { usuario, API_BASE_URL });

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ usuario, password }),
      credentials: "include" // CRÍTICO: permite recibir cookies HttpOnly del backend
    })

    console.log("📥 Status de respuesta:", response.status);

    if (!response.ok) {
      let errorMessage = "Error de autenticación";
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Si no es JSON, intentar leerlo como texto
        try {
          errorMessage = await response.text();
        } catch {
          // Usar mensaje por defecto
        }
      }
      
      console.error("❌ Error:", errorMessage);
      throw new Error(errorMessage);
    }

    return response.json();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null) // Limpiar errores anteriores

    try {
      const data = await login(credentials.usuario, credentials.password)

      console.log("✅ Login exitoso. Backend envió cookies HttpOnly.");
      console.log("📦 Datos de usuario:", data.usuario);

      // NO guardar nada en localStorage — las cookies HttpOnly quedan del lado del navegador
      // Refrescar el contexto de auth consultando el perfil al backend
      await refresh()

      console.log("🚀 Redirigiendo a /dashboard...");
      
      // Usar setTimeout para asegurar que las cookies se establezcan antes de redirigir
      setTimeout(() => {
        console.log("⏰ Ejecutando redirección después de timeout...");
  router.push("/dashboard");
        
        // Fallback: si router.push no funciona en 1 segundo, usar window.location
        setTimeout(() => {
          if (window.location.pathname === "/login") {
            console.warn("⚠️ router.push no redirigió, usando window.location.href");
            window.location.href = "/dashboard";
          }
        }, 1000);
      }, 100);
      
      console.log("✅ router.push ejecutado");
    } catch (error: any) {
      console.error("❌ Error en handleSubmit:", error);
      
      // Intentar extraer el mensaje de error del backend
      let errorMsg = 'Error de autenticación';
      let errorDescription = 'Verifica tus credenciales e intenta nuevamente';
      
      try {
        // El error puede venir como string o en error.message
        const errorText = error.message || error.toString();
        
        // Mensajes específicos del backend (ambiguos por seguridad)
        if (errorText.includes('Credenciales incorrectas')) {
          errorMsg = 'Credenciales incorrectas';
          errorDescription = 'El usuario/email o contraseña son incorrectos';
        } else if (errorText.includes('pendiente de aprobación')) {
          errorMsg = 'Acceso no disponible';
          errorDescription = 'Tu cuenta está pendiente de aprobación. Contacta al administrador.';
        } else if (errorText.includes('No se puede iniciar sesión')) {
          errorMsg = 'Acceso no disponible';
          errorDescription = 'No se puede acceder con esta cuenta. Contacta al administrador.';
        }
      } catch (parseError) {
        console.error("Error parsing error message:", parseError);
      }
      
      // Guardar el error en el estado para mostrarlo en la UI
      setErrorMessage(`${errorMsg}: ${errorDescription}`);
      
      toast.error(errorMsg, {
        description: errorDescription,
        duration: 5000
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
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario o Email</Label>
              <Input
                id="usuario"
                type="text"
                placeholder="Ingresa tu usuario o email"
                value={credentials.usuario}
                onChange={(e) => setCredentials((prev) => ({ ...prev, usuario: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" size={16} />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
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
