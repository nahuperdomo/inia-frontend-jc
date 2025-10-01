# Etapa de construcción (build)
FROM node:18-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Instalar pnpm globalmente (ya que el proyecto usa pnpm según el pnpm-lock.yaml)
RUN npm install -g pnpm

# Copiar archivos de configuración del proyecto
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Variables de entorno para la compilación
ENV NEXT_PUBLIC_API_URL=http://backend:8080

# Construir la aplicación para producción
RUN pnpm build

# Etapa de producción
FROM node:18-alpine AS production

# Establecer directorio de trabajo
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Crear usuario no-root para mejorar seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs --ingroup nodejs

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

# Cambiar al usuario no-root
USER nextjs

# Exponer el puerto de la aplicación
EXPOSE 3000

# Variables de entorno para la ejecución
ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Comando para iniciar la aplicación
CMD ["node", "server.js"]

# Etapa de desarrollo (separada)
FROM node:18-alpine AS development

# Establecer directorio de trabajo
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar archivos de configuración del proyecto
COPY package.json pnpm-lock.yaml* ./

# Instalar todas las dependencias (incluyendo devDependencies)
# Usar clean-install en lugar de --force para una instalación más limpia
RUN pnpm install --shamefully-hoist

# Exponer el puerto de la aplicación
EXPOSE 3000

# Variables de entorno para desarrollo
ENV PORT=3000
ENV NODE_ENV=development
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_API_URL=http://backend:8080
# Variables de optimización para Next.js en Docker
ENV NEXT_TELEMETRY_DISABLED=1
# Aumentar memoria disponible para Node.js
ENV NODE_OPTIONS="--max-old-space-size=4096"
# Deshabilitar características experimentales que causan problemas
ENV NEXT_DISABLE_PARTIAL_HYDRATION=true
# Configuración para mejor estabilidad en Docker
ENV WATCHPACK_POLLING=true

# IMPORTANTE: NO usar dev:stable, usar solo dev para evitar problemas de require/import
# El error "require is not defined" ocurre porque los archivos .mjs usan importación ES Modules
CMD ["sh", "-c", "pnpm install --shamefully-hoist && pnpm dev"]