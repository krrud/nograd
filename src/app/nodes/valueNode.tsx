import {NodeProps} from 'reactflow';
import {ValueNodeData} from './nodeTypes';
import useNodes from './nodeStore';
import Node, { NodeField } from './node';


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
