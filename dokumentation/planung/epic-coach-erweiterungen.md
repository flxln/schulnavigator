# Epic: Coach-Erweiterungen — Layout & Audio (ADR-019)

**Milestone:** [Coach Erweiterungen](https://github.com/flxln/schulnavigator/milestone/11) (GitHub #11)
**Status:** geplant · **GitHub Epic:** [#191](https://github.com/flxln/schulnavigator/issues/191)
**Parent:** Epic [#121](./archiv/epics/epic-coach-fortschritt.md) (Coach MVP, ADR-019) · Studio-Editor [#177](https://github.com/flxln/schulnavigator/issues/177)

**Spezifikationen:** [coach-layout.md](../ideen/archiv/coach-layout.md) · [coach-audio.md](../ideen/offen/coach-audio.md)

**Einordnung:** Nach MPZ Studio v2.1 #189, **vor** #190 (v2.1-Doku & Merge). Unabhängig vom Medien-CRUD-Epic #186.

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

**Empfohlene Reihenfolge:** Layout → Audio → (danach MPZ Studio v2.1 #190 Abschluss)

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

Siehe [coach-layout.md](../ideen/archiv/coach-layout.md).

- Schema: optionales `layout` an `CoachMessage` (inkl. `mascotFlipX` / `mascotFlipY`)
- Blasen-Offsets **relativ zur Figur** (Produktentscheidung 2026-06-20)
- `MascotPeekOverlay` + `resolveCoachLayout`
- MPZ Coach-Editor: Layout-Abschnitt
- `validate-coach-messages` erweitern

### 2 — Audio (#193)

Siehe [coach-audio.md](../ideen/offen/coach-audio.md).

- ADR-Ergänzung zu ADR-019 (Autoplay-Ziel, iOS-Fallback)
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

- [ ] Message mit `quelle` startet Audio beim Einblenden (Desktop + nach Scan auf iOS)
- [ ] `play()`-Reject → Text + Replay, kein Crash
- [ ] Schließen stoppt Audio
- [ ] Studio-Upload + Validator

**Technik**

- [ ] `npm run test` und `npm run build` grün
- [ ] Kein `any` in neuem Code

---

## GitHub-Links

| Issue | URL |
|-------|-----|
| Epic | https://github.com/flxln/schulnavigator/issues/191 |
| Layout | https://github.com/flxln/schulnavigator/issues/192 |
| Audio | https://github.com/flxln/schulnavigator/issues/193 |

---

## Kontext

- [ADR-019](../adr/019-coach-fortschritt-einblendung.md)
- [ADR-010](../adr/010-dialog-cutscene-gated-audio.md) (gated Audio, iOS)
- [ADR-014](../adr/014-mascot-size-json.md) (normierte Maskottchen-Größe Dialog)
- Coach-Editor: [#177](https://github.com/flxln/schulnavigator/issues/177)
- MPZ Studio v2.1: [#186](https://github.com/flxln/schulnavigator/issues/186) — #190 wartet auf dieses Epic

## Checkliste (Epic)

- [x] GitHub Milestone „Coach Erweiterungen“ angelegt (#11)
- [x] Epic + Unterissues auf GitHub (#191–#193)
- [x] Layout (#192) — Branch `mpz-studio-v2.1`, Post-Mortem [post-mortem-192](../reviews/post-mortem/post-mortem-192-2026-06-20.md)
- [ ] Audio (#193)
- [ ] ADR-Ergänzung Coach-Audio
- [ ] Doku (fuer-entwickler, mpz-studio-ui, offen.md)
- [ ] Danach: #190 v2.1-Abschluss
