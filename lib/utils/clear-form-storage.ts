


export function clearDosnStorage() {
  if (typeof window === "undefined") return

  const dosnKeys = [
    // Solo limpiar datos de la pestaña "Registros"
    "dosn-brassicas",
    "dosn-otros-cultivos",
    "dosn-malezas-Malezas", // Debe coincidir con el título
    "dosn-cuscuta",
    // NO incluir "dosn-datos-generales" ni "dosn-cumple-estandar"
  ]

  dosnKeys.forEach((key) => {
    sessionStorage.removeItem(key)
    localStorage.removeItem(key)
  })
}


export function clearGerminacionStorage() {
  if (typeof window === "undefined") return

  const germinacionKeys = [
    "germinacion-datos-generales",
    // Agregar más claves según sea necesario
  ]

  germinacionKeys.forEach((key) => {
    sessionStorage.removeItem(key)
    localStorage.removeItem(key)
  })
}


export function clearTetrazolioStorage() {
  if (typeof window === "undefined") return

  const tetrazolioKeys = [
    "tetrazolio-datos-generales",
    // Agregar más claves según sea necesario
  ]

  tetrazolioKeys.forEach((key) => {
    sessionStorage.removeItem(key)
    localStorage.removeItem(key)
  })
}


export function clearPurezaStorage() {
  if (typeof window === "undefined") return

  const purezaKeys = [
    "pureza-datos-generales",
    "pureza-brassicas",
    "pureza-otros-cultivos",
    "pureza-malezas-Malezas", // Clave con contexto pureza
  ]

  purezaKeys.forEach((key) => {
    sessionStorage.removeItem(key)
    localStorage.removeItem(key)
  })
}


export function clearAllFormsStorage() {
  clearDosnStorage()
  clearGerminacionStorage()
  clearTetrazolioStorage()
  clearPurezaStorage()
}
