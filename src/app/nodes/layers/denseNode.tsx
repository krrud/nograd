import React, {use, useState} from 'react';
import { Edge, NodeProps} from 'reactflow';
import {DenseNodeData, ExtendedNode, ExtendedNodeData, InputNodeData, LayerNodeData} from '../nodeTypes';
import useNodes from '../nodeStore';
import Node, {NodeField} from '../node';
import {ActivationIdentifier, activations, validActivations} from '@/app/tensorflow/activation';
import {isValidShapeInput} from '../nodeUtils';
import * as tf from '@tensorflow/tfjs';
import { isInputNodeData } from './inputNode';


export default function DenseNode({ id, isConnectable, data }: NodeProps<DenseNodeData>) {
  const [inputShape, setInputShape] = useState<string>(data.inputShape.toString());
  const [activation, setActivation] = useState<string>(data.activation);
  
  const onChangeUnits = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = parseFloat(e.target.value);
    useNodes.getState().updateNode(id, {units: value});
  };

  const onChangeActivation = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setActivation(e.target.value);
    if (e.target.value in activations){
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
      <NodeField name={"Activation"} value={activation} onChange={onChangeActivation} type={"select"} options={Object.keys(activations)}/>
      <NodeField name={"Input Shape"} value={inputShape} onChange={onChangeInputShape} extra />
    </Node>
  );
}

export async function compileDenseNode(node: ExtendedNode) {
  console.log("Compiling Dense Node: ", node.id);

  try {
    if (node.type === 'denseLayer' && isDenseNodeData(node.data)) {
      const activation = activations[node.data.activation] as ActivationIdentifier;
      const layer = tf.layers.dense({
        units: node.data.units,
        activation: activation,
      });
      console.log("Activation: ", node.data.activation);
      const inputs = useNodes.getState().getInputEdges(node.id);
      if (inputs.length === 0) {
        throw new Error("No inputs connected to the node.");
      }

      const inputNode = useNodes.getState().getNode(inputs[0].source);
      if (!inputNode || !isValidInputNode(inputNode)) {
        throw new Error("Invalid or missing input node.");
      };

      const inputData = inputNode.data as LayerNodeData;
      const inputValue = inputData.output;
      if (!inputValue) {
        throw new Error('Input node does not have an output tensor');
      }

      const output = layer.apply(inputValue);
      useNodes.getState().updateNode(node.id, {output});
    } else {
      throw new Error('Invalid node type or data for compiling a dense layer');
    }
  } catch (error) {
    useNodes.getState().updateNode(node.id, {output: undefined});
  }
}

function isDenseNodeData(data: ExtendedNodeData): data is DenseNodeData {
  return (data as DenseNodeData).units !== undefined;
}

function isValidInputNode(node: ExtendedNode): boolean {
  return (node.type === 'inputLayer' && isInputNodeData(node.data)) || 
         (node.type === 'denseLayer' && isDenseNodeData(node.data));
}
