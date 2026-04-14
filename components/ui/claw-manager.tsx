"use client";

import React, { useState } from "react";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const C = {
  bg: "#F9FAFC",
  bgWhite: "#FFFFFF",
  border: "#E6E9EF",
  textPrimary: "rgba(0,0,0,0.9)",
  textSecondary: "rgba(0,0,0,0.7)",
  textTertiary: "rgba(0,0,0,0.5)",
  hoverShadow: "0 4px 12px rgba(0,0,0,0.06)",
} as const;

// ── Section title ─────────────────────────────────────────────
function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ height: 50, display: "flex", alignItems: "center", padding: "0 24px", gap: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>{title}</span>
      <span style={{ fontSize: 14, fontWeight: 400, color: C.textTertiary }}>{desc}</span>
    </div>
  );
}

// ── Dialog button (pill, gradient border) ─────────────────────
function DialogBtn({ label, icon }: { label: string; icon?: boolean }) {
  const [h, setH] = useState(false);
  return (
    <button
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: 240, height: 40, padding: "0 32px", borderRadius: 100,
        border: "1px solid #E9EBF0",
        background: h ? "#F2F4F8" : "transparent",
        fontFamily: FONT, fontSize: 14, fontWeight: 500,
        color: C.textPrimary, cursor: "pointer", outline: "none",
        transition: "background 100ms",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
      }}
    >
      {icon !== false && (
        <img src="/icons/claw-mgr/dialog-icon.svg" alt="" style={{ width: 16, height: 16 }} />
      )}
      {label}
    </button>
  );
}

