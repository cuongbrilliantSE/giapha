import { RawSheetRow, FamilyMember } from '../types';

export const buildFamilyTree = (rows: RawSheetRow[]): FamilyMember[] => {
  const memberMap = new Map<string, FamilyMember>();
  const roots: FamilyMember[] = [];

  // First pass: Create all member objects
  rows.forEach((row) => {
    if (!row.id) return;
    
    memberMap.set(row.id, {
      id: row.id,
      name: row.fullName,
      birthDate: row.birthDate,
      deathDate: row.deathDate,
      gender: row.gender as 'Nam' | 'Nữ',
      parentId: row.parentId,
      generation: parseInt(row.generation) || 0,
      additionalInfo: row.additionalInfo,
      spouseId: row.spouseId || undefined,
      children: [],
    });
  });

  // Second pass: Link parents and children
  rows.forEach((row) => {
    if (!row.id) return;
    const member = memberMap.get(row.id);
    if (!member) return;

    if (row.parentId && memberMap.has(row.parentId)) {
      const parent = memberMap.get(row.parentId);
      parent?.children?.push(member);
    } else {
      roots.push(member);
    }
  });

  return roots;
};

// Function to flatten the tree for search/filter if needed
export const flattenTree = (members: FamilyMember[]): FamilyMember[] => {
  let flat: FamilyMember[] = [];
  members.forEach((member) => {
    flat.push(member);
    if (member.children) {
      flat = flat.concat(flattenTree(member.children));
    }
  });
  return flat;
};
