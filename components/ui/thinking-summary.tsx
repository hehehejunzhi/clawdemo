"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

// ── Design tokens (from design-dna.json) ─────────────────────────
const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const T = {
  tertiary: "rgba(0,0,0,0.5)",
} as const;

// ── Types ────────────────────────────────────────────────────────
interface ThinkingSummaryProps {
  /** Summary text displayed, e.g. "分析了你的需求并为你规划任务" */
  text?: string;
  /** Click handler — can be used to expand detail in the future */
  onClick?: () => void;
}

// ── Component ────────────────────────────────────────────────────
export default function ThinkingSummary({
  text = "收到需求，我来作为调度者拆解任务并分派给团队成员",
  onClick,
}: ThinkingSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        cursor: onClick ? "pointer" : "default",
        fontFamily: FONT,
      }}
      onClick={onClick}
      whileHover={onClick ? { opacity: 0.7 } : undefined}
    >
      {/* 调度 Claw 标签 */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{
          width: 16, height: 16, borderRadius: 8,
          background: "radial-gradient(ellipse 83% 83% at 19% 23%, #5252FF 0%, #7E7EFF 100%)",
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}>
          <img src="/icons/expert/1.svg" alt="" style={{ position: "absolute", left: 0, top: 0, width: 16, height: 16 }} />
          <img src="/icons/expert/2.svg" alt="" style={{ position: "absolute", left: 3.2, top: 3.2, width: 9.6, height: 9.6 }} />
        </div>
        <span style={{
          fontSize: 12, fontWeight: 400,
          lineHeight: "20px", color: T.tertiary,
        }}>
          调度 Claw
        </span>
      </div>

      {/* 摘要文案 */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span
          style={{
            fontSize: 16,
            fontWeight: 400,
            lineHeight: "28px",
            color: T.tertiary,
            textAlign: "justify",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
        <ChevronRight
          style={{
            width: 16,
            height: 16,
            color: T.tertiary,
            flexShrink: 0,
          }}
        />
      </div>
    </motion.div>
  );
}
