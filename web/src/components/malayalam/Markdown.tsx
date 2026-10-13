import type { ReactNode } from "react";

/**
 * A deliberately small Markdown renderer for the Malayalam handbook text
 * (lib/malayalam/grammar.ts): paragraphs, `-` lists (one nesting level),
 * `>` quotes, ``` fences, pipe tables, and inline **bold**, *italic*,
 * ~~strike~~ and `code`. Anything else renders as plain text.
 */

const INLINE: { re: RegExp; wrap: (inner: ReactNode, key: number) => ReactNode; recurse: boolean }[] = [
  { re: /\*\*(.+?)\*\*/, wrap: (c, k) => <strong key={k}>{c}</strong>, recurse: true },
  { re: /\*((?:\*\*.+?\*\*|[^*])+?)\*(?!\*)/, wrap: (c, k) => <em key={k}>{c}</em>, recurse: true },
  { re: /~~(.+?)~~/, wrap: (c, k) => <s key={k}>{c}</s>, recurse: true },
  { re: /`([^`]+)`/, wrap: (c, k) => <code key={k}>{c}</code>, recurse: false },
];

export function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest) {
    let best: { idx: number; len: number; inner: string; rule: (typeof INLINE)[number] } | null = null;
    for (const rule of INLINE) {
      const m = rule.re.exec(rest);
      if (m && (best === null || m.index < best.idx)) {
        best = { idx: m.index, len: m[0].length, inner: m[1], rule };
      }
    }
    if (!best) {
      out.push(rest);
      break;
    }
    if (best.idx > 0) out.push(rest.slice(0, best.idx));
    out.push(best.rule.wrap(best.rule.recurse ? inline(best.inner) : best.inner, key++));
    rest = rest.slice(best.idx + best.len);
  }
  return out;
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

type ListItem = { text: string; children: string[] };

export function Markdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) body.push(lines[i++]);
      i++;
      blocks.push(
        <pre key={key++} className="ml-md-pre">
          {body.join("\n")}
        </pre>
      );
      continue;
    }

    if (trimmed.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = splitRow(lines[i]);
        if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      const hasHead = head?.some((c) => c);
      blocks.push(
        <div key={key++} className="ml-md-table-wrap">
          <table className="ml-md-table">
            {hasHead && (
              <thead>
                <tr>
                  {head.map((c, j) => (
                    <th key={j}>{inline(c)}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, j) => (
                    <td key={j}>{inline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (trimmed.startsWith(">")) {
      const body: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        body.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote key={key++} className="ml-md-quote">
          {body.map((b, j) => (
            <p key={j}>{inline(b)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    if (/^- /.test(line)) {
      const items: ListItem[] = [];
      while (i < lines.length && (/^- /.test(lines[i]) || /^\s+- /.test(lines[i]))) {
        if (/^- /.test(lines[i])) items.push({ text: lines[i].slice(2), children: [] });
        else items[items.length - 1]?.children.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++} className="ml-md-list">
          {items.map((it, j) => (
            <li key={j}>
              {inline(it.text)}
              {it.children.length > 0 && (
                <ul>
                  {it.children.map((c, k) => (
                    <li key={k}>{inline(c)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Paragraph: consecutive plain lines, kept as visible line breaks
    // (the handbook uses single newlines as intentional breaks).
    const para: string[] = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || /^(\||>|```|- )/.test(t)) break;
      para.push(t);
      i++;
    }
    blocks.push(
      <p key={key++} className="ml-md-p">
        {para.map((p, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {inline(p)}
          </span>
        ))}
      </p>
    );
  }

  return <div className="ml-md">{blocks}</div>;
}
