---
tags:
  - prompt
  - sparring
  - pre-mortem
  - 01b-logik-spec
erstellt: 2026-06-24
---
# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag: #216 Dialog S15

**Geprüfte Dokumente:**
- Plan: `.cursor/plans/#216_dialog_s15_25cdfb74.plan.md`
- Spec: `dokumentation/planung/epic-mpz-studio-v3-visual-polish.md`, `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/02-screens-v2.1-und-user-stories.md`, `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/05-typendefinitionen.md`, `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/15-dialog-segment-zeilenmodell.md`, `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/mockups/SCREEN-MATRIX.md`
- Code: `app/components/mpz-studio/station-detail-shell.tsx`, `station-dialog-panel.tsx`, `station-dialog-segment-audio-row.tsx`, `station-dialog-segment-form.tsx`
- Lib/API: `app/lib/mpz-station-dialog.ts`, `app/lib/mpz-dialog-audio-ingest.ts`, `app/app/api/mpz/stations/[slug]/dialog/route.ts`, `dialog/segmente/route.ts`, `dialog/segmente/[segmentId]/route.ts`, `app/app/api/mpz/dialog-audio/status/route.ts`, `ingest/route.ts`, `clip/route.ts`

Positiv: Der zentrale Dialog-CRUD-Vertrag ist fuer #216 grundsaetzlich stabil: `POST/PATCH/DELETE …/dialog`, Segment- und Gruppenrouten mappen `MpzStationDialogError` weitgehend konsistent auf `{ error, message }` via `mapDialogError`; der MPZ-Guard liefert wie in anderen Studio-Routen nur `{ error: 'UNAUTHORIZED' }`, was bestehende Fallbacks abdecken koennen.

### S15-Zeilenmodell widerspricht dem geplanten Expand-Pattern

- **Warum später teuer:** Der #216-Plan entscheidet, die Audio-Sub-Zeile aus #200 beizubehalten: Hauptzeile zeigt Badge + Button "Audio", Upload/Player liegen erst im Expand. Das Referenzdokument `15-dialog-segment-zeilenmodell.md` ist jedoch eine explizite Produkt-/Domänenentscheidung und sagt: Sprechertext und Audiodatei werden "in einer Tabellenzeile" gepflegt; Pflichtaktionen in der Zeile sind Audio hinzufügen/ersetzen, Abspielen und Löschen. `02-screens` formuliert S15 ebenfalls als Segment-Zeile "Text + Audio". Damit hat der Plan eine bewusste Abweichung, aber noch keinen verbindlichen Override der stärkeren Spec.
- **Wann es beißt:** Bei Screenshot-Abnahme `s15_dialog_filled` und `s15_dialog_row_upload_play`: Ein Reviewer kann korrekterweise erwarten, dass Upload/Play direkt in der Tabellenzeile sichtbar sind. Die Implementierung kann dagegen den #216-Plan erfüllen und trotzdem gegen das Zeilenmodell verstoßen.
- **Billige Gegenmaßnahme jetzt:** Im Plan eine klare Entscheidung ergänzen: Entweder S15 akzeptiert das #200-Expand-Pattern als dokumentierte Ausnahme und `15-dialog-segment-zeilenmodell.md`/Screenshot-Erwartung wird angepasst, oder #216 muss Upload/Play als Hauptzeilen-Aktionen umsetzen. Ohne diese Härtung bleibt "Mockup-Nähe" nicht abnahmefähig.

### Segment-Text ist laut Spec Pflicht, laut API aber Draft-fähig leer

