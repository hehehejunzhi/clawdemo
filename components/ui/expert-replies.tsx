"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const T = {
  primary: "rgba(0,0,0,0.9)",
  secondary: "rgba(0,0,0,0.7)",
  tertiary: "rgba(0,0,0,0.5)",
} as const;

// ── Streaming text effect ─────────────────────────────────────
function StreamText({ text, speed = 30, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const doneRef = React.useRef(false);
  useEffect(() => {
    let i = 0;
    doneRef.current = false;
    setDisplayed("");
    // 每次吐出的字符数根据 speed 动态调整，speed 越小吐得越快
    const charsPerTick = speed <= 15 ? 3 : speed <= 25 ? 2 : 1;
    const interval = Math.max(16, speed); // 至少 16ms（≈60fps）
    const timer = setInterval(() => {
      i += charsPerTick;
      if (i >= text.length) {
        i = text.length;
        setDisplayed(text);
        clearInterval(timer);
        if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
      } else {
        setDisplayed(text.slice(0, i));
      }
    }, interval);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);
  return <>{displayed}</>;
}

// ── Tag pill ──────────────────────────────────────────────────
function TagPill({ label }: { label: string }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      height: 24,
      padding: "0 8px",
      background: "#EDF0F5",
      borderRadius: 40,
      gap: 4,
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: FONT, fontSize: 12, fontWeight: 400,
        color: T.primary, whiteSpace: "nowrap",
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Expert reply block ────────────────────────────────────────
export interface ExpertLine {
  icon?: "arrow" | "check";
  text: string;
  tags?: string[];
}

export interface ExpertReplyData {
  icon: string;
  name: string;
  lines: ExpertLine[];
  delay?: number;
}

interface ExpertReplyProps extends ExpertReplyData {
  instant?: boolean;
  onAllLinesDone?: () => void;
}

function ExpertReply({ icon, name, lines, delay = 0, instant = false, onAllLinesDone }: ExpertReplyProps) {
  const [visible, setVisible] = useState(instant);
  const [visibleLines, setVisibleLines] = useState(instant ? lines.length : 0);

  useEffect(() => {
    if (instant) {
      setVisible(true);
      setVisibleLines(lines.length);
      onAllLinesDone?.();
      return;
    }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, instant, lines.length]);

  const handleLineDone = () => {
    setVisibleLines((v) => {
      const next = v + 1;
      if (next >= lines.length) {
        onAllLinesDone?.();
      }
      return next;
    });
  };

  // Auto-start first line
  useEffect(() => {
    if (!instant && visible && visibleLines === 0) setVisibleLines(1);
  }, [visible, visibleLines, instant]);

  if (!visible) return null;

  return (
    <motion.div
      initial={instant ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: instant ? 0 : 0.4, ease: EASE }}
      style={{ display: "flex", flexDirection: "column", gap: 4 }}
    >
      {/* Expert label */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <img src={icon} alt="" style={{ width: 16, height: 16, flexShrink: 0 }} />
        <span style={{
          fontFamily: FONT, fontSize: 12, fontWeight: 400,
          color: T.tertiary, whiteSpace: "nowrap",
        }}>
          {name}
        </span>
      </div>

      {/* Lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {lines.map((line, i) => {
          if (i >= visibleLines) return null;
          return (
            <motion.div
              key={i}
              initial={instant ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: instant ? 0 : 0.2 }}
            >
              {/* Text line */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ width: 16, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <img src="/icons/expert/24.svg" alt="" style={{ width: 16, height: 16 }} />
                </div>
                <span style={{
                  fontFamily: FONT, fontSize: 16, fontWeight: 400,
                  lineHeight: "28px", color: T.primary,
                  textAlign: "justify",
                }}>
                  {instant ? line.text : (
                    <StreamText
                      text={line.text}
                      speed={25}
                      onDone={i === visibleLines - 1 ? handleLineDone : undefined}
                    />
                  )}
                </span>
              </div>
              {/* Tags */}
              {line.tags && line.tags.length > 0 && (
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 8,
                  paddingLeft: 24, paddingTop: 8, paddingBottom: 4,
                }}>
                  {line.tags.map((tag) => <TagPill key={tag} label={tag} />)}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Dispatch transition text ──────────────────────────────────
function DispatchText({ delay = 0, instant = false }: { delay?: number; instant?: boolean }) {
  const [visible, setVisible] = useState(instant);
  useEffect(() => {
    if (instant) { setVisible(true); return; }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay, instant]);

  if (!visible) return null;

  return (
    <motion.div
      initial={instant ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: instant ? 0 : 0.35, ease: EASE }}
      style={{ display: "flex", alignItems: "center", gap: 0 }}
    >
      <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 400, lineHeight: "28px", color: T.tertiary }}>
        任务已分派，
      </span>
      <div style={{
        display: "inline-flex", alignItems: "center",
        height: 24, background: "#E9ECF1", borderRadius: 100,
        padding: "0 8px 0 4px", margin: "0 4px",
        verticalAlign: "middle",
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/icons/team-badge/2.svg" alt="" style={{ width: 16, height: 16 }} />
          <img src="/icons/team-badge/1.svg" alt="" style={{ width: 16, height: 16, marginLeft: -3.6 }} />
          <img src="/icons/team-badge/3.svg" alt="" style={{ width: 16, height: 16, marginLeft: -3.6 }} />
        </div>
        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 400, color: T.secondary, marginLeft: 2 }}>
          专家团
        </span>
      </div>
      <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 400, lineHeight: "28px", color: T.tertiary }}>
        开始协作执行
      </span>
    </motion.div>
  );
}

// ── Default replies data ──────────────────────────────────────
const DEFAULT_REPLIES: ExpertReplyData[] = [
  {
    icon: "/icons/expert/14.svg",
    name: "数据分析专家",
    delay: 1200,
    lines: [
      { text: "拉取数据表进行结构分析" },
      { text: "权限校验通过，数据合规性审查完成，已生成审计日志。" },
    ],
  },
  {
    icon: "/icons/expert/17.svg",
    name: "数据开发专家",
    delay: 3500,
    lines: [
      {
        text: "检查 HDFS 上该表华东区分区的数据完整性（7/7）",
        tags: ["dw_user_behavior", "ADS_Ad_Placement_Optimization", "DWS_Conversion_Funnel", "ADS_diagnostic_feed", "ADS_Marketing_feed"],
      },
      { text: "已调用\"指标 SQL Copilot\"自动生成聚合 SQL，提交 Spark 计算，分配 8 Executors。" },
    ],
  },
  {
    icon: "/icons/expert/25.svg",
    name: "数据分析专家",
    delay: 6500,
    lines: [
      {
        text: "根据自然语言需求 \"dau_wau_east_7d\" 自动生成聚合 SQL",
        tags: ["ADS_Ad_Placement_Optimization"],
      },
      { text: "提交到 Spark 集群，初始分配 8 个 Executors 执行计算" },
    ],
  },
  {
    icon: "/icons/expert/14.svg",
    name: "数据运维专家",
    delay: 9000,
    lines: [
      { text: "Spark 任务监控：Stage 1/3 完成，已处理 2.4GB 数据，Shuffle Write 860MB。" },
      { text: "资源利用率 78%，无 GC 压力，预计 3 分钟内完成全部计算。" },
      { text: "任务执行完毕，输出结果写入 ADS 层 ads_dau_wau_east_7d 表，共 7 条记录。", tags: ["ads_dau_wau_east_7d", "spark_job_2024041201"] },
    ],
  },
  {
    icon: "/icons/expert/25.svg",
    name: "数据分析专家",
    delay: 12000,
    lines: [
      { text: "趋势分析结果：近 7 天华东区 DAU 均值 124.5 万，WAU 382.7 万，DAU/WAU 比值 32.6%。" },
      { text: "环比变化：DAU 较上周同期 +3.2%，其中移动端增长 5.1%，PC 端下降 1.8%。" },
      { text: "已生成 DAU/WAU 趋势折线图 + 业务结论摘要，可在产物面板查看。" },
    ],
  },
  {
    icon: "/icons/expert/17.svg",
    name: "数据开发专家",
    delay: 15000,
    lines: [
      { text: "产出物归档完成：SQL 模板已沉淀至知识库，标签为「华东区、用户活跃、7日趋势」。" },
      { text: "定时任务已创建：每日 09:00 自动刷新数据并推送至运营周报看板。", tags: ["knowledge_base", "scheduled_task"] },
    ],
  },
];

// ── Main export ───────────────────────────────────────────────
interface ExpertRepliesProps {
  instant?: boolean;
  replies?: ExpertReplyData[];
  onComplete?: () => void;
}

export default function ExpertReplies({ instant = false, replies, onComplete }: ExpertRepliesProps) {
  const data = replies ?? DEFAULT_REPLIES;
  const completedRef = React.useRef(false);

  // instant 模式下立即触发 onComplete
  useEffect(() => {
    if (instant && onComplete && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [instant, onComplete]);

  const handleReplyComplete = (index: number) => {
    // 当最后一个回复的所有行都完成时触发
    if (index === data.length - 1 && onComplete && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 过渡文案 */}
      <DispatchText delay={500} instant={instant} />

      {/* 专家回复 */}
      {data.map((reply, i) => (
        <ExpertReply
          key={i}
          icon={reply.icon}
          name={reply.name}
          lines={reply.lines}
          delay={reply.delay}
          instant={instant}
          onAllLinesDone={() => handleReplyComplete(i)}
        />
      ))}
    </div>
  );
}

export type { ExpertReplyData as ExpertReplyDataType };
