import React, { useMemo } from 'react';
import { X, Users, ArrowRight } from 'lucide-react';
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

  const result = useMemo(() => {
    if (!sourceMember || !targetMember) return null;
    const allMembers = flattenTree(rawMembers);
    return calculateRelationship(sourceMember, targetMember, allMembers);
  }, [sourceMember, targetMember, rawMembers]);

  if (!comparisonMode) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-2xl border border-blue-100 w-full max-w-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users size={20} />
          <h3 className="font-semibold text-lg">Tính quan hệ họ hàng</h3>
        </div>
        <button 
          onClick={resetComparison}
          className="p-1 hover:bg-blue-700 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6">
        {!sourceMember ? (
          <p className="text-gray-500 text-center">Vui lòng chọn người đầu tiên</p>
        ) : !targetMember ? (
          <div className="text-center space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg inline-block text-blue-800 font-medium px-6">
              Người 1: {sourceMember.name}
            </div>
            <p className="text-gray-600 animate-pulse">
              Hãy chọn người thứ 2 trên cây gia phả...
            </p>
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
