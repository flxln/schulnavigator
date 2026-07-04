import { createReadStream, statSync } from 'node:fs'
import { Readable } from 'node:stream'
import {
  publicMediaContentType,
  resolvePublicMediaFilePath,
} from '@/lib/public-media-file'

type RouteParams = { params: Promise<{ path: string[] }> }

function streamToWeb(stream: Readable): ReadableStream<Uint8Array> {
  return Readable.toWeb(stream) as ReadableStream<Uint8Array>
}

export async function GET(request: Request, { params }: RouteParams) {
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
        'Cache-Control': 'public, max-age=3600',
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
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
