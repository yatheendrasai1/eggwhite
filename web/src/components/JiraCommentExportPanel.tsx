"use client";

import { useState } from "react";
import { buildExportText, type JiraCommentConfig, type JiraCommentResult } from "@/lib/tests/jiraComment";

export function JiraCommentExportPanel({
  result,
  config,
}: {
  result: JiraCommentResult;
  config: JiraCommentConfig;
}) {
  const [copied, setCopied] = useState(false);
  const text = buildExportText(config, result);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the
      // text is still selectable/copyable manually from the textarea.
    }
  }

  return (
    <details className="acc">
      <summary>Rubric, backstory &amp; response (copy)</summary>
      <div style={{ marginTop: 10 }}>
        <textarea className="translate-input export-textarea" value={text} readOnly />
        <button type="button" className="btn btn-ghost" style={{ marginTop: 10 }} onClick={copy}>
          {copied ? "Copied!" : "Copy to clipboard"}
        </button>
      </div>
    </details>
  );
}
