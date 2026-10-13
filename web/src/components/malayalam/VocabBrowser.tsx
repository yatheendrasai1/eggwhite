"use client";

import { useState } from "react";
import { VOCAB } from "@/lib/malayalam/vocab";

/** Folds diacritics so typing "kada" finds "kaḍa". */
function fold(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function VocabBrowser() {
  const [query, setQuery] = useState("");
  const q = fold(query.trim());

  const groups = VOCAB.map((g) => ({
    ...g,
    words: q
      ? g.words.filter((w) => fold(`${w.ml} ${w.en} ${w.te} ${w.note ?? ""}`).includes(q))
      : g.words,
  })).filter((g) => g.words.length > 0);

  return (
    <>
      <input
        type="search"
        className="ml-search"
        placeholder="Search Malayalam, English or Telugu…"
        aria-label="Search vocabulary"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {groups.length === 0 && <p className="foot">No words match &ldquo;{query}&rdquo;.</p>}
      {groups.map((g) => (
        <section key={g.title} className="panel">
          <h3>{g.title}</h3>
          <div className="ml-md-table-wrap">
            <table className="ml-md-table ml-vocab">
              <thead>
                <tr>
                  <th>Malayalam</th>
                  <th>English</th>
                  <th>Telugu</th>
                </tr>
              </thead>
              <tbody>
                {g.words.map((w) => (
                  <tr key={w.ml + w.en}>
                    <td>
                      <b>{w.ml}</b>
                      {w.note && <small className="ml-vocab-note">{w.note}</small>}
                    </td>
                    <td>{w.en}</td>
                    <td>{w.te}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
