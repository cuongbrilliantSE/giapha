import { FamilyMember } from '../types';

interface RelationshipResult {
  sourceCallTarget: string; // Source calls Target
  targetCallSource: string; // Target calls Source
  relationship: string; // Description (e.g. "Anh em họ", "Cha con")
}

export const calculateRelationship = (
  source: FamilyMember,
  target: FamilyMember,
  allMembers: FamilyMember[]
): RelationshipResult | null => {
  if (source.id === target.id) return null;

  const memberMap = new Map<string, FamilyMember>();
  allMembers.forEach((m) => memberMap.set(m.id, m));

  // Helper to get lineage path: [self, parent, grandparent, ...]
  const getPath = (member: FamilyMember): FamilyMember[] => {
    const path: FamilyMember[] = [member];
    let current = member;
    while (current.parentId && memberMap.has(current.parentId)) {
      current = memberMap.get(current.parentId)!;
      path.push(current);
    }
    return path;
  };

  // Helper to parse birth year
  const getBirthYear = (m: FamilyMember): number => {
    if (!m.birthDate) return 9999;
    const match = m.birthDate.match(/\d{4}/);
    return match ? parseInt(match[0], 10) : 9999;
  };

  const pathSource = getPath(source);
  const pathTarget = getPath(target);

  // --- Case 0: Direct Spouse ---
  if (source.spouseId === target.id || target.spouseId === source.id) {
      const sTitle = source.gender === 'Nam' ? 'Chồng' : 'Vợ';
      const tTitle = target.gender === 'Nam' ? 'Chồng' : 'Vợ';
      return {
          sourceCallTarget: tTitle,
          targetCallSource: sTitle,
          relationship: 'Vợ Chồng'
      };
  }

  // --- Case 0.5: Spouse of Ancestor (Target is Spouse of Source's Ancestor) ---
  for (let i = 1; i < pathSource.length; i++) {
    const ancestor = pathSource[i];
    if (ancestor.spouseId === target.id) {
      // Found! Target is spouse of ancestor at generation distance 'i'
      if (i === 1) {
        // Spouse of Parent
        const isMom = target.gender === 'Nữ';
        return {
          sourceCallTarget: isMom ? 'Mẹ' : 'Cha (dượng)',
          targetCallSource: 'Con',
          relationship: isMom ? 'Mẹ - Con' : 'Cha - Con'
        };
      } else if (i === 2) {
        // Spouse of Grandparent
        const isGrandma = target.gender === 'Nữ';
        return {
          sourceCallTarget: isGrandma ? 'Bà' : 'Ông',
          targetCallSource: 'Cháu',
          relationship: isGrandma ? 'Bà - Cháu' : 'Ông - Cháu'
        };
      } else {
        // Great-grandparent+
        const term = target.gender === 'Nam' ? 'Cụ/Kỵ Ông' : 'Cụ/Kỵ Bà';
        return {
            sourceCallTarget: term,
            targetCallSource: 'Chắt/Chút',
            relationship: 'Tổ tiên (bên dâu/rể) - Con cháu'
        };
      }
    }
  }

  // --- Case 0.6: Ancestor of Spouse (Source is Spouse of Target's Ancestor) ---
  for (let i = 1; i < pathTarget.length; i++) {
    const ancestor = pathTarget[i];
    if (ancestor.spouseId === source.id) {
       if (i === 1) {
        // Source is Spouse of Target's Parent
        const isMom = source.gender === 'Nữ';
        return {
          sourceCallTarget: 'Con',
          targetCallSource: isMom ? 'Mẹ' : 'Cha (dượng)',
          relationship: isMom ? 'Mẹ - Con' : 'Cha - Con'
        };
      } else if (i === 2) {
         const isGrandma = source.gender === 'Nữ';
         return {
           sourceCallTarget: 'Cháu',
           targetCallSource: isGrandma ? 'Bà' : 'Ông',
           relationship: isGrandma ? 'Bà - Cháu' : 'Ông - Cháu'
         };
      }
    }
  }

  // --- Case 0.7: Target is Spouse of Source's Descendant (Source = Parent-in-law, Target = Child-in-law) ---
   if (target.spouseId && memberMap.has(target.spouseId)) {
     const spouseT = memberMap.get(target.spouseId)!;
     const pathSpouseT = getPath(spouseT);
     // Check if Source is in pathSpouseT (Source is ancestor of Target's spouse)
     for (let i = 1; i < pathSpouseT.length; i++) {
        if (pathSpouseT[i].id === source.id) {
           // Source is ancestor of Target's spouse
           const isDau = target.gender === 'Nữ';
           if (i === 1) {
              // Spouse of Child
              return {
                  sourceCallTarget: isDau ? 'Con dâu' : 'Con rể',
                  targetCallSource: source.gender === 'Nam' ? 'Cha (chồng/vợ)' : 'Mẹ (chồng/vợ)', 
                  relationship: isDau ? 'Cha/Mẹ - Con dâu' : 'Cha/Mẹ - Con rể'
              };
           } else if (i === 2) {
              // Spouse of Grandchild
              return {
                  sourceCallTarget: isDau ? 'Cháu dâu' : 'Cháu rể',
                  targetCallSource: source.gender === 'Nam' ? 'Ông (nội/ngoại)' : 'Bà (nội/ngoại)', 
                  relationship: isDau ? 'Ông/Bà - Cháu dâu' : 'Ông/Bà - Cháu rể'
              };
           } else {
              // Spouse of Great-Grandchild+
              return {
                  sourceCallTarget: 'Chắt/Chút dâu/rể',
                  targetCallSource: 'Cụ/Kỵ', 
                  relationship: 'Tổ tiên - Con cháu dâu/rể'
              };
           }
        }
     }
   }

   // --- Case 0.8: Source is Spouse of Target's Descendant (Source = Child-in-law, Target = Parent-in-law) ---
   if (source.spouseId && memberMap.has(source.spouseId)) {
     const spouseS = memberMap.get(source.spouseId)!;
     const pathSpouseS = getPath(spouseS);
     // Check if Target is in pathSpouseS (Target is ancestor of Source's spouse)
     for (let i = 1; i < pathSpouseS.length; i++) {
        if (pathSpouseS[i].id === target.id) {
           // Target is ancestor of Source's spouse
           const isDau = source.gender === 'Nữ';
           if (i === 1) {
              // Source is Spouse of Child -> Child-in-law
               return {
                  sourceCallTarget: target.gender === 'Nam' ? 'Cha (chồng/vợ)' : 'Mẹ (chồng/vợ)',
                  targetCallSource: isDau ? 'Con dâu' : 'Con rể',
                  relationship: isDau ? 'Cha/Mẹ - Con dâu' : 'Cha/Mẹ - Con rể'
              };
           } else if (i === 2) {
              // Source is Spouse of Grandchild
               return {
                  sourceCallTarget: target.gender === 'Nam' ? 'Ông (nội/ngoại)' : 'Bà (nội/ngoại)',
                  targetCallSource: isDau ? 'Cháu dâu' : 'Cháu rể',
                  relationship: isDau ? 'Ông/Bà - Cháu dâu' : 'Ông/Bà - Cháu rể'
              };
           } else {
               return {
                  sourceCallTarget: 'Cụ/Kỵ',
                  targetCallSource: 'Chắt/Chút dâu/rể', 
                  relationship: 'Tổ tiên - Con cháu dâu/rể'
              };
           }
        }
     }
   }

  // --- Case 0.9: Sibling-in-law (One is spouse of Sibling) ---
  // Source is Spouse of Target's Sibling
  if (source.spouseId && memberMap.has(source.spouseId)) {
    const spouseS = memberMap.get(source.spouseId)!;
    // Check if spouseS and Target are siblings
    // Check parents
    if (spouseS.parentId && spouseS.parentId === target.parentId) {
       // Yes, they are siblings
       const isSpouseOlder = spouseS.displayOrder !== undefined && target.displayOrder !== undefined 
          ? spouseS.displayOrder < target.displayOrder 
          : getBirthYear(spouseS) < getBirthYear(target);

       const relation = 'Anh chị em (dâu/rể)';
       if (isSpouseOlder) {
          // Spouse is older -> Source is Anh/Chị
          return {
             // Source (Wife of Older Bro) calls Target (Younger Bro): Chú (if Target is male), Cô (if Target is female)
             // Source (Husband of Older Sis) calls Target (Younger Bro): Cậu (if Target is male), Dì (if Target is female)
             // Simplification for now:
             sourceCallTarget: 'Em',
             targetCallSource: source.gender === 'Nam' ? 'Anh (rể)' : 'Chị (dâu)',
             relationship: relation
          };
       } else {
          // Spouse is younger -> Source is Em
          return {
             sourceCallTarget: target.gender === 'Nam' ? 'Anh' : 'Chị',
             targetCallSource: source.gender === 'Nam' ? 'Em (rể)' : 'Em (dâu)',
             relationship: relation
          };
       }
    }
  }

  // Target is Spouse of Source's Sibling
  if (target.spouseId && memberMap.has(target.spouseId)) {
     const spouseT = memberMap.get(target.spouseId)!;
     if (spouseT.parentId && spouseT.parentId === source.parentId) {
        // Yes, they are siblings
        const isSpouseOlder = spouseT.displayOrder !== undefined && source.displayOrder !== undefined
           ? spouseT.displayOrder < source.displayOrder
           : getBirthYear(spouseT) < getBirthYear(source);
        
        const relation = 'Anh chị em (dâu/rể)';
        if (isSpouseOlder) {
           // Target's spouse is older -> Target is Anh/Chị
           return {
              sourceCallTarget: target.gender === 'Nam' ? 'Anh (rể)' : 'Chị (dâu)',
              targetCallSource: 'Em',
              relationship: relation
           };
        } else {
           // Target's spouse is younger -> Target is Em
           return {
              sourceCallTarget: target.gender === 'Nam' ? 'Em (rể)' : 'Em (dâu)',
              targetCallSource: source.gender === 'Nam' ? 'Anh' : 'Chị',
              relationship: relation
           };
        }
     }
  }

   // Find Lowest Common Ancestor (LCA)
  let lca: FamilyMember | null = null;
  let distSource = -1;
  let distTarget = -1;

  for (let i = 0; i < pathSource.length; i++) {
    const ancestor = pathSource[i];
    const indexInTarget = pathTarget.findIndex((m) => m.id === ancestor.id);
    if (indexInTarget !== -1) {
      lca = ancestor;
      distSource = i; // Distance from source to LCA
      distTarget = indexInTarget; // Distance from target to LCA
      break;
    }
  }

  if (!lca) {
    return {
      sourceCallTarget: 'Người lạ',
      targetCallSource: 'Người lạ',
      relationship: 'Không cùng huyết thống (hoặc chưa xác định được mối liên hệ)',
    };
  }

  // Same Person (handled at start), but for sanity
  if (distSource === 0 && distTarget === 0) return null;

  const genDiff = target.generation - source.generation; // + means Target is lower (descendant), - means Target is higher (ancestor)
  
  const sourceYear = getBirthYear(source);
  const targetYear = getBirthYear(target);

  // --- Case 1: Direct Lineage (One is ancestor of another) ---
  if (distSource === 0 || distTarget === 0) {
    // Source is ancestor of Target (distSource = 0)
    if (distSource === 0) {
      // genDiff should be positive
      if (distTarget === 1) return { sourceCallTarget: 'Con', targetCallSource: source.gender === 'Nam' ? 'Cha' : 'Mẹ', relationship: 'Cha/Mẹ - Con' };
      if (distTarget === 2) return { sourceCallTarget: 'Cháu', targetCallSource: source.gender === 'Nam' ? 'Ông' : 'Bà', relationship: 'Ông/Bà - Cháu' };
      if (distTarget === 3) return { sourceCallTarget: 'Chắt', targetCallSource: 'Cụ', relationship: 'Cụ - Chắt' };
      if (distTarget >= 4) return { sourceCallTarget: 'Chút/Chít', targetCallSource: 'Kỵ', relationship: 'Kỵ - Chút' };
    }
    // Target is ancestor of Source (distTarget = 0)
    if (distTarget === 0) {
      // genDiff should be negative
      if (distSource === 1) return { sourceCallTarget: target.gender === 'Nam' ? 'Cha' : 'Mẹ', targetCallSource: 'Con', relationship: 'Cha/Mẹ - Con' };
      if (distSource === 2) return { sourceCallTarget: target.gender === 'Nam' ? 'Ông' : 'Bà', targetCallSource: 'Cháu', relationship: 'Ông/Bà - Cháu' };
      if (distSource === 3) return { sourceCallTarget: 'Cụ', targetCallSource: 'Chắt', relationship: 'Cụ - Chắt' };
      if (distSource >= 4) return { sourceCallTarget: 'Kỵ', targetCallSource: 'Chút/Chít', relationship: 'Kỵ - Chút' };
    }
  }

  // --- Case 2: Collateral (Siblings, Cousins, Uncle/Aunt/Nephew/Niece) ---
  
  // Find roots below LCA to determine branch seniority
  // pathSource = [Source, Parent, ..., LCA, ...]
  // pathTarget = [Target, Parent, ..., LCA, ...]
  // Child of LCA in Source's path is at index (distSource - 1)
  // Child of LCA in Target's path is at index (distTarget - 1)
  
  const rootSource = pathSource[distSource - 1];
  const rootTarget = pathTarget[distTarget - 1];
  
  // Compare branches
  // If roots are siblings, who is older?
  const rootSourceYear = getBirthYear(rootSource);
  const rootTargetYear = getBirthYear(rootTarget);
  
  // Default: compare years. If same year (twins?) or unknown, treat as equal (rare).
  // Is Source's branch older (Senior)?
  const isSourceBranchSenior = rootSourceYear < rootTargetYear; 
  // If years are equal/unknown, maybe fallback to id or index if we had child order. 
  // For now assume birth year is enough.

  // 1. Same Generation (Siblings / Cousins)
  if (genDiff === 0) {
    let isOlder = false;
    
    // If same parents (Siblings)
    if (distSource === 1 && distTarget === 1) {
        isOlder = sourceYear < targetYear;
        const relation = 'Anh chị em ruột';
        if (isOlder) {
             return { 
                 sourceCallTarget: target.gender === 'Nam' ? 'Em trai' : 'Em gái', 
                 targetCallSource: source.gender === 'Nam' ? 'Anh' : 'Chị',
                 relationship: relation
             };
        } else {
             return {
                 sourceCallTarget: source.gender === 'Nam' ? 'Anh' : 'Chị',
                 targetCallSource: target.gender === 'Nam' ? 'Em trai' : 'Em gái',
                 relationship: relation
             };
        }
    } else {
        // Cousins (Anh chị em họ)
        // Seniority depends on Branch (Con bác > Con chú)
        // If isSourceBranchSenior -> Source is "Anh/Chị" regardless of age
        // BUT: In some regions, age matters more. 
        // Standard VN Family Tree Logic: "Con chú con bác" -> Con bác là Anh/Chị.
        
        const relation = 'Anh chị em họ';
        if (isSourceBranchSenior) {
            // Source is senior (Con bác)
            return {
                sourceCallTarget: target.gender === 'Nam' ? 'Em' : 'Em',
                targetCallSource: source.gender === 'Nam' ? 'Anh' : 'Chị',
                relationship: relation + ' (Bạn là vai trên/cành trên)'
            };
        } else {
            // Source is junior (Con chú)
            return {
                sourceCallTarget: source.gender === 'Nam' ? 'Anh' : 'Chị',
                targetCallSource: target.gender === 'Nam' ? 'Em' : 'Em',
                relationship: relation + ' (Bạn là vai dưới/cành dưới)'
            };
        }
    }
  }

  // 2. Different Generations
  
  // Source is Higher Generation (Uncle/Aunt/Granduncle...)
  if (genDiff > 0) {
      const generations = genDiff; // 1, 2, ...
      
      if (generations === 1) {
          // Bác/Chú/Cô/Dì vs Cháu
          // If Source is Senior Branch (child of older sibling of Target's parent) -> Bác
          // If Source is Junior Branch -> Chú (Nam) / Cô (Nữ - father's side) / Dì (mother's side - ignore for now, assume paternal tree mainly)
          
          let termSource = '';
          if (isSourceBranchSenior) {
              termSource = 'Bác';
          } else {
              termSource = source.gender === 'Nam' ? 'Chú' : 'Cô';
          }
          
          return {
              sourceCallTarget: 'Cháu',
              targetCallSource: termSource,
              relationship: 'Chú/Bác/Cô - Cháu'
          };
      }
      
      if (generations === 2) {
          // Ông/Bà (collateral)
           const termSource = source.gender === 'Nam' ? 'Ông' : 'Bà'; // Often "Ông bác/Ông chú"
           return {
               sourceCallTarget: 'Cháu',
               targetCallSource: termSource,
               relationship: 'Ông/Bà - Cháu (họ)'
           };
      }
      
      if (generations >= 3) {
           return {
               sourceCallTarget: 'Chắt/Chút',
               targetCallSource: 'Cụ/Kỵ',
               relationship: 'Cụ/Kỵ - Chắt/Chút'
           };
      }
  }

  // Source is Lower Generation (Nephew/Niece...)
  if (genDiff < 0) {
       const generations = -genDiff; // 1, 2...
       
       if (generations === 1) {
           // Source is Cháu, Target is Bác/Chú/Cô
           // If Target is Senior Branch -> Target is Bác
           let termTarget = '';
           // Note: isSourceBranchSenior compares roots. 
           // If Source is junior branch relative to Target? No, wait.
           // isSourceBranchSenior = rootSource < rootTarget.
           // Here Source is lower gen. rootSource is "ancestor of Source".
           // rootTarget is "ancestor of Target" (or Target itself if distTarget=1? No, distTarget=0 handled).
           
           // Actually, for Uncle/Nephew:
           // LCA -> Child A (Ancestor of Source)
           //     -> Child B (Target)
           // Compare Child A vs Child B (Target).
           
           // Wait, distTarget must be > 0 for collateral.
           // If distTarget == 1 (Target is sibling of Source's ancestor).
           // Then rootTarget IS Target.
           // So we compare rootSource (Source's ancestor) vs Target.
           
           // If Target (rootTarget) is older than rootSource => Target is Bác.
           // If Target is younger => Target is Chú/Cô.
           // So: if rootTargetYear < rootSourceYear => Target is Senior.
           // which is !isSourceBranchSenior.
           
           if (!isSourceBranchSenior) { // Target is older/senior
               termTarget = 'Bác';
           } else {
               termTarget = target.gender === 'Nam' ? 'Chú' : 'Cô';
           }
           
           return {
               sourceCallTarget: termTarget,
               targetCallSource: 'Cháu',
               relationship: 'Chú/Bác/Cô - Cháu'
           };
       }
       
       if (generations === 2) {
           const termTarget = target.gender === 'Nam' ? 'Ông' : 'Bà';
           return {
               sourceCallTarget: termTarget,
               targetCallSource: 'Cháu',
               relationship: 'Ông/Bà - Cháu (họ)'
           };
       }
       
       if (generations >= 3) {
           return {
               sourceCallTarget: 'Cụ/Kỵ',
               targetCallSource: 'Chắt',
               relationship: 'Cụ/Kỵ - Chắt'
           };
       }
  }

  return {
    sourceCallTarget: 'Người thân',
    targetCallSource: 'Người thân',
    relationship: 'Họ hàng xa',
  };
};
