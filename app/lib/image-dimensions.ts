export type ImageDimensions = { width: number; height: number }
export type ImageFormat = 'jpeg' | 'webp'

const JPEG_MAGIC = Buffer.from([0xff, 0xd8])

export function jpegDimensionsFromBuffer(buf: Buffer): ImageDimensions | null {
  let i = 2
  while (i < buf.length - 8) {
    if (buf[i] !== 0xff) return null
    const marker = buf[i + 1]
    if (marker === 0xc0 || marker === 0xc2) {
      return {
        height: buf.readUInt16BE(i + 5),
        width: buf.readUInt16BE(i + 7),
      }
    }
    const len = buf.readUInt16BE(i + 2)
    i += 2 + len
  }
  return null
}

export function webpDimensionsFromBuffer(buf: Buffer): ImageDimensions | null {
  if (buf.length < 12) return null
  if (buf.toString('ascii', 0, 4) !== 'RIFF') return null
  if (buf.toString('ascii', 8, 12) !== 'WEBP') return null

  const chunkType = buf.toString('ascii', 12, 16)
  if (chunkType === 'VP8 ') {
    if (buf.length < 30) return null
    const width = buf.readUInt16LE(26) & 0x3fff
    const height = buf.readUInt16LE(28) & 0x3fff
    return { width, height }
  }
  if (chunkType === 'VP8L') {
    if (buf.length < 25) return null
    const bits = buf.readUInt32LE(21)
    const width = (bits & 0x3fff) + 1
    const height = ((bits >> 14) & 0x3fff) + 1
    return { width, height }
  }
  if (chunkType === 'VP8X') {
    if (buf.length < 30) return null
    const width = 1 + buf.readUIntLE(24, 3)
    const height = 1 + buf.readUIntLE(27, 3)
    return { width, height }
  }
  return null
}

export function readImageDimensions(
  buf: Buffer,
): { format: ImageFormat; dimensions: ImageDimensions } | null {
  if (buf.length >= 2 && buf[0] === JPEG_MAGIC[0] && buf[1] === JPEG_MAGIC[1]) {
    const dimensions = jpegDimensionsFromBuffer(buf)
    if (!dimensions) return null
    return { format: 'jpeg', dimensions }
  }
  const webpDims = webpDimensionsFromBuffer(buf)
  if (webpDims) {
    return { format: 'webp', dimensions: webpDims }
  }
  return null
}
