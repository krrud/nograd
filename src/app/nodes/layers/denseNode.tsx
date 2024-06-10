import React, {use, useCallback, useMemo, useState} from 'react';
import { Edge, NodeProps} from 'reactflow';
import {DenseNodeData, ExtendedNode, ExtendedNodeData, InputNodeData, LayerNodeData} from '@/app/nodes/nodeTypes';
import useNodes from '@/app/nodes/nodeStore';
import Node, {NodeField} from '@/app/nodes/node';
import {ActivationIdentifier, activations, validActivation} from '@/app/tensorflow/activations';
import {isValidShapeInput} from '../nodeUtils';
import * as tf from '@tensorflow/tfjs';
import { isInputNodeData } from '@/app/nodes/layers/inputNode';


export default function DenseNode({ id, isConnectable, data }: NodeProps<DenseNodeData>) {
  const state = useNodes.getState();
  const [inputShape, setInputShape] = useState<string>(data.inputShape.join(', '));
  const [activation, setActivation] = useState<string>(data.activation);
  const errors = useMemo(() => {
    return data.errors ? data.errors : undefined;
  }, [data.errors]);
  
  const onChangeUnits = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = parseFloat(e.target.value);
    state.updateNode(id, {units: value});
  }, [id, state]);
  
  const onChangeActivation = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const activation = e.target.value;
    setActivation(activation);
    if (validActivation(activation)){
      state.updateNode(id, {activation: activation});
    };
  }, [id, state]);
  
  const onChangeInputShape = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!isValidShapeInput(e.target.value)) return;
    const inputShape = e.target.value;
    setInputShape(inputShape);
    const values = inputShape
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v));
    state.updateNode(id, {inputShape: values});
  }, [id, state]);

  return (
    <Node
      title="Dense Layer"
      type={"layer"}
      inputs={["In"]}
      outputs={["Out"]}
      errors={errors}
    >
      <NodeField name={"Units"} value={data.units} onChange={onChangeUnits} />
      <NodeField name={"Activation"} value={activation} onChange={onChangeActivation} type={"select"} options={Object.keys(activations)}/>
      <NodeField name={"Input Shape"} value={inputShape} onChange={onChangeInputShape} extra />
      {errors}
    </Node>
  );
}

export async function compileDenseNode(node: ExtendedNode) {
  console.log("Compiling Dense Node: ", node.id);
  const state = useNodes.getState();
  try {
    if (node.type === 'denseLayer' && isDenseNodeData(node.data)) {
      const activation = activations[node.data.activation] as ActivationIdentifier;
      const layer = tf.layers.dense({
        units: node.data.units,
        activation: activation,
      });
      console.log("Activation: ", node.data.activation);
      const inputs = state.getInputEdges(node.id);
      if (inputs.length === 0) {
        throw new Error("No inputs connected to the node.");
      }

      const inputNode = state.getNode(inputs[0].source);
      if (!inputNode || !isValidInputNode(inputNode)) {
        throw new Error("Invalid or missing input node.");
      };

      const inputData = inputNode.data as LayerNodeData;
      const inputValue = inputData.output;
      if (!inputValue) {
        throw new Error('Input node does not have an output tensor');
      }

      const output = layer.apply(inputValue);
      state.updateNode(node.id, {output});
    } else {
      throw new Error('Invalid node type or data for compiling a dense layer');
    }
  } catch (error) {
    state.updateNode(node.id, {output: undefined});
  }
}

function isDenseNodeData(data: ExtendedNodeData): data is DenseNodeData {
  return (data as DenseNodeData).units !== undefined;
}

function isValidInputNode(node: ExtendedNode): boolean {
  return (node.type === 'inputLayer' && isInputNodeData(node.data)) || 
         (node.type === 'denseLayer' && isDenseNodeData(node.data));
}
