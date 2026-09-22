"use client";

import { useState } from "react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { Portal } from "@/components/Portal";

const RAW_COLOR = "#3d63e8";
const WEIGHTED_COLOR = "#d6497e";
const GLOBAL_AVG = 79.58;

const EXAMPLE_STUDENTS = [
  { name: "Student 1", tests: 2, raw: 86.5, weighted: 82.35 },
  { name: "Student 2", tests: 1, raw: 90, weighted: 82.19 },
  { name: "Student 3", tests: 2, raw: 80, weighted: 79.75 },
];

function ShrinkageChart() {
  const width = 320;
  const height = 210;
  const padLeft = 30;
  const padRight = 8;
  const padTop = 12;
  const padBottom = 28;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const scaleMax = 100;
  const y = (v: number) => padTop + plotH - (v / scaleMax) * plotH;
  const groupW = plotW / EXAMPLE_STUDENTS.length;
  const barW = 22;
  const gap = 3;

  return (
    <figure className="shrink-chart" aria-label="Chart comparing each student's raw test average against their leaderboard-weighted score">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        {/* baseline + y ticks */}
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line
              x1={padLeft}
              x2={width - padRight}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <text x={padLeft - 6} y={y(t) + 3} textAnchor="end" className="shrink-chart-tick">
              {t}
            </text>
          </g>
        ))}

        <line
          x1={padLeft}
          x2={width - padRight}
          y1={y(GLOBAL_AVG)}
          y2={y(GLOBAL_AVG)}
          stroke="var(--ink-soft)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />

        {EXAMPLE_STUDENTS.map((s, i) => {
          const cx = padLeft + groupW * i + groupW / 2;
          const rawX = cx - gap / 2 - barW;
          const weightedX = cx + gap / 2;
          return (
            <g key={s.name}>
              <rect
                x={rawX}
                y={y(s.raw)}
                width={barW}
                height={y(0) - y(s.raw)}
                rx={4}
                fill={RAW_COLOR}
              >
                <title>
                  {s.name}: raw average {s.raw}%
                </title>
              </rect>
              <text x={rawX + barW / 2} y={y(s.raw) - 5} textAnchor="middle" className="shrink-chart-val">
                {s.raw}
              </text>

              <rect
                x={weightedX}
                y={y(s.weighted)}
                width={barW}
                height={y(0) - y(s.weighted)}
                rx={4}
                fill={WEIGHTED_COLOR}
              >
                <title>
                  {s.name}: weighted score {s.weighted}
                </title>
              </rect>
              <text
                x={weightedX + barW / 2}
                y={y(s.weighted) - 5}
                textAnchor="middle"
                className="shrink-chart-val"
              >
                {s.weighted}
              </text>

              <text x={cx} y={height - padBottom + 16} textAnchor="middle" className="shrink-chart-label">
                {s.name}
              </text>
              <text x={cx} y={height - padBottom + 27} textAnchor="middle" className="shrink-chart-sublabel">
                {s.tests} test{s.tests === 1 ? "" : "s"}
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="shrink-chart-legend">
        <span className="shrink-chart-legend-item">
          <span className="shrink-chart-swatch" style={{ background: RAW_COLOR }} />
          Raw average
        </span>
        <span className="shrink-chart-legend-item">
          <span className="shrink-chart-swatch" style={{ background: WEIGHTED_COLOR }} />
          Leaderboard score
        </span>
        <span className="shrink-chart-legend-item">
          <span className="shrink-chart-dash" />
          Global avg ({GLOBAL_AVG}%)
        </span>
      </figcaption>

      <table className="shrink-chart-table">
        <caption className="sr-only">Raw average vs. leaderboard score for each example student</caption>
        <thead>
          <tr>
            <th scope="col">Student</th>
            <th scope="col">Tests</th>
            <th scope="col">Raw avg</th>
            <th scope="col">Leaderboard score</th>
          </tr>
        </thead>
        <tbody>
          {EXAMPLE_STUDENTS.map((s) => (
            <tr key={s.name}>
              <td>{s.name}</td>
              <td>{s.tests}</td>
              <td>{s.raw}%</td>
              <td>{s.weighted}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function LeaderboardInfo() {
  const [open, setOpen] = useState(false);
  useBodyScrollLock(open);

  return (
    <>
      <button
        type="button"
        className="info-icon-btn"
        aria-label="How overall leaderboard ranking works"
        onClick={() => setOpen(true)}
      >
        i
      </button>
      {open && (
        <Portal>
          <div className="modal-overlay" onClick={() => setOpen(false)}>
            <div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: "85vh", overflowY: "auto", maxWidth: 460 }}
            >
              <button
                type="button"
                className="modal-close"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
              <h2 className="drawer-title" style={{ fontSize: 22 }}>
                How the <em>overall</em> ranking works
              </h2>
              <p style={{ margin: "0 0 6px", fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                The Overall board doesn&rsquo;t rank by raw average score. It uses a
                &ldquo;shrinkage&rdquo; average that pulls a score toward the site-wide
                average until you&rsquo;ve taken enough tests to trust it &mdash; so one
                lucky test can&rsquo;t outrank a consistently strong record.
              </p>
              <p style={{ margin: "0 0 18px", fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                The fewer tests you&rsquo;ve taken, the more your score gets pulled toward
                the global average; the more tests you take, the more it reflects your
                real average.
              </p>

              <ShrinkageChart />

              <p style={{ margin: "16px 0 0", fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
                Example: with a global average of {GLOBAL_AVG}%, Student 2&rsquo;s single
                90% test gets shrunk more than Student 1&rsquo;s two-test average of
                86.5% &mdash; so Student 1 edges ahead on the leaderboard despite the
                lower raw score.
              </p>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
