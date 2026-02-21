import { RawSheetRow, FamilyMember } from '../types';

export const buildFamilyTree = (rows: RawSheetRow[]): FamilyMember[] => {
  const memberMap = new Map<string, FamilyMember>();
  const roots: FamilyMember[] = [];

  const normalizeDate = (value?: string) => {
    if (!value) return '';
    const v = String(value).trim();
    if (v === '') return '';
    if (/^\d{4}$/.test(v)) return v;
    const d = new Date(v);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
    return v;
  };

  // First pass: Create all member objects
  rows.forEach((row) => {
    if (!row.id) return;
    
    memberMap.set(row.id, {
      id: row.id,
      name: row.fullName,
      birthDate: normalizeDate(row.birthDate),
      deathDate: normalizeDate(row.deathDate),
      gender: row.gender as 'Nam' | 'Nữ',
      parentId: row.parentId,
      generation: parseInt(row.generation) || 0,
      additionalInfo: row.additionalInfo,
      spouseId: row.spouseId || undefined,
      displayOrder: row.displayOrder,
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

  // Third pass: Sort siblings by displayOrder
  const sortFn = (a: FamilyMember, b: FamilyMember) => {
    if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
      return a.displayOrder - b.displayOrder;
    }
    // If one has order and other doesn't, put the one with order first?
    // Or put the one without order last? usually undefined means "don't care" or "end".
    // Let's assume undefined goes to the end.
    if (a.displayOrder !== undefined) return -1;
    if (b.displayOrder !== undefined) return 1;
    return 0;
  };

  memberMap.forEach((member) => {
    if (member.children && member.children.length > 0) {
      member.children.sort(sortFn);
    }
  });

  roots.sort(sortFn);

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
