# Builds the admin and serves it with Caddy on port 80, inside the server's
# Docker network. The main Caddy (tpf-api/Caddyfile) answers
# https://admin.DOMAIN and passes the requests here.
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit --loglevel=error
COPY . .
ARG VITE_API_URL
ARG VITE_APP_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_URL=$VITE_APP_URL
RUN npm run build

FROM caddy:2.8
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
