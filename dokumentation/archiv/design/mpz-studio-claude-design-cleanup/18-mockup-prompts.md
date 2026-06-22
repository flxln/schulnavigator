# MPZ Studio — Mockup-Prompts (standalone, pro Screen & Zustand)

**Datum:** 2026-06-22  
**Generiert:** `node build-mockup-prompts.mjs` — bei Änderungen Skript anpassen und neu bauen  
**Zweck:** Jeder Prompt ist **vollständig kontextreich** — ohne Upload-Paket, ohne externe Dateien.  
Geeignet für: Google Stitch, Claude Design, Gemini, Midjourney UI, etc.

**Regel:** Prompt-Block **komplett** kopieren → direkt ins Mockup-Tool einfügen.

---

## Nutzung

1. Zeile in der Index-Tabelle finden.
2. Gesamten Code-Block unter der Überschrift kopieren (von `Erzeuge ein High-Fidelity…` bis `Dateiname-Vorschlag`).
3. In Stitch/Claude/etc. einfügen → Mockup erzeugen.
4. PNG (1280 px Breite) nach `mockups/` speichern.

Kein React/HTML/CSS als Ausgabe — nur ein UI-Mockup-Bild.

---

## Index (53 Prompts)

| ID | Zustand | Export |
|----|---------|--------|
| S1 | default | `s1-shell-default.png` |
| S1 | narrow | `s1-shell-narrow.png` |
| S2 | visible | `s2-plan-a-banner.png` |
| S3 | idle | `s3-save-idle.png` |
| S3 | running | `s3-save-running.png` |
| S3 | success | `s3-save-success.png` |
| S3 | rollback-error | `s3-save-rollback-error.png` |
| S4 | ok | `s4-dashboard-ok.png` |
| S4 | errors | `s4-dashboard-errors.png` |
| S4 | loading | `s4-dashboard-loading.png` |
| S5 | partial | `s5-stationen-partial.png` |
| S5 | all-ok | `s5-stationen-all-ok.png` |
| S6 | flat | `s6-detail-header-flat.png` |
| S6 | 360° | `s6-detail-header-360.png` |
| S6 | issues | `s6-detail-header-issues.png` |
| S7 | flat | `s7-stammdaten-flat.png` |
| S7 | equirectangular | `s7-stammdaten-360.png` |
| S8 | empty | `s8-medien-empty.png` |
| S8 | list | `s8-medien-list.png` |
| S8 | editing | `s8-medien-editing.png` |
| S9 | default | `s9-medien-modal-default.png` |
| S9 | link-embed | `s9-medien-modal-link-embed.png` |
| S9 | error | `s9-medien-modal-error.png` |
| S10 | metadata | `s10-medien-edit-metadata.png` |
| S10 | replace-file | `s10-medien-edit-replace.png` |
| S11 | empty | `s11-hotspots-empty.png` |
| S11 | list | `s11-hotspots-list.png` |
| S11 | dialog-hotspot | `s11-hotspots-dialog.png` |
| S12 | medium | `s12-hotspot-medium.png` |
| S12 | dialog | `s12-hotspot-dialog.png` |
| S13 | idle | `s13-flat-calib-idle.png` |
| S13 | marker | `s13-flat-calib-marker.png` |
| S13 | applied | `s13-flat-calib-applied.png` |
| S14 | idle | `s14-sphere-calib-idle.png` |
| S14 | marker | `s14-sphere-calib-marker.png` |
| S14 | applied | `s14-sphere-calib-applied.png` |
| S14 | startblick | `s14-sphere-calib-startblick.png` |
| S15 | no-dialog | `s15-dialog-no-dialog.png` |
| S15 | empty-segments | `s15-dialog-empty-segments.png` |
| S15 | filled | `s15-dialog-filled.png` |
| S15 | row-upload-play | `s15-dialog-row-audio.png` |
| S17 | empty | `s17-coach-empty.png` |
| S17 | list | `s17-coach-list.png` |
| S17 | form | `s17-coach-form.png` |
| S18 | list | `s18-embeds-list.png` |
| S18 | edit-suffix | `s18-embeds-edit.png` |
| S19 | grid | `s19-design-tab-hub-grid.png` |
| S19 | edit | `s19-design-tab-hub-edit.png` |
| S20 | upload | `s20-design-tab-brand-upload.png` |
| S20 | preview | `s20-design-tab-brand-preview.png` |
| S21 | ok | `s21-deploy-ok.png` |
| S21 | warnings | `s21-deploy-warnings.png` |
| S24 | unlock | `s24-unlock.png (optional)` |

---

## Prompts

### S1 — Studio-Shell · default

