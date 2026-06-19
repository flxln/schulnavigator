import { StudioShell } from '@/components/mpz-studio/studio-shell'
import { MediaIngestModalProvider } from '@/components/mpz-studio/media-ingest-modal-context'
import { StudioValidationProvider } from '@/components/mpz-studio/studio-validation-context'
import { getEmbedAllowSuffixes } from '@/lib/embed-allowlist'

export default function MpzStudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const globalSuffixes = getEmbedAllowSuffixes()

  return (
    <StudioValidationProvider>
      <MediaIngestModalProvider globalSuffixes={globalSuffixes}>
        <StudioShell>{children}</StudioShell>
      </MediaIngestModalProvider>
    </StudioValidationProvider>
  )
}
