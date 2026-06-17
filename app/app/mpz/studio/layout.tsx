import { StudioShell } from '@/components/mpz-studio/studio-shell'

export default function MpzStudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <StudioShell>{children}</StudioShell>
}
