import type { EntryMode } from '@/lib/access-tokens'

export type MediumTyp = 'audio' | 'video' | 'foto' | 'text' | 'link' | 'embed'

export type LinkOpenIn = 'external'

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

/** Viewer-Modus pro Station (ADR-018). Default: 'flat'. */
export type ViewerMode = 'flat' | 'equirectangular'

/**
 * Gemeinsame Hotspot-Felder für Flat- und Sphere-Viewer (ADR-018, Vertrag V1).
 * Nur die Positionsfelder unterscheiden sich — sie leben in den Sub-Interfaces.
 */
export interface HotspotBase {
  id: string
  label?: string
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

/** Flat-Viewer-Hotspot: Position in Bildkoordinaten (0–1). */
export interface Hotspot extends HotspotBase {
  /** 0–1: linker/rechter Rand des Quellbildes (horizontal pannbar). */
  x: number
  /** 0–1: oben/unten im sichtbaren vertikalen Ausschnitt (nicht volles Quellbild bei Zoom). */
  y: number
  radius?: number
}

/** Sphere-Viewer-Hotspot: Position in Kamerakoordinaten (ADR-018). */
export interface Hotspot360 extends HotspotBase {
  /** Horizontaler Winkel in Grad, −180 bis 180. */
  yaw: number
  /** Vertikaler Winkel in Grad, −90 bis 90. */
  pitch: number
  /**
   * Zusätzlicher Pitch (Grad) für Dialog-Bubble-Projektion nach oben.
   * Marker-Anker (yaw/pitch) ≠ Kopfposition; Default in sphere-marker-conventions.
   */
  bubblePitchOffset?: number
}

/**
 * Vertrag V2 (ADR-018): Projizierte Bildschirmposition eines Hotspots.
 * Sphere liefert via PSV `dataHelper`; Flat emuliert per Adapter aus `panInfo`.
 */
export interface ScreenProjection {
  /** Pixel ab linkem Viewer-Rand. */
  x: number
  /** Pixel ab oberem Viewer-Rand. */
  y: number
  /** false = Hotspot befindet sich außerhalb des aktuellen Sichtfelds. */
  visible: boolean
}

/**
 * Vertrag V3 (ADR-018): Gemeinsamer Handle für Flat- und Sphere-Viewer.
 * Ersetzt den viewer-spezifischen `RaumViewerHandle` im Client-Ref.
 */
export interface StationViewerHandle {
  recenterView(): void
  focusHotspot?(id: string): void
  projectHotspot?(id: string): ScreenProjection | null
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
  /** Nur typ === 'link'; Default im Code: external. */
  openIn?: LinkOpenIn
  /** Nur typ === 'embed'; Subset von DEFAULT_EMBED_ALLOW_SUFFIXES im Code. */
  embedAllow?: string[]
  untertitel?: string
}

export interface Station {
  slug: string
  titel: string
  beschreibung: string
  /** Viewer-Modus; fehlt → Default 'flat' (ADR-018). */
  viewer?: ViewerMode
  /** Flat-Viewer: breites Panorama (≥2,5:1). */
  bild?: string
  /** Sphere-Viewer: equirectangular 2:1 (ADR-018); Pflicht wenn viewer === 'equirectangular'. */
  panorama360?: string
  medien: Medium[]
  /** Flat-Viewer-Hotspots mit x/y-Bildkoordinaten. */
  hotspots?: Hotspot[]
  /** Sphere-Viewer-Hotspots mit yaw/pitch-Kamerakoordinaten (ADR-018). */
  hotspots360?: Hotspot360[]
  /** Optionaler Startblick in Grad (ADR-023); nur bei viewer === 'equirectangular'. */
  startYaw?: number
  startPitch?: number
  dialog?: Dialog
}

export interface StationsFile {
  stations: Station[]
}

export type CoachMascot = 'frieda' | 'otto' | 'duo'

export type CoachPlacement = 'bottom' | 'left' | 'right' | 'duo-split'

export type CoachTrigger = 'hub-milestone' | 'hub-complete' | 'room-first'

export interface CoachMessage {
  id: string
  trigger: CoachTrigger
  mascot: CoachMascot
  placement: CoachPlacement
  text: string
  /** Nur bei `hub-milestone`: Schwellwert für visitedCount. */
  milestone?: number
  /** Nur bei `room-first`. */
  slug?: string
  /** Fehlt → gilt für fest und heft. */
  modes?: readonly EntryMode[]
}

export interface CoachMessagesFile {
  messages: CoachMessage[]
}

export type CoachSeenState = {
  version: 1
  seen: string[]
  suppressed: string[]
}
