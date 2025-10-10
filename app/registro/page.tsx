"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Users, Beaker, Plus, Clock, Building2 } from "lucide-react"
import Link from "next/link"

export default function RegistroPage() {
  const registrationOptions = [
    {
      title: "Registro de Lotes",
      description: "Registrar nuevos lotes de semillas para análisis",
      icon: Package,
      href: "/registro/lotes",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Registro de análisis a un lote existente",
      description: "Registrar análisis",
      icon: Beaker,
      href: "/registro/analisis",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Registro de Cliente",
      description: "Registrar nuevo cliente en el sistema",
      icon: Building2,
      href: "/registro/empresa",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Aceptar nuevo usuario",
      description: "Registrar nuevo usuario en el sistema",
      icon: Users,
      href: "/validacion/usuario",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  const recentRegistrations = [
    { id: "RG-LE-ex-0023", tipo: "Lote", fecha: "2024-12-15", estado: "Completado" },
    { id: "EMP-001", tipo: "Empresa", fecha: "2024-12-14", estado: "Pendiente" },
    { id: "AN-005", tipo: "Análisis", fecha: "2024-12-13", estado: "En proceso" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Centro de Registro</h1>
        <p className="text-muted-foreground text-pretty">
          Registra nuevos elementos en el sistema INIA de manera rápida y eficiente
        </p>
      </div>

      {/* Registration Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {registrationOptions.map((option, index) => (
          <Link key={index} href={option.href}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`${option.bgColor} rounded-full p-4 group-hover:scale-110 transition-transform`}>
                    <option.icon className={`h-8 w-8 ${option.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-balance">{option.title}</h3>
                    <p className="text-sm text-muted-foreground text-pretty mt-2">{option.description}</p>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Registro</CardTitle>
              <CardDescription>Resumen de registros realizados este mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">24</p>
                  <p className="text-sm text-muted-foreground">Lotes Registrados</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">8</p>
                  <p className="text-sm text-muted-foreground">Empresas Nuevas</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">15</p>
                  <p className="text-sm text-muted-foreground">Análisis Solicitados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Registros Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRegistrations.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.id}</p>
                    <p className="text-xs text-muted-foreground">{item.tipo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{item.fecha}</p>
                    <p className="text-xs font-medium">{item.estado}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
