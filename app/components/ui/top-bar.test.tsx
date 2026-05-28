/** @vitest-environment node */
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { TopBar } from '@/components/ui/top-bar'

describe('TopBar', () => {
  it('uses w-[38px] right mirror without leftExtra', () => {
    const html = renderToStaticMarkup(<TopBar title="Titel" onBack={() => {}} />)
    expect(html).toContain('w-[38px]')
    expect(html).not.toContain('w-[84px]')
  })

  it('uses w-[84px] right mirror when leftExtra is set', () => {
    const html = renderToStaticMarkup(
      <TopBar
        title="Titel"
        onBack={() => {}}
        leftExtra={
          <button type="button" aria-label="Dialog beenden">
            X
          </button>
        }
      />,
    )
    expect(html).toContain('w-[84px]')
  })
})
