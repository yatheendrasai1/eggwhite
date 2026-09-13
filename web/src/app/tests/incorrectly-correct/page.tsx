import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureAttempt } from "@/lib/ensureAttempt";
import { McqPairRunner } from "@/components/McqPairRunner";
import { INCORRECTLY_CORRECT } from "@/lib/tests/incorrectlyCorrect";

export const dynamic = "force-dynamic";

export default async function IncorrectlyCorrectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/tests/incorrectly-correct");

  const res = await ensureAttempt(session.user.id, "incorrectly-correct");

  return (
    <main className="page">
      <McqPairRunner
        config={INCORRECTLY_CORRECT}
        attemptId={res.attempt.id}
        initialAnswers={res.attempt.answers}
        initiallyCompleted={res.attempt.status === "completed"}
        userName={session.user.name || ""}
      />
    </main>
  );
}
