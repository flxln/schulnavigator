import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import fontkit from '@pdf-lib/fontkit'
import {
  PDFDocument,
  rgb,
  degrees,
  type PDFFont,
  type PDFImage,
  type PDFPage,
  type RGB,
} from 'pdf-lib'
import {
  POSTER_THEMES,
  uniqueIconHexes,
  type PosterTheme,
} from './qr-openmoji-themes'
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  buildA4GridPdf,
  mmToPt,
} from './qr-pdf-layouts'
import type { QrPrintItem } from './qr-print-items'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const qrDir = join(appRoot, 'public', 'qr')
const pdfDir = join(qrDir, 'pdf')
const cacheDir = join(appRoot, '.cache', 'openmoji-poster')
const iconDir = join(cacheDir, 'icons')

const OPENMOJI_BASE =
  'https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/618x618'

const FONT_REGULAR = '/System/Library/Fonts/Supplemental/Arial.ttf'
const FONT_BOLD = '/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf'
const FONT_BOLD_FALLBACK = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'

const QR_MM = 96
const QR_PAD_MM = 10

type IconSpot = {
  xMm: number
  yMm: number
  sizeMm: number
  rotate: number
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return rgb(
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  )
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return rgb(
    a.red + (b.red - a.red) * t,
    a.green + (b.green - a.green) * t,
    a.blue + (b.blue - a.blue) * t,
  )
}

function drawRoundRect(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: RGB,
) {
  const rr = Math.min(r, w / 2, h / 2)
  page.drawRectangle({
    x: x + rr,
    y,
    width: w - rr * 2,
    height: h,
    color,
  })
  page.drawRectangle({
    x,
    y: y + rr,
    width: w,
    height: h - rr * 2,
    color,
  })
  page.drawCircle({ x: x + rr, y: y + rr, size: rr, color })
  page.drawCircle({ x: x + w - rr, y: y + rr, size: rr, color })
  page.drawCircle({ x: x + rr, y: y + h - rr, size: rr, color })
  page.drawCircle({ x: x + w - rr, y: y + h - rr, size: rr, color })
}

function drawCenteredText(
  page: PDFPage,
  text: string,
  centerX: number,
  y: number,
  font: PDFFont,
  fontSize: number,
  color: RGB,
) {
  const width = font.widthOfTextAtSize(text, fontSize)
  page.drawText(text, {
    x: centerX - width / 2,
    y,
    size: fontSize,
    font,
    color,
  })
}

async function downloadIcon(hex: string): Promise<string> {
  mkdirSync(iconDir, { recursive: true })
  const dest = join(iconDir, `${hex}.png`)
  if (existsSync(dest)) {
    return dest
  }
  const candidates = [`${hex}.png`, `${hex}-FE0F.png`]
  for (const file of candidates) {
    const url = `${OPENMOJI_BASE}/${file}`
    const res = await fetch(url)
    if (!res.ok) {
      continue
    }
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 80) {
      continue
    }
    writeFileSync(dest, buf)
    return dest
  }
  throw new Error(`OpenMoji-Icon nicht gefunden: ${hex}`)
}

async function loadIcons(
  hexes: string[],
): Promise<Map<string, Uint8Array>> {
  const map = new Map<string, Uint8Array>()
  const missing: string[] = []
  for (const hex of hexes) {
    try {
      const path = await downloadIcon(hex)
      map.set(hex, readFileSync(path))
      process.stdout.write('.')
    } catch {
      missing.push(hex)
      process.stdout.write('x')
    }
  }
  process.stdout.write('\n')
  if (missing.length > 0) {
    console.warn(`[Poster] Fehlende Icons (werden übersprungen): ${missing.join(', ')}`)
  }
  return map
}

function stickerSpots(): IconSpot[] {
  return [
    { xMm: 22, yMm: 244, sizeMm: 28, rotate: -8 },
    { xMm: 188, yMm: 244, sizeMm: 28, rotate: 8 },
    { xMm: 22, yMm: 42, sizeMm: 28, rotate: 8 },
    { xMm: 188, yMm: 42, sizeMm: 28, rotate: -8 },
  ]
}

