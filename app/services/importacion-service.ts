import { apiFetch } from "./api";

interface ImportacionResponse {
    exitoso: boolean;
    mensaje: string;
    filasImportadas?: number;
    filasConErrores?: number;
    errores?: Array<{
        fila: number;
        campo: string;
        error: string;
    }>;
}

/**
 * Valida un archivo Excel de legados sin importarlo
 */
export async function validarArchivoLegados(archivo: File): Promise<ImportacionResponse> {
    try {
        const formData = new FormData();
        formData.append('archivo', archivo);

        // Usar fetch directamente para enviar FormData con cookies
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

        const response = await fetch(`${API_BASE_URL}/api/importacion/legado/validar`, {
            method: 'POST',
            credentials: 'include', // Importante para enviar cookies
            body: formData,
            // NO incluir Content-Type header - el navegador lo establece automáticamente con el boundary
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorDetail;
            try {
                if (errorText && errorText.trim().startsWith('{')) {
                    errorDetail = JSON.parse(errorText);
                }
            } catch (e) {
                // Ignorar si no es JSON
            }

            const errorMessage = errorDetail?.mensaje || errorDetail?.message || errorDetail?.error;
            throw new Error(errorMessage || `Error ${response.status}: No se pudo validar el archivo`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('❌ Error al validar archivo de legados:', error);
        throw new Error(error.message || 'Error al validar el archivo. Verifique su conexión e intente nuevamente.');
    }
}

/**
 * Importa datos desde un archivo Excel de legados
 */
export async function importarLegadosDesdeExcel(archivo: File): Promise<ImportacionResponse> {
    try {
        const formData = new FormData();
        formData.append('archivo', archivo);

        // Usar fetch directamente para enviar FormData con cookies
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

        const response = await fetch(`${API_BASE_URL}/api/importacion/legado/importar`, {
            method: 'POST',
            credentials: 'include', // Importante para enviar cookies
            body: formData,
            // NO incluir Content-Type header - el navegador lo establece automáticamente con el boundary
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorDetail;
            try {
                if (errorText && errorText.trim().startsWith('{')) {
                    errorDetail = JSON.parse(errorText);
                }
            } catch (e) {
                // Ignorar si no es JSON
            }

            const errorMessage = errorDetail?.mensaje || errorDetail?.message || errorDetail?.error;
            throw new Error(errorMessage || `Error ${response.status}: No se pudo importar el archivo`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('❌ Error al importar archivo de legados:', error);
        throw new Error(error.message || 'Error al importar el archivo. Verifique su conexión e intente nuevamente.');
    }
}
