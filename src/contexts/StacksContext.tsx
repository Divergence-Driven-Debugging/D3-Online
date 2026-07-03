import { createContext, useState } from "react";
import type { D3CallStack } from "../models/stack";

const emptyStack: D3CallStack = { id: 0, frames: [] };

type StacksContextType = {
  originalStack: D3CallStack;
  setOriginalStack: (stack: D3CallStack) => void;
  modifiedStack: D3CallStack;
  setModifiedStack: (stack: D3CallStack) => void;
  originalPosition: number;
  setOriginalPosition: (newPosition: number) => void;
  modifiedPosition: number;
  setModifiedPosition: (newPosition: number) => void;
  updateTablesPositions: (newPosition: number) => void;
  stepLeft: () => void;
  stepRight: () => void;
  stepSync: () => void;
  stepBackSync: () => void;
  restart: () => void;
  increaseOriginalPosition: () => void;
  increaseModifiedPosition: () => void;
  decreaseOriginalPosition: () => void;
  decreaseModifiedPosition: () => void;
};

export const StacksContext = createContext<StacksContextType | null>(null);

export const StacksProvider = ({ children }: { children: React.ReactNode }) => {
  const [originalStack, setOriginalStack] = useState<D3CallStack>(emptyStack);
  const [modifiedStack, setModifiedStack] = useState<D3CallStack>(emptyStack);
  const [originalPosition, setOriginalPosition] = useState(0);
  const [modifiedPosition, setModifiedPosition] = useState(0);

  /**
   * Sets a new position for both frames tables.
   * @param newPosition The new position for both tables.
   */
  const updateTablesPositions = (newPosition: number) => {
    setOriginalPosition(newPosition);
    setModifiedPosition(newPosition);
  };

  /**
   * Increases the original stack selected position.
   */
  const increaseOriginalPosition = () => {
    if (originalPosition < originalStack.frames.length - 1) {
      setOriginalPosition(originalPosition + 1);
    }
  };

  /**
   * Increases the modified stack selected position.
   */
  const increaseModifiedPosition = () => {
    if (modifiedPosition < modifiedStack.frames.length - 1) {
      setModifiedPosition(modifiedPosition + 1);
    }
  };

  /**
   * Decreases the original stack selected position.
   */
  const decreaseOriginalPosition = () => {
    if (originalPosition > 0) {
      setOriginalPosition(originalPosition - 1);
    }
  };

  /**
   * Decreases the modified stack selected position.
   */
  const decreaseModifiedPosition = () => {
    if (modifiedPosition > 0) {
      setModifiedPosition(modifiedPosition - 1);
    }
  };

  const stepLeft = () => increaseOriginalPosition();
  const stepRight = () => increaseModifiedPosition();

  const stepSync = () => {
    increaseOriginalPosition();
    increaseModifiedPosition();
  };

  const stepBackSync = () => {
    if (originalPosition > modifiedPosition) {
      decreaseOriginalPosition();
    } else if (modifiedPosition > originalPosition) {
      decreaseModifiedPosition();
    } else {
      decreaseOriginalPosition();
      decreaseModifiedPosition();
    }
  };

  const restart = () => updateTablesPositions(0);

  return (
    <StacksContext.Provider
      value={{
        originalStack,
        setOriginalStack,
        modifiedStack,
        setModifiedStack,
        originalPosition,
        setOriginalPosition,
        modifiedPosition,
        setModifiedPosition,
        updateTablesPositions,
        increaseOriginalPosition,
        increaseModifiedPosition,
        decreaseOriginalPosition,
        decreaseModifiedPosition,
        stepLeft,
        stepRight,
        stepSync,
        stepBackSync,
        restart,
      }}
    >
      {children}
    </StacksContext.Provider>
  );
};
