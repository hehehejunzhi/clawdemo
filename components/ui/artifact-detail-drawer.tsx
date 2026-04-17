"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconChevronLeft, IconChevronDown, IconClose, IconCheck } from "./wedata-icons";

// ── Design DNA tokens ────────────────────────────────────────────
const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const TEXT_PRIMARY = "rgba(0,0,0,0.9)";
const TEXT_SECONDARY = "rgba(0,0,0,0.7)";
const TEXT_TERTIARY = "rgba(0,0,0,0.5)";
const BG_PANEL = "#ffffff";
const BG_ACTIVE = "#f2f4f8";
const BG_LIGHTEN = "#f7f8fb";
const BORDER_SECONDARY = "#e9ecf1";
const BORDER_PRIMARY = "#e6e9ef";
const HOVER_BG = "rgba(0,0,0,0.04)";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ── Mock table data ──────────────────────────────────────────────
const TABLE_HEADER = ["地区", "销售额（万）", "销售额占比"];
const TABLE_ROWS = [
  ["北京", "80", "30%"],
  ["上海", "60", "30%"],
  ["广州", "60", "20%"],
  ["深圳", "50", "10%"],
  ["深圳", "20", "10%"],
  ["深圳", "20", "5%"],
  ["深圳", "20", "2%"],
  ["深圳", "20", "2%"],
];

// ── File type icon SVGs for dropdown (reuse from artifacts-panel) ─
const DROPDOWN_ICON_FILL = "#D3D9E5";
const FILE_TYPE_DROPDOWN_ICONS: Record<string, { viewBox: string; d: string | string[] }> = {
  html: { viewBox: "0 0 15.75 19.25", d: "M10.8624 0H0V19.25H15.75V4.88756L10.8624 0ZM10.0625 5.6875V1.75L14 5.6875H10.0625ZM5.50642 15.0563L2.7002 12.2501L5.50641 9.44385L6.74385 10.6813L5.17507 12.2501L6.74386 13.8188L5.50642 15.0563ZM9.00628 13.8188L10.5751 12.2501L9.00628 10.6813L10.2437 9.44385L13.0499 12.2501L10.2437 15.0563L9.00628 13.8188Z" },
  sql: { viewBox: "0 0 17.5 19.25", d: ["M15.4906 6.63926C13.685 7.24111 11.302 7.58333 8.75 7.58333C6.198 7.58333 3.81497 7.24111 2.00942 6.63926C1.28515 6.39783 0.589921 6.09375 0 5.70943V9.47632C0 11.0871 3.91751 12.393 8.75 12.393C13.5825 12.393 17.5 11.0871 17.5 9.47632V5.70943C16.9101 6.09375 16.2149 6.39783 15.4906 6.63926Z","M17.5 12.2691C16.9101 12.6534 16.2149 12.9575 15.4906 13.1989C13.685 13.8008 11.302 14.143 8.75 14.143C6.198 14.143 3.81497 13.8008 2.00942 13.1989C1.28515 12.9575 0.589921 12.6534 0 12.2691V16.3333C0 17.9441 3.91751 19.2499 8.75 19.2499C13.5825 19.2499 17.5 17.9441 17.5 16.3333L17.5 16.3242L17.5 12.2691Z","M8.75 5.83333C3.91751 5.83333 0 4.5275 0 2.91667L4.08354e-06 2.91382C0.00461908 1.3043 3.92036 0 8.75 0C12.3744 0 15.4841 0.734533 16.8124 1.78137C17.2552 2.13031 17.5 2.51396 17.5 2.91667C17.5 4.5275 13.5825 5.83333 8.75 5.83333Z"] },
  md: { viewBox: "0 0 15.75 19.25", d: "M15.75 4.8877V19.25H0V0H10.8623L15.75 4.8877ZM3.5 8.75V16.625H5.25V10.5H7V16.625H8.75V10.5H10.5V16.625H12.25V10.1249C12.2499 9.36558 11.6344 8.75007 10.8751 8.75H3.5ZM10.0625 5.6875H14L10.0625 1.75V5.6875Z" },
  notebook: { viewBox: "0 0 15.75 17.5", d: "M3.5 0C1.567 0 0 1.567 0 3.5V14C0 15.933 1.567 17.5 3.5 17.5H15.75V0H3.5ZM7 2.625H13.125V4.375H7V2.625ZM1.75 14C1.75 13.0335 2.5335 12.25 3.5 12.25H14V15.75H3.5C2.5335 15.75 1.75 14.9665 1.75 14Z" },
};

