# Hub-Gebäude (Frontansicht GS39)

Laufzeit-SVG für den Startseiten-Hub ([ADR-016](../../../dokumentation/adr/016-hub-frontansicht-39gs.md)).

| Datei | Inhalt |
|-------|--------|
| `gs39-front-outline.svg` | Nur Outline-Ebene (`Ebene_2_-_Outline`), ohne JPEG-Hilfsebene und Content-Rahmen |

**Sync:** Quelle `app/scripts/reference/outline-39gs-frontansicht.svg` (Kopie aus Auftraggeber-Submodule). Neu erzeugen:

```bash
cd app && npm run prepare:hub-outline
```

`viewBox` muss `0 0 1086.5 1453.9` bleiben — sonst Slot-Koordinaten in `lib/schoolhouse-hub-map.ts` anpassen.
