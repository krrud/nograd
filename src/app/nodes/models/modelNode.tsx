import React, {useCallback, useEffect, useMemo, useState} from 'react';
import { NodeProps} from 'reactflow';
import {ExtendedNode, ModelNodeData} from '@/app/nodes/nodeTypes';
import useNodes from '@/app/nodes/nodeStore';
import Node, {NodeField} from '@/app/nodes/node';
import * as tf from '@tensorflow/tfjs';
import {getOptimizer, validOptimizer, validOptimizers} from '@/app/tensorflow/optimizers';
import {getLoss, validLoss, validLosses} from '@/app/tensorflow/losses';
import {getAllConnectedNodes, resolveModelIO, topoSort} from '@/app/nodes/nodeUtils';


export default function ModelNode({ id, isConnectable, data }: NodeProps<ModelNodeData>) {
  const state = useNodes.getState();
  const [compiled, setCompiled] =useState(false);
  const inputLength = useNodes(state => state.getAllConnectedNodes(id)).length; //TODO: check against data not just number of connections
  const errors = useMemo(() => data.errors || [], [data.errors]);

  useEffect(() => {
    setCompiled(false);
  }, [inputLength]);

  const onChangeOptimizer = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!validOptimizer(e.target.value)) return;
    state.updateNode(id, {optimizer: e.target.value});
    setCompiled(false);
  }, [id, validOptimizer, state]);

  const onChangeLoss = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!validLoss(e.target.value)) return;
    state.updateNode(id, {loss: e.target.value});
    setCompiled(false);
  }, [id, validLoss, state]);

  const onChangeLr = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;
    state.updateNode(id, {lr: value});
    setCompiled(false);
  }, [id, state]);
  
  const handleCompile = useCallback(async () => {
    const inputNodes = getAllConnectedNodes(id);
    console.log("Input Nodes: ", inputNodes);
    const success = await state.compile(inputNodes);
    if (success) setCompiled(true);
    else setCompiled(false);
  }, [state, errors]);

  const compileColor = state.compiling ? "text-gray-500" : compiled ? "text-green-500" : "text-red-500";

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
      <div className="justify-end w-full flex mb-1">
        <h1 className={`text-xxs ${compileColor} hover:cursor-pointer pl-2 pr-1 pt-1`} onClick={handleCompile}>
          Compile
        </h1>
      </div>
    </Node>
  );
}

export async function compileModelNode(node: ExtendedNode) {
  const state = useNodes.getState();
  const startTime = Date.now();
  console.log("Compiling Model Node: ", node.id);

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
  console.log("Done compiling model node: ", model);

  // Generate synthetic data
  const batchSize = 4096;
  const featureSize = 4096;
  const x = tf.tidy(() => {
    return tf.randomNormal([batchSize, featureSize]);
  });
  const y = tf.tidy(() => {
    const indices = Array.from(tf.util.createShuffledIndices(batchSize));
    const tensorIndices = tf.tensor1d(indices, 'int32');
    return tf.oneHot(tensorIndices, 64);
  });

  // const memory = tf.memory();
  // const memoryMB = memory.numBytes / (1024 * 1024);
  // console.log('Tensorflow memory:', memory);
  // console.log('Tensorflow memory usage:', memoryMB + 'MB');

  const numEpochs = 16;
  const numBatches = Math.ceil(x.shape[0] / batchSize);

  async function trainModel() {
    for (let epoch = 0; epoch < numEpochs; epoch++) {
      for (let batch = 0; batch < numBatches; batch++) {
        const batchStart = batch * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, x.shape[0]);

        const xBatch = tf.slice(x, [batchStart, 0], [batchEnd - batchStart, featureSize]);
        const yBatch = tf.slice(y, [batchStart, 0], [batchEnd - batchStart, 64]);

        try {
          const history = await model.trainOnBatch(xBatch, yBatch);
          console.log(`Batch ${batch + 1} Loss: ${history}`);
        } catch (error) {
          console.error('Error during batch training:', error);
          throw error;
        } finally {
          tf.dispose([xBatch, yBatch]);
        }
      }
    }
  }
  
  try {
    await trainModel();
  } catch (error) {
    console.error('Error training model:', error);
    throw error;
  } finally {
    tf.dispose([x, y]);
    optimizer.dispose();
    model.dispose();
    tf.disposeVariables();
  }

  const runTime = (Date.now() - startTime) / 1000;
  console.log(`Model training complete in ${runTime} seconds`);
  console.log("number of tensors: ", tf.memory().numTensors);
  console.log("memory: ", tf.memory());

}

export function isModelNodeData(data: any): data is ModelNodeData {
  return data !== undefined && validOptimizer(data.optimizer) && validLoss(data.loss);
}