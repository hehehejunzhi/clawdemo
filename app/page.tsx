"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ClaudeChatInput, { CHAT_INPUT_MOTION, type ChatInputHandle, type ChatInputPreviewState, type SkillChip } from "@/components/ui/claude-style-chat-input";
import { AgentFanCards, type AgentCardPreviewState, type FanCardsConfig, DEFAULT_FAN_CONFIG, AGENT_CARD_MOTION } from "@/components/ui/agent-card";
import HeroSection, { HERO_SECTION_MOTION } from "@/components/ui/hero-section";
import MotionPanel, { MotionSelectButton, type MotionMode } from "@/components/ui/motion-panel";
import MotionTargetOverlay from "@/components/ui/motion-target-overlay";
import { IconCatalog, IconWorkflow, IconSQL, IconOps, IconMLExp } from "@/components/ui/wedata-icons";
import SecondaryNav from "@/components/ui/secondary-nav";
import TopNav from "@/components/ui/top-nav";
import PrimaryNav from "@/components/ui/primary-nav";
import StudioView from "@/components/ui/studio-view";
import AiRunningBubble from "@/components/ui/ai-running-bubble";
import ChatTitlebar from "@/components/ui/chat-titlebar";
import UserMessageBubble from "@/components/ui/user-message-bubble";
import Plan from "@/components/ui/agent-plan";
import ThinkingSummary from "@/components/ui/thinking-summary";
import ArtifactsPanel from "@/components/ui/artifacts-panel";
import ExpertReplies, { DispatchText, ConfirmCard, type ConfirmCardData, type ExpertReplyDataType } from "@/components/ui/expert-replies";
import CreateExpertDialog from "@/components/ui/create-expert-dialog";
import CreateTeamDialog from "@/components/ui/create-team-dialog";
import SkillPlaza from "@/components/ui/skill-plaza";
import ClawManager from "@/components/ui/claw-manager";
import { DEFAULT_REGISTRY, type AgentRegistry } from "@/lib/agent-registry";
import TeamSummonBanner, { AgentSummonBanner } from "@/components/ui/team-summon-banner";

// ── Design tokens ──────────────────────────────────────────────
const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ── Chat phase ──────────────────────────────────────────────────
type ChatPhase = "welcome" | "conversation";

// ── 当前召唤的 Agent 信息 ────────────────────────────────────────
interface SummonedAgent {
  name: string;
  nameColor?: string;
  title: string;
  avatar: string;
  summonText?: string;
}

// ── expanded skill label → icon 映射 ────────────────────────────
const SKILL_ICON_COLOR = "rgba(0,0,0,0.45)";
const SKILL_ICON_MAP: Record<string, React.ReactNode> = {
  // Rigel
  "需求转数据模型": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "生成调度方案": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  "自动数仓开发": <IconSQL size={14} color={SKILL_ICON_COLOR} />,
  "检测管道异常": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "接入数据源": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "优化任务性能": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  // Vega
  "自然语言取数": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "智能趋势分析": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  "多维数据洞察": <IconSQL size={14} color={SKILL_ICON_COLOR} />,
  "生成数据报告": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "异常归因": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "指标拆解": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  // Orion
  "监测数据质量": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "智能血缘维护": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  "自动管理元数据": <IconSQL size={14} color={SKILL_ICON_COLOR} />,
  "识别口径冲突": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "安全脱敏": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "标签治理": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  // Nova
  "业务指标监控": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  "智能异常预警": <IconOps size={14} color={SKILL_ICON_COLOR} />,
  "自助取数": <IconCatalog size={14} color={SKILL_ICON_COLOR} />,
  "生成运营看板": <IconSQL size={14} color={SKILL_ICON_COLOR} />,
  "目标达成追踪": <IconWorkflow size={14} color={SKILL_ICON_COLOR} />,
  "用户行为分析": <IconMLExp size={14} color={SKILL_ICON_COLOR} />,
};

const C = {
  rightBg: "#F9FAFC",
} as const;

const BUBBLE_TARGET = {
  width: 240,
  height: 72,
  right: 30,
  bottom: 50,
  radius: 100,
} as const;

const SHRINK_DURATION = 0.58;
const SHRINK_EASE: [number, number, number, number] = [0.23, 0.65, 0.25, 1];
const STUDIO_REVEAL_DURATION = 0.3;
const STUDIO_REVEAL_EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
const BUBBLE_REVEAL_EASE: [number, number, number, number] = [0.23, 0.64, 0.22, 1];

// ── 每个侧边栏任务对应的对话内容 ────────────────────────────────
interface TaskConversation {
  title: string;
  userMsg: string;
  thinkingText: string;
  replies: ExpertReplyDataType[];
  /** 单专家模式：不显示首席专家、Plan、任务已分派 */
  singleExpert?: boolean;
}

