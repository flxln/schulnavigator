# Coach-Messages

Fortschritts-getriggerte Maskottchen-Texte (ADR-019). Getrennt von `stations.json` → `dialog`.

| Datei | Rolle |
| ----- | ----- |
| `coach-messages.json` | Trigger, Placement, Copy |
| `../lib/coach-triggers.ts` | Auflösung Hub/Raum |
| `../scripts/validate-coach-messages.mjs` | Build-Check (`npm run validate:coach`) |

Placement: `bottom`, `left`, `right`, `duo-split` (nur mit `mascot: "duo"`).
