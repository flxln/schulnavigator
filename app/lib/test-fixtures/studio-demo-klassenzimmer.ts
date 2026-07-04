import type { Station, StationsFile } from '@/lib/types'

/** Inline-Demo-Station für Unit-Tests — nicht an live stations.json gekoppelt. */
export const studioDemoKlassenzimmerStation: Station = {
  slug: 'klassenzimmer',
  titel: 'Klassenzimmer',
  beschreibung:
    'Hallo und willkommen in unserem Klassenzimmer! Hier lernen wir jeden Tag spannende Sachen und manchmal sogar freiwillig.',
  viewer: 'equirectangular',
  panorama360: '/stations/360/klassenzimmer.jpg',
  bild: '/stations/klassenzimmer.jpg',
  medien: [
    {
      id: 'demo-audio',
      typ: 'audio',
      quelle: '/media/klassenzimmer/audio/grundschule_demo.mp3',
      untertitel: 'Mein Schultag (Audio)',
    },
    {
      id: 'demo-video',
      typ: 'video',
      videoSource: 'upload',
      quelle: '/media/klassenzimmer/video/grundschule_demo.mp4',
      poster: '/media/klassenzimmer/fotos/grundschule_demo.jpg',
      thumbnail: '/media/klassenzimmer/fotos/grundschule_demo.jpg',
      untertitel: 'Mein Schultag (Video)',
    },
    {
      id: 'demo-foto',
      typ: 'foto',
      quelle: '/media/klassenzimmer/fotos/grundschule_demo.jpg',
      untertitel: 'Schulfoto',
    },
    {
      id: 'demo-text',
      typ: 'text',
      quelle: '/media/klassenzimmer/texte/grundschule_demo.md',
      untertitel: 'Mein Schultag',
    },
  ],
  hotspots360: [
    {
      id: 'hs-text',
      label: 'Korkpinnwand',
      yaw: -32,
      pitch: -4,
      mediumId: 'demo-text',
      iconSize: 0.2,
    },
    {
      id: 'hs-video',
      label: 'Tafel',
      yaw: -18,
      pitch: 0,
      mediumId: 'demo-video',
      icon: '/stations-icons/klassenzimmer/play.svg',
      iconSize: 0.2,
    },
    {
      id: 'hs-audio',
      label: 'Klassentische',
      yaw: 4,
      pitch: -8,
      mediumId: 'demo-audio',
      iconSize: 0.2,
    },
    {
      id: 'hs-foto',
      label: 'Fensterseite',
      yaw: 28,
      pitch: -2,
      mediumId: 'demo-foto',
      iconSize: 0.2,
    },
  ],
}

export function withStudioDemoKlassenzimmer(file: StationsFile): StationsFile {
  const copy = structuredClone(file)
  const idx = copy.stations.findIndex((s) => s.slug === 'klassenzimmer')
  if (idx >= 0) {
    copy.stations[idx] = structuredClone(studioDemoKlassenzimmerStation)
  } else {
    copy.stations.unshift(structuredClone(studioDemoKlassenzimmerStation))
  }
  return copy
}

export function studioDemoStationsFile(base: StationsFile): StationsFile {
  return withStudioDemoKlassenzimmer(base)
}
