"use client";

import React, { useState } from "react";
import { IconAiNewChat, IconData } from "./wedata-icons";

// ── Design DNA tokens ────────────────────────────────────────────
const TEXT_PRIMARY = "rgba(0,0,0,0.9)";
const ICON_COLOR = "rgba(0,0,0,0.9)";
const HOVER_ICON_BTN = "rgba(0,0,0,0.05)";
const FONT_HEADING =
  "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const BTN_SIZE = 44;
const ICON_SIZE = 16;

// ── Member data map ──────────────────────────────────────────────
const MEMBER_MAP: Record<string, { name: string; avatar: string; letterAvatar?: { letter: string; bg: string } }> = {
  dev: { name: "Rigel·数据开发专家", avatar: "/agents/dev-expert.png" },
  analysis: { name: "Vega·数据分析专家", avatar: "/agents/analysis-expert.png" },
  analyst: { name: "Vega·数据分析专家", avatar: "/agents/analysis-expert.png" },
  ops: { name: "Orion·智能管家", avatar: "/agents/ops-expert.png" },
  "my-ops": { name: "运营助手", avatar: "", letterAvatar: { letter: "运", bg: "#4B79FF" } },
  marketing: { name: "营销助手", avatar: "/agents/ops-expert.png" },
  coze: { name: "Coze", avatar: "", letterAvatar: { letter: "C", bg: "#BE63FF" } },
};

// ── Types ────────────────────────────────────────────────────────
interface ChatTitlebarProps {
  title?: string;
  showNewChat?: boolean;
  onNewChat?: () => void;
  onArtifacts?: () => void;
  onAddMember?: () => void;
  hideTeamBadge?: boolean;
  teamMembers?: string[];
}

// ── Component ────────────────────────────────────────────────────
export default function ChatTitlebar({
  title,
  showNewChat = true,
  onNewChat,
  onArtifacts,
  onAddMember,
  hideTeamBadge = false,
  teamMembers = ["dev", "analysis", "ops"],
}: ChatTitlebarProps) {
  const [memberHovered, setMemberHovered] = useState(false);

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

      {/* ── Center: Title ── */}
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
      </div>

      {/* ── Right: 添加成员 + 查看成员（仅团队对话）+ 产物 ── */}
      <ActionButton onClick={onAddMember} label="添加成员">
        <img src="/icons/+user.svg" alt="" style={{ width: ICON_SIZE, height: ICON_SIZE }} />
      </ActionButton>

      {!hideTeamBadge && (
        <div style={{ position: "relative" }}
          onMouseEnter={() => setMemberHovered(true)}
          onMouseLeave={() => setMemberHovered(false)}
        >
          <ActionButton label="查看成员">
            <img src="/icons/user.svg" alt="" style={{ width: ICON_SIZE, height: ICON_SIZE }} />
          </ActionButton>

        {/* 成员列表气泡 */}
        {memberHovered && (
          <div style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 4,
            background: "#FFFFFF",
            border: "1px solid #E6E9F0",
            borderRadius: 12,
            padding: "12px 16px",
            boxShadow: "0px 8px 24px -4px rgba(0,0,0,0.10), 0px 8px 12px -8px rgba(0,0,0,0.05)",
            minWidth: 180,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            <span style={{ fontFamily: FONT_HEADING, fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.5)", lineHeight: "18px" }}>
              当前团队成员
            </span>
            {teamMembers.map((id) => {
              const m = MEMBER_MAP[id];
              if (!m) return null;
              return (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {m.letterAvatar ? (
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: m.letterAvatar.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: "#FFF" }}>{m.letterAvatar.letter}</span>
                    </div>
                  ) : (
                    <img src={m.avatar} alt="" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
                  )}
                  <span style={{ fontFamily: FONT_HEADING, fontSize: 13, fontWeight: 400, color: "rgba(0,0,0,0.9)", lineHeight: "20px", whiteSpace: "nowrap" }}>
                    {m.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

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
