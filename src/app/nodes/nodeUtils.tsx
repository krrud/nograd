import {DenseNodeData, ExtendedNode, LayerNodeData} from "./nodeTypes";
import {compileDenseNode} from "@/app/nodes/layers/denseNode";
import {compileInputNode} from "@/app/nodes/layers/inputNode";
import {compileModelNode} from "@/app/nodes/models/modelNode";
import * as tf from '@tensorflow/tfjs';
import useNodes from '@/app/nodes/nodeStore';
import { Edge } from "reactflow";
import { useCallback } from "react";


export function isValidShapeInput(value: string | undefined) {
  if (value === undefined) return false;

  try {
    const trimmedValue = value.trim().replace(/\s+/g, '');

    if (!/^[0-9,]+$/.test(trimmedValue) || /,,/.test(trimmedValue)) {
      return false;
    }

    const numberArray = trimmedValue.split(',')
      .map(v => parseInt(v, 10))
      .filter(v => !isNaN(v));

    return numberArray.length > 0;
  } catch (e) {
    return false;
  }
}

export function isValidConnection(sourceNode?: ExtendedNode, targetNode?: ExtendedNode) {
  const validLayers = ['denseLayer', 'inputLayer'];
  if (!sourceNode || !targetNode) return false;
  let valid = false;
  switch (targetNode.type) {
    case 'denseLayer':
      valid = validLayers.includes(sourceNode.type);
      break;
    case 'model':
      valid = validLayers.includes(sourceNode.type);
      break;
    case 'multiply':
      valid = sourceNode.type === 'value';
      break;
    case 'value':
      valid = sourceNode.type === 'value';
      break;
    default:
      break
  }
  return valid;
}

export async function compileNodes(sorted: string[]) {
  const nodes = useNodes.getState().nodes;
  for (const nodeId of sorted) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;
    try {
      switch (node.type) {
        case 'denseLayer':
          await compileDenseNode(node);
          break;
        case 'inputLayer':
          await compileInputNode(node);
          break;
        case 'model':
          await compileModelNode(node);
          break;
        case 'value':
        case 'multiply':
          console.log('No compilation needed for node type:', node.type);
          break;
        default:
          console.log('Unknown node type:', node.type);
          break;
      }
    } catch (error) {
      console.error(`Error compiling node ${nodeId}:`, error);
      break;
    }
  }
}

export async function resolveModelIO(startNode: ExtendedNode): Promise<{inputs: tf.SymbolicTensor[], outputs: tf.SymbolicTensor[]}> {
  const {nodes, edges} = useNodes.getState();
  let inputNodes: ExtendedNode[] = []
  let outputNodes: ExtendedNode[] = [];

  // Find outputs directly connected to startNode
  edges.forEach(edge => {
    if (edge.target === startNode.id) {
      const targetNode = nodes.find(n => n.id === edge.source);
      if (targetNode) {
        outputNodes.push(targetNode);
      }
    }
  });

  // Trace back from each output to find all 0 in-degree nodes
  outputNodes.forEach(outputNode => {
    let queue: ExtendedNode[] = [outputNode];
    let visited = new Set<string>();

    while (queue.length > 0) {
      let current = queue.shift();
      if (!current || visited.has(current.id)) continue;
      visited.add(current.id);

      const inputEdges = edges.filter(e => e.target === current.id);
      if (inputEdges.length === 0) {
        inputNodes.push(current);
      } else {
        inputEdges.forEach(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          if (sourceNode && !visited.has(sourceNode.id)) {
            queue.push(sourceNode);
          }
        });
      }
    }
  });

  const inputData = inputNodes.map(node => {
    return node.data as LayerNodeData;
  });
  const outputData = outputNodes.map(node => {
    return node.data as LayerNodeData;
  });
  const inputs = inputData.map(data => data.output as tf.SymbolicTensor);
  const outputs = outputData.map(data => data.output as tf.SymbolicTensor);

  return {inputs, outputs};
}

export function topoSort(nodes: ExtendedNode[]) {
  if (nodes.length <= 1) return [];
  const edges = useNodes.getState().edges;
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();
  const sorted: string[] = [];
  const queue: string[] = [];

  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
  });

  edges.forEach(edge => {
    inDegree.set(edge.target, inDegree.get(edge.target)! + 1);
    adjList.set(edge.source, [...adjList.get(edge.source)!, edge.target]);
  });

  inDegree.forEach((degree, node) => {
    if (degree === 0) {
      queue.push(node);
    }
  });

  while (queue.length > 0) {
    const node = queue.shift()!;
    sorted.push(node);
    adjList.get(node)!.forEach(neighbor => {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }

  return sorted;
}

export function getAllConnectedNodes(nodeId: string): ExtendedNode[] {
  const {nodes, edges} = useNodes.getState();
  const connectedNodes: ExtendedNode[] = [];
  const queue: string[] = [nodeId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId || visited.has(currentId)) continue;
    visited.add(currentId);

    const current = nodes.find(n => n.id === currentId);
    if (!current) continue;
    connectedNodes.push(current);

    // Reverse the search direction to find nodes upstream
    edges.forEach(edge => {
      if (edge.target === currentId) {
        queue.push(edge.source);
      }
    });
  }

  return connectedNodes;
}