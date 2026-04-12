"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const C = {
  textPrimary: "rgba(0,0,0,0.9)",
  textSecondary: "rgba(0,0,0,0.7)",
  textTertiary: "rgba(0,0,0,0.5)",
  border: "#E6E9EF",
  borderActive: "#7E9EFF",
  bgCard: "#FFFFFF",
  bgInput: "#FAFBFC",
  bgOverlay: "rgba(0,0,0,0.3)",
} as const;

interface CreateTeamDialogProps {
  open: boolean;
  onClose: () => void;
}

// ── Checkbox item ─────────────────────────────────────────────
function CheckItem({ label, abbr, abbrBg, checked, onChange }: {
  label: string;
  abbr: string;
  abbrBg: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div
      onClick={onChange}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 12px", borderRadius: 8,
        border: `1px solid ${checked ? C.borderActive : C.border}`,
        background: checked ? "rgba(126,158,255,0.04)" : C.bgCard,
        cursor: "pointer", transition: "all 100ms",
        minWidth: 140,
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: 3,
        border: `1.5px solid ${checked ? "#1664FF" : "#D6DBE3"}`,
        background: checked ? "#1664FF" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 100ms",
      }}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: 4,
        background: abbrBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#FFF" }}>{abbr}</span>
      </div>
      <span style={{ fontSize: 14, fontWeight: 400, color: C.textPrimary }}>{label}</span>
    </div>
  );
}

// ── Radio card ────────────────────────────────────────────────
function RadioCard({ label, desc, active, onClick }: {
  label: string; desc: string; active: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1, padding: "12px 14px", borderRadius: 8,
        border: `1.5px solid ${active ? C.borderActive : C.border}`,
        background: active ? "rgba(126,158,255,0.04)" : C.bgCard,
        cursor: "pointer", transition: "all 100ms",
        display: "flex", alignItems: "flex-start", gap: 8,
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: 8, marginTop: 2,
        border: `2px solid ${active ? "#1664FF" : "#D6DBE3"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {active && <div style={{ width: 8, height: 8, borderRadius: 4, background: "#1664FF" }} />}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>{label}</div>
        <div style={{ fontSize: 12, color: C.textTertiary, marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}

// ── Main dialog ───────────────────────────────────────────────
export default function CreateTeamDialog({ open, onClose }: CreateTeamDialogProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [members, setMembers] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState("free");

  const toggleMember = useCallback((id: string) => {
    setMembers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const isValid = name.trim().length > 0 && members.size > 0;

  const inputStyle: React.CSSProperties = {
    height: 44, padding: "0 12px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.bgInput,
    fontFamily: FONT, fontSize: 14, color: C.textPrimary,
    outline: "none", width: "100%", boxSizing: "border-box",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: C.bgOverlay,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{
              width: 560, maxHeight: "85vh",
              background: C.bgCard, borderRadius: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              fontFamily: FONT, display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 24px 16px", flexShrink: 0 }}>
              <span style={{ fontSize: 20, fontWeight: 600, color: C.textPrimary }}>创建 ClawTeam</span>
              <div onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4L12 12" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 20, scrollbarWidth: "none" }}>
              {/* 群聊名称 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div><span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>群聊名称</span><span style={{ color: "#F64041", marginLeft: 4 }}>*</span></div>
                <input
                  type="text" placeholder="如：数据治理协作群"
                  value={name} onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.borderActive; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
                />
              </div>

              {/* 群聊描述 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>群聊描述</span>
                <input
                  type="text" placeholder="简要描述群聊目标和用途..."
                  value={desc} onChange={(e) => setDesc(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.borderActive; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
                />
              </div>

              {/* 选择群成员 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>选择群成员</span>
                  <span style={{ color: "#F64041", marginLeft: 4 }}>*</span>
                </div>
                <span style={{ fontSize: 12, color: C.textTertiary }}>从以下 Claw 中勾选成员加入群聊，已选 {members.size} 位</span>

                {/* 大数据专家 */}
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>大数据专家</span>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <CheckItem label="分析专家" abbr="析" abbrBg="#E8524A" checked={members.has("analyst")} onChange={() => toggleMember("analyst")} />
                    <CheckItem label="运维专家" abbr="运" abbrBg="#FF7800" checked={members.has("ops")} onChange={() => toggleMember("ops")} />
                    <CheckItem label="开发专家" abbr="开" abbrBg="#3BAFB9" checked={members.has("dev")} onChange={() => toggleMember("dev")} />
                  </div>
                </div>

                {/* 数字分身 */}
                <div style={{ marginTop: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>数字分身</span>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <CheckItem label="我的运营助手" abbr="营" abbrBg="#E8524A" checked={members.has("my-ops")} onChange={() => toggleMember("my-ops")} />
                  </div>
                </div>

                {/* 外部 Claw */}
                <div style={{ marginTop: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>外部 Claw</span>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <CheckItem label="Lighthouse" abbr="LH" abbrBg="#FF7800" checked={members.has("lh")} onChange={() => toggleMember("lh")} />
                    <CheckItem label="ClawPro" abbr="CP" abbrBg="#1664FF" checked={members.has("cp")} onChange={() => toggleMember("cp")} />
                    <CheckItem label="ChatGPT Plugin" abbr="GP" abbrBg="#00B96B" checked={members.has("gp")} onChange={() => toggleMember("gp")} />
                  </div>
                </div>
              </div>

              {/* 协作模式 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>协作模式</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <RadioCard label="自由讨论" desc="所有Claw自由发言讨论" active={mode === "free"} onClick={() => setMode("free")} />
                  <RadioCard label="调度编排" desc="由调度Claw统一协调分工" active={mode === "dispatch"} onClick={() => setMode("dispatch")} />
                  <RadioCard label="轮询模式" desc="Claw按顺序依次响应" active={mode === "round"} onClick={() => setMode("round")} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 24px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
              <button onClick={onClose} style={{
                height: 40, padding: "0 24px", borderRadius: 100,
                border: `1px solid ${C.border}`, background: C.bgCard,
                fontFamily: FONT, fontSize: 14, fontWeight: 500,
                color: C.textPrimary, cursor: "pointer", outline: "none",
              }}>取消</button>
              <button disabled={!isValid} style={{
                height: 40, padding: "0 24px", borderRadius: 100,
                border: "none",
                background: isValid ? "#000000" : "rgba(0,0,0,0.2)",
                fontFamily: FONT, fontSize: 14, fontWeight: 500,
                color: "#FFFFFF",
                cursor: isValid ? "pointer" : "not-allowed",
                outline: "none", transition: "background 150ms",
              }}>创建群聊</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
