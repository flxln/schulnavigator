import { StudioShell } from '@/components/mpz-studio/studio-shell'
import { StudioValidationProvider } from '@/components/mpz-studio/studio-validation-context'

export default function MpzStudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <StudioValidationProvider>
      <StudioShell>{children}</StudioShell>
    </StudioValidationProvider>
  )
}
