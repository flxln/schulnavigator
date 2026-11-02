#!/usr/bin/env node
/**
 * Generiert 18-mockup-prompts.md — jeder Prompt ist vollständig standalone
 * (z. B. Google Stitch, Claude Design, Midjourney UI) ohne externe Dateien.
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '18-mockup-prompts.md')

const STATIONS = [
  { slug: 'klassenzimmer', hubNr: 1, titel: 'Klassenzimmer', viewer: '360°' },
  { slug: 'musik', hubNr: 2, titel: 'Musik', viewer: '360°' },
  { slug: 'daz', hubNr: 3, titel: 'DaZ-Zimmer', viewer: '360°' },
  { slug: 'kunst', hubNr: 4, titel: 'Kunst', viewer: 'flat' },
  { slug: 'pc-raum', hubNr: 5, titel: 'PC-Raum', viewer: '360°' },
  { slug: 'lesewelt', hubNr: 6, titel: 'Lesewelt', viewer: 'flat' },
  { slug: 'werken', hubNr: 7, titel: 'Werken', viewer: 'flat' },
  { slug: 'speiseraum', hubNr: 8, titel: 'Speiseraum', viewer: 'flat' },
  { slug: 'hort', hubNr: 9, titel: 'Hort', viewer: 'flat' },
  { slug: 'turnhalle', hubNr: 10, titel: 'Turnhalle', viewer: 'flat' },
  { slug: 'schulsozialarbeit', hubNr: 11, titel: 'Schulsozialarbeit', viewer: 'flat' },
  { slug: 'schulhof', hubNr: 12, titel: 'Schulhof', viewer: 'flat' },
]

function base({ shell = true, calib = false, modal = false, unlock = false } = {}) {
  const layout = calib
    ? `LAYOUT: Vollbild-Kalibrierungs-Screen OHNE Studio-Sidebar. Gesamtbreite 1280 px.
- Oben: Top-Bar volle Breite, Höhe ~56 px, Hintergrund #ffffff, unterer Rand 1 px #082a501a
- Darunter: Split — links ~calc(100% - 272px) Panorama-Viewer, rechts festes Panel 272 px, Hintergrund #f5f2ea
- Top-Bar Inhalt: links „← Zurück“ (Outline-Button), Mitte Titel, rechts Chip „calib · nur lokal“ (klein, monospace-artig)`
    : unlock
      ? `LAYOUT: Zentrierte Karte auf Papier-Hintergrund, KEIN Studio-Chrome, max. Breite 400 px`
      : modal
        ? `LAYOUT: Studio-Shell im Hintergrund (abgedunkelt mit Overlay rgba(8,42,80,0.45)). Modal zentriert, Breite ~560 px, weiße Karte, Schatten weich.`
        : shell
          ? `LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px`
          : `LAYOUT: Nur Content-Bereich der Studio-Shell (Sidebar + Top-Bar angeschnitten oder implizit).`

  const nav = shell
    ? `
SIDEBAR-NAVIGATION (verbindlich, gruppiert — 6 Einträge in 4 Gruppen):
Gruppenüberschriften: 11 px, uppercase, Farbe rgba(255,255,255,0.55), Abstand oben 16 px
Einträge: 14 px Nunito, weiß, Padding 10 px 16 px, aktiver Eintrag mit hellgrünem linken Streifen #4b9a23

  ÜBERSICHT
    • Dashboard

  STATIONEN
    • Alle Stationen

  GLOBALER INHALT
    • Coach
    • Embeds & Links

  ERSCHEINUNGSBILD
    • Design & Hub

  BETRIEB
    • Deploy

VERBOTEN in der Sidebar: „Medien hochladen“, „Dialog-Audio“, getrennte „Hub-Karte“ / „Brand & Design“.

TOP-BAR (wenn Shell):
- Links: Breadcrumb in Navy #082a50, 14 px (z. B. „Stationen › Klassenzimmer“)
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px`
    : ''

  return `=== PRODUKT ===
MPZ Studio — internes Web-Werkzeug (Desktop) zum Pflegen von Schulrundgang-Inhalten für die 39. Grundschule Dresden (GS39). Nutzer: ein MPZ-Mitarbeiter (technisch versiert). Läuft nur lokal im Browser, kein Dark Mode, kein CMS für Lehrkräfte. Optik: warmes Papier, professionelles Admin-Tool — dichter und sachlicher als die bunte Besucher-App, aber gleiche Markenfarben.

=== DESIGN-SYSTEM GS39 (verbindlich) ===
Viewport-Ziel: 1280 px Breite, High-Fidelity UI-Mockup, flaches Design mit leichten Schatten, KEIN generisches Bootstrap/Material-Look.

Farben:
- Seitenhintergrund (--paper): #fcfbf7
- Karten/Flächen (--white): #ffffff
- Eingedellt (--paper-50): #f5f2ea
- Primärtext/Überschriften (--brand-navy): #082a50
- Sekundärtext: rgba(8,42,80,0.8)
- Captions: rgba(8,42,80,0.6)
- Primär-CTA (--brand-green): #4b9a23, Hover dunkler #3d7e1b
- Sekundär-Aktion (--brand-blue): #1f6abb
- Fehler (--brand-red): #ef3a37
- Warnung (--brand-sun): #fbbb24
- Rahmen: rgba(8,42,80,0.1) bis 0.2
- Sidebar-Hintergrund: #082a50, Sidebar-Text: #ffffff

Typografie: Nunito (Google-Font-Stil), sans-serif, rund und freundlich.
- Seitentitel/H1: 22–30 px, semibold, Navy
- Abschnitt/H2: 18 px semibold
- Body: 14–16 px regular
- Tabellen/Captions: 12–14 px
- Monospace nur für Pfade/Code: system monospace 13 px

Komponenten-Muster:
- Primär-Button: grüne Pill, weiße Schrift, Padding 10 px 20 px, Radius 9999 px
- Sekundär-Button: Navy Outline oder Text-Button
- Karten (sn-card): weiß, Radius 8 px, Border 1 px rgba(8,42,80,0.1), Padding 16–20 px
- Stationen-Kacheln: interaktive Karte mit Hub-Nr-Chip, Titel, slug in Caption, Ampel-Punkt (grün/gelb/rot), Viewer-Badge „flat“ oder „360°“
- Tabs: unter Station-Header, aktiver Tab grüne Unterstreichung oder grüner Text
- Tabellen: volle Breite, Header #f5f2ea, Zeilen 44 px min, Aktionen als Text-Buttons
- Chips/Badges: klein, Radius 4 px — Viewer grau-blau, Ampel als farbiger Kreis 8 px
- Fehler: roter Text + Icon, nie nur Farbe
- Touch-Targets min. 44×44 px

NICHT zeigen: Dark Mode, Schulhaus-3D-Hub-Grafik, Maskottchen-Coach-Overlay der Besucher-App, festliche Deko/Sparkles, QR-Scanner-Chrome.
${layout}${nav}`
}

function outro(exportName) {
  return `
=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: ${exportName}`
}

function prompt(title, exportName, body, opts = {}) {
  return `### ${title}

**Export:** \`${exportName}\`

\`\`\`
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: ${title}
${base(opts)}

${body.trim()}
${outro(exportName)}
\`\`\`
`
}

const prompts = []

// S1
prompts.push(
  prompt(
    'S1 — Studio-Shell · default',
    's1-shell-default.png',
    `=== DIESER SCREEN ===
Screen-ID S1. Gesamtrahmen der App mit neuer gruppierten Sidebar und Dashboard als Beispiel-Inhalt (S4).

Aktiver Sidebar-Eintrag: Dashboard (unter Gruppe ÜBERSICHT).
Content: Dashboard mit grüner Validierungskarte „Alle Checks bestanden“, kurze Begrüßung „MPZ Studio“.

Zeige die komplette Shell: Sidebar 240 px + Top-Bar + Content.`,
  ),
  prompt(
    'S1 — Studio-Shell · narrow',
    's1-shell-narrow.png',
    `=== DIESER SCREEN ===
Screen-ID S1, Zustand narrow/collapsed. Sidebar auf ~56 px Icon-Rail eingeklappt (Hamburger oben, Icons für Dashboard, Stationen, Coach, Design, Deploy). Tooltips bei Hover angedeutet.

Content nutzt fast volle Breite. Top-Bar und Save-Button bleiben sichtbar. Beispiel-Inhalt: Stationen-Grid angeschnitten.`,
  ),
)

// S2-S4
prompts.push(
  prompt(
    'S2 — Plan-A-Banner · visible',
    's2-plan-a-banner.png',
    `=== DIESER SCREEN ===
Screen-ID S2. Fokus auf das Plan-A-Banner direkt unter der Top-Bar.

Banner-Inhalt (Beispieltext): „Plan A: Du kannst Inhalte weiterhin per CLI und JSON im Repo pflegen. Das Studio ist die visuelle Alternative.“
Optik: schmale Zeile, Hintergrund #fbbb24 mit ~15 % Opazität auf #fff8e7, linker Rand 3 px gelb #fbbb24, Text 13 px Navy, kein Alarm-Rot.

Oben angeschnitten: Top-Bar mit Save-Button. Unten: Dashboard-Content beginnt.`,
  ),
  prompt(
    'S3 — Save & Validate · idle',
    's3-save-idle.png',
    `=== DIESER SCREEN ===
Screen-ID S3, Zustand idle. Noch kein Save ausgeführt.

Top-Bar: Button „Speichern & Validieren“ ist DISABLED (grau, Opacity 0.5), kein Dirty-Punkt.
Unten im Content: kein Save-Panel sichtbar ODER eingeklappt/grau mit Platzhalter „Noch nicht gespeichert“.

Dashboard als Hintergrund-Content.`,
  ),
  prompt(
    'S3 — Save & Validate · running',
    's3-save-running.png',
    `=== DIESER SCREEN ===
Screen-ID S3, Zustand running. User hat auf „Speichern & Validieren“ geklickt.

Top-Bar: Button zeigt Spinner + Text „Speichert…“
Darunter Panel (volle Content-Breite): weiße Karte mit Spinner, Text „Validierung läuft — stations.json, Coach, Tokens…“`,
  ),
  prompt(
    'S3 — Save & Validate · success',
    's3-save-success.png',
    `=== DIESER SCREEN ===
Screen-ID S3, Zustand success.

Panel: grüner linker Rand #4b9a23, Hintergrund #f0f9eb, Überschrift „Validierung erfolgreich“.
Checkliste mit Häkchen: validate:stations ✓, validate:coach ✓, validate:tokens ✓, Tests ✓
Save-Button wieder aktiv, Dirty-Punkt weg.`,
  ),
  prompt(
    'S3 — Save & Validate · rollback-error',
    's3-save-rollback-error.png',
    `=== DIESER SCREEN ===
Screen-ID S3, Zustand rollback-error.

Panel: roter linker Rand #ef3a37, Hintergrund #fef2f2, Überschrift „Validierung fehlgeschlagen — Änderungen wurden zurückgesetzt“.
Fehlerliste (3 Zeilen):
1. Station daz — Dialog-Segment 03: WAV-Datei fehlt
2. Station kunst — Hotspot hs-1: mediumId unbekannt
3. embed — Domain nicht in Allowlist
Jeder Fehler mit rotem Icon + Text (nicht nur Farbe).`,
  ),
  prompt(
    'S4 — Dashboard · ok',
    's4-dashboard-ok.png',
    `=== DIESER SCREEN ===
Screen-ID S4. Route /mpz/studio. Sidebar: Dashboard aktiv.

Content:
- H1 „Dashboard“
- Große Karte „Validierung“: grüner Status-Badge, Text „Bereit für Deploy“, Icon Häkchen
- Karte „Stationen mit Problemen“: Text „Keine — alle 12 Stationen ok“
- Quick-Links als Text-Buttons: „Alle Stationen anzeigen“, „Zum Deploy-Tab“`,
  ),
  prompt(
    'S4 — Dashboard · errors',
    's4-dashboard-errors.png',
    `=== DIESER SCREEN ===
Screen-ID S4, Zustand errors.

Validierungskarte ROT: „3 Probleme gefunden“
Liste darunter (Tabelle):
| Station | Problem | Aktion |
| kunst | Kein Raumbild | Zur Station → |
| daz | Audio-Clip fehlt Segment 07 | Zur Station → |
| embeds | Leere Allowlist | Zu Embeds → |`,
  ),
  prompt(
    'S4 — Dashboard · loading',
    's4-dashboard-loading.png',
    `=== DIESER SCREEN ===
Screen-ID S4, Zustand loading.

Validierungskarte zeigt Skeleton-Shimmer oder Spinner in der Karte. Rest der Shell normal. Text „Lade Validierungsreport…“`,
  ),
)

// S5-S7
const stationGridPartial = STATIONS.map((s, i) => {
  const ampel = i === 3 ? 'rot' : i === 7 ? 'gelb' : 'grün'
  return `  ${s.hubNr}. ${s.titel} (slug: ${s.slug}) — Viewer ${s.viewer}, Ampel ${ampel}`
}).join('\n')

prompts.push(
  prompt(
    'S5 — Stationen-Grid · partial',
    's5-stationen-partial.png',
    `=== DIESER SCREEN ===
Screen-ID S5. Route /mpz/studio/stationen. Sidebar: „Alle Stationen“ aktiv.

H1 „Stationen“. Grid 3 Spalten × 4 Zeilen = 12 Kacheln:
${stationGridPartial}

Mindestens eine rote und eine gelbe Ampel sichtbar.`,
  ),
  prompt(
    'S5 — Stationen-Grid · all-ok',
    's5-stationen-all-ok.png',
    `=== DIESER SCREEN ===
Screen-ID S5, alle Ampeln grün. Gleiches 12er-Grid, Mix aus flat und 360° Badges. Keine Fehler-Hinweise.`,
  ),
  prompt(
    'S6 — Station Detail Header · flat',
    's6-detail-header-flat.png',
    `=== DIESER SCREEN ===
Screen-ID S6. Station Klassenzimmer, aber viewer flat (hypothetisch) oder kunst.

Header-Leiste:
- Titel „Kunst“ (oder Klassenzimmer flat)
- Chip Hub-Nr „4“
- Badge „flat“ (grau-blau)
- Ampel grün
- Link rechts „↗ Vorschau /raum/kunst“ (Text-Button mit externem Pfeil)

Tabs darunter (alle sichtbar): Stammdaten | Medien | Hotspots | Dialog
Aktiver Tab: Stammdaten`,
  ),
  prompt(
    'S6 — Station Detail Header · 360°',
    's6-detail-header-360.png',
    `=== DIESER SCREEN ===
Screen-ID S6. Station „Klassenzimmer“, viewer equirectangular.

Badge „360°“ statt flat. Hub-Nr 1. Ampel grün. Vorschau-Link /raum/klassenzimmer.
Alle vier Tabs sichtbar inkl. Dialog.`,
  ),
  prompt(
    'S6 — Station Detail Header · issues',
    's6-detail-header-issues.png',
    `=== DIESER SCREEN ===
Screen-ID S6. Station mit Problemen (z. B. daz).

Ampel rot. Neben Titel kleiner Hinweis „2 Validierungsfehler“. Tabs trotzdem alle vier sichtbar.`,
  ),
  prompt(
    'S7 — Stammdaten · flat',
    's7-stammdaten-flat.png',
    `=== DIESER SCREEN ===
Screen-ID S7. Tab Stammdaten aktiv. Station kunst, viewer flat.

Formular in weißer Karte:
- slug: „kunst“ (read-only, grauer Hintergrund)
- titel: Textfeld „Kunst“
- beschreibung: Textarea 4 Zeilen
- viewer: Dropdown „flat“ ausgewählt
- Raumbild bild: Upload-Zone + Pfad /stations/kunst.jpg + Vorschaubild-Platzhalter

KEIN Feld panorama360 (nur bei 360°).`,
  ),
  prompt(
    'S7 — Stammdaten · equirectangular',
    's7-stammdaten-360.png',
    `=== DIESER SCREEN ===
Screen-ID S7. Station klassenzimmer, viewer „equirectangular“ (Label „360°“).

Zusätzliches Feld panorama360: Upload + Pfad /stations/360/klassenzimmer.jpg
Feld bild (flat) ebenfalls sichtbar.`,
  ),
)

// S8-S10
prompts.push(
  prompt(
    'S8 — Medien · empty',
    's8-medien-empty.png',
    `=== DIESER SCREEN ===
Screen-ID S8. Tab Medien aktiv. Station ohne Medien.

Leere Tabelle mit Spalten: ID | Typ | Untertitel | Quelle | Aktionen
Empty-State Illustration optional (dezent). Großer grüner Button „Medien hinzufügen“ — EINZIGER Einstieg zum Upload-Modal (kein Sidebar-Button für Medien).

WICHTIG: Kein globaler „Medien hochladen“ in der Sidebar.`,
  ),
  prompt(
    'S8 — Medien · list',
    's8-medien-list.png',
    `=== DIESER SCREEN ===
Screen-ID S8. Tab Medien. Station klassenzimmer.

Tabelle mit Zeilen:
| demo-audio | audio | Mein Schultag (Audio) | …/grundschule_demo.mp3 | Bearbeiten · Entfernen |
| demo-video | video | Mein Schultag (Video) | …/grundschule_demo.mp4 | Bearbeiten · Entfernen |
| demo-foto | foto | Schulfoto | …/grundschule_demo.jpg | Bearbeiten · Entfernen |
| demo-text | text | Mein Schultag | …/grundschule_demo.md | Bearbeiten · Entfernen |

Button „Medien hinzufügen“ oben rechts.`,
  ),
  prompt(
    'S8 — Medien · editing',
    's8-medien-editing.png',
    `=== DIESER SCREEN ===
Screen-ID S8. Eine Tabellenzeile (demo-video) ist aufgeklappt — darunter Inline-Bearbeitungspanel (S10) mit Metadaten-Feldern. Rest der Tabelle sichtbar.`,
  ),
  prompt(
    'S9 — Medien-Modal · default',
    's9-medien-modal-default.png',
    `=== DIESER SCREEN ===
Screen-ID S9. Modal über abgedunkeltem Tab Medien.

Modal-Titel „Medium hinzufügen“. Sechs Typ-Karten in 2×3 Grid:
audio | video | foto | text | link | embed — jeweils Icon + Label, eine Karte (z. B. foto) selected mit grünem Rand.

Darunter Drag-and-Drop-Zone „Datei hierher ziehen oder klicken“. Pfad-Vorschau: /media/{slug}/fotos/…`,
    { modal: true },
  ),
  prompt(
    'S9 — Medien-Modal · link/embed',
    's9-medien-modal-link-embed.png',
    `=== DIESER SCREEN ===
Screen-ID S9. Typ „embed“ gewählt.

Felder: URL (https://…), Checkboxen Allowlist-Domains (z. B. bookcreator.com ✓, h5p.org ☐). Hinweis „EMBED_ENABLED muss gesetzt sein“.
Kein Datei-Upload sichtbar.`,
    { modal: true },
  ),
  prompt(
    'S9 — Medien-Modal · error',
    's9-medien-modal-error.png',
    `=== DIESER SCREEN ===
Screen-ID S9. Fehlerzustand: URL-Feld rot umrandet, Fehlertext darunter „Domain nicht in der Allowlist“. Typ embed. Speichern-Button disabled.`,
    { modal: true },
  ),
  prompt(
    'S10 — Medien bearbeiten · metadata',
    's10-medien-edit-metadata.png',
    `=== DIESER SCREEN ===
Screen-ID S10. Inline-Formular für Medium demo-video.

Felder: id (read-only demo-video), untertitel, typ video, videoSource Dropdown „upload“ (optional, Default upload), quelle Pfad, poster optional.
Buttons: „Speichern“ (grün), „Abbrechen“ (Outline).`,
  ),
  prompt(
    'S10 — Medien bearbeiten · replace-file',
    's10-medien-edit-replace.png',
    `=== DIESER SCREEN ===
Screen-ID S10. Abschnitt „Datei ersetzen“ hervorgehoben: Upload-Feld MP4, Hinweis „medium.id bleibt gleich“. Optional Thumbnail-Upload darunter.`,
  ),
)

// S11-S12
prompts.push(
  prompt(
    'S11 — Hotspots · empty',
    's11-hotspots-empty.png',
    `=== DIESER SCREEN ===
Screen-ID S11. Tab Hotspots. Station ohne Hotspots.

Abschnitt „Hotspots (Flat)“ oder „Hotspots 360°“ leer. Button „Hotspot hinzufügen“. Hinweis „Kalibrierung: Flat-Kalibrierung öffnen“ mit internem Link-Stil.`,
  ),
  prompt(
    'S11 — Hotspots · list',
    's11-hotspots-list.png',
    `=== DIESER SCREEN ===
Screen-ID S11. Station klassenzimmer (360°).

Tabelle hotspots360: hs-text Korkpinnwand, hs-video Tafel, hs-audio Klassentische — Spalten Label, mediumId, yaw/pitch, Aktionen.
Button „Sphere kalibrieren“ → interner Link /mpz/calib/sphere/klassenzimmer (KEIN target blank, KEIN „Sphere-App“).`,
  ),
  prompt(
    'S11 — Hotspots · dialog-hotspot',
    's11-hotspots-dialog.png',
    `=== DIESER SCREEN ===
Screen-ID S11. Station daz.

Zeile Dialog-Hotspot: hs-frieda, action dialog, mascot frieda, yaw 21.1° pitch -30.7° — KEIN mediumId. Unterscheidbar von Medien-Hotspot (Icon Person statt Play).`,
  ),
  prompt(
    'S12 — Hotspot Formular · medium',
    's12-hotspot-medium.png',
    `=== DIESER SCREEN ===
Screen-ID S12. Formular „Hotspot bearbeiten“ (Medien-Typ).

Felder: Label, mediumId-Dropdown (demo-video), bei 360° yaw/pitch numerisch, Icon-Upload, iconSize Slider.
Speichern + Abbrechen unten.`,
  ),
  prompt(
    'S12 — Hotspot Formular · dialog',
    's12-hotspot-dialog.png',
    `=== DIESER SCREEN ===
Screen-ID S12. Dialog-Hotspot-Formular.

Felder: action „dialog“ (read-only), mascot Select frieda/otto, mascotSize, bubblePitchOffset.
KEINE Felder mediumId, icon, iconSize.`,
  ),
)

// S13-S14 calib
prompts.push(
  prompt(
    'S13 — Flat-Kalibrierung · idle',
    's13-flat-calib-idle.png',
    `=== DIESER SCREEN ===
Screen-ID S13. Route /mpz/calib/flat/kunst. KEINE Studio-Sidebar.

Top-Bar: „← Zurück“ | „Flat-Kalibrierung · kunst“ | Chip „calib · nur lokal“
Tabs: Hotspots (aktiv) | Startpan
Links: breites Panorama-Foto eines Klassenzimmers (Platzhalter), klickbar
Rechts Panel 272 px: Dropdown „Hotspot wählen“ (leer), Text „Klicke ins Panorama um Koordinaten zu setzen“, Button „In stations.json übernehmen“ disabled`,
    { shell: false, calib: true },
  ),
  prompt(
    'S13 — Flat-Kalibrierung · marker',
    's13-flat-calib-marker.png',
    `=== DIESER SCREEN ===
Screen-ID S13. Marker gesetzt nach Klick.

Panorama zeigt grünen Pin/Marker. Panel: x: 42 %, y: 67 %. Hotspot-Dropdown „hs-neu“. Button „In stations.json übernehmen“ aktiv (grün).`,
    { shell: false, calib: true },
  ),
  prompt(
    'S13 — Flat-Kalibrierung · applied',
    's13-flat-calib-applied.png',
    `=== DIESER SCREEN ===
Screen-ID S13. Erfolg nach Speichern.

Kleiner grüner Toast oben rechts: „Koordinaten übernommen“. Panel zeigt gespeicherte Werte.`,
    { shell: false, calib: true },
  ),
  prompt(
    'S14 — Sphere-Kalibrierung · idle',
    's14-sphere-calib-idle.png',
    `=== DIESER SCREEN ===
Screen-ID S14. Route /mpz/calib/sphere/musik. Layout IDENTISCH zu S13, aber 360°-Panorama (equirectangular-Kugelansicht, leicht gekrümmt).

Top-Bar: „Sphere-Kalibrierung · musik“. Tabs: Hotspots | Startblick.
KEIN Besucher-Dialog, KEINE Raum-TopBar der Besucher-App.`,
    { shell: false, calib: true },
  ),
  prompt(
    'S14 — Sphere-Kalibrierung · marker',
    's14-sphere-calib-marker.png',
    `=== DIESER SCREEN ===
Screen-ID S14. Hotspots-Tab. Marker im 360°-View. Panel: yaw: -32°, pitch: -4°. Übernehmen-Button aktiv.`,
    { shell: false, calib: true },
  ),
  prompt(
    'S14 — Sphere-Kalibrierung · applied',
    's14-sphere-calib-applied.png',
    `=== DIESER SCREEN ===
Screen-ID S14. Erfolgs-Toast nach Hotspot-Speichern.`,
    { shell: false, calib: true },
  ),
  prompt(
    'S14 — Sphere-Kalibrierung · startblick',
    's14-sphere-calib-startblick.png',
    `=== DIESER SCREEN ===
Screen-ID S14. Tab „Startblick“ aktiv (nicht Hotspots).

Panorama zeigt andere Blickrichtung. Panel: Live yaw/pitch Readout, Button „Als Startblick übernehmen“ (grün).`,
    { shell: false, calib: true },
  ),
)

// S15
prompts.push(
  prompt(
    'S15 — Dialog · no-dialog',
    's15-dialog-no-dialog.png',
    `=== DIESER SCREEN ===
Screen-ID S15. Tab Dialog aktiv. Station klassenzimmer OHNE dialog in JSON.

WICHTIG: Tab „Dialog“ ist sichtbar (nicht versteckt) — das ist das neue Soll-Verhalten.

Empty-State zentriert:
- Icon oder kleine Illustration Maskottchen Frieda & Otto (dezent, nicht Besucher-Overlay)
- Text: „Noch kein Maskottchen-Dialog für diese Station“
- Primär-Button „Dialog hinzufügen“ (grün)

KEIN separater Dialog-Audio-Tab. KEIN Link zu globaler Dialog-Audio-Seite.`,
  ),
  prompt(
    'S15 — Dialog · empty-segments',
    's15-dialog-empty-segments.png',
    `=== DIESER SCREEN ===
Screen-ID S15. Dialog-Block existiert, segmente[] leer.

Oben: Checkboxen Figuren — Frieda ✓, Otto ✓
Segment-Tabelle mit Header aber 0 Zeilen, Text „Noch keine Segmente“
Button „Erstes Segment anlegen“
Darunter zwei eingeklappte Akkordeons (Chevron rechts): „Gruppen“, „Sprechblasen-Layout“`,
  ),
  prompt(
    'S15 — Dialog · filled',
    's15-dialog-filled.png',
    `=== DIESER SCREEN ===
Screen-ID S15. Station daz, gefüllter Dialog.

Segment-Tabelle (mindestens 4 Zeilen sichtbar):
| 01 | d1 | frieda | Hallo, willkommen in unserem DaZ-Zimmer… | — | ✓ Clip | ▶ Upload … |
| 02 | d2 | otto | Wir haben ein kleines Sprachrätsel… | — | ✓ Clip | … |
| 03 | d3 | frieda | Hello! | gruesse | ✓ Clip | … |
| 04 | d4 | otto | Hola! | gruesse | ✓ Clip | … |

Eingeklappt darunter: Gruppen, Sprechblasen-Layout`,
  ),
  prompt(
    'S15 — Dialog · row-upload-play',
    's15-dialog-row-audio.png',
    `=== DIESER SCREEN ===
Screen-ID S15. Eine Segment-Zeile (01, frieda) ist aufgeklappt — Expandable Row unter der Zeile.

Aufgeklappter Bereich: Mini-Audio-Player-Waveform, Button Abspielen, Upload-Zone „WAV ersetzen (01-frieda.wav)“, Status-Badge „Clip ok“ grün.
Sprechertext bleibt in der Hauptzeile sichtbar. Alles in EINER Zeilen-Interaktion — kein Seitenwechsel.`,
  ),
)

// S17-S21
prompts.push(
  prompt(
    'S17 — Coach · empty',
    's17-coach-empty.png',
    `=== DIESER SCREEN ===
Screen-ID S17. Route /mpz/studio/coach. Sidebar Coach aktiv.

Leere Liste. Text „Noch keine Coach-Nachrichten“. Button „Nachricht hinzufügen“.`,
  ),
  prompt(
    'S17 — Coach · list',
    's17-coach-list.png',
    `=== DIESER SCREEN ===
Screen-ID S17. Tabelle Coach-Messages:
| welcome-hub | hub-milestone (0) | frieda | Willkommen beim Schulrundgang!… | ✓ Audio |
| first-visit | hub-milestone (1) | otto | Super, deine erste Station!… | — |
| complete | hub-complete | duo | Wow — alle Stationen… | — |`,
  ),
  prompt(
    'S17 — Coach · form',
    's17-coach-form.png',
    `=== DIESER SCREEN ===
Screen-ID S17. Formular neue/bearbeitete Nachricht.

Felder: id, trigger (Select: hub-milestone / hub-complete / room-first), milestone Zahl, slug (bei room-first), mascot, placement, text (Textarea), modes Checkboxen fest/heft.
Abschnitt Audio: Upload WAV, Hinweis „Autoplay beim Einblenden — auf iPhone testen“.`,
  ),
  prompt(
    'S18 — Embeds & Links · list',
    's18-embeds-list.png',
    `=== DIESER SCREEN ===
Screen-ID S18. Zwei Abschnitte:

1. Globale Allowlist — Tabelle Domain-Suffixe: bookcreator.com, h5p.org, padlet.com
2. Medien-Übersicht — embed/link-Medien aus allen Stationen (slug, mediumId, URL gekürzt)`,
  ),
  prompt(
    'S18 — Embeds & Links · edit-suffix',
    's18-embeds-edit.png',
    `=== DIESER SCREEN ===
Screen-ID S18. Eine Allowlist-Zeile im Inline-Edit: Feld „bookcreator.com“, Speichern/Abbrechen.`,
  ),
  prompt(
    'S19 — Design & Hub · Tab Hub · grid',
    's19-design-tab-hub-grid.png',
    `=== DIESER SCREEN ===
Screen-ID S19. Route /mpz/studio/design?tab=hub. Sidebar „Design & Hub“ aktiv.

Tab-Leiste unter H1: [ Hub ] | Brand — Hub aktiv (grüne Unterstreichung).

12er-Grid Hub-Slots (visuell wie Schulhaus-Grundriss vereinfacht ODER Tabellen-Grid):
Slot 1 → klassenzimmer, Akzentfarbe #4b9a23, Icon Buch
Slot 2 → musik, Akzent #1f6abb, Icon Note
… (mindestens 6 Slots sichtbar)
Hinweis read-only: „Slot-Geometrie wird im Code definiert“`,
  ),
  prompt(
    'S19 — Design & Hub · Tab Hub · edit',
    's19-design-tab-hub-edit.png',
    `=== DIESER SCREEN ===
Screen-ID S19. Slot 3 (daz) im Edit-Modus: Slug-Dropdown, Farbwähler, Lucide-Icon-Picker (Grid kleiner Icons), Speichern.`,
  ),
  prompt(
    'S20 — Design & Hub · Tab Brand · upload',
    's20-design-tab-brand-upload.png',
    `=== DIESER SCREEN ===
Screen-ID S20. Route /mpz/studio/design?tab=brand. Tab Brand aktiv.

Drei Upload-Karten untereinander:
- Logos (SVG/PNG) — Drag & Drop
- Maskottchen (frieda, otto, duo) — je Upload-Feld
- Hotspot-Icons — Upload
Pfad-Hinweis monospace: public/brand/…`,
  ),
  prompt(
    'S20 — Design & Hub · Tab Brand · preview',
    's20-design-tab-brand-preview.png',
    `=== DIESER SCREEN ===
Screen-ID S20. Hochgeladene Assets mit Vorschaubildern: Logo GS39, Maskottchen Frieda PNG, Otto PNG. Buttons Ersetzen / Entfernen pro Asset.`,
  ),
  prompt(
    'S21 — Deploy · ok',
    's21-deploy-ok.png',
    `=== DIESER SCREEN ===
Screen-ID S21. Route /mpz/studio/deploy.

Karten-Reihe:
1. Umgebung (.env.local) — maskierte Werte ENTRY_TOKEN=••••
2. QR-Codes — Button „PDF exportieren“
3. Token — „Rotation (Dry-Run)“
4. validate-all — grünes Ergebnis
5. Vorschau-Links — /raum/klassenzimmer, /eintritt?t=heft-…, /`,
  ),
  prompt(
    'S21 — Deploy · warnings',
    's21-deploy-warnings.png',
    `=== DIESER SCREEN ===
Screen-ID S21. validate-all gelb: „1 Warnung — Coach-Nachricht ohne Audio“. Env-Karte zeigt fehlende Variable orange.`,
  ),
  prompt(
    'S24 — Unlock (optional)',
    's24-unlock.png',
    `=== DIESER SCREEN ===
Screen-ID S24. Route /mpz/unlock. Minimalistische Zugangsseite.

Zentrierte weiße Karte auf #fcfbf7: Logo-Text „MPZ Studio“, Passwort/Secret-Feld, Button „Freischalten“ (grün). Kein Sidebar. Dezenter Hinweis „Nur development“.`,
    { shell: false, unlock: true },
  ),
)

const index = [
  ['S1', 'default', 's1-shell-default.png'],
  ['S1', 'narrow', 's1-shell-narrow.png'],
  ['S2', 'visible', 's2-plan-a-banner.png'],
  ['S3', 'idle', 's3-save-idle.png'],
  ['S3', 'running', 's3-save-running.png'],
  ['S3', 'success', 's3-save-success.png'],
  ['S3', 'rollback-error', 's3-save-rollback-error.png'],
  ['S4', 'ok', 's4-dashboard-ok.png'],
  ['S4', 'errors', 's4-dashboard-errors.png'],
  ['S4', 'loading', 's4-dashboard-loading.png'],
  ['S5', 'partial', 's5-stationen-partial.png'],
  ['S5', 'all-ok', 's5-stationen-all-ok.png'],
  ['S6', 'flat', 's6-detail-header-flat.png'],
  ['S6', '360°', 's6-detail-header-360.png'],
  ['S6', 'issues', 's6-detail-header-issues.png'],
  ['S7', 'flat', 's7-stammdaten-flat.png'],
  ['S7', 'equirectangular', 's7-stammdaten-360.png'],
  ['S8', 'empty', 's8-medien-empty.png'],
  ['S8', 'list', 's8-medien-list.png'],
  ['S8', 'editing', 's8-medien-editing.png'],
  ['S9', 'default', 's9-medien-modal-default.png'],
  ['S9', 'link-embed', 's9-medien-modal-link-embed.png'],
  ['S9', 'error', 's9-medien-modal-error.png'],
  ['S10', 'metadata', 's10-medien-edit-metadata.png'],
  ['S10', 'replace-file', 's10-medien-edit-replace.png'],
  ['S11', 'empty', 's11-hotspots-empty.png'],
  ['S11', 'list', 's11-hotspots-list.png'],
  ['S11', 'dialog-hotspot', 's11-hotspots-dialog.png'],
  ['S12', 'medium', 's12-hotspot-medium.png'],
  ['S12', 'dialog', 's12-hotspot-dialog.png'],
  ['S13', 'idle', 's13-flat-calib-idle.png'],
  ['S13', 'marker', 's13-flat-calib-marker.png'],
  ['S13', 'applied', 's13-flat-calib-applied.png'],
  ['S14', 'idle', 's14-sphere-calib-idle.png'],
  ['S14', 'marker', 's14-sphere-calib-marker.png'],
  ['S14', 'applied', 's14-sphere-calib-applied.png'],
  ['S14', 'startblick', 's14-sphere-calib-startblick.png'],
  ['S15', 'no-dialog', 's15-dialog-no-dialog.png'],
  ['S15', 'empty-segments', 's15-dialog-empty-segments.png'],
  ['S15', 'filled', 's15-dialog-filled.png'],
  ['S15', 'row-upload-play', 's15-dialog-row-audio.png'],
  ['S17', 'empty', 's17-coach-empty.png'],
  ['S17', 'list', 's17-coach-list.png'],
  ['S17', 'form', 's17-coach-form.png'],
  ['S18', 'list', 's18-embeds-list.png'],
  ['S18', 'edit-suffix', 's18-embeds-edit.png'],
  ['S19', 'grid', 's19-design-tab-hub-grid.png'],
  ['S19', 'edit', 's19-design-tab-hub-edit.png'],
  ['S20', 'upload', 's20-design-tab-brand-upload.png'],
  ['S20', 'preview', 's20-design-tab-brand-preview.png'],
  ['S21', 'ok', 's21-deploy-ok.png'],
  ['S21', 'warnings', 's21-deploy-warnings.png'],
  ['S24', 'unlock', 's24-unlock.png (optional)'],
]

const indexTable = index
  .map(([id, state, file]) => `| ${id} | ${state} | \`${file}\` |`)
  .join('\n')

const md = `# MPZ Studio — Mockup-Prompts (standalone, pro Screen & Zustand)

**Datum:** 2026-06-22  
**Generiert:** \`node build-mockup-prompts.mjs\` — bei Änderungen Skript anpassen und neu bauen  
**Zweck:** Jeder Prompt ist **vollständig kontextreich** — ohne Upload-Paket, ohne externe Dateien.  
Geeignet für: Google Stitch, Claude Design, Gemini, Midjourney UI, etc.

**Regel:** Prompt-Block **komplett** kopieren → direkt ins Mockup-Tool einfügen.

---

## Nutzung

1. Zeile in der Index-Tabelle finden.
2. Gesamten Code-Block unter der Überschrift kopieren (von \`Erzeuge ein High-Fidelity…\` bis \`Dateiname-Vorschlag\`).
3. In Stitch/Claude/etc. einfügen → Mockup erzeugen.
4. PNG (1280 px Breite) nach \`mockups/\` speichern.

Kein React/HTML/CSS als Ausgabe — nur ein UI-Mockup-Bild.

---

## Index (${index.length} Prompts)

| ID | Zustand | Export |
|----|---------|--------|
${indexTable}

---

## Prompts

${prompts.join('\n')}

---

## Pflege

\`\`\`bash
cd dokumentation/archiv/design/mpz-studio-claude-design-cleanup
node build-mockup-prompts.mjs
\`\`\`
`

writeFileSync(OUT, md, 'utf8')
console.log(`Wrote ${OUT} (${prompts.length} prompts)`)
