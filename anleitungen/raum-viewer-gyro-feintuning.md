# Raum-Viewer: Gyro-Feintuning

Anleitung zum Kalibrieren des Gyro-Pans (Issue **#55** / **#56**). Architektur: [ADR-006](../dokumentation/adr/006-raum-viewer-gyro-hotspots.md).

**Demo:** `/raum/musik` — auf dem iPhone nur unter **HTTPS** (lokal z. B. Tunnel oder Deploy). Debug-HUD: `?debug=1`.

---

## Kurz: Was der Viewer macht

- **Portrait:** Pan folgt `deviceorientation.alpha` (Armschwenk — Körper/Arme links–rechts, Handy bleibt zugewandt).
- **Landscape (z. B. iPad):** Pan folgt `gamma` (seitliches Kippen).
- Es wird **nur eine Achse** auf **horizontalen** Bildversatz (`translateX`) gemappt — kein 360°-„Umsehen“, kein Vertikal-Pan.
- **Beta** (Vor-/Zurückkippen) steuert den Pan nicht; Kippen kann α indirekt beeinflussen (Sensorfusion) → Nutzerhinweis: „nicht kippen“.

---

## Zwei Ebenen der Einstellung

| Ebene | Datei | Wirkung |
| ----- | ----- | ------- |
| **Pan-Gefühl** | `app/lib/raum-viewer/constants.ts` | Winkel → Pixel, Totzone, Nachziehen |
| **Sensor-Glättung** | `app/components/raum-viewer/use-device-orientation.ts` | Rohdaten α/γ vor dem Mapping |
| **Neutral-Start** | `app/components/raum-viewer/room-image-pane.tsx` | Erste Kalibrierung nach Gyro-Start |

Es gibt **zwei Glättungen hintereinander** (Sensor-EMA + Pan-Lerp). Wirkt es „fast gut, aber matschig“: typischerweise **eine** Stelle etwas direkter, die andere etwas weicher — nicht beide maximal glätten.

---

## Konstanten: Pan-Gefühl (`constants.ts`)

| Konstante | Standard | Wirkung |
| --------- | -------- | ------- |
| `GYRO_FULL_RANGE_DEG` | `60` | Grad Abweichung vom **Neutral** bis **ein** Bildrand (Portrait: zweiseitig, Mitte = halber Pan). |
| `GYRO_DEADZONE_DEG` | `2` | Totzone um Neutral; darunter keine Pan-Bewegung. |
| `GYRO_SENSITIVITY` | `1` | Linearer Verstärker auf den Winkel (Ränder unverändert, Steigung). |
| `GYRO_ALPHA_PAN_SIGN` | `1` | Vorzeichen Portrait-Pan; bei invertiertem Links/Rechts → `-1`. |
| `PAN_SMOOTHING` | `0.22` | Anteil pro Frame, mit dem `panPx` dem Ziel folgt (RAF-Loop). |

Kommentar im Repo: Werte mit Nutzer auf **iPhone Safari** kalibriert; `GYRO_*` in **0,1**-Schritten anpassen.

### Symptom → erste Stellschraube

| Symptom | Tendenz |
| ------- | ------- |
| Rand zu früh erreicht, viel Armbewegung übrig | `GYRO_FULL_RANGE_DEG` **erhöhen** (z. B. 70–75) |
| Ränder kaum erreichbar | `GYRO_FULL_RANGE_DEG` **senken** (z. B. 45–50) |
| Bild zittert in der Mitte | `GYRO_DEADZONE_DEG` **erhöhen** (3–4) |
| Mitte fühlt sich „matschig“ an | `GYRO_DEADZONE_DEG` **senken** (1) |
| Pan läuft falsch herum (Portrait) | `GYRO_ALPHA_PAN_SIGN` → `-1` |
| Wirkt träge / hängt hinterher | `PAN_SMOOTHING` **erhöhen** (0,3–0,4) und/oder Sensor-EMA (s. u.) |
| Wirkt nervös / zu direkt | `PAN_SMOOTHING` **senken** (0,12–0,18) |
| Gesamt zu „schwach“ ohne Ränder neu zu definieren | `GYRO_SENSITIVITY` z. B. `1,2` |

**Hinweis Doku vs. Code:** In älteren Texten steht teils „±45°“; im Code ist `GYRO_FULL_RANGE_DEG = 60`. Für Nutzertexte und Tests an diesem Wert ausrichten oder bewusst anpassen und Doku mitziehen.

---

## Konstanten: Sensor (`use-device-orientation.ts`)

| Konstante | Standard | Wirkung |
| --------- | -------- | ------- |
| `ORIENTATION_EMA_ALPHA` | `0.38` | Exponentielles Glätten von α (entfaltet) und γ |
| `GLITCH_JUMP_DEG` | `50` | Sprünge größer als dieser Wert werden verworfen |
| `GAMMA_MAX_ABS` (in Hook) | `90` | γ außerhalb → ignorieren |

| Symptom | Tendenz |
| ------- | ------- |
| Bild folgt zu langsam | `ORIENTATION_EMA_ALPHA` **hoch** (0,45–0,55) oder `PAN_SMOOTHING` hoch |
| Bild zuckt bei ruhiger Hand | `ORIENTATION_EMA_ALPHA` **runter** (0,25–0,32) und/oder `GYRO_DEADZONE_DEG` hoch |
| Plötzliche Sprünge | `GLITCH_JUMP_DEG` selten ändern; eher iOS-Permission / Tab-Wechsel prüfen |

---

## Neutral-Kalibrierung (`room-image-pane.tsx`)

| Konstante | Standard | Wirkung |
| --------- | -------- | ------- |
| `NEUTRAL_CALIB_MS` | `500` | Nach Gyro-Start: Winkel sammeln, dann arithmetisches Mittel → Neutral; Portrait startet Pan in der Bildmitte. |

- Zu **kurz:** Neutral schief, wenn der Nutzer sich schon bewegt.
- Zu **lang:** Nutzer dreht bereits, bevor kalibriert ist.
- **Zentrieren:** **Stations-Chip** auf `/raum/[slug]` tippen (#72) — setzt Neutral und Pan neu (wichtig bei **Drift**; ohne Magnetometer kein echter Kompass, ADR-006).
- **Achswechsel** Portrait ↔ Landscape (`axisEpoch`): Neutral-Reset.

---

## Was oft nicht am Gyro liegt

| Gefühl | Ursache | Maßnahme |
| ------ | ------- | -------- |
| Kaum Bewegung im Bild | Wenig horizontaler Spielraum (`maxPanPx`) | Panorama ≥ **2,5 : 1**, Breite ≥ **2400 px**; `MIN_PAN_DISPLAY_RATIO` (2) — siehe [fuer-entwickler.md](./fuer-entwickler.md#raumbilder-für-den-gyro-viewer-17--27) |
| Kippen „stört“ | Nur α genutzt, Fusion ändert trotzdem Werte | Nutzer anleiten; nicht β mappen ohne Konzept |
| Nach Wischen seltsam | Gyro + Touch teilen `panPx` | Wischen loslassen, ggf. zentrieren; testen |
| Kein Gyro | Desktop, Permission denied, kein Sensor | Banner + Wischen/Tap (Pflicht, WCAG 2.5.4) |

Dev-Warnung bei wenig Pan: `[RaumViewer] Wenig Gyro-Pan: …` in der Konsole (`NODE_ENV=development`).

---

## Testablauf

1. **HTTPS** auf echtem iPhone (Safari).
2. `/raum/musik?debug=1` öffnen, Gyro-Berechtigung erteilen.
3. **~0,5 s ruhig halten** (Neutral-Kalibrierung).
4. Armschwenk links/rechts: HUD `axis:α`, `n:` (Neutral), `pan:` / zweite Zahl = `maxPan`.
5. Prüfen: Von Mitte aus ca. **`GYRO_FULL_RANGE_DEG`** bis linker und rechter Rand erreichbar?
6. **Drift:** 30–60 s halten → **Stations-Chip** tippen (zentrieren).
7. **Portrait ↔ Landscape** (iPad): Achswechsel `α`/`γ`, kein Sprung.
8. Pro Anpassung **nur eine** Konstante ändern, erneut testen.

### Debug-HUD (Auszug)

`orientState | axis:α|γ | α:… | γ:… | ∠:… | n:… | pan:…/maxPan | dw:…/viewport | z:…`

---

## Mapping-Logik (Referenz)

- Portrait + α: Modus `centered` — Neutral = Bildmitte, ±`GYRO_FULL_RANGE_DEG` → linker/rechter Rand.
- Landscape + γ: Modus `oneSided` — Kippen in eine Richtung.
- Implementierung: `app/lib/raum-viewer/pan-from-orientation.ts`, Tests: `app/lib/raum-viewer/raum-viewer-math.test.ts`.

Nach Konstanten-Änderung:

```bash
cd app && npm run test
```

---

## Priorität beim Basteln

1. **`GYRO_FULL_RANGE_DEG`** an reale Armbewegung.
2. **`PAN_SMOOTHING`** ↔ **`ORIENTATION_EMA_ALPHA`** (ein Paar, nicht beide blind maxieren).
3. **`GYRO_DEADZONE_DEG`** nur bei Zittern in der Mitte.
4. **Content** (Seitenverhältnis, Auflösung) — oft größerer Effekt als mehr Glättung.

---

## Siehe auch

- [fuer-entwickler.md](./fuer-entwickler.md) — Raumbilder, Deploy, Konstanten-Übersicht
- [lokal-testen-und-anschauen.md](./lokal-testen-und-anschauen.md) — Dev-Server, Test-Matrix
- [ADR-006](../dokumentation/adr/006-raum-viewer-gyro-hotspots.md)
