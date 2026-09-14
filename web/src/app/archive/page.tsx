import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ARCHIVED_TESTS } from "@/lib/tests/registry";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/archive");

  return (
    <main className="page">
      <div className="wrap">
        <header className="masthead">
          <h1>
            Archived <em>tests</em>
          </h1>
          <p className="lede">
            Older tests, kept for practice. Scores here don&rsquo;t count toward the
            leaderboard.
          </p>
        </header>

        <ul className="tests">
          {ARCHIVED_TESTS.map((t, i) => {
            const n = String(i + 1).padStart(2, "0");
            return (
              <li key={t.id}>
                <Link className="test" href={t.href}>
                  <div className="test-top">
                    <span className="test-idx">{n}</span>
                    <h3 className="test-title">{t.title}</h3>
                  </div>
                  <p className="test-desc">{t.desc}</p>
                  <div className="test-foot">
                    <span className={`tag tag-${t.kind}`}>{t.tag}</span>
                    <span className="test-idx">{t.meta}</span>
                    <span className="go">Start &rarr;</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="foot" style={{ marginTop: 24 }}>
          <Link href="/" style={{ color: "var(--violet)" }}>
            ← Back to all tests
          </Link>
        </p>
      </div>
    </main>
  );
}
