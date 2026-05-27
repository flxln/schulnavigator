import type { Metadata, Viewport } from 'next'
import { Caveat, Caveat_Brush, Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  variable: '--font-nunito-ui',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

const caveatBrush = Caveat_Brush({
  variable: '--font-caveat-brush',
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Schulnavigator',
  description: 'Web-App für den Tag der offenen Tür (39. Grundschule Dresden).',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="de"
      className={`${nunito.variable} ${caveatBrush.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  )
}
