"use client";

import React from "react";
import { ClusterAvatar } from "@/components/ui/secondary-nav";
import { IconAiNewChat } from "@/components/ui/wedata-icons";
import { PillTabs } from "@/components/ui/skill-plaza";
import { SimpleMarkdown, getShortDesc } from "@/components/ui/agent-detail";
import type { Team, BuiltinExpert } from "@/lib/agent-registry";

// ── Design tokens（与 agent-detail 完全一致） ─────────────────
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
  brand: "#00B6C3",
  brandLight: "#E6F7F9",
  green: "#00B96B",
  greenLight: "#C8EFD7",
  greenSoft: "#E8F7EE",
  greenFaint: "#F4FBF6",
  orange: "#FF7A00",
  hoverBg: "#F4F5F8",
  chipBg: "#F2F4F7",
  titlebarBg: "#F9FAFC",
} as const;

// ── 公共：Card（与 AgentDetail 一致） ─────────────────────────
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

// ── 短描述 ────────────────────────────────────────────────────
const TEAM_SHORT_DESC_MAP: Record<string, string> = {
  "bigdata-team": "数据开发、分析、运维协作团队",
  "ops-team": "数据 + 运营协同，聚焦业务指标",
};
export function getTeamShortDesc(teamId: string, fallback: string): string {
  return TEAM_SHORT_DESC_MAP[teamId] ?? fallback;
}

// ── 雷达图（5 维，支持渐变色） ────────────────────────────────
const RADAR_AXES = ["ETL处理", "智能分析", "数据查询", "预测能力", "决策支持"] as const;

