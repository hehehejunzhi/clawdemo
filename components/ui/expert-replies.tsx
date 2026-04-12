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
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, onDone]);
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
interface ExpertLine {
  icon?: "arrow" | "check";
  text: string;
  tags?: string[];
}

interface ExpertReplyProps {
  icon: string;
  name: string;
  lines: ExpertLine[];
  delay?: number;
}

function ExpertReply({ icon, name, lines, delay = 0 }: ExpertReplyProps) {
  const [visible, setVisible] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const handleLineDone = () => {
    setVisibleLines((v) => v + 1);
  };

  // Auto-start first line
  useEffect(() => {
    if (visible && visibleLines === 0) setVisibleLines(1);
  }, [visible, visibleLines]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
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
                  <StreamText
                    text={line.text}
                    speed={25}
                    onDone={i === visibleLines - 1 ? handleLineDone : undefined}
                  />
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
function DispatchText({ delay = 0 }: { delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
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

// ── Main export ───────────────────────────────────────────────
export default function ExpertReplies() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 过渡文案 */}
      <DispatchText delay={500} />

      {/* 数据分析专家 回复 1 */}
      <ExpertReply
        icon="/icons/expert/14.svg"
        name="数据分析专家"
        delay={1200}
        lines={[
          { text: "拉取数据表进行结构分析" },
          { text: "权限校验通过，数据合规性审查完成，已生成审计日志。" },
        ]}
      />

      {/* 数据开发专家 回复 */}
      <ExpertReply
        icon="/icons/expert/17.svg"
        name="数据开发专家"
        delay={3500}
        lines={[
          {
            text: "检查 HDFS 上该表华东区分区的数据完整性（7/7）",
            tags: ["dw_user_behavior", "ADS_Ad_Placement_Optimization", "DWS_Conversion_Funnel", "ADS_diagnostic_feed", "ADS_Marketing_feed"],
          },
          { text: "已调用\"指标 SQL Copilot\"自动生成聚合 SQL，提交 Spark 计算，分配 8 Executors。" },
        ]}
      />

      {/* 数据分析专家 回复 2 */}
      <ExpertReply
        icon="/icons/expert/25.svg"
        name="数据分析专家"
        delay={6500}
        lines={[
          {
            text: "根据自然语言需求 \"dau_wau_east_7d\" 自动生成聚合 SQL",
            tags: ["ADS_Ad_Placement_Optimization"],
          },
          { text: "提交到 Spark 集群，初始分配 8 个 Executors 执行计算" },
        ]}
      />
    </div>
  );
}