**Export:** `s1-shell-default.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S1 — Studio-Shell · default
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S1. Gesamtrahmen der App mit neuer gruppierten Sidebar und Dashboard als Beispiel-Inhalt (S4).

Aktiver Sidebar-Eintrag: Dashboard (unter Gruppe ÜBERSICHT).
Content: Dashboard mit grüner Validierungskarte „Alle Checks bestanden“, kurze Begrüßung „MPZ Studio“.

Zeige die komplette Shell: Sidebar 240 px + Top-Bar + Content.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s1-shell-default.png
```

### S1 — Studio-Shell · narrow

**Export:** `s1-shell-narrow.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S1 — Studio-Shell · narrow
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S1, Zustand narrow/collapsed. Sidebar auf ~56 px Icon-Rail eingeklappt (Hamburger oben, Icons für Dashboard, Stationen, Coach, Design, Deploy). Tooltips bei Hover angedeutet.

Content nutzt fast volle Breite. Top-Bar und Save-Button bleiben sichtbar. Beispiel-Inhalt: Stationen-Grid angeschnitten.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s1-shell-narrow.png
```

### S2 — Plan-A-Banner · visible

**Export:** `s2-plan-a-banner.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S2 — Plan-A-Banner · visible
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S2. Fokus auf das Plan-A-Banner direkt unter der Top-Bar.

Banner-Inhalt (Beispieltext): „Plan A: Du kannst Inhalte weiterhin per CLI und JSON im Repo pflegen. Das Studio ist die visuelle Alternative.“
Optik: schmale Zeile, Hintergrund #fbbb24 mit ~15 % Opazität auf #fff8e7, linker Rand 3 px gelb #fbbb24, Text 13 px Navy, kein Alarm-Rot.

Oben angeschnitten: Top-Bar mit Save-Button. Unten: Dashboard-Content beginnt.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s2-plan-a-banner.png
```

### S3 — Save & Validate · idle

**Export:** `s3-save-idle.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S3 — Save & Validate · idle
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S3, Zustand idle. Noch kein Save ausgeführt.

Top-Bar: Button „Speichern & Validieren“ ist DISABLED (grau, Opacity 0.5), kein Dirty-Punkt.
Unten im Content: kein Save-Panel sichtbar ODER eingeklappt/grau mit Platzhalter „Noch nicht gespeichert“.

Dashboard als Hintergrund-Content.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s3-save-idle.png
```

### S3 — Save & Validate · running

**Export:** `s3-save-running.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S3 — Save & Validate · running
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S3, Zustand running. User hat auf „Speichern & Validieren“ geklickt.

Top-Bar: Button zeigt Spinner + Text „Speichert…“
Darunter Panel (volle Content-Breite): weiße Karte mit Spinner, Text „Validierung läuft — stations.json, Coach, Tokens…“

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s3-save-running.png
```

### S3 — Save & Validate · success

**Export:** `s3-save-success.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S3 — Save & Validate · success
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S3, Zustand success.

Panel: grüner linker Rand #4b9a23, Hintergrund #f0f9eb, Überschrift „Validierung erfolgreich“.
Checkliste mit Häkchen: validate:stations ✓, validate:coach ✓, validate:tokens ✓, Tests ✓
Save-Button wieder aktiv, Dirty-Punkt weg.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s3-save-success.png
```

### S3 — Save & Validate · rollback-error

**Export:** `s3-save-rollback-error.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S3 — Save & Validate · rollback-error
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S3, Zustand rollback-error.

Panel: roter linker Rand #ef3a37, Hintergrund #fef2f2, Überschrift „Validierung fehlgeschlagen — Änderungen wurden zurückgesetzt“.
Fehlerliste (3 Zeilen):
1. Station daz — Dialog-Segment 03: WAV-Datei fehlt
2. Station kunst — Hotspot hs-1: mediumId unbekannt
3. embed — Domain nicht in Allowlist
Jeder Fehler mit rotem Icon + Text (nicht nur Farbe).

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s3-save-rollback-error.png
```

### S4 — Dashboard · ok

**Export:** `s4-dashboard-ok.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S4 — Dashboard · ok
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S4. Route /mpz/studio. Sidebar: Dashboard aktiv.

Content:
- H1 „Dashboard“
- Große Karte „Validierung“: grüner Status-Badge, Text „Bereit für Deploy“, Icon Häkchen
- Karte „Stationen mit Problemen“: Text „Keine — alle 12 Stationen ok“
- Quick-Links als Text-Buttons: „Alle Stationen anzeigen“, „Zum Deploy-Tab“

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s4-dashboard-ok.png
```

### S4 — Dashboard · errors

**Export:** `s4-dashboard-errors.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S4 — Dashboard · errors
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S4, Zustand errors.

Validierungskarte ROT: „3 Probleme gefunden“
Liste darunter (Tabelle):
| Station | Problem | Aktion |
| kunst | Kein Raumbild | Zur Station → |
| daz | Audio-Clip fehlt Segment 07 | Zur Station → |
| embeds | Leere Allowlist | Zu Embeds → |

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s4-dashboard-errors.png
```

### S4 — Dashboard · loading

