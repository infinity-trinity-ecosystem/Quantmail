import type { FastifyInstance } from "fastify";
import { prisma } from "../db";

type TaskPriority = "NO_PRIORITY" | "URGENT" | "HIGH" | "MEDIUM" | "LOW";
type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED";

const VALID_PRIORITIES: TaskPriority[] = ["NO_PRIORITY", "URGENT", "HIGH", "MEDIUM", "LOW"];
const VALID_STATUSES: TaskStatus[] = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"];

function validatePriority(value: string | undefined): TaskPriority | undefined {
  if (!value) return undefined;
  if ((VALID_PRIORITIES as string[]).includes(value)) return value as TaskPriority;
  return undefined;
}

function validateStatus(value: string | undefined): TaskStatus | undefined {
  if (!value) return undefined;
  if ((VALID_STATUSES as string[]).includes(value)) return value as TaskStatus;
  return undefined;
}

export async function taskRoutes(app: FastifyInstance): Promise<void> {
  // Create a board
  app.post<{ Body: { name: string; description?: string; ownerId: string } }>(
    "/api/tasks/boards",
    async (req, reply) => {
      const { name, description = "", ownerId } = req.body;
      if (!name || !ownerId) {
        return reply.status(400).send({ error: "name and ownerId are required" });
      }
      const board = await prisma.taskBoard.create({ data: { name, description, ownerId } });
      return reply.status(201).send({ board });
    }
  );

  // Get boards for a user
  app.get<{ Querystring: { ownerId: string } }>(
    "/api/tasks/boards",
    async (req, reply) => {
      const { ownerId } = req.query;
      if (!ownerId) return reply.status(400).send({ error: "ownerId is required" });
      const boards = await prisma.taskBoard.findMany({
        where: { ownerId },
        include: { tasks: true },
        orderBy: { createdAt: "desc" },
      });
      return reply.send({ boards });
    }
  );

  // Create a task
  app.post<{
    Params: { boardId: string };
    Body: { title: string; description?: string; assigneeId?: string; dueDate?: string; createdBy: string; priority?: string };
  }>(
    "/api/tasks/boards/:boardId/tasks",
    async (req, reply) => {
      const { boardId } = req.params;
      const { title, description = "", assigneeId, dueDate, createdBy, priority } = req.body;
      if (!title || !createdBy) {
        return reply.status(400).send({ error: "title and createdBy are required" });
      }
      const resolvedPriority = validatePriority(priority);
      if (priority && !resolvedPriority) {
        return reply.status(400).send({ error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}` });
      }
      const task = await prisma.task.create({
        data: {
          boardId,
          title,
          description,
          assigneeId,
          dueDate: dueDate ? new Date(dueDate) : null,
          createdBy,
          priority: resolvedPriority ?? "NO_PRIORITY",
        },
      });
      return reply.status(201).send({ task });
    }
  );

  // Update task status
  app.patch<{ Params: { taskId: string }; Body: { status?: string; priority?: string; title?: string; description?: string; assigneeId?: string } }>(
    "/api/tasks/:taskId",
    async (req, reply) => {
      const { status, priority, title, description, assigneeId } = req.body;
      const resolvedStatus = validateStatus(status);
      const resolvedPriority = validatePriority(priority);
      if (status && !resolvedStatus) {
        return reply.status(400).send({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
      }
      if (priority && !resolvedPriority) {
        return reply.status(400).send({ error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}` });
      }
      const task = await prisma.task.update({
        where: { id: req.params.taskId },
        data: {
          ...(resolvedStatus && { status: resolvedStatus }),
          ...(resolvedPriority && { priority: resolvedPriority }),
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(assigneeId !== undefined && { assigneeId }),
        },
      });
      return reply.send({ task });
    }
  );

  // Delete a task
  app.delete<{ Params: { taskId: string } }>(
    "/api/tasks/:taskId",
    async (req, reply) => {
      await prisma.task.delete({ where: { id: req.params.taskId } });
      return reply.send({ success: true });
    }
  );
}
