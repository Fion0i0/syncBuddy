
import React, { useState, useEffect } from 'react';
import { User, ScheduleEvent } from '../types';
import { EVENT_SUGGESTIONS, VIP_MEMBERS } from '../constants';
import { X, Trash2, CheckCircle2, Users, FileText, Check, Plus, Minus, CalendarPlus2 } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, selectedUserIds: string[]) => void;
  onDelete?: () => void;
  activeUser: User;
  initialTitle?: string;
  initialDescription?: string;
  dateStr: string;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen, onClose, onSave, onDelete, activeUser, initialTitle = '', initialDescription = '', dateStr
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [scheduleRows, setScheduleRows] = useState<{ time: string; event: string }[]>([
    { time: '', event: '' }
  ]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([activeUser.id]);

  // Parse initial description to extract time-event rows
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setSelectedUserIds([activeUser.id]);

      // Parse existing description for time|event rows
      if (initialDescription) {
        const lines = initialDescription.split('\n').filter(line => line.trim());
        const parsedRows: { time: string; event: string }[] = [];

        lines.forEach(line => {
          const match = line.match(/^(\d{1,2}:\d{2})\s*\|\s*(.*)$/);
          if (match) {
            parsedRows.push({ time: match[1], event: match[2] });
          }
        });

        if (parsedRows.length > 0) {
          setScheduleRows(parsedRows);
        } else {
          // Fallback: put entire description as first event
          setScheduleRows([{ time: '', event: initialDescription }]);
        }
      } else {
        setScheduleRows([{ time: '', event: '' }]);
      }
    }
  }, [isOpen, initialTitle, initialDescription, activeUser.id]);

  // Combine rows into description
  const getFullDescription = () => {
    return scheduleRows
      .filter(row => row.time || row.event)
      .map(row => `${row.time || '--:--'} | ${row.event}`)
      .join('\n');
  };

  const updateRow = (index: number, field: 'time' | 'event', value: string) => {
    setScheduleRows(prev => prev.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    ));
  };

  const addRow = () => {
    setScheduleRows(prev => [...prev, { time: '', event: '' }]);
  };

  const removeRow = (index: number) => {
    if (scheduleRows.length > 1) {
      setScheduleRows(prev => prev.filter((_, i) => i !== index));
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    setSelectedUserIds(VIP_MEMBERS.map(m => m.id));
  };

  const selectNone = () => {
    setSelectedUserIds([]);
  };

  if (!isOpen) return null;

  const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="p-4 md:p-6 text-white flex justify-between items-center flex-shrink-0" style={{ backgroundColor: activeUser.color }}>
          <div>
            <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
              {initialTitle ? (
                <img src={activeUser.icon} alt={activeUser.name} className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover" />
              ) : (
                <CalendarPlus2 className="w-5 h-5 md:w-6 md:h-6" />
              )}
              {initialTitle ? 'Edit Event' : '有咩搞作?'}
            </h3>
            <p className="text-[11px] md:text-xs opacity-80 font-medium">{formattedDate}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto flex-1">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Title</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Birthday Dinner, Late Shift..."
              className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 text-sm md:text-base"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-slate-400" />
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detailed Info</label>
              </div>
              <button
                onClick={addRow}
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="w-3 h-3" />
                Add Row
              </button>
            </div>

            {/* Table Header */}
            <div className="flex gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              <div className="w-20 md:w-25">Time</div>
              <div className="flex-1">Event</div>
              <div className="w-6"></div>
            </div>

            {/* Table Rows */}
            <div className="space-y-2 max-h-[120px] md:max-h-[160px] overflow-y-auto">
              {scheduleRows.map((row, index) => (
                <div key={index} className="flex gap-1.5 md:gap-2 items-center">
                  <input
                    type="time"
                    value={row.time}
                    onChange={(e) => updateRow(index, 'time', e.target.value)}
                    className="w-21 md:w-25 px-1.5 md:px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 text-xs md:text-sm"
                  />
                  <input
                    type="text"
                    value={row.event}
                    onChange={(e) => updateRow(index, 'event', e.target.value)}
                    placeholder="Event description..."
                    className="flex-1 px-2 md:px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 text-xs md:text-sm"
                  />
                  <button
                    onClick={() => removeRow(index)}
                    disabled={scheduleRows.length === 1}
                    className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 md:space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Tags</label>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {EVENT_SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setTitle(`${s.icon} ${s.label}`)}
                  className="px-2 md:px-3 py-1 md:py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-[11px] md:text-xs font-bold text-slate-500 transition-all border border-transparent hover:border-indigo-100"
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3 text-slate-400" />
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">漢奸撚</label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                  All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={selectNone}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
                >
                  None
                </button>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1.5 md:gap-2">
              {VIP_MEMBERS.map((member) => {
                const isSelected = selectedUserIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleUser(member.id)}
                    className={`flex flex-col items-center p-1.5 md:p-2 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-indigo-100 ring-2 ring-indigo-500'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={member.icon}
                        alt={member.name}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ${
                          isSelected ? '' : 'opacity-50'
                        }`}
                      />
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                          <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <p className={`text-[9px] md:text-[10px] font-semibold mt-1 ${
                      isSelected ? 'text-indigo-700' : 'text-slate-400'
                    }`}>{member.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 md:gap-3 pt-3 md:pt-4 border-t border-slate-100 flex-shrink-0">
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold transition-colors flex-1 text-sm md:text-base"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            <button
              onClick={() => onSave(title || 'Busy', getFullDescription(), selectedUserIds)}
              disabled={selectedUserIds.length === 0}
              className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-white font-bold transition-all shadow-lg flex-[2] hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              style={{ backgroundColor: activeUser.color }}
            >
              <CheckCircle2 className="w-4 h-4" />
              {initialTitle ? 'Update' : `Add for ${selectedUserIds.length}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
