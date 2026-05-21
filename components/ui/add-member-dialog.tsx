"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FONT = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

interface MemberItem {
  id: string;
  name: string;
  desc: string;
  avatar: string;
  letterAvatar?: { letter: string; bg: string };
}

const ALL_MEMBERS: MemberItem[] = [
  { id: "dev", name: "Rigel·数据开发专家", desc: "负责数据建模、调优执行，将原始数据转化为可分析的高质量数据资产。", avatar: "/agents/dev-expert.png" },
  { id: "analysis", name: "Vega·数据分析专家", desc: "从海量数据提取关键洞察，构建数据模型与可视化报告。", avatar: "/agents/analysis-expert.png" },
  { id: "ops", name: "Orion·数据运维专家", desc: "负责集群监控、性能监测、故障排查与容量规划。", avatar: "/agents/ops-expert.png" },
  { id: "my-ops", name: "运营助手", desc: "个人定制的运营分析助手，沉淀了日常运营经验。", avatar: "", letterAvatar: { letter: "运", bg: "#4B79FF" } },
  { id: "coze", name: "Coze", desc: "外部 Agent · 已连接", avatar: "", letterAvatar: { letter: "C", bg: "#BE63FF" } },
];

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  currentMembers?: string[];
  onConfirm?: (selectedIds: string[]) => void;
  /** 团队对话模式：启用人数 ≤ 2 限制 */
  isTeamChat?: boolean;
}

// ── MemberRow ──────────────────────────────────────────────────
function MemberRow({ member, isSelected, isLocked, lockTooltip, onToggle }: {
  member: MemberItem;
  isSelected: boolean;
  isLocked: boolean;
  lockTooltip?: string;
  onToggle: () => void;
}) {
  const [cbHovered, setCbHovered] = useState(false);
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        height: 92,
        padding: "0 20px",
        borderRadius: 16,
        cursor: isLocked ? "default" : "pointer",
        background: "#FFFFFF",
        gap: 16,
      }}
    >
      {/* Checkbox */}
      <div
        style={{ position: "relative", flexShrink: 0 }}
        onMouseEnter={() => setCbHovered(true)}
        onMouseLeave={() => setCbHovered(false)}
      >
        <div style={{
          width: 16, height: 16, borderRadius: 3,
          border: isSelected ? "none" : "1.5px solid #C4C9D4",
          background: isSelected ? (isLocked ? "#C4C9D4" : "#0052D9") : "#FFF",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: isLocked ? "not-allowed" : "pointer",
          transition: "all 0.15s",
        }}>
          {isSelected && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4.2 7.5L8 3" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        {isLocked && lockTooltip && cbHovered && (
          <div style={{
            position: "absolute",
            left: -4,
            bottom: "calc(100% + 8px)",
            display: "inline-flex", alignItems: "center",
            height: 28, padding: "0 8px", borderRadius: 6,
            background: "rgba(32,32,32,0.9)",
            fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.9)",
            whiteSpace: "nowrap",
            zIndex: 10,
            pointerEvents: "none",
          }}>
            {lockTooltip}
          </div>
        )}
      </div>

      {/* Avatar */}
      {member.letterAvatar ? (
        <div style={{
          width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
          background: member.letterAvatar.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 18, fontWeight: 500, color: "#FFF" }}>
            {member.letterAvatar.letter}
          </span>
        </div>
      ) : (
        <img src={member.avatar} alt="" style={{
          width: 48, height: 48, borderRadius: "50%", flexShrink: 0, objectFit: "cover",
          border: "1px solid #E7E7E7",
        }} />
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: "rgba(0,0,0,0.9)", lineHeight: "24px" }}>
          {member.name}
        </div>
        <div style={{
          fontSize: 14, fontWeight: 400, color: "rgba(0,0,0,0.9)", lineHeight: "24px",
          marginTop: 4,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {member.desc}
        </div>
      </div>
    </div>
  );
}

