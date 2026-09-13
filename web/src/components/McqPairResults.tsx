import {
  scoreMcqPair,
  totalMcqPair,
  type McqPairConfig,
  type McqPairAnswers,
  type McqPairRow,
} from "@/lib/tests/mcqPair";

function Rev({ r }: { r: McqPairRow }) {
  const parts = r.sentence ? r.sentence.split("___") : null;
  return (
    <li className="rev">
      <span className="rev-i">{r.ok ? "✓" : "✗"}</span>
      <span className="rev-b">
        {parts && parts.length > 1 ? (
          <>
            {parts[0]}
            <b>{r.correctText}</b>
            {parts[1]}
          </>
        ) : (
          <b>{r.correctText}</b>
        )}
        {r.hint ? <span className="q-hint"> {r.hint}</span> : null}
        {r.ok ? null : <span className="yours">you chose: {r.yoursText ?? "—"}</span>}
        <em>{r.why}</em>
      </span>
      <span className={`pts pts-${r.ok ? 1 : 0}`}>{r.ok ? 1 : 0}</span>
    </li>
  );
}

function SplitReview({ rows }: { rows: McqPairRow[] }) {
  const wrong = rows.filter((r) => !r.ok);
  const correct = rows.filter((r) => r.ok);
  return (
    <>
      {wrong.length > 0 && (
        <ul className="review">
          {wrong.map((r) => (
            <Rev key={r.n} r={r} />
          ))}
        </ul>
      )}
      {correct.length > 0 && (
        <details className="acc">
          <summary>
            {correct.length} correct answer{correct.length > 1 ? "s" : ""}
          </summary>
          <ul className="review">
            {correct.map((r) => (
              <Rev key={r.n} r={r} />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

export function McqPairResults({
  config,
  answers,
}: {
  config: McqPairConfig;
  answers: McqPairAnswers;
}) {
  const r = scoreMcqPair(config, answers);
  const total = totalMcqPair(config);
  const markerLeft = ((r.bandIdx + 0.5) / config.ladder.length) * 100;

  return (
    <section className={`results drill accent-${config.accent}`}>
      <div className="scorecard">
        <p className="score-big">
          {r.total}
          <span> / {total}</span>
        </p>
        <p className="score-pct">{r.pct.toFixed(0)}% correct</p>
        <div className="grade-line">
          <p className="grade-band">{r.band.code}</p>
          <p className="grade-name">{r.band.name}</p>
          <p className="grade-desc">{r.band.desc}</p>
        </div>
        <div className="ladder">
          <div className="ladder-track">
            <span className="marker" style={{ left: `${markerLeft}%` }}>
              ▼
            </span>
            {config.ladder.map((l, i) => {
              const cls =
                i < r.bandIdx ? "rung filled" : i === r.bandIdx ? "rung here" : "rung";
              return (
                <span className={cls} key={l[0]}>
                  {l[0]}
                </span>
              );
            })}
          </div>
          <div className="ladder-ends">
            <span>{config.ladderEnds[0]}</span>
            <span>{config.ladderEnds[1]}</span>
          </div>
        </div>
      </div>

      <div className="split">
        {r.tiles.map((t, i) => (
          <div className="tile" key={i}>
            <h3>{t.label}</h3>
            <p>
              {t.score}
              <span> / {t.total}</span>
            </p>
            <small>{t.total ? ((t.score / t.total) * 100).toFixed(0) : 0}% correct</small>
          </div>
        ))}
      </div>

      <div className="panel">
        <h3>The scale</h3>
        <ul className="levels">
          {config.ladder.map((l, i) => {
            const you = i === r.bandIdx;
            return (
              <li className={you ? "you" : ""} key={l[0]}>
                <span className="lv-code">{l[0]}</span>
                <span className="lv-body">
                  <b>
                    {l[1]}
                    {you ? <span className="you-tag">you are here</span> : null}
                  </b>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="panel">
        <h3>Part I answers</h3>
        <SplitReview rows={r.rows1} />
      </div>
      <div className="panel">
        <h3>Part II answers</h3>
        <SplitReview rows={r.rows2} />
      </div>

      <p className="foot">{config.footNote}</p>
    </section>
  );
}
