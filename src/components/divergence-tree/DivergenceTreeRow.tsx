import EndDivergenceDiagonal from "./edges/EndDivergenceDiagonal";
import NodeRelation from "./edges/NodeRelation";
import StartDivergenceDiagonal from "./edges/StartDivergenceDiagonal";
import DivergenceNode from "./nodes/DivergenceNode";
import TreeNode from "./nodes/TreeNode";
import MonacoDiffEditor from "../monaco/MonacoDiffEditor";
import type { TreeRow } from "../../models/tree";
import { toZeroIndexed } from "../../models/stack";
import { useDivergenceTree } from "../../hooks/useDivergenceTree";

interface DivergenceTreeRowProps {
  row: TreeRow;
}

/**
 * If the frame is null, that means we are in the case where the divergence is longer than the original path,
 * so we display a row where there is not any node on the original path, but there is a node on the divergence path.
 */
const DivergenceTreeRow: React.FC<DivergenceTreeRowProps> = ({ row }) => {
  const { selectedRow, setSelectedRow, selectedRef } = useDivergenceTree();

  const {
    index,
    frame,
    modifiedFrame,
    hasPreviousInDivergence,
    hasNextInDivergence,
    isStateDivergence,
    flowDivergence,
  } = row;

  const getRowFormattedLabel = () => {
    return (
      <>
        <span>{index}</span>
        {flowDivergence && !hasPreviousInDivergence && (
          <span>{flowDivergence.displayName}</span>
        )}
      </>
    );
  };

  /**
   * Returns the svg for the row.
   * @returns A ReactNode element.
   */
  const buildRowSvg = () => {
    return (
      <>
        {!hasPreviousInDivergence && <StartDivergenceDiagonal />}
        {!hasNextInDivergence && <EndDivergenceDiagonal />}
        <NodeRelation
          hasPrevious={hasPreviousInDivergence}
          hasNext={hasNextInDivergence}
        />
        {modifiedFrame != null && (
          <DivergenceNode isStateDiv={isStateDivergence} />
        )}
      </>
    );
  };

  /**
   * Changes the selected row when clicked.
   */
  const handleClickOnRow = () => {
    if (selectedRow === index) setSelectedRow(null);
    else setSelectedRow(index);
  };

  return (
    <div
      ref={selectedRow === index ? selectedRef : null}
      className={selectedRow === index ? "tree-row selected" : "tree-row"}
    >
      <svg className="tree-svg-wrapper" onClick={handleClickOnRow}>
        {frame != null && <TreeNode isStateDiv={isStateDivergence} />}
        {flowDivergence != null && buildRowSvg()}
      </svg>

      <div className="tree-row-content">
        <div className="tree-row-label" onClick={handleClickOnRow}>
          {getRowFormattedLabel()}
        </div>
        {selectedRow === index && (
          <MonacoDiffEditor
            original={frame?.sourceCode}
            modified={modifiedFrame?.sourceCode}
            originalFile={frame?.fileName}
            originalLine={toZeroIndexed(frame?.line)}
            modifiedFile={modifiedFrame?.fileName}
            modifiedLine={toZeroIndexed(modifiedFrame?.line)}
          />
        )}
      </div>
    </div>
  );
};

export default DivergenceTreeRow;
