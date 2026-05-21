# ADR-006 — Raum-Viewer: Gyro, Hotspots, Tap-Fallback

**Datum:** 2026-05-21  
**Status:** entschieden

## Kontext

Stationsseiten zeigen ein Raumfoto und verknüpfte Medien (Audio, Video, Foto, Text). In Gesprächen mit der Schule wurde ein immersives „durch den Raum schauen“-Erlebnis gewünscht; gleichzeitig war „AR“ in der Wunschliste als Post-Fest-Feature geführt.

Vorliegendes Material: normale Querformat-Raumfotos (~4:3, ~1800–1975 px), keine 360°-Panoramen. Zuordnung Foto ↔ Station: [`auftraggeber/material/stationen/zuordnung-stationen-bilder.md`](../../auftraggeber/material/stationen/zuordnung-stationen-bilder.md).

## Entscheidung

Für das **MVP (bis 26.06.)** gilt auf allen Stationsseiten mit Raumbild:

| Aspekt | Festlegung |
|---|---|
| **Bildtyp** | Normales Querformat-Foto (kein 360°-Panorama) |
| **Darstellung** | **Gyro-Viewer (Standard):** überbreites Bild, sichtbarer Ausschnitt folgt der Geräteneigung |
| **Medien öffnen** | **Hotspots** im Bild (Position in Prozent, Verknüpfung mit `medien[]`) |
| **Fallback** | **Tap** auf Hotspot-Marker; optional Wischen; Hinweis wenn Orientierung nicht verfügbar |
| **Ausnahme** | Station ohne brauchbares Raumbild: statische Darstellung + Medienliste (z. B. bis HD-Foto nachgeliefert wird) |

**Nicht im MVP:** Kamera-AR (WebXR), 360°-Viewer (Pannellum o. ä.), Lego-/Tafel-Trigger.

## Begründung

- Nutzt vorhandene Fotos ohne neue Aufnahmetechnik
- Deutlich weniger Aufwand als echtes AR, aber spürbarer „Wow“-Effekt am Schulfest
- Hotspots verbinden Raum visuell mit dem geplanten Medientyp pro Bereich (Tafel → Video, Regal → Audio, …)
- Tap-Fallback ist Pflicht (iOS-Berechtigung, Tablets ohne Gyro, Barrierefreiheit)

## Verworfene Alternativen

- **Nur statisches Bild + Buttons unterhalb:** robust, aber ohne gewünschte Immersion — für MVP verworfen
- **360°-Panorama:** besserer Rundumblick, aber andere Aufnahmen und Libraries nötig
- **Kamera-AR / WebXR:** Recht, Performance, iOS-Komplexität; bewusst Post-Fest (siehe Phase-5-Wunschliste: echtes AR)
- **Gyro nur opt-in pro Station:** verworfen — **Gyro ist Standard** auf allen Seiten mit `bild`

## Konsequenzen

- **Phase 1:** JSON-Schema um `hotspots` und `medium.id` erweitern (#12); Stationsseite bindet Platzhalter-`RaumViewer` (#13)
- **Phase 2:** Komponente `RaumViewer` — Gyro-Pan, Hotspot-Overlay, Medien-Panel; iOS-Orientierung nach Nutzer-Geste; HTTPS (#55)
- **Phase 3:** Pro Station mindestens 1–2 Hotspots pflegen; Koordinaten in JSON; Raumfotos nach Zuordnungstabelle einpflegen (#27)
- **Test:** Reales iPhone (Safari) im Abschlusstest (#38)
- **Directus (später):** Collection-Felder für Hotspots analog JSON-Schema

### Datenmodell (Auszug)

```ts
interface Hotspot {
  id: string
  label?: string      // A11y / Dev
  x: number           // 0–1, Mitte
  y: number           // 0–1
  radius?: number     // 0–1, Default ~0.08
  mediumId: string
}

interface Medium {
  id: string
  typ: 'audio' | 'video' | 'foto' | 'text'
  quelle: string
  videoSource?: 'upload' | 'youtube'
  untertitel?: string
}

interface Station {
  slug: string
  titel: string
  beschreibung: string
  bild?: string       // fehlt → keine Gyro-Ansicht
  medien: Medium[]
  hotspots?: Hotspot[]
  puzzleSegmentId?: string
}
```

Hotspot-Aktivierung: Mittelpunkt des sichtbaren Ausschnitts im Radius **oder** Tap auf Marker.
