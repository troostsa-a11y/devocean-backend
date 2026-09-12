import React, { Fragment } from "react";

/** Small, safe Markdown subset shared by guest chat and transcript reporting.
 * React escapes all text; raw HTML is never interpreted.
 */
export function MessageContent({ text, assistant = true }: { text: string; assistant?: boolean }) {
  const normalized = assistant
    ? text.replace(/\\\$/g, "$")
      // Older responses occasionally put numbered, bold option labels inline.
      .replace(/([^\n]) +(\d+[.)] +\*\*)/g, "$1\n\n$2")
    : text;
  const tokens = assistant
    ? normalized.split(/(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|\[[^\]\n]+\]\([^)]+\))/g)
    : [normalized];
  return <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
    {tokens.map((token, i) => {
      if (assistant && ((token.startsWith("**") && token.endsWith("**")) ||
        (token.startsWith("__") && token.endsWith("__"))))
        return <strong key={i}>{token.slice(2, -2)}</strong>;
      if (assistant && /^\*[^*]+\*$/.test(token))
        return <em key={i}>{token.slice(1, -1)}</em>;
      const link = assistant && token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const [, label, destination] = link;
        let href: string | undefined;
        try {
          const url = new URL(
            /^(?:https?:\/\/|\/)/i.test(destination) ? destination :
              /^[\w.-]+\.[a-z]{2,}(?:\/|$)/i.test(destination) ? `https://${destination}` : "",
            "https://devoceanlodge.com",
          );
          if (destination && /^(https?:\/\/|\/|[\w.-]+\.[a-z]{2,}(?:\/|$))/i.test(destination) &&
            ["http:", "https:"].includes(url.protocol)) href = url.href;
        } catch { /* Invalid links remain plain text. */ }
        return href
          ? <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80">{label}</a>
          : <Fragment key={i}>{label}</Fragment>;
      }
      return <Fragment key={i}>{token}</Fragment>;
    })}
  </span>;
}