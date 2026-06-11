/** Mischt zwei Hex-Farben (für SVG ohne color-mix). */
export function mixHex(
  foreground: string,
  background: string,
  foregroundRatio: number,
): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '')
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ] as const
  }
  const [fr, fg, fb] = parse(foreground)
  const [br, bg, bb] = parse(background)
  const t = Math.min(1, Math.max(0, foregroundRatio))
  const ch = (c: number) => c.toString(16).padStart(2, '0')
  return `#${ch(Math.round(fr * t + br * (1 - t)))}${ch(Math.round(fg * t + bg * (1 - t)))}${ch(Math.round(fb * t + bb * (1 - t)))}`
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const a = Math.min(1, Math.max(0, alpha))
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
