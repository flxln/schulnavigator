# UI-Komponenten — Besucher-App (Referenz für Studio)

MPZ Studio soll **visuell zur Schulnavigator-App passen**, aber **funktional dichter** sein (Admin/Werkzeug).

Quellcode unter `app/components/ui/`.

---

## Gs39Button

Varianten:

| variant | Verwendung |
|---------|------------|
| `primary` | Haupt-CTA (Grün) — z. B. „Speichern & Validieren“ |
| `navy` | Sekundär auf hellem Grund |
| `outline` | Abbrechen, Zurück |

Props: `block` für volle Breite.

CSS-Klassen: `sn-btn`, `sn-btn--primary`, `sn-btn--navy`, `sn-btn--outline`.

---

## Gs39Card

Flächen mit Papier/Weiß-Hintergrund, Schatten aus Tokens.

| Prop | Effekt |
|------|--------|
| `interactive` | Hover/Focus für klickbare Kacheln (Stationen-Grid) |
| `locked` | Ausgegraut, nicht klickbar |

CSS: `sn-card`, `sn-card--interactive`, `sn-card--locked`.

**Studio:** Stationen-Kacheln und Dashboard-Karten wie `Gs39Card interactive`.

---

## TopBar

Dunkle Navy-Leiste (`bg-dark`), weiße Schrift — wie in `/raum/[slug]`.

Studio: vereinfachte TopBar mit Titel, Dev-Badge, globaler Save-Button.

---

## Gs39Chip

Kleine Labels (z. B. Viewer-Typ `flat` / `360°`, Hub-Nr).

---

## Semantische Farben (Tailwind / CSS)

Aus `gs39-tokens.css` und `globals.css`:

- Seitenhintergrund: `--bg-1` (paper)
- Karten: `--bg-2` (white)
- Primärtext: `--fg-1` (navy)
- Sekundärtext: `--fg-2`, `--fg-3`
- CTA: `--accent` (green)
- Fehler: `--error` (red)
- Warnung: `--warn` (sun)

---

## Was Studio NICHT übernehmen soll

- Schulhaus-Hub-Grafik
- Maskottchen-Coach-Layer
- Festive Decor / Sparkle
- Vollbild-Scanner-Chrome

---

## Optional: Screenshots

Lege Referenz-Screenshots in `assets/` ab:

- `raum-klassenzimmer.png` — Besucher-Raumseite
- `hub-startseite.png` — Puzzle-Hub
- `gs39-button-card.png` — Button- und Kartenbeispiel

Dann in Claude Design zusammen mit diesem Paket hochladen.
