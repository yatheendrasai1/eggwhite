import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureAttempt } from "@/lib/ensureAttempt";
import { BusinessEnglishRunner } from "@/components/BusinessEnglishRunner";

export const dynamic = "force-dynamic";

export default async function BusinessEnglishPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/tests/business-english");

  const res = await ensureAttempt(session.user.id, "business-english");

  return (
    <main className="page">
      <BusinessEnglishRunner
        attemptId={res.attempt.id}
        initialAnswers={res.attempt.answers}
        initiallyCompleted={res.attempt.status === "completed"}
        userName={session.user.name || ""}
      />
    </main>
  );
}
