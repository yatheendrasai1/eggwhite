import Link from "next/link";
import {
  ACTIVITY_LOG,
  ANCHOR_SENTENCES,
  CURRICULUM,
  ERROR_PATTERNS,
  FIXED_PATTERNS,
  LAST_DIAGNOSTIC,
  NEXT_ACTIONS,
  NON_GRAMMAR,
  OPEN_QUESTIONS,
  PASS_MARK,
  ROW_TESTS,
  type RowStatus,
} from "@/lib/malayalam/progress";
import { REVISION_SENTENCES } from "@/lib/malayalam/sentences";
import { GRAMMAR_SECTIONS } from "@/lib/malayalam/grammar";
import { VOCAB_COUNT } from "@/lib/malayalam/vocab";

const STATUS_LABEL: Record<RowStatus, string> = {
  graduated: "Graduated",
  complete: "Complete",
  "in-progress": "In progress",
  decayed: "Needs rebuild",
  ahead: "Ahead",
};

/** Number of error patterns shown up front; the rest sit behind a toggle. */
const TOP_ERRORS = 5;

export function MalayalamHome({ firstName }: { firstName: string }) {
  const current = CURRICULUM.find((r) => r.status === "in-progress");
  const done = CURRICULUM.filter((r) => r.status === "graduated" || r.status === "complete");

  return (
    <main className="page">
      <div className="wrap">
        <header className="greeting">
          <p className="greeting-line">Namaskāram,</p>
          <p className="greeting-name">
            {firstName} <span aria-hidden="true">🧱</span>
          </p>
        </header>

        {current && (
          <section className="ml-resume" aria-label="Resume point">
            <p className="ml-resume-eyebrow">Resume point</p>
            <h2 className="ml-resume-title">
              Row {current.num} — {current.name}
            </h2>
            <p className="ml-resume-sub">
              {current.pct}% · not graduated · needs a clean ≥{PASS_MARK}/25 on a separate day
            </p>
            <div className="ml-resume-next">
              <span className="ml-resume-next-label">Next</span>
              <span>
                <b>{NEXT_ACTIONS[0].title}.</b> {NEXT_ACTIONS[0].detail}
              </span>
            </div>
          </section>
        )}

        <nav className="ml-actions" aria-label="Malayalam practice">
          <Link href="/malayalam/revise" className="test ml-action">
            <span className="test-icon test-icon-v" aria-hidden="true">
              🗣️
            </span>
            <h3 className="test-title">Revise</h3>
            <p className="test-desc">{REVISION_SENTENCES.length} sentences · cover, produce, check</p>
          </Link>
          <Link href="/malayalam/reference" className="test ml-action">
            <span className="test-icon test-icon-o" aria-hidden="true">
              📐
            </span>
            <h3 className="test-title">Grammar</h3>
            <p className="test-desc">{GRAMMAR_SECTIONS.length} sections with Telugu anchors</p>
          </Link>
          <Link href="/malayalam/vocab" className="test ml-action">
            <span className="test-icon test-icon-g" aria-hidden="true">
              📖
            </span>
            <h3 className="test-title">Vocabulary</h3>
            <p className="test-desc">{VOCAB_COUNT} words · ml / en / te</p>
          </Link>
        </nav>

        <h2 className="section-label second">Knowledge map</h2>
        <p className="ml-map-caption">
          {done.length} of {CURRICULUM.length} rows laid · a brick graduates only after a pass
          (≥{PASS_MARK}/25) on two separate days
        </p>
        <ol className="ml-wall">
          {CURRICULUM.map((r) => (
            <li key={r.num} className={`ml-brick ml-brick-${r.status}`}>
              <div className="ml-brick-top">
                <span className="ml-brick-num">{r.num}</span>
                <span className="ml-brick-status">{STATUS_LABEL[r.status]}</span>
              </div>
              <p className="ml-brick-name">{r.name}</p>
              {r.pct !== undefined && (
                <div className="ml-meter" aria-label={`${r.pct}%`}>
                  <div className="ml-meter-fill" style={{ width: `${r.pct}%` }} />
                </div>
              )}
              <p className="ml-brick-note">
                {r.pct !== undefined && <b>{r.pct}%</b>}
                {r.pct !== undefined && (r.note || r.measured) && " · "}
                {r.note || r.measured}
              </p>
            </li>
          ))}
        </ol>

        <h2 className="section-label second">Beyond grammar</h2>
        <div className="ml-skills">
          {NON_GRAMMAR.map((s) => (
            <div key={s.label} className="tile">
              <h3>{s.label}</h3>
              <p>
                {s.pct}
                <span>%</span>
              </p>
              <div className="ml-meter">
                <div className="ml-meter-fill" style={{ width: `${s.pct}%` }} />
              </div>
              <small>{s.note}</small>
            </div>
          ))}
        </div>

        <h2 className="section-label second">Last diagnostic · {LAST_DIAGNOSTIC.date}</h2>
        <div className="panel ml-diag">
          <p className="ml-diag-score">{LAST_DIAGNOSTIC.score}</p>
          <DiagRow tone="held" label="Held" items={LAST_DIAGNOSTIC.held} />
          <DiagRow tone="gone" label="Gone" items={LAST_DIAGNOSTIC.gone} />
          <DiagRow tone="shaky" label="Shaky" items={LAST_DIAGNOSTIC.shaky} />
          <p className="ml-diag-note">
            <b>Root cause found:</b> {LAST_DIAGNOSTIC.discovery}
          </p>
        </div>

        <h2 className="section-label second">Test history</h2>
        {ROW_TESTS.map((t) => (
          <div key={t.row} className="panel">
            <h3>Row {t.row}</h3>
            <ul className="ml-bars">
              {t.sittings.map((s) => (
                <li key={s.label + s.date} className="ml-bar-row">
                  <span className="ml-bar-label">
                    {s.date}
                    <small>{s.label}</small>
                  </span>
                  <span className="ml-bar-track">
                    <span
                      className={`ml-bar-fill${s.total >= PASS_MARK ? " pass" : ""}`}
                      style={{ width: `${(s.total / 25) * 100}%` }}
                    />
                    <span
                      className="ml-bar-pass"
                      style={{ left: `${(PASS_MARK / 25) * 100}%` }}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="ml-bar-val">
                    {s.total}
                    {s.passed ? " ✅" : ""}
                  </span>
                </li>
              ))}
            </ul>
            <p className="ml-bars-legend">
              Comparison /5 · Regular /11 · Boss /9 — marker at the {PASS_MARK}/25 pass line
            </p>
          </div>
        ))}

        <h2 className="section-label second">Next actions</h2>
        <ol className="ml-next">
          {NEXT_ACTIONS.map((a) => (
            <li key={a.title}>
              <b>{a.title}</b>
              <span>{a.detail}</span>
            </li>
          ))}
        </ol>

        <h2 className="section-label second">Check before answering</h2>
        <ul className="ml-errors">
          {ERROR_PATTERNS.slice(0, TOP_ERRORS).map((e, i) => (
            <ErrorItem key={e.title} n={i + 1} {...e} />
          ))}
        </ul>
        <details className="section-acc">
          <summary className="section-acc-summary">
            <span className="section-label">All error patterns</span>
            <span className="section-acc-count">{ERROR_PATTERNS.length}</span>
            <span className="section-acc-chevron" aria-hidden="true">
              ⌄
            </span>
          </summary>
          <div className="section-acc-body">
            <ul className="ml-errors">
              {ERROR_PATTERNS.slice(TOP_ERRORS).map((e, i) => (
                <ErrorItem key={e.title} n={i + 1 + TOP_ERRORS} {...e} />
              ))}
            </ul>
            <p className="ml-fixed-label">Fixed — no longer live</p>
            <ul className="ml-fixed">
              {FIXED_PATTERNS.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </details>

        <details className="section-acc">
          <summary className="section-acc-summary">
            <span className="section-label">Anchor sentences</span>
            <span className="section-acc-count">{ANCHOR_SENTENCES.length}</span>
            <span className="section-acc-chevron" aria-hidden="true">
              ⌄
            </span>
          </summary>
          <div className="section-acc-body">
            <ol className="ml-anchors">
              {ANCHOR_SENTENCES.map((a) => (
                <li key={a.ml}>
                  <span className="ml-anchor-ml">{a.ml}</span>
                  <span className="ml-anchor-focus">{a.focus}</span>
                </li>
              ))}
            </ol>
          </div>
        </details>

        <details className="section-acc">
          <summary className="section-acc-summary">
            <span className="section-label">For a native speaker</span>
            <span className="section-acc-count">{OPEN_QUESTIONS.length}</span>
            <span className="section-acc-chevron" aria-hidden="true">
              ⌄
            </span>
          </summary>
          <div className="section-acc-body">
            <ul className="ml-fixed">
              {OPEN_QUESTIONS.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        </details>

        <details className="section-acc">
          <summary className="section-acc-summary">
            <span className="section-label">Activity log</span>
            <span className="section-acc-count">{ACTIVITY_LOG.length}</span>
            <span className="section-acc-chevron" aria-hidden="true">
              ⌄
            </span>
          </summary>
          <div className="section-acc-body">
            <ul className="ml-log">
              {ACTIVITY_LOG.map((l, i) => (
                <li key={i}>
                  <span className="ml-log-date">{l.date}</span>
                  <span className="ml-log-what">{l.activity}</span>
                  <span className="ml-log-result">{l.result}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>

        <p className="foot">
          Vīṇḍum kāṇām. <span aria-hidden="true">🧱</span>
        </p>
      </div>
    </main>
  );
}

function DiagRow({ tone, label, items }: { tone: string; label: string; items: string[] }) {
  return (
    <div className="ml-diag-row">
      <span className={`ml-diag-label ml-diag-${tone}`}>{label}</span>
      <span className="ml-chips">
        {items.map((i) => (
          <span key={i} className={`ml-chip ml-chip-${tone}`}>
            {i}
          </span>
        ))}
      </span>
    </div>
  );
}

function ErrorItem({
  n,
  title,
  detail,
  example,
}: {
  n: number;
  title: string;
  detail: string;
  example?: string;
}) {
  return (
    <li className="ml-error">
      <span className="ml-error-n">{n}</span>
      <div>
        <p className="ml-error-title">{title}</p>
        <p className="ml-error-detail">{detail}</p>
        {example && <p className="ml-error-ex">{example}</p>}
      </div>
    </li>
  );
}