const TASK_CONVERSATIONS: Record<string, TaskConversation> = {
  t1: {
    title: "慢 SQL 查询与调优",
    userMsg: "查看广州地域集群 emr-ccrnhw11 的所有慢 SQL，给出优化建议并执行，最后给我一份报告",
    thinkingText: "收到慢 SQL 检索与调优任务，我来作为调度者拆解任务并分派给团队成员",
    replies: [
      {
        icon: "/agents/ops-expert.png", name: "数据运维专家",
        overview: "已收到慢 SQL 检索任务，我将准备相关对应脚本和权限，分步执行",
        lines: [
          {
            text: "让我先加载 EMR 技能来查看 SQL",
            skillCalls: ["EMR-Skill"],
          },
          {
            text: "我需要通过 DescribeSparkQueries 接口获取广州地域集群 emr-ccrnhw11 的慢 SQL。让我先验证鉴权，再查询。",
            skillCalls: ["TCAPI"],
            toolCalls: [{ title: "验证 tccli 鉴权是否有效", command: "tccli configure list", result: "secretId: AKIDz8k***\nsecretKey: Gu5t***\nregion: ap-guangzhou\noutput: json" }],
          },
          {
            text: "鉴权正常。现在查询 DescribeSparkQueries 接口文档，确认参数：",
            toolCalls: [
              { title: "查看 DescribeSparkQueries 接口文档", command: "SHOW TABLES IN dwd_trade;", result: "seller_monthly_wide order_detail_di refund_detail_di 3 rows selected" },
              { title: "查看 SparkQuery 数据结构了解返回字段" },
            ],
          },
          {
            text: "好的，接口参数很清楚。时间限制是 EndTime - StartTime ≤ 1 天。让我先查最近一天的所有 Spark 查询，按完成状态获取：",
            toolCalls: [{ title: "查询广州集群 emr-ccrnhw11 最近一天的所有 Spark 查询", command: "tccli emr DescribeSparkQueries \\\n  --InstanceId emr-ccrnhw11 \\\n  --StartTime 2026-04-14T00:00:00Z \\\n  --EndTime 2026-04-15T00:00:00Z \\\n  --PageSize 20", result: "Total: 11\nQueryList: [{...}, ...] 11 rows selected" }],
          },
          {
            text: "查到了 11 条 Spark 查询记录。不过输出被截断了，让我把完整数据导出来处理",
            toolCalls: [
              { title: "导出并按耗时降序排列所有 Spark 查询，展示慢 SQL 概况", command: "cat /tmp/spark_queries.json | jq \\\n  'sort_by(-.Duration) | .[] |\n  {Id, Statement: .Statement[:60], Duration, ScanRows}'", result: "#1  56.5s  品牌年度销售汇总  29.5 亿行\n#2  14.5s  品牌年度-CTE 优化  29.5 亿行\n#3  12.8s  全表 count        29.5 亿行\n...共 11 条" },
              { title: "输出所有查询的完整 SQL 用于详细分析", command: "for id in $(seq 1 11); do\n  echo \"=== Query #$id ===\"\n  jq -r \".[$id-1].Statement\" /tmp/spark_queries.json\n  echo\ndone", result: "=== Query #1 ===\nINSERT OVERWRITE TABLE dwd_trade.seller_monthly_wide\nPARTITION (dt = '2026-03')\nSELECT s.seller_id, ...\n\n=== Query #2 ===\nWITH filtered AS (\n  SELECT * FROM store_sales WHERE ...\n)\n..." },
            ],
          },
        ],
      },
      {
        icon: "/agents/ops-expert.png", name: "数据运维专家",
        delay: 6000,
        dividerBefore: true,
        overview: "数据齐全了，让我生成一个清晰的报告",
        lines: [
          { text: "以下是广州地域集群 emr-ccrnhw11 最近 24 小时的全部 Spark 查询记录（共 11 条，按耗时从高到低排列）：", boldText: "Spark 查询一览（按耗时降序）" },
          {
            text: "",
            table: {
              headers: ["序号", "查询标题", "耗时(秒)", "扫描量", "状态"],
              rows: [
                ["#1", "品牌年度销售汇总-隐式三表 JOIN", "56.5", "store_sales 29.5 亿行", "已完成"],
                ["#2", "品牌年度销售汇总-CTE 优化版", "14.5", "store_sales 29.5 亿行", "已完成"],
                ["#3", "全表 count（store_sales）", "12.8", "29.5 亿行 113.6 GB", "已完成"],
                ["#4", "门店日均客流统计", "8.3", "store_sales 12 亿行", "已完成"],
                ["#5", "折扣金额统计-含相关子查询", "11.2", "store_sales 8.7 亿行", "已完成"],
                ["#6", "折扣金额统计-CTE 优化版", "6.9", "store_sales 8.7 亿行", "已完成"],
              ],
            },
          },
        ],
      },
      {
        icon: "/agents/dev-expert.png", name: "数据开发专家",
        delay: 10000,
        hideLabel: true,
        lines: [
          { text: "", boldText: "Top 3 慢 SQL 详情" },
          {
            text: "",
            numberedHeading: { num: 1, text: "慢 SQL #1：56.5秒（最慢）" },
            sqlBlock: {
              title: "品牌年度销售汇总-隐式三表 JOIN",
              code: "INSERT OVERWRITE TABLE dwd_trade.seller_monthly_wide PARTITION (dt = '2026-03') SELECT\n    s.seller_id,",
            },
          },
          { text: "同查询的优化版（#2）只用 14.5 秒，提升了 74%。优化手段：CTE 预过滤 + 隐式 JOIN → 显式 INNER JOIN。" },
          {
            text: "",
            numberedHeading: { num: 2, text: "慢 SQL #3：12.8秒" },
            sqlBlock: {
              title: "全表 count —— store_sales 表（29.5 亿行，113.6 GB）",
              code: "INSERT OVERWRITE TABLE dwd_trade.seller_monthly_wide PARTITION (dt = '2026-03') SELECT\n    s.seller_id,",
            },
          },
          { text: "同查询的优化版（#2）只用 14.5 秒，提升了 74%。优化手段：CTE 预过滤 + 隐式 JOIN → 显式 INNER JOIN。" },
          {
            text: "",
            numberedHeading: { num: 3, text: "慢 SQL #5：11.2 秒" },
            sqlBlock: {
              title: "折扣金额统计 —— 含相关子查询",
              code: "INSERT OVERWRITE TABLE dwd_trade.seller_monthly_wide PARTITION (dt = '2026-03') SELECT\n    s.seller_id,",
            },
          },
          { text: "同查询的优化版（#6）只用 6.9 秒，提升了 38%。优化手段：CTE 消除重复扫描 + 显式 JOIN。" },
          {
            text: "",
            artifacts: {
              count: 12,
              items: [
                { title: "Spark查询报告.md", description: "业务结论报告 · Markdown 可下载", iconType: "md" },
                { title: "dau_wau_east_7d.sql", description: "数据读取脚本 · 从源表读取原始数据", iconType: "sql" },
                { title: "dau_wau_trend_chart.png", description: "DAU/WAU 趋势图", iconType: "png" },
                { title: "slow_sql_optimization.sql", description: "慢 SQL 优化方案 · CTE + JOIN 重写", iconType: "sql" },
                { title: "emr_cluster_report.md", description: "集群性能对比报告 · 优化前后", iconType: "md" },
                { title: "query_execution_plan.png", description: "执行计划可视化 · Spark DAG", iconType: "png" },
              ],
            },
          },
          {
            text: "",
            confirmCard: {
              title: "请确认数据源",
              description: "我可以帮您针对慢 SQL #1 进行深度诊断，并直接向集群提交优化后的版本。请确认执行，或在下方输入您想要优化的SQL。",
              buttonText: "确认执行",
            },
          },
        ],
      },
    ],
  },
  t2: {
    title: "统计近 7 天各渠道用户支付金额",
    userMsg: "统计近 7 天各渠道用户支付金额，按天汇总",
    thinkingText: "收到需求，我来拆解多渠道支付数据的聚合分析任务",
    replies: [
      {
        icon: "/agents/analysis-expert.png", name: "数据分析专家",
        lines: [
          { text: "定位到支付主题表 dws_payment_channel_di，覆盖微信/支付宝/银联/Apple Pay 四个渠道。" },
          { text: "已生成按天×渠道聚合 SQL，时间范围 CURDATE() - INTERVAL 7 DAY 到 CURDATE()。", tags: ["dws_payment_channel_di", "dim_channel", "fact_payment"] },
          { text: "汇总结果：7 天累计支付 ¥3,284 万，微信占比 52.3%，支付宝 31.7%，银联 12.4%，Apple Pay 3.6%。" },
        ],
      },
      {
        icon: "/agents/ops-expert.png", name: "数据分析专家",
        lines: [
          { text: "发现趋势异常：第 5 天支付宝渠道下降 18%，关联到支付宝侧临时限流策略。" },
          { text: "已生成可视化看板：分渠道折线图 + 占比堆叠柱状图，导出为 PNG 和 PDF 格式。" },
        ],
      },
      {
        icon: "/agents/dev-expert.png", name: "数据开发专家",
        lines: [
          { text: "SQL 模板已沉淀到知识库，标签：多渠道支付、按天汇总、7日趋势。" },
          { text: "自动创建定时报表任务，每周一 09:00 自动推送到运营群。" },
        ],
      },
    ],
  },
  t3: {
    title: "接入业务库【订单表】数据源",
    userMsg: "接入业务库的订单表数据源到数仓",
    thinkingText: "收到需求，我来协调完成订单表数据源接入任务",
    replies: [
      {
        icon: "/agents/dev-expert.png", name: "数据开发专家",
        lines: [
          { text: "已通过 JDBC 探测到 MySQL 5.7 实例 db-order-prod，延迟 2.3ms。" },
          { text: "orders 表结构：38 个字段，主键 order_id (BIGINT)，日均新增约 42 万条。", tags: ["orders", "order_id", "MySQL 5.7"] },
          { text: "数据源注册完成，连接池配置：maxPoolSize=20, minIdle=5, connectionTimeout=30s。" },
        ],
      },
      {
        icon: "/agents/analysis-expert.png", name: "数据分析专家",
        lines: [
          { text: "权限审查通过：已获取 SELECT 权限，数据脱敏规则已配置（手机号/身份证中间位掩码）。" },
          { text: "数据采样完成：随机抽取 1 万条进行字段完整率统计，所有必填字段完整率 > 99.8%。" },
        ],
      },
    ],
  },
  t4: {
    title: "接入业务库【用户表】数据源",
    userMsg: "接入业务库的用户表数据源到数仓",
    thinkingText: "收到需求，我来协调完成用户表数据源接入任务",
    replies: [
      {
        icon: "/agents/dev-expert.png", name: "数据开发专家",
        lines: [
          { text: "已探测到 MySQL 实例 db-user-prod，用户表 users 共 1,560 万条记录。" },
          { text: "表结构：25 个字段，包含 user_id、nickname、phone、register_time 等核心字段。", tags: ["users", "user_profile", "user_extend"] },
          { text: "增量字段选定 updated_at，Binlog 模式可用，CDC 配置已生成。" },
        ],
      },
      {
        icon: "/agents/analysis-expert.png", name: "数据分析专家",
        lines: [
          { text: "PII 字段检测完成：phone、id_card、email 已标记为敏感字段，脱敏策略已绑定。" },
          { text: "数据质量基线已建立，空值率、唯一性、格式合规性每日自动校验。" },
        ],
      },
      {
        icon: "/agents/ops-expert.png", name: "数据运维专家",
        lines: [
          { text: "数据源健康探针已部署，每 5 分钟检测连接可用性，异常自动切换备库。" },
        ],
      },
    ],
  },
  t5: {
    title: "猫眼_客户留存指标分析",
    userMsg: "帮我分析猫眼业务的客户留存指标",
    thinkingText: "收到需求，我来拆解客户留存分析任务并协调专家团",
    replies: [
      {
        icon: "/agents/analysis-expert.png", name: "数据分析专家",
        lines: [
          { text: "定位留存分析数据源：dws_user_retention_di，覆盖次日/3日/7日/30日留存维度。" },
          { text: "近 30 天整体留存率：次留 45.2%、3留 28.7%、7留 18.3%、月留 9.6%。", tags: ["dws_user_retention_di", "dim_user_cohort", "fact_active_user"] },
          { text: "按渠道拆解：自然流量次留 52%，付费投放次留 38%，差异显著。" },
        ],
      },
      {
        icon: "/agents/ops-expert.png", name: "数据分析专家",
        lines: [
          { text: "留存漏斗分析：注册→首次观影转化率 67%，首次→二次观影转化率仅 41%，为核心流失节点。" },
          { text: "建议：优化首次观影后的推荐策略，增加 \"猜你想看\" 推送触达。" },
          { text: "已生成留存趋势报告（含同环比对比），可在产物面板查看。" },
        ],
      },
    ],
  },
  t6: {
    title: "T+1 调度工作流编排",
    userMsg: "帮我编排 T+1 数据调度工作流",
    thinkingText: "收到需求，我来规划 T+1 数据调度的工作流编排方案",
    replies: [
      {
        icon: "/agents/ops-expert.png", name: "数据运维专家",
        lines: [
          { text: "工作流拓扑已生成：ODS 层采集 → DWD 清洗 → DWS 汇总 → ADS 应用，共 23 个节点。" },
          { text: "关键路径分析：最长执行链 ODS→DWD→DWS_user→ADS_retention，预估耗时 47 分钟。", tags: ["ods_sync", "dwd_clean", "dws_aggregate", "ads_report"] },
          { text: "并行度优化：DWD 层 8 个表可并行执行，将整体耗时缩短至 32 分钟。" },
        ],
      },
      {
        icon: "/agents/dev-expert.png", name: "数据开发专家",
        lines: [
          { text: "资源编排：凌晨 2:00 启动，预分配 Spark 集群 16 CU，DWS 阶段动态扩容到 24 CU。" },
          { text: "SLA 兜底：若 06:00 前未完成，自动触发紧急扩容 + 告警通知值班人员。" },
        ],
      },
      {
        icon: "/agents/analysis-expert.png", name: "数据分析专家",
        lines: [
          { text: "数据质量卡点已配置：DWD→DWS 之间设置行数波动检查（±20% 阈值）。" },
          { text: "全链路血缘已注册，任意节点失败可快速定位上下游影响范围。" },
        ],
      },
    ],
  },
  t7: {
    title: "数仓分层模型搭建",
    userMsg: "帮我搭建数仓的分层模型体系",
    thinkingText: "",
    singleExpert: true,
    replies: [
      {
        icon: "/agents/ops-expert.png", name: "数据运维专家",
        lines: [
          { text: "数仓分层方案已设计：ODS（原始层）→ DWD（明细层）→ DWS（汇总层）→ ADS（应用层）。" },
          { text: "ODS 层：12 张业务源表镜像，保留原始字段，增加 ds 分区和 etl_time 审计字段。", tags: ["ODS", "DWD", "DWS", "ADS"] },
          { text: "DWD 层：统一编码规范、时区转换、空值填充，输出 8 张主题明细宽表。" },
          { text: "DWS 层：按用户/订单/支付三大主题构建 5 张聚合表，粒度为天级/小时级。" },
        ],
      },
      {
        icon: "/agents/ops-expert.png", name: "数据运维专家",
        delay: 3000,
        lines: [
          { text: "ADS 层指标体系已梳理：覆盖 DAU、GMV、客单价、留存率等 28 个核心指标。" },
          { text: "维度表设计完成：dim_user、dim_product、dim_channel、dim_area 共 6 张维度表。" },
          { text: "存储规划：ODS 保留 90 天，DWD 保留 365 天，DWS 永久保留，冷热分层存储已配置。" },
          { text: "建表 DDL 已生成并提交至 Git 仓库，Code Review 流程已触发。" },
        ],
      },
    ],
  },
  t8: {
    title: "ODS 层数据接入验证",
    userMsg: "帮我验证 ODS 层数据接入的完整性和准确性",
    thinkingText: "",
    singleExpert: true,
    replies: [
      {
        icon: "/agents/ops-expert.png", name: "数据运维专家",
        lines: [
          { text: "ODS 层 12 张表逐一对账：源端总行数 vs ODS 行数，误差率均 < 0.01%。" },
          { text: "字段级校验：抽样 10 万条做字段值 MD5 对比，一致率 100%。", tags: ["ods_orders", "ods_users", "ods_payments", "ods_products"] },
        ],
      },
      {
        icon: "/agents/ops-expert.png", name: "数据运维专家",
        delay: 2500,
        lines: [
          { text: "增量同步验证：模拟业务写入 1000 条测试数据，T+1 后全部正确落入 ODS 对应分区。" },
          { text: "异常场景测试：源端删除/更新操作，ODS 层 CDC 捕获并正确标记 op_type 字段。" },
          { text: "验证报告已生成，12/12 张表全部通过，可进入 DWD 开发阶段。" },
        ],
      },
    ],
  },
  t9: {
    title: "用户留存率趋势分析",
    userMsg: "帮我分析用户留存率的变化趋势",
    thinkingText: "收到需求，我来拆解用户留存趋势分析任务",
    replies: [
      {
        icon: "/agents/analysis-expert.png", name: "数据分析专家",
        lines: [
          { text: "拉取近 60 天用户活跃数据，构建 cohort 留存矩阵。" },
          { text: "次日留存从月初 43% 上升到月末 48%，主要由新用户引导优化贡献。", tags: ["dws_user_retention", "dim_user_cohort", "fact_daily_active"] },
          { text: "7 日留存稳定在 18-20% 区间，30 日留存呈缓慢下降趋势（10.2% → 8.8%）。" },
        ],
      },
      {
        icon: "/agents/ops-expert.png", name: "数据分析专家",
        lines: [
          { text: "分群分析：高价值用户（月消费 > ¥500）30 日留存 34%，远高于平均水平。" },
          { text: "流失预警：识别出 12,350 名高风险用户（7日内未活跃+历史高频），建议推送召回策略。" },
          { text: "趋势报告含同比/环比数据，已推送至运营周报看板。" },
        ],
      },
    ],
  },
  t10: {
    title: "GMV 周报数据提取",
    userMsg: "帮我提取本周 GMV 数据并生成周报",
    thinkingText: "收到需求，我来协调 GMV 周报数据的提取和报告生成",
    replies: [
      {
        icon: "/agents/analysis-expert.png", name: "数据分析专家",
        lines: [
          { text: "本周（04/07 - 04/12）GMV 汇总：¥4,872 万，环比上周 +6.3%，同比去年 +21.7%。" },
          { text: "品类拆分：食品饮料 ¥1,843 万（37.8%）、3C数码 ¥1,265 万（26.0%）、服饰 ¥892 万（18.3%）。", tags: ["ads_gmv_weekly", "dws_order_category", "dim_product_category"] },
          { text: "客单价 ¥186.5，环比 +2.1%；订单量 26.1 万单，环比 +4.1%。" },
        ],
      },
      {
        icon: "/agents/ops-expert.png", name: "数据分析专家",
        lines: [
          { text: "异常发现：周三 GMV 骤降 15%，关联到 CDN 故障导致下单页加载超时。" },
          { text: "周报 PDF 已生成，含 GMV 趋势图、品类占比饼图、TOP10 爆款商品排行。" },
        ],
      },
      {
        icon: "/agents/dev-expert.png", name: "数据开发专家",
        lines: [
          { text: "周报自动化任务已创建，每周日 20:00 自动生成并推送至管理层邮箱。" },
        ],
      },
    ],
  },
  t11: {
    title: "元数据血缘扫描",
    userMsg: "帮我扫描数仓的元数据血缘关系",
    thinkingText: "收到需求，我来协调元数据血缘扫描和治理任务",
    replies: [
      {
        icon: "/agents/dev-expert.png", name: "数据开发专家",
        lines: [
          { text: "全量血缘扫描启动：覆盖 Hive 347 张表、Spark SQL 作业 128 个、调度任务 89 个。" },
          { text: "表级血缘图谱已生成：平均链路深度 4.2 层，最长链路 ODS→DWD→DWS→ADS→BI 共 7 层。", tags: ["hive_metastore", "spark_sql_lineage", "workflow_dag"] },
          { text: "发现 23 张孤儿表（无上下游引用），建议归档清理释放 1.2TB 存储。" },
        ],
      },
      {
        icon: "/agents/analysis-expert.png", name: "数据分析专家",
        lines: [
          { text: "字段级血缘已追踪：核心指标 GMV 的计算路径涉及 5 张源表、12 次 JOIN、3 次聚合。" },
          { text: "口径一致性检查：发现 2 处 GMV 定义冲突（是否含退款），已标记待治理。" },
        ],
      },
      {
        icon: "/agents/ops-expert.png", name: "数据运维专家",
        lines: [
          { text: "血缘图谱已同步至数据目录平台，支持影响分析和变更评估。" },
          { text: "增量血缘捕获已开启，后续 SQL 变更将自动更新血缘关系。" },
        ],
      },
    ],
  },
  t12: {
    title: "运营周报看板搭建",
    userMsg: "帮我搭建运营数据的周报看板",
    thinkingText: "收到需求，我来协调运营周报看板的设计和搭建",
    replies: [
      {
        icon: "/agents/analysis-expert.png", name: "数据分析专家",
        lines: [
          { text: "看板框架设计完成：顶部 KPI 卡片 → 趋势折线图 → 分维度明细表 → 异常预警区。" },
          { text: "核心指标已配置：DAU、GMV、新增用户、留存率、客单价、转化率共 8 个 KPI 卡片。", tags: ["ads_daily_kpi", "ads_weekly_summary", "dim_date"] },
          { text: "看板数据源已绑定 ADS 层汇总表，刷新频率设为每日 08:00 自动更新。" },
        ],
      },
      {
        icon: "/agents/ops-expert.png", name: "数据分析专家",
        lines: [
          { text: "交互功能：支持时间范围筛选、渠道/地区下钻、指标同环比切换。" },
          { text: "移动端适配完成，支持飞书/企微内嵌查看。" },
        ],
      },
      {
        icon: "/agents/dev-expert.png", name: "数据开发专家",
        lines: [
          { text: "权限配置：运营组全员可查看，数据导出权限仅限运营负责人。" },
          { text: "看板链接已生成，已推送至运营协作群。" },
        ],
      },
    ],
  },
  t13: {
    title: "活动效果归因分析",
    userMsg: "帮我分析最近一次营销活动的效果归因",
    thinkingText: "收到需求，我来拆解营销活动效果归因分析任务",
    replies: [
      {
        icon: "/agents/analysis-expert.png", name: "数据分析专家",
        lines: [
          { text: "定位活动数据：「春季焕新季」活动，周期 04/01 - 04/10，投放渠道覆盖 5 个平台。" },
          { text: "活动期间 GMV ¥8,240 万，较活动前均值提升 38.5%，新增用户 4.2 万。", tags: ["fact_campaign_order", "dim_campaign", "fact_channel_attribution"] },
          { text: "多触点归因（Shapley 模型）：信息流广告贡献 35%、Push 推送 22%、开屏广告 18%、短信 15%、自然流量 10%。" },
        ],
      },
      {
        icon: "/agents/ops-expert.png", name: "数据分析专家",
        lines: [
          { text: "ROI 分析：整体 ROI 3.2x，其中信息流广告 ROI 最高 4.5x，短信渠道 ROI 仅 1.8x 建议优化。" },
          { text: "用户分群效果：老用户召回 GMV 占比 42%，说明活动对沉睡用户激活效果显著。" },
          { text: "归因报告已导出，包含渠道对比雷达图和 ROI 瀑布图。" },
        ],
      },
    ],
  },
};

