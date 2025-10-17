# Imagen base para todas las etapas
FROM node:18-alpine AS base

# Configuración del directorio de trabajo
WORKDIR /app

# Dependencias comunes
FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Etapa de desarrollo
FROM dependencies AS development
# Copiar archivos de configuración
COPY tsconfig.json next.config.mjs components.json .
# Comando para desarrollo
CMD ["pnpm", "dev"]

# Etapa de construcción
FROM dependencies AS builder
# Copiar todo el código fuente
COPY . .
# Construir la aplicación para producción
RUN pnpm run build

# Etapa de producción
FROM base AS production
# Establecer variables de entorno para producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar la aplicación construida y los archivos necesarios
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar en producción
CMD ["node", "server.js"]