**Export:** `s4-dashboard-loading.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S4 — Dashboard · loading
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S4, Zustand loading.

Validierungskarte zeigt Skeleton-Shimmer oder Spinner in der Karte. Rest der Shell normal. Text „Lade Validierungsreport…“

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s4-dashboard-loading.png
```

### S5 — Stationen-Grid · partial

**Export:** `s5-stationen-partial.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S5 — Stationen-Grid · partial
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S5. Route /mpz/studio/stationen. Sidebar: „Alle Stationen“ aktiv.

H1 „Stationen“. Grid 3 Spalten × 4 Zeilen = 12 Kacheln:
  1. Klassenzimmer (slug: klassenzimmer) — Viewer 360°, Ampel grün
  2. Musik (slug: musik) — Viewer 360°, Ampel grün
  3. DaZ-Zimmer (slug: daz) — Viewer 360°, Ampel grün
  4. Kunst (slug: kunst) — Viewer flat, Ampel rot
  5. PC-Raum (slug: pc-raum) — Viewer 360°, Ampel grün
  6. Lesewelt (slug: lesewelt) — Viewer flat, Ampel grün
  7. Werken (slug: werken) — Viewer flat, Ampel grün
  8. Speiseraum (slug: speiseraum) — Viewer flat, Ampel gelb
  9. Hort (slug: hort) — Viewer flat, Ampel grün
  10. Turnhalle (slug: turnhalle) — Viewer flat, Ampel grün
  11. Schulsozialarbeit (slug: schulsozialarbeit) — Viewer flat, Ampel grün
  12. Schulhof (slug: schulhof) — Viewer flat, Ampel grün

Mindestens eine rote und eine gelbe Ampel sichtbar.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s5-stationen-partial.png
```

### S5 — Stationen-Grid · all-ok

**Export:** `s5-stationen-all-ok.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S5 — Stationen-Grid · all-ok
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S5, alle Ampeln grün. Gleiches 12er-Grid, Mix aus flat und 360° Badges. Keine Fehler-Hinweise.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s5-stationen-all-ok.png
```

### S6 — Station Detail Header · flat

**Export:** `s6-detail-header-flat.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S6 — Station Detail Header · flat
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S6. Station Klassenzimmer, aber viewer flat (hypothetisch) oder kunst.

Header-Leiste:
- Titel „Kunst“ (oder Klassenzimmer flat)
- Chip Hub-Nr „4“
- Badge „flat“ (grau-blau)
- Ampel grün
- Link rechts „↗ Vorschau /raum/kunst“ (Text-Button mit externem Pfeil)

Tabs darunter (alle sichtbar): Stammdaten | Medien | Hotspots | Dialog
Aktiver Tab: Stammdaten

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s6-detail-header-flat.png
```

### S6 — Station Detail Header · 360°

**Export:** `s6-detail-header-360.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S6 — Station Detail Header · 360°
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S6. Station „Klassenzimmer“, viewer equirectangular.

Badge „360°“ statt flat. Hub-Nr 1. Ampel grün. Vorschau-Link /raum/klassenzimmer.
Alle vier Tabs sichtbar inkl. Dialog.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s6-detail-header-360.png
```

### S6 — Station Detail Header · issues

**Export:** `s6-detail-header-issues.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S6 — Station Detail Header · issues
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S6. Station mit Problemen (z. B. daz).

Ampel rot. Neben Titel kleiner Hinweis „2 Validierungsfehler“. Tabs trotzdem alle vier sichtbar.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s6-detail-header-issues.png
```

### S7 — Stammdaten · flat

**Export:** `s7-stammdaten-flat.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S7 — Stammdaten · flat
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S7. Tab Stammdaten aktiv. Station kunst, viewer flat.

Formular in weißer Karte:
- slug: „kunst“ (read-only, grauer Hintergrund)
- titel: Textfeld „Kunst“
- beschreibung: Textarea 4 Zeilen
- viewer: Dropdown „flat“ ausgewählt
- Raumbild bild: Upload-Zone + Pfad /stations/kunst.jpg + Vorschaubild-Platzhalter

KEIN Feld panorama360 (nur bei 360°).

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s7-stammdaten-flat.png
```

### S7 — Stammdaten · equirectangular

**Export:** `s7-stammdaten-360.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S7 — Stammdaten · equirectangular
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S7. Station klassenzimmer, viewer „equirectangular“ (Label „360°“).

Zusätzliches Feld panorama360: Upload + Pfad /stations/360/klassenzimmer.jpg
Feld bild (flat) ebenfalls sichtbar.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s7-stammdaten-360.png
```

### S8 — Medien · empty

