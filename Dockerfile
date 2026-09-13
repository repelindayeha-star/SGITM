# SIGTM - servidor (API)
#
# Imagen de desarrollo: trae las dependencias de desarrollo y la recarga
# automatica, que es lo que hace falta mientras se termina el proyecto.

FROM node:20-slim

# Prisma necesita openssl. Sin esto, generar el cliente de base de datos
# falla con un error que no dice lo que pasa.
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Primero los manifiestos: asi Docker reutiliza la capa de dependencias
# mientras solo cambie el codigo, y reconstruir tarda segundos en vez de
# minutos.
COPY package*.json ./
RUN npm install

# El cliente de Prisma se genera contra el esquema, de modo que este paso
# tiene que ir despues de copiar el esquema y antes del resto del codigo.
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3001
CMD ["npm", "run", "dev"]
