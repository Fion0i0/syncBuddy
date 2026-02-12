
import React from 'react';
import { User } from '../types';
import { VIP_MEMBERS } from '../constants';
import { Coffee } from 'lucide-react';

interface SidebarProps {
  users: User[];
  activeUserId: string;
  onSelectUser: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ users, activeUserId, onSelectUser }) => {
  return (
    <div className="w-64 glass-card border-r flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Coffee className="w-6 h-6 text-slate-700" />
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">得間飲茶</h1>
        </div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">漢奸撚們</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {VIP_MEMBERS.map(vip => {
            const isActive = activeUserId === vip.id;
            return (
              <button
                key={vip.id}
                onClick={() => onSelectUser(vip.id)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'hover:bg-white hover:shadow-sm text-slate-600'
                }`}
                style={isActive ? { backgroundColor: vip.color } : undefined}
              >
                <img
                  src={vip.icon}
                  alt={vip.name}
                  className={`w-14 h-14 rounded-full object-cover shadow-sm ${
                    isActive ? 'ring-2 ring-white' : ''
                  }`}
                />
                <p className={`font-semibold text-xs mt-2 ${
                  isActive ? 'text-white' : 'text-slate-700'
                }`}>{vip.name}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-slate-50/50 border-t">
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-xs font-medium text-slate-600">Local Session</p>
          </div>
        </div>
      </div>
    </div>
  );
};
