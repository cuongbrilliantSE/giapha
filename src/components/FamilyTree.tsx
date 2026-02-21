import React, { useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Node,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from './CustomNode';
import ExportControls from './ExportControls';
import SpouseEdge from './edges/SpouseEdge';
import useStore from '../store';
import { FamilyMember } from '../types';

const nodeTypes: any = {
  custom: CustomNode,
};

const edgeTypes: any = {
  spouseEdge: SpouseEdge,
};

// Component to handle search focus logic
const SearchFocusHandler = () => {
  const { setCenter } = useReactFlow();
  const { searchResults, currentSearchIndex, nodes } = useStore();

  useEffect(() => {
    if (searchResults.length > 0 && currentSearchIndex >= 0) {
      const targetId = searchResults[currentSearchIndex];
      const node = nodes.find((n) => n.id === targetId);

      if (node && node.position) {
        // Center the view on the node with zoom 1.5
        // node.width and node.height might be undefined initially or if not measured yet
        // Default to 180 and 100 as per CustomNode
        const width = node.measured?.width || node.width || 180;
        const height = node.measured?.height || node.height || 100;
        
        setCenter(node.position.x + width / 2, node.position.y + height / 2, { zoom: 1.5, duration: 800 });
      }
    }
  }, [searchResults, currentSearchIndex, nodes, setCenter]);

  return null;
};

const FamilyTree = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    fetchData,
    loading,
    error,
    setSelectedMember,
    comparisonMode,
    sourceMember,
    setSourceMember,
    setTargetMember,
  } = useStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    const member = node.data as unknown as FamilyMember;
    if (comparisonMode) {
      if (!sourceMember) {
        setSourceMember(member);
      } else {
        setTargetMember(member);
      }
    } else {
      setSelectedMember(member);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        fitView
        minZoom={0.01}
        maxZoom={4}
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
        <ExportControls />
        <SearchFocusHandler />
      </ReactFlow>
    </div>
  );
};

export default FamilyTree;
