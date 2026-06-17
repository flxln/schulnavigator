# Schulnavigator — Lokal anschauen und testen

_Kurzanleitung: Entwicklungsstand im Browser prüfen, typische Checks, produktionsnahes Verhalten._

Ausführliches Setup und Docker: [`fuer-entwickler.md`](./fuer-entwickler.md).  
Content einpflegen (JSON, Medien, Hotspots): [`content-einpflegen.md`](./content-einpflegen.md).

---

## Voraussetzung

- Node.js 20+ und npm
- Terminal im Verzeichnis **`app/`** (alle `npm`-Befehle dort)
- **Entry-Token** für Test-URLs: [`app/lib/access-token-constants.mjs`](../app/lib/access-token-constants.mjs) (`FEST_DEV_TOKEN`, `HEFT_DEV_TOKEN`) — ändern sich nach `npm run rotate:access-tokens`

---

## 1. Entwicklungsserver (Alltag)

```bash
cd app
npm install   # nur bei erstem Mal oder nach Dependency-Änderung
npm run dev
```

- **URL am Mac:** [https://localhost:3000](https://localhost:3000) (`npm run dev` nutzt experimentelles HTTPS)
- **iPhone im gleichen WLAN:** nur **`https://`** (nicht `http://`) — z. B. `https://192.168.x.x:3000/eintritt?t=fest-vkc2AuKW0S7QGHDT`
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

**Raumstationen (alle 12 Slugs):** Dieselbe Shell [`RaumStationClient`](../app/components/raum-station-client.tsx) unter `/raum/[slug]` — TopBar (Zurück, Stationsliste), Hero mit Gyro, **Card-Peek** unten (#111). **Stations-Chip** unter dem Hero tippen → Raumansicht zentrieren (#72, alle Stationen mit `bild`). **Nur** `daz` und `pc-raum`: Maskottchen antippen → Dialog; währenddessen **X** neben Zurück beendet die Wiedergabe.

| Seite | Zweck |
| ----- | ----- |
| [https://localhost:3000/](https://localhost:3000/) | Startseite — **ohne** vorherigen Entry: Redirect zu `/eintritt` |
| [https://localhost:3000/eintritt?t=fest-vkc2AuKW0S7QGHDT](https://localhost:3000/eintritt?t=fest-vkc2AuKW0S7QGHDT) | Entry Schulfest: Cookie + Redirect `/` → Frontansicht-Hub **gesperrt** (0/12), Slots nach Raumbesuch frei (#21) |
| [https://localhost:3000/eintritt?t=heft-ImulQPDmydy7VCVj](https://localhost:3000/eintritt?t=heft-ImulQPDmydy7VCVj) | Entry Heft: voller Hub (alle Stationen klickbar), Fortschritt zählt trotzdem (#21) |
| [https://localhost:3000/stationen](https://localhost:3000/stationen) | Alle 12 Stationen als Liste mit **Raum-Icons** (#105; Lock im Modus `fest`) — Epic #58 |
| [https://localhost:3000/eintritt](https://localhost:3000/eintritt) | Hinweisseite (Willkommens-Karte → Link auf Scan-Route); Fehler `?reason=expired\|invalid` |
| [https://localhost:3000/eintritt/scan](https://localhost:3000/eintritt/scan) | **Vollbild-Entry-Scanner** (#57, #82); Kamera nur auf `localhost`/HTTPS; ohne Cookie erreichbar |
| [https://localhost:3000/robots.txt](https://localhost:3000/robots.txt) | `Disallow: /` (Issue #16) |
| [https://localhost:3000/scan](https://localhost:3000/scan) | In-App-QR-Scanner mit dunklem Chrome und gelbem Scan-Rahmen (nach Entry; Kamera-Zugriff nötig) |
| [https://localhost:3000/raum/klassenzimmer](https://localhost:3000/raum/klassenzimmer) | **Gyro**, **4 Hotspots**, **4 Medien** (Audio/Video/Foto/Text); Text inline als Markdown im Panel |
| [https://localhost:3000/raum/daz](https://localhost:3000/raum/daz) | **Dialog:** Frieda/Otto antippen; **X** beendet Dialog; Chip zentriert |
| [https://localhost:3000/raum/pc-raum](https://localhost:3000/raum/pc-raum) | Zweiter Dialog, gleicher Flow |
| [https://localhost:3000/raum/werken](https://localhost:3000/raum/werken) | Standard-Raum-Chrome |
| [https://localhost:3000/raum/turnhalle](https://localhost:3000/raum/turnhalle) | Standard-Raum-Chrome |
| [https://localhost:3000/raum/speiseraum](https://localhost:3000/raum/speiseraum) | Standard-Raum-Chrome |
| [https://localhost:3000/raum/kunst](https://localhost:3000/raum/kunst) | Standard-Raum-Chrome |
| [https://localhost:3000/raum/lesewelt](https://localhost:3000/raum/lesewelt) | Standard-Raum-Chrome |
| [https://localhost:3000/raum/hort](https://localhost:3000/raum/hort) | Standard-Raum-Chrome |
| [https://localhost:3000/raum/musik](https://localhost:3000/raum/musik) | **Gyro**, **2 Hotspots**, **4 Medien-Slots** (Audio/Video/Foto/Text, Player #18–#20); Chip zentriert |
| [https://localhost:3000/raum/schulsozialarbeit](https://localhost:3000/raum/schulsozialarbeit) | Standard-Raum-Chrome; ein Text-Medium |
| [https://localhost:3000/raum/schulhof](https://localhost:3000/raum/schulhof) | Standard-Raum-Chrome; Hof-Station (#86) |
| [https://localhost:3000/raum/gibts-nicht](https://localhost:3000/raum/gibts-nicht) | **404** (nur im Dev-Server; unbekannte Slugs sind zur Build-Zeit fest) |

### MPZ Studio (nur `npm run dev`, ADR-022, Issue #145)

Internes Dev-only-Ingest-Tool — **nie** auf Coolify, in Production 404.

1. In `app/.env.local`: `SN_MPZ_STUDIO_SECRET=…` setzen (Vorlage: `app/.env.example`).
2. Dev-Server neu starten (Env wird beim Start geladen).
3. [https://localhost:3000/mpz/studio](https://localhost:3000/mpz/studio) öffnen → Redirect zu `/mpz/unlock`, Secret eintragen → Cookie-Session → Dashboard.
4. API-Check (optional): `curl -H "x-mpz-studio-key: $SN_MPZ_STUDIO_SECRET" http://localhost:3000/api/mpz/health`

**Speichern & Validieren (#150, #155).** Nach Uploads/Kalibrierung zeigt das Dashboard den Status (debounced, ≥ 800 ms). Button oben rechts **Speichern & Validieren** normalisiert die Hub-Reihenfolge in `stations.json` und prüft Struktur + Dateireferenzen. Schreiben läuft über Temp-Datei → Validierung → `rename` (kein invalider Zustand bei Abbruch). Nach Medien-/Dialog-Upload liefert die API `validation` + `mtime` direkt; bei Fehlern: rotes Panel, ggf. Rollback aus `.bak`.

**Medien hochladen (Issue #147).** Im Studio „Medien hochladen (Test)“ oder direkt
[/mpz/studio/ingest](https://localhost:3000/mpz/studio/ingest): Station + Typ + Datei wählen → Upload. Die Datei landet unter `public/media/{slug}/{ordner}/` und der `medien[]`-Eintrag wird in `data/stations.json` ergänzt (gleicher Pfad wie die CLI). Regeln: Magic-Byte- und Größenprüfung je Typ (audio 25 MB, video 150 MB, foto 8 MB, text 512 KB); HEIC wird abgelehnt — bitte als JPG exportieren. Bei Dateinamen-/`id`-Kollision benennt die API automatisch um (`-2`, `-3`, …).

curl-Beispiel (multipart, Cookie- oder Header-Auth):

```bash
curl -X POST http://localhost:3000/api/mpz/media/ingest \
  -H "x-mpz-studio-key: $SN_MPZ_STUDIO_SECRET" \
  -F "slug=werken" -F "typ=foto" -F "untertitel=Unser Werken" \
  -F "file=@./foto.jpg"
```

**Dialog-Audio (Issue #148).** Im Studio „Dialog-Audio (Test)“ oder
[/mpz/studio/dialog-audio](https://localhost:3000/mpz/studio/dialog-audio): Station `daz` oder `pc-raum` wählen → Segment-Tabelle zeigt fehlende Clips → WAV hochladen. Datei landet unter `content/dialog-audio/{slug}/NN-rolle.wav`; `dialog.segmente[i].quelle` wird auf `/api/dialog/{slug}/…` gesetzt. Nur echte WAV (max. 15 MB); Reihenfolge der `dialog.segmente[]` ist immutabel (siehe [content-einpflegen.md](./content-einpflegen.md)).

```bash
curl -X POST "http://localhost:3000/api/mpz/dialog-audio/ingest" \
  -H "x-mpz-studio-key: $SN_MPZ_STUDIO_SECRET" \
  -F "slug=daz" -F "segmentIndex=0" -F "collision=replace" \
  -F "file=@./01-frieda.wav"
```

**Hotspot-Kalibrierung (Issue #149).** Zuerst `/mpz/unlock`. Im Studio: **Dashboard** (`/mpz/studio`) oder **Stationen** (`/mpz/studio/stationen`) — dort Vorschau und Kalibrier-Links je Station.

- **Sphere:** `/raum/{slug}?hotspot-calib=1` (z. B. `daz`, `klassenzimmer`) → Hotspot-ID wählen, auf Ankerpunkt klicken → **In stations.json übernehmen** (oder JSON kopieren). Nach Browser-Zurück und erneutem Aufruf bleibt das Overlay sichtbar (reagiert auf URL via `useSearchParams`).
- **Flat:** `/mpz/calib/flat/kunst` (Station mit `bild`, kein `equirectangular`) → Klick setzt `x`/`y` → Übernehmen. Hotspot muss bereits in `hotspots[]` existieren.

```bash
curl -X POST http://localhost:3000/api/mpz/hotspots/sphere \
  -H "x-mpz-studio-key: $SN_MPZ_STUDIO_SECRET" \
  -H "content-type: application/json" \
  -d '{"slug":"daz","hotspotId":"hs-frieda","yaw":-45,"pitch":-20}'
```

**Hinweis zu 404:** Die Routen kommen aus `data/stations.json` (`generateStaticParams`). Ein Slug, der **nicht** in der JSON-Datei steht, liefert in der **Produktion** nach `npm run build` eine 404-Seite. Unter `npm run dev` zeigt Next.js oft eine dynamische 404 — zum Verhalten wie online unbedingt **Abschnitt 3** ausführen.

### Scanner bei System-Dark-Mode

Auf einem echten Gerät mit **aktivem System-Dark-Mode** (iOS Safari oder Android Chrome) prüfen:

- [ ] `/eintritt/scan` — TopBar-Titel, Hinweistext, Button „Eintritts-QR scannen“, Status „Kamera wird gestartet …“
- [ ] `/scan` (nach Entry) — gleiche Elemente; bei falschem QR Fehlermeldung lesbar
- Erwartung: helle/weiße Schrift auf schwarzem Hintergrund, gut lesbar (kein unsichtbarer Text)

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

- App unter [https://localhost:3000](https://localhost:3000) (Port siehe Terminal-Ausgabe).
- Zum Beenden: im Terminal `Ctrl+C`.

`npm run build` ruft zuvor **`npm run validate:tokens`**, **`npm run validate:stations`**, **`npm run validate:coach`** und **`npm run validate:access-config`** auf: Es muss jede in `stations.json` referenzierte Datei unter `public/` existieren (Raumbilder, Demo-Medien). Fehlt etwas, bricht der Build mit einer klaren Meldung ab. Zusätzlich gibt `validate:stations` bei riskantem Hotspot-**y** (nach Auto-Zoom unsichtbar) eine **Warnung** aus (Heuristik).

**Raum-Viewer (Issue #55 / #56, #72, #96, #107, #111):** `export const viewport` in [`app/app/layout.tsx`](../app/app/layout.tsx) — korrektes **device-width** auf dem Handy (kein „Mini-Desktop-Zoom“). **Pinch-Zoom gesperrt** projektweit ([#96](https://github.com/flxln/schulnavigator/issues/96)): Meta `userScalable: false` reicht auf iOS nicht — zusätzlich [`DisableZoom`](../app/components/ui/disable-zoom.tsx) im Root-Layout. Test: mit zwei Fingern zoomen → Seite darf **nicht** skalieren (nach Deploy ggf. Hard Reload in Safari).

**Card-Peek (#111):** Raumseiten nutzen **Body-Scroll** (kein Viewport-Lock). Hero-Höhe `calc(100svh - 6.5rem)`; Inhaltskarte mit `-mt-6` überlappt den Hero — initial sichtbar: nur die **Überschriftenzeile** (Chip, „Schulhaus-Rundgang“, Titel, ChevronUp). Beschreibung, Medien und Footer erst durch **Hochwischen**. `<main>` nutzt `.sn-page-container` (Phone `max-w-lg`, Tablet breiter — siehe unten); `overflow-x: clip` auf `html`/`body`.

**Tablet / iPad (Epic #74, ADR-012):** DevTools-Presets zum Layout-Check:

| Viewport | Routen | Prüfen |
|----------|--------|--------|
| 375×667 | `/`, `/raum/musik` | Phone-Baseline unverändert |
| 768×1024 | `/`, `/raum/musik`, `/raum/daz`, `/scan` | Breitere Spalte (~672 px), größerer Hero, Scan-Vollfläche, Medien-Modal zentriert; **Medien-Hotspots** etwa wie am Phone (nicht überproportional groß) |
| 1024×768 | `/raum/musik` | Gyro γ, Rotation ohne Pan-Sprung |
| 834×1194 | `/raum/daz` | Dialog-Gruppe (Bubble + Maskottchen) |
| 1024×1366 | `/`, `/raum/musik` | `lg:max-w-3xl`-Cap, Leerraum links/rechts gewollt |

TopBar auf Raumseiten: **viewport-breit** (`fixed`), nicht auf Content-Spalte begrenzt. Gyro auf echtem iPad nur unter HTTPS.

**iOS-Breite (manuell, echtes Gerät):**

- [ ] Safari: `/raum/klassenzimmer` — nichts ragt **rechts** über den Rand; Titel nicht abgeschnitten
- [ ] Chrome iOS: gleiche Seite — **Hochscrollen** zur Medienliste funktioniert
- [ ] Hort oder PC-Raum zum Vergleich (kurzer Titel)

**Auto-Zoom** skaliert schmale Bilder so, dass horizontal mindestens `MIN_PAN_DISPLAY_RATIO` (2) erreicht wird — dabei kann **oben/unten beschnitten** werden; Hotspot-**y** im mittleren Drittel halten. **Gyro (Portrait):** Handy vor die Brust, **links und rechts drehen** (nicht kippen) — ca. ±60° vom Neutral zu beiden Raumrändern (`GYRO_FULL_RANGE_DEG`, Feintuning: [raum-viewer-gyro-feintuning.md](./raum-viewer-gyro-feintuning.md)); bei Drift **Stations-Chip** tippen (zentriert). **Landscape (iPad):** Kippen (`gamma`) wie bisher. **Wischen** bleibt nach Loslassen stabil (Sphere: Gyro-Neustart in `sphere-raum-viewer-inner`; Flat: debounced Resize bei `svh`-Änderung). Debug: `?debug=1` — HUD mit `axis`, `α`, `γ`, `∠`, `pan`. Beliebige `/raum/…` — **iPhone nur unter HTTPS**; Portrait/Landscape-Wechsel prüfen (Neutral-Reset); Norddurchquerung (0°/360°) ohne Pan-Sprung.

**Sphere-Viewer (360°, ADR-018):**

1. `/raum/daz` — Maskottchen auf Boden, Dialog-Bubble am Kopf, Sprecherwechsel ohne Flackern
2. `/raum/pc-raum` — Maskottchen + Delightex-Icon (`imageLayer`)
3. `/raum/klassenzimmer`, `/raum/musik` — Medien-Icons in der Szene
4. `/raum/kunst` (Flat) — Regression: Gyro-Pan unverändert
5. Dev-Kalibrierung: `/raum/daz?hotspot-calib=1` — Klick liefert `yaw`/`pitch`-Snippet
6. **Startblick (#152, ADR-023):** Optional `startYaw`/`startPitch` in `stations.json` — Kamera beim Laden und „Ansicht zentrieren“ (Stations-Chip) springen dorthin. Gyro startet erst nach Startblick-`rotate` (am Gerät prüfen: nach Orientierungs-Freigabe kein Sprung weg vom Startblick). MPZ-Persistenz folgt mit #153.

Referenz: [`2026-06-13-sphere-hotspot-acceptance.md`](../dokumentation/projektmanagement/2026-06-13-sphere-hotspot-acceptance.md).

**Swipe-Onboarding (#107):**

1. `localStorage.removeItem('schulnav.pan-onboarding.seen')` in der Konsole (oder DevTools → Application → Local Storage)
2. `/eintritt?t=heft-ImulQPDmydy7VCVj` → `/raum/musik` — Overlay „Links oder rechts wischen“ erscheint, Merker **noch nicht gesetzt**; nach ~3 s Fade-out, Merker gesetzt
3. Seite neu laden → **kein** Overlay
4. Während Overlay sichtbar: Hotspot antippen → Tap funktioniert (`pointer-events: none` — Overlay blockiert keine Gesten)
5. **iOS/Safari + HTTPS, erster Besuch:** zuerst „Orientierung aktivieren“ → nach Freigabe erscheint erst dann das Onboarding
6. **iOS/Safari, cached grant:** `sessionStorage.setItem('schulnav.gyro.granted','1')` in der Konsole setzen, Merker löschen, Raum öffnen → Overlay erscheint **und verschwindet** nach ~3 s (kein Hängenbleiben)
7. Desktop ohne Gyro → Overlay beim ersten Raumbesuch sofort sichtbar
8. Merker löschen, ersten Raum **< 3 s** verlassen (Browser-Zurück), Raum erneut öffnen → Hinweis erscheint erneut (Merker wird erst bei Fade-Start gesetzt)

**Stempel & Hub-Freischaltung (Issue #21 / ADR-009):**

1. `/eintritt?t=fest-vkc2AuKW0S7QGHDT` → Hub gesperrt, „0 von 12“
2. `/scan` → Raum-QR scannen → Fenster auf Hub frei, „1 von 12“
3. **Browser-Zurück** vom Raum → `/?highlight=slug` → Fenster-Pop, URL bereinigt nach ~1,2 s
4. `/eintritt?t=heft-ImulQPDmydy7VCVj` → alle Fenster klickbar, Fortschritt bleibt
5. Local Storage `sn_visited_slugs` löschen → Fortschritt 0
6. Mit Cookie direkt `/raum/musik` → nach Reload `/` ist Fenster frei (`fest`)
7. `fest` mit bereits besuchten Stationen: Hub neu laden → kurzer Lade-Platzhalter, kein „alles gesperrt“-Flash
8. Zwei Tabs (`/` + `/scan`): im zweiten Tab scannen → erster Tab aktualisiert bei Fokus
9. Alle 12 Stationen besucht → auf `/` zuerst **Coach** (`complete`, Frieda + Otto), nach Schließen **SparkleBurst** auf der Fortschrittskarte; `sn_sparkle_done` verhindert Sparkle-Wiederholung; Coach-Keys `sn_coach_seen_fest` / `sn_coach_seen_heft` (modus-getrennt)
10. `curl -sI https://localhost:3000/stationen` ohne Cookie → `307` nach `/eintritt`
11. **Regression #83 (`fest`):** Raum per QR freischalten → Raum-Footer „Scanne die nächste Station!“ → **`/scan`**; ohne Scan schließen → `sn_visited_slugs` enthält **nicht** die ungescannte Station
12. **`fest`/`heft` 1–11:** **über** der Fortschrittskarte **ein** Button „Scanne die nächste Station!“ — **kein** Stationsname, **kein** geteilter Button
13. **`fest` 0/12:** nur „QR an der Tür scannen“ **über** der Fortschrittskarte
14. **`fest`/`heft` 12/12:** kein Scan-CTA unter dem Hub (Sparkle in der Fortschrittskarte optional)
15. **Fortschrittskarte:** Tipp auf „Mein Rundgang …“ → **`/stationen`** (wie Listen-Icon oben rechts)
16. **Kein Flash:** `fest` mit Fortschritt neu laden → vor Hydration Einzel-Scan, danach „Scanne die nächste Station!“ (Button-Text wechselt, Anzahl bleibt 1)

**Coach-Einblendungen (ADR-019):**

1. `localStorage` leeren (`sn_coach_seen_heft`, `sn_coach_seen_fest`, `sn_visited_slugs`, `sn_sparkle_done`) → `/` mit Heft-Cookie: `welcome-hub` (Frieda von links), einmalig
2. Einen Raum besuchen → zurück `/`: `first-visit` (Otto von rechts)
3. `/raum/klassenzimmer`, `/raum/musik`, `/raum/hort` je einmalig: `room-first-*` (von links/rechts laut JSON)
4. `/raum/daz`: **kein** Room-Coach; Dialog-Hotspot unverändert; während Dialog **kein** Coach
5. Fortschritt auf 6/12 → Hub: `halfway`; von 5/12 direkt auf 7/12 springen → beim nächsten `/` erscheint `halfway` trotzdem (Schwellwert-Nachholen)
6. 12/12 → Coach `complete` (`duo-split`) → schließen → Sparkle auf Fortschrittskarte → erneut `/` → weder Coach noch Sparkle
7. Room-Coach erscheint, ohne X wegtippen (zurück) → Raum erneut öffnen → Coach **nicht** wieder (Seen beim Anzeigen)
8. Heft: `welcome-hub` gesehen → Fest-Cookie → `welcome-hub` erscheint im Fest erneut (modus-getrennt)
9. Medienpanel im Raum öffnen → kein Coach darüber; nach Schließen ggf. Room-Coach
10. `prefers-reduced-motion`: kein Slide, Text sichtbar
11. **Overlay-Priorität (iOS):** `schulnav.pan-onboarding.seen` + Coach-Keys leeren → Raum mit Room-Coach (`klassenzimmer`/`musik`/`hort`) → nur Gyro-Dialog (kein Coach-Flackern) → nach Freigabe nur Pan-Hinweis → danach Room-Coach
12. **Desktop (gyrolos):** gleicher Raum, Coach-Keys leer → kein Gyro/Pan, Room-Coach erscheint direkt
13. **Tablet-Spalte (Folge #74):** DevTools 768×1024 und 1024×768 — Backdrop fullscreen; Figuren, Blase und Schließen-Button innerhalb `.sn-page-container` (nicht am Viewport-Rand); `duo-split` auf `/` bei 12/12

**Stationssymbole (#105):**

| Route / Aktion | Prüfen |
| -------------- | ------ |
| `/stationen` (Heft, 0 besucht) | Alle Kacheln: gedämpftes Lucide-Icon, **keine** Ziffern; kein Untertitel „Station N“ |
| Raum besuchen → `/stationen` | Besuchte Kachel: Icon in Akzentfarbe + grünes Häkchen rechts |
| `/stationen` Reload mit Fortschritt | Kurz „Fortschritt wird geladen…“, dann **ein** Reveal — kein grau→farbig pro Kachel |
| `/` Hub (`fest`, unbesucht) | Fenster-Chips: Symbol im **größeren** weißen Kreis (nicht Ziffer) |
| Hub nach Besuch | Fensterfläche **transparent** akzentgetönt (nicht opak); Akzent-Chip mit Häkchen statt Symbol |
| `/raum/klassenzimmer` | Header-Chip: weißes Symbol auf Akzent; Eyebrow „Schulhaus-Rundgang“ |
| `/stationen` (`fest`, ungescannt) | Gesperrt: Grayscale + reduzierte Opazität + Schloss — **anders** als unbesucht-offen (Heft) |

**Medien-Player (#18–#20, TextViewer #93) — nach Demo-Hotspots:**

| Route | Prüfen |
| ----- | ------ |
| `/eintritt?t=heft-ImulQPDmydy7VCVj` → `/raum/klassenzimmer` | **4 Hotspots** im Panorama; Hotspot **Text** → Markdown inline (Tabelle, Blockquote); Hotspot **Video** → MP4-Wiedergabe |
| `/raum/klassenzimmer` Medienliste | Alle 4 Tiles; Text-Tile → „Tippen zum Lesen"; Markdown im Panel |
| `/eintritt?t=heft-ImulQPDmydy7VCVj` → `/raum/musik` | Hotspot **Audio** öffnet Panel → Custom-Player (Play/Pause, Balken, Lautstärke); Panel schließen **während Wiedergabe** → Audio stoppt (Cleanup-Check) |
| `/raum/musik` Hotspot **Video** | Poster-only-Modus (`/demo/video-plakat.jpg`); kein Autoplay, kein leeres `<video>` |
| `/raum/musik` Medienliste → **Text** | Inline-Plaintext aus `/demo/musik-info.txt` (kein externer Link mehr) |
| `/raum/schulsozialarbeit` → **Text** | Inline-Plaintext aus `/demo/ssa-hinweis.txt`, Umlaute korrekt |
| `/raum/musik` Medienliste → **Foto** | Inline-Bild; „Vergrößern"-Button → Vollbild expand-in-place; `Escape` → zurück auf Bild, dann Panel schließen |
| JSON `videoSource: 'youtube'` (manuell) | Hinweistext „Noch nicht verfügbar", kein Embed |
| `npm run build` | grün — kein fehlender `poster`-Pfad, kein LFS-Pointer |

---

**Panorama-Raumbilder (#17/#27) — nach Pano-Tausch:**

| Route | Prüfen |
| ----- | ------ |
| `/raum/daz?debug=1` | Gyro-Pan sichtbar (3:1); Frieda/Otto unten tappbar (`y≈0,78`); Sprechblase + Dialog |
| `/raum/pc-raum?debug=1` | wie `daz` |
| `/raum/musik` | Demo-Hotspots Video/Audio treffen |
| `/raum/schulsozialarbeit` | **kein** Raumbild — nur Text/Medienliste |
| `/raum/kunst`, `/raum/hort` | 4:3-Platzhalter — Gyro schwach, Auto-Zoom-Warnung erwartbar |

Live nach erstem LFS-Push: `curl -sI https://schulnavigator.mpz.schule/stations/musik.jpg` — `content-length` deutlich größer als ~130 B; Magic-Bytes `ff d8` (kein LFS-Pointer im Image).

**Manuelle Test-Matrix (Schulfest-relevant):**

| Umgebung | Prüfen |
| -------- | ------ |
| iPhone Safari (HTTPS) | Armschwenk (α) links+rechts, Drift-Check, Hotspots nur per Tipp, Wischen, kein Pull-to-Refresh |
| iPad Safari | Portrait↔Landscape: Achswechsel α/γ, Neutral-Reset, kein Bild-Sprung |
| Android Chrome (Phone) | Gyro unter HTTPS |
| Desktop Chrome | keine Crashes, ggf. Banner „Orientierung nicht verfügbar“ |
| Samsung Internet / Firefox Mobile | best-effort |

**Delightex-Embed (`typ: embed`, #100):**

Voraussetzung lokal: `NEXT_PUBLIC_EMBED_ENABLED=true` in `app/.env.local` (siehe `.env.example`), Dev-Server neu starten.

| Route / Aktion | Prüfen |
| -------------- | ------ |
| `/raum/pc-raum` → Hotspot „3D-Welt“ | Panel mit iframe; Button „Im Browser öffnen“ immer sichtbar |
| Delightex-Interaktion | 3D-Welt drehen/schwenken, Klicks auf Objekte — nicht nur „Seite lädt“ |
| Desktop Chrome | iframe + Fallback-Panel darunter (Browser-Button + App-Store-Links) |
| `NEXT_PUBLIC_EMBED_ENABLED=false` | Kein iframe; Fallback-Panel bleibt sichtbar |

Echte Embed-URL in `stations.json` (`pc-delightex.quelle`) muss öffentlich einbettbar sein (kein `X-Frame-Options: DENY`).

**Delightex-Fallback auf Mobile:**

Auf Touch-Geräten wird kein iframe gerendert — stattdessen erscheint direkt die Fallback-Karte (WebGL im eingebetteten Frame funktioniert auf iOS/Android oft nicht).

| Gerät / Modus | Erwartung |
| ------------- | --------- |
| iPhone Safari | Kein iframe; Hinweis „Die 3D-Welt braucht WebGL…"; „Im Browser öffnen" + „Delightex-App installieren" (App Store) |
| Android Chrome | wie iPhone; App-Button → Google Play |
| Desktop Chrome | iframe + Fallback-Panel darunter |
| `typ: link` + Delightex-URL | Hotspot-Tap → Panel (kein Auto-Tab); Fallback-Karte im Panel |

DevTools: Mobilgerät simulieren (Geräte-Modus, pointer: coarse) — reicht für grundlegenden Check. Echtes Gerät vor Merge empfohlen.

**Book-Creator-Embed (`typ: embed`, Lesewelt):**

| Route / Aktion | Prüfen |
| -------------- | ------ |
| `/raum/lesewelt` → Hotspot „Berühmte Personen“ | Panel mit iframe; Buch lädt auf `read.bookcreator.com` |
| Umblättern / „Read to me“ | Interaktion im iframe |
| iPad / Touch | iframe sichtbar (kein Delightex-Skip) |
| Button „Im Browser öffnen“ | öffnet Buch im Tab |

Embed-URL in `stations.json` (`lesewelt-beruehmte-personen.quelle`) muss eine veröffentlichte `read.bookcreator.com`-URL sein. Hotspot-Koordinaten ggf. mit `?hotspot-calib=1` nachjustieren.

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
curl -s https://localhost:3000/api/health
```

Erwartung: HTTP **200** und eine kurze OK-Antwort (für Monitoring/Coolify relevant).

---

## 6. Docker (optional)

Identisches Laufzeit-Image wie in Produktion — Schritt-für-Schritt: Abschnitt **Docker** in [`fuer-entwickler.md`](./fuer-entwickler.md).

---

## Archiv: MPZ-Demo-Meeting 10.06.

Protokoll und Fahrplan des abgeschlossenen Termins: [`2026-06-10-mpz-demo-meeting.md`](../dokumentation/projektmanagement/2026-06-10-mpz-demo-meeting.md) · [`2026-06-10-mpz-meeting-fahrplan.md`](../dokumentation/projektmanagement/2026-06-10-mpz-meeting-fahrplan.md)

---

## Kurz-Checkliste vor einem Push

1. `npm run build` im Ordner `app/` erfolgreich
2. `npm run lint` ohne Fehler
3. `npm run test` ohne Fehler
4. Manuell `/`, `/raum/musik` und eine zweite Station im Browser geöffnet

Bei Fragen zum Datenmodell oder zu Stationen: [`data/stations.json`](../app/data/stations.json) und [`auftraggeber/material/stationen/zuordnung-stationen-bilder.md`](../auftraggeber/material/stationen/zuordnung-stationen-bilder.md).
