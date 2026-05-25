"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreateTeamDialog from "./create-team-dialog";
import { getShortDesc } from "./agent-detail";
import { getTeamShortDesc } from "./team-detail";
import { ClusterAvatar, type ClusterAvatarItem } from "./secondary-nav";
import { pickRandomPresetAvatar } from "@/lib/preset-avatars";
import {
  DEFAULT_EXPERTS,
  DEFAULT_EXTERNALS,
  type AgentRegistry,
  type Team as RegistryTeam,
  type CustomAvatar as RegistryAvatar,
  type ExternalAgent as RegistryExternal,
} from "@/lib/agent-registry";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const MAX_CUSTOM_TEAMS = 2;

const C = {
  bg: "#F9FAFC",
  bgWhite: "#FFFFFF",
  border: "#E6E9EF",
  textPrimary: "rgba(0,0,0,0.9)",
  textSecondary: "rgba(0,0,0,0.7)",
  textTertiary: "rgba(0,0,0,0.5)",
  textDisabled: "rgba(0,0,0,0.3)",
  hoverShadow: "0 4px 12px rgba(0,0,0,0.06)",
  hoverBg: "#F2F4F8",
  brandCyan: "#0052D9",
  error: "#F64041",
} as const;

// ── Toast（顶部） ─────────────────────────────────────────────
function Toast({ message, visible, type = "error", onDone }: { message: string; visible: boolean; type?: "success" | "error" | "warning"; onDone: () => void }) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onDone, 2500);
      return () => clearTimeout(t);
    }
  }, [visible, onDone]);

  const iconColor = type === "success" ? "#0CBF5B" : type === "warning" ? "#FF7800" : C.error;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: EASE }}
          style={{
            position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
            zIndex: 9999, display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 8,
            background: C.bgWhite,
            boxShadow: "0 6px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
            border: `1px solid ${C.border}`,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" fill={iconColor} />
            {type === "success" ? (
              <path d="M5 8.5l2 2 4-4.5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <>
                <path d="M8 4.5v4" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.75" fill="#FFF" />
              </>
            )}
          </svg>
          <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textPrimary }}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Section title ─────────────────────────────────────────────
function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ height: 50, display: "flex", alignItems: "center", padding: "0 24px", gap: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.9)" }}>{title}</span>
      <span style={{ fontSize: 14, fontWeight: 400, color: C.textTertiary }}>{desc}</span>
    </div>
  );
}

// ── Dialog button (pill, gradient border) ─────────────────────
function DialogBtn({ label, icon, onClick }: { label: string; icon?: boolean; onClick?: () => void }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: 240, height: 40, padding: "0 32px", borderRadius: 100,
        border: "1px solid #E9EBF0",
        background: h ? "#F2F4F8" : "transparent",
        fontFamily: FONT, fontSize: 14, fontWeight: 500,
        color: C.textPrimary, cursor: "pointer", outline: "none",
        transition: "background 100ms",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
      }}
    >
      {icon !== false && (
        <img src="/icons/claw-mgr/dialog-icon.svg" alt="" style={{ width: 16, height: 16 }} />
      )}
      {label}
    </button>
  );
}

// ── Card shell (340 x 140, horizontal layout) ─────────────────
function Card({ avatar, name, desc, badge, button, children, onDialog, onCardClick }: {
  avatar: React.ReactNode;
  name: React.ReactNode;
  desc: string;
  /** 支持函数形式以感知卡片 hover 态（用于「三点菜单默认隐藏、hover 显示」） */
  badge?: React.ReactNode | ((hovered: boolean) => React.ReactNode);
  button?: React.ReactNode;
  children?: React.ReactNode;
  /** 点击默认「对话」按钮时触发（仅当未传 button 覆写时有效） */
  onDialog?: () => void;
  /** 点击卡片本体（非按钮/菜单区域）时触发 —— 用于下钻到详情页 */
  onCardClick?: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onCardClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: 340, minHeight: 140, background: C.bgWhite, borderRadius: 16,
        border: `1px solid ${C.border}`, padding: 20,
        display: "flex", flexDirection: "column", gap: 12,
        cursor: "pointer", transition: "box-shadow 150ms",
        boxShadow: h ? C.hoverShadow : "none",
      }}
    >
      {/* Top: avatar + info */}
      <div style={{ display: "flex", gap: 12 }}>
        {avatar}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, justifyContent: "space-between" }}>
            {name}
            {typeof badge === "function" ? badge(h) : badge}
          </div>
          <div style={{
            fontSize: 14, fontWeight: 400, color: C.textPrimary, lineHeight: "20px",
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as const,
          }}>{desc}</div>
        </div>
      </div>
      {children}
      {/* Bottom: action button */}
      <div
        style={{ display: "flex", justifyContent: "flex-end" }}
        onClick={(e) => e.stopPropagation()}
      >
        {button ?? <DialogBtn label="对话" onClick={onDialog} />}
      </div>
    </div>
  );
}

// ── Avatar (round, with image or letter) ──────────────────────
// 自定义头像色板（来自 Figma 设计稿 771_721）
// 每个背景色对应固定的文字色（白 or 黑）
const CUSTOM_AVATAR_PALETTE: ReadonlyArray<{ bg: string; fg: string }> = [
  { bg: "#4B79FF", fg: "#FFFFFF" }, // 蓝
  { bg: "#00DBB0", fg: "#FFFFFF" }, // 青绿
  { bg: "#FFB834", fg: "#000000" }, // 橙黄
  { bg: "#BE63FF", fg: "#FFFFFF" }, // 紫
  { bg: "#FFD736", fg: "#000000" }, // 亮黄
  { bg: "#17DF6B", fg: "#000000" }, // 绿
  { bg: "#FF6B6B", fg: "#FFFFFF" }, // 红
];

const getAvatarTextColor = (bg?: string) => {
  if (!bg) return "#FFFFFF";
  const hit = CUSTOM_AVATAR_PALETTE.find((p) => p.bg.toUpperCase() === bg.toUpperCase());
  return hit ? hit.fg : "#FFFFFF";
};

function AvatarCircle({ src, letter, bg, size = 48, status }: { src?: string; letter?: string; bg?: string; size?: number; status?: "online" | "offline" }) {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
      <div style={{
        width: size, height: size, borderRadius: size,
        background: bg ?? "#EEEEEE",
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {src ? <img src={src} alt="" style={{ width: size + 3, height: size + 3, objectFit: "cover" }} />
          : <span style={{ fontFamily: FONT, fontSize: size * 0.5, fontWeight: 600, color: getAvatarTextColor(bg) }}>{letter}</span>}
      </div>
      {status === "online" && null}
    </div>
  );
}

// ── Grid avatar (4-cell for teams) ────────────────────────────
function GridAvatar({ status }: { status?: "online" | "offline" }) {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: 48, height: 48 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 150,
        background: "#EEEEEE",
        overflow: "hidden", position: "relative",
      }}>
        <div style={{ position: "absolute", width: 48, height: 24, left: 0, top: 0, overflow: "hidden" }}>
          <img src="/icons/claw-mgr/1.svg" alt="" style={{ position: "absolute", left: 11.2, top: -0.8 }} />
        </div>
        <div style={{ position: "absolute", width: 24, height: 24, left: 0, top: 24, overflow: "hidden" }}>
          <img src="/icons/claw-mgr/2.svg" alt="" style={{ position: "absolute", left: -0.53, top: -0.62, width: 25.5, height: 25.5 }} />
        </div>
        <div style={{ position: "absolute", width: 24, height: 24, left: 24, top: 24, overflow: "hidden" }}>
          <img src="/icons/claw-mgr/3.svg" alt="" style={{ position: "absolute", left: 0, top: 0 }} />
        </div>
      </div>
      {status === "online" && null}
    </div>
  );
}

// ── Create card ───────────────────────────────────────────────
function CreateCard({ label, onClick, disabled }: { label: string; onClick?: () => void; disabled?: boolean }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: 168, minHeight: 140, background: "transparent", borderRadius: 16,
        border: `1px dashed ${disabled ? "#D6DBE3" : C.border}`,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "box-shadow 150ms",
        boxShadow: !disabled && h ? C.hoverShadow : "none",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{ fontSize: 24, color: disabled ? C.textDisabled : C.textTertiary }}>+</span>
      <span style={{ fontSize: 14, color: disabled ? C.textDisabled : C.textSecondary }}>{label}</span>
    </div>
  );
}

// ── Connected badge ───────────────────────────────────────────
function ConnectedBadge() {
  return (
    <span style={{
      fontSize: 12, fontWeight: 400, color: "#2BA471",
      background: "#E3F9E9", borderRadius: 9999, padding: "0 8px", lineHeight: "20px",
    }}>已连接</span>
  );
}

// ── Main component ────────────────────────────────────────────
export type TeamMember = { id: string; name: string; abbr: string; abbrBg: string; category: string; role: "调度者" | "执行者" | "观察者"; statusColor: string; avatar?: string };
export type CustomTeam = {
  id: string;
  name: string;
  desc: string;
  members: TeamMember[];
  /** 可选：自定义 Cluster 头像配置。若存在则用 ClusterAvatar 渲染；否则走默认 AvatarCircle */
  clusterImgs?: ClusterAvatarItem[];
};

