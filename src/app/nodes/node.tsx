import React, {useMemo, useState} from "react";
import {Handle, Position} from "reactflow";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select'

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

  const [showExtra, setShowExtra] = useState(false);

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

  return (
    <div className="flex flex-col w-40 rounded-lg shadow-lg overflow-hidden">
      <div className={`${headerColor} px-3 py-1.5 text-xs text-gray-200 flex justify-between items-center`}>
        {title}
        <span className="opacity-20 hover:opacity-100">
          <FontAwesomeIcon icon={faQuestionCircle} />
        </span>
      </div>
      <div className="bg-white px-3 pt-8 pb-1">
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
}

export function NodeField({value, type, name, onChange=()=>{}, options, extra=false} : NodeFieldProps) {
  let inputType = type || typeof value || "text";
  function field() {
    switch (inputType) {
      case "select":
        return (
          <select
            value={value}
            onChange={onChange}
            className="nodrag text-xs w-full h-full bg-transparent outline-none text-left px-1 border border-gray-100 rounded text-right"
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
            className="nodrag text-xs text-right w-full h-full bg-transparent outline-none px-1 border border-gray-100 rounded"
          />
        );
    }
  }
  return (
    <label className="flex items-start text-xs h-6 mb-2">
      <span className="whitespace-nowrap mt-1 mr-1.5 text-xxs">{name}:</span>
      {field()}
    </label>
  );
}