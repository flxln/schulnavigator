import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFFont,
} from 'pdf-lib'
import type { QrPrintItem } from './qr-print-items'

export const MM_TO_PT = 72 / 25.4

export const A4_WIDTH_MM = 210
export const A4_HEIGHT_MM = 297

export const TWO_UP_ITEMS_PER_PAGE = 2
export const TWO_UP_QR_MM = 110

export const GRID_QR_MM = 30
export const GRID_MARGIN_MM = 10
export const GRID_CELL_WIDTH_MM = 35
export const GRID_CELL_HEIGHT_MM = 42
export const GRID_COLS = 5
export const GRID_ROWS = 6
export const GRID_ITEMS_PER_PAGE = GRID_COLS * GRID_ROWS

export function mmToPt(mm: number): number {
  return mm * MM_TO_PT
}

export function chunk<T>(items: T[], perPage: number): T[][] {
  if (items.length === 0) {
    return []
  }
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage))
  }
  return pages
}

export function pageCountForItems(
  itemCount: number,
  perPage: number,
): number {
  if (itemCount === 0) {
    return 0
  }
  return Math.ceil(itemCount / perPage)
}

export function truncateToWidth(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidthPt: number,
): string {
  if (font.widthOfTextAtSize(text, fontSize) <= maxWidthPt) {
    return text
  }
  const ellipsis = '…'
  let trimmed = text
  while (
    trimmed.length > 0 &&
    font.widthOfTextAtSize(trimmed + ellipsis, fontSize) > maxWidthPt
  ) {
    trimmed = trimmed.slice(0, -1)
  }
  return trimmed.length > 0 ? trimmed + ellipsis : ellipsis
}

function drawCenteredText(
  page: PDFPage,
  text: string,
  centerX: number,
  y: number,
  font: PDFFont,
  fontSize: number,
  maxWidthPt: number,
) {
  const display = truncateToWidth(text, font, fontSize, maxWidthPt)
  const width = font.widthOfTextAtSize(display, fontSize)
  page.drawText(display, {
    x: centerX - width / 2,
    y,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  })
}

async function drawZoneItem(
  page: PDFPage,
  doc: PDFDocument,
  item: QrPrintItem,
  qrPng: Uint8Array,
  zoneBottomMm: number,
  zoneHeightMm: number,
  fontRegular: PDFFont,
  fontBold: PDFFont,
) {
  const zoneBottom = mmToPt(zoneBottomMm)
  const zoneHeight = mmToPt(zoneHeightMm)
  const zoneCenterX = mmToPt(A4_WIDTH_MM / 2)
  const zoneCenterY = zoneBottom + zoneHeight / 2

  const labelSize = 11
  const subtitleSize = 9
  const textBlockPt = mmToPt(14)
  const qrSizePt = mmToPt(TWO_UP_QR_MM)
  const totalHeight = qrSizePt + textBlockPt
  const qrBottom = zoneCenterY - totalHeight / 2

  const image = await doc.embedPng(qrPng)
  page.drawImage(image, {
    x: zoneCenterX - qrSizePt / 2,
    y: qrBottom,
    width: qrSizePt,
    height: qrSizePt,
  })

  const labelY = qrBottom - labelSize - 2
  drawCenteredText(
    page,
    item.label,
    zoneCenterX,
    labelY,
    fontBold,
    labelSize,
    mmToPt(A4_WIDTH_MM - 20),
  )
  drawCenteredText(
    page,
    item.subtitle,
    zoneCenterX,
    labelY - subtitleSize - 2,
    fontRegular,
    subtitleSize,
    mmToPt(A4_WIDTH_MM - 20),
  )
}

function drawCutLine(page: PDFPage) {
  const y = mmToPt(A4_HEIGHT_MM / 2)
  page.drawLine({
    start: { x: mmToPt(8), y },
    end: { x: mmToPt(A4_WIDTH_MM - 8), y },
    thickness: 0.5,
    color: rgb(0.55, 0.55, 0.55),
    dashArray: [4, 4],
    dashPhase: 0,
  })
}

export async function buildA4TwoUpPdf(
  items: QrPrintItem[],
  qrBuffers: ReadonlyMap<string, Uint8Array>,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const halfHeightMm = A4_HEIGHT_MM / 2
  const pages = chunk(items, TWO_UP_ITEMS_PER_PAGE)

  for (const pageItems of pages) {
    const page = doc.addPage([mmToPt(A4_WIDTH_MM), mmToPt(A4_HEIGHT_MM)])
    drawCutLine(page)

    if (pageItems[0]) {
      const buf = qrBuffers.get(pageItems[0].id)
      if (buf) {
        await drawZoneItem(
          page,
          doc,
          pageItems[0],
          buf,
          halfHeightMm,
          halfHeightMm,
          fontRegular,
          fontBold,
        )
      }
    }
    if (pageItems[1]) {
      const buf = qrBuffers.get(pageItems[1].id)
      if (buf) {
        await drawZoneItem(
          page,
          doc,
          pageItems[1],
          buf,
          0,
          halfHeightMm,
          fontRegular,
          fontBold,
        )
      }
    }
  }

  return doc.save()
}

export async function buildA4GridPdf(
  items: QrPrintItem[],
  qrBuffers: ReadonlyMap<string, Uint8Array>,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const pages = chunk(items, GRID_ITEMS_PER_PAGE)
  const qrSizePt = mmToPt(GRID_QR_MM)
  const cellW = mmToPt(GRID_CELL_WIDTH_MM)
  const cellH = mmToPt(GRID_CELL_HEIGHT_MM)
  const margin = mmToPt(GRID_MARGIN_MM)
  const labelSize = 8
  const subtitleSize = 7
  const textGap = 2

  for (const pageItems of pages) {
    const page = doc.addPage([mmToPt(A4_WIDTH_MM), mmToPt(A4_HEIGHT_MM)])
    const pageH = mmToPt(A4_HEIGHT_MM)

    for (let i = 0; i < pageItems.length; i++) {
      const item = pageItems[i]
      const col = i % GRID_COLS
      const row = Math.floor(i / GRID_COLS)
      const cellLeft = margin + col * cellW
      const cellTop = pageH - margin - row * cellH
      const cellCenterX = cellLeft + cellW / 2

      const buf = qrBuffers.get(item.id)
      if (!buf) {
        continue
      }
      const image = await doc.embedPng(buf)
      const qrX = cellCenterX - qrSizePt / 2
      const qrY = cellTop - cellH + (cellH - qrSizePt) / 2 + mmToPt(4)
      page.drawImage(image, {
        x: qrX,
        y: qrY,
        width: qrSizePt,
        height: qrSizePt,
      })

      const labelY = qrY - labelSize - textGap
      drawCenteredText(
        page,
        item.label,
        cellCenterX,
        labelY,
        fontBold,
        labelSize,
        cellW - mmToPt(2),
      )
      drawCenteredText(
        page,
        item.subtitle,
        cellCenterX,
        labelY - subtitleSize - textGap,
        fontRegular,
        subtitleSize,
        cellW - mmToPt(2),
      )
    }
  }

  return doc.save()
}
