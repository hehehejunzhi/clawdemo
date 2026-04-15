"use client";

import React, { useState } from "react";
import {
  Check,
  Sparkles,
  Hourglass,
  CircleAlert,
  CircleX,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { MorphingSquare } from "@/components/ui/morphing-square";

// ── Design tokens (直接来自 Figma) ─────────────────────────────
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const DUR = { micro: 0.1, normal: 0.2, macro: 0.35 } as const;

const T = {
  primary:   "rgba(0,0,0,0.9)",
  secondary: "rgba(0,0,0,0.7)",
  tertiary:  "rgba(0,0,0,0.5)",
  disabled:  "rgba(0,0,0,0.3)",
  solid:     "#000000",
  blue:      "#1664FF",
  green:     "#00B96B",
  orange:    "#FA8C16",
  red:       "#F5222D",
} as const;

// ── Types ──────────────────────────────────────────────────────
interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
  tools?: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  elapsedLabel?: string;          // e.g. "00:24 正在数据加工、聚合逻辑"
  dependencies: string[];
  subtasks: Subtask[];
}

// ── Demo data ──────────────────────────────────────────────────
const initialTasks: Task[] = [
  {
    id: "1",
    title: "@大数据运维专家 加载 EMR 技能，通过 DescribeSparkQueries 接口检索所有慢 SQL",
    description: "连接广州地域集群 emr-ccrnhw11，检索慢 SQL 列表",
    status: "completed",
    dependencies: [],
    subtasks: [],
  },
  {
    id: "2",
    title: "@大数据开发专家 对检索到的慢 SQL 进行深度调优分析，生成优化方案",
    description: "分析 Top 慢 SQL 的执行计划，定位性能瓶颈",
    status: "in-progress",
    elapsedLabel: "",
    dependencies: ["1"],
    subtasks: [],
  },
  {
    id: "3",
    title: "@大数据开发专家 执行优化方案，通过 RunJobFlow 提交到集群验证",
    description: "将优化后的 SQL 提交到集群执行并验证性能提升",
    status: "pending",
    dependencies: ["2"],
    subtasks: [],
  },
  {
    id: "4",
    title: "@大数据分析专家 获取执行结果，生成性能对比可视化报告",
    description: "对比优化前后的执行时间，输出可视化报告",
    status: "pending",
    dependencies: ["3"],
    subtasks: [],
  },
];

// ── Step icon ──────────────────────────────────────────────────
function StepIcon({ status }: { status: string }) {
  const size = 16;
  const s = { width: size, height: size, flexShrink: 0 } as const;

  if (status === "completed")
    return <Check style={{ ...s, color: T.green, strokeWidth: 2.5 }} />;

  if (status === "in-progress")
    return <MorphingSquare size={size} color={T.solid} duration={2} />;

  if (status === "need-help")
    return <CircleAlert style={{ ...s, color: T.orange }} />;

  if (status === "failed")
    return <CircleX style={{ ...s, color: T.red }} />;

  // pending
  return <Hourglass style={{ ...s, color: T.disabled }} />;
}

// ── Subtask icon (smaller) ─────────────────────────────────────
function SubIcon({ status }: { status: string }) {
  const size = 14;
  const s = { width: size, height: size, flexShrink: 0 } as const;

  if (status === "completed")
    return <Check style={{ ...s, color: T.green, strokeWidth: 2.5 }} />;
  if (status === "in-progress")
    return <MorphingSquare size={size} color={T.solid} duration={2} />;
  if (status === "need-help")
    return <CircleAlert style={{ ...s, color: T.orange }} />;
  if (status === "failed")
    return <CircleX style={{ ...s, color: T.red }} />;
  return <Hourglass style={{ ...s, color: T.disabled }} />;
}

// ── MCP chip ───────────────────────────────────────────────────
function Chip({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "1px 7px",
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 400,
      lineHeight: "20px",
      backgroundColor: "rgba(0,0,0,0.04)",
      color: T.tertiary,
      border: "1px solid rgba(0,0,0,0.08)",
    }}>
      {label}
    </span>
  );
}

// ── Animations ─────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.normal, ease: EASE } },
};

const expandV: Variants = {
  hidden:  { opacity: 0, height: 0 },
  visible: {
    opacity: 1, height: "auto",
    transition: { duration: DUR.normal, ease: EASE, staggerChildren: 0.04, when: "beforeChildren" as const },
  },
  exit: { opacity: 0, height: 0, transition: { duration: DUR.micro, ease: EASE } },
};

const slideIn: Variants = {
  hidden:  { opacity: 0, x: -5 },
  visible: { opacity: 1, x: 0, transition: { duration: DUR.normal, ease: EASE } },
  exit:    { opacity: 0, x: -5, transition: { duration: DUR.micro, ease: EASE } },
};

