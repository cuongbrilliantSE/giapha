import React from 'react';
import { Search } from 'lucide-react';
import useStore from '../store';

const SearchFilter = () => {
  const { searchTerm, setSearchTerm } = useStore();

  return (
    <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded-lg shadow-md flex items-center gap-2 border border-gray-200 w-64">
      <Search size={20} className="text-gray-400" />
      <input
        type="text"
        placeholder="Tìm kiếm thành viên..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="outline-none w-full text-sm text-gray-700"
      />
    </div>
  );
};

export default SearchFilter;
