import { FamilyMember } from '../types';

// Build quick lookup maps from hierarchical members
function buildIndex(members: FamilyMember[]) {
  const byId = new Map<string, FamilyMember>();
  const childrenMap = new Map<string, string[]>();
  const walk = (m: FamilyMember) => {
    byId.set(m.id, m);
    if (m.children && m.children.length > 0) {
      childrenMap.set(m.id, m.children.map((c) => c.id));
      m.children.forEach(walk);
    }
  };
  members.forEach(walk);
  return { byId, childrenMap };
}

function collectDescendants(id: string, childrenMap: Map<string, string[]>, acc: Set<string>) {
  const kids = childrenMap.get(id) || [];
  for (const childId of kids) {
    if (acc.has(childId)) continue;
    acc.add(childId);
    collectDescendants(childId, childrenMap, acc);
  }
}

export function filterCollapsed(members: FamilyMember[], collapsed: Set<string>): FamilyMember[] {
  if (collapsed.size === 0) return members;
  const { byId, childrenMap } = buildIndex(members);

  // Compute all nodes to hide: descendants of collapsed ids + their spouses (con dâu/rể)
  const hideIds = new Set<string>();
  collapsed.forEach((cid) => {
    const kids = childrenMap.get(cid) || [];
    kids.forEach((k) => {
      hideIds.add(k);
      collectDescendants(k, childrenMap, hideIds);
    });
  });
  // Add spouses of everything hidden (in-laws)
  for (const id of Array.from(hideIds)) {
    const m = byId.get(id);
    if (m?.spouseId) {
      hideIds.add(m.spouseId);
    }
  }

  // Prune function that removes any node in hideIds (anywhere in the forest)
  const prune = (m: FamilyMember): FamilyMember | null => {
    if (hideIds.has(m.id)) return null;
    const newChildren: FamilyMember[] = [];
    (m.children || []).forEach((c) => {
      const pr = prune(c);
      if (pr) newChildren.push(pr);
    });
    return { ...m, children: newChildren };
  };

  const result: FamilyMember[] = [];
  members.forEach((root) => {
    const pr = prune(root);
    if (pr) result.push(pr);
  });
  return result;
}
