import React, {useCallback, useEffect, useMemo, useState} from 'react';
import { NodeProps} from 'reactflow';
import {ExtendedNode, TrainNodeData} from '@/app/nodes/nodeTypes';
import useNodes from '@/app/nodes/nodeStore';
import Node, {NodeField} from '@/app/nodes/node';
import * as tf from '@tensorflow/tfjs';
import Button from '@/app/components/button';


export default function TrainModelNode({ id, isConnectable, data }: NodeProps<TrainNodeData>) {
  const state = useNodes.getState();
  const errors = useMemo(() => data.errors || [], [data.errors]);

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

  const onTrain = useCallback(async () => {
    console.log("Training model...");
  }, []);

  return (
    <Node title={"Train Model"} inputs={["Model", "X", "Y"]} outputs={["Out"]} type={"compute"} errors={errors}>
      <NodeField name={"Epochs"} value={data.epochs} onChange={onChangeEpochs}/>
      <NodeField name={"Batch Size"} value={data.batchSize} onChange={onChangeBatchSize}/>
      <div className="justify-end w-full flex mt-3 mb-1">
        <Button onClick={onTrain} label={"Train"}/>
      </div>
    </Node>
  );
}

export async function compileTrainModelNode(node: ExtendedNode) {
  const data = node.data as TrainNodeData;
  const model = data.model;
  const x = data.x;
  const y = data.y;
  const epochs = data.epochs;
  const batchSize = data.batchSize;

  if (!model || !x || !y) return;

  const history = await model.fit(x, y, {
    epochs: epochs,
    batchSize: batchSize,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
      }
    }
  });

  return history;
}
