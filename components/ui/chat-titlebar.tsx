"use client";

import React from "react";
import { IconAiNewChat, IconData } from "./wedata-icons";
import { ExpertStackAvatars } from "./expert-replies";

// ── Design DNA tokens ────────────────────────────────────────────
const TEXT_PRIMARY = "rgba(0,0,0,0.9)";
const ICON_COLOR = "rgba(0,0,0,0.9)";
const HOVER_ICON_BTN = "rgba(0,0,0,0.05)";
const FONT_HEADING =
  "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const BTN_SIZE = 44;
const ICON_SIZE = 16;

// ── Types ────────────────────────────────────────────────────────
interface ChatTitlebarProps {
  title?: string;
  showNewChat?: boolean;
  onNewChat?: () => void;
  onArtifacts?: () => void;
  hideTeamBadge?: boolean;
}

// ── Component ────────────────────────────────────────────────────
export default function ChatTitlebar({
  title,
  showNewChat = true,
  onNewChat,
  onArtifacts,
  hideTeamBadge = false,
}: ChatTitlebarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "100%",
        padding: "0 4px",
        fontFamily: FONT_HEADING,
      }}
    >
      {/* ── Left: 新建对话（仅 SecondaryNav 收起时显示） ── */}
      {showNewChat && (
        <ActionButton onClick={onNewChat} label="新建对话">
          <IconAiNewChat size={ICON_SIZE} color={ICON_COLOR} />
        </ActionButton>
      )}

      {/* ── Center: Title + 专家团 badge ── */}
      <div style={{
        flex: "1 0 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minWidth: 0,
      }}>
        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            lineHeight: "26px",
            color: TEXT_PRIMARY,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </p>

        {/* 专家团 badge */}
        {!hideTeamBadge && (
        <div style={{
          display: "flex",
          alignItems: "center",
          height: 24,
          background: "#E9ECF1",
          borderRadius: 100,
          padding: "0 8px 0 4px",
          gap: 0,
          flexShrink: 0,
          cursor: "pointer",
        }}>
          <ExpertStackAvatars size={16} overlap={2} />
          <span style={{
            fontFamily: "'PingFang SC', sans-serif",
            fontSize: 12,
            fontWeight: 400,
            color: "rgba(0,0,0,0.7)",
            marginLeft: 4,
            whiteSpace: "nowrap",
          }}>
            专家团
          </span>
        </div>
        )}
      </div>

      {/* ── Right: 产物 ── */}
      <ActionButton onClick={onArtifacts} label="产物">
        <IconData size={ICON_SIZE} color={ICON_COLOR} />
      </ActionButton>
    </div>
  );
}

// ── Pill icon button ─────────────────────────────────────────────
function ActionButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
}) {
  const [btnHovered, setBtnHovered] = React.useState(false);

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setBtnHovered(true)}
      onMouseLeave={() => setBtnHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: BTN_SIZE,
        height: BTN_SIZE,
        borderRadius: 100,
        border: "none",
        background: btnHovered ? HOVER_ICON_BTN : "transparent",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
        transition: "background 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}
