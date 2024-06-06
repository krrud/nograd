import React from 'react';
import {Node, NodeProps} from "reactflow";
import MultiplyNode from './multiplyNode';
import ValueNode from './valueNode';
import DenseNode from './layers/denseNode';
import * as tf from '@tensorflow/tfjs';
import InputNode from './layers/inputNode';
import ModelNode from './models/modelNode';


export interface BaseNodeData {
  label: string;
}

export interface MultiplyNodeData {
  a?: number;
  b?: number;
  output?: number;
}

export interface ValueNodeData {
  x: number;
}

export interface DenseNodeData {
  units: number;
  activation: string;
  inputShape: number[];
  output?: tf.SymbolicTensor;
}

export interface InputNodeData {
  shape: number[];
  output?: tf.SymbolicTensor;
}

export interface ModelNodeData {
  optimizer: string;
  loss: string;
}

export type ExtendedNodeData = BaseNodeData | MultiplyNodeData | ValueNodeData | DenseNodeData | InputNodeData | ModelNodeData;

export type LayerNodeData = DenseNodeData | InputNodeData;

export interface ExtendedNode extends Node<ExtendedNodeData> {
  data: ExtendedNodeData;
  type: 
    'default' |
    'base' |
    'multiply' |
    'value' |
    'denseLayer' |
    'inputLayer' |
    'model';
}

export const nodeTypes = {
  base: BaseNode, 
  multiply: MultiplyNode,
  value: ValueNode,
  denseLayer: DenseNode,
  inputLayer: InputNode,
  model: ModelNode,
};


// base node
type BaseNodeType = NodeProps<BaseNodeData>;

export default function BaseNode({ data }: BaseNodeType) {
  return (
    <div style={{ border: '1px solid black', padding: '10px', backgroundColor: '#fff' }}>
      {data.label}
    </div>
  );
}


