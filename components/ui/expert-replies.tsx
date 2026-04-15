"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO = "'JetBrains Mono', Consolas, 'Courier New', monospace";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const T = {
  primary: "rgba(0,0,0,0.9)",
  secondary: "rgba(0,0,0,0.7)",
  tertiary: "rgba(0,0,0,0.5)",
  disabled: "rgba(0,0,0,0.3)",
} as const;

// ── Streaming text effect ─────────────────────────────────────
function StreamText({ text, speed = 30, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const doneRef = React.useRef(false);
  useEffect(() => {
    let i = 0;
    doneRef.current = false;
    setDisplayed("");
    const charsPerTick = speed <= 15 ? 3 : speed <= 25 ? 2 : 1;
    const interval = Math.max(16, speed);
    const timer = setInterval(() => {
      i += charsPerTick;
      if (i >= text.length) {
        i = text.length;
        setDisplayed(text);
        clearInterval(timer);
        if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
      } else {
        setDisplayed(text.slice(0, i));
      }
    }, interval);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);
  return <>{displayed}</>;
}

// ── Tag pill ──────────────────────────────────────────────────
function TagPill({ label }: { label: string }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      height: 24,
      padding: "0 8px",
      background: "#EDF0F5",
      borderRadius: 40,
      gap: 4,
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: FONT, fontSize: 12, fontWeight: 400,
        color: T.primary, whiteSpace: "nowrap",
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Tool Call Card (折叠式工具调用) ──────────────────────────
interface ToolCallCardProps {
  title: string;
  /** 展开时显示的代码内容（可选） */
  content?: { command?: string; result?: string };
}

function ToolCallCard({ title, content }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      width: "100%",
      overflow: "hidden",
      borderRadius: 16,
      border: "1.5px solid #E9ECF1",
    }}>
      {/* Header — always visible */}
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          height: 44,
          padding: "0 10px 0 16px",
          background: "#F7F8FB",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          {/* Green check icon — exact SVG from design */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <path d="M13.9895 4.91937L6.91842 11.9904L2.67578 7.7478L3.61859 6.80499L6.91842 10.1048L13.0467 3.97656L13.9895 4.91937Z" fill="#0CBF5B" />
          </svg>
          <span style={{
            fontFamily: FONT, fontSize: 14, fontWeight: 600,
            lineHeight: "22px", color: T.primary,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {title}
          </span>
        </div>
        {/* Chevron — rotates on expand */}
        <div style={{
          width: 28, height: 24, borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{
              transition: "transform 0.2s ease",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <path d="M11.6668 10.6099L8.0001 6.94323L4.33343 10.6099L3.39062 9.66709L8.0001 5.05762L12.6096 9.66709L11.6668 10.6099Z" fill="rgba(0,0,0,0.5)" />
          </svg>
        </div>
      </div>

      {/* Expandable content area */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              background: "#FFFFFF",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}>
              {content?.command && (
                <pre style={{
                  margin: 0,
                  fontFamily: MONO,
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: "22px",
                  color: T.primary,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}>
                  {content.command}
                </pre>
              )}
              {content?.result && (
                <>
                  <div style={{
                    width: "100%",
                    height: 1,
                    background: "#E6E9EF",
                    margin: "16px 0",
                  }} />
                  <pre style={{
                    margin: 0,
                    fontFamily: MONO,
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: "22px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}>
                    <span style={{ color: T.primary }}>{content.result.replace(/(\d+ rows? selected)$/i, "")}</span>
                    {content.result.match(/(\d+ rows? selected)$/i) && (
                      <span style={{ color: "#0CBF5B", fontWeight: 600 }}>
                        {content.result.match(/(\d+ rows? selected)$/i)?.[1]}
                      </span>
                    )}
                  </pre>
                </>
              )}
              {!content?.command && !content?.result && (
                <span style={{
                  fontFamily: MONO, fontSize: 14, fontWeight: 400,
                  lineHeight: "22px", color: T.tertiary,
                }}>
                  执行完成 ✓
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SQL Code Block (语法高亮代码块) ──────────────────────────
interface SqlToken { text: string; color: string }

function tokenizeSql(code: string): SqlToken[] {
  const keywords = /\b(INSERT|OVERWRITE|TABLE|PARTITION|SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|ON|AS|AND|OR|GROUP|BY|ORDER|HAVING|LIMIT|INTO|VALUES|UPDATE|DELETE|CREATE|DROP|ALTER|WITH|UNION|ALL|DISTINCT|CASE|WHEN|THEN|ELSE|END|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|COUNT|SUM|AVG|MIN|MAX|COALESCE|CAST|OVER|RANK|ROW_NUMBER|CTE)\b/gi;
  const strings = /'[^']*'/g;
  const tokens: SqlToken[] = [];
  let remaining = code;

  while (remaining.length > 0) {
    // Check for string literal at start
    const strMatch = remaining.match(/^'[^']*'/);
    if (strMatch) {
      tokens.push({ text: strMatch[0], color: "#1868C7" });
      remaining = remaining.slice(strMatch[0].length);
      continue;
    }

    // Check for keyword at start
    const kwMatch = remaining.match(/^\b(INSERT|OVERWRITE|TABLE|PARTITION|SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|ON|AS|AND|OR|GROUP|BY|ORDER|HAVING|LIMIT|INTO|VALUES|UPDATE|DELETE|CREATE|DROP|ALTER|WITH|UNION|ALL|DISTINCT|CASE|WHEN|THEN|ELSE|END|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|COUNT|SUM|AVG|MIN|MAX|COALESCE|CAST|OVER|RANK|ROW_NUMBER|CTE)\b/i);
    if (kwMatch) {
      tokens.push({ text: kwMatch[0], color: "#E53737" });
      remaining = remaining.slice(kwMatch[0].length);
      continue;
    }

    // Find next keyword or string
    let nextKw = remaining.search(keywords);
    let nextStr = remaining.search(strings);
    if (nextKw === 0) nextKw = -1;
    if (nextStr === 0) nextStr = -1;

    let nextSpecial = -1;
    if (nextKw > 0 && nextStr > 0) nextSpecial = Math.min(nextKw, nextStr);
    else if (nextKw > 0) nextSpecial = nextKw;
    else if (nextStr > 0) nextSpecial = nextStr;

    if (nextSpecial > 0) {
      tokens.push({ text: remaining.slice(0, nextSpecial), color: T.primary });
      remaining = remaining.slice(nextSpecial);
    } else {
      tokens.push({ text: remaining, color: T.primary });
      break;
    }
  }

  return tokens;
}

function SqlCodeBlock({ title, code }: { title: string; code: string }) {
  const [expanded, setExpanded] = useState(true);
  const tokens = tokenizeSql(code);

  return (
    <div style={{
      width: "100%",
      overflow: "hidden",
      borderRadius: 16,
      border: "1.5px solid #E9ECF1",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        height: 44,
        padding: "0 10px 0 16px",
        background: "#F7F8FB",
      }}>
        <span style={{
          fontFamily: FONT, fontSize: 14, fontWeight: 600,
          lineHeight: "22px", color: T.primary,
          flex: 1, minWidth: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {title}
        </span>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {/* Copy button — exact SVG from design (38.svg) */}
          <div
            onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(code); }}
            style={{
              width: 28, height: 24, borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3.66602 11C3.66602 12.2896 4.71139 13.335 6.00098 13.335H10.501V14.665H6.00098C3.97685 14.665 2.33594 13.0241 2.33594 11V4.5H3.66602V11ZM10.334 1.33496C10.8371 1.33496 11.3138 1.56265 11.6299 1.9541L13.7959 4.63672C14.0351 4.93289 14.166 5.30292 14.166 5.68359V11C14.166 11.9196 13.4205 12.665 12.501 12.665H6.00098C5.08142 12.665 4.33594 11.9196 4.33594 11V3C4.33594 2.08045 5.08142 1.33496 6.00098 1.33496H10.334ZM6.00098 2.66504C5.81596 2.66504 5.66602 2.81498 5.66602 3V11C5.66602 11.185 5.81596 11.335 6.00098 11.335H12.501C12.686 11.335 12.8359 11.185 12.8359 11V6.16504H11.0869C10.4435 6.16504 9.92188 5.64341 9.92188 5V2.66504H6.00098ZM11.252 4.83496H12.2471L11.252 3.60254V4.83496Z" fill="rgba(0,0,0,0.5)" />
            </svg>
          </div>
          {/* Collapse/Expand chevron — exact SVG from design (39.svg) */}
          <div
            onClick={() => setExpanded((v) => !v)}
            style={{
              width: 28, height: 24, borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{
                transition: "transform 0.2s ease",
                transform: expanded ? "rotate(0deg)" : "rotate(180deg)",
              }}
            >
              <path d="M11.6668 10.6094L8.0001 6.94271L4.33343 10.6094L3.39063 9.66657L8.0001 5.05709L12.6096 9.66657L11.6668 10.6094Z" fill="rgba(0,0,0,0.5)" />
            </svg>
          </div>
        </div>
      </div>
      {/* Expandable Code body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              background: "#FFFFFF",
              padding: 16,
              maxHeight: 142,
              overflow: "auto",
            }}>
              <pre style={{
                margin: 0,
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 400,
                lineHeight: "22px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}>
                {tokens.map((tok, i) => (
                  <span key={i} style={{ color: tok.color }}>{tok.text}</span>
                ))}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Data Table ───────────────────────────────────────────────
interface TableData {
  headers: string[];
  rows: string[][];
}

function DataTable({ data }: { data: TableData }) {
  const colCount = data.headers.length;
  // First column narrow, rest equal
  const firstColWidth = 91;

  return (
    <div style={{
      width: "100%",
      overflow: "hidden",
      borderRadius: 16,
      border: "1.5px solid #E9ECF1",
    }}>
      {/* Header row */}
      <div style={{ display: "flex" }}>
        {data.headers.map((h, i) => (
          <div key={i} style={{
            ...(i === 0 ? { width: firstColWidth, flexShrink: 0 } : { flex: 1, minWidth: 0 }),
            height: 46,
            background: "#F7F8FB",
            borderRight: i < colCount - 1 ? "1px solid #E9ECF1" : undefined,
            borderBottom: "1px solid #E9ECF1",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
          }}>
            <span style={{
              fontFamily: FONT, fontSize: 14, fontWeight: 600,
              lineHeight: "22px", color: T.primary,
            }}>
              {h}
            </span>
          </div>
        ))}
      </div>
      {/* Data rows */}
      {data.rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex" }}>
          {row.map((cell, ci) => (
            <div key={ci} style={{
              ...(ci === 0 ? { width: firstColWidth, flexShrink: 0 } : { flex: 1, minWidth: 0 }),
              minHeight: 46,
              background: "#FFFFFF",
              borderRight: ci < colCount - 1 ? "1px solid #E9ECF1" : undefined,
              borderBottom: ri < data.rows.length - 1 ? "1px solid #E9ECF1" : undefined,
              display: "flex",
              alignItems: "flex-start",
              padding: "12px 16px",
            }}>
              <span style={{
                fontFamily: FONT, fontSize: 14, fontWeight: 400,
                lineHeight: "22px", color: T.primary,
                wordBreak: "break-word",
              }}>
                {cell}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Confirm Card (暖色底确认卡) ──────────────────────────────
interface ConfirmCardData {
  title: string;
  description: string;
  buttonText: string;
}

function ConfirmCard({ data, onConfirm }: { data: ConfirmCardData; onConfirm?: () => void }) {
  return (
    <div style={{
      width: "100%",
      background: "#FCF4E8",
      borderRadius: 24,
      padding: "16px 24px 24px",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{
          fontFamily: FONT, fontSize: 18, fontWeight: 600,
          lineHeight: "32px", color: T.primary,
        }}>
          {data.title}
        </span>
        <span style={{
          fontFamily: FONT, fontSize: 16, fontWeight: 400,
          lineHeight: "28px", color: T.primary,
          textAlign: "justify",
        }}>
          {data.description}
        </span>
      </div>
      <div style={{ marginTop: 16 }}>
        <button
          onClick={onConfirm}
          style={{
          height: 44,
          padding: "0 20px",
          background: "rgba(0,0,0,0.75)",
          borderRadius: 100,
          border: "none",
          boxShadow: "0px 2px 4px -2px rgba(0,0,0,0.20)",
          cursor: "pointer",
          fontFamily: FONT,
          fontSize: 14,
          fontWeight: 500,
          color: "#FFFFFF",
        }}>
          {data.buttonText}
        </button>
      </div>
    </div>
  );
}

// ── File type icon for inline artifact cards (from design 329_22983) ──
// md icon (3.svg): 26×26 tilted code file
const ARTIFACT_ICON_MD = "M13.254 2.79016L2.76172 5.60156L7.74399 24.1956L22.9573 20.1192L19.24 6.24619L13.254 2.79016ZM13.9534 8.4909L12.9343 4.68757L17.7567 7.4718L13.9534 8.4909ZM11.9774 18.7197L8.54046 16.7354L10.5248 13.2985L12.0403 14.1735L10.931 16.0948L12.8524 17.2041L11.9774 18.7197ZM15.0377 16.6185L16.147 14.6972L14.2256 13.5879L15.1006 12.0723L18.5375 14.0566L16.5532 17.4935L15.0377 16.6185Z";
// sql/png icon (5.svg): 26×26 tilted database
const ARTIFACT_ICON_DB: string[] = [
  "M18.5971 8.2319C17.0089 9.28055 14.7956 10.2279 12.3306 10.8884C9.86554 11.5489 7.47513 11.8351 5.57533 11.7211C4.81325 11.6753 4.06301 11.5616 3.39372 11.343L4.36867 14.9815C4.78558 16.5375 8.90758 16.7849 13.5754 15.5342C18.2432 14.2834 21.6893 12.0082 21.2724 10.4522L20.2974 6.81368C19.8271 7.33759 19.2342 7.81125 18.5971 8.2319Z",
  "M21.9952 13.1498C21.5248 13.6737 20.932 14.1474 20.2949 14.568C18.7066 15.6167 16.4934 16.564 14.0283 17.2245C11.5633 17.885 9.17289 18.1712 7.27309 18.0572C6.51102 18.0115 5.76078 17.8977 5.09149 17.6791L6.14338 21.6048C6.56029 23.1608 10.6823 23.4082 15.3501 22.1575C20.0179 20.9067 23.464 18.6315 23.0471 17.0755L23.0447 17.0668L21.9952 13.1498Z",
  "M11.8776 9.19803C7.20982 10.4488 3.08782 10.2014 2.6709 8.64541L2.67017 8.64266C2.25805 7.08678 5.70279 4.81346 10.3679 3.56346C13.8687 2.6254 17.0626 2.53006 18.6166 3.19743C19.1346 3.41989 19.4704 3.72709 19.5746 4.11608C19.9915 5.67202 16.5455 7.94729 11.8776 9.19803Z",
];

function InlineFileTypeIcon({ ext }: { ext: string }) {
  const isMd = ext === "md" || ext === "html";
  const paths = isMd ? [ARTIFACT_ICON_MD] : ARTIFACT_ICON_DB;

  return (
    <div style={{
      width: 56, height: 56, flexShrink: 0,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "#D9D9D9" }} />
      <div style={{
        position: "absolute", left: -0.47, top: 11,
        width: 42, height: 70,
        transform: "rotate(-15deg)", transformOrigin: "top left",
      }}>
        <div style={{ position: "relative", width: 42, height: 70 }}>
          <div style={{
            position: "absolute", width: 58.69, height: 78.49,
            left: 0, top: 0,
            borderRadius: 10.5,
            background: "linear-gradient(224deg, rgba(100,230,195,0.20) 0%, rgba(100,230,195,0) 100%), #FFFFFF",
            boxShadow: "0px 3.5px 3.5px -1.75px rgba(0,0,0,0.16)",
          }} />
          <svg viewBox="0 0 26 26" fill="none" style={{
            position: "absolute", left: 14.67, top: 19.62, width: 26, height: 26,
          }}>
            {paths.map((d, i) => <path key={i} d={d} fill="#D3D9E5" />)}
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Inline Artifact Card (内联制品卡 — 精准还原设计稿 329_22983) ──
interface ArtifactCardData {
  title: string;
  description: string;
  iconType: "md" | "sql" | "png" | "html";
}

function InlineArtifactCard({ artifact, onClick }: { artifact: ArtifactCardData; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 0,
        height: 64,
        background: "#F2F4F8",
        borderRadius: 16,
        outline: "0.5px solid #E6E9EF",
        outlineOffset: -0.5,
        overflow: "hidden",
        position: "relative",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* File icon — left:16 top:8 per Figma */}
      <div style={{ position: "absolute", left: 16, top: 4 }}>
        <InlineFileTypeIcon ext={artifact.iconType} />
      </div>
      {/* Text area — left:88 top:10 */}
      <div style={{
        position: "absolute", left: 88, top: 10,
        right: 40,
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        <span style={{
          fontFamily: FONT, fontSize: 14, fontWeight: 600,
          lineHeight: "22px", color: T.primary,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {artifact.title}
        </span>
        <span style={{
          fontFamily: FONT, fontSize: 12, fontWeight: 400,
          lineHeight: "20px", color: T.tertiary,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {artifact.description}
        </span>
      </div>
      {/* Arrow-right-up icon (2.svg from design) — filled, not stroke */}
      <div style={{ position: "absolute", right: 16, top: 24 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3.99219 11.0645L9.45378 5.60286L5.21114 5.60286L5.21114 4.26953L11.7299 4.26953V10.7883L10.3966 10.7883V6.54567L4.935 12.0073L3.99219 11.0645Z" fill="rgba(0,0,0,0.7)" />
        </svg>
      </div>
    </div>
  );
}

// ── Artifacts Section (制品展示区 — 精准还原设计稿 329_22983) ──
interface ArtifactsSectionData {
  count: number;
  items: ArtifactCardData[];
}

function ArtifactsSection({ data, onArtifactClick }: { data: ArtifactsSectionData; onArtifactClick?: () => void }) {
  const pageSize = 3; // 每页：1个全宽 + 2个半宽
  const totalPages = Math.ceil(data.items.length / pageSize);
  const [page, setPage] = useState(0);
  const start = page * pageSize;
  const pageItems = data.items.slice(start, start + pageSize);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Header — checkmark icon + text, h28 */}
      <div style={{ display: "flex", alignItems: "center", height: 28, gap: 4 }}>
        <div style={{ width: 16, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.9895 4.91937L6.91842 11.9904L2.67578 7.7478L3.61859 6.80499L6.91842 10.1048L13.0467 3.97656L13.9895 4.91937Z" fill="rgba(0,0,0,0.7)" />
          </svg>
        </div>
        <span style={{
          fontFamily: FONT, fontSize: 16, fontWeight: 400,
          lineHeight: "28px", color: T.primary,
        }}>
          任务产生制品 ({data.count})
        </span>
      </div>

      {/* Cards area — top: 40px from header top = marginTop 12 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
        {/* Full-width card */}
        {pageItems.length > 0 && (
          <InlineArtifactCard artifact={pageItems[0]} onClick={onArtifactClick} />
        )}
        {/* Two-column cards */}
        {pageItems.length > 1 && (
          <div style={{ display: "flex", gap: 12 }}>
            {pageItems.slice(1, 3).map((item, i) => (
              <InlineArtifactCard key={i} artifact={item} onClick={onArtifactClick} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination — design: top:188 = 180 + 8px gap */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 8 }}>
          {/* Left arrow */}
          <div
            onClick={() => page > 0 && setPage(page - 1)}
            style={{
              width: 24, height: 24, borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: page > 0 ? "pointer" : "default",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10.6109 11.6668L6.94421 8.0001L10.6109 4.33343L9.66807 3.39062L5.05859 8.0001L9.66807 12.6096L10.6109 11.6668Z"
                fill={page > 0 ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.3)"} />
            </svg>
          </div>
          {/* Page indicator */}
          <span style={{
            fontFamily: FONT, fontSize: 13, fontWeight: 600,
            lineHeight: "24px", color: T.secondary,
            minWidth: 23, textAlign: "center",
          }}>
            {page + 1}/{totalPages}
          </span>
          {/* Right arrow */}
          <div
            onClick={() => page < totalPages - 1 && setPage(page + 1)}
            style={{
              width: 24, height: 24, borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: page < totalPages - 1 ? "pointer" : "default",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5.39063 11.6668L9.05729 8.0001L5.39062 4.33343L6.33343 3.39062L10.9429 8.0001L6.33343 12.6096L5.39063 11.6668Z"
                fill={page < totalPages - 1 ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.3)"} />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Numbered heading (如 "1. 慢 SQL #1：56.5秒（最慢）") ─────
function NumberedHeading({ num, text }: { num: number; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
      <span style={{
        fontFamily: FONT, fontSize: 16, fontWeight: 600,
        lineHeight: "28px", color: T.primary,
        width: 20, flexShrink: 0,
      }}>
        {num}.
      </span>
      <span style={{
        fontFamily: FONT, fontSize: 16, fontWeight: 600,
        lineHeight: "28px", color: T.primary,
        marginLeft: 4,
      }}>
        {text}
      </span>
    </div>
  );
}

// ── Bold heading text ────────────────────────────────────────
function BoldText({ text }: { text: string }) {
  return (
    <span style={{
      fontFamily: FONT, fontSize: 16, fontWeight: 600,
      lineHeight: "28px", color: T.primary,
    }}>
      {text}
    </span>
  );
}

// ── Horizontal divider ──────────────────────────────────────
function Divider() {
  return (
    <div style={{
      width: "100%",
      height: 1,
      background: "#E6E9EF",
    }} />
  );
}

// ── Expert reply block ────────────────────────────────────────
export interface ExpertLine {
  icon?: "arrow" | "check";
  text: string;
  tags?: string[];
  // Rich content blocks (rendered after text)
  toolCalls?: (string | { title: string; command?: string; result?: string })[];
  sqlBlock?: { title: string; code: string };
  table?: TableData;
  confirmCard?: ConfirmCardData;
  artifacts?: ArtifactsSectionData;
  numberedHeading?: { num: number; text: string };
  boldText?: string;
  divider?: boolean;
}

export interface ExpertReplyData {
  icon: string;
  name: string;
  lines: ExpertLine[];
  delay?: number;
}

interface ExpertReplyProps extends ExpertReplyData {
  instant?: boolean;
  onAllLinesDone?: () => void;
  onArtifactClick?: () => void;
  onConfirm?: () => void;
  hideLabel?: boolean;
}

function ExpertReply({ icon, name, lines, delay = 0, instant = false, onAllLinesDone, onArtifactClick, onConfirm, hideLabel = false }: ExpertReplyProps) {
  const [visible, setVisible] = useState(instant);
  const [visibleLines, setVisibleLines] = useState(instant ? lines.length : 0);

  useEffect(() => {
    if (instant) {
      setVisible(true);
      setVisibleLines(lines.length);
      onAllLinesDone?.();
      return;
    }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, instant, lines.length]);

  const handleLineDone = () => {
    setVisibleLines((v) => {
      const next = v + 1;
      if (next >= lines.length) {
        onAllLinesDone?.();
      }
      return next;
    });
  };

  // Auto-start first line
  useEffect(() => {
    if (!instant && visible && visibleLines === 0) setVisibleLines(1);
  }, [visible, visibleLines, instant]);

  // Auto-advance lines that have no streamable text (empty text, only boldText/divider/heading/artifacts/confirmCard)
  useEffect(() => {
    if (instant || !visible || visibleLines === 0 || visibleLines > lines.length) return;
    const currentLine = lines[visibleLines - 1];
    if (!currentLine) return;
    // If line has no text to stream, auto-advance after a short delay
    if (!currentLine.text) {
      const t = setTimeout(handleLineDone, 80);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleLines, visible, instant, lines]);

  if (!visible) return null;

  return (
    <motion.div
      initial={instant ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: instant ? 0 : 0.4, ease: EASE }}
      style={{ display: "flex", flexDirection: "column", gap: 4 }}
    >
      {/* Expert label */}
      {!hideLabel && (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <img src={icon} alt="" style={{ width: 16, height: 16, flexShrink: 0 }} />
        <span style={{
          fontFamily: FONT, fontSize: 12, fontWeight: 400,
          color: T.tertiary, whiteSpace: "nowrap",
        }}>
          {name}
        </span>
      </div>
      )}

      {/* Lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lines.map((line, i) => {
          if (i >= visibleLines) return null;
          return (
            <motion.div
              key={i}
              initial={instant ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: instant ? 0 : 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              {/* Divider */}
              {line.divider && <Divider />}

              {/* Numbered heading */}
              {line.numberedHeading && (
                <NumberedHeading num={line.numberedHeading.num} text={line.numberedHeading.text} />
              )}

              {/* Bold text */}
              {line.boldText && <BoldText text={line.boldText} />}

              {/* Text line */}
              {line.text && (
                <span style={{
                  fontFamily: FONT, fontSize: 16, fontWeight: 400,
                  lineHeight: "28px", color: T.primary,
                  textAlign: "justify",
                  }}>
                    {instant ? line.text : (
                      <StreamText
                        text={line.text}
                        speed={25}
                        onDone={i === visibleLines - 1 && !line.toolCalls && !line.sqlBlock && !line.table ? handleLineDone : undefined}
                      />
                    )}
                  </span>
              )}

              {/* Tags */}
              {line.tags && line.tags.length > 0 && (
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 8,
                  paddingLeft: 0, paddingTop: 0, paddingBottom: 0,
                }}>
                  {line.tags.map((tag) => <TagPill key={tag} label={tag} />)}
                </div>
              )}

              {/* Tool calls */}
              {line.toolCalls && line.toolCalls.map((tc, ti) => {
                const title = typeof tc === "string" ? tc : tc.title;
                const content = typeof tc === "string" ? undefined : { command: tc.command, result: tc.result };
                return <ToolCallCard key={ti} title={title} content={content} />;
              })}

              {/* SQL code block */}
              {line.sqlBlock && (
                <SqlCodeBlock title={line.sqlBlock.title} code={line.sqlBlock.code} />
              )}

              {/* Data table */}
              {line.table && <DataTable data={line.table} />}

              {/* Confirm card */}
              {line.confirmCard && <ConfirmCard data={line.confirmCard} onConfirm={onConfirm} />}

              {/* Artifacts section */}
              {line.artifacts && <ArtifactsSection data={line.artifacts} onArtifactClick={onArtifactClick} />}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Dispatch transition text ──────────────────────────────────
function DispatchText({ delay = 0, instant = false }: { delay?: number; instant?: boolean }) {
  const [visible, setVisible] = useState(instant);
  useEffect(() => {
    if (instant) { setVisible(true); return; }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay, instant]);

  if (!visible) return null;

  return (
    <motion.div
      initial={instant ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: instant ? 0 : 0.35, ease: EASE }}
      style={{ display: "flex", alignItems: "center", gap: 0 }}
    >
      <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 400, lineHeight: "28px", color: T.tertiary }}>
        任务已分派，
      </span>
      <div style={{
        display: "inline-flex", alignItems: "center",
        height: 24, background: "#E9ECF1", borderRadius: 100,
        padding: "0 8px 0 4px", margin: "0 4px",
        verticalAlign: "middle",
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/icons/team-badge/2.svg" alt="" style={{ width: 16, height: 16 }} />
          <img src="/icons/team-badge/1.svg" alt="" style={{ width: 16, height: 16, marginLeft: -3.6 }} />
          <img src="/icons/team-badge/3.svg" alt="" style={{ width: 16, height: 16, marginLeft: -3.6 }} />
        </div>
        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 400, color: T.secondary, marginLeft: 2 }}>
          专家团
        </span>
      </div>
      <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 400, lineHeight: "28px", color: T.tertiary }}>
        开始协作执行
      </span>
    </motion.div>
  );
}

// ── Default replies data ──────────────────────────────────────
const DEFAULT_REPLIES: ExpertReplyData[] = [
  {
    icon: "/icons/expert/14.svg",
    name: "数据分析专家",
    delay: 1200,
    lines: [
      { text: "拉取数据表进行结构分析" },
      { text: "权限校验通过，数据合规性审查完成，已生成审计日志。" },
    ],
  },
  {
    icon: "/icons/expert/17.svg",
    name: "数据开发专家",
    delay: 3500,
    lines: [
      {
        text: "检查 HDFS 上该表华东区分区的数据完整性（7/7）",
        tags: ["dw_user_behavior", "ADS_Ad_Placement_Optimization", "DWS_Conversion_Funnel", "ADS_diagnostic_feed", "ADS_Marketing_feed"],
      },
      { text: "已调用\"指标 SQL Copilot\"自动生成聚合 SQL，提交 Spark 计算，分配 8 Executors。" },
    ],
  },
  {
    icon: "/icons/expert/25.svg",
    name: "数据分析专家",
    delay: 6500,
    lines: [
      {
        text: "根据自然语言需求 \"dau_wau_east_7d\" 自动生成聚合 SQL",
        tags: ["ADS_Ad_Placement_Optimization"],
      },
      { text: "提交到 Spark 集群，初始分配 8 个 Executors 执行计算" },
    ],
  },
  {
    icon: "/icons/expert/14.svg",
    name: "数据运维专家",
    delay: 9000,
    lines: [
      { text: "Spark 任务监控：Stage 1/3 完成，已处理 2.4GB 数据，Shuffle Write 860MB。" },
      { text: "资源利用率 78%，无 GC 压力，预计 3 分钟内完成全部计算。" },
      { text: "任务执行完毕，输出结果写入 ADS 层 ads_dau_wau_east_7d 表，共 7 条记录。", tags: ["ads_dau_wau_east_7d", "spark_job_2024041201"] },
    ],
  },
  {
    icon: "/icons/expert/25.svg",
    name: "数据分析专家",
    delay: 12000,
    lines: [
      { text: "趋势分析结果：近 7 天华东区 DAU 均值 124.5 万，WAU 382.7 万，DAU/WAU 比值 32.6%。" },
      { text: "环比变化：DAU 较上周同期 +3.2%，其中移动端增长 5.1%，PC 端下降 1.8%。" },
      { text: "已生成 DAU/WAU 趋势折线图 + 业务结论摘要，可在产物面板查看。" },
    ],
  },
  {
    icon: "/icons/expert/17.svg",
    name: "数据开发专家",
    delay: 15000,
    lines: [
      { text: "产出物归档完成：SQL 模板已沉淀至知识库，标签为「华东区、用户活跃、7日趋势」。" },
      { text: "定时任务已创建：每日 09:00 自动刷新数据并推送至运营周报看板。", tags: ["knowledge_base", "scheduled_task"] },
    ],
  },
];

// ── Main export ───────────────────────────────────────────────
interface ExpertRepliesProps {
  instant?: boolean;
  replies?: ExpertReplyData[];
  onComplete?: () => void;
  onArtifactClick?: () => void;
  onConfirm?: () => void;
  hideDispatch?: boolean;
}

export default function ExpertReplies({ instant = false, replies, onComplete, onArtifactClick, onConfirm, hideDispatch = false }: ExpertRepliesProps) {
  const data = replies ?? DEFAULT_REPLIES;
  const completedRef = React.useRef(false);

  // instant 模式下立即触发 onComplete
  useEffect(() => {
    if (instant && onComplete && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [instant, onComplete]);

  const handleReplyComplete = (index: number) => {
    // 当最后一个回复的所有行都完成时触发
    if (index === data.length - 1 && onComplete && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  };

  // 检测是否所有回复来自同一专家（单专家模式）
  const allSameExpert = data.length > 1 && data.every((r) => r.name === data[0].name);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 过渡文案 */}
      {!hideDispatch && <DispatchText delay={500} instant={instant} />}

      {/* 专家回复 */}
      {data.map((reply, i) => (
        <ExpertReply
          key={i}
          icon={reply.icon}
          name={reply.name}
          lines={reply.lines}
          delay={reply.delay}
          instant={instant}
          onAllLinesDone={() => handleReplyComplete(i)}
          onArtifactClick={onArtifactClick}
          onConfirm={onConfirm}
          hideLabel={allSameExpert && i > 0}
        />
      ))}
    </div>
  );
}

export type { ExpertReplyData as ExpertReplyDataType };