- **Warum später teuer:** Das Zeilenmodell sagt: "Kein Segment ohne `text`"; `05-typendefinitionen.md` modelliert `text: string` ohne Optionalität. Die aktuelle API erlaubt aber beim Segment-POST nur `rolle` als Pflichtfeld (`MISSING_FIELDS` nur bei fehlender/ungültiger Rolle), `AddDialogSegmentInput.text` ist optional und `addDialogSegment` schreibt `text: input.text ?? ''`. Der Edit-PATCH erlaubt ebenfalls leeren Text. Der #216-Plan wiederholt den bestehenden Fehlervertrag und spezifiziert nicht, ob leere Sprechertexte ein erlaubter Draft-Zustand sind.
- **Wann es beißt:** Direkt nach "Dialog hinzufügen" → "Erstes Segment anlegen": Autor:innen können ein Segment ohne Sprechertext speichern. Audio-Audit, Viewer, spätere Dialog-Hotspots und Validierung behandeln das Segment dann als strukturell gültig, obwohl die Spec sagt, dass Text + Audio die Einheit bilden.
- **Billige Gegenmaßnahme jetzt:** Einen Vertrag festlegen: Entweder leere `text`-Werte sind ein erlaubter Studio-Draft und die Spec wird entsprechend ergänzt, oder #216/#199 müssen `text.trim().length > 0` in Form, Route und Domain erzwingen. Wenn Draft erlaubt bleibt, sollte die UI den Zustand sichtbar als "Text fehlt" markieren statt ihn wie ein fertiges Segment zu behandeln.

### Audio-Status-Fehler werden anders behandelt als der Plan verspricht

- **Warum später teuer:** Der Plan sagt "UI zeigt durchgängig `json.message`" und listet für `GET /api/mpz/dialog-audio/status` einen Fehlervertrag. `StationDialogPanel.loadAudioStatus` ignoriert aber jede non-OK-Response still und setzt keinen Alert; bei Exceptions wird nur `audioStatus=null` gesetzt. Zusätzlich sagt der Plan, Status liefere `VALIDATION` bei `MpzContentIoError`, die Route catcht dort aber `MpzUploadError` aus `auditDialogAudioForSlug`; unbekannte IO-/Content-Lesefehler fallen als `INTERNAL_ERROR`.
- **Wann es beißt:** Bei Slug-/Content-Problemen oder kaputtem Audio-Audit im S15-Screenshot: Die Segmenttabelle rendert ohne Statusdaten, Audio-Buttons koennen mangels `audit` nicht aufgeklappt werden, aber die UI erklaert nicht warum. Ein Tester debuggt dann Layout oder Badge-Komponenten, obwohl der Status-Endpunkt einen konkreten `{ error, message }`-Fehler geliefert hat.
- **Billige Gegenmaßnahme jetzt:** Im Plan entscheiden, ob Audio-Status bewusst "best effort" und silent ist. Wenn nein: `loadAudioStatus` muss `json.message ?? json.error` in `setError` mappen. Außerdem die Fehlercode-Tabelle korrigieren: Status-Validation kommt aus `MpzUploadError('VALIDATION')`, nicht aus `MpzContentIoError`.

### Dialog löschen lässt WAV-Dateien als unsichtbare Orphans zurück

- **Warum später teuer:** Die Spec zum Zeilenmodell sagt bei "Dialog entfernen": WAV-Dateien separat prüfen/hinweisen. Der aktuelle `removeDialog` löscht nur den `dialog`-Block aus `stations.json`; `content/dialog-audio/{slug}/` bleibt erhalten. Danach liefert `auditDialogAudioForSlug` für diese Station `{ segments: [], orphans: [] }`, weil ohne Dialog keine erwarteten Clips und keine Orphan-Liste berechnet werden. Der Plan beschreibt den Confirm als Löschung von Segmenten, Gruppen und Bubble, legt aber keinen Vertrag für WAV-Dateien fest.
- **Wann es beißt:** Nach #216 kann ein Autor einen Dialog entfernen und später wieder anlegen. Alte WAVs liegen weiter auf Disk, sind im Dialog-Tab ohne Segmente aber nicht sichtbar und koennen bei erneutem Segmentaufbau als Kollisionen/Drift oder als manuelle Altlast auftauchen. Der Plan bleibt "keine API-Änderung", aber die UI-Microcopy darf nicht suggerieren, dass Audio bereinigt wurde.
- **Billige Gegenmaßnahme jetzt:** Im Plan und Confirm explizit machen: Dialog entfernen löscht nur JSON, WAV-Dateien bleiben erhalten und müssen separat bereinigt werden. Wenn #216 das nicht akzeptieren will, braucht es eine Folgeentscheidung/API für Audio-Cleanup; das wäre nicht mehr rein visuell.
