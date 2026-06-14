# Hub-Gebäude (Frontansicht GS39)

Laufzeit-SVG für den Startseiten-Hub ([ADR-016](../../../dokumentation/adr/016-hub-frontansicht-39gs.md), Wegweiser [ADR-020](../../../dokumentation/adr/020-hub-wegweiser-aussen-stationen.md)).

| Datei | Inhalt |
|-------|--------|
| `gs39-front-outline.svg` | Outline-Ebene inkl. Wegweiser (`Ebene_2_-_Outline`), ohne JPEG-Hilfsebene und Content-Rahmen |

**Sync:** Quelle `app/scripts/reference/outline-39gs-frontansicht.svg` (Kopie aus `auftraggeber/material/bilder/outline-39gs-frontansicht wegweiser.svg`). Neu erzeugen:

```bash
cd app && npm run prepare:hub-outline
```

`viewBox` muss `0 0 1086.5 1453.9` bleiben — sonst Slot-Koordinaten in `lib/schoolhouse-hub-map.ts` anpassen.
