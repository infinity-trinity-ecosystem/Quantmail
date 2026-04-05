import { FastifyInstance } from "fastify";
import { prisma } from "../db";
import { WatchHistoryBodySchema } from "../validation/schemas";

export async function quanttubeRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /quanttube/watch-history
   * Records a QuantTube watch event for inbox relevance sync.
   */
  app.post<{
    Body: {
      userId: string;
      videoTitle: string;
      watchedSeconds: number;
      watchedAt?: string;
    };
  }>("/quanttube/watch-history", async (request, reply) => {
    const { userId, videoTitle, watchedSeconds, watchedAt } =
      WatchHistoryBodySchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    const event = await prisma.quanttubeWatchEvent.create({
      data: {
        userId,
        videoTitle,
        watchedSeconds,
        watchedAt: watchedAt ? new Date(watchedAt) : undefined,
      },
    });

    return reply.code(201).send({ event });
  });
}
