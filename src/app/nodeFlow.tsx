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


const selector = (state: NodeState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export default function NodeFlow() {

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useNodes(
    useShallow(selector),
  );

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
