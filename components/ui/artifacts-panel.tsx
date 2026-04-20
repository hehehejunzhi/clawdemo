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
    expert: "数据运维专家过程产物",
    icon: "/icons/expert/25.svg",
    items: [
      { id: "1", title: "2025 年 6 至 7 月各地区的复购率设计方案.html", description: "数据读取脚本 · 从源表读取原始数据" },
      { id: "2", title: "clean_null_value.sql", description: "数据清洗脚本 · 空值过滤与格式标准化" },
      { id: "3", title: "read_source_data.sql", description: "数据读取脚本 · 从源表读取原始数据" },
      { id: "4", title: "clean_null_value.md", description: "数据清洗脚本 · 空值过滤与格式标准化" },
    ],
  },
  {
    expert: "数据开发专家过程产物",
    icon: "/icons/expert/17.svg",
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
                  onClick={() => setActiveTab(tab.id)}
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
                      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", width: 56, flexShrink: 0 }}>执行 Claw</span>
                      <span style={{ fontSize: 12, color: TEXT_PRIMARY }}>{singleExpert ? "数据运维专家 (1 人)" : "大数据团队 (3 人)"}</span>
                    </div>
                    <div style={{ width: "50%", display: "flex", gap: 16 }}>
                      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", width: 56, flexShrink: 0 }}>状态</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <img src="/icons/dag/3.svg" alt="" style={{ width: 6, height: 6 }} />
                        <span style={{ fontSize: 12, color: TEXT_PRIMARY }}>执行中</span>
                      </div>
                    </div>
                  </div>
                  {/* Row 2 */}
                  <div style={{ display: "flex" }}>
                    <div style={{ width: "50%", display: "flex", gap: 16 }}>
                      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", width: 56, flexShrink: 0 }}>开始时间</span>
                      <span style={{ fontSize: 12, color: TEXT_PRIMARY }}>2026-04-14 14:42:33</span>
                    </div>
                    <div style={{ width: "50%", display: "flex", gap: 16 }}>
                      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", width: 56, flexShrink: 0 }}>已用时长</span>
                      <span style={{ fontSize: 12, color: TEXT_PRIMARY }}>3 分 24 秒</span>
                    </div>
                  </div>
                </div>

                {/* 执行流程标题 */}
                <div style={{ marginTop: 16, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY }}>执行流程</span>
                </div>

                {/* DAG 流程图 */}
                <div style={{
                  background: "#FAFBFC",
                  borderRadius: 16,
                  padding: "40px 24px",
                  overflow: "hidden",
                  position: "relative",
                }}>
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
                              name="数据运维专家"
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
                        <DagArrowFan />

                        <div style={{ display: "flex", gap: 16, width: "100%" }}>
                          <ExpertCard
                            name="数据分析专家"
                            tasks={[
                              { label: "权限验证", icon: "/icons/dag/6.svg", status: "done" },
                              { label: "SQL 生成", icon: "/icons/dag/7.svg", status: phase >= 1 ? "done" : "active" },
                              { label: "数据探索", icon: "/icons/dag/8.svg", status: phase >= 1 ? "done" : "pending" },
                            ]}
                            artifacts={phase >= 1 ? [
                              { label: "Spark 查询报告.md", id: "r1" },
                              { label: "emr_query_stats.sql", id: "r2" },
                              { label: "dau_wau_east_7d.sql", id: "r3" },
                              { label: "query_trend_chart.png", id: "r4" },
                            ] : undefined}
                            onArtifactClick={(id) => {
                              const a = MOCK_ALL_ARTIFACTS.find((x) => x.id === id) ?? { id, title: "Spark 查询报告.md", description: "业务结论报告 · Markdown 可下载" };
                              setSelectedArtifact(a);
                            }}
                          />
                          <ExpertCard
                            name="数据开发专家"
                            tasks={[
                              { label: "HDFS 完整性检查", icon: "/icons/dag/12.svg", status: phase >= 1 ? "done" : "done" },
                              { label: "血缘追踪", icon: "/icons/dag/13.svg", status: phase >= 2 ? "done" : phase >= 1 ? "active" : "pending" },
                              { label: "质量检查", icon: "/icons/dag/14.svg", status: phase >= 2 ? "done" : "pending" },
                            ]}
                            artifacts={phase >= 2 ? [
                              { label: "慢SQL #1 调优分析.md", id: "r5" },
                              { label: "optimized_query.sql", id: "r6" },
                              { label: "execution_plan.png", id: "r7" },
                              { label: "performance_diff.md", id: "r8" },
                            ] : undefined}
                            onArtifactClick={(id) => {
                              const a = MOCK_ALL_ARTIFACTS.find((x) => x.id === id) ?? { id, title: "慢SQL #1 调优.md", description: "深度调优分析报告" };
                              setSelectedArtifact(a);
                            }}
                          />
                          <ExpertCard
                            name="数据运维专家"
                            tasks={[
                              { label: "资源监控", icon: "/icons/dag/9.svg", status: phase >= 1 ? "done" : "pending" },
                              { label: "自动扩缩容", icon: "/icons/dag/10.svg", status: phase >= 2 ? "done" : "pending" },
                              { label: "故障预警", icon: "/icons/dag/11.svg", status: phase >= 2 ? "active" : "pending" },
                            ]}
                          />
                        </div>

                        <DagArrowMerge />

                        {/* 结果融合 */}
                        <DagNode label="结果融合" status={phase >= 2 ? "active" : "pending"} />
                        <DagArrow />
                      </>
                    )}

                    {/* 报告生成 */}
                    <DagNode label="报告生成" status="pending" />
                  </div>
                </div>
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

