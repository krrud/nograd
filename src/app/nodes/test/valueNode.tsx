import {NodeProps} from 'reactflow';
import {ValueNodeData} from '@/app/nodes/nodeTypes';
import useNodes from '@/app/nodes/nodeStore';
import Node, { NodeField } from '@/app/nodes/node';


export function isValueNodeData(data: any): data is ValueNodeData {
  return data !== undefined && typeof data.x === 'number';
}

export default function ValueNode({id, isConnectable, data}: NodeProps<ValueNodeData>) {

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = parseFloat(e.target.value);
    useNodes.getState().updateNode(id, {x: value});
  };

  return (
    <Node title={"Value"} outputs={["Out"]} type={"data"}>
      <NodeField name={"Value"} value={data.x} type={"number"} onChange={onChange} />
    </Node>
  );
}
