"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgentRegistry } from "@/lib/agent-registry";

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
  brandCyan: "#0052D9",
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
      <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.3)" }}>{label}</span>
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
        background: on ? "#0052D9" : "#D6DBE3",
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
        width: "100%",
        minWidth: 0,
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
          </div>
          <div style={{
            marginTop: 4, fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textTertiary, lineHeight: "20px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordBreak: "break-word",
          }}>
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
        width: "100%",
        minWidth: 0,
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

// ── 已安装的 Skill（SkillHub tab 上方展示） ───────────────────
const INSTALLED_HUB_SKILLS = [
  { title: "指标 SQL Copilot", desc: "自动生成指标查询 SQL 并做字段解释。", category: "数据分析", version: "3.0.1", author: "WeData Team" },
  { title: "BI 图表生成", desc: "根据结果集输出趋势图、透视表和分析摘要。", category: "数据分析", version: "2.2.0", author: "WeData Team" },
  { title: "数据抽样诊断", desc: "快速定位异常样本、空值和分布变化。", category: "数据治理", version: "1.1.0", author: "WeData Team" },
  { title: "ETL 流水线编排", desc: "可视化拖拽构建数据加工 DAG，自动生成调度配置。", category: "数据开发", version: "1.0.0", author: "WeData Team" },
  { title: "Schema 变更检测", desc: "实时监控上游表结构变化，自动预警并生成迁移脚本。", category: "数据开发", version: "1.1.0", author: "WeData Team" },
  { title: "血缘分析引擎", desc: "自动追踪字段级血缘，输出影响面评估报告。", category: "数据治理", version: "2.0.0", author: "WeData Team" },
  { title: "集群健康监控", desc: "实时监控 HDFS/YARN/Spark 集群健康状态。", category: "运维", version: "2.1.0", author: "WeData Team" },
  { title: "异常归因分析", desc: "自动检测指标波动并定位根因维度。", category: "数据分析", version: "1.3.0", author: "WeData Team" },
];

const INSTALLED_COLLAPSE_COUNT = 6;

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
  /** Agent 广场/左栏共享 registry；传入时按其动态渲染左侧分类 */
  registry?: AgentRegistry;
}

