import React, {useEffect, useState} from 'react';
import { NodeProps} from 'reactflow';
import {ExtendedNode, DenseNodeData} from '../nodeTypes';
import useNodes from '../nodeStore';
import Node, {NodeField} from '../node';


function isDenseNodeData(data: any): data is DenseNodeData {
  return data !== undefined && typeof data.units === 'number' && Array.isArray(data.inputShape);
}

export default function DenseNode({ id, isConnectable, data }: NodeProps<DenseNodeData>) {
  const node = useNodes(state => state.getNode(id));
  const [inputShape, setInputShape] = useState<string>(data.inputShape.toString());

  
  const onChangeUnits = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    useNodes.getState().updateNode(id, {units: value});
  };
  
  const onChangeInputShape = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isValidInputShape(e.target.value)) return;
    setInputShape(e.target.value);
    const values = e.target.value
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v));
    useNodes.getState().updateNode(id, {inputShape: values});
  };

  function isValidInputShape(value: string | undefined) {
    if (value === undefined) return false;
  
    try {
      const trimmedValue = value.trim().replace(/\s+/g, '');

      if (!/^[0-9,]+$/.test(trimmedValue) || /,,/.test(trimmedValue)) {
        return false;
      }

      const numberArray = trimmedValue.split(',')
        .map(v => parseInt(v, 10))
        .filter(v => !isNaN(v));
  
      return numberArray.length > 0;
    } catch (e) {
      return false;
    }
  }

  return (
    <Node
      title="Dense Layer"
      type={"layer"}
      inputs={["In"]}
      outputs={["Out"]}
    >
      <NodeField name={"Units"} value={data.units}onChange={onChangeUnits} />
      <NodeField name={"Input Shape"}  value={inputShape} onChange={onChangeInputShape}/>
    </Node>
  );
}
