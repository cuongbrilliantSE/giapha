import axios from 'axios';
import { CONFIG } from '../config';
import { RawSheetRow } from '../types';

export const fetchFamilyData = async (): Promise<RawSheetRow[]> => {
  const mockData: RawSheetRow[] = [
    {
      id: '1',
      fullName: 'Nguyễn Văn A',
      birthDate: '01/01/1950',
      deathDate: '',
      gender: 'Nam',
      parentId: '',
      generation: '1',
      additionalInfo: 'Tổ tiên đời thứ 1',
      spouseId: '2',
    },
    {
      id: '2',
      fullName: 'Trần Thị B',
      birthDate: '02/02/1952',
      deathDate: '',
      gender: 'Nữ',
      parentId: '',
      generation: '1',
      additionalInfo: 'Phối ngẫu của ông A',
      spouseId: '1',
    },
    {
      id: '3',
      fullName: 'Nguyễn Văn C',
      birthDate: '03/03/1975',
      deathDate: '',
      gender: 'Nam',
      parentId: '1',
      generation: '2',
      additionalInfo: 'Con trai cả',
      spouseId: '4',
    },
    {
      id: '4',
      fullName: 'Phạm Thị D',
      birthDate: '04/04/1977',
      deathDate: '',
      gender: 'Nữ',
      parentId: '',
      generation: '2',
      additionalInfo: 'Vợ của C',
      spouseId: '3',
    },
    {
      id: '5',
      fullName: 'Nguyễn Thị E',
      birthDate: '05/05/2000',
      deathDate: '',
      gender: 'Nữ',
      parentId: '3',
      generation: '3',
      additionalInfo: 'Con gái lớn',
      spouseId: '',
    },
    {
      id: '6',
      fullName: 'Nguyễn Văn F',
      birthDate: '06/06/2005',
      deathDate: '',
      gender: 'Nam',
      parentId: '3',
      generation: '3',
      additionalInfo: 'Con trai út',
      spouseId: '',
    },
  ];

  const normalizeToRows = (payload: any): RawSheetRow[] => {
    if (!payload) return [];
    if (Array.isArray(payload?.values)) {
      const rows = payload.values.slice(1) as string[][];
      return rows.map((row) => ({
        id: row[0] || '',
        fullName: row[1] || '',
        birthDate: row[2] || '',
        deathDate: row[3] || '',
        gender: row[4] || '',
        parentId: row[5] || '',
        generation: row[6] || '',
        additionalInfo: row[7] || '',
        spouseId: row[8] || '',
        displayOrder: row[9] ? parseInt(row[9]) : undefined,
      }));
    }
    if (Array.isArray(payload)) {
      return payload.map((o: any) => ({
        id: String(o.id ?? o.ID ?? ''),
        fullName: String(o.fullName ?? o.name ?? o['Họ tên đầy đủ'] ?? ''),
        birthDate: String(o.birthDate ?? o['Ngày sinh'] ?? ''),
        deathDate: String(o.deathDate ?? o['Ngày mất'] ?? ''),
        gender: String(o.gender ?? o['Giới tính'] ?? ''),
        parentId: String(o.parentId ?? o['ID cha/mẹ'] ?? ''),
        generation: String(o.generation ?? o['Cấp thế hệ'] ?? ''),
        additionalInfo: String(o.additionalInfo ?? o['Thông tin thêm'] ?? ''),
        spouseId: String(o.spouseId ?? o['ID vợ/chồng'] ?? ''),
        displayOrder: (o.displayOrder !== undefined && o.displayOrder !== null && o.displayOrder !== '') 
          ? parseInt(String(o.displayOrder)) 
          : (o['Thứ tự hiển thị'] !== undefined && o['Thứ tự hiển thị'] !== null && o['Thứ tự hiển thị'] !== '')
            ? parseInt(String(o['Thứ tự hiển thị']))
            : undefined,
      }));
    }
    if (Array.isArray(payload?.rows)) {
      return normalizeToRows({ values: payload.rows });
    }
    return [];
  };

  if (CONFIG.APPS_SCRIPT_URL) {
    try {
      const url = new URL(CONFIG.APPS_SCRIPT_URL);
      url.searchParams.set('t', Date.now().toString());
      const resp = await axios.get(url.toString(), {
        withCredentials: false,
        responseType: 'text', // robust against servers sending text/html
        transformResponse: [(data) => data], // prevent axios auto-parse
      });
      let payload: any = resp.data;
      if (typeof payload === 'string') {
        const trimmed = payload.trim();
        if (trimmed.startsWith('<') && trimmed.includes('Sign in - Google Accounts')) {
          throw new Error('Apps Script Web App yêu cầu đăng nhập. Hãy triển khai với quyền truy cập “Anyone” hoặc bật CORS.');
        }
        try {
          payload = JSON.parse(trimmed);
        } catch {
          // Try to eval-like JSON if Apps Script returns single quotes (rare)
          throw new Error('Apps Script Web App không trả JSON hợp lệ. Vui lòng cập nhật doGet() để trả JSON.');
        }
      }
      const rows = normalizeToRows(payload);
      if (rows.length > 0) return rows;
    } catch (e) {
      console.warn('Apps Script Web App fetch failed:', e);
    }
  }

  // Không dùng Google Sheets API nữa; nếu Apps Script URL không khả dụng, trả mock
  console.warn('Apps Script URL không khả dụng hoặc lỗi. Dùng mock data.');
  return mockData;
};
