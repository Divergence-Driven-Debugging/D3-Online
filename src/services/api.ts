import type { D3FlowDivergence, D3StateDivergence } from "../models/divergence";
import type { D3CallStack } from "../models/stack";

export type D3DebugResponse = {
  metadata: null;
  flowDivergences: D3FlowDivergence[];
  stateDivergences: D3StateDivergence[];
  v1: D3CallStack;
  v2: D3CallStack;
};
export const startDebug = async (
  url1: string,
  url2: string,
  userId: string,
) => {
  const response = await fetch("/api/debug", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      origin: url1,
      modified: url2,
    }),
  });
  if (!response.ok) {
    throw new Error("invalid data fetch");
  }

  const result: D3DebugResponse = await response.json();
  return result;
};

export type D3Version = "reference" | "modified";

// faut changer la route mais le serveur me fais chier
export const getFrameObjects = async (
  frameId: number,
  version: D3Version,
) => {
  const response = await fetch(
    `/api/objects?frame=${frameId}&version=${version}`,
  );
  if (!response.ok) {
    throw new Error("alors la bonne chance aya");
  }
  return await response.json();
};
