"use client";

import React from "react";
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
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {(title || extra) && (
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 4px",
        }}>
          {title && <h3 style={{
            margin: 0, fontFamily: FONT, fontSize: 16, fontWeight: 600,
            lineHeight: "24px", color: C.textPrimary,
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
            fontFamily={FONT}
            fill={C.textSecondary}
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
          flex: 1, padding: "0 20px",
          borderLeft: i === 0 ? "none" : `1px solid ${C.borderLight}`,
        }}>
          <div style={{
            fontFamily: FONT, fontSize: 28, fontWeight: 600,
            lineHeight: "36px", color: C.textPrimary,
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
  // 用确定性伪随机生成数据
  const cells: { level: number; alert?: boolean }[][] = [];
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    const col: { level: number; alert?: boolean }[] = [];
    for (let d = 0; d < HEATMAP_DAYS; d++) {
      const seed = (w * 7 + d) * 9301 + 49297;
      const rnd = ((seed % 233280) / 233280);
      let level = 0;
      if (rnd < 0.12) level = 0;
      else if (rnd < 0.4) level = 1;
      else if (rnd < 0.7) level = 2;
      else if (rnd < 0.92) level = 3;
      else level = 4;
      // 偶发橙色告警点
      const alert = (rnd > 0.985);
      col.push({ level, alert });
    }
    cells.push(col);
  }

  const CELL = 12;
  const GAP = 3;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* 月份标签 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `28px repeat(${HEATMAP_WEEKS}, ${CELL + GAP}px)`,
        fontFamily: FONT, fontSize: 11, color: C.textTertiary, lineHeight: "16px",
      }}>
        <div />
        {Array.from({ length: HEATMAP_WEEKS }, (_, w) => {
          // 大约每 4-5 周显示一个月份
          const monthIdx = Math.floor((w / HEATMAP_WEEKS) * MONTH_LABELS.length);
          const showLabel = w % 4 === 2 && monthIdx < MONTH_LABELS.length;
          return (
            <div key={w} style={{ width: CELL + GAP }}>
              {showLabel ? MONTH_LABELS[monthIdx] : ""}
            </div>
          );
        })}
      </div>
      {/* 7 行 × 52 列网格 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `28px 1fr`,
        gap: 6,
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
              style={{
                width: CELL, height: CELL, borderRadius: 2,
                background: c.alert ? C.orange : HEATMAP_LEVELS[c.level],
              }}
            />
          ))}
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
            width: 6, height: 6, borderRadius: 3, background: i === items.length - 1 ? C.textQuaternary : C.brand,
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
            <div style={{
              fontFamily: FONT, fontSize: 13, fontWeight: 500,
              lineHeight: "20px", color: it.level === "Lv.1" ? C.textQuaternary : C.brand,
            }}>{it.level}</div>
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

// ── 技能列表 ──────────────────────────────────────────────────
interface SkillItem {
  name: string;
  desc: string;
  tag: "task" | "builtin" | "skillhub";
}

const DEFAULT_SKILLS: SkillItem[] = [
  { name: "incident-runbook-v2", desc: "基于历史故障经验沉淀的 runbook，覆盖 OOM、磁盘满、慢查询场景", tag: "task" },
  { name: "Cluster-Health-Monitor", desc: "集群健康巡检，实时监控 CPU / 内存 / 磁盘 / 网络指标", tag: "builtin" },
  { name: "Presto-Native-Executor", desc: "Presto 原生 C++ 算子加速，3-5x 性能提升", tag: "skillhub" },
  { name: "Capacity-Forecaster", desc: "基于历史数据预测集群容量需求，辅助扩缩容决策", tag: "skillhub" },
  { name: "Presto-Native-Executor", desc: "Presto 原生 C++ 算子加速，3-5x 性能提升", tag: "skillhub" },
];

function SkillList({ items = DEFAULT_SKILLS }: { items?: SkillItem[] }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((s, i) => (
        <li
          key={i}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            background: C.titlebarBg,
            border: `1px solid ${C.borderLight}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: FONT, fontSize: 14, fontWeight: 600,
              lineHeight: "22px", color: C.textPrimary,
            }}>{s.name}</span>
            {s.tag === "task" && <Chip tone="warm">任务中补齐</Chip>}
            {s.tag === "builtin" && <Chip tone="blue">内置 Skill</Chip>}
            {s.tag === "skillhub" && <Chip tone="green">SkillHub</Chip>}
          </div>
          <p style={{
            margin: "4px 0 0", fontFamily: FONT, fontSize: 13, fontWeight: 400,
            lineHeight: "20px", color: C.textTertiary,
          }}>{s.desc}</p>
        </li>
      ))}
    </ul>
  );
}

// ── 主组件 ────────────────────────────────────────────────────
export interface AgentDetailProps {
  expert: BuiltinExpert;
  onBack?: () => void;
  onDialog?: () => void;
  onConfigSkill?: () => void;
}

export default function AgentDetail({ expert, onBack, onDialog, onConfigSkill }: AgentDetailProps) {
  const [tab, setTab] = React.useState<"evolve" | "memory">("evolve");

  // Mock 等级 & 阶级（决定徽章 / 进度条 / 雷达图主色）
  const level = 12;
  const tier = getLevelTier(level);

  // Mock 雷达数据
  const radarValues = [85, 92, 88, 70, 65];

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
      </header>

      {/* ── 主体：左右分栏 ── */}
      <div style={{
        flex: 1, minHeight: 0, overflowY: "auto",
        padding: "20px 32px",
        display: "flex", gap: 28,
      }}>
        {/* ── 左列：单卡片，内部用分割线分区 ── */}
        <aside style={{ width: 320, flexShrink: 0 }}>
          <div style={{
            background: "transparent",
            padding: 0,
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            {/* 立绘 —— 大数据 Agent / 自定义 Agent 统一使用这张配图（按切图比例 659:579） */}
            <div style={{
              width: "100%",
              aspectRatio: "659 / 579",
              borderRadius: 12,
              overflow: "hidden",
              position: "relative",
            }}>
              <img
                src="/agents/hero/default-agent.png"
                alt={expert.fullName}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Name + Lv —— 徽章与第二行「数据开发专家」垂直居中对齐 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gridTemplateRows: "auto auto",
              columnGap: 8,
              rowGap: 2,
              alignItems: "center",
            }}>
              <div style={{
                gridColumn: "1",
                gridRow: "1",
                fontFamily: "var(--font-pixelify-sans), 'Pixelify Sans', 'PingFang SC', sans-serif",
                fontSize: 14, fontWeight: 500,
                lineHeight: "20px", color: expert.nameColor,
                letterSpacing: 0.5,
                minWidth: 0,
              }}>{expert.codeName}</div>
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

            {/* 成长值进度条 */}
            <div>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                fontFamily: FONT, fontSize: 13, fontWeight: 400, lineHeight: "20px",
                color: C.textPrimary, marginBottom: 6,
              }}>
                <span>成长值</span>
                <span>500 / 2000</span>
              </div>
              <div style={{ width: "100%", height: 6, borderRadius: 3, background: C.borderLight, overflow: "hidden" }}>
                <div style={{ width: "25%", height: "100%", borderRadius: 3, background: tier.mainGradient }} />
              </div>
            </div>

            {/* 描述 */}
            {/* 描述 */}
            <p style={{
              margin: 0, fontFamily: FONT, fontSize: 13, fontWeight: 400,
              lineHeight: "20px", color: C.textPrimary,
            }}>
              {expert.desc}
            </p>

            {/* 标签 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["集群监控", "故障排查", "容量规划", "性能调优"].map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
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
                <KPIItem value="24" label="掌握技能" />
                <KPIItem value="92.2%" label="任务成功率" />
                <KPIItem value="98.2%" label="平均响应速度" />
              </div>
            </div>

            {/* 分割线 */}
            <div style={{ height: 1, background: C.borderLight, margin: "4px 0" }} />

            {/* 元信息 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <MetaRow icon="birth" label="诞生于 2025-03-12（357 天前）" />
              <MetaRow icon="creator" label="由 user2 创建" />
              <MetaRow icon="tag" label="大数据团队2、运营团队、集群管理团队" />
            </div>
          </div>
        </aside>

        {/* ── 右列 ── */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Agent 设定 */}
          <Card title="Agent 设定">
            <p style={{
              margin: 0, fontFamily: FONT, fontSize: 14,
              lineHeight: "22px", color: C.textSecondary,
              display: "flex", alignItems: "flex-start", gap: 8,
            }}>
              <span style={{ flexShrink: 0 }}>👋</span>
              <span>我是{expert.codeName}·{expert.shortTitle}</span>
            </p>
            <p style={{
              margin: "10px 0 0", fontFamily: FONT, fontSize: 14,
              lineHeight: "22px", color: C.textSecondary,
            }}>{expert.desc}</p>
            <div style={{ marginTop: 14 }}>
              <div style={{
                fontFamily: FONT, fontSize: 14, fontWeight: 500,
                lineHeight: "22px", color: C.textPrimary, marginBottom: 6,
              }}>我擅长</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                <li style={{ fontFamily: FONT, fontSize: 13, lineHeight: "22px", color: C.textSecondary }}>集群健康巡检 — CPU / 内存 / 磁盘 / 网络指标实时监控</li>
                <li style={{ fontFamily: FONT, fontSize: 13, lineHeight: "22px", color: C.textSecondary }}>故障应急 — SEV 等级评估、根因分析</li>
                <li style={{ fontFamily: FONT, fontSize: 13, lineHeight: "22px", color: C.textSecondary }}>容量规划 — 基于历史数据预测扩缩容需求</li>
              </ul>
            </div>
          </Card>

          {/* Agent 技能 */}
          <Card
            title={`Agent 技能 (${expert.skills.length})`}
            extra={
              <button
                onClick={onConfigSkill}
                style={{
                  height: 28, padding: "0 12px", borderRadius: 14,
                  border: `1px solid ${C.borderLight}`, background: "#FFFFFF",
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
                  fontFamily: FONT, fontSize: 13, color: C.textSecondary,
                }}
              >
                <span style={{ width: 14, height: 14, display: "inline-flex" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1L8.5 5.5L13 5.5L9.25 8.3L10.75 13L7 10.2L3.25 13L4.75 8.3L1 5.5L5.5 5.5L7 1Z" stroke="rgba(0,0,0,0.6)" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
                  </svg>
                </span>
                配置 Skill
              </button>
            }
          >
            <SkillList />
          </Card>

          {/* Agent 活跃度 */}
          <Card title="Agent 活跃度">
            <KPIGroup items={[
              { value: "1247", label: "会话次数" },
              { value: "6", label: "进化" },
              { value: "24", label: "技能" },
              { value: "27", label: "合并请求" },
            ]} />
            <div style={{ marginTop: 20 }}>
              <Heatmap />
            </div>
          </Card>

          {/* Agent 自进化 */}
          <Card title="Agent 自进化">
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              <TabBtn active={tab === "evolve"} onClick={() => setTab("evolve")}>自进化概览</TabBtn>
              <TabBtn active={tab === "memory"} onClick={() => setTab("memory")}>记忆沉淀</TabBtn>
            </div>
            {tab === "evolve" ? (
              <EvolutionTimeline />
            ) : (
              <div style={{
                padding: "40px 20px", textAlign: "center",
                fontFamily: FONT, fontSize: 13, color: C.textTertiary,
              }}>暂无记忆沉淀数据</div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}

// ── 子组件 ────────────────────────────────────────────────────
function TabBtn({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 32, padding: "0 14px", borderRadius: 16,
        border: "none", cursor: "pointer",
        background: active ? C.brandLight : "transparent",
        color: active ? C.brand : C.textSecondary,
        fontFamily: FONT, fontSize: 14,
        fontWeight: active ? 600 : 400,
        transition: "background 100ms",
      }}
    >
      {children}
    </button>
  );
}

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
      <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, lineHeight: "28px", color: C.textPrimary, fontFeatureSettings: '"tnum"' }}>{value}</div>
      <div style={{ marginTop: 2, fontFamily: FONT, fontSize: 12, color: C.textTertiary, lineHeight: "18px" }}>{label}</div>
    </div>
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
        lineHeight: "20px", color: C.textPrimary,
      }}>{label}</span>
    </div>
  );
}
