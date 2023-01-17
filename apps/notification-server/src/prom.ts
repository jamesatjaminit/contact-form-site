import Fastify, { FastifyInstance } from "fastify";
import { Counter, register } from "prom-client";

const server: FastifyInstance = Fastify({});

const responsesCounter = new Counter({
  name: "responses",
  help: "Number of responses",
  labelNames: ["form"],
});
export function incrementResponsesCounter(form: string) {
  responsesCounter.inc({ form });
}
export async function initProm() {
  server.get("/metrics", async (request, reply) => {
    try {
      reply.header("Content-Type", register.contentType);
      return await register.metrics();
    } catch (err) {
      reply.code(503);
      return "An error occurred";
    }
  });
  await server.listen({
    port: parseInt(process.env.PROM_PORT ?? String(3000)),
    host: "0.0.0.0",
  });
}
