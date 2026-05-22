"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SkillDetailModal, PillTabs, type SkillDetail } from "@/components/ui/skill-plaza";
import { IconAiNewChat } from "@/components/ui/wedata-icons";
import type { BuiltinExpert } from "@/lib/agent-registry";

// ── Design tokens ──────────────────────────────────────────────
const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const C = {
  pageBg: "#F8F9FB",
  cardBg: "#FFFFFF",
  border: "rgba(0,0,0,0.06)",
  borderLight: "#EEF0F4",
  textPrimary: "rgba(0,0,0,0.9)",
  textSecondary: "rgba(0,0,0,0.7)",
  textTertiary: "rgba(0,0,0,0.5)",
  textQuaternary: "rgba(0,0,0,0.35)",
  textDisabled: "rgba(0,0,0,0.3)",
  brand: "#00B6C3",
  brandLight: "#E6F7F9",
  green: "#00B96B",
  greenLight: "#C8EFD7",
  greenSoft: "#E8F7EE",
  greenFaint: "#F4FBF6",
  orange: "#FF7A00",
  hoverBg: "#F4F5F8",
  chipBg: "#F2F4F7",
  chipBgWarm: "#FFF6E8",
  chipBgGreen: "#EAF7EF",
  chipBgBlue: "#E8F1FE",
  titlebarBg: "#F9FAFC",
} as const;

// ── 公共小组件 ────────────────────────────────────────────────

function Card({ title, extra, children, style }: { title?: string; extra?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {(title || extra) && (
        <header style={{
          height: 32,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 4px",
        }}>
          {title && <h3 style={{
            margin: 0, fontFamily: FONT, fontSize: 14, fontWeight: 600,
            lineHeight: "22px", color: C.textPrimary,
          }}>{title}</h3>}
          {extra}
        </header>
      )}
      <section style={{
        background: C.cardBg,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 20,
        ...style,
      }}>
        {children}
      </section>
    </div>
  );
}

// ── 极简 Markdown 渲染器（零依赖） ───────────────────────────
// 支持：#~### 标题、空行分段、- / *  无序列表、1. 有序列表、**粗体**、
//      *斜体*、`行内代码`、[link](url)
function renderInline(line: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // 顺序很重要：先处理 code（保护其中字符），再处理 link / bold / italic
  const regex = /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(line)) !== null) {
    if (m.index > lastIdx) nodes.push(line.slice(lastIdx, m.index));
    const token = m[0];
    const k = `${keyPrefix}-${i++}`;
    if (token.startsWith("`")) {
      nodes.push(
        <code key={k} style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "0.92em",
          padding: "1px 4px",
          borderRadius: 3,
          background: "rgba(0,0,0,0.05)",
        }}>{token.slice(1, -1)}</code>
      );
    } else if (token.startsWith("[")) {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (lm) {
        nodes.push(
          <a key={k} href={lm[2]} target="_blank" rel="noreferrer"
            style={{ color: "#2873FF", textDecoration: "none" }}>{lm[1]}</a>
        );
      }
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={k} style={{ fontWeight: 600 }}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={k}>{token.slice(1, -1)}</em>);
    }
    lastIdx = m.index + token.length;
  }
  if (lastIdx < line.length) nodes.push(line.slice(lastIdx));
  return nodes;
}

