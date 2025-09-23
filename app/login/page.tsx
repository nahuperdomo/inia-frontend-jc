"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf } from "lucide-react"

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    usuario: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Servicio de login
  async function login(usuario: string, password: string) {
    const response = await fetch(`http://localhost:8080/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, password }),
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json() // Debe devolver { token: "..." }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const data = await login(credentials.usuario, credentials.password)
      localStorage.setItem("token", data.token) // Ajusta si tu backend devuelve el token con otro nombre
      router.push("/dashboard")
    } catch (error) {
      alert("Credenciales incorrectas")
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
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
