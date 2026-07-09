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
export const getCodebasePath = async (version: D3Version): Promise<string> => {
  const response = await fetch(`/api/codebase?version=${version}`);
  if (!response.ok) {
    throw new Error("erreur de récupération du chemin de la codebase");
  }
  return await response.json();
};

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


export type D3Symbol = {
  name: string;
  nature: string; // "class" | "method" | "localVariable" | "argument" | "instanceVariable"
  method: string; // méthode racine
  valueClasses: string[];
  count: number;
  traceIds: number[];
};

export const getSymbols = async (version: D3Version): Promise<D3Symbol[]> => {
  const response = await fetch(`/api/symbols?version=${version}`);
  if (!response.ok) {
    throw new Error("erreur de récupération des symboles");
  }
  let data = await response.json();

  if (typeof data === "string") data = JSON.parse(data);
  return Array.isArray(data) ? data : [];
};

export type SymbolKind = "méthode" | "classe" | "variable" | "inconnu";

const natureToKind = (nature: string): SymbolKind => {
  if (nature === "method") return "méthode";
  if (nature === "class") return "classe";
  if (
    nature === "localVariable" ||
    nature === "argument" ||
    nature === "instanceVariable"
  )
    return "variable";
  return "inconnu";
};


export const classifySymbol = (
  word: string,
  symbols: D3Symbol[] | null,
): SymbolKind => {
  if (!Array.isArray(symbols)) return "inconnu";
  const kinds = new Set(
    symbols.filter((s) => s.name === word).map((s) => natureToKind(s.nature)),
  );
  if (kinds.has("méthode")) return "méthode";
  if (kinds.has("classe")) return "classe";
  if (kinds.has("variable")) return "variable";
  return "inconnu";
};
