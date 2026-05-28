# ADR-010 — Dialog: Cutscene-Overlay, gated Audio, ein Audio-Element

**Datum:** 2026-05-27  
**Status:** entschieden (UI-Präsentation ersetzt durch [ADR-011](./011-dialog-mascot-hotspots.md); Audio, API, `dialog`-JSON unverändert gültig)

## Kontext

Stationen wie DaZ und PC-Raum nutzen **Otto- und Frieda-Dialoge** aus Schulmaterial (rollengetaggte WAV-Clips + Transkripte). Besucher sollen den Dialog im Raum erleben, ohne ein separates Quiz-Programm. Audio enthält Kinderstimmen — Einwilligung liegt vor; trotzdem soll die Auslieferung **nicht** als öffentliche Static-Datei erfolgen (ergänzt ADR-005/007).

Technische Alternativen: Figuren im Panorama verankert (Gyro-Komplexität), gemergte m4a mit `timeupdate`-Sync (Timestamp-Drift), mehrere `new Audio()`-Instanzen (iOS blockt Folge-`play()`).

## Entscheidung

1. **Datenmodell:** optionales `station.dialog` mit `figuren`, `segmente[]`, optional `gruppen[]` (Anzeige-Gruppen für Stakkato, z. B. fünf Grüße = eine Sprechblase). Kein fünfter Medientyp.
2. **UI (ursprünglich):** **Cutscene-Overlay** über dem Raumbild (Gyro pausiert via `orientationEnabled`); Figuren links/rechts, Sprechblase als Untertitel; ein `<audio>`-Element, Clips als Playlist (`ended` → nächster Clip). **Ab 2026-05-28:** Dialog-Stationen nutzen Maskottchen-Hotspots im Raumbild ([ADR-011](./011-dialog-mascot-hotspots.md)); Cutscene-UI entfällt dort.
3. **Audio-Auslieferung:** Dateien unter `app/content/dialog-audio/{slug}/`, Route `GET /api/dialog/[slug]/[clip]` mit Cookie-Auth (**403** ohne Token), **Range/206** für iOS, Path-Traversal-Schutz.
4. **Docker:** `COPY content/ ./content/` im Runtime-Image (Standalone übernimmt `content/` nicht automatisch).

## Begründung

- Cutscene vermeidet Panorama-Beschnitt/Hotspot-Konflikte und ist für die Demo am 10.06. schneller lieferbar als verankerte Figuren.
- Ein `<audio>`-Element respektiert iOS-Nutzer-Geste und Playlist-Wechsel.
- Gated Route: defense-in-depth neben Middleware auf Seiten-Routen.
- Gruppen im JSON verhindern Sprechblasen-Flackern bei kurzen Grüßen.

## Verworfene Alternativen

- **Figuren im Panorama mitschwenkend:** höherer Aufwand (#56), nach Demo optional.
- **Gemergte m4a + Timestamps:** Drift zwischen JSON und Merge-Datei.
- **9× `new Audio()`:** iOS-Safari blockt Ketten ohne User-Geste.
- **Clips unter `public/demo/`:** zu leicht direkt abrufbar ohne Cookie.

## Konsequenzen

- `stations.json` für `daz` und `pc-raum` mit `dialog`-Block; Validator in `validate-stations.ts` + Datei-Check in `validate-station-assets.mjs`.
- Neue Komponente `DialogPlayer`; `RaumStationClient` öffnet Cutscene per „Dialog starten“.
- Weitere Stationen: gleiches Muster (Clips kopieren, JSON pflegen).
- Panorama-Verankerung und Lip-Sync: bewusst Post-Fest.
