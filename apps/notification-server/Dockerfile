FROM node:16 as builder
WORKDIR /app
COPY . .
COPY .env /app/apps/web/.env.production
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm turbo run build --filter=notification-server
RUN pnpm --filter=notification-server --prod deploy output

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/output .
ENV NODE_ENV=production
CMD ["npm", "run", "start"]