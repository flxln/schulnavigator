---
tags:
  - pre-mortem
  - logik-spec
  - sphere-kalib
erstellt: 2026-06-23
---
# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag für Sphere-Kalibrierung #201

## Zusammenfassung der gefundenen Probleme

Ich habe den Implementierungsplan #201 mit den relevanten Specs, Code und API-Verträgen verglichen. Dabei sind folgende kritische Diskrepanzen und undefinierte Bereiche aufgetreten:

### 1. **Fehlercode-Format: Guard-Responses ohne `message`-Feld** (Widerspruch zwischen Dokumenten)
- **Plan/Ziel**: API-Vertrag mit `error` + `message` (siehe `route.ts` Zeile 23-25, 38-44, 51-53, etc.)
- **Ist**: `assertMpzStudioAccess` in `mpz-studio-guard.ts` gibt `NextResponse.json({ error: 'NOT_FOUND' })` ohne `message` zurück (Zeile 34, 37).
- **Warum teuer**: Frontend erwartet `error.message` für Nutzerhinweise. Fehlende Messages führen zu leeren Fehlermeldungen oder Abstürzen.
- **Wann es beißt**: Bei jedem API-Aufruf ohne Studio-Zugriff (z.B. unautorisierte Kalibrierung).
- **Gegenmaßnahme jetzt**: `assertMpzStudioAccess` anpassen auf `{ error: 'NOT_FOUND', message: 'Nicht gefunden' }` bzw. `{ error: 'UNAUTHORIZED', message: 'Nicht angemeldet' }`.

### 2. **Fehlende `hasPanorama360`-Unterstützung in Overview** (Unvollständige Diskriminierung)
- **Plan**: `mpzStationCalibHref` soll `hasPanorama360` berücksichtigen (Plan Zeile 67-71, `mpz-studio-calib.ts` Zeile 8-14).
- **Ist**: `MpzStationOverview` in `mpz-studio-overview.ts` hat nur `hasBild` (Zeile 31), nicht `hasPanorama360`.
- **Konsequenz**: `station-grid.tsx` und `station-hotspots-table.tsx` können keine zuverlässige Kalibrierungs-Link-Logik für Sphere implementieren. Grid zeigt für Sphere ohne Panorama fälschlich keinen Link (Plan Annahme Zeile 225).
- **Gegenmaßnahme jetzt**: `MpzStationOverview` um `hasPanorama360` erweitern und `buildStationOverviews` anpassen (Zeile 147).

### 3. **Inkonsistenter `VALIDATION`-Fehlercode** (API-Vertrag ohne Format)
- **Domain**: `MpzHotspotCalibError` und `MpzViewIngestError` verwenden `VALIDATION` (Zeile 13, `mpz-hotspot-calib.ts`; `mpz-view-ingest.ts` Zeile 14-23).
- **Guard**: `MpzContentIoError` verwendet ebenfalls `VALIDATION` (Zeile 41-51, `mpz-content-io.ts`).
- **Problem**: `VALIDATION` vs. `VALIDATION_FAILED` — Projektregel verlangt `SCREAMING_SNAKE_CASE`, aber `VALIDATION` ist zu generisch und nicht in der Liste der Legacy-Mappings (die `validation_failed` → `VALIDATION_FAILED` vorschreibt).
- **Risiko**: API-Client könnte `VALIDATION` nicht als bekannten Fehlercode erkennen.
- **Gegenmaßnahme jetzt**: Entweder `VALIDATION` zu `VALIDATION_FAILED` ändern (Breaking Change in Domain) oder Client anpassen. Da `VALIDATION` bereits in Produktion sein könnte, ist ein Rename riskant.

### 4. **Fehlende Fehler-Response bei `NOT_FOUND` im Guard** (API-Vertrag ohne Format)
- **Guard**: `assertMpzStudioAccess` gibt bei `!isMpzStudioEnabled()` `{ error: 'NOT_FOUND' }` ohne `message` (Zeile 34).
- **API-Routen**: Bei `!isMpzStudioEnabled()` wird `404` mit `{ error: 'NOT_FOUND' }` zurückgegeben, aber auch ohne `message`.
- **Vertrag**: Alle anderen API-Fehler haben `error` + `message` (z.B. `INVALID_JSON` Zeile 23-25).
- **Konsequenz**: Frontend kann keine einheitliche Fehlerbehandlung implementieren.
- **Gegenmaßnahme jetzt**: Guard-Responses um `message` erweitern.

### 5. **Annahme: `hasPanorama360` existiert bereits in `mpz-studio-overview.ts`** (Annahme, die nie verifiziert wurde)
- **Plan**: „`hasPanorama360` im Overview (für `station-grid.tsx`)" (Plan Zeile 88-89).
- **Tatsache**: `hasPanorama360` ist nicht in `MpzStationOverview` implementiert (Zeile 22-33).
- **Folge**: Grid kann den Kalibrierungslink für Sphere nicht korrekt anzeigen.
- **Gegenmaßnahme jetzt**: Sofort `hasPanorama360` in Overview hinzufügen und alle Aufrufer aktualisieren.

