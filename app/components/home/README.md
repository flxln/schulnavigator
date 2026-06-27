# Startseite (`/`)

Client-Komponente: [`home-screen.tsx`](./home-screen.tsx) (von [`app/page.tsx`](../../app/page.tsx) mit `mode` aus Cookie).

## Kopfzeile (Wordmark)

- Navy-Chip: [`Gs39ChipMark`](../ui/gs39-chip-mark.tsx) — **39.** (weiß, `font-display`)
- Titel: **Grundschule Dresden-Plauen**
- Listen-Icon → `/stationen`

Eintritt-Screen: gleicher Chip; dort Titel „Schulnavigator“ + Unterzeile „39. Grundschule Dresden-Plauen“.

Spezifikation: [ADR-016 Nachtrag Wordmark](../../../dokumentation/adr/016-hub-frontansicht-39gs.md#nachtrag-2026-06-10--startseiten-layout--wordmark-103). Issue **#103**.

## Layout

| Block | Breite | Inhalt |
|-------|--------|--------|
| Hero-Text | `px-4` in Creme-Karte | Brush-Headline „Entdecke unsere Schule“ |
| Hub | `w-full`, kein `px-4` | `SchoolhouseHub` / Lade-Platzhalter |
| Footer | zentriert | Ribbon, Jubiläumszeile, **darunter** `modeLabel` |

## Modusabhängige CTAs

Steuerung über [`lib/home-cta.ts`](../../lib/home-cta.ts) (`getHomeFooterCta`). Nächste Station: [`lib/next-station.ts`](../../lib/next-station.ts).

| `footerCta` | Wann | UI |
|-------------|------|-----|
| `fest-scan` | `fest`, vor Hydration oder 0/11 | `Gs39Button` „Scanne einen beliebigen Code“ → `/scan` |
| `scan-next` | `fest`/`heft`, 1–10 mit unbesuchter Station | [`home-fest-scan-cta.tsx`](./home-fest-scan-cta.tsx) „Scanne einen beliebigen Code“ → `/scan` |
| `none` | alle besucht oder `heft` ohne Fortschritt | nur Hub + Link `/stationen` |

## Layout-Reihenfolge (visuell)

- **Fest/Heft:** Scan-CTA (`fest-scan` / `scan-next`) unter dem Hub, Fortschrittskarte (`Gs39Card`) darunter, **MPZ-Banner** (`MpzOfferBanner`) am Seitenende.

Spezifikation CTAs: [ADR-009 Nachtrag CTAs](../../../dokumentation/adr/009-hub-isometrisch.md#nachtrag-2026-06-01--startseite-modusabhängige-ctas). Issue **#84** (Sub-Issue **#83**).
