import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateCoachMessages } from './validate-coach-messages.mjs'

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const result = validateCoachMessages({ appRoot, checkAudioFiles: false })

if (!result.ok) {
  process.exit(1)
}

console.log(
  `validate:coach:structure OK (${result.messageCount} Messages, ${result.stationCount} Stationen)`,
)
