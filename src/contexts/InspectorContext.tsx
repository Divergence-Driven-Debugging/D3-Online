import { createContext, useCallback, useState } from "react";
import { getFrameObjects, type D3Version } from "../services/api";

export type VersionInspectorState = {
  objects: unknown;
  loading: boolean;
  error: string | null;
  frameId: number | null;
};

const emptyState = (): VersionInspectorState => ({
  objects: null,
  loading: false,
  error: null,
  frameId: null,
});

type InspectorContextType = {
  reference: VersionInspectorState;
  modified: VersionInspectorState;
  inspectFrame: (frameId: number, version: D3Version) => Promise<void>;
};

export const InspectorContext = createContext<InspectorContextType | null>(
  null,
);

export const InspectorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [reference, setReference] = useState<VersionInspectorState>(
    emptyState(),
  );
  const [modified, setModified] = useState<VersionInspectorState>(emptyState());


  const inspectFrame = useCallback(
    async (frameId: number, version: D3Version) => {
      const setState = version === "reference" ? setReference : setModified;
      setState((s) => ({ ...s, loading: true, error: null, frameId }));
      try {
        const objects = await getFrameObjects(frameId, version);
        setState({ objects, loading: false, error: null, frameId });
      } catch (e) {
        setState({
          objects: null,
          loading: false,
          error: (e as Error).message,
          frameId,
        });
      }
    },
    [],
  );

  return (
    <InspectorContext.Provider value={{ reference, modified, inspectFrame }}>
      {children}
    </InspectorContext.Provider>
  );
};
