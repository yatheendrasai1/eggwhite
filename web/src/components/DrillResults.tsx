import {
  scoreDrill,
  type DrillConfig,
  type DrillAnswers,
  type DrillFillRow,
  type DrillMcqRow,
} from "@/lib/tests/drill";

function FillRev({ r }: { r: DrillFillRow }) {
  return (
    <li className="rev">
      <span className="rev-i">{r.ok ? "✓" : "✗"}</span>
      <span className="rev-b">
        {r.before}
        <span className="to">{r.model}</span>
        {r.after}
        {r.ok ? null : (
          <span className="yours">you wrote: {r.yours.trim() || "—"}</span>
        )}
        <em>{r.why}</em>
      </span>
      <span className={`pts pts-${r.ok ? 1 : 0}`}>{r.ok ? 1 : 0}</span>
    </li>
  );
}

function McqRev({ r }: { r: DrillMcqRow }) {
  const [before, after] = r.sentence.split("___");
  return (
    <li className="rev">
      <span className="rev-i">{r.ok ? "✓" : "✗"}</span>
      <span className="rev-b">
        {before}
        <b>{r.correctText}</b>
        {after}
        {r.ok ? null : (
          <span className="yours">you chose: {r.yoursText ?? "—"}</span>
        )}
        <em>{r.why}</em>
      </span>
      <span className={`pts pts-${r.ok ? 1 : 0}`}>{r.ok ? 1 : 0}</span>
    </li>
  );
}

function SplitReview<T extends { ok: boolean }>({
  rows,
  render,
}: {
  rows: T[];
  render: (r: T, i: number) => React.ReactNode;
}) {
  const wrong = rows.filter((r) => !r.ok);
  const correct = rows.filter((r) => r.ok);
  return (
    <>
      {wrong.length > 0 && (
        <ul className="review">{wrong.map((r, i) => render(r, i))}</ul>
      )}
      {correct.length > 0 && (
        <details className="acc">
          <summary>
            {correct.length} correct answer{correct.length > 1 ? "s" : ""}
          </summary>
          <ul className="review">{correct.map((r, i) => render(r, i))}</ul>
        </details>
      )}
    </>
  );
}

export function DrillResults({
  config,
  answers,
}: {
  config: DrillConfig;
  answers: DrillAnswers;
}) {
  const r = scoreDrill(config, answers);
  const markerLeft = ((r.bandIdx + 0.5) / config.ladder.length) * 100;

  return (
    <section className={`results drill accent-${config.accent}`}>
      <div className="scorecard">
        <p className="score-big">
          {r.total}
          <span> / 32</span>
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
            <small>
              {t.total ? ((t.score / t.total) * 100).toFixed(0) : 0}% correct
            </small>
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
        <SplitReview
          rows={r.fillRows}
          render={(row) => <FillRev key={row.n} r={row} />}
        />
      </div>
      <div className="panel">
        <h3>Part II answers</h3>
        <SplitReview
          rows={r.mcqRows}
          render={(row) => <McqRev key={row.n} r={row} />}
        />
      </div>

      <p className="foot">{config.footNote}</p>
    </section>
  );
}
