"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconClose, IconArrowRightUp } from "./wedata-icons";
import ArtifactDetailDrawer from "./artifact-detail-drawer";

// ── Design DNA tokens ────────────────────────────────────────────
const FONT =
  "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const TEXT_PRIMARY = "rgba(0,0,0,0.9)";
const TEXT_TERTIARY = "rgba(0,0,0,0.5)";
const BG_PANEL = "#ffffff";
const BG_CARD = "#f7f8fb";
const BORDER_PANEL = "#e9ecf1";
const BORDER_CARD = "#e6e9ef";
const HOVER_BG = "rgba(0,0,0,0.04)";
const PANEL_WIDTH = 636;
const HEADER_HEIGHT = 50;
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const ICON_FILL = "#D3D9E5";

// ── File type → SVG icon path data ───────────────────────────────
// Extracted from Figma: file-code-1-filled, data-base-filled, file-markdown-filled, book-filled
const FILE_TYPE_ICONS: Record<string, { viewBox: string; d: string | string[] }> = {
  html: {
    viewBox: "0 0 15.75 19.25",
    d: "M10.8624 0H0V19.25H15.75V4.88756L10.8624 0ZM10.0625 5.6875V1.75L14 5.6875H10.0625ZM5.50642 15.0563L2.7002 12.2501L5.50641 9.44385L6.74385 10.6813L5.17507 12.2501L6.74386 13.8188L5.50642 15.0563ZM9.00628 13.8188L10.5751 12.2501L9.00628 10.6813L10.2437 9.44385L13.0499 12.2501L10.2437 15.0563L9.00628 13.8188Z",
  },
  sql: {
    viewBox: "0 0 17.5 19.25",
    d: [
      "M15.4906 6.63926C13.685 7.24111 11.302 7.58333 8.75 7.58333C6.198 7.58333 3.81497 7.24111 2.00942 6.63926C1.28515 6.39783 0.589921 6.09375 0 5.70943V9.47632C0 11.0871 3.91751 12.393 8.75 12.393C13.5825 12.393 17.5 11.0871 17.5 9.47632V5.70943C16.9101 6.09375 16.2149 6.39783 15.4906 6.63926Z",
      "M17.5 12.2691C16.9101 12.6534 16.2149 12.9575 15.4906 13.1989C13.685 13.8008 11.302 14.143 8.75 14.143C6.198 14.143 3.81497 13.8008 2.00942 13.1989C1.28515 12.9575 0.589921 12.6534 0 12.2691V16.3333C0 17.9441 3.91751 19.2499 8.75 19.2499C13.5825 19.2499 17.5 17.9441 17.5 16.3333L17.5 16.3242L17.5 12.2691Z",
      "M8.75 5.83333C3.91751 5.83333 0 4.5275 0 2.91667L4.08354e-06 2.91382C0.00461908 1.3043 3.92036 0 8.75 0C12.3744 0 15.4841 0.734533 16.8124 1.78137C17.2552 2.13031 17.5 2.51396 17.5 2.91667C17.5 4.5275 13.5825 5.83333 8.75 5.83333Z",
    ],
  },
  md: {
    viewBox: "0 0 15.75 19.25",
    d: "M15.75 4.8877V19.25H0V0H10.8623L15.75 4.8877ZM3.5 8.75V16.625H5.25V10.5H7V16.625H8.75V10.5H10.5V16.625H12.25V10.1249C12.2499 9.36558 11.6344 8.75007 10.8751 8.75H3.5ZM10.0625 5.6875H14L10.0625 1.75V5.6875Z",
  },
  notebook: {
    viewBox: "0 0 15.75 17.5",
    d: "M3.5 0C1.567 0 0 1.567 0 3.5V14C0 15.933 1.567 17.5 3.5 17.5H15.75V0H3.5ZM7 2.625H13.125V4.375H7V2.625ZM1.75 14C1.75 13.0335 2.5335 12.25 3.5 12.25H14V15.75H3.5C2.5335 15.75 1.75 14.9665 1.75 14Z",
  },
};