async function drawStickers(
  page: PDFPage,
  doc: PDFDocument,
  theme: PosterTheme,
  icons: Map<string, Uint8Array>,
  embedded: Map<string, PDFImage>,
  spots: IconSpot[],
) {
  const available = theme.icons.filter((hex) => icons.has(hex))
  if (available.length === 0) {
    return
  }
  for (let i = 0; i < spots.length; i++) {
    const spot = spots[i]
    if (!spot) {
      continue
    }
    const hex = available[i % available.length]
    if (!hex) {
      continue
    }
    let image = embedded.get(hex)
    if (!image) {
      const buf = icons.get(hex)
      if (!buf) {
        continue
      }
      image = await doc.embedPng(buf)
      embedded.set(hex, image)
    }
    const size = mmToPt(spot.sizeMm)
    page.drawImage(image, {
      x: mmToPt(spot.xMm) - size / 2,
      y: mmToPt(spot.yMm) - size / 2,
      width: size,
      height: size,
      rotate: degrees(spot.rotate),
      opacity: 0.96,
    })
  }
}

function drawWash(page: PDFPage, theme: PosterTheme) {
  const bg = hexToRgb(theme.background)
  const accent = hexToRgb(theme.accent)
  const pageW = mmToPt(A4_WIDTH_MM)
  const pageH = mmToPt(A4_HEIGHT_MM)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageW,
    height: pageH,
    color: bg,
  })
  page.drawCircle({
    x: mmToPt(28),
    y: mmToPt(250),
    size: mmToPt(42),
    color: mix(bg, accent, 0.22),
    opacity: 0.7,
  })
  page.drawCircle({
    x: mmToPt(188),
    y: mmToPt(70),
    size: mmToPt(54),
    color: mix(bg, accent, 0.18),
    opacity: 0.65,
  })
  page.drawCircle({
    x: mmToPt(40),
    y: mmToPt(36),
    size: mmToPt(28),
    color: mix(bg, hexToRgb('#FFFFFF'), 0.45),
    opacity: 0.8,
  })
}

async function drawCoverGarland(
  page: PDFPage,
  doc: PDFDocument,
  icons: Map<string, Uint8Array>,
  embedded: Map<string, PDFImage>,
) {
  const row = ['1F388', '1F389', '2728']
  const y = mmToPt(278)
  const size = mmToPt(16)
  const start = mmToPt(72)
  const step = mmToPt(32)
  for (let i = 0; i < row.length; i++) {
    const hex = row[i]
    if (!hex || !icons.has(hex)) {
      continue
    }
    let image = embedded.get(hex)
    if (!image) {
      const buf = icons.get(hex)
      if (!buf) {
        continue
      }
      image = await doc.embedPng(buf)
      embedded.set(hex, image)
    }
    page.drawImage(image, {
      x: start + i * step,
      y,
      width: size,
      height: size,
    })
  }
}

