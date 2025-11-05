/**
 * Helper para extraer metadata de paginación de respuestas de Spring Boot.
 * Soporta dos formatos:
 * 1. Directo: { content, totalPages, totalElements, number, ... }
 * 2. Anidado: { page: { totalPages, totalElements, number, ... }, content }
 */

export interface PageMetadata<T> {
  content: T[]
  totalPages: number
  totalElements: number
  currentPage: number
  isFirst: boolean
  isLast: boolean
}

/**
 * Extrae la metadata de paginación de una respuesta del backend.
 * 
 * @param data Respuesta del backend (puede venir en diferentes formatos)
 * @param fallbackPage Número de página a usar si no viene en la respuesta (default: 0)
 * @returns Objeto con content y metadata de paginación normalizada
 * 
 * @example
 * // En tu componente:
 * const fetchData = async (page: number = 0) => {
 *   try {
 *     const data = await obtenerDatosPaginados(page, pageSize)
 *     
 *     // Extraer metadata usando el helper
 *     const pageData = extractPageMetadata<MiTipo>(data, page)
 *     
 *     // Actualizar estado con los valores extraídos
 *     setItems(pageData.content)
 *     setTotalPages(pageData.totalPages)
 *     setTotalElements(pageData.totalElements)
 *     setCurrentPage(pageData.currentPage)
 *     setIsFirst(pageData.isFirst)
 *     setIsLast(pageData.isLast)
 *   } catch (err) {
 *     console.error(err)
 *   }
 * }
 */
export function extractPageMetadata<T>(data: any, fallbackPage: number = 0): PageMetadata<T> {
  // Extraer contenido
  const content = data.content || []
  
  // Soportar dos formas que puede devolver el backend
  const pageMeta = data.page ? data.page : data
  
  // Extraer metadata con valores por defecto seguros
  const totalPages = pageMeta.totalPages ?? 1
  const totalElements = pageMeta.totalElements ?? content.length
  const currentPage = pageMeta.number ?? fallbackPage
  
  return {
    content,
    totalPages,
    totalElements,
    currentPage,
    isFirst: currentPage === 0,
    isLast: currentPage >= totalPages - 1
  }
}
