import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Inter is the locked typeface for Pitch. Weight 900 is used on big
// headlines; 700–800 for UI; 500 for body copy.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Pitch — AI coach in your young athlete’s pocket',
  description:
    'An AI soccer coach for parents — pre-game nerves, hype, and game film review for 10–15 year old athletes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-black text-white">{children}</body>
    </html>
  )
}
