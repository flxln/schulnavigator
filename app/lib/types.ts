export type MediumTyp = 'audio' | 'video' | 'foto' | 'text'

export type VideoSource = 'upload' | 'youtube'

export type DialogRolle = 'frieda' | 'otto' | 'beide'

export type DialogFigure = 'frieda' | 'otto'

export interface DialogSegment {
  id: string
  rolle: DialogRolle
  quelle: string
  text: string
  gruppe?: string
}

export interface DialogGruppe {
  id: string
  text: string
}

export interface Dialog {
  figuren: DialogFigure[]
  segmente: DialogSegment[]
  gruppen?: DialogGruppe[]
}

export type HotspotAction = 'medium' | 'dialog'

export interface Hotspot {
  id: string
  label?: string
  x: number
  y: number
  radius?: number
  /** Default `medium` — verknüpft mit `medien[]`. */
  action?: HotspotAction
  /** Pflicht bei `action: 'medium'` (bzw. ohne action). */
  mediumId?: string
  /** Pflicht bei `action: 'dialog'`; muss in `station.dialog.figuren` stehen. */
  mascot?: DialogFigure
}

export interface Medium {
  id: string
  typ: MediumTyp
  quelle: string
  videoSource?: VideoSource
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
