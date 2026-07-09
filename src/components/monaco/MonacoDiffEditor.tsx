import { DiffEditor, type DiffOnMount, type Monaco } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { useEffect, useRef, useState, type RefObject } from "react";
import { defineMonacoTheme, MONACO_OPTIONS } from "../../config/monaco";
import { useSettings } from "../../hooks/useSettings";
import {
  classifySymbol,
  getSymbols,
  type D3Symbol,
  type SymbolKind,
} from "../../services/api";
import {
  getDefinition,
  getHover,
  getMethodSource,
  getReferences,
  type LspVersion,
} from "../../services/lsp";
import "./MonacoDiffEditor.css";

interface MonacoDiffEditorProps {
  original: string | undefined;
  modified: string | undefined;
  originalFile?: string;
  originalLine?: number;
  modifiedFile?: string;
  modifiedLine?: number;
}

type MethodDisplay = { text: string; startLine: number; highlightLine: number };

type LspEditorContext = {
  diffEditor: MonacoEditor.IStandaloneDiffEditor;
  file: { reference?: string; modified?: string };
  lineOffset: { reference: number; modified: number };
};

const activeLspContexts = new Set<LspEditorContext>();

let hoverProviderRegistered = false;
const ensureHoverProviderRegistered = (monaco: Monaco) => {
  if (hoverProviderRegistered) return;
  hoverProviderRegistered = true;
  monaco.languages.registerHoverProvider("python", {
    provideHover: async (model, position) => {
      for (const ctx of activeLspContexts) {
        const models = ctx.diffEditor.getModel();
        if (!models) continue;
        const version: LspVersion | null =
          models.original === model
            ? "reference"
            : models.modified === model
              ? "modified"
              : null;
        if (!version) continue;

        const file = ctx.file[version];
        if (!file) return null;

        try {
          const hover = await getHover(
            version,
            file,
            position.lineNumber - 1 + ctx.lineOffset[version],
            position.column - 1,
          );
          if (!hover) return null;
          return { contents: [{ value: hover.contents.value }] };
        } catch {
          return null;
        }
      }
      return null;
    },
  });
};

