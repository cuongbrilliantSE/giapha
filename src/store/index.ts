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

  comparisonMode: boolean;
  sourceMember: FamilyMember | null;
  targetMember: FamilyMember | null;
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  
  fetchData: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedMember: (member: FamilyMember | null) => void;
  toggleCollapse: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  recompute: () => void;

  setComparisonMode: (mode: boolean) => void;
  setSourceMember: (member: FamilyMember | null) => void;
  setTargetMember: (member: FamilyMember | null) => void;
  resetComparison: () => void;
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

  comparisonMode: false,
  sourceMember: null,
  targetMember: null,

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
      
      const initialCollapsed: string[] = [];
      
      const walk = (m: FamilyMember) => {
        if (m.children && m.children.length > 0) {
           const gen = m.generation || 0;
           // Mặc định hiển thị đến thế hệ 4 (0, 1, 2, 3), bắt đầu thu gọn từ thế hệ 4 (để ẩn con của 4 là 5)
           if (gen >= 4) {
             initialCollapsed.push(m.id);
           }
           m.children.forEach(walk);
        }
      };
      
      tree.forEach(walk);

      set({ rawMembers: tree, loading: false, collapsedIds: initialCollapsed });
      get().recompute();
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || 'Failed to fetch data',
      });
    }
  },

  expandAll: () => {
    set({ collapsedIds: [] });
    get().recompute();
  },

  collapseAll: () => {
    const { rawMembers } = get();
    const allIds: string[] = [];
    const walk = (m: FamilyMember) => {
      if (m.children && m.children.length > 0) {
        allIds.push(m.id);
        m.children.forEach(walk);
      }
    };
    rawMembers.forEach(walk);
    set({ collapsedIds: allIds });
    get().recompute();
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
    get().recompute();
  },

  setSelectedMember: (member: FamilyMember | null) => {
    set({ selectedMember: member });
  },

  setComparisonMode: (mode: boolean) => {
    set({ comparisonMode: mode });
  },

  setSourceMember: (member: FamilyMember | null) => {
    set({ sourceMember: member });
  },

  setTargetMember: (member: FamilyMember | null) => {
    set({ targetMember: member });
  },

  resetComparison: () => {
    set({ comparisonMode: false, sourceMember: null, targetMember: null });
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
