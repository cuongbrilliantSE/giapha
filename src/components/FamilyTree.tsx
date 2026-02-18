import React, { useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from './CustomNode';
import ExportControls from './ExportControls';
import SpouseEdge from './edges/SpouseEdge';
import useStore from '../store';
import { FamilyMember } from '../types';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  spouseEdge: SpouseEdge,
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
  } = useStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedMember(node.data as unknown as FamilyMember);
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
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
        <ExportControls />
      </ReactFlow>
    </div>
  );
};

export default FamilyTree;
