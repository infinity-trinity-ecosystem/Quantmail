import Fastify, { FastifyError } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";
import { authRoutes } from "./routes/auth";
import { inboxRoutes } from "./routes/inbox";
import { digitalTwinRoutes } from "./routes/digitalTwin";
import { iotRoutes } from "./routes/iot";
import { quanteditsRoutes } from "./routes/quantedits";
import { pushRoutes } from "./routes/push";
import { quanttubeRoutes } from "./routes/quanttube";
import { getRedisClient } from "./plugins/redis";
import { verifyMasterSSOToken } from "./utils/crypto";

const SSO_SECRET = process.env["SSO_SECRET"] || "quantmail-dev-secret";

const app = Fastify({ logger: true });

// ─── Global Error Handler ────────────────────────────────────────
app.setErrorHandler((error: FastifyError | ZodError | Error, _request, reply) => {
  // Zod validation errors → 400 with per-field detail
  if (error instanceof ZodError) {
    return reply.code(400).send({
      error: "Validation Error",
      issues: error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }

  // Fastify HTTP errors (including 404, 405, etc.)
  const statusCode = (error as FastifyError).statusCode;
  if (statusCode && statusCode < 500) {
    return reply.code(statusCode).send({
      error: error.message || "Request Error",
    });
  }

  // Unexpected server errors — log detail but do not leak internals
  app.log.error(error);
  return reply.code(500).send({ error: "Internal Server Error" });
});

async function main(): Promise<void> {
  // ─── Rate Limiting ───────────────────────────────────────────
  // Uses Redis when REDIS_URL is set; falls back to in-memory otherwise.
  // Per-user key: prefers the userId from a valid SSO token, falls back to IP.
  const redis = getRedisClient();
  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: 60_000, // 1 minute
    redis: redis ?? undefined,
    skipOnError: true,
    keyGenerator(request) {
      const auth = request.headers["authorization"] ?? "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
      if (token) {
        const userId = verifyMasterSSOToken(token, SSO_SECRET);
        if (userId) return `user:${userId}`;
      }
      return `ip:${request.ip}`;
    },
    errorResponseBuilder(_request, context) {
      return {
        error: "Rate Limit Exceeded",
        message: `Too many requests. Try again in ${context.after}.`,
        retryAfter: context.ttl,
      };
    },
  });

  await app.register(cors, { origin: true });
  await app.register(authRoutes);
  await app.register(inboxRoutes);
  await app.register(digitalTwinRoutes);
  await app.register(iotRoutes);
  await app.register(quanteditsRoutes);
  await app.register(pushRoutes);
  await app.register(quanttubeRoutes);

  app.get("/health", async () => ({ status: "ok", service: "quantmail" }));

  const port = parseInt(process.env["PORT"] || "3000", 10);
  await app.listen({ port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
