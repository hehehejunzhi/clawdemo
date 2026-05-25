"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const C = {
  bgWhite: "#FFFFFF",
  border: "#E6E9EF",
  textPrimary: "rgba(0,0,0,0.9)",
  textSecondary: "rgba(0,0,0,0.7)",
  textTertiary: "rgba(0,0,0,0.5)",
  hoverBg: "#F2F4F8",
  brandCyan: "#0052D9",
  error: "#F64041",
} as const;

// 名称校验：仅支持中文、英文、数字、下划线
const NAME_REG = /^[\u4e00-\u9fa5a-zA-Z0-9_·]+$/;

interface CreateExpertDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (name: string, desc: string, tags: string) => void;
  onCreateExternal?: (data: {
    name: string;
    platform: string;
    apiUrl: string;
    ip: string;
    port: string;
    apiKey: string;
    tags: string;
    desc: string;
  }) => void;
}

export default function CreateExpertDialog({ open, onClose, onCreate, onCreateExternal }: CreateExpertDialogProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const resetAll = () => {
    setName(""); setDesc(""); setTags(""); setNameError(""); setLoading(false); setProgress(0);
  };

  // 名称校验
  const validateName = (v: string) => {
    if (v.length > 0 && !NAME_REG.test(v)) {
      setNameError("名称仅支持中文、英文、数字、下划线");
    } else {
      setNameError("");
    }
  };

  const isValid = name.trim().length > 0 && !nameError;

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
    const duration = 2000; // 2s
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        // 完成
        setTimeout(() => {
          onCreate?.(name.trim(), desc.trim(), tags.trim());
          resetAll();
          onClose();
        }, 300);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleClose = () => { if (!loading) { resetAll(); onClose(); } };

  const labelStyle: React.CSSProperties = { fontSize: 12, color: "rgba(0,0,0,0.5)", flexShrink: 0, width: 90, paddingTop: 7 };
  const fieldInputStyle: React.CSSProperties = {
    flex: 1, height: 32, padding: "0 12px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.bgWhite,
    fontFamily: FONT, fontSize: 12, color: C.textPrimary, outline: "none", boxSizing: "border-box",
  };
  const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = nameError && e.currentTarget === document.querySelector('[data-name-input]') ? C.error : C.brandCyan; };
  const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = nameError && e.currentTarget === document.querySelector('[data-name-input]') ? C.error : C.border; };

  // 忽略未使用的 onCreateExternal（保持接口兼容）
  void onCreateExternal;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.4)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ width: 640, maxHeight: "85vh", background: C.bgWhite, borderRadius: 16, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1), 0 8px 12px -8px rgba(0,0,0,0.05)", fontFamily: FONT, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {loading ? (
              /* Loading 状态 */
              <div style={{ padding: "60px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                <img src="/icons/paper-plane.png" alt="" style={{ width: 180, height: 180, objectFit: "contain" }} />
                <span style={{ fontSize: 16, fontWeight: 400, color: C.textPrimary }}>
                  你自定义 Agent 正在创建，请稍等...
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
                  <span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>创建自定义 Agent</span>
                  <div onClick={handleClose} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 4 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16, scrollbarWidth: "none" }}>
                  {/* 名称 */}
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div style={labelStyle}><span>名称 </span><span style={{ color: C.error }}>*</span></div>
                    <div style={{ flex: 1 }}>
                      <input
                        data-name-input=""
                        value={name}
                        onChange={(e) => { setName(e.target.value); validateName(e.target.value); }}
                        placeholder="例如：大数据"
                        style={{ ...fieldInputStyle, borderColor: nameError ? C.error : C.border, width: "100%" }}
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
                    <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="简要描述数字分身目标和用途" rows={2}
                      style={{ ...fieldInputStyle, height: "auto", padding: "5px 12px", resize: "none" }}
                      onFocus={focusOn} onBlur={focusOff} />
                  </div>
                  {/* Agent 推荐 */}
                  <AgentRecommendField />
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

// Agent 推荐下拉字段
function AgentRecommendField() {
  const [value, setValue] = useState("每次询问");
  const [dropOpen, setDropOpen] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const options = ["每次询问", "不再推荐"];

  return (
    <div style={{ display: "flex", alignItems: "center", minHeight: 32 }}>
      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", flexShrink: 0, width: 90, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>Agent 推荐</span>
        <div
          style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ cursor: "help", display: "block" }}>
            <circle cx="7" cy="7" r="6" stroke="rgba(0,0,0,0.3)" strokeWidth="1" fill="none" />
            <path d="M7 6V10M7 4.5V4" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {tooltipVisible && (
            <div style={{
              position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
              padding: "6px 10px", borderRadius: 6, background: "rgba(0,0,0,0.85)", color: "#FFF",
              fontSize: 12, lineHeight: "18px", whiteSpace: "nowrap", zIndex: 10,
              pointerEvents: "none",
            }}>
              在对话中向你推荐能力匹配的Agent
              <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid rgba(0,0,0,0.85)" }} />
            </div>
          )}
        </div>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <div
          onClick={() => setDropOpen(!dropOpen)}
          style={{
            height: 32, padding: "0 12px", borderRadius: 8,
            border: `1px solid ${dropOpen ? "#0052D9" : "#E6E9EF"}`,
            background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: "pointer", fontSize: 12, color: "rgba(0,0,0,0.9)",
            fontFamily: "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          <span style={{ color: "rgba(0,0,0,0.9)", fontSize: 12 }}>{value}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: dropOpen ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>
            <path d="M3 4.5L6 7.5L9 4.5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {dropOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            background: "#FFFFFF", borderRadius: 8, border: "1px solid #E6E9EF",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)", zIndex: 10, overflow: "hidden",
          }}>
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => { setValue(opt); setDropOpen(false); }}
                style={{
                  padding: "8px 12px", fontSize: 12, color: "rgba(0,0,0,0.9)", cursor: "pointer",
                  background: value === opt ? "#F2F4F8" : "transparent",
                }}
                onMouseEnter={(e) => { if (value !== opt) (e.currentTarget as HTMLDivElement).style.background = "#F8F9FB"; }}
                onMouseLeave={(e) => { if (value !== opt) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { AgentRecommendField };