// 由 team.members 派生 ClusterAvatar 的 imgs 配置
// - members ≥ 4：取前 4 个
// - members === 3：取全部 3 个
// - members < 3：返回 null（由调用方回退到 AvatarCircle）
function deriveClusterImgs(members: TeamMember[]): ClusterAvatarItem[] | null {
  if (members.length < 3) return null;
  const picked = members.slice(0, members.length >= 4 ? 4 : 3);
  return picked.map<ClusterAvatarItem>((m) =>
    m.avatar ? m.avatar : { letter: m.abbr, bg: m.abbrBg }
  );
}
const PRESET_OPS_TEAM: CustomTeam = {
  id: "preset-ops-team",
  name: "运营协作团队",
  desc: "数据团队 + 运营助手协同，聚焦业务指标解读与落地",
  members: [
    { id: "dev", name: "大数据工程专家", abbr: "开", abbrBg: "#4B79FF", category: "内置专家", role: "调度者", statusColor: "#0CBF5B", avatar: "/agents/dev-expert.png" },
    { id: "analyst", name: "大数据分析专家", abbr: "析", abbrBg: "#BE63FF", category: "内置专家", role: "执行者", statusColor: "#0CBF5B", avatar: "/agents/analysis-expert.png" },
    { id: "ops", name: "智能管家", abbr: "运", abbrBg: "#00DBB0", category: "内置专家", role: "执行者", statusColor: "#0CBF5B", avatar: "/agents/ops-expert.png" },
    { id: "my-ops", name: "我的运营助手", abbr: "营", abbrBg: "#4B79FF", category: "数字分身", role: "执行者", statusColor: "#FF7800" },
  ],
  clusterImgs: [
    "/agents/dev-expert.png",
    "/agents/analysis-expert.png",
    "/agents/ops-expert.png",
    { letter: "运", bg: "#4B79FF" },
  ],
};

const ALL_AVAILABLE_MEMBERS: Omit<TeamMember, "role">[] = [
  { id: "analyst", name: "大数据分析专家", abbr: "析", abbrBg: "#BE63FF", category: "内置专家", statusColor: "#0CBF5B", avatar: "/agents/analysis-expert.png" },
  { id: "ops", name: "智能管家", abbr: "运", abbrBg: "#00DBB0", category: "内置专家", statusColor: "#0CBF5B", avatar: "/agents/ops-expert.png" },
  { id: "dev", name: "大数据工程专家", abbr: "开", abbrBg: "#4B79FF", category: "内置专家", statusColor: "#0CBF5B", avatar: "/agents/dev-expert.png" },
  { id: "my-ops", name: "我的运营助手", abbr: "营", abbrBg: "#4B79FF", category: "数字分身", statusColor: "#FF7800" },
  { id: "lh", name: "Lighthouse", abbr: "LH", abbrBg: "#FFB834", category: "外部 Claw", statusColor: "#0CBF5B" },
  { id: "cp", name: "ClawPro", abbr: "CP", abbrBg: "#4B79FF", category: "外部 Claw", statusColor: "#0CBF5B" },
  { id: "gp", name: "ChatGPT Plugin", abbr: "GP", abbrBg: "#17DF6B", category: "外部 Claw", statusColor: "#0CBF5B" },
];

// ── 自定义分身头像预设色板（新建分身时按数量轮询取色）
// 来自 Figma 设计稿 771_721，颜色与 CUSTOM_AVATAR_PALETTE 一一对应
const CUSTOM_AVATAR_BG_PALETTE = CUSTOM_AVATAR_PALETTE.map((p) => p.bg);
const pickAvatarBg = (idx: number) => CUSTOM_AVATAR_BG_PALETTE[idx % CUSTOM_AVATAR_BG_PALETTE.length];

