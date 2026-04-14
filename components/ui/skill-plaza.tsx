"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const C = {
  bg: "#F9FAFC",
  bgWhite: "#FFFFFF",
  border: "#E6E9EF",
  textPrimary: "rgba(0,0,0,0.9)",
  textSecondary: "rgba(0,0,0,0.7)",
  textTertiary: "rgba(0,0,0,0.5)",
  activeBg: "#E9ECF1",
  hoverBg: "#F2F4F8",
  brandCyan: "#00C8D6",
  error: "#F64041",
} as const;

// ── 内置专家列表（用于判断是否显示预置 Skill tab）──────────
const BUILTIN_EXPERTS = new Set(["数据开发专家", "数据分析专家", "数据运维专家"]);

// ── Toast 组件（顶部展示，支持 success/error）─────────────────
function Toast({ message, visible, type, onDone }: { message: string; visible: boolean; type?: "success" | "error"; onDone: () => void }) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onDone, 2500);
      return () => clearTimeout(t);
    }
  }, [visible, onDone]);

  const isError = type === "error";

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
          {isError ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" fill={C.error} />
              <path d="M8 4.5v4" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.75" fill="#FFF" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" fill="#0CBF5B" />
              <path d="M5 8.5l2 2 4-4.5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textPrimary }}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Skill 详情弹窗 ──────────────────────────────────────────
type SkillDetail = { title: string; desc: string; category: string; version: string; author: string };

function SkillDetailModal({ detail, onClose }: { detail: SkillDetail; onClose: () => void }) {
  // 点击遮罩关闭
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
          padding: "28px 28px 24px", position: "relative",
        }}
      >
        {/* 关闭按钮 */}
        <div
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            width: 28, height: 28, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", background: "transparent",
            transition: "background 100ms",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* 标题 */}
        <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, color: C.textPrimary, paddingRight: 32 }}>
          {detail.title}
        </div>

        {/* 功能说明 */}
        <div style={{ marginTop: 12, fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textTertiary, lineHeight: "22px" }}>
          {detail.desc}
        </div>

        {/* 分割线 */}
        <div style={{ margin: "20px 0 16px", height: 1, background: C.border }} />

        {/* 信息行 */}
        {([
          ["类别", detail.category],
          ["版本", detail.version],
          ["作者", detail.author],
        ] as const).map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 400, color: C.textTertiary }}>{label}</span>
            <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{value}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ── Category item ─────────────────────────────────────────────
function CatItem({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 34, display: "flex", alignItems: "center",
        padding: "0 12px", borderRadius: 20, cursor: "pointer",
        background: active ? C.activeBg : hovered ? C.hoverBg : "transparent",
        transition: "background 100ms",
      }}
    >
      <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textPrimary }}>{label}</span>
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ height: 52, display: "flex", alignItems: "flex-end", padding: "0 12px 8px" }}>
      <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: C.textSecondary }}>{label}</span>
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle?: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
      style={{
        width: 39, height: 24, borderRadius: 12,
        background: on ? "#00C8D6" : "#D6DBE3",
        position: "relative", cursor: "pointer", flexShrink: 0,
        transition: "background 200ms",
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: 10,
        background: "#FFF",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        position: "absolute", top: 2,
        left: on ? 17 : 2,
        transition: "left 200ms",
      }} />
    </div>
  );
}

// ── Skill card ────────────────────────────────────────────────
function SkillCard({ title, desc, defaultTag, on, onToggle, onCardClick }: {
  icon?: string;
  iconBg?: string;
  title: string;
  desc: string;
  defaultTag?: boolean;
  on: boolean;
  onToggle?: () => void;
  onCardClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "0 0 calc(33.333% - 11px)",
        minWidth: 280,
        background: C.bgWhite,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        padding: 20,
        cursor: "pointer",
        transition: "box-shadow 150ms",
        boxShadow: hovered ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500, color: C.textPrimary }}>{title}</span>
            {defaultTag && (
              <span style={{
                fontSize: 12, fontWeight: 400, color: "#0052D9",
                background: "#F2F3FF", borderRadius: 9999, padding: "0 8px",
                lineHeight: "20px", flexShrink: 0,
              }}>默认</span>
            )}
          </div>
          <div style={{ marginTop: 4, fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textTertiary, lineHeight: "20px" }}>
            {desc}
          </div>
        </div>
        <div style={{ marginLeft: 8, flexShrink: 0 }}>
          <Toggle on={on} onToggle={onToggle} />
        </div>
      </div>
    </div>
  );
}

