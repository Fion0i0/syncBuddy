
import { GoogleGenAI, Type } from "@google/genai";
import { User, ScheduleEvent } from "../types";

export const askScheduleAssistant = async (users: User[], events: ScheduleEvent[], query: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  
  const scheduleContext = events.map(e => {
    const user = users.find(u => u.id === e.userId);
    const detailInfo = e.description ? ` (Notes: ${e.description})` : "";
    const dateInfo = (e.endDate && e.endDate !== e.date) ? `from ${e.date} to ${e.endDate}` : `on ${e.date}`;
    return `${user?.name} (${user?.icon}) has an event: "${e.title}" ${dateInfo}${detailInfo}.`;
  }).join("\n");

  const prompt = `
    You are the "SquadSync Guru", an AI assistant for a group of friends using the SquadSync app.
    The users are: ${users.map(u => `${u.name} ${u.icon}`).join(", ")}.
    
    Current Schedule:
    ${scheduleContext}
    
    User Question: "${query}"
    
    Rules:
    - ALWAYS reply in Cantonese (廣東話). Use casual, natural Cantonese like chatting with friends.
    - Answer the question accurately based on the provided schedule.
    - If someone has an event, they are "busy". If they don't have an event on a date, they are "free".
    - Events starting with 👨‍👩‍👧‍👦 are "Group Events" where everyone is attending.
    - Be concise and friendly. Use the friends' emojis in your response.
    - Do NOT use markdown formatting (no **, no *, no bullet points). Just use plain text with line breaks.
    - If details like specific times, train numbers, or locations are provided in the (Notes: ...), use that information to answer specific questions.
    - If you don't know the answer or the date is outside the schedule, say so gracefully in Cantonese.
  `;

  const models = ['gemini-3-flash-preview', 'gemini-2.5-flash'];

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      return response.text || "I'm sorry, I couldn't process that request.";
    } catch (error) {
      console.error(`Model ${model} failed:`, error);
      if (model === models[models.length - 1]) {
        return "Sorry 我跌咗個腦。用唔到住";
      }
    }
  }

  return "Sorry 我跌咗個腦。用唔到住";
};

const AVAILABLE_ICONS = [
  'Plane', 'MapPin', 'PartyPopper', 'Dice5', 'Church', 'Utensils', 'Film',
  'Music', 'ShoppingBag', 'Gamepad2', 'Dumbbell', 'Beer', 'Coffee', 'Tent',
  'Mountain', 'Gift', 'Heart', 'BookOpen', 'Car', 'Train', 'Ship', 'Bike',
  'Camera', 'Palette', 'Mic', 'Trophy', 'Flame', 'Snowflake', 'Sun',
  'Moon', 'Star', 'Umbrella', 'Home', 'Building', 'Trees', 'Waves',
  'Scissors', 'Stethoscope', 'GraduationCap', 'Briefcase', 'Volleyball',
  'Pizza', 'IceCream', 'Cake', 'Baby', 'Dog', 'Cat', 'Fish', 'Bug',
  'Sparkles', 'Zap', 'Rocket', 'Crown', 'Gem', 'Theater', 'Clapperboard',
];

export const pickEventIcon = async (title: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

    const cleanTitle = title.replace(/^👨‍👩‍👧‍👦\s*/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Pick the single best icon for a group event titled "${cleanTitle}".
Available icons: ${AVAILABLE_ICONS.join(', ')}
Reply with ONLY the icon name, nothing else. Just one word.`,
      config: { temperature: 0 }
    });

    const picked = response.text?.trim() || '';
    if (AVAILABLE_ICONS.includes(picked)) {
      return picked;
    }
    return '';
  } catch (error) {
    console.error('Failed to pick event icon:', error);
    return '';
  }
};

