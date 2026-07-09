export type LspVersion = "reference" | "modified";

export type LspPosition = { line: number; character: number };
export type LspRange = { start: LspPosition; end: LspPosition };

export type LspLocation = {
  uri: string;
  range: LspRange;
  absolutePath: string;
  relativePath: string;
};

export type LspHover = {
  contents: { kind: string; value: string };
  range: LspRange;
} | null;

export type LspMethodSource = {
  name: string;
  startLine: number;
  endLine: number;
  source: string;
} | null;

export const startLspSession = async (
  referencePath: string,
  modifiedPath: string,
): Promise<{ reference: string; modified: string }> => {
  const response = await fetch("/lsp/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reference_path: referencePath,
      modified_path: modifiedPath,
    }),
  });
  if (!response.ok) {
    throw new Error("échec du démarrage du LSP, Pourquoiiiiiiiiiii ??????");
  }
  return await response.json();
};

const lspRequest = async <T>(
  method: "definition" | "references" | "hover",
  version: LspVersion,
  file: string,
  line: number,
  column: number,
): Promise<T> => {
  const params = new URLSearchParams({
    version,
    file,
    line: String(line),
    col: String(column),
  });
  const response = await fetch(`/lsp/${method}?${params}`);
  if (!response.ok) {
    throw new Error(`requête LSP ${method} erreur`);
  }
  return await response.json();
};

export const getDefinition = (
  version: LspVersion,
  file: string,
  line: number,
  column: number,
) => lspRequest<LspLocation[]>("definition", version, file, line, column);

export const getReferences = (
  version: LspVersion,
  file: string,
  line: number,
  column: number,
) => lspRequest<LspLocation[]>("references", version, file, line, column);

export const getHover = (
  version: LspVersion,
  file: string,
  line: number,
  column: number,
) => lspRequest<LspHover>("hover", version, file, line, column);

export const getMethodSource = async (
  version: LspVersion,
  file: string,
  line: number,
): Promise<LspMethodSource> => {
  const params = new URLSearchParams({ version, file, line: String(line) });
  const response = await fetch(`/lsp/method-source?${params}`);
  if (!response.ok) {
    throw new Error("requête LSP method-source erreur");
  }
  return await response.json();
};
