# syntax=docker/dockerfile:1.6

# ---- Base image ----
FROM node:20-alpine AS base

ENV PNPM_HOME=/usr/local/share/pnpm \
    PATH=/usr/local/share/pnpm:$PATH \
    PORT=8080

# Enable corepack (for pnpm)
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /app

# ---- Dependencies ----
FROM base AS deps

# Only copy the files needed to install deps
COPY package.json pnpm-lock.yaml ./

# Skip husky prepare script during install, but keep other install scripts (e.g., sharp)
ENV HUSKY=0

# Install ALL dependencies including devDependencies for the build step
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM base AS build

WORKDIR /app

# Copy node_modules from deps layer
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source
COPY . ./

# Build Next.js (outputs .next)
RUN pnpm run build

# ---- Runtime ----
FROM base AS runtime

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy only necessary artifacts for runtime
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/src ./src

# Copy node_modules and prune to production only
COPY --from=build /app/node_modules ./node_modules
ENV NODE_ENV=production

USER nextjs

# Expose the port and start the server
EXPOSE 8080

# Next listens to PORT env; ensure 0.0.0.0
ENV HOST=0.0.0.0

CMD ["pnpm", "start", "-p", "8080"]
