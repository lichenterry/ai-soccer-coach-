export interface ExtractedFrame {
  data: string // base64 encoded JPEG
  timestamp: number // seconds into video
}

export async function extractFrames(
  videoFile: File,
  numFrames: number = 6,
  onProgress?: (stage: string, progress: number) => void
): Promise<ExtractedFrame[]> {
  onProgress?.('Loading video...', 10)

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Could not create canvas context'))
      return
    }

    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    const objectUrl = URL.createObjectURL(videoFile)
    video.src = objectUrl

    video.onloadedmetadata = async () => {
      const duration = video.duration

      if (!duration || duration === Infinity) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Could not determine video duration'))
        return
      }

      // Set canvas size (max 640px width for reasonable file sizes)
      const scale = Math.min(1, 640 / video.videoWidth)
      canvas.width = video.videoWidth * scale
      canvas.height = video.videoHeight * scale

      const frames: ExtractedFrame[] = []
      const interval = duration / (numFrames + 1)

      onProgress?.('Extracting frames...', 30)

      for (let i = 1; i <= numFrames; i++) {
        const timestamp = interval * i

        try {
          const frame = await captureFrame(video, canvas, ctx, timestamp)
          frames.push(frame)
          onProgress?.('Extracting frames...', 30 + Math.round((i / numFrames) * 60))
        } catch (err) {
          console.warn(`Failed to capture frame at ${timestamp}s:`, err)
        }
      }

      URL.revokeObjectURL(objectUrl)

      if (frames.length === 0) {
        reject(new Error('Could not extract any frames from video'))
        return
      }

      onProgress?.('Done!', 100)
      resolve(frames)
    }

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load video'))
    }
  })
}

function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  timestamp: number
): Promise<ExtractedFrame> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)

      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        const base64 = dataUrl.split(',')[1]
        resolve({ data: base64, timestamp })
      } catch (err) {
        reject(err)
      }
    }

    const onError = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      reject(new Error('Seek failed'))
    }

    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)
    video.currentTime = timestamp

    // Timeout after 5 seconds
    setTimeout(() => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      reject(new Error('Frame capture timeout'))
    }, 5000)
  })
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload an MP4, MOV, or WebM video file.'
    }
  }

  const maxSize = 200 * 1024 * 1024 // 200MB hard limit
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Video is too large. Please upload a file under 200MB.'
    }
  }

  return { valid: true }
}

export function getFileSizeWarning(file: File): string | null {
  const softLimit = 100 * 1024 * 1024 // 100MB

  if (file.size > softLimit) {
    return 'This video is pretty long! For best results, try a shorter clip (under 1 minute).'
  }

  return null
}
