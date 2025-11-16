"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { obtenerPerfil } from "@/app/services/auth-service"
import { apiFetch } from "@/app/services/api"

interface User {
  id: string
  email: string
  name: string
  role: "analista" | "administrador" | "observador"
  department?: string
  permissions: string[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  hasPermission: (permission: string) => boolean
  isRole: (role: string) => boolean
  // For real login flow: rehydrate context from localStorage after backend login
  refresh: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ROLE_PERMISSIONS = {
  analista: ["register_sample", "associate_analysis", "load_results", "view_pending_tasks", "edit_results"],
  administrador: [
    "register_sample",
    "associate_analysis",
    "load_results",
    "view_pending_tasks",
    "edit_results",
    "validate_lots",
    "manage_users",
    "manage_catalogs",
    "manage_regulations",
    "generate_reports",
    "reassign_analysis",
    "view_all_data",
  ],
  observador: ["view_lot_results", "download_reports", "view_lot_history"],
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Refrescar el usuario consultando el perfil al backend (cookies HttpOnly)
  const refresh = async () => {
    try {
      const perfil = await obtenerPerfil()
      // Determinar rol desde perfil.rol o perfil.roles[0]
      const rawRole = (perfil.rol || (perfil.roles && perfil.roles[0]) || "").toString().toLowerCase()
      let role: "analista" | "administrador" | "observador" = "analista"
      if (rawRole.includes("admin")) role = "administrador"
      else if (rawRole.includes("observador") || rawRole.includes("viewer") || rawRole.includes("read")) role = "observador"
      else role = "analista"

      const mappedUser: User = {
        id: String(perfil.usuarioID ?? ""),
        email: perfil.email || "",
        name: perfil.nombreCompleto || perfil.nombre || `${perfil.nombres || ""} ${perfil.apellidos || ""}`.trim() || "Usuario",
        role,
        department: "Laboratorio",
        permissions: ROLE_PERMISSIONS[role],
      }
      setUser(mappedUser)
    } catch (e) {
      console.warn("No hay sesión iniciada o error al obtener perfil", e)
      setUser(null)
    }
  }

  useEffect(() => {
    let mounted = true
    const init = async () => {
      setIsLoading(true)
      await refresh()
      if (mounted) setIsLoading(false)
    }
    init()
    return () => {
      mounted = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    let mockUser: User

    // Mock different users based on email
    if (email.includes("admin")) {
      mockUser = {
        id: "1",
        email,
        name: "Dr. María González",
        role: "administrador",
        department: "Dirección de Laboratorio",
        permissions: ROLE_PERMISSIONS.administrador,
      }
    } else if (email.includes("observador")) {
      mockUser = {
        id: "3",
        email,
        name: "Cliente Externo",
        role: "observador",
        permissions: ROLE_PERMISSIONS.observador,
      }
    } else {
      mockUser = {
        id: "2",
        email,
        name: "Lic. Carlos Rodríguez",
        role: "analista",
        department: "Laboratorio de Semillas",
        permissions: ROLE_PERMISSIONS.analista,
      }
    }

    // Solo para entornos de desarrollo: setear usuario en memoria
    setUser(mockUser)
  }

  const logout = async () => {
    try {
      // Llama al backend para invalidar cookies HttpOnly
      await apiFetch("/api/v1/auth/logout", { method: "POST" })
    } catch (e) {
      console.warn("Error en logout backend, continuando con limpieza local", e)
    } finally {
      setUser(null)
      // Limpieza defensiva (por si quedó algo viejo)
      if (typeof window !== "undefined") {
        try { localStorage.removeItem("inia-user") } catch { }
        try { localStorage.removeItem("usuario") } catch { }
        try { sessionStorage.clear() } catch { }
      }
    }
  }

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false
  }

  const isRole = (role: string): boolean => {
    return user?.role === role
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission, isRole, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
