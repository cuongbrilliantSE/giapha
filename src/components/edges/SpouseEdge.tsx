import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@xyflow/react';
import { Heart } from 'lucide-react';

function SpouseEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, style } = props;
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: '#ef4444', strokeDasharray: '6 3', ...style }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'none',
          }}
        >
          <div className="bg-red-100 p-1 rounded-full text-red-500 border border-red-200 shadow-sm">
            <Heart size={12} />
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(SpouseEdge);
