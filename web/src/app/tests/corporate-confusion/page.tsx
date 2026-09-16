import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureAttempt } from "@/lib/ensureAttempt";
import { McqPairRunner } from "@/components/McqPairRunner";
import { CORPORATE_CONFUSION } from "@/lib/tests/corporateConfusion";

export const dynamic = "force-dynamic";

export default async function CorporateConfusionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/tests/corporate-confusion");

  const res = await ensureAttempt(session.user.id, "corporate-confusion");
  if (!res.ok) redirect("/");

  return (
    <main className="page">
      <McqPairRunner
        config={CORPORATE_CONFUSION}
        attemptId={res.attempt.id}
        initialAnswers={res.attempt.answers}
        initiallyCompleted={res.attempt.status === "completed"}
        userName={session.user.name || ""}
      />
    </main>
  );
}
