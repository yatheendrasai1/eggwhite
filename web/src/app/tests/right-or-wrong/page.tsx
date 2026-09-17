import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { ensureAttempt } from "@/lib/ensureAttempt";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { isProActive } from "@/lib/pro";
import { BackHome } from "@/components/BackHome";
import { RightOrWrongRunner } from "@/components/RightOrWrongRunner";
import { RIGHT_OR_WRONG } from "@/lib/tests/rightOrWrongContent";

export const dynamic = "force-dynamic";

export default async function RightOrWrongPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/tests/right-or-wrong");

  await connectDB();
  const profile = await UserProfileModel.findOne({ userId: session.user.id }).lean();
  if (!isProActive(profile)) {
    return (
      <main className="page">
        <div className="wrap">
          <header className="masthead">
            <BackHome />
            <p className="eyebrow">Pro · AI-graded bonus</p>
            <h1>
              Right <em>or</em> Wrong
            </h1>
          </header>
          <p className="filler">You need a pro account to participate in this test.</p>
        </div>
      </main>
    );
  }

  const res = await ensureAttempt(session.user.id, "right-or-wrong");
  if (!res.ok) redirect("/");

  return (
    <main className="page">
      <RightOrWrongRunner
        config={RIGHT_OR_WRONG}
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
