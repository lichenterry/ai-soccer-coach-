import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Inter is the locked typeface for Coach Fabian. Weight 900 is used on
// big headlines; 700–800 for UI; 500 for body copy.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  // Resolves relative URLs in OG/Twitter card meta to absolute, so social
  // shares render the correct preview no matter where they're posted.
  metadataBase: new URL('https://coachfabian.app'),
  title: 'Coach Fabian — AI soccer coach for competitive youth athletes',
  description:
    'An AI coach for your kid — and you. Game prep, film review, and a college recruiting plan for 10–15 year old athletes.',
  openGraph: {
    title: 'Coach Fabian — AI soccer coach for competitive youth athletes',
    description:
      'An AI coach for your kid — and you. Game prep, film review, and a college recruiting plan for 10–15 year old athletes.',
    url: 'https://coachfabian.app',
    siteName: 'Coach Fabian',
    type: 'website',
  },
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