function getFileExt(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

// ── Mock data ────────────────────────────────────────────────────
interface Artifact {
  id: string;
  title: string;
  description: string;
}

interface ArtifactGroup {
  expert: string;
  icon: string;
  items: Artifact[];
}

const MOCK_ARTIFACT_GROUPS: ArtifactGroup[] = [
  {
    expert: "智能管家过程产物",
    icon: "/agents/ops-expert.png",
    items: [
      { id: "1", title: "2025 年 6 至 7 月各地区的复购率设计方案.html", description: "数据读取脚本 · 从源表读取原始数据" },
      { id: "2", title: "clean_null_value.sql", description: "数据清洗脚本 · 空值过滤与格式标准化" },
      { id: "3", title: "read_source_data.sql", description: "数据读取脚本 · 从源表读取原始数据" },
      { id: "4", title: "clean_null_value.md", description: "数据清洗脚本 · 空值过滤与格式标准化" },
    ],
  },
  {
    expert: "数据工程专家过程产物",
    icon: "/agents/dev-expert.png",
    items: [
      { id: "5", title: "read_source_data.md", description: "数据读取脚本 · 从源表读取原始数据" },
      { id: "6", title: "clean_null_value.sql", description: "数据清洗脚本 · 空值过滤与格式标准化" },
      { id: "7", title: "read_source_data.notebook", description: "数据读取脚本 · 从源表读取原始数据" },
      { id: "8", title: "clean_null_value.notebook", description: "数据清洗脚本 · 空值过滤与格式标准化" },
    ],
  },
];

const MOCK_ALL_ARTIFACTS: Artifact[] = MOCK_ARTIFACT_GROUPS.flatMap((g) => g.items);

// ── Types ────────────────────────────────────────────────────────
interface ArtifactsPanelProps {
  open: boolean;
  onClose: () => void;
  phase?: number;
  singleExpert?: boolean;
}

// ── Component ────────────────────────────────────────────────────
export default function ArtifactsPanel({ open, onClose, phase = 1, singleExpert = false }: ArtifactsPanelProps) {
  const [selectedArtifact, setSelectedArtifact] = React.useState<Artifact | null>(null);
  const [activeTab, setActiveTab] = React.useState<"artifacts" | "overview" | "logs">("overview");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-role="artifacts-panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: PANEL_WIDTH, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          style={{
            height: "100%",
            flexShrink: 0,
            overflow: "hidden",
            background: BG_PANEL,
            borderLeft: `1px solid ${BORDER_PANEL}`,
            fontFamily: FONT,
            display: "flex",
            maxWidth: "50vw",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* ── Tab 标题栏 ── */}
          <div
            style={{
              height: HEADER_HEIGHT,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
            }}
          >
            {/* Tabs */}
            <div style={{ display: "flex", alignItems: "center", gap: 24, height: "100%" }}>
              {([
                { id: "overview", label: "任务概览" },
                { id: "artifacts", label: "产物" },
              ] as const).map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedArtifact(null); }}
                  style={{ position: "relative", height: 32, display: "flex", alignItems: "center", cursor: "pointer" }}
                >
                  <span style={{
                    fontSize: 14, fontWeight: 500,
                    color: activeTab === tab.id ? TEXT_PRIMARY : "rgba(0,0,0,0.7)",
                    transition: "color 150ms",
                  }}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <div style={{
                      position: "absolute",
                      bottom: 0, left: 0, right: 0,
                      height: 2,
                      background: "#00C8D6",
                      borderRadius: 1,
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Close button */}
            <div
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 100,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", overflow: "hidden",
              }}
            >
              <img src="/icons/panel-tabs/2.svg" alt="" style={{ width: 16, height: 16 }} />
            </div>
          </div>

          {/* ── Tab 内容区 ── */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              padding: "0 24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              scrollbarWidth: "none",
            }}
          >
            {activeTab === "artifacts" && (
              <>
                {MOCK_ARTIFACT_GROUPS.filter((_, gi) => gi === 0 || phase >= 2).map((group) => (
                  <React.Fragment key={group.expert}>
                    {/* Group header — hidden in single expert mode */}
                    {!singleExpert && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 0 4px",
                    }}>
                      <img src={group.icon} alt="" style={{ width: 16, height: 16, flexShrink: 0 }} />
                      <span style={{
                        fontSize: 13, fontWeight: 500, lineHeight: "20px",
                        color: TEXT_TERTIARY,
                      }}>
                        {group.expert}
                      </span>
                    </div>
                    )}
                    {group.items.map((a) => (
                      <ArtifactItem key={a.id} artifact={a} onClick={() => setSelectedArtifact(a)} />
                    ))}
                  </React.Fragment>
                ))}
              </>
            )}
            {activeTab === "overview" && (
              <div style={{ paddingTop: 8 }}>
                {/* 信息区 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Row 1 */}
                  <div style={{ display: "flex" }}>
                    <div style={{ width: "50%", display: "flex", gap: 16 }}>
                      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", width: 64, flexShrink: 0, whiteSpace: "nowrap" }}>执行 Agent</span>
                      <span style={{ fontSize: 12, color: TEXT_PRIMARY }}>{singleExpert ? "智能管家" : "大数据团队"}</span>
                    </div>
                    <div style={{ width: "50%", display: "flex", gap: 16 }}>
                      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", width: 64, flexShrink: 0, whiteSpace: "nowrap" }}>状态</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <img src="/icons/dag/3.svg" alt="" style={{ width: 6, height: 6 }} />
                        <span style={{ fontSize: 12, color: TEXT_PRIMARY }}>执行中</span>
                      </div>
                    </div>
                  </div>
                  {/* Row 2 */}
                  <div style={{ display: "flex" }}>
                    <div style={{ width: "50%", display: "flex", gap: 16 }}>
                      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", width: 64, flexShrink: 0, whiteSpace: "nowrap" }}>开始时间</span>
                      <span style={{ fontSize: 12, color: TEXT_PRIMARY }}>2026-04-14 14:42:33</span>
                    </div>
                    <div style={{ width: "50%", display: "flex", gap: 16 }}>
                      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", width: 64, flexShrink: 0, whiteSpace: "nowrap" }}>已用时长</span>
                      <span style={{ fontSize: 12, color: TEXT_PRIMARY }}>3 分 24 秒</span>
                    </div>
                  </div>
                </div>

                {/* 执行流程标题 */}
                <div style={{ marginTop: 16, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY }}>执行流程</span>
                </div>

                {/* DAG 流程图 — 支持缩放 / 拖拽 */}
                <DagZoomContainer>
                  <style>{`
                    @keyframes dag-pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
                    @keyframes dag-flow { 0% { stroke-dashoffset: 20; } 100% { stroke-dashoffset: 0; } }
                    @keyframes dag-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                  `}</style>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                    {/* 接收用户需求 */}
                    <DagNode label="接收用户需求" status="done" />
                    <DagArrow />

                    {singleExpert ? (
                      <>
                        {/* 单专家模式：只有一个专家卡片，居中显示 */}
                        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                          <div style={{ width: "60%" }}>
                            <ExpertCard
                              name="智能管家"
                              tasks={[
                                { label: "资源监控", icon: "/icons/dag/9.svg", status: phase >= 1 ? "done" : "pending" },
                                { label: "自动扩缩容", icon: "/icons/dag/10.svg", status: phase >= 2 ? "done" : "active" },
                                { label: "故障预警", icon: "/icons/dag/11.svg", status: phase >= 2 ? "active" : "pending" },
                              ]}
                              artifacts={phase >= 1 ? [
                                { label: "Spark查询报告.md", id: "r1" },
                                { label: "emr_query_stats.sql", id: "r2" },
                                { label: "dau_wau_east_7d.sql", id: "r3" },
                                { label: "query_trend_chart.png", id: "r4" },
                              ] : undefined}
                              onArtifactClick={(id) => {
                                const a = MOCK_ALL_ARTIFACTS.find((x) => x.id === id) ?? { id, title: "Spark查询报告.md", description: "业务结论报告 · Markdown 可下载" };
                                setSelectedArtifact(a);
                              }}
                            />
                          </div>
                        </div>
                        <DagArrow />
                      </>
                    ) : (
                      <>
                        {/* 多专家模式：任务解析与调度 → 三个专家卡片 → 结果融合 */}
                        <DagNode label="任务解析与调度" status="done" />
                        <DagArrowFan leftDone centerDone={phase >= 2} rightDone={false} />

                        <DagCardRowWithMerge
                          phase={phase}
                          setSelectedArtifact={setSelectedArtifact}
                          allArtifacts={MOCK_ALL_ARTIFACTS}
                        />

                        {/* 结果融合 */}
                        <DagNode label="结果融合" status="pending" />
                        <DagArrow dashed />
                      </>
                    )}

                    {/* 报告生成 */}
                    <DagNode label="报告生成" status="pending" />
                  </div>
                </DagZoomContainer>
              </div>
            )}
            {activeTab === "logs" && (
              <div style={{ paddingTop: 8 }}>
                <div style={{
                  background: "#FAFBFC",
                  borderRadius: 16,
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}>
                  {[
                    { time: "14:32:05", level: "INFO", agent: "Rigel", msg: "任务启动，开始分析需求..." },
                    { time: "14:32:08", level: "INFO", agent: "Rigel", msg: "解析用户需求：华东区过去 7 天用户活跃度趋势" },
                    { time: "14:32:12", level: "INFO", agent: "Rigel", msg: "检查数据源表 dw_user_behavior 可用性..." },
                    { time: "14:32:54", level: "INFO", agent: "Rigel", msg: "数据源验证通过，共 2,847,312 条记录" },
                    { time: "14:33:05", level: "INFO", agent: "Rigel", msg: "开始设计 DWD 层数据模型" },
                    { time: "14:38:05", level: "INFO", agent: "Rigel", msg: "模型设计完成，生成建表 SQL" },
                    { time: "14:40:01", level: "WARN", agent: "Rigel", msg: "检测到字段 order_time 存在 NULL 值（0.3%），已添加过滤逻辑" },
                    { time: "14:41:40", level: "INFO", agent: "Rigel", msg: "编写 ETL SQL：复购率计算口径确认" },
                    { time: "14:41:40", level: "INFO", agent: "Rigel", msg: "SQL 编译通过，开始试运行…" },
                    { time: "14:41:40", level: "ERROR", agent: "Rigel", msg: "试运行警告：分区 dt=2025-06-11 数据量偏低，已标记" },
                    { time: "14:41:40", level: "INFO", agent: "Rigel", msg: "生成产物 clean_null_value.sql" },
                    { time: "14:41:40", level: "INFO", agent: "Rigel", msg: "生成产物 read_source_data.sql" },
                  ].map((log, i) => (
                    <div key={i} style={{ display: "flex", gap: 0, lineHeight: "20px", fontSize: 12.4 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(0,0,0,0.5)", flexShrink: 0, width: 64 }}>
                        {log.time}
                      </span>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        flexShrink: 0, width: 50,
                        color: log.level === "WARN" ? "#FF7800" : log.level === "ERROR" ? "#F64041" : "#0052D9",
                      }}>
                        {log.level}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#000", flexShrink: 0 }}>
                        [{log.agent}]
                      </span>
                      <span style={{ fontFamily: FONT, color: "#000", marginLeft: 4 }}>
                        {log.msg}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── 产物详情抽屉（覆盖层） ── */}
          <AnimatePresence>
            {selectedArtifact && (
              <ArtifactDetailDrawer
                artifact={selectedArtifact}
                allArtifacts={MOCK_ALL_ARTIFACTS}
                onBack={() => setSelectedArtifact(null)}
                onSelectArtifact={(a) => setSelectedArtifact(a)}
              />
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Close button (32×32, padding 12, icon 16×16) ─────────────────
function CloseButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      aria-label="关闭产物面板"
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

// ── File type icon (tilted card with SVG inside, masked by 56×56 container) ──
// Figma structure:
//   类型图标 (56×56, absolute left:15.5 top:7.5)  ← clip container
//     centering wrapper (58.686×78.485, flex center) ← positions the rotated card
//       -rotate-15 wrapper
//         数据表 (42×70, masked to 56×56 rect)
//           white card (42×70, rounded-10.5, border, shadow)
//           icon SVG (21×21, positioned at left:10.5 top:17.5)
function FileTypeIcon({ ext }: { ext: string }) {
  const iconData = FILE_TYPE_ICONS[ext];
  const paths = iconData
    ? Array.isArray(iconData.d) ? iconData.d : [iconData.d]
    : [];

  return (
    <div
      style={{
        position: "absolute",
        left: 15.5,
        top: 7.5,
        width: 56,
        height: 56,
        overflow: "hidden",
      }}
    >
      {/* Centering wrapper — matches Figma's 58.686×78.485 absolute flex container */}
      <div
        style={{
          position: "absolute",
          left: -0.47,
          top: 0.13,
          width: 58.686,
          height: 78.485,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* -15° rotation wrapper */}
        <div style={{ transform: "rotate(-15deg)", flexShrink: 0 }}>
          {/* 数据表: 42×70 card — the bottom overflows and gets clipped by the 56×56 parent */}
          <div style={{ position: "relative", width: 42, height: 70 }}>
            {/* White card background with border & shadow */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 42,
                height: 70,
                borderRadius: 10.5,
                background: BG_PANEL,
                border: "none",
                boxShadow: "0px 3.5px 3.5px -1.75px rgba(0,0,0,0.16)",
              }}
            />
            {/* File type SVG icon — 21×21 at left:10.5 top:17.5 */}
            {iconData && (
              <svg
                viewBox={iconData.viewBox}
                fill="none"
                style={{
                  position: "absolute",
                  left: 10.5,
                  top: 17.5,
                  width: 21,
                  height: 21,
                }}
              >
                {paths.map((d, i) => (
                  <path key={i} d={d} fill={ICON_FILL} />
                ))}
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Artifact card (64px) ─────────────────────────────────────────
function ArtifactItem({ artifact, onClick }: { artifact: Artifact; onClick?: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  const ext = getFileExt(artifact.title);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 64,
        borderRadius: 16,
        background: hovered ? "#f0f2f5" : BG_CARD,
        border: `0.5px solid ${BORDER_CARD}`,
        display: "flex",
        gap: 8,
        alignItems: "center",
        paddingLeft: 88,
        paddingRight: 16,
        paddingTop: 12,
        paddingBottom: 12,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transition: "background 0.15s ease",
        flexShrink: 0,
      }}
    >
      {/* ── 左侧文件类型图标（倾斜卡片 + SVG） ── */}
      <FileTypeIcon ext={ext} />

      {/* ── 文字区域 ── */}
      <div
        style={{
          flex: "1 0 0",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            lineHeight: "22px",
            color: TEXT_PRIMARY,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            width: "100%",
          }}
        >
          {artifact.title}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 400,
            lineHeight: "20px",
            color: TEXT_TERTIARY,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            width: "100%",
          }}
        >
          {artifact.description}
        </span>
      </div>

      {/* ── 右侧箭头 ── */}
      <div style={{ flexShrink: 0, overflow: "hidden", width: 16, height: 16 }}>
        <IconArrowRightUp size={16} color={TEXT_TERTIARY} />
      </div>
    </div>
  );
}

// ── DAG components (redesigned per figma 13_39141) ──────────────

const EDGE_COLOR = "#9EACBE";
const EDGE_DASHED = "6 4";
const EDGE_W = "0.87";

// ── DAG zoom / pan container ────────────────────────────────────
const MIN_SCALE = 0.3;
const MAX_SCALE = 3;
const ZOOM_STEP = 0.15;

function DagZoomContainer({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = React.useState(1);
  const [translate, setTranslate] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const [initScale, setInitScale] = React.useState(1);
  const dragStart = React.useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);

  // Auto-fit width on mount (retry to handle late renders)
  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const doFit = () => {
      const cw = container.clientWidth;
      const prev = canvas.style.transform;
      canvas.style.transform = "none";
      const sw = canvas.scrollWidth;
      canvas.style.transform = prev;
      if (sw > 0 && cw > 0) {
        const fit = Math.min(cw / sw, 1);
        setInitScale(fit);
        setScale(fit);
        setTranslate({ x: 0, y: 0 });
        return true;
      }
      return false;
    };

    // Try multiple times in case content hasn't rendered
    let attempts = 0;
    const tryFit = () => {
      if (doFit() || attempts > 10) return;
      attempts++;
      setTimeout(tryFit, 100);
    };
    const timer = setTimeout(tryFit, 80);

    // Also re-fit when canvas resizes (e.g. cards rendered)
    const observer = new ResizeObserver(() => doFit());
    observer.observe(canvas);

    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);

  const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale((prev) => {
      const next = clampScale(prev + delta);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const factor = next / prev;
        setTranslate((t) => ({
          x: cx - factor * (cx - t.x),
          y: cy - factor * (cy - t.y),
        }));
      }
      return next;
    });
  }, []);

  const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.target as HTMLElement).closest("[data-dag-canvas]"))) {
      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, [translate]);

  const handlePointerMove = React.useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    setTranslate({
      x: dragStart.current.tx + (e.clientX - dragStart.current.x),
      y: dragStart.current.ty + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handlePointerUp = React.useCallback(() => {
    setDragging(false);
  }, []);

  const resetView = React.useCallback(() => {
    setScale(initScale);
    setTranslate({ x: 0, y: 0 });
  }, [initScale]);

  const zoomIn = React.useCallback(() => {
    setScale((s) => clampScale(s + ZOOM_STEP));
  }, []);

  const zoomOut = React.useCallback(() => {
    setScale((s) => clampScale(s - ZOOM_STEP));
  }, []);

  const scalePercent = initScale > 0 ? Math.round((scale / initScale) * 100) : 100;

  return (
    <div style={{
      background: "#FAFBFC",
      borderRadius: 16,
      overflow: "hidden",
      position: "relative",
      cursor: dragging ? "grabbing" : "grab",
      touchAction: "none",
      userSelect: "none",
    }}
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Transformable canvas */}
      <div
        ref={canvasRef}
        data-dag-canvas
        style={{
          padding: "40px 24px",
          transformOrigin: "0 0",
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transition: dragging ? "none" : "transform 0.1s ease-out",
        }}
      >
        {children}
      </div>

      {/* Zoom controls — bottom-right */}
      <div style={{
        position: "absolute",
        bottom: 12,
        right: 12,
        display: "flex",
        alignItems: "center",
        gap: 2,
        background: "#FFFFFF",
        borderRadius: 8,
        border: "1px solid #E6E9EF",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
        padding: "2px 4px",
        zIndex: 10,
        pointerEvents: "auto",
      }}>
        <ZoomBtn label="−" onClick={zoomOut} disabled={scale <= MIN_SCALE} />
        <div
          onClick={resetView}
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "rgba(0,0,0,0.6)",
            minWidth: 40,
            textAlign: "center",
            cursor: "pointer",
            lineHeight: "24px",
            userSelect: "none",
          }}
          title="重置缩放"
        >
          {scalePercent}%
        </div>
        <ZoomBtn label="+" onClick={zoomIn} disabled={scale >= MAX_SCALE} />
        {/* Divider */}
        <div style={{ width: 1, height: 16, background: "#E6E9EF", margin: "0 2px" }} />
        {/* Reset button — fit-to-view icon */}
        <div
          onClick={resetView}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.06)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          title="重置视图"
          style={{
            width: 24, height: 24, borderRadius: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", background: "transparent",
            transition: "background 0.1s", userSelect: "none",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 4.5V1.5C1 1.224 1.224 1 1.5 1H4.5" stroke="rgba(0,0,0,0.7)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.5 1H12.5C12.776 1 13 1.224 13 1.5V4.5" stroke="rgba(0,0,0,0.7)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 9.5V12.5C13 12.776 12.776 13 12.5 13H9.5" stroke="rgba(0,0,0,0.7)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.5 13H1.5C1.224 13 1 12.776 1 12.5V9.5" stroke="rgba(0,0,0,0.7)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ZoomBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 24,
        height: 24,
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        background: hovered && !disabled ? "rgba(0,0,0,0.06)" : "transparent",
        color: disabled ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.7)",
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1,
        userSelect: "none",
        transition: "background 0.1s",
      }}
    >
      {label}
    </div>
  );
}

