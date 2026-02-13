
export interface User {
  id: string;
  name: string;
  icon: string; // Emoji or character
  color: string; // Hex color code (e.g., '#FF5733')
  birthday?: string; // MM-DD format (e.g., '11-22')
  birthYear?: number; // Year of birth (optional, for age calculation)
}

export interface ScheduleEvent {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format (start date)
  endDate?: string; // YYYY-MM-DD format (end date for multi-day events)
  title: string;
  description?: string; // Detailed notes (time, location, train info, etc.)
  status: 'busy' | 'available';
}

export interface AIRecommendation {
  date: string;
  reasoning: string;
}
