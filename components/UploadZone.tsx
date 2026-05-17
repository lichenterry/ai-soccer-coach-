'use client'

import { type ChangeEvent, type RefObject } from 'react'

interface UploadZoneProps {
  /** Hidden file input the zone proxies clicks to. */
  inputRef: RefObject<HTMLInputElement>
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  /** Comma-separated MIME types passed to the file input. */
  accept?: string
  /** Optional drop handler — if omitted, drag-and-drop is no-op. */
  onDrop?: (e: React.DragEvent<HTMLButtonElement>) => void
  label?: string
  hint?: string
  formats?: string
}

/**
 * Big dashed mint drop zone used on Analyze stage 1. The mint-tinted glass
 * + dashed border is the "smart pick" treatment applied to a drop zone —
 * visually obvious that this is the primary action.
 */
export default function UploadZone({
  inputRef,
  onFileChange,
  accept = 'video/mp4,video/quicktime,video/webm,video/x-m4v',
  onDrop,
  label = 'Tap to choose video',
  hint = 'or drag & drop',
  formats = 'MP4 · MOV · WebM · up to 200MB',
}: UploadZoneProps) {
  const handleClick = () => inputRef.current?.click()

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    if (onDrop) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onDrop={(e) => {
        if (!onDrop) return
        e.preventDefault()
        onDrop(e)
      }}
      onDragOver={handleDragOver}
      className="mt-[14px] flex w-full flex-col items-center gap-3 rounded-[22px] border-[1.5px] border-dashed border-pitch-mint-300/45 px-5 py-[30px] text-left shadow-[0_0_24px_rgba(110,231,183,0.12),_inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-pitch-mint-300/60"
      style={{
        background:
          'linear-gradient(135deg, rgba(110,231,183,0.08) 0%, rgba(110,231,183,0.02) 100%)',
      }}
      aria-label={label}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onFileChange}
        className="hidden"
      />

      {/* Cloud-up icon in a mint-tinted glass tile. */}
      <span
        aria-hidden="true"
        className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] border border-pitch-mint-300/40 shadow-[0_0_16px_rgba(110,231,183,0.18)]"
        style={{
          background:
            'linear-gradient(135deg, rgba(110,231,183,0.22) 0%, rgba(110,231,183,0.08) 100%)',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="#d1fae5"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </span>

      <span className="text-center">
        <span className="block text-[14px] font-extrabold tracking-[-0.2px] text-white">
          {label}
        </span>
        <span className="mt-[2px] block text-[11px] font-medium text-white/45">
          {hint}
        </span>
      </span>

      <span className="mt-1 block text-[10.5px] font-semibold tracking-[0.5px] text-white/35">
        {formats}
      </span>
    </button>
  )
}