// ── Card shell (340 x 168, horizontal layout) ─────────────────
function Card({ avatar, name, desc, badge, button, children }: {
  avatar: React.ReactNode;
  name: React.ReactNode;
  desc: string;
  badge?: React.ReactNode;
  button?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: 340, minHeight: 168, background: C.bgWhite, borderRadius: 16,
        border: `1px solid ${C.border}`, padding: 20,
        display: "flex", flexDirection: "column", gap: 12,
        cursor: "pointer", transition: "box-shadow 150ms",
        boxShadow: h ? C.hoverShadow : "none",
      }}
    >
      {/* Top: avatar + info */}
      <div style={{ display: "flex", gap: 12 }}>
        {avatar}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            {name}
            {badge}
          </div>
          <div style={{
            fontSize: 14, fontWeight: 400, color: C.textPrimary, lineHeight: "20px",
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
          }}>{desc}</div>
        </div>
      </div>
      {children}
      {/* Bottom: action button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {button ?? <DialogBtn label="对话" />}
      </div>
    </div>
  );
}

// ── Status dot ────────────────────────────────────────────────
function StatusDot({ color = "#2BA471", size = 10 }: { color?: string; size?: number }) {
  return (
    <div style={{
      position: "absolute", right: 0, bottom: 0,
      width: size, height: size, borderRadius: size,
      background: color, border: "2px solid #FFFFFF",
      zIndex: 1,
    }} />
  );
}

// ── Avatar (round, with image or letter) ──────────────────────
function AvatarCircle({ src, letter, bg, size = 48, status }: { src?: string; letter?: string; bg?: string; size?: number; status?: "online" | "offline" }) {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
      <div style={{
        width: size, height: size, borderRadius: size,
        background: bg ?? "#EEEEEE", border: "1px solid #E7E7E7",
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {src ? <img src={src} alt="" style={{ width: size + 3, height: size + 3, objectFit: "cover" }} />
          : <span style={{ fontSize: size * 0.5, fontWeight: 500, color: "#FFF" }}>{letter}</span>}
      </div>
      {status === "online" && null}
    </div>
  );
}

// ── Grid avatar (4-cell for teams) ────────────────────────────
function GridAvatar({ status }: { status?: "online" | "offline" }) {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: 48, height: 48 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 150,
        background: "#EEEEEE", border: "0.86px solid #E7E7E7",
        overflow: "hidden", position: "relative",
      }}>
        <div style={{ position: "absolute", width: 48, height: 24, left: 0, top: 0, overflow: "hidden" }}>
          <img src="/icons/claw-mgr/1.svg" alt="" style={{ position: "absolute", left: 11.2, top: -0.8 }} />
        </div>
        <div style={{ position: "absolute", width: 24, height: 24, left: 0, top: 24, overflow: "hidden" }}>
          <img src="/icons/claw-mgr/2.svg" alt="" style={{ position: "absolute", left: -0.53, top: -0.62, width: 25.5, height: 25.5 }} />
        </div>
        <div style={{ position: "absolute", width: 24, height: 24, left: 24, top: 24, overflow: "hidden" }}>
          <img src="/icons/claw-mgr/3.svg" alt="" style={{ position: "absolute", left: 0, top: 0 }} />
        </div>
      </div>
      {status === "online" && null}
    </div>
  );
}

// ── Create card ───────────────────────────────────────────────
function CreateCard({ label }: { label: string }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: 168, minHeight: 168, background: "transparent", borderRadius: 16,
        border: `1px dashed ${C.border}`, cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "box-shadow 150ms",
        boxShadow: h ? C.hoverShadow : "none",
      }}
    >
      <span style={{ fontSize: 24, color: C.textTertiary }}>+</span>
      <span style={{ fontSize: 14, color: C.textSecondary }}>{label}</span>
    </div>
  );
}

// ── Connected badge ───────────────────────────────────────────
function ConnectedBadge() {
  return (
    <span style={{
      fontSize: 12, fontWeight: 400, color: "#2BA471",
      background: "#E3F9E9", borderRadius: 9999, padding: "0 8px", lineHeight: "20px",
    }}>已连接</span>
  );
}

// ── Main component ────────────────────────────────────────────
export default function ClawManager() {
  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      fontFamily: FONT, background: C.bg,
    }}>
      <div style={{
        height: 50, flexShrink: 0, display: "flex", alignItems: "center",
        padding: "0 24px", borderBottom: `1px solid ${C.border}`, background: C.bg,
      }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary }}>Claw广场</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        {/* 团队 */}
        <SectionTitle title="团队" desc="拉取不同种Claw组建团队，协作完成复杂任务" />
        <div style={{ display: "flex", gap: 16, padding: "0 24px 8px", flexWrap: "wrap", alignItems: "stretch" }}>
          <Card
            avatar={<GridAvatar status="online" />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>大数据团队 (3)</span>}
            desc="包含大数据分析专家和大数据运维专家的协作团队"
          />
          <CreateCard label="创建团队" />
        </div>

        {/* 大数据专家 */}
        <SectionTitle title="大数据专家" desc="内置专家团队，开箱即用" />
        <div style={{ display: "flex", gap: 16, padding: "0 24px 8px", flexWrap: "wrap" }}>
          <Card
            avatar={<AvatarCircle src="/icons/claw-mgr/7.svg" status="online" />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Rigel·数据开发专家</span>}
            desc="从海量数据中提取关键洞察，构建数据模型与可视化报告，为业务决策提供数据驱动支持"
          />
          <Card
            avatar={<AvatarCircle src="/icons/claw-mgr/10.svg" status="online" />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Vega·数据分析专家</span>}
            desc="从海量数据中提取关键洞察，构建数据模型与可视化报告，为业务决策提供数据驱动支持"
          />
          <Card
            avatar={<AvatarCircle src="/icons/claw-mgr/13.svg" status="online" />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Orion·数据运维专家</span>}
            desc="从海量数据中提取关键洞察，构建数据模型与可视化报告，为业务决策提供数据驱动支持"
          />
        </div>

        {/* 数字分身 */}
        <SectionTitle title="数字分身" desc="定制你的专属AI分身，沉淀个人知识" />
        <div style={{ display: "flex", gap: 16, padding: "0 24px 8px", flexWrap: "wrap", alignItems: "stretch" }}>
          <Card
            avatar={<AvatarCircle letter="运" bg="#E59858" />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>运营助手</span>}
            desc="个人定制的运营分析助手，沉淀了日常运营经验"
          />
          <CreateCard label="创建数字分身" />
        </div>

        {/* 外部 Claw */}
        <SectionTitle title="外部 Claw" desc="连接外部AI平台的Agent" />
        <div style={{ display: "flex", gap: 16, padding: "0 24px 24px", flexWrap: "wrap", alignItems: "stretch" }}>
          <Card
            avatar={<AvatarCircle letter="L" bg="#3BAFB9" />}
            name={<span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Lighthouse</span>}
            desc="腾讯云轻量应用服务器，一键连接云端实例"
            button={<DialogBtn label="连接" icon={false} />}
          />
          <Card
            avatar={<AvatarCircle letter="L" bg="#7B68EE" />}
            name={<>
              <span style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Lighthouse</span>
              <ConnectedBadge />
            </>}
            desc="腾讯云轻量应用服务器，一键连接云端实例"
            button={<DialogBtn label="取消连接" icon={false} />}
          />
          <CreateCard label="创建外部 Claw" />
        </div>
      </div>
    </div>
  );
}