// Vertical arrow (solid or dashed)
function DagArrow({ dashed = false }: { dashed?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", height: 40 }}>
      <svg width="6" height="40" viewBox="0 0 6 40" fill="none">
        <line x1="3" y1="0" x2="3" y2="35" stroke={EDGE_COLOR} strokeWidth="1" strokeDasharray={dashed ? EDGE_DASHED : "none"}>
          {!dashed && (
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.5s" repeatCount="indefinite" />
          )}
        </line>
        <path d="M3 40L5.887 35H0.113L3 40Z" fill={EDGE_COLOR} />
      </svg>
    </div>
  );
}

// Fan-out from center to 3 columns (uses figma curved connectors)
function DagArrowFan({ leftDone, centerDone, rightDone }: { leftDone?: boolean; centerDone?: boolean; rightDone?: boolean }) {
  return (
    <div style={{ position: "relative", width: "100%", height: 73 }}>
      {/* Center line: straight down */}
      <svg style={{ position: "absolute", left: "50%", transform: "translateX(-3px)", top: 0 }} width="6" height="73" viewBox="0 0 6 73" fill="none">
        <line x1="3" y1="0" x2="3" y2="68" stroke={EDGE_COLOR} strokeWidth="1" strokeDasharray={centerDone ? "none" : EDGE_DASHED} />
        <path d="M3 73L5.887 68H0.113L3 73Z" fill={EDGE_COLOR} />
      </svg>
      {/* Left branch: center → left card (curved) */}
      <svg style={{ position: "absolute", left: 0, top: 0, width: "50%", height: 73 }} viewBox="0 0 230 73" fill="none" preserveAspectRatio="xMaxYMin meet">
        <path d={`M229 0V12.5C229 26 218 37 204.5 37H25C11 37 0.5 47 0.5 60.5V68`} stroke={EDGE_COLOR} strokeWidth="1" strokeDasharray={leftDone ? "none" : EDGE_DASHED} fill="none" />
        <path d="M3 73L5.887 68H0.113L3 73Z" fill={EDGE_COLOR} />
      </svg>
      {/* Right branch: center → right card (curved) */}
      <svg style={{ position: "absolute", right: 0, top: 0, width: "50%", height: 73 }} viewBox="0 0 230 73" fill="none" preserveAspectRatio="xMinYMin meet">
        <path d={`M1 0V12.5C1 26 12 37 25.5 37H204.5C218 37 228.5 47 228.5 60.5V68`} stroke={EDGE_COLOR} strokeWidth="1" strokeDasharray={rightDone ? "none" : EDGE_DASHED} fill="none" />
        <path d="M227 73L229.887 68H224.113L227 73Z" fill={EDGE_COLOR} />
      </svg>
    </div>
  );
}

