import { forwardRef } from "react";
import type {
  DivergencePosition,
  D3FlowDivergence,
} from "../../models/divergence";
import type { D3StackFrame } from "../../models/stack";
import { useDivergence } from "../../hooks/useDivergence";
import { useStacks } from "../../hooks/useStacks";

interface FrameTableItemProps {
  frame: D3StackFrame;
  prefixColor: string;
  getDivergencePosition: (d: D3FlowDivergence) => DivergencePosition | number;
  selected: boolean;
  index: number;
}

const FrameTableItem = forwardRef<HTMLDivElement, FrameTableItemProps>(
  ({ frame, prefixColor, getDivergencePosition, selected, index }, ref) => {
    const { isFlowDivergence, selectedDivergence } = useDivergence();
    const { updateTablesPositions } = useStacks();

    const handleClick = () => updateTablesPositions(index);

    /**
     * Return true if the specified frame should have a color indicator as divergence prefix:
     * - true if the selected divergence is a StateDivergence and its position is the same as the frame's position.
     * - true if the selected divergence is a FlowDivergence that contains the frame's position.
     * - false otherwise
     * @param frame The specified frame
     * @returns True if the frame should have a divergence prefix.
     */
    const hasDivergencePrefix = () => {
      if (!selectedDivergence) {
        return false;
      }
      const position = getDivergencePosition(
        selectedDivergence as D3FlowDivergence,
      );
      if (isFlowDivergence(selectedDivergence)) {
        const divergencePosition = position as DivergencePosition;
        return (
          divergencePosition.start <= index &&
          (divergencePosition.stop ? index <= divergencePosition.stop : true)
        );
      } else {
        return position == index;
      }
    };

    const hasPrefix = hasDivergencePrefix();

    return (
      <div
        ref={ref}
        className="frame-table-item-wrapper"
        onClick={handleClick}
      >
        {hasPrefix && (
          <div
            className="frame-prefix"
            style={{ backgroundColor: prefixColor }}
          />
        )}
        <div
          className={"frame-table-item" + (selected ? " selected" : "")}
        >
          <span>{index}</span>
          <span>{frame.displayName}</span>
        </div>
      </div>
    );
  },
);

export default FrameTableItem;
