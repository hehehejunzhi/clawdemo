"use client";

import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Loader2 } from "lucide-react";
import type { MotionTargetDef } from "@/components/ui/motion-panel";

// ── 实心纸飞机 SVG（对齐 Figma btn-send）────────────────────
function SendIcon({ size = 16, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.2 1.8C14.5 1.5 14.9 1.8 14.8 2.2L12.2 13.6C12.1 14 11.7 14.1 11.4 13.9L8.2 11.6L6.6 13.3C6.3 13.6 5.8 13.4 5.8 13V10.4L12.4 3.4C12.5 3.3 12.3 3.1 12.2 3.2L4.2 9.2L1.6 7.8C1.2 7.6 1.2 7.1 1.6 6.9L14.2 1.8Z"
        fill={color}
      />
    </svg>
  );
}

// ── Design tokens ──────────────────────────────────────────────
const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const SF_FONT = "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ── Types ──────────────────────────────────────────────────────
interface AttachedFile {
  id: string;
  file: File;
  type: string;
  preview: string | null;
  uploadStatus: string;
}

export interface SkillChip {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface AgentChip {
  name: string;
  title: string;
  avatar: string;
}

const DEFAULT_CHAT_INPUT_MOTION_CONFIG = {
  borderRotateDuration: 5,
  glowBreatheDuration: 5,
  glowOpacity: 0.8,
  glowInsetRest: 6,
  glowInsetPeak: 4,
  glowBlurRest: 10,
  glowBlurPeak: 18,
  activeMinHeight: 72,
} as const;

export const CHAT_INPUT_MOTION: MotionTargetDef = {
  id: "chat-input",
  label: "聊天输入框动效",
  schema: [
    { key: "borderRotateDuration", label: "边框旋转时长", min: 0.5, max: 12, step: 0.1, group: "边框动画" },
    { key: "glowBreatheDuration", label: "光晕呼吸时长", min: 0.5, max: 12, step: 0.1, group: "边框动画" },
    { key: "glowOpacity", label: "光晕透明度", min: 0, max: 1, step: 0.05, group: "光晕" },
    { key: "glowInsetRest", label: "光晕内缩-常态", min: -24, max: 8, step: 1, group: "光晕" },
    { key: "glowInsetPeak", label: "光晕内缩-峰值", min: -32, max: 8, step: 1, group: "光晕" },
    { key: "glowBlurRest", label: "光晕模糊-常态", min: 0, max: 48, step: 1, group: "光晕" },
    { key: "glowBlurPeak", label: "光晕模糊-峰值", min: 0, max: 64, step: 1, group: "光晕" },
    { key: "activeMinHeight", label: "激活最小高度", min: 48, max: 140, step: 1, group: "布局" },
  ],
  states: [
    { value: "default", label: "默认" },
    { value: "active", label: "激活" },
  ],
  defaultState: "default",
  defaultConfig: DEFAULT_CHAT_INPUT_MOTION_CONFIG as unknown as Record<string, number>,
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// ── Model options ─────────────────────────────────────────────
const MODEL_OPTIONS = [
  "Claude-Opus-4.6",
  "Claude-Sonnet-4.6",
  "Claude-Sonnet-4",
  "Claude-Haiku-3.5",
];

// ── Shared popup styles ───────────────────────────────────────
const popupMenuStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "calc(100% + 8px)",
  left: 0,
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  padding: 8,
  boxShadow: "0px 8px 12px rgba(0,0,0,0.05), 0px 8px 24px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  zIndex: 100,
  minWidth: 180,
  animation: "ci-menu-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
};

const menuItemStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  height: 32,
  alignItems: "center",
  padding: "3px 8px",
  borderRadius: 8,
  cursor: "pointer",
  transition: "background 0.15s ease",
};

const menuItemTextStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 400,
  lineHeight: "22px",
  color: "rgba(0,0,0,0.9)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

