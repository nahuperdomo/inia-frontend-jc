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
export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    usuario: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Servicio de login
  async function login(usuario: string, password: string) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    console.log("🔄 Intentando login con:", { usuario, API_BASE_URL });

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "ngrok-skip-browser-warning": "true" // CRÍTICO para ngrok
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

    try {
      const data = await login(credentials.usuario, credentials.password)

      console.log("✅ Login exitoso. Backend envió cookies HttpOnly.");
      console.log("📦 Datos de usuario:", data.usuario);

      // SOLUCIÓN SEGURA: NO guardar token en localStorage ni cookies client-side
      // El token está en cookies HttpOnly (accessToken, refreshToken) manejadas automáticamente por el navegador
      
      // Opcionalmente, guardar datos de usuario para UX (no sensibles)
      if (data.usuario) {
        localStorage.setItem("usuario", JSON.stringify({
          id: data.usuario.id,
          nombre: data.usuario.nombre,
          nombres: data.usuario.nombres,
          apellidos: data.usuario.apellidos,
          email: data.usuario.email,
          roles: data.usuario.roles
        }));
      }

      console.log("🚀 Redirigiendo a /dashboard...");
      
      // SOLUCIÓN DEFINITIVA: router.push funciona bien cuando el middleware no bloquea
      router.push("/dashboard");
      
      console.log("✅ Redirección iniciada");
    } catch (error: any) {
      console.error("❌ Error en handleSubmit:", error);
      
      // Intentar extraer el mensaje de error del backend
      let errorMessage = 'Credenciales incorrectas';
      let errorDescription = 'Por favor verifica tu usuario y contraseña';
      
      try {
        // El error puede venir como string o en error.message
        const errorText = error.message || error.toString();
        
        // Mensajes específicos del backend
        if (errorText.includes('Usuario sin rol asignado')) {
          errorMessage = 'Usuario sin rol';
          errorDescription = 'El administrador debe asignarte un rol antes de que puedas iniciar sesión. Contacta al administrador.';
        } else if (errorText.includes('pendiente de aprobación')) {
          errorMessage = 'Usuario pendiente de aprobación';
          errorDescription = 'Tu cuenta está pendiente de aprobación por el administrador.';
        } else if (errorText.includes('Usuario inactivo')) {
          errorMessage = 'Usuario inactivo';
          errorDescription = 'Tu cuenta ha sido desactivada. Contacta al administrador.';
        } else if (errorText.includes('Usuario no encontrado')) {
          errorMessage = 'Usuario no encontrado';
          errorDescription = 'El usuario ingresado no existe.';
        } else if (errorText.includes('Contraseña incorrecta')) {
          errorMessage = 'Contraseña incorrecta';
          errorDescription = 'La contraseña ingresada no es correcta.';
        }
      } catch (parseError) {
        console.error("Error parsing error message:", parseError);
      }
      
      toast.error(errorMessage, {
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                type="text"
                placeholder="usuario"
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
