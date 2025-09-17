"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface LotSearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  placeholder?: string
}

export function LotSearch({
  searchTerm,
  onSearchChange,
  placeholder = "Buscar por lote, especie, cultivar...",
}: LotSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 w-80"
      />
    </div>
  )
}
