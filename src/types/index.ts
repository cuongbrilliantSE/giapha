export interface RawSheetRow {
  id: string;
  fullName: string;
  birthDate: string;
  deathDate: string;
  gender: string;
  parentId: string;
  generation: string;
  additionalInfo: string;
  spouseId?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  birthDate: string;
  deathDate?: string;
  gender: 'Nam' | 'Nữ';
  parentId?: string;
  generation: number;
  additionalInfo: string;
  children?: FamilyMember[];
  spouseId?: string;
  highlighted?: boolean;
}
