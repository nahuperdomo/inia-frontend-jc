/**
 * Script de prueba para verificar la conexión de exportación Excel
 * 
 * Este script puede ejecutarse en la consola del navegador para verificar
 * que la exportación funciona correctamente sin necesidad de hacer clicks.
 */

// Configuración
const API_BASE_URL = 'http://localhost:8080';
const token = localStorage.getItem('token');

console.log('🧪 Iniciando pruebas de exportación Excel...\n');

// Test 1: Verificar token
console.log('1️⃣ Verificando autenticación...');
if (!token) {
  console.error('❌ No hay token de autenticación. Por favor inicia sesión.');
} else {
  console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
}

// Test 2: Probar exportación simple
async function testExportacionSimple() {
  console.log('\n2️⃣ Probando exportación simple (todos los lotes)...');

  try {
    const response = await fetch(`${API_BASE_URL}/exportaciones/excel`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log('✅ Respuesta exitosa:', response.status);
      console.log('   Content-Type:', response.headers.get('Content-Type'));
      console.log('   Content-Length:', response.headers.get('Content-Length'), 'bytes');

      const blob = await response.blob();
      console.log('   Blob size:', blob.size, 'bytes');
      console.log('   Blob type:', blob.type);

      return blob;
    } else {
      console.error('❌ Error en respuesta:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('   Detalle:', errorText);
    }
  } catch (error) {
    console.error('❌ Error en la solicitud:', error.message);
  }
}

// Test 3: Probar exportación con filtros
async function testExportacionConFiltros() {
  console.log('\n3️⃣ Probando exportación con filtros avanzados...');

  const filtros = {
    incluirInactivos: false,
    tiposAnalisis: ['PUREZA', 'GERMINACION'],
    incluirEncabezados: true,
    incluirColoresEstilo: true,
    formatoFecha: 'dd/MM/yyyy'
  };

  console.log('   Filtros aplicados:', JSON.stringify(filtros, null, 2));

  try {
    const response = await fetch(`${API_BASE_URL}/exportaciones/excel/avanzado`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(filtros),
    });

    if (response.ok) {
      console.log('✅ Respuesta exitosa:', response.status);
      console.log('   Content-Type:', response.headers.get('Content-Type'));
      console.log('   Content-Length:', response.headers.get('Content-Length'), 'bytes');

      const blob = await response.blob();
      console.log('   Blob size:', blob.size, 'bytes');
      console.log('   Blob type:', blob.type);

      return blob;
    } else {
      console.error('❌ Error en respuesta:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('   Detalle:', errorText);
    }
  } catch (error) {
    console.error('❌ Error en la solicitud:', error.message);
  }
}

// Test 4: Verificar conectividad con el backend
async function testConectividad() {
  console.log('\n4️⃣ Verificando conectividad con el backend...');

  try {
    const response = await fetch(`${API_BASE_URL}/actuator/health`, {
      method: 'GET',
    });

    if (response.ok) {
      const health = await response.json();
      console.log('✅ Backend está activo:', health);
    } else {
      console.warn('⚠️ Endpoint /actuator/health no disponible (normal si no está habilitado)');
    }
  } catch (error) {
    console.error('❌ Backend no responde en', API_BASE_URL);
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
  console.log(`📥 Archivo descargado: ${nombreArchivo}`);
}

// Ejecutar todas las pruebas
async function ejecutarTodasLasPruebas() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   PRUEBA DE EXPORTACIÓN EXCEL - INIA SYSTEM           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  await testConectividad();

  if (!token) {
    console.log('\n⚠️ No se pueden ejecutar más pruebas sin token de autenticación.');
    console.log('   Por favor inicia sesión en la aplicación y vuelve a ejecutar este script.');
    return;
  }

  const blobSimple = await testExportacionSimple();
  if (blobSimple) {
    console.log('   💾 Descargando archivo de prueba...');
    descargarBlob(blobSimple, 'prueba_exportacion_simple.xlsx');
  }

  const blobFiltros = await testExportacionConFiltros();
  if (blobFiltros) {
    console.log('   💾 Descargando archivo de prueba...');
    descargarBlob(blobFiltros, 'prueba_exportacion_filtros.xlsx');
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   PRUEBAS COMPLETADAS                                  ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('\n📊 Revisa los archivos descargados para verificar el contenido.');
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

console.log('\n💡 Tip: Puedes ejecutar pruebas individuales desde la consola:');
console.log('   - testExportacion.testExportacionSimple()');
console.log('   - testExportacion.testExportacionConFiltros()');
console.log('   - testExportacion.ejecutarTodasLasPruebas()');
