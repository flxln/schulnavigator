import { join } from 'node:path'
import {
  DIALOG_CLIP_RE,
  buildClipName,
  dialogApiQuelle,
  parseDialogApiPath,
} from '@/lib/dialog-audio-naming'
import { getStationsPaths } from '@/lib/mpz-content-io'

export { DIALOG_CLIP_RE, buildClipName, dialogApiQuelle, parseDialogApiPath }

export function dialogAudioFsPath(appRoot: string, slug: string, clip: string): string {
  return join(appRoot, 'content', 'dialog-audio', slug, clip)
}

/** Laufzeit-Pfad — immer über `getStationsPaths().appRoot`, nicht `process.cwd()`. */
export function dialogAudioFilePath(slug: string, clip: string): string {
  return dialogAudioFsPath(getStationsPaths().appRoot, slug, clip)
}
