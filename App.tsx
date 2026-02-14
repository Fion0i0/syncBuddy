
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Calendar } from './components/Calendar';
import { AIAssistant } from './components/AIAssistant';
import { MobileUserSelector } from './components/MobileUserSelector';
import { MobileAIButton } from './components/MobileAIButton';
import { User, ScheduleEvent } from './types';
import { DEFAULT_USERS, INITIAL_HOLIDAY_EVENTS, VIP_MEMBERS } from './constants';
import { generateMultiYearBirthdayEvents } from './utils/birthdayUtils';
import { Coffee } from 'lucide-react';
import { isFirebaseAvailable } from './services/firebase';
import {
  subscribeToEvents,
  addEvent,
  updateEvents,
  removeEvents,
} from './services/firebaseEventService';

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
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const seededRef = useRef(false);

  // Generate birthday events for VIP members
  const birthdayEvents = useMemo(() => generateMultiYearBirthdayEvents(VIP_MEMBERS), []);

  // Combine user events with birthday events
  const allEvents = useMemo(() => {
    const userEvents = events.filter(e => e.id && !e.id.startsWith('birthday-'));
    return [...birthdayEvents, ...userEvents];
  }, [events, birthdayEvents]);

  // Firebase real-time subscription
  useEffect(() => {
    if (!isFirebaseAvailable()) return;

    const unsubscribe = subscribeToEvents(
      (firebaseEvents) => {
        // One-time migration: seed Firebase from localStorage if empty
        if (firebaseEvents.length === 0 && !seededRef.current) {
          seededRef.current = true;
          const savedEvents = localStorage.getItem('syncbuddy_events');
          if (savedEvents) {
            try {
              const localEvents: ScheduleEvent[] = JSON.parse(savedEvents);
              const nonBirthdayEvents = localEvents.filter(e => !e.id.startsWith('birthday-'));
              if (nonBirthdayEvents.length > 0) {
                Promise.all(nonBirthdayEvents.map(e => addEvent(e))).catch(console.error);
                return;
              }
            } catch { /* ignore */ }
          }
        }

        setEvents(firebaseEvents);
        setFirebaseConnected(true);
        localStorage.setItem('syncbuddy_events', JSON.stringify(firebaseEvents));
      },
      (error) => {
        console.error('Firebase subscription error, falling back to localStorage:', error);
        setFirebaseConnected(false);
      }
    );

    return unsubscribe;
  }, []);

  // Save to localStorage (only when Firebase is not connected)
  useEffect(() => {
    if (!firebaseConnected) {
      localStorage.setItem('syncbuddy_events', JSON.stringify(events));
    }
  }, [events, firebaseConnected]);

  const handleAddEvent = (event: ScheduleEvent) => {
    if (firebaseConnected) {
      addEvent(event).catch((err) => {
        console.error('Firebase addEvent failed, applying locally:', err);
        setEvents(prev => [...prev, event]);
      });
    } else {
      setEvents(prev => [...prev, event]);
    }
  };

  const handleUpdateEvent = (id: string, title: string, description?: string, newDate?: string, newEndDate?: string, selectedUserIds?: string[]) => {
    const targetEvent = events.find(e => e.id === id);
    if (!targetEvent) return;

    const wasGroupEvent = targetEvent.title.includes('👨‍👩‍👧‍👦');

    // Find all existing participant events (same date + title for group events, or just the single event)
    const existingGroupEvents = wasGroupEvent
      ? events.filter(e => e.date === targetEvent.date && e.title === targetEvent.title)
      : [targetEvent];
    const existingUserIds = existingGroupEvents.map(e => e.userId);

    // Use provided selectedUserIds, or fall back to existing participants
    const newUserIds = selectedUserIds || existingUserIds;
    const isNowGroup = newUserIds.length > 1;

    // Ensure group emoji prefix is correct
    const baseTitle = title.replace(/^👨‍👩‍👧‍👦\s*/, '');
    const finalTitle = isNowGroup ? `👨‍👩‍👧‍👦 ${baseTitle}` : baseTitle;

    const updates: Partial<ScheduleEvent> = { title: finalTitle, description };
    if (newDate) updates.date = newDate;
    updates.endDate = newEndDate || '';

    // Determine which participants to add, remove, keep
    const toRemove = existingGroupEvents.filter(e => !newUserIds.includes(e.userId));
    const toKeep = existingGroupEvents.filter(e => newUserIds.includes(e.userId));
    const toAdd = newUserIds.filter(uid => !existingUserIds.includes(uid));

    if (firebaseConnected) {
      // Update existing participants
      if (toKeep.length > 0) {
        const updateMap: Record<string, Partial<ScheduleEvent>> = {};
        toKeep.forEach(e => { updateMap[e.id] = updates; });
        updateEvents(updateMap).catch(err => console.error('Firebase updateEvents failed:', err));
      }

      // Remove dropped participants
      if (toRemove.length > 0) {
        removeEvents(toRemove.map(e => e.id)).catch(err => console.error('Firebase removeEvents failed:', err));
      }

      // Add new participants
      toAdd.forEach(userId => {
        addEvent({
          id: (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`),
          userId,
          date: newDate || targetEvent.date,
          ...((newEndDate || targetEvent.endDate) ? { endDate: newEndDate || targetEvent.endDate } : {}),
          title: finalTitle,
          description: description || '',
          status: 'busy'
        }).catch(err => console.error('Firebase addEvent failed:', err));
      });
    } else {
      setEvents(prev => {
        let result = prev;

        // Remove dropped participants
        if (toRemove.length > 0) {
          const removeIds = new Set(toRemove.map(e => e.id));
          result = result.filter(e => !removeIds.has(e.id));
        }

        // Update remaining participants
        const keepIds = new Set(toKeep.map(e => e.id));
        result = result.map(e =>
          keepIds.has(e.id) ? { ...e, ...updates, ...(newEndDate ? { endDate: newEndDate } : {}) } : e
        );

        // Add new participants
        toAdd.forEach(userId => {
          result = [...result, {
            id: (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`),
            userId,
            date: newDate || targetEvent.date,
            ...((newEndDate || targetEvent.endDate) ? { endDate: newEndDate || targetEvent.endDate } : {}),
            title: finalTitle,
            description: description || '',
            status: 'busy' as const
          }];
        });

        return result;
      });
    }
  };

  const handleRemoveEvent = (id: string) => {
    if (firebaseConnected) {
      const targetEvent = events.find(e => e.id === id);
      if (!targetEvent) return;

      const isGroupEvent = targetEvent.title.includes('👨‍👩‍👧‍👦');

      if (isGroupEvent) {
        const idsToRemove = events
          .filter(e => e.date === targetEvent.date && e.title === targetEvent.title)
          .map(e => e.id);
        removeEvents(idsToRemove).catch((err) => {
          console.error('Firebase removeEvents failed:', err);
        });
      } else {
        removeEvents([id]).catch((err) => {
          console.error('Firebase removeEvents failed:', err);
        });
      }
    } else {
      setEvents(prev => {
        const targetEvent = prev.find(e => e.id === id);
        if (!targetEvent) return prev;

        const isGroupEvent = targetEvent.title.includes('👨‍👩‍👧‍👦');

        if (isGroupEvent) {
          return prev.filter(e =>
            !(e.date === targetEvent.date && e.title === targetEvent.title)
          );
        } else {
          return prev.filter(e => e.id !== id);
        }
      });
    }
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
      <div className="md:hidden glass-card border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-slate-700" />
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">得間飲茶</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">漢奸撚們</p>
            </div>
          </div>
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
