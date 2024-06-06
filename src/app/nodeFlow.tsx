'use client';

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {nodeTypes} from './nodes/nodeTypes';
import useNodes, {NodeState} from './nodes/nodeStore';
import {useShallow} from 'zustand/react/shallow';
import { useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';

const selector = (state: NodeState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

async function setupTfBackend() {
  try{
    await tf.setBackend('webgpu');    
  } catch (e) {
    console.error('WebGPU is not supported on this device:', e);
  }
  await tf.ready();
  console.log(`Backend: ${tf.getBackend()}`); // TODO: remove
};

export default function NodeFlow() {

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useNodes(
    useShallow(selector),
  );

  useEffect(() => {
    console.log('Setting up TF backend');
    setupTfBackend();
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
}