**Export:** `s8-medien-empty.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S8 — Medien · empty
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S8. Tab Medien aktiv. Station ohne Medien.

Leere Tabelle mit Spalten: ID | Typ | Untertitel | Quelle | Aktionen
Empty-State Illustration optional (dezent). Großer grüner Button „Medien hinzufügen“ — EINZIGER Einstieg zum Upload-Modal (kein Sidebar-Button für Medien).

WICHTIG: Kein globaler „Medien hochladen“ in der Sidebar.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s8-medien-empty.png
```

### S8 — Medien · list

**Export:** `s8-medien-list.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S8 — Medien · list
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S8. Tab Medien. Station klassenzimmer.

Tabelle mit Zeilen:
| demo-audio | audio | Mein Schultag (Audio) | …/grundschule_demo.mp3 | Bearbeiten · Entfernen |
| demo-video | video | Mein Schultag (Video) | …/grundschule_demo.mp4 | Bearbeiten · Entfernen |
| demo-foto | foto | Schulfoto | …/grundschule_demo.jpg | Bearbeiten · Entfernen |
| demo-text | text | Mein Schultag | …/grundschule_demo.md | Bearbeiten · Entfernen |

Button „Medien hinzufügen“ oben rechts.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s8-medien-list.png
```

### S8 — Medien · editing

**Export:** `s8-medien-editing.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S8 — Medien · editing
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S8. Eine Tabellenzeile (demo-video) ist aufgeklappt — darunter Inline-Bearbeitungspanel (S10) mit Metadaten-Feldern. Rest der Tabelle sichtbar.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s8-medien-editing.png
```

### S9 — Medien-Modal · default

**Export:** `s9-medien-modal-default.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S9 — Medien-Modal · default
=== PRODUKT ===
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
LAYOUT: Studio-Shell im Hintergrund (abgedunkelt mit Overlay rgba(8,42,80,0.45)). Modal zentriert, Breite ~560 px, weiße Karte, Schatten weich.
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S9. Modal über abgedunkeltem Tab Medien.

Modal-Titel „Medium hinzufügen“. Sechs Typ-Karten in 2×3 Grid:
audio | video | foto | text | link | embed — jeweils Icon + Label, eine Karte (z. B. foto) selected mit grünem Rand.

Darunter Drag-and-Drop-Zone „Datei hierher ziehen oder klicken“. Pfad-Vorschau: /media/{slug}/fotos/…

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s9-medien-modal-default.png
```

### S9 — Medien-Modal · link/embed

**Export:** `s9-medien-modal-link-embed.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S9 — Medien-Modal · link/embed
=== PRODUKT ===
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
LAYOUT: Studio-Shell im Hintergrund (abgedunkelt mit Overlay rgba(8,42,80,0.45)). Modal zentriert, Breite ~560 px, weiße Karte, Schatten weich.
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S9. Typ „embed“ gewählt.

Felder: URL (https://…), Checkboxen Allowlist-Domains (z. B. bookcreator.com ✓, h5p.org ☐). Hinweis „EMBED_ENABLED muss gesetzt sein“.
Kein Datei-Upload sichtbar.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s9-medien-modal-link-embed.png
```

### S9 — Medien-Modal · error

**Export:** `s9-medien-modal-error.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S9 — Medien-Modal · error
=== PRODUKT ===
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
LAYOUT: Studio-Shell im Hintergrund (abgedunkelt mit Overlay rgba(8,42,80,0.45)). Modal zentriert, Breite ~560 px, weiße Karte, Schatten weich.
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S9. Fehlerzustand: URL-Feld rot umrandet, Fehlertext darunter „Domain nicht in der Allowlist“. Typ embed. Speichern-Button disabled.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s9-medien-modal-error.png
```

### S10 — Medien bearbeiten · metadata

**Export:** `s10-medien-edit-metadata.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S10 — Medien bearbeiten · metadata
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S10. Inline-Formular für Medium demo-video.

Felder: id (read-only demo-video), untertitel, typ video, videoSource Dropdown „upload“ (optional, Default upload), quelle Pfad, poster optional.
Buttons: „Speichern“ (grün), „Abbrechen“ (Outline).

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s10-medien-edit-metadata.png
```

### S10 — Medien bearbeiten · replace-file

**Export:** `s10-medien-edit-replace.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S10 — Medien bearbeiten · replace-file
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S10. Abschnitt „Datei ersetzen“ hervorgehoben: Upload-Feld MP4, Hinweis „medium.id bleibt gleich“. Optional Thumbnail-Upload darunter.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s10-medien-edit-replace.png
```

### S11 — Hotspots · empty

**Export:** `s11-hotspots-empty.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S11 — Hotspots · empty
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S11. Tab Hotspots. Station ohne Hotspots.

Abschnitt „Hotspots (Flat)“ oder „Hotspots 360°“ leer. Button „Hotspot hinzufügen“. Hinweis „Kalibrierung: Flat-Kalibrierung öffnen“ mit internem Link-Stil.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s11-hotspots-empty.png
```

### S11 — Hotspots · list

