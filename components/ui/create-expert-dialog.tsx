"use client";

import React, { useState } from "react";
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

type ExpertMode = "digital" | "external";

interface CreateExpertDialogProps {
  open: boolean;
  onClose: () => void;
  /** 创建自定义 Agent 的回调 */
  onCreate?: (name: string, desc: string, tags: string) => void;
  /** 创建外部 Agent 的回调（可选） */
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

const PLATFORMS = [
  { id: "lighthouse", label: "Lighthouse", abbr: "LH", bg: "#E59858" },
  { id: "clawpro", label: "ClawPro", abbr: "CP", bg: "#1664FF" },
  { id: "chatgpt", label: "ChatGPT Plugin", abbr: "GP", bg: "#00B96B" },
];

/**
 * 首页输入框中的「创建 Agent」弹窗
 * - 对齐 Agent 广场的弹窗视觉规范（640 宽 / 16px 标题 / 12px label/input / 32 高输入 / 圆 32 按钮）
 * - 第一栏双模式选择：创建自定义 Agent / 连接外部 Agent
 */
export default function CreateExpertDialog({ open, onClose, onCreate, onCreateExternal }: CreateExpertDialogProps) {
  const [mode, setMode] = useState<ExpertMode>("digital");
  // digital 字段
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  // external 字段
  const [extName, setExtName] = useState("");
  const [platform, setPlatform] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [extTags, setExtTags] = useState("");
  const [extDesc, setExtDesc] = useState("");

  const resetAll = () => {
    setMode("digital");
    setName(""); setDesc(""); setTags("");
    setExtName(""); setPlatform(""); setApiUrl(""); setIp(""); setPort(""); setApiKey(""); setExtTags(""); setExtDesc("");
  };

  const isValid = mode === "digital"
    ? name.trim().length > 0
    : extName.trim().length > 0 && platform.length > 0 && apiUrl.trim().length > 0 && apiKey.trim().length > 0;

  const handleCreate = () => {
    if (!isValid) return;
    if (mode === "digital") {
      onCreate?.(name.trim(), desc.trim(), tags.trim());
    } else {
      onCreateExternal?.({
        name: extName.trim(),
        platform,
        apiUrl: apiUrl.trim(),
        ip: ip.trim(),
        port: port.trim(),
        apiKey: apiKey.trim(),
        tags: extTags.trim(),
        desc: extDesc.trim(),
      });
    }
    resetAll();
    onClose();
  };
  const handleClose = () => { resetAll(); onClose(); };

  // 通用样式（与 Agent 广场 CreateAvatarDialog 对齐）
  const labelStyle: React.CSSProperties = { fontSize: 12, color: "rgba(0,0,0,0.7)", flexShrink: 0, width: 72, paddingTop: 7 };
  const fieldInputStyle: React.CSSProperties = {
    flex: 1, height: 32, padding: "0 12px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.bgWhite,
    fontFamily: FONT, fontSize: 12, color: C.textPrimary, outline: "none", boxSizing: "border-box",
  };
  const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = C.brandCyan; };
  const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = C.border; };

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
              <span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>创建 Agent</span>
              <div onClick={handleClose} style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 4 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              ><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16, scrollbarWidth: "none" }}>
              {/* Mode 选择 */}
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={labelStyle}>类型</div>
                <div style={{ flex: 1, display: "flex", gap: 12 }}>
                  <ModeCard
                    active={mode === "digital"}
                    title="创建自定义 Agent"
                    desc="定义专属的 AI 数字分身，沉淀个人知识"
                    onClick={() => setMode("digital")}
                  />
                  <ModeCard
                    active={mode === "external"}
                    title="连接外部 Agent"
                    desc="接入外部平台部署的 Agent（Lighthouse / ClawPro 等）"
                    onClick={() => setMode("external")}
                  />
                </div>
              </div>

              {mode === "digital" ? (
                <>
                  {/* 名称 */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={labelStyle}><span>名称 </span><span style={{ color: C.error }}>*</span></div>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：我的监控助手" style={fieldInputStyle} onFocus={focusOn} onBlur={focusOff} />
                  </div>
                  {/* 描述 */}
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div style={labelStyle}>描述</div>
                    <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="简要描述分身目标和用途" rows={2}
                      style={{ ...fieldInputStyle, height: "auto", padding: "5px 12px", resize: "none" }}
                      onFocus={focusOn} onBlur={focusOff} />
                  </div>
                  {/* 标签 */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={labelStyle}>标签</div>
                    <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="输入标签，多个用逗号分隔，如：数据分析，报表生成，SQL 优化" style={fieldInputStyle} onFocus={focusOn} onBlur={focusOff} />
                  </div>
                </>
              ) : (
                <>
                  {/* 名称 */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={labelStyle}><span>名称 </span><span style={{ color: C.error }}>*</span></div>
                    <input value={extName} onChange={(e) => setExtName(e.target.value)} placeholder="例如：我的自定义 Agent" style={fieldInputStyle} onFocus={focusOn} onBlur={focusOff} />
                  </div>
                  {/* 来源平台 */}
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div style={labelStyle}><span>来源平台 </span><span style={{ color: C.error }}>*</span></div>
                    <div style={{ flex: 1, display: "flex", gap: 12 }}>
                      {PLATFORMS.map((p) => {
                        const selected = platform === p.id;
                        return (
                          <div key={p.id} onClick={() => setPlatform(p.id)}
                            style={{
                              flex: 1, display: "flex", alignItems: "center", gap: 8,
                              padding: "6px 12px", borderRadius: 8, cursor: "pointer", height: 32, boxSizing: "border-box",
                              border: `1px solid ${selected ? "#7E9EFF" : C.border}`,
                              background: selected ? "rgba(126,158,255,0.04)" : C.bgWhite,
                              transition: "all 100ms",
                            }}
                          >
                            <div style={{
                              width: 14, height: 14, borderRadius: 7,
                              border: `1.5px solid ${selected ? C.brandCyan : "#D6DBE3"}`,
                              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                              {selected && <div style={{ width: 7, height: 7, borderRadius: 4, background: C.brandCyan }} />}
                            </div>
                            <span style={{ fontSize: 12, color: C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* API 地址 */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={labelStyle}><span>API 地址 </span><span style={{ color: C.error }}>*</span></div>
                    <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://api.example.com/v1/claw" style={fieldInputStyle} onFocus={focusOn} onBlur={focusOff} />
                  </div>
                  {/* IP 地址 */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={labelStyle}>IP 地址</div>
                    <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="192.168.1.1" style={fieldInputStyle} onFocus={focusOn} onBlur={focusOff} />
                  </div>
                  {/* 端口 */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={labelStyle}>端口</div>
                    <input value={port} onChange={(e) => setPort(e.target.value)} placeholder="8080" style={{ ...fieldInputStyle, flex: "none", width: 120 }} onFocus={focusOn} onBlur={focusOff} />
                  </div>
                  {/* API Key */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={labelStyle}><span>API Key </span><span style={{ color: C.error }}>*</span></div>
                    <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="输入 API Key 或 Token" style={fieldInputStyle} onFocus={focusOn} onBlur={focusOff} />
                  </div>
                  {/* 标签 */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={labelStyle}>标签</div>
                    <input value={extTags} onChange={(e) => setExtTags(e.target.value)} placeholder="输入标签，多个用逗号分隔" style={fieldInputStyle} onFocus={focusOn} onBlur={focusOff} />
                  </div>
                  {/* 描述 */}
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div style={labelStyle}>描述</div>
                    <textarea value={extDesc} onChange={(e) => setExtDesc(e.target.value)} placeholder="简要描述该 Agent 的用途和能力" rows={2}
                      style={{ ...fieldInputStyle, height: "auto", padding: "5px 12px", resize: "none" }}
                      onFocus={focusOn} onBlur={focusOff} />
                  </div>
                </>
              )}
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

// 双模式卡
function ModeCard({ active, title, desc, onClick }: { active: boolean; title: string; desc: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        padding: 12,
        borderRadius: 8,
        border: `1px solid ${active ? "#7E9EFF" : C.border}`,
        background: active ? "rgba(126,158,255,0.04)" : C.bgWhite,
        cursor: "pointer",
        transition: "all 150ms",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{title}</span>
      <span style={{ fontSize: 12, color: C.textSecondary, lineHeight: "18px" }}>{desc}</span>
    </div>
  );
}
