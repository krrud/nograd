import React from 'react';
import {Node, NodeProps} from "reactflow";
import MultiplyNode from '@/app/nodes/test/multiplyNode';
import ValueNode from '@/app/nodes/test/valueNode';
import DenseNode from '@/app/nodes/layers/denseNode';
import InputNode from '@/app/nodes/layers/inputNode';
import ModelNode from '@/app/nodes/models/modelNode';
import TrainModelNode from '@/app/nodes/models/trainModelNode';
import * as tf from '@tensorflow/tfjs';


export interface BaseNodeData {
  errors?: string[];
  output?: any;
}

export interface MultiplyNodeData extends BaseNodeData {
  a?: number;
  b?: number;
  output?: number;
}

export interface ValueNodeData extends BaseNodeData {
  x: number;
}

export interface DenseNodeData extends BaseNodeData {
  units: number;
  activation: string;
  inputShape: number[];
  output?: tf.SymbolicTensor;
}

export interface InputNodeData extends BaseNodeData {
  shape: number[];
  output?: tf.SymbolicTensor;
}

export interface ModelNodeData extends BaseNodeData {
  optimizer: string;
  loss: string;
  lr?: number;
  output?: tf.LayersModel;
}

export interface TrainModelNodeData extends BaseNodeData {
  epochs: number;
  batchSize: number;
  model?: tf.LayersModel;
  x?: tf.Tensor;
  y?: tf.Tensor;
  output?: tf.History;
}

export type ExtendedNodeData =
  | BaseNodeData
  | MultiplyNodeData 
  | ValueNodeData 
  | DenseNodeData 
  | InputNodeData 
  | ModelNodeData
  | TrainModelNodeData;

export type LayerNodeData = DenseNodeData | InputNodeData;

export interface ExtendedNode extends Node<ExtendedNodeData> {
  data: ExtendedNodeData;
  type: 
    | 'default' 
    | 'base'
    | 'multiply'
    | 'value'
    | 'denseLayer'
    | 'inputLayer'
    | 'model'
    | 'trainModel';
}

export const nodeTypes = {
  base: BaseNode, 
  multiply: MultiplyNode,
  value: ValueNode,
  denseLayer: DenseNode,
  inputLayer: InputNode,
  model: ModelNode,
  trainModel: TrainModelNode,
};


// base node
type BaseNodeType = NodeProps<BaseNodeData>;

export default function BaseNode({data}: BaseNodeType) {
  return (
    <div style={{border: '1px solid black', padding: '10px', backgroundColor: '#fff'}}/>
  );
}


