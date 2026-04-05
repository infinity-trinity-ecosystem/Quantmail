/**
 * Quantedits Integration Routes
 *
 * Exposes endpoints that allow Quantedits to:
 *  1. Record micro-saccade eye movement samples for a user.
 *  2. Request an API key for High-Priority Reel rendering, which
 *     requires successful saccade-based liveness verification.
 *
 * Bot / scraper requests are rejected with HTTP 403 STRICT_BOT_DROP.
 */

import { FastifyInstance } from "fastify";
import { prisma } from "../db";
import {
  validateSaccadeLiveness,
  type SaccadeSample,
} from "../services/saccadeLivenessService";
import { verifyMasterSSOToken } from "../utils/crypto";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import { SaccadeBodySchema } from "../validation/schemas";

const SSO_SECRET = process.env["SSO_SECRET"] || "quantmail-dev-secret";

export async function quanteditsRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /quantedits/saccade/record
   * Records micro-saccade samples for a user session.
   * Requires a valid Master SSO token.
   */
  app.post<{
    Body: {
      ssoToken: string;
      samples: SaccadeSample[];
    };
  }>("/quantedits/saccade/record", async (request, reply) => {
    const { ssoToken, samples } = SaccadeBodySchema.parse(request.body);

    const userId = verifyMasterSSOToken(ssoToken, SSO_SECRET);
    if (!userId) {
      return reply.code(403).send({ error: "Invalid or expired SSO token" });
    }

    const validation = validateSaccadeLiveness(samples);

    await prisma.saccadeSession.create({
      data: {
        userId,
        saccadeHash: validation.saccadeHash || "rejected",
        sampleCount: validation.sampleCount,
        entropyScore: validation.entropyScore,
      },
    });

    if (!validation.passed) {
      return reply.code(403).send({
        error: "STRICT_BOT_DROP",
        message: `Saccade liveness failed: ${validation.reason}`,
        entropyScore: validation.entropyScore,
        sampleCount: validation.sampleCount,
      });
    }

    return reply.code(200).send({
      status: "recorded",
      userId,
      saccadeVerification: {
        passed: true,
        entropyScore: validation.entropyScore,
        sampleCount: validation.sampleCount,
        saccadeHash: validation.saccadeHash,
      },
    });
  });

  /**
   * POST /quantedits/reel/api-key
   * Issues a short-lived API key for High-Priority Reel rendering.
   * Requires successful saccade-based liveness verification.
   */
  app.post<{
    Body: {
      ssoToken: string;
      samples: SaccadeSample[];
    };
  }>("/quantedits/reel/api-key", async (request, reply) => {
    const { ssoToken, samples } = SaccadeBodySchema.parse(request.body);

    const userId = verifyMasterSSOToken(ssoToken, SSO_SECRET);
    if (!userId) {
      return reply.code(403).send({ error: "Invalid or expired SSO token" });
    }

    const validation = validateSaccadeLiveness(samples);

    // Persist the saccade session for auditing
    await prisma.saccadeSession.create({
      data: {
        userId,
        saccadeHash: validation.saccadeHash || "rejected",
        sampleCount: validation.sampleCount,
        entropyScore: validation.entropyScore,
      },
    });

    if (!validation.passed) {
      return reply.code(403).send({
        error: "STRICT_BOT_DROP",
        message: `Saccade liveness failed: ${validation.reason}`,
        entropyScore: validation.entropyScore,
        sampleCount: validation.sampleCount,
      });
    }

    // Generate a short-lived API key scoped to Quantedits reel rendering
    const apiKeyPayload = JSON.stringify({
      sub: userId,
      scope: "quantedits:reel:high-priority",
      saccadeHash: validation.saccadeHash,
      iat: Date.now(),
      exp: Date.now() + 5 * 60_000, // expires in 5 minutes
      jti: uuidv4(),
    });
    const apiKeySignature = CryptoJS.HmacSHA256(
      apiKeyPayload,
      `${SSO_SECRET}:quantedits`
    ).toString(CryptoJS.enc.Hex);
    const apiKey = `${Buffer.from(apiKeyPayload).toString("base64url")}.${apiKeySignature}`;

    return reply.code(200).send({
      apiKey,
      scope: "quantedits:reel:high-priority",
      userId,
      saccadeVerification: {
        passed: true,
        entropyScore: validation.entropyScore,
        sampleCount: validation.sampleCount,
        saccadeHash: validation.saccadeHash,
      },
    });
  });
}
