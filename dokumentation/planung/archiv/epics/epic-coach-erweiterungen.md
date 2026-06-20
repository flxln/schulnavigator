# Epic: Coach-Erweiterungen — Layout & Audio (ADR-019)

**Milestone:** [Coach Erweiterungen](https://github.com/flxln/schulnavigator/milestone/11) (GitHub #11)
**Status:** abgeschlossen (2026-06-20) · gemerged nach `main` ([PR #194](https://github.com/flxln/schulnavigator/pull/194), Commit `4f7accc`)
**GitHub Epic:** [#191](https://github.com/flxln/schulnavigator/issues/191)
**Parent:** Epic [#121](./epic-coach-fortschritt.md) (Coach MVP, ADR-019) · Studio-Editor [#177](https://github.com/flxln/schulnavigator/issues/177)

**Spezifikationen:** [coach-layout.md](../../../ideen/archiv/coach-layout.md) · [coach-audio.md](../../../ideen/archiv/coach-audio.md)

**Einordnung:** Eingeschoben nach MPZ Studio v2.1 #189, vor #190; mit v2.1 in [PR #194](https://github.com/flxln/schulnavigator/pull/194) gemerged.

---

## Ziel

Der Coach-MVP (ADR-019, #121/#177) liefert text-only Einblendungen mit vier `placement`-Presets und globalem CSS. Für Schulfest und Heft-Betrieb braucht MPZ:

1. **Layout pro Message** — Figur- und **Sprechblasen**-Größe/Position (Blase relativ zur Figur)
2. **Optionales Audio** — gesprochene Clips mit Autoplay (Ergänzungs-ADR zu ADR-019)

---

## Übersicht

| Rolle | Nr. | Titel | Labels | Blockiert durch |
|-------|-----|-------|--------|-----------------|
| **Epic (Parent)** | `#191` | Coach-Erweiterungen — Layout & Audio (ADR-019) | `tech`, `design` | — |
| Unterissue | `#192` | Coach: Layout Figur & Sprechblase (relativ) | `tech`, `design` | — |
| Unterissue | `#193` | Coach: Audio mit Autoplay | `tech` | #192 empfohlen |

**Empfohlene Reihenfolge:** Layout → Audio → MPZ Studio v2.1 #190 (Doku)

---

## Scope — drin / draußen

| In Epic | Nicht in Epic |
|---------|----------------|
| Optionales `layout` in `coach-messages.json` | Lip-Sync / Wort-Highlight |
| Runtime + Studio-Felder für Figur + Blase | Drag-Drop-Layout-Editor |
| Validator + Tests Layout | Playlist / mehrere Clips pro Message |
| `quelle` + WAV + `GET /api/coach/[id]` | YouTube / externe URLs (ADR-004) |
| Autoplay + iOS-Fallback (Replay) | Directus |
| Studio: Audio-Upload + Audit-Badge | Globales „Ton aus“ (optional später) |
| ADR-Ergänzung Coach-Audio | |

---

## Technische Kurzspec

### 1 — Layout (#192)

Siehe [coach-layout.md](../../../ideen/archiv/coach-layout.md).

- Schema: optionales `layout` an `CoachMessage` (inkl. `mascotFlipX` / `mascotFlipY`)
- Blasen-Offsets **relativ zur Figur** (Produktentscheidung 2026-06-20)
- `MascotPeekOverlay` + `resolveCoachLayout`
- MPZ Coach-Editor: Layout-Abschnitt
- `validate-coach-messages` erweitern

### 2 — Audio (#193)

Siehe [coach-audio.md](../../../ideen/archiv/coach-audio.md).

- ADR-Ergänzung zu ADR-019 (Autoplay-Ziel, iOS-Fallback) — [ADR-025](../../../adr/025-coach-audio-autoplay.md)
- Feld `quelle` → `content/coach-audio/{id}.wav`
- `GET /api/coach/[messageId]`
- `useCoachAudio` / Overlay-Integration
- Studio: Upload + „Clip ok/fehlt“

---

## Akzeptanzkriterien (Epic)

**Layout**

- [x] Mindestens eine Message mit angepasstem `layout` sieht auf iPhone anders aus als ohne
- [x] Bestehende Messages ohne `layout` unverändert
- [x] Studio pflegt Layout-Felder; `validate:coach` grün

**Audio**

- [x] Message mit `quelle` startet Audio beim Einblenden (Desktop + nach Scan auf iOS)
- [x] `play()`-Reject → Text + Replay, kein Crash
- [x] Schließen stoppt Audio
- [x] Studio-Upload + Validator

**Technik**

- [x] `npm run test` und `npm run build` grün
- [x] Kein `any` in neuem Code

---

## GitHub-Links

| Issue | URL |
|-------|-----|
| Epic | https://github.com/flxln/schulnavigator/issues/191 |
| Layout | https://github.com/flxln/schulnavigator/issues/192 |
| Audio | https://github.com/flxln/schulnavigator/issues/193 |

---

## Kontext

- [ADR-019](../../../adr/019-coach-fortschritt-einblendung.md)
- [ADR-025](../../../adr/025-coach-audio-autoplay.md)
- [ADR-010](../../../adr/010-dialog-cutscene-gated-audio.md) (gated Audio, iOS)
- Coach-Editor: [#177](https://github.com/flxln/schulnavigator/issues/177)
- MPZ Studio v2.1: [#186](https://github.com/flxln/schulnavigator/issues/186) — [PR #194](https://github.com/flxln/schulnavigator/pull/194)

## Checkliste (Epic)

- [x] GitHub Milestone „Coach Erweiterungen“ angelegt (#11)
- [x] Epic + Unterissues auf GitHub (#191–#193)
- [x] Layout (#192) — Post-Mortem [post-mortem-192](../../../reviews/post-mortem/post-mortem-192-2026-06-20.md)
- [x] Audio (#193) — Post-Mortem [post-mortem-193](../../../reviews/post-mortem/post-mortem-193-2026-06-20.md)
- [x] ADR-Ergänzung Coach-Audio ([ADR-025](../../../adr/025-coach-audio-autoplay.md))
- [x] Doku (offen.md, epic, ideen/archiv)
- [x] Merge nach `main` — [PR #194](https://github.com/flxln/schulnavigator/pull/194)