// Card row + dynamic merge lines that connect from each card's actual bottom center
function DagCardRowWithMerge({ phase, setSelectedArtifact, allArtifacts }: {
  phase: number;
  setSelectedArtifact: (a: { id: string; title: string; description: string }) => void;
  allArtifacts: { id: string; title: string; description: string }[];
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const card1Ref = React.useRef<HTMLDivElement>(null);
  const card2Ref = React.useRef<HTMLDivElement>(null);
  const card3Ref = React.useRef<HTMLDivElement>(null);
  const [mergeLines, setMergeLines] = React.useState<{ x: number; y: number; done: boolean }[]>([]);
  const [containerW, setContainerW] = React.useState(0);
  const [maxCardH, setMaxCardH] = React.useState(0);

  React.useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      setContainerW(cRect.width);

      const refs = [card1Ref, card2Ref, card3Ref];
      const doneFlags = [false, false, false]; // merge lines always dashed (flow not complete)
      const lines: { x: number; y: number; done: boolean }[] = [];
      let mh = 0;

      refs.forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left - cRect.left + r.width / 2;
        const cy = r.top - cRect.top + r.height;
        lines.push({ x: cx, y: cy, done: doneFlags[i] });
        if (r.height > mh) mh = r.height;
      });

      setMergeLines(lines);
      setMaxCardH(mh);
    };

    const timer = setTimeout(measure, 60);
    const observer = new ResizeObserver(() => setTimeout(measure, 30));
    if (containerRef.current) observer.observe(containerRef.current);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [phase]);

  // Merge SVG height: from max card bottom to the merge point (72px below max card)
  const mergeH = 72;
  const totalH = maxCardH + mergeH;
  const mergeCx = containerW / 2;
  // Unified horizontal Y: all branches bend at same height (maxCardH + 20)
  const unifiedMidY = maxCardH + 20;

  const makePath = (sx: number, sy: number) => {
    const endY = totalH - 5;
    if (Math.abs(sx - mergeCx) < 2) {
      // Center: straight line from card bottom to arrow
      return `M${sx} ${sy}V${endY}`;
    }
    // Side branches: down from card bottom → bend at unifiedMidY → horizontal to center → down
    const bendR = 13;
    const goingRight = sx < mergeCx;
    if (goingRight) {
      return `M${sx} ${sy}V${unifiedMidY - bendR}C${sx} ${unifiedMidY},${sx + bendR} ${unifiedMidY},${sx + bendR} ${unifiedMidY}H${mergeCx - bendR}C${mergeCx} ${unifiedMidY},${mergeCx} ${unifiedMidY + bendR},${mergeCx} ${unifiedMidY + bendR}V${endY}`;
    } else {
      return `M${sx} ${sy}V${unifiedMidY - bendR}C${sx} ${unifiedMidY},${sx - bendR} ${unifiedMidY},${sx - bendR} ${unifiedMidY}H${mergeCx + bendR}C${mergeCx} ${unifiedMidY},${mergeCx} ${unifiedMidY + bendR},${mergeCx} ${unifiedMidY + bendR}V${endY}`;
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Card row */}
      <div style={{ display: "flex", gap: 16, width: "100%", alignItems: "flex-start" }}>
        <div ref={card1Ref} style={{ flex: 1, minWidth: 0 }}>
          <ExpertCard
            name="数据分析专家"
            tasks={[
              { label: "验证鉴权", icon: "/icons/dag/6.svg", status: "done" },
              { label: "Spark 查询", icon: "/icons/dag/7.svg", status: "done" },
              { label: "处理数据", icon: "/icons/dag/8.svg", status: "done" },
            ]}
            artifacts={[
              { label: "Spark 查询报告.md", id: "r1" },
              { label: "emr_query_stats.sql", id: "r2" },
              { label: "dau_wau_east_7d.sql", id: "r3" },
              { label: "query_trend_chart.png", id: "r4" },
            ]}
            onArtifactClick={(id) => {
              const a = allArtifacts.find((x) => x.id === id) ?? { id, title: "Spark 查询报告.md", description: "业务结论报告 · Markdown 可下载" };
              setSelectedArtifact(a);
            }}
          />
        </div>
        <div ref={card2Ref} style={{ flex: 1, minWidth: 0 }}>
          <ExpertCard
            name="数据工程专家"
            tasks={[
              { label: "HDFS 完整性检查", icon: "/icons/dag/12.svg", status: phase >= 2 ? "done" : phase >= 1.5 ? "active" : "pending" },
              { label: "血缘追踪", icon: "/icons/dag/13.svg", status: phase >= 2 ? "done" : phase >= 1.5 ? "active" : "pending" },
              { label: "质量检查", icon: "/icons/dag/14.svg", status: phase >= 2 ? "done" : phase >= 1.5 ? "active" : "pending" },
            ]}
            artifacts={phase >= 2 ? [
              { label: "慢SQL #1 调优分析.md", id: "r5" },
              { label: "optimized_query.sql", id: "r6" },
              { label: "execution_plan.png", id: "r7" },
              { label: "performance_diff.md", id: "r8" },
            ] : undefined}
            onArtifactClick={(id) => {
              const a = allArtifacts.find((x) => x.id === id) ?? { id, title: "慢SQL #1 调优.md", description: "深度调优分析报告" };
              setSelectedArtifact(a);
            }}
          />
        </div>
        <div ref={card3Ref} style={{ flex: 1, minWidth: 0 }}>
          <ExpertCard
            name="智能管家"
            tasks={[
              { label: "资源监控", icon: "/icons/dag/9.svg", status: "pending" },
              { label: "自动扩缩容", icon: "/icons/dag/10.svg", status: "pending" },
              { label: "故障预警", icon: "/icons/dag/11.svg", status: "pending" },
            ]}
          />
        </div>
      </div>

      {/* Dynamic merge SVG overlay */}
      {mergeLines.length === 3 && totalH > 0 && (
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: totalH, pointerEvents: "none" }}
          viewBox={`0 0 ${containerW} ${totalH}`}
          fill="none"
        >
          {mergeLines.map((l, i) => {
            const d = makePath(l.x, l.y);
            return l.done ? (
              <path key={i} d={d} stroke={EDGE_COLOR} strokeWidth="1" fill="none" />
            ) : (
              <path key={i} d={d} stroke={EDGE_COLOR} strokeWidth="1" fill="none" strokeDasharray="3 3">
                <animate attributeName="stroke-dashoffset" from="12" to="0" dur="1s" repeatCount="indefinite" />
              </path>
            );
          })}
          {/* Arrow at merge point */}
          <path d={`M${mergeCx} ${totalH}L${mergeCx + 2.887} ${totalH - 5}H${mergeCx - 2.887}Z`} fill={EDGE_COLOR} />
        </svg>
      )}

      {/* Spacer for merge area */}
      <div style={{ height: mergeH }} />
    </div>
  );
}

