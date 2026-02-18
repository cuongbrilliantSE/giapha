import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';
import { FamilyMember } from '../types';

const nodeWidth = 200;
const nodeHeight = 80;

export const getLayoutedElements = (members: FamilyMember[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: 'TB' });

  const nodes: Node[] = [];
  const treeEdges: Edge[] = [];
  const spouseEdges: Edge[] = [];
  const idToMember = new Map<string, FamilyMember>();
  const processedSpousePairs = new Set<string>();

  const traverse = (member: FamilyMember) => {
    nodes.push({
      id: member.id,
      type: 'custom',
      data: { label: member.name, ...member },
      position: { x: 0, y: 0 },
    });
    idToMember.set(member.id, member);

    if (member.children && member.children.length > 0) {
      member.children.forEach((child) => {
        treeEdges.push({
          id: `e${member.id}-${child.id}`,
          source: member.id,
          target: child.id,
          type: 'smoothstep',
          animated: true,
        });
        traverse(child);
      });
    }
  };

  members.forEach((root) => traverse(root));

  nodes.forEach((n) => {
    const data = n.data as unknown as FamilyMember;
    const spouseId = data.spouseId;
    if (!spouseId) return;
    if (!idToMember.has(spouseId)) return;
    const pairKey = [data.id, spouseId].sort().join('-');
    if (processedSpousePairs.has(pairKey)) return;
    processedSpousePairs.add(pairKey);
    spouseEdges.push({
      id: `s${data.id}-${spouseId}`,
      source: data.id,
      sourceHandle: 'spouse-right',
      target: spouseId,
      targetHandle: 'spouse-left',
      type: 'spouseEdge',
      animated: false,
      style: {},
    } as Edge);
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  treeEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const rowHeight = 140;
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const data = node.data as unknown as FamilyMember;
    const generation = Number.isFinite(data.generation) ? data.generation : 0;
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: generation * rowHeight,
      },
    };
  });
  return { nodes: layoutedNodes, edges: [...treeEdges, ...spouseEdges] };
};
