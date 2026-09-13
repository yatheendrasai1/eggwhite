import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureAttempt } from "@/lib/ensureAttempt";
import { McqPairRunner } from "@/components/McqPairRunner";
import { ARTICLES } from "@/lib/tests/articles";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/tests/articles");

  const res = await ensureAttempt(session.user.id, "articles");

  return (
    <main className="page">
      <McqPairRunner
        config={ARTICLES}
        attemptId={res.attempt.id}
        initialAnswers={res.attempt.answers}
        initiallyCompleted={res.attempt.status === "completed"}
        userName={session.user.name || ""}
      />
    </main>
  );
}