**Export:** `s11-hotspots-list.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S11 — Hotspots · list
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S11. Station klassenzimmer (360°).

Tabelle hotspots360: hs-text Korkpinnwand, hs-video Tafel, hs-audio Klassentische — Spalten Label, mediumId, yaw/pitch, Aktionen.
Button „Sphere kalibrieren“ → interner Link /mpz/calib/sphere/klassenzimmer (KEIN target blank, KEIN „Sphere-App“).

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s11-hotspots-list.png
```

### S11 — Hotspots · dialog-hotspot

**Export:** `s11-hotspots-dialog.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S11 — Hotspots · dialog-hotspot
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S11. Station daz.

Zeile Dialog-Hotspot: hs-frieda, action dialog, mascot frieda, yaw 21.1° pitch -30.7° — KEIN mediumId. Unterscheidbar von Medien-Hotspot (Icon Person statt Play).

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s11-hotspots-dialog.png
```

### S12 — Hotspot Formular · medium

**Export:** `s12-hotspot-medium.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S12 — Hotspot Formular · medium
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S12. Formular „Hotspot bearbeiten“ (Medien-Typ).

Felder: Label, mediumId-Dropdown (demo-video), bei 360° yaw/pitch numerisch, Icon-Upload, iconSize Slider.
Speichern + Abbrechen unten.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s12-hotspot-medium.png
```

### S12 — Hotspot Formular · dialog

**Export:** `s12-hotspot-dialog.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S12 — Hotspot Formular · dialog
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S12. Dialog-Hotspot-Formular.

Felder: action „dialog“ (read-only), mascot Select frieda/otto, mascotSize, bubblePitchOffset.
KEINE Felder mediumId, icon, iconSize.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s12-hotspot-dialog.png
```

### S13 — Flat-Kalibrierung · idle

**Export:** `s13-flat-calib-idle.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S13 — Flat-Kalibrierung · idle
=== PRODUKT ===
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
LAYOUT: Vollbild-Kalibrierungs-Screen OHNE Studio-Sidebar. Gesamtbreite 1280 px.
- Oben: Top-Bar volle Breite, Höhe ~56 px, Hintergrund #ffffff, unterer Rand 1 px #082a501a
- Darunter: Split — links ~calc(100% - 272px) Panorama-Viewer, rechts festes Panel 272 px, Hintergrund #f5f2ea
- Top-Bar Inhalt: links „← Zurück“ (Outline-Button), Mitte Titel, rechts Chip „calib · nur lokal“ (klein, monospace-artig)

=== DIESER SCREEN ===
Screen-ID S13. Route /mpz/calib/flat/kunst. KEINE Studio-Sidebar.

Top-Bar: „← Zurück“ | „Flat-Kalibrierung · kunst“ | Chip „calib · nur lokal“
Tabs: Hotspots (aktiv) | Startpan
Links: breites Panorama-Foto eines Klassenzimmers (Platzhalter), klickbar
Rechts Panel 272 px: Dropdown „Hotspot wählen“ (leer), Text „Klicke ins Panorama um Koordinaten zu setzen“, Button „In stations.json übernehmen“ disabled

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s13-flat-calib-idle.png
```

### S13 — Flat-Kalibrierung · marker

**Export:** `s13-flat-calib-marker.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S13 — Flat-Kalibrierung · marker
=== PRODUKT ===
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
LAYOUT: Vollbild-Kalibrierungs-Screen OHNE Studio-Sidebar. Gesamtbreite 1280 px.
- Oben: Top-Bar volle Breite, Höhe ~56 px, Hintergrund #ffffff, unterer Rand 1 px #082a501a
- Darunter: Split — links ~calc(100% - 272px) Panorama-Viewer, rechts festes Panel 272 px, Hintergrund #f5f2ea
- Top-Bar Inhalt: links „← Zurück“ (Outline-Button), Mitte Titel, rechts Chip „calib · nur lokal“ (klein, monospace-artig)

=== DIESER SCREEN ===
Screen-ID S13. Marker gesetzt nach Klick.

Panorama zeigt grünen Pin/Marker. Panel: x: 42 %, y: 67 %. Hotspot-Dropdown „hs-neu“. Button „In stations.json übernehmen“ aktiv (grün).

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s13-flat-calib-marker.png
```

### S13 — Flat-Kalibrierung · applied

**Export:** `s13-flat-calib-applied.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S13 — Flat-Kalibrierung · applied
=== PRODUKT ===
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
LAYOUT: Vollbild-Kalibrierungs-Screen OHNE Studio-Sidebar. Gesamtbreite 1280 px.
- Oben: Top-Bar volle Breite, Höhe ~56 px, Hintergrund #ffffff, unterer Rand 1 px #082a501a
- Darunter: Split — links ~calc(100% - 272px) Panorama-Viewer, rechts festes Panel 272 px, Hintergrund #f5f2ea
- Top-Bar Inhalt: links „← Zurück“ (Outline-Button), Mitte Titel, rechts Chip „calib · nur lokal“ (klein, monospace-artig)

=== DIESER SCREEN ===
Screen-ID S13. Erfolg nach Speichern.

Kleiner grüner Toast oben rechts: „Koordinaten übernommen“. Panel zeigt gespeicherte Werte.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s13-flat-calib-applied.png
```

