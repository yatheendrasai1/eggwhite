import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { ensureAttempt } from "@/lib/ensureAttempt";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { isProActive } from "@/lib/pro";
import { BackHome } from "@/components/BackHome";
import { TranslationRunner } from "@/components/TranslationRunner";
import { TRANSLATION_DRAMA_V1 } from "@/lib/tests/translationDrama";

export const dynamic = "force-dynamic";

export default async function TranslationDramaV1Page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/tests/translation-drama-v1");

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
              The <em>Translation</em> Drama
            </h1>
          </header>
          <p className="filler">You need a pro account to participate in this test.</p>
        </div>
      </main>
    );
  }

  const res = await ensureAttempt(session.user.id, "translation-drama-v1");
  if (!res.ok) redirect("/");

  return (
    <main className="page">
      <TranslationRunner
        config={TRANSLATION_DRAMA_V1}
        attemptId={res.attempt.id}
        initialAnswers={res.attempt.answers}
        initiallyCompleted={res.attempt.status === "completed"}
        initialDetail={res.attempt.detail}
        initialFlags={res.attempt.flags}
        initialVerifyCount={res.attempt.verifyCount}
        userName={session.user.name || ""}
      />
    </main>
  );
}
