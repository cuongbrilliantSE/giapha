import axios from 'axios';
import { CONFIG } from '../config';
import { RawSheetRow } from '../types';

const SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

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

  // Fallback to mock data if env not provided
  if (!CONFIG.GOOGLE_SHEETS_API_KEY || !CONFIG.SPREADSHEET_ID) {
    console.warn('Using mock family data because env variables are missing.');
    return mockData;
  }

  try {
    const range = 'Sheet1!A:I'; // Thêm cột I cho ID vợ/chồng
    const response = await axios.get(
      `${SHEETS_API_URL}/${CONFIG.SPREADSHEET_ID}/values/${range}?key=${CONFIG.GOOGLE_SHEETS_API_KEY}`
    );

    const values = response.data.values;
    if (!values || values.length === 0) {
      return [];
    }

    // Skip header row
    const rows = values.slice(1);

    return rows.map((row: string[]) => ({
      id: row[0] || '',
      fullName: row[1] || '',
      birthDate: row[2] || '',
      deathDate: row[3] || '',
      gender: row[4] || '',
      parentId: row[5] || '',
      generation: row[6] || '',
      additionalInfo: row[7] || '',
      spouseId: row[8] || '',
    }));
  } catch (error) {
    console.error('Error fetching data from Google Sheets, falling back to mock:', error);
    return mockData;
  }
};
