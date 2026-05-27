import { createReadStream, statSync } from 'node:fs'
import { Readable } from 'node:stream'
import { cookies } from 'next/headers'
import { ACCESS_COOKIE, validateToken } from '@/lib/access-tokens'
import { DIALOG_CLIP_RE, dialogAudioFilePath } from '@/lib/dialog-audio'
import { getAllSlugs } from '@/lib/stations'

type RouteParams = { params: Promise<{ slug: string; clip: string }> }

const VALID_SLUGS = new Set(getAllSlugs().map((s) => s.slug))

function streamToWeb(stream: Readable): ReadableStream<Uint8Array> {
  return Readable.toWeb(stream) as ReadableStream<Uint8Array>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug, clip } = await params

  if (!VALID_SLUGS.has(slug) || !DIALOG_CLIP_RE.test(clip)) {
    return new Response(null, { status: 400 })
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_COOKIE)?.value
  if (!validateToken(token)) {
    return new Response(null, { status: 403 })
  }

  let filePath: string
  try {
    filePath = dialogAudioFilePath(slug, clip)
    statSync(filePath)
  } catch {
    return new Response(null, { status: 404 })
  }

  const { size } = statSync(filePath)
  const range = request.headers.get('range')

  if (!range) {
    const stream = createReadStream(filePath)
    return new Response(streamToWeb(stream), {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': String(size),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, no-store',
      },
    })
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range)
  if (!match) {
    return new Response(null, { status: 416 })
  }

  let start = match[1] ? Number.parseInt(match[1], 10) : 0
  let end = match[2] ? Number.parseInt(match[2], 10) : size - 1

  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${size}` },
    })
  }

  end = Math.min(end, size - 1)
  const chunkSize = end - start + 1
  const stream = createReadStream(filePath, { start, end })

  return new Response(streamToWeb(stream), {
    status: 206,
    headers: {
      'Content-Type': 'audio/wav',
      'Content-Length': String(chunkSize),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, no-store',
    },
  })
}
