import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { NicknameEditor } from "@/components/NicknameEditor";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/profile");

  await connectDB();
  const profile = await UserProfileModel.findOne({ userId: session.user.id }).lean();

  return (
    <main className="page">
      <div className="wrap">
        <header className="masthead">
          <p className="eyebrow">{session.user.email}</p>
          <h1>
            Your <em>profile</em>
          </h1>
          <p className="lede">Manage how you show up on the leaderboard.</p>
        </header>

        <NicknameEditor initialNickname={profile?.nickname || null} />

        <p className="foot">
          <Link href="/me" style={{ color: "var(--violet)" }}>
            ← Back to your attempts
          </Link>
        </p>
      </div>
    </main>
  );
}
