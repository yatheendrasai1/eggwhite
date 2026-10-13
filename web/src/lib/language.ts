import type { UserProfile } from "@/lib/models/UserProfile";

export type Language = "english" | "malayalam";

/**
 * The learning module to show for this profile. Malayalam is tiv-only for
 * now (same check as isTiv in lib/pro.ts), so a stored "malayalam" on any
 * other account reads as English.
 */
export function effectiveLanguage(
  profile: Pick<UserProfile, "isTiv" | "language"> | null | undefined
): Language {
  return profile?.isTiv && profile.language === "malayalam" ? "malayalam" : "english";
}