export default function SkillPlaza({ onBack, registry }: SkillPlazaProps) {
  // ── 内置专家：固定来自 registry.experts（shortTitle） ──
  const builtinExperts = useMemo(
    () => registry?.experts.map((e) => e.shortTitle) ?? ["数据开发专家", "数据分析专家", "数据运维专家"],
    [registry?.experts]
  );
  // 自定义分身：来自 registry.avatars（id + name，允许同名）
  const customAgents = useMemo(
    () => registry?.avatars.map((a) => ({ id: a.id, name: a.name })) ?? [],
    [registry?.avatars]
  );
  // 是否为内置专家（内置专家才有预置 Skill tab）
  const isBuiltinCat = useCallback((cat: string) => builtinExperts.includes(cat), [builtinExperts]);

  const [activeCat, setActiveCat] = useState(builtinExperts[0] ?? "");
  const [activeTab, setActiveTab] = useState<"preset" | "hub">("preset");
  const [toggleState, setToggleState] = useState<Record<string, boolean>>({});
  const [installedExpanded, setInstalledExpanded] = useState(false);
  const [installedList, setInstalledList] = useState(INSTALLED_HUB_SKILLS.map((s) => s.title));
  const [availableList, setAvailableList] = useState(HUB_SKILLS.map((s) => s.title));

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
  const isBuiltin = isBuiltinCat(activeCat);

  // 切换分类时：
  //  - 外部/自定义 Agent → 只有 SkillHub tab，切到 hub
  //  - 内置专家 → 默认选中「预置 Skill」tab
  const handleCatChange = (cat: string) => {
    setActiveCat(cat);
    setSearchKeyword("");
    if (isBuiltinCat(cat)) {
      setActiveTab("preset");
    } else {
      setActiveTab("hub");
    }
  };

  // 当 registry 变动导致当前 activeCat 失效（例如被删除），自动回退到第一个可用分类
  useEffect(() => {
    const allCats = [...builtinExperts, ...customAgents.map((a) => a.name)];
    if (allCats.length > 0 && !allCats.includes(activeCat)) {
      const next = builtinExperts[0] ?? customAgents[0]?.name;
      if (next) {
        setActiveCat(next);
        setActiveTab(isBuiltinCat(next) ? "preset" : "hub");
      }
    }
  }, [builtinExperts, customAgents, activeCat, isBuiltinCat]);

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
      {/* 响应式卡片栅格：<1440 → 2 列；1440-1920 → 3 列；≥1920 → 4 列 */}
      <style>{`
        .skill-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          align-content: flex-start;
        }
        @media (min-width: 1440px) {
          .skill-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (min-width: 1920px) {
          .skill-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
      `}</style>
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
          <SectionLabel label="大数据 Agent" />
          {builtinExperts.map((name) => (
            <CatItem key={name} label={name} active={activeCat === name} onClick={() => handleCatChange(name)} />
          ))}

          {customAgents.length > 0 && (
            <>
              <SectionLabel label="自定义 Agent" />
              {customAgents.map((a) => (
                <CatItem key={a.id} label={a.name} active={activeCat === a.name} onClick={() => handleCatChange(a.name)} />
              ))}
            </>
          )}
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
                  className="skill-grid"
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
                  style={{ display: "flex", flexDirection: "column", gap: 0 }}
                >
                  {/* ── 已安装区域 ── */}
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.textPrimary }}>
                      已安装（{installedList.length}）
                    </span>
                  </div>
                  <div className="skill-grid">
                    {(() => {
                      const installedSkills = INSTALLED_HUB_SKILLS.filter((s) => installedList.includes(s.title))
                        .filter((s) => !kw || s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw));
                      const visibleInstalled = installedExpanded ? installedSkills : installedSkills.slice(0, INSTALLED_COLLAPSE_COUNT);
                      return (
                        <>
                          {visibleInstalled.map((s) => (
                            <SkillCard
                              key={`installed-${s.title}`}
                              title={s.title} desc={s.desc}
                              on={isOn(`hub-installed-${s.title}`)}
                              onToggle={() => toggle(`hub-installed-${s.title}`)}
                              onCardClick={() => setDetailSkill({ title: s.title, desc: s.desc, category: s.category, version: s.version, author: s.author })}
                            />
                          ))}
                          {/* 新安装的 skill 也显示在这里 */}
                          {HUB_SKILLS.filter((s) => installedList.includes(s.title) && !INSTALLED_HUB_SKILLS.some((i) => i.title === s.title))
                            .filter((s) => !kw || s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw))
                            .map((s) => (
                              <SkillCard
                                key={`new-installed-${s.title}`}
                                title={s.title} desc={s.desc}
                                on={isOn(`hub-installed-${s.title}`)}
                                onToggle={() => toggle(`hub-installed-${s.title}`)}
                                onCardClick={() => setDetailSkill({ title: s.title, desc: s.desc, category: s.category, version: s.version, author: s.author })}
                              />
                            ))}
                        </>
                      );
                    })()}
                  </div>
                  {/* 展开更多 */}
                  {INSTALLED_HUB_SKILLS.filter((s) => installedList.includes(s.title)).length > INSTALLED_COLLAPSE_COUNT && (
                    <div
                      onClick={() => setInstalledExpanded((v) => !v)}
                      style={{ textAlign: "center", padding: "12px 0 4px", cursor: "pointer" }}
                    >
                      <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: "rgba(0,0,0,0.4)" }}>
                        {installedExpanded ? "收起" : "显示更多"}
                      </span>
                    </div>
                  )}

                  {/* ── 分割线 ── */}
                  <div style={{ height: 1, background: C.border, margin: "16px 0" }} />

                  {/* ── 可安装区域 ── */}
                  <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: C.textPrimary }}>可安装</span>
                    <a
                      href="https://skillhub.cn"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: FONT, fontSize: 12, fontWeight: 400, color: "rgba(0,0,0,0.9)", textDecoration: "none", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.7"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
                    >
                      <span>查看更多Skill</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.8902 13.4616L12.0199 14.1138H12.0199L11.8902 13.4616ZM13.4616 11.8902L14.1138 12.0199V12.0199L13.4616 11.8902ZM3.08579 12.9142L3.55601 12.444H3.55601L3.08579 12.9142ZM4.10982 2.53843L4.23955 3.19065V3.19065L4.10982 2.53843ZM2.53843 4.10982L3.19065 4.23955V4.23955L2.53843 4.10982ZM6 10L6.47023 10.4702L13.3844 3.55601L12.9142 3.08579L12.444 2.61556L5.52977 9.52977L6 10ZM12.9142 3.08579L13.3844 3.55601L13.4702 3.47023L13 3L12.5298 2.52977L12.444 2.61556L12.9142 3.08579ZM8 2.5V3.165H9.5V2.5V1.835H8V2.5ZM13.5 6.5H12.835V8H13.5H14.165V6.5H13.5ZM9.5 2.5V3.165C10.4616 3.165 11.1159 3.16641 11.6059 3.23229C12.0768 3.2956 12.2952 3.40727 12.444 3.55601L12.9142 3.08579L13.3844 2.61556C12.9474 2.17852 12.4015 1.99729 11.7832 1.91415C11.1839 1.83359 10.424 1.835 9.5 1.835V2.5ZM13.5 6.5H14.165C14.165 5.57599 14.1664 4.81609 14.0858 4.21685C14.0027 3.59848 13.8215 3.0526 13.3844 2.61556L12.9142 3.08579L12.444 3.55601C12.5927 3.70475 12.7044 3.92318 12.7677 4.39407C12.8336 4.88408 12.835 5.53839 12.835 6.5H13.5ZM2.5 5H1.835V9.5H2.5H3.165V5H2.5ZM6.5 13.5V14.165H11V13.5V12.835H6.5V13.5ZM11 13.5V14.165C11.4328 14.165 11.7463 14.1682 12.0199 14.1138L11.8902 13.4616L11.7604 12.8093C11.6477 12.8318 11.4965 12.835 11 12.835V13.5ZM13.5 11H12.835C12.835 11.4965 12.8318 11.6477 12.8093 11.7604L13.4616 11.8902L14.1138 12.0199C14.1682 11.7463 14.165 11.4328 14.165 11H13.5ZM11.8902 13.4616L12.0199 14.1138C13.0771 13.9035 13.9035 13.0771 14.1138 12.0199L13.4616 11.8902L12.8093 11.7604C12.704 12.29 12.29 12.704 11.7604 12.8093L11.8902 13.4616ZM2.5 9.5H1.835C1.835 10.424 1.83359 11.1839 1.91415 11.7832C1.99729 12.4015 2.17852 12.9474 2.61556 13.3844L3.08579 12.9142L3.55601 12.444C3.40727 12.2952 3.2956 12.0768 3.23229 11.6059C3.16641 11.1159 3.165 10.4616 3.165 9.5H2.5ZM6.5 13.5V12.835C5.53839 12.835 4.88408 12.8336 4.39407 12.7677C3.92318 12.7044 3.70475 12.5927 3.55601 12.444L3.08579 12.9142L2.61556 13.3844C3.0526 13.8215 3.59848 14.0027 4.21685 14.0858C4.81609 14.1664 5.57599 14.165 6.5 14.165V13.5ZM5 2.5V1.835C4.56722 1.835 4.25371 1.83178 3.98008 1.88621L4.10982 2.53843L4.23955 3.19065C4.35232 3.16822 4.50347 3.165 5 3.165V2.5ZM2.5 5H3.165C3.165 4.50347 3.16822 4.35232 3.19065 4.23955L2.53843 4.10982L1.88621 3.98008C1.83178 4.25371 1.835 4.56722 1.835 5H2.5ZM4.10982 2.53843L3.98008 1.88621C2.9229 2.09649 2.09649 2.9229 1.88621 3.98008L2.53843 4.10982L3.19065 4.23955C3.29599 3.70997 3.70997 3.29599 4.23955 3.19065L4.10982 2.53843Z" fill="rgba(0,0,0,0.9)" />
                      </svg>
                    </a>
                  </div>
                  <div className="skill-grid">
                    {(() => {
                      const avail = HUB_SKILLS.filter((s) => availableList.includes(s.title) && !installedList.includes(s.title))
                        .filter((s) => !kw || s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw));
                      return avail.length > 0 ? avail.map((s) => (
                        <HubCard
                          key={s.title}
                          icon={s.icon} iconBg={s.iconBg}
                          title={s.title} desc={s.desc}
                          willSucceed={s.willSucceed}
                          onCardClick={() => setDetailSkill({ title: s.title, desc: s.desc, category: s.category, version: s.version, author: s.author })}
                          onInstallResult={(ok) => {
                            if (ok) {
                              setInstalledList((prev) => [...prev, s.title]);
                              setAvailableList((prev) => prev.filter((t) => t !== s.title));
                              showToast("Skill 安装成功", "success");
                            } else {
                              showToast("Skill 安装失败", "error");
                            }
                          }}
                        />
                      )) : (
                        <div style={{ width: "100%", padding: "40px 0", textAlign: "center", fontFamily: FONT, fontSize: 14, color: C.textTertiary }}>
                          暂无可安装的 Skill
                        </div>
                      );
                    })()}
                  </div>
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
