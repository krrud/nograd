import { ExtendedNode } from "./nodeTypes";

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
  if (!sourceNode || !targetNode) return false;
  let valid = false;
  switch (targetNode.type) {
    case 'multiply':
      valid = sourceNode.type === 'value';
      break;
    case 'denseLayer':
      valid = sourceNode.type === 'denseLayer' || sourceNode.type === 'inputLayer';
      break;
    case 'value':
      valid = sourceNode.type === 'value';
      break;
    default:
      break
  }
  return valid;
}