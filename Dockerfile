# ---- Build stage -----------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first so this layer is cached unless deps change.
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the source and build the Nitro/TanStack Start server.
COPY . .
RUN npm run build

# ---- Runtime stage ------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# node_modules is needed at runtime too: @resvg/resvg-js and satori (used
# for OG image generation) are deliberately kept out of the Nitro/Rollup
# bundle (see vite.config.ts) and are required from node_modules directly.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

# Mount points for content that is bind-mounted from the host at runtime
# (see docker-compose.yaml). Created up front so the app has somewhere to
# read from even before volumes are attached.
RUN mkdir -p content/articles content/serve

EXPOSE 3000

CMD ["node", "--env-file=.env.local", ".output/server/index.mjs"]
