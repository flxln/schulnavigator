# Issues — Phase 2: Content-Struktur + UI

Milestone: **Phase 2** | Fällig: 12.06.2026

**Voraussetzung:** Phase 1 abgeschlossen. App ist deployed und erreichbar.

---

## #18 — Audio-Player-Komponente

**Labels:** `tech`
**Assignee:** Felix

- Nativer HTML5-Audioplayer (kein externes Plugin)
- Styling passend zum App-Design
- Play/Pause, Fortschrittsbalken, Lautstärke
- Fallback-Text wenn Browser Audio nicht unterstützt
- Wird in Stationsseite eingebunden wenn Medientyp `audio`

---

## #19 — Video-Player-Komponente

**Labels:** `tech`
**Assignee:** Felix

- Nativer HTML5-Videoplayer (direkter Upload, kein YouTube)
- Autoplay: nein (Datenschutz, Nutzererlebnis)
- Controls sichtbar, Vollbild möglich
- Max. Dateigröße pro Video festlegen (Empfehlung: 50 MB bei max. 60s)
- Wird in Stationsseite eingebunden wenn Medientyp `video`

---

## #20 — Bild-Galerie-Komponente

**Labels:** `tech`
**Assignee:** Felix

- Einfache Galerie für Fotosets (swipeable auf Mobile)
- Lightbox-Ansicht optional
- Wird in Stationsseite eingebunden wenn Medientyp `foto`

---

## #21 — Stempel-System (Gamification)

**Labels:** `tech`
**Assignee:** Felix

- Pro Station: wird in `localStorage` als "besucht" markiert, sobald der QR-Code gescannt wurde
- Kein Backend nötig — rein clientseitig
- Startseite zeigt Fortschritt: z.B. "3 von 8 Räumen entdeckt"
- Stationsseite zeigt Häkchen wenn bereits besucht
- Hinweis: localStorage wird beim Browser-Cache-Löschen zurückgesetzt — das ist akzeptabel

---

## #22 — Abschluss-Animation

**Labels:** `tech`
**Assignee:** Felix

- Wenn alle 8 Stationen besucht: Konfetti-Animation oder ähnliches
- Keine externe Library — CSS-Animation oder Canvas reicht
- Tina-Idee: "ein Petty fliegt raus" — einfache Variante umsetzen
- Wird auf der Startseite ausgelöst

---

## #23 — Zugangskontrolle: Token-System

**Labels:** `tech`
**Assignee:** Felix

- Entry-QR-Code (am Schuleingang) enthält Token als URL-Parameter: `?token=abc123`
- App prüft Token beim ersten Aufruf und speichert ihn in `sessionStorage`
- Ohne gültigen Token: Hinweisseite ("Bitte den QR-Code am Eingang scannen")
- Token hat Ablaufdatum (z.B. 1 Schuljahr) — danach Hinweis zum neuen QR-Code
- Token-Generierung: einfaches Script, das neue Token produziert

---

## #24 — i18n-Struktur für Menütexte

**Labels:** `tech`
**Assignee:** Felix

- Alle UI-Texte (Navigation, Buttons, Systemmeldungen) in separate Sprachdatei auslagern
- `de.json` vollständig befüllt
- `en.json` mit gleicher Struktur, Werte als Platzhalter (können später befüllt werden)
- Sprachumschalter in der UI noch nicht aktiv — Struktur ist aber vorbereitet
- Content (Raumbeschreibungen, Audio) bleibt deutsch — nur Menütexte mehrsprachig

---

## #25 — Meeting 10.06.: Demo + Content-Lieferplan einfordern

**Labels:** `org` `blocker`
**Assignee:** Felix / Thomas

Meeting am 10.06.2026 im MPZ (Sten kommt ab 14:00 Uhr).

Agenda:
1. Demo der fertigen App-Shell (alle UI-Komponenten, keine Platzhalter)
2. Content-Lieferplan der Schule einfordern: Raum → Medientyp → verantwortliche Klasse
3. WLAN-Situation klären (Turnhalle, Außenbereich)
4. AVV-Status prüfen
5. Projekttag-Termin (24./25.06.) final abstimmen

**Ohne Content-Lieferplan kann Phase 3 nicht starten.**

---

## #26 — WLAN-Test vor Ort vereinbaren

**Labels:** `org`
**Assignee:** Felix / Sten

Termin in der Schule vereinbaren um WLAN-Abdeckung an allen 8 Stationspunkten zu prüfen.
Besonders kritisch: Turnhalle, Außenbereich zwischen A-Haus und N-Haus.
Ergebnis dokumentieren: welche Stationen brauchen Mobilfunk-Fallback?
Empfehlung: Mobilfunk als primärer Weg, WLAN als Bonus — nicht als Voraussetzung.