### S14 — Sphere-Kalibrierung · idle

**Export:** `s14-sphere-calib-idle.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S14 — Sphere-Kalibrierung · idle
=== PRODUKT ===
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
LAYOUT: Vollbild-Kalibrierungs-Screen OHNE Studio-Sidebar. Gesamtbreite 1280 px.
- Oben: Top-Bar volle Breite, Höhe ~56 px, Hintergrund #ffffff, unterer Rand 1 px #082a501a
- Darunter: Split — links ~calc(100% - 272px) Panorama-Viewer, rechts festes Panel 272 px, Hintergrund #f5f2ea
- Top-Bar Inhalt: links „← Zurück“ (Outline-Button), Mitte Titel, rechts Chip „calib · nur lokal“ (klein, monospace-artig)

=== DIESER SCREEN ===
Screen-ID S14. Route /mpz/calib/sphere/musik. Layout IDENTISCH zu S13, aber 360°-Panorama (equirectangular-Kugelansicht, leicht gekrümmt).

Top-Bar: „Sphere-Kalibrierung · musik“. Tabs: Hotspots | Startblick.
KEIN Besucher-Dialog, KEINE Raum-TopBar der Besucher-App.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s14-sphere-calib-idle.png
```

### S14 — Sphere-Kalibrierung · marker

**Export:** `s14-sphere-calib-marker.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S14 — Sphere-Kalibrierung · marker
=== PRODUKT ===
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
LAYOUT: Vollbild-Kalibrierungs-Screen OHNE Studio-Sidebar. Gesamtbreite 1280 px.
- Oben: Top-Bar volle Breite, Höhe ~56 px, Hintergrund #ffffff, unterer Rand 1 px #082a501a
- Darunter: Split — links ~calc(100% - 272px) Panorama-Viewer, rechts festes Panel 272 px, Hintergrund #f5f2ea
- Top-Bar Inhalt: links „← Zurück“ (Outline-Button), Mitte Titel, rechts Chip „calib · nur lokal“ (klein, monospace-artig)

=== DIESER SCREEN ===
Screen-ID S14. Hotspots-Tab. Marker im 360°-View. Panel: yaw: -32°, pitch: -4°. Übernehmen-Button aktiv.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s14-sphere-calib-marker.png
```

### S14 — Sphere-Kalibrierung · applied

**Export:** `s14-sphere-calib-applied.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S14 — Sphere-Kalibrierung · applied
=== PRODUKT ===
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
LAYOUT: Vollbild-Kalibrierungs-Screen OHNE Studio-Sidebar. Gesamtbreite 1280 px.
- Oben: Top-Bar volle Breite, Höhe ~56 px, Hintergrund #ffffff, unterer Rand 1 px #082a501a
- Darunter: Split — links ~calc(100% - 272px) Panorama-Viewer, rechts festes Panel 272 px, Hintergrund #f5f2ea
- Top-Bar Inhalt: links „← Zurück“ (Outline-Button), Mitte Titel, rechts Chip „calib · nur lokal“ (klein, monospace-artig)

=== DIESER SCREEN ===
Screen-ID S14. Erfolgs-Toast nach Hotspot-Speichern.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s14-sphere-calib-applied.png
```

### S14 — Sphere-Kalibrierung · startblick

**Export:** `s14-sphere-calib-startblick.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S14 — Sphere-Kalibrierung · startblick
=== PRODUKT ===
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
LAYOUT: Vollbild-Kalibrierungs-Screen OHNE Studio-Sidebar. Gesamtbreite 1280 px.
- Oben: Top-Bar volle Breite, Höhe ~56 px, Hintergrund #ffffff, unterer Rand 1 px #082a501a
- Darunter: Split — links ~calc(100% - 272px) Panorama-Viewer, rechts festes Panel 272 px, Hintergrund #f5f2ea
- Top-Bar Inhalt: links „← Zurück“ (Outline-Button), Mitte Titel, rechts Chip „calib · nur lokal“ (klein, monospace-artig)

=== DIESER SCREEN ===
Screen-ID S14. Tab „Startblick“ aktiv (nicht Hotspots).

Panorama zeigt andere Blickrichtung. Panel: Live yaw/pitch Readout, Button „Als Startblick übernehmen“ (grün).

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s14-sphere-calib-startblick.png
```

### S15 — Dialog · no-dialog

