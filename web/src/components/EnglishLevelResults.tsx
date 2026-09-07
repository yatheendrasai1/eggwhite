import {
  scoreEnglishLevel,
  LADDER,
  fmt,
  type ELAnswers,
  type ELReviewRow,
} from "@/lib/tests/englishLevel";

const PTS_CLASS: Record<string, string> = { "1": "pts-1", h: "pts-h", "0": "pts-0", n: "pts-n" };
const PTS_TXT: Record<string, string> = { "1": "1", h: "½", "0": "0", n: "—" };

function ReviewList({ rows }: { rows: ELReviewRow[] }) {
  return (
    <ul className="review">
      {rows.map((r) => (
        <li className="rev" key={r.n}>
          <span className="rev-n">{String(r.n).padStart(2, "0")}</span>
          <span className="rev-b">
            <b>{r.q}</b>
            <em>{r.correct}</em>
          </span>
          <span className={`pts ${PTS_CLASS[r.kind]}`}>{PTS_TXT[r.kind]}</span>
        </li>
      ))}
    </ul>
  );
}

export function EnglishLevelResults({ answers }: { answers: ELAnswers }) {
  const r = scoreEnglishLevel(answers);
  const { band } = r;
  const markerLeft = ((band.seg + 0.5) / 6) * 100;

  return (
    <section className="results">
      <div className="scorecard">
        <p className="score-big">
          {fmt(r.total)}
          <span> / 60</span>
        </p>
        <p className="score-pct">
          {r.pct.toFixed(0)}% · scored on confidence, not guesswork
        </p>
        <div className="grade-line">
          <p className="grade-band">{band.code}</p>
          <p className="grade-name">{band.name}</p>
          <p className="grade-desc">{band.desc}</p>
        </div>
        <div className="ladder">
          <div className="ladder-track">
            <span className="marker" style={{ left: `${markerLeft}%` }}>
              ▼
            </span>
            {LADDER.map((l, i) => {
              const cls =
                i < band.seg ? "rung filled" : i === band.seg ? "rung here" : "rung";
              return (
                <span className={cls} key={l[0]}>
                  {l[0]}
                </span>
              );
            })}
          </div>
          <div className="ladder-ends">
            <span>Beginner</span>
            <span>Mastery</span>
          </div>
        </div>
      </div>

      <div className="split">
        <div className="tile">
          <h3>Vocabulary</h3>
          <p>
            {fmt(r.vs)}
            <span> / 30</span>
          </p>
          <small>{((r.vs / 30) * 100).toFixed(0)}% correct</small>
        </div>
        <div className="tile">
          <h3>Grammar</h3>
          <p>
            {fmt(r.gs)}
            <span> / 30</span>
          </p>
          <small>{((r.gs / 30) * 100).toFixed(0)}% correct</small>
        </div>
      </div>

      <div className="panel">
        <h3>The full scale</h3>
        <ul className="levels">
          {LADDER.map((l) => {
            const you = l[0] === band.code.slice(0, 2);
            return (
              <li className={you ? "you" : ""} key={l[0]}>
                <span className="lv-code">{l[0]}</span>
                <span className="lv-body">
                  <b>
                    {l[1]}
                    {you ? <span className="you-tag">you are here</span> : null}
                  </b>
                  <span>{l[2]}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="panel">
        <h3>Vocabulary answers</h3>
        <ReviewList rows={r.vocabReview} />
      </div>
      <div className="panel">
        <h3>Grammar answers</h3>
        <ReviewList rows={r.gramReview} />
      </div>

      <p className="foot">
        CEFR bands are indicative. This tests recognition — what you produce in your own
        writing is usually a step behind.
      </p>
    </section>
  );
}
