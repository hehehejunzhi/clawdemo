"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { MotionTargetDef } from "@/components/ui/motion-panel";

// ── Zone types ────────────────────────────────────────────────
type ExpertId = "dev" | "ops" | "analyst";
type TooltipId = "coming-soon" | "skill-plaza";
type ZoneTarget = ExpertId | TooltipId | null;

// ── All zones (defined in 880px design coordinate space) ──────
const DESIGN_W = 880;
interface Zone { startPct: number; endPct: number; target: ExpertId | TooltipId }
const ALL_ZONES: Zone[] = [
  { startPct: 0 / DESIGN_W, endPct: 206 / DESIGN_W, target: "coming-soon" },
  { startPct: 207 / DESIGN_W, endPct: 377 / DESIGN_W, target: "dev" },
  { startPct: 378 / DESIGN_W, endPct: 507 / DESIGN_W, target: "skill-plaza" },
  { startPct: 508 / DESIGN_W, endPct: 650 / DESIGN_W, target: "ops" },
  { startPct: 651 / DESIGN_W, endPct: 820 / DESIGN_W, target: "analyst" },
];

const EXPERT_IDS: ExpertId[] = ["dev", "ops", "analyst"];
const TOOLTIP_IDS: TooltipId[] = ["coming-soon", "skill-plaza"];

function isExpert(t: ZoneTarget): t is ExpertId {
  return t !== null && EXPERT_IDS.includes(t as ExpertId);
}
function isTooltip(t: ZoneTarget): t is TooltipId {
  return t !== null && TOOLTIP_IDS.includes(t as TooltipId);
}

// ── Tooltip texts ─────────────────────────────────────────────
const TOOLTIP_TEXT: Record<TooltipId, string> = {
  "coming-soon": "更多大数据专家正在训练中…",
  "skill-plaza": "前往「技能广场」，为你的分身配置专属能力。",
};

// ── Detail images ─────────────────────────────────────────────
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

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ── Tooltip component ─────────────────────────────────────────
function HeroTooltip({ text, x, y, visible }: {
  text: string;
  x: number;
  y: number;
  visible: boolean;
}) {
  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y,
      transform: "translate(-50%, -100%)",
      marginTop: -12,
      zIndex: 20,
      opacity: visible ? 1 : 0,
      transition: "opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      pointerEvents: "none",
    }}>
      <div style={{
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: 8,
        padding: "8px 14px",
        maxWidth: 220,
        fontFamily: FONT,
        fontSize: 12,
        lineHeight: "18px",
        color: "rgba(255, 255, 255, 0.92)",
        fontWeight: 400,
        whiteSpace: "normal",
        textAlign: "center",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
      }}>
        {text}
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────
interface HeroSectionProps {
  config?: Record<string, number>;
}

