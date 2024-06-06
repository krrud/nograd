import React, {useCallback, useState} from 'react';
import { NodeProps} from 'reactflow';
import {ExtendedNode, LayerNodeData, ModelNodeData} from '../nodeTypes';
import useNodes from '../nodeStore';
import Node, {NodeField} from '../node';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faWrench} from '@fortawesome/free-solid-svg-icons';
import * as tf from '@tensorflow/tfjs';
import {optimizers, validOptimizer, validOptimizers} from '@/app/tensorflow/optimizers';
import {losses, validLoss, validLosses} from '@/app/tensorflow/losses';


export default function ModelNode({ id, isConnectable, data }: NodeProps<ModelNodeData>) {

  const onChangeOptimizer = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!validOptimizer(e.target.value)) return;
    useNodes.getState().updateNode(id, {optimizer: e.target.value});
  }

  const onChangeLoss = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!validLoss(e.target.value)) return;
    useNodes.getState().updateNode(id, {loss: e.target.value});
  }
  
  const handleCompile = useCallback(() => {
    useNodes.getState().compile();
  }, []);

  return (
    <Node title={"Model"} inputs={["In"]} outputs={["Out"]} type={"model"}>
      <NodeField name={"Optimizer"} value={data.optimizer} onChange={onChangeOptimizer} type={"select"} options={validOptimizers} />
      <NodeField name={"Loss"} value={data.loss} onChange={onChangeLoss} type={"select"} options={validLosses}/>
      <div className="justify-end w-full flex mb-1" onClick={handleCompile}>
        <FontAwesomeIcon icon={faWrench} width={12} className="text-gray-400 hover:text-gray-600 cursor-pointer"/>
      </div>
    </Node>
  );
}

export async function compileModelNode(node: ExtendedNode) {
    const nodeData = node.data as ModelNodeData; 
    const inputData = useNodes.getState().getNode('input1')?.data as LayerNodeData;
    const outputData = useNodes.getState().getNode('dense2')?.data as LayerNodeData;
    const input = inputData.output;
    const output = outputData.output;
    if (!input || !output) return;
    const model = tf.model({inputs: [input], outputs: [output]});
    model.compile({
        optimizer: optimizers[nodeData.optimizer],
        loss: losses[nodeData.loss]
    });
    console.log("Done compiling model node: ", model);
}