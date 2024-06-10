import React, {useCallback, useEffect, useMemo, useState} from 'react';
import { NodeProps} from 'reactflow';
import {ExtendedNode, ModelNodeData} from '@/app/nodes/nodeTypes';
import useNodes from '@/app/nodes/nodeStore';
import Node, {NodeField} from '@/app/nodes/node';
import * as tf from '@tensorflow/tfjs';
import {getOptimizer, optimizers, validOptimizer, validOptimizers} from '@/app/tensorflow/optimizers';
import {getLoss, losses, validLoss, validLosses} from '@/app/tensorflow/losses';
import {getAllConnectedNodes, resolveModelIO, topoSort} from '@/app/nodes/nodeUtils';


export default function ModelNode({ id, isConnectable, data }: NodeProps<ModelNodeData>) {
  const state = useNodes.getState();
  const [compiled, setCompiled] =useState(false);
  const inputLength = useNodes(state => state.getAllConnectedNodes(id)).length; //TODO: check against data not just number of connections
  const errors = useMemo(() => {
    return data.errors ? data.errors : undefined;
  }, [data.errors]);

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

  const onChangeLr = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;
    state.updateNode(id, {lr: value});
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
    <Node title={"Model"} inputs={["In"]} outputs={["Out"]} type={"model"} errors={errors}>
      <NodeField name={"Optimizer"} value={data.optimizer} onChange={onChangeOptimizer} type={"select"} options={validOptimizers} handle={1}/>
      <NodeField name={"Learning Rate"} value={data.lr} onChange={onChangeLr} handle={2}/>
      <NodeField name={"Loss"} value={data.loss} onChange={onChangeLoss} type={"select"} options={validLosses} handle={3}/>
      <div className="justify-end w-full flex mb-1">
        <h1 className={`text-xxs ${compileColor} hover:cursor-pointer pl-2 pr-1 py-1`} onClick={handleCompile}>
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
  const optimizer = getOptimizer(node.data.optimizer);
  const loss = getLoss(node.data.loss);

  model.compile({
      optimizer: optimizer,
      loss: loss,
  });
  console.log("Done compiling model node: ", model);
  
  // Generate synthetic data
  const x = tf.randomNormal([2, 128]);
  const y = tf.tidy(() => tf.oneHot(tf.tensor1d([0, 1], 'int32'), 16));

  function cleanup() {
    x.dispose();
    y.dispose();
    model.dispose();
    console.log('Cleaned up');
  }
  
  try {
    await model.fit(x, y, {
      epochs: 100,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: Loss = ${logs?.loss}`);
        }
      }
    });
  } catch (error) {
    cleanup();
    throw error;
  }

  cleanup();
}

export function isModelNodeData(data: any): data is ModelNodeData {
  return data !== undefined && validOptimizer(data.optimizer) && validLoss(data.loss);
}