
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Calendar } from './components/Calendar';
import { AIAssistant } from './components/AIAssistant';
import { MobileUserSelector } from './components/MobileUserSelector';
import { MobileAIButton } from './components/MobileAIButton';
import { User, ScheduleEvent } from './types';
import { DEFAULT_USERS, INITIAL_HOLIDAY_EVENTS, VIP_MEMBERS } from './constants';
import { generateMultiYearBirthdayEvents } from './utils/birthdayUtils';

const App: React.FC = () => {
  const [users] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem('syncbuddy_users');
      if (!savedUsers) return DEFAULT_USERS;

      const parsed = JSON.parse(savedUsers);
      if (Array.isArray(parsed) && parsed.every(u => u.id && u.name)) {
        return parsed as User[];
      }
      return DEFAULT_USERS;
    } catch (error) {
      console.error('Failed to load users from localStorage:', error);
      return DEFAULT_USERS;
    }
  });
  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    try {
      const savedEvents = localStorage.getItem('syncbuddy_events');
      if (!savedEvents) return INITIAL_HOLIDAY_EVENTS;

      const parsed = JSON.parse(savedEvents);
      if (Array.isArray(parsed) && parsed.every(e => e.id && e.date && e.title)) {
        return parsed as ScheduleEvent[];
      }
      return INITIAL_HOLIDAY_EVENTS;
    } catch (error) {
      console.error('Failed to load events from localStorage:', error);
      return INITIAL_HOLIDAY_EVENTS;
    }
  });
  const [activeUserId, setActiveUserId] = useState<string>(DEFAULT_USERS[0].id);

  // Generate birthday events for VIP members
  const birthdayEvents = useMemo(() => generateMultiYearBirthdayEvents(VIP_MEMBERS), []);

  // Combine user events with birthday events
  const allEvents = useMemo(() => {
    // Filter out any old birthday events that user might have created manually
    const userEvents = events.filter(e => !e.id.startsWith('birthday-'));
    return [...userEvents, ...birthdayEvents];
  }, [events, birthdayEvents]);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('syncbuddy_events', JSON.stringify(events));
  }, [events]);

  const handleAddEvent = (event: ScheduleEvent) => {
    setEvents(prev => [...prev, event]);
  };

  const handleUpdateEvent = (id: string, title: string, description?: string) => {
    setEvents(prev => {
      const targetEvent = prev.find(e => e.id === id);
      if (!targetEvent) return prev;

      // Check if this is a group event (has 👨‍👩‍👧‍👦 in title)
      const isGroupEvent = targetEvent.title.includes('👨‍👩‍👧‍👦');

      if (isGroupEvent) {
        // Update all events with the same original title and date (group events)
        return prev.map(e =>
          (e.date === targetEvent.date && e.title === targetEvent.title)
            ? { ...e, title, description }
            : e
        );
      } else {
        // Update only the single event
        return prev.map(e => e.id === id ? { ...e, title, description } : e);
      }
    });
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(prev => {
      const targetEvent = prev.find(e => e.id === id);
      if (!targetEvent) return prev;

      // Check if this is a group event (has 👨‍👩‍👧‍👦 in title)
      const isGroupEvent = targetEvent.title.includes('👨‍👩‍👧‍👦');

      if (isGroupEvent) {
        // Remove all events with the same title and date (entire group event)
        return prev.filter(e =>
          !(e.date === targetEvent.date && e.title === targetEvent.title)
        );
      } else {
        // Remove only the single event
        return prev.filter(e => e.id !== id);
      }
    });
  };

  const activeUser = VIP_MEMBERS.find(u => u.id === activeUserId);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 overflow-hidden text-slate-900">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar
          users={users}
          activeUserId={activeUserId}
          onSelectUser={setActiveUserId}
        />
      </div>

      {/* Mobile Header with User Selector */}
      <div className="md:hidden bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-extrabold text-slate-800">SquadSync</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">as</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ backgroundColor: activeUser?.color }}>
              <img src={activeUser?.icon} alt={activeUser?.name} className="w-5 h-5 rounded-full object-cover" />
              <span className="text-xs font-bold text-white">{activeUser?.name}</span>
            </div>
          </div>
        </div>
        <MobileUserSelector
          activeUserId={activeUserId}
          onSelectUser={setActiveUserId}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Calendar
          users={users}
          events={allEvents}
          activeUserId={activeUserId}
          onAddEvent={handleAddEvent}
          onRemoveEvent={handleRemoveEvent}
          onUpdateEvent={handleUpdateEvent}
          onSelectUser={setActiveUserId}
        />
      </div>

      {/* AI Assistant - hidden on mobile */}
      <div className="hidden lg:block">
        <AIAssistant
          users={users}
          events={allEvents}
        />
      </div>

      {/* Mobile AI Assistant Button */}
      <MobileAIButton users={users} events={allEvents} />
    </div>
  );
};

export default App;
