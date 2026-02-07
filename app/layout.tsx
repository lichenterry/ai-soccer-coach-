import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Soccer Coach',
  description: 'Your personal AI coach to hype you up or calm your nerves before the big game!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