function DagNode({ label, status }: { label: string; status: "done" | "active" | "pending" }) {
  return (
    <div style={{
      width: 120,
      height: 40,
      background: "#FFFFFF",
      borderRadius: 8,
      border: `1px solid #D6DBE3`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <span style={{
        fontSize: 14, fontWeight: 600,
        color: status === "pending" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.9)",
      }}>
        {label}
      </span>
    </div>
  );
}

// Vertical arrow — matches figma 1.svg / 2.svg style
function DagArrow({ dashed = false }: { dashed?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", height: 40 }}>
      <svg width="6" height="40" viewBox="0 0 6 40" fill="none">
        {dashed ? (
          // Dashed line with flow animation
          <line x1="3" y1="0" x2="3" y2="35" stroke={EDGE_COLOR} strokeWidth="1" strokeDasharray="3 3">
            <animate attributeName="stroke-dashoffset" from="12" to="0" dur="1s" repeatCount="indefinite" />
          </line>
        ) : (
          <rect x="2.5" y="0" width="1" height="35.5" fill={EDGE_COLOR} />
        )}
        <path d="M3 40L5.773 35H0.227L3 40Z" fill={EDGE_COLOR} />
      </svg>
    </div>
  );
}

// Fan-out: center → 3 columns, right-angle paths with rounded corners
// viewBox 600×72; columns at 100 (1/6), 300 (1/2), 500 (5/6) to match flex:1 card centers
function DagArrowFan({ leftDone, centerDone, rightDone }: { leftDone?: boolean; centerDone?: boolean; rightDone?: boolean }) {
  const leftPath = "M300 0V12.5C300 25.48 289.48 36 276.5 36H123.5C110.52 36 100 46.52 100 59.5V67";
  const centerPath = "M300 0V67";
  const rightPath = "M300 0V12.5C300 25.48 310.52 36 323.5 36H476.5C489.48 36 500 46.52 500 59.5V67";

  const arrow = (cx: number) => (
    <path d={`M${cx} 72L${cx + 2.887} 67H${cx - 2.887}L${cx} 72Z`} fill={EDGE_COLOR} />
  );

  const line = (d: string, done?: boolean) => done ? (
    <path d={d} stroke={EDGE_COLOR} strokeWidth="1" fill="none" />
  ) : (
    <path d={d} stroke={EDGE_COLOR} strokeWidth="1" fill="none" strokeDasharray="3 3">
      <animate attributeName="stroke-dashoffset" from="12" to="0" dur="1s" repeatCount="indefinite" />
    </path>
  );

  return (
    <div style={{ width: "100%", height: 72 }}>
      <svg width="100%" height="72" viewBox="0 0 600 72" fill="none" preserveAspectRatio="none">
        {line(leftPath, leftDone)}
        {arrow(100)}
        {line(centerPath, centerDone)}
        {arrow(300)}
        {line(rightPath, rightDone)}
        {arrow(500)}
      </svg>
    </div>
  );
}

// Merge: 3 columns → center
function DagArrowMerge({ leftDone, centerDone, rightDone }: { leftDone?: boolean; centerDone?: boolean; rightDone?: boolean }) {
  const leftPath = "M100 0V12.5C100 25.48 110.52 36 123.5 36H276.5C289.48 36 300 46.52 300 59.5V67";
  const centerPath = "M300 0V67";
  const rightPath = "M500 0V12.5C500 25.48 489.48 36 476.5 36H323.5C310.52 36 300 46.52 300 59.5V67";

  const arrow = (cx: number) => (
    <path d={`M${cx} 72L${cx + 2.887} 67H${cx - 2.887}L${cx} 72Z`} fill={EDGE_COLOR} />
  );

  const line = (d: string, done?: boolean) => done ? (
    <path d={d} stroke={EDGE_COLOR} strokeWidth="1" fill="none" />
  ) : (
    <path d={d} stroke={EDGE_COLOR} strokeWidth="1" fill="none" strokeDasharray="3 3">
      <animate attributeName="stroke-dashoffset" from="12" to="0" dur="1s" repeatCount="indefinite" />
    </path>
  );

  return (
    <div style={{ width: "100%", height: 72 }}>
      <svg width="100%" height="72" viewBox="0 0 600 72" fill="none" preserveAspectRatio="none">
        {line(leftPath, leftDone)}
        {line(centerPath, centerDone)}
        {line(rightPath, rightDone)}
        {arrow(300)}
      </svg>
    </div>
  );
}

// ── Artifact text link (hover → blue) ───────────────────────────
function ArtifactTextLink({ label, onClick }: { label: string; onClick?: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 12,
        fontWeight: 400,
        lineHeight: "20px",
        color: hovered ? "#1664FF" : "rgba(0,0,0,0.5)",
        cursor: "pointer",
        transition: "color 0.15s",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        textDecoration: hovered ? "underline" : "none",
      }}
    >
      {label}
    </span>
  );
}

