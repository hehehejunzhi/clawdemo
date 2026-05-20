// Agent 广场 / 左侧工具栏 / 对话框下拉 共享数据源
//
// 这里定义 AgentRegistry 及其初始默认数据，以 Agent 广场当前展示的内容为准。
// page.tsx 负责持有 state，ClawManager/SecondaryNav/ClaudeChatInput 全部通过 props 消费。

import type { ClusterAvatarItem } from "@/components/ui/secondary-nav";

// ── Agent 实体 ─────────────────────────────────────────────────

export interface BuiltinExpert {
  id: string;
  /** 完整名称，用于 Agent 广场卡片标题，如 "Rigel·数据工程专家" */
  fullName: string;
  /** 简短名称，用于对话下拉/左栏，如 "数据工程专家"（无前缀） */
  shortTitle: string;
  /** 英文代号，用于召唤气泡 */
  codeName: string;
  desc: string;
  avatar: string;
  /** 召唤页 banner 用的全身大图（仅 welcome 召唤视图使用；左栏/卡片仍用 avatar） */
  heroAvatar?: string;
  skills: string[];
  nameColor: string;
  summonText: string;
}

export interface Team {
  id: string;
  name: string;
  desc: string;
  /** 团队头像 —— ClusterAvatar 数据；也可通过 members 自动推导 */
  clusterImgs?: ClusterAvatarItem[];
  members: TeamMember[];
  /** 是否为系统预置团队（不可删除、不可编辑 members） */
  preset?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  abbr: string;
  abbrBg: string;
  category: string;
  role: "调度者" | "执行者" | "观察者";
  statusColor: string;
  avatar?: string;
}

export interface CustomAvatar {
  id: string;
  name: string;
  desc: string;
  tags: string[];
  skills: { name: string; enabled: boolean }[];
  /** 色块+首字的颜色 */
  bg: string;
  letter: string;
  /** 预置分身（例如"运营助手"），区别于用户自建 */
  preset?: boolean;
}

export type ExternalAgentState = "disconnected" | "connecting" | "connected" | "disconnecting";

export interface ExternalAgent {
  id: string;
  name: string;
  abbr: string;
  bg: string;
  platformLabel: string;
  apiUrl?: string;
  state: ExternalAgentState;
  preset?: boolean;
}

// ── 任务 ──────────────────────────────────────────────────────

export type TaskStatus = "pending" | "loading" | "check";

export interface AgentTask {
  id: string;
  title: string;
  status: TaskStatus;
  /** 归属的 agent（团队 id / 专家 id / 分身 id / 外部 agent id） */
  agentId: string;
}

// ── Registry 聚合 ──────────────────────────────────────────────

export interface AgentRegistry {
  teams: Team[];
  experts: BuiltinExpert[];
  avatars: CustomAvatar[];
  externals: ExternalAgent[];
  tasks: AgentTask[];
}

// ── 默认数据（与原硬编码完全一致） ──────────────────────────────

export const DEFAULT_EXPERTS: BuiltinExpert[] = [
  {
    id: "dev-expert",
    fullName: "Rigel·数据工程专家",
    shortTitle: "数据工程专家",
    codeName: "Rigel",
    desc: "负责数据建模、调优执行，将原始数据转化为可分析的高质量数据资产。",
    avatar: "/agents/dev-expert.png",
    heroAvatar: "/agents/rigel-bust.png",
    skills: ["需求转数据模型", "生成调度方案", "自动数仓开发", "检测管道异常", "接入数据源", "优化任务性能"],
    nameColor: "#2873FF",
    summonText: "今天想开发什么数仓？",
  },
  {
    id: "analysis-expert",
    fullName: "Vega·数据分析专家",
    shortTitle: "数据分析专家",
    codeName: "Vega",
    desc: "从海量数据提取关键洞察，构建数据模型与可视化报告，提供业务决策支持。",
    avatar: "/agents/analysis-expert.png",
    heroAvatar: "/agents/vega-bust.png",
    skills: ["自然语言取数", "智能趋势分析", "多维数据洞察", "生成数据报告", "异常归因", "指标拆解"],
    nameColor: "#A56EFF",
    summonText: "告诉我你想分析什么数据？",
  },
  {
    id: "ops-expert",
    fullName: "Orion·智能管家",
    shortTitle: "智能管家",
    codeName: "Orion",
    desc: "负责集群监控、性能监测、故障排查与容量规划，确保数据平台高可用。",
    avatar: "/agents/ops-expert.png",
    heroAvatar: "/agents/orion-bust.png",
    skills: ["监测数据质量", "智能血缘维护", "自动管理元数据", "识别口径冲突", "安全脱敏", "标签治理"],
    nameColor: "#CC6B3A",
    summonText: "告诉我你想梳理哪条数据链路？",
  },
];

