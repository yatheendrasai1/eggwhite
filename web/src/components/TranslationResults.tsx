import type { TranslationResult, TranslationItemResult } from "@/lib/tests/translation";

const VERDICT_LABEL: Record<TranslationItemResult["verdict"], string> = {
  correct: "Correct",
  partial: "Partial",
  incorrect: "Incorrect",
};

function ReviewCard({ r }: { r: TranslationItemResult }) {
  return (
    <li className="tr-card">
      <div className="tr-head">
        <span className="q-num">{String(r.n).padStart(2, "0")}</span>
        <span className={`verdict verdict-${r.verdict}`}>{VERDICT_LABEL[r.verdict]}</span>
        <span className="pts" style={{ marginLeft: "auto" }}>
          {r.score}/2
        </span>
      </div>
      <div className="translit">
        <div className="translit-row">
          <span className="translit-lang">Telugu</span>
          <span className="translit-text">{r.telugu}</span>
        </div>
        <div className="translit-row">
          <span className="translit-lang">Tinglish</span>
          <span className="translit-text">{r.tinglish}</span>
        </div>
        <div className="translit-row">
          <span className="translit-lang">Hinglish</span>
          <span className="translit-text">{r.hinglish}</span>
        </div>
      </div>
      <p className="tr-yours">
        <b>Your translation:</b> {r.yours || "(blank)"}
      </p>
      <p className="tr-yours">
        <b>Model translation:</b> {r.reference}
      </p>
      <p className="tr-feedback">{r.feedback}</p>
    </li>
  );
}

export function TranslationResults({ result }: { result: TranslationResult }) {
  const wrong = result.rows.filter((r) => r.verdict !== "correct");
  const correct = result.rows.filter((r) => r.verdict === "correct");

  return (
    <section className="results drill accent-violet">
      <div className="scorecard">
        <p className="score-big">
          {result.total}
          <span> / {result.maxScore}</span>
        </p>
        <p className="score-pct">{Math.round(result.pct)}% correct, as graded</p>
        <div className="grade-line">
          <p className="grade-band">{result.band.code}</p>
          <p className="grade-name">{result.band.name}</p>
          <p className="grade-desc">{result.band.desc}</p>
        </div>
      </div>

      <div className="panel">
        <h3>Item-by-item review</h3>
        {wrong.length > 0 && (
          <ul className="review">
            {wrong.map((r) => (
              <ReviewCard key={r.n} r={r} />
            ))}
          </ul>
        )}
        {correct.length > 0 && (
          <details className="acc">
            <summary>
              {correct.length} correct translation{correct.length > 1 ? "s" : ""}
            </summary>
            <ul className="review">
              {correct.map((r) => (
                <ReviewCard key={r.n} r={r} />
              ))}
            </ul>
          </details>
        )}
      </div>
    </section>
  );
}
