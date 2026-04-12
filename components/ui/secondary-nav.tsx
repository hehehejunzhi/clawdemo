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

function CollapsibleSection({ header, children, defaultOpen = false }: {
  header: React.ReactNode | ((expanded: boolean) => React.ReactNode);
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <div onClick={() => setOpen(v => !v)}>
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
      background: C.avatarBg, border: `1.6px solid ${C.avatarBorder}`,
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

// ── Single avatar ─────────────────────────────────────────────
function SingleAvatar({ src }: { src: string }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 100, flexShrink: 0,
      background: C.avatarBg, border: `1.6px solid ${C.avatarBorder}`,
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
}

export default function SecondaryNav({ onCollapsedChange, onNewTask, onSkillPlaza, onClawManager, onTaskClick, activeTaskId, activeMenu }: SecondaryNavProps) {
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
                lineHeight: "26px", color: C.textPrimary, whiteSpace: "nowrap",
              }}>
                ClawTeam
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
          <NavMenuItem icon="/icons/nav/5.svg" label="技能广场" active={activeMenu === "skill-plaza"} onClick={onSkillPlaza} />
          <NavMenuItem icon="/icons/nav/6.svg" label="Claw管理" active={activeMenu === "claw-manager"} onClick={onClawManager} />
        </div>

        {/* 下区：团队 & 专家列表（可折叠） */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* 大数据团队 */}
          <CollapsibleSection
            defaultOpen={true}
            header={(expanded) => (
              <SectionHeader
                avatar={<GridAvatar imgs={["/icons/nav2/1.svg", "/icons/nav2/3.svg", "/icons/nav2/2.svg", "/icons/nav2/3.svg"]} />}
                label="大数据团队"
                expanded={expanded}
              />
            )}
          >
            <TaskItem status="loading" title="ETL 开发_订单数据同步流程项目" active={activeTaskId === "t1"} onClick={() => onTaskClick?.({ id: "t1", title: "ETL 开发_订单数据同步流程项目" })} />
            <TaskItem status="pending" title="统计近 7 天各渠道用户支付金额，按天汇总" active={activeTaskId === "t2"} onClick={() => onTaskClick?.({ id: "t2", title: "统计近 7 天各渠道用户支付金额，按天汇总" })} />
            <TaskItem status="check" title="接入业务库【订单表】数据源" active={activeTaskId === "t3"} onClick={() => onTaskClick?.({ id: "t3", title: "接入业务库【订单表】数据源" })} />
            <TaskItem status="check" title="接入业务库【用户表】数据源" active={activeTaskId === "t4"} onClick={() => onTaskClick?.({ id: "t4", title: "接入业务库【用户表】数据源" })} />
            <TaskItem status="check" title="猫眼_客户留存指标分析" active={activeTaskId === "t5"} onClick={() => onTaskClick?.({ id: "t5", title: "猫眼_客户留存指标分析" })} />
            <TaskItem status="check" title="T+1调度工作流编排" active={activeTaskId === "t6"} onClick={() => onTaskClick?.({ id: "t6", title: "T+1调度工作流编排" })} />
          </CollapsibleSection>

          {/* Rigel·数据运维专家 */}
          <CollapsibleSection
            header={(expanded) => (
              <SectionHeader
                avatar={<SingleAvatar src="/icons/nav2/11.svg" />}
                label="Rigel·数据运维专家"
                expanded={expanded}
              />
            )}
          >
            <TaskItem status="loading" title="数仓分层模型搭建" active={activeTaskId === "t7"} onClick={() => onTaskClick?.({ id: "t7", title: "数仓分层模型搭建" })} />
            <TaskItem status="check" title="ODS 层数据接入验证" active={activeTaskId === "t8"} onClick={() => onTaskClick?.({ id: "t8", title: "ODS 层数据接入验证" })} />
          </CollapsibleSection>

          {/* Vega·数据分析专家 */}
          <CollapsibleSection
            header={(expanded) => (
              <SectionHeader
                avatar={<SingleAvatar src="/icons/nav2/13.svg" />}
                label="Vega·数据分析专家"
                expanded={expanded}
              />
            )}
          >
            <TaskItem status="pending" title="用户留存率趋势分析" active={activeTaskId === "t9"} onClick={() => onTaskClick?.({ id: "t9", title: "用户留存率趋势分析" })} />
            <TaskItem status="check" title="GMV 周报数据提取" active={activeTaskId === "t10"} onClick={() => onTaskClick?.({ id: "t10", title: "GMV 周报数据提取" })} />
          </CollapsibleSection>

          {/* Orion·数据开发专家 */}
          <CollapsibleSection
            header={(expanded) => (
              <SectionHeader
                avatar={<SingleAvatar src="/icons/nav2/15.svg" />}
                label="Orion·数据开发专家"
                expanded={expanded}
              />
            )}
          >
            <TaskItem status="loading" title="元数据血缘扫描" active={activeTaskId === "t11"} onClick={() => onTaskClick?.({ id: "t11", title: "元数据血缘扫描" })} />
          </CollapsibleSection>

          {/* 运营协作团队 */}
          <CollapsibleSection
            header={(expanded) => (
              <SectionHeader
                avatar={<GridAvatar imgs={["/icons/nav2/17.svg", "/icons/nav2/20.svg", "/icons/nav2/19.svg", "/icons/nav2/20.svg"]} />}
                label="运营协作团队"
                expanded={expanded}
              />
            )}
          >
            <TaskItem status="check" title="运营周报看板搭建" active={activeTaskId === "t12"} onClick={() => onTaskClick?.({ id: "t12", title: "运营周报看板搭建" })} />
            <TaskItem status="pending" title="活动效果归因分析" active={activeTaskId === "t13"} onClick={() => onTaskClick?.({ id: "t13", title: "活动效果归因分析" })} />
          </CollapsibleSection>

        </div>
      </div>
    </motion.div>
  );
}
