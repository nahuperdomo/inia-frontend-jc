/**
 * Script de prueba para verificar la conexión de exportación Excel
 * 
 * Este script puede ejecutarse en la consola del navegador para verificar
 * que la exportación funciona correctamente sin necesidad de hacer clicks.
 */

// Configuración
const API_BASE_URL = 'http://localhost:8080';
const token = localStorage.getItem('token');

// Test 1: Verificar token
if (!token) {
  console.error(' No hay token de autenticación. Por favor inicia sesión.');
}

// Test 2: Probar exportación simple
async function testExportacionSimple() {
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/exportaciones/excel`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {      
      const blob = await response.blob();      
      return blob;
    } else {
      const errorText = await response.text();
    }
  } catch (error) {
    console.error(' Error en la solicitud:', error.message);
  }
}

// Test 3: Probar exportación con filtros
async function testExportacionConFiltros() {  
  const filtros = {
    incluirInactivos: false,
    tiposAnalisis: ['PUREZA', 'GERMINACION'],
    incluirEncabezados: true,
    incluirColoresEstilo: true,
    formatoFecha: 'dd/MM/yyyy'
  };
    
  try {
    const response = await fetch(`${API_BASE_URL}/api/exportaciones/excel/avanzado`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(filtros),
    });

    if (response.ok) {
      const blob = await response.blob();      
      return blob;
    } else {
      console.error(' Error en respuesta:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('   Detalle:', errorText);
    }
  } catch (error) {
    console.error(' Error en la solicitud:', error.message);
  }
}

// Test 4: Verificar conectividad con el backend
async function testConectividad() {  
  try {
    const response = await fetch(`${API_BASE_URL}/actuator/health`, {
      method: 'GET',
    });

    if (response.ok) {
      const health = await response.json();
    } else {
      console.warn(' Endpoint /actuator/health no disponible (normal si no está habilitado)');
    }
  } catch (error) {
    console.error(' Backend no responde en', API_BASE_URL);
    console.error('   Asegúrate de que el backend esté corriendo en el puerto 8080');
  }
}

// Función para descargar el blob generado
function descargarBlob(blob, nombreArchivo) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Ejecutar todas las pruebas
async function ejecutarTodasLasPruebas() {
  await testConectividad();
  
  if (!token) {
    return;
  }
  
  const blobSimple = await testExportacionSimple();
  if (blobSimple) {
    descargarBlob(blobSimple, 'prueba_exportacion_simple.xlsx');
  }
  
  const blobFiltros = await testExportacionConFiltros();
  if (blobFiltros) {
    descargarBlob(blobFiltros, 'prueba_exportacion_filtros.xlsx');
  }
  
}

// Auto-ejecutar las pruebas
ejecutarTodasLasPruebas();

// También exportar funciones para uso manual
window.testExportacion = {
  testExportacionSimple,
  testExportacionConFiltros,
  testConectividad,
  ejecutarTodasLasPruebas,
};

console.log('\n Tip: Puedes ejecutar pruebas individuales desde la consola:');
console.log('   - testExportacion.testExportacionSimple()');
console.log('   - testExportacion.testExportacionConFiltros()');
console.log('   - testExportacion.ejecutarTodasLasPruebas()');
