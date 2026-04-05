import { FastifyInstance } from "fastify";
import { prisma } from "../db";
import { performLivenessCheck } from "../services/livenessService";
import { deriveBiometricHash } from "../utils/crypto";
import {
  generateMasterSSOToken,
  verifyMasterSSOToken,
} from "../utils/crypto";
import { propagateMasterIdToAll } from "../utils/masterIdPropagation";
import {
  RegisterBodySchema,
  VerifyTokenBodySchema,
} from "../validation/schemas";

const SSO_SECRET = process.env["SSO_SECRET"] || "quantmail-dev-secret";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /auth/register
   * Biometric registration using facial liveness check.
   * On Capacitor native, the camera is invoked automatically.
   * On web, a base64 image payload must be provided.
   */
  app.post<{
    Body: {
      displayName: string;
      email: string;
      imageBase64?: string;
    };
  }>("/auth/register", {
    config: { rateLimit: { max: 10, timeWindow: 60_000 } },
  }, async (request, reply) => {
    const { displayName, email, imageBase64 } = RegisterBodySchema.parse(request.body);

    const liveness = await performLivenessCheck(imageBase64);

    if (!liveness.passed) {
      return reply.code(403).send({
        error: "STRICT_BOT_DROP",
        message: "Biometric liveness check failed",
        livenessScore: liveness.livenessScore,
        captureSource: liveness.captureSource,
      });
    }

    const biometricHash = deriveBiometricHash(
      `${email}:${liveness.facialMatrixHash}`
    );

    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return reply.code(409).send({ error: "User already registered" });
    }

    const user = await prisma.user.create({
      data: {
        displayName,
        email,
        biometricHash,
        verified: true,
        livenessGrid: {
          create: {
            facialMatrixHash: liveness.facialMatrixHash,
            livenessScore: liveness.livenessScore,
            passed: true,
          },
        },
        digitalTwin: {
          create: {},
        },
      },
      include: {
        livenessGrid: true,
        digitalTwin: true,
      },
    });

    const token = generateMasterSSOToken(user.id, SSO_SECRET);
    const propagation = propagateMasterIdToAll(user.id, SSO_SECRET);

    return reply.code(201).send({
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        verified: user.verified,
        captureSource: liveness.captureSource,
      },
      ssoToken: token,
      propagation,
    });
  });

  /**
   * POST /auth/verify
   * Verifies a Master SSO token and returns the associated user.
   */
  app.post<{
    Body: { token: string };
  }>("/auth/verify", {
    config: { rateLimit: { max: 20, timeWindow: 60_000 } },
  }, async (request, reply) => {
    const { token } = VerifyTokenBodySchema.parse(request.body);

    const userId = verifyMasterSSOToken(token, SSO_SECRET);
    if (!userId) {
      return reply.code(403).send({ error: "Invalid or expired token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        email: true,
        verified: true,
      },
    });

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    return reply.send({ user });
  });
}
