"use client";

import React from "react";
import type { Team } from "@/lib/agent-registry";
import type { ClusterAvatarItem } from "./secondary-nav";
import { getLetterTextColor } from "./secondary-nav";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_INTER = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const BRAND = "#0052D9";
const TEXT_PRIMARY = "rgba(0,0,0,0.9)";
const AVATAR_BG = "#EEEEEE";
const AVATAR_STROKE = "#E7E7E7";

// Figma 规格（726_8879）
const AVATAR_SIZE = 48;
const AVATAR_STEP = 37.2;   // 相邻头像横向步长（overlap 10.8px）
const AVATAR_STROKE_W = 1.5;

interface TeamSummonBannerProps {
  team: Team;
}

// 单个圆形头像（48×48，1.5px 描边，背景灰）；可通过 size 覆盖尺寸
function BannerAvatar({ item, zIndex, size = AVATAR_SIZE }: { item: ClusterAvatarItem; zIndex: number; size?: number }) {
  const isLetter = typeof item !== "string";
  // 字母字号按 48→25.67 的比例派生，保持视觉重量一致
  const letterFontSize = (25.67 * size) / AVATAR_SIZE;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        background: isLetter ? item.bg : AVATAR_BG,
        overflow: "hidden",
        flexShrink: 0,
        zIndex,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isLetter ? (
        <span
          style={{
            fontFamily: FONT,
            fontSize: letterFontSize,
            fontWeight: 600,
            color: isLetter ? getLetterTextColor(item.bg) : "#FFFFFF",
            lineHeight: 1,
          }}
        >
          {item.letter}
        </span>
      ) : (
        <img
          src={item}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
    </div>
  );
}

/**
 * 团队召唤 banner —— 左对齐版式，贴近输入框上方
 * 参考 Figma 726_8879 + 对齐数据工程专家（summonedAgent）召唤样式
 *
 * 布局（从左到右一行）：
 *   [头像组合 48×48 ×N, 步长 37.2] [gap 8] [文字 24/600]
 *
 * 容器无自身 padding/背景，由外层控制位置（紧贴输入框左对齐）
 */
export default function TeamSummonBanner({ team }: TeamSummonBannerProps) {
  const imgs: ClusterAvatarItem[] =
    team.members.length >= 2
      ? team.members
          .slice(0, team.members.length >= 4 ? 4 : team.members.length)
          .map<ClusterAvatarItem>((m) =>
            m.avatar ? m.avatar : { letter: m.abbr, bg: m.abbrBg }
          )
      : [];

  // 取前 4 个
  const picked = imgs.slice(0, 4);
  const count = picked.length;
  const avatarsWidth = count > 0 ? AVATAR_SIZE + AVATAR_STEP * (count - 1) : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* 头像组合：绝对定位叠放 */}
      {count > 0 && (
        <div
          style={{
            position: "relative",
            width: avatarsWidth,
            height: AVATAR_SIZE,
            flexShrink: 0,
          }}
        >
          {picked.map((item, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: AVATAR_STEP * i,
                top: 0,
              }}
            >
              <BannerAvatar item={item} zIndex={count - i} />
            </div>
          ))}
        </div>
      )}

      {/* 文字：我们是 + 团队名（品牌蓝）+ ，告诉我你想做什么? */}
      <span
        style={{
          fontFamily: FONT,
          fontSize: 24,
          fontWeight: 600,
          lineHeight: "32px",
          color: TEXT_PRIMARY,
          whiteSpace: "nowrap",
        }}
      >
        我们是
        <span style={{ color: BRAND }}>{team.name}</span>
        ，告诉我你想做什么?
      </span>
    </div>
  );
}

/**
 * 单 Agent 召唤 banner —— 与 TeamSummonBanner 样式一致，仅显示一个头像
 * 用于「自定义分身」「外部 Agent」选中后的欢迎页
 *
 * 布局（从左到右一行）：
 *   [头像 48×48] [gap 8] [文字 24/600 "我是XXX，告诉我你想做什么?"]
 */
interface AgentSummonBannerProps {
  avatar: ClusterAvatarItem;
  name: string;
  /** 名称着色，默认品牌蓝 */
  nameColor?: string;
  /** 自定义提问文案，默认 "告诉我你想做什么?" */
  summonText?: string;
}

export function AgentSummonBanner({
  avatar,
  name,
  nameColor = BRAND,
  summonText = "告诉我你想做什么?",
}: AgentSummonBannerProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <BannerAvatar item={avatar} zIndex={1} size={40} />
      <span
        style={{
          fontFamily: FONT,
          fontSize: 24,
          fontWeight: 600,
          lineHeight: "32px",
          color: TEXT_PRIMARY,
          whiteSpace: "nowrap",
        }}
      >
        我是
        <span style={{ color: nameColor }}>{name}</span>
        ，{summonText}
      </span>
    </div>
  );
}
