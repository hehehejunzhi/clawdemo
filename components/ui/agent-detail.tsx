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
    <section style={{
      background: C.cardBg,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 20,
      ...style,
    }}>
      {(title || extra) && (
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 14,
        }}>
          {title && <h3 style={{
            margin: 0, fontFamily: FONT, fontSize: 16, fontWeight: 600,
            lineHeight: "24px", color: C.textPrimary,
          }}>{title}</h3>}
          {extra}
        </header>
      )}
      {children}
    </section>
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
    : C.textSecondary;
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

function Radar({ values, size = 220 }: { values: number[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
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

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
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
      {/* 轴线 */}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = pointAt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(0,0,0,0.06)" strokeWidth={1} />;
      })}
      {/* 数据多边形 */}
      <polygon
        points={dataPoints}
        fill={C.brand}
        fillOpacity={0.18}
        stroke={C.brand}
        strokeWidth={1.5}
      />
      {/* 数据点 */}
      {values.map((v, i) => {
        const [x, y] = pointAt(i, Math.max(0, Math.min(1, v / 100)));
        return <circle key={i} cx={x} cy={y} r={3} fill={C.brand} />;
      })}
      {/* 轴标签 */}
      {RADAR_AXES.map((label, i) => {
        const [x, y] = pointAt(i, 1.18);
        return (
          <text
            key={label}
            x={x}
            y={y}
            fontSize={12}
            fontFamily={FONT}
            fill={C.textSecondary}
            textAnchor="middle"
            dominantBaseline="middle"
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
        {/* ── 左列 ── */}
        <aside style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 立绘 + 名字 */}
          <div style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 20,
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            {/* 立绘 */}
            <div style={{
              width: "100%", aspectRatio: "1 / 1",
              borderRadius: 12, overflow: "hidden",
              background: "linear-gradient(180deg, #EAF7F4 0%, #D4F0EA 100%)",
              display: "flex", alignItems: "flex-end", justifyContent: "center",
              position: "relative",
            }}>
              <img
                src={expert.heroAvatar ?? expert.avatar}
                alt={expert.fullName}
                style={{
                  maxWidth: "100%", maxHeight: "100%",
                  objectFit: "contain", objectPosition: "bottom",
                }}
              />
            </div>

            {/* Name + Lv */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontFamily: FONT, fontSize: 14, fontWeight: 500,
                  lineHeight: "20px", color: expert.nameColor,
                  fontStyle: "italic", letterSpacing: 0.5,
                }}>{expert.codeName}</div>
                <div style={{
                  fontFamily: FONT, fontSize: 22, fontWeight: 600,
                  lineHeight: "30px", color: C.textPrimary, marginTop: 2,
                }}>{expert.shortTitle}</div>
              </div>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                height: 28, padding: "0 10px", borderRadius: 14,
                background: C.brandLight, color: C.brand,
                fontFamily: FONT, fontSize: 13, fontWeight: 600,
                fontStyle: "italic",
              }}>Lv. 12</span>
            </div>

            {/* 成长值进度条 */}
            <div>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                fontFamily: FONT, fontSize: 12, color: C.textTertiary, marginBottom: 6,
              }}>
                <span>成长值</span>
                <span style={{ color: C.textSecondary, fontWeight: 500 }}>500 / 2000</span>
              </div>
              <div style={{ width: "100%", height: 6, borderRadius: 3, background: C.borderLight, overflow: "hidden" }}>
                <div style={{ width: "25%", height: "100%", borderRadius: 3, background: C.brand }} />
              </div>
            </div>

            {/* 描述 */}
            <p style={{
              margin: 0, fontFamily: FONT, fontSize: 13, fontWeight: 400,
              lineHeight: "20px", color: C.textSecondary,
            }}>
              {expert.desc}
            </p>

            {/* 标签 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {expert.skills.slice(0, 4).map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>

            {/* 对话按钮 */}
            <button
              onClick={onDialog}
              style={{
                width: "100%", height: 40, borderRadius: 100,
                border: "1px solid transparent",
                background: "linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 55%) padding-box, linear-gradient(180deg, #EDF0F5 0%, #D6DBE3 100%) border-box",
                boxShadow: "0px 2px 4px -2px rgba(0,0,0,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                cursor: "pointer", padding: "0 16px",
                fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.textPrimary,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="rgba(0,0,0,0.5)" strokeWidth="1.3" fill="none"/>
                <path d="M8 5V8L10 10" stroke="rgba(0,0,0,0.5)" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              对话
            </button>
          </div>

          {/* 雷达图 + KPI */}
          <div style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Radar values={radarValues} size={180} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, lineHeight: "24px", color: C.textPrimary }}>24</div>
                  <div style={{ fontFamily: FONT, fontSize: 12, color: C.textTertiary, lineHeight: "18px" }}>掌握技能</div>
                </div>
                <div>
                  <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, lineHeight: "24px", color: C.textPrimary }}>92.2%</div>
                  <div style={{ fontFamily: FONT, fontSize: 12, color: C.textTertiary, lineHeight: "18px" }}>任务成功率</div>
                </div>
                <div>
                  <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, lineHeight: "24px", color: C.textPrimary }}>98.2%</div>
                  <div style={{ fontFamily: FONT, fontSize: 12, color: C.textTertiary, lineHeight: "18px" }}>平均响应速度</div>
                </div>
              </div>
            </div>
          </div>

          {/* 元信息 */}
          <div style={{
            background: C.cardBg,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "16px 20px",
            display: "flex", flexDirection: "column", gap: 10,
            fontFamily: FONT, fontSize: 13, color: C.textSecondary,
          }}>
            <MetaRow icon="cake" label="诞生于 2025-03-12（357 天前）" />
            <MetaRow icon="user" label="由 user2 创建" />
            <MetaRow icon="tag" label="大数据团队2、运营团队、集群管理团队" />
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

function MetaRow({ icon, label }: { icon: "cake" | "user" | "tag"; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 16, height: 16, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.textTertiary }}>
        {icon === "cake" && (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 14V8H13V14H3Z" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5 8V6M8 8V5M11 8V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="5" cy="3.5" r="1" fill="currentColor"/>
            <circle cx="8" cy="3" r="1" fill="currentColor"/>
            <circle cx="11" cy="3.5" r="1" fill="currentColor"/>
          </svg>
        )}
        {icon === "user" && (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M3 14C3 11.5 5 10 8 10S13 11.5 13 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        )}
        {icon === "tag" && (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 8.5L7.5 3H13V8.5L7.5 14L2 8.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            <circle cx="10" cy="6" r="1" fill="currentColor"/>
          </svg>
        )}
      </span>
      <span style={{ flex: 1, fontFamily: FONT, fontSize: 13, color: C.textSecondary, lineHeight: "20px" }}>{label}</span>
    </div>
  );
}
