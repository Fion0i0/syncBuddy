
import React, { useState } from 'react';
import { SHORT_DAYS, VIP_MEMBERS } from '../constants';
import { User, ScheduleEvent } from '../types';
import { Calendar as CalendarIcon, PlusCircle, ChevronLeft, ChevronRight, Users, X, Edit3 } from 'lucide-react';
import { EventModal } from './EventModal';

interface CalendarProps {
  users: User[];
  events: ScheduleEvent[];
  activeUserId: string;
  onAddEvent: (event: ScheduleEvent) => void;
  onRemoveEvent: (id: string) => void;
  onUpdateEvent: (id: string, title: string, description?: string, newDate?: string, newEndDate?: string) => void;
  onSelectUser: (userId: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ users, events, activeUserId, onAddEvent, onRemoveEvent, onUpdateEvent, onSelectUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalState, setModalState] = useState<{ isOpen: boolean; dateStr: string; eventId?: string }>({
    isOpen: false,
    dateStr: '',
  });
  const [previewEvent, setPreviewEvent] = useState<{ event: ScheduleEvent & { isGroupDisplay?: boolean }; dateStr: string } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleCellClick = (dateStr: string, existingEventId?: string) => {
    // Close preview if open
    setPreviewEvent(null);

    // Don't allow editing birthday events
    if (existingEventId && existingEventId.startsWith('birthday-')) {
      return;
    }

    // If editing an existing event, switch to the event owner
    if (existingEventId) {
      const eventToEdit = events.find(e => e.id === existingEventId);
      if (eventToEdit && eventToEdit.userId !== activeUserId) {
        onSelectUser(eventToEdit.userId);
      }
    }

    setModalState({
      isOpen: true,
      dateStr,
      eventId: existingEventId
    });
  };

  const handleEventClick = (event: ScheduleEvent & { isGroupDisplay?: boolean }, dateStr: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Birthday events are read-only - only show preview, never allow edit
    const isBirthday = event.id.startsWith('birthday-');

    if (isBirthday) {
      // Only toggle preview for birthday events, never open edit modal
      if (previewEvent && previewEvent.event.id === event.id) {
        setPreviewEvent(null);
      } else {
        setPreviewEvent({ event, dateStr });
      }
      return;
    }

    // For regular events: if already previewed, open edit modal
    if (previewEvent && previewEvent.event.id === event.id) {
      setPreviewEvent(null);
      handleCellClick(dateStr, event.id);
    } else {
      // Show preview
      setPreviewEvent({ event, dateStr });
    }
  };

  const openEditFromPreview = () => {
    if (previewEvent) {
      const { event, dateStr } = previewEvent;
      setPreviewEvent(null);
      handleCellClick(dateStr, event.id);
    }
  };