### 6. **Inkonsistenter Fehlercode `IO`** (Fehlercode ohne klare Zuordnung)
- **`MpzContentIoError`** verwendet `IO` (Zeile 41-51).
- **API-Routen** leiten `IO` von `MpzContentIoError` weiter (z.B. `route.ts` Zeile 55-57).
- **Problem**: `IO` ist nicht in der Projekt-Cursor-Regel-Liste der Fehlercodes aufgeführt (nur `INTERNAL_ERROR`, `IO` wäre aber konsistent).
- **Risiko**: Frontend erwartet möglicherweise `INTERNAL_ERROR` statt `IO`.
- **Gegenmaßnahme jetzt**: Entweder `IO` zu `INTERNAL_ERROR` ändern oder Client anpassen.

### 7. **Fehlende Validierung von `hasPanorama360` in `mpz-studio-calib.ts`** (Unvollständige Diskriminierung)
- **Plan**: `mpzStationCalibHref({ viewer: 'equirectangular', slug, hasPanorama360: true })` → `/mpz/calib/sphere/{slug}` (Plan Zeile 153).
- **Ist**: `mpz-studio-calib.ts` prüft nur `viewer` und `hasBild` (Zeile 7-14). `hasPanorama360` wird nicht berücksichtigt.
- **Konsequenz**: Sphere-Route wird auch ohne `panorama360` zurückgegeben → Page gibt `notFound()` (Plan Zeile 66), aber der Link existiert bereits im Studio.
- **Gegenmaßnahme jetzt**: `mpzStationCalibHref` um `hasPanorama360` erweitern und Logik anpassen.

### 8. **Fehlende `hasPanorama360`-Berechnung in `mpz-studio-overview.ts`** (Unvollständige Diskriminierung)
- **Plan**: `hasPanorama360` soll in der Overview berechnet werden (Plan Zeile 88-89).
- **Ist**: `buildStationOverviews` berechnet nur `hasBild` (Zeile 147), nicht `hasPanorama360`.
- **Gegenmaßnahme jetzt**: Funktion `hasPanorama360` hinzufügen: `!!station?.panorama360?.trim()`.

### 9. **Fehlende Tests für neue `hasPanorama360`-Logik** (Implementierungsdetail, aber kritisch)
- **Risiko**: Ohne Tests wird die neue Logik leicht brechen.
- **Gegenmaßnahme jetzt**: Tests für `mpz-studio-calib.ts` und `mpz-studio-overview.ts` anpassen.

### 10. **Fehlende Dokumentation der Fehlercode-Änderungen** (API-Vertrag)
- **Problem**: Die Änderungen an den Fehlercodes (`NOT_FOUND` + `message`, `IO` vs. `INTERNAL_ERROR`) sind nicht dokumentiert.
- **Gegenmaßnahme jetzt**: API-Dokumentation in `app/app/api/.../route.ts` aktualisieren.

## Entscheidungsfindung

| Problem | Dringlichkeit | Empfohlene Maßnahme |
|---------|---------------|---------------------|
| 1. Guard ohne `message` | Hoch | Sofort fixen |
| 2. `hasPanorama360` in Overview | Hoch | Sofort implementieren |
| 3. `VALIDATION` vs. `VALIDATION_FAILED` | Mittel | Rename zu `VALIDATION_FAILED` für Konsistenz |
| 4. `NOT_FOUND` ohne `message` | Hoch | Sofort fixen |
| 5. Annahme `hasPanorama360` existiert | Hoch | Sofort implementieren |
| 6. `IO` vs. `INTERNAL_ERROR` | Niedrig | `IO` beibehalten (bereits in Produktion) |
| 7. `hasPanorama360` in `mpz-studio-calib.ts` | Hoch | Sofort anpassen |
| 8. `hasPanorama360` in Overview berechnen | Hoch | Sofort hinzufügen |
| 9. Tests | Mittel | Bei Code-Änderungen mit anpassen |
| 10. Dokumentation | Mittel | API-Kommentare aktualisieren |

## Nächste Schritte

1. `mpz-studio-guard.ts` anpassen (Fehler mit `message`).
2. `mpz-studio-overview.ts` um `hasPanorama360` erweitern.
3. `mpz-studio-calib.ts` um `hasPanorama360` erweitern.
4. API-Responses auf `VALIDATION_FAILED` umbenennen (falls nicht bereits in Produktion).
5. Tests anpassen.

## Relevante Dateien

- `app/lib/mpz-studio-guard.ts` (Guard-Responses)
- `app/lib/mpz-studio-overview.ts` (Overview-Berechnung)
- `app/lib/mpz-studio-calib.ts` (Link-Helfer)
- `app/app/api/mpz/hotspots/sphere/route.ts` (API-Vertrag)
- `app/app/api/mpz/view/sphere/route.ts` (API-Vertrag)
- `app/lib/mpz-hotspot-calib.ts` (Domain-Fehler)
- `app/lib/mpz-view-ingest.ts` (Domain-Fehler)
- `app/lib/mpz-content-io.ts` (IO-Fehler)

## Quellen

- Plan: `.cursor/plans/sphere-kalibrierung_#201_9fa39b03.plan.md`
- Spec: `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/16-sphere-calib-screen.md`
- Code: `app/lib/mpz-studio-guard.ts`, `app/lib/mpz-studio-overview.ts`, `app/lib/mpz-studio-calib.ts`, `app/lib/mpz-hotspot-calib.ts`, `app/lib/mpz-content-io.ts`