// ── Types ────────────────────────────────────────────────────────
interface ArtifactItem {
  id: string;
  title: string;
  description: string;
}

interface ArtifactDetailDrawerProps {
  artifact: ArtifactItem | null;
  allArtifacts?: ArtifactItem[];
  onBack: () => void;
  onSelectArtifact?: (a: ArtifactItem) => void;
}

// ── Component ────────────────────────────────────────────────────
export default function ArtifactDetailDrawer({ artifact, allArtifacts, onBack, onSelectArtifact }: ArtifactDetailDrawerProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  if (!artifact) return null;

  // Strip extension for display title
  const docTitle = artifact.title.replace(/\.[^.]+$/, "");

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.22, ease: EASE }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        background: BG_PANEL,
        borderLeft: `1px solid ${BORDER_SECONDARY}`,
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── 标题栏 84px ── */}
      <div
        style={{
          height: 84,
          flexShrink: 0,
          display: "flex",
          gap: 8,
          alignItems: "center",
          padding: "0 24px",
        }}
      >
        {/* 左侧: 返回 + 文件名 + chevron + dropdown */}
        <div style={{ flex: "1 0 0", display: "flex", gap: 4, alignItems: "center", height: "100%", minWidth: 0 }}>
          <div ref={dropdownRef} style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0, position: "relative" }}>
            {/* 返回按钮 */}
            <BackButton onClick={onBack} />
            {/* 文件名 + chevron (dropdown trigger) */}
            <div
              onClick={() => setDropdownOpen(v => !v)}
              style={{
                display: "flex",
                gap: 4,
                alignItems: "center",
                padding: "3px 6px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  lineHeight: "22px",
                  color: TEXT_PRIMARY,
                  whiteSpace: "nowrap",
                }}
              >
                {artifact.title}
              </span>
              <IconChevronDown size={16} color={TEXT_PRIMARY} />
            </div>

            {/* ── 下拉菜单 ── */}
            {dropdownOpen && allArtifacts && allArtifacts.length > 0 && (
              <ArtifactDropdown
                items={allArtifacts}
                currentId={artifact.id}
                onSelect={(a) => {
                  setDropdownOpen(false);
                  onSelectArtifact?.(a);
                }}
              />
            )}
          </div>
        </div>

        {/* 右侧: 关闭 */}
        <CloseButton onClick={onBack} />
      </div>

      {/* ── 可滚动内容区 ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "0 24px 24px",
          scrollbarWidth: "none",
        }}
      >
        {/* 文档标题 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, whiteSpace: "nowrap" }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, lineHeight: "39px", color: TEXT_PRIMARY, margin: 0, textAlign: "justify" }}>
            {docTitle}
          </h1>
          <p style={{ fontSize: 14, fontWeight: 400, lineHeight: "22px", color: TEXT_TERTIARY, margin: 0 }}>
            V1.3 2025-06-10
          </p>
        </div>

        {/* 引言 */}
        <div style={{ paddingTop: 20, display: "flex", alignItems: "center" }}>
          <p style={{ ...bodyStyle, flex: "1 0 0" }}>
            引言：在当前激烈的市场竞争环境下，深入了解各地区的销售状况以及用户动态，对于企业精准制定营销策略、优化资源配置具有至关重要的意义。本报告旨在通过对最近一个月各地区销售额和用户数的详细分析，为企业决策层提供数据支持，助力企业实现可持续发展。
          </p>
        </div>

        {/* 一、数据来源与分析方法 */}
        <div style={{ paddingTop: 20, display: "flex", flexDirection: "column", gap: 4, textAlign: "justify", color: TEXT_PRIMARY }}>
          <h2 style={h2Style}>一、数据来源与分析方法</h2>
          <p style={bodyStyle}>
            数据来源于公司内部的销售管理系统以及用户信息数据库，涵盖了最近一个月（2025 年 6 月 10 号至 2025 年 7 月 10 号）内所有地区的交易记录和用户数据。在分析方法上，主要运用了数据透视表、图表可视化等工具，对原始数据进行汇总、对比和趋势分析。
          </p>
        </div>

        {/* 二、各地区销售额分析 */}
        <div style={{ paddingTop: 20, display: "flex", alignItems: "center" }}>
          <h2 style={{ ...h2Style, flex: "1 0 0" }}>二、各地区销售额分析</h2>
        </div>

        {/* 2.1 总体销售额概览 */}
        <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 4, textAlign: "justify", color: TEXT_PRIMARY }}>
          <h3 style={h3Style}>2.1 总体销售额概览</h3>
          <p style={bodyStyle}>
            在过去一个月，总体销售额达到了 785.6 万元；从地区分布来看，各地区销售额呈现出明显的差异，具体数据及占比如图 1 所示。
          </p>
        </div>

        {/* 数据表格 */}
        <div style={{ paddingTop: 12, paddingBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              border: `1.5px solid ${BORDER_SECONDARY}`,
              borderRadius: 16,
              overflow: "hidden",
              width: "100%",
            }}
          >
            {/* 表头 */}
            <div style={{ display: "flex", height: 44 }}>
              {TABLE_HEADER.map((h, i) => (
                <div
                  key={i}
                  style={{
                    ...(i === 0 ? { width: 200, flexShrink: 0 } : { flex: "1 0 0", minWidth: 0 }),
                    background: BG_LIGHTEN,
                    border: `1px solid ${BORDER_SECONDARY}`,
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 16px",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, lineHeight: "22px", color: TEXT_PRIMARY, textAlign: "justify", flex: "1 0 0" }}>
                    {h}
                  </span>
                </div>
              ))}
            </div>

            {/* 数据行 */}
            {TABLE_ROWS.map((row, ri) => (
              <div key={ri} style={{ display: "flex", height: 46 }}>
                {row.map((cell, ci) => (
                  <div
                    key={ci}
                    style={{
                      ...(ci === 0 ? { width: 200, flexShrink: 0 } : { flex: "1 0 0", minWidth: 0 }),
                      background: BG_PANEL,
                      border: `1px solid ${BORDER_SECONDARY}`,
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 16px",
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 400, lineHeight: "22px", color: TEXT_PRIMARY, flex: "1 0 0", ...(ci === 0 ? { textAlign: "justify" as const } : {}) }}>
                      {cell}
                    </span>
                  </div>
                ))}
              </div>
            ))}

            {/* 分页栏 */}
            <div
              style={{
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 400, lineHeight: "20px", color: TEXT_SECONDARY, whiteSpace: "nowrap" }}>
                共 101 项数据
              </span>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {/* 每页条数 */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    padding: "2px 8px",
                    border: `1px solid ${BORDER_PRIMARY}`,
                    borderRadius: 3,
                    width: 88,
                    background: BG_PANEL,
                  }}
                >
                  <span style={{ fontSize: 12, lineHeight: "20px", color: TEXT_PRIMARY, flex: "1 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    10 条/页
                  </span>
                  <IconChevronDown size={14} color={TEXT_PRIMARY} />
                </div>
                {/* 翻页控件 */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <IconChevronLeft size={14} color={TEXT_PRIMARY} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      padding: "2px 8px",
                      borderRadius: 3,
                      width: 144,
                      background: BG_ACTIVE,
                    }}
                  >
                    <span style={{ fontSize: 12, lineHeight: "20px", color: TEXT_SECONDARY, whiteSpace: "nowrap", textAlign: "center" }}>跳至</span>
                    <div
                      style={{
                        flex: "1 0 0",
                        background: BG_PANEL,
                        border: `1px solid ${BORDER_PRIMARY}`,
                        borderRadius: 3,
                        padding: "0 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <span style={{ fontSize: 12, lineHeight: "20px", color: TEXT_PRIMARY, textAlign: "center", whiteSpace: "nowrap" }}>11</span>
                    </div>
                    <span style={{ fontSize: 12, lineHeight: "20px", color: TEXT_SECONDARY, whiteSpace: "nowrap", textAlign: "center" }}>/20 页</span>
                  </div>
                  <div style={{ width: 24, height: 24, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transform: "rotate(180deg)" }}>
                    <IconChevronLeft size={14} color={TEXT_PRIMARY} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 图注 */}
          <p style={{ fontSize: 14, fontWeight: 400, lineHeight: "22px", color: TEXT_TERTIARY, textAlign: "center", width: "100%", margin: 0 }}>
            图 1 2025 年 6 至 7 月各地区销售额总览
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Shared text styles ───────────────────────────────────────────
const bodyStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 400,
  lineHeight: "28px",
  color: TEXT_PRIMARY,
  margin: 0,
  textAlign: "justify",
};

const h2Style: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  lineHeight: "35px",
  color: TEXT_PRIMARY,
  margin: 0,
};

const h3Style: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  lineHeight: "32px",
  color: TEXT_PRIMARY,
  margin: 0,
};

