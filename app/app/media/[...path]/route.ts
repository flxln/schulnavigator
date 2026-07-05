import { createReadStream, statSync } from 'node:fs'
import { Readable } from 'node:stream'
import { cookies } from 'next/headers'
import { isAccessGated } from '@/lib/access-config'
import { ACCESS_COOKIE, validateToken } from '@/lib/access-tokens'
import {
  publicMediaContentType,
  resolvePublicMediaFilePath,
} from '@/lib/public-media-file'

type RouteParams = { params: Promise<{ path: string[] }> }

const PRIVATE_CACHE = 'private, max-age=3600'

function streamToWeb(stream: Readable): ReadableStream<Uint8Array> {
  return Readable.toWeb(stream) as ReadableStream<Uint8Array>
}

export async function GET(request: Request, { params }: RouteParams) {
  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_COOKIE)?.value
  if (isAccessGated() && !validateToken(token)) {
    // Bewusst 403 ohne Body (kein 307-Redirect wie Middleware):
    // <video>/<img> können 307 nicht folgen und bekämen HTML statt Binärdaten.
    return new Response(null, {
      status: 403,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const { path } = await params
  const filePath = resolvePublicMediaFilePath(path)
  if (!filePath) {
    return new Response(null, { status: 400 })
  }

  let size: number
  try {
    size = statSync(filePath).size
  } catch {
    return new Response(null, { status: 404 })
  }

  const contentType = publicMediaContentType(filePath)
  const range = request.headers.get('range')

  if (!range) {
    const stream = createReadStream(filePath)
    return new Response(streamToWeb(stream), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(size),
        'Accept-Ranges': 'bytes',
        'Cache-Control': PRIVATE_CACHE,
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
      'Content-Type': contentType,
      'Content-Length': String(chunkSize),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': PRIVATE_CACHE,
    },
  })
}