async function drawCover(
  page: PDFPage,
  doc: PDFDocument,
  theme: PosterTheme,
  fonts: { regular: PDFFont; bold: PDFFont },
  icons: Map<string, Uint8Array>,
  embedded: Map<string, PDFImage>,
) {
  drawWash(page, theme)
  await drawCoverGarland(page, doc, icons, embedded)

  const navy = hexToRgb('#082A50')
  const white = hexToRgb('#FFFFFF')
  const sun = hexToRgb('#FBBB24')
  const pageW = mmToPt(A4_WIDTH_MM)
  const centerX = pageW / 2

  const bannerY = mmToPt(210)
  const bannerH = mmToPt(60)
  drawRoundRect(page, mmToPt(16), bannerY, mmToPt(178), bannerH, mmToPt(8), navy)
  drawCenteredText(
    page,
    'Virtueller',
    centerX,
    bannerY + mmToPt(36),
    fonts.bold,
    22,
    white,
  )
  drawCenteredText(
    page,
    'Schulrundgang',
    centerX,
    bannerY + mmToPt(22),
    fonts.bold,
    26,
    white,
  )
  drawCenteredText(
    page,
    theme.subtitle,
    centerX,
    bannerY + mmToPt(8),
    fonts.regular,
    13,
    mix(white, sun, 0.55),
  )

  const schoolHex = '1F3EB'
  const schoolBuf = icons.get(schoolHex)
  if (schoolBuf) {
    let schoolImg = embedded.get(schoolHex)
    if (!schoolImg) {
      schoolImg = await doc.embedPng(schoolBuf)
      embedded.set(schoolHex, schoolImg)
    }
    const size = mmToPt(48)
    page.drawImage(schoolImg, {
      x: centerX - size / 2,
      y: mmToPt(124),
      width: size,
      height: size,
    })
  }

  const wreath = theme.icons.filter((hex) => hex !== '1F3EB' && icons.has(hex))
  const wreathCount = Math.min(wreath.length, 4)
  const wreathCx = centerX
  const wreathCy = mmToPt(148)
  const radius = mmToPt(50)
  for (let i = 0; i < wreathCount; i++) {
    const hex = wreath[i]
    if (!hex) {
      continue
    }
    let image = embedded.get(hex)
    if (!image) {
      const buf = icons.get(hex)
      if (!buf) {
        continue
      }
      image = await doc.embedPng(buf)
      embedded.set(hex, image)
    }
    const angle = -Math.PI / 2 + (i / wreathCount) * Math.PI * 2
    const size = mmToPt(22)
    page.drawImage(image, {
      x: wreathCx + Math.cos(angle) * radius - size / 2,
      y: wreathCy + Math.sin(angle) * radius - size / 2,
      width: size,
      height: size,
      rotate: degrees((i % 2 === 0 ? 1 : -1) * 12),
    })
  }

  drawRoundRect(
    page,
    mmToPt(34),
    mmToPt(22),
    mmToPt(142),
    mmToPt(40),
    mmToPt(8),
    navy,
  )
  drawRoundRect(
    page,
    mmToPt(36),
    mmToPt(24),
    mmToPt(138),
    mmToPt(36),
    mmToPt(7),
    white,
  )
  drawCenteredText(
    page,
    theme.hint,
    centerX,
    mmToPt(44),
    fonts.bold,
    13,
    navy,
  )
  drawCenteredText(
    page,
    'Heft-QR plus 12 Räume · OpenMoji CC BY-SA 4.0',
    centerX,
    mmToPt(32),
    fonts.regular,
    9,
    hexToRgb('#6B89B4'),
  )
}

async function drawQrPage(
  page: PDFPage,
  doc: PDFDocument,
  theme: PosterTheme,
  qrPng: Uint8Array,
  fonts: { regular: PDFFont; bold: PDFFont },
  icons: Map<string, Uint8Array>,
  embedded: Map<string, PDFImage>,
) {
  drawWash(page, theme)
  await drawStickers(page, doc, theme, icons, embedded, stickerSpots())

  const navy = hexToRgb('#082A50')
  const white = hexToRgb('#FFFFFF')
  const ribbon = hexToRgb(theme.ribbon)
  const pageW = mmToPt(A4_WIDTH_MM)
  const centerX = pageW / 2

  page.drawRectangle({
    x: 0,
    y: mmToPt(A4_HEIGHT_MM - 36),
    width: pageW,
    height: mmToPt(36),
    color: ribbon,
  })
  drawCenteredText(
    page,
    theme.title,
    centerX,
    mmToPt(A4_HEIGHT_MM - 23),
    fonts.bold,
    20,
    white,
  )

  const cardW = mmToPt(QR_MM + QR_PAD_MM * 2 + 8)
  const cardH = mmToPt(QR_MM + QR_PAD_MM * 2 + 42)
  const cardX = centerX - cardW / 2
  const cardY = mmToPt(54)

  drawRoundRect(
    page,
    cardX + mmToPt(2.5),
    cardY - mmToPt(2.8),
    cardW,
    cardH,
    mmToPt(10),
    mix(ribbon, navy, 0.4),
  )
  drawRoundRect(page, cardX, cardY, cardW, cardH, mmToPt(10), ribbon)
  drawRoundRect(
    page,
    cardX + mmToPt(2.2),
    cardY + mmToPt(2.2),
    cardW - mmToPt(4.4),
    cardH - mmToPt(4.4),
    mmToPt(8),
    white,
  )

  drawCenteredText(
    page,
    theme.subtitle,
    centerX,
    cardY + cardH - mmToPt(16),
    fonts.regular,
    12,
    navy,
  )

  const qrImage = await doc.embedPng(qrPng)
  const qrSize = mmToPt(QR_MM)
  page.drawImage(qrImage, {
    x: centerX - qrSize / 2,
    y: cardY + mmToPt(QR_PAD_MM + 14),
    width: qrSize,
    height: qrSize,
  })

  drawCenteredText(
    page,
    theme.hint,
    centerX,
    cardY + mmToPt(10),
    fonts.bold,
    11,
    ribbon,
  )

  drawCenteredText(
    page,
    'Schulnavigator  ·  OpenMoji CC BY-SA 4.0',
    centerX,
    mmToPt(16),
    fonts.regular,
    8,
    hexToRgb('#6B89B4'),
  )
}

