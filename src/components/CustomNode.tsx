import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { User, Heart } from 'lucide-react';
import clsx from 'clsx';
import { FamilyMember } from '../types';

const CustomNode = ({ data }: NodeProps<FamilyMember>) => {
  const isMale = data.gender === 'Nam';
  const isHighlighted = data.highlighted;

  return (
    <div
      className={clsx(
        'px-4 py-2 shadow-md rounded-md border-2 bg-white w-[200px] relative transition-all duration-300',
        isMale ? 'border-blue-500' : 'border-pink-500',
        isHighlighted && 'ring-4 ring-yellow-400 scale-105 shadow-xl'
      )}
    >
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
      
      <div className="flex items-center">
        <div className={clsx(
          'rounded-full p-2 mr-2 flex-shrink-0',
          isMale ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
        )}>
          <User size={16} />
        </div>
        <div className="overflow-hidden">
          <div className="text-sm font-bold truncate" title={data.name}>{data.name}</div>
          <div className="text-xs text-gray-500 truncate">
            {data.birthDate} {data.deathDate ? `- ${data.deathDate}` : ''}
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
