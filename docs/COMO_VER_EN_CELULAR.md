#  Cómo Ver la PWA en tu Celular

## ✅ El servidor ya está corriendo

Tu aplicación está disponible en:
- **Desde tu PC**: http://localhost:3000
- **Desde tu celular**: http://192.168.1.41:3000

---

##  Método 1: Acceso por Red Local (RECOMENDADO)

### Pasos:

1. **Asegúrate que tu celular y PC están en la misma red WiFi**

2. **En tu celular, abre el navegador y visita:**
   ```
   http://192.168.1.41:3000
   ```

3. **Para instalar la PWA:**
   
   **En Android (Chrome/Edge):**
   - Toca el menú (⋮) → "Agregar a pantalla de inicio"
   - O verás un banner con "Instalar aplicación"
   
   **En iPhone (Safari):**
   - Toca el botón de compartir (□↑)
   - Desplázate y selecciona "Agregar a pantalla de inicio"
   - Toca "Agregar"

4. **¡Listo!** La app aparecerá en tu pantalla de inicio como una app nativa

---

##  Método 2: Deploy Temporal con ngrok (Si Método 1 no funciona)

Si tu celular no puede acceder por la red local, usa ngrok:

### Instalación de ngrok:

1. **Descarga ngrok:**
   - Ve a https://ngrok.com/download
   - Descarga la versión para Windows
   - Extrae el archivo `ngrok.exe`

2. **Opcional - Crea cuenta (para túneles sin tiempo límite):**
   - Regístrate en https://dashboard.ngrok.com/signup
   - Copia tu authtoken
   - Ejecuta: `ngrok config add-authtoken TU_TOKEN_AQUI`

3. **Inicia el túnel (en una nueva terminal de PowerShell):**
   ```powershell
   cd ruta\donde\está\ngrok
   .\ngrok.exe http 3000
   ```

4. **Copia la URL pública** que aparece (ejemplo: `https://abc123.ngrok-free.app`)

5. **Accede desde tu celular** usando esa URL

6. **Instala la PWA** desde el navegador móvil

### ️ Notas sobre ngrok:
- La URL cambia cada vez que reinicias ngrok (a menos que tengas cuenta paga)
- Funciona desde cualquier red (no necesitas estar en la misma WiFi)
- Gratis tiene límite de conexiones simultáneas

---

##  Método 3: Deploy en Vercel (Para producción)

Para tener la PWA disponible permanentemente:

### Pasos:

1. **Instala Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Login en Vercel:**
   ```powershell
   vercel login
   ```

3. **Deploy:**
   ```powershell
   cd c:\Users\nahun\Desktop\INIA\inia-frontend-jc
   vercel --prod
   ```

4. **Copia la URL** que te da Vercel (ejemplo: `https://tu-app.vercel.app`)

5. **Accede desde cualquier dispositivo** con esa URL

### ✅ Ventajas de Vercel:
- URL permanente y con HTTPS
- Deploy automático desde GitHub
- CDN global (rápido en todo el mundo)
- GRATIS para proyectos personales

---

##  Configuración del Firewall (Si Método 1 no funciona)

Si tu celular no puede acceder a `http://192.168.1.41:3000`, puede ser el firewall:

### Windows Firewall:

1. **Abrir PowerShell como Administrador**

2. **Ejecutar:**
   ```powershell
   New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```

3. **O manualmente:**
   - Windows → Configuración → Firewall
   - "Permitir una aplicación a través del firewall"
   - Agregar Node.js y marcar "Redes privadas"

---

##  Testing de la PWA

### Checklist en el celular:

1. **Accede a la URL**
   - ✅ La página carga correctamente
   
2. **Verifica funciones PWA:**
   - ✅ Aparece el banner/botón de instalación
   - ✅ Puedes agregar a pantalla de inicio
   - ✅ El ícono aparece en el home screen
   
3. **Prueba offline:**
   - Abre la app instalada
   - Activa modo avión
   - ✅ Navega por las páginas ya visitadas
   - ✅ Aparece la página offline cuando no hay caché
   
4. **Verifica el tema:**
   - ✅ La barra de estado del celular toma el color de la app (#0066cc)
   - ✅ Se ve como app nativa (sin barra del navegador)

---

##  URLs Rápidas de Acceso

Guarda estas URLs en tu celular:

### Red Local (cuando estés en tu WiFi de casa):
```
http://192.168.1.41:3000
```

### Para compartir con otros (requiere ngrok o Vercel):
```
[URL de ngrok o Vercel una vez configurado]
```

---

##  Tips

1. **Para desarrollo rápido**: Usa Método 1 (red local)
2. **Para mostrar a clientes**: Usa ngrok (temporal) o Vercel (permanente)
3. **Para producción**: Siempre usa Vercel u otro hosting con HTTPS
4. **HTTPS es necesario** para todas las funciones PWA (excepto en localhost)
5. **Actualiza la PWA**: Cierra y vuelve a abrir la app para ver cambios

---

## ❓ Troubleshooting

### No puedo acceder desde el celular a 192.168.1.41:3000

**Soluciones:**
1. Verifica que estás en la misma WiFi
2. Verifica que el servidor sigue corriendo (debería decir "Ready on http://localhost:3000")
3. Prueba con la otra IP: `http://172.19.128.1:3000`
4. Desactiva temporalmente el firewall de Windows
5. Usa ngrok en su lugar

### La PWA no se instala en iPhone

**Safari requiere más pasos:**
1. Debe ser HTTPS (localhost funciona, pero red local NO)
2. Usa ngrok o Vercel para tener HTTPS
3. O espera a hacer deploy en producción

### El ícono no aparece correctamente

Los íconos actuales son placeholders. Para crear íconos reales:
1. Crea un ícono base de 512x512px
2. Usa https://realfavicongenerator.net/
3. Descarga y reemplaza en `/public/icons/`

### Los cambios no se reflejan en la app instalada

1. Desinstala la PWA del celular
2. Limpia caché del navegador
3. Vuelve a visitar la URL
4. Reinstala la PWA

---

##  Contacto de Desarrollo

Si tienes problemas, verifica:
- ✅ Servidor corriendo en tu PC
- ✅ Celular en misma red WiFi
- ✅ Firewall permite conexiones
- ✅ URL correcta (http://192.168.1.41:3000)

**Tu IP local puede cambiar** si reinicias el router. Para ver tu IP actual:
```powershell
ipconfig | findstr IPv4
```

---

##  ¡Disfruta tu PWA!

Ahora puedes usar INIA como una app nativa en tu celular, con:
-  Ícono en pantalla de inicio
-  Inicio rápido
-  Funcionalidad offline
-  Datos en caché
-  Experiencia nativa