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
import { filterCollapsed } from '../utils/treeFilter';

interface RFState {
  nodes: Node[];
  edges: Edge[];
  rawMembers: FamilyMember[]; // Hierarchical structure
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedMember: FamilyMember | null;
  collapsedIds: string[];
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  
  fetchData: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedMember: (member: FamilyMember | null) => void;
  toggleCollapse: (id: string) => void;
  recompute: () => void;
}

const useStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  rawMembers: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedMember: null,
  collapsedIds: [],

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
      set({ rawMembers: tree, loading: false });
      get().recompute();
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || 'Failed to fetch data',
      });
    }
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
    get().recompute();
  },

  setSelectedMember: (member: FamilyMember | null) => {
    set({ selectedMember: member });
  },

  toggleCollapse: (id: string) => {
    const { collapsedIds } = get();
    const exists = collapsedIds.includes(id);
    const next = exists ? collapsedIds.filter(x => x !== id) : [...collapsedIds, id];
    set({ collapsedIds: next });
    get().recompute();
  },

  recompute: () => {
    const { rawMembers, collapsedIds, searchTerm } = get();
    const collapsedSet = new Set(collapsedIds);
    const filtered = filterCollapsed(rawMembers, collapsedSet);

    // Build set of ids that have children in the original tree
    const originalHasChildren = new Set<string>();
    const walk = (m: FamilyMember) => {
      if (m.children && m.children.length > 0) {
        originalHasChildren.add(m.id);
        m.children.forEach(walk);
      }
    };
    rawMembers.forEach(walk);

    // Annotate filtered tree with hasChildrenOriginal so toggle button persists
    const annotate = (m: FamilyMember): FamilyMember => {
      const cloned: any = { ...m, hasChildrenOriginal: originalHasChildren.has(m.id) };
      if (m.children && m.children.length > 0) {
        cloned.children = m.children.map(annotate);
      }
      return cloned as FamilyMember;
    };
    const annotated = filtered.map(annotate);

    const { nodes, edges } = getLayoutedElements(annotated);
    const markedNodes = nodes.map((node) => {
      const data = node.data as unknown as FamilyMember;
      const isMatch = searchTerm.trim() !== '' && data.name.toLowerCase().includes(searchTerm.toLowerCase());
      return { ...node, data: { ...data, highlighted: isMatch } };
    });
    set({ nodes: markedNodes, edges });
  },
}));

export default useStore;
