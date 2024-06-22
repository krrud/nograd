import React, {useCallback, useMemo, useState} from 'react';
import { NodeProps} from 'reactflow';
import {ExtendedNode, InputNodeData} from '../nodeTypes';
import useNodes from '../nodeStore';
import Node, {NodeField} from '../node';
import { isValidShapeInput } from '../nodeUtils';
import * as tf from '@tensorflow/tfjs';


export default function InputNode({ id, isConnectable, data }: NodeProps<InputNodeData>) {
  const state = useNodes.getState();
  const [shape, setShape] = useState<string>(data.shape.join(", "));
  const [fileContent, setFileContent] = useState<string | ArrayBuffer | null>(null);
  const errors = useMemo(() => {
    return data.errors ? data.errors : undefined;
  }, [data.errors]);

  const onChangeShape = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!isValidShapeInput(e.target.value)) return;
    setShape(e.target.value);
    const newShape = e.target.value
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v));
    state.updateNode(id, {shape: newShape});
  }, [id, state]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFileContent(reader.result);
        const fileSize = file.size;
        console.log(fileSize);
      };
      reader.readAsText(file); // readAsArrayBuffer, readAsBinaryString, readAsDataURL
    }
  };
  
  return (
    <Node title={"Input Layer"} outputs={["Out"]} type={"layer"} errors={errors}>
      <NodeField name={"Shape"} value={shape} onChange={onChangeShape}/>
      <input type="file" onChange={onFileChange} className="text-xxs mb-2"/>
    </Node>
  );
}

export async function compileInputNode(node: ExtendedNode) {
  console.log("Compiling Input Node: ", node.id);
  if (node.type === 'inputLayer' && isInputNodeData(node.data)) {
    const shape = node.data.shape;
    const output = tf.layers.input({shape, name: node.id});
    useNodes.getState().updateNode(node.id, {output});
  }
  console.log("Compiled Input Node: ", node.id);
}

export function isInputNodeData(data: any): data is InputNodeData {
  return data !== undefined && Array.isArray(data.shape);
}