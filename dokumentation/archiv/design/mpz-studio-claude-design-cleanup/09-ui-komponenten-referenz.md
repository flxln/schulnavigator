# UI-Komponenten — Besucher-App (Referenz für Studio)

MPZ Studio soll **visuell zur Schulnavigator-App passen**, aber **funktional dichter** sein (Werkzeug-UI).

Quellcode: `app/components/ui/`.

---

## Gs39Button

| variant | Verwendung |
|---------|------------|
| `primary` | Haupt-CTA (Grün) — z. B. „Speichern & Validieren“ |
| `navy` | Sekundär auf hellem Grund |
| `outline` | Abbrechen, Zurück |

CSS: `sn-btn`, `sn-btn--primary`, `sn-btn--navy`, `sn-btn--outline`.

---

## Gs39Card

| Prop | Effekt |
|------|--------|
| `interactive` | Hover/Focus für Kacheln (Stationen-Grid) |
| `locked` | Ausgegraut |

CSS: `sn-card`, `sn-card--interactive`, `sn-card--locked`.

---

## TopBar

Dunkle Navy-Leiste — Besucher-App `/raum/[slug]`.

Studio: vereinfachte TopBar mit Titel, Save-Button (Ist: helle Top-Bar mit Border).

---

## Gs39Chip

Kleine Labels (Viewer `flat` / `360°`, Hub-Nr).

---

## Semantische Farben

Aus `03-design-system-gs39-tokens.css`:

- Seitenhintergrund: `--bg-1` (paper)
- Karten: `--bg-2` (white)
- Primärtext: `--fg-1` (navy)
- CTA: `--accent` / `--brand-green`
- Fehler: `--error` / `--brand-red`
- Warnung: `--warn` / `--brand-sun`
- Sidebar: `--bg-dark`, `--fg-on-dark`

---

## Was Studio NICHT übernehmen soll

- Schulhaus-Hub-Grafik
- Maskottchen-Coach-Layer (Besucher-App)
- Festive Decor / Sparkle
- Vollbild-Scanner-Chrome

---

## Studio-spezifische Bausteine (Ist — zu vereinheitlichen)

| Baustein | Verwendung |
|----------|------------|
| Sidebar-Nav | 9 Einträge, Navy-Hintergrund |
| Tab-Leiste | Station Detail |
| Daten-Tabelle | Medien, Hotspots, Coach |
| Upload-Modal | Medien ingest |
| Status-Badges | Dialog-Audio, Coach-Audio |
| Save-Validate-Panel | Grün/rot, dismissible |
| Plan-A-Banner | Gelb/dezent oben |

Redesign: diese Bausteine in ein **einheitliches Komponenten-Set** überführen.