// ── 确认执行后的二阶段对话内容 ────────────────────────────────
const CONFIRM_PHASE2_REPLIES: ExpertReplyDataType[] = [
  {
    icon: "/agents/dev-expert.png", name: "数据开发专家",
    delay: 800,
    overview: "好的，你选了 #1 — 最慢的那条 56.5 秒的 SQL。让我对它做深入调优分析。",
    lines: [
      {
        text: "提取慢 SQL #1 的完整信息，准备进行调优分析。",
        toolCalls: [{ title: "提取慢 SQL #1 的完整信息用于调优分析", command: "jq '.[0]' /tmp/spark_queries.json", result: "{\n  \"Id\": \"sq-001\",\n  \"Duration\": 56.5,\n  \"Statement\": \"INSERT OVERWRITE TABLE dwd_trade...\",\n  \"ScanRows\": 2950000000\n}" }],
      },
      {
        text: "数据齐了，现在生成完整的调优分析报告：",
        toolCalls: [{ title: "查看 DescribeSparkQueries 接口文档" }],
      },
    ],
  },
  {
    icon: "/agents/dev-expert.png", name: "数据开发专家",
    delay: 4000,
    dividerBefore: true,
    overview: "以下是报告核心结论",
    lines: [
      { text: "", boldText: "这条 56.5 秒的慢 SQL 最大的问题是隐式 JOIN + 缺少预过滤，导致 store_sales 的 4.77 亿行被全量扫描后才做 JOIN 过滤。" },
      { text: "已经有实测数据证明 方案 1（CTE + 显式 JOIN）可以从 56.5s 降到 14.5s（↓74%）。如果还想继续压缩，可以试：" },
      { text: "", numberedHeading: { num: 1, text: "方案 2：加 /*+ BROADCAST(dt), BROADCAST(fi) */ Hint，强制小表广播，预计 8~10s" } },
      { text: "", numberedHeading: { num: 2, text: "方案 3：加上 ss_sold_date_sk 范围预过滤做分区裁剪，预计 5~7s" } },
      { text: "date_dim 和 item 的过滤条件未提前执行，导致 store_sales 大量扫描后才做 JOIN 过滤。" },
      {
        text: "",
        artifacts: {
          count: 3,
          items: [
            { title: "慢 SQL #1 深度调优分析.md", description: "业务结论报告 · Markdown 可下载", iconType: "md" as const },
            { title: "dau_wau_east_7d.sql", description: "数据读取脚本 · 从源表读取原始数据", iconType: "sql" as const },
            { title: "dau_wau_trend_chart.png", description: "DAU/WAU 趋势图", iconType: "png" as const },
          ],
        },
      },
      {
        text: "",
        confirmCard: {
          title: "请确认优化方案",
          description: "要不要我直接把方案 2 的 SQL 提交到集群跑一下验证？",
          buttonText: "选择方案 2",
          tag: "涉及修改您的数据和资源",
        },
      },
    ],
  },
];

