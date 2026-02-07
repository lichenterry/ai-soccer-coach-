# AI Soccer Coach

## Project Overview
An AI-powered soccer coach for kids ages 10-14 that provides encouragement, helps with pre-game nerves, and analyzes game footage.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database/Auth**: Supabase
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **AI**: Claude API (Anthropic)

## Target Users
- Primary: Kids ages 10-14 who play recreational/club soccer in a competitive tier wanting to make it to the next level
- Secondary: Parents who want to support their kids' development

## Core Features (Priority Order)

### Phase 1: Pre-Game Coach (MVP - Week 1)
- **Hype Mode**: Energizing, fun encouragement before games or when motivation is low
- **Calm Mode**: Breathing exercises, visualization, focus techniques for pre-game nerves
- Simple text-based chat interface
- Age-appropriate language and tone

### Phase 2: Voice Mode (Week 2)
- Text-to-speech so the coach can "talk" to them
- Especially useful right before games when they can't read a screen

### Phase 3: Game Analysis (Week 3-4)
- Upload game video clips
- AI analyzes and provides feedback on:
  - What they did well (always lead with positives)
  - 1-2 specific things to work on
  - Drill suggestions for improvement
- Keep feedback encouraging, not critical

## Design Principles
- **Encouraging first**: Always lead with positives, never harsh criticism
- **Age-appropriate**: Language and UI suitable for 10-14 year olds
- **Fun**: Use emojis, celebrate small wins, make it feel like a supportive friend
- **Quick**: Kids have short attention spans—get to the point fast
- **Mobile-first**: They'll use this on phones and iPads, likely right before games

## Coding Preferences
- Use TypeScript for all files
- Prefer Server Components where possible
- Keep components small and focused (< 100 lines)
- Use Tailwind for styling, no separate CSS files
- Store API keys in environment variables
- Write comments for complex logic

## File Structure
```
/app
  /page.tsx           # Landing/home page
  /coach
    /page.tsx         # Main coach interface
  /api
    /chat/route.ts    # AI chat endpoint
/components
  /CoachChat.tsx      # Main chat interface
  /ModeSelector.tsx   # Hype vs Calm mode toggle
  /MessageBubble.tsx  # Chat message display
/lib
  /ai.ts              # Claude API integration
  /prompts.ts         # System prompts for different modes
/public
  /images             # Soccer-themed assets
```

## AI Coach Personalities

### Hype Mode Prompt
The coach should be:
- Energetic and enthusiastic but not overly enthusiastic 
- Use sports metaphors and pump-up language
- Reference their favorite players/teams if known; if not known, ask them
- Short, punchy messages
- Use emojis liberally 🔥⚽💪

### Calm Mode Prompt
The coach should be:
- Warm and reassuring
- Guide through breathing exercises
- Use visualization techniques
- Steady, calming tone
- Remind them it's just a game and they've got this

## Environment Variables Needed
```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Current Status
- [x] Project initialized
- [x] Basic Next.js setup
- [x] Landing page
- [x] Coach chat interface
- [x] Hype mode working
- [x] Calm mode working
- [x] Deployed to Vercel

## Build in Public Plan
Each weekend session = 1 LinkedIn post about what was built/learned

---

## Notes for Claude Code
- This is a side project with ~3 hours/week available
- Prioritize shipping over perfection
- Keep the MVP minimal—we can add features later
- The creator is a PM with basic coding knowledge, not a senior dev
- When in doubt, choose the simpler implementation