  const handleSaveEvent = (title: string, description: string, selectedUserIds: string[], newStartDate?: string, newEndDate?: string) => {
    if (modalState.eventId) {
      onUpdateEvent(modalState.eventId, title, description, newStartDate, newEndDate);
    } else {
      const isGroup = selectedUserIds.length > 1;
      const finalTitle = isGroup && !title.includes('👨‍👩‍👧‍👦') ? `👨‍👩‍👧‍👦 ${title}` : title;
      const startDate = newStartDate || modalState.dateStr;

      selectedUserIds.forEach(userId => {
        onAddEvent({
          id: (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`),
          userId,
          date: startDate,
          endDate: newEndDate || undefined,
          title: finalTitle,
          description,
          status: 'busy'
        });
      });
    }
    setModalState({ ...modalState, isOpen: false });
  };

  const handleDeleteEvent = () => {
    if (modalState.eventId) {
      onRemoveEvent(modalState.eventId);
    }
    setModalState({ ...modalState, isOpen: false });
  };

  const getDateEvents = (dateStr: string) => events.filter(e => e.date <= dateStr && (e.endDate || e.date) >= dateStr);
  const activeUser = VIP_MEMBERS.find(u => u.id === activeUserId)!;

  const renderDays = () => {
    const dayElements = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayElements.push(<div key={`empty-${ i }`} className="h-20 md:h-32 bg-slate-50/20 border-r border-b border-slate-100"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = getDateEvents(dateStr);
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
      
      const groupEventTitles = new Set<string>();
      const renderedEvents: (ScheduleEvent & { isGroupDisplay?: boolean })[] = [];

      dayEvents.forEach(e => {
        if (e.title.includes('👨‍👩‍👧‍👦')) {
          if (!groupEventTitles.has(e.title)) {
            groupEventTitles.add(e.title);
            renderedEvents.push({ ...e, isGroupDisplay: true });
          }
        } else {
          renderedEvents.push(e);
        }
      });

      const isActiveUserBusy = dayEvents.some(e => e.userId === activeUserId);

      dayElements.push(
        <div
          key={dateStr}
          onClick={() => handleCellClick(dateStr)}
          className={`h-20 md:h-32 p-1 md:p-1.5 border-r border-b border-slate-100 flex flex-col group cursor-pointer transition-all relative ${
            isActiveUserBusy ? 'bg-indigo-50/10' : 'bg-white hover:bg-slate-50/50'
          }`}
        >
          <div className="flex justify-between items-start mb-0.5 md:mb-1 px-0.5 md:px-1 pointer-events-none">
            <span className={`text-[9px] md:text-[11px] font-extrabold ${isToday ? 'bg-slate-700 text-white w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>
              {d}
            </span>
            {renderedEvents.length > 0 && (
              <span className="text-[5px] md:text-[7px] font-black text-slate-300 tracking-tighter">
                {renderedEvents.length} record{renderedEvents.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div
            className="flex-1 overflow-y-auto md:overflow-visible hide-scrollbar flex flex-wrap gap-0.5 md:gap-1 content-start p-0.5 md:p-1"
            onClick={(e) => {
              // Ensure clicking the empty space in the scroll area still triggers the cell click
              if (e.target === e.currentTarget) {
                e.stopPropagation();
                handleCellClick(dateStr);
              }
            }}
          >
            {renderedEvents.map(event => {
              const user = VIP_MEMBERS.find(u => u.id === event.userId);
              const isOwner = event.userId === activeUserId;
              const isGroup = event.isGroupDisplay;
              const isBirthday = event.id.startsWith('birthday-');

              // Render birthday as text with cake icon
              if (isBirthday) {
                return (
                  <div
                    key={event.id}
                    onClick={(e) => handleEventClick(event, dateStr, e)}
                    className="w-full px-1 py-0.5 rounded text-[7px] md:text-[10px] font-semibold cursor-pointer hover:brightness-95 transition-all"
                    style={{
                      backgroundColor: user?.color ? `${user.color}40` : '#fce7f3',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: user?.color || '#fbcfe8',
                      color: user?.color || '#be185d'
                    }}
                  >
                    🎂 {event.title}
                  </div>
                );
              }

              const isMultiDay = event.endDate && event.endDate !== event.date;
              const durationDays = isMultiDay
                ? Math.round((new Date(event.endDate + 'T00:00:00').getTime() - new Date(event.date + 'T00:00:00').getTime()) / 86400000) + 1
                : 0;

              return (
                <div
                  key={event.id}
                  onClick={(e) => handleEventClick(event, dateStr, e)}
                  className={`relative inline-block group/event cursor-pointer`}
                >
                  {isGroup ? (
                    <div className="w-6 h-6 md:w-10 md:h-10 bg-slate-800 rounded-full flex items-center justify-center shadow-sm ring-1 ring-slate-900">
                      <Users className="w-3 h-3 md:w-5 md:h-5 text-white" />
                    </div>
                  ) : (
                    <img
                      src={user?.icon}
                      alt={user?.name}
                      className="w-6 h-6 md:w-10 md:h-10 rounded-full object-cover shadow-sm"
                      style={isOwner ? { boxShadow: `0 0 0 2px ${user?.color}` } : undefined}
                    />
                  )}
                  {/* Duration badge for multi-day events */}
                  {isMultiDay && (
                    <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[6px] md:text-[8px] font-black rounded-full w-3 h-3 md:w-4 md:h-4 flex items-center justify-center z-10">
                      {durationDays}d
                    </div>
                  )}
                  {/* Tooltip on hover - desktop only */}
                  <div
                    className="hidden md:block absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 text-white text-[10px] font-semibold rounded-md whitespace-nowrap opacity-0 group-hover/event:opacity-100 transition-opacity pointer-events-none z-10"
                    style={{ backgroundColor: isGroup ? '#1e293b' : (user?.color || '#1e293b') }}
                  >
                    {event.title}{isMultiDay ? ` (${durationDays}d)` : ''}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="rounded-full p-1 shadow-lg" style={{ backgroundColor: activeUser.color }}>
              <PlusCircle className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      );
    }

    return dayElements;
  };

  const selectedEvent = events.find(e => e.id === modalState.eventId);
  const selectedEventParticipants = selectedEvent && selectedEvent.title.includes('👨‍👩‍👧‍👦')
    ? events.filter(e => e.date === selectedEvent.date && e.title === selectedEvent.title).map(e => e.userId)
    : selectedEvent ? [selectedEvent.userId] : undefined;

  return (
    <>
      <div className="flex-1 flex flex-col bg-white overflow-hidden shadow-lg md:shadow-2xl rounded-xl md:rounded-3xl m-2 md:m-4 border border-slate-100">
        <div className="p-3 md:p-6 border-b bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-slate-700 rounded-lg text-white">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-800">{monthName} {year}</h2>
              <p className="text-[10px] md:text-xs text-slate-500">Shared Activity Timeline</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center bg-white rounded-lg md:rounded-xl border border-slate-200 p-0.5 md:p-1 shadow-sm">
              <button onClick={prevMonth} className="p-1.5 md:p-2 hover:bg-slate-50 rounded-md md:rounded-lg transition-colors text-slate-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-200 mx-0.5 md:mx-1"></div>
              <button onClick={nextMonth} className="p-1.5 md:p-2 hover:bg-slate-50 rounded-md md:rounded-lg transition-colors text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 bg-slate-50/30 border-b border-slate-100">
          {SHORT_DAYS.map((day) => (
            <div key={day} className="py-1.5 md:py-2 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {day}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <div className="grid grid-cols-7 border-l border-t border-slate-100">
            {renderDays()}
          </div>
        </div>

        {/* Footer legend - hidden on mobile */}
        <div className="flex p-3 md:p-4 bg-white border-t border-slate-100 justify-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Open Date</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: activeUser.color }}></div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">Your Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded bg-slate-800 text-white">
              <Users className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">Group Events</span>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={modalState.isOpen}
        dateStr={selectedEvent?.date || modalState.dateStr}
        activeUser={activeUser}
        initialTitle={selectedEvent?.title}
        initialDescription={selectedEvent?.description}
        initialEndDate={selectedEvent?.endDate}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSave={handleSaveEvent}
        onDelete={modalState.eventId ? handleDeleteEvent : undefined}
      />

      {/* Event Preview Popup */}
      {previewEvent && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setPreviewEvent(null)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl p-4 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const event = previewEvent.event;
              const user = VIP_MEMBERS.find(u => u.id === event.userId);
              const isGroup = event.isGroupDisplay;
              const isBirthday = event.id.startsWith('birthday-');
              const formattedStartDate = new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              });
              const formattedDate = (event.endDate && event.endDate !== event.date)
                ? `${formattedStartDate} → ${new Date(event.endDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
                : formattedStartDate;

              // Find all participants for group events (same title on same date)
              const participants = isGroup
                ? events
                    .filter(e => e.date === event.date && e.title === event.title)
                    .map(e => VIP_MEMBERS.find(m => m.id === e.userId))
                    .filter(Boolean)
                : [];

              return (
                <>
                  <div className="flex items-start gap-3 mb-3">
                    {isGroup ? (
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <img
                        src={user?.icon}
                        alt={user?.name}
                        className="w-12 h-12 rounded-full object-cover shadow-sm"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 truncate">{event.title}</h3>
                      <p className="text-sm text-slate-500">
                        {isGroup ? 'Group Event' : user?.name} • {formattedDate}
                      </p>
                    </div>
                    <button
                      onClick={() => setPreviewEvent(null)}
                      className="p-1.5 hover:bg-slate-100 rounded-full"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  {/* Show participants for group events */}
                  {isGroup && participants.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Participants</p>
                      <div className="flex flex-wrap gap-2">
                        {participants.map((member) => (
                          <div key={member!.id} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-full">
                            <img
                              src={member!.icon}
                              alt={member!.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-xs font-semibold text-slate-600">{member!.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.description && (
                    <div className="bg-slate-50 rounded-xl p-3 mb-3 max-h-32 overflow-y-auto">
                      <p className="text-sm text-slate-600 whitespace-pre-line">{event.description}</p>
                    </div>
                  )}

                  {/* Only show Edit button for non-birthday events */}
                  {!isBirthday && (
                    <button
                      onClick={openEditFromPreview}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold"
                      style={{ backgroundColor: user?.color || '#1e293b' }}
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Event
                    </button>
                  )}

                  {/* Show read-only message for birthday events */}
                  {isBirthday && (
                    <div className="w-full py-3 text-center text-sm text-slate-400 font-medium">
                      🎂 Birthday events are read-only
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
};
