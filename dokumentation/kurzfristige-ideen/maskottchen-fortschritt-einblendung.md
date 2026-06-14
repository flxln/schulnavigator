# Maskottchen: Fortschritts-Einblendung (Kurzauftritt)

_Kurzfristige Idee — ergänzt den Raum-Dialog ([ADR-011](../adr/011-dialog-mascot-hotspots.md)), ersetzt ihn nicht. Umsetzung nach Schulfest oder als kleiner MVP (Hub-only) möglich._

**Bezug:** [ADR-011](../adr/011-dialog-mascot-hotspots.md) (Dialog im Panorama) · [ADR-010](../adr/010-dialog-cutscene-gated-audio.md) (Dialog-Audio) · Fortschritt: `sn_visited_slugs`, `SparkleBurst` (#63) · Toast bei gesperrten Räumen (Hub)

**Diskussion:** Chat 2026-06-02 — Frieda/Otto sollen **gelegentlich** an Hub, Räumen o. Ä. **fortschrittsgetriggert** von der Seite oder unten **bildschirmnah** einragen und **motivierende oder anleitende** Texte sprechen (nicht der freiwillige Dialog im Raumbild).

---

## Ausgangslage (Ist)

| Element | Verhalten heute |
|--------|------------------|
| **Dialog im Raum** | Tap auf Maskottchen-Hotspot → Sprechblase + Audio-Playlist (`daz`, `pc-raum`); Figuren **in** der Panorama-Ebene |
| **Fortschritt** | `localStorage` `sn_visited_slugs`; Hub-Färbung „besucht“; `Gs39Progress` auf `/` |
| **11/11** | `SparkleBurst` auf Startseite, einmalig (`sn_sparkle_done`) — **ohne** Figuren, **ohne** Sprache |
| **Hinweise** | `Gs39Toast` z. B. gesperrter Raum im Fest-Modus — kurz, zentral, ohne Maskottchen |
| **Assets** | `/brand/mascots/frieda.png`, `otto.png` |

Es fehlt eine **Begleiter-Schicht**: Figuren als Coach durch den Rundgang, unabhängig vom stationsspezifischen Dialog.

---

## Zielbild (Produkt)

1. **Zusätzlich** zum Raumdialog: Frieda und/oder Otto erscheinen **viewport-fix** (nicht im Panorama), groß genug, dass sie „von der Seite“ oder „von unten“ in den Bildschirm **hineinragen**.
2. **Auslöser:** vor allem **Fortschritt** und **Kontext** (Route, Modus `fest`/`heft`), nicht Nutzer-Tap auf eine Figur im Foto.
3. **Inhalt:** kurze **Motivation** („Super, schon drei Räume!“) oder **Anleitung** („Scannt den QR-Code an der Tür.“) — ein Segment, keine Playlist.
4. **Gelegentlich:** pro Trigger **höchstens einmal** (oder sehr selten wiederholbar); nicht bei jedem Seitenwechsel.
5. **Optional später:** gesprochene Kurzclips (eigene Dateien, nicht `stations.json` → `dialog.segmente`).

---

## Abgrenzung zum Dialog (ADR-011)

| | Dialog-Hotspot | Fortschritts-Einblendung (diese Idee) |
|---|---|---|
| Ebene | Panorama (`HotspotOverlay`) | Fixed Overlay über Hub/Raum-Shell |
| Trigger | Tap auf Figur | Regel: `visitedCount`, Route, Modus, … |
| Dauer | Mehrere Segmente, Dialog beenden (TopBar **X**) | Kurzauftritt, ein Text, schnell schließbar |
| Daten | `stations.json` → `dialog` | Eigenes Content-Modell (s. unten) |
| Gyro | An, Figuren pannt mit | Unabhängig vom Raum-Pan |

**Konflikt vermeiden:** Während `dialogUiActive` keine Coach-Einblendung starten.

---

## Trigger-Katalog (Vorschlag)

Jeder Trigger hat eine stabile `id` und wird nach Anzeige in `localStorage` als gesehen markiert (`sn_coach_seen_<id>` o. ä.).

| `id` | Bedingung (Beispiel) | Figur | Text-Richtung |
|------|----------------------|-------|----------------|
| `welcome-hub` | Hub `/`, `visitedCount === 0`, hydratisiert | beide oder Frieda | Willkommen, Scan/Eintritt erklären |
| `first-visit` | Erster Besuch irgendeiner Station (`visitedCount === 1`) | Otto | Lob + „Weiter im Hub“ |
| `halfway` | `visitedCount === 6` (bei 11 Stationen) | Frieda | Halbzeit-Motivation |
| `almost-done` | `visitedCount === 10` | beide kurz nacheinander oder einer | „Noch einer!“ |
| `complete` | `visitedCount === 11` | optional **statt** oder **zusätzlich** zu `SparkleBurst` | Abschluss-Satz |
| `fest-locked-tap` | Fest-Modus, Tap auf gesperrtes Gebäude | Otto | Ersetzt/ergänzt Toast: „Erst an der Tür scannen“ |
| `room-first-<slug>` | Erster Besuch eines Raums (optional, nur wichtige Slugs) | variabel | Raumbezogener Einzeiler ohne Dialog-Hotspot |

**Nicht im MVP:** Einblendung mitten im laufenden Medien-Panel oder während Gyro-Permission-Overlay.

**Priorität MVP:** `welcome-hub`, `first-visit`, `halfway`, `complete` — nur auf **`/`** (Home/Hub).

---

## UI / Motion (Skizze)

### Layout-Varianten

| Variante | Beschreibung | Eignung |
|----------|--------------|---------|
| **Seite** | Figur ~40–50 % Viewport-Höhe, schiebt von links/rechts ein; Sprechblase seitlich oder über dem Kopf | Hub, Landschaft |
| **Unten** | Köpfe ragen aus unterem Rand (~25–35 % Höhe); Blase darüber | Hub, Raum (TopBar frei lassen) |
| **Duo** | Frieda links, Otto rechts, gemeinsame Blase mittig | Meilensteine |

Empfehlung: **Unten** auf Mobil (TopBar/Chip nicht verdecken), **Seite** auf Tablet optional (`md:`).

### Interaktion

- **Schließen:** X oder Tap auf Hintergrund (mit `aria-modal`, Fokus-Falle optional).
- **`prefers-reduced-motion`:** kein Slide, nur Fade + Text.
- **Audio (später):** Standard MVP = nur Text; Button „Anhören“ startet Clip **nach** Tap (iOS-Geste), nicht Autoplay beim Einblenden.

### Visuell

- Gleiche PNGs wie Dialog; ggf. größere Darstellung als im Panorama (`h-[min(45vh,280px)]` o. ä.).
- Sprechblase: Stil an `DialogEmbeddedBubble` anlehnen, aber **viewport-fix**, kein `panPx`-Offset.

---

## Technische Skizze (bei Umsetzung)

### Neue Bausteine (Vorschlag)

```
app/content/coach-messages.json     # triggerId, mascot(s), text, placement?, audio?
app/lib/coach-triggers.ts           # Kontext → triggerId | null
app/lib/coach-seen.ts               # read/mark seen (analog sparkle-done)
app/components/coach/
  mascot-peek-overlay.tsx           # Animation + Blase + Schließen
app/hooks/use-coach-nudge.ts        # nach isHydrated einmal evaluieren
```

### Einbindung

| Route / Shell | Wann prüfen |
|---------------|-------------|
| [`home-screen.tsx`](../../app/components/home/home-screen.tsx) | Nach `isHydrated`, `visitedCount` / Modus |
| [`raum-station-client.tsx`](../../app/components/raum-station-client.tsx) | Optional: `room-first-*`, nach Visit-Record |
| [`schoolhouse-hub.tsx`](../../app/components/schoolhouse/schoolhouse-hub.tsx) | Optional: `fest-locked-tap` statt nur Toast |

Ein **Provider** oben in der jeweiligen Shell verhindert doppelte Logik.

### Abhängigkeiten (bestehend)

| Bereich | Datei |
|---------|--------|
| Besucht-Stand | [`app/lib/visited-stations.ts`](../../app/lib/visited-stations.ts), [`use-visited-stations.ts`](../../app/hooks/use-visited-stations.ts) |
| Nächste Station | [`app/lib/next-station.ts`](../../app/lib/next-station.ts) |
| Modus | [`app/lib/hub-mode.ts`](../../app/lib/hub-mode.ts), `EntryMode` |
| Dialog aktiv | [`app/lib/raum-station/end-dialog-flow.ts`](../../app/lib/raum-station/end-dialog-flow.ts) |
| Sparkle 11/11 | [`app/lib/sparkle-done.ts`](../../app/lib/sparkle-done.ts), [`sparkle-burst.tsx`](../../app/components/ui/sparkle-burst.tsx) |
| Maskottchen-Bilder | [`app/public/brand/mascots/`](../../app/public/brand/mascots/) |

### Content-Schema (Entwurf)

```json
{
  "messages": [
    {
      "id": "welcome-hub",
      "mascot": "frieda",
      "placement": "bottom",
      "text": "Willkommen beim Schulrundgang! Tippe auf ein Gebäude oder scanne den QR-Code an der Tür.",
      "modes": ["fest", "heft"]
    }
  ]
}
```

- `modes`: optional Filter; `fest`-only für Scan-Hinweise.
- `audio`: optional später, eigener Pfad (nicht `/api/dialog/...`), um Dialog-API nicht zu vermischen.

---

## Offene Fragen

1. **11/11:** `SparkleBurst` behalten und Coach nur mit Text, oder Figuren in die Abschlussfeier integrieren?
2. **Fest gesperrt:** Toast ersetzen, ergänzen oder nur bei erstem gesperrten Tap?
3. **Räume:** Nur Hub im MVP, oder auch einmalig beim Betreten ausgewählter Stationen?
4. **Texte:** Wer pflegt (MPZ) — JSON im Repo wie Stationen, später Directus?
5. **Recht/Impressum:** Verlagsnennung Maskottchen — gilt unverändert; keine neuen Assets nötig.
6. **ADR:** Eigener ADR „Coach-Einblendung getrennt von Dialog“ vor Implementierung > ~1 PR?

---

## MVP vs. Ausbau

| Stufe | Umfang |
|-------|--------|
| **MVP** | 3–4 Hub-Trigger, nur Text, `coach-seen` Storage, `MascotPeekOverlay` unten, `reduced-motion` |
| **+1** | `fest-locked-tap` mit Figur statt Toast |
| **+2** | Kurz-Audio pro Message, Tap „Anhören“ |
| **+3** | Raum-first-Trigger, modusabhängige Texte, Tablet-Layout Seite |

---

## Checkliste (später abarbeiten)

- [x] Produkt: Trigger-Liste und Copy (MVP-Platzhalter in `coach-messages.json`)
- [x] Entscheidung Sparkle vs. Coach bei 11/11 (sequenziell, ADR-019)
- [x] ADR-019 angelegt
- [x] `coach-messages.json` + Validator
- [x] `coach-seen.ts` + Tests
- [x] `MascotPeekOverlay` + `use-coach-nudge`
- [x] Integration `HomeScreen` (MVP)
- [x] Dialog-/Panel-/Viewer-Gate: kein Coach bei aktiver modaler UI (Gyro, Pan, Dialog, Panel)
- [x] `lokal-testen-und-anschauen.md` ergänzt
- [ ] Copy mit MPZ final abstimmen
- [ ] `prefers-reduced-motion` manuell am Gerät prüfen

---

## Nicht Ziel dieser Idee

- Dialog-Hotspots oder `dialog.segmente` für Coach-Texte missbrauchen
- Vollbild-Cutscene zurück (ADR-010 UI)
- Autoplay-Audio ohne Nutzer-Geste auf iOS
- Einblendung bei **jedem** Navigationswechsel
- Lip-Sync oder neue Maskottchen-Illustrationen (nur bestehende PNGs)

---

_Erfasst: 2026-06-02 — aus Produktidee: Fortschritts-getriggerte Maskottchen-Einblendung zusätzlich zum Raum-Dialog._
