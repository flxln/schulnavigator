import { StudioShell } from '@/components/mpz-studio/studio-shell'
import { MediaIngestModalProvider } from '@/components/mpz-studio/media-ingest-modal-context'
import { StudioValidationProvider } from '@/components/mpz-studio/studio-validation-context'

export default function MpzStudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <StudioValidationProvider>
      <MediaIngestModalProvider>
        <StudioShell>{children}</StudioShell>
      </MediaIngestModalProvider>
    </StudioValidationProvider>
  )
}
