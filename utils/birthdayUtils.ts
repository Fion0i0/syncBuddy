import { User, ScheduleEvent } from '../types';

/**
 * Get ordinal suffix for a number (st, nd, rd, th)
 */
const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) return 'ˢᵗ';
  if (j === 2 && k !== 12) return 'ⁿᵈ';
  if (j === 3 && k !== 13) return 'ʳᵈ';
  return 'ᵗʰ';
};

/**
 * Generate birthday events for all users for a given year
 */
export const generateBirthdayEvents = (users: User[], year: number): ScheduleEvent[] => {
  const birthdayEvents: ScheduleEvent[] = [];

  users.forEach(user => {
    if (user.birthday) {
      const [month, day] = user.birthday.split('-');
      const dateStr = `${year}-${month}-${day}`;

      // Calculate age if birth year is available
      const age = user.birthYear ? year - user.birthYear : null;
      const ageText = age ? ` ${age}${getOrdinalSuffix(age)}` : '';

      birthdayEvents.push({
        id: `birthday-${user.id}-${year}`,
        userId: user.id,
        date: dateStr,
        title: `${user.name}${ageText} B-day`,
        description: user.birthYear ? `Born ${user.birthYear}` : 'Birthday',
        status: 'busy'
      });
    }
  });

  return birthdayEvents;
};

/**
 * Generate birthday events for current year and next year
 */
export const generateMultiYearBirthdayEvents = (users: User[]): ScheduleEvent[] => {
  const currentYear = new Date().getFullYear();
  const events: ScheduleEvent[] = [];

  // Generate for current year and next year
  for (let year = currentYear; year <= currentYear + 1; year++) {
    events.push(...generateBirthdayEvents(users, year));
  }

  return events;
};
