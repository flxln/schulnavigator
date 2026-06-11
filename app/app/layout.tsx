import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import { DisableZoom } from '@/components/ui/disable-zoom'
import './globals.css'

const nunito = Nunito({
  variable: '--font-nunito-ui',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Schulnavigator',
  description: 'Web-App für den Tag der offenen Tür (39. Grundschule Dresden).',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#fcfbf7',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <DisableZoom />
        {children}
      </body>
    </html>
  )
}
