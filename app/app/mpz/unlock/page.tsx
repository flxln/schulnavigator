import { Suspense } from 'react'
import MpzStudioUnlockForm from './unlock-form'

export default function MpzStudioUnlockPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-6 py-10 text-sm text-fg-2">Laden …</main>
      }
    >
      <MpzStudioUnlockForm />
    </Suspense>
  )
}
