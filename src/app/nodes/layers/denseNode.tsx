import React, {useState} from 'react';
import { NodeProps} from 'reactflow';
import {DenseNodeData} from '../nodeTypes';
import useNodes from '../nodeStore';
import Node, {NodeField} from '../node';
import {Activation} from '@/app/tensorflow/activation';
import {isValidShapeInput} from '../nodeUtils';


export default function DenseNode({ id, isConnectable, data }: NodeProps<DenseNodeData>) {
  const [inputShape, setInputShape] = useState<string>(data.inputShape.toString());
  const [activation, setActivation] = useState<string>(data.activation);
  
  const onChangeUnits = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = parseFloat(e.target.value);
    useNodes.getState().updateNode(id, {units: value});
  };

  const onChangeActivation = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setActivation(e.target.value);
    if (Activation.isValid(e.target.value)){
      useNodes.getState().updateNode(id, {activation: e.target.value});
    };
  }
  
  const onChangeInputShape = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!isValidShapeInput(e.target.value)) return;
    setInputShape(e.target.value);
    const values = e.target.value
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v));
    useNodes.getState().updateNode(id, {inputShape: values});
  };

  return (
    <Node
      title="Dense Layer"
      type={"layer"}
      inputs={["In"]}
      outputs={["Out"]}
    >
      <NodeField name={"Units"} value={data.units} onChange={onChangeUnits} />
      <NodeField name={"Activation"} value={activation} onChange={onChangeActivation} type={"select"} options={Activation.getOptions()}/>
      <NodeField name={"Input Shape"} value={inputShape} onChange={onChangeInputShape} extra />
    </Node>
  );
}
