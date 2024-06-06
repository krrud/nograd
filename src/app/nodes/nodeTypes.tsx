import React from 'react';
import {Node, NodeProps} from "reactflow";
import MultiplyNode from './multiplyNode';
import ValueNode from './valueNode';
import DenseNode from './layers/denseNode';
import * as tf from '@tensorflow/tfjs';
import InputNode from './layers/inputNode';


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
  output?: tf.layers.Layer;
}

export interface InputNodeData {
  shape: number[];
}

export type ExtendedNodeData = BaseNodeData | MultiplyNodeData | ValueNodeData | DenseNodeData | InputNodeData;

export interface ExtendedNode extends Node<ExtendedNodeData> {
  type: 
    'default' |
    'base' |
    'multiply' |
    'value' |
    'denseLayer' |
    'inputLayer';
}

export const nodeTypes = {
  base: BaseNode, 
  multiply: MultiplyNode,
  value: ValueNode,
  denseLayer: DenseNode,
  inputLayer: InputNode,
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