function posterQrThemes(): Array<PosterTheme & { qrFile: string }> {
  return POSTER_THEMES.filter(
    (theme): theme is PosterTheme & { qrFile: string } =>
      theme.kind === 'qr' && theme.qrFile !== null,
  )
}

async function writeVsrGridPdf(): Promise<string> {
  const items: QrPrintItem[] = []
  const buffers = new Map<string, Uint8Array>()

  for (const theme of posterQrThemes()) {
    const qrPath = join(qrDir, theme.qrFile)
    if (!existsSync(qrPath)) {
      throw new Error(`QR-Datei fehlt: ${qrPath}`)
    }
    items.push({
      id: theme.id,
      label: theme.title,
      subtitle: theme.subtitle,
      url: theme.qrFile,
      kind: theme.id.startsWith('entry-') ? 'entry' : 'room',
    })
    buffers.set(theme.id, new Uint8Array(readFileSync(qrPath)))
  }

  const outPath = join(pdfDir, 'qr-vsr-a4-grid-3cm.pdf')
  writeFileSync(outPath, await buildA4GridPdf(items, buffers))
  return outPath
}

async function main() {
  mkdirSync(pdfDir, { recursive: true })
  mkdirSync(cacheDir, { recursive: true })

  const gridOnly = process.argv.includes('--grid-only')
  if (gridOnly) {
    const gridPath = await writeVsrGridPdf()
    console.log(`[Poster] 3-cm-Raster geschrieben: ${gridPath}`)
    console.log(`[Poster] ${posterQrThemes().length} QR-Codes (5×6-Raster, 30×30 mm).`)
    return
  }

  const boldPath = existsSync(FONT_BOLD) ? FONT_BOLD : FONT_BOLD_FALLBACK
  if (!existsSync(FONT_REGULAR) || !existsSync(boldPath)) {
    throw new Error('Systemschrift Arial nicht gefunden.')
  }

  console.log('[Poster] Lade OpenMoji-Icons …')
  const icons = await loadIcons(uniqueIconHexes(POSTER_THEMES))
  console.log(`[Poster] ${icons.size} Icons bereit.`)

  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  doc.setTitle('Virtueller Schulrundgang — QR-Poster')
  doc.setAuthor('Schulnavigator / 39. Grundschule Dresden')
  doc.setSubject('OpenMoji-Poster mit Raum-QR-Codes')
  const fonts = {
    regular: await doc.embedFont(readFileSync(FONT_REGULAR)),
    bold: await doc.embedFont(readFileSync(boldPath)),
  }
  const embedded = new Map<string, PDFImage>()

  for (const theme of POSTER_THEMES) {
    const page = doc.addPage([mmToPt(A4_WIDTH_MM), mmToPt(A4_HEIGHT_MM)])
    if (theme.kind === 'cover') {
      await drawCover(page, doc, theme, fonts, icons, embedded)
      continue
    }
    if (!theme.qrFile) {
      continue
    }
    const qrPath = join(qrDir, theme.qrFile)
    if (!existsSync(qrPath)) {
      throw new Error(`QR-Datei fehlt: ${qrPath}`)
    }
    const qrPng = readFileSync(qrPath)
    await drawQrPage(page, doc, theme, qrPng, fonts, icons, embedded)
  }

  const outPath = join(pdfDir, 'qr-vsr-a4.pdf')
  writeFileSync(outPath, await doc.save())
  console.log(`[Poster] PDF geschrieben: ${outPath}`)
  console.log(`[Poster] ${POSTER_THEMES.length} Seiten (1 Deckblatt + ${POSTER_THEMES.length - 1} QR).`)

  const gridPath = await writeVsrGridPdf()
  console.log(`[Poster] 3-cm-Raster geschrieben: ${gridPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
