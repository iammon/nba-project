# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps only when package files change
COPY package*.json ./
RUN npm ci

# Copy the rest and build
COPY . .
# Ensure Prisma client gets generated for the build
RUN npx prisma generate
RUN npm run build

# ---------- Run stage ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Next.js: enable standalone output if you want even smaller runtime
# (only if your next.config.js uses 'output: "standalone"')
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/package*.json ./

# Generic (non-standalone) runtime:
COPY --from=builder /app ./

# Expose app port
EXPOSE 3000

# On container start, apply migrations (safe for prod too)
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
