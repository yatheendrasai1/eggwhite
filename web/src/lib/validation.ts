import { z } from "zod";
import { TEST_IDS } from "@/lib/models/Attempt";

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

export type StartAttemptInput = z.infer<typeof startAttemptSchema>;
export type PatchAttemptInput = z.infer<typeof patchAttemptSchema>;
