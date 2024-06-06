import { Edge } from "reactflow";
import { DenseNodeData, ExtendedNode } from "./nodeTypes";
import { compileDenseNode } from "./layers/denseNode";
import { compileInputNode } from "./layers/inputNode";
import { compileModelNode } from "./models/modelNode";

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

export async function compileNodes(sorted: string[], nodes: ExtendedNode[], edges: Edge[]) {
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
        default:
          console.log('Unknown node type:', node.type);
          break;
      }
    } catch (error) {
      console.error(`Error compiling node ${nodeId}:`, error);
      // Handle specific node error, possibly aborting the compilation
      break;
    }
  }
}