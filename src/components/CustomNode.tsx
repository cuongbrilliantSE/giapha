import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { User, ChevronRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { FamilyMember } from '../types';
import useStore from '../store';

const CustomNode = ({ data }: NodeProps) => {
  const member = data as unknown as FamilyMember;
  const isMale = member.gender === 'Nam';
  const isHighlighted = member.highlighted;
  const { collapsedIds, toggleCollapse } = useStore();
  const isCollapsed = collapsedIds.includes(member.id);
  const hasChildren =
    (member as any).hasChildrenOriginal === true ||
    (Array.isArray(member.children) && member.children.length > 0);

  return (
    <div
      className={clsx(
        'px-4 py-2 shadow-md rounded-md border-2 bg-white w-[260px] relative transition-all duration-300',
        isMale ? 'border-blue-500' : 'border-pink-500',
        isHighlighted && 'ring-4 ring-yellow-400 scale-105 shadow-xl'
      )}
    >
      {hasChildren && (
        <button
          onClick={(e) => { e.stopPropagation(); toggleCollapse(member.id); }}
          className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-1.5 shadow hover:bg-gray-50 z-10"
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-gray-400" />
      <Handle
        id="spouse-left"
        type="target"
        position={Position.Left}
        className="!bg-transparent !border-0"
        style={{
          top: '50%',
          left: '-8px',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          pointerEvents: 'none',
        }}
      />
      
      <div className="flex items-start">
        <div className={clsx(
          'rounded-full p-2 mr-2 flex-shrink-0',
          isMale ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
        )}>
          <User size={16} />
        </div>
        <div className="whitespace-normal break-words">
          <div className="text-sm font-bold" title={member.name}>{member.name}</div>
          <div className="text-xs text-gray-500">
            {member.birthDate} {member.deathDate ? `- ${member.deathDate}` : ''}
          </div>
        </div>
      </div>
      
      {/* Không render icon trái tim trên node để chỉ hiển thị 1 trái tim giữa cạnh */}

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-gray-400" />
      <Handle
        id="spouse-right"
        type="source"
        position={Position.Right}
        className="!bg-transparent !border-0"
        style={{
          top: '50%',
          right: '-8px',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default memo(CustomNode);
