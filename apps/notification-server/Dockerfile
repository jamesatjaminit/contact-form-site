FROM node:16 as builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm turbo run build --filter=notification-server
RUN pnpm --filter=notification-server --prod deploy output

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/output .
COPY .env .
ENV NODE_ENV=production
CMD ["npm", "run", "start"]