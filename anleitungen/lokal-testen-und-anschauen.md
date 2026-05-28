# Schulnavigator — Lokal anschauen und testen

_Kurzanleitung: Entwicklungsstand im Browser prüfen, typische Checks, produktionsnahes Verhalten._

Ausführliches Setup und Docker: [`fuer-entwickler.md`](./fuer-entwickler.md).

---

## Voraussetzung

- Node.js 20+ und npm
- Terminal im Verzeichnis **`app/`** (alle `npm`-Befehle dort)

---

## 1. Entwicklungsserver (Alltag)

```bash
cd app
npm install   # nur bei erstem Mal oder nach Dependency-Änderung
npm run dev
```

- **URL am Mac:** [https://localhost:3000](https://localhost:3000) (`npm run dev` nutzt experimentelles HTTPS)
- **iPhone im gleichen WLAN:** nur **`https://`** (nicht `http://`) — z. B. `https://192.168.x.x:3000/eintritt?t=fest-2026`
- In `app/.env.local`: `ALLOWED_DEV_ORIGINS=<LAN-IP>` (Komma-getrennt). IP: `ipconfig getifaddr en0`
- **Safari „Website öffnen“ tut nichts?** Das Dev-Zertifikat muss die **LAN-IP** enthalten (nicht nur `localhost`). Einmal im Ordner `app/`:

```bash
brew install mkcert   # falls noch nicht
mkcert -install
npm run cert:lan      # liest IPs aus .env.local
npm run dev
```

- **iPhone:** mkcert-Root auf dem Gerät vertrauen (einmalig): am Mac `mkcert -CAROOT` → Datei `rootCA.pem` per AirDrop aufs iPhone → Einstellungen → Profil installieren → Einstellungen → Allgemein → Info → **Zertifikatvertrauen** → Schalter für mkcert aktivieren. Danach lädt `https://<LAN-IP>:3000` ohne blockierte „Website öffnen“-Schleife.
- **Änderungen** an Code/CSS: Seite lädt in der Regel automatisch nach (Hot Reload).

**Sinnvolle Seiten zum Durchklicken:**

**Raumstationen (alle 11 Slugs):** Dieselbe Shell [`RaumStationClient`](../app/components/raum-station-client.tsx) unter `/raum/[slug]` — TopBar (Zurück, Stationsliste), Hero mit Gyro. **Stations-Chip** unter dem Hero tippen → Raumansicht zentrieren (#72, alle Stationen mit `bild`). **Nur** `daz` und `pc-raum`: Maskottchen antippen → Dialog; währenddessen **X** neben Zurück beendet die Wiedergabe.

| Seite | Zweck |
| ----- | ----- |
| [http://localhost:3000/](http://localhost:3000/) | Startseite — **ohne** vorherigen Entry: Redirect zu `/eintritt` |
| [http://localhost:3000/eintritt?t=fest-2026](http://localhost:3000/eintritt?t=fest-2026) | Entry Schulfest: Cookie + Redirect `/` → isometrischer Hub **gesperrt** (0/11), Fenster nach Raumbesuch frei (#21) |
| [http://localhost:3000/eintritt?t=heft-2026-27](http://localhost:3000/eintritt?t=heft-2026-27) | Entry Heft: voller Hub (alle Stationen klickbar), Fortschritt zählt trotzdem (#21) |
| [http://localhost:3000/stationen](http://localhost:3000/stationen) | Alle 11 Stationen als Liste (Lock im Modus `fest`) — Epic #58 |
| [http://localhost:3000/eintritt](http://localhost:3000/eintritt) | Hinweisseite + **In-App-Scanner** für Eintritts-QR (#57); Kamera nur auf `localhost`/HTTPS |
| [http://localhost:3000/robots.txt](http://localhost:3000/robots.txt) | `Disallow: /` (Issue #16) |
| [http://localhost:3000/scan](http://localhost:3000/scan) | In-App-QR-Scanner mit dunklem Chrome und gelbem Scan-Rahmen (nach Entry; Kamera-Zugriff nötig) |
| [http://localhost:3000/raum/klassenzimmer](http://localhost:3000/raum/klassenzimmer) | Standard-Raum-Chrome; leere Medienliste (Empty-State) |
| [http://localhost:3000/raum/daz](http://localhost:3000/raum/daz) | **Dialog:** Frieda/Otto antippen; **X** beendet Dialog; Chip zentriert |
| [http://localhost:3000/raum/pc-raum](http://localhost:3000/raum/pc-raum) | Zweiter Dialog, gleicher Flow |
| [http://localhost:3000/raum/werken](http://localhost:3000/raum/werken) | Standard-Raum-Chrome |
| [http://localhost:3000/raum/turnhalle](http://localhost:3000/raum/turnhalle) | Standard-Raum-Chrome |
| [http://localhost:3000/raum/speiseraum](http://localhost:3000/raum/speiseraum) | Standard-Raum-Chrome |
| [http://localhost:3000/raum/kunst](http://localhost:3000/raum/kunst) | Standard-Raum-Chrome |
| [http://localhost:3000/raum/lesewelt](http://localhost:3000/raum/lesewelt) | Standard-Raum-Chrome |
| [http://localhost:3000/raum/hort](http://localhost:3000/raum/hort) | Standard-Raum-Chrome |
| [http://localhost:3000/raum/musik](http://localhost:3000/raum/musik) | **Gyro**, **2 Hotspots**, **4 Medien-Slots** (Demo-Typen); Chip zentriert |
| [http://localhost:3000/raum/schulsozialarbeit](http://localhost:3000/raum/schulsozialarbeit) | Standard-Raum-Chrome; ein Text-Medium |
| [http://localhost:3000/raum/gibts-nicht](http://localhost:3000/raum/gibts-nicht) | **404** (nur im Dev-Server; unbekannte Slugs sind zur Build-Zeit fest) |

**Hinweis zu 404:** Die Routen kommen aus `data/stations.json` (`generateStaticParams`). Ein Slug, der **nicht** in der JSON-Datei steht, liefert in der **Produktion** nach `npm run build` eine 404-Seite. Unter `npm run dev` zeigt Next.js oft eine dynamische 404 — zum Verhalten wie online unbedingt **Abschnitt 3** ausführen.

---

## 2. Mobil / schmales Layout prüfen

1. Browser **Entwicklertools** öffnen (z. B. F12 oder Rechtsklick → Untersuchen).
2. **Geräte-Symbol** aktivieren (responsive Modus).
3. Viewport z. B. **375 × 667** wählen und `/raum/musik` erneut laden.

So prüfst du, ob nichts horizontal scrollt und Startseite (Schulhaus) sowie Stubs (Viewer, Medien) im Hochformat sinnvoll wirken.

---

## 3. Wie online: Build + Start

Entspricht dem, was `npm run build` auf dem Server bzw. in Docker auch macht (inkl. Asset-Check):

```bash
cd app
npm run build
npm run start
```

- App unter [http://localhost:3000](http://localhost:3000) (Port siehe Terminal-Ausgabe).
- Zum Beenden: im Terminal `Ctrl+C`.

`npm run build` ruft zuvor **`npm run validate:tokens`** (Abgleich `app/gs39-tokens.css` ↔ `auftraggeber/.../colors_and_type.css`) und **`npm run validate:stations`** auf: Es muss jede in `stations.json` referenzierte Datei unter `public/` existieren (Raumbilder, Demo-Medien). Fehlt etwas, bricht der Build mit einer klaren Meldung ab. Zusätzlich gibt `validate:stations` bei riskantem Hotspot-**y** (nach Auto-Zoom unsichtbar) eine **Warnung** aus (Heuristik).

**Raum-Viewer (Issue #55 / #56, #72):** `export const viewport` in [`app/app/layout.tsx`](../app/app/layout.tsx) — korrektes **device-width** auf dem Handy (kein „Mini-Desktop-Zoom“). Hero auf allen Raumseiten `min(58vh, 400px)`. **Auto-Zoom** skaliert schmale Bilder so, dass horizontal mindestens `MIN_PAN_DISPLAY_RATIO` (2) erreicht wird — dabei kann **oben/unten beschnitten** werden; Hotspot-**y** im mittleren Drittel halten. **Gyro (Portrait):** Handy vor die Brust, **links und rechts drehen** (nicht kippen) — ca. ±60° vom Neutral zu beiden Raumrändern (`GYRO_FULL_RANGE_DEG`, Feintuning: [raum-viewer-gyro-feintuning.md](./raum-viewer-gyro-feintuning.md)); bei Drift **Stations-Chip** tippen (zentriert). **Landscape (iPad):** Kippen (`gamma`) wie bisher. **Wischen** bleibt nach Loslassen stabil. Debug: `?debug=1` — HUD mit `axis`, `α`, `γ`, `∠`, `pan`. Beliebige `/raum/…` — **iPhone nur unter HTTPS**; Portrait/Landscape-Wechsel prüfen (Neutral-Reset); Norddurchquerung (0°/360°) ohne Pan-Sprung.

**Stempel & Hub-Freischaltung (Issue #21 / ADR-009):**

1. `/eintritt?t=fest-2026` → Hub gesperrt, „0 von 11“
2. `/scan` → Raum-QR scannen → Fenster auf Hub frei, „1 von 11“
3. **Browser-Zurück** vom Raum → `/?highlight=slug` → Fenster-Pop, URL bereinigt nach ~1,2 s
4. `/eintritt?t=heft-2026-27` → alle Fenster klickbar, Fortschritt bleibt
5. Local Storage `sn_visited_slugs` löschen → Fortschritt 0
6. Mit Cookie direkt `/raum/musik` → nach Reload `/` ist Fenster frei (`fest`)
7. `fest` mit bereits besuchten Stationen: Hub neu laden → kurzer Lade-Platzhalter, kein „alles gesperrt“-Flash
8. Zwei Tabs (`/` + `/scan`): im zweiten Tab scannen → erster Tab aktualisiert bei Fokus
9. Alle 11 Stationen besucht → `SparkleBurst` auf `/` **einmalig**; `localStorage` `sn_sparkle_done` verhindert Wiederholung
10. `curl -sI http://localhost:3000/stationen` ohne Cookie → `307` nach `/eintritt`

**Manuelle Test-Matrix (Schulfest-relevant):**

| Umgebung | Prüfen |
| -------- | ------ |
| iPhone Safari (HTTPS) | Armschwenk (α) links+rechts, Drift-Check, Hotspots nur per Tipp, Wischen, kein Pull-to-Refresh |
| iPad Safari | Portrait↔Landscape: Achswechsel α/γ, Neutral-Reset, kein Bild-Sprung |
| Android Chrome (Phone) | Gyro unter HTTPS |
| Desktop Chrome | keine Crashes, ggf. Banner „Orientierung nicht verfügbar“ |
| Samsung Internet / Firefox Mobile | best-effort |

**Design-Tokens:** Farben und Typo folgen [`auftraggeber/material/UI-Vorschläge/colors_and_type.css`](../auftraggeber/material/UI-Vorschläge/colors_and_type.css) (Kopie in `app/app/gs39-tokens.css`). **Dark Mode** der App ist bewusst deaktiviert (Papier-Look).

---

## 4. Schnelle Qualitätschecks (ohne Browser)

Im Ordner `app/`:

```bash
npm run validate:tokens   # Design-Tokens vs. Auftraggeber-CSS
npm run validate:stations   # nur Asset-Pfade prüfen
npm run test                  # Vitest (Merge Schulhaus ↔ JSON)
npm run lint                  # ESLint
npm run format:check          # Prettier (nur Prüfung)
npm run generate:qr -- --dry-run   # QR-URLs prüfen (Issue #15, schreibt keine PNGs)
```

---

## 5. Health-Check (API)

Mit laufendem Server (`dev` oder `start`):

```bash
curl -s http://localhost:3000/api/health
```

Erwartung: HTTP **200** und eine kurze OK-Antwort (für Monitoring/Coolify relevant).

---

## 6. Docker (optional)

Identisches Laufzeit-Image wie in Produktion — Schritt-für-Schritt: Abschnitt **Docker** in [`fuer-entwickler.md`](./fuer-entwickler.md).

---

## Demo-Termin 10.06.

Schritt-für-Schritt für das MPZ-Meeting mit Sten/Tina: [`demo-meeting-2026-06-10.md`](./demo-meeting-2026-06-10.md).

---

## Device-Spike: Maskottchen-Hotspot + Dialog-Audio (iPhone)

**Voraussetzung:** HTTPS (lokal `npm run dev` mit `--experimental-https` oder Deploy). Zuerst Entry: `/eintritt?t=fest-2026`.

1. `/raum/daz` öffnen — **Frieda** als große Figur **links in der Bildmitte** sichtbar? (Hotspot-`y` muss im sichtbaren Drittel liegen, sonst Konsole: `Hotspot … liegt außerhalb des sichtbaren Bereichs`)
2. **Einmal auf Frieda tippen** (nicht wischen) — startet Clip 1 **sofort** mit Ton? (Kein zweiter Start-Button nötig.)
3. Dialog läuft alle 9 Clips durch; Raum lässt sich **weiter** mit Gyro bewegen.
4. Netzwerk: ohne Cookie → `/api/dialog/daz/01-frieda.wav` = 403; mit Cookie = 200/206.
5. Regression: `/raum/musik` — kleine gelbe Hotspots öffnen weiter Medien-Panel.

**Bekannte Spike-Grenzen:** keine Sprechblase im Raum; Cutscene-Button parallel noch vorhanden; nur eine Figur (Frieda) als Hotspot.

---

## Kurz-Checkliste vor einem Push

1. `npm run build` im Ordner `app/` erfolgreich
2. `npm run lint` ohne Fehler
3. `npm run test` ohne Fehler
4. Manuell `/`, `/raum/musik` und eine zweite Station im Browser geöffnet

Bei Fragen zum Datenmodell oder zu Stationen: [`data/stations.json`](../app/data/stations.json) und [`auftraggeber/material/stationen/zuordnung-stationen-bilder.md`](../auftraggeber/material/stationen/zuordnung-stationen-bilder.md).