// Merge from 3 columns back to center
function DagArrowMerge({ leftDone, centerDone, rightDone }: { leftDone?: boolean; centerDone?: boolean; rightDone?: boolean }) {
  return (
    <div style={{ position: "relative", width: "100%", height: 73 }}>
      {/* Center line */}
      <svg style={{ position: "absolute", left: "50%", transform: "translateX(-3px)", top: 0 }} width="6" height="73" viewBox="0 0 6 73" fill="none">
        <line x1="3" y1="0" x2="3" y2="68" stroke={EDGE_COLOR} strokeWidth="1" strokeDasharray={centerDone ? "none" : EDGE_DASHED} />
        <path d="M3 73L5.887 68H0.113L3 73Z" fill={EDGE_COLOR} />
      </svg>
      {/* Left merge */}
      <svg style={{ position: "absolute", left: 0, top: 0, width: "50%", height: 73 }} viewBox="0 0 230 73" fill="none" preserveAspectRatio="xMaxYMin meet">
        <path d={`M1 0V12.5C1 26 12 37 25.5 37H204.5C218 37 228.5 47 228.5 60.5V68`} stroke={EDGE_COLOR} strokeWidth="1" strokeDasharray={leftDone ? "none" : EDGE_DASHED} fill="none" />
      </svg>
      {/* Right merge */}
      <svg style={{ position: "absolute", right: 0, top: 0, width: "50%", height: 73 }} viewBox="0 0 230 73" fill="none" preserveAspectRatio="xMinYMin meet">
        <path d={`M229 0V12.5C229 26 218 37 204.5 37H25C11 37 0.5 47 0.5 60.5V68`} stroke={EDGE_COLOR} strokeWidth="1" strokeDasharray={rightDone ? "none" : EDGE_DASHED} fill="none" />
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

function ExpertCard({ name, tasks, artifacts, onArtifactClick }: {
  name: string;
  tasks: ExpertTask[];
  artifacts?: ExpertArtifactLink[];
  onArtifactClick?: (id: string) => void;
}) {
  const [hoveredTask, setHoveredTask] = React.useState<number | null>(null);

  return (
    <div style={{
      width: 200,
      flexShrink: 0,
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
      <div style={{ margin: "0 12px", height: 1, background: "#E6E9EF" }} />

      {/* Task list */}
      <div style={{ padding: "8px 6px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {tasks.map((t, i) => (
          <div
            key={t.label}
            onMouseEnter={() => setHoveredTask(i)}
            onMouseLeave={() => setHoveredTask(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 32,
              padding: "0 6px",
              borderRadius: 8,
              background: hoveredTask === i && t.status === "done" ? "#F2F4F8" : "transparent",
              cursor: t.status === "done" ? "pointer" : "default",
              transition: "background 0.15s",
              position: "relative",
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
            {/* Chevron for done items */}
            {t.status === "done" && hoveredTask === i && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M5.39 11.667L9.057 8L5.39 4.333L6.333 3.39L10.943 8L6.333 12.61L5.39 11.667Z" fill="rgba(0,0,0,0.5)" />
              </svg>
            )}

            {/* Hover popover with artifacts */}
            {t.status === "done" && hoveredTask === i && artifacts && artifacts.length > 0 && (
              <div style={{
                position: "absolute",
                left: "100%",
                top: 0,
                marginLeft: 8,
                width: 200,
                background: "#FFFFFF",
                borderRadius: 8,
                border: "1px solid #E6E9EF",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                padding: "8px 0",
                zIndex: 100,
                pointerEvents: "auto",
              }}>
                <div style={{ padding: "0 12px 4px", fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
                  产物
                </div>
                {artifacts.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onArtifactClick?.(a.id)}
                    style={{
                      padding: "4px 12px",
                      fontSize: 13,
                      color: "rgba(0,0,0,0.9)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
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
        ))}
      </div>
    </div>
  );
}
