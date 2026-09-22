import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureAttempt } from "@/lib/ensureAttempt";
import { McqPairRunner } from "@/components/McqPairRunner";
import { JARGONS_IDIOMS } from "@/lib/tests/jargonsIdioms";

export const dynamic = "force-dynamic";

export default async function JargonsIdiomsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/tests/jargons-idioms");

  const res = await ensureAttempt(session.user.id, "jargons-idioms");
  if (!res.ok) redirect("/");

  return (
    <main className="page">
      <McqPairRunner
        config={JARGONS_IDIOMS}
        attemptId={res.attempt.id}
        initialAnswers={res.attempt.answers}
        initiallyCompleted={res.attempt.status === "completed"}
        userName={session.user.name || ""}
      />
    </main>
  );
}
