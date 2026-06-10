export type MediumTyp = 'audio' | 'video' | 'foto' | 'text'

export type VideoSource = 'upload' | 'youtube'

export type DialogRolle = 'frieda' | 'otto' | 'beide'

export type DialogFigure = 'frieda' | 'otto'

export type DialogBubbleTail = 'left' | 'right' | 'center'

export interface DialogBubbleLayout {
  /** Vertikale Position: 0 = oberer Rand der Hero-Box, 1 = unterer (Anteil containerH). */
  y?: number
  /** Horizontale Basisposition: 0 = links, 1 = rechts. Fehlt → ADR-013 Mitpan. */
  x?: number
  /** Max. Breite als Anteil der Hero-Breite (containerW), 0,3–1. */
  maxWidth?: number
  /** Schriftgröße als Anteil der Hero-Box-Höhe (containerH), 0,02–0,06. */
  fontSize?: number
  /** Horizontales Mitpan bei gesetztem x. Default true. */
  followPan?: boolean
}

export interface DialogSegment {
  id: string
  rolle: DialogRolle
  quelle: string
  text: string
  gruppe?: string
  /** Optional: überschreibt Schwanz aus rolle für dieses Segment. */
  tail?: DialogBubbleTail
}

export interface DialogGruppe {
  id: string
  text: string
}

export interface Dialog {
  figuren: DialogFigure[]
  segmente: DialogSegment[]
  gruppen?: DialogGruppe[]
  bubble?: DialogBubbleLayout
}

export type HotspotAction = 'medium' | 'dialog'

export interface Hotspot {
  id: string
  label?: string
  /** 0–1: linker/rechter Rand des Quellbildes (horizontal pannbar). */
  x: number
  /** 0–1: oben/unten im sichtbaren vertikalen Ausschnitt (nicht volles Quellbild bei Zoom). */
  y: number
  radius?: number
  /** Default `medium` — verknüpft mit `medien[]`. */
  action?: HotspotAction
  /** Pflicht bei `action: 'medium'` (bzw. ohne action). */
  mediumId?: string
  /** Pflicht bei `action: 'dialog'`; muss in `station.dialog.figuren` stehen. */
  mascot?: DialogFigure
  /** Anteil der Panorama-Anzeigehöhe (0–1); nur bei action: 'dialog'. */
  mascotSize?: number
  /** Horizontal spiegeln (links↔rechts); Fußpunkt bleibt am Anker (nur action: 'dialog'). */
  mascotFlipX?: boolean
  /** Medien-Hotspot: Pfad unter /public (PNG/SVG/WebP); [ADR-017]. */
  icon?: string
  /** Medien-Hotspot: Anteil effectiveDisplayH (0,05–0,25); [ADR-017]. */
  iconSize?: number
}

export interface Medium {
  id: string
  typ: MediumTyp
  quelle: string
  videoSource?: VideoSource
  /** Nur typ === 'video' (videoSource 'upload'): optionales Vorschaubild. Validator erzwingt den Typ-Scope. */
  poster?: string
  /** Optionales Vorschaubild für Medienliste und Hotspot-Fallback; [ADR-017]. */
  thumbnail?: string
  untertitel?: string
}

export interface Station {
  slug: string
  titel: string
  beschreibung: string
  bild?: string
  medien: Medium[]
  hotspots?: Hotspot[]
  dialog?: Dialog
}

export interface StationsFile {
  stations: Station[]
}
