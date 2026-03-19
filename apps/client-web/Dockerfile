# --- Build stage ---
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY apps/client-web/package.json ./apps/client-web/

RUN npm ci --workspace=apps/client-web --include=optional

COPY apps/client-web ./apps/client-web

RUN npm run build --workspace=apps/client-web

# --- Runtime stage ---
FROM nginx:stable-alpine AS runner

COPY --from=builder /app/apps/client-web/dist /usr/share/nginx/html

# SPA fallback: route all requests to index.html
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
