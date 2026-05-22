"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentRecommendField } from "./create-expert-dialog";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const C = {
  textPrimary: "rgba(0,0,0,0.9)",
  textTertiary: "rgba(0,0,0,0.5)",
  border: "#E6E9EF",
  bgCard: "#FFFFFF",
  bgOverlay: "rgba(0,0,0,0.3)",
  error: "#F64041",
  hoverBg: "#F2F4F8",
  brandCyan: "#0052D9",
  checkBlue: "#0052D9",
} as const;

const LABEL_W = 90;

// 名称校验：仅支持中文、英文、数字、下划线
const NAME_REG = /^[\u4e00-\u9fa5a-zA-Z0-9_·]+$/;

const ALL_MEMBERS = [
  { id: "dev", name: "大数据开发专家" },
  { id: "analyst", name: "大数据分析专家" },
  { id: "ops", name: "智能管家" },
  { id: "my-ops", name: "运营助手" },
  { id: "lh", name: "Lighthouse" },
];

// ── Checkbox ────────────────────────────────────────────────────
function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <div
      onClick={onChange}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        cursor: "pointer", borderRadius: 8, userSelect: "none",
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: 3, flexShrink: 0,
        border: `1.5px solid ${checked ? C.checkBlue : "#D6DBE3"}`,
        background: checked ? C.checkBlue : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 100ms",
      }}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 14, fontWeight: 400, color: C.textPrimary, whiteSpace: "nowrap" }}>{label}</span>
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
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateName = (v: string) => {
    if (v.length > 0 && !NAME_REG.test(v)) {
      setNameError("名称仅支持中文、英文、数字、下划线");
    } else {
      setNameError("");
    }
  };

  const isValid = name.trim().length > 0 && !nameError && selectedMembers.size > 0;

  const toggleMember = useCallback((id: string) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleCreate = () => {
    if (!isValid) return;
    setLoading(true);
    setProgress(0);
  };

  // loading 进度动画
  useEffect(() => {
    if (!loading) return;
    let frame: number;
    let start: number | null = null;
    const duration = 2000;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          if (onCreate) onCreate(name.trim(), desc.trim() || "自定义协作团队");
          resetAll();
          onClose();
        }, 300);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const resetAll = () => {
    setName(""); setDesc(""); setTags(""); setSelectedMembers(new Set()); setNameError(""); setLoading(false); setProgress(0);
  };

  const handleClose = () => {
    if (loading) return;
    resetAll();
    onClose();
  };

  const labelStyle: React.CSSProperties = { fontSize: 12, color: "rgba(0,0,0,0.7)", flexShrink: 0, width: LABEL_W, paddingTop: 7 };
  const inputStyle: React.CSSProperties = {
    flex: 1, height: 32, padding: "0 12px", borderRadius: 8,
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
            style={{ width: 640, background: C.bgCard, borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1), 0 8px 12px -8px rgba(0,0,0,0.05)", fontFamily: FONT, display: "flex", flexDirection: "column" }}
          >
            {loading ? (
              /* Loading 状态 */
              <div style={{ padding: "80px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                {/* 纸飞机 SVG */}
                <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
                  <path d="M60 20L90 50L60 40L30 50L60 20Z" fill="#D4D8E0" />
                  <path d="M60 20L60 40L90 50L60 20Z" fill="#B8BEC8" />
                  <path d="M60 40L60 60L90 50L60 40Z" fill="#C8CDD6" />
                  <ellipse cx="60" cy="78" rx="30" ry="6" fill="rgba(0,0,0,0.06)" />
                </svg>
                <span style={{ fontSize: 16, fontWeight: 400, color: C.textPrimary }}>
                  你的专家团正在集结，请稍等...
                </span>
                {/* 进度条 */}
                <div style={{ width: "60%", height: 12, borderRadius: 6, background: "#E6E9EF", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 6, background: C.textPrimary,
                    width: `${progress * 100}%`, transition: "width 50ms linear",
                  }} />
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: "24px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>创建团队</span>
                  <div onClick={handleClose} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 4 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
                </div>

                {/* Body */}
                <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* 团队名称 */}
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div style={labelStyle}><span>团队名称 </span><span style={{ color: C.error }}>*</span></div>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        placeholder="例如：大数据"
                        value={name}
                        onChange={(e) => { setName(e.target.value); validateName(e.target.value); }}
                        style={{ ...inputStyle, borderColor: nameError ? C.error : C.border, width: "100%" }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = nameError ? C.error : C.brandCyan; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = nameError ? C.error : C.border; }}
                      />
                      {nameError && (
                        <div style={{ fontSize: 12, color: C.error, marginTop: 4, lineHeight: "18px" }}>{nameError}</div>
                      )}
                    </div>
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

                  {/* 成员 — checkbox 列表 */}
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div style={labelStyle}><span>成员 </span><span style={{ color: C.error }}>*</span></div>
                    <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "12px 12px", paddingTop: 2 }}>
                      {ALL_MEMBERS.map((m) => (
                        <div key={m.id} style={{ width: "calc(33.333% - 8px)", minWidth: 120 }}>
                          <Checkbox checked={selectedMembers.has(m.id)} onChange={() => toggleMember(m.id)} label={m.name} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Agent 推荐 */}
                  <AgentRecommendField />
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, padding: "16px 24px", flexShrink: 0, background: C.bgCard, borderRadius: "0 0 16px 16px" }}>
                  <button onClick={handleClose} style={{ width: 92, height: 40, borderRadius: 32, border: "1px solid #D6DBE3", background: C.bgCard, fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.textPrimary, cursor: "pointer", outline: "none" }}>取消</button>
                  <button disabled={!isValid} onClick={handleCreate} style={{ width: 92, height: 40, borderRadius: 32, border: "none", background: isValid ? C.textPrimary : "rgba(0,0,0,0.2)", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.9)", cursor: isValid ? "pointer" : "not-allowed", outline: "none", transition: "background 150ms" }}>创建</button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
