import { describe, expect, it } from 'vitest'
import {
  HEADER_SLICE_BYTES,
  MpzUploadError,
  UPLOAD_RULES,
  isUploadTyp,
  sanitizeFilename,
  slugifyId,
  validateUpload,
} from '@/lib/mpz-upload-rules'

function pad(b: Buffer, n = 64): Buffer {
  return Buffer.concat([b, Buffer.alloc(Math.max(0, n - b.length))])
}

const FIXTURES = {
  jpeg: pad(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00])),
  webp: pad(Buffer.concat([Buffer.from('RIFF'), Buffer.from([0x24, 0, 0, 0]), Buffer.from('WEBPVP8 ')])),
  wav: pad(Buffer.concat([Buffer.from('RIFF'), Buffer.from([0x24, 0, 0, 0]), Buffer.from('WAVEfmt ')])),
  mp3: pad(Buffer.from([0xff, 0xfb, 0x90, 0x44, 0, 0, 0, 0])),
  mp4: pad(Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypisom'), Buffer.from([0, 0, 0, 0]), Buffer.from('isommp42')])),
  m4a: pad(Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypM4A '), Buffer.from([0, 0, 0, 0]), Buffer.from('M4A mp42')])),
  heic: pad(Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypheic'), Buffer.from([0, 0, 0, 0]), Buffer.from('heicmif1')])),
  pdf: pad(Buffer.from('%PDF-1.4\n')),
  textMd: Buffer.from('# Überschrift\n\nHallo Welt.', 'utf8'),
}

async function expectReject(input: Parameters<typeof validateUpload>[0]) {
  await expect(validateUpload(input)).rejects.toBeInstanceOf(MpzUploadError)
}

describe('mpz-upload-rules · isUploadTyp', () => {
  it('akzeptiert die vier Upload-Typen, lehnt link/embed ab', () => {
    expect(isUploadTyp('audio')).toBe(true)
    expect(isUploadTyp('video')).toBe(true)
    expect(isUploadTyp('foto')).toBe(true)
    expect(isUploadTyp('text')).toBe(true)
    expect(isUploadTyp('link')).toBe(false)
    expect(isUploadTyp('embed')).toBe(false)
  })
})

describe('mpz-upload-rules · slugifyId / sanitizeFilename', () => {
  it('slugifyId normalisiert Umlaute und Sonderzeichen', () => {
    expect(slugifyId('Mäuse & Co!')).toBe('mause-co')
  })

  it('AirDrop-HEIC-Name bekommt erzwungene Foto-Endung (jpg)', () => {
    expect(sanitizeFilename('IMG_1234.HEIC', 'foto')).toBe('img-1234.jpg')
  })

  it('erlaubte Endung bleibt erhalten', () => {
    expect(sanitizeFilename('Mein Clip.mp3', 'audio')).toBe('mein-clip.mp3')
    expect(sanitizeFilename('Foto.webp', 'foto')).toBe('foto.webp')
  })

  it('fremde Audio-Endung wird auf Default mp3 normiert', () => {
    expect(sanitizeFilename('ton.ogg', 'audio')).toBe('ton.mp3')
  })
})

describe('mpz-upload-rules · validateUpload Magic-Bytes', () => {
  it('akzeptiert gültige Audio-Header (mp3/wav/m4a)', async () => {
    for (const buf of [FIXTURES.mp3, FIXTURES.wav, FIXTURES.m4a]) {
      await expect(
        validateUpload({ typ: 'audio', headerSlice: buf, byteLength: buf.length, originalName: 'a' }),
      ).resolves.toBeUndefined()
    }
  })

  it('akzeptiert gültiges MP4 (Video)', async () => {
    await expect(
      validateUpload({ typ: 'video', headerSlice: FIXTURES.mp4, byteLength: FIXTURES.mp4.length, originalName: 'v.mp4' }),
    ).resolves.toBeUndefined()
  })

  it('akzeptiert JPEG und WebP (Foto)', async () => {
    for (const buf of [FIXTURES.jpeg, FIXTURES.webp]) {
      await expect(
        validateUpload({ typ: 'foto', headerSlice: buf, byteLength: buf.length, originalName: 'f' }),
      ).resolves.toBeUndefined()
    }
  })

  it('lehnt HEIC als Foto ab (Befund: HEIC nicht unterstützt)', async () => {
    await expectReject({
      typ: 'foto',
      headerSlice: FIXTURES.heic,
      byteLength: FIXTURES.heic.length,
      originalName: 'IMG_1.heic',
    })
    await expect(
      validateUpload({ typ: 'foto', headerSlice: FIXTURES.heic, byteLength: FIXTURES.heic.length, originalName: 'IMG_1.heic' }),
    ).rejects.toThrow(/HEIC/i)
  })

  it('lehnt PDF ab, das als MP4 getarnt ist', async () => {
    await expectReject({
      typ: 'video',
      headerSlice: FIXTURES.pdf,
      byteLength: FIXTURES.pdf.length,
      originalName: 'fake.mp4',
    })
  })

  it('lehnt Foto-Inhalt als Audio ab (falscher Container)', async () => {
    await expectReject({
      typ: 'audio',
      headerSlice: FIXTURES.jpeg,
      byteLength: FIXTURES.jpeg.length,
      originalName: 'x.mp3',
    })
  })

  it('akzeptiert UTF-8-Text, lehnt Binärdaten (NUL-Stapel) als Text ab', async () => {
    await expect(
      validateUpload({ typ: 'text', headerSlice: FIXTURES.textMd, byteLength: FIXTURES.textMd.length, originalName: 't.md' }),
    ).resolves.toBeUndefined()
    await expectReject({
      typ: 'text',
      headerSlice: FIXTURES.heic,
      byteLength: FIXTURES.heic.length,
      originalName: 't.txt',
    })
  })
})

describe('mpz-upload-rules · Größenlimit', () => {
  it('lehnt zu großes Foto ab (> 8 MB)', async () => {
    await expectReject({
      typ: 'foto',
      headerSlice: FIXTURES.jpeg,
      byteLength: UPLOAD_RULES.foto.maxBytes + 1,
      originalName: 'big.jpg',
    })
  })

  it('akzeptiert Foto genau am Limit', async () => {
    await expect(
      validateUpload({ typ: 'foto', headerSlice: FIXTURES.jpeg, byteLength: UPLOAD_RULES.foto.maxBytes, originalName: 'limit.jpg' }),
    ).resolves.toBeUndefined()
  })

  it('lehnt leere Datei ab', async () => {
    await expectReject({ typ: 'foto', headerSlice: Buffer.alloc(0), byteLength: 0, originalName: 'leer.jpg' })
  })

  it('Video-Limit liegt bei 150 MB', () => {
    expect(UPLOAD_RULES.video.maxBytes).toBe(150 * 1024 * 1024)
    expect(HEADER_SLICE_BYTES).toBeGreaterThanOrEqual(4096)
  })
})
