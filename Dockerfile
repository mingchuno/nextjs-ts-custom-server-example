FROM node:18-alpine AS base

# --------
FROM base AS runtime

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --production

# --------
FROM runtime AS builder

RUN npm install

COPY ./ ./

RUN npm run b

# --------
FROM runtime AS runner

WORKDIR /app

COPY ./ ./
COPY --from=builder /app/.next/ ./.next
COPY --from=builder /app/dist ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "./index.js"]