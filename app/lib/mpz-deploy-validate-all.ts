import {
  runNpmScript,
  truncateDeployOutput,
  type RunNpmScriptResult,
} from '@/lib/mpz-deploy-runner'
import { defaultAppRoot } from '@/lib/mpz-env-local'

export type DeployValidateStepName =
  | 'validate:stations'
  | 'validate:coach'
  | 'validate:tokens'
  | 'test'

export type DeployValidateStep = {
  name: DeployValidateStepName
  exitCode: number
  stdout: string
  stderr: string
}

export type DeployValidateAllResult = {
  ok: boolean
  steps: DeployValidateStep[]
}

const VALIDATE_ALL_STEPS: DeployValidateStepName[] = [
  'validate:stations',
  'validate:coach',
  'validate:tokens',
  'test',
]

function toStep(name: DeployValidateStepName, result: RunNpmScriptResult): DeployValidateStep {
  return {
    name,
    exitCode: result.exitCode,
    stdout: truncateDeployOutput(result.stdout),
    stderr: truncateDeployOutput(result.stderr),
  }
}

export async function runDeployValidateAll(
  appRoot: string = defaultAppRoot(),
): Promise<DeployValidateAllResult> {
  const steps: DeployValidateStep[] = []

  for (const name of VALIDATE_ALL_STEPS) {
    const result = await runNpmScript(name, [], { cwd: appRoot })
    steps.push(toStep(name, result))
  }

  return {
    ok: steps.every((step) => step.exitCode === 0),
    steps,
  }
}
