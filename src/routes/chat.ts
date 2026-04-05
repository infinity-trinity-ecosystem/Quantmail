import type { FastifyInstance } from "fastify";
import { prisma } from "../db";

export async function chatRoutes(app: FastifyInstance): Promise<void> {
  // List all public channels
  app.get("/api/chat/channels", async (_req, reply) => {
    const channels = await prisma.chatChannel.findMany({
      where: { isPrivate: false },
      orderBy: { createdAt: "asc" },
    });
    return reply.send({ channels });
  });

  // Create a channel
  app.post<{ Body: { name: string; description?: string; createdBy: string; isPrivate?: boolean } }>(
    "/api/chat/channels",
    async (req, reply) => {
      const { name, description = "", createdBy, isPrivate = false } = req.body;
      if (!name || !createdBy) {
        return reply.status(400).send({ error: "name and createdBy are required" });
      }
      const channel = await prisma.chatChannel.create({
        data: { name, description, createdBy, isPrivate },
      });
      return reply.status(201).send({ channel });
    }
  );

  // Get messages in a channel
  app.get<{ Params: { channelId: string }; Querystring: { limit?: string } }>(
    "/api/chat/channels/:channelId/messages",
    async (req, reply) => {
      const { channelId } = req.params;
      const limit = Math.min(parseInt(req.query.limit ?? "50", 10), 200);
      const messages = await prisma.chatMessage.findMany({
        where: { channelId },
        orderBy: { sentAt: "asc" },
        take: limit,
      });
      return reply.send({ messages });
    }
  );

  // Send a message
  app.post<{ Params: { channelId: string }; Body: { senderId: string; content: string } }>(
    "/api/chat/channels/:channelId/messages",
    async (req, reply) => {
      const { channelId } = req.params;
      const { senderId, content } = req.body;
      if (!senderId || !content) {
        return reply.status(400).send({ error: "senderId and content are required" });
      }
      const message = await prisma.chatMessage.create({
        data: { channelId, senderId, content },
      });
      return reply.status(201).send({ message });
    }
  );

  // Join channel
  app.post<{ Params: { channelId: string }; Body: { userId: string } }>(
    "/api/chat/channels/:channelId/join",
    async (req, reply) => {
      const { channelId } = req.params;
      const { userId } = req.body;
      if (!userId) {
        return reply.status(400).send({ error: "userId is required" });
      }
      const member = await prisma.chatMember.upsert({
        where: { channelId_userId: { channelId, userId } },
        create: { channelId, userId },
        update: {},
      });
      return reply.send({ member });
    }
  );
}
