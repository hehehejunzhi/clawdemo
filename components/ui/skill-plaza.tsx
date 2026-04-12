"use client";

import React, { useState } from "react";
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
} as const;

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
function SkillCard({ icon, iconBg, title, desc, defaultTag, on, onToggle }: {
  icon: string;
  iconBg: string;
  title: string;
  desc: string;
  defaultTag?: boolean;
  on: boolean;
  onToggle?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
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
        <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6, background: iconBg,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: "#FFF" }}>{icon}</span>
          </div>
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
        </div>
        <div style={{ marginLeft: 8, flexShrink: 0 }}>
          <Toggle on={on} onToggle={onToggle} />
        </div>
      </div>
    </div>
  );
}

// ── Hub skill card (install flow: hover→button→loading→toggle) ─
function HubCard({ icon, iconBg, title, desc }: {
  icon: string; iconBg: string; title: string; desc: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [installState, setInstallState] = useState<"idle" | "loading" | "installed">("idle");
  const [toggleOn, setToggleOn] = useState(true);

  const handleInstall = () => {
    if (installState !== "idle") return;
    setInstallState("loading");
    setTimeout(() => {
      setInstallState("installed");
      setToggleOn(true);
    }, 1500);
  };

  return (
    <div
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
        <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6, background: iconBg,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: "#FFF" }}>{icon}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500, color: C.textPrimary }}>{title}</span>
            <div style={{ marginTop: 4, fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textTertiary, lineHeight: "20px",
              overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
            }}>
              {desc}
            </div>
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
  { icon: "S", iconBg: "#7B68EE", title: "self-improving-agent", desc: "记录经验教训、错误及修正以实现持续改进。适用场景：命令或操作意外失败，用户纠正错误等。" },
  { icon: "F", iconBg: "#E59858", title: "Find Skills", desc: "帮助发现并安装智能体技能，当用户需要扩展功能时自动搜索匹配的 Skill。" },
  { icon: "S", iconBg: "#3BAFB9", title: "Summarize", desc: "使用 summarize CLI 总结 URL 或文件（支持网页、PDF、图片、音频、YouTube）。" },
  { icon: "F", iconBg: "#E59858", title: "Find Skills Pro", desc: "增强版技能发现引擎，支持语义搜索和智能推荐。" },
  { icon: "S", iconBg: "#3BAFB9", title: "Summarize Pro", desc: "支持批量文件摘要和多语言翻译。" },
  { icon: "S", iconBg: "#3BAFB9", title: "Summarize Lite", desc: "轻量版摘要工具，专注快速提取关键信息。" },
  { icon: "F", iconBg: "#E59858", title: "Workflow Builder", desc: "通过对话自动生成和调试复杂工作流。" },
  { icon: "S", iconBg: "#7B68EE", title: "Code Review Agent", desc: "自动审查代码变更，提供改进建议和安全检查。" },
  { icon: "F", iconBg: "#E59858", title: "Data Connector", desc: "一键连接多种数据源，支持 MySQL、PostgreSQL、MongoDB 等。" },
];

// ── Main component ────────────────────────────────────────────
interface SkillPlazaProps {
  onBack?: () => void;
}

