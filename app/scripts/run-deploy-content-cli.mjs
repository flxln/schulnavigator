#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'url'
import { loadEnvLocal } from './load-env-local.mjs'

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
loadEnvLocal(appRoot)

const scriptPath = join(appRoot, 'scripts', 'deploy-content.sh')
const args = process.argv.slice(2)

const result = spawnSync('bash', [scriptPath, ...args], {
  cwd: appRoot,
  env: process.env,
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
