/**
 * Zod validation schemas for all Quantmail route handlers.
 *
 * Each schema matches the expected request body/params for its route.
 * ZodErrors thrown during parsing are caught by the global error handler
 * and returned as structured 400 responses.
 */

import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────

export const RegisterBodySchema = z.object({
  displayName: z.string().min(1).max(100),
  email: z.string().email(),
  imageBase64: z.string().optional(),
});

export const VerifyTokenBodySchema = z.object({
  token: z.string().min(1),
});

// ─── Inbox ───────────────────────────────────────────────────────

export const InboxReceiveBodySchema = z.object({
  senderEmail: z.string().email(),
  recipientEmail: z.string().email(),
  subject: z.string().max(998).optional(),
  body: z.string().optional(),
});

// ─── Digital Twin ────────────────────────────────────────────────

export const TwinReplyBodySchema = z.object({
  messageId: z.string().min(1),
  replyBody: z.string().min(1),
});

export const TwinConfigBodySchema = z.object({
  agentConfig: z.string().min(2),
});

// ─── IoT ─────────────────────────────────────────────────────────

export const IotDeviceRegisterBodySchema = z.object({
  userId: z.string().min(1),
  deviceName: z.string().min(1).max(100),
  platform: z.string().min(1).max(50),
  connectionType: z.string().max(50).optional(),
  endpointRef: z.string().min(1),
});

export const IotAlarmTriggerBodySchema = z.object({
  userId: z.string().min(1),
  source: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().optional().default(""),
});

export const IotPhysicalLoginBodySchema = z.object({
  userId: z.string().min(1),
  dashboardOrigin: z.string().min(1),
  deviceProof: z.string().min(1),
  proofTimestamp: z.number().int().positive(),
  sessionMinutes: z.number().int().min(1).max(60).optional(),
});

export const IotAlarmSilenceBodySchema = z.object({
  userId: z.string().min(1),
  alertId: z.string().min(1),
  dashboardSessionId: z.string().min(1),
  silenceChallenge: z.string().min(1),
});

// ─── Push ────────────────────────────────────────────────────────

export const PushRegisterBodySchema = z.object({
  userId: z.string().min(1),
  token: z.string().min(1),
  platform: z.string().min(1).max(20),
});

export const PushChallengeCreateBodySchema = z.object({
  userId: z.string().min(1),
  ssoToken: z.string().optional(),
  quantadsTarget: z.string().optional(),
  quantchatTitle: z.string().max(200).optional(),
  quantchatBody: z.string().max(500).optional(),
  expiresInMinutes: z.number().int().min(1).max(1440).optional(),
});

// ─── Quantedits ──────────────────────────────────────────────────

const SaccadeSampleSchema = z.object({
  dx: z.number().finite(),
  dy: z.number().finite(),
  timestamp: z.number().finite(),
});

export const SaccadeBodySchema = z.object({
  ssoToken: z.string().min(1),
  samples: z.array(SaccadeSampleSchema).min(1),
});

// ─── QuantTube ───────────────────────────────────────────────────

export const WatchHistoryBodySchema = z.object({
  userId: z.string().min(1),
  videoTitle: z.string().min(1).max(500),
  watchedSeconds: z.number().finite().nonnegative(),
  watchedAt: z.string().datetime().optional(),
});