**Export:** `s15-dialog-no-dialog.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S15 — Dialog · no-dialog
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S15. Tab Dialog aktiv. Station klassenzimmer OHNE dialog in JSON.

WICHTIG: Tab „Dialog“ ist sichtbar (nicht versteckt) — das ist das neue Soll-Verhalten.

Empty-State zentriert:
- Icon oder kleine Illustration Maskottchen Frieda & Otto (dezent, nicht Besucher-Overlay)
- Text: „Noch kein Maskottchen-Dialog für diese Station“
- Primär-Button „Dialog hinzufügen“ (grün)

KEIN separater Dialog-Audio-Tab. KEIN Link zu globaler Dialog-Audio-Seite.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s15-dialog-no-dialog.png
```

### S15 — Dialog · empty-segments

**Export:** `s15-dialog-empty-segments.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S15 — Dialog · empty-segments
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S15. Dialog-Block existiert, segmente[] leer.

Oben: Checkboxen Figuren — Frieda ✓, Otto ✓
Segment-Tabelle mit Header aber 0 Zeilen, Text „Noch keine Segmente“
Button „Erstes Segment anlegen“
Darunter zwei eingeklappte Akkordeons (Chevron rechts): „Gruppen“, „Sprechblasen-Layout“

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s15-dialog-empty-segments.png
```

### S15 — Dialog · filled

**Export:** `s15-dialog-filled.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S15 — Dialog · filled
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S15. Station daz, gefüllter Dialog.

Segment-Tabelle (mindestens 4 Zeilen sichtbar):
| 01 | d1 | frieda | Hallo, willkommen in unserem DaZ-Zimmer… | — | ✓ Clip | ▶ Upload … |
| 02 | d2 | otto | Wir haben ein kleines Sprachrätsel… | — | ✓ Clip | … |
| 03 | d3 | frieda | Hello! | gruesse | ✓ Clip | … |
| 04 | d4 | otto | Hola! | gruesse | ✓ Clip | … |

Eingeklappt darunter: Gruppen, Sprechblasen-Layout

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s15-dialog-filled.png
```

### S15 — Dialog · row-upload-play

**Export:** `s15-dialog-row-audio.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S15 — Dialog · row-upload-play
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S15. Eine Segment-Zeile (01, frieda) ist aufgeklappt — Expandable Row unter der Zeile.

Aufgeklappter Bereich: Mini-Audio-Player-Waveform, Button Abspielen, Upload-Zone „WAV ersetzen (01-frieda.wav)“, Status-Badge „Clip ok“ grün.
Sprechertext bleibt in der Hauptzeile sichtbar. Alles in EINER Zeilen-Interaktion — kein Seitenwechsel.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s15-dialog-row-audio.png
```

### S17 — Coach · empty

**Export:** `s17-coach-empty.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S17 — Coach · empty
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S17. Route /mpz/studio/coach. Sidebar Coach aktiv.

Leere Liste. Text „Noch keine Coach-Nachrichten“. Button „Nachricht hinzufügen“.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s17-coach-empty.png
```

### S17 — Coach · list

**Export:** `s17-coach-list.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S17 — Coach · list
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S17. Tabelle Coach-Messages:
| welcome-hub | hub-milestone (0) | frieda | Willkommen beim Schulrundgang!… | ✓ Audio |
| first-visit | hub-milestone (1) | otto | Super, deine erste Station!… | — |
| complete | hub-complete | duo | Wow — alle Stationen… | — |

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s17-coach-list.png
```

### S17 — Coach · form

**Export:** `s17-coach-form.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S17 — Coach · form
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S17. Formular neue/bearbeitete Nachricht.

Felder: id, trigger (Select: hub-milestone / hub-complete / room-first), milestone Zahl, slug (bei room-first), mascot, placement, text (Textarea), modes Checkboxen fest/heft.
Abschnitt Audio: Upload WAV, Hinweis „Autoplay beim Einblenden — auf iPhone testen“.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s17-coach-form.png
```

### S18 — Embeds & Links · list

**Export:** `s18-embeds-list.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S18 — Embeds & Links · list
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S18. Zwei Abschnitte:

1. Globale Allowlist — Tabelle Domain-Suffixe: bookcreator.com, h5p.org, padlet.com
2. Medien-Übersicht — embed/link-Medien aus allen Stationen (slug, mediumId, URL gekürzt)

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s18-embeds-list.png
```

### S18 — Embeds & Links · edit-suffix

**Export:** `s18-embeds-edit.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S18 — Embeds & Links · edit-suffix
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S18. Eine Allowlist-Zeile im Inline-Edit: Feld „bookcreator.com“, Speichern/Abbrechen.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s18-embeds-edit.png
```

### S19 — Design & Hub · Tab Hub · grid

