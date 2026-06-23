import { describe, expect, it } from 'vitest'
import {
  mpzButtonClassName,
  mpzFieldClassName,
  mpzLabelClassName,
  mpzSelectClassName,
  mpzSidebarGroupLabelClassName,
  mpzSidebarNavItemClassName,
  mpzStackClassName,
  mpzTextareaClassName,
} from '@/components/mpz-studio/mpz-form-primitives'

const LEGACY_FIELD_CLASSES = [
  'w-full',
  'rounded-gs39-sm',
  'border',
  'border-border-1',
  'bg-bg-1',
  'px-3',
  'py-2',
  'text-fg-1',
] as const

const FIELD_FOCUS_CLASSES = [
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-accent-alt',
] as const

describe('mpzFieldClassName', () => {
  it('enthält alle Legacy-Klassen (Superset)', () => {
    const cls = mpzFieldClassName()
    for (const token of LEGACY_FIELD_CLASSES) {
      expect(cls).toContain(token)
    }
  })

  it('enthält Focus-Utilities', () => {
    const cls = mpzFieldClassName()
    for (const token of FIELD_FOCUS_CLASSES) {
      expect(cls).toContain(token)
    }
  })
})

describe('mpzSelectClassName', () => {
  it('delegiert an mpzFieldClassName', () => {
    expect(mpzSelectClassName()).toBe(mpzFieldClassName())
  })
})

describe('mpzLabelClassName', () => {
  it('bleibt unverändert', () => {
    expect(mpzLabelClassName()).toBe(
      'mb-1 block text-xs font-semibold text-fg-3',
    )
  })
})

describe('mpzTextareaClassName', () => {
  it('erbt Field-Klassen und min-h', () => {
    const cls = mpzTextareaClassName()
    expect(cls).toContain('min-h-24')
    expect(cls).toContain('rounded-gs39-sm')
    expect(cls).toContain('focus-visible:ring-accent-alt')
  })
})

describe('mpzButtonClassName', () => {
  it('primary nutzt Pill-Radius und Accent', () => {
    const cls = mpzButtonClassName('primary')
    expect(cls).toContain('rounded-mpz-button-pill')
    expect(cls).toContain('bg-accent')
    expect(cls).toContain('border-accent')
  })

  it('secondary nutzt Border-Surface', () => {
    const cls = mpzButtonClassName('secondary')
    expect(cls).toContain('border-border-1')
    expect(cls).toContain('bg-bg-1')
  })

  it('ghost nutzt accent-alt Text', () => {
    expect(mpzButtonClassName('ghost')).toContain('text-accent-alt')
  })

  it('danger nutzt error Token', () => {
    const cls = mpzButtonClassName('danger')
    expect(cls).toContain('border-error')
    expect(cls).toContain('bg-error')
  })
})

describe('mpzSidebarGroupLabelClassName', () => {
  it('rendert Gruppenlabel-Stil', () => {
    expect(mpzSidebarGroupLabelClassName()).toContain('uppercase')
    expect(mpzSidebarGroupLabelClassName()).toContain('text-white/55')
    expect(mpzSidebarGroupLabelClassName()).toContain('tracking-[0.05em]')
    expect(mpzSidebarGroupLabelClassName()).not.toContain('tracking-wider')
  })

  it('collapsed blendet auf lg ein', () => {
    expect(mpzSidebarGroupLabelClassName(true)).toContain('lg:hidden')
  })
})

describe('mpzSidebarNavItemClassName', () => {
  it('active nutzt border-accent und border-l-4', () => {
    const cls = mpzSidebarNavItemClassName({ active: true })
    expect(cls).toContain('border-accent')
    expect(cls).toContain('border-l-4')
    expect(cls).toContain('text-white')
  })

  it('inactive ist transparent', () => {
    const cls = mpzSidebarNavItemClassName({ active: false })
    expect(cls).toContain('border-transparent')
    expect(cls).toContain('text-white/65')
  })

  it('collapsed zentriert auf lg', () => {
    expect(
      mpzSidebarNavItemClassName({ active: false, collapsed: true }),
    ).toContain('lg:justify-center')
  })

  it('density room nutzt kompaktes Layout', () => {
    const cls = mpzSidebarNavItemClassName({ active: false, density: 'room' })
    expect(cls).toContain('min-h-[40px]')
    expect(cls).toContain('gap-2.5')
    expect(cls).toContain('text-[13px]')
    expect(cls).not.toContain('min-h-11')
  })
})

describe('mpzStackClassName', () => {
  it('md enthält flex flex-col und gap-4', () => {
    const cls = mpzStackClassName('md')
    expect(cls).toContain('flex')
    expect(cls).toContain('flex-col')
    expect(cls).toContain('gap-4')
  })

  it('sm nutzt gap-2', () => {
    expect(mpzStackClassName('sm')).toContain('gap-2')
  })

  it('lg nutzt gap-6', () => {
    expect(mpzStackClassName('lg')).toContain('gap-6')
  })
})
