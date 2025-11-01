"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { obtenerPerfil, logout as logoutService } from "@/app/services/auth-service"

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
  logout: () => void
  isLoading: boolean
  hasPermission: (permission: string) => boolean
  isRole: (role: string) => boolean
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

  useEffect(() => {
    console.log("🔄 AuthProvider: Iniciando carga de usuario...");

    // Check for existing session
    if (typeof window !== "undefined") {
      // Intentar con ambas keys: "usuario" (del login real) o "inia-user" (del mock)
      const savedUserData = localStorage.getItem("usuario") || localStorage.getItem("inia-user")

      if (savedUserData) {
        console.log("📦 AuthProvider: Datos encontrados en localStorage");
        const parsedUser = JSON.parse(savedUserData)

        // Si viene del login real (tiene roles array)
        if (parsedUser.roles && Array.isArray(parsedUser.roles)) {
          let userRole: "analista" | "administrador" | "observador" = "analista"
          if (parsedUser.roles.length > 0) {
            const rolBackend = parsedUser.roles[0].toLowerCase()
            if (rolBackend === "admin" || rolBackend === "administrador") {
              userRole = "administrador"
            } else if (rolBackend === "observador") {
              userRole = "observador"
            }
          }

          const mappedUser: User = {
            id: parsedUser.id?.toString() || "1",
            email: parsedUser.email || "",
            name: parsedUser.nombre || `${parsedUser.nombres || ""} ${parsedUser.apellidos || ""}`.trim() || "Usuario",
            role: userRole,
            department: "Laboratorio",
            permissions: ROLE_PERMISSIONS[userRole],
          }
          setUser(mappedUser)
          console.log("✅ AuthProvider: Usuario cargado (login real):", { name: mappedUser.name, role: mappedUser.role })
        } else {
          // Si ya viene en formato User (del mock)
          setUser(parsedUser)
          console.log("✅ AuthProvider: Usuario cargado (mock):", { name: parsedUser.name, role: parsedUser.role })
        }
      } else {
        console.log("⚠️ AuthProvider: No hay datos de usuario en localStorage");
      }
    }

    // ⚠️ CRÍTICO: Esperar un tick antes de marcar como no cargando
    // Esto asegura que el estado de user se haya actualizado completamente
    setTimeout(() => {
      setIsLoading(false)
      console.log("✅ AuthProvider: Carga completada");
    }, 0);
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

    setUser(mockUser)
    if (typeof window !== "undefined") {
      localStorage.setItem("inia-user", JSON.stringify(mockUser))
    }
  }

  const logout = async () => {
    try {
      // Llamar al backend para invalidar la sesión (JSESSIONID)
      await logoutService()
      console.log("✅ Sesión invalidada en el backend")
    } catch (error) {
      console.error("❌ Error al invalidar sesión en el backend:", error)
      // Continuar con el logout del frontend aunque falle el backend
    }

    // Limpiar estado local
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("inia-user")
      localStorage.removeItem("usuario")
    }
  }

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false
  }

  const isRole = (role: string): boolean => {
    return user?.role === role
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission, isRole }}>
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
