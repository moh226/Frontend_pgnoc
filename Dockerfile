# ============================================================
# PGNOC-TI — FRONTEND (Dockerfile de production)
# ============================================================
# Build statique Vue/Vite servi par nginx.
#
# Usage :
#   docker build -t pgnoc-ti-frontend .
#   docker run -p 8080:80 pgnoc-ti-frontend
#
# Backend sur un autre hôte/URL :
#   docker build --build-arg VITE_API_URL=https://api.exemple.com -t pgnoc-ti-frontend .

# ---- Étape 1 : compilation ----
FROM node:22-alpine AS build

WORKDIR /app

# Cache des dépendances : on ne réinstalle npm que si les lockers changent
COPY package.json package-lock.json ./
RUN npm ci

# Code source + build (typecheck + vite build -> dist/)
COPY . .
# URL de base de l'API. Par défaut relatif -> nginx relaie /api/ et /media/
# vers le backend (voir nginx.conf). Pour une API distante, passer en
# --build-arg une URL absolue.
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Étape 2 : serveur statique nginx ----
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]