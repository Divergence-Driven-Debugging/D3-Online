export type D3CallStack = {
  id: number;
  frames: D3StackFrame[];
};

export type D3StackFrame = {
  id: number;
  displayName: string;
  sourceCode: string;
  line?: number;
  fileName?: string;
};

export const toZeroIndexed = (line: number | undefined): number | undefined =>
  line === undefined ? undefined : line - 1;