const swapIcon: Variants = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: DUR.micro } },
  exit:    { opacity: 0, scale: 0.85, transition: { duration: DUR.micro } },
};

// ── Text color per status ──────────────────────────────────────
function taskTextColor(status: string) {
  if (status === "in-progress") return T.solid;
  if (status === "pending")     return T.disabled;
  return T.primary;
}

function taskFontWeight(status: string) {
  return status === "in-progress" ? 500 : 400;
}

// ── Main component ─────────────────────────────────────────────
export default function Plan() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [expandedSubs, setExpandedSubs] = useState<Record<string, boolean>>({});
  const [headerOpen, setHeaderOpen] = useState(true);

  const completedCount = tasks.filter((t) => t.status === "completed").length;

  const toggleExpand = (id: string) =>
    setExpanded((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const toggleSubExpand = (taskId: string, subId: string) => {
    const k = `${taskId}-${subId}`;
    setExpandedSubs((p) => ({ ...p, [k]: !p[k] }));
  };

  const cycleTaskStatus = (taskId: string) => {
    const cycle = ["completed", "in-progress", "pending", "need-help", "failed"] as const;
    setTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t;
      const idx = cycle.indexOf(t.status as typeof cycle[number]);
      const next = cycle[(idx + 1) % cycle.length];
      return {
        ...t,
        status: next,
        subtasks: t.subtasks.map((s) => ({
          ...s,
          status: next === "completed" ? "completed" : s.status,
        })),
      };
    }));
  };

  const toggleSubStatus = (taskId: string, subId: string) => {
    setTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t;
      const subs = t.subtasks.map((s) =>
        s.id === subId
          ? { ...s, status: s.status === "completed" ? "pending" : "completed" }
          : s,
      );
      const allDone = subs.every((s) => s.status === "completed");
      return { ...t, subtasks: subs, status: allDone ? "completed" : t.status };
    }));
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: 880,
      fontFamily: "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { duration: DUR.macro, ease: EASE } }}
        style={{
          borderRadius: 16,
          border: "1.5px solid #E9ECF1",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
        }}
      >

        {/* ── 表头 ── */}
        <div
          onClick={() => setHeaderOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            height: 44,
            padding: "12px 10px 12px 16px",
            backgroundColor: "#F7F8FB",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          {/* Icon + Title */}
          <div style={{ display: "flex", flex: 1, gap: 8, alignItems: "center", minWidth: 0 }}>
            <Sparkles style={{ width: 16, height: 16, color: T.blue, flexShrink: 0 }} />
            <span style={{
              fontSize: 14, fontWeight: 600, lineHeight: "22px", color: T.primary,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              任务执行中...
            </span>
          </div>

          {/* Progress counter */}
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 4, height: 24, padding: "0 6px", borderRadius: 6,
            }}>
              <span style={{ fontSize: 13, fontWeight: 400, lineHeight: "21px", color: T.tertiary, whiteSpace: "nowrap" }}>
                {completedCount}/{tasks.length}
              </span>
              {headerOpen
                ? <ChevronUp  style={{ width: 16, height: 16, color: T.tertiary }} />
                : <ChevronDown style={{ width: 16, height: 16, color: T.tertiary }} />
              }
            </div>
          </div>
        </div>

        {/* ── 进度列表 ── */}
        <AnimatePresence initial={false}>
          {headerOpen && (
            <motion.div
              key="step-list"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={expandV}
              style={{ overflow: "hidden" }}
            >
              <div style={{
                display: "flex", flexDirection: "column", gap: 8,
                padding: "12px 16px",
              }}>
                {tasks.map((task) => {
                  const isExpanded = expanded.includes(task.id);
                  const isActive   = task.status === "in-progress";

                  return (
                    <motion.div key={task.id} variants={fadeUp}>

                      {/* ── Step row ── */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <motion.div
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            borderRadius: 6, padding: "2px 4px 2px 0",
                            cursor: "pointer",
                          }}
                          whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                          transition={{ duration: DUR.micro }}
                          onClick={() => toggleExpand(task.id)}
                        >
                          {/* Status icon — click to cycle */}
                          <motion.span
                            style={{ display: "flex", flexShrink: 0 }}
                            onClick={(e) => { e.stopPropagation(); cycleTaskStatus(task.id); }}
                            whileTap={{ scale: 0.88 }}
                            transition={{ duration: DUR.micro }}
                          >
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={task.status}
                                variants={swapIcon}
                                initial="hidden" animate="visible" exit="exit"
                                style={{ display: "flex" }}
                              >
                                <StepIcon status={task.status} />
                              </motion.span>
                            </AnimatePresence>
                          </motion.span>

                          {/* Step title */}
                          <span style={{
                            flex: 1, minWidth: 0,
                            fontSize: 16,
                            fontWeight: taskFontWeight(task.status),
                            lineHeight: "28px",
                            color: taskTextColor(task.status),
                            textAlign: "justify",
                          }}>
                            {task.title}
                          </span>

                          {/* Subtask chevron — pending 任务不显示 */}
                          {task.subtasks.length > 0 && task.status !== "pending" && (
                            <motion.span
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: DUR.normal, ease: EASE }}
                              style={{ display: "flex", flexShrink: 0 }}
                            >
                              <ChevronDown style={{ width: 14, height: 14, color: T.tertiary }} />
                            </motion.span>
                          )}
                        </motion.div>

                        {/* Active sub-line: elapsed + current action */}
                        <AnimatePresence>
                          {isActive && task.elapsedLabel && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto", transition: { duration: DUR.normal, ease: EASE } }}
                              exit={{ opacity: 0, height: 0, transition: { duration: DUR.micro, ease: EASE } }}
                              style={{ overflow: "hidden", paddingLeft: 24 }}
                            >
                              <span style={{
                                fontSize: 14, fontWeight: 400, lineHeight: "22px", color: T.tertiary,
                                textAlign: "justify",
                              }}>
                                {task.elapsedLabel}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* ── Subtask panel — pending 任务不展开 ── */}
                      <AnimatePresence>
                        {isExpanded && task.subtasks.length > 0 && task.status !== "pending" && (
                          <motion.div
                            variants={expandV}
                            initial="hidden" animate="visible" exit="exit"
                            style={{ overflow: "hidden", position: "relative" }}
                          >
                            {/* vertical guide line */}
                            <div style={{
                              position: "absolute", top: 4, bottom: 4, left: 7,
                              width: 1, backgroundColor: "rgba(0,0,0,0.08)",
                            }} />

                            <div style={{
                              display: "flex", flexDirection: "column", gap: 2,
                              paddingLeft: 20, paddingTop: 4, paddingBottom: 4,
                            }}>
                              {task.subtasks.map((sub) => {
                                const subKey = `${task.id}-${sub.id}`;
                                const subOpen = expandedSubs[subKey];

                                return (
                                  <motion.div
                                    key={sub.id}
                                    variants={slideIn}
                                    style={{ display: "flex", flexDirection: "column" }}
                                  >
                                    <motion.div
                                      style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        padding: "3px 6px 3px 0", borderRadius: 6, cursor: "pointer",
                                      }}
                                      whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                                      transition={{ duration: DUR.micro }}
                                      onClick={() => toggleSubExpand(task.id, sub.id)}
                                    >
                                      <motion.span
                                        style={{ display: "flex", flexShrink: 0 }}
                                        onClick={(e) => { e.stopPropagation(); toggleSubStatus(task.id, sub.id); }}
                                        whileTap={{ scale: 0.88 }}
                                        transition={{ duration: DUR.micro }}
                                      >
                                        <AnimatePresence mode="wait">
                                          <motion.span
                                            key={sub.status}
                                            variants={swapIcon}
                                            initial="hidden" animate="visible" exit="exit"
                                            style={{ display: "flex" }}
                                          >
                                            <SubIcon status={sub.status} />
                                          </motion.span>
                                        </AnimatePresence>
                                      </motion.span>

                                      <span style={{
                                        flex: 1, minWidth: 0,
                                        fontSize: 13, fontWeight: 400, lineHeight: "22px",
                                        color: sub.status === "completed" ? T.tertiary
                                             : sub.status === "pending"   ? T.disabled
                                             : T.secondary,
                                        textDecoration: sub.status === "completed" ? "line-through" : "none",
                                      }}>
                                        {sub.title}
                                      </span>
                                    </motion.div>

                                    {/* Sub detail */}
                                    <AnimatePresence>
                                      {subOpen && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: "auto", transition: { duration: DUR.normal, ease: EASE } }}
                                          exit={{ opacity: 0, height: 0, transition: { duration: DUR.micro, ease: EASE } }}
                                          style={{ overflow: "hidden" }}
                                        >
                                          <div style={{
                                            margin: "2px 0 4px 22px",
                                            paddingLeft: 12,
                                            borderLeft: "1px solid rgba(0,0,0,0.08)",
                                          }}>
                                            <p style={{
                                              fontSize: 12, fontWeight: 400, lineHeight: "20px",
                                              color: T.tertiary, margin: "2px 0 4px",
                                            }}>
                                              {sub.description}
                                            </p>
                                            {sub.tools && sub.tools.length > 0 && (
                                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                                                <span style={{ fontSize: 11, color: T.disabled, alignSelf: "center" }}>MCP</span>
                                                {sub.tools.map((t) => <Chip key={t} label={t} />)}
                                              </div>
                                            )}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
