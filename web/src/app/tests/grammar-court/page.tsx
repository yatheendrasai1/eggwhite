import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { ensureAttempt } from "@/lib/ensureAttempt";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { isProActive } from "@/lib/pro";
import { BackHome } from "@/components/BackHome";
import { GrammarCourtRunner } from "@/components/GrammarCourtRunner";
import { GRAMMAR_COURT } from "@/lib/tests/grammarCourtContent";

export const dynamic = "force-dynamic";

export default async function GrammarCourtPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/tests/grammar-court");

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
              Grammar <em>Court</em> is in session
            </h1>
          </header>
          <p className="filler">You need a pro account to participate in this test.</p>
        </div>
      </main>
    );
  }

  const res = await ensureAttempt(session.user.id, "grammar-court");
  if (!res.ok) redirect("/");

  return (
    <main className="page">
      <GrammarCourtRunner
        config={GRAMMAR_COURT}
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
