import {useMemo} from "react";
import {Handle, Position} from "reactflow";

interface NodeProps {
  children?: React.ReactNode;
  title?: string;
  targetHandles?: string[];
  sourceHandles?: string[];
}

export default function Node({
  children,
  title,
  targetHandles,
  sourceHandles,
}: NodeProps) {

  function createHandles (labels: string[], type: "target" | "source", position: Position) {
    const count = labels.length;
    const spacing = 24;
    return Array.from({ length: count }, (v, i) => (
      <div key={`${type}-handle-${i}`}>
        <Handle          
          type={type}
          position={position}
          id={`${type}${i}`}
          isConnectable={true}
          style={{ top: `${50 + i * spacing}px`, width: 8, height: 8}}
        />
        <h1 className="text-xs absolute" style={{
          top: `${42 + i * spacing}px`,
          left: position === Position.Left ? 10 : undefined,
          right: position === Position.Right ? 10 : undefined,
          fontSize: 8,
        }}>
          {labels[i]} 
        </h1>
      </div>

    ));
  };

  const handles = useMemo(() => {
    const allHandles = [];
    if (targetHandles !== undefined) {
      allHandles.push(...createHandles(targetHandles, "target", Position.Left));
    }
    if (sourceHandles !== undefined) {
      allHandles.push(...createHandles(sourceHandles, "source", Position.Right));
    }
    return allHandles;
  }, [targetHandles, sourceHandles]);

  return (
    <div className="flex flex-col w-48 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-300 px-4 py-2 text-xs">
        {title}
      </div>
      <div className="p-2 bg-white">
        {handles}
        {children}
      </div>
    </div>
  );
}

interface NodeFieldProps {
  value: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function NodeField({value, onChange=()=>{}} : NodeFieldProps) {
  const type = typeof value;
  switch (type) {
    case 'number' || 'string':
      return (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="nodrag text-xs w-2/3 h-full bg-transparent outline-none text-left"
        />
      );
    default:
      return (
        <input
          type="text"
          value={value}
          onChange={onChange}
          className="nodrag text-xs w-1/2 h-full bg-transparent outline-none text-left"
        />
      );
  }
}