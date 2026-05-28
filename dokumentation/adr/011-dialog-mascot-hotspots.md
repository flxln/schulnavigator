# ADR-011 — Dialog: Maskottchen-Hotspots im Raumbild

**Datum:** 2026-05-28  
**Status:** entschieden  
**Ersetzt UI-Anteil von:** [ADR-010](./010-dialog-cutscene-gated-audio.md) (Audio, Route, Datenmodell `dialog` bleiben in 010)

## Kontext

ADR-010 lieferte Dialog-Audio und eine **Vollbild-Cutscene** (Gyro pausiert, Figuren außerhalb des Panoramas). Ein Risiko-Spike (2026-05-28, iPhone/Safari) bestätigte: Tap auf große Figuren im Raumbild, synchrones `play()` im Tap-Handler und eingebettete Sprechblase sind machbar. Die Demo soll den Raum sichtbar lassen und Gyro während des Dialogs aktiv halten.

## Entscheidung

1. **Hotspot-Typ:** `action: 'dialog'` mit Pflichtfeld `mascot: 'frieda' | 'otto'`; kein `mediumId`. Standard-Hotspots bleiben `action: 'medium'` (Default) mit `mediumId`.
2. **Rendering:** PNG aus `/brand/mascots/{mascot}.png` im [`hotspot-overlay.tsx`](../../app/components/raum-viewer/hotspot-overlay.tsx); Fußpunkt auf `(x, y)`; Touch-Ziel ≥ 44×44 px; `stopPropagation` auf `pointerDown` (Pan-Konflikt).
3. **Trigger:** Tap auf Maskottchen → **synchron** `startFromUserGesture()` im Click-Handler; kein „Dialog starten“-Button, kein Vollbild-Cutscene für Dialog-Stationen.
4. **Audio:** Ein `<audio>` dauerhaft in `raum-station-client.tsx`; Playlist über [`useDialogAudioPlaylist`](../../app/hooks/use-dialog-audio-playlist.ts) (ADR-010-Mechanik, `advanceRef`).
5. **UI:** [`DialogEmbeddedBubble`](../../app/components/dialog/dialog-embedded-bubble.tsx) über dem Hero (festes `bg-bg-2`, kein `backdrop-blur` — iOS-Safari); „Beenden“ beendet Audio und schließt Dialog-UI.
6. **Gyro:** während Dialog **an**; Figuren pannt mit dem Panorama; Sprechblase bleibt viewport-fix (v1).
7. **Center-Hit:** Dialog-Hotspots von der Mitte-Hervorhebung ausgeschlossen.
8. **Re-Tap:** Tap auf Figur während laufendem Dialog → ignorieren.

**Spike abgeschlossen (2026-05-28):** Scope `/raum/daz`, iPhone — Audio, Tap/Pan, Sichtbarkeit, Sprechblase (Safari-Fix). Vollausbau: `daz` + `pc-raum`, Schema `action`/`mascot`, ADR/Doku.

## Begründung

- Raum bleibt erlebbar; weniger „Kinomodus“ als Cutscene.
- Spike bewies iOS-Geste ohne Cutscene-Mount.
- Getrennte Hotspots pro Figur; `rolle: 'beide'` animiert beide (über `speakingRolle`).

## Verworfene Alternativen

- **Cutscene als Standard:** ADR-010; nur noch historischer Codepfad, für Dialog-Stationen entfernt.
- **Blase mitpannt:** höherer Aufwand; siehe [`kurzfristige-ideen/dialog-maskottchen-abstand-und-pan.md`](../kurzfristige-ideen/dialog-maskottchen-abstand-und-pan.md).
- **`mediumId: "__dialog__"` (Spike):** durch `action`/`mascot` ersetzt.

## Konsequenzen

- `stations.json`: `daz`, `pc-raum` mit je zwei Dialog-Hotspots.
- Validator: `action`/`mascot`-Regeln; Warnung bei nur einem Maskottchen-Hotspot.
- Demo-Meeting und `lokal-testen`: Tap auf Frieda/Otto statt Cutscene-Button.
- Feintuning Positionen am Gerät (`?debug=1`); Abstand Blase ↔ Figuren: Kurzidee-Dokument.
