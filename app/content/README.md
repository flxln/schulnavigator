# Coach-Messages

Fortschritts-getriggerte Maskottchen-Texte (ADR-019). Getrennt von `stations.json` → `dialog`.

| Datei | Rolle |
| ----- | ----- |
| `coach-messages.json` | Trigger, Placement, Copy, optionales `layout` |
| `../lib/coach-triggers.ts` | Auflösung Hub/Raum |
| `../lib/coach-layout.ts` | `layout.mascotSize` → Inline-Styles für Figur |
| `../scripts/validate-coach-messages.mjs` | Build-Check (`npm run validate:coach`) |

Placement: `bottom`, `left`, `right`, `duo-split` (nur mit `mascot: "duo"`).

## Optionales `layout` (pro Message)

Siehe [coach-layout.md](../../dokumentation/ideen/archiv/coach-layout.md). Kurz:

| Feld | Bereich | Default |
|------|---------|---------|
| `mascotSize` | 0,15–0,55 | 0,42 |
| `bubbleMaxWidth` | 12–32 rem | 22 |
| `bubbleFontSize` | 12–20 px | 15 |

`mascotSize` steuert die Figur-Höhe als `{wert × 100}vh` (plus skaliertes `maxWidth`). **Nicht** mit Dialog-Hotspot-`mascotSize` in `stations.json` verwechseln (ADR-014, Panorama-Bezug).

**Test `welcome-hub`:** `sn_coach_seen_heft` und `sn_coach_seen_fest` in den DevTools löschen, Seite neu laden.
