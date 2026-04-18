"use client";

import React, { useState, useCallback } from "react";
import type { MotionTargetDef } from "@/components/ui/motion-panel";

// ── Expert IDs ────────────────────────────────────────────────
type ExpertId = "dev" | "ops" | "analyst";

// ── Trigger zones (defined in 880px design coordinate space) ──
// Zones use percentage of container width for responsive scaling.
// 0-206: no trigger; 207-377: dev; 378-507: no trigger; 508-650: ops; 651-820: analyst
const DESIGN_W = 880;
interface TriggerZone { startPct: number; endPct: number; expert: ExpertId }
const TRIGGER_ZONES: TriggerZone[] = [
  { startPct: 207 / DESIGN_W, endPct: 377 / DESIGN_W, expert: "dev" },
  { startPct: 508 / DESIGN_W, endPct: 650 / DESIGN_W, expert: "ops" },
  { startPct: 651 / DESIGN_W, endPct: 820 / DESIGN_W, expert: "analyst" },
];

// ── Detail images per expert ──────────────────────────────────
const DETAIL_IMAGES: Record<ExpertId, string> = {
  dev: "/icons/hero/detail-dev.png",
  ops: "/icons/hero/detail-ops.png",
  analyst: "/icons/hero/detail-analyst.png",
};

// ── Motion Target Definition ──────────────────────────────────
const DEFAULT_HERO_CONFIG = {
  crossfadeDuration: 0.5,
  maxWidth: 880,
  height: 425,
  bottomFadeHeight: 143,
  sideFadeWidth: 100,
  fadeOpacity: 1,
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
    { key: "fadeOpacity", label: "遮罩透明度", min: 0, max: 1, step: 0.05, group: "渐隐遮罩" },
  ],
  defaultConfig: DEFAULT_HERO_CONFIG as unknown as Record<string, number>,
};

// ── Shared image style ────────────────────────────────────────
const IMG_BASE: React.CSSProperties = {
  width: "100%",
  height: "auto",
  position: "absolute",
  left: 0,
  top: 0,
};

// ── Props ─────────────────────────────────────────────────────
interface HeroSectionProps {
  config?: Record<string, number>;
}

// ── Component ─────────────────────────────────────────────────
export default function HeroSection({
  config = HERO_SECTION_MOTION.defaultConfig,
}: HeroSectionProps) {
  const [activeExpert, setActiveExpert] = useState<ExpertId | null>(null);

  const crossfadeDuration = config.crossfadeDuration ?? 0.5;
  const maxWidth = config.maxWidth ?? 880;
  const height = config.height ?? 425;
  const bottomFadeHeight = config.bottomFadeHeight ?? 143;
  const sideFadeWidth = config.sideFadeWidth ?? 100;
  const fadeOpacity = config.fadeOpacity ?? 1;

  const ease = `opacity ${crossfadeDuration}s cubic-bezier(0.4, 0, 0.2, 1)`;

  // Mouse position → percentage of actual rendered width → match trigger zone
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width; // 0~1, scales with any container size
    let found: ExpertId | null = null;
    for (const zone of TRIGGER_ZONES) {
      if (pct >= zone.startPct && pct <= zone.endPct) {
        found = zone.expert;
        break;
      }
    }
    setActiveExpert(found);
  }, []);

  const handleMouseLeave = useCallback(() => setActiveExpert(null), []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth,
        height,
        position: "relative",
        overflow: "hidden",
        margin: "0 auto",
      }}
    >
      {/* ── Overview — always visible as base layer ── */}
      <img
        src="/icons/hero/Frame 2147209846.png"
        alt="专家团总览"
        style={{ ...IMG_BASE }}
      />

      {/* ── Fade masks — above overview ── */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        height: bottomFadeHeight,
        background: "linear-gradient(0deg, #F9FAFC 0%, rgba(249,250,252,0) 100%)",
        pointerEvents: "none",
        opacity: fadeOpacity,
      }} />
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: sideFadeWidth,
        background: "linear-gradient(90deg, #F9FAFC 0%, rgba(249,250,252,0) 100%)",
        pointerEvents: "none",
        opacity: fadeOpacity,
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0,
        width: sideFadeWidth,
        background: "linear-gradient(270deg, #F9FAFC 0%, rgba(249,250,252,0) 100%)",
        pointerEvents: "none",
        opacity: fadeOpacity,
      }} />

      {/* ── Expert detail images — fade in/out directly over overview ── */}
      {(["dev", "ops", "analyst"] as ExpertId[]).map((id) => (
        <img
          key={id}
          src={DETAIL_IMAGES[id]}
          alt=""
          style={{ ...IMG_BASE, zIndex: 2, opacity: activeExpert === id ? 1 : 0, transition: ease }}
        />
      ))}

      {/* ── Trigger zone layer (always on top for mouse detection) ── */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          cursor: "pointer",
        }}
      />
    </div>
  );
}
