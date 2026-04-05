import type { FastifyInstance } from "fastify";
import { prisma } from "../db";

export async function notesRoutes(app: FastifyInstance): Promise<void> {
  // List notes for a user
  app.get<{ Querystring: { userId: string } }>(
    "/api/notes",
    async (req, reply) => {
      const { userId } = req.query;
      if (!userId) return reply.status(400).send({ error: "userId is required" });
      const notes = await prisma.note.findMany({
        where: { userId },
        orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      });
      return reply.send({ notes });
    }
  );

  // Create a note
  app.post<{ Body: { userId: string; title: string; content?: string; voiceTranscript?: string; linkedEventId?: string } }>(
    "/api/notes",
    async (req, reply) => {
      const { userId, title, content = "", voiceTranscript, linkedEventId } = req.body;
      if (!userId || !title) {
        return reply.status(400).send({ error: "userId and title are required" });
      }
      const note = await prisma.note.create({
        data: { userId, title, content, voiceTranscript, linkedEventId },
      });
      return reply.status(201).send({ note });
    }
  );

  // Update a note
  app.patch<{ Params: { noteId: string }; Body: { title?: string; content?: string; voiceTranscript?: string; pinned?: boolean; aiFormatted?: boolean } }>(
    "/api/notes/:noteId",
    async (req, reply) => {
      const { title, content, voiceTranscript, pinned, aiFormatted } = req.body;
      const note = await prisma.note.update({
        where: { id: req.params.noteId },
        data: {
          ...(title !== undefined && { title }),
          ...(content !== undefined && { content }),
          ...(voiceTranscript !== undefined && { voiceTranscript }),
          ...(pinned !== undefined && { pinned }),
          ...(aiFormatted !== undefined && { aiFormatted }),
        },
      });
      return reply.send({ note });
    }
  );

  // Delete a note
  app.delete<{ Params: { noteId: string } }>(
    "/api/notes/:noteId",
    async (req, reply) => {
      await prisma.note.delete({ where: { id: req.params.noteId } });
      return reply.send({ success: true });
    }
  );

  // Toggle pin
  app.post<{ Params: { noteId: string } }>(
    "/api/notes/:noteId/pin",
    async (req, reply) => {
      const existing = await prisma.note.findUnique({ where: { id: req.params.noteId } });
      if (!existing) return reply.status(404).send({ error: "Note not found" });
      const note = await prisma.note.update({
        where: { id: req.params.noteId },
        data: { pinned: !existing.pinned },
      });
      return reply.send({ note });
    }
  );
}
