import React, {useCallback, useMemo, useState} from 'react';
import { NodeProps} from 'reactflow';
import {ExtendedNode, ModelNodeData, TrainModelNodeData} from '@/app/nodes/nodeTypes';
import useNodes from '@/app/nodes/nodeStore';
import Node, {NodeField} from '@/app/nodes/node';
import * as tf from '@tensorflow/tfjs';
import Button from '@/app/components/button';
import { getAllConnectedNodes, getInputNode } from '../nodeUtils';


export default function TrainModelNode({ id, isConnectable, data }: NodeProps<TrainModelNodeData>) {
  const state = useNodes.getState();
  const errors = useMemo(() => data.errors || [], [data.errors]);
  const [compiledColor, setCompiledColor] = useState("text-gray-500");
  const [trainColor, setTrainColor] = useState("text-gray-500");

  const onChangeEpochs = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) return;
    state.updateNode(id, {epochs: value});
  }, [id, state]);

  const onChangeBatchSize = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) return;
    state.updateNode(id, {batchSize: value});
  }, [id, state]);

  const handleCompile = useCallback(async () => {
    setCompiledColor("text-gray-500");
    const c = await state.compile(getAllConnectedNodes(id));
    setCompiledColor(c ? "text-green-500 border-green-500" : "text-red-500 border-red-500");
  }, []);
  
  const handleTrain = useCallback(async () => {
    setTrainColor("text-gray-500");
    const t = await trainModel(state.getNode(id));
    setTrainColor(t ? "text-green-500 border-green-500" : "text-red-500 border-red-500");
  }, []);

  return (
    <Node title={"Train Model"} inputs={["Model", "X", "Y"]} outputs={["Out"]} type={"compute"} errors={errors}>
      <NodeField name={"Epochs"} value={data.epochs} onChange={onChangeEpochs}/>
      <NodeField name={"Batch Size"} value={data.batchSize} onChange={onChangeBatchSize}/>
      <div className="justify-end w-full flex mt-3 mb-1">
        <Button onClick={handleCompile} label={"Compile"} twStyle={compiledColor} style={{marginRight: 8}}/>
        <Button onClick={handleTrain} twStyle={trainColor} label={"Train"}/>
      </div>
    </Node>
  );
}

export async function compileTrainModelNode(node: ExtendedNode) {
  console.log("Compiling Train Model Node: ", node.id);
  const state = useNodes.getState();
  const data = node.data as TrainModelNodeData;
  const epochs = data.epochs;
  const batchSize = data.batchSize;

  const {model, x, y} = await resolveTrainingInputs(node);
  state.updateNode(node.id, {model, x, y, epochs, batchSize});
}

async function resolveTrainingInputs(node: ExtendedNode | undefined) {
  if (!node) return {model: undefined, x: undefined, y: undefined};
  const model = getInputNode(node, 'Model')?.data.output;
  const x = getInputNode(node, 'X')?.data.output;
  const y = getInputNode(node, 'Y')?.data.output;

  return {model, x, y};
}

async function trainModel(node: ExtendedNode | undefined) {
  if (!node) return;
  const state = useNodes.getState();
  const data = node.data as TrainModelNodeData;
  const model = data.model;
  const x = data.x;
  const y = data.y;
  if (!model || !x || !y) {
    state.addError(node, 'Missing necessary inputs to train model.');
    return false;
  };

try {
  await model.fit(x, y, {
    epochs: data.epochs,
    batchSize: data.batchSize,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
      }
    }
  });
  } catch (error: any) {
    state.addError(node, error.message);
    return false;
  }
  return true;
}







  // // Generate synthetic data
  // const batchSize = 4096;
  // const featureSize = 4096;
  // const x = tf.tidy(() => {
  //   return tf.randomNormal([batchSize, featureSize]);
  // });
  // const y = tf.tidy(() => {
  //   const indices = Array.from(tf.util.createShuffledIndices(batchSize));
  //   const tensorIndices = tf.tensor1d(indices, 'int32');
  //   return tf.oneHot(tensorIndices, 64);
  // });

  // const memory = tf.memory();
  // const memoryMB = memory.numBytes / (1024 * 1024);
  // console.log('Tensorflow memory:', memory);
  // console.log('Tensorflow memory usage:', memoryMB + 'MB');

  // const numEpochs = 16;
  // const numBatches = Math.ceil(x.shape[0] / batchSize);

  // async function trainModel() {
  //   for (let epoch = 0; epoch < numEpochs; epoch++) {
  //     for (let batch = 0; batch < numBatches; batch++) {
  //       const batchStart = batch * batchSize;
  //       const batchEnd = Math.min(batchStart + batchSize, x.shape[0]);

  //       const xBatch = tf.slice(x, [batchStart, 0], [batchEnd - batchStart, featureSize]);
  //       const yBatch = tf.slice(y, [batchStart, 0], [batchEnd - batchStart, 64]);

  //       try {
  //         const history = await model.trainOnBatch(xBatch, yBatch);
  //         console.log(`Batch ${batch + 1} Loss: ${history}`);
  //       } catch (error) {
  //         console.error('Error during batch training:', error);
  //         throw error;
  //       } finally {
  //         tf.dispose([xBatch, yBatch]);
  //       }
  //     }
  //   }
  // }
  
  // try {
  //   await trainModel();
  // } catch (error) {
  //   console.error('Error training model:', error);
  //   throw error;
  // } finally {
  //   tf.dispose([x, y]);
  //   optimizer.dispose();
  //   model.dispose();
  //   tf.disposeVariables();
  //   const runTime = (Date.now() - startTime) / 1000;
  //   console.log(`Model training complete in ${runTime} seconds`);
  //   console.log("number of tensors: ", tf.memory().numTensors);
  //   console.log("memory: ", tf.memory());
  // }