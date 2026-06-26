# Coach Fabian

**An AI soccer coach for the parents of 10–15 year-old competitive youth athletes.**

Live at **[coachfabian.app](https://coachfabian.app)** — no signup, free to try.

## What it is

Coach Fabian is a side project I'm building in public — three small product surfaces that wrap a single AI personality:

| Surface | What it does | When you'd use it |
|---|---|---|
| **Pre-Game Coach** | Chat with Coach Fabian in Hype mode or Calm mode, with voice playback | The 30 minutes before kickoff |
| **Game Analysis** | Upload a 2-minute clip, get a coach-style breakdown of what your kid did well + one thing to work on | The drive home after a match |
| **Recruit Prep** | 7-question readiness check + a personalized chat about the college soccer timeline | Anytime you're staring down recruiting and don't know where to start |

It exists because the parents I know of competitive youth players want to support their kid without becoming the over-coaching parent on the sideline — and most of the existing tools are either generic AI chat with no soccer context, or paid recruiting services charging $3K to tell you what's freely available.

## Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS, custom design system (mint accent on a dark stage, Inter typography)
- **AI:** Anthropic Claude Sonnet for chat + vision-based game analysis
- **TTS:** OpenAI `tts-1` ("fable" voice)
- **Speech-to-text:** Web Speech API (browser native, no server)
- **Analytics:** PostHog — instrumented before any distribution work, not after
- **Hosting:** Vercel

## Run locally

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY and OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000.

**Required env vars:**
- `ANTHROPIC_API_KEY` — powers chat + video analysis
- `OPENAI_API_KEY` — powers TTS

## Build in public

This is a ~3 hour/week project. Each weekend session becomes one LinkedIn post about what shipped, what broke, or what I learned about distribution + analytics. If you're a PM or indie builder, that's where the design decisions and post-mortems live.

If you're a soccer parent, the best thing you can do is try it at [coachfabian.app](https://coachfabian.app) and tell me what didn't work.