// ── File Preview Card ──────────────────────────────────────────
const FilePreviewCard = ({
  file,
  onRemove,
}: {
  file: AttachedFile;
  onRemove: (id: string) => void;
}) => {
  const isImage = file.type.startsWith("image/") && file.preview;
  return (
    <div
      style={{
        position: "relative",
        flexShrink: 0,
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #E8EAED",
        backgroundColor: "#F2F4F8",
      }}
      className="group"
    >
      {isImage ? (
        <img
          src={file.preview!}
          alt={file.file.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6, height: "100%" }}>
          <FileText style={{ width: 16, height: 16, color: "#8B919E" }} />
          <span style={{ fontSize: 11, color: "#4A4F5A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {file.file.name}
          </span>
          <span style={{ fontSize: 10, color: "#8B919E" }}>{formatFileSize(file.file.size)}</span>
        </div>
      )}
      <button
        onClick={() => onRemove(file.id)}
        style={{
          position: "absolute", top: 4, right: 4,
          width: 18, height: 18, borderRadius: "50%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "none", cursor: "pointer",
          opacity: 0, transition: "opacity 0.15s",
        }}
        className="group-hover:opacity-100"
      >
        <X style={{ width: 10, height: 10, color: "#fff" }} />
      </button>
      {file.uploadStatus === "uploading" && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Loader2 style={{ width: 18, height: 18, color: "#fff", animation: "spin 1s linear infinite" }} />
        </div>
      )}
    </div>
  );
};

export interface ChatInputHandle {
  focus: () => void;
  resetAgent: () => void;
  /** 外部强制设置选中的 agent 标签（例如左栏点击 Section） */
  setAgent: (label: string) => void;
  /** 预填输入框文案 */
  prefill: (text: string) => void;
}

export type ChatInputPreviewState = "default" | "active";

/** Agent 下拉选项 */
export interface AgentOption {
  id: string;
  label: string;
  kind: "team" | "expert" | "avatar" | "external";
}

// ── Main component ─────────────────────────────────────────────
interface ChatInputProps {
  onSendMessage?: (data: { message: string; files: AttachedFile[] }) => void;
  placeholder?: string;
  skills?: SkillChip[];
  onRemoveSkill?: (id: string) => void;
  agentChip?: AgentChip;
  onRemoveAgent?: () => void;
  config?: Record<string, number>;
  previewState?: ChatInputPreviewState;
  onCreateExpert?: () => void;
  onCreateTeam?: () => void;
  /** 选择单个专家/团队时的回调 */
  onSelectAgent?: (agentId: string, agentLabel: string) => void;
  /** 置灰 Agent 选择器（流式输出/对话阶段） */
  disableAgentSelector?: boolean;
  /** AI 正在生成回复中 */
  isGenerating?: boolean;
  /** 点击停止按钮的回调 */
  onStop?: () => void;
  /** 动态下拉选项（若不传，使用默认硬编码项做兜底） */
  agentOptions?: AgentOption[];
  /** 默认选中的 agent 标签 */
  defaultAgentLabel?: string;
}