export default function SkillPlaza({ onBack }: SkillPlazaProps) {
  const [activeCat, setActiveCat] = useState("大数据团队");
  const [activeTab, setActiveTab] = useState<"preset" | "hub">("preset");
  const [toggleState, setToggleState] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setToggleState((p) => ({ ...p, [key]: !(p[key] ?? true) }));
  const isOn = (key: string) => toggleState[key] ?? true;

  // 按分类定义不同的技能
  const SKILLS_BY_CAT: Record<string, { icon: string; iconBg: string; title: string; desc: string; defaultTag?: boolean }[]> = {
    "大数据团队": [
      { icon: "指", iconBg: "#7B68EE", title: "指标 SQL Copilot", desc: "自动生成指标查询 SQL 并做字段解释。", defaultTag: true },
      { icon: "B", iconBg: "#3BAFB9", title: "BI 图表生成", desc: "根据结果集输出趋势图、透视表和分析摘要。", defaultTag: true },
      { icon: "诊", iconBg: "#4C8DEF", title: "数据抽样诊断", desc: "快速定位异常样本、空值和分布变化。", defaultTag: true },
    ],
    "数据开发专家": [
      { icon: "E", iconBg: "#3BAFB9", title: "ETL 流水线编排", desc: "可视化拖拽构建数据加工 DAG，自动生成调度配置。" },
      { icon: "S", iconBg: "#4C8DEF", title: "Schema 变更检测", desc: "实时监控上游表结构变化，自动预警并生成迁移脚本。" },
      { icon: "血", iconBg: "#7B68EE", title: "血缘分析引擎", desc: "自动追踪字段级血缘，输出影响面评估报告。", defaultTag: true },
    ],
    "数据分析专家": [
      { icon: "指", iconBg: "#7B68EE", title: "指标 SQL Copilot", desc: "自动生成指标查询 SQL 并做字段解释。", defaultTag: true },
      { icon: "B", iconBg: "#3BAFB9", title: "BI 图表生成", desc: "根据结果集输出趋势图、透视表和分析摘要。", defaultTag: true },
      { icon: "归", iconBg: "#E8524A", title: "异常归因分析", desc: "自动检测指标波动并定位根因维度。" },
      { icon: "预", iconBg: "#FF7800", title: "趋势预测", desc: "基于历史数据生成未来 7/14/30 天的趋势预测。" },
    ],
    "数据运维专家": [
      { icon: "监", iconBg: "#FF7800", title: "集群健康监控", desc: "实时监控 HDFS/YARN/Spark 集群健康状态。", defaultTag: true },
      { icon: "扩", iconBg: "#E8524A", title: "弹性扩缩容", desc: "根据负载自动触发节点扩缩容策略。" },
      { icon: "日", iconBg: "#4C8DEF", title: "日志智能分析", desc: "对 Executor 日志做聚类分析，快速定位故障模式。" },
    ],
    "专家1": [
      { icon: "C", iconBg: "#1664FF", title: "自定义 Skill", desc: "用户自定义的外部技能。" },
    ],
  };

  const skills = SKILLS_BY_CAT[activeCat] ?? [];

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
          <CatItem label="大数据团队" active={activeCat === "大数据团队"} onClick={() => setActiveCat("大数据团队")} />
          <CatItem label="数据开发专家" active={activeCat === "数据开发专家"} onClick={() => setActiveCat("数据开发专家")} />
          <CatItem label="数据分析专家" active={activeCat === "数据分析专家"} onClick={() => setActiveCat("数据分析专家")} />
          <CatItem label="数据运维专家" active={activeCat === "数据运维专家"} onClick={() => setActiveCat("数据运维专家")} />

          <SectionLabel label="外部 Claw" />
          <CatItem label="专家1" active={activeCat === "专家1"} onClick={() => setActiveCat("专家1")} />
        </div>

        {/* 右侧内容 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Tab 栏 */}
          <div style={{ height: 50, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 24px", gap: 24 }}>
            {([
              { id: "preset" as const, label: "预置 Skill" },
              { id: "hub" as const, label: "SkillHub" },
            ]).map((tab) => (
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
          </div>

          {/* 技能卡片 */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "12px 24px 24px",
            scrollbarWidth: "none", position: "relative",
          }}>
            <AnimatePresence mode="wait">
              {activeTab === "preset" ? (
                <motion.div
                  key={`preset-${activeCat}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  style={{ display: "flex", flexWrap: "wrap", gap: 16, alignContent: "flex-start" }}
                >
                  {skills.map((s) => (
                    <SkillCard
                      key={`${activeCat}-${s.title}`}
                      icon={s.icon} iconBg={s.iconBg}
                      title={s.title} desc={s.desc}
                      defaultTag={s.defaultTag}
                      on={isOn(`${activeCat}-${s.title}`)}
                      onToggle={() => toggle(`${activeCat}-${s.title}`)}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="hub"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  style={{ display: "flex", flexWrap: "wrap", gap: 16, alignContent: "flex-start" }}
                >
                  {HUB_SKILLS.map((s) => (
                    <HubCard key={s.title} icon={s.icon} iconBg={s.iconBg} title={s.title} desc={s.desc} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
