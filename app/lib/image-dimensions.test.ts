import { describe, expect, it } from 'vitest'
import {
  jpegDimensionsFromBuffer,
  readImageDimensions,
  webpDimensionsFromBuffer,
} from '@/lib/image-dimensions'

function makeJpegSofSegment(width: number, height: number): Buffer {
  const sof = Buffer.alloc(17)
  sof[0] = 0xff
  sof[1] = 0xc0
  sof.writeUInt16BE(15, 2)
  sof[4] = 0x08
  sof.writeUInt16BE(height, 5)
  sof.writeUInt16BE(width, 7)
  sof[9] = 0x01
  sof[10] = 0x11
  sof[11] = 0x00
  sof[12] = 0x03
  sof[13] = 0x11
  sof[14] = 0x01
  sof[15] = 0x11
  sof[16] = 0x01
  return sof
}

function makeMinimalJpeg(width: number, height: number, exifPadBytes = 0, padTo = 1024): Buffer {
  const chunks: Buffer[] = [Buffer.from([0xff, 0xd8])]
  if (exifPadBytes > 0) {
    const app1 = Buffer.alloc(4 + exifPadBytes)
    app1[0] = 0xff
    app1[1] = 0xe1
    app1.writeUInt16BE(exifPadBytes + 2, 2)
    chunks.push(app1)
  }
  chunks.push(makeJpegSofSegment(width, height))
  const buf = Buffer.concat(chunks)
  const tail = Buffer.alloc(Math.max(0, padTo - buf.length), 0)
  return Buffer.concat([buf, tail])
}

function makeMinimalWebpVp8x(width: number, height: number): Buffer {
  const buf = Buffer.alloc(30)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(22, 4)
  buf.write('WEBP', 8)
  buf.write('VP8X', 12)
  buf.writeUInt32LE(10, 16)
  buf[20] = 0x10
  const w = width - 1
  const h = height - 1
  buf[24] = w & 0xff
  buf[25] = (w >> 8) & 0xff
  buf[26] = (w >> 16) & 0xff
  buf[27] = h & 0xff
  buf[28] = (h >> 8) & 0xff
  buf[29] = (h >> 16) & 0xff
  return Buffer.concat([buf, Buffer.alloc(1024)])
}

describe('image-dimensions', () => {
  it('liest JPEG-Dimensionen ohne Exif-Pad', () => {
    const buf = makeMinimalJpeg(250, 100)
    expect(jpegDimensionsFromBuffer(buf)).toEqual({ width: 250, height: 100 })
    expect(readImageDimensions(buf)?.format).toBe('jpeg')
  })

  it('liest JPEG-Dimensionen hinter großem Exif-Block (Befund ¹)', () => {
    const buf = makeMinimalJpeg(3000, 1200, 8192)
    expect(jpegDimensionsFromBuffer(buf)).toEqual({ width: 3000, height: 1200 })
  })

  it('liest WebP VP8X-Dimensionen', () => {
    const buf = makeMinimalWebpVp8x(2048, 1024)
    expect(webpDimensionsFromBuffer(buf)).toEqual({ width: 2048, height: 1024 })
    expect(readImageDimensions(buf)?.format).toBe('webp')
  })
})
