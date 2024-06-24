import {create} from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import {ExtendedNode} from '@/app/nodes/nodeTypes';
import {compileNodes, getAllConnectedNodes, isValidConnection} from '@/app/nodes/nodeUtils';


const initialNodes: ExtendedNode[] = [
  {id: 'dense1', type: 'denseLayer', position: { x: -200, y: 200 }, data: {units: 256, activation: 'ReLU', inputShape: [4, 4]}},
  {id: 'dense2', type: 'denseLayer', position: { x: 50, y: 200 }, data: {units: 64, activation: 'ReLU', inputShape: [4, 4]}},
  {id: 'input1', type: 'inputLayer', position: { x: -450, y: 200 }, data: {shape: [4096]}},
  {id: 'model1', type: 'model', position: { x: 300, y: 200 }, data: {optimizer: 'Adam', loss: 'MSE', lr: 0.001}},
  {id: 'train1', type: 'trainModel', position: { x: 550, y: 200 }, data: {epochs: 2, batchSize: 32, compiled: false}},
];

const initialEdges: Edge[] = [
  {id: 'e1', source: 'input1', sourceHandle: 'Out', target: 'dense1', targetHandle: 'In'},
  {id: 'e2', source: 'dense1', sourceHandle: 'Out', target: 'dense2', targetHandle: 'In'},
  {id: 'e3', source: 'dense2', sourceHandle: 'Out', target: 'model1', targetHandle: 'In'},
  {id: 'e4', source: 'model1', sourceHandle: 'Out', target: 'train1', targetHandle: 'Model'},
];

export type NodeState = {
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
  addError: (node: ExtendedNode, error: string, clearExisting?: boolean) => void;
  compile: (nodes?: ExtendedNode[]) => Promise<boolean>;
  run: () => void;
  compiling: boolean;
  running: boolean;
  setCompiling: (compiling: boolean) => void;
  toggleCompiling: () => void;
  setRunning: (running: boolean) => void;
  setEdgeAnimation: (nodes: ExtendedNode[], value: boolean) => void;
};

const useNodeStore = create<NodeState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
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

    if (!isValidConnection(get().getNode(source), get().getNode(target), sourceHandle, targetHandle)) {
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
  addError: (node: ExtendedNode, error: string, clearExisting: boolean=false) => {
      const currentErrors = node.data.errors || [];
      if (currentErrors.includes(error)) return;
  
      let errors: string[] = [];
      if (clearExisting) errors = [error];
      else errors = [...currentErrors, error];
      get().updateNode(node.id, {errors});
  },
  compile: async (nodes=undefined) => {
    let result = false;
    const n = nodes || get().nodes;
    try {
      set({compiling: true});
      get().setEdgeAnimation(n, true);
      await compileNodes(n);
      result = true;
      console.log('Compilation complete');
    } catch (error) {
      console.error('Compilation error:', error);
      result = false;
    } finally {
      set({compiling: false});
      console.log("COMP DONE: ", result);
      get().setEdgeAnimation(n, false);
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
  setEdgeAnimation: (nodes: ExtendedNode[], value: boolean) => {
    const nodeIds = nodes.map(node => node.id);
    set(state => {
      const edges = state.edges.map(edge => {
        if (nodeIds.includes(edge.source) && nodeIds.includes(edge.target)) {
          return {...edge, animated: value};
        }
        return edge;
      });
      return {edges};
    });
  },
}));

export default useNodeStore;
