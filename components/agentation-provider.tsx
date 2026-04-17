"use client";

import dynamic from "next/dynamic";

const Agentation = dynamic(
  () => import("agentation").then((m) => m.Agentation),
  { ssr: false }
);

const ENABLED =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_AGENTATION === "1";

export default function AgentationProvider() {
  if (!ENABLED) return null;

  return (
    <Agentation
      endpoint="http://localhost:4747"
      onSessionCreated={(sessionId: string) => {
        console.log("[Agentation] session:", sessionId);
      }}
    />
  );
}
