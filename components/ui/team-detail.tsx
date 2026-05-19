"use client";

import React from "react";
import { ClusterAvatar } from "@/components/ui/secondary-nav";
import { IconAiNewChat } from "@/components/ui/wedata-icons";
import type { Team, BuiltinExpert } from "@/lib/agent-registry";

// ── Design tokens（与 agent-detail 保持一致） ───────────────
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
  red: "#FF5C5C",
  hoverBg: "#F4F5F8",
  chipBg: "#F2F4F7",
  titlebarBg: "#F9FAFC",
} as const;

// ── 公共小组件 ─────────────────────────────────────────────────
function Card({ title, extra, children }: { title?: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section style={{
      background: C.cardBg,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 20,
    }}>
      {(title || extra) && (
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          {title && <h3 style={{ margin: 0, fontFamily: FONT, fontSize: 16, fontWeight: 600, lineHeight: "24px", color: C.textPrimary }}>{title}</h3>}
          {extra}
        </header>
      )}
      {children}
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px",
      borderRadius: 11, background: C.chipBg, color: C.textSecondary,
      fontFamily: FONT, fontSize: 12, fontWeight: 500, lineHeight: "22px", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

// ── 雷达图（5 维） ────────────────────────────────────────────
const RADAR_AXES = ["ETL处理", "智能分析", "数据查询", "预测能力", "决策支持"] as const;

function Radar({ values, size = 180 }: { values: number[]; size?: number }) {
  const cx = size / 2; const cy = size / 2; const r = size * 0.32; const n = RADAR_AXES.length;
  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pointAt = (i: number, k: number) => {
    const a = angleFor(i);
    return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k] as const;
  };
  const polyPts = (k: number) => Array.from({ length: n }, (_, i) => pointAt(i, k).join(",")).join(" ");
  const dataPts = values.map((v, i) => pointAt(i, Math.max(0, Math.min(1, v / 100))).join(",")).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon key={k} points={polyPts(k)} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={1}/>
      ))}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = pointAt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(0,0,0,0.06)" strokeWidth={1}/>;
      })}
      <polygon points={dataPts} fill={C.brand} fillOpacity={0.18} stroke={C.brand} strokeWidth={1.5}/>
      {values.map((v, i) => {
        const [x, y] = pointAt(i, Math.max(0, Math.min(1, v / 100)));
        return <circle key={i} cx={x} cy={y} r={3} fill={C.brand}/>;
      })}
      {RADAR_AXES.map((label, i) => {
        const [x, y] = pointAt(i, 1.18);
        return <text key={label} x={x} y={y} fontSize={12} fontFamily={FONT} fill={C.textSecondary} textAnchor="middle" dominantBaseline="middle">{label}</text>;
      })}
    </svg>
  );
}