// ── 三点菜单 ──────────────────────────────────────────────────
function MoreMenu({ onManage, onDelete, visible = true }: { onManage: () => void; onDelete: () => void; visible?: boolean }) {
  const [open, setOpen] = useState(false);
  const show = visible || open;
  return (
    <div style={{ position: "relative", opacity: show ? 1 : 0, pointerEvents: show ? "auto" : "none", transition: "opacity 120ms" }} onClick={(e) => e.stopPropagation()}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 24, height: 24, borderRadius: 6, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: open ? C.hoverBg : "transparent", transition: "background 100ms",
        }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="3" r="1.5" fill="rgba(0,0,0,0.5)" />
          <circle cx="8" cy="8" r="1.5" fill="rgba(0,0,0,0.5)" />
          <circle cx="8" cy="13" r="1.5" fill="rgba(0,0,0,0.5)" />
        </svg>
      </div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: 28, right: 0, zIndex: 100,
            minWidth: 120, background: C.bgWhite, borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)", border: `1px solid ${C.border}`,
            padding: "4px 0", overflow: "hidden",
          }}>
            {[
              { label: "编辑", action: onManage },
              { label: "删除", action: onDelete },
            ].map((item) => (
              <div
                key={item.label}
                onClick={() => { setOpen(false); item.action(); }}
                style={{
                  padding: "8px 16px", cursor: "pointer",
                  fontFamily: FONT, fontSize: 14, fontWeight: 400,
                  color: C.textPrimary,
                  transition: "background 100ms",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >{item.label}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}



// ── 带tooltip的保存按钮 ──────────────────────────────────────
function SaveButtonWithTooltip({ canSave, onClick, showTooltip, tooltipText }: { canSave: boolean; onClick: () => void; showTooltip: boolean; tooltipText: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {showTooltip && hovered && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.8)", color: "#FFF",
          fontSize: 12, lineHeight: "18px", whiteSpace: "nowrap", zIndex: 10,
          pointerEvents: "none", fontFamily: FONT,
        }}>
          {tooltipText}
          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid rgba(0,0,0,0.8)" }} />
        </div>
      )}
      <button disabled={!canSave} onClick={onClick}
        style={{ height: 40, padding: "0 24px", borderRadius: 100, border: "none", background: canSave ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.2)", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "#FFFFFF", cursor: canSave ? "pointer" : "not-allowed", outline: "none", transition: "background 150ms" }}>
        保存
      </button>
    </div>
  );
}

// ── 编辑团队弹窗（全编辑态） ─────────────────────────────
export function TeamDetailModal({ team, onClose, onSave, existingNames = [] }: {
  team: CustomTeam; onClose: () => void; onSave: (t: CustomTeam) => void; existingNames?: string[];
}) {
  const [formName, setFormName] = useState(team.name);
  const [formDesc, setFormDesc] = useState(team.desc);
  const [formTags, setFormTags] = useState(
    team.members.length > 0 ? "运营, 数据分析, 日报" : ""
  );
  const [nameError, setNameError] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(team.members.map(m => m.id))
  );

  const EDIT_ALL_MEMBERS = [
    { id: "dev", name: "大数据开发专家" },
    { id: "analyst", name: "大数据分析专家" },
    { id: "ops", name: "智能管家" },
    { id: "my-ops", name: "运营助手" },
    { id: "lh", name: "Lighthouse" },
  ];

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const NAME_REG = /^[\u4e00-\u9fa5a-zA-Z0-9_·]+$/;
  const validateName = (v: string) => {
    if (v.length > 0 && !NAME_REG.test(v)) setNameError("名称仅支持中文、英文、数字、下划线");
    else if (v.trim().length > 0 && v.trim() !== team.name && existingNames.includes(v.trim())) setNameError("该名称已存在，请更换名称");
    else setNameError("");
  };

  const handleSave = () => {
    if (nameError || selectedMembers.size < 2) return;
    onSave({ ...team, name: formName || team.name, desc: formDesc || team.desc });
  };

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: `1px solid #D6DBE3`, background: "#FFFFFF",
    fontFamily: FONT, fontSize: 14, color: "rgba(0,0,0,0.9)",
    outline: "none", boxSizing: "border-box" as const,
    transition: "border-color 150ms",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 14, color: "rgba(0,0,0,0.9)", fontWeight: 400,
    width: 90, flexShrink: 0,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2, ease: EASE }} onClick={(e) => e.stopPropagation()}
        style={{ width: 560, background: "#FFFFFF", borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1)", fontFamily: FONT, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "24px 24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: "rgba(0,0,0,0.9)" }}>编辑团队</span>
          <div onClick={onClose} style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 4 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
          ><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7.99994 8.94275L11.5354 12.4782L12.4782 11.5354L8.94275 7.99994L12.4782 4.46445L11.5354 3.52165L7.99994 7.05713L4.46429 3.52148L3.52148 4.46429L7.05713 7.99994L3.52155 11.5355L4.46436 12.4783L7.99994 8.94275Z" fill="rgba(0,0,0,0.9)" /></svg></div>
        </div>

        {/* Body */}
        <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* 团队名称 */}
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <span style={{ ...labelStyle, paddingTop: 8 }}>团队名称 <span style={{ color: "#F64041" }}>*</span></span>
            <div style={{ flex: 1 }}>
              <input value={formName} onChange={(e) => { setFormName(e.target.value); validateName(e.target.value); }}
                placeholder="例如：大数据"
                style={{ ...inputBase, borderColor: nameError ? "#F64041" : "#D6DBE3" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = nameError ? "#F64041" : "#0052D9"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = nameError ? "#F64041" : "#D6DBE3"; }}
              />
              {nameError && <div style={{ fontSize: 12, color: "#F64041", marginTop: 4, lineHeight: "18px" }}>{nameError}</div>}
            </div>
          </div>

          {/* 描述 */}
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <span style={{ ...labelStyle, paddingTop: 8 }}>描述</span>
            <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
              placeholder="简要描述自定义 Agent 目标和用途"
              rows={3}
              style={{ ...inputBase, resize: "none" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#0052D9"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#D6DBE3"; }}
            />
          </div>

          {/* 标签 */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={labelStyle}>标签</span>
            <input value={formTags} onChange={(e) => setFormTags(e.target.value)}
              placeholder="输入标签，多个用逗号分隔，如：数据分析，报表生成，SQL 优化"
              style={inputBase}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#0052D9"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#D6DBE3"; }}
            />
          </div>

          {/* 成员 */}
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <span style={{ ...labelStyle, paddingTop: 2 }}>成员 <span style={{ color: "#F64041" }}>*</span></span>
            <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "12px 12px" }}>
              {EDIT_ALL_MEMBERS.map((m) => (
                <div key={m.id} style={{ width: "calc(33.333% - 8px)", minWidth: 110, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }} onClick={() => toggleMember(m.id)}>
                  <div style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0, border: `1.5px solid ${selectedMembers.has(m.id) ? "#0052D9" : "#D6DBE3"}`, background: selectedMembers.has(m.id) ? "#0052D9" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 100ms" }}>
                    {selectedMembers.has(m.id) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  <span style={{ fontSize: 14, color: "rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Agent 推荐 */}
          <AgentRecommendSelect labelWidth={90} />

        </div>

        {/* Footer: 取消 + 保存 */}
        <div style={{ padding: "0 24px 24px", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={onClose}
            style={{ height: 40, padding: "0 24px", borderRadius: 100, border: "1px solid #D6DBE3", background: "#FFFFFF", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.9)", cursor: "pointer", outline: "none" }}>
            取消
          </button>
          <SaveButtonWithTooltip canSave={!nameError && selectedMembers.size >= 2} onClick={handleSave} showTooltip={selectedMembers.size < 2} tooltipText="团队至少需要选择 2 个成员" />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 大数据专家编辑弹窗 ──────────────────────────────────────────
function ExpertEditModal({ expert, onClose, onNavigateToSkillPlaza }: {
  expert: { name: string; desc: string; skills: string[] };
  onClose: () => void;
  onNavigateToSkillPlaza?: () => void;
}) {
  const [skillStates, setSkillStates] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    expert.skills.forEach((s) => { m[s] = true; });
    return m;
  });

  const toggleSkill = (skill: string) => {
    setSkillStates((prev) => ({ ...prev, [skill]: !prev[skill] }));
  };

  const enabledCount = Object.values(skillStates).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }} onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2, ease: EASE }} onClick={(e) => e.stopPropagation()}
        style={{ width: 640, maxHeight: "80vh", background: C.bgWhite, borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1)", fontFamily: FONT, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary }}>编辑大数据 Agent</span>
          <div onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "background 100ms" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
          ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 28px 0", display: "flex", flexDirection: "column", gap: 24, scrollbarWidth: "none" }}>
          {/* 名称 */}
          <div style={{ display: "flex", alignItems: "center", minHeight: 32 }}>
            <span style={{ fontSize: 14, color: C.textTertiary, flexShrink: 0, width: 80 }}>名称</span>
            <span style={{ fontSize: 14, fontWeight: 400, color: C.textPrimary }}>{expert.name}</span>
          </div>

          {/* 描述 */}
          <div style={{ display: "flex", alignItems: "flex-start", minHeight: 32 }}>
            <span style={{ fontSize: 14, color: C.textTertiary, flexShrink: 0, width: 80, paddingTop: 2 }}>描述</span>
            <span style={{ fontSize: 14, color: C.textPrimary, lineHeight: "22px" }}>{expert.desc}</span>
          </div>

          {/* 技能 */}
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <span style={{ fontSize: 14, color: C.textTertiary, flexShrink: 0, width: 80, paddingTop: 12 }}>技能</span>
            <div style={{ flex: 1, minWidth: 0, background: "#F7F8FB", borderRadius: 12, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {/* 标题行 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: C.textTertiary }}>已配置{enabledCount}条技能</span>
                <span onClick={() => { onClose(); onNavigateToSkillPlaza?.(); }}
                  style={{ fontSize: 14, fontWeight: 500, color: "#0052D9", cursor: "pointer", textDecoration: "none" }}
                >去配置</span>
              </div>
              {/* 技能列表 + 可交互 Toggle */}
              {expert.skills.map((s) => {
                const on = skillStates[s] ?? true;
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, background: C.bgWhite, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 14, fontWeight: 400, color: on ? C.textPrimary : C.textTertiary }}>{s}</span>
                    <div
                      onClick={() => toggleSkill(s)}
                      style={{ width: 40, height: 22, borderRadius: 11, background: on ? "#0052D9" : "#D6DBE3", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 200ms" }}
                    >
                      <div style={{ width: 18, height: 18, borderRadius: 9, background: "#FFFFFF", position: "absolute", top: 2, left: on ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,0.15)", transition: "left 200ms" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer: 取消 + 保存 */}
        <div style={{ padding: "20px 28px 24px", display: "flex", justifyContent: "flex-end", gap: 12, flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ height: 40, padding: "0 24px", borderRadius: 100, border: "1px solid #D6DBE3", background: "#FFFFFF", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.9)", cursor: "pointer", outline: "none" }}>
            取消
          </button>
          <button onClick={onClose}
            style={{ height: 40, padding: "0 24px", borderRadius: 100, border: "none", background: "rgba(0,0,0,0.9)", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "#FFFFFF", cursor: "pointer", outline: "none" }}>
            保存
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 删除确认弹窗 ──────────────────────────────────────────────
export function DeleteConfirmModal({ teamName, onClose, onConfirm }: { teamName: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }} onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: EASE }} onClick={(e) => e.stopPropagation()}
        style={{ width: 480, background: C.bgWhite, borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1), 0 8px 12px -8px rgba(0,0,0,0.05)", fontFamily: FONT, padding: 24, display: "flex", flexDirection: "column", gap: 32 }}
      >
        {/* Header + 描述 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary, lineHeight: "24px" }}>删除"{teamName}"</span>
            <div onClick={onClose} style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7.99994 8.94275L11.5354 12.4782L12.4782 11.5354L8.94275 7.99994L12.4782 4.46445L11.5354 3.52165L7.99994 7.05713L4.46429 3.52148L3.52148 4.46429L7.05713 7.99994L3.52155 11.5355L4.46436 12.4783L7.99994 8.94275Z" fill="rgba(0,0,0,0.9)" /></svg>
            </div>
          </div>
          <span style={{ fontSize: 14, color: "rgba(0,0,0,0.9)", lineHeight: "22px" }}>
            若删除该团队，相关的历史对话、远程连接等信息都将被删除，该操作不可逆。
          </span>
        </div>
        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
          <button onClick={onClose} style={{ width: 92, height: 40, borderRadius: 32, border: "1px solid #D6DBE3", background: C.bgWhite, fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.textPrimary, cursor: "pointer", outline: "none" }}>取消</button>
          <button onClick={onConfirm} style={{ width: 92, height: 40, borderRadius: 32, border: "none", background: "#F64041", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "#FFF", cursor: "pointer", outline: "none" }}>删除</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 外部 Claw 卡片（按 Figma 设计稿 340×168） ────────────────
function ExternalClawCard({ avatar, name, desc, connected, buttonLabel, onButtonClick, onDisconnect, onDelete }: {
  avatar: React.ReactNode;
  name: string;
  desc: string;
  connected: boolean;
  buttonLabel: string;
  onButtonClick?: () => void;
  onDisconnect?: () => void;
  onDelete?: () => void;
}) {
  const [h, setH] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: 340, height: 140, background: C.bgWhite, borderRadius: 16,
        border: `1px solid ${C.border}`, padding: 20,
        display: "flex", flexDirection: "column",
        cursor: "default", transition: "box-shadow 150ms",
        boxShadow: h ? C.hoverShadow : "none",
        overflow: "hidden", position: "relative",
      }}
    >
      {/* Top row: avatar + info */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        {avatar}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, height: 24, marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
            {connected && <ConnectedBadge />}
            <div style={{ marginLeft: "auto", position: "relative", opacity: (h || menuOpen) ? 1 : 0, pointerEvents: (h || menuOpen) ? "auto" : "none", transition: "opacity 120ms" }} onClick={(e) => e.stopPropagation()}>
              <div
                onClick={() => setMenuOpen((v) => !v)}
                style={{
                  width: 24, height: 24, borderRadius: 20, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: menuOpen ? C.hoverBg : "transparent", transition: "background 100ms",
                }}
                onMouseEnter={(e) => { if (!menuOpen) (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { if (!menuOpen) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="3" r="1.5" fill="rgba(0,0,0,0.5)" />
                  <circle cx="8" cy="8" r="1.5" fill="rgba(0,0,0,0.5)" />
                  <circle cx="8" cy="13" r="1.5" fill="rgba(0,0,0,0.5)" />
                </svg>
              </div>
              {menuOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setMenuOpen(false)} />
                  <div style={{
                    position: "absolute", top: 28, right: 0, zIndex: 100,
                    minWidth: 140, background: C.bgWhite, borderRadius: 8,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)", border: `1px solid ${C.border}`,
                    padding: "4px 0", overflow: "hidden",
                  }}>
                    {connected && onDisconnect && (
                      <div
                        onClick={() => { setMenuOpen(false); onDisconnect(); }}
                        style={{
                          padding: "8px 16px", cursor: "pointer",
                          fontFamily: FONT, fontSize: 14, fontWeight: 400,
                          color: C.textPrimary, transition: "background 100ms",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                      >取消链接</div>
                    )}
                    <div
                      onClick={() => { setMenuOpen(false); onDelete?.(); }}
                      style={{
                        padding: "8px 16px", cursor: "pointer",
                        fontFamily: FONT, fontSize: 14, fontWeight: 400,
                        color: C.textPrimary, transition: "background 100ms",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                    >删除</div>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Description (1 line) */}
          <div style={{
            fontSize: 14, fontWeight: 400, color: C.textPrimary, lineHeight: "20px",
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 1, WebkitBoxOrient: "vertical" as const,
          }}>{desc}</div>
        </div>
      </div>

      {/* Button: aligned with text area (offset 60px = 48 avatar + 12 gap) */}
      <div style={{ marginLeft: 60 }}>
        <button
          onClick={onButtonClick}
          style={{
            width: 240, height: 40, borderRadius: 100,
            border: "1px solid #E9EBF0",
            background: "transparent",
            fontFamily: FONT, fontSize: 14, fontWeight: 500,
            color: C.textPrimary,
            cursor: "pointer", outline: "none",
            transition: "background 100ms",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.hoverBg; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          {connected && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.55 13.75L4.2 13.63L3.55 13.75ZM2.4 12L1.9 12.45L2.4 12ZM3.28 13.05L2.71 13.39L3.28 13.05ZM4.28 15.06L4.61 15.64L4.28 15.06ZM3.89 15.24L3.89 14.57L3.89 15.24ZM3.62 15.08L4.2 14.75L3.62 15.08ZM7.43 14.44L7.38 15.11L7.43 14.44ZM5.7 14.38L5.58 13.73L5.7 14.38ZM4.43 14.97L4.1 14.39L4.43 14.97ZM5.5 14.43L5.32 13.79L5.5 14.43ZM8 1V1.67C11.68 1.67 14.59 4.43 14.59 7.73H15.25H15.92C15.92 3.6 12.32 0.34 8 0.34V1ZM15.25 7.73H14.59C14.59 11.04 11.68 13.8 8 13.8V14.46V15.13C12.32 15.13 15.92 11.86 15.92 7.73H15.25ZM8 14.46V13.8C7.82 13.8 7.65 13.79 7.48 13.78L7.43 14.44L7.38 15.11C7.58 15.12 7.79 15.13 8 15.13V14.46ZM2.4 12L2.9 11.56C1.97 10.51 1.42 9.18 1.42 7.73H0.75H0.09C0.09 9.53 0.77 11.17 1.9 12.45L2.4 12ZM0.75 7.73H1.42C1.42 4.43 4.32 1.67 8 1.67V1V0.34C3.68 0.34 0.09 3.6 0.09 7.73H0.75ZM5 7.5V8.17H8V7.5V6.84H5V7.5ZM8 7.5V8.17H11V7.5V6.84H8V7.5ZM8 4.5H7.34V7.5H8H8.67V4.5H8ZM8 7.5H7.34V10.5H8H8.67V7.5H8Z" fill="rgba(0,0,0,0.9)"/>
            </svg>
          )}
          {connected ? "对话" : buttonLabel}
        </button>
      </div>
    </div>
  );
}

// ── 创建外部 Claw 弹窗 ───────────────────────────────────────
const PLATFORMS = [
  { id: "lh", label: "Lighthouse", abbr: "LH", bg: "#FFB834" },
  { id: "cp", label: "ClawPro", abbr: "CP", bg: "#4B79FF" },
  { id: "gp", label: "ChatGPT Plugin", abbr: "GP", bg: "#17DF6B" },
];

function CreateExternalClawDialog({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void;
  onCreate: (data: { name: string; platform: string; platformLabel: string; platformAbbr: string; platformBg: string; apiUrl: string; ip: string; port: string }) => void;
}) {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");

  const isValid = name.trim().length > 0 && platform.length > 0 && apiUrl.trim().length > 0;
  const selectedPlatform = PLATFORMS.find((p) => p.id === platform);

  const handleCreate = () => {
    if (!isValid || !selectedPlatform) return;
    onCreate({ name: name.trim(), platform, platformLabel: selectedPlatform.label, platformAbbr: selectedPlatform.abbr, platformBg: selectedPlatform.bg, apiUrl: apiUrl.trim(), ip: ip.trim(), port: port.trim() });
    setName(""); setPlatform(""); setApiUrl(""); setIp(""); setPort("");
  };

  const handleClose = () => {
    setName(""); setPlatform(""); setApiUrl(""); setIp(""); setPort("");
    onClose();
  };

  const labelStyle: React.CSSProperties = { fontSize: 12, color: "rgba(0,0,0,0.7)", flexShrink: 0, width: 72, paddingTop: 7 };
  const fieldInputStyle: React.CSSProperties = {
    flex: 1, height: 32, padding: "0 12px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.bgWhite,
    fontFamily: FONT, fontSize: 12, color: C.textPrimary, outline: "none", boxSizing: "border-box",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ width: 640, maxHeight: "85vh", background: C.bgWhite, borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1), 0 8px 12px -8px rgba(0,0,0,0.05)", fontFamily: FONT, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {/* Header */}
            <div style={{ padding: "24px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>连接外部 Claw</span>
              <div onClick={handleClose} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 4 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16, scrollbarWidth: "none" }}>
              {/* 名称 */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={labelStyle}><span>名称 </span><span style={{ color: C.error }}>*</span></div>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：我的自定义 Claw" style={fieldInputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
              </div>

              {/* 来源平台 */}
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={labelStyle}><span>来源平台 </span><span style={{ color: C.error }}>*</span></div>
                <div style={{ flex: 1, display: "flex", gap: 12 }}>
                  {PLATFORMS.map((p) => (
                    <div key={p.id} onClick={() => setPlatform(p.id)}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", gap: 8,
                        padding: "6px 12px", borderRadius: 8, cursor: "pointer", height: 32, boxSizing: "border-box",
                        border: `1px solid ${platform === p.id ? "#7E9EFF" : C.border}`,
                        background: platform === p.id ? "rgba(126,158,255,0.04)" : C.bgWhite,
                        transition: "all 100ms",
                      }}
                    >
                      <div style={{
                        width: 14, height: 14, borderRadius: 7,
                        border: `1.5px solid ${platform === p.id ? "#0052D9" : "#D6DBE3"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {platform === p.id && <div style={{ width: 7, height: 7, borderRadius: 4, background: "#0052D9" }} />}
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#FFF" }}>{p.abbr}</span>
                      </div>
                      <span style={{ fontSize: 12, color: C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* API 接入地址 */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={labelStyle}><span>API 地址 </span><span style={{ color: C.error }}>*</span></div>
                <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://api.example.com/v1/claw" style={fieldInputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
              </div>

              {/* IP 地址 */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={labelStyle}>IP 地址</div>
                <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="192.168.1.1" style={fieldInputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
              </div>

              {/* 端口 */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={labelStyle}>端口</div>
                <input value={port} onChange={(e) => setPort(e.target.value)} placeholder="8080" style={{ ...fieldInputStyle, flex: "none", width: 120 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, padding: "16px 24px", flexShrink: 0, background: C.bgWhite, borderRadius: "0 0 16px 16px" }}>
              <button onClick={handleClose} style={{ width: 92, height: 40, borderRadius: 32, border: "1px solid #D6DBE3", background: C.bgWhite, fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.textPrimary, cursor: "pointer", outline: "none" }}>取消</button>
              <button onClick={handleCreate} disabled={!isValid} style={{ width: 92, height: 40, borderRadius: 32, border: "none", background: isValid ? C.textPrimary : "rgba(0,0,0,0.2)", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.9)", cursor: isValid ? "pointer" : "not-allowed", outline: "none", transition: "background 150ms" }}>创建</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Agent 推荐下拉字段 ──────────────────────────────────────
function AgentRecommendSelect({ labelWidth = 90 }: { labelWidth?: number } = {}) {
  const [value, setValue] = useState("每次询问");
  const [dropOpen, setDropOpen] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const options = ["每次询问", "不再推荐"];
  return (
    <div style={{ display: "flex", alignItems: "center", minHeight: 32 }}>
      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.7)", flexShrink: 0, width: labelWidth, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
        <span>Agent 推荐</span>
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }} onMouseEnter={() => setTooltipVisible(true)} onMouseLeave={() => setTooltipVisible(false)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ cursor: "help", display: "block" }}>
            <circle cx="7" cy="7" r="6" stroke="rgba(0,0,0,0.3)" strokeWidth="1" fill="none" />
            <path d="M7 6V10M7 4.5V4" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {tooltipVisible && (
            <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", padding: "6px 10px", borderRadius: 6, background: "rgba(0,0,0,0.85)", color: "#FFF", fontSize: 12, lineHeight: "18px", whiteSpace: "nowrap", zIndex: 10, pointerEvents: "none" }}>
              在对话中向你推荐能力匹配的Agent
              <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid rgba(0,0,0,0.85)" }} />
            </div>
          )}
        </div>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <div onClick={() => setDropOpen(!dropOpen)} style={{ height: 32, padding: "0 12px", borderRadius: 8, border: `1px solid ${dropOpen ? C.brandCyan : C.border}`, background: C.bgWhite, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontSize: 12, color: C.textPrimary, fontFamily: FONT }}>
          <span>{value}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: dropOpen ? "rotate(180deg)" : "none", transition: "transform 150ms" }}><path d="M3 4.5L6 7.5L9 4.5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        {dropOpen && (
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.bgWhite, borderRadius: 8, border: `1px solid ${C.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", zIndex: 10, overflow: "hidden" }}>
            {options.map((opt) => (
              <div key={opt} onClick={() => { setValue(opt); setDropOpen(false); }} style={{ padding: "8px 12px", fontSize: 12, color: C.textPrimary, cursor: "pointer", background: value === opt ? "#F2F4F8" : "transparent" }}
                onMouseEnter={(e) => { if (value !== opt) (e.currentTarget as HTMLDivElement).style.background = "#F8F9FB"; }}
                onMouseLeave={(e) => { if (value !== opt) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >{opt}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 创建数字分身弹窗（与 CreateTeamDialog 对齐） ─────────────────
function CreateAvatarDialog({ open, onClose, onCreate, existingNames = [] }: { open: boolean; onClose: () => void; onCreate: (name: string, desc: string, tags: string) => void; existingNames?: string[] }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const NAME_REG = /^[\u4e00-\u9fa5a-zA-Z0-9_·]+$/;
  const validateName = (v: string) => {
    if (v.length > 0 && !NAME_REG.test(v)) setNameError("名称仅支持中文、英文、数字、下划线");
    else if (v.trim().length > 0 && existingNames.includes(v.trim())) setNameError("该名称已存在，请更换名称");
    else setNameError("");
  };

  const isValid = name.trim().length > 0 && !nameError;

  const handleCreate = () => {
    if (!isValid) return;
    setLoading(true);
    setProgress(0);
  };

  // loading 进度动画
  React.useEffect(() => {
    if (!loading) return;
    let frame: number;
    let start: number | null = null;
    const duration = 2000;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setProgress(p);
      if (p < 1) { frame = requestAnimationFrame(animate); }
      else {
        setTimeout(() => {
          onCreate(name.trim(), desc.trim(), tags.trim());
          setName(""); setDesc(""); setTags(""); setNameError(""); setLoading(false); setProgress(0);
        }, 300);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleClose = () => { if (loading) return; setName(""); setDesc(""); setTags(""); setNameError(""); onClose(); };

  const labelStyle: React.CSSProperties = { fontSize: 12, color: "rgba(0,0,0,0.7)", flexShrink: 0, width: 90, paddingTop: 7 };
  const fieldInputStyle: React.CSSProperties = {
    flex: 1, height: 32, padding: "0 12px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.bgWhite,
    fontFamily: FONT, fontSize: 12, color: C.textPrimary, outline: "none", boxSizing: "border-box",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ width: 640, background: C.bgWhite, borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1), 0 8px 12px -8px rgba(0,0,0,0.05)", fontFamily: FONT, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {loading ? (
              <div style={{ padding: "80px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
                  <path d="M60 20L90 50L60 40L30 50L60 20Z" fill="#D4D8E0" />
                  <path d="M60 20L60 40L90 50L60 20Z" fill="#B8BEC8" />
                  <path d="M60 40L60 60L90 50L60 40Z" fill="#C8CDD6" />
                  <ellipse cx="60" cy="78" rx="30" ry="6" fill="rgba(0,0,0,0.06)" />
                </svg>
                <span style={{ fontSize: 18, fontWeight: 500, color: C.textPrimary }}>你自定义 Agent 正在创建，请稍等...</span>
                <div style={{ width: "60%", height: 12, borderRadius: 6, background: "#E6E9EF", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 6, background: C.textPrimary, width: `${progress * 100}%`, transition: "width 50ms linear" }} />
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: "24px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>创建自定义 Agent</span>
                  <div onClick={handleClose} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 4 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
                </div>

                {/* Body */}
                <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* 名称 */}
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div style={labelStyle}><span>名称 </span><span style={{ color: C.error }}>*</span></div>
                    <div style={{ flex: 1 }}>
                      <input value={name} onChange={(e) => { setName(e.target.value); validateName(e.target.value); }} placeholder="例如：我的监控助手"
                        style={{ ...fieldInputStyle, borderColor: nameError ? C.error : C.border, width: "100%" }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = nameError ? C.error : C.brandCyan; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = nameError ? C.error : C.border; }} />
                      {nameError && <div style={{ fontSize: 12, color: C.error, marginTop: 4, lineHeight: "18px" }}>{nameError}</div>}
                    </div>
                  </div>
                  {/* 描述 */}
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div style={labelStyle}>描述</div>
                    <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="简要描述分身目标和用途" rows={2}
                      style={{ ...fieldInputStyle, height: "auto", padding: "5px 12px", resize: "none" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
                  </div>
                  {/* 标签 */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={labelStyle}>标签</div>
                    <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="输入标签，多个用逗号分隔，如：数据分析，报表生成，SQL 优化" style={fieldInputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
                  </div>
                  {/* Agent 推荐 */}
                  <AgentRecommendSelect />
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, padding: "16px 24px", flexShrink: 0, background: C.bgWhite, borderRadius: "0 0 16px 16px" }}>
                  <button onClick={handleClose} style={{ width: 92, height: 40, borderRadius: 32, border: "1px solid #D6DBE3", background: C.bgWhite, fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.textPrimary, cursor: "pointer", outline: "none" }}>取消</button>
                  <button onClick={handleCreate} disabled={!isValid} style={{ width: 92, height: 40, borderRadius: 32, border: "none", background: isValid ? C.textPrimary : "rgba(0,0,0,0.2)", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.9)", cursor: isValid ? "pointer" : "not-allowed", outline: "none", transition: "background 150ms" }}>创建</button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── 数字分身三点菜单（Figma: 152x82 圆角16） ─────────────────
function ExpertDetailMenu({ onDetail, visible = true }: { onDetail: () => void; visible?: boolean }) {
  const [open, setOpen] = useState(false);
  const show = visible || open;
  return (
    <div style={{ position: "relative", opacity: show ? 1 : 0, pointerEvents: show ? "auto" : "none", transition: "opacity 120ms" }} onClick={(e) => e.stopPropagation()}>
      <div onClick={() => setOpen((v) => !v)}
        style={{ width: 24, height: 24, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: open ? C.hoverBg : "transparent", transition: "background 100ms" }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="3" r="1.5" fill="rgba(0,0,0,0.5)" /><circle cx="8" cy="8" r="1.5" fill="rgba(0,0,0,0.5)" /><circle cx="8" cy="13" r="1.5" fill="rgba(0,0,0,0.5)" />
        </svg>
      </div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: 28, right: 0, zIndex: 100, width: 120, background: C.bgWhite, borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1), 0 8px 12px -8px rgba(0,0,0,0.05)", padding: 8 }}>
            <div onClick={() => { setOpen(false); onDetail(); }}
              style={{ padding: "5px 8px", borderRadius: 8, cursor: "pointer", fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textPrimary, transition: "background 100ms" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >编辑</div>
          </div>
        </>
      )}
    </div>
  );
}

function AvatarMoreMenu({ onDetail, onDelete, visible = true }: { onDetail: () => void; onDelete: () => void; visible?: boolean }) {
  const [open, setOpen] = useState(false);
  const show = visible || open;
  return (
    <div style={{ position: "relative", opacity: show ? 1 : 0, pointerEvents: show ? "auto" : "none", transition: "opacity 120ms" }} onClick={(e) => e.stopPropagation()}>
      <div onClick={() => setOpen((v) => !v)}
        style={{ width: 24, height: 24, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: open ? C.hoverBg : "transparent", transition: "background 100ms" }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="3" r="1.5" fill="rgba(0,0,0,0.5)" /><circle cx="8" cy="8" r="1.5" fill="rgba(0,0,0,0.5)" /><circle cx="8" cy="13" r="1.5" fill="rgba(0,0,0,0.5)" />
        </svg>
      </div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: 28, right: 0, zIndex: 100, width: 152, background: C.bgWhite, borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1), 0 8px 12px -8px rgba(0,0,0,0.05)", padding: 8 }}>
            {[
              { label: "编辑", action: onDetail },
              { label: "删除", action: onDelete },
            ].map((item) => (
              <div key={item.label} onClick={() => { setOpen(false); item.action(); }}
                style={{ padding: "5px 8px", borderRadius: 8, cursor: "pointer", fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textPrimary, transition: "background 100ms" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >{item.label}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── 编辑数字分身弹窗 ──────────────────────────────────────────
export type AvatarData = { name: string; desc: string; tags: string[]; skills: { name: string; enabled: boolean }[]; avatar?: string };

/**
 * 自定义 Agent 删除二次确认弹窗（与 ClawManager 内部使用的样式一致，可复用到详情页）。
 * 由调用方控制开关与命中后的副作用（如刷新 registry / Toast）。
 */
export function AvatarDeleteConfirm({ name, onCancel, onConfirm }: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }} onClick={onCancel}
      style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: EASE }} onClick={(e) => e.stopPropagation()}
        style={{ width: 480, background: C.bgWhite, borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1), 0 8px 12px -8px rgba(0,0,0,0.05)", fontFamily: FONT, padding: 24, display: "flex", flexDirection: "column", gap: 32 }}
      >
        {/* Header + 描述 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary, lineHeight: "24px" }}>删除"{name}"</span>
            <div onClick={onCancel} style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7.99994 8.94275L11.5354 12.4782L12.4782 11.5354L8.94275 7.99994L12.4782 4.46445L11.5354 3.52165L7.99994 7.05713L4.46429 3.52148L3.52148 4.46429L7.05713 7.99994L3.52155 11.5355L4.46436 12.4783L7.99994 8.94275Z" fill="rgba(0,0,0,0.9)" /></svg>
            </div>
          </div>
          <span style={{ fontSize: 14, color: "rgba(0,0,0,0.9)", lineHeight: "22px" }}>
            若删除该自定义 Agent，相关的历史对话、个人知识沉淀等信息都将被删除，该操作不可逆。
          </span>
        </div>
        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
          <button onClick={onCancel} style={{ width: 92, height: 40, borderRadius: 32, border: "1px solid #D6DBE3", background: C.bgWhite, fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.textPrimary, cursor: "pointer", outline: "none" }}>取消</button>
          <button onClick={onConfirm} style={{ width: 92, height: 40, borderRadius: 32, border: "none", background: "#F64041", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "#FFF", cursor: "pointer", outline: "none" }}>删除</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AvatarDetailModal({ data, onClose, onSave }: {
  data: AvatarData; onClose: () => void; onSave: (d: AvatarData) => void;
}) {
  const [formName, setFormName] = useState(data.name);
  const [formDesc, setFormDesc] = useState(data.desc);
  const [formTags, setFormTags] = useState(data.tags.join(", "));
  const [nameError, setNameError] = useState("");

  const NAME_REG = /^[\u4e00-\u9fa5a-zA-Z0-9_·]+$/;
  const validateName = (v: string) => {
    if (v.length > 0 && !NAME_REG.test(v)) setNameError("名称仅支持中文、英文、数字、下划线");
    else setNameError("");
  };

  const handleSave = () => {
    if (nameError) return;
    const tags = formTags.split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
    onSave({ name: formName, desc: formDesc, tags, skills: data.skills, avatar: data.avatar });
  };

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: "1px solid #D6DBE3", background: "#FFFFFF",
    fontFamily: FONT, fontSize: 14, color: "rgba(0,0,0,0.9)",
    outline: "none", boxSizing: "border-box" as const,
    transition: "border-color 150ms",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 14, color: "rgba(0,0,0,0.5)", fontWeight: 400,
    width: 100, flexShrink: 0,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }} onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2, ease: EASE }} onClick={(e) => e.stopPropagation()}
        style={{ width: 560, maxHeight: "80vh", background: "#FFFFFF", borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1)", fontFamily: FONT, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: "rgba(0,0,0,0.9)" }}>编辑自定义 Agent</span>
          <div onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "background 100ms" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
          ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 28px 0", display: "flex", flexDirection: "column", gap: 20, scrollbarWidth: "none" }}>
          {/* 名称 */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ ...labelStyle, paddingTop: 8 }}>名称 <span style={{ color: "#F64041" }}>*</span></span>
            <div style={{ flex: 1 }}>
              <input value={formName} onChange={(e) => { setFormName(e.target.value); validateName(e.target.value); }}
                style={{ ...inputBase, borderColor: nameError ? "#F64041" : "#D6DBE3" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = nameError ? "#F64041" : "#0052D9"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = nameError ? "#F64041" : "#D6DBE3"; }}
              />
              {nameError && <div style={{ fontSize: 12, color: "#F64041", marginTop: 4, lineHeight: "18px" }}>{nameError}</div>}
            </div>
          </div>

          {/* 描述 */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ ...labelStyle, paddingTop: 8 }}>描述</span>
            <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
              rows={3}
              style={{ ...inputBase, resize: "none" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#0052D9"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#D6DBE3"; }}
            />
          </div>

          {/* 标签 */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={labelStyle}>标签</span>
            <input value={formTags} onChange={(e) => setFormTags(e.target.value)}
              placeholder="输入标签，多个用逗号分隔"
              style={inputBase}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#0052D9"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#D6DBE3"; }}
            />
          </div>

          {/* Agent 推荐 */}
          <AgentRecommendSelect labelWidth={112} />
        </div>

        {/* Footer: 取消 + 保存 */}
        <div style={{ padding: "20px 28px 24px", display: "flex", justifyContent: "flex-end", gap: 12, flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ height: 40, padding: "0 24px", borderRadius: 100, border: "1px solid #D6DBE3", background: "#FFFFFF", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.9)", cursor: "pointer", outline: "none" }}>
            取消
          </button>
          <button onClick={handleSave}
            style={{ height: 40, padding: "0 24px", borderRadius: 100, border: "none", background: "rgba(0,0,0,0.9)", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "#FFFFFF", cursor: "pointer", outline: "none" }}>
            保存
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ClawManager({
  onNavigateToSkillPlaza,
  registry,
  onRegistryChange,
  onAgentDialog,
  onAgentDetail,
}: {
  onNavigateToSkillPlaza?: () => void;
  registry?: AgentRegistry;
  onRegistryChange?: (next: AgentRegistry) => void;
  /** 点击卡片「对话」按钮时触发：由 page.tsx 关闭 ClawManager 并召唤对应 agent banner */
  onAgentDialog?: (agentId: string, label: string) => void;
  /** 点击卡片本体时触发：由 page.tsx 跳转到 Agent / Team / 自定义 Agent 详情页 */
  onAgentDetail?: (kind: "team" | "expert" | "avatar", id: string) => void;
} = {}) {
  // Mount 时若有外部 registry，从它恢复内部 state（避免卸载重挂丢失）
  const initFromRegistry = () => {
    if (!registry) return null;
    const customTeams: CustomTeam[] = registry.teams
      .filter((t) => t.id !== "bigdata-team")
      .map((t) => ({
        id: t.id === "ops-team" ? "preset-ops-team" : t.id,
        name: t.name,
        desc: t.desc,
        clusterImgs: t.clusterImgs,
        members: t.members,
      }));
    const presetAvatar = registry.avatars.find((a) => a.preset);
    const avatarDeleted = !presetAvatar;
    const avatarData = presetAvatar
      ? {
          name: presetAvatar.name,
          desc: presetAvatar.desc,
          tags: presetAvatar.tags,
          skills: presetAvatar.skills.map((s) => ({ name: s.name, enabled: s.enabled })),
          avatar: presetAvatar.avatar,
        }
      : null;
    const customAvatars = registry.avatars
      .filter((a) => !a.preset)
      .map((a, idx) => ({ id: a.id, name: a.name, desc: a.desc, tags: a.tags, skills: a.skills.map((s) => ({ name: s.name, enabled: s.enabled })), bg: a.bg || pickAvatarBg(idx), avatar: a.avatar }));
    const lh2 = registry.externals.find((e) => e.id === "lh2");
    const customClaws = registry.externals
      .filter((e) => !e.preset)
      .map((e) => ({ id: e.id, name: e.name, abbr: e.abbr, bg: e.bg, platformLabel: e.platformLabel, apiUrl: e.apiUrl ?? "", avatar: e.avatar }));
    return { customTeams, avatarDeleted, avatarData, customAvatars, lh2State: lh2?.state ?? "connected", lh2Avatar: lh2?.avatar, customClaws };
  };
  const initial = initFromRegistry();

  const [customTeams, setCustomTeams] = useState<CustomTeam[]>(initial?.customTeams ?? [PRESET_OPS_TEAM]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 成员管理弹窗
  const [managingTeamId, setManagingTeamId] = useState<string | null>(null);
  // 删除确认弹窗
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");

  const showToast = useCallback((msg: string, type: "success" | "error" | "warning" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
  }, []);
  const hideToast = useCallback(() => setToastVisible(false), []);

  const isAtLimit = customTeams.length >= MAX_CUSTOM_TEAMS;

  const handleCreateClick = () => {
    if (isAtLimit) {
      showToast("最多支持创建 2 个自定义团队", "warning");
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreate = (name: string, desc: string) => {
    const defaultMembers: TeamMember[] = [
      { id: "dev", name: "大数据工程专家", abbr: "开", abbrBg: "#4B79FF", category: "内置专家", role: "调度者", statusColor: "#0CBF5B", avatar: "/agents/dev-expert.png" },
      { id: "analyst", name: "大数据分析专家", abbr: "析", abbrBg: "#BE63FF", category: "内置专家", role: "执行者", statusColor: "#0CBF5B", avatar: "/agents/analysis-expert.png" },
      { id: "ops", name: "智能管家", abbr: "运", abbrBg: "#00DBB0", category: "内置专家", role: "执行者", statusColor: "#0CBF5B", avatar: "/agents/ops-expert.png" },
    ];
    const newTeam: CustomTeam = { id: `team-${Date.now()}`, name, desc: desc || "自定义协作团队", members: defaultMembers };
    setCustomTeams((prev) => [...prev, newTeam]);
    setShowCreateModal(false);
    showToast("团队创建成功", "success");
  };

  const handleDeleteTeam = (id: string) => {
    setCustomTeams((prev) => prev.filter((t) => t.id !== id));
    setDeletingTeamId(null);
    showToast("团队已删除", "success");
  };

  const handleSaveMembers = (teamId: string, members: TeamMember[]) => {
    // 编辑 members 后清掉旧的 clusterImgs 快照，让 UI 基于最新 members 动态派生头像
    setCustomTeams((prev) => prev.map((t) => t.id === teamId ? { ...t, members, clusterImgs: undefined } : t));
    setManagingTeamId(null);
    showToast("成员配置已保存", "success");
  };

  const managingTeam = customTeams.find((t) => t.id === managingTeamId);
  const deletingTeam = customTeams.find((t) => t.id === deletingTeamId);

  // 数字分身
  const [avatarData, setAvatarData] = useState<AvatarData>(initial?.avatarData ?? {
    name: "运营助手", desc: "个人定制的运营分析助手，沉淀了日常运营经验",
    tags: ["运营", "数据分析", "日报"],
    skills: [{ name: "运营报表生成", enabled: true }, { name: "运营洞察", enabled: true }, { name: "知识沉淀", enabled: true }],
    avatar: "/agents/preset-avatars/avatar-01.png",
  });
  const [avatarDeleted, setAvatarDeleted] = useState(initial?.avatarDeleted ?? false);
  const [showAvatarDetail, setShowAvatarDetail] = useState(false);
  const [showAvatarDelete, setShowAvatarDelete] = useState(false);
  const [showCreateAvatar, setShowCreateAvatar] = useState(false);
  const [customAvatars, setCustomAvatars] = useState<{ id: string; name: string; desc: string; tags: string[]; skills: { name: string; enabled: boolean }[]; bg: string; avatar?: string }[]>(initial?.customAvatars ?? []);
  const [viewingAvatarId, setViewingAvatarId] = useState<string | null>(null);
  const [deletingAvatarId, setDeletingAvatarId] = useState<string | null>(null);

  const viewingAvatar = customAvatars.find((a) => a.id === viewingAvatarId);
  const deletingAvatar = customAvatars.find((a) => a.id === deletingAvatarId);

  // 外部 Claw
  const [showCreateExternalClaw, setShowCreateExternalClaw] = useState(false);
  const [customClaws, setCustomClaws] = useState<{ id: string; name: string; abbr: string; bg: string; platformLabel: string; apiUrl: string; avatar?: string }[]>(initial?.customClaws ?? []);
  // Lighthouse 连接状态
  const [lh2State, setLh2State] = useState<"connected" | "disconnecting" | "disconnected">(
    (initial?.lh2State === "connected" || initial?.lh2State === "disconnected" || initial?.lh2State === "disconnecting") ? initial.lh2State : "connected"
  );
  // Lighthouse 头像（来自预置头像合集，registry 优先；未持久化时回退到默认 avatar-02）
  const [lh2Avatar] = useState<string>(initial?.lh2Avatar ?? "/agents/preset-avatars/avatar-02.png");
  // 删除外部 Agent 确认弹窗
  const [deletingClawId, setDeletingClawId] = useState<string | null>(null);
  const [deletingClawName, setDeletingClawName] = useState("");
  // 预置卡片的软删除状态
  const [lh2Hidden, setLh2Hidden] = useState(false);

  // ── Registry 桥接 ────────────────────────────────────────────
  // 把内部 state 打包成 AgentRegistry 推送给外部（page.tsx）
  // 为避免循环同步，只有内部 state 变化时推送
  const lastPushedRef = useRef<string>("");
  useEffect(() => {
    if (!onRegistryChange) return;
    // 团队
    const teams: RegistryTeam[] = customTeams.map((t) => ({
      id: t.id === "preset-ops-team" ? "ops-team" : t.id,
      name: t.name,
      desc: t.desc,
      clusterImgs: t.clusterImgs,
      members: t.members,
      preset: t.id === "preset-ops-team",
    }));
    // 加上固定的"大数据团队"（Agent 广场 UI 里硬编码，还未纳入 customTeams）
    const bigdataTeam: RegistryTeam = {
      id: "bigdata-team",
      name: "大数据团队",
      desc: getTeamShortDesc("bigdata-team", "包含数据开发、分析、运维专家的协作团队"),
      preset: true,
      clusterImgs: [
        "/agents/dev-expert.png",
        "/agents/analysis-expert.png",
        "/agents/ops-expert.png",
      ],
      members: [
        { id: "dev", name: "大数据工程专家", abbr: "开", abbrBg: "#4B79FF", category: "内置专家", role: "调度者", statusColor: "#0CBF5B", avatar: "/agents/dev-expert.png" },
        { id: "analyst", name: "大数据分析专家", abbr: "析", abbrBg: "#BE63FF", category: "内置专家", role: "执行者", statusColor: "#0CBF5B", avatar: "/agents/analysis-expert.png" },
        { id: "ops", name: "智能管家", abbr: "运", abbrBg: "#00DBB0", category: "内置专家", role: "执行者", statusColor: "#0CBF5B", avatar: "/agents/ops-expert.png" },
      ],
    };

    // 自定义分身
    const avatars: RegistryAvatar[] = [];
    if (!avatarDeleted) {
      avatars.push({
        id: "my-ops",
        name: avatarData.name,
        desc: avatarData.desc,
        tags: avatarData.tags ?? [],
        skills: (avatarData.skills ?? []).map((s) => ({ name: s.name, enabled: s.enabled })),
        bg: "#4B79FF",
        letter: "运",
        // 预置头像合集（与 DEFAULT_AVATARS 保持一致），用户在弹窗中如果改过会保留
        avatar: avatarData.avatar ?? "/agents/preset-avatars/avatar-01.png",
        preset: true,
      });
    }
    customAvatars.forEach((a) => {
      avatars.push({
        id: a.id,
        name: a.name,
        desc: a.desc,
        tags: a.tags ?? [],
        skills: a.skills ?? [],
        bg: a.bg,
        letter: a.name.charAt(0),
        avatar: a.avatar,
      });
    });

    // 外部 Agent
    const externals: RegistryExternal[] = [
      ...(lh2Hidden ? [] : [{ id: "lh2", name: "Lighthouse", abbr: "L", bg: "#BE63FF", platformLabel: "Lighthouse", state: lh2State === "disconnecting" ? "connected" : lh2State, avatar: lh2Avatar, preset: true } as RegistryExternal]),
      ...customClaws.map((c) => ({ id: c.id, name: c.name, abbr: c.abbr, bg: c.bg, platformLabel: c.platformLabel, apiUrl: c.apiUrl, avatar: c.avatar, state: "disconnected" as const })),
    ];

    // 任务保持 registry 原有的（由 page.tsx 管理，ClawManager 不改任务）
    const tasks = registry?.tasks ?? [];

    const next: AgentRegistry = {
      teams: [bigdataTeam, ...teams],
      experts: DEFAULT_EXPERTS,
      avatars,
      externals,
      tasks,
    };
    const snapshot = JSON.stringify({ teams: next.teams, avatars: next.avatars, externals: next.externals });
    if (snapshot !== lastPushedRef.current) {
      lastPushedRef.current = snapshot;
      onRegistryChange(next);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customTeams, avatarData, avatarDeleted, customAvatars, lh2State, customClaws]);

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      fontFamily: FONT, background: C.bg,
    }}>
      <div style={{
        height: 50, flexShrink: 0, display: "flex", alignItems: "center",
        padding: "0 24px", borderBottom: `1px solid ${C.border}`, background: C.bg,
      }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary }}>Agent 广场</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        {/* 团队 */}
        <SectionTitle title="团队" desc="拉取不同来源 Agent 组建团队，协作完成复杂任务" />
        <div style={{ display: "flex", gap: 16, padding: "0 24px 8px", flexWrap: "wrap", alignItems: "stretch" }}>
          <Card
            avatar={<ClusterAvatar size={48} imgs={[
              "/agents/dev-expert.png",
              "/agents/analysis-expert.png",
              "/agents/ops-expert.png",
            ]} />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>大数据团队 (3)</span>}
            desc="数据开发、分析、运维协作团队"
            onDialog={() => onAgentDialog?.("bigdata-team", "大数据团队")}
            onCardClick={() => onAgentDetail?.("team", "bigdata-team")}
          />
          {/* 动态创建的团队卡片（含预置的"运营协作团队"） */}
          {customTeams.map((team) => {
            // 一律基于最新 members 动态派生头像；不使用 team.clusterImgs 快照，
            // 避免编辑成员后仍显示旧图。
            const cluster = deriveClusterImgs(team.members);
            const registryTeamId = team.id === "preset-ops-team" ? "ops-team" : team.id;
            return (
              <Card
                key={team.id}
                avatar={cluster
                  ? <ClusterAvatar size={48} imgs={cluster} />
                  : <AvatarCircle letter={team.name.charAt(0)} bg="#BE63FF" />
                }
                name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>{team.name} ({team.members.length})</span>}
                desc={getTeamShortDesc(registryTeamId, team.desc)}
                badge={(hovered) => <MoreMenu visible={hovered} onManage={() => setManagingTeamId(team.id)} onDelete={() => setDeletingTeamId(team.id)} />}
                onDialog={() => onAgentDialog?.(registryTeamId, team.name)}
                onCardClick={() => onAgentDetail?.("team", registryTeamId)}
              />
            );
          })}
          {!isAtLimit && <CreateCard label="创建团队" onClick={handleCreateClick} />}
        </div>

        {/* 大数据专家 */}
        <SectionTitle title="大数据 Agent" desc="内置大数据专家团队，开箱即用" />
        <div style={{ display: "flex", gap: 16, padding: "0 24px 8px", flexWrap: "wrap" }}>
          <Card
            avatar={<AvatarCircle src="/agents/dev-expert.png" />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Rigel·数据工程专家</span>}
            desc={getShortDesc("dev-expert", "负责数据建模、调优执行，将原始数据转化为可分析的高质量数据资产。")}
            onDialog={() => onAgentDialog?.("dev-expert", "数据工程专家")}
            onCardClick={() => onAgentDetail?.("expert", "dev-expert")}
          />
          <Card
            avatar={<AvatarCircle src="/agents/analysis-expert.png" />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Vega·数据分析专家</span>}
            desc={getShortDesc("analysis-expert", "从海量数据提取关键洞察，构建数据模型与可视化报告，提供业务决策支持。")}
            onDialog={() => onAgentDialog?.("analysis-expert", "数据分析专家")}
            onCardClick={() => onAgentDetail?.("expert", "analysis-expert")}
          />
          <Card
            avatar={<AvatarCircle src="/agents/ops-expert.png" />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Orion·智能管家</span>}
            desc={getShortDesc("ops-expert", "负责集群监控、性能监测、故障排查与容量规划，确保数据平台高可用。")}
            onDialog={() => onAgentDialog?.("ops-expert", "智能管家")}
            onCardClick={() => onAgentDetail?.("expert", "ops-expert")}
          />
        </div>

        {/* 数字分身 */}
        <SectionTitle title="自定义 Agent" desc="定制你的专属 AI 数字分身，沉淀个人知识" />
        <div style={{ display: "flex", gap: 16, padding: "0 24px 8px", flexWrap: "wrap", alignItems: "stretch" }}>
          {!avatarDeleted && (
            <Card
              avatar={<AvatarCircle src={avatarData.avatar} letter="运" bg="#4B79FF" />}
              name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>{avatarData.name}</span>}
              desc={getShortDesc("custom-avatar", avatarData.desc)}
              badge={(hovered) => <AvatarMoreMenu visible={hovered} onDetail={() => setShowAvatarDetail(true)} onDelete={() => setShowAvatarDelete(true)} />}
              onDialog={() => onAgentDialog?.("my-ops", avatarData.name)}
              onCardClick={() => onAgentDetail?.("avatar", "my-ops")}
            />
          )}
          {/* 自定义数字分身 */}
          {customAvatars.map((a) => (
            <Card
              key={a.id}
              avatar={<AvatarCircle src={a.avatar} letter={a.name.charAt(0)} bg={a.bg} />}
              name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>{a.name}</span>}
              desc={a.desc || "自定义 Agent"}
              badge={(hovered) => <AvatarMoreMenu visible={hovered} onDetail={() => setViewingAvatarId(a.id)} onDelete={() => setDeletingAvatarId(a.id)} />}
              onDialog={() => onAgentDialog?.(a.id, a.name)}
              onCardClick={() => onAgentDetail?.("avatar", a.id)}
            />
          ))}
          {(1 + customAvatars.length) < 3 && (
            <CreateCard label="创建自定义 Agent" onClick={() => setShowCreateAvatar(true)} />
          )}
        </div>

        {/* 外部 Claw */}
        <SectionTitle title="外部 Agent" desc="连接你在外部平台部署的 Agent" />
        <div style={{ display: "flex", gap: 16, padding: "0 24px 24px", flexWrap: "wrap", alignItems: "stretch" }}>
          {!lh2Hidden && (
            <ExternalClawCard
              avatar={<AvatarCircle src={lh2Avatar} letter="L" bg="#BE63FF" />}
              name="Lighthouse"
              desc="云端实例一键连接"
              connected={lh2State === "connected"}
              buttonLabel={lh2State === "disconnecting" ? "断开中..." : "连接"}
              onButtonClick={() => {
                if (lh2State === "connected") { onAgentDialog?.("lh2", "Coze"); return; }
                if (lh2State === "disconnected") { setLh2State("disconnecting"); setTimeout(() => { setLh2State("connected"); showToast("连接成功", "success"); }, 1500); }
              }}
              onDisconnect={() => { setLh2State("disconnecting"); setTimeout(() => { setLh2State("disconnected"); showToast("已断开连接", "success"); }, 1500); }}
              onDelete={() => { setDeletingClawId("lh2"); setDeletingClawName("Coze"); }}
            />
          )}
          {/* 自定义外部 Claw */}
          {customClaws.map((c) => (
            <ExternalClawCard
              key={c.id}
              avatar={<AvatarCircle src={c.avatar} letter={c.abbr} bg={c.bg} />}
              name={c.name}
              desc="外部平台已接入"
              connected={false}
              buttonLabel="连接"
              onButtonClick={() => onAgentDialog?.(c.id, c.name)}
            />
          ))}
          <CreateCard label="连接外部 Agent" onClick={() => setShowCreateExternalClaw(true)} />
        </div>
      </div>

      {/* 创建团队弹窗 */}
      <CreateTeamDialog open={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreate} existingNames={[...customTeams.map(t => t.name), "大数据团队"]} />

      {/* 团队详情弹窗 */}
      <AnimatePresence>
        {managingTeam && (
          <TeamDetailModal
            team={managingTeam}
            onClose={() => setManagingTeamId(null)}
            existingNames={[...customTeams.map(t => t.name), "大数据团队"]}
            onSave={(updated) => { setCustomTeams((prev) => prev.map((t) => t.id === updated.id ? { ...updated, clusterImgs: undefined } : t)); setManagingTeamId(null); showToast("团队信息已保存", "success"); }}
          />
        )}
      </AnimatePresence>

      {/* 删除确认弹窗 */}
      <AnimatePresence>
        {deletingTeam && (
          <DeleteConfirmModal
            teamName={deletingTeam.name}
            onClose={() => setDeletingTeamId(null)}
            onConfirm={() => handleDeleteTeam(deletingTeam.id)}
          />
        )}
      </AnimatePresence>

      {/* 创建外部 Claw 弹窗 */}
      <CreateExternalClawDialog
        open={showCreateExternalClaw}
        onClose={() => setShowCreateExternalClaw(false)}
        onCreate={(data) => {
          setCustomClaws((prev) => [...prev, { id: `claw-${Date.now()}`, name: data.name, abbr: data.platformAbbr, bg: data.platformBg, platformLabel: data.platformLabel, apiUrl: data.apiUrl, avatar: pickRandomPresetAvatar() }]);
          setShowCreateExternalClaw(false);
          showToast("外部 Claw 创建成功", "success");
        }}
      />

      {/* 创建数字分身弹窗 */}
      <CreateAvatarDialog
        open={showCreateAvatar}
        onClose={() => setShowCreateAvatar(false)}
        existingNames={[...customAvatars.map(a => a.name), avatarData.name, "Rigel·数据工程专家", "Vega·数据分析专家", "Orion·智能管家", "运营助手", "Lighthouse"]}
        onCreate={(name, desc, tags) => {
          setCustomAvatars((prev) => [...prev, { id: `avatar-${Date.now()}`, name, desc, tags: tags ? tags.split(/[,，、]/).map((s) => s.trim()).filter(Boolean) : [], skills: [], bg: pickAvatarBg(prev.length), avatar: pickRandomPresetAvatar() }]);
          setShowCreateAvatar(false);
          showToast("自定义 Agent 创建成功", "success");
        }}
      />

      {/* 数字分身详情弹窗 */}
      <AnimatePresence>
        {showAvatarDetail && (
          <AvatarDetailModal
            data={avatarData}
            onClose={() => setShowAvatarDetail(false)}
            onSave={(d) => { setAvatarData(d); setShowAvatarDetail(false); showToast("分身信息已保存", "success"); }}
          />
        )}
      </AnimatePresence>

      {/* 数字分身删除确认 */}
      <AnimatePresence>
        {showAvatarDelete && (
          <AvatarDeleteConfirm
            name={avatarData.name}
            onCancel={() => setShowAvatarDelete(false)}
            onConfirm={() => { setAvatarDeleted(true); setShowAvatarDelete(false); showToast("数字分身已删除", "success"); }}
          />
        )}
      </AnimatePresence>

      {/* 自定义数字分身详情弹窗 */}
      <AnimatePresence>
        {viewingAvatar && (
          <AvatarDetailModal
            data={{ name: viewingAvatar.name, desc: viewingAvatar.desc, tags: viewingAvatar.tags, skills: viewingAvatar.skills }}
            onClose={() => setViewingAvatarId(null)}
            onSave={(d) => { setCustomAvatars((prev) => prev.map((a) => a.id === viewingAvatarId ? { ...a, ...d } : a)); setViewingAvatarId(null); showToast("自定义 Agent 信息已保存", "success"); }}
          />
        )}
      </AnimatePresence>

      {/* 自定义 Agent 删除确认 */}
      <AnimatePresence>
        {deletingAvatar && (
          <AvatarDeleteConfirm
            name={deletingAvatar.name}
            onCancel={() => setDeletingAvatarId(null)}
            onConfirm={() => { setCustomAvatars((prev) => prev.filter((a) => a.id !== deletingAvatarId)); setDeletingAvatarId(null); showToast("自定义 Agent 已删除", "success"); }}
          />
        )}
      </AnimatePresence>

      {/* 删除外部 Claw 确认弹窗 */}
      <AnimatePresence>
        {deletingClawId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} onClick={() => setDeletingClawId(null)}
            style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: EASE }} onClick={(e) => e.stopPropagation()}
              style={{ width: 420, background: C.bgWhite, borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: FONT, padding: "28px 28px 24px", position: "relative" }}
            >
              <div onClick={() => setDeletingClawId(null)} style={{ position: "absolute", top: 16, right: 16, width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 100ms" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingRight: 32 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill={C.error} /><path d="M10 6v5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" /><circle cx="10" cy="14" r="0.75" fill="#FFF" /></svg>
                <span style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>删除外部 Claw &quot;{deletingClawName}&quot;</span>
              </div>
              <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: "22px", marginBottom: 24 }}>
                此操作仅会将该外部 Claw 从当前列表中移除，不会删除 {deletingClawName} 平台上的实际资源。你可以随时重新连接。
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button onClick={() => setDeletingClawId(null)} style={{ height: 36, padding: "0 24px", borderRadius: 100, border: `1px solid ${C.border}`, background: C.bgWhite, fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textPrimary, cursor: "pointer", outline: "none" }}>取消</button>
                <button onClick={() => {
                  if (deletingClawId === "lh2") { setLh2Hidden(true); }
                  else { setCustomClaws((prev) => prev.filter((c) => c.id !== deletingClawId)); }
                  setDeletingClawId(null);
                  showToast("已从列表中移除", "success");
                }} style={{ height: 36, padding: "0 24px", borderRadius: 100, border: "none", background: C.error, fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "#FFF", cursor: "pointer", outline: "none" }}>确认删除</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 全局 Toast */}
      <Toast message={toastMsg} visible={toastVisible} type={toastType} onDone={hideToast} />
    </div>
  );
}
