# Pitch — AI Soccer Coach

## Project Overview
Pitch is an AI soccer coach for the parents of competitive youth athletes (roughly 10–15 years old). Three surfaces today: a Pre-Game Coach chat (hype + calm), a Game Analysis upload-and-review flow, and a Recruit Prep readiness check that hands off to a recruitment-focused chat with Coach Fabian.

The product is fronted by **Coach Fabian**, a single AI personality the parent and player interact with across all three modes.

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS 3.4 with a custom design system (see Design System below)
- **AI**: Anthropic Claude (Sonnet) via `@anthropic-ai/sdk` for chat + video analysis
- **TTS**: OpenAI `tts-1` (voice model "fable") via the speech route
- **Speech-to-text**: Web Speech API (browser native, no server)
- **Database / Auth**: Supabase (provisioned, not yet wired into a feature)
- **Hosting**: Vercel

## Target Users
- **Primary**: Parents of 10–15 year-old athletes playing competitive club / travel / ECNL / MLS Next soccer who want to support their kid's development without becoming the over-coaching parent on the sideline.
- **Secondary**: The athletes themselves when they pick up the parent's phone — copy should still feel reasonable to a teenager, just not infantilising.

## Shipped surfaces

### 1. Home — `app/page.tsx`
Locked spec: `design-options-v7.html`. Dark stage background, animated soccer-ball hero, three feature chips. The "smart pick" is visually elevated (mint glow halo, animated gradient border, white circular arrow). Smart pick rotates based on `getLastUsed()`, with the Recruit chip also reading `progressLabel(getRecruitProgress())` so it shows "Step N of 7 · pick up where you left off" or "View your results · ask Coach Fabian" as appropriate.

### 2. Pre-Game Coach — `app/coach/page.tsx`, `components/CoachChat.tsx`
Locked spec: `design-options-v13.html`. Hype / Calm slide toggle, mint-glass slider, 🔥 emoji blooms from the bottom on activation, 😌 burst-then-breath. User message bubbles use `1.5px / rgba(110,231,183,0.55)` border for visibility on the dark stage. Voice mode (TTS auto-play) toggles from the header speaker icon.

### 3. Game Analysis — `app/analyze/page.tsx`
Locked spec: `design-options-v14.html`. Four stages on the same Stage background:
1. **Upload** — dashed mint drop zone (cloud-up icon)
2. **Details** — "How to spot them" text field + 2x2 position chip grid (selected uses smart-pick treatment)
3. **Processing** — soccer-ball spinner inside two concentric pulsing mint rings + glow halo; status text wired to the `extractFrames` progress callback
4. **Results** — coach-style header (avatar + name + clip metadata), single coach `MessageBubble` carrying the model's free-form analysis. (Future: structured "What worked" / "One thing to try" labeled bubbles once the prompt returns sections.)

Existing logic preserved across the redesign: `lib/video.ts` validation + frame extraction, `/api/analyze-video` call, voice playback, file-size + long-video warnings.

### 4. Recruit Prep — `app/recruit/page.tsx`, `app/recruit/chat/page.tsx`
Locked spec: `design-options-v15.html`. Unified flow rooted at `/recruit`:
- **Step 0** — Intro screen ("Where does your athlete stand?")
- **Steps 1–7** — One question per screen, 7-segment progress bar, chips auto-advance after a 300ms feedback delay, every change auto-saves to localStorage
- **Step 8** — Results: three labelled cards (Timeline mint / Realistic fit gold / Next 3 steps numbered) with share, retake, and `window.print()` Save-PDF
- **`/recruit/chat`** — chat handoff. Uses `CoachChat` with `forcedMode='recruit'`. Context banner above the messages quotes the parent's quiz summary (or nudges to take the check if not done).

`/quiz` is a server redirect to `/recruit` (keeps legacy share links working).

### Personalized recruit chat
When the parent asks a question in `/recruit/chat`, the page reads their answers fresh from localStorage at send time, ships them as `quizContext` in the `/api/chat` body, and the server formats them into a `PARENT'S READINESS CHECK` block appended to the recruit system prompt. Coach Fabian references the athlete's grade, position, GPA, club level, etc. without re-asking. The banner and the model context are kept fresh via `storage` and `pageshow` event listeners, so cross-tab quiz retakes and bfcache restores both produce up-to-date personalisation.

## Design System

All tokens live in `tailwind.config.ts`.

- **Brand accent**: `#6ee7b7` (named `pitch-mint`, full 50–900 scale). Used at varying alphas; the only colour the system needs.
- **Stage background**: layered gradient (`bg-pitch-stage` / `bg-pitch-stage-hero`). All Pitch surfaces share this so the user feels continuous environment.
- **Typography**: Inter via `next/font/google` (variable `--font-inter`). Weight 900 headlines, 700–800 UI, 500 body. Tight letter-spacing on big type (`-1.2px` to `-1.5px`).
- **Keyframes** (registered in Tailwind, used via `animate-*` utilities):
  - `ball-combo` — soccer-ball rotate + bob (5s loop) on the home hero
  - `slide-lr` — preview-only loop for the Hype/Calm toggle (production uses 350ms spring on tap)
  - `hype-bloom` — 🔥 grows up from `transform-origin: bottom center`
  - `calm-breath` — 😌 burst-then-breath
  - `typing-dot`, `status-pulse` — small chat affordances
  - `glow-pulse`, `shadow-breathe` — home-page ball halo + ground shadow
  - `s3-spin`, `s3-ring-pulse`, `s3-ring-pulse-delayed`, `s3-glow-pulse`, `border-shift`, `smart-glow` — Analyze stage 3 spinner + smart-pick chip
