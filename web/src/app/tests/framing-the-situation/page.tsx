import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { ensureAttempt } from "@/lib/ensureAttempt";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { isProActive } from "@/lib/pro";
import { BackHome } from "@/components/BackHome";
import { JiraCommentRunner } from "@/components/JiraCommentRunner";
import { FRAMING_THE_SITUATION } from "@/lib/tests/framingTheSituation";

export const dynamic = "force-dynamic";

export default async function FramingTheSituationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/tests/framing-the-situation");

  await connectDB();
  const profile = await UserProfileModel.findOne({ userId: session.user.id }).lean();
  if (!isProActive(profile)) {
    return (
      <main className="page">
        <div className="wrap">
          <header className="masthead">
            <BackHome />
            <p className="eyebrow">Pro · LLM-graded</p>
            <h1>
              Framing <em>the Situation</em>
            </h1>
          </header>
          <p className="filler">You need a pro account to participate in this test.</p>
        </div>
      </main>
    );
  }

  const res = await ensureAttempt(session.user.id, "framing-the-situation");
  if (!res.ok) redirect("/");

  return (
    <main className="page">
      <JiraCommentRunner
        config={FRAMING_THE_SITUATION}
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
