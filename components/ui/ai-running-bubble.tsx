"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Design DNA tokens ────────────────────────────────────────
const FONT =
  "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MACRO = 0.35; // 350ms

const TEXT = {
  primary: "rgba(0,0,0,0.9)",
  secondary: "rgba(0,0,0,0.7)",
} as const;

// ── Bubble tokens ────────────────────────────────────────────
const BUBBLE_W = 240;
const BUBBLE_H = 72;
const BORDER_RADIUS = 100;
const BORDER_W = 1;
const SPIN_DURATION = 4; // 秒/圈

const BOX_SHADOW =
  "0 4px 8px -6px rgba(66,77,80,0.24), 0 12px 24px -16px rgba(66,77,80,0.16)";

/** conic-gradient 旋转色板 */
const conicGradient = (alpha: number) =>
  `conic-gradient(from 0deg, ` +
  `rgba(255,141,41,${alpha}) 0deg, transparent 90deg, ` +
  `rgba(1,245,233,${alpha}) 180deg, transparent 270deg, ` +
  `rgba(255,141,41,${alpha}) 360deg)`;

/** 旋转盘尺寸——覆盖 pill 对角线 */
const DISC_SIZE = Math.ceil(Math.hypot(BUBBLE_W, BUBBLE_H)) + 40;

// ── Avatar tokens (来自 Figma node 997:43764) ────────────────
const AVATAR_CIRCLE = 56;
const CHAR_IMG = "/agents/avatar-char.png";

// 角色图在圆内的定位 (来自 Figma "抬高双手 1")
// 容器 70×80, 偏移 left:-8 top:-17 相对于 56×56 区域
const CHAR_CONTAINER = { w: 70, h: 80, left: -8, top: -17 };
// 图片在容器内: w=206.67% h=180.83% left=-53.02% top=-9.86%
const CHAR_IN_MASK = { w: "206.67%", h: "180.83%", left: "-53.02%", top: "-9.86%" };

// 角色手部溢出层 (来自 Figma "抬高双手 2")
// 容器 70×51, 偏移 left:-8 top:-17
const HAND_CONTAINER = { w: 70, h: 51, left: -8, top: -17 };
// 图片在容器内: w=206.67% h=283.66% left=-53.02% top=-15.47%
const HAND_IMG = { w: "206.67%", h: "283.66%", left: "-53.02%", top: "-15.47%" };

const RUNNING_STATUS_TEXTS = [
  "正在设计数据模型",
  "正在分析任务依赖",
  "正在优化查询性能",
  "正在生成执行计划",
  "正在校验结果质量",
] as const;

// ── Keyframes ────────────────────────────────────────────────
const KEYFRAMES = `@keyframes aurora-spin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes text-fade-in{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}@keyframes text-fade-out{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-4px)}}@keyframes shine-sweep{0%{background-position:200% 0}100%{background-position:-100% 0}}`;

const discStyle = (gradient: string): React.CSSProperties => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  width: DISC_SIZE,
  height: DISC_SIZE,
  borderRadius: "50%",
  background: gradient,
  animation: `aurora-spin ${SPIN_DURATION}s linear infinite`,
  willChange: "transform",
});

// ── Component ────────────────────────────────────────────────

export default function AiRunningBubble() {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (RUNNING_STATUS_TEXTS.length <= 1) return;

    const timer = window.setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % RUNNING_STATUS_TEXTS.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* 最外层：允许头像溢出，所以不能 overflow:hidden */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MACRO, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "absolute",
          bottom: 50,
          right: 30,
          width: BUBBLE_W,
          height: BUBBLE_H,
          cursor: "pointer",
          fontFamily: FONT,
        }}
      >
        {/* ── 1. pill 主体（overflow:hidden 裁切渐变） ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: BORDER_RADIUS,
            overflow: "hidden",
            boxShadow: BOX_SHADOW,
          }}
        >
          {/* 1a. 旋转边框渐变 */}
          <div style={discStyle(conicGradient(0.5))} />

          {/* 1b. 内层白底 */}
          <div
            style={{
              position: "absolute",
              inset: BORDER_W,
              borderRadius: BORDER_RADIUS - BORDER_W,
              background: "#FFFFFF",
              overflow: "hidden",
            }}
          >
            {/* 1c. 内部旋转光晕 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                borderRadius: BORDER_RADIUS - BORDER_W,
                pointerEvents: "none",
              }}
            >
              <div style={discStyle(conicGradient(0.12))} />
            </div>
          </div>
        </div>

        {/* ── 2. 头像 — 圆内部分（在 pill 裁切区域内） ── */}
        <div
          style={{
            position: "absolute",
            left: 8,
            top: 8,
            width: AVATAR_CIRCLE,
            height: AVATAR_CIRCLE,
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          {/* 2a. 蓝色渐变背景圆 */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 56 55.2222"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, display: "block" }}
          >
            <defs>
              <linearGradient id="avatar-bg-grad" x1="28" y1="0" x2="28" y2="55.2222" gradientUnits="userSpaceOnUse">
                <stop stopColor="#132869" />
                <stop offset="1" stopColor="#2452DB" />
              </linearGradient>
            </defs>
            <ellipse cx="28" cy="27.6111" rx="28" ry="27.6111" fill="url(#avatar-bg-grad)" />
          </svg>

          {/* 2b. 角色图（被圆裁切） */}
          <div
            style={{
              position: "absolute",
              left: CHAR_CONTAINER.left,
              top: CHAR_CONTAINER.top,
              width: CHAR_CONTAINER.w,
              height: CHAR_CONTAINER.h,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CHAR_IMG}
              alt=""
              style={{
                position: "absolute",
                width: CHAR_IN_MASK.w,
                height: CHAR_IN_MASK.h,
                left: CHAR_IN_MASK.left,
                top: CHAR_IN_MASK.top,
                maxWidth: "none",
              }}
            />
          </div>
        </div>

        {/* ── 3. 角色手部溢出层（在 pill 之上，不被裁切） ── */}
        <div
          style={{
            position: "absolute",
            left: 8 + HAND_CONTAINER.left,
            top: 8 + HAND_CONTAINER.top,
            width: HAND_CONTAINER.w,
            height: HAND_CONTAINER.h,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CHAR_IMG}
            alt=""
            style={{
              position: "absolute",
              width: HAND_IMG.w,
              height: HAND_IMG.h,
              left: HAND_IMG.left,
              top: HAND_IMG.top,
              maxWidth: "none",
            }}
          />
        </div>

        {/* ── 4. 文字（需要 z-index 在 pill 之上但手部之下） ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 80,
            paddingRight: 24,
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              lineHeight: "24px",
              color: TEXT.primary,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            智能管家
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={statusIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              style={{
                fontSize: 14,
                fontWeight: 400,
                lineHeight: "22px",
                color: TEXT.secondary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                position: "relative",
                background: `linear-gradient(90deg, ${TEXT.secondary} 0%, rgba(255,255,255,0.78) 50%, ${TEXT.secondary} 100%)`,
                backgroundSize: "200% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shine-sweep 3s ease-in-out infinite",
              }}
            >
              {RUNNING_STATUS_TEXTS[statusIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
