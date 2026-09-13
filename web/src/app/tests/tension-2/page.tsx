import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureAttempt } from "@/lib/ensureAttempt";
import { DrillRunner } from "@/components/DrillRunner";
import { TENSION_2 } from "@/lib/tests/tension2";

export const dynamic = "force-dynamic";

export default async function Tension2Page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/tests/tension-2");

  const res = await ensureAttempt(session.user.id, "tension-2");

  return (
    <main className="page">
      <DrillRunner
        config={TENSION_2}
        attemptId={res.attempt.id}
        initialAnswers={res.attempt.answers}
        initiallyCompleted={res.attempt.status === "completed"}
        userName={session.user.name || ""}
      />
    </main>
  );
}
