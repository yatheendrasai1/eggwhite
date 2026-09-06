import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureAttempt } from "@/lib/ensureAttempt";
import { DrillRunner } from "@/components/DrillRunner";
import { TENSION } from "@/lib/tests/tension";

export const dynamic = "force-dynamic";

export default async function TensionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/tests/tension");

  const res = await ensureAttempt(session.user.id, "tension");

  return (
    <main className="page">
      <DrillRunner
        config={TENSION}
        attemptId={res.attempt.id}
        initialAnswers={res.attempt.answers}
        initiallyCompleted={res.attempt.status === "completed"}
        userName={session.user.name || ""}
      />
    </main>
  );
}