export default function AddMemberDialog({ open, onClose, currentMembers = ["dev", "analysis", "ops"], onConfirm, isTeamChat = true }: AddMemberDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(currentMembers));
  const [search, setSearch] = useState("");

  const filteredMembers = ALL_MEMBERS.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const tooFew = isTeamChat && selected.size < 2;

  const handleConfirm = () => {
    if (tooFew) return;
    onConfirm?.(Array.from(selected));
    onClose();
  };

  React.useEffect(() => {
    if (open) {
      setSelected(new Set(currentMembers));
      setSearch("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(255,255,255,0.4)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              zIndex: 9998,
            }}
          />
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{
              position: "fixed",
              inset: 0,
              margin: "auto",
              width: 640,
              height: 640,
              background: "#FFFFFF",
              borderRadius: 16,
              boxShadow: "0px 8px 24px -4px rgba(0,0,0,0.10), 0px 8px 12px -8px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              zIndex: 9999,
              fontFamily: FONT,
            }}
          >
            {/* Header: 标题 + 关闭 */}
            <div style={{
              padding: "24px 24px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: "rgba(0,0,0,0.9)", lineHeight: "24px" }}>
                添加成员
              </span>
              <button
                onClick={onClose}
                style={{
                  width: 16, height: 16, border: "none", background: "none",
                  cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4.465 3.521L8 7.057L11.535 3.521L12.479 4.465L8.943 8L12.479 11.535L11.535 12.479L8 8.943L4.465 12.479L3.521 11.535L7.057 8L3.521 4.465L4.465 3.521Z" fill="rgba(0,0,0,0.9)" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                height: 32,
                borderRadius: 6,
                border: "1px solid #E6E9F0",
                padding: "0 8px",
                gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M6.417 1.75a4.667 4.667 0 1 0 0 9.333 4.667 4.667 0 0 0 0-9.333ZM.583 6.417a5.833 5.833 0 1 1 10.502 3.5l2.499 2.499-.825.825-2.499-2.5A5.833 5.833 0 0 1 .583 6.418Z" fill="rgba(0,0,0,0.4)" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="请输入 Agent 名称搜索"
                  style={{
                    flex: 1,
                    height: "100%",
                    border: "none",
                    outline: "none",
                    fontSize: 13,
                    fontFamily: FONT,
                    color: "rgba(0,0,0,0.9)",
                    background: "transparent",
                  }}
                />
              </div>
            </div>

            {/* Member list */}
            <div style={{
              flex: 1,
              overflow: "auto",
              padding: "16px 24px",
              scrollbarWidth: "none",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: -12 }}>
                {filteredMembers.map((member) => {
                  const isSelected = selected.has(member.id);
                  // 团队模式：当只剩2个选中时，已选中的不可取消
                  // 单 agent 模式：只有当前 agent（currentMembers 中的）不可取消
                  const isLocked = isTeamChat
                    ? (isSelected && selected.size <= 2)
                    : (isSelected && currentMembers.includes(member.id));
                  return (
                    <MemberRow
                      key={member.id}
                      member={member}
                      isSelected={isSelected}
                      isLocked={isLocked}
                      lockTooltip={isTeamChat ? "团队人数不能小于 2 人" : undefined}
                      onToggle={() => { if (!isLocked) toggle(member.id); }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#E6E9F0", margin: "0 0", flexShrink: 0 }} />

            {/* Footer */}
            <div style={{
              padding: "16px 24px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", gap: 16 }}>
                <button
                  onClick={onClose}
                  style={{
                    height: 40, padding: "0 24px", borderRadius: 32,
                    border: "1px solid #D6DBE3", background: "#FFF",
                    cursor: "pointer", fontFamily: FONT, fontSize: 14, fontWeight: 500,
                    color: "rgba(0,0,0,0.9)",
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleConfirm}
                  style={{
                    height: 40, padding: "0 24px", borderRadius: 32,
                    border: "none",
                    background: "rgba(0,0,0,0.9)",
                    cursor: "pointer",
                    fontFamily: FONT, fontSize: 14, fontWeight: 500,
                    color: "#FFF",
                  }}
                >
                  {isTeamChat ? "保存" : "创建团队"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
