import React, { useMemo } from 'react';
import { X, User, Calendar, Info, MapPin } from 'lucide-react';
import useStore from '../store';
import clsx from 'clsx';
import { flattenTree } from '../utils/dataTransform';

const MemberDetail = () => {
  const { selectedMember, setSelectedMember, rawMembers, setComparisonMode, setSourceMember } = useStore();

  const father = useMemo(() => {
    if (!selectedMember?.parentId) return null;
    const allMembers = flattenTree(rawMembers);
    return allMembers.find(m => m.id === selectedMember.parentId);
  }, [selectedMember, rawMembers]);

  if (!selectedMember) return null;

  const isMale = selectedMember.gender === 'Nam';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className={clsx(
          "p-6 flex justify-between items-start",
          isMale ? "bg-blue-50" : "bg-pink-50"
        )}>
          <div className="flex items-center gap-4">
            <div className={clsx(
              "w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-sm",
              isMale ? "bg-blue-200 text-blue-700" : "bg-pink-200 text-pink-700"
            )}>
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedMember.name}</h2>
              <span className={clsx(
                "px-2 py-0.5 rounded-full text-xs font-medium border",
                isMale ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-pink-100 text-pink-700 border-pink-200"
              )}>
                Thế hệ thứ {selectedMember.generation}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedMember(null)}
            className="p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="text-gray-400" size={20} />
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Ngày sinh - Ngày mất</p>
              <p>{selectedMember.birthDate} {selectedMember.deathDate ? `- ${selectedMember.deathDate}` : ''}</p>
            </div>
          </div>

          {father && (
            <div className="flex items-center gap-3 text-gray-700">
              <User className="text-gray-400" size={20} />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Cha</p>
                <p>{father.name}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-gray-700">
            <Info className="text-gray-400" size={20} />
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Thông tin thêm</p>
              <p className="whitespace-pre-wrap">{selectedMember.additionalInfo || 'Chưa có thông tin'}</p>
            </div>
          </div>

          {/* Add more fields here if available */}
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
          <button
            onClick={() => {
              setSourceMember(selectedMember);
              setComparisonMode(true);
              setSelectedMember(null);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors shadow-sm"
          >
            Tính quan hệ
          </button>
          <button
            onClick={() => setSelectedMember(null)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
