import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {NodeProps} from 'reactflow';
import {ExtendedNode, TrainModelNodeData} from '@/app/nodes/nodeTypes';
import useNodes from '@/app/nodes/nodeStore';
import Node, {NodeField} from '@/app/nodes/node';
import Button from '@/app/components/button';
import {getAllConnectedNodes, getInputNode} from '../nodeUtils';
import {isEqual} from 'lodash';


export default function TrainModelNode({id, data}: NodeProps<TrainModelNodeData>) {
  const state = useNodes.getState();
  const errors = useMemo(() => data.errors || [], [data.errors]);
  const [compiled, setCompiled] = useState(false);

  const nodeData = useNodes(state => useMemo(() => state.getAllConnectedNodes(id).map(({data}) => {
    const {compiled, output, errors, ...query} = data;
    return query;
  }), [state.nodes]));
  
  const edgeData = useNodes(state => useMemo(() => state.edges.map(({source, target}) => ({
    source, target
  })), [state.edges]));

  const prevNodeDataRef = useRef(nodeData);
  const prevEdgeDataRef = useRef(edgeData);
  
  useEffect(() => { // set compiled to false if associated node data changes
    let dataChanged = false;

    if (!isEqual(prevNodeDataRef.current, nodeData)) {
      prevNodeDataRef.current = nodeData;
      dataChanged = true;
    }

    if (!isEqual(prevEdgeDataRef.current, edgeData)) {
      prevEdgeDataRef.current = edgeData;
      dataChanged = true;
    }
  
    if (dataChanged) {
      setCompiled(false);
    }
  }, [nodeData, edgeData]);

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
    try {
      const c = await state.compile(getAllConnectedNodes(id));
      setCompiled(c);
    } catch (error) {
      if (error instanceof Error) {
        state.addError(state.getNode(id)!, error.message);
      }
      setCompiled(false);
    }
  }, []);
  
  const handleTrain = useCallback(async () => {
    await trainModel(id);
  }, []);

  return (
    <Node title={"Train Model"} inputs={["Model", "X", "Y"]} outputs={["Out"]} type={"compute"} errors={errors}>
      <NodeField name={"Epochs"} value={data.epochs} onChange={onChangeEpochs}/>
      <NodeField name={"Batch Size"} value={data.batchSize} onChange={onChangeBatchSize}/>
      <div className="justify-end w-full flex mt-3 mb-1">
        <Button onClick={handleCompile} label={"Compile"} style={{marginRight: 8}}/>
        <Button onClick={handleTrain} label={"Train"} disabled={!compiled}/>
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

async function trainModel(nodeId: string) {
  const state = useNodes.getState();
  const node = state.getNode(nodeId);
  if (!node) return false;
  
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