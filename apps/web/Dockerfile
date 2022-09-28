FROM node:16 as builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm turbo run build
RUN pnpm --filter=web --prod deploy output

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/output .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]