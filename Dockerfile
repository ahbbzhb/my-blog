FROM node:20-alpine AS base
WORKDIR /app

# ---- 依赖 ----
FROM base AS deps
COPY package*.json ./
RUN npm ci --ignore-scripts

# ---- 构建 ----
FROM deps AS build
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- 运行 ----
FROM base AS runner
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/app/generated ./app/generated
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
