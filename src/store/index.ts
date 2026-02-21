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
import { buildFamilyTree, flattenTree } from '../utils/dataTransform';
import { getLayoutedElements } from '../utils/layout';
import { filterCollapsed } from '../utils/treeFilter';

interface RFState {
  nodes: Node[];
  edges: Edge[];
  rawMembers: FamilyMember[]; // Hierarchical structure
  loading: boolean;
  error: string | null;
  searchTerm: string;
  searchResults: string[];
  currentSearchIndex: number;
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
  nextSearchResult: () => void;
  prevSearchResult: () => void;
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
  searchResults: [],
  currentSearchIndex: -1,
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
    const { rawMembers, collapsedIds } = get();
    
    if (!term.trim()) {
      set({ searchTerm: term, searchResults: [], currentSearchIndex: -1 });
      get().recompute();
      return;
    }

    const lowerTerm = term.toLowerCase();
    const newCollapsedIds = new Set(collapsedIds);
    const allMembers = flattenTree(rawMembers);
    const memberMap = new Map<string, FamilyMember>();
    allMembers.forEach(m => memberMap.set(m.id, m));
    const results: string[] = [];

    const expandPath = (memberId: string) => {
      let currentId = memberId;
      while (true) {
        const member = memberMap.get(currentId);
        if (!member) break;
        
        // If this member has a parent, ensure the parent is expanded
        if (member.parentId) {
          // If parent is in collapsedIds, remove it
          if (newCollapsedIds.has(member.parentId)) {
             newCollapsedIds.delete(member.parentId);
          }
          currentId = member.parentId;
        } else {
          break;
        }
      }
    };

    allMembers.forEach(m => {
      if (m.name.toLowerCase().includes(lowerTerm)) {
        results.push(m.id);
        expandPath(m.id);
        // Also expand spouse's path if applicable (e.g. for in-laws)
        if (m.spouseId) {
            expandPath(m.spouseId);
        }
      }
    });

    set({ 
        searchTerm: term, 
        collapsedIds: Array.from(newCollapsedIds),
        searchResults: results,
        currentSearchIndex: results.length > 0 ? 0 : -1
    });
    get().recompute();
  },

  nextSearchResult: () => {
    const { searchResults, currentSearchIndex } = get();
    if (searchResults.length === 0) return;
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    set({ currentSearchIndex: nextIndex });
    get().recompute();
  },

  prevSearchResult: () => {
    const { searchResults, currentSearchIndex } = get();
    if (searchResults.length === 0) return;
    const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    set({ currentSearchIndex: prevIndex });
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
      
      const { searchResults, currentSearchIndex } = get();
      const isFocused = isMatch && searchResults[currentSearchIndex] === data.id;

      return { 
          ...node, 
          data: { 
              ...data, 
              highlighted: isMatch,
              isFocused: isFocused // Add this to CustomNode if we want visual distinction
          } 
      };
    });
    set({ nodes: markedNodes, edges });
  },
}));

export default useStore;