**Export:** `s19-design-tab-hub-grid.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S19 — Design & Hub · Tab Hub · grid
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S19. Route /mpz/studio/design?tab=hub. Sidebar „Design & Hub“ aktiv.

Tab-Leiste unter H1: [ Hub ] | Brand — Hub aktiv (grüne Unterstreichung).

12er-Grid Hub-Slots (visuell wie Schulhaus-Grundriss vereinfacht ODER Tabellen-Grid):
Slot 1 → klassenzimmer, Akzentfarbe #4b9a23, Icon Buch
Slot 2 → musik, Akzent #1f6abb, Icon Note
… (mindestens 6 Slots sichtbar)
Hinweis read-only: „Slot-Geometrie wird im Code definiert“

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s19-design-tab-hub-grid.png
```

### S19 — Design & Hub · Tab Hub · edit

**Export:** `s19-design-tab-hub-edit.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S19 — Design & Hub · Tab Hub · edit
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S19. Slot 3 (daz) im Edit-Modus: Slug-Dropdown, Farbwähler, Lucide-Icon-Picker (Grid kleiner Icons), Speichern.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s19-design-tab-hub-edit.png
```

### S20 — Design & Hub · Tab Brand · upload

**Export:** `s20-design-tab-brand-upload.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S20 — Design & Hub · Tab Brand · upload
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S20. Route /mpz/studio/design?tab=brand. Tab Brand aktiv.

Drei Upload-Karten untereinander:
- Logos (SVG/PNG) — Drag & Drop
- Maskottchen (frieda, otto, duo) — je Upload-Feld
- Hotspot-Icons — Upload
Pfad-Hinweis monospace: public/brand/…

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s20-design-tab-brand-upload.png
```

### S20 — Design & Hub · Tab Brand · preview

**Export:** `s20-design-tab-brand-preview.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S20 — Design & Hub · Tab Brand · preview
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S20. Hochgeladene Assets mit Vorschaubildern: Logo GS39, Maskottchen Frieda PNG, Otto PNG. Buttons Ersetzen / Entfernen pro Asset.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s20-design-tab-brand-preview.png
```

### S21 — Deploy · ok

**Export:** `s21-deploy-ok.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S21 — Deploy · ok
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S21. Route /mpz/studio/deploy.

Karten-Reihe:
1. Umgebung (.env.local) — maskierte Werte ENTRY_TOKEN=••••
2. QR-Codes — Button „PDF exportieren“
3. Token — „Rotation (Dry-Run)“
4. validate-all — grünes Ergebnis
5. Vorschau-Links — /raum/klassenzimmer, /eintritt?t=heft-…, /

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s21-deploy-ok.png
```

### S21 — Deploy · warnings

**Export:** `s21-deploy-warnings.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S21 — Deploy · warnings
=== PRODUKT ===
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
LAYOUT: Zwei-Spalten-App, Gesamtbreite 1280 px, Höhe ~800 px.
- LINKS Sidebar: fest 240 px breit, Hintergrund #082a50 (Navy), volle Höhe
- RECHTS Hauptbereich: flex 1, Hintergrund #fcfbf7 (Papier)
  - Oben Top-Bar: ~56 px, weiß #ffffff, Border-bottom 1 px rgba(8,42,80,0.1)
  - Optional unter Top-Bar: schmales Plan-A-Banner (gelb #fbbb24 mit 15 % Deckkraft auf Papier, Text Navy)
  - Content-Scrollbereich mit Padding 24 px
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
- Rechts: kleines Badge „Nur lokal · development“ (12 px, grauer Text), daneben orangefarbener Punkt wenn ungespeicherte Änderungen (Dirty), primärer Button „Speichern & Validieren“ — Pill-Form, Hintergrund #4b9a23, weiße Schrift, min. Höhe 44 px

=== DIESER SCREEN ===
Screen-ID S21. validate-all gelb: „1 Warnung — Coach-Nachricht ohne Audio“. Env-Karte zeigt fehlende Variable orange.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s21-deploy-warnings.png
```

### S24 — Unlock (optional)

**Export:** `s24-unlock.png`

```
Erzeuge ein High-Fidelity UI-Mockup.

SCREEN: S24 — Unlock (optional)
=== PRODUKT ===
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
LAYOUT: Zentrierte Karte auf Papier-Hintergrund, KEIN Studio-Chrome, max. Breite 400 px

=== DIESER SCREEN ===
Screen-ID S24. Route /mpz/unlock. Minimalistische Zugangsseite.

Zentrierte weiße Karte auf #fcfbf7: Logo-Text „MPZ Studio“, Passwort/Secret-Feld, Button „Freischalten“ (grün). Kein Sidebar. Dezenter Hinweis „Nur development“.

=== AUSGABEFORMAT ===
Ein einzelnes, scharfes High-Fidelity UI-Mockup-Bild (kein HTML/CSS/React-Code, keine Erklärung nötig).
Stil: realistische Produkt-Screenshot-Qualität, Desktop 1280 px Breite, PNG-tauglich.
Dateiname-Vorschlag: s24-unlock.png
```


---

## Pflege

```bash
cd dokumentation/archiv/design/mpz-studio-claude-design-cleanup
node build-mockup-prompts.mjs
```