// ── Hub skill card (install: hover→button→loading→success toggle / fail toast→idle) ─
function HubCard({ title, desc, willSucceed, onCardClick, onInstallResult }: {
  icon?: string; iconBg?: string; title: string; desc: string;
  willSucceed?: boolean;
  onCardClick?: () => void;
  onInstallResult?: (success: boolean) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [installState, setInstallState] = useState<"idle" | "loading" | "installed">("idle");
  const [toggleOn, setToggleOn] = useState(true);

  const handleInstall = () => {
    if (installState !== "idle") return;
    setInstallState("loading");
    setTimeout(() => {
      if (willSucceed) {
        setInstallState("installed");
        setToggleOn(true);
        onInstallResult?.(true);
      } else {
        setInstallState("idle");
        onInstallResult?.(false);
      }
    }, 1500);
  };

  return (
    <div
      onClick={onCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "0 0 calc(33.333% - 11px)",
        minWidth: 280,
        background: C.bgWhite,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        padding: 20,
        cursor: "pointer",
        transition: "box-shadow 150ms",
        boxShadow: hovered ? "0 8px 24px -4px rgba(0,0,0,0.1), 0 8px 12px -8px rgba(0,0,0,0.05)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500, color: C.textPrimary }}>{title}</span>
          <div style={{ marginTop: 4, fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textTertiary, lineHeight: "20px",
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
          }}>
            {desc}
          </div>
        </div>
        {/* Right action area */}
        <div style={{ flexShrink: 0, marginLeft: 8, minWidth: 68, display: "flex", justifyContent: "flex-end" }}>
          {installState === "installed" ? (
            <Toggle on={toggleOn} onToggle={() => setToggleOn((v) => !v)} />
          ) : installState === "loading" ? (
            <div style={{ width: 68, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <style>{`@keyframes hub-spin { to { transform: rotate(360deg); } }`}</style>
              <svg width="20" height="20" viewBox="0 0 20 20" style={{ animation: "hub-spin 0.8s linear infinite" }}>
                <circle cx="10" cy="10" r="8" stroke="rgba(0,0,0,0.15)" strokeWidth="2.5" fill="none" />
                <path d="M10 2a8 8 0 0 1 8 8" stroke="rgba(0,0,0,0.7)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); handleInstall(); }}
              style={{
                height: 32, padding: "0 20px", borderRadius: 100,
                border: "none",
                background: "rgba(0,0,0,0.75)",
                boxShadow: "0 2px 4px -2px rgba(0,0,0,0.2)",
                fontFamily: FONT, fontSize: 14, fontWeight: 500,
                color: "rgba(255,255,255,0.9)",
                cursor: "pointer", outline: "none",
                opacity: hovered ? 1 : 0,
                transition: "opacity 150ms",
              }}
            >
              安装
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const HUB_SKILLS = [
  { icon: "S", iconBg: "#7B68EE", title: "self-improving-agent", desc: "记录经验教训、错误及修正以实现持续改进。适用场景：命令或操作意外失败，用户纠正错误等。", category: "智能体", version: "1.2.0", author: "WeData Team", willSucceed: true },
  { icon: "F", iconBg: "#E59858", title: "Find Skills", desc: "帮助发现并安装智能体技能，当用户需要扩展功能时自动搜索匹配的 Skill。", category: "工具", version: "2.0.1", author: "WeData Team", willSucceed: false },
  { icon: "S", iconBg: "#3BAFB9", title: "Summarize", desc: "使用 summarize CLI 总结 URL 或文件（支持网页、PDF、图片、音频、YouTube）。", category: "效率", version: "1.5.3", author: "Community", willSucceed: true },
  { icon: "F", iconBg: "#E59858", title: "Find Skills Pro", desc: "增强版技能发现引擎，支持语义搜索和智能推荐。", category: "工具", version: "3.1.0", author: "WeData Team", willSucceed: false },
  { icon: "S", iconBg: "#3BAFB9", title: "Summarize Pro", desc: "支持批量文件摘要和多语言翻译。", category: "效率", version: "2.0.0", author: "Community", willSucceed: true },
  { icon: "S", iconBg: "#3BAFB9", title: "Summarize Lite", desc: "轻量版摘要工具，专注快速提取关键信息。", category: "效率", version: "1.0.2", author: "Community", willSucceed: false },
  { icon: "F", iconBg: "#E59858", title: "Workflow Builder", desc: "通过对话自动生成和调试复杂工作流。", category: "自动化", version: "1.3.0", author: "WeData Team", willSucceed: true },
  { icon: "S", iconBg: "#7B68EE", title: "Code Review Agent", desc: "自动审查代码变更，提供改进建议和安全检查。", category: "开发", version: "2.1.0", author: "WeData Team", willSucceed: false },
  { icon: "F", iconBg: "#E59858", title: "Data Connector", desc: "一键连接多种数据源，支持 MySQL、PostgreSQL、MongoDB 等。", category: "数据", version: "1.4.2", author: "WeData Team", willSucceed: true },
];

// ── Main component ────────────────────────────────────────────
interface SkillPlazaProps {
  onBack?: () => void;
}

export default function SkillPlaza({ onBack }: SkillPlazaProps) {
  const [activeCat, setActiveCat] = useState("数据开发专家");
  const [activeTab, setActiveTab] = useState<"preset" | "hub">("preset");
  const [toggleState, setToggleState] = useState<Record<string, boolean>>({});

  // 弹窗状态
  const [detailSkill, setDetailSkill] = useState<SkillDetail | null>(null);

  // 搜索状态
  const [searchKeyword, setSearchKeyword] = useState("");

  // Toast 状态
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const toggle = (key: string) => setToggleState((p) => ({ ...p, [key]: !(p[key] ?? true) }));
  const isOn = (key: string) => toggleState[key] ?? true;

  const showToast = useCallback((msg: string, type: "success" | "error" = "error") => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
  }, []);
  const hideToast = useCallback(() => setToastVisible(false), []);

  // 是否为内置专家（内置专家才有预置 Skill tab）
  const isBuiltin = BUILTIN_EXPERTS.has(activeCat);

  // 切换分类时：外部 Claw 自动切到 hub，清空搜索
  const handleCatChange = (cat: string) => {
    setActiveCat(cat);
    setSearchKeyword("");
    if (!BUILTIN_EXPERTS.has(cat)) {
      setActiveTab("hub");
    }
  };

  // 按分类定义不同的技能（含详情弹窗需要的 category/version/author）
  const SKILLS_BY_CAT: Record<string, { icon: string; iconBg: string; title: string; desc: string; defaultTag?: boolean; category: string; version: string; author: string }[]> = {
    "数据开发专家": [
      { icon: "E", iconBg: "#3BAFB9", title: "ETL 流水线编排", desc: "可视化拖拽构建数据加工 DAG，自动生成调度配置。", category: "数据开发", version: "1.0.0", author: "WeData Team" },
      { icon: "S", iconBg: "#4C8DEF", title: "Schema 变更检测", desc: "实时监控上游表结构变化，自动预警并生成迁移脚本。", category: "数据开发", version: "1.1.0", author: "WeData Team" },
      { icon: "血", iconBg: "#7B68EE", title: "血缘分析引擎", desc: "自动追踪字段级血缘，输出影响面评估报告。", defaultTag: true, category: "数据治理", version: "2.0.0", author: "WeData Team" },
    ],
    "数据分析专家": [
      { icon: "指", iconBg: "#7B68EE", title: "指标 SQL Copilot", desc: "自动生成指标查询 SQL 并做字段解释。", defaultTag: true, category: "数据分析", version: "3.0.1", author: "WeData Team" },
      { icon: "B", iconBg: "#3BAFB9", title: "BI 图表生成", desc: "根据结果集输出趋势图、透视表和分析摘要。", defaultTag: true, category: "数据分析", version: "2.2.0", author: "WeData Team" },
      { icon: "归", iconBg: "#E8524A", title: "异常归因分析", desc: "自动检测指标波动并定位根因维度。", category: "数据分析", version: "1.3.0", author: "WeData Team" },
      { icon: "预", iconBg: "#FF7800", title: "趋势预测", desc: "基于历史数据生成未来 7/14/30 天的趋势预测。", category: "数据分析", version: "1.0.0", author: "WeData Team" },
    ],
    "数据运维专家": [
      { icon: "监", iconBg: "#FF7800", title: "集群健康监控", desc: "实时监控 HDFS/YARN/Spark 集群健康状态。", defaultTag: true, category: "运维", version: "2.1.0", author: "WeData Team" },
      { icon: "扩", iconBg: "#E8524A", title: "弹性扩缩容", desc: "根据负载自动触发节点扩缩容策略。", category: "运维", version: "1.2.0", author: "WeData Team" },
      { icon: "日", iconBg: "#4C8DEF", title: "日志智能分析", desc: "对 Executor 日志做聚类分析，快速定位故障模式。", category: "运维", version: "1.5.0", author: "WeData Team" },
    ],
    "专家1": [
      { icon: "C", iconBg: "#1664FF", title: "自定义 Skill", desc: "用户自定义的外部技能。", category: "自定义", version: "1.0.0", author: "用户" },
    ],
  };

  const skills = SKILLS_BY_CAT[activeCat] ?? [];

  // 搜索过滤
  const kw = searchKeyword.trim().toLowerCase();
  const filteredSkills = kw ? skills.filter((s) => s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw)) : skills;
  const filteredHubSkills = kw ? HUB_SKILLS.filter((s) => s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw)) : HUB_SKILLS;

  // Tab 列表：外部 Claw 只显示 SkillHub
  const tabs = isBuiltin
    ? [{ id: "preset" as const, label: "预置 Skill" }, { id: "hub" as const, label: "SkillHub" }]
    : [{ id: "hub" as const, label: "SkillHub" }];

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      fontFamily: FONT, background: C.bg,
    }}>
      {/* 顶部标题栏 */}
      <div style={{
        height: 50, flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 24px",
        borderBottom: `1px solid ${C.border}`,
        background: C.bg,
      }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary }}>技能广场</span>
      </div>

      {/* 内容区 */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* 左侧分类导航 */}
        <div style={{
          width: 180, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          padding: "0 12px", overflowY: "auto", scrollbarWidth: "none",
        }}>
          <SectionLabel label="内置专家" />
          <CatItem label="数据开发专家" active={activeCat === "数据开发专家"} onClick={() => handleCatChange("数据开发专家")} />
          <CatItem label="数据分析专家" active={activeCat === "数据分析专家"} onClick={() => handleCatChange("数据分析专家")} />
          <CatItem label="数据运维专家" active={activeCat === "数据运维专家"} onClick={() => handleCatChange("数据运维专家")} />

          <SectionLabel label="外部 Claw" />
          <CatItem label="专家1" active={activeCat === "专家1"} onClick={() => handleCatChange("专家1")} />
        </div>

        {/* 右侧内容 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Tab 栏 + 搜索 */}
          <div style={{ height: 50, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 24px", gap: 24 }}>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ position: "relative", height: 32, display: "flex", alignItems: "center", cursor: "pointer" }}
              >
                <span style={{
                  fontSize: 14, fontWeight: 500,
                  color: activeTab === tab.id ? C.textPrimary : C.textSecondary,
                }}>{tab.label}</span>
                {activeTab === tab.id && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: C.brandCyan, borderRadius: 1 }} />
                )}
              </div>
            ))}

            {/* 搜索框 - 右侧（Figma 规范） */}
            <style>{`.skill-plaza-search::placeholder { color: rgba(0,0,0,0.4); opacity: 1; }`}</style>
            <div style={{ marginLeft: "auto", position: "relative", width: 240, height: 32 }}>
              <div style={{
                width: 240, height: 32, borderRadius: 100,
                background: C.bgWhite, position: "relative",
              }}>
                {/* 搜索图标 */}
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  style={{ position: "absolute", left: 8, top: 8, pointerEvents: "none" }}
                >
                  <path d="M10.064 3.93603C8.37178 2.24376 5.62806 2.24376 3.93579 3.93603C2.24352 5.62831 2.24352 8.37202 3.93579 10.0643C5.62806 11.7566 8.37178 11.7566 10.064 10.0643C11.7563 8.37202 11.7563 5.62831 10.064 3.93603ZM2.99298 2.99322C5.20595 0.780253 8.79389 0.780253 11.0069 2.99322C13.0603 5.04671 13.2083 8.28413 11.4508 10.5083L15.0138 14.0712L14.071 15.014L10.508 11.4511C8.28388 13.2086 5.04647 13.0606 2.99298 11.0071C0.780009 8.79413 0.780009 5.2062 2.99298 2.99322Z" fill="black" fillOpacity="0.4" />
                </svg>
                <input
                  className="skill-plaza-search"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="请输入内容"
                  style={{
                    width: "100%", height: "100%",
                    paddingLeft: 32, paddingRight: 12,
                    borderRadius: 100,
                    border: "none",
                    background: "transparent",
                    fontFamily: FONT, fontSize: 14, fontWeight: 400,
                    color: C.textPrimary,
                    outline: "none",
                    caretColor: C.textPrimary,
                  }}
                />
              </div>
            </div>
          </div>

          {/* 技能卡片 */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "12px 24px 24px",
            scrollbarWidth: "none", position: "relative",
          }}>
            <AnimatePresence mode="wait">
              {activeTab === "preset" && isBuiltin ? (
                <motion.div
                  key={`preset-${activeCat}-${kw}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  style={{ display: "flex", flexWrap: "wrap", gap: 16, alignContent: "flex-start" }}
                >
                  {filteredSkills.length > 0 ? filteredSkills.map((s) => (
                    <SkillCard
                      key={`${activeCat}-${s.title}`}
                      icon={s.icon} iconBg={s.iconBg}
                      title={s.title} desc={s.desc}
                      defaultTag={s.defaultTag}
                      on={isOn(`${activeCat}-${s.title}`)}
                      onToggle={() => toggle(`${activeCat}-${s.title}`)}
                      onCardClick={() => setDetailSkill({ title: s.title, desc: s.desc, category: s.category, version: s.version, author: s.author })}
                    />
                  )) : (
                    <div style={{ width: "100%", padding: "40px 0", textAlign: "center", fontFamily: FONT, fontSize: 14, color: C.textTertiary }}>
                      未找到匹配的 Skill
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={`hub-${kw}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  style={{ display: "flex", flexWrap: "wrap", gap: 16, alignContent: "flex-start" }}
                >
                  {filteredHubSkills.length > 0 ? filteredHubSkills.map((s) => (
                    <HubCard
                      key={s.title}
                      icon={s.icon} iconBg={s.iconBg}
                      title={s.title} desc={s.desc}
                      willSucceed={s.willSucceed}
                      onCardClick={() => setDetailSkill({ title: s.title, desc: s.desc, category: s.category, version: s.version, author: s.author })}
                      onInstallResult={(ok) => showToast(ok ? "Skill 安装成功" : "Skill 安装失败", ok ? "success" : "error")}
                    />
                  )) : (
                    <div style={{ width: "100%", padding: "40px 0", textAlign: "center", fontFamily: FONT, fontSize: 14, color: C.textTertiary }}>
                      未找到匹配的 Skill
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Skill 详情弹窗 */}
      <AnimatePresence>
        {detailSkill && <SkillDetailModal detail={detailSkill} onClose={() => setDetailSkill(null)} />}
      </AnimatePresence>

      {/* 全局 Toast */}
      <Toast message={toastMsg} visible={toastVisible} type={toastType} onDone={hideToast} />
    </div>
  );
}
