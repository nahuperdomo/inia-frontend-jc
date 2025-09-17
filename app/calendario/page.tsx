"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, AlertCircle } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: "analisis" | "revision" | "reunion" | "mantenimiento" | "otro"
  description: string
  location?: string
  responsible: string
  status: "programado" | "en-curso" | "completado" | "cancelado"
  priority: "baja" | "normal" | "alta" | "urgente"
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")

  const [events] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Análisis de Pureza - Lote RG-LE-ex-0018",
      date: "2024-12-16",
      time: "09:00",
      type: "analisis",
      description: "Análisis de pureza física para lote de soja",
      location: "Lab Central INIA",
      responsible: "Dr. Juan Pérez",
      status: "programado",
      priority: "alta",
    },
    {
      id: "2",
      title: "Revisión Semanal de Lotes",
      date: "2024-12-17",
      time: "14:00",
      type: "revision",
      description: "Revisión semanal del estado de todos los lotes activos",
      location: "Sala de Reuniones",
      responsible: "Dra. María González",
      status: "programado",
      priority: "normal",
    },
    {
      id: "3",
      title: "Mantenimiento Equipos Lab",
      date: "2024-12-18",
      time: "08:00",
      type: "mantenimiento",
      description: "Mantenimiento preventivo de equipos de laboratorio",
      location: "Lab Central INIA",
      responsible: "Técnico Martínez",
      status: "programado",
      priority: "normal",
    },
    {
      id: "4",
      title: "Reunión Mensual INIA",
      date: "2024-12-20",
      time: "10:00",
      type: "reunion",
      description: "Reunión mensual de coordinación y planificación",
      location: "Auditorio Principal",
      responsible: "Director General",
      status: "programado",
      priority: "alta",
    },
  ])

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "analisis":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "revision":
        return "bg-green-100 text-green-800 border-green-200"
      case "reunion":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "mantenimiento":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === "urgente" || priority === "alta") {
      return <AlertCircle className="h-3 w-3 text-red-500" />
    }
    return null
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return events.filter((event) => event.date === dateString)
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const todayEvents = events.filter((event) => {
    const today = new Date().toISOString().split("T")[0]
    return event.date === today
  })

  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date)
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return eventDate > today && eventDate <= nextWeek
    })
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Calendario INIA</h1>
          <p className="text-muted-foreground text-pretty">
            Gestiona eventos, análisis programados y actividades del instituto
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={(value: "month" | "week" | "day") => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mes</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="day">Día</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nuevo Evento</DialogTitle>
                <DialogDescription>Programa una nueva actividad en el calendario</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input placeholder="Título del evento" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Fecha</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label htmlFor="time">Hora</Label>
                    <Input type="time" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analisis">Análisis</SelectItem>
                      <SelectItem value="revision">Revisión</SelectItem>
                      <SelectItem value="reunion">Reunión</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea placeholder="Descripción del evento" rows={3} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowEventDialog(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={() => setShowEventDialog(false)} className="flex-1">
                    Crear Evento
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {formatMonth(currentDate)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Hoy
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="p-2 h-24"></div>
                  }

                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                  const dayEvents = getEventsForDate(date)
                  const isToday = date.toDateString() === new Date().toDateString()

                  return (
                    <div
                      key={day}
                      className={`p-2 h-24 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                        isToday ? "bg-primary/10 border-primary" : "border-border"
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{day}</div>
                      <div className="space-y-1 mt-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div key={event.id} className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)}`}>
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(event.priority)}
                              <span className="truncate">{event.title}</span>
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} más</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Eventos de Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayEvents.length > 0 ? (
                <div className="space-y-3">
                  {todayEvents.map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{event.time}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{event.location}</span>
                            </div>
                          )}
                        </div>
                        {getPriorityIcon(event.priority)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay eventos programados para hoy</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{event.responsible}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Eventos este mes:</span>
                  <span className="font-medium">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Análisis programados:</span>
                  <span className="font-medium">{events.filter((e) => e.type === "analisis").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reuniones:</span>
                  <span className="font-medium">{events.filter((e) => e.type === "reunion").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Eventos completados:</span>
                  <span className="font-medium">{events.filter((e) => e.status === "completado").length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
