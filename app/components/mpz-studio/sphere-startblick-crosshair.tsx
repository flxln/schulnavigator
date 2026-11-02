/** Fixes Fadenkreuz in der Viewport-Mitte — nur Tab Startblick (S14, #201). */
export function SphereStartblickCrosshair() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
      aria-hidden
    >
      <div className="relative size-14">
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-brand-sun/85 shadow-[0_0_1px_rgba(0,0,0,0.6)]" />
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-brand-sun/85 shadow-[0_0_1px_rgba(0,0,0,0.6)]" />
        <span className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-sun bg-brand-sun/25" />
      </div>
    </div>
  )
}
