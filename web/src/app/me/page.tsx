import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listAttempts } from "@/lib/attempts";
import { byId } from "@/lib/tests/registry";

export const dynamic = "force-dynamic";

function fmtWhen(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  );
}

export default async function MePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/me");

  const attempts = await listAttempts(session.user.id);

  return (
    <main className="page">
      <div className="wrap">
        <header className="masthead">
          <p className="eyebrow">{session.user.email}</p>
          <h1>
            Your <em>attempts</em>
          </h1>
          <p className="lede">Every test you&rsquo;ve started or finished on this account.</p>
        </header>

        {attempts.length === 0 ? (
          <p className="filler">Nothing yet. Start a test from the home page.</p>
        ) : (
          <ul className="hist">
            {attempts.map((a) => {
              const meta = byId(a.testId);
              const done = a.status === "completed";
              const href = done
                ? `/results/${a.id}`
                : meta?.href ?? "/";
              return (
                <li key={a.id}>
                  <Link href={href}>
                    <p className="h-t">{meta?.title ?? a.testId}</p>
                    <span className="h-m">
                      {done
                        ? `${a.summary?.line ?? "Completed"} · ${fmtWhen(
                            a.completedAt ?? a.updatedAt
                          )}`
                        : `In progress · ${a.progress.done}/${a.progress.total} · started ${fmtWhen(
                            a.startedAt
                          )}`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <p className="foot">
          <Link href="/" style={{ color: "var(--violet)" }}>
            ← Back to all tests
          </Link>
        </p>
      </div>
    </main>
  );
}