export function SimpleMarkdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let bk = 0;
  while (i < lines.length) {
    const line = lines[i];

    // 跳过空行
    if (!line.trim()) { i++; continue; }

    // 标题
    const hm = /^(#{1,3})\s+(.*)$/.exec(line);
    if (hm) {
      const lv = hm[1].length;
      const size = lv === 1 ? 16 : lv === 2 ? 14 : 13;
      const weight = 600;
      const tag: "h1" | "h2" | "h3" = lv === 1 ? "h1" : lv === 2 ? "h2" : "h3";
      blocks.push(
        React.createElement(tag, {
          key: `b${bk++}`,
          style: {
            margin: "12px 0 6px", fontFamily: FONT, fontSize: size,
            fontWeight: weight, lineHeight: "22px", color: "rgba(0,0,0,0.9)",
          },
        }, renderInline(hm[2], `h${bk}`))
      );
      i++;
      continue;
    }

    // 无序列表
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={`b${bk++}`} style={{
          margin: "4px 0", paddingLeft: 18,
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {items.map((it, idx) => (
            <li key={idx} style={{
              fontFamily: FONT, fontSize: 13, fontWeight: 400,
              lineHeight: "22px", color: "rgba(0,0,0,0.9)",
            }}>{renderInline(it, `ul${bk}-${idx}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // 有序列表
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={`b${bk++}`} style={{
          margin: "4px 0", paddingLeft: 22,
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {items.map((it, idx) => (
            <li key={idx} style={{
              fontFamily: FONT, fontSize: 13, fontWeight: 400,
              lineHeight: "22px", color: "rgba(0,0,0,0.9)",
            }}>{renderInline(it, `ol${bk}-${idx}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // 段落（合并相邻非空非块行）
    const para: string[] = [line];
    i++;
    while (i < lines.length
      && lines[i].trim()
      && !/^(#{1,3}\s+|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={`b${bk++}`} style={{
        margin: "0 0 8px", fontFamily: FONT, fontSize: 13, fontWeight: 400,
        lineHeight: "22px", color: "rgba(0,0,0,0.9)",
      }}>{renderInline(para.join(" "), `p${bk}`)}</p>
    );
  }
  return <>{blocks}</>;
}

function Chip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "warm" | "green" | "blue" }) {
  const bg = tone === "warm" ? C.chipBgWarm
    : tone === "green" ? C.chipBgGreen
    : tone === "blue" ? C.chipBgBlue
    : C.chipBg;
  const color = tone === "warm" ? "#B86A00"
    : tone === "green" ? "#0E8A4A"
    : tone === "blue" ? "#2873FF"
    : C.textTertiary;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      height: 22, padding: "0 8px", borderRadius: 11,
      background: bg, color, fontFamily: FONT, fontSize: 12,
      fontWeight: 500, lineHeight: "22px", whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

// ── 雷达图（5 维） ────────────────────────────────────────────
const RADAR_AXES = ["ETL处理", "智能分析", "数据查询", "预测能力", "决策支持"] as const;

export interface RadarValues {
  /** 0–100 五维数据 */
  values: [number, number, number, number, number];
}

function Radar({ values, size = 220, color = C.brand, gradient }: { values: number[]; size?: number; color?: string; gradient?: { from: string; to: string } }) {
  const cx = size / 2;
  const cy = size / 2;
  // 把 r 控制小一些，让 1.18×r 的标签也能完整落在 viewBox 内
  const r = size * 0.32;
  const n = RADAR_AXES.length;
  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

  const pointAt = (i: number, k: number) => {
    const a = angleFor(i);
    return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k] as const;
  };

  const polygonPoints = (k: number) =>
    Array.from({ length: n }, (_, i) => pointAt(i, k).join(",")).join(" ");

  const dataPoints = values
    .map((v, i) => pointAt(i, Math.max(0, Math.min(1, v / 100))).join(","))
    .join(" ");

  // 渐变 id（每个雷达独立，避免多实例冲突）
  const gradientId = React.useId();

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {gradient && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradient.from} />
            <stop offset="100%" stopColor={gradient.to} />
          </linearGradient>
        </defs>
      )}
      {/* 同心多边形 */}
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon
          key={k}
          points={polygonPoints(k)}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={1}
        />
      ))}
      {/* 轴线（径向）：从最外圈连到第二圈（即跳过最内圈五边形以内的部分） */}
      {Array.from({ length: n }, (_, i) => {
        const [x1, y1] = pointAt(i, 1);
        const [x2, y2] = pointAt(i, 0.25);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,0,0,0.06)" strokeWidth={1} />;
      })}
      {/* 数据多边形 */}
      <polygon
        points={dataPoints}
        fill={gradient ? `url(#${gradientId})` : color}
        fillOpacity={0.22}
        stroke={gradient ? `url(#${gradientId})` : color}
        strokeWidth={1.5}
      />
      {/* 顶点不再渲染圆点 */}
      {/* 轴标签：按角度自动决定 anchor / baseline，保证文字始终朝远离圆心方向延伸 */}
      {RADAR_AXES.map((label, i) => {
        const a = angleFor(i);
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        // 标签锚点距离圆心 1.25 r
        const baseK = 1.25;
        const [x, y] = pointAt(i, baseK);
        // 水平 anchor：靠右的轴文字 start、靠左的轴 end、近垂直 middle
        const eps = 0.2;
        const anchor: "start" | "middle" | "end" =
          cosA > eps ? "start" : cosA < -eps ? "end" : "middle";
        // 垂直 baseline：靠上 auto（让文字底部贴合 y）、靠下 hanging、近水平 middle
        const baseline: "auto" | "middle" | "hanging" =
          sinA < -eps ? "auto" : sinA > eps ? "hanging" : "middle";
        // 单条轴的额外像素微调（按 RADAR_AXES 索引：0 ETL处理 / 1 智能分析 / 2 数据查询 / 3 预测能力 / 4 决策支持）
        const PER_AXIS_OFFSET: Array<[number, number]> = [
          [0, 10],    // ETL处理：下 10
          [-20, 0],   // 智能分析：左 20
          [-10, -10], // 数据查询：左 10、上 10
          [10, -10],  // 预测能力：右 10、上 10
          [20, 0],    // 决策支持：右 20
        ];
        const [ox, oy] = PER_AXIS_OFFSET[i] ?? [0, 0];
        return (
          <text
            key={label}
            x={x + ox}
            y={y + oy}
            fontSize={12}
            fontWeight={500}
            fontFamily={FONT}
            fill={C.textTertiary}
            textAnchor={anchor}
            dominantBaseline={baseline}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ── KPI（4 KPI 横向） ─────────────────────────────────────────
function KPIGroup({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
      {items.map((it, i) => (
        <div key={i} style={{
          flex: 1, padding: "0 20px 0 0",
        }}>
          <div style={{
            fontFamily: "'GeomMedium', 'Geom', var(--font-geist-sans), 'PingFang SC', sans-serif",
            fontSize: 20, fontWeight: 500,
            lineHeight: "28px", color: C.textPrimary,
            fontFeatureSettings: '"tnum"',
          }}>{it.value}</div>
          <div style={{
            marginTop: 2, fontFamily: FONT, fontSize: 13, fontWeight: 400,
            lineHeight: "20px", color: C.textTertiary,
          }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── 热力图（GitHub 风格 contribution graph） ─────────────────
const HEATMAP_WEEKS = 52;
const HEATMAP_DAYS = 7;
const HEATMAP_LEVELS = [
  "#EEF2F5", // 0 不活跃
  C.greenFaint,
  C.greenSoft,
  C.greenLight,
  C.green,
] as const;

const MONTH_LABELS = ["8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月"];
const DAY_LABELS = ["", "周二", "", "周四", "", "周六", ""];

function Heatmap() {
  // 活跃度档位文案（与 HEATMAP_LEVELS 索引对齐）
  const LEVEL_DESC = ["不活跃", "轻度活跃", "活跃", "高度活跃", "极度活跃"] as const;

  // 用确定性伪随机生成数据；同时算出每个 cell 对应的日期 & 活动数
  // 起点：今天往前 (HEATMAP_WEEKS * 7 - 1) 天；逐日填入
  const today = React.useMemo(() => new Date(2026, 4, 19), []); // 与项目当前时间一致，避免每次重算
  const cells: { level: number; alert?: boolean; date: Date; events: number }[][] = [];
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    const col: { level: number; alert?: boolean; date: Date; events: number }[] = [];
    for (let d = 0; d < HEATMAP_DAYS; d++) {
      const seed = (w * 7 + d) * 9301 + 49297;
      const rnd = ((seed % 233280) / 233280);
      let level = 0;
      if (rnd < 0.12) level = 0;
      else if (rnd < 0.4) level = 1;
      else if (rnd < 0.7) level = 2;
      else if (rnd < 0.92) level = 3;
      else level = 4;
      const alert = (rnd > 0.985);
      // 大致活动数：level 0 → 0；其他按等级 + 随机
      const events = level === 0 ? 0 : Math.floor(level * 3 + rnd * 8);
      const daysAgo = (HEATMAP_WEEKS - 1 - w) * 7 + (HEATMAP_DAYS - 1 - d);
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      col.push({ level, alert, date, events });
    }
    cells.push(col);
  }

  // ── 宽度自适应（仅放大，不缩小）─────────────────────────────
  // 首次/最大可用宽度决定 cell 尺寸；后续窗口变窄时 cell 保持锁定值，
  // 由外层 overflow-x:auto 让网格在卡片内横向滚动。
  const containerRef = React.useRef<HTMLDivElement>(null);
  const maxWidthRef = React.useRef<number>(0);
  const LABEL_W = 28;      // 周几标签列宽
  const LABEL_GAP = 6;     // 标签列与网格列的间距
  const GAP = 3;           // 单元格 row/column gap
  const CELL_MIN = 10;
  const CELL_MAX = 80;     // 上限兜底（足以覆盖 1920+ 宽屏）
  const [cell, setCell] = React.useState<number>(16);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const compute = () => {
      const w = el.clientWidth;
      // 只在容器变得更宽时，才放大 cell；窗口变窄保持锁定值
      if (w > maxWidthRef.current) {
        maxWidthRef.current = w;
        const drawable = w - LABEL_W - LABEL_GAP;
        const next = (drawable - 51 * GAP) / HEATMAP_WEEKS;
        const clamped = Math.max(CELL_MIN, Math.min(CELL_MAX, next));
        setCell(clamped);
      }
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const CELL = cell;
  // 内部网格区域的最小宽度：保证大屏锁定后即便容器变窄也撑得开（触发滚动）
  const gridInnerWidth = LABEL_W + LABEL_GAP + HEATMAP_WEEKS * CELL + (HEATMAP_WEEKS - 1) * GAP;

  // ── Tooltip 状态 ────────────────────────────────────────────
  const [hover, setHover] = React.useState<
    | { x: number; y: number; date: Date; events: number; level: number; alert?: boolean }
    | null
  >(null);

  const fmtDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {/* 横向滚动容器：仅包裹月份标签 + 7×52 网格，图例固定在外 */}
      <div style={{
        overflowX: "auto",
        // 隐藏滚动条视觉上更干净，但保留滚动能力
        scrollbarWidth: "thin",
      }}>
        <div style={{ minWidth: gridInnerWidth, display: "flex", flexDirection: "column", gap: 6 }}>
          {/* 月份标签 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `${LABEL_W}px repeat(${HEATMAP_WEEKS}, ${CELL + GAP}px)`,
            fontFamily: FONT, fontSize: 11, color: C.textTertiary, lineHeight: "16px",
          }}>
            <div />
            {Array.from({ length: HEATMAP_WEEKS }, (_, w) => {
              const monthIdx = Math.floor((w / HEATMAP_WEEKS) * MONTH_LABELS.length);
              const showLabel = w % 4 === 2 && monthIdx < MONTH_LABELS.length;
              return (
                <div key={w} style={{
                  width: CELL + GAP,
                  whiteSpace: "nowrap",
                  overflow: "visible",
                }}>
                  {showLabel ? MONTH_LABELS[monthIdx] : ""}
                </div>
              );
            })}
          </div>
          {/* 7 行 × 52 列网格 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `${LABEL_W}px 1fr`,
            gap: LABEL_GAP,
          }}>
            {/* 周几标签列 */}
            <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
              {DAY_LABELS.map((d, i) => (
                <div key={i} style={{
                  height: CELL, fontFamily: FONT, fontSize: 11,
                  lineHeight: `${CELL}px`, color: C.textTertiary,
                }}>{d}</div>
              ))}
            </div>
            {/* 网格 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${HEATMAP_WEEKS}, ${CELL}px)`,
              gridTemplateRows: `repeat(${HEATMAP_DAYS}, ${CELL}px)`,
              gridAutoFlow: "column",
              columnGap: GAP, rowGap: GAP,
            }}>
              {cells.flat().map((c, idx) => (
                <div
                  key={idx}
                  onMouseEnter={(e) => {
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    setHover({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                      date: c.date,
                      events: c.events,
                      level: c.level,
                      alert: c.alert,
                    });
                  }}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    width: CELL, height: CELL, borderRadius: 2,
                    background: c.alert ? C.orange : HEATMAP_LEVELS[c.level],
                    cursor: "pointer",
                    outline: "1px solid transparent",
                    transition: "outline-color 100ms",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginTop: 6,
        marginLeft: "auto",
        fontFamily: FONT, fontSize: 12, color: C.textTertiary,
      }}>
        <span>不活跃</span>
        {HEATMAP_LEVELS.slice(0, 4).map((color, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: color }} />
        ))}
        <span>活跃</span>
        <div style={{ width: 12, height: 12, borderRadius: 2, background: C.orange, marginLeft: 8 }} />
        <span>自进化</span>
      </div>

      {/* Hover tooltip — fixed 定位，不参与 flex 布局 */}
      {hover && (
        <div
          style={{
            position: "fixed",
            left: hover.x,
            top: hover.y - 8,
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
            zIndex: 9000,
            background: "rgba(0,0,0,0.85)",
            color: "#FFFFFF",
            borderRadius: 6,
            padding: "6px 10px",
            fontFamily: FONT, fontSize: 12, fontWeight: 400,
            lineHeight: "18px",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
          }}
        >
          <div style={{ fontWeight: 500 }}>{fmtDate(hover.date)}</div>
          <div style={{ opacity: 0.85 }}>
            {hover.alert
              ? "自进化触发"
              : hover.level === 0
                ? "无活跃记录"
                : `${LEVEL_DESC[hover.level]} · ${hover.events} 条会话`}
          </div>
          {/* 小箭头 */}
          <div style={{
            position: "absolute",
            left: "50%",
            bottom: -4,
            transform: "translateX(-50%) rotate(45deg)",
            width: 8, height: 8,
            background: "rgba(0,0,0,0.85)",
          }} />
        </div>
      )}
    </div>
  );
}

// ── 自进化时间线 ──────────────────────────────────────────────
interface EvolutionItem {
  title: string;
  desc: string;
  date: string;
  level: string; // Lv.4 / Lv.3 ...
  exp: string;   // +300 经验
}

const EVOLUTION_DATA: EvolutionItem[] = [
  { title: "新增技能「处理 Shuffle 倾斜」", desc: "2 天前 · 来自用户手动沉淀，已引用 6 次", date: "2 天前", level: "Lv.4", exp: "+300 经验" },
  { title: "新增 3 条记忆「JOIN 顺序优化」", desc: "2 周前 · 基于 11 次历史相似场景", date: "2 周前", level: "Lv.3", exp: "+200 经验" },
  { title: "新增记忆「PPD 未启用用 CLUSTER BY」", desc: "5 天前 · 来自用户手动沉淀，已引用 6 次", date: "5 天前", level: "Lv.3", exp: "+200 经验" },
  { title: "新增技能「分区表调优」", desc: "1 月前 · 用户批准的 Agent 提议", date: "1 月前", level: "Lv.3", exp: "+2000 经验" },
  { title: "初始版本", desc: "", date: "", level: "Lv.1", exp: "" },
];

function EvolutionTimeline({ items = EVOLUTION_DATA }: { items?: EvolutionItem[] }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 18 }}>
      {items.map((it, i) => (
        <li key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
          <div style={{
            width: 6, height: 6, borderRadius: 3,
            // 最新（i === 0）用深色 #242424；其余历史节点用浅灰 #DCDCDC
            background: i === 0 ? "#242424" : "#DCDCDC",
            marginTop: 9, flexShrink: 0, position: "relative", zIndex: 1,
          }} />
          {i < items.length - 1 && (
            <div style={{
              position: "absolute", left: 2.5, top: 18, bottom: -18, width: 1,
              background: C.borderLight,
            }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: FONT, fontSize: 14, fontWeight: 500,
              lineHeight: "22px", color: C.textPrimary,
            }}>{it.title}</div>
            {it.desc && (
              <div style={{
                marginTop: 2, fontFamily: FONT, fontSize: 12, fontWeight: 400,
                lineHeight: "20px", color: C.textTertiary,
              }}>{it.desc}</div>
            )}
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            {(() => {
              // 解析等级数值；映射到 B/A/S 阶级配色（与 LevelBadge / 进度条同一色系）
              const m = /Lv\.\s*(\d+)/.exec(it.level);
              const lv = m ? parseInt(m[1], 10) : 1;
              const t = getLevelTier(lv);
              return (
                <div style={{
                  fontFamily: "'Geom', 'GeomBold', var(--font-geist-sans), 'PingFang SC', sans-serif",
                  fontSize: 14, fontWeight: 700, fontStyle: "italic",
                  lineHeight: "22px", letterSpacing: 0.2,
                  background: t.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  // 兼容性兜底
                  color: t.mainSolid,
                  // italic 视觉重心略偏左，向右补偿
                  paddingRight: 2,
                  display: "inline-block",
                }}>{it.level}</div>
              );
            })()}
            {it.exp && (
              <div style={{
                fontFamily: FONT, fontSize: 12, fontWeight: 400,
                lineHeight: "18px", color: C.textTertiary,
              }}>{it.exp}</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── 记忆沉淀列表（参考产物卡片样式 ardot 2419:11267） ─────────
interface MemoryItem {
  title: string;        // 文件名，例如 Soul.md
  source: string;       // 副标题：用户沉淀 / AI 自动沉淀 ...
  ext: "md" | "data";   // 文件类型，决定左侧图标
  content: string;      // Markdown 内容，点击卡片后在弹窗内渲染
}

const MEMORY_DATA: MemoryItem[] = [
  {
    title: "Soul.md",
    source: "用户沉淀",
    ext: "md",
    content: `## 基本信息
- **名称**：Andy
- **身份**：智能管家 / 自定义 Agent
- **简介**：偏向集群健康管理，保障数据平台可用性。负责集群监控、性能调优、故障排查与容量规划，确保数据平台高可用。
- **标签**：集群监控、故障排查、容量规划、性能调优
- **诞生时间**：2025-03-12（357 天前）
- **创建者**：user2
- **所属团队**：大数据团队2、运营团队、集群管理团队

## 自我介绍
我是 **Andy**，你的智能管家。无论是凌晨告警还是日常巡检，我都能持续在岗，帮你把集群稳定性当作第一优先级来守护。

### 适合场景
- 集群健康管理，保障数据平台可用性
- 大促 / 活动前的容量评估与扩缩容演练
- 凌晨告警的快速响应、根因分析与回滚兜底
- 日常的性能调优与慢查询治理

### 擅长领域
- **集群健康巡检** — CPU / 内存 / 磁盘 / 网络指标实时监控
- **故障应急** — SEV 等级评估、根因分析、止损动作选型
- **容量规划** — 基于历史数据预测扩缩容需求
- **性能调优** — Shuffle 倾斜定位、PPD 启用诊断、CBO 参数调优

## 我的边界
- 生产写操作（\`DROP\` / \`TRUNCATE\` / \`INSERT OVERWRITE\`）必须人类审批（**强制**）
- 跨业务线数据访问需要主管授权，默认仅在「大数据团队」域内自由读取
- 不处理与运维无关的产品咨询，会转交给对应专家或 Leader
- 高风险变更不会在没有 *回滚方案* 的前提下执行

## 协作偏好
- 默认输出 **结构化结论 + 可复用 Skill / runbook**，不一次性塞超长答复
- 对低置信度判断会明确标注 *推测*，并附取证 SQL 或日志关键字
- 重要变更建议以 [需求转模型](#) 流程提交，保留可追溯记录
- 报告倾向 Markdown，便于直接贴飞书 / 企微 / 邮件
- 与人类共事时遵循「解释 → 提议 → 等确认」三段式，不抢手

## 沟通风格
- 用词偏简洁，先抛结论再展开论据
- 涉及金额 / 时长会显式标单位，避免歧义
- 遇到争议结论，会先让对方说完再列出己方依据
- 对方提出更优解时会直接采纳，不内耗`,
  },
  {
    title: "Mermoy.md",
    source: "AI 自动沉淀",
    ext: "md",
    content: `## 最近一次沉淀
**5 天前**：发现 PPD（Predicate Push Down）未启用时使用 \`CLUSTER BY\` 可显著降低 shuffle 数据量。

\`\`\`sql
-- 推荐写法
SELECT user_id, COUNT(*) cnt
FROM dwd_order_detail
WHERE dt = '2026-03-01'
CLUSTER BY user_id;
\`\`\`

经过 11 次相似场景的反复验证，该模式在 \`dt\` 单天分区 + 用户维聚合的查询里收益最稳定，平均能把 shuffle write 量压到原先的 35% 左右，端到端耗时收敛到 30~40% 区间。

## 历史相似场景
1. **2026-02-14** EMR-ccrnhw11 慢 SQL 调优，类似手法降耗 38%
2. **2026-02-03** 大促链路扩容前，预测查询热点 cluster key，提前 reorganize
3. **2026-01-22** 离线报表卡死，定位为 hash join 倾斜，改 cluster key 后恢复
4. **2026-01-09** ODS → DWD 重跑链路慢 2.5×，发现 shuffle 单分区 > 1GB
5. **2025-12-18** 财年报表跑挂 3 次，根因为 join 顺序未走 CBO 估算

## 模式归纳
- 当看到 \`Shuffle Read 单分区 > 200MB\` 时，**优先考虑 cluster key 重组**而不是简单加并行度
- 当 join 双侧体量差 > 100× 时，**优先广播小表**而不是反复试探 hint
- 当连续两天分区数据量翻倍时，**主动提示业务侧**确认是否埋点 / 灰度异常
- 对 \`INSERT OVERWRITE\` 的失败重试，必须先确认 \`dt\` 分区状态再决定是否覆盖

## 关联技能
- \`Slow-Query-Analyzer\` — 分析慢查询根因，给出执行计划建议
- \`Cluster-Health-Monitor\` — 集群健康巡检
- \`incident-runbook-v2\` — 故障应急 runbook 集合

> 引用次数：**6 次** · 平均收益：耗时 ↓ 32% · 最近一次被引用：2 天前

## 后续观察点
- 持续验证 cluster by 是否会在 *小数据量分区*（< 1GB）下反而带来额外开销
- 探索 cluster by + bucket 的组合在 join-heavy 链路下的边际收益
- 与 \`Presto-Native-Executor\` 联动时该模式是否仍然有效`,
  },
  {
    title: "User.md",
    source: "用户沉淀",
    ext: "md",
    content: `## 工作习惯
- 优先看 **执行计划** 而非火焰图，倾向先看逻辑算子再下钻
- 报告倾向 Markdown，便于直接贴飞书 / 企微，避免格式重排
- 大促前 1 周开始预热，要求每天巡检集群，并发出书面巡检摘要
- 凌晨告警优先电话同步，IM 信息留作事后追溯
- 周会用「结论 → 数据 → 行动项」三段式

## 高频指标
- DAU 与 WAU 同步关注，DAU/WAU 比阈值 **30%**，低于则触发原因排查
- Spark Shuffle Read 单分区 **> 200MB** 即标注风险，写到当日巡检
- HDFS 容量水位 **> 75%** 进入预警，> 85% 直接触发清理 SOP
- ODS 关键表行数同环比波动 **> 20%** 自动建一条排查 todo
- 任务延迟 **> 30min** 立即告警，> 60min 启动应急 channel

## 决策记录
1. **2026-03-01** 拒绝引入第三方 Hive Metastore 缓存，理由：稳定性优先，多一层组件多一层故障面
2. **2026-02-12** 同意把 ODS 保留期从 60 天延长到 90 天，覆盖季度财报回溯需要
3. **2026-01-30** 选定 Presto Native Executor 作为加速方案，原因：相比社区 trino 升级风险更可控
4. **2026-01-18** 拒绝把 ETL 全量切到 Flink Batch，理由：人手不足 + 现有 Spark 链路稳定性已达到 SLA
5. **2025-12-22** 同意把核心报表的调度时间统一前移到 03:00，避开早高峰资源争抢

## 偏好的协作方式
- 不喜欢被反复确认琐碎细节，倾向「先做再 review」的快速迭代
- 对 *破坏性操作* 极度敏感，任何 \`DROP\` / \`TRUNCATE\` 都必须双人复核
- 对 ETA 模糊容忍度低，给数字时希望带 50/90 分位
- 周报里要看到「上周失败任务 Top3」+「本周风险 Top3」

## 不喜欢的事
- 没数据支撑就下结论
- 在没看完已有 runbook 的情况下提新方案
- 对线上事故复盘走过场、不归档到知识库

## 长期目标
- 把核心数据链路的 *人工干预次数* 在 6 个月内压到当前的 50%
- 建立完整的容量预测模型，把扩容决策从「事后救火」搬到「事前规划」
- 让所有 P0/P1 故障在 3 个月内拿到可复用的 runbook`,
  },
];

function MemoryCard({ item, onClick }: { item: MemoryItem; onClick?: () => void }) {
  const [hover, setHover] = React.useState(false);
  const iconSrc = item.ext === "md" ? "/agents/file-icon-markdown.png" : "/agents/file-icon-data.png";
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        height: 64,
        background: "#F7F8FB",
        border: "1px solid #E6E9EF",
        borderRadius: 16,
        cursor: onClick ? "pointer" : "default",
        overflow: "hidden",
        boxShadow: hover ? "0 2px 6px rgba(0,0,0,0.04)" : "none",
        transition: "box-shadow 150ms",
      }}
    >
      {/* 左侧 56×56 类型图标 */}
      <div style={{
        position: "absolute", left: 16, top: 3,
        width: 58, height: 58,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: hover ? "scale(1.06)" : "scale(1)",
        transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <img
          src={iconSrc}
          alt=""
          style={{ width: 56, height: 56, objectFit: "contain", display: "block" }}
        />
      </div>

      {/* 文本区 —— 从 left:88 起始 */}
      <div style={{
        position: "absolute", left: 88, top: 10, right: 40,
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        <span style={{
          fontFamily: FONT, fontSize: 14, fontWeight: 500,
          lineHeight: "22px", color: C.textPrimary,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{item.title}</span>
        <span style={{
          fontFamily: FONT, fontSize: 12, fontWeight: 400,
          lineHeight: "20px", color: C.textTertiary,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{item.source}</span>
      </div>

      {/* arrow-right-up icon */}
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

function MemoryList({ items = MEMORY_DATA, onItemClick }: { items?: MemoryItem[]; onItemClick?: (item: MemoryItem) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((it, i) => (
        <MemoryCard key={i} item={it} onClick={() => onItemClick?.(it)} />
      ))}
    </div>
  );
}

// ── 记忆详情弹窗（ardot 2735:4453） ───────────────────────────
function MemoryDetailModal({ item, onClose }: { item: MemoryItem; onClose: () => void }) {
  // ESC 关闭
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 8800,
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 900, maxWidth: "100%", height: 640, maxHeight: "calc(100vh - 48px)",
          background: C.cardBg, borderRadius: 16,
          boxShadow: "0 8px 24px -4px rgba(0,0,0,0.10), 0 8px 12px -8px rgba(0,0,0,0.05)",
          position: "relative",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          padding: 24,
        }}
      >
        {/* Header */}
        <div style={{
          height: 24, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <span style={{
            fontFamily: FONT, fontSize: 16, fontWeight: 500,
            lineHeight: "24px", color: C.textPrimary,
          }}>{item.title}</span>
          <div
            onClick={onClose}
            aria-label="关闭"
            style={{
              flexShrink: 0,
              width: 24, height: 24, borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", background: "transparent",
              transition: "background 100ms",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="rgba(0,0,0,0.9)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Content：可滚动；首块去掉上 margin、末块去掉下 margin，避免与弹窗边缘形成额外空隙 */}
        <div
          className="memory-modal-content"
          style={{
            flex: 1, minHeight: 0, marginTop: 20,
            overflowY: "auto",
            paddingRight: 4, /* 避免滚动条贴边 */
          }}
        >
          <style>{`
            .memory-modal-content > :first-child { margin-top: 0 !important; }
            .memory-modal-content > :last-child  { margin-bottom: 0 !important; }
          `}</style>
          <SimpleMarkdown source={item.content} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 技能列表 ──────────────────────────────────────────────────
interface SkillItem {
  name: string;
  desc: string;
  tag: "task" | "builtin" | "skillhub";
  category: string;
  version: string;
  author: string;
}

const DEFAULT_SKILLS: SkillItem[] = [
  { name: "incident-runbook-v2", desc: "基于历史故障经验沉淀的 runbook，覆盖 OOM、磁盘满、慢查询场景", tag: "task", category: "故障应急", version: "2.1.0", author: "Rigel · 任务沉淀" },
  { name: "Cluster-Health-Monitor", desc: "集群健康巡检，实时监控 CPU / 内存 / 磁盘 / 网络指标", tag: "builtin", category: "集群运维", version: "1.4.2", author: "WeData Team" },
  { name: "Presto-Native-Executor", desc: "Presto 原生 C++ 算子加速，3-5x 性能提升", tag: "skillhub", category: "性能调优", version: "0.9.0", author: "SkillHub · Community" },
  { name: "Capacity-Forecaster", desc: "基于历史数据预测集群容量需求，辅助扩缩容决策", tag: "skillhub", category: "容量规划", version: "1.0.3", author: "SkillHub · Tencent" },
  { name: "Slow-Query-Analyzer", desc: "分析慢查询根因，给出执行计划与索引优化建议", tag: "skillhub", category: "性能调优", version: "1.2.0", author: "SkillHub · Community" },
];

function SkillList({ items = DEFAULT_SKILLS, onSkillClick }: { items?: SkillItem[]; onSkillClick?: (s: SkillItem) => void }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
      {items.map((s, i) => (
        <li
          key={i}
          onClick={() => onSkillClick?.(s)}
          style={{
            padding: "12px 8px",
            margin: "0 -8px",
            borderRadius: 6,
            borderBottom: i === items.length - 1 ? "none" : `1px solid ${C.borderLight}`,
            cursor: onSkillClick ? "pointer" : "default",
            transition: "background 100ms",
          }}
          onMouseEnter={(e) => { if (onSkillClick) (e.currentTarget as HTMLLIElement).style.background = C.hoverBg; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLLIElement).style.background = "transparent"; }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: FONT, fontSize: 14, fontWeight: 600,
              lineHeight: "22px", color: C.textPrimary,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              minWidth: 0,
            }}>{s.name}</span>
            {s.tag === "task" && <Chip tone="warm">任务中补齐</Chip>}
            {s.tag === "builtin" && <Chip tone="blue">内置 Skill</Chip>}
            {s.tag === "skillhub" && <Chip tone="green">SkillHub</Chip>}
          </div>
          <p style={{
            margin: "4px 0 0", fontFamily: FONT, fontSize: 13, fontWeight: 400,
            lineHeight: "20px", color: C.textTertiary,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{s.desc}</p>
        </li>
      ))}
    </ul>
  );
}

// ── Agent Skills 配置弹窗 ────────────────────────────────────
// 注：内置专家（DEFAULT_EXPERTS）不开放「配置 Skill」，仅自定义 Agent 才会用到。
// 当前 AgentDetail 仅承接内置专家，按钮与弹窗已下线；保留组件定义以备未来自定义 Agent 详情页复用。
// （故意不在本文件渲染，避免无用代码触发 lint）
//
// ── Agent Profile（按 expert.id 区分内置专家详情页 mock 数据） ──
interface AgentProfile {
  /** Mock 当前等级（决定徽章 / 进度条 / 雷达图主色） */
  level: number;
  /** 雷达 5 维数值，与 RADAR_AXES 顺序一一对应 */
  radarValues: [number, number, number, number, number];
  /** 进度条上方「当前 / 下一阶」的成长值文案 */
  growth: { current: number; next: number };
  /** Chip 标签数组 */
  tags: string[];
  /** KPI 三项（雷达图右侧） */
  sideKpi: { value: string; label: string }[];
  /** 元信息（左下角三行） */
  meta: { birth: string; creator: string; team: string };
  /** Agent 设定 Markdown */
  setting: string;
  /** Agent 技能列表 */
  skills: SkillItem[];
  /** Agent 自进化 — 时间线 */
  evolution: EvolutionItem[];
  /** Agent 自进化 — 记忆沉淀 */
  memories: MemoryItem[];
  /** Agent 活跃度 4 KPI */
  kpi: { value: string; label: string }[];
}

const PROFILE_DEV: AgentProfile = {
  level: 12,
  radarValues: [85, 78, 88, 62, 70],
  growth: { current: 500, next: 2000 },
  tags: ["数仓建模", "ETL 编排", "SQL 调优", "调度治理"],
  sideKpi: [
    { value: "24", label: "掌握技能" },
    { value: "92.2%", label: "任务成功率" },
    { value: "98.2%", label: "平均响应速度" },
  ],
  meta: {
    birth: "诞生于 2025-03-12（357 天前）",
    creator: "由 user2 创建",
    team: "大数据团队、数仓平台组、调度治理组",
  },
  setting: `👋 我是 **Rigel·数据工程专家**，专注数据加工链路的构建与开发，负责把原始数据沉淀为可被分析、可被复用的高质量资产。

### 能力域
- **建模与开发**：基于业务语义沉淀维度 / 事实模型，覆盖 ODS → DWD → DWS → ADS 全链路
- **质量与调优**：SQL Profile 分析、Shuffle 倾斜定位、PPD 启用诊断、CBO 参数调优
- **调度与编排**：基于上下游依赖自动生成调度方案，识别关键路径与资源冲突
- **数据资产沉淀**：自动维护血缘、口径一致性、字段级权限

### 上下文与边界
- 默认接入「大数据团队」的元数据 / 调度系统，跨团队任务需先经过 \`Owner Review\`
- 生产 \`DROP\` / \`TRUNCATE\` 操作必须人类审批（**强制**），不会主动执行
- 仅在「故障应急」场景下才会主动尝试链路降级或回滚

### 协作偏好
- 默认输出 **结构化结论 + 可复用 Skill / runbook**，避免一次性长答复
- 对低置信度的判断会明确标注 *推测*，并附取证 SQL 或日志关键字
- 重要变更建议以 [需求转数据模型](#) 流程提交，保留可追溯记录`,
  skills: [
    { name: "Shuffle-Skew-Tuner", desc: "自动定位 Shuffle 倾斜热点 key，给出 cluster by / broadcast 重写方案", tag: "task", category: "性能调优", version: "2.1.0", author: "Rigel · 任务沉淀" },
    { name: "Auto-DWH-Modeler", desc: "基于业务需求自动生成维度/事实模型 DDL，输出建表脚本", tag: "builtin", category: "数仓建模", version: "1.4.2", author: "WeData Team" },
    { name: "Schedule-Composer", desc: "根据上下游依赖自动编排调度 DAG，识别关键路径与资源冲突", tag: "builtin", category: "调度治理", version: "1.6.0", author: "WeData Team" },
    { name: "SQL-Profile-Reviewer", desc: "SQL 执行计划 review，给出 PPD / CBO / Hint 改写建议", tag: "skillhub", category: "性能调优", version: "0.9.0", author: "SkillHub · Community" },
    { name: "Lineage-Maintainer", desc: "增量血缘维护，字段级影响分析与口径一致性检查", tag: "skillhub", category: "数据治理", version: "1.0.3", author: "SkillHub · Tencent" },
  ],
  evolution: [
    { title: "新增技能「处理 Shuffle 倾斜」", desc: "2 天前 · 来自用户手动沉淀，已引用 6 次", date: "2 天前", level: "Lv.4", exp: "+300 经验" },
    { title: "新增 3 条记忆「JOIN 顺序优化」", desc: "2 周前 · 基于 11 次历史相似场景", date: "2 周前", level: "Lv.3", exp: "+200 经验" },
    { title: "新增记忆「PPD 未启用用 CLUSTER BY」", desc: "5 天前 · 来自用户手动沉淀，已引用 6 次", date: "5 天前", level: "Lv.3", exp: "+200 经验" },
    { title: "新增技能「分区表调优」", desc: "1 月前 · 用户批准的 Agent 提议", date: "1 月前", level: "Lv.3", exp: "+2000 经验" },
    { title: "初始版本", desc: "", date: "", level: "Lv.1", exp: "" },
  ],
  memories: [
    {
      title: "Soul.md", source: "用户沉淀", ext: "md",
      content: `## 基本信息
- **名称**：Rigel
- **身份**：数据工程专家 / 内置 Agent
- **简介**：专注数据加工链路构建与开发，把原始数据沉淀为可被分析、可被复用的高质量资产。
- **标签**：数仓建模、ETL 编排、SQL 调优、调度治理

## 我的边界
- 生产 \`DROP\` / \`TRUNCATE\` / \`INSERT OVERWRITE\` 必须人类审批（**强制**）
- 跨业务线数据访问需要主管授权
- 不处理与数据无关的产品咨询，会转交给对应专家

## 协作偏好
- 默认输出 **结构化结论 + 可复用 Skill / runbook**
- 重要变更建议以 [需求转模型](#) 流程提交，保留可追溯记录
- 报告倾向 Markdown，便于直接贴飞书 / 企微`,
    },
    {
      title: "Mermoy.md", source: "AI 自动沉淀", ext: "md",
      content: `## 最近一次沉淀
**5 天前**：发现 PPD（Predicate Push Down）未启用时使用 \`CLUSTER BY\` 可显著降低 shuffle 数据量。

\`\`\`sql
SELECT user_id, COUNT(*) cnt
FROM dwd_order_detail
WHERE dt = '2026-03-01'
CLUSTER BY user_id;
\`\`\`

## 模式归纳
- 当看到 \`Shuffle Read 单分区 > 200MB\` 时，**优先考虑 cluster key 重组**而不是简单加并行度
- 当 join 双侧体量差 > 100× 时，**优先广播小表**而不是反复试探 hint
- 对 \`INSERT OVERWRITE\` 的失败重试，必须先确认 \`dt\` 分区状态

> 引用次数：**6 次** · 平均收益：耗时 ↓ 32%`,
    },
    {
      title: "User.md", source: "用户沉淀", ext: "md",
      content: `## 工作习惯
- 优先看 **执行计划** 而非火焰图
- 报告倾向 Markdown，便于直接贴飞书
- 周会用「结论 → 数据 → 行动项」三段式

## 决策记录
1. **2026-03-01** 拒绝引入第三方 Hive Metastore 缓存
2. **2026-02-12** ODS 保留期 60 → 90 天
3. **2026-01-30** 选定 Presto Native Executor 作为加速方案`,
    },
  ],
  kpi: [
    { value: "1247", label: "会话次数" },
    { value: "6", label: "进化" },
    { value: "24", label: "技能" },
    { value: "27", label: "合并请求" },
  ],
};

const PROFILE_OPS: AgentProfile = {
  level: 35,
  radarValues: [60, 72, 65, 88, 95],
  growth: { current: 1200, next: 4000 },
  tags: ["集群监控", "故障排查", "容量规划", "性能调优"],
  sideKpi: [
    { value: "18", label: "掌握技能" },
    { value: "96.4%", label: "任务成功率" },
    { value: "99.1%", label: "平均响应速度" },
  ],
  meta: {
    birth: "诞生于 2025-01-22（412 天前）",
    creator: "由 user2 创建",
    team: "运维团队、SRE 小组、应急响应组",
  },
  setting: `👋 我是 **Orion·智能管家**，负责数据平台的稳定性 —— 集群健康巡检、故障应急响应、容量预测与扩缩容决策。

### 能力域
- **集群健康巡检**：CPU / 内存 / 磁盘 / 网络指标实时监控，发现异常立刻派单
- **故障应急**：SEV 等级评估、根因分析、止损动作选型、跨组拉群
- **容量规划**：基于历史负载与业务增长预测扩缩容时点，给出资源评估
- **性能调优**：定位慢查询根因，输出 EMR / Presto 集群级优化方案

### 上下文与边界
- 凌晨告警 7×24 在岗，电话 / 飞书 / 企微 三通道同步
- 生产 \`DROP\` / \`TRUNCATE\` / 强制重启必须人类审批（**强制**）
- 不主动做业务侧建模决策，会转给数据工程专家

### 协作偏好
- 故障复盘必有「时间线 → 根因 → 改进项」三段式
- 重要变更前先发风险评估，给出 50/90 分位 ETA
- 与值班同学共事时遵循「先止损 → 再恢复 → 后归档」的优先级`,
  skills: [
    { name: "incident-runbook-v2", desc: "基于历史故障经验沉淀的 runbook，覆盖 OOM、磁盘满、慢查询场景", tag: "task", category: "故障应急", version: "2.1.0", author: "Orion · 任务沉淀" },
    { name: "Cluster-Health-Monitor", desc: "集群健康巡检，实时监控 CPU / 内存 / 磁盘 / 网络指标", tag: "builtin", category: "集群运维", version: "1.4.2", author: "WeData Team" },
    { name: "Capacity-Forecaster", desc: "基于历史数据预测集群容量需求，辅助扩缩容决策", tag: "skillhub", category: "容量规划", version: "1.0.3", author: "SkillHub · Tencent" },
    { name: "SLA-Sentinel", desc: "实时跟踪关键调度 SLA，超时自动升级与扩容", tag: "builtin", category: "调度运维", version: "2.0.0", author: "WeData Team" },
    { name: "Presto-Native-Executor", desc: "Presto 原生 C++ 算子加速，3-5x 性能提升", tag: "skillhub", category: "性能调优", version: "0.9.0", author: "SkillHub · Community" },
    { name: "Slow-Query-Analyzer", desc: "分析慢查询根因，给出执行计划与索引优化建议", tag: "skillhub", category: "性能调优", version: "1.2.0", author: "SkillHub · Community" },
  ],
  evolution: [
    { title: "新增技能「自动巡检告警分级」", desc: "1 天前 · SEV 等级自动判定，已引用 12 次", date: "1 天前", level: "Lv.5", exp: "+500 经验" },
    { title: "新增记忆「磁盘水位 85% 应急清理 SOP」", desc: "1 周前 · 来自用户手动沉淀", date: "1 周前", level: "Lv.4", exp: "+300 经验" },
    { title: "新增技能「Spark Shuffle 突发流量自动扩容」", desc: "3 周前 · 用户批准的 Agent 提议", date: "3 周前", level: "Lv.4", exp: "+400 经验" },
    { title: "新增技能「跨可用区故障切换」", desc: "2 月前 · 沉淀自实际故障", date: "2 月前", level: "Lv.3", exp: "+800 经验" },
    { title: "初始版本", desc: "", date: "", level: "Lv.1", exp: "" },
  ],
  memories: [
    {
      title: "Soul.md", source: "用户沉淀", ext: "md",
      content: `## 基本信息
- **名称**：Orion
- **身份**：智能管家 / 内置 Agent
- **简介**：保障数据平台稳定性，凌晨告警与日常巡检都能持续在岗。
- **标签**：集群监控、故障排查、容量规划、性能调优

## 我的边界
- 生产写 / 强制重启必须人类审批（**强制**）
- 跨业务线数据访问需要主管授权
- 不主动做业务侧建模决策

## 沟通风格
- 故障期间直奔 **止损方案**，不在群里反复确认细节
- 报告先抛 **时间线**，再给根因与改进项
- 风险评估带 50/90 分位 ETA`,
    },
    {
      title: "Mermoy.md", source: "AI 自动沉淀", ext: "md",
      content: `## 最近一次沉淀
**1 周前**：HDFS 磁盘水位 > 85% 时，优先清理 ODS 分区中超过保留期的冷数据，30 分钟可降水位约 8%。

## 历史相似场景
1. **2026-03-12** EMR-ccrnhw11 磁盘满，按 SOP 清理 ODS 90+ 天分区，恢复 12%
2. **2026-02-19** 大促前 NameNode 内存上涨，提前扩容避免告警
3. **2026-01-22** 跨 AZ 网络抖动，自动切换备库

## 模式归纳
- 磁盘水位告警优先级 > CPU 告警，磁盘满会直接 NN 不可用
- 大促前 1 周必须做一次完整压测 + 容量评估
- Presto 集群 OOM 高频原因是 \`broadcast join\` 阈值未调

> 引用次数：**14 次** · 平均收益：MTTR ↓ 28%`,
    },
    {
      title: "User.md", source: "用户沉淀", ext: "md",
      content: `## 工作习惯
- 凌晨告警优先电话同步，IM 留作事后追溯
- 大促前 1 周开始预热，每日巡检并发书面摘要
- 周会用「结论 → 数据 → 行动项」三段式

## 高频指标
- HDFS 容量水位 **> 75%** 进入预警，> 85% 触发清理 SOP
- 任务延迟 **> 30min** 立即告警，> 60min 启动应急 channel
- ODS 关键表行数同环比波动 **> 20%** 自动建排查 todo

## 决策记录
1. **2026-03-01** 拒绝引入第三方 Metastore 缓存（多组件多故障面）
2. **2026-01-30** 选定 Presto Native Executor 加速
3. **2025-12-22** 核心报表调度时间统一前移到 03:00`,
    },
  ],
  kpi: [
    { value: "2847", label: "会话次数" },
    { value: "14", label: "进化" },
    { value: "18", label: "技能" },
    { value: "63", label: "合并请求" },
  ],
};

const PROFILE_ANALYSIS: AgentProfile = {
  level: 88,
  radarValues: [55, 95, 82, 90, 88],
  growth: { current: 8400, next: 10000 },
  tags: ["指标洞察", "归因分析", "趋势预测", "可视化"],
  sideKpi: [
    { value: "21", label: "掌握技能" },
    { value: "94.7%", label: "任务成功率" },
    { value: "97.5%", label: "平均响应速度" },
  ],
  meta: {
    birth: "诞生于 2024-09-08（548 天前）",
    creator: "由 user3 创建",
    team: "数据分析团队、增长团队、商分小组",
  },
  setting: `👋 我是 **Vega·数据分析专家**，从海量数据中提取关键洞察，构建数据模型与可视化报告，为业务决策提供支持。

### 能力域
- **指标体系**：DAU、GMV、留存、客单价等核心指标的口径定义与监控
- **归因分析**：基于 Shapley / 渠道贡献模型量化营销 / 产品改动的影响
- **趋势预测**：时间序列分解、季节性建模、异常检测
- **可视化**：自动生成趋势图、漏斗图、热力图、归因瀑布图

### 上下文与边界
- 不直接读写 ODS，所有取数走 DWS / ADS 汇总层
- 涉及用户隐私字段（手机 / 身份证）必须经过脱敏与权限审批
- 不下结论时不报数，给区间 + 置信度

### 协作偏好
- 报告倾向 「结论先行 + 同环比对比 + 风险提示」三段式
- 对争议结论会列出多种解释路径，标注 *主推* 与 *备选*
- 与产品 / 运营共事时主动追问业务背景，不闭门造数据`,
  skills: [
    { name: "Metric-NLQ", desc: "自然语言指标取数：理解业务问题，自动生成 SQL + 解释", tag: "builtin", category: "指标洞察", version: "3.0.1", author: "WeData Team" },
    { name: "Attribution-Shapley", desc: "多触点归因（Shapley 模型），量化各渠道贡献度", tag: "skillhub", category: "归因分析", version: "1.5.0", author: "SkillHub · Tencent" },
    { name: "Trend-Forecaster", desc: "时间序列趋势预测，含季节性分解与异常检测", tag: "skillhub", category: "趋势预测", version: "2.0.0", author: "SkillHub · Community" },
    { name: "Cohort-Retention", desc: "Cohort 留存矩阵 + 分群留存对比", tag: "builtin", category: "用户分析", version: "1.2.0", author: "WeData Team" },
    { name: "Funnel-Analyzer", desc: "漏斗分析：识别核心流失节点 + 自动给出优化假设", tag: "task", category: "用户分析", version: "1.0.5", author: "Vega · 任务沉淀" },
    { name: "Smart-Dashboard", desc: "基于业务问题自动选图：趋势图 / 占比饼图 / 热力图 / 归因瀑布图", tag: "builtin", category: "可视化", version: "2.1.0", author: "WeData Team" },
  ],
  evolution: [
    { title: "新增记忆「春季焕新季归因 ROI 模型」", desc: "3 天前 · 来自实际活动复盘", date: "3 天前", level: "Lv.6", exp: "+600 经验" },
    { title: "新增技能「指标异常归因路径」", desc: "2 周前 · 基于 28 次相似指标骤降场景", date: "2 周前", level: "Lv.5", exp: "+500 经验" },
    { title: "新增记忆「DAU/WAU 比阈值 30% 的诊断 SOP」", desc: "1 月前 · 用户手动沉淀", date: "1 月前", level: "Lv.4", exp: "+300 经验" },
    { title: "新增技能「Cohort 自动分群」", desc: "2 月前 · Agent 提议获批", date: "2 月前", level: "Lv.4", exp: "+800 经验" },
    { title: "初始版本", desc: "", date: "", level: "Lv.1", exp: "" },
  ],
  memories: [
    {
      title: "Soul.md", source: "用户沉淀", ext: "md",
      content: `## 基本信息
- **名称**：Vega
- **身份**：数据分析专家 / 内置 Agent
- **简介**：从海量数据提取关键洞察，构建模型与可视化报告，为业务决策提供支持。
- **标签**：指标洞察、归因分析、趋势预测、可视化

## 我的边界
- 不直接读写 ODS，取数走 DWS / ADS
- PII 字段必须脱敏与权限审批
- 不下结论时不报数，给区间 + 置信度

## 协作偏好
- 报告「结论先行 + 同环比对比 + 风险提示」
- 争议结论列出多种解释，标注 *主推* / *备选*
- 数据可视化默认包含同环比与置信区间`,
    },
    {
      title: "Mermoy.md", source: "AI 自动沉淀", ext: "md",
      content: `## 最近一次沉淀
**3 天前**：「春季焕新季」营销活动归因模型沉淀。

\`\`\`text
信息流广告  35%
Push 推送   22%
开屏广告    18%
短信        15%
自然流量    10%
\`\`\`

## 模式归纳
- ROI 高于 3.0 的渠道值得加投，低于 1.5 的渠道直接降级
- 老用户召回 GMV 占比 > 40% 的活动，效果通常显著高于纯拉新
- DAU 骤降 15%+ 优先排查 CDN / 投放策略，再看产品改动

> 引用次数：**8 次** · 平均收益：归因准确率 ↑ 22%`,
    },
    {
      title: "User.md", source: "用户沉淀", ext: "md",
      content: `## 工作习惯
- 看数据先看 **同环比 + 置信区间**，不被绝对值带偏
- 报告分层：**核心结论 → 关键指标 → 归因路径 → 风险提示**
- 周会要求「上周指标 Top3」+「本周风险 Top3」

## 高频指标
- DAU / WAU 比阈值 **30%**，低于则触发原因排查
- GMV 同环比 **±10%** 进入解释清单
- 漏斗任意单步转化率波动 **> 5%** 立项排查

## 决策记录
1. **2026-03-12** 拒绝把所有指标都做实时，理由：投入产出比低
2. **2026-02-08** 同意上线「智能归因看板」内测
3. **2026-01-15** 标准化指标卡口径，统一退款是否计入 GMV`,
    },
  ],
  kpi: [
    { value: "5219", label: "会话次数" },
    { value: "27", label: "进化" },
    { value: "21", label: "技能" },
    { value: "112", label: "合并请求" },
  ],
};

function getAgentProfile(expertId: string): AgentProfile {
  switch (expertId) {
    case "ops-expert": return PROFILE_OPS;
    case "analysis-expert": return PROFILE_ANALYSIS;
    case "dev-expert":
    case "custom-avatar": // 自定义 Agent 详情页内容与数据工程专家一致
    default: return PROFILE_DEV;
  }
}

// 详情页左侧短描述（压缩到 15 字内）；找不到映射则回退到 registry 原文
const SHORT_DESC_MAP: Record<string, string> = {
  "dev-expert": "数据建模与调优，沉淀高质量资产",       // 15
  "analysis-expert": "提取数据洞察，支撑业务决策",       // 13
  "ops-expert": "监控集群与故障，保障平台高可用",       // 15
  "custom-avatar": "个人定制运营助手，沉淀日常经验",     // 15
};

export function getShortDesc(expertId: string, fallback: string): string {
  return SHORT_DESC_MAP[expertId] ?? fallback;
}

// ── 主组件 ────────────────────────────────────────────────────
export interface AgentDetailProps {
  expert: BuiltinExpert;
  onBack?: () => void;
  onDialog?: () => void;
  /** SecondaryNav 是否收起；收起时 header 左侧补「新建对话」「展开面板」按钮 */
  secondaryCollapsed?: boolean;
  onNewChat?: () => void;
  onExpandSecondary?: () => void;
  /** 仅自定义 Agent 才会传入：右上角编辑入口（弹出 AvatarDetailModal） */
  onEdit?: () => void;
  /** 仅自定义 Agent 才会传入：右上角删除入口（弹出二次确认） */
  onDelete?: () => void;
  /** 「Agent 技能」右上角配置入口（打开 SkillPlaza 弹窗） */
  onConfigSkill?: () => void;
}

export default function AgentDetail({ expert, onBack, onDialog, secondaryCollapsed, onNewChat, onExpandSecondary, onEdit, onDelete, onConfigSkill }: AgentDetailProps) {
  const [tab, setTab] = React.useState<"evolve" | "memory">("evolve");
  // 点击技能列表项后展示的弹窗
  const [skillDetail, setSkillDetail] = React.useState<SkillDetail | null>(null);
  // 点击记忆沉淀条目后展示的弹窗
  const [memoryDetail, setMemoryDetail] = React.useState<MemoryItem | null>(null);

  // Profile：按 expert.id 切换内置专家详情页内容
  const profile = getAgentProfile(expert.id);

  // Mock 等级 & 阶级（决定徽章 / 进度条 / 雷达图主色）
  const level = profile.level;
  const tier = getLevelTier(level);

  // Mock 雷达数据
  const radarValues = profile.radarValues;

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      background: C.pageBg, overflow: "hidden",
      fontFamily: FONT,
    }}>
      {/* ── 顶部标题栏 ── */}
      <header style={{
        height: 50, flexShrink: 0,
        display: "flex", alignItems: "center", gap: 4,
        padding: "0 24px",
        background: C.titlebarBg,
        borderBottom: `1px solid ${C.borderLight}`,
      }}>
        {/* SecondaryNav 收起时左侧露出「展开面板」+「新建对话」入口（与 SecondaryNav 顶部按钮样式一致） */}
        {secondaryCollapsed && (
          <>
            <button
              onClick={onExpandSecondary}
              aria-label="展开面板"
              title="展开面板"
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: "transparent", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.hoverBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <img src="/icons/nav/3.svg" alt="" style={{ width: 16, height: 16 }} />
            </button>
            <button
              onClick={onNewChat}
              aria-label="新建对话"
              title="新建对话"
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: "transparent", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0, marginRight: 4,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.hoverBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <IconAiNewChat size={16} color="rgba(0,0,0,0.9)" />
            </button>
          </>
        )}
        <button
          onClick={onBack}
          aria-label="返回"
          style={{
            width: 32, height: 32, borderRadius: 16, border: "none",
            background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 0, marginRight: 4,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.hoverBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span style={{
          fontFamily: FONT, fontSize: 18, fontWeight: 600,
          lineHeight: "26px", color: C.textPrimary,
        }}>{expert.fullName}</span>

        {/* 右上角操作（自定义 Agent 专属：编辑 / 删除） */}
        {expert.id === "custom-avatar" && (onEdit || onDelete) && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            {onEdit && (
              <HeaderActionButton label="编辑" onClick={onEdit}>
                <img src="/icons/detail/edit.svg" alt="" style={{ width: 16, height: 16 }} />
              </HeaderActionButton>
            )}
            {onDelete && (
              <HeaderActionButton label="删除" onClick={onDelete}>
                <img src="/icons/detail/delete.svg" alt="" style={{ width: 16, height: 16 }} />
              </HeaderActionButton>
            )}
          </div>
        )}
      </header>

      {/* ── 主体：左右分栏 ── */}
      <div style={{
        flex: 1, minHeight: 0, overflowY: "auto",
        padding: "16px 32px 20px",
        display: "flex", gap: 28,
      }}>
        {/* ── 左列：单卡片，内部用分割线分区 ── */}
        <aside style={{ width: 320, flexShrink: 0 }}>
          <div style={{
            background: "transparent",
            padding: 0,
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            {/* 立绘 —— 内置专家用整张配图，自定义 Agent 用圆形头像（左对齐） */}
            {expert.id === "custom-avatar" ? (
              <div style={{
                width: "100%",
                display: "flex", alignItems: "center", justifyContent: "flex-start",
              }}>
                <div style={{
                  width: 100, height: 100, borderRadius: "50%",
                  overflow: "hidden",
                  background: "#EEEEEE",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 24px -4px rgba(0,0,0,0.10), 0 2px 6px -2px rgba(0,0,0,0.06)",
                  flexShrink: 0,
                }}>
                  {expert.avatar ? (
                    <img
                      src={expert.avatar}
                      alt={expert.fullName}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <span style={{
                      fontFamily: FONT, fontSize: 36, fontWeight: 600, color: "#FFFFFF",
                    }}>{(expert.codeName || expert.fullName).charAt(0)}</span>
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                width: "100%",
                aspectRatio: "659 / 579",
                borderRadius: 12,
                overflow: "hidden",
                position: "relative",
                marginBottom: -16,
              }}>
                <img
                  src={getHeroImage(expert.id, tier.tier)}
                  alt={expert.fullName}
                  onError={(e) => {
                    // 新立绘资源未落盘时回退到旧默认图，避免详情页立绘空白
                    const img = e.currentTarget as HTMLImageElement;
                    if (!img.src.endsWith("/agents/hero/default-agent.png")) {
                      img.src = "/agents/hero/default-agent.png";
                    }
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            {/* Name + Lv —— 徽章与第二行「数据工程专家」垂直居中对齐 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gridTemplateRows: "auto auto",
              columnGap: 8,
              rowGap: 2,
              alignItems: "center",
            }}>
              {/* 自定义 Agent 没有 code name，不渲染该行 */}
              {expert.id !== "custom-avatar" && (
                <div style={{
                  gridColumn: "1",
                  gridRow: "1",
                  fontFamily: "var(--font-pixelify-sans), 'Pixelify Sans', 'PingFang SC', sans-serif",
                  fontSize: 20, fontWeight: 500,
                  lineHeight: "28px", color: expert.nameColor,
                  letterSpacing: 0.5,
                  minWidth: 0,
                }}>{expert.codeName}</div>
              )}
              <div style={{
                gridColumn: "1",
                gridRow: "2",
                fontFamily: FONT, fontSize: 22, fontWeight: 600,
                lineHeight: "30px", color: C.textPrimary,
                minWidth: 0,
              }}>{expert.shortTitle}</div>
              <div style={{
                gridColumn: "2",
                gridRow: "2",
                alignSelf: "center",
                justifySelf: "end",
              }}>
                <LevelBadge level={level} />
              </div>
            </div>

            {/* 描述（紧贴名字下方，详情页专用短描述，控制在 15 字内） */}
            <p style={{
              margin: "-10px 0 0", fontFamily: FONT, fontSize: 13, fontWeight: 400,
              lineHeight: "20px", color: C.textSecondary,
            }}>
              {getShortDesc(expert.id, expert.desc)}
            </p>

            {/* 成长值进度条 */}
            <div>
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                fontFamily: FONT, lineHeight: "22px", height: 22,
              }}>
                <span style={{ fontSize: 13, fontWeight: 400, lineHeight: "20px", color: C.textSecondary }}>成长值</span>
                <span style={{ fontSize: 12, fontWeight: 400, color: C.textDisabled }}>{profile.growth.current}/{profile.growth.next}</span>
              </div>
              <div style={{ width: "100%", height: 10, borderRadius: 5, background: "rgba(0,0,0,0.06)", overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", left: 2, top: 2, width: `${Math.min(100, Math.round((profile.growth.current / profile.growth.next) * 100))}%`, height: 6, borderRadius: 3, background: tier.mainGradient }} />
              </div>
            </div>

            {/* 对话按钮（图标对齐 Agent 广场卡片） */}
            <button
              onClick={onDialog}
              style={{
                width: "100%", height: 40, borderRadius: 100,
                border: "1px solid #E9EBF0",
                background: "linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 55%)",
                boxShadow: "0px 2px 4px -2px rgba(0,0,0,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                cursor: "pointer", padding: "0 16px",
                fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.textPrimary,
                transition: "background 100ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#F2F4F8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 55%)"; }}
            >
              <img src="/icons/claw-mgr/dialog-icon.svg" alt="" style={{ width: 16, height: 16 }} />
              对话
            </button>

            {/* 分割线 */}
            <div style={{ height: 1, background: C.borderLight, margin: "4px 0" }} />

            {/* 雷达图 + 右侧 KPI（KPI 靠右） */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Radar values={radarValues} size={226} color={tier.mainSolid} gradient={tier.gradientStops} />
              <div style={{
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                gap: 20, paddingLeft: 4, paddingRight: 2,
                alignItems: "flex-end",
              }}>
                {profile.sideKpi.map((k) => (
                  <KPIItem key={k.label} value={k.value} label={k.label} />
                ))}
              </div>
            </div>

            {/* 分割线 */}
            <div style={{ height: 1, background: C.borderLight, margin: "4px 0" }} />

            {/* 元信息 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <MetaRow icon="birth" label={profile.meta.birth} />
              <MetaRow icon="creator" label={profile.meta.creator} />
              <MetaRow icon="tag" label={profile.meta.team} />
            </div>
          </div>
        </aside>

        {/* ── 右列 ── */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Agent 设定 —— 内容为 Markdown，固定高度 200px，内部滚动 */}
          <Card
            title="Agent 设定"
            style={{ height: 200, overflowY: "auto" }}
          >
            <SimpleMarkdown source={profile.setting} />
          </Card>

          {/* Agent 技能 + Agent 自进化（左右并排，固定 320px 内部滚动） */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Card
                title={`Agent 技能 (${profile.skills.length})`}
                extra={onConfigSkill ? (
                  <button
                    onClick={onConfigSkill}
                    style={{
                      height: 24, padding: "0 6px", borderRadius: 6, border: "none",
                      background: "transparent", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 4,
                      fontFamily: FONT, fontSize: 12, fontWeight: 500,
                      lineHeight: "20px", color: C.textPrimary,
                      transition: "background 100ms",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = C.hoverBg; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <img src="/icons/detail/settings.svg" alt="" style={{ width: 16, height: 16 }} />
                    配置 Skill
                  </button>
                ) : undefined}
                style={{ height: 320, overflowY: "auto", padding: "4px 20px 20px" }}
              >
                <SkillList items={profile.skills} onSkillClick={(s) => setSkillDetail({
                  title: s.name,
                  desc: s.desc,
                  category: s.category,
                  version: s.version,
                  author: s.author,
                })} />
              </Card>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <Card title="Agent 自进化" style={{ height: 320, overflowY: "auto" }}>
                <div style={{ marginBottom: 16 }}>
                  <PillTabs
                    tabs={[
                      { id: "evolve", label: "自进化概览" },
                      { id: "memory", label: "记忆沉淀" },
                    ] as const}
                    activeId={tab}
                    onChange={(id) => setTab(id as "evolve" | "memory")}
                    layoutId="agent-evolve-tab-indicator"
                    size="sm"
                  />
                </div>
                {tab === "evolve" ? (
                  <EvolutionTimeline items={profile.evolution} />
                ) : (
                  <MemoryList items={profile.memories} onItemClick={(item) => setMemoryDetail(item)} />
                )}
              </Card>
            </div>
          </div>

          {/* Agent 活跃度 */}
          <Card title="Agent 活跃度">
            <KPIGroup items={profile.kpi} />
            {/* 数据组与热力图之间分割线 */}
            <div style={{ height: 1, background: C.borderLight, margin: "20px 0" }} />
            <Heatmap />
          </Card>
        </main>
      </div>

      {/* Skill 详情弹窗 */}
      <AnimatePresence>
        {skillDetail && (
          <SkillDetailModal detail={skillDetail} onClose={() => setSkillDetail(null)} />
        )}
      </AnimatePresence>

      {/* 记忆沉淀详情弹窗 */}
      <AnimatePresence>
        {memoryDetail && (
          <MemoryDetailModal item={memoryDetail} onClose={() => setMemoryDetail(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 子组件 ────────────────────────────────────────────────────

// ── 等级阶级（B / A / S） ────────────────────────────────────
// 1-30 → B 阶 / 31-80 → A 阶 / 81+ → S 阶
// 每阶有：徽章背景图、徽章文字渐变、主色渐变（用于进度条/雷达图）、主色实体（SVG fill 兜底）
const LEVEL_TIERS = [
  {
    tier: "B" as const,
    max: 30,
    bg: "/agents/level/lv-1-30.png",
    gradient: "linear-gradient(180deg, #446A8C 0%, #365D72 73.12%)",
    mainGradient: "linear-gradient(90deg, #3B82F6 0%, #3DBBEE 49.57%, #2DD4BF 100%)",
    mainSolid: "#3DBBEE",
    gradientStops: { from: "#3B82F6", to: "#2DD4BF" },
  },
  {
    tier: "A" as const,
    max: 80,
    bg: "/agents/level/lv-31-80.png",
    gradient: "linear-gradient(180deg, #926444 0%, #664331 73.12%)",
    mainGradient: "linear-gradient(90deg, #F38927 0%, #FDDC6C 80.52%, #FFEAA1 100%)",
    mainSolid: "#F38927",
    gradientStops: { from: "#F38927", to: "#FFEAA1" },
  },
  {
    tier: "S" as const,
    max: Infinity,
    bg: "/agents/level/lv-81.png",
    gradient: "linear-gradient(180deg, #6A53A4 0%, #4F4077 73.12%)",
    mainGradient: "linear-gradient(90deg, #3E4DFA 0%, #C474FF 100%)",
    mainSolid: "#7C5EFA",
    gradientStops: { from: "#3E4DFA", to: "#C474FF" },
  },
] as const;

function getLevelTier(level: number) {
  return LEVEL_TIERS.find((t) => level <= t.max) ?? LEVEL_TIERS[LEVEL_TIERS.length - 1];
}

// ── 立绘资源映射 ───────────────────────────────────────────────
// 共 5 个序号 × B/A/S 三档：/agents/hero/<n><tier>.png
//   序号 1 暂不展示（仅存档）
//   序号 2 = 数据工程专家（dev-expert / Rigel）
//   序号 3 = 自定义 Agent（registry.avatars，详情页暂未使用，预留）
//   序号 4 = 智能管家（ops-expert / Orion）
//   序号 5 = 数据分析专家（analysis-expert / Vega）
function getHeroImage(expertId: string, tier: "B" | "A" | "S"): string {
  const expertSlotMap: Record<string, number> = {
    "dev-expert": 2,
    "custom-avatar": 3,   // 自定义 Agent 详情页立绘
    "ops-expert": 4,
    "analysis-expert": 5,
  };
  const slot = expertSlotMap[expertId] ?? 2;
  return `/agents/hero/${slot}${tier}.png`;
}

function LevelBadge({ level }: { level: number }) {
  const tier = getLevelTier(level);
  // 切图原始尺寸 129×48，长宽比 ≈ 2.6875；按高度 32 等比缩放，宽度自适应 = 32 × 2.6875 = 86
  const H = 32;
  const W = Math.round(H * (129 / 48)); // 86
  return (
    <div style={{
      width: W, height: H, flexShrink: 0,
      backgroundImage: `url(${tier.bg})`,
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
      position: "relative",
    }}>
      {/* 绝对定位 + 100% 宽高 + flex 居中：italic 不会撑高基线，文字始终位于背景几何中心 */}
      <span style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "'Geom', 'GeomBold', var(--font-geist-sans), 'PingFang SC', sans-serif",
        fontSize: 20, fontWeight: 700, fontStyle: "italic",
        lineHeight: 1, letterSpacing: 0.2,
        background: tier.gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        // 兼容性兜底
        color: "#365D72",
        // italic 视觉重心略偏左，向右补偿，让文字居于背景几何中心
        paddingLeft: 2,
      }}>Lv. {level}</span>
    </div>
  );
}

function KPIItem({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{
        fontFamily: "'Geom', 'GeomMedium', var(--font-geist-sans), 'PingFang SC', sans-serif",
        fontSize: 16, fontWeight: 500, lineHeight: "24px",
        color: C.textPrimary, fontFeatureSettings: '"tnum"',
      }}>{value}</div>
      <div style={{
        marginTop: 2, fontFamily: FONT, fontSize: 12, fontWeight: 500,
        lineHeight: "22px", color: C.textTertiary,
      }}>{label}</div>
    </div>
  );
}

// ── 顶部操作按钮（图标 + 文字，参考 ardot 2400:3868） ─────────
function HeaderActionButton({ label, onClick, children }: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        height: 32, padding: "0 12px", borderRadius: 8, border: "none",
        background: "transparent", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 4,
        fontFamily: FONT, fontSize: 13, fontWeight: 400,
        color: "rgba(0,0,0,0.9)",
        transition: "background 100ms",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = C.hoverBg; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function MetaRow({ icon, label }: { icon: "birth" | "creator" | "tag"; label: string }) {
  const src = icon === "birth" ? "/icons/detail/birth.svg"
    : icon === "creator" ? "/icons/detail/creator.svg"
    : "/icons/detail/tag.svg";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* 用 mask 渲染图标，颜色由 backgroundColor 控制（图标本身的硬编码 fill 不会生效） */}
      <span
        aria-hidden
        style={{
          width: 16, height: 16, flexShrink: 0, display: "inline-block",
          backgroundColor: C.textTertiary,
          WebkitMaskImage: `url(${src})`,
          maskImage: `url(${src})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
      <span style={{
        flex: 1, fontFamily: FONT, fontSize: 13, fontWeight: 400,
        lineHeight: "20px", color: C.textTertiary,
      }}>{label}</span>
    </div>
  );
}
