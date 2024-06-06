import React, {useState} from 'react';
import { NodeProps} from 'reactflow';
import {InputNodeData} from '../nodeTypes';
import useNodes from '../nodeStore';
import Node, {NodeField} from '../node';
import { isValidShapeInput } from '../nodeUtils';


export default function InputNode({ id, isConnectable, data }: NodeProps<InputNodeData>) {
  const [shape, setShape] = useState<string>(data.shape.toString()); // use join to get space separated string

  const onChangeShape = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!isValidShapeInput(e.target.value)) return;
    setShape(e.target.value);
    const newShape = e.target.value
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v));
    useNodes.getState().updateNode(id, {shape: newShape});
  };
  
  return (
    <Node title={"Input"} outputs={["Out"]} type={"layer"}>
      <NodeField name={"Shape"} value={shape} onChange={onChangeShape}/>
    </Node>
  );
  }