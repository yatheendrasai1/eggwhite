import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { ensureAttempt } from "@/lib/ensureAttempt";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { isProActive } from "@/lib/pro";
import { BackHome } from "@/components/BackHome";
import { ShrinkItRunner } from "@/components/ShrinkItRunner";
import { SHRINK_IT } from "@/lib/tests/shrinkItContent";

export const dynamic = "force-dynamic";

export default async function ShrinkItPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/tests/shrink-it");

  await connectDB();
  const profile = await UserProfileModel.findOne({ userId: session.user.id }).lean();
  if (!isProActive(profile)) {
    return (
      <main className="page">
        <div className="wrap">
          <header className="masthead">
            <BackHome />
            <p className="eyebrow">Pro · AI-graded</p>
            <h1>
              Shrink <em>It</em>!
            </h1>
          </header>
          <p className="filler">You need a pro account to participate in this test.</p>
        </div>
      </main>
    );
  }

  const res = await ensureAttempt(session.user.id, "shrink-it");
  if (!res.ok) redirect("/");

  return (
    <main className="page">
      <ShrinkItRunner
        config={SHRINK_IT}
        attemptId={res.attempt.id}
        initialAnswers={res.attempt.answers}
        initiallyCompleted={res.attempt.status === "completed"}
        initialDetail={res.attempt.detail}
        initialVerifyCount={res.attempt.verifyCount}
        userName={session.user.name || ""}
      />
    </main>
  );
}