export const DEFAULT_TEAMS: Team[] = [
  {
    id: "bigdata-team",
    name: "大数据团队",
    desc: "包含数据开发、分析、运维专家的协作团队",
    preset: true,
    clusterImgs: [
      "/agents/dev-expert.png",
      "/agents/analysis-expert.png",
      "/agents/ops-expert.png",
    ],
    members: [
      { id: "dev", name: "大数据工程专家", abbr: "开", abbrBg: "#4B79FF", category: "内置专家", role: "调度者", statusColor: "#0CBF5B", avatar: "/agents/dev-expert.png" },
      { id: "analyst", name: "大数据分析专家", abbr: "析", abbrBg: "#BE63FF", category: "内置专家", role: "执行者", statusColor: "#0CBF5B", avatar: "/agents/analysis-expert.png" },
      { id: "ops", name: "大智能管家", abbr: "运", abbrBg: "#00DBB0", category: "内置专家", role: "执行者", statusColor: "#0CBF5B", avatar: "/agents/ops-expert.png" },
    ],
  },
  {
    id: "ops-team",
    name: "运营协作团队",
    desc: "数据团队 + 运营助手协同，聚焦业务指标解读与落地",
    clusterImgs: [
      "/agents/dev-expert.png",
      "/agents/analysis-expert.png",
      "/agents/ops-expert.png",
      { letter: "运", bg: "#4B79FF" },
    ],
    members: [
      { id: "dev", name: "大数据工程专家", abbr: "开", abbrBg: "#4B79FF", category: "内置专家", role: "调度者", statusColor: "#0CBF5B", avatar: "/agents/dev-expert.png" },
      { id: "analyst", name: "大数据分析专家", abbr: "析", abbrBg: "#BE63FF", category: "内置专家", role: "执行者", statusColor: "#0CBF5B", avatar: "/agents/analysis-expert.png" },
      { id: "ops", name: "大智能管家", abbr: "运", abbrBg: "#00DBB0", category: "内置专家", role: "执行者", statusColor: "#0CBF5B", avatar: "/agents/ops-expert.png" },
      { id: "my-ops", name: "我的运营助手", abbr: "营", abbrBg: "#4B79FF", category: "数字分身", role: "执行者", statusColor: "#FF7800" },
    ],
  },
];

export const DEFAULT_AVATARS: CustomAvatar[] = [
  {
    id: "my-ops",
    name: "运营助手",
    desc: "个人定制的运营分析助手，沉淀了日常运营经验",
    tags: ["运营", "数据分析", "日报"],
    skills: [
      { name: "运营报表生成", enabled: true },
      { name: "运营洞察", enabled: true },
      { name: "知识沉淀", enabled: true },
    ],
    bg: "#4B79FF",
    letter: "运",
    preset: true,
  },
];

export const DEFAULT_EXTERNALS: ExternalAgent[] = [
  {
    id: "lh2",
    name: "Lighthouse",
    abbr: "L",
    bg: "#BE63FF",
    platformLabel: "Lighthouse",
    state: "connected",
    preset: true,
  },
];

// ── 默认任务（与左侧工具栏原硬编码对应）────────────────────────

export const DEFAULT_TASKS: AgentTask[] = [
  // 大数据团队
  { id: "t1", title: "慢 SQL 查询与调优", status: "pending", agentId: "bigdata-team" },
  { id: "t2", title: "统计近 7 天各渠道用户支付金额，按天汇总", status: "pending", agentId: "bigdata-team" },
  { id: "t3", title: "展示\u201C思考中\u201D状态", status: "loading", agentId: "bigdata-team" },
  { id: "t4", title: "展示\u201C用户已取消\u201D状态", status: "check", agentId: "bigdata-team" },
  { id: "t5", title: "展示\u201C报错\u201D状态", status: "check", agentId: "bigdata-team" },
  // Rigel·数据工程专家
  { id: "t7", title: "数仓分层模型搭建", status: "loading", agentId: "dev-expert" },
  { id: "t8", title: "ODS 层数据接入验证", status: "check", agentId: "dev-expert" },
  // Vega·数据分析专家
  { id: "t9", title: "用户留存率趋势分析", status: "pending", agentId: "analysis-expert" },
  { id: "t10", title: "GMV 周报数据提取", status: "check", agentId: "analysis-expert" },
  // Orion·智能管家
  { id: "t11", title: "元数据血缘扫描", status: "loading", agentId: "ops-expert" },
  // 运营协作团队
  { id: "t12", title: "运营周报看板搭建", status: "check", agentId: "ops-team" },
  { id: "t13", title: "活动效果归因分析", status: "pending", agentId: "ops-team" },
];

export const DEFAULT_REGISTRY: AgentRegistry = {
  teams: DEFAULT_TEAMS,
  experts: DEFAULT_EXPERTS,
  avatars: DEFAULT_AVATARS,
  externals: DEFAULT_EXTERNALS,
  tasks: DEFAULT_TASKS,
};

// ── Helper：基于 members 派生 Cluster 头像 ──────────────────────
export function deriveClusterImgs(members: TeamMember[]): ClusterAvatarItem[] | null {
  if (members.length < 3) return null;
  const picked = members.slice(0, members.length >= 4 ? 4 : 3);
  return picked.map<ClusterAvatarItem>((m) =>
    m.avatar ? m.avatar : { letter: m.abbr, bg: m.abbrBg }
  );
}
