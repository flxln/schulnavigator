import type { OrientationAuthState } from '@/components/raum-viewer/use-device-orientation'

export function computeViewerBlocksCoach(
  orientationEnabled: boolean,
  orientState: OrientationAuthState,
  panOnboardingActive: boolean,
): boolean {
  const gyroPending =
    orientationEnabled &&
    (orientState === 'checking' || orientState === 'needs-gesture')

  return gyroPending || panOnboardingActive
}
