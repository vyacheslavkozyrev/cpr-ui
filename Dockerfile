
# ----------------------------
# Stage 1: Build the SPA
# ----------------------------
FROM docker.io/node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the app including env file
COPY . .

# Copy .env.development for the build
# (this will be baked into the build output if your frontend reads process.env.*)
COPY .env.development .env.development

# Build the SPA
RUN yarn build:dev

# ----------------------------
# Stage 2: Serve with NGINX (small final image)
# ----------------------------
FROM docker.io/nginx:1.27-alpine

# Security best practices
# - remove default config
# - make root read-only (read-only layers still possible with mounted envs)
RUN rm -rf /usr/share/nginx/html/*

WORKDIR /usr/share/nginx/html

# Copy build output from builder
COPY --from=builder /app/dist .

# Copy default NGINX config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Copy env injection script
# COPY entrypoint.sh /docker-entrypoint.d/99-env.sh
# RUN chmod +x /docker-entrypoint.d/99-env.sh

# # Copy your .env.development file to container (optional)
# COPY .env.development /usr/share/nginx/html/.env.development

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