- **Pseudo-element effects** (in `app/globals.css`, can't be expressed cleanly with utilities): `.pitch-chip-smart` mint gradient border + halo, `.pitch-ball::before` for the emoji, `.pitch-avatar-mint`, `.pitch-mode-slider`, `.pitch-ball-3` (Analyze spinner variant).

## Coach personalities
System prompts live in `lib/prompts.ts`. The recruit prompt has a sentence at the top that tells Coach Fabian to use the `PARENT'S READINESS CHECK` block if it appears in the system context.

### Hype (Pre-Game)
Energetic, sports metaphors, short punchy messages, generous emojis (🔥⚽💪). Asks for favourite players/teams if not known.

### Calm (Pre-Game)
Warm, reassuring, breathing exercises, visualisation, steady tone.

### Recruit
Parent-first explanations (no jargon assumed), 7 questions of context (or whatever subset they've filled in), bulleted scannable answers, ends with a "Want to know more?" follow-up section.

### Analysis (Video review)
Lifts what the model can actually see in still frames (positioning, body shape, movement). Always 2–3 positives first, one focused improvement, one simple drill. Never lectures on things the frames can't show.

## File Structure
```
app/
  page.tsx                Home (v7)
  layout.tsx              Inter font, dark body bg
  globals.css             Pseudo-element utilities + Tailwind
  coach/page.tsx          Pre-Game Coach (renders CoachChat)
  analyze/page.tsx        Game Analysis flow (v14)
  recruit/page.tsx        Recruit unified flow (v15)
  recruit/chat/page.tsx   Recruit chat handoff (CoachChat + context banner)
  quiz/page.tsx           Server redirect → /recruit
  api/
    chat/route.ts         AI chat endpoint (accepts quizContext for recruit)
    speech/route.ts       OpenAI TTS proxy
    analyze-video/route.ts  Anthropic vision call for game analysis

components/
  Stage.tsx               Dark gradient wrapper
  BrandMark.tsx           Centered "PITCH" wordmark
  IconBox.tsx             Dark-glass icon container (default + mint accent)
  FeatureChip.tsx         Home-page chip (smart + plain variants)
  ModeToggle.tsx          Hype/Calm slide toggle
  MessageBubble.tsx       Coach + user variants
  CoachChat.tsx           The chat itself — used by /coach AND /recruit/chat
  StepDots.tsx            Generic n-segment progress indicator (Analyze)
  UploadZone.tsx          Dashed mint drop zone (Analyze stage 1)
  VoiceButton.tsx         Web Speech mic button (restyled, API unchanged)

lib/
  ai.ts                   Anthropic SDK wrapper, accepts extraSystemContext
  prompts.ts              System prompts (hype / calm / recruit / analysis)
  lastUsed.ts             Home-page smart-pick personalisation (localStorage)
  recruitProgress.ts      Quiz answers + step state (localStorage)
  recruitResults.ts       Decision tree → Timeline / Realistic fit / Next steps
  recruitContext.ts       Formats QuizAnswers into a system-prompt block
  video.ts                Browser-side frame extraction + file validation
  supabase.ts             Client (not yet used by a feature)
```

## Coding Preferences
- TypeScript everywhere
- Prefer Server Components when no client-only API is needed
- Components stay small and focused — extract once a pattern is used twice
- Tailwind utilities first; reach for `app/globals.css` only when a pseudo-element is unavoidable
- API keys via env vars, never in source
- Comment intent, not mechanics — say *why*, not *what*

## Environment Variables
```
ANTHROPIC_API_KEY=    # required — chat + video analysis
OPENAI_API_KEY=       # required — TTS via /api/speech
NEXT_PUBLIC_SUPABASE_URL=     # provisioned, unused
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Current Status

### Shipped
- [x] Home page redesigned to Pitch design system (v7)
- [x] Pre-Game Coach chat redesigned (v13) — Hype + Calm modes, voice TTS, mic input
- [x] Game Analysis flow redesigned (v14) — 4 stages, free-form coach response
- [x] Recruit Prep unified at `/recruit` (v15) — intro + 7-step quiz + results + chat
- [x] Quiz answers persisted to localStorage + surface as home-page chip sub-copy
- [x] Recruit chat receives parent's answers as model context (personalised replies)
- [x] Banner + model context are bfcache- and cross-tab-safe
- [x] `/quiz` → `/recruit` server redirect
- [x] Speaker icon for voice mode (replaces ambiguous headphones)
- [x] Voice-mode error surface (429 → "rate-limited or out of credits")

### Backlog (rough priority)
- [ ] Structured "What worked" / "One thing to try" sections in Analyze results — needs `analyze-video` prompt to return delimited sections
- [ ] Real PDF generation for the Recruit results screen (currently `window.print()`)
- [ ] AbortController on the Analyze processing stage so the user can cancel mid-fetch
- [ ] Privacy + Terms pages (currently hash placeholders in the home footer)
- [ ] Auth (Supabase is provisioned but no feature uses it yet)
- [ ] Voice-mode UI for the Recruit chat (toggle button is wired in the header; verify TTS path works for recruit responses)

## Build in Public Plan
Each weekend session → one LinkedIn post about what was built/learned. See `blog-posts/`.

---

## Notes for Claude
- This is a side project, ~3 hours/week from a PM with basic coding knowledge — prefer the simpler implementation.
- Don't add complexity speculatively; extract a component the second time a pattern appears, not the first.
- Animations and copy are usually locked by a design HTML in the repo root (`design-options-vN.html`) — read those before changing anything visual.
- Tone of voice across coach modes is established — don't redesign it without being asked.
- `lib/prompts.ts` changes affect Coach Fabian's behaviour for every user immediately. Treat edits there like a production behaviour change.
