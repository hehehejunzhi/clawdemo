"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreateTeamDialog from "./create-team-dialog";

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
  brandCyan: "#00C8D6",
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
      <span style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>{title}</span>
      <span style={{ fontSize: 14, fontWeight: 400, color: C.textTertiary }}>{desc}</span>
    </div>
  );
}

// ── Dialog button (pill, gradient border) ─────────────────────
function DialogBtn({ label, icon }: { label: string; icon?: boolean }) {
  const [h, setH] = useState(false);
  return (
    <button
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

// ── Card shell (340 x 168, horizontal layout) ─────────────────
function Card({ avatar, name, desc, badge, button, children }: {
  avatar: React.ReactNode;
  name: React.ReactNode;
  desc: string;
  badge?: React.ReactNode;
  button?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: 340, minHeight: 168, background: C.bgWhite, borderRadius: 16,
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
            {badge}
          </div>
          <div style={{
            minHeight: 40, fontSize: 14, fontWeight: 400, color: C.textPrimary, lineHeight: "20px",
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
          }}>{desc}</div>
        </div>
      </div>
      {children}
      {/* Bottom: action button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {button ?? <DialogBtn label="对话" />}
      </div>
    </div>
  );
}

// ── Avatar (round, with image or letter) ──────────────────────
function AvatarCircle({ src, letter, bg, size = 48, status }: { src?: string; letter?: string; bg?: string; size?: number; status?: "online" | "offline" }) {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
      <div style={{
        width: size, height: size, borderRadius: size,
        background: bg ?? "#EEEEEE", border: "1px solid #E7E7E7",
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {src ? <img src={src} alt="" style={{ width: size + 3, height: size + 3, objectFit: "cover" }} />
          : <span style={{ fontSize: size * 0.5, fontWeight: 500, color: "#FFF" }}>{letter}</span>}
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
        background: "#EEEEEE", border: "0.86px solid #E7E7E7",
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
        width: 168, minHeight: 168, background: "transparent", borderRadius: 16,
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
type TeamMember = { id: string; name: string; abbr: string; abbrBg: string; category: string; role: "调度者" | "执行者" | "观察者"; statusColor: string };
type CustomTeam = { id: string; name: string; desc: string; members: TeamMember[] };

const ALL_AVAILABLE_MEMBERS: Omit<TeamMember, "role">[] = [
  { id: "analyst", name: "大数据分析专家", abbr: "析", abbrBg: "#7B68EE", category: "内置专家", statusColor: "#0CBF5B" },
  { id: "ops", name: "大数据运维专家", abbr: "运", abbrBg: "#3BAFB9", category: "内置专家", statusColor: "#0CBF5B" },
  { id: "dev", name: "大数据开发专家", abbr: "开", abbrBg: "#1664FF", category: "内置专家", statusColor: "#0CBF5B" },
  { id: "my-ops", name: "我的运营助手", abbr: "营", abbrBg: "#E8524A", category: "数字分身", statusColor: "#FF7800" },
  { id: "lh", name: "Lighthouse", abbr: "LH", abbrBg: "#FF7800", category: "外部 Claw", statusColor: "#0CBF5B" },
  { id: "cp", name: "ClawPro", abbr: "CP", abbrBg: "#1664FF", category: "外部 Claw", statusColor: "#0CBF5B" },
  { id: "gp", name: "ChatGPT Plugin", abbr: "GP", abbrBg: "#00B96B", category: "外部 Claw", statusColor: "#0CBF5B" },
];

// ── 三点菜单 ──────────────────────────────────────────────────
function MoreMenu({ onManage, onDelete }: { onManage: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
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
              { label: "成员管理", action: onManage },
              { label: "删除团队", action: onDelete },
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

// ── 角色选择下拉 ──────────────────────────────────────────────
function RoleSelect({ value, onChange }: { value: string; onChange: (v: "调度者" | "执行者" | "观察者") => void }) {
  const [open, setOpen] = useState(false);
  const roles: ("调度者" | "执行者" | "观察者")[] = ["调度者", "执行者", "观察者"];
  return (
    <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 4, padding: "4px 8px",
          borderRadius: 6, border: `1px solid ${C.border}`, cursor: "pointer",
          fontSize: 13, fontWeight: 400, color: C.textPrimary, background: C.bgWhite,
          fontFamily: FONT, whiteSpace: "nowrap",
        }}
      >
        {value}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 5l3 3 3-3" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: 32, right: 0, zIndex: 200,
            minWidth: 100, background: C.bgWhite, borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)", border: `1px solid ${C.border}`,
            padding: "4px 0",
          }}>
            {roles.map((r) => (
              <div
                key={r}
                onClick={() => { onChange(r); setOpen(false); }}
                style={{
                  padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  fontFamily: FONT, fontSize: 13, color: C.textPrimary,
                  background: r === value ? "rgba(22,100,255,0.06)" : "transparent",
                  fontWeight: r === value ? 500 : 400,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = r === value ? "rgba(22,100,255,0.06)" : "transparent"; }}
              >
                {r === value && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6.5l2.5 2.5L10 3" stroke="#1664FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                {r}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── 成员管理弹窗 ──────────────────────────────────────────────
function MemberManageModal({ teamName, members, onClose, onSave }: {
  teamName: string;
  members: TeamMember[];
  onClose: () => void;
  onSave: (members: TeamMember[]) => void;
}) {
  const [localMembers, setLocalMembers] = useState<TeamMember[]>(() => [...members]);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const existingIds = new Set(localMembers.map((m) => m.id));
  const addableMembers = ALL_AVAILABLE_MEMBERS.filter((m) => !existingIds.has(m.id));

  const updateRole = (id: string, role: "调度者" | "执行者" | "观察者") => {
    setLocalMembers((prev) => prev.map((m) => m.id === id ? { ...m, role } : m));
  };

  const removeMember = (id: string) => {
    setLocalMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const addMember = (m: Omit<TeamMember, "role">) => {
    setLocalMembers((prev) => [...prev, { ...m, role: "执行者" }]);
    setShowAddPanel(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560, maxHeight: "85vh", background: C.bgWhite, borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          fontFamily: FONT, display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* 头部 */}
        <div style={{ padding: "24px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 20, fontWeight: 600, color: C.textPrimary }}>成员管理</span>
          <div onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
        </div>
        <div style={{ padding: "8px 24px 16px", fontSize: 13, color: C.textTertiary }}>
          添加/移除成员 · 查看在线状态 · 分配角色（调度者/执行者/观察者）
        </div>

        {/* 成员列表 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px", scrollbarWidth: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {localMembers.map((m) => (
            <div key={m.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 12,
              background: "#FAFBFC", border: `1px solid ${C.border}`,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 20, background: m.abbrBg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#FFF" }}>{m.abbr}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>{m.name}</div>
                <div style={{ fontSize: 12, color: C.textTertiary }}>{m.category}</div>
              </div>
              <RoleSelect value={m.role} onChange={(r) => updateRole(m.id, r)} />
              <span
                onClick={() => removeMember(m.id)}
                style={{ fontSize: 13, fontWeight: 500, color: C.error, cursor: "pointer", flexShrink: 0, padding: "2px 4px" }}
              >移除</span>
            </div>
          ))}

          {/* 添加成员按钮 */}
          {!showAddPanel ? (
            <div
              onClick={() => setShowAddPanel(true)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "12px", borderRadius: 12,
                border: `1px dashed ${C.border}`, cursor: "pointer",
                fontSize: 14, fontWeight: 400, color: C.textSecondary,
                transition: "background 100ms",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >+ 添加成员 Claw</div>
          ) : (
            <div style={{
              padding: "12px 16px", borderRadius: 12,
              border: `1px solid ${C.border}`, background: "#FAFBFC",
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, marginBottom: 4 }}>选择要添加的成员</div>
              {addableMembers.length === 0 ? (
                <div style={{ fontSize: 13, color: C.textTertiary, padding: "8px 0" }}>暂无可添加的成员</div>
              ) : addableMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => addMember(m)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
                    borderRadius: 6, cursor: "pointer", transition: "background 100ms",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: 4, background: m.abbrBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#FFF" }}>{m.abbr}</span>
                  </div>
                  <span style={{ fontSize: 13, color: C.textPrimary }}>{m.name}</span>
                  <span style={{ fontSize: 12, color: C.textTertiary }}>({m.category})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div style={{
          padding: "16px 24px", display: "flex", justifyContent: "flex-end", gap: 12,
          borderTop: `1px solid ${C.border}`, marginTop: 8,
        }}>
          <button onClick={onClose} style={{
            height: 40, padding: "0 24px", borderRadius: 100,
            border: `1px solid ${C.border}`, background: C.bgWhite,
            fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.textPrimary,
            cursor: "pointer", outline: "none",
          }}>取消</button>
          <button onClick={() => onSave(localMembers)} style={{
            height: 40, padding: "0 24px", borderRadius: 100,
            border: "none", background: "#000000",
            fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "#FFF",
            cursor: "pointer", outline: "none",
          }}>保存</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 删除确认弹窗 ──────────────────────────────────────────────
function DeleteConfirmModal({ teamName, onClose, onConfirm }: { teamName: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420, background: C.bgWhite, borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          fontFamily: FONT, padding: "28px 28px 24px", position: "relative",
        }}
      >
        {/* 关闭按钮 */}
        <div
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            width: 28, height: 28, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "background 100ms",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingRight: 32 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" fill={C.error} />
            <path d="M10 6v5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="14" r="0.75" fill="#FFF" />
          </svg>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>删除团队 &quot;{teamName}&quot;</span>
        </div>
        <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: "22px", marginBottom: 24 }}>
          若删除该团队，相关的历史对话、远程连接等信息都将被删除，该操作不可逆。
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={onClose} style={{
            height: 36, padding: "0 24px", borderRadius: 100,
            border: `1px solid ${C.border}`, background: C.bgWhite,
            fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textPrimary,
            cursor: "pointer", outline: "none",
          }}>取消</button>
          <button onClick={onConfirm} style={{
            height: 36, padding: "0 24px", borderRadius: 100,
            border: "none", background: C.error,
            fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "#FFF",
            cursor: "pointer", outline: "none",
          }}>确认删除</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 创建外部 Claw 弹窗 ───────────────────────────────────────
const PLATFORMS = [
  { id: "lh", label: "Lighthouse", abbr: "LH", bg: "#E59858" },
  { id: "cp", label: "ClawPro", abbr: "CP", bg: "#1664FF" },
  { id: "gp", label: "ChatGPT Plugin", abbr: "GP", bg: "#00B96B" },
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

  const fieldInputStyle: React.CSSProperties = {
    width: "100%", height: 40, padding: "0 12px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: "#FAFBFC",
    fontFamily: FONT, fontSize: 14, color: C.textPrimary, outline: "none", boxSizing: "border-box",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }} onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: EASE }} onClick={(e) => e.stopPropagation()}
            style={{ width: 640, maxHeight: "85vh", background: C.bgWhite, borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1), 0 8px 12px -8px rgba(0,0,0,0.05)", fontFamily: FONT, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {/* Header */}
            <div style={{ padding: "24px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>创建外部 Claw</span>
              <div onClick={onClose} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 4 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 20, scrollbarWidth: "none" }}>
              {/* 名称 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>名称 <span style={{ color: C.error }}>*</span></span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：我的自定义 Claw" style={fieldInputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
              </div>

              {/* 来源平台 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>来源平台 <span style={{ color: C.error }}>*</span></span>
                <div style={{ display: "flex", gap: 12 }}>
                  {PLATFORMS.map((p) => (
                    <div key={p.id} onClick={() => setPlatform(p.id)}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                        border: `1.5px solid ${platform === p.id ? "#7E9EFF" : C.border}`,
                        background: platform === p.id ? "rgba(126,158,255,0.04)" : C.bgWhite,
                        transition: "all 100ms",
                      }}
                    >
                      <div style={{
                        width: 16, height: 16, borderRadius: 8,
                        border: `2px solid ${platform === p.id ? "#1664FF" : "#D6DBE3"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {platform === p.id && <div style={{ width: 8, height: 8, borderRadius: 4, background: "#1664FF" }} />}
                      </div>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#FFF" }}>{p.abbr}</span>
                      </div>
                      <span style={{ fontSize: 14, color: C.textPrimary }}>{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* API 接入地址 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>API 接入地址 <span style={{ color: C.error }}>*</span></span>
                <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://api.example.com/v1/claw" style={fieldInputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
              </div>

              {/* IP 地址 + 端口 */}
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>IP 地址</span>
                  <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="192.168.1.1" style={fieldInputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
                </div>
                <div style={{ width: 120, display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>端口</span>
                  <input value={port} onChange={(e) => setPort(e.target.value)} placeholder="8080" style={fieldInputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px", display: "flex", justifyContent: "flex-end", gap: 16, borderTop: `1px solid ${C.border}` }}>
              <button onClick={onClose} style={{ width: 92, height: 40, borderRadius: 32, border: `1px solid #D6DBE3`, background: C.bgWhite, fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.textPrimary, cursor: "pointer", outline: "none" }}>取消</button>
              <button onClick={handleCreate} disabled={!isValid} style={{ width: 92, height: 40, borderRadius: 32, border: "none", background: isValid ? "#000" : "#CCC", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.9)", cursor: isValid ? "pointer" : "not-allowed", outline: "none" }}>创建</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── 创建数字分身弹窗（Figma: 640px） ─────────────────────────
function CreateAvatarDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string, desc: string, tags: string) => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const isValid = name.trim().length > 0;

  const handleCreate = () => { if (isValid) { onCreate(name.trim(), desc.trim(), tags.trim()); setName(""); setDesc(""); setTags(""); } };

  const labelStyle: React.CSSProperties = { fontSize: 12, color: C.textTertiary, flexShrink: 0, width: 91, paddingTop: 7 };
  const fieldInputStyle: React.CSSProperties = {
    flex: 1, height: 32, padding: "0 12px", borderRadius: 3,
    border: `1px solid ${C.border}`, background: C.bgWhite,
    fontFamily: FONT, fontSize: 12, color: C.textPrimary, outline: "none", boxSizing: "border-box",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }} onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: EASE }} onClick={(e) => e.stopPropagation()}
            style={{ width: 640, background: C.bgWhite, borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1), 0 8px 12px -8px rgba(0,0,0,0.05)", fontFamily: FONT, padding: 24 }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>创建数字分身</span>
              <div onClick={onClose} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 4 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* 名称 */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={labelStyle}><span style={{ color: C.textTertiary }}>数字分身名称 </span><span style={{ color: C.error }}>*</span></div>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：我的监控助手" style={fieldInputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
              </div>
              {/* 描述 */}
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={labelStyle}>描述</div>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="简要描述分身目标和用途" rows={3}
                  style={{ ...fieldInputStyle, height: "auto", padding: "5px 12px", resize: "none" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
              </div>
              {/* 标签 */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={labelStyle}>标签</div>
                <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="输入标签，多个用逗号分隔，如：数据分析，报表生成，SQL 优化" style={fieldInputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 32 }}>
              <button onClick={onClose} style={{ width: 92, height: 40, borderRadius: 32, border: `1px solid #D6DBE3`, background: C.bgWhite, fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.textPrimary, cursor: "pointer", outline: "none" }}>取消</button>
              <button onClick={handleCreate} disabled={!isValid} style={{ width: 92, height: 40, borderRadius: 32, border: "none", background: isValid ? "#000" : "#CCC", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.9)", cursor: isValid ? "pointer" : "not-allowed", outline: "none" }}>创建</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── 数字分身三点菜单（Figma: 152x82 圆角16） ─────────────────
function AvatarMoreMenu({ onDetail, onDelete }: { onDetail: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
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
              { label: "查看详情", action: onDetail },
              { label: "删除数字分身", action: onDelete },
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

// ── 数字分身详情弹窗 ──────────────────────────────────────────
type AvatarData = { name: string; desc: string; tags: string[]; skills: { name: string; enabled: boolean }[] };

function AvatarDetailModal({ data, onClose, onSave, onConfigSkill }: {
  data: AvatarData; onClose: () => void; onSave: (d: AvatarData) => void; onConfigSkill?: () => void;
}) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [form, setForm] = useState<AvatarData>({ ...data, tags: [...data.tags], skills: data.skills.map((s) => ({ ...s })) });

  const save = () => { onSave(form); setEditingField(null); };
  const cancel = () => { setForm({ ...data, tags: [...data.tags], skills: data.skills.map((s) => ({ ...s })) }); setEditingField(null); };

  const editIcon = (field: string) => (
    <div onClick={() => setEditingField(field)} style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", padding: 2, borderRadius: 4, marginLeft: 6, transition: "background 100ms" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 1.5l2 2-8 8H2.5v-2l8-8z" stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); }
    if (e.key === "Escape") cancel();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "6px 10px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: "#FAFBFC",
    fontFamily: FONT, fontSize: 14, color: C.textPrimary,
    outline: "none", boxSizing: "border-box",
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
        style={{ width: 560, maxHeight: "80vh", background: C.bgWhite, borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1), 0 8px 12px -8px rgba(0,0,0,0.05)", fontFamily: FONT, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary }}>数字分身详情</span>
          <div onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "background 100ms" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
          ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 20, scrollbarWidth: "none" }}>
          {/* 名称 */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
            <span style={{ fontSize: 14, color: C.textTertiary, flexShrink: 0, width: 90 }}>数字分身名称</span>
            <div style={{ flex: 1 }}>
              {editingField === "name" ? (
                <input autoFocus value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle}
                  onKeyDown={handleKeyDown} onBlur={save} />
              ) : (
                <span style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>{data.name}{editIcon("name")}</span>
              )}
            </div>
          </div>

          {/* 描述 */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
            <span style={{ fontSize: 14, color: C.textTertiary, flexShrink: 0, width: 90 }}>描述</span>
            <div style={{ flex: 1 }}>
              {editingField === "desc" ? (
                <textarea autoFocus value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} rows={2}
                  style={{ ...inputStyle, resize: "none" }} onKeyDown={handleKeyDown} onBlur={save} />
              ) : (
                <span style={{ fontSize: 14, color: C.textPrimary, lineHeight: "22px" }}>{data.desc}{editIcon("desc")}</span>
              )}
            </div>
          </div>

          {/* 标签 */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
            <span style={{ fontSize: 14, color: C.textTertiary, flexShrink: 0, width: 90 }}>标签</span>
            <div style={{ flex: 1 }}>
              {editingField === "tags" ? (
                <input autoFocus value={form.tags.join("、")} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value.split("、").map((s) => s.trim()).filter(Boolean) }))}
                  placeholder="用「、」分隔" style={inputStyle} onKeyDown={handleKeyDown} onBlur={save} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {data.tags.map((t) => (<span key={t} style={{ fontSize: 13, padding: "3px 12px", borderRadius: 6, background: "#F2F4F8", color: C.textPrimary, border: `1px solid ${C.border}` }}>{t}</span>))}
                  {editIcon("tags")}
                </div>
              )}
            </div>
          </div>

          {/* 已关联技能 */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
            <span style={{ fontSize: 14, color: C.textTertiary, flexShrink: 0, width: 90, paddingTop: 10 }}>已关联技能</span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.skills.map((s) => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderRadius: 8, background: "#FAFBFC", border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 14, color: C.textPrimary }}>{s.name}</span>
                  <span style={{ fontSize: 13, color: C.brandCyan, fontWeight: 500 }}>已启用</span>
                </div>
              ))}
              <span onClick={() => { onClose(); onConfigSkill?.(); }}
                style={{ fontSize: 13, color: "#1664FF", cursor: "pointer", fontWeight: 500, marginTop: 2 }}
              >配置技能</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ClawManager({ onNavigateToSkillPlaza }: { onNavigateToSkillPlaza?: () => void } = {}) {
  const [customTeams, setCustomTeams] = useState<CustomTeam[]>([]);
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
      { id: "analyst", name: "大数据分析专家", abbr: "析", abbrBg: "#7B68EE", category: "内置专家", role: "调度者", statusColor: "#0CBF5B" },
      { id: "ops", name: "大数据运维专家", abbr: "运", abbrBg: "#3BAFB9", category: "内置专家", role: "执行者", statusColor: "#0CBF5B" },
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
    setCustomTeams((prev) => prev.map((t) => t.id === teamId ? { ...t, members } : t));
    setManagingTeamId(null);
    showToast("成员配置已保存", "success");
  };

  const managingTeam = customTeams.find((t) => t.id === managingTeamId);
  const deletingTeam = customTeams.find((t) => t.id === deletingTeamId);

  // 数字分身
  const [avatarData, setAvatarData] = useState<AvatarData>({
    name: "运营助手", desc: "个人定制的运营分析助手，沉淀了日常运营经验",
    tags: ["运营", "数据分析", "日报"],
    skills: [{ name: "运营报表生成", enabled: true }, { name: "运营洞察", enabled: true }, { name: "知识沉淀", enabled: true }],
  });
  const [avatarDeleted, setAvatarDeleted] = useState(false);
  const [showAvatarDetail, setShowAvatarDetail] = useState(false);
  const [showAvatarDelete, setShowAvatarDelete] = useState(false);
  const [showCreateAvatar, setShowCreateAvatar] = useState(false);
  const [customAvatars, setCustomAvatars] = useState<{ id: string; name: string; desc: string; tags: string[]; skills: { name: string; enabled: boolean }[] }[]>([]);
  const [viewingAvatarId, setViewingAvatarId] = useState<string | null>(null);
  const [deletingAvatarId, setDeletingAvatarId] = useState<string | null>(null);

  const viewingAvatar = customAvatars.find((a) => a.id === viewingAvatarId);
  const deletingAvatar = customAvatars.find((a) => a.id === deletingAvatarId);

  // 外部 Claw
  const [showCreateExternalClaw, setShowCreateExternalClaw] = useState(false);
  const [customClaws, setCustomClaws] = useState<{ id: string; name: string; abbr: string; bg: string; platformLabel: string; apiUrl: string }[]>([]);
  // Lighthouse 连接状态: "disconnected" | "connecting" | "connected" | "disconnecting"
  const [lh1State, setLh1State] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [lh2State, setLh2State] = useState<"connected" | "disconnecting" | "disconnected">("connected");

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
        <span style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary }}>Claw广场</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        {/* 团队 */}
        <SectionTitle title="团队" desc="拉取不同种Claw组建团队，协作完成复杂任务" />
        <div style={{ display: "flex", gap: 16, padding: "0 24px 8px", flexWrap: "wrap", alignItems: "stretch" }}>
          <Card
            avatar={<GridAvatar />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>大数据团队 (3)</span>}
            desc="包含大数据分析专家和大数据运维专家的协作团队"
          />
          {/* 动态创建的团队卡片 */}
          {customTeams.map((team) => (
            <Card
              key={team.id}
              avatar={<AvatarCircle letter={team.name.charAt(0)} bg="#7B68EE" />}
              name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>{team.name} ({team.members.length})</span>}
              desc={team.desc}
              badge={<MoreMenu onManage={() => setManagingTeamId(team.id)} onDelete={() => setDeletingTeamId(team.id)} />}
            />
          ))}
          <CreateCard label="创建团队" onClick={handleCreateClick} disabled={isAtLimit} />
        </div>

        {/* 大数据专家 */}
        <SectionTitle title="大数据专家" desc="内置专家团队，开箱即用" />
        <div style={{ display: "flex", gap: 16, padding: "0 24px 8px", flexWrap: "wrap" }}>
          <Card
            avatar={<AvatarCircle src="/icons/claw-mgr/7.svg" />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Rigel·数据开发专家</span>}
            desc="从海量数据中提取关键洞察，构建数据模型与可视化报告，为业务决策提供数据驱动支持"
          />
          <Card
            avatar={<AvatarCircle src="/icons/claw-mgr/10.svg" />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Vega·数据分析专家</span>}
            desc="从海量数据中提取关键洞察，构建数据模型与可视化报告，为业务决策提供数据驱动支持"
          />
          <Card
            avatar={<AvatarCircle src="/icons/claw-mgr/13.svg" />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Orion·数据运维专家</span>}
            desc="从海量数据中提取关键洞察，构建数据模型与可视化报告，为业务决策提供数据驱动支持"
          />
        </div>

        {/* 数字分身 */}
        <SectionTitle title="数字分身" desc="定制你的专属AI分身，沉淀个人知识" />
        <div style={{ display: "flex", gap: 16, padding: "0 24px 8px", flexWrap: "wrap", alignItems: "stretch" }}>
          {!avatarDeleted && (
            <Card
              avatar={<AvatarCircle letter="运" bg="#E59858" />}
              name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>{avatarData.name}</span>}
              desc={avatarData.desc}
              badge={<AvatarMoreMenu onDetail={() => setShowAvatarDetail(true)} onDelete={() => setShowAvatarDelete(true)} />}
            />
          )}
          {/* 自定义数字分身 */}
          {customAvatars.map((a) => (
            <Card
              key={a.id}
              avatar={<AvatarCircle letter={a.name.charAt(0)} bg="#E59858" />}
              name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>{a.name}</span>}
              desc={a.desc || "自定义数字分身"}
              badge={<AvatarMoreMenu onDetail={() => setViewingAvatarId(a.id)} onDelete={() => setDeletingAvatarId(a.id)} />}
            />
          ))}
          <CreateCard label="创建数字分身" onClick={() => setShowCreateAvatar(true)} />
        </div>

        {/* 外部 Claw */}
        <SectionTitle title="外部 Claw" desc="连接外部AI平台的Agent" />
        <div style={{ display: "flex", gap: 16, padding: "0 24px 24px", flexWrap: "wrap", alignItems: "stretch" }}>
          <Card
            avatar={<AvatarCircle letter="L" bg="#3BAFB9" />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Lighthouse</span>}
            desc="腾讯云轻量应用服务器，一键连接云端实例"
            button={
              lh1State === "connecting" ? (
                <DialogBtn label="连接中..." icon={false} />
              ) : lh1State === "connected" ? (
                <DialogBtn label="已连接" icon={false} />
              ) : (
                <div onClick={() => { setLh1State("connecting"); setTimeout(() => { setLh1State("connected"); showToast("连接成功", "success"); }, 1500); }}>
                  <DialogBtn label="连接" icon={false} />
                </div>
              )
            }
            badge={lh1State === "connected" ? <ConnectedBadge /> : undefined}
          />
          <Card
            avatar={<AvatarCircle letter="L" bg="#7B68EE" />}
            name={<>
              <span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Lighthouse</span>
              {lh2State === "connected" && <ConnectedBadge />}
            </>}
            desc="腾讯云轻量应用服务器，一键连接云端实例"
            button={
              lh2State === "disconnecting" ? (
                <DialogBtn label="断开中..." icon={false} />
              ) : lh2State === "connected" ? (
                <div onClick={() => { setLh2State("disconnecting"); setTimeout(() => { setLh2State("disconnected"); showToast("已断开连接", "success"); }, 1500); }}>
                  <DialogBtn label="取消连接" icon={false} />
                </div>
              ) : (
                <div onClick={() => { setLh2State("disconnecting"); setTimeout(() => { setLh2State("connected"); showToast("连接成功", "success"); }, 1500); }}>
                  <DialogBtn label="连接" icon={false} />
                </div>
              )
            }
          />
          {/* 自定义外部 Claw */}
          {customClaws.map((c) => (
            <Card
              key={c.id}
              avatar={<AvatarCircle letter={c.abbr} bg={c.bg} />}
              name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>{c.name}</span>}
              desc={`${c.platformLabel} · ${c.apiUrl}`}
              button={<DialogBtn label="对话" />}
            />
          ))}
          <CreateCard label="创建外部 Claw" onClick={() => setShowCreateExternalClaw(true)} />
        </div>
      </div>

      {/* 创建团队弹窗 */}
      <CreateTeamDialog open={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />

      {/* 成员管理弹窗 */}
      <AnimatePresence>
        {managingTeam && (
          <MemberManageModal
            teamName={managingTeam.name}
            members={managingTeam.members}
            onClose={() => setManagingTeamId(null)}
            onSave={(members) => handleSaveMembers(managingTeam.id, members)}
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
          setCustomClaws((prev) => [...prev, { id: `claw-${Date.now()}`, name: data.name, abbr: data.platformAbbr, bg: data.platformBg, platformLabel: data.platformLabel, apiUrl: data.apiUrl }]);
          setShowCreateExternalClaw(false);
          showToast("外部 Claw 创建成功", "success");
        }}
      />

      {/* 创建数字分身弹窗 */}
      <CreateAvatarDialog
        open={showCreateAvatar}
        onClose={() => setShowCreateAvatar(false)}
        onCreate={(name, desc, tags) => {
          setCustomAvatars((prev) => [...prev, { id: `avatar-${Date.now()}`, name, desc, tags: tags ? tags.split(/[,，、]/).map((s) => s.trim()).filter(Boolean) : [], skills: [] }]);
          setShowCreateAvatar(false);
          showToast("数字分身创建成功", "success");
        }}
      />

      {/* 数字分身详情弹窗 */}
      <AnimatePresence>
        {showAvatarDetail && (
          <AvatarDetailModal
            data={avatarData}
            onClose={() => setShowAvatarDetail(false)}
            onSave={(d) => { setAvatarData(d); setShowAvatarDetail(false); showToast("分身信息已保存", "success"); }}
            onConfigSkill={onNavigateToSkillPlaza}
          />
        )}
      </AnimatePresence>

      {/* 数字分身删除确认 */}
      <AnimatePresence>
        {showAvatarDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} onClick={() => setShowAvatarDelete(false)}
            style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: EASE }} onClick={(e) => e.stopPropagation()}
              style={{ width: 420, background: C.bgWhite, borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: FONT, padding: "28px 28px 24px", position: "relative" }}
            >
              <div onClick={() => setShowAvatarDelete(false)} style={{ position: "absolute", top: 16, right: 16, width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 100ms" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingRight: 32 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill={C.error} /><path d="M10 6v5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" /><circle cx="10" cy="14" r="0.75" fill="#FFF" /></svg>
                <span style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>删除数字分身 &quot;{avatarData.name}&quot;</span>
              </div>
              <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: "22px", marginBottom: 24 }}>
                若删除该数字分身，相关的历史对话、个人知识沉淀等信息都将被删除，该操作不可逆。
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button onClick={() => setShowAvatarDelete(false)} style={{ height: 36, padding: "0 24px", borderRadius: 100, border: `1px solid ${C.border}`, background: C.bgWhite, fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textPrimary, cursor: "pointer", outline: "none" }}>取消</button>
                <button onClick={() => { setAvatarDeleted(true); setShowAvatarDelete(false); showToast("数字分身已删除", "success"); }} style={{ height: 36, padding: "0 24px", borderRadius: 100, border: "none", background: C.error, fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "#FFF", cursor: "pointer", outline: "none" }}>确认删除</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 自定义数字分身详情弹窗 */}
      <AnimatePresence>
        {viewingAvatar && (
          <AvatarDetailModal
            data={{ name: viewingAvatar.name, desc: viewingAvatar.desc, tags: viewingAvatar.tags, skills: viewingAvatar.skills }}
            onClose={() => setViewingAvatarId(null)}
            onSave={(d) => { setCustomAvatars((prev) => prev.map((a) => a.id === viewingAvatarId ? { ...a, ...d } : a)); setViewingAvatarId(null); showToast("分身信息已保存", "success"); }}
            onConfigSkill={onNavigateToSkillPlaza}
          />
        )}
      </AnimatePresence>

      {/* 自定义数字分身删除确认 */}
      <AnimatePresence>
        {deletingAvatar && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} onClick={() => setDeletingAvatarId(null)}
            style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: EASE }} onClick={(e) => e.stopPropagation()}
              style={{ width: 420, background: C.bgWhite, borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: FONT, padding: "28px 28px 24px", position: "relative" }}
            >
              <div onClick={() => setDeletingAvatarId(null)} style={{ position: "absolute", top: 16, right: 16, width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 100ms" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingRight: 32 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill={C.error} /><path d="M10 6v5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" /><circle cx="10" cy="14" r="0.75" fill="#FFF" /></svg>
                <span style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>删除数字分身 &quot;{deletingAvatar.name}&quot;</span>
              </div>
              <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: "22px", marginBottom: 24 }}>若删除该数字分身，相关的历史对话、个人知识沉淀等信息都将被删除，该操作不可逆。</div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button onClick={() => setDeletingAvatarId(null)} style={{ height: 36, padding: "0 24px", borderRadius: 100, border: `1px solid ${C.border}`, background: C.bgWhite, fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textPrimary, cursor: "pointer", outline: "none" }}>取消</button>
                <button onClick={() => { setCustomAvatars((prev) => prev.filter((a) => a.id !== deletingAvatarId)); setDeletingAvatarId(null); showToast("数字分身已删除", "success"); }} style={{ height: 36, padding: "0 24px", borderRadius: 100, border: "none", background: C.error, fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "#FFF", cursor: "pointer", outline: "none" }}>确认删除</button>
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
