# Startseite (`/`)

Client-Komponente: [`home-screen.tsx`](./home-screen.tsx) (von [`app/page.tsx`](../../app/page.tsx) mit `mode` aus Cookie).

## Modusabhängige CTAs

Steuerung über [`lib/home-cta.ts`](../../lib/home-cta.ts) (`getHomeFooterCta`). Nächste Station: [`lib/next-station.ts`](../../lib/next-station.ts).

| `footerCta` | Wann | UI |
|-------------|------|-----|
| `fest-scan` | `fest`, vor Hydration oder 0/11 oder 11/11 | `Gs39Button` → `/scan` |
| `fest-split` | `fest`, 1–10 mit unbesuchter Station | [`home-fest-scan-cta.tsx`](./home-fest-scan-cta.tsx) → `/scan` |
| `heft-suggestion` | `heft`, Fortschritt > 0, nächste Station | [`next-station-row.tsx`](../raum/next-station-row.tsx) in `Gs39Card` → `/raum/[slug]` |
| `none` | `heft` ohne Vorschlag o. ä. | nur Hub + Link `/stationen` |

Spezifikation: [ADR-009 Nachtrag CTAs](../../../dokumentation/adr/009-hub-isometrisch.md#nachtrag-2026-06-01--startseite-modusabhängige-ctas). Issue **#84** (Sub-Issue **#83**).
