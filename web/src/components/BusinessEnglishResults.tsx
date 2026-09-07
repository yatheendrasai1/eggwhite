import {
  scoreBusinessEnglish,
  LADDER,
  type BEAnswers,
} from "@/lib/tests/businessEnglish";

function editIcon(pts: number, falseFlag?: boolean): string {
  if (falseFlag) return "✗";
  if (pts === 2) return "✓";
  if (pts === 1.5) return "≈";
  if (pts === 1) return "△";
  return "✗";
}
function editPtsClass(pts: number, falseFlag?: boolean): string {
  if (falseFlag || pts === 0) return "pts-0";
  if (pts === 2) return "pts-2";
  if (pts === 1.5) return "pts-15";
  return "pts-1";
}

export function BusinessEnglishResults({ answers }: { answers: BEAnswers }) {
  const r = scoreBusinessEnglish(answers);
  const { band } = r;
  const markerLeft = ((band.seg + 0.5) / 6) * 100;

  return (
    <section className="results">
      <div className="scorecard">
        <p className="score-big">
          {r.overall.toFixed(0)}
          <span>%</span>
        </p>
        <p className="score-pct">
          {r.found}/{r.total} spotted · {r.fixedOK} fixed · {r.partial} partial ·{" "}
          {r.falseFlags} false flag{r.falseFlags === 1 ? "" : "s"}
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
          <h3>Editing</h3>
          <p>
            {r.mailRaw}
            <span> / {r.mailMax}</span>
          </p>
          <small>{r.mailPct.toFixed(0)}%</small>
        </div>
        <div className="tile">
          <h3>Vocabulary</h3>
          <p>
            {r.vScore}
            <span> / 20</span>
          </p>
          <small>{r.vPct.toFixed(0)}%</small>
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
        <h3>Every error in the emails</h3>
        <ul className="review">
          {r.editReview.map((row, i) => (
            <li className="rev" key={i}>
              <span className="rev-i">{editIcon(row.pts, row.falseFlag)}</span>
              <span className="rev-b">
                {row.falseFlag ? (
                  <>
                    <b>&ldquo;{row.from}&rdquo;</b> was already correct.
                  </>
                ) : (
                  <>
                    <span className="from">{row.from}</span> &rarr;{" "}
                    <span className="to">{row.to}</span>
                    {row.yours ? (
                      <span className="yours">you wrote: {row.yours}</span>
                    ) : null}
                  </>
                )}
                <em>{row.why}</em>
              </span>
              <span className={`pts ${editPtsClass(row.pts, row.falseFlag)}`}>
                {row.falseFlag ? "−1" : row.pts}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel">
        <h3>Vocabulary answers</h3>
        <ul className="review">
          {r.vocabReview.map((row, i) => (
            <li className="rev" key={i}>
              <span className="rev-i">{row.ok ? "✓" : "✗"}</span>
              <span className="rev-b">
                <b>{row.word}</b> &mdash; <span className="to">{row.correct}</span>
                {row.ok ? null : (
                  <span className="yours">you chose: {row.yours ?? "—"}</span>
                )}
              </span>
              <span className={`pts pts-${row.ok ? 2 : 0}`}>{row.ok ? 1 : 0}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="foot">
        Corrections are matched against a wide list of accepted answers, with typos and
        near-misses given partial credit. Check the review before arguing with your score.
      </p>
    </section>
  );
}
