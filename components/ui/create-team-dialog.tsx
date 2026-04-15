"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const C = {
  textPrimary: "rgba(0,0,0,0.9)",
  textTertiary: "rgba(0,0,0,0.5)",
  border: "#E6E9EF",
  bgCard: "#FFFFFF",
  bgGrey: "#F7F8FB",
  bgOverlay: "rgba(0,0,0,0.3)",
  error: "#F64041",
  link: "#265BED",
  hoverBg: "#F2F4F8",
  brandCyan: "#00C8D6",
} as const;

const LABEL_W = 91;

const ALL_MEMBERS = [
  { id: "analyst", name: "大数据分析专家" },
  { id: "ops", name: "大数据运维专家" },
  { id: "dev", name: "大数据开发专家" },
  { id: "my-ops", name: "我的运营助手" },
  { id: "lh", name: "Lighthouse" },
  { id: "cp", name: "ClawPro" },
  { id: "gp", name: "ChatGPT Plugin" },
];

type Role = "执行者" | "观察者" | "调度者";
interface AddedMember { id: string; name: string; role: Role }

// ── 角色下拉 ──────────────────────────────────────────────────
function RoleDropdown({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  const [open, setOpen] = useState(false);
  const roles: Role[] = ["执行者", "观察者", "调度者"];
  return (
    <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
      <div onClick={() => setOpen((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}>
        <span style={{ fontSize: 12, color: "#1A1A1A" }}>{value}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 299 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: 24, left: -8, zIndex: 300,
            minWidth: 80, background: C.bgCard, borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)", border: `1px solid ${C.border}`, padding: "4px 0",
          }}>
            {roles.map((r) => (
              <div key={r} onClick={() => { onChange(r); setOpen(false); }}
                style={{ padding: "6px 12px", cursor: "pointer", fontSize: 12, color: C.textPrimary, background: r === value ? "rgba(22,100,255,0.06)" : "transparent", fontWeight: r === value ? 500 : 400, fontFamily: FONT, transition: "background 100ms" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = r === value ? "rgba(22,100,255,0.06)" : "transparent"; }}
              >{r}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── 多选成员选择器（胶囊回显） ────────────────────────────────
function MultiMemberSelector({ added, selected, onToggle }: {
  added: Set<string>;
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const available = ALL_MEMBERS.filter((m) => !added.has(m.id));
  const selectedItems = ALL_MEMBERS.filter((m) => selected.has(m.id));

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div style={{ flex: 1, position: "relative" }} ref={containerRef}>
      {/* 输入框区域 */}
      <div
        onClick={() => setOpen(true)}
        style={{
          minHeight: 32, padding: "4px 12px", borderRadius: 3,
          border: `1px solid ${open ? C.brandCyan : C.border}`, background: C.bgCard,
          fontFamily: FONT, fontSize: 12, color: "#89898A",
          display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4,
          cursor: "pointer", boxSizing: "border-box",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="7" cy="5" r="3" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" />
          <path d="M2 12c0-2.2 2.2-4 5-4s5 1.8 5 4" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        {selectedItems.length === 0 ? (
          <span>选择加入团队成员</span>
        ) : (
          selectedItems.map((m) => (
            <span key={m.id} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "1px 8px", borderRadius: 3, background: "#E8EBF0",
              fontSize: 12, color: C.textPrimary, whiteSpace: "nowrap",
            }}>
              {m.name}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ cursor: "pointer", flexShrink: 0 }}
                onClick={(e) => { e.stopPropagation(); onToggle(m.id); }}>
                <path d="M2 2l6 6M8 2l-6 6" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </span>
          ))
        )}
      </div>

      {/* 下拉列表 - 使用 fixed 定位避免被 overflow 裁剪 */}
      {open && (
        <DropdownPortal containerRef={containerRef} dropdownRef={dropdownRef}>
          {available.length === 0 ? (
            <div style={{ padding: "8px 12px", fontSize: 12, color: C.textTertiary }}>所有成员已添加</div>
          ) : available.map((m) => {
            const checked = selected.has(m.id);
            return (
              <div key={m.id} onClick={() => onToggle(m.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "5px 8px",
                  borderRadius: 8, cursor: "pointer", fontFamily: FONT, fontSize: 14,
                  color: C.textPrimary, transition: "background 100ms",
                  background: checked ? "rgba(22,100,255,0.04)" : "transparent",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = checked ? "rgba(22,100,255,0.04)" : "transparent"; }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: 3,
                  border: `1.5px solid ${checked ? "#1664FF" : "#D6DBE3"}`,
                  background: checked ? "#1664FF" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  transition: "all 100ms",
                }}>
                  {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                {m.name}
              </div>
            );
          })}
        </DropdownPortal>
      )}
    </div>
  );
}

// ── Dropdown portal：使用 fixed 定位，不受父级 overflow 影响 ──
function DropdownPortal({ containerRef, dropdownRef, children }: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, [containerRef]);

  return (
    <div ref={dropdownRef} style={{
      position: "fixed", top: pos.top, left: pos.left, width: pos.width,
      zIndex: 9999, background: C.bgCard, borderRadius: 16,
      boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1), 0 8px 12px -8px rgba(0,0,0,0.05)",
      padding: 8, maxHeight: 260, overflowY: "auto", scrollbarWidth: "none",
    }}>
      {children}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
interface CreateTeamDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (name: string, desc: string) => void;
}

export default function CreateTeamDialog({ open, onClose, onCreate }: CreateTeamDialogProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [pendingSelection, setPendingSelection] = useState<Set<string>>(new Set());
  const [addedMembers, setAddedMembers] = useState<AddedMember[]>([]);

  const addedIds = new Set(addedMembers.map((m) => m.id));
  const isValid = name.trim().length > 0 && addedMembers.length > 0;

  const togglePending = useCallback((id: string) => {
    setPendingSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleAddToTeam = useCallback(() => {
    if (pendingSelection.size === 0) return;
    const newMembers = ALL_MEMBERS
      .filter((m) => pendingSelection.has(m.id) && !addedIds.has(m.id))
      .map((m): AddedMember => ({ id: m.id, name: m.name, role: "执行者" }));
    setAddedMembers((prev) => [...prev, ...newMembers]);
    setPendingSelection(new Set());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSelection, addedIds]);

  const handleRemove = useCallback((id: string) => {
    setAddedMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleRoleChange = useCallback((id: string, role: Role) => {
    setAddedMembers((prev) => prev.map((m) => m.id === id ? { ...m, role } : m));
  }, []);

  const handleCreate = () => {
    if (isValid && onCreate) {
      onCreate(name.trim(), desc.trim() || "自定义协作团队");
      setName(""); setDesc(""); setTags(""); setAddedMembers([]); setPendingSelection(new Set());
    }
  };

  const handleClose = () => {
    setName(""); setDesc(""); setTags(""); setAddedMembers([]); setPendingSelection(new Set());
    onClose();
  };

  const labelStyle: React.CSSProperties = { fontSize: 12, color: C.textTertiary, flexShrink: 0, width: LABEL_W, paddingTop: 7 };
  const inputStyle: React.CSSProperties = {
    flex: 1, height: 32, padding: "0 12px", borderRadius: 3,
    border: `1px solid ${C.border}`, background: C.bgCard,
    fontFamily: FONT, fontSize: 12, color: C.textPrimary, outline: "none", boxSizing: "border-box",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", background: C.bgOverlay }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ width: 640, maxHeight: "85vh", background: C.bgCard, borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1), 0 8px 12px -8px rgba(0,0,0,0.05)", fontFamily: FONT, display: "flex", flexDirection: "column", overflow: "visible" }}
          >
            {/* Header */}
            <div style={{ padding: "24px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>创建团队</span>
              <div onClick={handleClose} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 4 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
            </div>

            {/* Body - overflow visible to allow dropdown to escape */}
            <div style={{ flex: 1, overflowY: "auto", overflowX: "visible", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16, scrollbarWidth: "none" }}>
              {/* 团队名称 */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={labelStyle}><span>团队名称 </span><span style={{ color: C.error }}>*</span></div>
                <input type="text" placeholder="例如：大数据" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
              </div>

              {/* 描述 */}
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={labelStyle}>描述</div>
                <textarea placeholder="简要描述数字分身目标和用途" value={desc} onChange={(e) => setDesc(e.target.value)} rows={2}
                  style={{ ...inputStyle, height: "auto", padding: "5px 12px", resize: "none" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
              </div>

              {/* 标签 */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={labelStyle}>标签</div>
                <input type="text" placeholder="输入标签，多个用逗号分隔，如：数据分析，报表生成，SQL 优化" value={tags} onChange={(e) => setTags(e.target.value)} style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }} onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
              </div>

              {/* 成员 */}
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={labelStyle}><span>成员 </span><span style={{ color: C.error }}>*</span></div>
                <div style={{ flex: 1, background: C.bgGrey, borderRadius: 3, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* 多选下拉 + 添加按钮 */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <MultiMemberSelector added={addedIds} selected={pendingSelection} onToggle={togglePending} />
                    <span
                      onClick={handleAddToTeam}
                      style={{
                        fontSize: 12, color: pendingSelection.size > 0 ? C.link : "rgba(0,0,0,0.3)",
                        cursor: pendingSelection.size > 0 ? "pointer" : "default",
                        whiteSpace: "nowrap", flexShrink: 0, paddingTop: 7,
                        fontWeight: 400, transition: "color 100ms",
                      }}
                    >添加到团队</span>
                  </div>

                  {/* 已添加成员 */}
                  {addedMembers.length > 0 && (
                    <>
                      <span style={{ fontSize: 12, color: C.textTertiary }}>已添加成员：</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {addedMembers.map((m) => (
                          <div key={m.id} style={{ display: "flex", alignItems: "center", height: 38, padding: "0 16px", borderRadius: 10 }}>
                            <span style={{ fontSize: 14, color: "#0A0A0A", minWidth: 120 }}>{m.name}</span>
                            <div style={{ flex: 1 }} />
                            <RoleDropdown value={m.role} onChange={(r) => handleRoleChange(m.id, r)} />
                            <div style={{ flex: 1 }} />
                            <span onClick={() => handleRemove(m.id)}
                              style={{ fontSize: 12, color: C.link, cursor: "pointer", flexShrink: 0 }}
                            >移出团队</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, padding: "16px 24px", borderTop: `1px solid ${C.border}`, flexShrink: 0, background: C.bgCard, borderRadius: "0 0 16px 16px" }}>
              <button onClick={handleClose} style={{ width: 92, height: 40, borderRadius: 32, border: `1px solid #D6DBE3`, background: C.bgCard, fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.textPrimary, cursor: "pointer", outline: "none" }}>取消</button>
              <button disabled={!isValid} onClick={handleCreate} style={{ width: 92, height: 40, borderRadius: 32, border: "none", background: isValid ? C.textPrimary : "rgba(0,0,0,0.2)", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.9)", cursor: isValid ? "pointer" : "not-allowed", outline: "none", transition: "background 150ms" }}>创建</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
