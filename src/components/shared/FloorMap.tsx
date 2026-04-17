import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Incident, FloorPlan } from '@/types';

interface FloorMapProps {
  incidents: Incident[];
  activeFloor: number;
  onRoomClick?: (room: string) => void;
  showHeatmap?: boolean;
}

export default function FloorMap({ incidents, activeFloor, onRoomClick, showHeatmap }: FloorMapProps) {
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);

  useEffect(() => {
    fetch('/api/floorplan').then(res => res.json()).then(setFloorPlan);
  }, []);

  if (!floorPlan) return <div className="animate-pulse bg-white/5 w-full h-full rounded-3xl" />;

  const currentFloor = floorPlan.floors.find(f => f.number === activeFloor);
  const floorIncidents = incidents.filter(inc => inc.location.floor === activeFloor && inc.status !== 'resolved');

  return (
    <div className="relative w-full aspect-[4/3] bg-white/[0.02] rounded-3xl overflow-hidden border border-white/5">
      <svg viewBox="0 0 100 80" className="w-full h-full">
        {/* Simple Architectural Lines */}
        <line x1="5" y1="5" x2="95" y2="5" stroke="currentColor" strokeWidth="0.5" className="text-white/20" />
        <line x1="5" y1="75" x2="95" y2="75" stroke="currentColor" strokeWidth="0.5" className="text-white/20" />
        <line x1="5" y1="5" x2="5" y2="75" stroke="currentColor" strokeWidth="0.5" className="text-white/20" />
        <line x1="95" y1="5" x2="95" y2="75" stroke="currentColor" strokeWidth="0.5" className="text-white/20" />
        
        {/* Rooms */}
        {currentFloor?.rooms.map(room => (
          <g 
            key={room.id} 
            className="cursor-pointer group" 
            onClick={() => onRoomClick?.(room.id)}
          >
            <rect
              x={room.x - 10}
              y={room.y - 12}
              width={20}
              height={24}
              className="fill-white/[0.03] stroke-white/10 group-hover:fill-white/10 transition-colors"
            />
            <text
              x={room.x}
              y={room.y}
              textAnchor="middle"
              className="fill-white/20 text-[3px] font-mono group-hover:fill-white/60"
            >
              {room.id}
            </text>
          </g>
        ))}

        {/* Heatmap Layer */}
        {showHeatmap && incidents.map((inc, i) => (
          <radialGradient key={`grad-${i}`} id={`heat-${i}`}>
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.4)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
          </radialGradient>
        ))}
        {showHeatmap && incidents.map((inc, i) => (
          <circle
            key={`heat-circ-${i}`}
            cx={inc.location.x}
            cy={inc.location.y}
            r="15"
            fill={`url(#heat-${i})`}
          />
        ))}

        {/* Incident Markers */}
        {floorIncidents.map(inc => (
          <g key={inc.id} className="pointer-events-none">
            <motion.circle
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              cx={inc.location.x}
              cy={inc.location.y}
              r="2"
              className={inc.severity === 'critical' ? 'fill-red-500/50' : 'fill-orange-500/50'}
            />
            <circle
              cx={inc.location.x}
              cy={inc.location.y}
              r="1"
              className={inc.severity === 'critical' ? 'fill-red-500' : 'fill-orange-500'}
            />
          </g>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Crisis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Staff Unit</span>
        </div>
      </div>
    </div>
  );
}
