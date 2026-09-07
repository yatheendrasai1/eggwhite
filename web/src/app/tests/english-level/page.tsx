import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureAttempt } from "@/lib/ensureAttempt";
import { EnglishLevelRunner } from "@/components/EnglishLevelRunner";

export const dynamic = "force-dynamic";

export default async function EnglishLevelPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/tests/english-level");

  const res = await ensureAttempt(session.user.id, "english-level");

  return (
    <main className="page">
      <EnglishLevelRunner
        attemptId={res.attempt.id}
        initialAnswers={res.attempt.answers}
        initiallyCompleted={res.attempt.status === "completed"}
        userName={session.user.name || ""}
      />
    </main>
  );
}
