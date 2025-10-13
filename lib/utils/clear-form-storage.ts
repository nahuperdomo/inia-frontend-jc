/**
 * Utilidades para limpiar el almacenamiento de formularios
 */

/**
 * Limpia todos los datos persistidos del formulario DOSN
 */
export function clearDosnStorage() {
  if (typeof window === "undefined") return

  const dosnKeys = [
    "dosn-datos-generales",
    "dosn-brassicas",
    "dosn-otros-cultivos",
    "dosn-malezas-Malezas", // Debe coincidir con el título
    "dosn-cuscuta",
    "dosn-cumple-estandar",
  ]

  dosnKeys.forEach((key) => {
    sessionStorage.removeItem(key)
    localStorage.removeItem(key)
  })

  console.log("✅ Storage de DOSN limpiado exitosamente")
}

/**
 * Limpia todos los datos persistidos del formulario Germinación
 */
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

  console.log("✅ Storage de Germinación limpiado exitosamente")
}

/**
 * Limpia todos los datos persistidos del formulario Tetrazolio
 */
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

  console.log("✅ Storage de Tetrazolio limpiado exitosamente")
}

/**
 * Limpia todos los datos persistidos del formulario Pureza
 */
export function clearPurezaStorage() {
  if (typeof window === "undefined") return

  const purezaKeys = [
    "pureza-datos-generales",
    "pureza-malezas",
    // Agregar más claves según sea necesario
  ]

  purezaKeys.forEach((key) => {
    sessionStorage.removeItem(key)
    localStorage.removeItem(key)
  })

  console.log("✅ Storage de Pureza limpiado exitosamente")
}

/**
 * Limpia todo el storage de formularios
 */
export function clearAllFormsStorage() {
  clearDosnStorage()
  clearGerminacionStorage()
  clearTetrazolioStorage()
  clearPurezaStorage()
  console.log("✅ Todos los storages de formularios limpiados")
}