// ── Back button (32×32, bg #f2f4f8) ─────────────────────────────
function BackButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      aria-label="返回"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32,
        height: 32,
        borderRadius: 100,
        border: "none",
        background: hovered ? "#e8eaef" : BG_ACTIVE,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        transition: "background 0.15s ease",
        flexShrink: 0,
      }}
    >
      <IconChevronLeft size={20} color={TEXT_PRIMARY} />
    </button>
  );
}

// ── Close button (32×32) ─────────────────────────────────────────
function CloseButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      aria-label="关闭"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32,
        height: 32,
        borderRadius: 100,
        border: "none",
        background: hovered ? HOVER_BG : "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        transition: "background 0.15s ease",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <IconClose size={16} color={TEXT_TERTIARY} />
    </button>
  );
}

// ── Dropdown menu ────────────────────────────────────────────────
function ArtifactDropdown({
  items,
  currentId,
  onSelect,
}: {
  items: ArtifactItem[];
  currentId: string;
  onSelect: (a: ArtifactItem) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 36,
        marginTop: 4,
        background: BG_PANEL,
        borderRadius: 16,
        padding: 8,
        boxShadow: "0px 8px 12px 0px rgba(0,0,0,0.05), 0px 8px 24px 0px rgba(0,0,0,0.1)",
        zIndex: 20,
        minWidth: 320,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {items.map((item) => {
        const ext = item.title.split(".").pop()?.toLowerCase() ?? "";
        const isActive = item.id === currentId;
        return (
          <DropdownItem
            key={item.id}
            title={item.title}
            ext={ext}
            isActive={isActive}
            onClick={() => onSelect(item)}
          />
        );
      })}
    </div>
  );
}

