import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';
import { FamilyMember } from '../types';

const nodeWidth = 260;
const nodeHeight = 90;
const horizontalGap = 100; // tối thiểu khoảng cách giữa các node cùng hàng
const spouseSpacing = nodeWidth + horizontalGap; // đảm bảo cặp vợ/chồng không đè lên nhau

export const getLayoutedElements = (members: FamilyMember[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: 'TB',
    nodesep: horizontalGap,
    ranksep: 170,
    edgesep: 30,
  });

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

  const coupleIdByMember = new Map<string, string>();
  const coupleNodes = new Map<string, { members: string[]; generation: number }>();
  processedSpousePairs.forEach((pairKey) => {
    const [a, b] = pairKey.split('-');
    const am = idToMember.get(a)!;
    const bm = idToMember.get(b)!;
    const cid = `cp-${a}-${b}`;
    coupleIdByMember.set(a, cid);
    coupleIdByMember.set(b, cid);
    const gen = Math.min(am.generation ?? 0, bm.generation ?? 0);
    coupleNodes.set(cid, { members: [a, b], generation: gen });
  });
  nodes.forEach((n) => {
    if (!coupleIdByMember.has(n.id)) {
      const m = n.data as unknown as FamilyMember;
      const cid = `m-${n.id}`;
      coupleIdByMember.set(n.id, cid);
      coupleNodes.set(cid, { members: [n.id], generation: m.generation ?? 0 });
    }
  });

  const clusterEdges: Array<{ s: string; t: string }> = [];
  treeEdges.forEach((e) => {
    const s = coupleIdByMember.get(e.source)!;
    const t = coupleIdByMember.get(e.target)!;
    if (s && t && s !== t) {
      clusterEdges.push({ s, t });
    }
  });

  coupleNodes.forEach((_v, cid) => {
    dagreGraph.setNode(cid, { width: spouseSpacing, height: nodeHeight });
  });
  clusterEdges.forEach(({ s, t }) => {
    dagreGraph.setEdge(s, t);
  });

  dagre.layout(dagreGraph);

  const rowHeight = 170;
  const posByMember = new Map<string, { x: number; y: number }>();
  coupleNodes.forEach((v, cid) => {
    const nodeWithPos = dagreGraph.node(cid);
    const gen = Number.isFinite(v.generation) ? v.generation : 0;
    const cy = gen * rowHeight;
    if (v.members.length === 2) {
      const a = v.members[0];
      const b = v.members[1];
      const am = idToMember.get(a)!;
      const bm = idToMember.get(b)!;
      const maleLeft = am.gender === 'Nam' || (am.gender !== 'Nữ' && bm.gender === 'Nữ');
      const leftId = maleLeft ? a : b;
      const rightId = maleLeft ? b : a;
      posByMember.set(leftId, { x: nodeWithPos.x - spouseSpacing / 2, y: cy });
      posByMember.set(rightId, { x: nodeWithPos.x + spouseSpacing / 2, y: cy });
    } else {
      const id = v.members[0];
      posByMember.set(id, { x: nodeWithPos.x, y: cy });
    }
  });

  const layoutedNodes = nodes.map((node) => {
    const p = posByMember.get(node.id) || { x: 0, y: 0 };
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: p.x - nodeWidth / 2,
        y: p.y,
      },
    };
  });

  // Post-process to cluster spouses close together side-by-side
  const nodeById = new Map(layoutedNodes.map(n => [n.id, n]));
  processedSpousePairs.forEach((pairKey) => {
    const [a, b] = pairKey.split('-');
    const na = nodeById.get(a);
    const nb = nodeById.get(b);
    if (!na || !nb) return;
    const da = na.data as unknown as FamilyMember;
    const db = nb.data as unknown as FamilyMember;
    const cx = (na.position.x + nb.position.x) / 2;
    const maleLeft = da.gender === 'Nam' || (da.gender !== 'Nữ' && db.gender === 'Nữ');
    if (maleLeft) {
      na.position.x = cx - spouseSpacing / 2;
      nb.position.x = cx + spouseSpacing / 2;
    } else {
      na.position.x = cx + spouseSpacing / 2;
      nb.position.x = cx - spouseSpacing / 2;
    }
    // Align y strictly equal to same generation row
    const y = Math.min(na.position.y, nb.position.y);
    na.position.y = y;
    nb.position.y = y;
  });

  // Collision resolution per row to avoid overlapping nodes
  const rows = new Map<number, Node[]>();
  Array.from(nodeById.values()).forEach((n) => {
    const d = n.data as unknown as FamilyMember;
    const gen = Number.isFinite(d.generation) ? d.generation : 0;
    if (!rows.has(gen)) rows.set(gen, []);
    rows.get(gen)!.push(n);
  });
  rows.forEach((rowNodes) => {
    rowNodes.sort((a, b) => a.position.x - b.position.x);
    let lastRight = -Infinity;
    rowNodes.forEach((n) => {
      const left = n.position.x;
      const requiredLeft = lastRight + horizontalGap + nodeWidth / 2; // keep center-to-center gap ~ nodeWidth + gap
      if (left < requiredLeft) {
        const shift = requiredLeft - left;
        n.position.x += shift;
      }
      lastRight = n.position.x + nodeWidth / 2;
    });
  });

  return { nodes: Array.from(nodeById.values()), edges: [...treeEdges, ...spouseEdges] };
};
