import React, {useCallback, useEffect, useMemo, useState} from 'react';
import { NodeProps} from 'reactflow';
import {ExtendedNode} from '@/app/nodes/nodeTypes';
import useNodes from '@/app/nodes/nodeStore';
import Node, {NodeField} from '@/app/nodes/node';
import * as tf from '@tensorflow/tfjs';
import {optimizers, validOptimizer, validOptimizers} from '@/app/tensorflow/optimizers';
import {losses, validLoss, validLosses} from '@/app/tensorflow/losses';
import {getAllConnectedNodes, resolveModelIO, topoSort} from '@/app/nodes/nodeUtils';


export interface ModelNodeData {
  optimizer: string;
  loss: string;
}

export default function ModelNode({ id, isConnectable, data }: NodeProps<ModelNodeData>) {
  const state = useNodes.getState();
  const [compiled, setCompiled] =useState(false);
  const inputLength = useNodes(state => state.getAllConnectedNodes(id)).length; //TODO: check against data not just number of connections

  useEffect(() => {
    setCompiled(false);
  }, [inputLength]);

  const onChangeOptimizer = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!validOptimizer(e.target.value)) return;
    state.updateNode(id, {optimizer: e.target.value});
    setCompiled(false);
  }

  const onChangeLoss = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!validLoss(e.target.value)) return;
    state.updateNode(id, {loss: e.target.value});
    setCompiled(false);
  }
  
  const handleCompile = useCallback(async () => {
    const inputNodes = getAllConnectedNodes(id);
    const success = await state.compile(inputNodes);
    if (success) setCompiled(true);
    else setCompiled(false);
  }, []);

  const compileColor = compiled ? "text-green-500" : "text-red-500";

  return (
    <Node title={"Model"} inputs={["In"]} outputs={["Out"]} type={"model"}>
      <NodeField name={"Optimizer"} value={data.optimizer} onChange={onChangeOptimizer} type={"select"} options={validOptimizers} />
      <NodeField name={"Loss"} value={data.loss} onChange={onChangeLoss} type={"select"} options={validLosses}/>
      <div className="justify-end w-full flex mb-1" onClick={handleCompile}>
        <h1 className={`text-xxs ${compileColor} hover:cursor-pointer pl-2 pr-1 py-1`}>
          Compile
        </h1>
      </div>
    </Node>
  );
}

export async function compileModelNode(node: ExtendedNode) {
  console.log("Compiling Model Node: ", node.id);
  if(!isModelNodeData(node.data)) return; // could cast to ModelNodeData
  const {inputs, outputs} = await resolveModelIO(node);
  if (!inputs.length || !outputs.length) return;
  const model = tf.model({inputs, outputs});
  model.compile({
      optimizer: optimizers[node.data.optimizer],
      loss: losses[node.data.loss]
  });
  console.log("Done compiling model node: ", model);
  
  // Generate synthetic dataz
  const x = tf.randomNormal([6, 123]);
  const y = tf.tidy(() => tf.oneHot(tf.tensor1d([0, 1, 2, 3, 0, 1], 'int32'), 8));
  
  console.log(y.shape, "SHAPE")
  model.fit(x, y, {
    epochs: 100,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: Loss = ${logs?.loss}, `);
      }
    }
  }).then(info => {
    console.log('Training finished', info);
  }).catch(err => {
    console.error('Error during training', err);
  });
}

export function isModelNodeData(data: any): data is ModelNodeData {
  return data !== undefined && validOptimizer(data.optimizer) && validLoss(data.loss);
}