// ── Dropdown item ────────────────────────────────────────────────
function DropdownItem({
  title,
  ext,
  isActive,
  onClick,
}: {
  title: string;
  ext: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  const iconData = FILE_TYPE_DROPDOWN_ICONS[ext];
  const paths = iconData ? (Array.isArray(iconData.d) ? iconData.d : [iconData.d]) : [];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        gap: 8,
        height: 32,
        alignItems: "center",
        padding: "3px 8px",
        borderRadius: 8,
        cursor: "pointer",
        background: hovered ? "rgba(0,0,0,0.04)" : "transparent",
        transition: "background 0.1s ease",
      }}
    >
      <div style={{ display: "flex", flex: "1 0 0", gap: 12, alignItems: "center", overflow: "hidden", minWidth: 0 }}>
        {/* File type icon 16×16 */}
        <div style={{ width: 16, height: 16, flexShrink: 0, position: "relative" }}>
          {iconData && (
            <svg viewBox={iconData.viewBox} fill="none" style={{ position: "absolute", inset: "4% 8%", width: "84%", height: "92%" }}>
              {paths.map((d, i) => (
                <path key={i} d={d} fill={DROPDOWN_ICON_FILL} />
              ))}
            </svg>
          )}
        </div>
        {/* Title */}
        <span
          style={{
            flex: "1 0 0",
            fontSize: 14,
            fontWeight: 400,
            lineHeight: "22px",
            color: TEXT_PRIMARY,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </span>
        {/* Check mark for active item */}
        {isActive && <IconCheck size={16} color="#2196F3" />}
      </div>
    </div>
  );
}
