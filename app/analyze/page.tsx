'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { extractFrames, validateVideoFile, getFileSizeWarning } from '@/lib/video'
import { setLastUsed } from '@/lib/lastUsed'
import { track } from '@/lib/analytics'
import Stage from '@/components/Stage'
import BrandMark from '@/components/BrandMark'
import StepDots from '@/components/StepDots'
import UploadZone from '@/components/UploadZone'
import MessageBubble from '@/components/MessageBubble'

type PlayerPosition = 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper'
type AnalysisStage = 'upload' | 'details' | 'processing' | 'results'

const positions: PlayerPosition[] = [
  'Forward',
  'Midfielder',
  'Defender',
  'Goalkeeper',
]

const STAGE_NUMBER: Record<AnalysisStage, number> = {
  upload: 1,
  details: 2,
  processing: 3,
  results: 4,
}

export default function AnalyzePage() {
  const [stage, setStage] = useState<AnalysisStage>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [playerDescription, setPlayerDescription] = useState('')
  const [position, setPosition] = useState<PlayerPosition | null>(null)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isLongVideo, setIsLongVideo] = useState(false)
  const [clipDuration, setClipDuration] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Reaching this page counts as "engaging Game Analysis" — feeds the
  // home-page smart pick on the next visit.
  useEffect(() => {
    setLastUsed('analyze')
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    track('analyze_upload_started')
    setError(null)
    setWarning(null)
    setIsLongVideo(false)
    setClipDuration(null)

    const validation = validateVideoFile(file)
    if (!validation.valid) {
      setError(validation.error!)
      return
    }

    const sizeWarning = getFileSizeWarning(file)
    if (sizeWarning) {
      setWarning(sizeWarning)
    }

    // Async metadata probe — captures duration for the results header and
    // flags >60s clips as long. Doesn't block stage advance.
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      if (video.duration > 60) setIsLongVideo(true)
      setClipDuration(Math.round(video.duration))
      track('analyze_video_uploaded', {
        file_size: file.size,
        duration: Math.round(video.duration),
      })
      URL.revokeObjectURL(video.src)
    }
    video.src = URL.createObjectURL(file)

    setSelectedFile(file)
    setStage('details')
    e.target.value = ''
  }

  const handleAnalyze = async () => {
    if (!selectedFile || !position || !playerDescription.trim()) return

    setStage('processing')
    setError(null)

    try {
      setProgress('Loading video…')
      const frames = await extractFrames(selectedFile, 30, (stageText, pct) => {
        setProgress(`${stageText} ${pct}%`)
      })

      if (frames.length === 0) {
        throw new Error('Could not extract frames from video')
      }

      setProgress('Coach Fabian is reviewing your footage…')

      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames: frames.map((f) => f.data),
          position,
          playerDescription: playerDescription.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setAnalysis(data.analysis)
      setStage('results')
      track('analyze_results_viewed')

      if (voiceEnabled) {
        playAudio(data.analysis)
      }
    } catch (err) {
      console.error('Video processing error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process video')
      setStage('details')
    }
  }

  const playAudio = useCallback(async (text: string) => {
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) return

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      setIsPlayingAudio(true)

      audio.onended = () => {
        setIsPlayingAudio(false)
        URL.revokeObjectURL(audioUrl)
      }
      audio.onerror = () => {
        setIsPlayingAudio(false)
        URL.revokeObjectURL(audioUrl)
      }

      await audio.play()
    } catch (e) {
      console.error('Audio playback error:', e)
      setIsPlayingAudio(false)
    }
  }, [])

  const handleStartOver = () => {
    setStage('upload')
    setSelectedFile(null)
    setPlayerDescription('')
    setPosition(null)
    setAnalysis(null)
    setError(null)
    setWarning(null)
    setIsLongVideo(false)
    setClipDuration(null)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  const canAnalyze = !!(playerDescription.trim() && position && selectedFile)
  const currentStep = STAGE_NUMBER[stage]
  // Stage 4 (results) doesn't show step dots in v14 — only stages 1-3.
  const showStepDots = stage !== 'results'

  return (
    <Stage>
      <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col px-[18px] pb-[22px] pt-[50px]">
        {/* === Top bar (back + brand mark) ================================ */}
        <div className="mb-1 flex items-center justify-between">
          {stage === 'processing' ? (
            // Processing has no back affordance in the v14 spec — analysis
            // is in flight, the user can't usefully cancel mid-fetch.
            <span className="h-[30px] w-[30px]" aria-hidden="true" />
          ) : (
            <Link
              href={stage === 'upload' ? '/' : '#'}
              onClick={(e) => {
                if (stage === 'upload') return
                e.preventDefault()
                handleStartOver()
              }}
              aria-label="Back"
              className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] text-[14px] text-white/70 hover:bg-white/[0.1]"
            >
              ‹
            </Link>
          )}
          <BrandMark />
          <span className="h-[30px] w-[30px]" aria-hidden="true" />
        </div>

        {showStepDots && <StepDots current={currentStep} total={3} />}

        {/* === STAGE 1 — Upload =========================================== */}
        {stage === 'upload' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-[18px] py-3">
            <h1
              className="text-center text-[32px] font-black leading-[1.05] text-white"
              style={{ letterSpacing: '-1.2px' }}
            >
              Show me
              <br />
              a play.
            </h1>
            <p className="-mt-2 max-w-[220px] text-center text-[13px] font-medium leading-[1.5] text-white/[0.55]">
              Upload a short clip and Coach Fabian will break it down.
            </p>

            {error && (
              <div
                role="alert"
                className="w-full rounded-2xl border border-red-400/40 bg-red-400/[0.08] px-3 py-2 text-center text-[12px] font-semibold text-red-200"
              >
                {error}
              </div>
            )}

            <UploadZone inputRef={fileInputRef} onFileChange={handleFileChange} />
          </div>
        )}

        {/* === STAGE 2 — Details ========================================== */}
        {stage === 'details' && (
          <div className="flex flex-1 flex-col pt-2">
            <h1
              className="mb-1 mt-[18px] text-[24px] font-black leading-[1.05] text-white"
              style={{ letterSpacing: '-0.8px' }}
            >
              A few
              <br />
              quick details.
            </h1>
            <p className="mb-[18px] text-[12.5px] font-medium text-white/[0.55]">
              So Coach Fabian can find your kid in the footage.
            </p>

            {isLongVideo && (
              <div className="mb-3 rounded-xl border border-blue-400/30 bg-blue-400/[0.06] px-3 py-2 text-[11.5px] font-medium text-blue-200">
                📹 This clip is over a minute — Coach Fabian works best with
                shorter plays. Continue if you want, or trim and re-upload.
              </div>
            )}

            {warning && (
              <div className="mb-3 rounded-xl border border-amber-300/30 bg-amber-300/[0.06] px-3 py-2 text-[11.5px] font-medium text-amber-200">
                {warning}
              </div>
            )}

            {/* Player description ----------------------------------------- */}
            <div className="mb-4">
              <label
                htmlFor="player-description"
                className="mb-2 block text-[11px] font-extrabold uppercase tracking-[1.2px] text-white/50"
              >
                How to spot them
              </label>
              <input
                id="player-description"
                type="text"
                value={playerDescription}
                onChange={(e) => setPlayerDescription(e.target.value)}
                placeholder="Blue jersey, number 7"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-[14px] py-3 text-[13px] font-medium text-white/85 placeholder:text-white/30 focus:border-pitch-mint-300/40 focus:outline-none focus:ring-1 focus:ring-pitch-mint-300/30"
              />
              <p className="mt-[6px] text-[10.5px] font-medium text-white/35">
                Jersey color, number, or anything visible
              </p>
            </div>

            {/* Position grid --------------------------------------------- */}
            <div className="mb-4">
              <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[1.2px] text-white/50">
                Position
              </span>
              <div className="grid grid-cols-2 gap-[6px]">
                {positions.map((pos) => {
                  const selected = position === pos
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setPosition(pos)}
                      className={
                        selected
                          ? 'rounded-xl border-[1.5px] border-pitch-mint-300/55 px-2 py-[10px] text-center text-[12px] font-bold tracking-[-0.1px] text-white shadow-[0_0_14px_rgba(110,231,183,0.15)]'
                          : 'rounded-xl border border-white/[0.09] bg-white/[0.05] px-2 py-[10px] text-center text-[12px] font-bold tracking-[-0.1px] text-white/85 hover:bg-white/[0.08]'
                      }
                      style={
                        selected
                          ? {
                              background:
                                'linear-gradient(135deg, rgba(110,231,183,0.18) 0%, rgba(110,231,183,0.06) 100%)',
                            }
                          : undefined
                      }
                      aria-pressed={selected}
                    >
                      {pos}
                    </button>
                  )
                })}
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-3 rounded-xl border border-red-400/40 bg-red-400/[0.08] px-3 py-2 text-[12px] font-semibold text-red-200"
              >
                {error}
              </div>
            )}

            {/* CTAs pinned bottom ---------------------------------------- */}
            <div className="mt-auto flex flex-col gap-[10px]">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="flex items-center justify-center gap-[7px] rounded-full bg-white px-[18px] py-[14px] text-[14px] font-extrabold tracking-[-0.2px] text-[#050b0e] shadow-[0_8px_22px_rgba(0,0,0,0.35),_0_1px_0_rgba(255,255,255,0.1)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                Analyze the play <span className="text-[15px]">→</span>
              </button>
              <button
                type="button"
                onClick={handleStartOver}
                className="px-2 py-2 text-center text-[11.5px] font-semibold text-white/40 underline decoration-white/15 underline-offset-2 hover:text-white/60"
              >
                Choose a different clip
              </button>
            </div>
          </div>
        )}

        {/* === STAGE 3 — Processing ====================================== */}
        {stage === 'processing' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-[22px] py-3">
            <div className="relative flex h-[180px] w-[180px] items-center justify-center">
              <div
                aria-hidden="true"
                className="pitch-ball-3-glow pointer-events-none absolute -inset-[10px] animate-s3-glow-pulse rounded-full"
                style={{ filter: 'blur(10px)' }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 animate-s3-ring-pulse rounded-full border-[1.5px] border-pitch-mint-300/25"
              />
              <div
                aria-hidden="true"
                className="absolute inset-[18px] animate-s3-ring-pulse-delayed rounded-full border border-pitch-mint-300/15"
              />
              <div
                aria-hidden="true"
                className="pitch-ball-3 relative z-[1] h-[90px] w-[90px] animate-s3-spin"
              />
            </div>

            <div className="text-center">
              <div
                className="text-[18px] font-extrabold text-white"
                style={{ letterSpacing: '-0.4px' }}
                aria-live="polite"
              >
                {progress || 'Watching the play…'}
              </div>
            </div>

            <p className="max-w-[240px] text-center text-[12px] font-medium leading-[1.5] text-white/45">
              Coach Fabian is pulling out the key moments. This usually takes
              about a minute.
            </p>
          </div>
        )}

        {/* === STAGE 4 — Results ========================================= */}
        {stage === 'results' && analysis && (
          <div className="flex flex-1 flex-col overflow-hidden pt-3">
            <div className="mb-[14px] flex items-center gap-[10px]">
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[18px]"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(110,231,183,0.22) 0%, rgba(110,231,183,0.06) 100%)',
                  border: '1px solid rgba(110,231,183,0.4)',
                  boxShadow: '0 0 16px rgba(110,231,183,0.25)',
                }}
                aria-hidden="true"
              >
                ⚽
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-extrabold tracking-[-0.2px] text-white">
                  Coach Fabian
                </div>
                <div className="mt-[1px] text-[10.5px] font-semibold text-white/50">
                  {position ?? '—'}
                  {clipDuration ? ` · ${clipDuration}s clip` : ''}
                </div>
              </div>
              {/* Speaker icon — same SVG as the chat header. Toggles
                  voiceEnabled and (re)plays the current analysis when on. */}
              <button
                type="button"
                onClick={() => {
                  const next = !voiceEnabled
                  setVoiceEnabled(next)
                  track('voice_mode_toggled', { surface: 'analyze', enabled: next })
                  if (next && analysis) playAudio(analysis)
                }}
                aria-label={voiceEnabled ? 'Disable voice playback' : 'Play analysis aloud'}
                aria-pressed={voiceEnabled}
                className={`flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                  voiceEnabled
                    ? 'border-pitch-mint-300/40 bg-pitch-mint-300/[0.18] text-pitch-mint-300'
                    : 'border-white/[0.08] bg-white/[0.06] text-white/70 hover:bg-white/[0.1]'
                } ${isPlayingAudio ? 'animate-pulse' : ''}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[14px] w-[14px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </button>
            </div>

            {/* Analysis is free-form text from the model. Render as a single
                coach bubble — see Future iteration note below. */}
            <div className="flex-1 overflow-y-auto pb-3">
              <MessageBubble content={analysis} isUser={false} />
            </div>

            {/* FUTURE ITERATION: v14 mocks two labeled bubbles — "What
                worked" (mint) and "One thing to try" (gold). That requires
                the analyze-video system prompt to return structured
                sections (e.g. JSON or a delimited format). Out of scope for
                this commit per brief; revisit when the prompt is updated. */}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleStartOver}
                className="flex-1 rounded-full bg-white px-[14px] py-3 text-center text-[13px] font-extrabold tracking-[-0.2px] text-[#050b0e] shadow-[0_6px_18px_rgba(0,0,0,0.3)]"
              >
                Analyze another
              </button>
              <Link
                href="/"
                className="flex-1 rounded-full border border-white/10 bg-white/[0.06] px-[14px] py-3 text-center text-[13px] font-bold tracking-[-0.1px] text-white/85 hover:bg-white/[0.1]"
              >
                Home
              </Link>
            </div>
          </div>
        )}

      </div>
    </Stage>
  )
}
