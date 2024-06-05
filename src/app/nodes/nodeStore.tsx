import {create} from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import {ExtendedNode, ValueNodeData} from './nodeTypes';


export type NodeState = {
  compile: () => void;
  run: () => void;
  compiling: boolean;
  running: boolean;
  setCompiling: (compiling: boolean) => void;
  toggleCompiling: () => void;
  setRunning: (running: boolean) => void;
  nodes: ExtendedNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: ExtendedNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNode: (nodeId: string, data: {}) => void;
  getNode: (nodeId: string) => ExtendedNode | undefined;
  getInputEdges: (nodeId: string) => { source: string; sourceHandle: string | null | undefined; }[];
  topoSort: () => string[];
};

const initialNodes: ExtendedNode[] = [
  {id: 'multiply1', type: 'multiply', position: { x: 150, y: 0 }, data: {}},
  {id: 'value1', type: 'value', position: { x: -150, y: -50 }, data: { x: 4 }},
  {id: 'value2', type: 'value', position: { x: -150, y: 50 }, data: { x: 5 }},
  {id: 'dense1', type: 'dense', position: { x: -150, y: 150 }, data: {units: 10, inputShape: [4]}},
];

const useNodeStore = create<NodeState>((set, get) => ({
  compile: () => {
    set({compiling: true});
    const sorted = get().topoSort();
    sorted.forEach(nodeId => {
      const node = get().getNode(nodeId);
      if (node && node.type === 'multiply') {
        console.log("MULT");
      }
    });
    set({compiling: false});
  },
  run: () => {
    set({running: true});
  },
  compiling: false,
  running: false,
  setCompiling: (compiling: boolean) => {
    set({compiling});
  },
  toggleCompiling: () => {
    set(state => ({compiling: !state.compiling}));
  },
  setRunning: (running: boolean) => {
    set({running});
  },
  nodes: initialNodes,
  edges: [],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes).map(node => ({
        ...node,
        type: node.type || 'default'
      }) as ExtendedNode),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    // Remove any edge that is being deleted
    changes.forEach((change) => {
      if (change.type == 'remove') {
        const edge = get().edges.find((edge) => edge.id === change.id);
        const targetNode = get().nodes.find((node) => node.id === edge?.target);
        const targetHandle = edge?.targetHandle;
        if (targetNode && targetHandle && targetHandle in targetNode.data) {
          get().updateNode(targetNode.id, {...targetNode.data, [targetHandle]: undefined});
        }
      }
    });
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    const {source, sourceHandle, target, targetHandle} = connection;
  
    if (!source || !target) {
      console.error('Source or target is null, connection cannot be established.');
      return;
    }

    if (!isValidConnection(get().getNode(source), get().getNode(target))) {
      console.error('Invalid connection.');
      return;
    }

    // Remove existing edges
    const filteredEdges = get().edges.filter(edge => 
      !(edge.target === target && edge.targetHandle === targetHandle)
    );

    // Add the new edge
    set({
      edges: addEdge(connection, filteredEdges),
    });

    // update the target node data if applicable
    const sourceNode = get().nodes.find(n => n.id === source);
    if (sourceNode && 'x' in sourceNode.data && (targetHandle === 'a' || targetHandle === 'b')) {
      const updatedValue = (sourceNode.data as ValueNodeData).x;
      if (updatedValue !== undefined) {
        get().updateNode(target, { [targetHandle]: updatedValue });
      }
    }
  },
  setNodes: (nodes: ExtendedNode[]) => {
    set({ nodes });
  },
  setEdges: (edges: Edge[]) => {
    set({ edges });
  },
  updateNode: (nodeId: string, data: {}) => {
    set(state => {
      const nodeExists = state.nodes.some(node => node.id === nodeId);
      if (!nodeExists) {
        console.warn(`Node with ID ${nodeId} not found.`);
        return state;
      }
      return {
        nodes: state.nodes.map(node =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
        )
      };
    });
  },
  
  getNode: (nodeId: string) => {
    return get().nodes.find(node => node.id === nodeId);
  },
  getInputEdges: (nodeId: string) => {
    const edges = get().edges.filter(edge => edge.target === nodeId);
    const inputs = edges.reduce((acc, edge) => {
      const sourceNode = get().getNode(edge.source);
      if (sourceNode) {
        acc.push({ source: sourceNode.id, sourceHandle: edge.sourceHandle || null });
      }
      return acc;
    }, [] as { source: string; sourceHandle: string | null; }[]);

    return inputs;
  },
  topoSort: () => {
    const nodes = get().nodes;
    const edges = get().edges;
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
  },
}));

export default useNodeStore;



// utility functions
function isValidConnection(sourceNode?: ExtendedNode, targetNode?: ExtendedNode) {
  if (!sourceNode || !targetNode) return false;
  let valid = false;
  switch (targetNode.type) {
    case 'multiply':
      valid = sourceNode.type === 'value';
      break;
    case 'dense':
      break;
    case 'value':
      valid = sourceNode.type === 'value';
      break;
    default:
      valid = false;
  }
  return valid;
}
