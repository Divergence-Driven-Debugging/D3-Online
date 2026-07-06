import { useState } from "react";
import "./ObjectTree.css";

/* ---------- types (loose, tolère la forme du serveur) ---------- */

type Ref = { kind: "reference"; className: string; oid: number };
type ObjState = {
  className?: string;
  oid?: number;
  slots?: Record<string, unknown>;
};

type Entry = [string, unknown];

const isRef = (v: unknown): v is Ref =>
  !!v && typeof v === "object" && (v as Ref).kind === "reference";

const isObjState = (v: unknown): v is ObjState =>
  !!v && typeof v === "object" && "slots" in (v as object);


const buildIndex = (data: unknown): Map<number, ObjState> => {
  const index = new Map<number, ObjState>();
  if (data && typeof data === "object") {
    for (const v of Object.values(data as Record<string, unknown>)) {
      if (v && typeof v === "object" && typeof (v as ObjState).oid === "number") {
        index.set((v as ObjState).oid as number, v as ObjState);
      }
    }
  }
  return index;
};

const typeOf = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
};

const primitivePreview = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "string") return `"${v}"`;
  return String(v);
};



interface Described {
  display: string; 
  valueClass: string; 
  expandable: boolean;
  oid?: number; 
  children: () => Entry[];
}

const describe = (
  value: unknown,
  index: Map<number, ObjState>,
  ancestors: Set<number>,
): Described => {
  if (isRef(value)) {
    const target = index.get(value.oid);
    const cyclic = ancestors.has(value.oid);
    if (!target || cyclic) {
      return {
        display: `${value.className}#${value.oid}${cyclic ? " ↻" : ""}`,
        valueClass: "type",
        expandable: false,
        oid: value.oid,
        children: () => [],
      };
    }
    return {
      display: value.className,
      valueClass: "type",
      expandable: true,
      oid: value.oid,
      children: () => Object.entries(target.slots ?? {}),
    };
  }

  
  if (isObjState(value)) {
    const slots = value.slots ?? {};
    return {
      display: value.className ?? "object",
      valueClass: "type",
      expandable: Object.keys(slots).length > 0,
      oid: value.oid,
      children: () => Object.entries(slots),
    };
  }


  if (Array.isArray(value)) {
    return {
      display: `Array(${value.length})`,
      valueClass: "type",
      expandable: value.length > 0,
      children: () => value.map((v, i) => [String(i), v] as Entry),
    };
  }


  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return {
      display: "{…}",
      valueClass: "type",
      expandable: entries.length > 0,
      children: () => entries,
    };
  }


  return {
    display: primitivePreview(value),
    valueClass: typeOf(value),
    expandable: false,
    children: () => [],
  };
};



interface VariableRowProps {
  name: string;
  value: unknown;
  index: Map<number, ObjState>;
  depth: number;
  ancestors: Set<number>;
}

const VariableRow: React.FC<VariableRowProps> = ({
  name,
  value,
  index,
  depth,
  ancestors,
}) => {
  const d = describe(value, index, ancestors);
  const [open, setOpen] = useState(depth < 1);
  const childAncestors =
    d.oid != null ? new Set([...ancestors, d.oid]) : ancestors;

  return (
    <div className="var-node">
      <div
        className={"var-row" + (d.expandable ? " expandable" : "")}
        style={{ paddingLeft: 4 + depth * 14 }}
        onClick={() => d.expandable && setOpen((o) => !o)}
      >
        <span className="var-caret">
          {d.expandable ? (open ? "▾" : "▸") : ""}
        </span>
        <span className="var-name">{name}</span>
        <span className="var-colon">:</span>
        <span className={"var-value " + d.valueClass}>{d.display}</span>
      </div>
      {d.expandable && open && (
        <div className="var-children">
          {d.children().map(([k, v]) => (
            <VariableRow
              key={k}
              name={k}
              value={v}
              index={index}
              depth={depth + 1}
              ancestors={childAncestors}
            />
          ))}
        </div>
      )}
    </div>
  );
};


interface ObjectTreeProps {
  data: unknown;
}


const ObjectTree: React.FC<ObjectTreeProps> = ({ data }) => {
  if (
    data == null ||
    typeof data !== "object" ||
    Object.keys(data as object).length === 0
  ) {
    return <div className="var-empty">Aucun objet à cette frame.</div>;
  }

  const index = buildIndex(data);

  return (
    <div className="var-tree">
      {Object.entries(data as Record<string, unknown>).map(([k, v]) => (
        <VariableRow
          key={k}
          name={k}
          value={v}
          index={index}
          depth={0}
          ancestors={new Set()}
        />
      ))}
    </div>
  );
};

export default ObjectTree;
