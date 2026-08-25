// Renderers for the lesson block schema described in src/data/blocks.js.

// Minimal inline markup: **bold**, *italic*, `code`. Deliberately not a
// markdown library — the content only uses these three, and hand-rolling it
// keeps the app dependency-free and offline.
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

export function Inline({ text }) {
  if (!text) return null;
  const parts = String(text).split(INLINE);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-semibold text-text">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={i}
              className="font-mono text-[0.86em] px-1 py-0.5 rounded bg-surface2 border border-border text-accent2"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return (
            <em key={i} className="italic">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

const NOTE_STYLES = {
  insight: { ring: "border-accent2/40 bg-accent2/[0.07]", label: "INSIGHT", text: "text-accent2" },
  warn: { ring: "border-amber/40 bg-amber/[0.07]", label: "WATCH OUT", text: "text-amber" },
  analogy: { ring: "border-success/40 bg-success/[0.06]", label: "ANALOGY", text: "text-success" },
  interview: { ring: "border-accent/40 bg-accent/[0.07]", label: "INTERVIEW", text: "text-accent" },
};

function Note({ tone, title, text }) {
  const s = NOTE_STYLES[tone] ?? NOTE_STYLES.insight;
  return (
    <aside className={`rounded-xl border-l-2 border ${s.ring} px-4 py-3.5 my-5`}>
      <p className={`font-mono text-[10px] tracking-wider mb-1.5 ${s.text}`}>{s.label}</p>
      {title && (
        <p className="text-sm font-semibold mb-1.5 text-text">
          <Inline text={title} />
        </p>
      )}
      <p className="text-[13.5px] leading-relaxed text-text/85">
        <Inline text={text} />
      </p>
    </aside>
  );
}

function CodeBlock({ lang, code, caption }) {
  return (
    <figure className="my-5">
      <div className="rounded-xl border border-border bg-[#0C1020] overflow-hidden">
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-border bg-surface2/50">
          <span className="font-mono text-[10px] text-muted uppercase tracking-wider">{lang || "text"}</span>
          {caption && <span className="text-[11px] text-muted truncate ml-3">{caption}</span>}
        </div>
        <pre className="px-4 py-3.5 overflow-x-auto text-[12.5px] leading-[1.65] font-mono text-text/90">
          <code>{code}</code>
        </pre>
      </div>
    </figure>
  );
}

function MathBlock({ formula, note }) {
  return (
    <div className="my-5 rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-4 py-3.5 bg-surface2/40 border-b border-border">
        <pre className="font-mono text-[13.5px] leading-relaxed text-accent2 whitespace-pre-wrap break-words">
          {formula}
        </pre>
      </div>
      {note && (
        <p className="px-4 py-3 text-[13px] leading-relaxed text-muted">
          <Inline text={note} />
        </p>
      )}
    </div>
  );
}

function Table({ head, rows }) {
  return (
    <div className="my-5 rounded-xl border border-border overflow-x-auto">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="bg-surface2/60">
            {head.map((h, i) => (
              <th
                key={i}
                className="text-left font-mono text-[10px] uppercase tracking-wider text-muted px-3.5 py-2.5 border-b border-border whitespace-nowrap"
              >
                <Inline text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-border/60 last:border-0">
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={`px-3.5 py-2.5 align-top leading-relaxed ${
                    c === 0 ? "text-text/95 font-medium" : "text-text/75"
                  }`}
                >
                  <Inline text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Steps({ items }) {
  return (
    <ol className="my-5 space-y-3.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3.5">
          <span className="shrink-0 w-6 h-6 rounded-full bg-surface2 border border-border font-mono text-[11px] flex items-center justify-center text-accent mt-0.5">
            {i + 1}
          </span>
          <div className="min-w-0">
            {item.title && (
              <p className="text-[13.5px] font-semibold text-text mb-0.5">
                <Inline text={item.title} />
              </p>
            )}
            <p className="text-[13.5px] leading-relaxed text-text/80">
              <Inline text={item.text} />
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function Block({ block }) {
  switch (block.t) {
    case "h":
      return (
        <h3 className="font-display text-[17px] font-semibold tracking-tight mt-8 mb-3 text-text">
          <Inline text={block.text} />
        </h3>
      );

    case "p":
      return (
        <p className="text-[14.5px] leading-[1.75] text-text/85 my-4">
          <Inline text={block.text} />
        </p>
      );

    case "list":
      return block.ordered ? (
        <ol className="my-4 space-y-2 list-decimal pl-6">
          {block.items.map((item, i) => (
            <li key={i} className="text-[14px] leading-[1.7] text-text/80 pl-1">
              <Inline text={item} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className="my-4 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-[14px] leading-[1.7] text-text/80">
              <span className="text-accent shrink-0 select-none mt-px">•</span>
              <span className="min-w-0">
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    case "steps":
      return <Steps items={block.items} />;

    case "math":
      return <MathBlock formula={block.formula} note={block.note} />;

    case "code":
      return <CodeBlock lang={block.lang} code={block.code} caption={block.caption} />;

    case "note":
      return <Note tone={block.tone} title={block.title} text={block.text} />;

    case "table":
      return <Table head={block.head} rows={block.rows} />;

    case "hr":
      return <hr className="my-8 border-border" />;

    default:
      return null;
  }
}