export const ClaudeChatInput = forwardRef<ChatInputHandle, ChatInputProps>(function ClaudeChatInput({
  onSendMessage,
  placeholder = "问我任何问题或分配一个任务",
  skills = [],
  onRemoveSkill,
  agentChip,
  onRemoveAgent,
  config = CHAT_INPUT_MOTION.defaultConfig,
  previewState,
  onCreateExpert,
  onCreateTeam,
  onSelectAgent,
  disableAgentSelector = false,
  isGenerating = false,
  onStop,
  agentOptions,
  defaultAgentLabel,
}, ref) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const defaultLabel = defaultAgentLabel ?? agentOptions?.[0]?.label ?? "大数据团队";
  const [selectedAgent, setSelectedAgent] = useState(defaultLabel);
  const [selectedModel, setSelectedModel] = useState("Claude-Opus-4.6");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addBtnRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const agentBtnRef = useRef<HTMLDivElement>(null);
  const agentMenuRef = useRef<HTMLDivElement>(null);
  const modelBtnRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  const hasContent = message.trim().length > 0 || files.length > 0;

  const runtimeActive = isFocused || skills.length > 0 || !!agentChip;
  const isPreviewMode = previewState !== undefined;
  const isActive = isPreviewMode ? previewState === "active" : runtimeActive;

  const borderRotateDuration = config["borderRotateDuration"] ?? 4;
  const glowBreatheDuration = config["glowBreatheDuration"] ?? 5;
  const glowOpacity = config["glowOpacity"] ?? 0.6;
  const glowInsetRest = config["glowInsetRest"] ?? -6;
  const glowInsetPeak = config["glowInsetPeak"] ?? -10;
  const glowBlurRest = config["glowBlurRest"] ?? 22;
  const glowBlurPeak = config["glowBlurPeak"] ?? 26;
  const activeMinHeight = config["activeMinHeight"] ?? 88;
  const shouldAnimate = isActive;

  // 暴露 focus 方法给父组件
  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    resetAgent: () => setSelectedAgent(defaultLabel),
    setAgent: (label: string) => setSelectedAgent(label),
    prefill: (text: string) => { setMessage(text); requestAnimationFrame(() => textareaRef.current?.focus()); },
  }), [defaultLabel]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 320) + "px";
    }
  }, [message]);

  // 点击外部关闭所有弹出菜单
  useEffect(() => {
    if (!showAddMenu && !showAgentMenu && !showModelMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (showAddMenu && addMenuRef.current && !addMenuRef.current.contains(t) && addBtnRef.current && !addBtnRef.current.contains(t)) {
        setShowAddMenu(false);
      }
      if (showAgentMenu && agentMenuRef.current && !agentMenuRef.current.contains(t) && agentBtnRef.current && !agentBtnRef.current.contains(t)) {
        setShowAgentMenu(false);
      }
      if (showModelMenu && modelMenuRef.current && !modelMenuRef.current.contains(t) && modelBtnRef.current && !modelBtnRef.current.contains(t)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAddMenu, showAgentMenu, showModelMenu]);

  const handleFiles = useCallback((filesList: FileList | File[]) => {
    const newFiles: AttachedFile[] = Array.from(filesList).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: file.type.startsWith("image/") ? "image/unknown" : file.type,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      uploadStatus: "uploading",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((p) => (p.id === f.id ? { ...p, uploadStatus: "complete" } : p))
        );
      }, 800 + Math.random() * 600);
    });
  }, []);

  const handleSend = () => {
    if (!hasContent) return;
    onSendMessage?.({ message, files });
    setMessage("");
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{ width: "100%", fontFamily: FONT }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
      }}
    >
      {/* ── 彩色流动边框容器 ── */}
      {/* 原理：外层 padding:1.5px + overflow:hidden，内层白色 bg，中间旋转 conic-gradient 作为边框 */}
      {/* 外层不设 zIndex，不创建 stacking context，让 glow 的负 z-index 能逃逸到父级 */}
      <div style={{ position: "relative" }}>
        {/* ── 弥散投影层：负 z-index 使其在父级 stacking context 中排到最底 ── */}
        <div
          style={{
            position: "absolute",
            inset: `var(--glow-inset, ${glowInsetRest}px)`,
            borderRadius: 30,
            background: isActive
              ? "conic-gradient(from var(--angle, 0deg), #DDDDFD, #A8DCF2, #F2CEB8, #C7E9E5, #DDDDFD)"
              : "transparent",
            filter: "blur(18px)",
            opacity: isActive ? glowOpacity : 0,
            animation: shouldAnimate ? `border-rotate ${borderRotateDuration}s linear infinite, glow-breathe ${glowBreatheDuration}s ease-in-out infinite` : "none",
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
            zIndex: -1,
          }}
        />

        {/* ── 边框层 ── */}
        <div
          style={{
            position: "relative",
            borderRadius: isActive ? 25.5 : 25,   // 24 + border padding
            padding: isActive ? "1.5px" : "1px",
            transition: "padding 0.3s ease",
            background: isActive
              ? "conic-gradient(from var(--angle, 0deg), #DDDDFD, #A8DCF2, #F2CEB8, #C7E9E5, #DDDDFD)"
              : "#DFE2E8",
            animation: shouldAnimate ? `border-rotate ${borderRotateDuration}s linear infinite` : "none",
          }}
        >
        {/* ── 内层白色主容器 ── */}
        <div
          style={{
            position: "relative",
            borderRadius: 24,
            backgroundColor: "#FFFFFF",
            boxShadow: "0px 4px 8px -4px rgba(0,0,0,0.04), 0px 8px 16px -8px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.3s ease",
            display: "flex",
            flexDirection: "column",
            paddingTop: 16,
          }}
        >
          {/* 文件预览区 */}
          {files.length > 0 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 24px 12px" }}>
              {files.map((f) => (
                <FilePreviewCard
                  key={f.id}
                  file={f}
                  onRemove={(id) => setFiles((prev) => prev.filter((x) => x.id !== id))}
                />
              ))}
            </div>
          )}

          {/* ── 输入区域 ── */}
          <div
            style={{
              position: "relative",
              padding: "0 24px",
              // 激活态：最小高度 88px（对齐 Figma），默认：auto
              minHeight: isActive ? activeMinHeight : 24,
              transition: "min-height 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* 扫光 placeholder — 参考 HextaAI thinking shimmer */}
            {!message && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 24,
                  right: 24,
                  fontSize: 16,
                  lineHeight: "24px",
                  fontWeight: 400,
                  pointerEvents: "none",
                  userSelect: "none",
                  background:
                    "linear-gradient(110deg, #bbb, 35%, #fff, 50%, #bbb, 75%, #bbb)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: shouldAnimate ? "shimmer 5s linear infinite" : "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {placeholder}
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onPaste={(e) => {
                const items = e.clipboardData.items;
                const pastedFiles: File[] = [];
                for (let i = 0; i < items.length; i++) {
                  if (items[i].kind === "file") {
                    const file = items[i].getAsFile();
                    if (file) pastedFiles.push(file);
                  }
                }
                if (pastedFiles.length > 0) {
                  e.preventDefault();
                  handleFiles(pastedFiles);
                }
              }}
              rows={1}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: 16,
                fontWeight: 400,
                lineHeight: "24px",
                color: "rgba(0,0,0,0.9)",
                fontFamily: FONT,
                overflow: "hidden",
                display: "block",
                minHeight: 24,
                maxHeight: 320,
                caretColor: "#1664FF",
              }}
            />
          </div>

          {/* ── 底部操作栏（常驻可见） ── */}
          <div
            onClick={() => textareaRef.current?.focus()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
            }}
          >
            {/* 左侧工具 — h-32 gap-8 rounded-14 */}
            <div style={{ display: "flex", gap: 8, height: 32, alignItems: "center", borderRadius: 14, flexShrink: 0 }}>
              {/* btn-add: 32×32 rounded-16 + 弹出菜单 */}
              <div style={{ position: "relative" }}>
                <div
                  ref={addBtnRef}
                  className="ci-hover ci-hover-round"
                  onClick={(e) => { e.stopPropagation(); setShowAddMenu((v) => !v); setShowAgentMenu(false); setShowModelMenu(false); }}
                  style={{
                    position: "relative",
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    overflow: "hidden",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "background 0.15s ease",
                  }}
                >
                  <div style={{ position: "absolute", inset: "18.75%" }}>
                    <div style={{ position: "absolute", inset: "16.67%" }}>
                      <img src="/icons/add.svg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
                    </div>
                  </div>
                </div>

                {/* 加号弹出菜单 */}
                {showAddMenu && (
                  <div
                    ref={addMenuRef}
                    style={popupMenuStyle}
                  >
                    {/* 指定表/知识库 */}
                    <div
                      className="ci-menu-item"
                      onClick={(e) => { e.stopPropagation(); setShowAddMenu(false); }}
                      style={{
                        display: "flex",
                        gap: 12,
                        height: 32,
                        alignItems: "center",
                        padding: "3px 8px",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <div style={{ position: "relative", width: 16, height: 16, flexShrink: 0 }}>
                        <img src="/icons/ai-chart.svg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                      </div>
                      <span style={{
                        fontSize: 14, fontWeight: 400, lineHeight: "22px",
                        color: "rgba(0,0,0,0.9)", whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis",
                        fontFamily: FONT,
                      }}>指定表/知识库</span>
                    </div>
                    {/* 上传文件/图片 */}
                    <div
                      className="ci-menu-item"
                      onClick={(e) => { e.stopPropagation(); setShowAddMenu(false); fileInputRef.current?.click(); }}
                      style={{
                        display: "flex",
                        gap: 12,
                        height: 32,
                        alignItems: "center",
                        padding: "3px 8px",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <div style={{ position: "relative", width: 16, height: 16, flexShrink: 0, overflow: "hidden" }}>
                        <img src="/icons/upload-1.svg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                      </div>
                      <span style={{
                        fontSize: 14, fontWeight: 400, lineHeight: "22px",
                        color: "rgba(0,0,0,0.9)", whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis",
                        fontFamily: FONT,
                      }}>上传文件/图片</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 分割线: h-16 w-1px */}
              <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 1, height: 16, backgroundColor: "#DFE2E8", flexShrink: 0 }} />
              </div>

              {/* 工具组合: Agent + Model + Skills */}
              <div style={{ display: "flex", gap: 4, height: "100%", alignItems: "center", flexShrink: 0 }}>
                {/* Agent 按钮 + 菜单 */}
                <div style={{ position: "relative" }}>
                  <div
                    ref={agentBtnRef}
                    className={disableAgentSelector ? undefined : "ci-hover"}
                    onClick={(e) => { if (disableAgentSelector) return; e.stopPropagation(); setShowAgentMenu((v) => !v); setShowModelMenu(false); setShowAddMenu(false); }}
                    style={{
                      display: "flex",
                      gap: 4,
                      height: 32,
                      alignItems: "center",
                      padding: "0 8px",
                      borderRadius: 20,
                      overflow: "hidden",
                      cursor: disableAgentSelector ? "not-allowed" : "pointer",
                      flexShrink: 0,
                      opacity: disableAgentSelector ? 0.4 : 1,
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    <div style={{ position: "relative", width: 16, height: 16, flexShrink: 0 }}>
                      <img src="/icons/ai-agent.svg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                    </div>
                    <span style={{
                      fontSize: 14, fontWeight: 500, lineHeight: "22px",
                      color: "rgba(0,0,0,0.9)", whiteSpace: "nowrap",
                      fontFamily: SF_FONT,
                    }}>{selectedAgent}</span>
                    <div style={{ position: "relative", width: 14, height: 14, flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: "33.69%", right: "21.19%", bottom: "31.61%", left: "21.19%" }}>
                        <img src="/icons/chevron-down.svg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
                      </div>
                    </div>
                  </div>
                  {showAgentMenu && typeof document !== "undefined" && createPortal(
                    <>
                      {/* 透明遮罩：阻止所有鼠标事件穿透到 Hero 区域 */}
                      <div
                        style={{ position: "fixed", inset: 0, zIndex: 9998 }}
                        onClick={(e) => { e.stopPropagation(); setShowAgentMenu(false); }}
                        onMouseMove={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => e.stopPropagation()}
                        onMouseOver={(e) => e.stopPropagation()}
                      />
                      <div ref={agentMenuRef} style={{
                        position: "fixed",
                        bottom: agentBtnRef.current ? window.innerHeight - agentBtnRef.current.getBoundingClientRect().top + 8 : 60,
                        left: agentBtnRef.current ? agentBtnRef.current.getBoundingClientRect().left : 0,
                        backgroundColor: "#FFFFFF",
                        borderRadius: 16,
                        padding: 8,
                        boxShadow: "0px 8px 24px -4px rgba(0,0,0,0.1), 0px 8px 12px -8px rgba(0,0,0,0.05)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        zIndex: 9999,
                        minWidth: 152,
                        animation: "ci-menu-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
                      }}>
                        {/* 主要选项 */}
                        {(agentOptions ?? [
                          { id: "bigdata-team", label: "大数据团队", kind: "team" as const },
                          { id: "ops-expert", label: "数据运维专家", kind: "expert" as const },
                          { id: "analysis-expert", label: "数据分析专家", kind: "expert" as const },
                          { id: "dev-expert", label: "数据开发专家", kind: "expert" as const },
                          { id: "ops-team", label: "运营协作团队", kind: "team" as const },
                        ]).map((item) => (
                          <div
                            key={item.id}
                            className="ci-menu-item"
                            onClick={(e) => { e.stopPropagation(); setSelectedAgent(item.label); setShowAgentMenu(false); onSelectAgent?.(item.id, item.label); }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              height: 32,
                              padding: "0 8px",
                              borderRadius: 8,
                              cursor: "pointer",
                              transition: "background 0.15s ease",
                              backgroundColor: selectedAgent === item.label ? "#F2F4F8" : undefined,
                            }}
                          >
                            <span style={{ fontSize: 14, fontWeight: 400, lineHeight: "22px", color: "rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>{item.label}</span>
                          </div>
                        ))}
                        {/* 分割线 */}
                        <div style={{ height: 1, backgroundColor: "#E6E9EF", margin: "2px 0" }} />
                        {/* 创建选项 */}
                        {[
                          { id: "create-expert", label: "创建 Agent" },
                          { id: "create-team", label: "创建团队" },
                        ].map((item) => (
                          <div
                            key={item.id}
                            className="ci-menu-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAgentMenu(false);
                              if (item.id === "create-expert") onCreateExpert?.();
                              if (item.id === "create-team") onCreateTeam?.();
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              height: 32,
                              padding: "0 8px",
                              borderRadius: 8,
                              cursor: "pointer",
                              transition: "background 0.15s ease",
                            }}
                          >
                            <span style={{ fontSize: 14, fontWeight: 400, lineHeight: "22px", color: "rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </>,
                    document.body
                  )}
                </div>


              </div>
            </div>

            {/* 右侧：发送/停止按钮 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", borderRadius: 12 }}>
              {isGenerating ? (
                <button
                  onClick={onStop}
                  style={{
                    width: 32,
                    height: 32,
                    border: "none",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    padding: 0,
                  }}
                  type="button"
                  aria-label="停止"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16344 7.16344 0 16 0ZM16 10C13.1716 10 11.7576 10.0002 10.8789 10.8789C10.0002 11.7576 10 13.1716 10 16C10 18.8284 10.0002 20.2424 10.8789 21.1211C11.7576 21.9998 13.1716 22 16 22C18.8284 22 20.2424 21.9998 21.1211 21.1211C21.9998 20.2424 22 18.8284 22 16C22 13.1716 21.9998 11.7576 21.1211 10.8789C20.2424 10.0002 18.8284 10 16 10Z" fill="black" fillOpacity="0.75" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!hasContent}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    border: "none",
                    background: hasContent ? "#1D2129" : "#E8EAED",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: hasContent ? "pointer" : "default",
                    color: "#FFFFFF",
                    transition: "background 0.2s ease",
                    flexShrink: 0,
                    padding: 0,
                  }}
                  type="button"
                  aria-label="发送"
                >
                  <SendIcon size={16} color="#FFFFFF" />
                </button>
              )}
            </div>
          </div>

          {/* 拖拽遮罩 */}
          {isDragging && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(22, 100, 255, 0.04)",
                border: "2px dashed #1664FF",
                borderRadius: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
              }}
            >
              <span style={{ fontSize: 14, color: "#1664FF", fontWeight: 500 }}>
                拖拽文件到此处上传
              </span>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes border-rotate {
          to { --angle: 360deg; }
        }

        @keyframes glow-breathe {
          0%, 100% {
            --glow-inset: ${glowInsetRest}px;
            filter: blur(${glowBlurRest}px);
          }
          50% {
            --glow-inset: ${glowInsetPeak}px;
            filter: blur(${glowBlurPeak}px);
          }
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .ci-hover { transition: background 0.15s ease; }
        .ci-hover:hover { background: #F2F4F8 !important; }
        .ci-hover-round:hover { background: #F2F4F8 !important; }
        .ci-menu-item { transition: background 0.15s ease; }
        .ci-menu-item:hover { background: #F2F4F8 !important; }

        @keyframes ci-menu-in {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* 隐藏文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
});

export default ClaudeChatInput;
