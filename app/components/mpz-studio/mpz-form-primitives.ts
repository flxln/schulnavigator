const MPZ_FIELD_BASE =
  'w-full rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1'

const MPZ_FIELD_FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-alt'

export function mpzFieldClassName(): string {
  return `${MPZ_FIELD_BASE} ${MPZ_FIELD_FOCUS}`
}

export function mpzLabelClassName(): string {
  return 'mb-1 block text-xs font-semibold text-fg-3'
}

export function mpzSelectClassName(): string {
  return mpzFieldClassName()
}

export function mpzTextareaClassName(): string {
  return `${mpzFieldClassName()} min-h-24`
}

export type MpzButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function mpzButtonClassName(variant: MpzButtonVariant = 'primary'): string {
  const base =
    'inline-flex min-h-11 items-center justify-center rounded-mpz-button-pill px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-alt disabled:cursor-not-allowed disabled:opacity-60'

  switch (variant) {
    case 'primary':
      return `${base} border border-accent bg-accent text-fg-on-dark hover:bg-accent-hover`
    case 'secondary':
      return `${base} border border-border-1 bg-bg-1 text-fg-1 hover:bg-bg-2`
    case 'ghost':
      return `${base} border border-transparent bg-transparent text-accent-alt hover:bg-bg-2`
    case 'danger':
      return `${base} border border-error bg-error text-fg-on-dark hover:bg-error/90`
  }
}

export function mpzSidebarGroupLabelClassName(collapsed = false): string {
  if (collapsed) {
    return 'mt-4 flex items-center justify-between gap-2 px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.05em] text-white/55 lg:hidden'
  }
  return 'mt-4 flex items-center justify-between gap-2 px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.05em] text-white/55'
}

export type MpzSidebarNavItemOptions = {
  active: boolean
  collapsed?: boolean
  density?: 'nav' | 'room'
}

export function mpzSidebarNavItemClassName({
  active,
  collapsed = false,
  density = 'nav',
}: MpzSidebarNavItemOptions): string {
  const size =
    density === 'room'
      ? 'min-h-[40px] gap-2.5 py-1.5 text-[13px]'
      : 'min-h-11 text-sm'

  const layout = collapsed
    ? `flex ${size} items-center rounded-gs39-sm border-l-4 px-3 font-medium transition-colors lg:justify-center lg:px-0`
    : `flex ${size} items-center rounded-gs39-sm border-l-4 px-3 font-medium transition-colors`

  const focus =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60'

  const state = active
    ? 'border-accent bg-white/10 text-white'
    : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'

  return `${layout} ${focus} ${state}`
}

export type MpzStackSize = 'sm' | 'md' | 'lg'

const MPZ_STACK_GAP: Record<MpzStackSize, string> = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
}

export function mpzStackClassName(size: MpzStackSize = 'md'): string {
  return `flex flex-col ${MPZ_STACK_GAP[size]}`
}
