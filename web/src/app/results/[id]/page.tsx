import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAttemptById } from "@/lib/attempts";
import { byId } from "@/lib/tests/registry";
import { EnglishLevelResults } from "@/components/EnglishLevelResults";
import { BusinessEnglishResults } from "@/components/BusinessEnglishResults";
import type { ELAnswers } from "@/lib/tests/englishLevel";
import type { BEAnswers } from "@/lib/tests/businessEnglish";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { id } = await params;
  const attempt = await getAttemptById(session.user.id, id);
  if (!attempt) notFound();
  if (attempt.status !== "completed") {
    redirect(byId(attempt.testId)?.href ?? "/");
  }

  const meta = byId(attempt.testId);

  return (
    <main className="page">
      <div className="wrap">
        <header className="masthead">
          <p className="eyebrow">Result · {meta?.title ?? attempt.testId}</p>
          <h1>
            Your <em>result</em>
          </h1>
        </header>
      </div>
      {attempt.testId === "english-level" ? (
        <div className="wrap">
          <EnglishLevelResults answers={attempt.answers as ELAnswers} />
        </div>
      ) : (
        <div className="wrap">
          <BusinessEnglishResults answers={attempt.answers as BEAnswers} />
        </div>
      )}
      <div className="wrap" style={{ paddingBottom: 40 }}>
        <Link className="btn btn-ghost" href="/">
          Back to all tests
        </Link>
      </div>
    </main>
  );
}
