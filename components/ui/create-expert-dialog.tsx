"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const C = {
  textPrimary: "rgba(0,0,0,0.9)",
  textSecondary: "rgba(0,0,0,0.7)",
  textTertiary: "rgba(0,0,0,0.5)",
  textPlaceholder: "rgba(0,0,0,0.3)",
  border: "#E6E9EF",
  borderActive: "#7E9EFF",
  bgCard: "#FFFFFF",
  bgInput: "#FAFBFC",
  bgOverlay: "rgba(0,0,0,0.3)",
  brandPurple: "#7E7EFF",
  brandOrange: "#FF7800",
  brandGreen: "#00B96B",
  btnPrimary: "#7E9EFF",
} as const;

type ExpertMode = "digital" | "external";

interface CreateExpertDialogProps {
  open: boolean;
  onClose: () => void;
}

// ── Input field ───────────────────────────────────────────────
function FormField({ label, required, placeholder, hint, value, onChange }: {
  label: string;
  required?: boolean;
  placeholder: string;
  hint?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{label}</span>
        {required && <span style={{ color: "#F64041", marginLeft: 4 }}>*</span>}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          height: 44,
          padding: "0 12px",
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          background: C.bgInput,
          fontFamily: FONT,
          fontSize: 14,
          color: C.textPrimary,
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = C.borderActive; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
      />
      {hint && (
        <span style={{ fontSize: 12, color: C.textTertiary }}>{hint}</span>
      )}
    </div>
  );
}

// ── Textarea field ────────────────────────────────────────────
function FormTextarea({ label, placeholder }: {
  label: string;
  placeholder: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{label}</span>
      <textarea
        placeholder={placeholder}
        rows={4}
        style={{
          padding: 12,
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          background: C.bgInput,
          fontFamily: FONT,
          fontSize: 14,
          color: C.textPrimary,
          outline: "none",
          resize: "vertical",
          width: "100%",
          boxSizing: "border-box",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = C.borderActive; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
      />
    </div>
  );
}

// ── Platform radio ────────────────────────────────────────────
function PlatformRadio({ options, selected, onSelect }: {
  options: { id: string; label: string; abbr: string; color: string }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {options.map((opt) => (
        <div
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          style={{
            flex: 1,
            height: 48,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 12px",
            borderRadius: 8,
            border: `1px solid ${selected === opt.id ? C.borderActive : C.border}`,
            background: selected === opt.id ? "rgba(126,158,255,0.06)" : C.bgCard,
            cursor: "pointer",
            transition: "all 150ms",
          }}
        >
          <div style={{
            width: 16, height: 16, borderRadius: 8,
            border: `2px solid ${selected === opt.id ? "#1664FF" : "#D6DBE3"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {selected === opt.id && (
              <div style={{ width: 8, height: 8, borderRadius: 4, background: "#1664FF" }} />
            )}
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: opt.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#FFF" }}>{opt.abbr}</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 400, color: C.textPrimary }}>{opt.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Mode card ─────────────────────────────────────────────────
function ModeCard({ title, desc, active, onClick }: {
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        padding: 16,
        borderRadius: 12,
        border: `1.5px solid ${active ? C.borderActive : C.border}`,
        background: active ? "rgba(126,158,255,0.04)" : C.bgCard,
        cursor: "pointer",
        transition: "all 150ms",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{title}</span>
      <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: "20px" }}>{desc}</span>
    </div>
  );
}

// ── Main dialog ───────────────────────────────────────────────
export default function CreateExpertDialog({ open, onClose }: CreateExpertDialogProps) {
  const [mode, setMode] = useState<ExpertMode>("digital");
  const [platform, setPlatform] = useState("lighthouse");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  // 判断必填项是否填完
  const isFormValid = mode === "digital"
    ? (formValues["digital-name"] || "").trim().length > 0
    : (formValues["external-name"] || "").trim().length > 0
      && (formValues["external-api"] || "").trim().length > 0
      && (formValues["external-key"] || "").trim().length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
              width: 640,
              maxHeight: "80vh",
              background: C.bgCard,
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              fontFamily: FONT,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px 24px 16px",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 20, fontWeight: 600, color: C.textPrimary }}>创建专家</span>
              <div
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4L12 12" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Scrollable body */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "0 24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 24,
              scrollbarWidth: "none",
            }}>
              {/* Mode selector */}
              <div style={{ display: "flex", gap: 12 }}>
                <ModeCard
                  title="创建数字分身"
                  desc="创建专属的 AI 助手，通过标签定义能力，快速定制你的数据分析专家"
                  active={mode === "digital"}
                  onClick={() => setMode("digital")}
                />
                <ModeCard
                  title="链接外部 Claw"
                  desc="接入第三方 AI 服务（如 Lighthouse、ClawPro），扩展更多能力"
                  active={mode === "external"}
                  onClick={() => setMode("external")}
                />
              </div>

              {/* Form fields based on mode */}
              {mode === "digital" ? (
                <>
                  <FormField label="分身名称" required placeholder="例如：我的数据助手" value={formValues["digital-name"]} onChange={(v) => updateField("digital-name", v)} />
                  <FormField label="对应标签" placeholder="输入标签，多个用逗号分隔" hint="如：数据分析、报表生成、SQL 优化" />
                </>
              ) : (
                <>
                  <FormField label="名称" required placeholder="例如：我的自定义 Claw" value={formValues["external-name"]} onChange={(v) => updateField("external-name", v)} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>来源平台</span>
                      <span style={{ color: "#F64041", marginLeft: 4 }}>*</span>
                    </div>
                    <PlatformRadio
                      options={[
                        { id: "lighthouse", label: "Lighthouse", abbr: "LH", color: "#FF7800" },
                        { id: "clawpro", label: "ClawPro", abbr: "CP", color: "#1664FF" },
                        { id: "chatgpt", label: "ChatGPT Plugin", abbr: "GP", color: "#00B96B" },
                      ]}
                      selected={platform}
                      onSelect={setPlatform}
                    />
                  </div>
                  <FormField label="API 接入地址" required placeholder="https://api.example.com/v1/claw" value={formValues["external-api"]} onChange={(v) => updateField("external-api", v)} />
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 5 }}>
                      <FormField label="IP 地址" placeholder="192.168.1.1" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <FormField label="端口" placeholder="8080" />
                    </div>
                  </div>
                  <FormField label="API Key / Token" required placeholder="输入 API Key 或 Token" value={formValues["external-key"]} onChange={(v) => updateField("external-key", v)} />
                  <FormField label="能力标签" placeholder="输入标签，多个用逗号分隔" hint="如：数据分析、代码生成、自然语言处理" />
                  <FormTextarea label="描述" placeholder="简要描述该 Claw 的用途和能力" />
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              padding: "16px 24px",
              borderTop: `1px solid ${C.border}`,
              flexShrink: 0,
            }}>
              <button
                onClick={onClose}
                style={{
                  height: 40,
                  padding: "0 24px",
                  borderRadius: 100,
                  border: `1px solid ${C.border}`,
                  background: C.bgCard,
                  fontFamily: FONT,
                  fontSize: 14,
                  fontWeight: 500,
                  color: C.textPrimary,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                取消
              </button>
              <button
                disabled={!isFormValid}
                style={{
                  height: 40,
                  padding: "0 24px",
                  borderRadius: 100,
                  border: "none",
                  background: isFormValid ? "#000000" : "rgba(0,0,0,0.2)",
                  fontFamily: FONT,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#FFFFFF",
                  cursor: isFormValid ? "pointer" : "not-allowed",
                  outline: "none",
                  transition: "background 150ms",
                }}
              >
                确认添加
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
