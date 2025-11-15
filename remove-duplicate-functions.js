const fs = require("fs");
const path = require("path");

const filesToFix = [
  "app/listado/analisis/pms/page.tsx",
  "app/listado/analisis/pms/[id]/page.tsx",
  "app/listado/analisis/dosn/[id]/page.tsx",
  "app/listado/analisis/pureza/[id]/page.tsx",
  "app/listado/analisis/germinacion/page.tsx",
  "app/listado/analisis/germinacion/[id]/page.tsx",
  "app/listado/analisis/germinacion/[id]/editar/page.tsx",
  "app/listado/lotes/[id]/page.tsx"
];

const duplicateFunctions = [
  {
    name: "getEstadoBadgeVariant",
    pattern: /const getEstadoBadgeVariant = \(estado:.*?\n(?:.*?\n){0,30}  \}/gms
  },
  {
    name: "formatEstado",
    pattern: /const formatEstado = \(estado:.*?\n(?:.*?\n){0,30}  \}/gms
  },
  {
    name: "formatearFechaLocal",
    pattern: /const formatearFechaLocal = \(fecha.*?\n(?:.*?\n){0,30}  \}/gms
  },
  {
    name: "formatearFechaHora",
    pattern: /const formatearFechaHora = \(fecha.*?\n(?:.*?\n){0,30}  \}/gms
  },
  {
    name: "convertirFechaParaInput",
    pattern: /const convertirFechaParaInput = \(fecha.*?\n(?:.*?\n){0,30}  \}/gms
  },
  {
    name: "formatearFecha",
    pattern: /const formatearFecha = \(fecha.*?\n(?:.*?\n){0,20}  \}/gms
  }
];

const importLine = 'import { formatearFechaLocal, formatearFechaHora, convertirFechaParaInput, getEstadoBadgeVariant, formatEstado } from "@/lib/utils/format-helpers"';

let modified = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join("c:/Users/nahun/Desktop/INIA/inia-frontend-jc", filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`  No existe: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, "utf-8");
  let changed = false;
  
  duplicateFunctions.forEach(func => {
    const matches = content.match(func.pattern);
    if (matches && matches.length > 0) {
      content = content.replace(func.pattern, "");
      changed = true;
      console.log(` Removido ${func.name} de ${filePath}`);
    }
  });
  
  if (changed) {
    if (!content.includes("@/lib/utils/format-helpers")) {
      const importMatch = content.match(/import .* from ['"]@\/lib\/utils\/.*?['"]/);
      if (importMatch) {
        content = content.replace(importMatch[0], importMatch[0] + "\n" + importLine);
      }
    }
    
    content = content.replace(/\n\n\n+/g, "\n\n");
    
    fs.writeFileSync(fullPath, content, "utf-8");
    modified++;
  }
});

console.log(`\n Modificados: ${modified} archivos`);
