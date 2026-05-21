export type MediumTyp = 'audio' | 'video' | 'foto' | 'text'

export type VideoSource = 'upload' | 'youtube'

export interface Hotspot {
  id: string
  label?: string
  x: number
  y: number
  radius?: number
  mediumId: string
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
  puzzleSegmentId?: string
}

export interface StationsFile {
  stations: Station[]
}
