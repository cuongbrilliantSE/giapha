import React from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import useStore from '../store';

const SearchFilter = () => {
  const { 
    searchTerm, 
    setSearchTerm,
    searchResults,
    currentSearchIndex,
    nextSearchResult,
    prevSearchResult
  } = useStore();

  return (
    <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded-lg shadow-md flex items-center gap-2 border border-gray-200 w-80">
      <Search size={20} className="text-gray-400 shrink-0" />
      <input
        type="text"
        placeholder="Tìm kiếm thành viên..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="outline-none flex-1 min-w-0 text-sm text-gray-700"
      />
      {searchResults.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0 border-l pl-2">
          <span className="font-medium whitespace-nowrap min-w-[30px] text-center">
            {currentSearchIndex + 1} / {searchResults.length}
          </span>
          <div className="flex flex-col gap-0.5">
            <button 
                onClick={prevSearchResult}
                className="hover:bg-gray-100 rounded p-0.5 transition-colors"
                title="Kết quả trước"
            >
                <ChevronUp size={14} />
            </button>
            <button 
                onClick={nextSearchResult}
                className="hover:bg-gray-100 rounded p-0.5 transition-colors"
                title="Kết quả tiếp theo"
            >
                <ChevronDown size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
