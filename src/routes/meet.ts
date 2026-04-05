import type { FastifyInstance } from "fastify";
import { prisma } from "../db";

export async function meetRoutes(app: FastifyInstance): Promise<void> {
  // Create a meeting room
  app.post<{ Body: { title: string; hostId: string; scheduledAt?: string } }>(
    "/api/meet/rooms",
    async (req, reply) => {
      const { title, hostId, scheduledAt } = req.body;
      if (!title || !hostId) {
        return reply.status(400).send({ error: "title and hostId are required" });
      }
      const room = await prisma.meetingRoom.create({
        data: {
          title,
          hostId,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        },
      });
      return reply.status(201).send({ room });
    }
  );

  // Get room details
  app.get<{ Params: { roomId: string } }>(
    "/api/meet/rooms/:roomId",
    async (req, reply) => {
      const room = await prisma.meetingRoom.findUnique({
        where: { id: req.params.roomId },
        include: { participants: true },
      });
      if (!room) return reply.status(404).send({ error: "Room not found" });
      return reply.send({ room });
    }
  );

  // Join a meeting
  app.post<{ Params: { roomId: string }; Body: { userId: string } }>(
    "/api/meet/rooms/:roomId/join",
    async (req, reply) => {
      const { roomId } = req.params;
      const { userId } = req.body;
      if (!userId) return reply.status(400).send({ error: "userId is required" });
      const participant = await prisma.meetParticipant.upsert({
        where: { roomId_userId: { roomId, userId } },
        create: { roomId, userId },
        update: { leftAt: null },
      });
      return reply.send({ participant });
    }
  );

  // Save AI meeting notes
  app.patch<{ Params: { roomId: string }; Body: { aiNotes?: string; transcript?: string } }>(
    "/api/meet/rooms/:roomId/notes",
    async (req, reply) => {
      const { aiNotes, transcript } = req.body;
      const room = await prisma.meetingRoom.update({
        where: { id: req.params.roomId },
        data: { aiNotes, transcript, endedAt: new Date() },
      });
      return reply.send({ room });
    }
  );

  // List meetings for a host
  app.get<{ Querystring: { hostId: string } }>(
    "/api/meet/rooms",
    async (req, reply) => {
      const { hostId } = req.query;
      if (!hostId) return reply.status(400).send({ error: "hostId is required" });
      const rooms = await prisma.meetingRoom.findMany({
        where: { hostId },
        orderBy: { createdAt: "desc" },
      });
      return reply.send({ rooms });
    }
  );
}
