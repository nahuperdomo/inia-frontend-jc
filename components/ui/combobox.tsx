"use client"

import * as React from "react"
import * as Popover from "@radix-ui/react-popover"
import { CheckIcon, ChevronDownIcon, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ComboOption {
  id: string | number
  nombre: string
  [key: string]: any
}

interface ComboboxProps {
  value: string | number | ""
  onValueChange: (v: string) => void
  options: ComboOption[]
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
  valueKey?: string // default id
  labelKey?: string // default nombre
}

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  disabled = false,
  className,
  valueKey = "id",
  labelKey = "nombre",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const stringValue = value === undefined || value === null ? "" : String(value)

  const selected = React.useMemo(() => {
    return options.find((o) => String(o[valueKey] ?? o.id) === stringValue)
  }, [options, stringValue, valueKey])

  const items = React.useMemo(() => {
    if (!search.trim()) return options
    const q = search.toLowerCase()
    return options.filter((o) => String(o[labelKey] ?? o.nombre).toLowerCase().includes(q))
  }, [options, search, labelKey])

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-9",
            className
          )}
        >
          <span className={cn(!selected && "text-muted-foreground")}> 
            {selected ? String(selected[labelKey] ?? selected.nombre) : placeholder}
          </span>
          <ChevronDownIcon className="size-4 opacity-50" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={cn(
            "z-50 w-[var(--radix-popover-trigger-width)] min-w-[14rem] rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
          sideOffset={6}
        >
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className={cn(
                  "w-full pl-8 pr-2 py-1.5 text-sm rounded-md border bg-background outline-none",
                  "placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
                )}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {items.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
            ) : (
              items.map((o) => {
                const v = String(o[valueKey] ?? o.id)
                const label = String(o[labelKey] ?? o.nombre)
                const selected = v === stringValue
                return (
                  <button
                    key={v}
                    type="button"
                    className={cn(
                      "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none",
                      selected && "bg-accent/50"
                    )}
                    onClick={() => {
                      onValueChange(v)
                      setOpen(false)
                    }}
                  >
                    <span className="absolute right-2 flex size-3.5 items-center justify-center">
                      {selected ? <CheckIcon className="size-4" /> : null}
                    </span>
                    <span>{label}</span>
                  </button>
                )
              })
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default Combobox