// ── KPI 区 ────────────────────────────────────────────────────
function KPIGroup({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div style={{ display: "flex" }}>
      {items.map((it, i) => (
        <div key={i} style={{
          flex: 1, padding: "0 20px",
          borderLeft: i === 0 ? "none" : `1px solid ${C.borderLight}`,
        }}>
          <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 600, lineHeight: "36px", color: C.textPrimary, fontFeatureSettings: '"tnum"' }}>{it.value}</div>
          <div style={{ marginTop: 2, fontFamily: FONT, fontSize: 13, color: C.textTertiary, lineHeight: "20px" }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── 热力图 ────────────────────────────────────────────────────
const HEATMAP_WEEKS = 52;
const HEATMAP_DAYS = 7;
const HEATMAP_LEVELS = ["#EEF2F5", C.greenFaint, C.greenSoft, C.greenLight, C.green] as const;
const MONTH_LABELS = ["8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月"];
const DAY_LABELS = ["", "周二", "", "周四", "", "周六", ""];

function Heatmap() {
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
      const alert = (rnd > 0.985);
      col.push({ level, alert });
    }
    cells.push(col);
  }
  const CELL = 12; const GAP = 3;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `28px repeat(${HEATMAP_WEEKS}, ${CELL + GAP}px)`,
        fontFamily: FONT, fontSize: 11, color: C.textTertiary, lineHeight: "16px",
      }}>
        <div />
        {Array.from({ length: HEATMAP_WEEKS }, (_, w) => {
          const monthIdx = Math.floor((w / HEATMAP_WEEKS) * MONTH_LABELS.length);
          const showLabel = w % 4 === 2 && monthIdx < MONTH_LABELS.length;
          return <div key={w} style={{ width: CELL + GAP }}>{showLabel ? MONTH_LABELS[monthIdx] : ""}</div>;
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `28px 1fr`, gap: 6 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
          {DAY_LABELS.map((d, i) => (
            <div key={i} style={{ height: CELL, fontFamily: FONT, fontSize: 11, lineHeight: `${CELL}px`, color: C.textTertiary }}>{d}</div>
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
            <div key={idx} style={{
              width: CELL, height: CELL, borderRadius: 2,
              background: c.alert ? C.orange : HEATMAP_LEVELS[c.level],
            }}/>
          ))}
        </div>
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", marginTop: 6,
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

// ── 自进化时间线（带成员头像） ─────────────────────────────────
interface EvoItem {
  title: string;
  desc: string;
  avatar?: string;
}

function EvolutionTimeline({ items, lastIsInitial }: { items: EvoItem[]; lastIsInitial?: boolean }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 18 }}>
      {items.map((it, i) => (
        <li key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
          <div style={{
            width: 6, height: 6, borderRadius: 3,
            background: lastIsInitial && i === items.length - 1 ? C.textQuaternary : C.brand,
            marginTop: 9, flexShrink: 0, position: "relative", zIndex: 1,
          }} />
          {i < items.length - 1 && (
            <div style={{ position: "absolute", left: 2.5, top: 18, bottom: -18, width: 1, background: C.borderLight }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, lineHeight: "22px", color: C.textPrimary }}>{it.title}</div>
            {it.desc && <div style={{ marginTop: 2, fontFamily: FONT, fontSize: 12, lineHeight: "20px", color: C.textTertiary }}>{it.desc}</div>}
          </div>
          {it.avatar && (
            <img src={it.avatar} alt="" style={{ width: 24, height: 24, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
          )}
        </li>
      ))}
    </ul>
  );
}

// ── 团队成员卡（横排 3 张） ──────────────────────────────────
function MemberCard({ avatar, name, level, desc }: { avatar?: string; name: string; level: string; desc: string }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: C.titlebarBg,
      border: `1px solid ${C.borderLight}`,
      borderRadius: 12,
      padding: 16,
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {avatar ? (
          <img src={avatar} alt="" style={{ width: 36, height: 36, borderRadius: 18, objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: 18, background: C.brandLight, flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.textPrimary, lineHeight: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
            <span style={{
              display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px",
              borderRadius: 10, background: C.brandLight, color: C.brand,
              fontFamily: FONT, fontSize: 12, fontStyle: "italic", fontWeight: 600,
              flexShrink: 0,
            }}>{level}</span>
          </div>
        </div>
      </div>
      <p style={{
        margin: 0, fontFamily: FONT, fontSize: 12, lineHeight: "18px",
        color: C.textTertiary,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>{desc}</p>
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────
export interface TeamDetailProps {
  team: Team;
  /** 用于按 member.id/name 解析为内置专家详情（取头像/desc/Lv） */
  experts: BuiltinExpert[];
  onBack?: () => void;
  onDialog?: () => void;
  onMemberManage?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  /** SecondaryNav 是否收起；收起时 header 左侧补「新建对话」「展开面板」按钮 */
  secondaryCollapsed?: boolean;
  onNewChat?: () => void;
  onExpandSecondary?: () => void;
}

export default function TeamDetail({ team, experts, onBack, onDialog, onMemberManage, onEdit, onDelete, secondaryCollapsed, onNewChat, onExpandSecondary }: TeamDetailProps) {
  const [tab, setTab] = React.useState<"evolve" | "memory">("evolve");

  // 默认 cluster 头像
  const clusterImgs = team.clusterImgs ?? team.members.slice(0, team.members.length >= 4 ? 4 : 3).map((m) =>
    m.avatar ? m.avatar : { letter: m.abbr, bg: m.abbrBg }
  );

  // 团队简介 fallback
  const introBullets = [
    "集群健康巡检 — CPU / 内存 / 磁盘 / 网络指标实时监控",
    "故障应急 — SEV 等级评估、根因分析",
    "容量规划 — 基于历史数据预测扩缩容需求",
  ];

  // 团队成员 → 展示数据
  const memberCards = team.members.slice(0, 3).map((m) => {
    const expert = experts.find((e) => e.fullName.includes(m.name.replace("大数据", "")) || m.name.includes(e.shortTitle));
    return {
      id: m.id,
      avatar: m.avatar,
      name: expert ? expert.fullName : m.name,
      level: "Lv. 12",
      desc: expert?.desc ?? m.category,
    };
  });

  // mock 自进化时间线，带成员小头像
  const memberAvatars = team.members.map((m) => m.avatar).filter(Boolean) as string[];
  const evoItems: EvoItem[] = [
    { title: "新增技能「处理 Shuffle 倾斜」", desc: "2 天前 · 来自用户手动沉淀，已引用 6 次", avatar: memberAvatars[0] },
    { title: "新增 3 条记忆「JOIN 顺序优化」", desc: "2 周前 · 基于 11 次历史相似场景", avatar: memberAvatars[1] },
    { title: "新增记忆「PPD 未启用用 CLUSTER BY」", desc: "5 天前 · 来自用户手动沉淀，已引用 6 次", avatar: memberAvatars[2] },
    { title: "新增技能「分区表调优」", desc: "1 月前 · 用户批准的 Agent 提议", avatar: memberAvatars[0] },
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
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px",
        background: C.titlebarBg,
        borderBottom: `1px solid ${C.borderLight}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {secondaryCollapsed && (
            <>
              <button
                onClick={onNewChat}
                aria-label="新建对话"
                title="新建对话"
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "none",
                  background: "transparent", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.hoverBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <IconAiNewChat size={16} color="rgba(0,0,0,0.6)" />
              </button>
              <button
                onClick={onExpandSecondary}
                aria-label="展开面板"
                title="展开面板"
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "none",
                  background: "transparent", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0, marginRight: 4,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.hoverBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <img src="/icons/nav/3.svg" alt="" style={{ width: 16, height: 16 }} />
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
          <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, lineHeight: "26px", color: C.textPrimary }}>
            {team.name} ({team.members.length})
          </span>
        </div>
        {!team.preset && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <HeaderActionBtn icon="edit" label="编辑" onClick={onEdit} />
            <HeaderActionBtn icon="delete" label="删除" onClick={onDelete} danger />
          </div>
        )}
      </header>

      {/* ── 主体 ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 32px", display: "flex", gap: 28 }}>
        {/* ── 左列 ── */}
        <aside style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: 20, display: "flex", flexDirection: "column", gap: 16, alignItems: "center",
          }}>
            <div style={{ paddingTop: 12 }}>
              <ClusterAvatar imgs={clusterImgs} size={72} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 600, lineHeight: "30px", color: C.textPrimary }}>{team.name}</div>
            </div>
            <p style={{
              margin: 0, textAlign: "center", fontFamily: FONT, fontSize: 13,
              lineHeight: "20px", color: C.textSecondary,
            }}>{team.desc}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              <Chip>集群监控</Chip>
              <Chip>故障排查</Chip>
              <Chip>容量规划</Chip>
              <Chip>性能调优</Chip>
            </div>
            <button
              onClick={onDialog}
              style={{
                width: "100%", height: 40, borderRadius: 100,
                border: "1px solid transparent",
                background: "linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 55%) padding-box, linear-gradient(180deg, #EDF0F5 0%, #D6DBE3 100%) border-box",
                boxShadow: "0px 2px 4px -2px rgba(0,0,0,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                cursor: "pointer",
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

          {/* 雷达 + KPI */}
          <div style={{
            background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Radar values={[88, 92, 85, 75, 70]} size={180} />
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
            background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10,
          }}>
            <MetaRow icon="cake" label="诞生于 2025-03-12（357 天前）" />
            <MetaRow icon="user" label="由 user2 创建" />
          </div>
        </aside>

        {/* ── 右列 ── */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 团队设定 */}
          <Card title="团队设定">
            <p style={{
              margin: 0, fontFamily: FONT, fontSize: 14, lineHeight: "22px", color: C.textSecondary,
              display: "flex", alignItems: "flex-start", gap: 8,
            }}>
              <span style={{ flexShrink: 0 }}>👋</span>
              <span>我们是{team.name}，你的一站式服务团队</span>
            </p>
            <p style={{ margin: "10px 0 0", fontFamily: FONT, fontSize: 14, lineHeight: "22px", color: C.textSecondary }}>
              由 {team.members.length} 位专家组成的{team.name}一站式服务团队，覆盖开发 · 分析 · 运维全链路。
            </p>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, lineHeight: "22px", color: C.textPrimary, marginBottom: 6 }}>我擅长</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                {introBullets.map((b) => (
                  <li key={b} style={{ fontFamily: FONT, fontSize: 13, lineHeight: "22px", color: C.textSecondary }}>{b}</li>
                ))}
              </ul>
            </div>
          </Card>

          {/* 团队成员 */}
          <Card
            title={`团队成员 (${team.members.length})`}
            extra={
              <button
                onClick={onMemberManage}
                style={{
                  height: 28, padding: "0 12px", borderRadius: 14,
                  border: `1px solid ${C.borderLight}`, background: "#FFFFFF",
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
                  fontFamily: FONT, fontSize: 13, color: C.textSecondary,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="5" cy="5" r="2" stroke="rgba(0,0,0,0.6)" strokeWidth="1.2"/>
                  <path d="M1.5 12C1.5 9.8 3.2 8.5 5 8.5S8.5 9.8 8.5 12" stroke="rgba(0,0,0,0.6)" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M10 6.5V9.5M11.5 8H8.5" stroke="rgba(0,0,0,0.6)" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                成员管理
              </button>
            }
          >
            <div style={{ display: "flex", gap: 12 }}>
              {memberCards.map((m) => (
                <MemberCard key={m.id} avatar={m.avatar} name={m.name} level={m.level} desc={m.desc} />
              ))}
            </div>
          </Card>

          {/* 团队自进化 */}
          <Card title="团队自进化">
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              <TabBtn active={tab === "evolve"} onClick={() => setTab("evolve")}>自进化概览</TabBtn>
              <TabBtn active={tab === "memory"} onClick={() => setTab("memory")}>记忆沉淀</TabBtn>
            </div>
            {tab === "evolve" ? (
              <EvolutionTimeline items={evoItems} lastIsInitial />
            ) : (
              <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: FONT, fontSize: 13, color: C.textTertiary }}>
                暂无记忆沉淀数据
              </div>
            )}
          </Card>

          {/* 团队活跃度 */}
          <Card title="团队活跃度">
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
        height: 32, padding: "0 14px", borderRadius: 16, border: "none", cursor: "pointer",
        background: active ? C.brandLight : "transparent",
        color: active ? C.brand : C.textSecondary,
        fontFamily: FONT, fontSize: 14, fontWeight: active ? 600 : 400,
        transition: "background 100ms",
      }}
    >
      {children}
    </button>
  );
}

function MetaRow({ icon, label }: { icon: "cake" | "user"; label: string }) {
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
      </span>
      <span style={{ flex: 1, fontFamily: FONT, fontSize: 13, color: C.textSecondary, lineHeight: "20px" }}>{label}</span>
    </div>
  );
}

function HeaderActionBtn({ icon, label, onClick, danger }: { icon: "edit" | "delete"; label: string; onClick?: () => void; danger?: boolean }) {
  const [hovered, setHovered] = React.useState(false);
  const color = danger ? C.red : C.textSecondary;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 28, padding: "0 10px", borderRadius: 14,
        border: "none", cursor: "pointer",
        background: hovered ? C.hoverBg : "transparent",
        display: "inline-flex", alignItems: "center", gap: 4,
        fontFamily: FONT, fontSize: 13, color,
      }}
    >
      <span style={{ width: 14, height: 14, display: "inline-flex", color }}>
        {icon === "edit" ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 2L12 4.5L5 11.5L2 12L2.5 9L9.5 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 3.5H11.5M5.5 6V10M8.5 6V10M3.5 3.5L4 12H10L10.5 3.5M5 3.5V2H9V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}