function Radar({ values, size = 220, color = C.brand, gradient }: { values: number[]; size?: number; color?: string; gradient?: { from: string; to: string } }) {
  const cx = size / 2;
  const cy = size / 2;
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
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon key={k} points={polygonPoints(k)} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={1} />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const [x1, y1] = pointAt(i, 1);
        const [x2, y2] = pointAt(i, 0.25);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,0,0,0.06)" strokeWidth={1} />;
      })}
      <polygon
        points={dataPoints}
        fill={gradient ? `url(#${gradientId})` : color}
        fillOpacity={0.22}
        stroke={gradient ? `url(#${gradientId})` : color}
        strokeWidth={1.5}
      />
      {RADAR_AXES.map((label, i) => {
        const a = angleFor(i);
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        const baseK = 1.25;
        const [x, y] = pointAt(i, baseK);
        const eps = 0.2;
        const anchor: "start" | "middle" | "end" =
          cosA > eps ? "start" : cosA < -eps ? "end" : "middle";
        const baseline: "auto" | "middle" | "hanging" =
          sinA < -eps ? "auto" : sinA > eps ? "hanging" : "middle";
        const PER_AXIS_OFFSET: Array<[number, number]> = [
          [0, 10], [-20, 0], [-10, -10], [10, -10], [20, 0],
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

// ── KPIGroup（与 AgentDetail 一致：Geom 20px Medium） ─────────
function KPIGroup({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
      {items.map((it, i) => (
        <div key={i} style={{ flex: 1, padding: "0 20px 0 0" }}>
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

// ── 侧栏 KPI（与 AgentDetail 一致：Geom 16px Medium，右对齐） ─
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

// ── 热力图（与 AgentDetail 一致：自适应 + tooltip） ───────────
const HEATMAP_WEEKS = 52;
const HEATMAP_DAYS = 7;
const HEATMAP_LEVELS = [
  "#EEF2F5", C.greenFaint, C.greenSoft, C.greenLight, C.green,
] as const;
const MONTH_LABELS = ["8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月"];
const DAY_LABELS = ["", "周二", "", "周四", "", "周六", ""];

function Heatmap() {
  const LEVEL_DESC = ["不活跃", "轻度活跃", "活跃", "高度活跃", "极度活跃"] as const;
  const today = React.useMemo(() => new Date(2026, 4, 19), []);
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
      const events = level === 0 ? 0 : Math.floor(level * 3 + rnd * 8);
      const daysAgo = (HEATMAP_WEEKS - 1 - w) * 7 + (HEATMAP_DAYS - 1 - d);
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      col.push({ level, alert, date, events });
    }
    cells.push(col);
  }

  const containerRef = React.useRef<HTMLDivElement>(null);
  const maxWidthRef = React.useRef<number>(0);
  const LABEL_W = 28;
  const LABEL_GAP = 6;
  const GAP = 3;
  const CELL_MIN = 10;
  const CELL_MAX = 80;
  const [cell, setCell] = React.useState<number>(16);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const compute = () => {
      const w = el.clientWidth;
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
  const gridInnerWidth = LABEL_W + LABEL_GAP + HEATMAP_WEEKS * CELL + (HEATMAP_WEEKS - 1) * GAP;

  const [hover, setHover] = React.useState<
    | { x: number; y: number; date: Date; events: number; level: number; alert?: boolean }
    | null
  >(null);

  const fmtDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <div style={{ overflowX: "auto", scrollbarWidth: "thin" }}>
        <div style={{ minWidth: gridInnerWidth, display: "flex", flexDirection: "column", gap: 6 }}>
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
                <div key={w} style={{ width: CELL + GAP, whiteSpace: "nowrap", overflow: "visible" }}>
                  {showLabel ? MONTH_LABELS[monthIdx] : ""}
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `${LABEL_W}px 1fr`, gap: LABEL_GAP }}>
            <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
              {DAY_LABELS.map((d, i) => (
                <div key={i} style={{
                  height: CELL, fontFamily: FONT, fontSize: 11,
                  lineHeight: `${CELL}px`, color: C.textTertiary,
                }}>{d}</div>
              ))}
            </div>
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
      {hover && (
        <div style={{
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
        }}>
          <div style={{ fontWeight: 500 }}>{fmtDate(hover.date)}</div>
          <div style={{ opacity: 0.85 }}>
            {hover.alert
              ? "自进化触发"
              : hover.level === 0
                ? "无活跃记录"
                : `${LEVEL_DESC[hover.level]} · ${hover.events} 条会话`}
          </div>
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

// ── 等级阶级（B/A/S，与 AgentDetail 一致） ────────────────────
const LEVEL_TIERS = [
  {
    tier: "B" as const, max: 30,
    bg: "/agents/level/lv-1-30.png",
    gradient: "linear-gradient(180deg, #446A8C 0%, #365D72 73.12%)",
    mainGradient: "linear-gradient(90deg, #3B82F6 0%, #3DBBEE 49.57%, #2DD4BF 100%)",
    mainSolid: "#3DBBEE",
    gradientStops: { from: "#3B82F6", to: "#2DD4BF" },
  },
  {
    tier: "A" as const, max: 80,
    bg: "/agents/level/lv-31-80.png",
    gradient: "linear-gradient(180deg, #926444 0%, #664331 73.12%)",
    mainGradient: "linear-gradient(90deg, #F38927 0%, #FDDC6C 80.52%, #FFEAA1 100%)",
    mainSolid: "#F38927",
    gradientStops: { from: "#F38927", to: "#FFEAA1" },
  },
  {
    tier: "S" as const, max: Infinity,
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

// ── 等级徽章（背景图 + 渐变文字，与 AgentDetail 左侧基本信息一致） ─
// size: "md" 默认 32px 高（左侧基本信息）；"sm" 20px 高（团队成员卡片紧凑展示）
function LevelBadge({ level, size = "md" }: { level: number; size?: "md" | "sm" }) {
  const tier = getLevelTier(level);
  const H = size === "sm" ? 20 : 32;
  const W = Math.round(H * (129 / 48));
  const fontSize = size === "sm" ? 12 : 20;
  return (
    <div style={{
      width: W, height: H, flexShrink: 0,
      backgroundImage: `url(${tier.bg})`,
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
      position: "relative",
    }}>
      <span style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        textAlign: "center",
        fontFamily: "'GeomBoldItalic', 'Geom', 'GeomBold', var(--font-geist-sans), 'PingFang SC', sans-serif",
        fontSize, fontWeight: 700, fontStyle: "italic",
        lineHeight: 1, letterSpacing: 0.2,
        background: tier.gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        color: "#365D72",
        paddingLeft: 2,
      }}>Lv. {level}</span>
    </div>
  );
}

// ── 自进化时间线（带成员小头像，team-only） ─────────────────────
interface EvoItem {
  title: string;
  desc: string;
  avatar?: string;
  /** 关联到具体成员名（可选）：hover 头像时展示 */
  agentName?: string;
  date?: string;
  level?: string;
  exp?: string;
}

function EvolutionTimeline({ items }: { items: EvoItem[] }) {
  // 当前 hover 的小头像 tooltip
  const [hover, setHover] = React.useState<{ x: number; y: number; name: string } | null>(null);

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 18 }}>
      {items.map((it, i) => (
        <li key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
          <div style={{
            width: 6, height: 6, borderRadius: 3,
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
          {it.avatar && (
            <img
              src={it.avatar}
              alt={it.agentName ?? ""}
              onMouseEnter={(e) => {
                if (!it.agentName) return;
                const rect = (e.currentTarget as HTMLImageElement).getBoundingClientRect();
                setHover({
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                  name: it.agentName,
                });
              }}
              onMouseLeave={() => setHover(null)}
              style={{
                width: 24, height: 24, borderRadius: 12, objectFit: "cover",
                flexShrink: 0, cursor: it.agentName ? "default" : "auto",
              }}
            />
          )}
        </li>
      ))}

      {/* Hover tooltip — fixed 定位（与 Heatmap tooltip 同风格） */}
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
          {hover.name}
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
    </ul>
  );
}

// ── 团队成员卡片（仅展示信息，点击跳转对应 Agent） ───────────────
function MemberCard({ avatar, name, level, desc, onCardClick }: {
  avatar?: string;
  name: string;
  level: string;
  desc: string;
  onCardClick?: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={onCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: 0,
        background: C.cardBg, borderRadius: 16,
        border: `1px solid ${C.border}`, padding: 20,
        display: "flex", gap: 12,
        cursor: "pointer", transition: "box-shadow 150ms",
        boxShadow: hovered ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
      }}
    >
      {avatar ? (
        <img
          src={avatar}
          alt=""
          style={{ width: 48, height: 48, borderRadius: 24, objectFit: "cover", flexShrink: 0 }}
        />
      ) : (
        <div style={{ width: 48, height: 48, borderRadius: 24, background: C.brandLight, flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 4, marginBottom: 4,
        }}>
          <span style={{
            fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.textPrimary,
            lineHeight: "22px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            minWidth: 0,
          }}>{name}</span>
          {(() => {
            const m = /Lv\.\s*(\d+)/.exec(level);
            const lv = m ? parseInt(m[1], 10) : 1;
            return <LevelBadge level={lv} size="sm" />;
          })()}
        </div>
        <div style={{
          fontFamily: FONT, fontSize: 12, fontWeight: 400,
          color: C.textTertiary, lineHeight: "20px",
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
        }}>{desc}</div>
      </div>
    </div>
  );
}

// ── header 操作按钮（与 AgentDetail HeaderActionButton 一致） ──
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

// ── MetaRow（与 AgentDetail 一致：mask 图标 + textTertiary） ──
function MetaRow({ icon, label }: { icon: "birth" | "creator" | "tag"; label: string }) {
  const src = icon === "birth" ? "/icons/detail/birth.svg"
    : icon === "creator" ? "/icons/detail/creator.svg"
    : "/icons/detail/tag.svg";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

// ── 主组件 ────────────────────────────────────────────────────
export interface TeamDetailProps {
  team: Team;
  experts: BuiltinExpert[];
  onBack?: () => void;
  onDialog?: () => void;
  onMemberManage?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  /** 团队成员卡片整体点击 —— 进入该成员的 Agent 详情页 */
  onMemberClick?: (memberId: string) => void;
  secondaryCollapsed?: boolean;
  onNewChat?: () => void;
  onExpandSecondary?: () => void;
}

export default function TeamDetail({
  team, experts, onBack, onDialog, onMemberManage, onEdit, onDelete,
  onMemberClick,
  secondaryCollapsed, onNewChat, onExpandSecondary,
}: TeamDetailProps) {
  const [tab, setTab] = React.useState<"evolve" | "memory">("evolve");

  // ── Mock 等级 & 阶级（团队 mock：Lv.12 → B 阶） ───────────
  const level = 12;
  const tier = getLevelTier(level);
  const radarValues = [88, 92, 85, 75, 70];
  const sideKpi = [
    { value: "24", label: "掌握技能" },
    { value: "92.2%", label: "任务成功率" },
    { value: "98.2%", label: "平均响应速度" },
  ];

  // ── 团队设定 Markdown：融合 dev / ops / analysis 三位专家的能力 ──
  const teamSetting = `👋 我们是 **${team.name}**，由 ${team.members.length} 位专家组成的一站式数据服务团队，覆盖 **数据工程 · 数据分析 · 智能管家** 全链路。

### 团队能力

#### 数据工程（Rigel）
- **建模与开发**：基于业务语义沉淀维度 / 事实模型，覆盖 ODS → DWD → DWS → ADS 全链路
- **质量与调优**：SQL Profile 分析、Shuffle 倾斜定位、PPD 启用诊断、CBO 参数调优
- **调度与编排**：基于上下游依赖自动生成调度方案，识别关键路径与资源冲突

#### 数据分析（Vega）
- **指标体系**：DAU、GMV、留存、客单价等核心指标的口径定义与监控
- **归因分析**：基于 Shapley / 渠道贡献模型量化营销 / 产品改动的影响
- **趋势预测**：时间序列分解、季节性建模、异常检测
- **可视化**：自动生成趋势图、漏斗图、热力图、归因瀑布图

#### 智能管家（Orion）
- **集群健康巡检**：CPU / 内存 / 磁盘 / 网络指标实时监控
- **故障应急**：SEV 等级评估、根因分析、止损动作选型、跨组拉群
- **容量规划**：基于历史负载与业务增长预测扩缩容时点
- **性能调优**：定位慢查询根因，输出 EMR / Presto 集群级优化方案

### 协作模式
- 默认 **Rigel 调度 / 分发**，按任务领域转给 Vega 或 Orion
- 凌晨告警 / 故障应急由 Orion 7×24 在岗
- 重要变更先在团队内交叉评审，再提交人类审批

### 团队边界
- 生产 \`DROP\` / \`TRUNCATE\` / 强制重启必须人类审批（**强制**）
- 跨业务线数据访问需要主管授权
- 涉及用户隐私字段（手机 / 身份证）必须经过脱敏与权限审批
- 高风险变更不会在没有 *回滚方案* 的前提下执行`;

  // 默认 cluster 头像
  const clusterImgs = team.clusterImgs ?? team.members.slice(0, team.members.length >= 4 ? 4 : 3).map((m) =>
    m.avatar ? m.avatar : { letter: m.abbr, bg: m.abbrBg }
  );

  // 团队成员 → 展示数据
  // 按 expert.id 给定不同 Lv（与首页总览图 / AgentDetail PROFILE_* 等级一致）
  const memberLevelMap: Record<string, string> = {
    "dev-expert": "Lv. 12",      // B 阶
    "ops-expert": "Lv. 35",      // A 阶
    "analysis-expert": "Lv. 88", // S 阶
  };
  const memberCards = team.members.slice(0, 3).map((m) => {
    const expert = experts.find((e) => e.fullName.includes(m.name.replace("大数据", "")) || m.name.includes(e.shortTitle));
    return {
      id: m.id,
      /** 关联到内置专家 id（命中时存在），用于对外触发详情页 / 对话 */
      expertId: expert?.id,
      avatar: m.avatar,
      name: expert ? expert.fullName : m.name,
      level: expert ? (memberLevelMap[expert.id] ?? "Lv. 12") : "Lv. 12",
      desc: expert ? getShortDesc(expert.id, expert.desc) : m.category,
    };
  });

  // mock 自进化时间线，带成员小头像
  // 头像 + 名称：按 team.members 顺序提取（同 index 关联）
  const memberAvatarPairs = team.members
    .map((m) => {
      const expert = experts.find((e) => e.fullName.includes(m.name.replace("大数据", "")) || m.name.includes(e.shortTitle));
      return { avatar: m.avatar, name: expert?.fullName ?? m.name };
    })
    .filter((p) => Boolean(p.avatar));
  const memberAvatars = memberAvatarPairs.map((p) => p.avatar as string);
  const memberNames = memberAvatarPairs.map((p) => p.name);
  const evoItems: EvoItem[] = [
    { title: "新增技能「处理 Shuffle 倾斜」", desc: "2 天前 · 来自用户手动沉淀，已引用 6 次", avatar: memberAvatars[0], agentName: memberNames[0] },
    { title: "新增 3 条记忆「JOIN 顺序优化」", desc: "2 周前 · 基于 11 次历史相似场景", avatar: memberAvatars[1], agentName: memberNames[1] },
    { title: "新增记忆「PPD 未启用用 CLUSTER BY」", desc: "5 天前 · 来自用户手动沉淀，已引用 6 次", avatar: memberAvatars[2], agentName: memberNames[2] },
    { title: "新增技能「分区表调优」", desc: "1 月前 · 用户批准的 Agent 提议", avatar: memberAvatars[0], agentName: memberNames[0] },
    { title: "初始版本", desc: "" },
  ];

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
        }}>{team.name}（{team.members.length}）</span>

        {/* 右上角操作（除默认大数据团队外，其他团队展示编辑 / 删除） */}
        {team.id !== "bigdata-team" && (onEdit || onDelete) && (
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
            {/* 头像 —— ClusterAvatar 直接展示，无外层背景/阴影（团队详情专属） */}
            <div style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "flex-start",
            }}>
              <ClusterAvatar imgs={clusterImgs} size={100} />
            </div>

            {/* 名称（团队不展示等级 / 成长值） */}
            <div style={{
              fontFamily: FONT, fontSize: 22, fontWeight: 600,
              lineHeight: "30px", color: C.textPrimary,
              minWidth: 0,
            }}>{team.name}</div>

            {/* 短描述（紧贴标题下方） */}
            <p style={{
              margin: "-10px 0 0", fontFamily: FONT, fontSize: 13, fontWeight: 400,
              lineHeight: "20px", color: C.textSecondary,
            }}>
              {getTeamShortDesc(team.id, team.desc)}
            </p>

            {/* 对话按钮 */}
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

            {/* 雷达图 + 侧栏 KPI */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Radar values={radarValues} size={226} color={tier.mainSolid} gradient={tier.gradientStops} />
              <div style={{
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                gap: 20, paddingLeft: 4, paddingRight: 2,
                alignItems: "flex-end",
              }}>
                {sideKpi.map((k) => (
                  <KPIItem key={k.label} value={k.value} label={k.label} />
                ))}
              </div>
            </div>

            {/* 分割线 */}
            <div style={{ height: 1, background: C.borderLight, margin: "4px 0" }} />

            {/* 元信息 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <MetaRow icon="birth" label="诞生于 2025-03-12（357 天前）" />
              <MetaRow icon="creator" label="由 user2 创建" />
            </div>
          </div>
        </aside>

        {/* ── 右列 ── */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 团队设定 —— 固定 200px，内部滚动；内容为 Markdown，融合三位成员能力 */}
          <Card title="团队设定" style={{ height: 200, overflowY: "auto" }}>
            <SimpleMarkdown source={teamSetting} />
          </Card>

          {/* 团队成员 —— 标题行（与 Card title 同样的样式） + 独立白卡片 grid，最多 3 列 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <header style={{
              height: 32,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 4px",
            }}>
              <h3 style={{
                margin: 0, fontFamily: FONT, fontSize: 14, fontWeight: 600,
                lineHeight: "22px", color: C.textPrimary,
              }}>团队成员 ({team.members.length})</h3>
              {onMemberManage && (
                <button
                  onClick={onMemberManage}
                  style={{
                    height: 24, padding: "0 8px", borderRadius: 6, border: "none",
                    background: "transparent", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                    fontFamily: FONT, fontSize: 12, fontWeight: 400,
                    color: C.brand,
                    transition: "background 100ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C.hoverBg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  成员管理
                </button>
              )}
            </header>
            <div style={{
              display: "grid",
              // 一行最多 3 列等宽，自动适配剩余宽度
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
            }}>
              {memberCards.map((m) => {
                // 优先用 expertId 触发回调（命中内置专家时跳详情页 / 召唤）；
                // 未命中则回退到 member.id，保持向后兼容
                const targetId = m.expertId ?? m.id;
                return (
                  <MemberCard
                    key={m.id}
                    avatar={m.avatar}
                    name={m.name}
                    level={m.level}
                    desc={m.desc}
                    onCardClick={onMemberClick ? () => onMemberClick(targetId) : undefined}
                  />
                );
              })}
            </div>
          </div>

          {/* 团队自进化 —— 固定 320px，内部滚动（与 AgentDetail 同样比例） */}
          <Card title="团队自进化" style={{ height: 320, overflowY: "auto" }}>
            <div style={{ marginBottom: 16 }}>
              <PillTabs
                tabs={[
                  { id: "evolve", label: "自进化概览" },
                  { id: "memory", label: "记忆沉淀" },
                ] as const}
                activeId={tab}
                onChange={(id) => setTab(id as "evolve" | "memory")}
                layoutId="team-evolve-tab-indicator"
                size="sm"
              />
            </div>
            {tab === "evolve" ? (
              <EvolutionTimeline items={evoItems} />
            ) : (
              <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: FONT, fontSize: 13, color: C.textTertiary }}>
                暂无记忆沉淀数据
              </div>
            )}
          </Card>

          {/* 团队活跃度 —— KPIGroup + 分割线 + Heatmap */}
          <Card title="团队活跃度">
            <KPIGroup items={[
              { value: "1247", label: "会话次数" },
              { value: "6", label: "进化" },
              { value: "24", label: "技能" },
              { value: "27", label: "合并请求" },
            ]} />
            <div style={{ height: 1, background: C.borderLight, margin: "20px 0" }} />
            <Heatmap />
          </Card>
        </main>
      </div>
    </div>
  );
}
