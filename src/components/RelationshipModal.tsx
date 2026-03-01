import React, { useMemo, useState, useRef, useEffect } from 'react';
import { X, Users, ArrowRight, Search } from 'lucide-react';
import useStore from '../store';
import { calculateRelationship } from '../utils/relationship';
import { flattenTree } from '../utils/dataTransform';

const RelationshipModal = () => {
  const { 
    comparisonMode, 
    sourceMember, 
    targetMember, 
    resetComparison, 
    rawMembers,
    setTargetMember
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset search state when modal opens or source changes
  useEffect(() => {
    if (comparisonMode) {
      setSearchTerm('');
      setIsDropdownOpen(false);
    }
  }, [comparisonMode, sourceMember]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allMembers = useMemo(() => flattenTree(rawMembers), [rawMembers]);

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return allMembers;
    const lowerTerm = searchTerm.toLowerCase();
    return allMembers.filter(member => 
      member.name.toLowerCase().includes(lowerTerm) && 
      member.id !== sourceMember?.id
    );
  }, [allMembers, searchTerm, sourceMember]);

  const result = useMemo(() => {
    if (!sourceMember || !targetMember) return null;
    return calculateRelationship(sourceMember, targetMember, allMembers);
  }, [sourceMember, targetMember, allMembers]);

  if (!comparisonMode) return null;

  const handleSelectMember = (member: any) => {
    setTargetMember(member);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="fixed top-4 md:top-20 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-2xl border border-blue-100 w-[95%] md:w-full max-w-lg animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center rounded-t-xl">
        <div className="flex items-center gap-2">
          <Users size={20} />
          <h3 className="font-semibold text-lg">Tính quan hệ họ hàng</h3>
        </div>
        <button 
          onClick={resetComparison}
          className="p-1 hover:bg-blue-700 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="p-4 md:p-6">
        {!sourceMember ? (
          <p className="text-gray-500 text-center py-4">Vui lòng chọn người đầu tiên trên cây gia phả</p>
        ) : !targetMember ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-blue-50 p-3 rounded-lg inline-block text-blue-800 font-medium px-6 mb-4 shadow-sm border border-blue-100">
                Người 1: {sourceMember.name}
              </div>
              <p className="text-gray-600 mb-2 font-medium">
                Chọn người thứ 2 để so sánh:
              </p>
            </div>
            
            <div className="relative w-full" ref={dropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên để tìm kiếm..."
                  className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-[160px] overflow-y-auto z-[100]">
                  {filteredMembers.length > 0 ? (
                    <ul className="py-2 divide-y divide-gray-100">
                      {filteredMembers.map((member) => (
                        <li 
                          key={member.id}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-colors"
                          onClick={() => handleSelectMember(member)}
                        >
                          <span className="font-medium text-gray-800 group-hover:text-blue-700 text-base">{member.name}</span>
                          <span className="text-sm text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{member.birthDate?.split('/').pop() || '?'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      Không tìm thấy kết quả phù hợp
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <span className="font-medium text-gray-900">{sourceMember.name}</span>
              <ArrowRight size={16} />
              <span className="font-medium text-gray-900">{targetMember.name}</span>
            </div>

            {result ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm text-gray-500 uppercase font-medium mb-1">Mối quan hệ</p>
                  <p className="text-2xl font-bold text-green-700">{result.relationship}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{sourceMember.name} gọi {targetMember.name} là</p>
                    <p className="text-lg font-semibold text-gray-800">{result.sourceCallTarget}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{targetMember.name} gọi {sourceMember.name} là</p>
                    <p className="text-lg font-semibold text-gray-800">{result.targetCallSource}</p>
                  </div>
                </div>
              </div>
            ) : (
               <p className="text-center text-gray-500">Không tìm thấy mối quan hệ (có thể do lỗi dữ liệu hoặc quá xa).</p>
            )}
            
            <div className="flex justify-center pt-2">
                 <button 
                    onClick={() => setTargetMember(null)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                 >
                    Chọn người khác
                 </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationshipModal;
