import type { StationHealth } from '@/lib/mpz-studio-overview'

export function healthDotClass(health: StationHealth): string {
  if (health === 'ok') return 'bg-accent'
  if (health === 'warn') return 'bg-warn'
  return 'bg-error'
}

export function healthLabel(health: StationHealth): string {
  if (health === 'ok') return 'Bereit'
  if (health === 'warn') return 'Warnung'
  return 'Fehler'
}