interface ExpertTask {
  label: string;
  icon: string;
  status: "done" | "active" | "pending";
}

interface ExpertArtifactLink {
  label: string;
  id: string;
}

// Status icon per figma: green check (done), blue spinner (active), gray circle (pending)
function TaskStatusIcon({ status }: { status: "done" | "active" | "pending" }) {
  if (status === "done") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M13.9895 4.91888L6.91842 11.9899L2.67578 7.74731L3.61859 6.8045L6.91842 10.1043L13.0467 3.97607L13.9895 4.91888Z" fill="#0CBF5B" />
      </svg>
    );
  }
  if (status === "active") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "dag-spin 1.2s linear infinite" }}>
        <path opacity="0.9" d="M8.342 1.342C11.864 1.521 14.665 4.433 14.665 8H13.335C13.335 5.053 10.946 2.664 7.999 2.663C5.052 2.664 2.662 5.053 2.662 8C2.662 10.947 5.052 13.336 7.999 13.336V14.666L7.655 14.658C4.247 14.484 1.514 11.752 1.341 8.343L1.332 8C1.332 4.318 4.317 1.333 7.999 1.333L8.342 1.342Z" fill="#0052D9" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 6C6.895 6 6 6.896 6 8C6 9.105 6.895 10 8 10C9.104 10 10 9.105 10 8C10 6.896 9.104 6 8 6ZM4.666 8C4.666 6.159 6.158 4.667 8 4.667C9.84 4.667 11.333 6.159 11.333 8C11.333 9.841 9.84 11.334 8 11.334C6.158 11.334 4.666 9.841 4.666 8Z" fill="black" fillOpacity="0.3" />
    </svg>
  );
}

