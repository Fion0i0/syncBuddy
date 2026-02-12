# SquadSync 🎯

**SquadSync** is a modern, collaborative scheduling platform designed for friend groups who want to stay in sync without the chaos of messy group chats. Whether you're planning a complex holiday trip, coordinating group dinners, or just checking who's free for a weekend hangout, SquadSync makes it visual, fun, and intelligent.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Tech](https://img.shields.io/badge/tech-React%20%7C%20TypeScript%20%7C%20Tailwind-teal)
![Status](https://img.shields.io/badge/status-Ready%20to%20Launch-success)

## ✨ Features

### 📅 Calendar & Events
- **Shared Timeline**: Visual calendar showing everyone's availability at a glance
- **Individual Events**: Create personal events with custom titles and detailed notes
- **Group Events** 👨‍👩‍👧‍👦: One-click group event creation that marks all selected members as busy
- **Birthday Tracking** 🎂: Automatic birthday events for all VIP members
- **Event Descriptions**: Add detailed notes to any event for extra context

### 👥 User Experience
- **VIP Members**: Each friend has a unique profile picture and color theme
- **User Switching**: Easily switch between users to view/edit their schedules
- **Auto User Switch on Edit**: Automatically switches to event owner when editing
- **Hover Tooltips (Desktop)**: See event details with user-colored backgrounds on hover
- **Event Preview (Mobile)**: Tap once to preview, tap again to edit

### 📱 Mobile Support
- **Fully Responsive**: Optimized layouts for both desktop and mobile devices
- **Mobile User Selector**: Horizontal scrollable user picker for quick switching
- **Floating AI Button**: Access the AI Assistant via a floating action button
- **Touch-Friendly**: Tap-based interactions optimized for mobile use

### 🤖 AI Assistant (人工智障仔)
- **Natural Language Queries**: Ask questions in English or Cantonese
- **Schedule-Aware**: AI understands all events, group activities, and detailed notes
- **Powered by Google Gemini 2.0 Flash**: Fast and intelligent responses
- **Note**: AI service may be temporarily unavailable

### 💾 Data Persistence
- **Local Storage**: All events automatically saved to browser storage
- **No Account Required**: Works entirely offline with no sign-up needed
- **Privacy First**: Your data stays on your device

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Integration**: @google/genai (Gemini 2.0 Flash)
- **Build Tool**: Vite
- **Fonts**: Plus Jakarta Sans

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm installed

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/squadsync.git
   cd squadsync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables (Optional)**
   Create a `.env.local` file for AI features:
   ```env
   VITE_GEMINI_API_KEY=your-api-key-here
   ```
   > Note: The app works without an API key, but AI Assistant will show "Sor9ry 我跌咗個腦。用唔到住"

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🔑 API Key Setup (Optional)

To enable the AI Assistant feature, you need a Google Gemini API key:

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" and create a new key
4. Copy the API key
5. Create a `.env.local` file in the project root
6. Add: `VITE_GEMINI_API_KEY=your-api-key-here`
7. Restart the dev server

> **Note**: The AI Assistant is currently experiencing issues. Even with a valid API key, it may show error messages.

## 📁 Project Structure

```
squadsync/
├── components/
│   ├── AIAssistant.tsx         # Desktop AI chat panel
│   ├── Calendar.tsx            # Main calendar view
│   ├── EventModal.tsx          # Event creation/editing modal
│   ├── MobileAIButton.tsx      # Floating AI button for mobile
│   ├── MobileUserSelector.tsx  # Mobile user picker
│   └── Sidebar.tsx             # Desktop sidebar with users
├── services/
│   └── geminiService.ts        # AI integration (Gemini API)
├── utils/
│   └── birthdayUtils.ts        # Birthday event generation
├── constants.tsx               # VIP members, colors, suggestions
├── types.ts                    # TypeScript interfaces
├── App.tsx                     # Main application component
└── index.html
```

## 🎨 Customization

### Adding VIP Members
Edit `constants.tsx` to add your friends:
```typescript
export const VIP_MEMBERS: User[] = [
  {
    id: 'u1',
    name: 'Your Name',
    icon: '/path/to/image.png',
    color: '#86efac',
    birthday: '01-15',
    birthYear: 1995
  },
  // Add more members...
];
```

### Changing Group Event Icon
The group event icon 👨‍👩‍👧‍👦 can be changed in:
- `components/Calendar.tsx` (line 100, 141)
- `App.tsx` (line 48, 70)
- `services/geminiService.ts` (line 26)

## 📝 Known Issues

- **AI Assistant**: Currently not functioning properly. Shows "Sor9ry 我跌咗個腦。用唔到住" error message.
- All other features are working as expected.

## 🤝 Contributing

This is a personal project for friend group scheduling. Feel free to fork and customize for your own squad!

## 📄 License

MIT License - feel free to use and modify for your own purposes.

---

**Made with ❤️ for organized friendship** | *SquadSync v1.0.0*
