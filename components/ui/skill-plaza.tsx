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
const BUILTIN_EXPERTS = new Set(["数据工程专家", "数据分析专家", "智能管家"]);

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
export type SkillDetail = { title: string; desc: string; category: string; version: string; author: string };

export function SkillDetailModal({ detail, onClose }: { detail: SkillDetail; onClose: () => void }) {
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

// ── 胶囊 Tab 组件（Figma 767_17327）─────────────────────────
// 白色指示器跨 tab 滑动 + 双层文字（normal / semibold）交叉淡入。
// 默认 layoutId 为 `pill-tabs-indicator`，多实例并存时通过 layoutId prop 区分。
export interface PillTabItem<Id extends string = string> {
  id: Id;
  label: string;
}

export function PillTabs<Id extends string = string>({
  tabs,
  activeId,
  onChange,
  layoutId = "pill-tabs-indicator",
  size = "md",
}: {
  tabs: ReadonlyArray<PillTabItem<Id>>;
  activeId: Id;
  onChange: (id: Id) => void;
  /** 多实例并存时显式区分，避免 framer-motion layoutId 冲突 */
  layoutId?: string;
  /** md（默认 44/40，padding 16）/ sm（32/28，padding 12） */
  size?: "md" | "sm";
}) {
  const outerH = size === "sm" ? 32 : 44;
  const innerH = size === "sm" ? 28 : 40;
  const padX = size === "sm" ? 12 : 16;
  const fontSize = size === "sm" ? 13 : 14;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      height: outerH, padding: 2,
      borderRadius: 100,
      background: "#F2F4F8",
      boxShadow: "inset 0 2px 2px rgba(0,0,0,0.03)",
      position: "relative",
    }}>
      {tabs.map((tab) => {
        const selected = activeId === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              position: "relative",
              height: innerH, padding: `0 ${padX}px`,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 100,
              cursor: "pointer",
              zIndex: 1,
            }}
          >
            {selected && (
              <motion.div
                layoutId={layoutId}
                style={{
                  position: "absolute", inset: 0,
                  borderRadius: 100,
                  background: "rgba(255,255,255,0.90)",
                  boxShadow: "0 6px 12px -6px rgba(0,0,0,0.04), 0 3px 6px -3px rgba(0,0,0,0.08)",
                  zIndex: 0,
                }}
                transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.9 }}
              />
            )}
            <span style={{
              position: "relative", zIndex: 1,
              display: "inline-grid",
              gridTemplateAreas: "\"stack\"",
              placeItems: "center",
              whiteSpace: "nowrap",
            }}>
              <span style={{
                gridArea: "stack",
                fontFamily: FONT, fontSize, fontWeight: 400,
                color: "rgba(0,0,0,0.70)",
                opacity: selected ? 0 : 1,
                textAlign: "center",
                transition: "opacity 180ms ease",
              }}>{tab.label}</span>
              <span style={{
                gridArea: "stack",
                fontFamily: FONT, fontSize, fontWeight: 600,
                color: "#000000",
                opacity: selected ? 1 : 0,
                textAlign: "center",
                transition: "opacity 180ms ease",
              }}>{tab.label}</span>
            </span>
          </div>
        );
      })}
    </div>
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

// ── Empty state（图 + 文字垂直居中） ────────────────────────
function EmptyState({ text }: { text: string }) {
  return (
    <div style={{
      width: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "60px 0", gap: 12,
    }}>
      <img
        src={encodeURI("/icons/暂无数据.png")}
        alt=""
        style={{ width: 160, height: 160, objectFit: "contain", opacity: 0.9 }}
      />
      <span style={{
        fontFamily: FONT, fontSize: 14, fontWeight: 400,
        color: "rgba(0,0,0,0.45)",
      }}>
        {text}
      </span>
    </div>
  );
}

