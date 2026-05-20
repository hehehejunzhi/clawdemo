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
function StreamText({ text, speed = 30, onDone, cancelled = false }: { text: string; speed?: number; onDone?: () => void; cancelled?: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const doneRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    let i = 0;
    doneRef.current = false;
    setDisplayed("");
    const charsPerTick = speed <= 15 ? 3 : speed <= 25 ? 2 : 1;
    const interval = Math.max(16, speed);
    timerRef.current = setInterval(() => {
      i += charsPerTick;
      if (i >= text.length) {
        i = text.length;
        setDisplayed(text);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
      } else {
        setDisplayed(text.slice(0, i));
      }
    }, interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  // cancelled 变化时清除定时器，冻结当前输出
  useEffect(() => {
    if (cancelled && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [cancelled]);

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

// ── Skill Call Tag (icon + 文字，换行展示) ────────────────────
function SkillCallTag({ label }: { label: string }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      height: 28,
      gap: 4,
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M9.14404 1.77954C10.3702 0.553359 12.3592 0.553393 13.5854 1.77954C14.8116 3.00574 14.8116 4.99475 13.5854 6.22095L6.27295 13.5325C5.94873 13.8567 5.71264 14.0991 5.42725 14.2737C5.18997 14.4188 4.93104 14.5259 4.66064 14.5911C4.33525 14.6694 3.99644 14.6653 3.5376 14.6653H0.699707V11.8274C0.699707 11.3685 0.695579 11.0298 0.773926 10.7043C0.839087 10.4339 0.946177 10.175 1.09131 9.93774C1.26592 9.65235 1.50829 9.41626 1.83252 9.09204L9.14404 1.77954ZM12.8589 8.99438C12.9414 9.00224 13.0051 9.09803 13.1323 9.28931C13.4113 9.70893 13.5514 9.91888 13.729 10.0833C13.8535 10.1985 13.9914 10.2973 14.1411 10.3772C14.3546 10.4911 14.5988 10.5539 15.0864 10.6799C15.3091 10.7375 15.4211 10.7666 15.4556 10.842C15.4789 10.8933 15.4808 10.9573 15.4614 11.0217C15.4328 11.1166 15.3258 11.2132 15.1118 11.4055C14.643 11.8267 14.4087 12.0377 14.2075 12.2795C14.0665 12.4492 13.9377 12.6297 13.8237 12.8186C13.6612 13.0879 13.5387 13.3783 13.2944 13.9592C13.183 14.2243 13.1276 14.3571 13.0474 14.4153C12.9926 14.4549 12.9308 14.4744 12.8745 14.469C12.792 14.4611 12.7284 14.3645 12.6011 14.1731C12.3222 13.7536 12.183 13.5435 12.0054 13.3792C11.8808 13.2638 11.7421 13.1661 11.5923 13.0862C11.3788 12.9723 11.1348 12.9095 10.647 12.7834C10.4244 12.726 10.3134 12.6967 10.2788 12.6213C10.2553 12.5699 10.2525 12.5054 10.272 12.4407C10.3006 12.3459 10.4078 12.2499 10.6216 12.0579C11.0905 11.6366 11.3257 11.4257 11.5269 11.1838C11.6678 11.0143 11.7957 10.8335 11.9097 10.6448C12.0722 10.3754 12.1947 10.0843 12.439 9.50317C12.5504 9.23813 12.6068 9.10618 12.687 9.0481C12.7416 9.00857 12.8027 8.98913 12.8589 8.99438ZM2.77295 10.0325C2.40397 10.4015 2.29917 10.5126 2.22607 10.6321C2.15342 10.7509 2.09953 10.8805 2.06689 11.0159C2.03412 11.1521 2.02979 11.3052 2.02979 11.8274V13.3352H3.5376C4.05973 13.3352 4.21294 13.3309 4.34912 13.2981C4.4845 13.2655 4.6141 13.2116 4.73291 13.1389C4.85239 13.0658 4.96353 12.961 5.33252 12.592L6.42334 11.5002L3.86377 8.94067L2.77295 10.0325ZM12.644 2.72095C11.9372 2.01419 10.7922 2.01416 10.0854 2.72095L4.80518 7.99927L7.36475 10.5588L12.644 5.27954C13.3508 4.57274 13.3508 3.42775 12.644 2.72095ZM4.17725 1.13013C4.2377 1.13588 4.28428 1.20582 4.37744 1.34595C4.58192 1.6535 4.68477 1.80751 4.81494 1.92798C4.90611 2.01233 5.00714 2.08431 5.1167 2.14282C5.27318 2.22632 5.45248 2.27309 5.81006 2.36548C5.97293 2.40756 6.0542 2.42855 6.07959 2.48364C6.09682 2.52133 6.09875 2.56905 6.08447 2.61646C6.06332 2.68581 5.98497 2.75626 5.82861 2.89673C5.48494 3.20547 5.31296 3.36009 5.16553 3.53735C5.06212 3.66169 4.96785 3.79441 4.88428 3.93286C4.76523 4.13016 4.67553 4.34315 4.49658 4.7688C4.4149 4.96308 4.37376 5.06021 4.31494 5.10278C4.27496 5.13167 4.23009 5.14568 4.18896 5.14185C4.12846 5.13609 4.08112 5.06541 3.98779 4.92505C3.7836 4.61793 3.68131 4.46438 3.55127 4.34399C3.45996 4.25949 3.3583 4.18675 3.24854 4.12817C3.09218 4.04484 2.91334 3.99878 2.55615 3.90649C2.39313 3.86438 2.31101 3.84348 2.28564 3.78833C2.26841 3.75065 2.26746 3.70292 2.28174 3.65552C2.30277 3.58609 2.3811 3.51584 2.5376 3.37524C2.88121 3.06656 3.05327 2.91184 3.20068 2.73462C3.30411 2.61027 3.39835 2.47758 3.48193 2.33911C3.60103 2.14178 3.69065 1.92889 3.86963 1.50317C3.95135 1.3088 3.99244 1.21177 4.05127 1.16919C4.09132 1.14023 4.13605 1.12624 4.17725 1.13013Z" fill="rgba(0,0,0,0.9)" />
      </svg>
      <span style={{
        fontFamily: FONT, fontSize: 16, fontWeight: 400,
        lineHeight: "28px", color: T.primary,
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
              transform: expanded ? "rotate(0deg)" : "rotate(90deg)",
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
                transform: expanded ? "rotate(0deg)" : "rotate(90deg)",
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
export interface ConfirmCardData {
  title: string;
  description: string;
  buttonText: string;
  tag?: string;
}

export function ConfirmCard({ data, onConfirm }: { data: ConfirmCardData; onConfirm?: () => void }) {
  const [confirmed, setConfirmed] = React.useState(false);

  if (confirmed) return null;

  return (
    <div style={{
      width: "100%",
      background: "#FCF4E8",
      borderRadius: 24,
      padding: "16px 24px 24px",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{
            fontFamily: FONT, fontSize: 18, fontWeight: 600,
            lineHeight: "32px", color: T.primary,
          }}>
            {data.title}
          </span>
          {data.tag && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              height: 24, padding: "0 10px", borderRadius: 12,
              border: "none",
              background: "#FFDCBF",
              fontFamily: FONT, fontSize: 12, fontWeight: 400,
              color: "#C04100", whiteSpace: "nowrap", lineHeight: "24px",
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.7475 8.0385L12.362 5.6453C12.2133 5.3885 11.9371 4.9053 11.9371 4.9053C10.8649 3.0296 10.3605 2.4264 10.3605 2.4264C9.4396 1.3251 8.3233 1.3251 8.3233 1.3251C7.2071 1.3251 6.2862 2.4264 6.2862 2.4264C5.7818 3.0296 4.7095 4.9053 4.7095 4.9053C4.4333 5.3885 4.2847 5.6453 4.2847 5.6453L2.8991 8.0385C2.7495 8.2969 2.4661 8.7803 2.4661 8.7803C1.3704 10.649 1.0977 11.3887 1.0977 11.3887C0.5999 12.7394 1.1587 13.7086 1.1587 13.7086C1.7175 14.6778 3.1359 14.9238 3.1359 14.9238C3.9126 15.0584 6.0788 15.0464 6.0788 15.0464C6.6388 15.0433 6.9378 15.0433 6.9378 15.0433L9.7089 15.0433C10.0077 15.0433 10.5679 15.0464 10.5679 15.0464C12.7341 15.0584 13.5108 14.9238 13.5108 14.9238C14.9292 14.6778 15.488 13.7086 15.488 13.7086C16.0468 12.7394 15.549 11.3887 15.549 11.3887C15.2763 10.649 14.1806 8.7803 14.1806 8.7803C13.8972 8.2969 13.7475 8.0385 13.7475 8.0385ZM10.7796 5.567C11.0576 6.0535 11.2081 6.3133 11.2081 6.3133L12.5936 8.7065C12.7451 8.9682 13.0304 9.4548 13.0304 9.4548C14.0662 11.2213 14.2979 11.8498 14.2979 11.8498C14.5797 12.6145 14.3329 13.0426 14.3329 13.0426C14.086 13.4708 13.283 13.61 13.283 13.61C12.623 13.7244 10.5753 13.7131 10.5753 13.7131C10.0113 13.71 9.7089 13.71 9.7089 13.71L6.9378 13.71C6.6352 13.71 6.0714 13.7131 6.0714 13.7131C4.0237 13.7244 3.3636 13.61 3.3636 13.61C2.5607 13.4708 2.3138 13.0426 2.3138 13.0426C2.0669 12.6145 2.3488 11.8498 2.3488 11.8498C2.5804 11.2213 3.6162 9.4548 3.6162 9.4548C3.9016 8.9682 4.053 8.7065 4.053 8.7065L5.4386 6.3133C5.589 6.0536 5.8671 5.567 5.8671 5.567C6.8806 3.7941 7.3091 3.2817 7.3091 3.2817C7.8302 2.6584 8.3233 2.6584 8.3233 2.6584C8.8165 2.6584 9.3376 3.2817 9.3376 3.2817C9.7661 3.7941 10.7796 5.567 10.7796 5.567Z" fill="#C04100" fillRule="evenodd" transform="translate(-0.322266, -0.259766)"/>
                <path d="M0.4714 0.4714C0.6747 0.2795 0.6667 0 0.6667 0C0.6747 -0.2795 0.4714 -0.4714 0.4714 -0.4714C0.2795 -0.6747 0 -0.6667 0 -0.6667C-0.2795 -0.6747 -0.4714 -0.4714 -0.4714 -0.4714C-0.6747 -0.2795 -0.6667 0 -0.6667 0C-0.6747 0.2795 -0.4714 0.4714 -0.4714 0.4714C-0.2795 0.6747 0 0.6667 0 0.6667C0.2795 0.6747 0.4714 0.4714 0.4714 0.4714Z" fill="#C04100" fillRule="evenodd" transform="translate(8, 10.9733)"/>
                <path d="M2.8232 -0.6667L0 -0.6667C-0.2795 -0.6747 -0.4714 -0.4714 -0.4714 -0.4714C-0.6747 -0.2795 -0.6667 0 -0.6667 0C-0.6747 0.2795 -0.4714 0.4714 -0.4714 0.4714C-0.2795 0.6747 0 0.6667 0 0.6667L2.8232 0.6667C3.1027 0.6747 3.2946 0.4714 3.2946 0.4714C3.498 0.2795 3.4899 0 3.4899 0C3.498 -0.2795 3.2946 -0.4714 3.2946 -0.4714C3.1027 -0.6747 2.8232 -0.6667 2.8232 -0.6667Z" fill="#C04100" fillRule="evenodd" transform="matrix(0,1,-1,0,8.00195,6.14844)"/>
              </svg>
              {data.tag}
            </span>
          )}
        </div>
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
          onClick={() => { setConfirmed(true); onConfirm?.(); }}
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

// ── File type icon for inline artifact cards ──
function InlineFileTypeIcon({ ext }: { ext: string }) {
  const isMd = ext === "md" || ext === "html";
  const src = isMd ? "/agents/file-icon-markdown.png" : "/agents/file-icon-data.png";

  return (
    <img
      src={src}
      alt=""
      style={{
        width: 58,
        height: 58,
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}

// ── Inline Artifact Card (内联产物卡 — 精准还原设计稿 329_22983) ──
interface ArtifactCardData {
  title: string;
  description: string;
  iconType: "md" | "sql" | "png" | "html";
}

function InlineArtifactCard({ artifact, onClick }: { artifact: ArtifactCardData; onClick?: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1,
        minWidth: 0,
        height: 64,
        background: "#F2F4F8",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        border: "0.5px solid #E6E9EF",
        transition: "background 0.2s ease",
      }}
    >
      {/* File icon — 58x58 原始尺寸 */}
      <div style={{
        position: "absolute", left: 16, top: 3, width: 58, height: 58,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: hover ? "scale(1.06)" : "scale(1)",
        transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <InlineFileTypeIcon ext={artifact.iconType} />
      </div>
      {/* Text area — 从 left:88 开始 */}
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
      {/* Arrow-right-up icon */}
      <div style={{
        position: "absolute", right: 16, top: 24,
        transform: hover ? "translate(2px, -2px)" : "translate(0, 0)",
        transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3.99219 11.0645L9.45378 5.60286L5.21114 5.60286L5.21114 4.26953L11.7299 4.26953V10.7883L10.3966 10.7883V6.54567L4.935 12.0073L3.99219 11.0645Z" fill="rgba(0,0,0,0.7)" />
        </svg>
      </div>
    </div>
  );
}

// ── Artifacts Section (产物展示区 — 精准还原设计稿 329_22983) ──
interface ArtifactsSectionData {
  count: number;
  items: ArtifactCardData[];
}

function ArtifactsSection({ data, onArtifactClick }: { data: ArtifactsSectionData; onArtifactClick?: () => void }) {
  // 每页 2 张，两列并排
  const pageSize = 2;
  const totalPages = Math.ceil(data.items.length / pageSize);
  const [page, setPage] = useState(0);

  const start = page * pageSize;
  const pageItems = data.items.slice(start, start + pageSize);
  // 将当前页 items 分成两列一行
  const pageRows: ArtifactCardData[][] = [];
  for (let i = 0; i < pageItems.length; i += 2) {
    pageRows.push(pageItems.slice(i, i + 2));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Header — checkmark icon + "任务产生制品 (N)" */}
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

      {/* Cards area — 全部两列并排 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
        {pageRows.map((row, ri) => (
          <div key={ri} style={{ display: "flex", gap: 12 }}>
            {row.map((item, ci) => (
              <InlineArtifactCard key={ci} artifact={item} onClick={onArtifactClick} />
            ))}
            {row.length === 1 && <div style={{ flex: 1 }} />}
          </div>
        ))}
      </div>

      {/* Pagination */}
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
  /** Tags rendered inline after the text (same line) */
  inlineTags?: string[];
  /** Skill 调用标签 — icon + 文字，换行展示 */
  skillCalls?: string[];
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
  /** 概述文字 — 显示在标题行下方（tertiary 色），不传则不提取第一行 */
  overview?: string;
  /** Show a horizontal divider before this expert reply block */
  dividerBefore?: boolean;
  /** Hide the expert name label for this reply block */
  hideLabel?: boolean;
}

interface ExpertReplyProps extends ExpertReplyData {
  instant?: boolean;
  onAllLinesDone?: () => void;
  onArtifactClick?: () => void;
  onConfirm?: () => void;
  onConfirmCardReady?: (data: ConfirmCardData) => void;
  hideLabel?: boolean;
  cancelled?: boolean;
  dividerBefore?: boolean;
  overview?: string;
}

function ExpertReply({ icon, name, lines, delay = 0, instant = false, onAllLinesDone, onArtifactClick, onConfirm, onConfirmCardReady, hideLabel = false, cancelled = false, dividerBefore = false, overview }: ExpertReplyProps) {
  const [visible, setVisible] = useState(instant);
  const [visibleLines, setVisibleLines] = useState(instant ? lines.length : 0);

  useEffect(() => {
    if (instant) {
      setVisible(true);
      setVisibleLines(lines.length);
      setTimeout(() => onAllLinesDone?.(), 0);
      return;
    }
    if (cancelled) return; // 取消后不再延迟显示
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, instant, lines.length, cancelled]);

  const handleLineDone = () => {
    if (cancelled) return; // 取消后不再推进行
    setVisibleLines((v) => {
      const next = v + 1;
      if (next >= lines.length) {
        setTimeout(() => onAllLinesDone?.(), 0);
      }
      return next;
    });
  };

  // Auto-start first line
  useEffect(() => {
    if (!instant && visible && visibleLines === 0 && !cancelled) setVisibleLines(1);
  }, [visible, visibleLines, instant, cancelled]);

  // Auto-advance lines that have no streamable text (empty text, only boldText/divider/heading/artifacts/confirmCard)
  useEffect(() => {
    if (instant || !visible || visibleLines === 0 || visibleLines > lines.length || cancelled) return;
    const currentLine = lines[visibleLines - 1];
    if (!currentLine) return;
    // If line has no text to stream, auto-advance after a short delay
    if (!currentLine.text) {
      const t = setTimeout(handleLineDone, 80);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleLines, visible, instant, lines, cancelled]);

  if (!visible) return null;

  // 是否有显式概述
  const hasOverview = !hideLabel && !!overview;

  return (
    <motion.div
      initial={instant ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: instant ? 0 : 0.4, ease: EASE }}
      style={{ display: "flex", flexDirection: "column", gap: 0 }}
    >
      {/* 分割线 — 在当前回复块顶部，上方无额外间距（gap:32已提供），下方32px到内容 */}
      {dividerBefore && (
        <div style={{ width: "100%", height: 1, background: "#E6E9EF", marginBottom: 32 }} />
      )}

      {/* 标题行：头像 + 角色名 + 概述（gap:2px） */}
      {!hideLabel && (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <img src={icon} alt="" style={{ width: 16, height: 16, flexShrink: 0 }} />
          <span style={{
            fontFamily: FONT, fontSize: 12, fontWeight: 400,
            color: T.tertiary, whiteSpace: "nowrap",
          }}>
            {name}
          </span>
        </div>
        {/* 概述行 — 显式 overview 字段，tertiary 色 */}
        {hasOverview && (
          <span style={{
            fontFamily: FONT, fontSize: 16, fontWeight: 400,
            lineHeight: "28px", color: T.tertiary, textAlign: "justify",
          }}>
            {instant ? overview : (
              <StreamText text={overview} speed={25} cancelled={cancelled} />
            )}
          </span>
        )}
      </div>
      )}

      {/* 详情内容 — 标题行到详情 12px, 内容元素间 12px */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: !hideLabel ? 12 : 0 }}>
        {lines.map((line, i) => {
          if (i >= visibleLines) return null;
          return (
            <motion.div
              key={i}
              initial={instant ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: instant ? 0 : 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {/* Divider — 上下各 32px 间距（减去容器 gap 12px） */}
              {line.divider && (
                <div style={{ margin: "20px 0" }}>
                  <Divider />
                </div>
              )}

              {/* Numbered heading */}
              {line.numberedHeading && (
                <NumberedHeading num={line.numberedHeading.num} text={line.numberedHeading.text} />
              )}

              {/* Bold text */}
              {line.boldText && <BoldText text={line.boldText} />}

              {/* Text line with optional inline tags + skill calls (一组, gap:8px) */}
              {line.text && (
                <div style={{ display: "flex", flexDirection: "column", gap: line.skillCalls ? 8 : 0 }}>
                  <div style={{
                    display: "flex",
                    alignItems: "baseline",
                    flexWrap: "wrap",
                    gap: 4,
                  }}>
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
                            cancelled={cancelled}
                          />
                        )}
                      </span>
                    {line.inlineTags && line.inlineTags.map((tag) => (
                      <TagPill key={tag} label={tag} />
                    ))}
                  </div>
                  {/* Skill calls — icon + 文字，换行展示，与文案一组 */}
                  {line.skillCalls && line.skillCalls.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {line.skillCalls.map((skill) => (
                        <SkillCallTag key={skill} label={skill} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tags — icon + 文字样式 */}
              {line.tags && line.tags.length > 0 && (
                <div style={{
                  display: "flex", flexDirection: "column", gap: 4,
                }}>
                  {line.tags.map((tag) => <SkillCallTag key={tag} label={tag} />)}
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

              {/* Confirm card — 不在对话流中渲染，由 page.tsx 在输入框上方渲染 */}

              {/* Artifacts section — 上间距 32px (产物区与前文), 下间距由容器 gap 控制 */}
              {line.artifacts && (
                <div style={{ marginTop: 20 }}>
                  <ArtifactsSection data={line.artifacts} onArtifactClick={onArtifactClick} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Expert stack avatars (3 overlapping circular avatars) ─────
export function ExpertStackAvatars({ size = 16, overlap = 6 }: { size?: number; overlap?: number }) {
  const avatars = [
    "/agents/dev-expert.png",
    "/agents/analysis-expert.png",
    "/agents/ops-expert.png",
  ];
  return (
    <div style={{ display: "inline-flex", alignItems: "center" }}>
      {avatars.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0 0 0 1.5px #E9ECF1",
            marginLeft: i === 0 ? 0 : -overlap,
            position: "relative",
            zIndex: avatars.length - i,
            background: "#FFFFFF",
          }}
        />
      ))}
    </div>
  );
}

// ── Dispatch transition text ──────────────────────────────────
export function DispatchText({ delay = 0, instant = false }: { delay?: number; instant?: boolean }) {
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
        <ExpertStackAvatars size={16} overlap={2} />
        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 400, color: T.secondary, marginLeft: 4 }}>
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
    icon: "/agents/analysis-expert.png",
    name: "数据分析专家",
    delay: 1200,
    lines: [
      { text: "拉取数据表进行结构分析" },
      { text: "权限校验通过，数据合规性审查完成，已生成审计日志。" },
    ],
  },
  {
    icon: "/agents/dev-expert.png",
    name: "数据工程专家",
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
    icon: "/agents/ops-expert.png",
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
    icon: "/agents/analysis-expert.png",
    name: "智能管家",
    delay: 9000,
    lines: [
      { text: "Spark 任务监控：Stage 1/3 完成，已处理 2.4GB 数据，Shuffle Write 860MB。" },
      { text: "资源利用率 78%，无 GC 压力，预计 3 分钟内完成全部计算。" },
      { text: "任务执行完毕，输出结果写入 ADS 层 ads_dau_wau_east_7d 表，共 7 条记录。", tags: ["ads_dau_wau_east_7d", "spark_job_2024041201"] },
    ],
  },
  {
    icon: "/agents/ops-expert.png",
    name: "数据分析专家",
    delay: 12000,
    lines: [
      { text: "趋势分析结果：近 7 天华东区 DAU 均值 124.5 万，WAU 382.7 万，DAU/WAU 比值 32.6%。" },
      { text: "环比变化：DAU 较上周同期 +3.2%，其中移动端增长 5.1%，PC 端下降 1.8%。" },
      { text: "已生成 DAU/WAU 趋势折线图 + 业务结论摘要，可在产物面板查看。" },
    ],
  },
  {
    icon: "/agents/dev-expert.png",
    name: "数据工程专家",
    delay: 15000,
    lines: [
      { text: "产出物归档完成：SQL 模板已沉淀至知识库，标签为「华东区、用户活跃、7 日趋势」。" },
      { text: "定时任务已创建：每日 09:00 自动刷新数据并推送至运营周报看板。", tags: ["knowledge_base", "scheduled_task"] },
    ],
  },
];

// ── Cancelable Reply Wrapper ───────────────────────────────────
// 包裹每个 ExpertReply，取消时若还没到达 delay（未开始显示），则不渲染外层 div 避免累积空白
function CancelableReplyWrapper({
  children,
  topSpacing,
  delay,
  cancelled,
  instant,
}: {
  children: React.ReactNode;
  topSpacing: number;
  delay: number;
  cancelled: boolean;
  instant: boolean;
}) {
  const [reached, setReached] = useState(instant || delay === 0);

  useEffect(() => {
    if (instant || reached) return;
    const t = setTimeout(() => setReached(true), delay);
    return () => clearTimeout(t);
  }, [instant, reached, delay]);

  // 取消时，如果还没到达 delay，直接不渲染（含外层 div）避免空白
  if (cancelled && !reached) return null;

  return <div style={{ marginTop: topSpacing }}>{children}</div>;
}

// ── Main export ───────────────────────────────────────────────
interface ExpertRepliesProps {
  instant?: boolean;
  replies?: ExpertReplyData[];
  onComplete?: () => void;
  onArtifactClick?: () => void;
  onConfirm?: () => void;
  onConfirmCardReady?: (data: ConfirmCardData) => void;
  hideDispatch?: boolean;
  /** 取消对话流，冻结所有输出 */
  cancelled?: boolean;
}

export default function ExpertReplies({ instant = false, replies, onComplete, onArtifactClick, onConfirm, onConfirmCardReady, hideDispatch = false, cancelled = false }: ExpertRepliesProps) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* 过渡文案 */}
      {!hideDispatch && <DispatchText delay={500} instant={instant} />}

      {/* 专家回复 */}
      {data.map((reply, i) => {
        // 有 overview 的回复强制显示头像+概述，不自动 hideLabel
        const isHiddenLabel = reply.hideLabel || (allSameExpert && i > 0 && !reply.overview);
        // 第一个元素的 marginTop 取决于是否有 DispatchText
        const isFirst = i === 0;
        const topSpacing = isFirst && !hideDispatch ? 32
          : isFirst ? 0
          : isHiddenLabel && !reply.dividerBefore ? 12
          : 32;
        return (
        <CancelableReplyWrapper
          key={i}
          topSpacing={topSpacing}
          delay={reply.delay ?? 0}
          cancelled={cancelled}
          instant={instant}
        >
          <ExpertReply
            icon={reply.icon}
            name={reply.name}
            lines={reply.lines}
            delay={reply.delay}
            instant={instant}
            onAllLinesDone={() => handleReplyComplete(i)}
            onArtifactClick={onArtifactClick}
            onConfirm={onConfirm}
            onConfirmCardReady={onConfirmCardReady}
            hideLabel={isHiddenLabel}
            cancelled={cancelled}
            dividerBefore={reply.dividerBefore}
            overview={reply.overview}
          />
        </CancelableReplyWrapper>
        );
      })}
    </div>
  );
}

export type { ExpertReplyData as ExpertReplyDataType };
