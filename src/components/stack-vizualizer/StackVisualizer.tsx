import { useEffect } from "react";
import FrameTable from "../frame-table/FrameTable";
import "./StackVisualizer.css";
import ArrowBackIcon from "../../assets/icons/arrow_back.svg?react";
import ArrowForwardIcon from "../../assets/icons/arrow_forward.svg?react";
import RestartIcon from "../../assets/icons/restart.svg?react";
import SyncIcon from "../../assets/icons/arrows_sync.svg?react";
import type { D3FlowDivergence } from "../../models/divergence";
import { toZeroIndexed } from "../../models/stack";
import MonacoDiffEditor from "../monaco/MonacoDiffEditor";
import KeyboardNavigation from "../keyboard-navigation/KeyboardNavigation";
import InspectorPanel from "../inspector/InspectorPanel";
import { useStacks } from "../../hooks/useStacks";
import { useInspector } from "../../hooks/useInspector";

const StackVisualizer = () => {
  const {
    originalStack,
    originalPosition,
    modifiedStack,
    modifiedPosition,
    stepLeft,
    stepRight,
    stepSync,
    stepBackSync,
    restart,
  } = useStacks();

  const { reference, modified, inspectFrame } = useInspector();

 
  const referenceFrameId = originalStack.frames[originalPosition]?.id;
  const modifiedFrameId = modifiedStack.frames[modifiedPosition]?.id;

  useEffect(() => {
    if (referenceFrameId != null) inspectFrame(referenceFrameId, "reference");
  }, [referenceFrameId, inspectFrame]);

  useEffect(() => {
    if (modifiedFrameId != null) inspectFrame(modifiedFrameId, "modified");
  }, [modifiedFrameId, inspectFrame]);

  return (
    <>
      <div className="stack-actions container">
        <button onClick={stepLeft}>
          <ArrowBackIcon aria-label="Step left icon" />
          Step left
        </button>
        <button onClick={stepSync}>
          <SyncIcon aria-label="Step synchronized icon" />
          Step sync
        </button>
        <button onClick={stepRight}>
          <ArrowForwardIcon aria-label="Step right icon" />
          Step right
        </button>
        <button onClick={restart}>
          <RestartIcon aria-label="Restart icon" />
          Restart
        </button>
      </div>

      <div className="stack-table container">
        <KeyboardNavigation
          onArrowLeft={stepLeft}
          onArrowRight={stepRight}
          onArrowUp={stepBackSync}
          onArrowDown={stepSync}
        >
          <div className="stack-header">
            <div>
              <span>Position</span>
              <span>Frame</span>
            </div>
            <div>
              <span>Position</span>
              <span>Frame</span>
            </div>
          </div>
          <div className="frame-tables">
            <FrameTable
              frames={originalStack.frames}
              selectedPosition={originalPosition}
              getDivergencePosition={(d: D3FlowDivergence) =>
                d.originalPosition
              }
              prefixColor="var(--color-deletion)"
            />
            <FrameTable
              frames={modifiedStack.frames}
              selectedPosition={modifiedPosition}
              getDivergencePosition={(d: D3FlowDivergence) =>
                d.modifiedPosition
              }
              prefixColor="var(--color-addition)"
            />
          </div>
        </KeyboardNavigation>
      </div>

      <div className="stack-inspectors container">
        <InspectorPanel
          title="reference"
          color="var(--color-deletion)"
          state={reference}
        />
        <InspectorPanel
          title="modified"
          color="var(--color-addition)"
          state={modified}
        />
      </div>

      <div className="stack-editor container">
        <MonacoDiffEditor
          original={originalStack?.frames[originalPosition]?.sourceCode}
          modified={modifiedStack?.frames[modifiedPosition]?.sourceCode}
          originalFile={originalStack?.frames[originalPosition]?.fileName}
          originalLine={toZeroIndexed(
            originalStack?.frames[originalPosition]?.line,
          )}
          modifiedFile={modifiedStack?.frames[modifiedPosition]?.fileName}
          modifiedLine={toZeroIndexed(
            modifiedStack?.frames[modifiedPosition]?.line,
          )}
        />
      </div>
    </>
  );
};

export default StackVisualizer;
