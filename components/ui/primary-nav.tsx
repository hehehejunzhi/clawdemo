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
function MenuItem({ icon, label, active }: {
  icon: string;
  label: string;
  active?: boolean;
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
        padding: "0 16px",
        gap: 12,
        cursor: "pointer",
        backgroundColor: active ? C.activeBg : hovered ? C.hoverBg : "transparent",
        transition: "background 100ms",
        position: "relative",
      }}
    >
      {active && (
        <img src="/icons/sidenav/15.svg" alt="" style={{ position: "absolute", left: 0, top: 0, height: 38, zIndex: 0 }} />
      )}
      <img src={icon} alt="" style={{ width: 16, height: 16, flexShrink: 0, position: "relative", zIndex: 1 }} />
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
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function PrimaryNav() {
  return (
    <div data-role="primary-nav" style={{
      width: 200,
      minWidth: 200,
      height: "100%",
      backgroundColor: C.bg,
      borderRight: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
      fontFamily: FONT,
      userSelect: "none",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      {/* 标题 */}
      <div style={{
        height: 50,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: FONT, fontSize: 16, fontWeight: 600,
          color: C.textPrimary, whiteSpace: "nowrap",
        }}>
          弹性 MapReduce
        </span>
      </div>

      {/* 分割线 */}
      <div style={{ flexShrink: 0 }}>
        <img src="/icons/sidenav/1.svg" alt="" style={{ width: "100%", display: "block" }} />
      </div>

      {/* 可滚动菜单区 */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "none",
      }}>
        <SectionLabel label="EMR on CVM" />
        <MenuItem icon="/icons/sidenav/2.svg" label="概览" />
        <MenuItem icon="/icons/sidenav/3.svg" label="集群" />

        <SectionLabel label="EMR on TKE" />
        <MenuItem icon="/icons/sidenav/4.svg" label="服务器" />

        <SectionLabel label="EMR Serverisee" />
        <MenuItem icon="/icons/sidenav/5.svg" label="HBase" />

        <SectionLabel label="工具箱" />
        <MenuItem icon="/icons/sidenav/6.svg" label="任务中心" />
        <MenuItem icon="/icons/sidenav/7.svg" label="资源运维" />

        <SectionLabel label="TCLake" />
        <MenuItem icon="/icons/sidenav/8.svg" label="数据目录" />
        <MenuItem icon="/icons/sidenav/9.svg" label="用户管理" />

        <SectionLabel label="智能管家" />
        <MenuItem icon="/icons/sidenav/10.svg" label="分析中心" />
        <MenuItem icon="/icons/sidenav/11.svg" label="异常中心" />
        <MenuItem icon="/icons/sidenav/12.svg" label="根因分析" />
        <MenuItem icon="/icons/sidenav/13.svg" label="配置中心" />
        <MenuItem icon="/icons/sidenav/14.svg" label="治理中心" />

        <SectionLabel label="Data+AI" />
        <MenuItem icon="/icons/sidenav/16.svg" label="探索中心" active />
      </div>

      {/* 底部 */}
      <div style={{
        height: 56,
        flexShrink: 0,
        position: "relative",
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
      }}>
        <img src="/icons/sidenav/19.svg" alt="" style={{ width: 16, height: 16 }} />
      </div>
    </div>
  );
}
