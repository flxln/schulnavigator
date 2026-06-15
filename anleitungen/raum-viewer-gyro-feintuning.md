# Raum-Viewer: Gyro-Feintuning

Anleitung zum Kalibrieren des Gyro-Pans (Issues **#55** / **#56** / **#85**). Architektur: [ADR-006](../dokumentation/adr/006-raum-viewer-gyro-hotspots.md). Gimbal-Lock-Fix (#85): Commit `e59cd1e`.

**Demo:** `/raum/musik` -- auf dem iPhone nur unter **HTTPS** (lokal z. B. Tunnel oder Deploy). Debug-HUD: `?debug=1`.

---

## Kurz: Was der Viewer macht

- **Portrait (gekippt, beta < 80 Grad):** Pan folgt entfaltetem `deviceorientation.alpha` -- Armschwenk mit dem Arm.
- **Portrait (senkrecht, Gimbal-Zone, |beta-90| < 10 Grad):** Wechsel auf **`gamma`** (gamma-Fallback) -- dort ist alpha an der Euler-Singularitat instabil; gamma bildet Yaw bei beta ~= 90 Grad fast 1:1 ab.
- **Landscape (z. B. iPad):** Pan folgt `gamma` (seitliches Kippen).
- Nur eine Achse horizontal: `translateX`. Kein 360-Umsehen, kein Vertikal-Pan.
- **Ubergang alpha -> gamma:** 150 ms Settle-Pause (iOS Euler-Rearrangement), dann Re-Anchor von `neutralGamma` mit stabilen Werten -- kein Sprung im Pan.
- **Ubergang gamma -> alpha:** sofortiger Re-Anchor von `neutralAlpha`, keine Pause (alpha ist ausserhalb der Singularitat stabil).

### Euler-Singularitat bei beta ~= 90 Grad

Bei aufrecht gehaltenem Handy (Portrait, beta ~= 90 Grad) ist `alpha` mathematisch instabil (Gimbal Lock): iOS liefert in diesem Bereich sprunghaft schwankende Alpha-Werte. Der gamma-Fallback umgeht das: `gamma` bildet bei beta = 90 Grad den Arm-Yaw mit Faktor sin(90) = 1 ab. Ausserhalb der Zone (beta < 80 Grad) ist alpha stabil genug fur flussigen Arm-Schwenk (Amplifikationsfaktor ~5,7-fach bei beta = 80 Grad -- merklich, aber durch EMA und Deadzone handhabbar).

### Post-Settle Re-Anchor (Wichtig fur Arm-Schwenk nach Aufrichten)

Wenn das Handy in die Gimbal-Zone kippt (z. B. von beta = 79 Grad nach beta = 85 Grad), rearrangiert iOS intern die Euler-Winkel: `gamma` springt kurz zu einem anderen Wert, bevor es sich stabilisiert. Der Viewer friert den Pan 150 ms ein und setzt `neutralGamma` erst **nach** der Settle-Zeit -- mit dem dann stabilen Gamma-Wert. Dadurch:

- Arm-Schwenk funktioniert unmittelbar nach der Pause (neutral stimmt mit aktuellem gamma uberein).
- Kein Pan-Sprung beim Aufrichten des Handys.
- Mehrfaches Uberschreiten des Kipppunkts friert Pan nicht dauerhaft ein (keine Freeze-Kaskade).

---

## Zwei Ebenen der Einstellung

| Ebene | Datei | Wirkung |
| ----- | ----- | ------- |
| **Pan-Gefuhl** | `app/lib/raum-viewer/constants.ts` | Winkel -> Pixel, Totzone, Nachziehen |
| **Sensor-Glattung** | `app/components/raum-viewer/use-device-orientation.ts` | Rohdaten alpha/beta/gamma vor dem Mapping |
| **Neutral-Start** | `app/components/raum-viewer/room-image-pane.tsx` | Erste Kalibrierung nach Gyro-Start |

Es gibt **zwei Glattungen hintereinander** (Sensor-EMA + Pan-Lerp). Wirkt es "fast gut, aber matschig": typischerweise **eine** Stelle etwas direkter, die andere etwas weicher -- nicht beide maximal glatten.

---

## Konstanten: Pan-Gefuhl (`constants.ts`)

| Konstante | Wert | Wirkung |
| --------- | ---- | ------- |
| `GYRO_FULL_RANGE_DEG` | `60` | Grad Abweichung vom **Neutral** bis **ein** Bildrand (Portrait: zweiseitig, Mitte = halber Pan). |
| `GYRO_DEADZONE_DEG` | `2` | Totzone um Neutral; darunter keine Pan-Bewegung. |
| `GYRO_SENSITIVITY` | `1` | Linearer Verstarkerfaktor (Rander unverandert, Steigung). |
| `GYRO_ALPHA_PAN_SIGN` | `1` | Vorzeichen Portrait-alpha-Pan; bei invertiertem Links/Rechts -> `-1`. |
| `GIMBAL_LOCK_ENTER_DEG` | `10` | Gimbal-Zone betreten: `|beta-90| <` dieser Wert -> gamma-Fallback. |
| `GIMBAL_LOCK_EXIT_DEG` | `15` | Zone verlassen erst bei grosserer Abweichung (Hysterese gegen Flattern). |
| `GYRO_GAMMA_PAN_SIGN` | `-1` | Vorzeichen im gamma-Fallback (bei beta ~= 90 Grad dreht iOS gamma invers zur Yaw-Richtung -- auf iPhone verifiziert). |
| `GYRO_GAMMA_FALLBACK_FULL_RANGE_DEG` | `60` | Vollausschlag fur gamma-Fallback (getrennt von alpha tunebar). |
| `PAN_SMOOTHING` | `0.22` | Anteil pro Frame, mit dem `panPx` dem Ziel folgt (RAF-Loop). |

Alle `GYRO_*`-Werte wurden mit Nutzer auf **iPhone Safari** kalibriert; in **0,1**-Schritten anpassen.

### Symptom -> erste Stellschraube

| Symptom | Tendenz |
| ------- | ------- |
| Rand zu fruh erreicht, viel Armbewegung ubrig | `GYRO_FULL_RANGE_DEG` **erhohen** (z. B. 70-75) |
| Rander kaum erreichbar | `GYRO_FULL_RANGE_DEG` **senken** (z. B. 45-50) |
| Bild zittert in der Mitte | `GYRO_DEADZONE_DEG` **erhohen** (3-4) |
| Mitte fuhlt sich "matschig" an | `GYRO_DEADZONE_DEG` **senken** (1) |
| Pan lauft falsch herum (Portrait, gekippt) | `GYRO_ALPHA_PAN_SIGN` -> `-1` |
| Pan lauft falsch herum (Portrait, senkrecht) | `GYRO_GAMMA_PAN_SIGN` -> `1` |
| Hupfen an der Gimbal-Grenze / alpha springt | `GIMBAL_LOCK_ENTER_DEG` verkleinern (enger) |
| Arm-Schwenk funktioniert nicht im senkrechten Modus | `GIMBAL_LOCK_ENTER_DEG` / `EXIT_DEG` und `GYRO_GAMMA_PAN_SIGN` pruefen |
| Wirkt trage / hangt hinterher | `PAN_SMOOTHING` **erhohen** (0,3-0,4) und/oder Sensor-EMA (s. u.) |
| Wirkt nervos / zu direkt | `PAN_SMOOTHING` **senken** (0,12-0,18) |
| Gesamt zu "schwach" ohne Rander neu zu definieren | `GYRO_SENSITIVITY` z. B. `1,2` |

---

## Konstanten: Sensor (`use-device-orientation.ts`)

| Konstante | Wert | Wirkung |
| --------- | ---- | ------- |
| `ORIENTATION_EMA_ALPHA` | `0.38` | Exponentielles Glatten von alpha (entfaltet), beta und gamma |
| `GLITCH_JUMP_DEG` | `50` | Sprunge grosser als dieser Wert werden verworfen |
| `GAMMA_MAX_ABS` (in Hook) | `90` | gamma ausserhalb -> ignorieren |

| Symptom | Tendenz |
| ------- | ------- |
| Bild folgt zu langsam | `ORIENTATION_EMA_ALPHA` **hoch** (0,45-0,55) oder `PAN_SMOOTHING` hoch |
| Bild zuckt bei ruhiger Hand | `ORIENTATION_EMA_ALPHA` **runter** (0,25-0,32) und/oder `GYRO_DEADZONE_DEG` hoch |
| Plotzliche Sprunge | `GLITCH_JUMP_DEG` selten andern; eher iOS-Permission / Tab-Wechsel prufen |

---

## Neutral-Kalibrierung (`room-image-pane.tsx`)

| Konstante | Wert | Wirkung |
| --------- | ---- | ------- |
| `NEUTRAL_CALIB_MS` | `500` | Nach Gyro-Start: alpha/beta/gamma sammeln; getrennte Neutrals `nalpha`/`ngamma`; Portrait startet Pan in der Bildmitte. |

- Zu **kurz:** Neutral schief, wenn der Nutzer sich schon bewegt.
- Zu **lang:** Nutzer dreht bereits, bevor kalibriert ist.
- **Zentrieren:** **Stations-Chip** auf `/raum/[slug]` tippen (#72) -- setzt Neutral und Pan neu (wichtig bei **Drift**; ohne Magnetometer kein echter Kompass, ADR-006).
- **Achswechsel** Portrait <-> Landscape (`axisEpoch`): Neutral-Reset.

---

## Was oft nicht am Gyro liegt

| Gefuhl | Ursache | Massnahme |
| ------ | ------- | --------- |
| Kaum Bewegung im Bild | Wenig horizontaler Spielraum (`maxPanPx`) | Panorama >= **2,5 : 1**, Breite >= **2400 px**; `MIN_PAN_DISPLAY_RATIO` (2) -- siehe [fuer-entwickler.md](./fuer-entwickler.md) |
| Hupfen bei senkrechtem Handy | alpha-Singularitat (beta ~= 90 Grad) | gamma-Fallback aktiv (`lock:1` im HUD); ggf. `GYRO_GAMMA_*` tunen |
| Arm-Schwenk senkrecht klappt nicht | gamma-Neutral falsch nach Euler-Rearrangement | Settle-Zeit abwarten (150 ms nach Aufrichten), dann pruefen |
| Nach Wischen seltsam | Gyro + Touch teilen `panPx` | Wischen loslassen, ggf. zentrieren; testen |
| Kein Gyro | Desktop, Permission denied, kein Sensor | Banner + Wischen/Tap (Pflicht, WCAG 2.5.4) |

Dev-Warnung bei wenig Pan: `[RaumViewer] Wenig Gyro-Pan: ...` in der Konsole (`NODE_ENV=development`).

---

## Testablauf

1. **HTTPS** auf echtem iPhone (Safari).
2. `/raum/musik?debug=1` offnen, Gyro-Berechtigung erteilen.
3. **~0,5 s ruhig halten** (Neutral-Kalibrierung).
4. Armschwenk links/rechts: HUD `axis:alpha`, `lock:0`, `nalpha`/`ngamma`, `pan:` / zweite Zahl = `maxPan`.
5. **Aufrichten (beta > 80 Grad):** HUD `lock:1`, 150 ms warten, dann Arm-Schwenk -- Pan folgt gamma; kein Hupfen.
6. **beta langsam 70->90->110 Grad:** Ubergang `lock 0->1->0` ohne Sprung.
7. **Mehrfach uber den Kipppunkt:** Pan darf nicht dauerhaft einfrieren.
8. Pruefen: Von Mitte aus ca. `GYRO_FULL_RANGE_DEG` bis linker und rechter Rand erreichbar?
9. **Drift:** 30-60 s halten -> **Stations-Chip** tippen (zentrieren).
10. **Portrait <-> Landscape** (iPad): Achswechsel `alpha`/`gamma`, kein Sprung.
11. Pro Anpassung **nur eine** Konstante andern, erneut testen.

### Debug-HUD (Auszug)

`orientState | axis:alpha|gamma | alpha:... | beta:... | gamma:... | lock:0|1 | Winkel:... | nalpha:... | ngamma:... | pan:.../maxPan | dw:.../viewport | z:...`

---

## Mapping-Logik (Referenz)

- Portrait + alpha (gekippt): Modus `centered` -- Neutral = Bildmitte, +/-`GYRO_FULL_RANGE_DEG` -> linker/rechter Rand.
- Portrait + gamma (Gimbal-Zone): gleiches Mapping mit `GYRO_GAMMA_*`-Konstanten (Sign = -1, auf iPhone verifiziert).
- Landscape + gamma: Modus `oneSided` -- Kippen in eine Richtung.
- Gimbal-Erkennung: `isGimbalLock(beta, wasLocked)` in `pan-from-orientation.ts`.
- Implementierung: `app/lib/raum-viewer/pan-from-orientation.ts`, Tests: `app/lib/raum-viewer/raum-viewer-math.test.ts`.

### Zukunft 360 Grad

Echte equirektangulare Aufnahmen liegen in `auftraggeber/material/stationen-360-pano/`. Immersive Darstellung = separater Schritt mit einer **WebGL-360-Lib** (Pannellum / photo-sphere-viewer); **bewusst kein Quaternion-Eigenbau** im flachen Viewer. Hotspots muessten dafur von `(x,y)` auf spharisch (yaw/pitch) umgestellt werden.

Nach Konstanten-Anderung:

```bash
cd app && npm run test
```

---

## Prioritat beim Basteln

1. **`GYRO_FULL_RANGE_DEG`** an reale Armbewegung.
2. **`PAN_SMOOTHING`** <-> **`ORIENTATION_EMA_ALPHA`** (ein Paar, nicht beide blind maxieren).
3. **`GYRO_DEADZONE_DEG`** nur bei Zittern in der Mitte.
4. **Content** (Seitenverhaltnis, Auflosung) -- oft grosserer Effekt als mehr Glattung.

---

## Siehe auch

- [fuer-entwickler.md](./fuer-entwickler.md) -- Raumbilder, Deploy, Konstanten-Ubersicht
- [lokal-testen-und-anschauen.md](./lokal-testen-und-anschauen.md) -- Dev-Server, Test-Matrix
- [ADR-006](../dokumentation/adr/006-raum-viewer-gyro-hotspots.md)
