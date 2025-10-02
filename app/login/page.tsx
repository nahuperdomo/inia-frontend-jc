"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  const [pageLoading, setPageLoading] = useState(true)
  const router = useRouter()

  // Simulamos una carga inicial
  useEffect(() => {
    // Esto crea un efecto de carga inicial para mejorar la experiencia de usuario
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Función helper para manejar cookies
  function setCookie(name: string, value: string, days: number = 1) {
    const maxAge = days * 24 * 60 * 60;
    // Usamos SameSite=Lax para compatibilidad con dispositivos móviles
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }

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
      credentials: "include"
    })

    console.log("📥 Status de respuesta:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error:", errorText);
      throw new Error(errorText);
    }

    return response.json();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = await login(credentials.usuario, credentials.password)

      // Guardar en localStorage (para uso en el cliente)
      localStorage.setItem("token", data.token)

      // Guardar en cookies (para que funcione con el middleware)
      setCookie("token", data.token, 1) // Cookie válida por 1 día

      router.push("/dashboard")
    } catch (error) {
      // Toast de error en lugar de alert
      toast.error('Credenciales incorrectas', {
        description: 'Por favor verifica tu usuario y contraseña'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-4">
        <div className="mb-4">
          <div className="bg-primary rounded-full p-3">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <LoadingSpinner size={40} className="text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Cargando aplicación...</p>
      </div>
    )
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
