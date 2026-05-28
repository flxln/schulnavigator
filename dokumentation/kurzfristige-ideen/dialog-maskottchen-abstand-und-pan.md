# Dialog-Maskottchen: Abstand zur Sprechblase & Mitpan

_Kurzfristige Idee — Umsetzung nach dem Maskottchen-Spike (`daz`), vor oder mit ADR-011._

**Bezug:** [Maskottchen-Hotspot-Dialog (Plan)](../../.cursor/plans/maskottchen-hotspot-dialog_f707411e.plan.md) · Spike-Stand in [Umsetzungsstand im Plan](../../.cursor/plans/maskottchen-hotspot-dialog_f707411e.plan.md#umsetzungsstand-2026-05-28)

---

## Ausgangslage (Ist)

| Element | Verhalten heute |
|--------|------------------|
| **Frieda / Otto** | Hotspots in `stations.json` (`x`/`y`), gerendert in [`hotspot-overlay.tsx`](../../app/components/raum-viewer/hotspot-overlay.tsx) |
| **Mitpan (Gyro)** | Figuren hängen **in** der transformierten Bildebene ([`room-image-pane.tsx`](../../app/components/raum-viewer/room-image-pane.tsx) — gleiches `translate` wie das Panorama) → sie schwenken **mit dem Raumbild** |
| **Sprechblase** | [`DialogEmbeddedBubble`](../../app/components/dialog/dialog-embedded-bubble.tsx) in [`raum-station-client.tsx`](../../app/components/raum-station-client.tsx) — **fix am Hero-Viewport**, pannt **nicht** |
| **Dialog beenden / Zentrieren** | Seit [#72](https://github.com/flxln/schulnavigator/issues/72): **X** in TopBar (nicht unter Blase); **Stations-Chip** → `recenterView` (kein floating „Zentrieren“ im Hero) |
| **Abstand `daz`/`pc-raum`** | Startwerte `x: 0.32` / `0.68` (ADR-011) — am Gerät ggf. weiter nachjustieren |

Beim Schwenken während des Dialogs: Köpfe wandern mit dem Foto, die Blase bleibt mittig im sichtbaren Hero → optisch „Dialog zerreißt sich“. Das war im Hauptplan für v1 bewusst akzeptiert („Figur kann aus dem Sichtfeld pannen“).

---

## Zielbild (Produkt)

1. **Abstand:** Frieda und Otto stehen im Bild **nicht weiter voneinander entfernt**, als die Sprechblase breit ist — Dialog wirkt wie eine gemeinsame Szene, nicht wie zwei Ecken + zentrierte Untertitel-Leiste.
2. **Raumgefühl:** Figuren bleiben **Teil des Panoramas** (mitpan) — nicht als HUD über dem Bild. Die Blase kann entweder mit der Szene mitgehen oder Pan so begrenzen, dass Komposition stabil bleibt (siehe Optionen).

---

## 1. Maskottchen näher zusammen

### Warum sinnvoll

- Hotspot-`x`/`y` beziehen sich auf die **volle Panorama-Breite**; bei breitem Raumfoto ist `0.12`–`0.88` auf dem Display oft **deutlich mehr Pixel** als die Blase breit ist.
- Sprechblasen-Schwanz (`tail-left` / `tail-right`) verweist auf die Sprecher — funktioniert nur, wenn Köpfe und Blase **räumlich zusammengehören**.

### Umsetzungsvorschläge

| Stufe | Maßnahme |
|-------|----------|
| **Sofort (Daten)** | `stations.json` enger setzen (z. B. `x: 0.30` / `0.70` oder enger), am **echten Foto + iPhone** feinjustieren (`?debug=1` im Raumviewer) |
| **Validator (optional)** | Warnung, wenn Abstand zweier Maskottchen-Hotspots > Schwellwert (z. B. normalisierte `\|x₁ − x₂\| > 0.5`) — kein Build-Fail |
| **Feet-Anchor (Plan)** | Figur „steht“ auf `(x,y)` (`translate(-50%, -100%)`) — erleichtert konsistente Platzierung am Boden |

### Akzeptanz

- Auf Referenzgerät (iPhone, Demo-Viewport): beide Figuren und Blase wirken als **eine Dialog-Gruppe** ohne leere Mitte zwischen den Köpfen.

---

## 2. Mitpan & Sprechblase

### Ist-Zustand klären

- **Maskottchen pannt bereits mit** — kein zusätzlicher „Pan für Figuren“ nötig, sofern sie im `HotspotOverlay` in der Pan-Ebene bleiben.
- **Sprechblase pannt nicht** — bewusste Spike-Entscheidung (einfacher, iOS-stabil nach Safari-Fix: festes `bg-bg-2`, `z-[20]`).

### Optionen (bewusst eine wählen)

| Option | Beschreibung | Aufwand | Passt zu „im Raum“ |
|--------|--------------|---------|-------------------|
| **A — Nur Daten + enger** | Hotspots näher; Nutzer schwenkt frei; Blase bleibt viewport-fix | gering | mittel |
| **B — Pan während Dialog dämpfen** | Gyro/Pan begrenzen oder pausieren, solange `dialogUiActive` | mittel | hoch (Komposition stabil) |
| **C — Blase an Szene koppeln** | Blase zwischen den Hotspot-Positionen im Bild, mit `panPx` mittransformieren | hoch | sehr hoch |
| **D — Alles HUD** | Figuren + Blase viewport-fix (wie Cutscene-Lite) | mittel | niedrig (widerspricht ADR-011-Ziel) |

### Empfehlung für Schulfest / nächster Schritt

1. **A** umsetzen (Koordinaten `daz`, später `pc-raum`).
2. Auf dem iPhone mit Gyro durchspielen; wenn die Blase „abdriftet“ stört → **B** prüfen (Pan-Limit nur während Dialog).
3. **C** nur, wenn MPZ explizit „Untertitel klebt an den Köpfen beim Schwenken“ will — sonst iOS-/Layout-Risiko.

### In ADR-011 festhalten

- Entscheidung: v1 = **A** (+ optional **B**), **C** verworfen oder „später“.
- Konsequenz dokumentieren: Mitpan der Figuren ja; viewport-fixe Blase ja — und ob Pan im Dialog eingeschränkt wird.

---

## Technische Touchpoints (bei Umsetzung)

| Bereich | Datei |
|---------|--------|
| Positionen | [`app/data/stations.json`](../../app/data/stations.json) |
| Overlay / Speaking | [`app/components/raum-viewer/hotspot-overlay.tsx`](../../app/components/raum-viewer/hotspot-overlay.tsx) |
| Pan / Gyro | [`app/components/raum-viewer/room-image-pane.tsx`](../../app/components/raum-viewer/room-image-pane.tsx) |
| Blase | [`app/components/dialog/dialog-embedded-bubble.tsx`](../../app/components/dialog/dialog-embedded-bubble.tsx) |
| Dialog aktiv | [`app/hooks/use-dialog-audio-playlist.ts`](../../app/hooks/use-dialog-audio-playlist.ts), [`raum-station-client.tsx`](../../app/components/raum-station-client.tsx) |
| Architektur | Geplant: `dokumentation/adr/011-dialog-mascot-hotspots.md` |

---

## Checkliste (später abarbeiten)

- [ ] `daz`: `x`/`y` für Frieda/Otto enger, am Gerät prüfen
- [ ] `pc-raum`: gleiches Muster, wenn Maskottchen-Hotspots dort migriert sind
- [ ] Optional: Validator-Warnung Abstand Maskottchen
- [ ] Optional: Pan-Limit während `dialogUiActive` (Option B)
- [ ] ADR-011: Abstand + Pan/Blase-Verhalten festhalten
- [ ] Doku: `demo-meeting-*.md`, `lokal-testen-und-anschauen.md` (Gyro während Dialog erwähnen)

---

## Nicht Ziel dieser Idee

- Lip-Sync, Figuren **im exportierten Foto** ohne Hotspots
- Blase mit `backdrop-blur` auf iOS (bereits verworfen — festes `bg-bg-2`)
- Vollbild-Cutscene als Standard zurück (nur Fallback `pc-raum` bis Migration)

---

_Erfasst: 2026-05-28 — aus UX-Review nach iPhone-Test (Sprechblase Safari-Fix, Wunsch engerer Figuren + klares Mitpan-Verständnis)._
