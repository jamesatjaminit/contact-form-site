FROM node:18 as builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install --filter=notification-server types
RUN pnpm turbo run build --filter=notification-server
RUN pnpm --filter=notification-server --prod deploy output

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/output .
COPY .env .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
