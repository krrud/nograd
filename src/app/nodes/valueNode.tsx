import {NodeProps} from 'reactflow';
import {ValueNodeData} from './nodeTypes';
import useNodes from './nodeStore';
import Node, { NodeField } from './node';


export function isValueNodeData(data: any): data is ValueNodeData {
  return data !== undefined && typeof data.x === 'number';
}

export default function ValueNode({id, isConnectable}: NodeProps<ValueNodeData>) {
  const node = useNodes(state => state.getNode(id));
  const nodeData = node && isValueNodeData(node.data) ? node.data : {x: 0};

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    useNodes.getState().updateNode(id, {x: value});
  };

  return (
    <Node title={"Value"} sourceHandles={["Out"]}>
      <NodeField value={nodeData?.x} onChange={onChange} />
    </Node>
  );
}
