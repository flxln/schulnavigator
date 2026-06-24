# ADR-026 — Dialog: Text-only-Segmente (optionales Audio)

**Datum:** 2026-06-24
**Status:** entschieden
**Ergänzt:** [ADR-010](./010-dialog-cutscene-gated-audio.md), [ADR-011](./011-dialog-mascot-hotspots.md)

## Kontext

Dialog-Segmente waren bisher immer an einen WAV-Clip gebunden (`segment.quelle` Pflicht). MPZ Studio setzte beim Anlegen automatisch einen API-Pfad; fehlende Datei blockierte Save und Build. Use-Case **Lesewelt:** Otto per Dialog-Hotspot, nur Sprechblase, kein Ton.

Coach (ADR-019) bietet text-only Einblendungen, ist aber **fortschritts-getriggert**, nicht hotspot-getriggert.

## Entscheidung

1. **Schema:** `DialogSegment.quelle` optional. Fehlt `quelle` → Text-only-Segment (kein Audio, kein Asset-Check).
2. **Studio:** Checkbox „Mit Audio“; **Default aus** (neues Segment = nur Text). `hasAudio: true` ist Client-Hinweis für Chain-on-Save (WAV nach Segment-Save); **`quelle` setzt erst `ingestDialogClip`**, nicht das Segment-PATCH/POST — sonst blockiert postValidate vor dem Upload.
3. **Viewer:** Text-only-Segmente zeigen Sprechblase ohne `audio.play()`. **Tap auf Blase** → nächstes Segment oder Dialog-Ende (kein Auto-Timer).
4. **Gemischte Dialoge:** Audio-Segmente weiter per `ended`/`error` auto-advance; Clip-Namen weiter indexbasiert in `segmente[]`.
5. **Build-Gate:** Fehlende WAV bei **gesetzter** `quelle` bleibt Deploy-Error (analog Coach ADR-025).
6. **Audit:** Studio-State `text-only`; zählt nicht zu `missingCount`.

## Begründung

- Hotspot-Dialog und Coach erfüllen unterschiedliche Trigger — Text-only am Hotspot braucht kein Coach-Missbrauch.
- Tap-Advance ist iOS-sicher und für Grundschulkinder lesbar (Blase bleibt bis bewusste Geste).
- Optionales `quelle` statt Dummy-WAV vermeidet Workarounds und falsche Asset-Fehler.

## Verworfene Alternativen

- **Stille WAV-Platzhalter:** technischer Hack, Pflege- und Build-Overhead.
- **Nur Coach statt Dialog-Hotspot:** falscher Trigger (Raumbetritt vs. Otto am Objekt).
- **Auto-Timer für Text-only:** Kinder lesen unterschiedlich schnell; Tap ist bewusster.

## Konsequenzen

- **Geändert:** `app/lib/types.ts`, `dialog-display.ts`, `mpz-station-dialog.ts`, `mpz-dialog-audio-sync.ts`, `validate-stations.ts`, `mpz-dialog-audio-ingest.ts`, `use-dialog-audio-playlist.ts`, `dialog-embedded-bubble.tsx`, `raum-station-client.tsx`, MPZ Studio Segment-Form/Panel.
- **Bestehende Audio-Dialoge** (DaZ, PC-Raum): unverändert (`quelle` gesetzt).
- **Issue:** [#221](https://github.com/flxln/schulnavigator/issues/221)
