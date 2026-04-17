"use client";

import React, { useState } from "react";
import type { MotionTargetDef } from "@/components/ui/motion-panel";

// ── Motion Target Definition ──────────────────────────────────
const DEFAULT_HERO_CONFIG = {
  crossfadeDuration: 0.5,
  maxWidth: 880,
  height: 416,
  bottomFadeHeight: 143,
  sideFadeWidth: 100,
  hoverFadeOpacity: 0,
  restFadeOpacity: 1,
} as const;

export const HERO_SECTION_MOTION: MotionTargetDef = {
  id: "hero-section",
  label: "Hero 区域动效",
  schema: [
    { key: "crossfadeDuration", label: "图片切换时长", min: 0.1, max: 2.0, step: 0.05, group: "图片切换" },
    { key: "maxWidth", label: "最大宽度", min: 600, max: 1200, step: 10, group: "布局" },
    { key: "height", label: "高度", min: 200, max: 600, step: 10, group: "布局" },
    { key: "bottomFadeHeight", label: "底部渐隐高度", min: 0, max: 300, step: 5, group: "渐隐遮罩" },
    { key: "sideFadeWidth", label: "侧边渐隐宽度", min: 0, max: 200, step: 5, group: "渐隐遮罩" },
    { key: "hoverFadeOpacity", label: "Hover 时遮罩透明度", min: 0, max: 1, step: 0.05, group: "渐隐遮罩" },
    { key: "restFadeOpacity", label: "静态遮罩透明度", min: 0, max: 1, step: 0.05, group: "渐隐遮罩" },
  ],
  defaultConfig: DEFAULT_HERO_CONFIG as unknown as Record<string, number>,
};

// ── Props ─────────────────────────────────────────────────────
interface HeroSectionProps {
  config?: Record<string, number>;
}

// ── Component ─────────────────────────────────────────────────
export default function HeroSection({
  config = HERO_SECTION_MOTION.defaultConfig,
}: HeroSectionProps) {
  const [hovered, setHovered] = useState(false);

  const crossfadeDuration = config.crossfadeDuration ?? 0.5;
  const maxWidth = config.maxWidth ?? 880;
  const height = config.height ?? 416;
  const bottomFadeHeight = config.bottomFadeHeight ?? 143;
  const sideFadeWidth = config.sideFadeWidth ?? 100;
  const hoverFadeOpacity = config.hoverFadeOpacity ?? 0;
  const restFadeOpacity = config.restFadeOpacity ?? 1;

  const transitionStr = `opacity ${crossfadeDuration}s cubic-bezier(0.4, 0, 0.2, 1)`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        maxWidth,
        height,
        position: "relative",
        overflow: "hidden",
        margin: "0 auto",
        cursor: "pointer",
      }}
    >
      {/* Default image */}
      <img src="/icons/hero/Frame 2147209846.png" alt="" style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        left: 0, top: 0,
        objectFit: "contain",
        objectPosition: "center top",
        opacity: hovered ? 0 : 1,
        transition: transitionStr,
      }} />

      {/* Hover image */}
      <img src="/icons/hero/Group 2119905893.png" alt="" style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        left: 0, top: 0,
        objectFit: "contain",
        objectPosition: "center top",
        opacity: hovered ? 1 : 0,
        transition: transitionStr,
      }} />

      {/* Bottom fade */}
      <div style={{
        position: "absolute",
        left: 0, right: 0, bottom: 0,
        height: bottomFadeHeight,
        background: "linear-gradient(0deg, #F9FAFC 0%, rgba(249,250,252,0) 100%)",
        pointerEvents: "none",
        opacity: hovered ? hoverFadeOpacity : restFadeOpacity,
        transition: transitionStr,
      }} />

      {/* Left fade */}
      <div style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: sideFadeWidth,
        background: "linear-gradient(90deg, #F9FAFC 0%, rgba(249,250,252,0) 100%)",
        pointerEvents: "none",
        opacity: hovered ? hoverFadeOpacity : restFadeOpacity,
        transition: transitionStr,
      }} />

      {/* Right fade */}
      <div style={{
        position: "absolute",
        right: 0, top: 0, bottom: 0,
        width: sideFadeWidth,
        background: "linear-gradient(270deg, #F9FAFC 0%, rgba(249,250,252,0) 100%)",
        pointerEvents: "none",
        opacity: hovered ? hoverFadeOpacity : restFadeOpacity,
        transition: transitionStr,
      }} />
    </div>
  );
}
