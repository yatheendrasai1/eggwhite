import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { UserProfileModel } from "@/lib/models/UserProfile";

export type Theme = "light" | "dark" | "system";

/** The signed-in user's stored theme preference, or "system" when signed out / unset. */
export async function getSessionTheme(): Promise<Theme> {
  const session = await auth();
  if (!session?.user?.id) return "system";
  await connectDB();
  const profile = await UserProfileModel.findOne({ userId: session.user.id })
    .select("theme")
    .lean();
  return (profile?.theme as Theme) || "system";
}
