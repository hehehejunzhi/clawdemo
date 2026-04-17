"use client";

import React, { useState } from "react";

export default function HeroSection() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        maxWidth: 880,
        height: 416,
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
        transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
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
        transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }} />

      {/* Bottom fade — hidden on hover */}
      <div style={{
        position: "absolute",
        left: 0, right: 0, bottom: 0,
        height: 143,
        background: "linear-gradient(0deg, #F9FAFC 0%, rgba(249,250,252,0) 100%)",
        pointerEvents: "none",
        opacity: hovered ? 0 : 1,
        transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }} />

      {/* Left fade — hidden on hover */}
      <div style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: 100,
        background: "linear-gradient(90deg, #F9FAFC 0%, rgba(249,250,252,0) 100%)",
        pointerEvents: "none",
        opacity: hovered ? 0 : 1,
        transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }} />

      {/* Right fade — hidden on hover */}
      <div style={{
        position: "absolute",
        right: 0, top: 0, bottom: 0,
        width: 100,
        background: "linear-gradient(270deg, #F9FAFC 0%, rgba(249,250,252,0) 100%)",
        pointerEvents: "none",
        opacity: hovered ? 0 : 1,
        transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }} />
    </div>
  );
}
