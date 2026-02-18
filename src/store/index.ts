import { create } from 'zustand';
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
} from '@xyflow/react';
import { FamilyMember } from '../types';
import { fetchFamilyData } from '../services/googleSheets';
import { buildFamilyTree } from '../utils/dataTransform';
import { getLayoutedElements } from '../utils/layout';

interface RFState {
  nodes: Node[];
  edges: Edge[];
  rawMembers: FamilyMember[]; // Hierarchical structure
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedMember: FamilyMember | null;
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  
  fetchData: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedMember: (member: FamilyMember | null) => void;
}

const useStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  rawMembers: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedMember: null,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const rawRows = await fetchFamilyData();
      const tree = buildFamilyTree(rawRows);
      const { nodes, edges } = getLayoutedElements(tree);
      
      set({
        rawMembers: tree,
        nodes,
        edges,
        loading: false,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || 'Failed to fetch data',
      });
    }
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
    
    const { nodes } = get();
    const newNodes = nodes.map((node) => {
      const data = node.data as unknown as FamilyMember;
      const isMatch = term.trim() !== '' && data.name.toLowerCase().includes(term.toLowerCase());
      
      return {
        ...node,
        data: {
          ...data,
          highlighted: isMatch,
        },
      };
    });
    
    set({ nodes: newNodes });
  },

  setSelectedMember: (member: FamilyMember | null) => {
    set({ selectedMember: member });
  },
}));

export default useStore;
