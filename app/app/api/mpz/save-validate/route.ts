import { readFile, stat } from 'node:fs/promises'
import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import {
  canonicalizeStationsFile,
  createMpzContentIo,
  MpzContentIoError,
  serializeStationsFile,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import { runMpzStudioValidation } from '@/lib/mpz-studio-overview'

export const runtime = 'nodejs'

export type MpzSaveValidateResponse = {
  report: Awaited<ReturnType<typeof runMpzStudioValidation>>
  rolledBack: boolean
  saved: boolean
  postWriteMtime: string | null
}

async function currentMtime(stationsPath: string): Promise<string | null> {
  try {
    const info = await stat(stationsPath)
    return info.mtime.toISOString()
  } catch {
    return null
  }
}

export const POST = withMpzStudioAccess(async (_req: NextRequest) => {
  let rolledBack = false
  let saved = false
  let postWriteMtime: string | null = null

  const io = createMpzContentIo()
  const { stationsPath } = io.getPaths()

  try {
    await withMpzWriteLock(async () => {
      const before = await readFile(stationsPath, 'utf8')
      const data = await io.readStations()
      const canonical = canonicalizeStationsFile(data)
      const afterSerialized = serializeStationsFile(canonical)

      const writeResult = await io.writeStations(canonical, {
        strict: true,
        canonicalize: true,
        makeBackup: true,
        postValidate: true,
      })

      saved = before !== afterSerialized
      postWriteMtime = writeResult.mtime
    })
  } catch (err) {
    if (err instanceof MpzContentIoError && err.code === 'VALIDATION') {
      rolledBack = true
      postWriteMtime = await currentMtime(stationsPath)
    } else if (err instanceof MpzContentIoError) {
      return NextResponse.json(
        { error: 'io', message: err.message },
        { status: 500 },
      )
    } else {
      return NextResponse.json(
        {
          error: 'save_validate_failed',
          message: err instanceof Error ? err.message : 'Unbekannter Fehler',
        },
        { status: 500 },
      )
    }
  }

  const report = await runMpzStudioValidation()
  const body: MpzSaveValidateResponse = {
    report,
    rolledBack,
    saved,
    postWriteMtime,
  }
  return NextResponse.json(body)
})