const MonacoDiffEditor: React.FC<MonacoDiffEditorProps> = ({
  original = "",
  modified = "",
  originalFile,
  originalLine = 0,
  modifiedFile,
  modifiedLine = 0,
}) => {
  const { darkMode } = useSettings();

  const referenceSymbols = useRef<D3Symbol[] | null>(null);
  const modifiedSymbols = useRef<D3Symbol[] | null>(null);
  const [selected, setSelected] = useState<{
    word: string;
    kind: SymbolKind;
  } | null>(null);
  const [lspInfo, setLspInfo] = useState<string | null>(null);
  const [originalDisplay, setOriginalDisplay] = useState<MethodDisplay | null>(null);
  const [modifiedDisplay, setModifiedDisplay] = useState<MethodDisplay | null>(null);
  const [mounted, setMounted] = useState(false);

  const lspContext = useRef<LspEditorContext | null>(null);
  const diffEditorRef = useRef<MonacoEditor.IStandaloneDiffEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const originalDecorations = useRef<MonacoEditor.IEditorDecorationsCollection | null>(null);
  const modifiedDecorations = useRef<MonacoEditor.IEditorDecorationsCollection | null>(null);

  useEffect(() => {
    getSymbols("reference")
      .then((s) => (referenceSymbols.current = s))
      .catch(() => {});
    getSymbols("modified")
      .then((s) => (modifiedSymbols.current = s))
      .catch(() => {});
  }, []);

   useEffect(() => {
    if (!originalFile) {
      setOriginalDisplay(null);
      return;
    }
    let cancelled = false;
    getMethodSource("reference", originalFile, originalLine)
      .then((method) => {
        if (cancelled) return;
        setOriginalDisplay(
          method && {
            text: method.source,
            startLine: method.startLine,
            highlightLine: originalLine,
          },
        );
      })
      .catch(() => {
        if (!cancelled) setOriginalDisplay(null);
      });
    return () => {
      cancelled = true;
    };
  }, [originalFile, originalLine]);

  useEffect(() => {
    if (!modifiedFile) {
      setModifiedDisplay(null);
      return;
    }
    let cancelled = false;
    getMethodSource("modified", modifiedFile, modifiedLine)
      .then((method) => {
        if (cancelled) return;
        setModifiedDisplay(
          method && {
            text: method.source,
            startLine: method.startLine,
            highlightLine: modifiedLine,
          },
        );
      })
      .catch(() => {
        if (!cancelled) setModifiedDisplay(null);
      });
    return () => {
      cancelled = true;
    };
  }, [modifiedFile, modifiedLine]);

  const effectiveOriginalOffset = originalDisplay?.startLine ?? originalLine;
  const effectiveModifiedOffset = modifiedDisplay?.startLine ?? modifiedLine;

    useEffect(() => {
    const ctx = lspContext.current;
    if (!ctx) return;
    ctx.file = { reference: originalFile, modified: modifiedFile };
    ctx.lineOffset = {
      reference: effectiveOriginalOffset,
      modified: effectiveModifiedOffset,
    };
  }, [originalFile, modifiedFile, effectiveOriginalOffset, effectiveModifiedOffset]);

  useEffect(
    () => () => {
      if (lspContext.current) activeLspContexts.delete(lspContext.current);
    },
    [],
  );

  useEffect(() => {
    const diffEditor = diffEditorRef.current;
    const monacoInst = monacoRef.current;
    if (!mounted || !diffEditor || !monacoInst) return;
    if (!originalDecorations.current) {
      originalDecorations.current = diffEditor.getOriginalEditor().createDecorationsCollection();
    }
    if (originalDisplay) {
      const localLine = originalDisplay.highlightLine - originalDisplay.startLine + 1;
      originalDecorations.current.set([
        {
          range: new monacoInst.Range(localLine, 1, localLine, 1),
          options: { isWholeLine: true, className: "current-frame-line" },
        },
      ]);
      diffEditor.getOriginalEditor().revealLineInCenter(localLine);
    } else {
      originalDecorations.current.set([]);
    }
  }, [mounted, originalDisplay]);

  useEffect(() => {
    const diffEditor = diffEditorRef.current;
    const monacoInst = monacoRef.current;
    if (!mounted || !diffEditor || !monacoInst) return;
    if (!modifiedDecorations.current) {
      modifiedDecorations.current = diffEditor.getModifiedEditor().createDecorationsCollection();
    }
    if (modifiedDisplay) {
      const localLine = modifiedDisplay.highlightLine - modifiedDisplay.startLine + 1;
      modifiedDecorations.current.set([
        {
          range: new monacoInst.Range(localLine, 1, localLine, 1),
          options: { isWholeLine: true, className: "current-frame-line" },
        },
      ]);
      diffEditor.getModifiedEditor().revealLineInCenter(localLine);
    } else {
      modifiedDecorations.current.set([]);
    }
  }, [mounted, modifiedDisplay]);

  const handleMount: DiffOnMount = (diffEditor, monaco) => {
    diffEditorRef.current = diffEditor;
    monacoRef.current = monaco;
    setMounted(true);

    const ctx: LspEditorContext = {
      diffEditor,
      file: { reference: originalFile, modified: modifiedFile },
      lineOffset: {
        reference: effectiveOriginalOffset,
        modified: effectiveModifiedOffset,
      },
    };
    lspContext.current = ctx;
    activeLspContexts.add(ctx);
    ensureHoverProviderRegistered(monaco);

    const register = (
      ed: MonacoEditor.IStandaloneCodeEditor,
      version: LspVersion,
      symbolsRef: RefObject<D3Symbol[] | null>,
    ) => {
      ed.addAction({
        id: "d3.symbol-type",
        label: "D3 : type du symbole",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.5,
        run: (e) => {
          const position = e.getPosition();
          const word = position
            ? e.getModel()?.getWordAtPosition(position)?.word
            : undefined;
          if (!word) return;
          setSelected({ word, kind: classifySymbol(word, symbolsRef.current) });
        },
      });

      ed.addAction({
        id: `d3.lsp-definition-${version}`,
        label: "D3 : aller à la définition (LSP)",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.6,
        run: async (e) => {
          const position = e.getPosition();
          const file = ctx.file[version];
          if (!position || !file) return;
          try {
            const locations = await getDefinition(
              version,
              file,
              position.lineNumber - 1 + ctx.lineOffset[version],
              position.column - 1,
            );
            setLspInfo(
              locations.length
                ? `définition : ${locations[0].relativePath}:${locations[0].range.start.line + 1}`
                : "définition introuvable",
            );
          } catch {
            setLspInfo("LSP indisponible");
          }
        },
      });

      ed.addAction({
        id: `d3.lsp-references-${version}`,
        label: "D3 : références (LSP)",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.7,
        run: async (e) => {
          const position = e.getPosition();
          const file = ctx.file[version];
          if (!position || !file) return;
          try {
            const locations = await getReferences(
              version,
              file,
              position.lineNumber - 1 + ctx.lineOffset[version],
              position.column - 1,
            );
            setLspInfo(`${locations.length} référence(s) trouvée(s)`);
          } catch {
            setLspInfo("LSP indisponible");
          }
        },
      });
    };

    register(diffEditor.getOriginalEditor(), "reference", referenceSymbols);
    register(diffEditor.getModifiedEditor(), "modified", modifiedSymbols);
  };

  return (
    <div className="diff-editor-wrapper">
      <DiffEditor
        height="300px"
        theme={darkMode ? "d3-dark" : "d3-light"}
        language="python"
        options={MONACO_OPTIONS}
        beforeMount={defineMonacoTheme}
        onMount={handleMount}
        original={originalDisplay?.text ?? original}
        modified={modifiedDisplay?.text ?? modified}
      />
      {selected && (
        <div className="symbol-banner">
          <span className="symbol-banner-word">« {selected.word} »</span>
          <span className="symbol-banner-arrow">→</span>
          <span className={"symbol-banner-kind " + selected.kind}>
            {selected.kind}
          </span>
        </div>
      )}
      {lspInfo && <div className="lsp-banner">{lspInfo}</div>}
    </div>
  );
};

export default MonacoDiffEditor;
