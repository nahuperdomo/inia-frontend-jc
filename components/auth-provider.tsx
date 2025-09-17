"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
    // Check for existing session
    const savedUser = localStorage.getItem("inia-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
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
    localStorage.setItem("inia-user", JSON.stringify(mockUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("inia-user")
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
