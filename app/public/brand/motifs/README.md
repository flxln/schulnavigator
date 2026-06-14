# Motive (Dekoration)

Erwartete Dateien laut Design-Prototyp [`screens.jsx`](../../../../auftraggeber/Virtueller%20Schulrundgang/screens.jsx):

| Datei | Verwendung |
|-------|------------|
| `bunting.png` | Wimpelkette (Home, Eintritt) |
| `balloons.png` | Ballons (Home, Eintritt) |
| `heart-sparkles.png` | Abschluss 12/12 Stationen |

## Status

**Noch nicht geliefert** — im Download-Ordner `auftraggeber/Virtueller Schulrundgang/assets/` liegen derzeit nur `logos/` und `colors_and_type.css`.

## Interim

Bis die PNGs hier liegen, nutzt die App CSS-Fallbacks (`.sn-watercolor`, radiale Verläufe) wie in `app-styles.css` des Prototyps — siehe Phase 1 (`sn-theme.css`).

## Nach Lieferung

1. PNGs in diesen Ordner legen (committed).
2. `FestiveDecor` / Home-Hero auf `<Image src="/brand/motifs/…" />` umstellen.
3. Keine Inline-SVG-Kopien der Motive in TSX (Design-Regel).
