# Coach-Audio — Ideenskizze

_Kurzfristige Idee — optionale gesprochene Kurzclips zu Coach-Einblendungen. Ergänzt [ADR-019](../adr/019-coach-fortschritt-einblendung.md) (text-only MVP), ersetzt weder Dialog-Audio noch den Coach-Editor [#177](https://github.com/flxln/schulnavigator/issues/177)._

**Bezug:** [ADR-019](../adr/019-coach-fortschritt-einblendung.md) · [ADR-010](../adr/010-dialog-cutscene-gated-audio.md) (gated Audio, iOS) · [Fortschritts-Einblendung](./maskottchen-fortschritt-einblendung.md) · Coach-Editor: `content/coach-messages.json`, `/mpz/studio/coach`

**Status:** Idee — bewusst **nicht** im MVP und **nicht** in #177. Vor Umsetzung **ADR-Ergänzung** zu ADR-019 (dort steht heute noch „kein Autoplay“).

**Produktentscheidung (2026-06-19):** Wenn ein Clip hinterlegt ist, soll er **automatisch** mit der Einblendung starten — kein Pflicht-Tap auf „Anhören“. Text bleibt parallel sichtbar.

---

## Ausgangslage (Ist)

| Bereich | Heute |
|---------|--------|
| **Coach-UI** | `MascotPeekOverlay` — Maskottchen + Textblase, Schließen per X/Tap/Hintergrund |
| **Content** | `coach-messages.json`: `id`, `trigger`, `mascot`, `placement`, `text`, optional `modes` / `milestone` / `slug` — **kein Audio-Feld** |
| **Runtime** | `useCoachNudge` → Text anzeigen, „gesehen“ beim **Anzeigen** (nicht beim Schließen) |
| **Studio** | MPZ Coach-Editor (#177): CRUD für Texte und Metadaten, kein Upload |
| **ADR-019 (MVP)** | Coach **text-only**; Autoplay ausgeschlossen — gilt nur für den **umgesetzten** Stand, nicht für diese Idee |

Audio wäre ein **bewusster zweiter Schritt** mit **geänderter** Audio-Regel gegenüber dem MVP-ADR.

---

## Zielbild (Produkt)

1. **Optional pro Message:** Kein Clip → Verhalten wie heute (nur Text, kein Player).
2. **Autoplay wenn Clip da:** Sobald die Coach-Blase erscheint und `quelle` gesetzt ist → `audio.play()` **sofort** (parallel zur Slide-/Fade-Animation). Kein separater Start-Button als Normalfall.
3. **Ein Clip pro Einblendung:** Keine Playlist (Abgrenzung Dialog). Kurzform: ca. 5–20 Sekunden.
4. **Text bleibt:** Sprechblasen-Text **immer** sichtbar — Audio unterstützt Lesen, ersetzt es nicht (Grundschule, laute Umgebung, Störmodus).
5. **Schließen stoppt:** Overlay zu (X, Tap, Escape) → `pause()`, Quelle leeren.
6. **Modus:** Optional unterschiedliche Clips für `fest` / `heft` — nur bei Bedarf; Default: ein Clip.

### Abweichung vom alten Ideenstrang

Die [Fortschritts-Idee](./maskottchen-fortschritt-einblendung.md) (Zeile 85) und der MVP-ADR nannten „Anhören nach Tap“. **Diese Idee priorisiert Autoplay** — bewusst, weil Kinder den Text oft nicht lesen und der Coach sonst leise bleibt.

---

## iOS & Fallback (technisch zwingend einplanen)

Safari blockiert `play()` ohne **kürzliche Nutzer-Geste**. Coach triggert **ohne** Tap (Fortschritt, Route-Wechsel) — Autoplay kann fehlschlagen.

| Situation | Erwartung |
|-----------|-----------|
| Hub nach QR-Scan / Eintritt (frische Geste) | Autoplay **oft** möglich |
| Hub-Rückkehr ohne Zwischen-Tap | `play()` kann **rejected** werden |
| Room-first beim ersten Raumöffnen | gemischt — Navigation kann reichen, muss nicht |
| Desktop | meist unkritisch |

**Vorschlag Implementierung (nicht im UI-Zwang, aber im Code):**

```
Overlay mount + quelle gesetzt
  → audio.src setzen, play() aufrufen
  → catch: playBlocked = true
  → UI: nur Text (wie heute) + dezentes 🔊-Icon „Nochmal abspielen“
```

- **Kein** blockierender Fehlerdialog für Kinder.
- Optional: ein globales „Audio freigeschaltet“-Flag nach erstem erfolgreichen `play()` in der Session (Dialog oder Medien) — danach Coach-Autoplay nachziehen (Heuristik, nicht Garantie).
- Dialog nutzt bereits `startFromUserGesture()` synchron im Tap ([`use-dialog-audio-playlist.ts`](../../app/hooks/use-dialog-audio-playlist.ts)) — Coach **kann** diese Geste nicht voraussetzen.

**ADR-Ergänzung** muss festhalten: *Ziel = Autoplay; akzeptierter Fallback = Text + manuelles Replay bei Browser-Block.*

---

## Abgrenzung

| | Dialog-Audio (ADR-010) | Coach-Audio (diese Idee) |
|---|---|---|
| Trigger | Tap auf Dialog-Hotspot | Fortschritt / erster Raumbesuch |
| Segmente | Playlist, mehrere WAVs | **Ein** Clip pro Coach-`id` |
| Start | Nach Nutzer-Tap auf Figur | **Autoplay** beim Einblenden (mit Fallback) |
| Daten | `stations.json` → `dialog` | `coach-messages.json` |
| Ablage | `content/dialog-audio/{slug}/` | `content/coach-audio/{messageId}.wav` |
| API | `GET /api/dialog/{slug}/{clip}` | `GET /api/coach/[messageId]` |
| Studio | Dialog-Audio-Upload | Coach-Tab: Upload + Audit-Badge |

Coach-IDs sind global (`welcome-hub`, `complete`), nicht stationsgebunden.

---

## UX-Skizze

```
┌─────────────────────────────────────┐
│  [Coach-Overlay]  🔊 (läuft)        │
│   🐸 Frieda    ╭──────────────────╮ │
│                │ Text parallel    │ │
│                │ zum Audio …   [X]│ │
│                ╰──────────────────╯ │
└─────────────────────────────────────┘

Fallback (play blockiert):
                │ Text …      [🔊][X]│
```

- Kein großer „Anhören“-Button im Happy Path — Audio startet von selbst.
- **Replay-Icon** nur bei `playBlocked` oder nach manuellem Stopp (optional).
- **Duo (`duo-split`):** ein Clip für beide Figuren.
- Layer-Vertrag ADR-019 unverändert: kein Coach während Dialog, Medienpanel, Viewer-Gate.

---

## Technische Skizze (bei Umsetzung)

### Datenmodell (Vorschlag)

```json
{
  "id": "welcome-hub",
  "trigger": "hub-milestone",
  "milestone": 0,
  "mascot": "frieda",
  "placement": "left",
  "text": "Willkommen …",
  "quelle": "/api/coach/welcome-hub"
}
```

- Feld **`quelle`** analog Dialog/Medien (Studio-Konsistenz).
- Validator: `quelle` gesetzt → WAV unter `content/coach-audio/{id}.wav` muss existieren.

### Runtime

- `MascotPeekOverlay` oder dedizierter Hook `useCoachAudio(message)`:
  - `useEffect` bei `message` + `quelle`: `play()`; Cleanup bei unmount/dismiss.
  - `play().catch` → Fallback-State.
- **Ein** `<audio>`-Element pro Overlay-Instanz (wie Dialog-Playlist-Prinzip).
- Kein paralleles Coach- + Dialog-Audio (`blocked` verhindert Überlappung).

### MPZ Studio (Follow-up zu #177)

| Funktion | Beschreibung |
|----------|--------------|
| Upload | WAV pro Message-ID |
| Audit | Badge „Clip ok / fehlt“ in Coach-Tabelle |
| Vorschau-Hinweis | „Autoplay im Browser — nach Scan testen“ |

---

## Bewusst nicht (oder später)

- **Playlist** / mehrere Segmente pro Trigger
- **Lip-Sync** / Wort-Highlight
- **YouTube** / externe URLs (ADR-004)
- **Gemeinsame Clips** mit Dialog
- **Directus**

---

## Risiken & offene Fragen

1. **iOS-Realität:** Wie oft fällt Coach auf stumm + Text zurück? Messung nach Fest (Hub-Meilensteine ohne frische Geste).
2. **Nervfaktor:** Autoplay bei jedem Hub-Besuch mit nachholbarer Marke — durch „gesehen“-State begrenzt; trotzdem mit MPZ Copy-Länge abstimmen.
3. **Störmodus / laute Halle:** Soll es eine stumme Variante geben (nur Text), z. B. per `modes` oder globalem „Ton aus“? Noch offen.
4. **`prefers-reduced-motion`:** Nur Animation reduzieren oder auch **kein** Autoplay? Offen.
5. **Casting & Pflege:** Wer spricht die ~7 Coach-Clips ein?
6. **Feldname:** `quelle` vs. `audio` — vor ADR klären.
7. **ADR-019 anpassen:** MVP-Text „kein Autoplay“ bleibt historisch; Ergänzungs-ADR für Coach-Audio mit neuer Regel.

---

## Empfohlene Phasen

| Phase | Inhalt |
|-------|--------|
| **0** | Text-Coach + Studio #177 — erledigt |
| **1** | MPZ: welche Messages mit Audio; Clips beschaffbar |
| **2** | ADR-Ergänzung (Autoplay + Fallback), Schema, API, Autoplay in Overlay |
| **3** | Studio-Upload + Audit; Testmatrix iOS (Scan → Hub, Rückkehr Hub, Room-first) |

**Go Phase 2:** MPZ will Autoplay-Coach **und** liefert mindestens 3 Clips.

---

## Checkliste (wenn aus Idee wird)

- [ ] MPZ: Messages mit Audio + Länge/Ton
- [ ] ADR-Ergänzung: Autoplay-Ziel, iOS-Fallback, `quelle`-Schema
- [ ] `CoachMessage` + Validator + `GET /api/coach/[messageId]`
- [ ] `useCoachAudio` / Overlay: Autoplay + Replay-Fallback
- [ ] Tests: `play()` mock (success + reject), Dismiss stoppt Audio
- [ ] Manuelle Matrix: iPhone nach Scan, ohne Scan, Room-first
- [ ] Studio: Upload + Audit
- [ ] Doku

---

_Erfasst: 2026-06-19 · Aktualisiert: Autoplay wenn Clip vorhanden (Produktvorgabe)._
