import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureAttempt } from "@/lib/ensureAttempt";
import { DrillRunner } from "@/components/DrillRunner";
import { PREPOSITION_PARTY } from "@/lib/tests/prepositionParty";

export const dynamic = "force-dynamic";

export default async function PrepositionPartyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/tests/preposition-party");

  const res = await ensureAttempt(session.user.id, "preposition-party");

  return (
    <main className="page">
      <DrillRunner
        config={PREPOSITION_PARTY}
        attemptId={res.attempt.id}
        initialAnswers={res.attempt.answers}
        initiallyCompleted={res.attempt.status === "completed"}
        userName={session.user.name || ""}
      />
    </main>
  );
}
