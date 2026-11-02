export type PosterKind = 'cover' | 'qr'

export type PosterTheme = {
  id: string
  kind: PosterKind
  title: string
  subtitle: string
  hint: string
  qrFile: string | null
  background: string
  accent: string
  ribbon: string
  icons: string[]
}

/**
 * GS39-Palette plus raumbezogene OpenMoji-Hex (ohne FE0F).
 * Hintergründe sind absichtlich hell, damit der QR-Code kontrastreich bleibt.
 */
export const POSTER_THEMES: PosterTheme[] = [
  {
    id: 'deckblatt',
    kind: 'cover',
    title: 'Virtueller Schulrundgang',
    subtitle: '39. Grundschule Dresden',
    hint: 'QR-Codes zum Entdecken der Räume',
    qrFile: null,
    background: '#E4F3FC',
    accent: '#FBBB24',
    ribbon: '#082A50',
    icons: ['1F3EB', '1F393', '1F4DA', '1F388', '1F308', '1F389', '2728'],
  },
  {
    id: 'entry-heft',
    kind: 'qr',
    title: 'Eintritt Heft',
    subtitle: 'Hier startet der Rundgang',
    hint: 'Code scannen und loslegen',
    qrFile: 'entry-heft.png',
    background: '#F5F2EA',
    accent: '#FBBB24',
    ribbon: '#082A50',
    icons: ['1F4D3', '270F', '1F4DA', '1F4CE'],
  },
  {
    id: 'klassenzimmer',
    kind: 'qr',
    title: 'Klassenzimmer',
    subtitle: 'Lernen, lachen, entdecken',
    hint: 'Code scannen und reinschauen',
    qrFile: 'raum-klassenzimmer.png',
    background: '#E4F3FC',
    accent: '#1F6ABB',
    ribbon: '#1F6ABB',
    icons: ['1F4DA', '270F', '1F3EB', '1F9EE'],
  },
  {
    id: 'daz',
    kind: 'qr',
    title: 'DaZ-Zimmer',
    subtitle: 'Deutsch aus aller Welt',
    hint: 'Code scannen und reinschauen',
    qrFile: 'raum-daz.png',
    background: '#E8F4FF',
    accent: '#1F6ABB',
    ribbon: '#1F6ABB',
    icons: ['1F30D', '1F4AC', '1F4D6', '1F1E9-1F1EA'],
  },
  {
    id: 'kunst',
    kind: 'qr',
    title: 'Kunstzimmer',
    subtitle: 'Farben, Formen, Fantasie',
    hint: 'Code scannen und reinschauen',
    qrFile: 'raum-kunst.png',
    background: '#FDECEA',
    accent: '#EF3A37',
    ribbon: '#EF3A37',
    icons: ['1F3A8', '1F58C', '1F5BC', '2728'],
  },
  {
    id: 'lesewelt',
    kind: 'qr',
    title: 'Lesewelt',
    subtitle: 'Geschichten und Abenteuer',
    hint: 'Code scannen und reinschauen',
    qrFile: 'raum-lesewelt.png',
    background: '#F3F8EA',
    accent: '#4B9A23',
    ribbon: '#4B9A23',
    icons: ['1F4D6', '1F4DA', '1F431', '1F319'],
  },
  {
    id: 'musik',
    kind: 'qr',
    title: 'Musikzimmer',
    subtitle: 'Töne, Rhythmus, Stimmen',
    hint: 'Code scannen und reinschauen',
    qrFile: 'raum-musik.png',
    background: '#FFF6D8',
    accent: '#FBBB24',
    ribbon: '#C48A00',
    icons: ['1F3B5', '1F3B8', '1F3B9', '1F941'],
  },
  {
    id: 'pc-raum',
    kind: 'qr',
    title: 'PC-Raum',
    subtitle: 'Tippen, klicken, programmieren',
    hint: 'Code scannen und reinschauen',
    qrFile: 'raum-pc-raum.png',
    background: '#E8EEF6',
    accent: '#082A50',
    ribbon: '#082A50',
    icons: ['1F4BB', '1F5A5', '1F916', '1F5B1'],
  },
  {
    id: 'werken',
    kind: 'qr',
    title: 'Werkenzimmer',
    subtitle: 'Sägen, schrauben, bauen',
    hint: 'Code scannen und reinschauen',
    qrFile: 'raum-werken.png',
    background: '#F7EFE0',
    accent: '#C48A00',
    ribbon: '#8A5A12',
    icons: ['1F528', '1F6E0', '1F9F0', '1FAB5'],
  },
  {
    id: 'speiseraum',
    kind: 'qr',
    title: 'Speiseraum',
    subtitle: 'Gemeinsam essen und reden',
    hint: 'Code scannen und reinschauen',
    qrFile: 'raum-speiseraum.png',
    background: '#FFF1E4',
    accent: '#EF3A37',
    ribbon: '#D35400',
    icons: ['1F35D', '1F374', '1F34E', '1F957'],
  },
  {
    id: 'hort',
    kind: 'qr',
    title: 'Hortzimmer',
    subtitle: 'Spielen nach der Schule',
    hint: 'Code scannen und reinschauen',
    qrFile: 'raum-hort.png',
    background: '#EAF8F0',
    accent: '#4B9A23',
    ribbon: '#1F6ABB',
    icons: ['1F9F8', '1F9E9', '1F3AE', '1F308'],
  },
  {
    id: 'turnhalle',
    kind: 'qr',
    title: 'Turnhalle',
    subtitle: 'Rennen, werfen, toben',
    hint: 'Code scannen und reinschauen',
    qrFile: 'raum-turnhalle.png',
    background: '#E8F6DC',
    accent: '#4B9A23',
    ribbon: '#4B9A23',
    icons: ['26BD', '1F3C0', '1F3C3', '1F3C6'],
  },
  {
    id: 'schulsozialarbeit',
    kind: 'qr',
    title: 'Schulsozialarbeit',
    subtitle: 'Zuhören, helfen, stärken',
    hint: 'Code scannen und reinschauen',
    qrFile: 'raum-schulsozialarbeit.png',
    background: '#FDE8F0',
    accent: '#EF3A37',
    ribbon: '#C2185B',
    icons: ['2764', '1F91D', '1F917', '1F54A'],
  },
  {
    id: 'schulhof',
    kind: 'qr',
    title: 'Schulhof',
    subtitle: 'Pause an der frischen Luft',
    hint: 'Code scannen und reinschauen',
    qrFile: 'raum-schulhof.png',
    background: '#E6F7EA',
    accent: '#4B9A23',
    ribbon: '#1F6ABB',
    icons: ['26BD', '1F333', '2600', '1F308'],
  },
]

export function uniqueIconHexes(themes: PosterTheme[]): string[] {
  const set = new Set<string>()
  for (const theme of themes) {
    for (const hex of theme.icons) {
      set.add(hex)
    }
  }
  return [...set]
}
