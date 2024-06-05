import React, { use, useEffect, useMemo, useState } from 'react';
import {NodeProps, Handle, Position} from 'reactflow';
import {ExtendedNode, MultiplyNodeData} from './nodeTypes';
import useNodes from './nodeStore';
import { isValueNodeData } from './valueNode';
import Node from './node';


export function isMultiplyNodeData(data: any): data is MultiplyNodeData {
  return data !== undefined && typeof data.a === 'number' && typeof data.b === 'number';
}

export default function MultiplyNode({id, isConnectable, data}: NodeProps<MultiplyNodeData>) {

  const node = useNodes(state => state.getNode(id));
  const inputs = useNodes(state => state.getInputEdges(id));
  const [output, setOutput] = useState<number | undefined>(undefined);

  const nodeData = useMemo(() => {
    if (inputs[0] && inputs[1]) {
      const sourceA = useNodes.getState().getNode(inputs[0].source);
      const sourceB = useNodes.getState().getNode(inputs[1].source);
      if (
        !sourceA || !sourceB ||
        sourceA.type !== 'value' || sourceB.type !== 'value' ||
        !isValueNodeData(sourceA.data) || !isValueNodeData(sourceB.data)
      ) return { a: undefined, b: undefined };
      return { a: sourceA.data.x, b: sourceB.data.x };
    }
    return node && isMultiplyNodeData(node.data) ? node.data : { a: undefined, b: undefined };
  }, [node, inputs]);


  useEffect(() => {
    let multiply = undefined;
    if (nodeData.a !== undefined && nodeData.b !== undefined) {
        multiply = nodeData.a * nodeData.b;
        if (isNaN(multiply)) multiply = undefined;
        setOutput(multiply);
    }
    setOutput(multiply);
    useNodes.getState().updateNode(id, {output: multiply});
  }, [nodeData.a, nodeData.b]);

  return (
    <Node title={"Multiply"} inputs={["A", "B"]} type={"data"} >
      <div className={`flex flex-col w-full h-full justify-center items-center -mt-2 mb-1.5`}>
        <h1 className="text-xs">{output || "Undefined"}</h1>
      </div>
    </Node>
  );
}
