"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Design tokens ──────────────────────────────────────────────
const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const C = {
  bg: "#F9FAFC",
  borderColor: "#E6E9EF",
  textPrimary: "rgba(0,0,0,0.9)",
  textSecondary: "rgba(0,0,0,0.7)",
  textTertiary: "rgba(0,0,0,0.5)",
  hoverBg: "#F2F4F8",
  avatarBg: "#EEEEEE",
  avatarBorder: "#E7E7E7",
  btnShadow: "0px 2px 4px -2px rgba(0,0,0,0.12)",
  btnGradient: "linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 55%)",
  btnBorderGradient: "linear-gradient(180deg, #EDF0F5 0%, #D6DBE3 100%)",
} as const;

// ── Animation constants ───────────────────────────────────────
const COLLAPSE_DURATION = 0.22;
const COLLAPSE_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const CONTENT_FADE = 0.18;
const COLLAPSED_WIDTH = 68;
const EXPANDED_WIDTH = 260;

// ── Icon button ────────────────────────────────────────────────
function ToolbarButton({ onClick, title, children }: {
  onClick?: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={title}
      style={{
        width: 32, height: 32, borderRadius: 16,
        border: "none", background: hovered ? C.hoverBg : "transparent",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        padding: 0, transition: "background 100ms", flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

// ── Nav menu item ──────────────────────────────────────────────
function NavMenuItem({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 34,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        borderRadius: 20,
        cursor: "pointer",
        backgroundColor: active ? "#E1E5ED" : hovered ? C.hoverBg : "transparent",
        transition: "background 100ms",
        gap: 12,
      }}
    >
      <img src={icon} alt="" style={{ width: 16, height: 16, flexShrink: 0 }} />
      <span style={{
        fontFamily: FONT, fontSize: 14, fontWeight: active ? 600 : 400,
        lineHeight: "22px", color: C.textPrimary,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Status icons (inline SVG) ──────────────────────────────────
function IconLoading({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <style>{`@keyframes sec-nav-spin { to { transform: rotate(360deg); } }`}</style>
      <g style={{ transformOrigin: "center", animation: "sec-nav-spin 1s linear infinite" }}>
        <path d="M8 1.5C4.41038 1.5 1.5 4.41038 1.5 8C1.5 11.5896 4.41038 14.5 8 14.5V12.875C5.30761 12.875 3.125 10.6924 3.125 8C3.125 5.30761 5.30761 3.125 8 3.125C10.6924 3.125 12.875 5.30761 12.875 8H14.5C14.5 4.41038 11.5896 1.5 8 1.5Z" fill="#00B6C3"/>
      </g>
    </svg>
  );
}

function IconPending({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <style>{`@keyframes sec-nav-pending-spin { to { transform: rotate(360deg); } }`}</style>
      <g style={{ transformOrigin: "center", animation: "sec-nav-pending-spin 3s linear infinite" }}>
        <circle cx="8" cy="8" r="5" stroke="#FF7800" strokeWidth="1.2" strokeDasharray="3 2.5" fill="none"/>
      </g>
    </svg>
  );
}

function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M13.3137 4.943L6.24264 12.014L2 7.771L2.943 6.828L6.243 10.128L12.371 4L13.3137 4.943Z" fill="rgba(0,0,0,0.5)"/>
    </svg>
  );
}

type TaskStatus = "loading" | "pending" | "check";

function StatusIcon({ status }: { status: TaskStatus }) {
  switch (status) {
    case "loading": return <IconLoading />;
    case "pending": return <IconPending />;
    case "check":   return <IconCheck />;
  }
}

// ── Task item (status-based) ──────────────────────────────────
function TaskItem({ status, title, active, onClick }: { status: TaskStatus; title: string; active?: boolean; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 34,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        borderRadius: 20,
        cursor: "pointer",
        backgroundColor: active ? "#E1E5ED" : hovered ? C.hoverBg : "transparent",
        transition: "background 100ms",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
        <StatusIcon status={status} />
        <span style={{
          fontFamily: FONT, fontSize: 14, fontWeight: active ? 600 : 400,
          lineHeight: "22px", color: C.textPrimary,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          flex: 1, minWidth: 0,
        }}>
          {title}
        </span>
      </div>
    </div>
  );
}

// ── Chevron icon (rotates when expanded) ──────────────────────
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <motion.div
      animate={{ rotate: expanded ? 0 : -90 }}
      transition={{ duration: 0.2 }}
      style={{ width: 14, height: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M10.242 4.57L7.033 7.778L3.825 4.57L3 5.395L7.033 9.428L11.067 5.395L10.242 4.57Z" fill="rgba(0,0,0,0.4)"/>
      </svg>
    </motion.div>
  );
}

// ── Collapsible section ───────────────────────────────────────
const COLLAPSE_ANIM = { duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

function CollapsibleSection({ header, children, defaultOpen = false, onHeaderClick }: {
  header: React.ReactNode | ((expanded: boolean) => React.ReactNode);
  children: React.ReactNode;
  defaultOpen?: boolean;
  onHeaderClick?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <div onClick={() => { setOpen(v => !v); onHeaderClick?.(); }}>
        {typeof header === "function" ? header(open) : header}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={COLLAPSE_ANIM}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Expert/Team header ────────────────────────────────────────
function SectionHeader({ avatar, label, expanded }: {
  avatar: React.ReactNode;
  label: string;
  expanded: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 44,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        borderRadius: 12,
        cursor: "pointer",
        backgroundColor: hovered ? C.hoverBg : "transparent",
        transition: "background 100ms",
      }}
    >
      {avatar}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8, flex: 1, minWidth: 0 }}>
        <span style={{
          fontFamily: FONT, fontSize: 14, fontWeight: 400,
          lineHeight: "22px", color: C.textPrimary,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {label}
        </span>
        <ChevronIcon expanded={expanded} />
      </div>
    </div>
  );
}

// ── Grid avatar (4-cell team avatar) ──────────────────────────
function GridAvatar({ imgs }: { imgs: [string, string, string, string] }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 100, flexShrink: 0,
      background: C.avatarBg,
      overflow: "hidden", position: "relative",
    }}>
      <div style={{ position: "absolute", width: 16, height: 16, left: 0, top: 0, overflow: "hidden" }}>
        <img src={imgs[0]} alt="" style={{ width: 16, height: 16, objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", width: 16, height: 16, left: 16, top: 0, overflow: "hidden" }}>
        <img src={imgs[1]} alt="" style={{ width: 16, height: 16, objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", width: 16, height: 16, left: 0, top: 16, overflow: "hidden" }}>
        <img src={imgs[2]} alt="" style={{ width: 16, height: 16, objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", width: 16, height: 16, left: 16, top: 16, overflow: "hidden" }}>
        <img src={imgs[3]} alt="" style={{ width: 16, height: 16, objectFit: "cover" }} />
      </div>
    </div>
  );
}

// ── Cluster avatar (元宝派风格：多头像圆形叠放) ──
// - 无容器底色；用 mask 挖洞实现相邻 strokeW 描边视觉 + 相邻 overlap
// - 3 头像布局：上方并排 2 + 下方居中 1（循环压叠）
// - 4 头像布局：2×2；循环压叠：上左>上右>下右>下左>上左
// - 每项支持图片路径（string）或 { letter, bg } 纯色首字样式
// - 支持 size 参数（默认 32），其余尺寸按比例缩放
export type ClusterAvatarItem = string | { letter: string; bg: string };

// 自定义头像色板（来自 Figma 设计稿 771_721）
// 每个背景色对应固定文字色；未匹配时回退白色
const LETTER_TEXT_COLOR_MAP: Record<string, string> = {
  "#4B79FF": "#FFFFFF",
  "#00DBB0": "#FFFFFF",
  "#FFB834": "#000000",
  "#BE63FF": "#FFFFFF",
  "#FFD736": "#000000",
  "#17DF6B": "#000000",
  "#FF6B6B": "#FFFFFF",
};
export const getLetterTextColor = (bg?: string) => {
  if (!bg) return "#FFFFFF";
  return LETTER_TEXT_COLOR_MAP[bg.toUpperCase()] ?? "#FFFFFF";
};

export function ClusterAvatar({ imgs, size = 32 }: { imgs: ClusterAvatarItem[]; size?: number }) {
  const containerSize = size;
  // 比例基准：size=32 时 sub=18, overlap=4, strokeW=1.2
  const sub = size * (18 / 32);
  const overlap = size * (4 / 32);
  const step = sub - overlap;
  const r = sub / 2;
  const strokeW = size * (1.2 / 32);
  const rMask = r + strokeW;

  // 上排起点：让 (sub + step) 居中于 containerSize
  const rowWidth = sub + step; // = 32
  const rowStartX = (containerSize - rowWidth) / 2; // = 0

  const count = imgs.length;

  type CellPos = { left: number; top: number };
  const positions: CellPos[] =
    count === 3
      ? [
          { left: rowStartX, top: 0 },                       // 上左
          { left: rowStartX + step, top: 0 },                // 上右
          { left: (containerSize - sub) / 2, top: step },    // 下居中
        ]
      : [
          { left: rowStartX, top: 0 },                       // 上左
          { left: rowStartX + step, top: 0 },                // 上右
          { left: rowStartX, top: step },                    // 下左
          { left: rowStartX + step, top: step },             // 下右
        ];

  // 压叠关系：每个圆被哪个邻圆压住（要在 mask 中扣除其与该邻圆重叠的部分）
  // 3 头像：
  //   上左(0) 被 上右(1) 压  → 扣除 上右
  //   上右(1) 被 下居中(2) 压 → 扣除 下居中
  //   下居中(2) 被 上左(0) 压 → 扣除 上左
  // 4 头像循环：
  //   上左(0) 被 下左(2) 压 → 扣除 下左
  //   上右(1) 被 上左(0) 压 → 扣除 上左
  //   下左(2) 被 下右(3) 压 → 扣除 下右
  //   下右(3) 被 上右(1) 压 → 扣除 上右
  const pressedBy: Record<number, number> =
    count === 3
      ? { 0: 1, 1: 2, 2: 0 }
      : { 0: 2, 1: 0, 2: 3, 3: 1 };

  // 构造每个圆的 mask-image：用 subtract 合成，从自身圆中挖掉邻圆的范围（邻圆半径略大 strokeW，形成 1.5px 视觉缝隙）
  const buildMaskStyle = (i: number): React.CSSProperties => {
    const neighborIdx = pressedBy[i];
    if (neighborIdx === undefined) return {};
    const neighborCx = positions[neighborIdx].left - positions[i].left + r;
    const neighborCy = positions[neighborIdx].top - positions[i].top + r;

    const baseMask = `radial-gradient(circle at ${r}px ${r}px, #000 ${r}px, transparent ${r + 0.5}px)`;
    const subMask = `radial-gradient(circle at ${neighborCx}px ${neighborCy}px, #000 ${rMask}px, transparent ${rMask + 0.5}px)`;

    return {
      maskImage: `${baseMask}, ${subMask}`,
      maskComposite: "subtract",
      WebkitMaskImage: `${baseMask}, ${subMask}`,
      WebkitMaskComposite: "source-out",
    } as React.CSSProperties;
  };

  return (
    <div style={{
      width: containerSize,
      height: containerSize,
      flexShrink: 0,
      position: "relative",
    }}>
      {imgs.slice(0, 4).map((item, i) => {
        const isLetter = typeof item !== "string";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: positions[i].left,
              top: positions[i].top,
              width: sub,
              height: sub,
              borderRadius: "50%",
              overflow: "hidden",
              background: isLetter ? item.bg : "#FFFFFF",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...buildMaskStyle(i),
            }}
          >
            {isLetter ? (
              <span style={{
                fontFamily: FONT,
                fontSize: size * (10 / 32),
                fontWeight: 600,
                color: getLetterTextColor(item.bg),
                lineHeight: 1,
              }}>
                {item.letter}
              </span>
            ) : (
              <img
                src={item}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Single avatar ─────────────────────────────────────────────
function SingleAvatar({ src }: { src: string }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 100, flexShrink: 0,
      background: C.avatarBg,
      overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <img src={src} alt="" style={{ width: 34, height: 34, objectFit: "cover" }} />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
interface SecondaryNavProps {
  onToggle?: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
  onNewTask?: () => void;
  onSkillPlaza?: () => void;
  onClawManager?: () => void;
  onTaskClick?: (task: { id: string; title: string }) => void;
  activeTaskId?: string | null;
  activeMenu?: "skill-plaza" | "claw-manager" | null;
  /** Agent Registry（可选；传入时下区按 registry 动态渲染，否则隐藏下区） */
  registry?: import("@/lib/agent-registry").AgentRegistry;
  /** 点击左栏团队/专家/分身/外部 Agent 的 Section Header 时触发 */
  onAgentSelect?: (agentId: string, label: string) => void;
}

export default function SecondaryNav({ onCollapsedChange, onNewTask, onSkillPlaza, onClawManager, onTaskClick, activeTaskId, activeMenu, registry, onAgentSelect }: SecondaryNavProps) {
  const [collapsed, setCollapsed] = useState(false);

  const contentFade: React.CSSProperties = {
    transition: `opacity ${CONTENT_FADE}s ease`,
    pointerEvents: "auto",
  };
  const navWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const navWidthPx = `${navWidth}px`;

  return (
    <motion.div
      data-role="secondary-nav"
      initial={false}
      animate={{ width: navWidthPx, minWidth: navWidthPx, maxWidth: navWidthPx, flexBasis: navWidthPx }}
      transition={{ duration: COLLAPSE_DURATION, ease: COLLAPSE_EASE }}
      style={{
        height: "100%",
        backgroundColor: C.bg,
        borderRight: collapsed ? "none" : `1px solid ${C.borderColor}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        flexGrow: 0,
        width: navWidthPx,
        minWidth: navWidthPx,
        maxWidth: navWidthPx,
        flexBasis: navWidthPx,
        boxSizing: "border-box",
        fontFamily: FONT,
        userSelect: "none",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── 标题栏 (50px) ── */}
      <div style={{
        height: 50, flexShrink: 0,
        display: "flex", alignItems: "center",
        overflow: "hidden", position: "relative",
      }}>
        {/* 展开态 */}
        <div style={{
          ...contentFade,
          position: "absolute", inset: 0,
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? "none" : "auto",
          display: "flex", alignItems: "center",
          padding: "0 16px",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", height: 44,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src="/icons/logo-icon.svg" alt="" style={{ width: 20, height: 20, flexShrink: 0 }} />
              <span style={{
                fontFamily: FONT, fontSize: 18, fontWeight: 600,
                lineHeight: "26px", color: C.textPrimary, whiteSpace: "nowrap", letterSpacing: "-0.5px",
              }}>
                DataTeam
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ToolbarButton onClick={() => {}} title="搜索">
                <img src="/icons/nav/2.svg" alt="" style={{ width: 16, height: 16 }} />
              </ToolbarButton>
              <ToolbarButton onClick={() => { setCollapsed(true); onCollapsedChange?.(true); }} title="收起面板">
                <img src="/icons/nav/3.svg" alt="" style={{ width: 16, height: 16 }} />
              </ToolbarButton>
            </div>
          </div>
        </div>

        {/* 收起态 */}
        <div style={{
          ...contentFade,
          position: "absolute", inset: 0,
          opacity: collapsed ? 1 : 0,
          pointerEvents: collapsed ? "auto" : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <ToolbarButton onClick={() => { setCollapsed(false); onCollapsedChange?.(false); }} title="展开面板">
            <img src="/icons/nav/3.svg" alt="" style={{ width: 16, height: 16 }} />
          </ToolbarButton>
        </div>
      </div>

      {/* ── 新建任务按钮 ── */}
      <div style={{
        ...contentFade,
        opacity: collapsed ? 0 : 1,
        pointerEvents: collapsed ? "none" : "auto",
        padding: collapsed ? "0" : "0 12px",
        flexShrink: 0,
        height: collapsed ? 0 : 44,
        overflow: "hidden",
      }}>
        <button onClick={onNewTask} style={{
          width: "100%", height: 44, borderRadius: 100,
          border: "1px solid transparent",
          background: `${C.btnGradient} padding-box, ${C.btnBorderGradient} border-box`,
          boxShadow: C.btnShadow, display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8, cursor: "pointer",
          padding: "8px 20px", outline: "none",
        }}>
          <img src="/icons/nav/4.svg" alt="" style={{ width: 16, height: 16, flexShrink: 0 }} />
          <span style={{
            fontFamily: FONT, fontSize: 14, fontWeight: 500,
            lineHeight: "22px", color: C.textPrimary,
            whiteSpace: "nowrap",
          }}>
            新建任务
          </span>
        </button>
      </div>

      {/* ── 可滚动区域 ── */}
      <div style={{
        ...contentFade,
        flex: 1,
        opacity: collapsed ? 0 : 1,
        pointerEvents: collapsed ? "none" : "auto",
        overflowY: "auto", overflowX: "hidden",
        padding: collapsed ? "0" : "0 12px",
        scrollbarWidth: "none",
      }}>
        {/* 上区：菜单项 + 底部分割线 */}
        <div style={{
          paddingTop: 24,
          paddingBottom: 24,
          borderBottom: `1px solid ${C.borderColor}`,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}>
          <NavMenuItem icon="/icons/nav/5.svg" label="Agent 广场" active={activeMenu === "claw-manager"} onClick={onClawManager} />
        </div>

        {/* 下区：团队 & 专家列表（可折叠） */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 20 }}>

          {registry && (
            <>
              {/* 团队 */}
              {registry.teams.map((team, idx) => {
                const imgs = (team.members.length >= 3
                  ? team.members.slice(0, team.members.length >= 4 ? 4 : 3).map((m) => (m.avatar ? m.avatar : { letter: m.abbr, bg: m.abbrBg }))
                  : null);
                const teamTasks = registry.tasks.filter((t) => t.agentId === team.id);
                return (
                  <CollapsibleSection
                    key={team.id}
                    defaultOpen={idx === 0}
                    onHeaderClick={() => onAgentSelect?.(team.id, team.name)}
                    header={(expanded) => (
                      <SectionHeader
                        avatar={imgs ? <ClusterAvatar imgs={imgs} /> : <SingleAvatar src="/agents/team-badge.png" />}
                        label={team.name}
                        expanded={expanded}
                      />
                    )}
                  >
                    {teamTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        status={task.status}
                        title={task.title}
                        active={activeTaskId === task.id}
                        onClick={() => onTaskClick?.({ id: task.id, title: task.title })}
                      />
                    ))}
                  </CollapsibleSection>
                );
              })}

              {/* 内置专家 */}
              {registry.experts.map((expert) => {
                const expertTasks = registry.tasks.filter((t) => t.agentId === expert.id);
                return (
                  <CollapsibleSection
                    key={expert.id}
                    onHeaderClick={() => onAgentSelect?.(expert.id, expert.shortTitle)}
                    header={(expanded) => (
                      <SectionHeader
                        avatar={<SingleAvatar src={expert.avatar} />}
                        label={expert.fullName}
                        expanded={expanded}
                      />
                    )}
                  >
                    {expertTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        status={task.status}
                        title={task.title}
                        active={activeTaskId === task.id}
                        onClick={() => onTaskClick?.({ id: task.id, title: task.title })}
                      />
                    ))}
                  </CollapsibleSection>
                );
              })}

              {/* 自定义数字分身 */}
              {registry.avatars.map((av) => {
                const avTasks = registry.tasks.filter((t) => t.agentId === av.id);
                return (
                  <CollapsibleSection
                    key={av.id}
                    onHeaderClick={() => onAgentSelect?.(av.id, av.name)}
                    header={(expanded) => (
                      <SectionHeader
                        avatar={
                          <div style={{
                            width: 32, height: 32, borderRadius: 100, flexShrink: 0,
                            background: av.bg, display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: getLetterTextColor(av.bg), lineHeight: 1 }}>{av.letter}</span>
                          </div>
                        }
                        label={av.name}
                        expanded={expanded}
                      />
                    )}
                  >
                    {avTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        status={task.status}
                        title={task.title}
                        active={activeTaskId === task.id}
                        onClick={() => onTaskClick?.({ id: task.id, title: task.title })}
                      />
                    ))}
                  </CollapsibleSection>
                );
              })}

              {/* 外部 Agent */}
              {registry.externals.map((ex) => {
                const exTasks = registry.tasks.filter((t) => t.agentId === ex.id);
                return (
                  <CollapsibleSection
                    key={ex.id}
                    onHeaderClick={() => onAgentSelect?.(ex.id, ex.name)}
                    header={(expanded) => (
                      <SectionHeader
                        avatar={
                          <div style={{
                            width: 32, height: 32, borderRadius: 100, flexShrink: 0,
                            background: ex.bg, display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: getLetterTextColor(ex.bg), lineHeight: 1 }}>{ex.abbr}</span>
                          </div>
                        }
                        label={ex.name}
                        expanded={expanded}
                      />
                    )}
                  >
                    {exTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        status={task.status}
                        title={task.title}
                        active={activeTaskId === task.id}
                        onClick={() => onTaskClick?.({ id: task.id, title: task.title })}
                      />
                    ))}
                  </CollapsibleSection>
                );
              })}
            </>
          )}

        </div>
      </div>
    </motion.div>
  );
}
