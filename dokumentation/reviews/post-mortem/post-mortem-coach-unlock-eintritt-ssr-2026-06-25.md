---
tags:
  - post-mortem
  - coach-audio
  - adr-025
  - kunde-39-gs
erstellt: 2026-06-25
---

# Post-Mortem — Coach-Audio-Unlock & Eintritt-SSR-500 (2026-06-25)

**Branch:** `kunde/39-gs` · Commits `cf63e0b`, `cf713b9`

Zwei zusammenhängende Nachbesserungen nach #193 (Coach-Audio): Autoplay-Unlock-Kette für iOS/Safari und Behebung eines Production-500 auf `/eintritt` nach dem ersten Unlock-Commit.

---

## 1. Ausgangslage

| Symptom | Ursache |
|---------|---------|
| Welcome-Coach (`welcome-hub`) spielt erst nach Replay-Tap | Browser-Autoplay-Policy + Timing (`audioRef` vor Portal-Mount oft `null`) |
| Production: „This page couldn't load“, ERROR `3372117329` | `onClick` auf `<Link>` in Server-Komponente `EintrittScreen` → Next.js RSC-Fehler |

`sync-content` (Medien rsync) hatte den SSR-Fehler **nicht** behoben — Code-Deploy war nötig.

---

## 2. Umsetzung

| Bereich | Änderung |
|---------|----------|
| Unlock | `app/lib/audio-autoplay-unlock.ts`, `AudioAutoplayUnlock` im Root-Layout, Unlock bei Eintritt/Scan/Home-Gesten |
| Coach-Hook | `useCoachAudio`: Callback-Ref, `useLayoutEffect`, Retry auf `sn-audio-unlocked` |
| SSR-Fix | `EintrittScanLink` (`'use client'`) statt `onClick` in `eintritt-screen.tsx` (Server) |
| Tests | `audio-autoplay-unlock.test.ts`, erweiterte `use-coach-audio.test.ts` |

---

## 3. Verifikation

| Check | Ergebnis |
|-------|----------|
| `npm run build` (lokal) | ✅ |
| `next start` → `/eintritt` | ✅ 200 (vor Fix: 500, Digest `Event handlers cannot be passed…`) |
| `https://39-gs.mpz.schule/eintritt` | ✅ 200 (nach Code-Deploy) |
| `https://39-gs.mpz.schule/api/health` | ✅ 200 |

---

## 4. Learnings

1. **Event-Handler nur in Client Components** — auch bei `next/link`; kleine Client-Komponente (`EintrittScanLink`) statt `'use client'` auf der ganzen Screen-Datei (Server ruft sonst `eintrittVariantFromReason` nicht auf).
2. **Deploy-Trennung:** Medien-`sync-content` ≠ App-Code; SSR-Regressionen brauchen Git-Push + Coolify-Rebuild.
3. **Coach-Audio Bahn B:** `welcome-hub.wav` lokal per Studio/rsync; `validate:coach` vor Deploy.

---

## 5. Referenzen

- [ADR-025](../../adr/025-coach-audio-autoplay.md) (Nachtrag Unlock)
- [#193](https://github.com/flxln/schulnavigator/issues/193) Coach-Audio (geschlossen)
- [lokal-testen-und-anschauen.md](../../../anleitungen/lokal-testen-und-anschauen.md) — Coach-Checkliste
