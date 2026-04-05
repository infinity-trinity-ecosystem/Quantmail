import Fastify from "fastify";
import cors from "@fastify/cors";
import { authRoutes } from "./routes/auth";
import { inboxRoutes } from "./routes/inbox";
import { digitalTwinRoutes } from "./routes/digitalTwin";
import { iotRoutes } from "./routes/iot";
import { quanteditsRoutes } from "./routes/quantedits";
import { pushRoutes } from "./routes/push";
import { quanttubeRoutes } from "./routes/quanttube";
import { chatRoutes } from "./routes/chat";
import { meetRoutes } from "./routes/meet";
import { taskRoutes } from "./routes/tasks";
import { notesRoutes } from "./routes/notes";

const app = Fastify({ logger: true });

async function main(): Promise<void> {
  await app.register(cors, { origin: true });
  await app.register(authRoutes);
  await app.register(inboxRoutes);
  await app.register(digitalTwinRoutes);
  await app.register(iotRoutes);
  await app.register(quanteditsRoutes);
  await app.register(pushRoutes);
  await app.register(quanttubeRoutes);
  await app.register(chatRoutes);
  await app.register(meetRoutes);
  await app.register(taskRoutes);
  await app.register(notesRoutes);

  app.get("/health", async () => ({ status: "ok", service: "quantmail" }));

  const port = parseInt(process.env["PORT"] || "3000", 10);
  await app.listen({ port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
