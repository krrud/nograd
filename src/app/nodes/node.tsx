import React, {useEffect, useMemo, useState} from "react";
import {Handle, Position} from "reactflow";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from "react-tooltip";

// Node
interface NodeProps {
  children?: React.ReactNode;
  title?: string;
  type: string;
  inputs?: string[];
  outputs?: string[];
  errors?: string[];
}

export default function Node({
  children,
  title,
  type,
  inputs,
  outputs,
  errors,
}: NodeProps) {

  const [showExtra, setShowExtra] = useState(false);

  function createHandles (labels: string[], type: "target" | "source", position: Position) {
    const count = labels.length;
    const spacing = 24;
    return Array.from({ length: count }, (v, i) => (
      <div key={`${type}-handle-${i}`}>
        <Handle          
          type={type}
          position={position}
          id={`${labels[i]}`}
          isConnectable={true}
          style={{ top: `${44 + i * spacing}px`, width: 8, height: 8}}
        />
        <h1 className="text-xxs absolute" style={{
          top: `${39 + i * spacing}px`,
          left: position === Position.Left ? 12 : undefined,
          right: position === Position.Right ? 14 : undefined,
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

  const headerColors: { [key: string]: string } = {
    data: "bg-data",
    layer: "bg-layer",
    model: "bg-model"
  };
  const headerColor = headerColors[type] || "bg-default";

  const hasExtra = React.Children.toArray(children).some((child) => {
    if (React.isValidElement(child)) {
      return child.props.extra;
    }
    return false;
  });

  const errorDisplay = useMemo(() => {
    if (!errors || errors.length === 0) return null;
    return (
        <div className='w-3 h-3 rounded-full bg-white mr-2 justify-center items-center flex font-bold cursor-pointer' id="error-handle">
          <h1 className="text-black">!</h1>
          <Tooltip id="error-tooltip" place="top" anchorSelect="#error-handle" style={{maxWidth: 400}} clickable className="nodrag select-text">
            {errors.map((error, index) => (
              <p className="text-xs text-gray-300 font-normal" key={index}>{error}</p>            
            ))}
          </Tooltip>
        </div>
      );
  }, [errors]);

  return (
    <div className="flex flex-col w-44 rounded-lg shadow-lg overflow-hidden cursor-grab">
      <div className={`${headerColor} px-3 py-1.5 text-xs text-gray-200 flex justify-between items-center`}>
        {title}      
        <div className="flex flex-row items-center">
            {errorDisplay}   
            <span className="opacity-20 hover:opacity-100">
              <FontAwesomeIcon icon={faQuestionCircle} />
            </span>
          </div>
        </div>
      <div className="bg-white px-3 pt-8 pb-1 cursor-grab">
        {handles}
        {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          if (child.props.extra && !showExtra) return null;
          return <div key={index}>{child}</div>;
        }
        return null;
      })}
      </div>
      {hasExtra && (
        <div className="flex justify-center bg-white items-center w-full pt-1 pb-2">
          <div className="flex justify-center w-full">
            <h1 className="text-xxs text-gray-500 px-4 py-0 hover:cursor-pointer" onClick={() => setShowExtra(!showExtra)}>
              {showExtra ? "less" : "more"}
            </h1>
          </div>
        </div>
      )}
    </div>
  );
}


// Node Field
interface NodeFieldProps {
  value: any;
  type?: string;
  name: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: string[];
  extra?: boolean;
  handle?: number;
}

export function NodeField({value, type, name, onChange=()=>{}, options, extra=false, handle=undefined} : NodeFieldProps) {
  const fieldRef = React.useRef<HTMLInputElement>(null);

  
  let inputType = type || typeof value || "text";
  function field() {
    switch (inputType) {
      case "select":
        return (
          <select
            value={value}
            onChange={onChange}
            className="nodrag text-xs w-1/2 h-full bg-transparent outline-none text-left px-1 border border-gray-200 rounded text-right"
          >
            {options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
          // <Select value ={value}options={options}/> // TODO: Implement react-select(?)
        );
      default:
        return (
          <input
            type={inputType}
            value={value}
            onChange={onChange}
            className="nodrag text-xs text-right w-1/2 h-full bg-transparent outline-none px-1 border border-gray-200 rounded"
          />
        );
    }
  }

  return (
    <div ref={fieldRef}>        
      {handle &&         
        <Handle
          type="target"
          position={Position.Left}
          id={name}
          isConnectable={true}
          style={{top: 32 * (handle-1) + 72, height: 8, width: 8, backgroundColor: "white", borderColor: "black", borderWidth: 1}}
        />
      }
      <label className="flex items-start text-xs h-6 mb-2 justify-between cursor-grab">
        <span className="whitespace-nowrap mt-1 mr-1.5 text-xxs">{name}:</span>
        {field()}
      </label>
    </div>
  );
}