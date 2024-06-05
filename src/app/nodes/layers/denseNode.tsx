import React, { useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { ExtendedNode, DenseNodeData } from '../nodeTypes';
import useNodes from '../nodeStore';
import * as tf from '@tensorflow/tfjs';
import Node from '../node';


function isDenseNodeData(data: any): data is DenseNodeData {
  return data !== undefined && typeof data.units === 'number' && Array.isArray(data.inputShape);
}

export default function DenseNode({ id, isConnectable, data }: NodeProps<DenseNodeData>) {
  const node = useNodes(state => state.getNode(id));

  return (
    <Node
      title="Dense Layer"
      targetHandles={["In"]}
      sourceHandles={["Out"]}
    >
      <div className="flex flex-col w-full h-12 justify-center items-center">
      </div>
    </Node>
  );
}
