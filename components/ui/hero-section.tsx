"use client";

import React from "react";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const BADGE_BG = "linear-gradient(194deg, rgba(249,187,94,0.10) 0%, rgba(249,187,94,0) 100%), linear-gradient(11deg, rgba(51,175,255,0.10) 0%, rgba(51,175,255,0) 100%), rgba(255,255,255,0.10)";
const BADGE_SHADOW = "0px 2px 5px rgba(0,0,0,0.04), 1px -1px 1px rgba(51,175,255,0.04) inset";

interface ExpertBadge {
  icon: string;
  label: string;
  left: number;
  top: number;
  opacity?: number;
  hideIcon?: boolean;
}

const EXPERT_BADGES: ExpertBadge[] = [
  { icon: "/icons/hero/expert-dev.svg", label: "数据开发专家", left: 272.06, top: 0 },
  { icon: "/icons/hero/expert-ops.svg", label: "数据运维专家", left: 556.06, top: 0 },
  { icon: "/icons/hero/expert-analyst.svg", label: "数据分析专家", left: 707.06, top: 31 },
  { icon: "", label: "敬请期待", left: 154.06, top: 31, opacity: 0.3, hideIcon: true },
];

export default function HeroSection() {
  return (
    <div style={{
      width: "100%",
      maxWidth: 880,
      height: 416,
      position: "relative",
      overflow: "hidden",
      margin: "0 auto",
    }}>
      {/* Inner container offset to match figma's -49.56, -19.67 positioning */}
      <div style={{
        width: 968.12,
        height: 435.67,
        position: "absolute",
        left: -49.56,
        top: -19.67,
      }}>
        {/* Background image */}
        <img
          src="/icons/hero/bg.png"
          alt=""
          style={{
            width: 968.12,
            height: 410.72,
            position: "absolute",
            left: 0,
            top: 24.72,
            objectFit: "cover",
          }}
        />

        {/* Bottom fade gradient */}
        <div style={{
          width: 968.12,
          height: 155.60,
          position: "absolute",
          left: 0,
          top: 24.72,
          background: "linear-gradient(0deg, #F9FAFC 0%, rgba(249,250,252,0) 100%)",
        }} />

        {/* Left fade gradient */}
        <div style={{
          width: 435.44,
          height: 480.27,
          position: "absolute",
          left: 0,
          top: 435.44,
          transform: "rotate(-90deg)",
          transformOrigin: "top left",
          background: "linear-gradient(360deg, #F9FAFC 0%, rgba(249,250,252,0) 100%)",
        }} />

        {/* Right fade gradient */}
        <div style={{
          width: 435.44,
          height: 371.77,
          position: "absolute",
          left: 596.35,
          top: 435.44,
          transform: "rotate(-90deg)",
          transformOrigin: "top left",
          background: "linear-gradient(360deg, #F9FAFC 0%, rgba(249,250,252,0) 100%)",
        }} />

        {/* Overlay image */}
        <img
          src="/icons/hero/overlay.png"
          alt=""
          style={{
            width: 968.12,
            height: 410.72,
            position: "absolute",
            left: 0,
            top: 24.72,
            objectFit: "cover",
          }}
        />

        {/* Blur gradient near bottom */}
        <div style={{
          width: 968.12,
          height: 84.61,
          position: "absolute",
          left: 0,
          top: 350.82,
          background: "linear-gradient(0deg, rgba(249,250,252,0.20) 0%, rgba(249,250,252,0) 100%)",
          backdropFilter: "blur(2px)",
        }} />

        {/* Bottom solid gradient */}
        <div style={{
          width: 968,
          height: 143,
          position: "absolute",
          left: 0.06,
          top: 292.67,
          background: "linear-gradient(0deg, #F9FAFC 0%, rgba(249,250,252,0) 100%)",
        }} />

        {/* Expert badges */}
        {EXPERT_BADGES.map((badge) => (
          <div
            key={badge.label}
            style={{
              width: badge.hideIcon ? 96 : 144,
              height: 36,
              position: "absolute",
              left: badge.left,
              top: 19.67 + badge.top,
              opacity: badge.opacity ?? 1,
              background: BADGE_BG,
              boxShadow: BADGE_SHADOW,
              borderRadius: 100,
              outline: "1px solid white",
              outlineOffset: -1,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            {!badge.hideIcon && (
              <img
                src={badge.icon}
                alt=""
                style={{
                  width: 16,
                  height: 16,
                  position: "absolute",
                  left: 20,
                  top: 10,
                }}
              />
            )}
            <span style={{
              position: "absolute",
              left: badge.hideIcon ? 20 : 40,
              top: 7,
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 500,
              color: "#000",
              whiteSpace: "nowrap",
            }}>
              {badge.label}
            </span>
          </div>
        ))}

        {/* "我的数字分身" badge */}
        <div style={{
          width: 115,
          height: 28,
          position: "absolute",
          left: 427.06,
          top: 247.67,
          background: "linear-gradient(194deg, rgba(249,187,94,0.20) 0%, rgba(249,187,94,0) 100%), linear-gradient(11deg, rgba(51,175,255,0.20) 0%, rgba(51,175,255,0) 100%), rgba(255,255,255,0.10)",
          boxShadow: BADGE_SHADOW,
          borderRadius: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 500,
            color: "#FFFFFF",
            whiteSpace: "nowrap",
          }}>
            我的&ldquo;数字分身&rdquo;
          </span>
        </div>
      </div>
    </div>
  );
}