export default function Home() {
  const [targetView, setTargetView] = useState("dataclaw");
  const [viewState, setViewState] = useState<"dataclaw" | "shrinking" | "studio">("dataclaw");
  const [shrinkMetrics, setShrinkMetrics] = useState({
    scaleX: 0.18,
    scaleY: 0.1,
    x: -BUBBLE_TARGET.right,
    y: -BUBBLE_TARGET.bottom,
  });
  const [activeSkills, setActiveSkills] = useState<SkillChip[]>([]);
  const [summonedAgent, setSummonedAgent] = useState<SummonedAgent | null>(null);
  const [chatPhase, setChatPhase] = useState<ChatPhase>("welcome");
  const [userMessage, setUserMessage] = useState<string>("");
  const [conversationTitle, setConversationTitle] = useState<string>("");
  const [artifactsPanelOpen, setArtifactsPanelOpen] = useState(false);
  const [isSecondaryCollapsed, setIsSecondaryCollapsed] = useState(false);
  const [createExpertOpen, setCreateExpertOpen] = useState(false);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [showSkillPlaza, setShowSkillPlaza] = useState(false);
  const [showClawManager, setShowClawManager] = useState(false);
  // Agent Registry — Agent 广场/左侧工具栏/对话下拉共享的唯一数据源
  const [registry, setRegistry] = useState<AgentRegistry>(DEFAULT_REGISTRY);
  // 选中的团队 id（非默认"大数据团队"时在 welcome 区显示 TeamSummonBanner）
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  // 选中的「自定义分身 / 外部 Agent」id（显示 AgentSummonBanner）
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  // 对话流分步揭示：0=用户气泡, 1=思考摘要, 2=Plan卡片
  const [revealStep, setRevealStep] = useState(0);
  // 左侧任务列表当前选中
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  // 即时模式（侧边栏点击进入，不逐字吐出）
  const [isInstantMode, setIsInstantMode] = useState(false);
  // 自定义专家回复数据
  const [taskReplies, setTaskReplies] = useState<ExpertReplyDataType[] | undefined>(undefined);
  // 自定义思考摘要文案
  const [taskThinkingText, setTaskThinkingText] = useState<string | undefined>(undefined);
  // 确认后的二阶段对话
  const [confirmPhase, setConfirmPhase] = useState(false);
  const [phase2Replies, setPhase2Replies] = useState<ExpertReplyDataType[] | undefined>(undefined);
  const [phase2Complete, setPhase2Complete] = useState(false);
  // 活跃的确认卡（从对话流提取，固定在输入框上方）
  const [activeConfirmCard, setActiveConfirmCard] = useState<{ title: string; description: string; buttonText: string; tag?: string } | null>(null);
  const [isSingleExpert, setIsSingleExpert] = useState(false);
  // AI 正在生成回复
  const [isGenerating, setIsGenerating] = useState(false);
  // 用户取消了对话
  const [isCancelled, setIsCancelled] = useState(false);
  // 卡片参数配置
  const [fanConfig, setFanConfig] = useState<FanCardsConfig>(DEFAULT_FAN_CONFIG);
  const [chatInputConfig, setChatInputConfig] = useState<Record<string, number>>(CHAT_INPUT_MOTION.defaultConfig);
  const [heroConfig, setHeroConfig] = useState<Record<string, number>>(HERO_SECTION_MOTION.defaultConfig);
  const [agentCardPreviewState, setAgentCardPreviewState] = useState<AgentCardPreviewState>("free");
  const [chatInputPreviewState, setChatInputPreviewState] = useState<ChatInputPreviewState>(
    (CHAT_INPUT_MOTION.defaultState as ChatInputPreviewState | undefined) ?? "default"
  );
  // Motion 选择模式
  const [motionMode, setMotionMode] = useState<MotionMode>("idle");
  const [motionTarget, setMotionTarget] = useState<string | null>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const dataClawRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // 对话内容更新时自动滚到底部（含流式打字）
  useEffect(() => {
    if (chatPhase !== "conversation" || !scrollRef.current) return;

    const el = scrollRef.current;
    let rafId: number | null = null;
    let userScrolledUp = false;

    const scrollToBottom = () => {
      if (userScrolledUp) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        rafId = null;
      });
    };

    // 检测用户是否手动向上滚动（距底部超过 150px 则暂停自动滚动）
    const handleScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      userScrolledUp = distFromBottom > 150;
    };
    el.addEventListener("scroll", handleScroll, { passive: true });

    // 监听 DOM 内容变化（流式文字追加）
    const observer = new MutationObserver(() => {
      scrollToBottom();
    });
    observer.observe(el, { childList: true, subtree: true, characterData: true });

    // 初始滚动
    scrollToBottom();

    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [chatPhase, revealStep]);

  // 当确认卡出现时，自动滚动到底部以露出完整内容
  useEffect(() => {
    if (!activeConfirmCard || !scrollRef.current) return;
    const el = scrollRef.current;
    // 等待 padding 和确认卡渲染完成后滚动
    const timer = setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [activeConfirmCard, phase2Complete]);

  const handleSkillClick = useCallback((label: string, agent?: { name: string; title: string; avatar: string; summonText?: string }) => {
    setActiveSkills([{ id: label, label, icon: SKILL_ICON_MAP[label] }]);
    if (agent) {
      setSummonedAgent(agent);
    }
    requestAnimationFrame(() => chatInputRef.current?.focus());
  }, []);

  const handleSummon = useCallback((agent: { name: string; title: string; avatar: string; summonText?: string }) => {
    setSummonedAgent(agent);
    setActiveSkills([]);
    requestAnimationFrame(() => chatInputRef.current?.focus());
  }, []);

  const handleRemoveSkill = useCallback((id: string) => {
    setActiveSkills((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (next.length === 0) {
        setSummonedAgent(null);
      }
      return next;
    });
  }, []);

  const handleRemoveAgent = useCallback(() => {
    setSummonedAgent(null);
    setActiveSkills([]);
  }, []);

  // ── 从输入框 Agent 下拉菜单选择专家/团队 ─────────────────────
  // 基于 registry.experts 派生 AGENT_MAP（只有专家支持"召唤"气泡；团队/分身/外部走默认分支）
  const AGENT_MAP: Record<string, { name: string; nameColor: string; title: string; avatar: string; summonText: string }> = React.useMemo(() => {
    const map: Record<string, { name: string; nameColor: string; title: string; avatar: string; summonText: string }> = {};
    for (const e of registry.experts) {
      map[e.id] = {
        name: e.codeName,
        nameColor: e.nameColor,
        title: e.shortTitle,
        // 召唤 banner 优先用 heroAvatar（全身大图），回退到普通 avatar
        avatar: e.heroAvatar ?? e.avatar,
        summonText: e.summonText,
      };
    }
    return map;
  }, [registry.experts]);

  // 构造对话框下拉选项：团队 + 专家 + 自定义分身 + 外部 Agent（全部联动）
  const agentOptions = React.useMemo(() => [
    ...registry.teams.map((t) => ({ id: t.id, label: t.name, kind: "team" as const })),
    ...registry.experts.map((e) => ({ id: e.id, label: e.shortTitle, kind: "expert" as const })),
    ...registry.avatars.map((a) => ({ id: a.id, label: a.name, kind: "avatar" as const })),
    ...registry.externals.map((e) => ({ id: e.id, label: e.name, kind: "external" as const })),
  ], [registry.teams, registry.experts, registry.avatars, registry.externals]);

  const handleSelectAgent = useCallback((agentId: string) => {
    const agentInfo = AGENT_MAP[agentId];
    if (agentInfo) {
      // 单个专家：召唤并显示引导，清空团队 banner
      setSummonedAgent({
        name: agentInfo.name,
        title: agentInfo.title,
        avatar: agentInfo.avatar,
        summonText: agentInfo.summonText,
        nameColor: agentInfo.nameColor,
      });
      setActiveSkills([]);
      setSelectedTeamId(null);
      setSelectedAgentId(null);
      requestAnimationFrame(() => chatInputRef.current?.focus());
    } else {
      // 团队/分身/外部 Agent：清除召唤状态
      setSummonedAgent(null);
      setActiveSkills([]);
      // 若是团队，记录 id 以展示 TeamSummonBanner；"大数据团队"作为默认不展示 banner
      const isTeam = registry.teams.some((t) => t.id === agentId);
      if (isTeam && agentId !== "bigdata-team") {
        setSelectedTeamId(agentId);
        setSelectedAgentId(null);
      } else if (isTeam) {
        // 默认"大数据团队"：不展示任何 banner
        setSelectedTeamId(null);
        setSelectedAgentId(null);
      } else {
        // 自定义分身 / 外部 Agent：展示 AgentSummonBanner
        setSelectedTeamId(null);
        setSelectedAgentId(agentId);
      }
      // 无论是团队、大数据团队、分身还是外部 Agent，都激活输入框
      requestAnimationFrame(() => chatInputRef.current?.focus());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registry.teams]);

  // ── 单专家回复数据：仅该专家一人回复 ──────────────────────────
  const SINGLE_EXPERT_REPLIES: Record<string, ExpertReplyDataType[]> = {
    "数据运维专家": [
      {
        icon: "/agents/ops-expert.png", name: "数据运维专家",
        delay: 1200,
        lines: [
          { text: "正在检查华东区数据链路状态，扫描 ODS → DWD → DWS → ADS 全链路节点。" },
          { text: "数据链路拓扑分析完成：共 23 个节点，关键路径涉及 4 层流转。", tags: ["ods_sync", "dwd_clean", "dws_aggregate", "ads_report"] },
          { text: "发现 DWD 层 dwd_order_detail 任务延迟 12 分钟，原因为上游 ODS 分区到达时间偏移。" },
          { text: "已自动触发补偿调度，预计 8 分钟内恢复正常数据时效。" },
          { text: "全链路监控看板已更新，异常告警已推送至运维群。", tags: ["monitor_dashboard", "alert_feishu"] },
        ],
      },
    ],
    "数据分析专家": [
      {
        icon: "/agents/analysis-expert.png", name: "数据分析专家",
        delay: 1200,
        lines: [
          { text: "正在拉取华东区过去 7 天用户活跃数据，数据源为 dws_user_active_di。" },
          { text: "DAU 均值 124.5 万，WAU 382.7 万，DAU/WAU 比值 32.6%。", tags: ["dws_user_active_di", "ads_dau_wau_east_7d"] },
          { text: "趋势分析：DAU 较上周同期 +3.2%，移动端增长 5.1%，PC 端下降 1.8%。" },
          { text: "已生成 DAU/WAU 趋势折线图和业务结论报告，可在产物面板查看。" },
        ],
      },
    ],
    "数据开发专家": [
      {
        icon: "/agents/dev-expert.png", name: "数据开发专家",
        delay: 1200,
        lines: [
          { text: "正在分析数仓分层模型需求，梳理业务数据源和目标架构。" },
          { text: "ODS 层设计完成：12 张业务源表镜像，增加 ds 分区和 etl_time 审计字段。", tags: ["ODS", "DWD", "DWS", "ADS"] },
          { text: "DWD 层统一编码规范、时区转换、空值填充，输出 8 张主题明细宽表。" },
          { text: "建表 DDL 已生成并提交至 Git 仓库，Code Review 流程已触发。" },
        ],
      },
    ],
  };

  const handleSendMessage = useCallback(({ message }: { message: string; files: unknown[] }) => {
    if (!message.trim()) return;
    setUserMessage(message.trim());
    // 如果没有召唤 agent，默认使用 Rigel
    if (!summonedAgent) {
      setSummonedAgent({
        name: "Rigel",
        title: "数据开发专家",
        avatar: "/agents/dev-expert.png",
      });
    }
    setChatPhase("conversation");
    setConversationTitle(`华东区过去 7 天的用户活跃度趋势`);

    // 判断是否单个专家模式
    const agentTitle = summonedAgent?.title;
    const singleReplies = agentTitle ? SINGLE_EXPERT_REPLIES[agentTitle] : undefined;

    setActiveSkills([]);
    // 输入框发送走流式模式
    setIsInstantMode(false);
    setTaskReplies(singleReplies);
    setTaskThinkingText(singleReplies ? undefined : undefined);
    setActiveTaskId(null);
    setRevealStep(0);
    setIsGenerating(true);
    setIsCancelled(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summonedAgent]);

  // ── Motion 选择模式 handlers ──────────────────────────────────
  const handleMotionButtonClick = useCallback(() => {
    if (motionMode === "idle") {
      setMotionMode("selecting");
    } else {
      // selecting 或 editing → 回到 idle
      setMotionMode("idle");
      setMotionTarget(null);
      setAgentCardPreviewState("free");
      setChatInputPreviewState((CHAT_INPUT_MOTION.defaultState as ChatInputPreviewState | undefined) ?? "default");
    }
  }, [motionMode]);

  const handleMotionSelect = useCallback((targetId: string) => {
    setMotionTarget(targetId);
    setMotionMode("editing");
  }, []);

  const handleMotionPanelClose = useCallback(() => {
    setMotionMode("idle");
    setMotionTarget(null);
    setAgentCardPreviewState((AGENT_CARD_MOTION.defaultState as AgentCardPreviewState | undefined) ?? "default");
    setChatInputPreviewState((CHAT_INPUT_MOTION.defaultState as ChatInputPreviewState | undefined) ?? "default");
  }, []);

  const handleNewChat = useCallback(() => {
    setChatPhase("welcome");
    setUserMessage("");
    setConversationTitle("");
    setArtifactsPanelOpen(false);
    setRevealStep(0);
    setSummonedAgent(null);
    setActiveSkills([]);
    setActiveTaskId(null);
    setIsInstantMode(false);
    setTaskReplies(undefined);
    setTaskThinkingText(undefined);
    setIsSingleExpert(false);
    setConfirmPhase(false);
    setPhase2Replies(undefined);
    setPhase2Complete(false);
    setIsGenerating(false);
    setSelectedTeamId(null);
    setSelectedAgentId(null);
    setIsCancelled(false);
    setActiveConfirmCard(null);
    chatInputRef.current?.resetAgent();
  }, []);

  const handleConfirm = useCallback(() => {
    setConfirmPhase(true);
    setPhase2Replies(CONFIRM_PHASE2_REPLIES);
    setActiveConfirmCard(null);
  }, []);

  const handleStop = useCallback(() => {
    setIsGenerating(false);
    setIsCancelled(true);
  }, []);

  const handleTaskClick = useCallback((task: { id: string; title: string }) => {
    // 这些已完成任务不可点击交互
    if (["t4", "t5", "t6"].includes(task.id)) return;
    const conv = TASK_CONVERSATIONS[task.id];
    setActiveTaskId(task.id);
    setShowSkillPlaza(false);
    setShowClawManager(false);
    setIsInstantMode(true);
    setUserMessage(conv?.userMsg ?? task.title);
    setSummonedAgent({
      name: "Rigel",
      title: "数据运维专家",
      avatar: "/agents/dev-expert.png",
    });
    setChatPhase("conversation");
    setConversationTitle(conv?.title ?? task.title);
    setActiveSkills([]);
    // 即时模式：直接全部展示
    setRevealStep(2);
    setTaskReplies(conv?.replies);
    setTaskThinkingText(conv?.thinkingText);
    setIsSingleExpert(conv?.singleExpert ?? false);
    setConfirmPhase(false);
    setPhase2Replies(undefined);
    setPhase2Complete(false);
    setIsGenerating(false);
    setIsCancelled(false);
    setActiveConfirmCard(null);
    // 即时模式：自动打开产物面板
    setArtifactsPanelOpen(true);
    // 滚动到顶部
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 0 });
    });
  }, []);

  const handleMenuClick = useCallback((id: string) => {
    if (viewState === "shrinking") return;

    if (id === "studio" && viewState === "dataclaw") {
      const rect = dataClawRef.current?.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        setShrinkMetrics({
          scaleX: BUBBLE_TARGET.width / rect.width,
          scaleY: BUBBLE_TARGET.height / rect.height,
          x: -BUBBLE_TARGET.right,
          y: -BUBBLE_TARGET.bottom,
        });
      }

      setTargetView("studio");
      if (shouldReduceMotion) {
        setViewState("studio");
        return;
      }

      setViewState("shrinking");
      return;
    }

    setTargetView(id);
    setViewState(id === "studio" ? "studio" : "dataclaw");
  }, [shouldReduceMotion, viewState]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      fontFamily: FONT,
    }}>
      {/* ── 顶部导航 ── */}
      <TopNav activeId={targetView} onMenuClick={handleMenuClick} />

      {/* ── 下方内容区（横向 flex） ── */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

      {/* ── 左侧一级导航 ── */}
      <PrimaryNav />

      {/* ── 二级导航面板 ── */}
      {targetView === "dataclaw" && <SecondaryNav onCollapsedChange={setIsSecondaryCollapsed} onNewTask={() => { setShowSkillPlaza(false); setShowClawManager(false); handleNewChat(); }} onSkillPlaza={() => { setShowSkillPlaza(true); setShowClawManager(false); }} onClawManager={() => { setShowClawManager(true); setShowSkillPlaza(false); }} onTaskClick={handleTaskClick} activeTaskId={activeTaskId} activeMenu={showSkillPlaza ? "skill-plaza" : showClawManager ? "claw-manager" : null} registry={registry} onAgentSelect={(agentId, label) => {
        // 左栏点击 Section Header：
        // 1) 退出 Agent 广场/技能广场视图，回到聊天主界面
        // 2) 同步输入框下拉选中
        // 3) 如果是专家，召唤气泡；否则只选中（团队/分身/外部）
        // 4) 若当前处于 conversation 阶段且点击的是"其他人物"，先重置回 welcome，
        //    再召唤新人物的 banner；点"当前人物"则保持不动（不新开对话）。
        setShowSkillPlaza(false);
        setShowClawManager(false);
        if (chatPhase === "conversation") {
          // 判断点击的是否是当前 summoned 的同一人物
          const targetInfo = AGENT_MAP[agentId];
          const isSameAgent = targetInfo && summonedAgent && targetInfo.title === summonedAgent.title;
          if (isSameAgent) {
            // 同一人物：不触发任何切换，保持对话详情
            return;
          }
          // 其他人物：回到 welcome，再召唤新 banner
          handleNewChat();
        }
        chatInputRef.current?.setAgent(label);
        handleSelectAgent(agentId);
      }} />}

      {/* ── 右侧内容区 ── */}
      <AnimatePresence mode="wait">
      {showSkillPlaza ? (
        <motion.div
          key="skill-plaza"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: EASE }}
          style={{ flex: 1, minWidth: 0, height: "100%", overflow: "hidden" }}
        >
          <SkillPlaza onBack={() => setShowSkillPlaza(false)} registry={registry} />
        </motion.div>
      ) : showClawManager ? (
        <motion.div
          key="claw-manager"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: EASE }}
          style={{ flex: 1, minWidth: 0, height: "100%", overflow: "hidden" }}
        >
          <ClawManager onNavigateToSkillPlaza={() => { setShowSkillPlaza(true); setShowClawManager(false); }} registry={registry} onRegistryChange={setRegistry} />
        </motion.div>
      ) : (
      <motion.div
        key="dataclaw-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: EASE }}
        style={{ flex: 1, minWidth: 0, height: "100%", overflow: "hidden", position: "relative" }}
      >
        {/* Studio 背景层：先露出主画布，不提前露出气泡 */}
        <motion.div
          initial={false}
          animate={{ opacity: viewState === "dataclaw" ? 0 : 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : STUDIO_REVEAL_DURATION, ease: STUDIO_REVEAL_EASE }}
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: viewState === "studio" ? "auto" : "none",
            zIndex: 0,
          }}
        >
          <StudioView />
        </motion.div>

        {/* 气泡层：单段连续收敛，避免二次缩放感 */}
        <motion.div
          initial={false}
          animate={viewState === "shrinking"
            ? { opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)" }
            : viewState === "studio"
              ? { opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)" }
              : { opacity: 0, scale: 2.5, x: -140, y: -200, filter: "blur(2px)" }
          }
          transition={shouldReduceMotion
            ? { duration: 0 }
            : viewState === "shrinking"
              ? {
                  duration: SHRINK_DURATION,
                  ease: BUBBLE_REVEAL_EASE,
                  opacity: {
                    duration: SHRINK_DURATION,
                    ease: [0.2, 0.85, 0.25, 1],
                  },
                }
              : { duration: 0.2, ease: EASE }
          }
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            transformOrigin: "bottom right",
            willChange: "opacity, transform, filter",
            zIndex: 1,
          }}
        >
          <AiRunningBubble />
        </motion.div>

        {/* DataClaw 顶层：缩小并直接收敛到气泡尺寸与位置 */}
        {(viewState === "dataclaw" || viewState === "shrinking") && (
        <motion.div
          ref={dataClawRef}
          initial={false}
          animate={viewState === "shrinking"
            ? {
                scaleX: shrinkMetrics.scaleX,
                scaleY: shrinkMetrics.scaleY,
                x: shrinkMetrics.x,
                y: shrinkMetrics.y,
                opacity: 0,
                borderRadius: BUBBLE_TARGET.radius,
                filter: "blur(1.2px)",
              }
            : { scaleX: 1, scaleY: 1, x: 0, y: 0, opacity: 1, borderRadius: 0, filter: "blur(0px)" }
          }
          transition={shouldReduceMotion
            ? { duration: 0 }
            : viewState === "shrinking"
              ? {
                  duration: SHRINK_DURATION,
                  ease: SHRINK_EASE,
                }
              : { duration: 0.24, ease: EASE }
          }
          onAnimationComplete={() => {
            if (viewState === "shrinking") {
              setViewState("studio");
            }
          }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
            transformOrigin: "bottom right",
            willChange: "transform, border-radius, opacity, filter",
            zIndex: 2,
          }}
        >
        {/* ── 聊天主区域（flex-1 column） ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", backgroundColor: C.rightBg }}>
        {chatPhase === "conversation" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{
              height: 50,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              padding: "0 20px",
              position: "relative",
              backgroundColor: C.rightBg,
            }}
          >
            <div style={{ width: "100%" }}>
              <ChatTitlebar
                title={conversationTitle}
                showNewChat={isSecondaryCollapsed}
                onNewChat={handleNewChat}
                onArtifacts={() => setArtifactsPanelOpen(v => !v)}
                hideTeamBadge={isSingleExpert}
              />
            </div>
          </motion.div>
        )}
        {/* ── 中间内容区（可滚动） ── */}
        <div ref={scrollRef} style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: chatPhase === "welcome" ? "center" : "flex-start",
          scrollbarWidth: "none",
          transition: "justify-content 0.3s",
          position: "relative",
          backgroundColor: C.rightBg,
        }}>
          {/* Motion 参数面板 - 仅在 editing 模式显示 */}
          <AnimatePresence>
            {chatPhase === "welcome" && motionMode === "editing" && motionTarget === "agent-cards" && (
              <MotionPanel
                targetLabel={AGENT_CARD_MOTION.label}
                schema={AGENT_CARD_MOTION.schema}
                config={fanConfig as unknown as Record<string, number>}
                defaultConfig={AGENT_CARD_MOTION.defaultConfig}
                onChange={(c) => setFanConfig(c as unknown as FanCardsConfig)}
                stateOptions={AGENT_CARD_MOTION.states}
                selectedState={agentCardPreviewState}
                onStateChange={(state) => setAgentCardPreviewState(state as AgentCardPreviewState)}
                onClose={handleMotionPanelClose}
              />
            )}
            {chatPhase === "welcome" && motionMode === "editing" && motionTarget === "chat-input" && (
              <MotionPanel
                targetLabel={CHAT_INPUT_MOTION.label}
                schema={CHAT_INPUT_MOTION.schema}
                config={chatInputConfig}
                defaultConfig={CHAT_INPUT_MOTION.defaultConfig}
                onChange={(c) => setChatInputConfig(c)}
                stateOptions={CHAT_INPUT_MOTION.states}
                selectedState={chatInputPreviewState}
                onStateChange={(state) => setChatInputPreviewState(state as ChatInputPreviewState)}
                onClose={handleMotionPanelClose}
              />
            )}
            {chatPhase === "welcome" && motionMode === "editing" && motionTarget === "hero-section" && (
              <MotionPanel
                targetLabel={HERO_SECTION_MOTION.label}
                schema={HERO_SECTION_MOTION.schema}
                config={heroConfig}
                defaultConfig={HERO_SECTION_MOTION.defaultConfig}
                onChange={(c) => setHeroConfig(c)}
                onClose={handleMotionPanelClose}
              />
            )}
          </AnimatePresence>
          {/* 内容宽度容器 */}
          <div style={{
            width: "100%",
            maxWidth: "min(928px, 100%)",
            boxSizing: "border-box",
            padding: chatPhase === "welcome" ? "0 24px 24px" : `24px 24px ${activeConfirmCard && (!confirmPhase || phase2Complete) ? 360 : 160}px`,
          }}>
            <AnimatePresence mode="wait">
              {chatPhase === "welcome" ? (
                <motion.div
                  key="welcome"
                  initial={{ y: -16 }}
                  animate={{ y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  style={{ marginTop: -130, position: "relative" }}
                >
                  {/* ── 欢迎标题 + 卡片 — 选中技能后一起退出，叉掉后恢复 ── */}
                  <AnimatePresence>
                    {activeSkills.length === 0 && !summonedAgent && !selectedTeamId && !selectedAgentId && (
                      <motion.div
                        key="welcome-content"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }}
                        exit={{ opacity: 0, y: -12, transition: { duration: 0.3, ease: EASE } }}
                      >
                        <div style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 4,
                          padding: "40px 0 24px",
                          transform: "translateY(-60px)",
                          height: 40,
                          overflow: "visible",
                        }}>
                          <span style={{
                            fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            fontSize: 36,
                            fontWeight: 600,
                            lineHeight: "40px",
                            color: "#000",
                            whiteSpace: "nowrap",
                          }}>DataTeam</span>
                          <img
                            src="/icons/welcome-mascot.svg"
                            alt=""
                            style={{
                              width: 60,
                              height: 60,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{
                            fontFamily: FONT,
                            fontSize: 32,
                            fontWeight: 600,
                            lineHeight: "40px",
                            color: "#000",
                            whiteSpace: "nowrap",
                          }}>专家团随时待命</span>
                        </div>
                        <div style={{ marginTop: -20 }}>
                          <MotionTargetOverlay
                            targetId="hero-section"
                            targetLabel={HERO_SECTION_MOTION.label}
                            isSelecting={motionMode === "selecting"}
                            onSelect={handleMotionSelect}
                          >
                            <HeroSection config={heroConfig} />
                          </MotionTargetOverlay>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="conversation"
                  initial={isInstantMode ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: isInstantMode ? 0 : 0.3, ease: EASE }}
                  style={{ display: "flex", flexDirection: "column", gap: 32 }}
                >
                  {/* Step 0: 用户气泡 */}
                  <motion.div
                    initial={isInstantMode ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: isInstantMode ? 0 : 0.35, ease: EASE }}
                    onAnimationComplete={() => { if (!isInstantMode && !isCancelled) setRevealStep((s) => Math.max(s, 1)); }}
                  >
                    <UserMessageBubble content={userMessage} />
                  </motion.div>

                  {/* Step 1+2: Leader 调度区（思考摘要 + Plan + 标签 + 任务分派），内部 12px 间距 */}
                  {revealStep >= 1 && !isSingleExpert && (
                    <motion.div
                      initial={isInstantMode ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: isInstantMode ? 0 : 0.35, ease: EASE, delay: isInstantMode ? 0 : 0.3 }}
                      onAnimationComplete={() => { if (!isInstantMode && !isCancelled) setRevealStep((s) => Math.max(s, 2)); }}
                      style={{ display: "flex", flexDirection: "column", gap: 12 }}
                    >
                      <ThinkingSummary text={taskThinkingText} />
                      {revealStep >= 2 && (
                        <>
                          <Plan />
                          <div style={{
                            display: "flex", flexWrap: "wrap", gap: 8,
                          }}>
                            {["TaskDecompose(slow_sql_analysis)", "ClusterValidate(emr-ccrnhw11)", "TodoWrite(4_phases)"].map((tag) => (
                              <div key={tag} style={{
                                display: "inline-flex", alignItems: "center",
                                height: 24, padding: "0 8px",
                                background: "#EDF0F5", borderRadius: 40,
                                flexShrink: 0,
                              }}>
                                <span style={{
                                  fontFamily: FONT, fontSize: 12, fontWeight: 400,
                                  color: "rgba(0,0,0,0.9)", whiteSpace: "nowrap",
                                }}>{tag}</span>
                              </div>
                            ))}
                          </div>
                          <DispatchText delay={500} instant={isInstantMode} />
                        </>
                      )}
                    </motion.div>
                  )}
                  {/* 单专家模式：step1 直接跳到 step2 */}
                  {revealStep >= 1 && isSingleExpert && !isInstantMode && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      onAnimationComplete={() => { if (!isCancelled) setRevealStep((s) => Math.max(s, 2)); }}
                    />
                  )}

                  {/* Step 3: 专家回复 */}
                  {revealStep >= 2 && (
                    <motion.div
                      initial={isInstantMode ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: isInstantMode ? 0 : 0.35, ease: EASE, delay: isInstantMode ? 0 : 0.8 }}
                    >
                      <ExpertReplies instant={isInstantMode} replies={taskReplies} onComplete={() => {
                        setArtifactsPanelOpen(true);
                        setIsGenerating(false);
                        // 提取 confirmCard 数据
                        const allReplies = taskReplies ?? [];
                        for (const reply of allReplies) {
                          for (const line of reply.lines) {
                            if (line.confirmCard) {
                              setActiveConfirmCard(line.confirmCard);
                              return;
                            }
                          }
                        }
                      }} onArtifactClick={() => setArtifactsPanelOpen(true)} onConfirm={handleConfirm} hideDispatch cancelled={isCancelled} />
                    </motion.div>
                  )}

                  {/* Phase 2: 确认后的继续对话 */}
                  {confirmPhase && phase2Replies && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                      >
                        <UserMessageBubble content="针对慢 SQL #1 进行深度诊断，并直接向集群提交优化" />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: EASE, delay: 0.3 }}
                      >
                        <ExpertReplies replies={phase2Replies} onArtifactClick={() => setArtifactsPanelOpen(true)} onComplete={() => {
                          setPhase2Complete(true);
                          // 提取 phase2 中的 confirmCard
                          for (const reply of (phase2Replies ?? [])) {
                            for (const line of reply.lines) {
                              if (line.confirmCard) {
                                setActiveConfirmCard(line.confirmCard);
                                return;
                              }
                            }
                          }
                        }} hideDispatch cancelled={isCancelled} />
                      </motion.div>
                    </>
                  )}

                  {/* 用户取消对话 */}
                  {isCancelled && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      style={{
                        fontFamily: FONT,
                        fontSize: 14,
                        fontWeight: 400,
                        lineHeight: "22px",
                        color: "rgba(0,0,0,0.4)",
                        marginTop: -20,
                      }}
                    >
                      用户已取消
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* ── 置底输入框：固定距底部 32px，高度向上伸缩，不影响上方卡片布局 ── */}
        <div style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pointerEvents: "none",
          zIndex: 3,
        }}>
          <div style={{
            width: "100%",
            background: C.rightBg,
            padding: "0 20px 32px",
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}>
          <div style={{ width: "100%", maxWidth: 880, position: "relative", pointerEvents: "auto" }}>
            {/* ── Agent 召唤引导：头像从输入框后面伸出（仅 welcome 阶段） ── */}
            <AnimatePresence>
              {chatPhase === "welcome" && summonedAgent && (
                <motion.div
                  key={summonedAgent.name}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { duration: 0.35, ease: EASE } }}
                  exit={{ y: 16, opacity: 0, transition: { duration: 0.2, ease: EASE } }}
                  style={{
                    position: "absolute",
                    bottom: "calc(100% - 20px)",
                    left: 0,
                    right: 0,
                    zIndex: 0,
                    display: "flex",
                    alignItems: "flex-end",
                    paddingBottom: 20,
                    pointerEvents: "none",
                  }}
                >
                  {/* 头像 —— 半身立像，从输入框后面伸出上半身
                      半身像源图 380×532（比例 0.714）；可见高 148（168-20 与输入框重叠）
                      宽度按源图比例 0.714 × 148 ≈ 106，用 contain 完整显示不裁切 */}
                  <img
                    src={summonedAgent.avatar}
                    alt={summonedAgent.name}
                    style={{
                      flexShrink: 0,
                      width: 106,
                      height: 168,
                      objectFit: "contain",
                      objectPosition: "bottom center",
                      pointerEvents: "none",
                      marginLeft: 20,
                      transform: "translateY(32px)",
                    }}
                  />

                  {/* 引导文案 */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    paddingBottom: 28,
                    flexWrap: "nowrap",
                    marginLeft: 6,
                  }}>
                    <span style={{
                      fontFamily: FONT,
                      fontSize: 24,
                      fontWeight: 600,
                      lineHeight: "32px",
                      color: "rgba(0,0,0,0.9)",
                      whiteSpace: "nowrap",
                    }}>
                      我是{summonedAgent.title}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-pixelify-sans), 'Pixelify Sans', sans-serif",
                      fontSize: 28,
                      fontWeight: 500,
                      lineHeight: "32px",
                      color: summonedAgent.nameColor ?? "#2873FF",
                      whiteSpace: "nowrap",
                    }}>
                      {summonedAgent.name}
                    </span>
                    {summonedAgent.summonText && (
                      <span style={{
                        fontFamily: FONT,
                        fontSize: 24,
                        fontWeight: 600,
                        lineHeight: "32px",
                        color: "rgba(0,0,0,0.9)",
                        whiteSpace: "nowrap",
                      }}>
                        ，{summonedAgent.summonText}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 团队召唤 banner：与专家同位置，贴近输入框上方，左对齐 */}
              {chatPhase === "welcome" && !summonedAgent && selectedTeamId && (() => {
                const team = registry.teams.find((t) => t.id === selectedTeamId);
                if (!team) return null;
                return (
                  <motion.div
                    key={`team-banner-${team.id}`}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { duration: 0.35, ease: EASE } }}
                    exit={{ y: 16, opacity: 0, transition: { duration: 0.2, ease: EASE } }}
                    style={{
                      position: "absolute",
                      bottom: "calc(100% - 20px)",
                      left: 0,
                      right: 0,
                      zIndex: 0,
                      display: "flex",
                      alignItems: "flex-end",
                      paddingBottom: 20,
                      pointerEvents: "none",
                    }}
                  >
                    <div style={{
                      marginLeft: 20,
                      paddingBottom: 28,
                    }}>
                      <TeamSummonBanner team={team} />
                    </div>
                  </motion.div>
                );
              })()}

              {/* 自定义分身 / 外部 Agent 召唤 banner：单头像 + "我是XXX……" */}
              {chatPhase === "welcome" && !summonedAgent && !selectedTeamId && selectedAgentId && (() => {
                const avatar = registry.avatars.find((a) => a.id === selectedAgentId);
                const external = registry.externals.find((e) => e.id === selectedAgentId);
                if (!avatar && !external) return null;
                const name = avatar?.name ?? external?.name ?? "";
                const avatarItem = avatar
                  ? { letter: avatar.letter, bg: avatar.bg }
                  : { letter: external!.abbr, bg: external!.bg };
                return (
                  <motion.div
                    key={`agent-banner-${selectedAgentId}`}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { duration: 0.35, ease: EASE } }}
                    exit={{ y: 16, opacity: 0, transition: { duration: 0.2, ease: EASE } }}
                    style={{
                      position: "absolute",
                      bottom: "calc(100% - 20px)",
                      left: 0,
                      right: 0,
                      zIndex: 0,
                      display: "flex",
                      alignItems: "flex-end",
                      paddingBottom: 20,
                      pointerEvents: "none",
                    }}
                  >
                    <div style={{
                      marginLeft: 20,
                      paddingBottom: 28,
                    }}>
                      <AgentSummonBanner avatar={avatarItem} name={name} nameColor={avatarItem.bg} />
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* ── 快捷提问标签：仅 welcome 阶段 + 无 agent 召唤时显示 ── */}
            {/* 确认卡 + 输入框 组合区域 */}
            <div style={{ position: "relative" }}>
              {/* 确认卡 — 在输入框下层，背景包裹住输入框 */}
              <AnimatePresence>
                {activeConfirmCard && (!confirmPhase || phase2Complete) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    style={{
                      position: "relative",
                      zIndex: 0,
                      marginBottom: -24,
                    }}
                  >
                    <div style={{
                      background: "#FCF4E8",
                      borderRadius: "24px 24px 0 0",
                      padding: "16px 24px 40px",
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{
                            fontFamily: FONT, fontSize: 18, fontWeight: 600,
                            lineHeight: "32px", color: "rgba(0,0,0,0.9)",
                          }}>
                            {activeConfirmCard.title}
                          </span>
                          {activeConfirmCard.tag && (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              height: 24, padding: "0 10px", borderRadius: 12,
                              border: "none",
                              background: "#FFDCBF",
                              fontFamily: FONT, fontSize: 12, fontWeight: 400,
                              color: "#C04100", whiteSpace: "nowrap", lineHeight: "24px",
                            }}>
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.7475 8.0385L12.362 5.6453C12.2133 5.3885 11.9371 4.9053 11.9371 4.9053C10.8649 3.0296 10.3605 2.4264 10.3605 2.4264C9.4396 1.3251 8.3233 1.3251 8.3233 1.3251C7.2071 1.3251 6.2862 2.4264 6.2862 2.4264C5.7818 3.0296 4.7095 4.9053 4.7095 4.9053C4.4333 5.3885 4.2847 5.6453 4.2847 5.6453L2.8991 8.0385C2.7495 8.2969 2.4661 8.7803 2.4661 8.7803C1.3704 10.649 1.0977 11.3887 1.0977 11.3887C0.5999 12.7394 1.1587 13.7086 1.1587 13.7086C1.7175 14.6778 3.1359 14.9238 3.1359 14.9238C3.9126 15.0584 6.0788 15.0464 6.0788 15.0464C6.6388 15.0433 6.9378 15.0433 6.9378 15.0433L9.7089 15.0433C10.0077 15.0433 10.5679 15.0464 10.5679 15.0464C12.7341 15.0584 13.5108 14.9238 13.5108 14.9238C14.9292 14.6778 15.488 13.7086 15.488 13.7086C16.0468 12.7394 15.549 11.3887 15.549 11.3887C15.2763 10.649 14.1806 8.7803 14.1806 8.7803C13.8972 8.2969 13.7475 8.0385 13.7475 8.0385ZM10.7796 5.567C11.0576 6.0535 11.2081 6.3133 11.2081 6.3133L12.5936 8.7065C12.7451 8.9682 13.0304 9.4548 13.0304 9.4548C14.0662 11.2213 14.2979 11.8498 14.2979 11.8498C14.5797 12.6145 14.3329 13.0426 14.3329 13.0426C14.086 13.4708 13.283 13.61 13.283 13.61C12.623 13.7244 10.5753 13.7131 10.5753 13.7131C10.0113 13.71 9.7089 13.71 9.7089 13.71L6.9378 13.71C6.6352 13.71 6.0714 13.7131 6.0714 13.7131C4.0237 13.7244 3.3636 13.61 3.3636 13.61C2.5607 13.4708 2.3138 13.0426 2.3138 13.0426C2.0669 12.6145 2.3488 11.8498 2.3488 11.8498C2.5804 11.2213 3.6162 9.4548 3.6162 9.4548C3.9016 8.9682 4.053 8.7065 4.053 8.7065L5.4386 6.3133C5.589 6.0536 5.8671 5.567 5.8671 5.567C6.8806 3.7941 7.3091 3.2817 7.3091 3.2817C7.8302 2.6584 8.3233 2.6584 8.3233 2.6584C8.8165 2.6584 9.3376 3.2817 9.3376 3.2817C9.7661 3.7941 10.7796 5.567 10.7796 5.567Z" fill="#C04100" fillRule="evenodd" transform="translate(-0.322266, -0.259766)"/>
                                <path d="M0.4714 0.4714C0.6747 0.2795 0.6667 0 0.6667 0C0.6747 -0.2795 0.4714 -0.4714 0.4714 -0.4714C0.2795 -0.6747 0 -0.6667 0 -0.6667C-0.2795 -0.6747 -0.4714 -0.4714 -0.4714 -0.4714C-0.6747 -0.2795 -0.6667 0 -0.6667 0C-0.6747 0.2795 -0.4714 0.4714 -0.4714 0.4714C-0.2795 0.6747 0 0.6667 0 0.6667C0.2795 0.6747 0.4714 0.4714 0.4714 0.4714Z" fill="#C04100" fillRule="evenodd" transform="translate(8, 10.9733)"/>
                                <path d="M2.8232 -0.6667L0 -0.6667C-0.2795 -0.6747 -0.4714 -0.4714 -0.4714 -0.4714C-0.6747 -0.2795 -0.6667 0 -0.6667 0C-0.6747 0.2795 -0.4714 0.4714 -0.4714 0.4714C-0.2795 0.6747 0 0.6667 0 0.6667L2.8232 0.6667C3.1027 0.6747 3.2946 0.4714 3.2946 0.4714C3.498 0.2795 3.4899 0 3.4899 0C3.498 -0.2795 3.2946 -0.4714 3.2946 -0.4714C3.1027 -0.6747 2.8232 -0.6667 2.8232 -0.6667Z" fill="#C04100" fillRule="evenodd" transform="matrix(0,1,-1,0,8.00195,6.14844)"/>
                              </svg>
                              {activeConfirmCard.tag}
                            </span>
                          )}
                        </div>
                        <span style={{
                          fontFamily: FONT, fontSize: 16, fontWeight: 400,
                          lineHeight: "28px", color: "rgba(0,0,0,0.9)",
                          textAlign: "justify",
                        }}>
                          {activeConfirmCard.description}
                        </span>
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <button
                          onClick={() => { handleConfirm(); }}
                          style={{
                            height: 44,
                            padding: "0 20px",
                            background: "rgba(0,0,0,0.75)",
                            borderRadius: 100,
                            border: "none",
                            boxShadow: "0px 2px 4px -2px rgba(0,0,0,0.20)",
                            cursor: "pointer",
                            fontFamily: FONT,
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#FFFFFF",
                          }}
                        >
                          {activeConfirmCard.buttonText}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 输入框 — 在确认卡上层 */}
              <div style={{ position: "relative", zIndex: 1 }}>
              <MotionTargetOverlay
                targetId="chat-input"
                targetLabel={CHAT_INPUT_MOTION.label}
                isSelecting={motionMode === "selecting"}
                onSelect={handleMotionSelect}
              >
                <ClaudeChatInput
                  ref={chatInputRef}
                  placeholder={chatPhase === "conversation" ? "继续对话..." : "选择一位专家或直接分配任务"}
                  skills={chatPhase === "welcome" ? activeSkills : []}
                  onRemoveSkill={handleRemoveSkill}
                  agentChip={chatPhase === "welcome" ? (summonedAgent ?? undefined) : undefined}
                  onRemoveAgent={handleRemoveAgent}
                  onSendMessage={handleSendMessage}
                  config={chatInputConfig}
                  previewState={motionMode === "editing" && motionTarget === "chat-input" ? chatInputPreviewState : undefined}
                  onCreateExpert={() => setCreateExpertOpen(true)}
                  onCreateTeam={() => setCreateTeamOpen(true)}
                  onSelectAgent={(agentId) => handleSelectAgent(agentId)}
                  agentOptions={agentOptions}
                  disableAgentSelector={chatPhase === "conversation"}
                  isGenerating={isGenerating}
                  onStop={handleStop}
                />
              </MotionTargetOverlay>
              </div>{/* zIndex:1 输入框层 end */}
            </div>{/* 确认卡+输入框组合区域 end */}
          </div>
          </div>
        </div>

        {/* 帘幕遮罩：覆盖整个 DataClaw 面板，与背景同色从不透明→透明，
            模拟 fade-in 而不影响子级 backdrop-filter */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: C.rightBg,
            pointerEvents: "none",
            zIndex: 50,
          }}
        />

        </div>{/* 聊天主区域 end */}

        {/* ── 产物面板 ── */}
        {chatPhase === "conversation" && (
          <ArtifactsPanel
            open={artifactsPanelOpen}
            onClose={() => setArtifactsPanelOpen(false)}
            phase={phase2Complete ? 2 : confirmPhase ? 1.5 : 1}
            singleExpert={isSingleExpert}
          />
        )}

        </motion.div>
        )}
      </motion.div>
      )}
      </AnimatePresence>

      {/* Motion 选择模式按钮 - 仅 welcome 阶段显示 */}
      {chatPhase === "welcome" && (
        <MotionSelectButton mode={motionMode} onClick={handleMotionButtonClick} />
      )}
      </div>{/* 横向 flex end */}

      {/* 创建专家弹窗 */}
      <CreateExpertDialog open={createExpertOpen} onClose={() => setCreateExpertOpen(false)} />
      <CreateTeamDialog open={createTeamOpen} onClose={() => setCreateTeamOpen(false)} />
    </div>
  );
}
