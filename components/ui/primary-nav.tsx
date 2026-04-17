"use client";

import React, { useState } from "react";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const C = {
  bg: "#FFFFFF",
  border: "#E9ECF1",
  textPrimary: "rgba(0,0,0,0.9)",
  textTertiary: "rgba(0,0,0,0.5)",
  hoverBg: "#E9ECF1",
  activeBg: "#F2F4F8",
} as const;

const EXPANDED_W = 200;
const COLLAPSED_W = 56;

// ── Section label (分组标题) ──────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ height: 38, display: "flex", alignItems: "center", padding: "0 16px" }}>
      <span style={{
        fontFamily: FONT, fontSize: 12, fontWeight: 400,
        color: C.textTertiary, whiteSpace: "nowrap",
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Menu item ─────────────────────────────────────────────────
function MenuItem({ icon, label, active, collapsed }: {
  icon: string;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 38,
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        padding: collapsed ? "0" : "0 16px",
        gap: collapsed ? 0 : 12,
        cursor: "pointer",
        backgroundColor: active ? C.activeBg : hovered ? C.hoverBg : "transparent",
        transition: "background 100ms",
        position: "relative",
      }}
    >
      {active && !collapsed && (
        <img src="/icons/sidenav/15.svg" alt="" style={{ position: "absolute", left: 0, top: 0, height: 38, zIndex: 0 }} />
      )}
      {active && collapsed && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 3, height: 38, background: "#1664FF", borderRadius: "0 2px 2px 0" }} />
      )}
      <img src={icon} alt="" style={{ width: 16, height: 16, flexShrink: 0, position: "relative", zIndex: 1 }} />
      {!collapsed && (
        <span style={{
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: active ? 500 : 400,
          color: C.textPrimary,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          position: "relative",
          zIndex: 1,
        }}>
          {label}
        </span>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function PrimaryNav() {
  const [collapsed, setCollapsed] = useState(true);
  const [hoverExpanded, setHoverExpanded] = useState(false);

  // 实际显示状态：收起且 hover 时临时展开
  const isVisuallyCollapsed = collapsed && !hoverExpanded;
  const width = isVisuallyCollapsed ? COLLAPSED_W : EXPANDED_W;

  return (
    <div
      data-role="primary-nav"
      onMouseEnter={() => { if (collapsed) setHoverExpanded(true); }}
      onMouseLeave={() => { setHoverExpanded(false); }}
      style={{
        width,
        minWidth: width,
        height: "100%",
        backgroundColor: C.bg,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT,
        userSelect: "none",
        overflow: "hidden",
        flexShrink: 0,
        transition: "width 200ms ease, min-width 200ms ease",
        position: "relative",
        zIndex: collapsed ? 10 : "auto",
      }}>
      {/* 标题 */}
      <div style={{
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: isVisuallyCollapsed ? "center" : "flex-start",
        padding: isVisuallyCollapsed ? "0" : "0 16px",
        flexShrink: 0,
      }}>
        {!isVisuallyCollapsed && (
          <span style={{
            fontFamily: FONT, fontSize: 16, fontWeight: 600,
            color: C.textPrimary, whiteSpace: "nowrap",
          }}>
            弹性 MapReduce
          </span>
        )}
        {isVisuallyCollapsed && (
          <img src="/icons/sidenav/2.svg" alt="" style={{ width: 20, height: 20 }} />
        )}
      </div>

      {/* 分割线 */}
      {!isVisuallyCollapsed && (
        <div style={{ flexShrink: 0 }}>
          <img src="/icons/sidenav/1.svg" alt="" style={{ width: "100%", display: "block" }} />
        </div>
      )}
      {isVisuallyCollapsed && (
        <div style={{ height: 1, background: C.border, flexShrink: 0 }} />
      )}

      {/* 可滚动菜单区 */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "none",
      }}>
        {!isVisuallyCollapsed && <SectionLabel label="EMR on CVM" />}
        <MenuItem icon="/icons/sidenav/2.svg" label="概览" collapsed={isVisuallyCollapsed} />
        <MenuItem icon="/icons/sidenav/3.svg" label="集群" collapsed={isVisuallyCollapsed} />

        {!isVisuallyCollapsed && <SectionLabel label="EMR on TKE" />}
        <MenuItem icon="/icons/sidenav/4.svg" label="服务器" collapsed={isVisuallyCollapsed} />

        {!isVisuallyCollapsed && <SectionLabel label="EMR Serverisee" />}
        <MenuItem icon="/icons/sidenav/5.svg" label="HBase" collapsed={isVisuallyCollapsed} />

        {!isVisuallyCollapsed && <SectionLabel label="工具箱" />}
        <MenuItem icon="/icons/sidenav/6.svg" label="任务中心" collapsed={isVisuallyCollapsed} />
        <MenuItem icon="/icons/sidenav/7.svg" label="资源运维" collapsed={isVisuallyCollapsed} />

        {!isVisuallyCollapsed && <SectionLabel label="TCLake" />}
        <MenuItem icon="/icons/sidenav/8.svg" label="数据目录" collapsed={isVisuallyCollapsed} />
        <MenuItem icon="/icons/sidenav/9.svg" label="用户管理" collapsed={isVisuallyCollapsed} />

        {!isVisuallyCollapsed && <SectionLabel label="智能管家" />}
        <MenuItem icon="/icons/sidenav/10.svg" label="分析中心" collapsed={isVisuallyCollapsed} />
        <MenuItem icon="/icons/sidenav/11.svg" label="异常中心" collapsed={isVisuallyCollapsed} />
        <MenuItem icon="/icons/sidenav/12.svg" label="根因分析" collapsed={isVisuallyCollapsed} />
        <MenuItem icon="/icons/sidenav/13.svg" label="配置中心" collapsed={isVisuallyCollapsed} />
        <MenuItem icon="/icons/sidenav/14.svg" label="治理中心" collapsed={isVisuallyCollapsed} />

        {!isVisuallyCollapsed && <SectionLabel label="Data+AI" />}
        <MenuItem icon="/icons/sidenav/16.svg" label="探索中心" active collapsed={isVisuallyCollapsed} />
      </div>

      {/* 底部收起/展开按钮 */}
      <div
        onClick={() => { setCollapsed((v) => !v); setHoverExpanded(false); }}
        style={{
          height: 56,
          flexShrink: 0,
          position: "relative",
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: isVisuallyCollapsed ? "center" : "flex-start",
          padding: isVisuallyCollapsed ? "0" : "0 16px",
          cursor: "pointer",
        }}
      >
        <img
          src="/icons/sidenav/19.svg"
          alt=""
          style={{
            width: 16, height: 16,
            transition: "transform 200ms ease",
            transform: collapsed ? "rotate(180deg)" : "none",
          }}
        />
      </div>
    </div>
  );
}
