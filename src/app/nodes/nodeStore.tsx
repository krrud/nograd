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
import {ExtendedNode, ValueNodeData} from '@/app/nodes/nodeTypes';
import {compileNodes, getAllConnectedNodes, isValidConnection, topoSort} from '@/app/nodes/nodeUtils';


const initialNodes: ExtendedNode[] = [
  {id: 'multiply1', type: 'multiply', position: { x: 150, y: 0 }, data: {}},
  {id: 'value1', type: 'value', position: { x: -150, y: -100 }, data: { x: 4 }},
  {id: 'value2', type: 'value', position: { x: -150, y: 50 }, data: { x: 5 }},
  {id: 'dense1', type: 'denseLayer', position: { x: -150, y: 200 }, data: {units: 10, activation: 'ReLU', inputShape: [4, 4]}},
  {id: 'dense2', type: 'denseLayer', position: { x: 50, y: 200 }, data: {units: 10, activation: 'ReLU', inputShape: [4, 4]}},
  {id: 'input1', type: 'inputLayer', position: { x: -350, y: 200 }, data: {shape: [4, 4]}},
  {id: 'model1', type: 'model', position: { x: 250, y: 200 }, data: {optimizer: 'Adam', loss: 'MSE', lr: 0.001}},
];

export type NodeState = {
  compile: (nodes?: ExtendedNode[]) => Promise<boolean>;
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
  addNode: (node: ExtendedNode) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, data: {}) => void;
  getNode: (nodeId: string) => ExtendedNode | undefined;
  getInputEdges: (nodeId: string) => { source: string; sourceHandle: string | null | undefined; }[];
  getAllConnectedNodes: (nodeId: string) => ExtendedNode[];
  addError: (nodeId: string, error: string) => void;
};

const useNodeStore = create<NodeState>((set, get) => ({
  compile: async (nodes=get().nodes) => {
    let result = false;
    try {
      set({ compiling: true });
      const sorted = topoSort(nodes);
      await compileNodes(sorted);
      result = true;
      console.log('Compilation complete');
    } catch (error) {
      console.error('Compilation error:', error);
      result = false;
    } finally {
      set({compiling: false});
      return result;
    }
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
  },
  setNodes: (nodes: ExtendedNode[]) => {
    set({ nodes });
  },
  setEdges: (edges: Edge[]) => {
    set({ edges });
  },
  addNode: (node: ExtendedNode) => {
    set(state => {
      if (state.nodes.some(n => n.id === node.id)) {
        console.warn(`Node with ID ${node.id} already exists.`);
        return state;
      }
      return { nodes: [...state.nodes, node] };
    });
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
  removeNode: (nodeId: string) => {
    set(state => {
      const nodeExists = state.nodes.some(node => node.id === nodeId);
      if (!nodeExists) {
        console.warn(`Node with ID ${nodeId} not found.`);
        return state;
      }
      return {
        nodes: state.nodes.filter(node => node.id !== nodeId)
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
  getAllConnectedNodes: (nodeId: string) => {
    return getAllConnectedNodes(nodeId);
  },
  addError: (nodeId: string, error: string) => {
    set(state => {
      const node = state.nodes.find(node => node.id === nodeId);
      const newErrors = node?.data.errors ? Array.from(new Set([...node.data.errors, error])) : [error];
      if (!node) return state;
      return {
        nodes: state.nodes.map(node =>
          node.id === nodeId ? { ...node, data: { ...node.data, errors: newErrors } } : node
        )
      };
    });
  }
}));

export default useNodeStore;
