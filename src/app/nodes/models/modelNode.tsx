import React, {useCallback, useEffect, useMemo, useState} from 'react';
import { NodeProps} from 'reactflow';
import {ExtendedNode, ModelNodeData} from '@/app/nodes/nodeTypes';
import useNodes from '@/app/nodes/nodeStore';
import Node, {NodeField} from '@/app/nodes/node';
import * as tf from '@tensorflow/tfjs';
import {getOptimizer, validOptimizer, validOptimizers} from '@/app/tensorflow/optimizers';
import {getLoss, validLoss, validLosses} from '@/app/tensorflow/losses';
import {getAllConnectedNodes, resolveModelIO, topoSort} from '@/app/nodes/nodeUtils';


export default function ModelNode({id, data}: NodeProps<ModelNodeData>) {
  const state = useNodes.getState();
  const errors = useMemo(() => data.errors || [], [data.errors]);

  const onChangeOptimizer = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!validOptimizer(e.target.value)) return;
    state.updateNode(id, {optimizer: e.target.value});
  }, [id, validOptimizer, state]);

  const onChangeLoss = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!validLoss(e.target.value)) return;
    state.updateNode(id, {loss: e.target.value});
  }, [id, validLoss, state]);

  const onChangeLr = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;
    state.updateNode(id, {lr: value});
  }, [id, state]);
  
  const optimizerTooltip = "The optimizer is the algorithm used to update the weights of the model during training. Adam is typically a good starting point."

  return (
    <Node title={"Model"} inputs={["In"]} outputs={["Out"]} type={"model"} errors={errors}>
      <NodeField
        name={"Optimizer"} 
        value={data.optimizer}
        onChange={onChangeOptimizer}
        type={"select"}
        options={validOptimizers}
        handle={1}
        tooltip={optimizerTooltip}
      />
      <NodeField name={"Learning Rate"} value={data.lr} onChange={onChangeLr}/>
      <NodeField name={"Loss"} value={data.loss} onChange={onChangeLoss} type={"select"} options={validLosses}/>
    </Node>
  );
}

export async function compileModelNode(node: ExtendedNode) {
  console.log("Compiling Model Node: ", node.id);
  const state = useNodes.getState();

  if(!isModelNodeData(node.data)) return; // could cast to ModelNodeData
  const {inputs, outputs} = await resolveModelIO(node);
  if (!inputs.length || !outputs.length) return;

  const model = tf.model({inputs, outputs, name: node.id});
  const optimizer = getOptimizer(node.data.optimizer);
  const loss = getLoss(node.data.loss);

  model.compile({
      optimizer: optimizer,
      loss: loss,
  });
  state.updateNode(node.id, {output: model});
}

export function isModelNodeData(data: any): data is ModelNodeData {
  return data !== undefined && validOptimizer(data.optimizer) && validLoss(data.loss);
}