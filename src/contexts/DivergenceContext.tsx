import { createContext, useState } from "react";
import type {
  D3Divergence,
  D3FlowDivergence,
  D3StateDivergence,
} from "../models/divergence";

type DivergenceContextType = {
  flowDivergences: D3FlowDivergence[];
  setFlowDivergences: (divergences: D3FlowDivergence[]) => void;

  stateDivergences: D3StateDivergence[];
  setStateDivergences: (divergences: D3StateDivergence[]) => void;

  selectedDivergence: D3Divergence | null;
  setSelectedDivergence: (d: D3Divergence | null) => void;

  isFlowDivergence: (divergence: D3Divergence) => boolean;
};

export const DivergenceContext = createContext<DivergenceContextType | null>(
  null,
);

export const DivergenceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [flowDivergences, setFlowDivergences] =
    useState<D3FlowDivergence[]>([]);

  const [stateDivergences, setStateDivergences] =
    useState<D3StateDivergence[]>([]);

  const [selectedDivergence, setSelectedDivergence] =
    useState<D3Divergence | null>(null);

  const isFlowDivergence = (d: D3Divergence): d is D3FlowDivergence => {
    return !("context" in d);
  };

  return (
    <DivergenceContext.Provider
      value={{
        flowDivergences,
        setFlowDivergences,

        stateDivergences,
        setStateDivergences,

        selectedDivergence,
        setSelectedDivergence,

        isFlowDivergence,
      }}
    >
      {children}
    </DivergenceContext.Provider>
  );
};
