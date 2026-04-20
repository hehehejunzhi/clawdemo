"use client";

import React, { useState } from "react";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const C = {
  bg: "#FFFFFF",
  border: "#E9ECF1",
  textPrimary: "rgba(0,0,0,0.9)",
  textSecondary: "rgba(0,0,0,0.6)",
  textPlaceholder: "rgba(0,0,0,0.4)",
  hoverBg: "#F2F4F8",
  badgeBg: "#0052D9",
  avatarBg: "#0CBF5B",
} as const;

const TOP_NAV_HEIGHT = 48;

// ── Hover wrapper ──────────────────────────────────────────────
function HoverCell({ children, style, onClick }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        backgroundColor: hovered ? C.hoverBg : "transparent",
        transition: "background 100ms",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Nav text link ──────────────────────────────────────────────
function NavLink({ label, active }: { label: string; active?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 400,
        lineHeight: "20px",
        color: active ? C.textPrimary : C.textSecondary,
        whiteSpace: "nowrap",
        cursor: "pointer",
        opacity: hovered ? 0.8 : 1,
        transition: "opacity 100ms",
      }}
    >
      {label}
    </span>
  );
}

// ── Icon button (48x48) ────────────────────────────────────────
function IconBtn({ children, badge }: { children: React.ReactNode; badge?: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 48, height: 48,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: hovered ? C.hoverBg : C.bg,
        cursor: "pointer",
        position: "relative",
        transition: "background 100ms",
      }}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <div style={{
          position: "absolute",
          top: 8, right: 0,
          width: 20, height: 20,
          borderRadius: 14,
          background: C.badgeBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          <span style={{
            fontFamily: FONT, fontSize: 12, fontWeight: 500,
            color: "rgba(255,255,255,0.9)",
          }}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
interface TopNavProps {
  activeId?: string;
  onMenuClick?: (id: string) => void;
}

export default function TopNav({ activeId, onMenuClick }: TopNavProps) {
  return (
    <div style={{
      height: TOP_NAV_HEIGHT,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      borderBottom: `1px solid ${C.border}`,
      backgroundColor: C.bg,
      fontFamily: FONT,
      userSelect: "none",
      width: "100%",
      overflow: "hidden",
    }}>
      {/* ── 左侧区域：Logo + 导航项 ── */}
      <div style={{ display: "flex", alignItems: "center", height: 48, background: C.bg }}>
        {/* Logo 区域 (48x48) */}
        <HoverCell style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <img src="/icons/topnav/1.svg" alt="" style={{ width: 48, height: 48 }} />
        </HoverCell>

        {/* 导航项区域 */}
        <div style={{ display: "flex", alignItems: "center", height: 48, gap: 0 }}>
          {/* 分割线图标 */}
          <div style={{ display: "flex", alignItems: "center", padding: "0 0 0 0" }}>
            <img src="/icons/topnav/2.svg" alt="" style={{ width: 16, height: 16 }} />
          </div>

          {/* WeData Logo */}
          <div style={{ display: "flex", alignItems: "center", padding: "0 24px 0 8px", height: 24 }}>
            <img src="/icons/topnav/4.svg" alt="" style={{ height: 19 }} />
            <img src="/icons/topnav/3.svg" alt="" style={{ height: 16, marginLeft: 8 }} />
          </div>

          {/* 控制台（带图标） */}
          <HoverCell style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 12px", height: 48 }}>
            <img src="/icons/topnav/5.svg" alt="" style={{ width: 16, height: 16 }} />
            <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 400, color: C.textPrimary, whiteSpace: "nowrap" }}>
              控制台
            </span>
          </HoverCell>

          {/* 分割点 */}
          <div style={{ padding: "0 8px", display: "flex", alignItems: "center" }}>
            <img src="/icons/topnav/6.svg" alt="" style={{ width: 16, height: 16 }} />
          </div>

          {/* 文字导航 */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "0 8px" }}>
            <NavLink label="云审计" />
            <NavLink label="云服务器" />
            <NavLink label="边缘计算" />
            <NavLink label="私有网络" />
          </div>

          {/* 更多 */}
          <HoverCell style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/icons/topnav/7.svg" alt="" style={{ width: 16, height: 16 }} />
          </HoverCell>
        </div>
      </div>

      {/* ── 搜索栏 ── */}
      <div style={{
        flex: 1,
        height: 48,
        display: "flex",
        alignItems: "center",
        borderLeft: `1px solid ${C.border}`,
        background: C.bg,
        padding: "0 16px",
        gap: 8,
        minWidth: 200,
      }}>
        <img src="/icons/topnav/8.svg" alt="" style={{ width: 16, height: 16, flexShrink: 0 }} />
        <span style={{
          fontFamily: FONT, fontSize: 12, fontWeight: 400,
          color: C.textPlaceholder, whiteSpace: "nowrap",
          flex: 1,
        }}>
          搜索云产品、文档、云 API...
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
          <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 400, color: C.textSecondary }}>快捷键</span>
          <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 500, color: C.textSecondary }}>/</span>
        </div>
      </div>

      {/* ── 右侧工具栏 ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        height: 48,
        borderLeft: `1px solid ${C.border}`,
        background: C.bg,
        flexShrink: 0,
      }}>
        {/* 文字链接 */}
        <div data-role="topnav-links" style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
          <NavLink label="集团账号" />
          <NavLink label="备案" />
          <NavLink label="工具" />
          <NavLink label="客服支持" />
          <NavLink label="费用" />
        </div>

        {/* 图标按钮组 */}
        <IconBtn>
          <img src="/icons/topnav/10.svg" alt="" style={{ width: 16, height: 16 }} />
        </IconBtn>
        <IconBtn badge={2}>
          <img src="/icons/topnav/11.svg" alt="" style={{ width: 16, height: 16 }} />
        </IconBtn>
        <IconBtn>
          <div style={{ position: "relative", width: 16, height: 16 }}>
            <img src="/icons/topnav/12.svg" alt="" style={{ position: "absolute", inset: 0, width: 16, height: 16 }} />
            <img src="/icons/topnav/13.svg" alt="" style={{ position: "absolute", left: 0.67, top: 2, width: 14.67, height: 12 }} />
          </div>
        </IconBtn>

        {/* 分割线 */}
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <img src="/icons/topnav/14.svg" alt="" style={{ height: 48 }} />
        </div>

        {/* 用户信息 */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "0 16px", height: 48, background: C.bg, flexShrink: 0,
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 400, color: C.textSecondary, whiteSpace: "nowrap" }}>
              milachientencen...
            </span>
            <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 400, color: C.textSecondary, whiteSpace: "nowrap" }}>
              主账号
            </span>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: 24,
            background: C.avatarBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", flexShrink: 0,
          }}>
            <span style={{
              fontFamily: FONT, fontSize: 14, fontWeight: 600,
              color: C.textPrimary,
            }}>
              Z
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { TOP_NAV_HEIGHT };
