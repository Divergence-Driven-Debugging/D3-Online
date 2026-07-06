import ObjectTree from "./ObjectTree";
import type { VersionInspectorState } from "../../contexts/InspectorContext";
import "./InspectorPanel.css";

interface InspectorPanelProps {
  title: string;
  color?: string;
  state: VersionInspectorState;
}


const InspectorPanel: React.FC<InspectorPanelProps> = ({
  title,
  color,
  state,
}) => {
  return (
    <div className="inspector-panel">
      <div
        className="inspector-panel-header"
        style={color ? { borderBottomColor: color } : undefined}
      >
        <span className="inspector-panel-title">{title}</span>
        {state.frameId != null && (
          <span className="inspector-panel-frame">frame #{state.frameId}</span>
        )}
      </div>
      <div className="inspector-panel-body">
        { state.error ? (
          <div className="inspector-panel-status error">
            Erreur : {state.error}
          </div>
        ) : state.frameId == null ? (
          <div className="inspector-panel-status">
            Clique sur frame bouffon.
          </div>
        ) : (
          <ObjectTree data={state.objects} />
        )}
      </div>
    </div>
  );
};

export default InspectorPanel;
