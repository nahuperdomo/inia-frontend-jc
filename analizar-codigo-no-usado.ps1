# Script para generar reporte de código no utilizado
# Uso: .\analizar-codigo-no-usado.ps1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Análisis de Código No Utilizado - Frontend" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Ejecutar ESLint y capturar la salida
Write-Host "Ejecutando ESLint..." -ForegroundColor Yellow
$eslintOutput = npm run lint 2>&1 | Out-String

# Guardar el reporte completo
$eslintOutput | Out-File -FilePath "reporte-eslint.txt" -Encoding UTF8

# Contar problemas
$warningCount = ([regex]::Matches($eslintOutput, "warning")).Count
$errorCount = ([regex]::Matches($eslintOutput, "error")).Count

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DEL ANÁLISIS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Total de Warnings: $warningCount" -ForegroundColor Yellow
Write-Host "Total de Errores: $errorCount" -ForegroundColor Red
Write-Host ""

# Extraer solo warnings de imports no utilizados
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  IMPORTS NO UTILIZADOS (del backend)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$unusedImports = $eslintOutput -split "`n" | Where-Object { 
    $_ -match "unused-imports/no-unused-imports" 
}

if ($unusedImports.Count -gt 0) {
    $unusedImports | ForEach-Object {
        Write-Host $_ -ForegroundColor Magenta
    }
    Write-Host ""
    Write-Host "Total de imports no utilizados: $($unusedImports.Count)" -ForegroundColor Yellow
} else {
    Write-Host "¡No se encontraron imports no utilizados! 🎉" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  VARIABLES/FUNCIONES NO UTILIZADAS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$unusedVars = $eslintOutput -split "`n" | Where-Object { 
    $_ -match "@typescript-eslint/no-unused-vars" 
}

if ($unusedVars.Count -gt 0) {
    $unusedVars | ForEach-Object {
        Write-Host $_ -ForegroundColor Magenta
    }
    Write-Host ""
    Write-Host "Total de variables/funciones no utilizadas: $($unusedVars.Count)" -ForegroundColor Yellow
} else {
    Write-Host "¡No se encontraron variables no utilizadas! 🎉" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ACCIONES RECOMENDADAS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Para eliminar automáticamente imports no utilizados:" -ForegroundColor White
Write-Host "   npm run lint:fix" -ForegroundColor Green
Write-Host ""
Write-Host "2. Para ver el reporte completo:" -ForegroundColor White
Write-Host "   cat reporte-eslint.txt" -ForegroundColor Green
Write-Host ""
Write-Host "3. Para analizar un archivo específico:" -ForegroundColor White
Write-Host "   npx eslint app/ruta/al/archivo.tsx" -ForegroundColor Green
Write-Host ""
Write-Host "Reporte completo guardado en: reporte-eslint.txt" -ForegroundColor Cyan
Write-Host ""
