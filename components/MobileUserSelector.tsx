
import React from 'react';
import { User } from '../types';
import { VIP_MEMBERS } from '../constants';

interface MobileUserSelectorProps {
  activeUserId: string;
  onSelectUser: (id: string) => void;
}

export const MobileUserSelector: React.FC<MobileUserSelectorProps> = ({ activeUserId, onSelectUser }) => {
  const activeUser = VIP_MEMBERS.find(u => u.id === activeUserId);

  return (
    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-2 px-1">
      {VIP_MEMBERS.map(vip => {
        const isActive = activeUserId === vip.id;
        return (
          <button
            key={vip.id}
            onClick={() => onSelectUser(vip.id)}
            className={`flex-shrink-0 flex flex-col items-center p-2 rounded-xl transition-all ${
              isActive ? 'shadow-lg' : 'bg-white/80'
            }`}
            style={isActive ? { backgroundColor: vip.color } : undefined}
          >
            <img
              src={vip.icon}
              alt={vip.name}
              className={`w-10 h-10 rounded-full object-cover shadow-sm ${
                isActive ? 'ring-2 ring-white' : ''
              }`}
            />
            <p className={`text-[10px] font-semibold mt-1 ${
              isActive ? 'text-white' : 'text-slate-600'
            }`}>{vip.name}</p>
          </button>
        );
      })}
    </div>
  );
};