// ── Skill card ────────────────────────────────────────────────
function SkillCard({ title, desc, onCardClick, sourceTag, onUninstall }: {
  icon?: string;
  iconBg?: string;
  title: string;
  desc: string;
  defaultTag?: boolean;
  onCardClick?: () => void;
  /** 来源标签（如"内置 Skill" / "SkillHub"），跟随标题显示 */
  sourceTag?: string;
  /** 卸载回调；传入则 hover 显示"卸载"按钮，点击进入 loading，结束后调用 */
  onUninstall?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [uninstalling, setUninstalling] = useState(false);

  const handleUninstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (uninstalling) return;
    setUninstalling(true);
    setTimeout(() => {
      // 由父级把数据移回可安装区；本卡片随即被卸载
      onUninstall?.();
      // 防御：极端情况下卡片仍存在则恢复
      setUninstalling(false);
    }, 1200);
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
        boxShadow: hovered ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <span style={{
              fontFamily: FONT, fontSize: 16, fontWeight: 500, color: C.textPrimary,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0,
            }}>{title}</span>
            {sourceTag && (
              <span style={{
                flexShrink: 0,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                height: 20, padding: "0 8px", borderRadius: 9999,
                background: sourceTag === "内置 Skill" ? "#E3ECFF"
                  : sourceTag === "SkillHub" ? "#F2F4F8"
                  : sourceTag === "任务中补齐" ? "#FFF1E0"
                  : "#F2F4F8",
                fontFamily: FONT, fontSize: 12, fontWeight: 400,
                color: sourceTag === "内置 Skill" ? "#0052D9"
                  : sourceTag === "SkillHub" ? "rgba(0,0,0,0.7)"
                  : sourceTag === "任务中补齐" ? "#B86A00"
                  : "rgba(0,0,0,0.7)",
                lineHeight: "20px", whiteSpace: "nowrap",
              }}>{sourceTag}</span>
            )}
          </div>
          <div className="skill-card-desc" style={{
            marginTop: 4, fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textTertiary, lineHeight: "20px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {desc}
          </div>
        </div>
        {/* 右侧操作区：仅当传入 onUninstall 时 hover 显示「卸载」按钮，点击后进入 loading */}
        {onUninstall && (
          <div style={{
            flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "flex-end",
            opacity: uninstalling || hovered ? 1 : 0,
            pointerEvents: uninstalling || hovered ? "auto" : "none",
            maxWidth: uninstalling || hovered ? 100 : 0,
            overflow: "hidden",
            transition: "opacity 150ms, max-width 180ms ease",
          }}>
            {uninstalling ? (
              <div style={{ width: 68, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <style>{`@keyframes hub-spin { to { transform: rotate(360deg); } }`}</style>
                <svg width="20" height="20" viewBox="0 0 20 20" style={{ animation: "hub-spin 0.8s linear infinite" }}>
                  <circle cx="10" cy="10" r="8" stroke="rgba(0,0,0,0.15)" strokeWidth="2.5" fill="none" />
                  <path d="M10 2a8 8 0 0 1 8 8" stroke="rgba(0,0,0,0.7)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            ) : (
              <button
                onClick={handleUninstall}
                style={{
                  height: 32, padding: "0 20px", borderRadius: 100,
                  border: `1px solid ${C.border}`,
                  background: C.bgWhite,
                  fontFamily: FONT, fontSize: 14, fontWeight: 500,
                  color: C.textPrimary,
                  cursor: "pointer", outline: "none",
                }}
              >
                卸载
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Hub skill card (install: hover→button→loading→success toggle / fail toast→idle) ─
function HubCard({ title, desc, willSucceed, onCardClick, onInstallResult, sourceTag }: {
  icon?: string; iconBg?: string; title: string; desc: string;
  willSucceed?: boolean;
  onCardClick?: () => void;
  onInstallResult?: (success: boolean) => void;
  /** 来源标签（如"内置 Skill" / "SkillHub"），跟随标题显示 */
  sourceTag?: string;
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <span style={{
              fontFamily: FONT, fontSize: 16, fontWeight: 500, color: C.textPrimary,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0,
            }}>{title}</span>
            {sourceTag && (
              <span style={{
                flexShrink: 0,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                height: 20, padding: "0 8px", borderRadius: 9999,
                background: sourceTag === "内置 Skill" ? "#E3ECFF"
                  : sourceTag === "SkillHub" ? "#F2F4F8"
                  : sourceTag === "任务中补齐" ? "#FFF1E0"
                  : "#F2F4F8",
                fontFamily: FONT, fontSize: 12, fontWeight: 400,
                color: sourceTag === "内置 Skill" ? "#0052D9"
                  : sourceTag === "SkillHub" ? "rgba(0,0,0,0.7)"
                  : sourceTag === "任务中补齐" ? "#B86A00"
                  : "rgba(0,0,0,0.7)",
                lineHeight: "20px", whiteSpace: "nowrap",
              }}>{sourceTag}</span>
            )}
          </div>
          <div className="skill-card-desc" style={{ marginTop: 4, fontFamily: FONT, fontSize: 14, fontWeight: 400, color: C.textTertiary, lineHeight: "20px",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {desc}
          </div>
        </div>
        {/* Right action area：默认不占宽度；loading 常显；installed/idle 在 hover 时显示 */}
        <div style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          opacity: installState === "loading" || hovered ? 1 : 0,
          pointerEvents: installState === "loading" || hovered ? "auto" : "none",
          maxWidth: installState === "loading" || hovered ? 160 : 0,
          overflow: "hidden",
          transition: "opacity 150ms, max-width 180ms ease",
        }}>
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
  /** 锁定到指定 Agent（按 shortTitle / 自定义 Agent name 匹配）：隐藏左侧分类列、不可切换。
   *  用于「Agent 详情页 → 配置 Skill」入口的弹窗复用场景。 */
  lockedAgentName?: string;
}

export default function SkillPlaza({ onBack, registry, lockedAgentName }: SkillPlazaProps) {
  // ── 内置专家：固定来自 registry.experts（shortTitle） ──
  const builtinExperts = useMemo(
    () => registry?.experts.map((e) => e.shortTitle) ?? ["数据工程专家", "数据分析专家", "智能管家"],
    [registry?.experts]
  );
  // 自定义分身：来自 registry.avatars（id + name，允许同名）
  const customAgents = useMemo(
    () => registry?.avatars.map((a) => ({ id: a.id, name: a.name })) ?? [],
    [registry?.avatars]
  );
  // 是否为内置专家（内置专家才有预置 Skill tab）
  const isBuiltinCat = useCallback((cat: string) => builtinExperts.includes(cat), [builtinExperts]);

  const [activeCat, setActiveCat] = useState(lockedAgentName ?? builtinExperts[0] ?? "");
  const [activeTab, setActiveTab] = useState<"preset" | "hub">("preset");
  const [toggleState, setToggleState] = useState<Record<string, boolean>>({});
  const [installedExpanded, setInstalledExpanded] = useState(false);
  const [installedList, setInstalledList] = useState(INSTALLED_HUB_SKILLS.map((s) => s.title));
  const [availableList, setAvailableList] = useState(HUB_SKILLS.map((s) => s.title));
  // 从「已安装区」卸载下来的 hub skill 元数据池（来自 INSTALLED_HUB_SKILLS 但不在 HUB_SKILLS 中的项）
  // 卸载后追加进此池，HUB_SKILLS 渲染时与之合并，实现"卸载后重新出现在 SkillHub 可安装区"
  const [extraHubSkills, setExtraHubSkills] = useState<typeof HUB_SKILLS>([]);
  // 自定义 Agent 「已安装」的内置 skill：{ [avatarId]: Set<skillName> }
  // 初始化：全部默认未安装（与 SkillHub 展示一致，需用户在"内置 Skill" tab 手动安装）
  const [customInstalledSkills, setCustomInstalledSkills] = useState<Record<string, Set<string>>>(() => {
    const m: Record<string, Set<string>> = {};
    registry?.avatars.forEach((a) => {
      m[a.id] = new Set<string>();
    });
    return m;
  });

  // 当 registry.avatars 新增 Agent 时，补齐初始空集合
  useEffect(() => {
    setCustomInstalledSkills((prev) => {
      let changed = false;
      const next = { ...prev };
      registry?.avatars.forEach((a) => {
        if (!(a.id in next)) {
          next[a.id] = new Set<string>();
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [registry?.avatars]);

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

  // 合并 HUB pool：原 HUB_SKILLS + 从已安装区卸载下来的 INSTALLED_HUB_SKILLS 项
  const allHubSkills = useMemo(() => [...HUB_SKILLS, ...extraHubSkills], [extraHubSkills]);

  // 卸载 hub skill：从 installedList 移除 + 加回 availableList
  // 若属于 INSTALLED_HUB_SKILLS（不在 HUB_SKILLS 中），则把其元数据加入 extraHubSkills 池
  const uninstallHubSkill = useCallback((title: string) => {
    setInstalledList((prev) => prev.filter((t) => t !== title));
    setAvailableList((prev) => (prev.includes(title) ? prev : [...prev, title]));
    const inOriginalHub = HUB_SKILLS.some((s) => s.title === title);
    if (!inOriginalHub) {
      const src = INSTALLED_HUB_SKILLS.find((s) => s.title === title);
      if (src) {
        setExtraHubSkills((prev) => prev.some((s) => s.title === title) ? prev : [
          ...prev,
          {
            icon: "S",
            iconBg: "#3BAFB9",
            title: src.title,
            desc: src.desc,
            category: src.category,
            version: src.version,
            author: src.author,
            willSucceed: true,
          },
        ]);
      }
    }
    showToast("Skill 卸载成功", "success");
  }, [showToast]);

  // 是否为内置专家（内置专家才有预置 Skill tab）
  const isBuiltin = isBuiltinCat(activeCat);

  // 切换分类时：
  //  - 内置专家 / 自定义 Agent → 默认选中「预置 Skill」tab
  const handleCatChange = (cat: string) => {
    setActiveCat(cat);
    setSearchKeyword("");
    setActiveTab("preset");
  };

  // 当 registry 变动导致当前 activeCat 失效（例如被删除），自动回退到第一个可用分类。
  // 锁定模式下：始终保持 activeCat = lockedAgentName，不切换。
  useEffect(() => {
    if (lockedAgentName) {
      if (activeCat !== lockedAgentName) {
        setActiveCat(lockedAgentName);
        setActiveTab("preset");
      }
      return;
    }
    const allCats = [...builtinExperts, ...customAgents.map((a) => a.name)];
    if (allCats.length > 0 && !allCats.includes(activeCat)) {
      const next = builtinExperts[0] ?? customAgents[0]?.name;
      if (next) {
        setActiveCat(next);
        setActiveTab("preset");
      }
    }
  }, [builtinExperts, customAgents, activeCat, lockedAgentName]);

  // 按分类定义不同的技能（含详情弹窗需要的 category/version/author）
  // 与档案（agent-detail.tsx PROFILE_DEV/ANALYSIS/OPS）保持一致：内容、版本、来源完全同步
  // tag: builtin → "内置 Skill" 蓝；skillhub → "SkillHub" 灰；task → "任务中补齐" 橙
  const SKILLS_BY_CAT: Record<string, { icon: string; iconBg: string; title: string; desc: string; tag: "builtin" | "skillhub" | "task"; category: string; version: string; author: string }[]> = {
    "数据工程专家": [
      { icon: "S", iconBg: "#E8524A", title: "Shuffle-Skew-Tuner", desc: "自动定位 Shuffle 倾斜热点 key，给出 cluster by / broadcast 重写方案", tag: "task", category: "性能调优", version: "2.1.0", author: "Rigel · 任务沉淀" },
      { icon: "A", iconBg: "#3BAFB9", title: "Auto-DWH-Modeler", desc: "基于业务需求自动生成维度/事实模型 DDL，输出建表脚本", tag: "builtin", category: "数仓建模", version: "1.4.2", author: "WeData Team" },
      { icon: "S", iconBg: "#4C8DEF", title: "Schedule-Composer", desc: "根据上下游依赖自动编排调度 DAG，识别关键路径与资源冲突", tag: "builtin", category: "调度治理", version: "1.6.0", author: "WeData Team" },
      { icon: "Q", iconBg: "#7B68EE", title: "SQL-Profile-Reviewer", desc: "SQL 执行计划 review，给出 PPD / CBO / Hint 改写建议", tag: "skillhub", category: "性能调优", version: "0.9.0", author: "SkillHub · Community" },
      { icon: "L", iconBg: "#FF7800", title: "Lineage-Maintainer", desc: "增量血缘维护，字段级影响分析与口径一致性检查", tag: "skillhub", category: "数据治理", version: "1.0.3", author: "SkillHub · Tencent" },
    ],
    "数据分析专家": [
      { icon: "M", iconBg: "#7B68EE", title: "Metric-NLQ", desc: "自然语言指标取数：理解业务问题，自动生成 SQL + 解释", tag: "builtin", category: "指标洞察", version: "3.0.1", author: "WeData Team" },
      { icon: "A", iconBg: "#3BAFB9", title: "Attribution-Shapley", desc: "多触点归因（Shapley 模型），量化各渠道贡献度", tag: "skillhub", category: "归因分析", version: "1.5.0", author: "SkillHub · Tencent" },
      { icon: "T", iconBg: "#FF7800", title: "Trend-Forecaster", desc: "时间序列趋势预测，含季节性分解与异常检测", tag: "skillhub", category: "趋势预测", version: "2.0.0", author: "SkillHub · Community" },
      { icon: "C", iconBg: "#4C8DEF", title: "Cohort-Retention", desc: "Cohort 留存矩阵 + 分群留存对比", tag: "builtin", category: "用户分析", version: "1.2.0", author: "WeData Team" },
      { icon: "F", iconBg: "#E8524A", title: "Funnel-Analyzer", desc: "漏斗分析：识别核心流失节点 + 自动给出优化假设", tag: "task", category: "用户分析", version: "1.0.5", author: "Vega · 任务沉淀" },
      { icon: "S", iconBg: "#A56EFF", title: "Smart-Dashboard", desc: "基于业务问题自动选图：趋势图 / 占比饼图 / 热力图 / 归因瀑布图", tag: "builtin", category: "可视化", version: "2.1.0", author: "WeData Team" },
      { icon: "A", iconBg: "#E59858", title: "Anomaly-Detector", desc: "指标异常实时检测：多算法融合 + 自动给出根因维度下钻", tag: "skillhub", category: "异常检测", version: "1.3.0", author: "SkillHub · Tencent" },
      { icon: "A", iconBg: "#0CBF5B", title: "AB-Test-Analyzer", desc: "A/B 实验显著性检验，自动输出置信区间与业务建议", tag: "builtin", category: "实验分析", version: "2.0.2", author: "WeData Team" },
      { icon: "S", iconBg: "#E8524A", title: "Segment-Insight", desc: "用户分群洞察：基于行为/属性自动挖掘高价值人群特征", tag: "task", category: "用户分析", version: "1.1.0", author: "Vega · 任务沉淀" },
      { icon: "R", iconBg: "#4C8DEF", title: "Report-Composer", desc: "结论先行式报告自动生成：核心结论 + 同环比 + 风险提示三段式", tag: "builtin", category: "报告生成", version: "1.4.0", author: "WeData Team" },
    ],
    "智能管家": [
      { icon: "I", iconBg: "#E8524A", title: "incident-runbook-v2", desc: "基于历史故障经验沉淀的 runbook，覆盖 OOM、磁盘满、慢查询场景", tag: "task", category: "故障应急", version: "2.1.0", author: "Orion · 任务沉淀" },
      { icon: "C", iconBg: "#3BAFB9", title: "Cluster-Health-Monitor", desc: "集群健康巡检，实时监控 CPU / 内存 / 磁盘 / 网络指标", tag: "builtin", category: "集群运维", version: "1.4.2", author: "WeData Team" },
      { icon: "C", iconBg: "#FF7800", title: "Capacity-Forecaster", desc: "基于历史数据预测集群容量需求，辅助扩缩容决策", tag: "skillhub", category: "容量规划", version: "1.0.3", author: "SkillHub · Tencent" },
      { icon: "S", iconBg: "#4C8DEF", title: "SLA-Sentinel", desc: "实时跟踪关键调度 SLA，超时自动升级与扩容", tag: "builtin", category: "调度运维", version: "2.0.0", author: "WeData Team" },
      { icon: "P", iconBg: "#A56EFF", title: "Presto-Native-Executor", desc: "Presto 原生 C++ 算子加速，3-5x 性能提升", tag: "skillhub", category: "性能调优", version: "0.9.0", author: "SkillHub · Community" },
      { icon: "S", iconBg: "#7B68EE", title: "Slow-Query-Analyzer", desc: "分析慢查询根因，给出执行计划与索引优化建议", tag: "skillhub", category: "性能调优", version: "1.2.0", author: "SkillHub · Community" },
    ],
  };

  // tag → SkillCard sourceTag 文案
  const TAG_TO_SOURCE_TAG: Record<"builtin" | "skillhub" | "task", string> = {
    builtin: "内置 Skill",
    skillhub: "SkillHub",
    task: "任务中补齐",
  };

  const skills = SKILLS_BY_CAT[activeCat] ?? [];

  // 自定义 Agent 的预置 Skill：从 registry.avatars[*].skills 派生；
  // 若该 Agent 自身未配置 skills（新建的自定义 Agent），回退到一组默认 skill 用于展示
  const DEFAULT_AVATAR_SKILLS: { name: string; enabled: boolean }[] = [
    { name: "自然语言取数", enabled: false },
    { name: "智能趋势分析", enabled: false },
    { name: "多维数据洞察", enabled: false },
    { name: "生成数据报告", enabled: false },
  ];
  const customAvatarSkills = useMemo(() => {
    const av = registry?.avatars.find((a) => a.name === activeCat);
    if (!av) return [] as { title: string; desc: string; enabled: boolean }[];
    const source = av.skills.length > 0 ? av.skills : DEFAULT_AVATAR_SKILLS;
    return source.map((s) => ({
      title: s.name,
      desc: `${av.name}的自定义技能`,
      enabled: s.enabled,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registry?.avatars, activeCat]);

  // 当前选中的自定义 Agent（用于 id）
  const currentAvatar = useMemo(
    () => registry?.avatars.find((a) => a.name === activeCat),
    [registry?.avatars, activeCat]
  );
  const currentAvatarInstalled = currentAvatar ? (customInstalledSkills[currentAvatar.id] ?? new Set<string>()) : new Set<string>();
  // 「内置 Skill」tab 列表 = 该 Agent 所有 skill 中、尚未安装的
  const customUninstalledSkills = useMemo(
    () => customAvatarSkills.filter((s) => !currentAvatarInstalled.has(s.title)),
    [customAvatarSkills, currentAvatarInstalled]
  );
  // 「已安装 Skill」里属于当前 Agent 的内置 skill
  const currentAvatarInstalledList = useMemo(
    () => customAvatarSkills.filter((s) => currentAvatarInstalled.has(s.title)),
    [customAvatarSkills, currentAvatarInstalled]
  );

  // 搜索过滤
  const kw = searchKeyword.trim().toLowerCase();
  const filteredSkills = kw ? skills.filter((s) => s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw)) : skills;
  const filteredCustomSkills = kw
    ? customAvatarSkills.filter((s) => s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw))
    : customAvatarSkills;
  const filteredHubSkills = kw ? HUB_SKILLS.filter((s) => s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw)) : HUB_SKILLS;
  // 详情页锁定模式下，大数据 Agent 与自定义 Agent 使用同一套「配置 Skill」内容结构。
  const useConfigLayout = !isBuiltin || Boolean(lockedAgentName);
  const lockedBuiltinInstalledSkills = lockedAgentName && isBuiltin ? filteredSkills : [];
  // 「已安装」数量：搜索时显示搜索命中的已安装数量；否则显示完整已安装数量
  const installedCount = (() => {
    if (lockedAgentName && isBuiltin) {
      // 锁定大数据 Agent：filteredSkills 已经按 kw 过滤
      return filteredSkills.length;
    }
    if (!kw) {
      return currentAvatarInstalledList.length + installedList.length;
    }
    // 搜索状态：统计过滤后的已安装项
    const hit = (s: { title: string; desc: string }) => s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw);
    const customInstalledHits = currentAvatar ? currentAvatarInstalledList.filter(hit).length : 0;
    const installedHubHits = INSTALLED_HUB_SKILLS.filter((s) => installedList.includes(s.title)).filter(hit).length;
    const newInstalledHits = HUB_SKILLS
      .filter((s) => installedList.includes(s.title) && !INSTALLED_HUB_SKILLS.some((i) => i.title === s.title))
      .filter(hit).length;
    return customInstalledHits + installedHubHits + newInstalledHits;
  })();
  const presetInstallableSkills = lockedAgentName && isBuiltin ? [] : customUninstalledSkills;

  // Tab 列表：内置专家隐藏整条 tab 栏；自定义 Agent 显示双 tab
  const tabs = [
    { id: "preset" as const, label: "预置 Skill" },
    { id: "hub" as const, label: "SkillHub" },
  ];

  return (
    <div
      className={lockedAgentName ? "skill-plaza-locked" : undefined}
      style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        fontFamily: FONT, background: lockedAgentName ? C.bgWhite : C.bg,
      }}
    >
      {/* 响应式卡片栅格：<1440 → 2 列；1440-1920 → 3 列；≥1920 → 4 列 */}
      {/* 配置 Skill 弹窗（lockedAgentName）固定 3 列，匹配设计稿 1200 宽容器 */}
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
        .skill-plaza-locked .skill-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
        .skill-plaza-locked .skill-card-desc {
          white-space: normal !important;
          overflow: visible !important;
          text-overflow: clip !important;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
      {/* 顶部标题栏 */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        ...(lockedAgentName
          ? { padding: "24px 24px 0 24px" }
          : { height: 50, padding: "0 24px", borderBottom: `1px solid ${C.border}` }),
        background: lockedAgentName ? C.bgWhite : C.bg,
      }}>
        <span style={{
          fontSize: lockedAgentName ? 16 : 18,
          fontWeight: lockedAgentName ? 500 : 600,
          color: C.textPrimary,
        }}>
          {lockedAgentName ? "配置 Skill" : "技能广场"}
        </span>
        {/* 锁定模式（详情页弹窗）下显示关闭按钮 */}
        {lockedAgentName && onBack && (
          <div
            onClick={onBack}
            aria-label="关闭"
            style={{
              width: 28, height: 28, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0, transition: "background 100ms",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* 左侧分类导航 —— 锁定模式（详情页弹窗）下隐藏 */}
        {!lockedAgentName && (
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
        )}

        {/* 右侧内容 */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", minWidth: 0,
          // 锁定模式（配置 Skill 弹窗）按设计稿：padding 24px 24px 0 24px + gap 24px
          ...(lockedAgentName ? { padding: "24px 24px 0 24px", gap: 24 } : null),
        }}>
          {/* 详情页标题：锁定模式（内置/自定义统一）→ "已安装 (N)" + 搜索框；非锁定模式保持原有 */}
          <div style={{
            flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 16,
            ...(lockedAgentName ? null : { height: 56, padding: "0 24px" }),
          }}>
            {lockedAgentName ? (
              <span style={{
                fontFamily: FONT, fontSize: 14, fontWeight: 500,
                color: "rgba(0,0,0,0.7)", lineHeight: "22px",
              }}>
                {`已安装 (${installedCount})`}
              </span>
            ) : (
              <span style={{
                fontFamily: FONT, fontSize: 14, fontWeight: 600,
                color: C.textPrimary,
              }}>
                {isBuiltin
                  ? `内置 Skill（${filteredSkills.length}）`
                  : `已安装 Skill（${currentAvatarInstalledList.length + installedList.length}）`}
              </span>
            )}
            {(!isBuiltin || lockedAgentName) && (
              <div style={{
                position: "relative",
                width: 240, height: 32,
                display: "flex", alignItems: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                  style={{ position: "absolute", left: 10, pointerEvents: "none" }}>
                  <circle cx="6" cy="6" r="4.5" stroke="rgba(0,0,0,0.45)" strokeWidth="1.3" fill="none" />
                  <path d="M9.5 9.5L12.5 12.5" stroke="rgba(0,0,0,0.45)" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索 Skill 名称或描述"
                  style={{
                    width: "100%", height: 32,
                    padding: "0 32px 0 30px",
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.bgWhite,
                    fontFamily: FONT, fontSize: 13, fontWeight: 400,
                    color: C.textPrimary, outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 120ms",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.brandCyan; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
                />
                {searchKeyword && (
                  <div
                    onClick={() => setSearchKeyword("")}
                    style={{
                      position: "absolute", right: 8, width: 18, height: 18,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", borderRadius: 4,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 1l8 8M9 1L1 9" stroke="rgba(0,0,0,0.5)" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 技能卡片 */}
          <div style={{
            flex: 1, overflowY: "auto",
            // 非锁定模式保留原 padding；锁定模式由外层 padding(24) 提供
            ...(lockedAgentName ? { paddingBottom: 24 } : { padding: "0 24px 24px" }),
            scrollbarWidth: "none", position: "relative",
          }}>
            <AnimatePresence mode="wait">
              {!useConfigLayout ? (
                filteredSkills.length > 0 ? (
                  <motion.div
                    key={`preset-${activeCat}-${kw}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="skill-grid"
                  >
                    {filteredSkills.map((s) => (
                      <SkillCard
                        key={`${activeCat}-${s.title}`}
                        icon={s.icon} iconBg={s.iconBg}
                        title={s.title} desc={s.desc}
                        sourceTag={TAG_TO_SOURCE_TAG[s.tag]}
                        onCardClick={() => setDetailSkill({ title: s.title, desc: s.desc, category: s.category, version: s.version, author: s.author })}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`preset-empty-${activeCat}-${kw}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: EASE }}
                  >
                    <EmptyState text="未找到匹配的 Skill" />
                  </motion.div>
                )
              ) : (
                <motion.div
                  key={`hub-${kw}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  style={{ display: "flex", flexDirection: "column", gap: 0, paddingTop: 0, marginTop: 0, flex: 1, minHeight: 0 }}
                >
                  {(() => {
                    if (!kw) return null;
                    const hit = (s: { title: string; desc: string }) => s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw);
                    const installedHits =
                      lockedBuiltinInstalledSkills.filter(hit).length +
                      (currentAvatar ? currentAvatarInstalledList.filter(hit).length : 0) +
                      INSTALLED_HUB_SKILLS.filter((s) => installedList.includes(s.title)).filter(hit).length +
                      HUB_SKILLS.filter((s) => installedList.includes(s.title) && !INSTALLED_HUB_SKILLS.some((i) => i.title === s.title)).filter(hit).length;
                    const installableHits =
                      presetInstallableSkills.filter(hit).length +
                      HUB_SKILLS.filter((s) => availableList.includes(s.title) && !installedList.includes(s.title)).filter(hit).length;
                    if (installedHits + installableHits > 0) return null;
                    return (
                      <div style={{
                        position: "absolute",
                        left: lockedAgentName ? 0 : 24,
                        right: lockedAgentName ? 0 : 24,
                        top: 0, bottom: lockedAgentName ? 0 : 24,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <EmptyState text="未找到匹配的 Skill" />
                      </div>
                    );
                  })()}
                  {(() => {
                    if (!kw) return false;
                    const hit = (s: { title: string; desc: string }) => s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw);
                    const installedHits =
                      lockedBuiltinInstalledSkills.filter(hit).length +
                      (currentAvatar ? currentAvatarInstalledList.filter(hit).length : 0) +
                      INSTALLED_HUB_SKILLS.filter((s) => installedList.includes(s.title)).filter(hit).length +
                      HUB_SKILLS.filter((s) => installedList.includes(s.title) && !INSTALLED_HUB_SKILLS.some((i) => i.title === s.title)).filter(hit).length;
                    const installableHits =
                      presetInstallableSkills.filter(hit).length +
                      HUB_SKILLS.filter((s) => availableList.includes(s.title) && !installedList.includes(s.title)).filter(hit).length;
                    return installedHits + installableHits === 0;
                  })() ? null : (<>
                  {/* ── 已安装区域（统一合并 4 个来源后按 6 张折叠） ── */}
                  {(() => {
                    type InstalledItem = {
                      key: string;
                      title: string;
                      desc: string;
                      sourceTag: "内置 Skill" | "SkillHub" | "任务中补齐";
                      onCardClick: () => void;
                      /** 仅 SkillHub 项可卸载 */
                      onUninstall?: () => void;
                    };
                    const items: InstalledItem[] = [];

                    // 1) 锁定的大数据 Agent 已安装的内置 skill（档案数据，不可卸载）
                    lockedBuiltinInstalledSkills.forEach((s) => {
                      const key = `locked-builtin-installed-${activeCat}-${s.title}`;
                      items.push({
                        key,
                        title: s.title,
                        desc: s.desc,
                        sourceTag: TAG_TO_SOURCE_TAG[s.tag] as "内置 Skill" | "SkillHub" | "任务中补齐",
                        onCardClick: () => setDetailSkill({ title: s.title, desc: s.desc, category: s.category, version: s.version, author: s.author }),
                      });
                    });

                    // 2) 当前自定义 Agent 已安装的内置 skill（档案数据，不可卸载）
                    if (currentAvatar) {
                      currentAvatarInstalledList
                        .filter((s) => !kw || s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw))
                        .forEach((s) => {
                          const key = `custom-installed-${currentAvatar.id}-${s.title}`;
                          items.push({
                            key,
                            title: s.title,
                            desc: s.desc,
                            sourceTag: "内置 Skill",
                            onCardClick: () => setDetailSkill({ title: s.title, desc: s.desc, category: "自定义", version: "1.0.0", author: activeCat }),
                          });
                        });
                    }

                    // 3) 预置 INSTALLED_HUB_SKILLS（前 2 个标"内置 Skill" 不可卸载；其余 SkillHub 可卸载）
                    // 注：锁定的内置专家（如 Vega）只展示档案数据，跳过通用 hub skills
                    if (!(lockedAgentName && isBuiltin)) {
                      INSTALLED_HUB_SKILLS
                        .filter((s) => installedList.includes(s.title))
                        .filter((s) => !kw || s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw))
                        .forEach((s, i) => {
                          const isBuiltinTag = i < 2;
                          items.push({
                            key: `installed-${s.title}`,
                            title: s.title,
                            desc: s.desc,
                            sourceTag: isBuiltinTag ? "内置 Skill" : "SkillHub",
                            onCardClick: () => setDetailSkill({ title: s.title, desc: s.desc, category: s.category, version: s.version, author: s.author }),
                            onUninstall: isBuiltinTag ? undefined : () => uninstallHubSkill(s.title),
                          });
                        });

                      // 4) 新安装的 SkillHub skill（可卸载）
                      HUB_SKILLS
                        .filter((s) => installedList.includes(s.title) && !INSTALLED_HUB_SKILLS.some((i) => i.title === s.title))
                        .filter((s) => !kw || s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw))
                        .forEach((s) => {
                          items.push({
                            key: `new-installed-${s.title}`,
                            title: s.title,
                            desc: s.desc,
                            sourceTag: "SkillHub",
                            onCardClick: () => setDetailSkill({ title: s.title, desc: s.desc, category: s.category, version: s.version, author: s.author }),
                            onUninstall: () => uninstallHubSkill(s.title),
                          });
                        });
                    }

                    const visible = installedExpanded || kw ? items : items.slice(0, INSTALLED_COLLAPSE_COUNT);
                    const showToggleMore = !kw && items.length > INSTALLED_COLLAPSE_COUNT;

                    return (
                      <>
                        <div className="skill-grid">
                          {visible.map((it) => (
                            <SkillCard
                              key={it.key}
                              title={it.title}
                              desc={it.desc}
                              sourceTag={it.sourceTag}
                              onCardClick={it.onCardClick}
                              onUninstall={it.onUninstall}
                            />
                          ))}
                        </div>
                        {/* 展开更多（搜索时隐藏） */}
                        {showToggleMore && (
                          <div
                            onClick={() => setInstalledExpanded((v) => !v)}
                            style={{ textAlign: "center", padding: "12px 0 4px", cursor: "pointer" }}
                          >
                            <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, color: "rgba(0,0,0,0.4)" }}>
                              {installedExpanded ? "收起" : "显示更多"}
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* ── 分割线（配置 Skill 弹窗下不展示，按设计稿） ── */}
                  {!lockedAgentName && (
                    <div style={{ height: 1, background: C.border, margin: "16px 0" }} />
                  )}
                  {lockedAgentName && <div style={{ height: 24, flexShrink: 0 }} />}

                  {/* ── 可安装区域：搜索时展示"为你找到 N 个结果"+合并列表；否则展示 Tab + 对应列表 ── */}
                  {kw ? (() => {
                    const hitCustomUninstalled = presetInstallableSkills
                      .filter((s) => s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw));
                    const hitHubUninstalled = allHubSkills
                      .filter((s) => availableList.includes(s.title) && !installedList.includes(s.title))
                      .filter((s) => s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw));
                    const totalHits = hitCustomUninstalled.length + hitHubUninstalled.length;
                    return (
                      <>
                        <div style={{
                          marginBottom: 12,
                          fontFamily: FONT, fontSize: 14, fontWeight: 400,
                          color: C.textSecondary,
                        }}>
                          为你找到 <span style={{ fontWeight: 600, color: C.textPrimary }}>{totalHits}</span> 个结果
                        </div>
                        {totalHits > 0 ? (
                          <div className="skill-grid">
                            {hitCustomUninstalled.map((s) => (
                              <HubCard
                                key={`search-custom-uninstalled-${s.title}`}
                                title={s.title} desc={s.desc}
                                sourceTag="内置 Skill"
                                willSucceed={true}
                                onCardClick={() => setDetailSkill({ title: s.title, desc: s.desc, category: "自定义", version: "1.0.0", author: activeCat })}
                                onInstallResult={(ok) => {
                                  if (ok && currentAvatar) {
                                    setCustomInstalledSkills((prev) => {
                                      const next = { ...prev };
                                      const set = new Set(next[currentAvatar.id] ?? []);
                                      set.add(s.title);
                                      next[currentAvatar.id] = set;
                                      return next;
                                    });
                                    setToggleState((p) => ({ ...p, [`custom-installed-${currentAvatar.id}-${s.title}`]: true }));
                                    showToast("Skill 安装成功", "success");
                                  } else {
                                    showToast("Skill 安装失败", "error");
                                  }
                                }}
                              />
                            ))}
                            {hitHubUninstalled.map((s) => (
                              <HubCard
                                key={`search-hub-uninstalled-${s.title}`}
                                icon={s.icon} iconBg={s.iconBg}
                                title={s.title} desc={s.desc}
                                sourceTag="SkillHub"
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
                            ))}
                          </div>
                        ) : (
                          <EmptyState text="未找到匹配的 Skill" />
                        )}
                      </>
                    );
                  })() : (<>
                  {/* ── 可安装区域：Tab（内置 Skill / SkillHub）+ 查看更多链接 ── */}
                  <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <PillTabs
                      tabs={[
                        { id: "preset", label: "内置 Skill" },
                        { id: "hub", label: "SkillHub" },
                      ] as const}
                      activeId={activeTab}
                      onChange={(id) => setActiveTab(id as "preset" | "hub")}
                      layoutId="skill-tab-indicator"
                    />
                    {activeTab === "hub" && (
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
                    )}
                  </div>
                  {activeTab === "preset" ? (
                    /* 内置 Skill：展示尚未安装的 skill（HubCard 样式，含安装按钮） */
                    presetInstallableSkills.length > 0 ? (
                      <div className="skill-grid">
                        {presetInstallableSkills.map((s) => (
                          <HubCard
                            key={`${activeCat}-preset-${s.title}`}
                            title={s.title} desc={s.desc}
                            willSucceed={true}
                            onCardClick={() => setDetailSkill({ title: s.title, desc: s.desc, category: "自定义", version: "1.0.0", author: activeCat })}
                            onInstallResult={(ok) => {
                              if (ok && currentAvatar) {
                                setCustomInstalledSkills((prev) => {
                                  const next = { ...prev };
                                  const set = new Set(next[currentAvatar.id] ?? []);
                                  set.add(s.title);
                                  next[currentAvatar.id] = set;
                                  return next;
                                });
                                // 新安装的 skill 默认打开
                                setToggleState((p) => ({ ...p, [`custom-installed-${currentAvatar.id}-${s.title}`]: true }));
                                showToast("Skill 安装成功", "success");
                              } else {
                                showToast("Skill 安装失败", "error");
                              }
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState text="暂无可安装的内置 Skill" />
                    )
                  ) : (
                    /* SkillHub：原可安装 HubCard 列表 */
                    (() => {
                      const avail = allHubSkills.filter((s) => availableList.includes(s.title) && !installedList.includes(s.title));
                      return avail.length > 0 ? (
                        <div className="skill-grid">
                          {avail.map((s) => (
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
                          ))}
                        </div>
                      ) : (
                        <EmptyState text="暂无可安装的 Skill" />
                      );
                    })()
                  )}
                  </>)}
                  </>)}
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