// ── Component ─────────────────────────────────────────────────
export default function HeroSection({
  config = HERO_SECTION_MOTION.defaultConfig,
}: HeroSectionProps) {
  const [activeExpert, setActiveExpert] = useState<ExpertId | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<TooltipId | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const pendingRef = useRef<ZoneTarget>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ENTER_DELAY = 300;
  const LEAVE_DELAY = 100;
  const TOOLTIP_AUTO_HIDE = 3000;

  const crossfadeDuration = config.crossfadeDuration ?? 0.5;
  const maxWidth = config.maxWidth ?? 880;
  const height = config.height ?? 425;
  const bottomFadeHeight = config.bottomFadeHeight ?? 143;
  const sideFadeWidth = config.sideFadeWidth ?? 100;
  const fadeOpacity = config.fadeOpacity ?? 1;

  const ease = `opacity ${crossfadeDuration}s cubic-bezier(0.4, 0, 0.2, 1)`;

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (enterTimerRef.current) { clearTimeout(enterTimerRef.current); enterTimerRef.current = null; }
    if (autoHideTimerRef.current) { clearTimeout(autoHideTimerRef.current); autoHideTimerRef.current = null; }
  }, []);

  // Apply target (expert or tooltip)
  const applyTarget = useCallback((target: ZoneTarget) => {
    if (isExpert(target)) {
      setActiveExpert(target);
      setActiveTooltip(null);
      if (autoHideTimerRef.current) { clearTimeout(autoHideTimerRef.current); autoHideTimerRef.current = null; }
    } else if (isTooltip(target)) {
      // If coming from an expert detail, first fade out expert, then show tooltip after fade completes
      if (activeExpert !== null) {
        setActiveExpert(null);
        setActiveTooltip(null);
        // Wait for crossfade to finish before showing tooltip
        if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
        autoHideTimerRef.current = setTimeout(() => {
          setActiveTooltip(target);
          // Then auto-hide after 3s
          autoHideTimerRef.current = setTimeout(() => {
            setActiveTooltip(null);
            autoHideTimerRef.current = null;
          }, TOOLTIP_AUTO_HIDE);
        }, crossfadeDuration * 1000);
      } else {
        setActiveTooltip(target);
        if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
        autoHideTimerRef.current = setTimeout(() => {
          setActiveTooltip(null);
          autoHideTimerRef.current = null;
        }, TOOLTIP_AUTO_HIDE);
      }
    } else {
      setActiveExpert(null);
      setActiveTooltip(null);
      if (autoHideTimerRef.current) { clearTimeout(autoHideTimerRef.current); autoHideTimerRef.current = null; }
    }
  }, [activeExpert, crossfadeDuration]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;

    let found: ZoneTarget = null;
    for (const zone of ALL_ZONES) {
      if (pct >= zone.startPct && pct <= zone.endPct) {
        found = zone.target;
        break;
      }
    }

    // Update tooltip position (relative to container)
    if (isTooltip(found)) {
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    // Skip if target hasn't changed
    if (found === pendingRef.current) return;
    const prevPending = pendingRef.current;
    pendingRef.current = found;

    if (enterTimerRef.current) { clearTimeout(enterTimerRef.current); enterTimerRef.current = null; }

    // If leaving a tooltip zone, clear tooltip immediately (CSS handles fade-out)
    if (isTooltip(prevPending) && !isTooltip(found)) {
      setActiveTooltip(null);
      if (autoHideTimerRef.current) { clearTimeout(autoHideTimerRef.current); autoHideTimerRef.current = null; }
    }

    // If no new target, use leave delay; otherwise enter delay
    if (found === null) {
      enterTimerRef.current = setTimeout(() => {
        applyTarget(null);
        enterTimerRef.current = null;
      }, LEAVE_DELAY);
    } else {
      const delay = ENTER_DELAY;
      enterTimerRef.current = setTimeout(() => {
        applyTarget(found);
        enterTimerRef.current = null;
      }, delay);
    }
  }, [applyTarget]);

  const handleMouseLeave = useCallback(() => {
    pendingRef.current = null;
    clearTimers();
    // Tooltip disappears immediately
    setActiveTooltip(null);
    // Expert fades out with delay
    enterTimerRef.current = setTimeout(() => {
      setActiveExpert(null);
      enterTimerRef.current = null;
    }, LEAVE_DELAY);
  }, [clearTimers]);

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth,
        height,
        position: "relative",
        margin: "0 auto",
      }}
    >
      {/* Inner container clips images but tooltip can overflow */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
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
      {EXPERT_IDS.map((id) => (
        <img
          key={id}
          src={DETAIL_IMAGES[id]}
          alt=""
          style={{ ...IMG_BASE, zIndex: 2, opacity: activeExpert === id ? 1 : 0, transition: ease }}
        />
      ))}
      </div>{/* end inner clip container */}

      {/* ── Tooltips for non-trigger zones (outside clip container) ── */}
      {TOOLTIP_IDS.map((id) => (
        <HeroTooltip
          key={id}
          text={TOOLTIP_TEXT[id]}
          x={tooltipPos.x}
          y={tooltipPos.y}
          visible={activeTooltip === id}
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
