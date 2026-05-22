// 预置头像合集 —— 来源：ardot 4701:143（共 17 张 48×48 圆形头像）
// 创建自定义 Agent / 外部 Agent 时随机分配一张
export const PRESET_AVATARS: ReadonlyArray<string> = [
  "/agents/preset-avatars/avatar-01.png",
  "/agents/preset-avatars/avatar-02.png",
  "/agents/preset-avatars/avatar-03.png",
  "/agents/preset-avatars/avatar-04.png",
  "/agents/preset-avatars/avatar-05.png",
  "/agents/preset-avatars/avatar-06.png",
  "/agents/preset-avatars/avatar-07.png",
  "/agents/preset-avatars/avatar-08.png",
  "/agents/preset-avatars/avatar-09.png",
  "/agents/preset-avatars/avatar-10.png",
  "/agents/preset-avatars/avatar-11.png",
  "/agents/preset-avatars/avatar-12.png",
  "/agents/preset-avatars/avatar-13.png",
  "/agents/preset-avatars/avatar-14.png",
  "/agents/preset-avatars/avatar-15.png",
  "/agents/preset-avatars/avatar-16.png",
  "/agents/preset-avatars/avatar-17.png",
] as const;

/** 随机抽一张预置头像 */
export function pickRandomPresetAvatar(): string {
  const i = Math.floor(Math.random() * PRESET_AVATARS.length);
  return PRESET_AVATARS[i];
}
