import { z } from "zod";
import { TEST_IDS } from "@/lib/models/Attempt";
import { GEMINI_MODELS } from "@/lib/gemini";

export const startAttemptSchema = z.object({
  testId: z.enum(TEST_IDS),
});

/** Answers are test-shaped and stored as-is; keep this permissive but bounded. */
const answersSchema = z.record(z.string(), z.unknown());

export const patchAttemptSchema = z
  .object({
    answers: answersSchema.optional(),
    complete: z.boolean().optional(),
  })
  .refine((v) => v.answers !== undefined || v.complete !== undefined, {
    message: "Nothing to update",
  });

export const migrateSchema = z.object({
  records: z
    .array(
      z.object({
        file: z.string(),
        record: z.record(z.string(), z.unknown()),
      })
    )
    .max(20),
});

export const themeSchema = z.enum(["light", "dark", "system"]);

export const updateProfileSchema = z.object({
  /** Empty string clears the nickname. */
  nickname: z.string().trim().max(32).optional(),
  theme: themeSchema.optional(),
});

export const redeemPasscodeSchema = z.object({
  code: z.string().trim().min(1).max(64),
});

export const createPasscodeSchema = z.object({
  label: z.string().trim().max(64).optional(),
});

export const updateTestSettingSchema = z.object({
  enabled: z.boolean(),
});

export const updateUserLeaderboardSchema = z.object({
  hideFromLeaderboard: z.boolean(),
});

/**
 * The client holds pending flags/comments only in localStorage — they only
 * reach the server bundled into a verify request, at which point they're
 * validated and persisted as the record of what was disputed.
 */
export const verifyFlagsSchema = z.object({
  flags: z
    .array(
      z.object({
        itemKey: z.string().trim().min(1).max(64),
        comment: z.string().trim().max(100).optional().default(""),
      })
    )
    .min(1)
    .max(50),
});

export const updateGeminiModelSchema = z.object({
  model: z.enum(GEMINI_MODELS),
});

export type StartAttemptInput = z.infer<typeof startAttemptSchema>;
export type PatchAttemptInput = z.infer<typeof patchAttemptSchema>;
export type MigrateInput = z.infer<typeof migrateSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type RedeemPasscodeInput = z.infer<typeof redeemPasscodeSchema>;
export type CreatePasscodeInput = z.infer<typeof createPasscodeSchema>;
export type UpdateTestSettingInput = z.infer<typeof updateTestSettingSchema>;
export type UpdateUserLeaderboardInput = z.infer<typeof updateUserLeaderboardSchema>;
export type VerifyFlagsInput = z.infer<typeof verifyFlagsSchema>;
export type UpdateGeminiModelInput = z.infer<typeof updateGeminiModelSchema>;
