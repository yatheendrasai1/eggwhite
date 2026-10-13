import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "@/components/malayalam/Markdown";
import { effectiveLanguage } from "@/lib/language";
import { CURRICULUM } from "@/lib/malayalam/progress";
import { GRAMMAR_SECTIONS } from "@/lib/malayalam/grammar";
import { REVISION_ROWS, REVISION_SENTENCES } from "@/lib/malayalam/sentences";

const md = (source: string) => renderToStaticMarkup(createElement(Markdown, { source }));

describe("malayalam data", () => {
  it("has the 100 revision sentences, each in a known row", () => {
    expect(REVISION_SENTENCES).toHaveLength(100);
    const rows = new Set(REVISION_ROWS.map((r) => r.row));
    for (const s of REVISION_SENTENCES) expect(rows.has(s.row)).toBe(true);
    expect(new Set(REVISION_SENTENCES.map((s) => s.n)).size).toBe(100);
  });

  it("links curriculum rows only to revision rows that exist", () => {
    const rows = new Set(REVISION_ROWS.map((r) => r.row));
    for (const r of CURRICULUM) if (r.sentenceRow) expect(rows.has(r.sentenceRow)).toBe(true);
  });

  it("has unique grammar section ids", () => {
    expect(new Set(GRAMMAR_SECTIONS.map((s) => s.id)).size).toBe(GRAMMAR_SECTIONS.length);
  });
});

describe("effectiveLanguage", () => {
  it("only lets tiv accounts see Malayalam", () => {
    expect(effectiveLanguage({ isTiv: true, language: "malayalam" })).toBe("malayalam");
    expect(effectiveLanguage({ isTiv: false, language: "malayalam" })).toBe("english");
    expect(effectiveLanguage({ isTiv: true, language: "english" })).toBe("english");
    expect(effectiveLanguage(null)).toBe("english");
  });
});

describe("Markdown", () => {
  it("renders tables, skipping the separator row", () => {
    const html = md("| a | b |\n|---|---|\n| 1 | **2** |");
    expect(html).toContain("<th>a</th>");
    expect(html).toContain("<td><strong>2</strong></td>");
    expect(html).not.toContain("---");
  });

  it("nests bold inside italic", () => {
    expect(md("*nā iṇṭi**kaṇṭe** peddadi.*")).toContain(
      "<em>nā iṇṭi<strong>kaṇṭe</strong> peddadi.</em>"
    );
  });

  it("renders nested list items and quotes", () => {
    const html = md("- top\n  - child\n\n> quoted");
    expect(html).toContain("<li>top<ul><li>child</li></ul></li>");
    expect(html).toContain("<blockquote");
  });

  it("leaves no stray emphasis markers in the handbook sections", () => {
    for (const s of GRAMMAR_SECTIONS) {
      const text = md(s.md).replace(/<pre[\s\S]*?<\/pre>/g, "");
      expect(text, s.id).not.toMatch(/\*\*|~~/);
    }
  });
});
