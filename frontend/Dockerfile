# SIGTM - cliente de navegador

FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
# --host 0.0.0.0 es obligatorio: sin eso Vite solo escucha dentro del
# contenedor y el navegador del equipo no lo alcanza.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
