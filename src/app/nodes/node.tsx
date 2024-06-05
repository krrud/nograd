import {useMemo} from "react";
import {Handle, Position} from "reactflow";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';


// Node
interface NodeProps {
  children?: React.ReactNode;
  title?: string;
  type: string;
  inputs?: string[];
  outputs?: string[];
}

export default function Node({
  children,
  title,
  type,
  inputs,
  outputs,
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
          style={{ top: `${44 + i * spacing}px`, width: 8, height: 8}}
        />
        <h1 className="text-xs absolute" style={{
          top: `${38 + i * spacing}px`,
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
    if (inputs !== undefined) {
      allHandles.push(...createHandles(inputs, "target", Position.Left));
    }
    if (outputs !== undefined) {
      allHandles.push(...createHandles(outputs, "source", Position.Right));
    }
    return allHandles;
  }, [inputs, outputs]);

  const bg = type === "data" ? "bg-data" : "bg-layer";

  return (
    <div className="flex flex-col w-40 rounded-lg shadow-lg overflow-hidden">
      <div className={`${bg} px-3 py-1.5 text-xs text-gray-200 flex justify-between items-center`}>
        {title}
        <span className="opacity-20 transition-opacity duration-300 hover:opacity-100">
          <FontAwesomeIcon icon={faQuestionCircle} />
        </span>
      </div>
      <div className="bg-white px-3 pt-8">
        {handles}
        {children}
      </div>
      <div className="flex justify-center bg-white h-3 items-center w-full py-2">
        <div className={"w-full flex justify-center opacity-0 hover:opacity-100"}>
          <FontAwesomeIcon icon={faChevronDown} width={10} className="nodrag"/>
        </div>
      </div>
    </div>
  );
}

// Node Field
interface NodeFieldProps {
  value: any;
  name: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function NodeField({value, name, onChange=()=>{}} : NodeFieldProps) {
  const type = typeof value;
  switch (type) {
    case 'number' || 'string':
      return (
        <label className="flex items-start text-xs h-6 mb-2">
          <span className="whitespace-nowrap mt-1 mr-1.5 text-xxs text-align-right">{name}:</span>
          <input
            type={type}
            value={value}
            onChange={onChange}
            className="nodrag text-xs w-full h-full bg-transparent outline-none text-left px-1 border border-gray-200 rounded"
          />
        </label>
      );
    default:
      return (
        <label className="flex items-start text-xs h-6 mb-2">
          <span className="whitespace-nowrap mt-1 mr-1.5 text-xxs text-align-right">{name}:</span>
          <input
            type="text"
            value={value}
            onChange={onChange}
            className="nodrag text-xs w-full h-full bg-transparent outline-none text-left px-1 border border-gray-200 rounded"
          />
        </label>
      );
  }
}