function ExpertCard({ name, tasks, artifacts, onArtifactClick, artifactsLoading }: {
  name: string;
  tasks: ExpertTask[];
  artifacts?: ExpertArtifactLink[];
  onArtifactClick?: (id: string) => void;
  artifactsLoading?: boolean;
}) {
  const [artifactHover, setArtifactHover] = React.useState(false);

  const artifactCount = artifacts?.length ?? 0;
  const showArtifactRow = artifactCount > 0 || artifactsLoading;

  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      background: "#FFFFFF",
      borderRadius: 8,
      border: "1px solid #D6DBE3",
      overflow: "visible",
      position: "relative",
    }}>
      {/* Expert name */}
      <div style={{ padding: "10px 12px 8px", fontSize: 14, fontWeight: 600, color: "rgba(0,0,0,0.9)" }}>
        {name}
      </div>
      {/* Divider under name */}
      <div style={{ margin: "0 6px", height: 1, background: "#E6E9EF" }} />

      {/* Task list — execution steps only */}
      <div style={{ padding: "8px 6px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {tasks.map((t) => (
          <div
            key={t.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 32,
              padding: "0 6px",
              borderRadius: 8,
            }}
          >
            <div style={{ width: 16, height: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TaskStatusIcon status={t.status} />
            </div>
            <span style={{
              flex: 1, fontSize: 14, fontWeight: 400,
              color: t.status === "pending" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.9)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {t.label}
            </span>
          </div>
        ))}
      </div>

      {/* Artifacts row — separated from steps */}
      {showArtifactRow && (
        <>
          {/* Divider above artifacts */}
          <div style={{ margin: "2px 6px", height: 1, background: "#E6E9EF" }} />

          <div
            style={{ padding: "0 6px 6px", position: "relative" }}
            onMouseEnter={() => !artifactsLoading && setArtifactHover(true)}
            onMouseLeave={() => setArtifactHover(false)}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 32,
              padding: "0 6px",
              borderRadius: 8,
              background: !artifactsLoading && artifactHover ? "#F2F4F8" : "transparent",
              cursor: artifactsLoading ? "default" : "pointer",
              transition: "background 0.15s",
            }}>
              {/* File icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M14 10V5C14 4.06812 14 3.60218 13.8478 3.23463C13.6448 2.74458 13.2554 2.35523 12.7654 2.15224C12.3978 2 11.9319 2 11 2H6C4.11438 2 3.17157 2 2.58579 2.58579C2 3.17157 2 4.11438 2 6V10C2 11.8856 2 12.8284 2.58579 13.4142C3.17157 14 4.11438 14 6 14H10C11.8856 14 12.8284 14 13.4142 13.4142C14 12.8284 14 11.8856 14 10Z" stroke={artifactsLoading ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.7)"} strokeWidth="1.33" fill="none" />
                <path d="M4.5 6.5H9" stroke={artifactsLoading ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.7)"} strokeWidth="1.33" fill="none" />
                <path d="M4.5 9.5H11.5" stroke={artifactsLoading ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.7)"} strokeWidth="1.33" fill="none" />
              </svg>
              <span style={{
                flex: 1, fontSize: 14, fontWeight: 400,
                color: artifactsLoading ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.9)",
                whiteSpace: "nowrap",
              }}>
                {artifactsLoading ? "产物生成中..." : `产物 (${artifactCount})`}
              </span>
              {/* Chevron right — hidden when loading */}
              {!artifactsLoading && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M6.33659 11.667L9.66992 8.33366L6.33659 5.00033" stroke="rgba(0,0,0,0.9)" strokeWidth="1.33333" strokeLinecap="square" fill="none" />
                </svg>
              )}
            </div>

            {/* Hover popover — only when not loading */}
            {!artifactsLoading && artifactHover && artifacts && artifacts.length > 0 && (
              <div style={{
                position: "absolute",
                left: "100%",
                bottom: 0,
                marginLeft: 8,
                minWidth: 180,
                background: "#FFFFFF",
                borderRadius: 16,
                boxShadow: "0px 8px 24px -4px rgba(0,0,0,0.1), 0px 8px 12px -8px rgba(0,0,0,0.05)",
                padding: 8,
                zIndex: 100,
                pointerEvents: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}>
                <div style={{ padding: "5px 8px", fontSize: 12, color: "rgba(0,0,0,0.5)", lineHeight: "20px" }}>
                  产物列表
                </div>
                {artifacts.map((a) => (
                  <div
                    key={a.id}
                    onClick={(e) => { e.stopPropagation(); onArtifactClick?.(a.id); }}
                    style={{
                      height: 32,
                      padding: "0 8px",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 400,
                      lineHeight: "32px",
                      color: "rgba(0,0,0,0.9)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F2F4F8"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {a.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
