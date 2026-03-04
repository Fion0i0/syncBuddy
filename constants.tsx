
import React from 'react';
import { User, ScheduleEvent } from './types';

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const VIP_MEMBERS: User[] = [
  { id: 'u1', name: 'Fion', icon: '/VIP/Fion.png', color: '#a5f7c3', birthday: '11-22', birthYear: 1993 },
  { id: 'u2', name: 'Sally', icon: '/VIP/Sally.png', color: '#dbcd37', birthday: '08-30', birthYear: 1995 },
  { id: 'u3', name: 'Eun', icon: '/VIP/Eun.png', color: '#7393b3', birthday: '03-05', birthYear: 1994 },
  { id: 'u4', name: 'Kaka', icon: '/VIP/Kaka.png', color: '#ffd2d2', birthday: '02-05', birthYear: 1996 },
  { id: 'u5', name: 'Long²', icon: '/VIP/Long².png', color: '#318f40', birthday: '04-29', birthYear: 1993 },
  { id: 'u6', name: 'Han', icon: '/VIP/Han.png', color: '#35Bdcc', birthday: '09-05' },
  { id: 'u7', name: 'Jake', icon: '/VIP/Jake.png', color: '#2279f2', birthday: '12-06', birthYear: 1991 },
  { id: 'u8', name: 'Vennie', icon: '/VIP/Vennie.png', color: '#9272bb', birthday: '09-23', birthYear: 1993 },
  { id: 'u9', name: 'Rex', icon: '/VIP/Rex.png', color: '#5f5a9c', birthday: '05-30', birthYear: 1994 },

];

export const DEFAULT_USERS: User[] = VIP_MEMBERS;

// Empty initial events - ready for launch
export const INITIAL_HOLIDAY_EVENTS: ScheduleEvent[] = [];

export const COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#facc15',
  '#a3e635', '#4ade80', '#34d399', '#2dd4bf',
  '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8',
  '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'
];

export const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐣', '🦄', '🐝', '🐙', '🦖'];

export const TAIWAN_HOLIDAYS = new Set([
  // 2026
  '2026-01-01','2026-02-14','2026-02-15','2026-02-16','2026-02-17','2026-02-18','2026-02-19','2026-02-20','2026-02-21','2026-02-22',
  '2026-02-27','2026-02-28','2026-03-01',
  '2026-04-03','2026-04-04','2026-04-05','2026-04-06',
  '2026-05-01','2026-05-02','2026-05-03',
  '2026-06-19','2026-06-20','2026-06-21',
  '2026-09-25','2026-09-26','2026-09-27','2026-09-28',
  '2026-10-09','2026-10-10','2026-10-11',
  '2026-10-24','2026-10-25','2026-10-26',
  '2026-12-25','2026-12-26','2026-12-27',
  // 2027
  '2027-01-01',
  '2027-02-05','2027-02-06','2027-02-07','2027-02-08','2027-02-09','2027-02-10',
  '2027-02-28','2027-03-01',
  '2027-04-03','2027-04-05',
  '2027-05-01',
  '2027-06-09',
  '2027-09-15',
  '2027-10-10','2027-10-11',
]);

export const EVENT_SUGGESTIONS = [
  { label: '台中', icon: '📍' },
  { label: '打牌', icon: '🀄' },
  { label: '飛回老家', icon: '✈️' },
  { label: '飛返來', icon: '✈️' },
  { label: '開Party', icon: '🎉' },  
  { label: 'BoardGame', icon: '🃏' },
  { label: '教會聚會', icon: '⛪' }
];
