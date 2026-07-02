import type { D3FlowDivergence, D3StateDivergence } from "../models/divergence";
import type { D3CallStack } from "../models/stack";

export type D3DebugResponse = {
  metadata: null;
  flowDivergences: D3FlowDivergence[];
  stateDivergences: D3StateDivergence[];
  v1: D3CallStack;
  v2: D3CallStack;
};
console.log("response")
export const startDebug = async (
  url1: string,
  url2: string,
  userId: string,
) => {
  const response = await fetch("api/debug", {
    method: "POST",
    body: JSON.stringify({
      userId: userId,
      origin: url1,
      modified: url2,
    }),
  });
  console.log(response)
  if (!response || !response.ok) {
    throw new Error("invalid data fetch");
  }
  const result: D3DebugResponse = await response.json();
};
