---
tags:
  - prompt
  - sparring
  - pre-mortem
  - 01b-logik-spec
erstellt: 2026-06-23
---
# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag: #211 Stammdaten S7

**Geprüfte Dokumente:**
- Plan: `.cursor/plans/#211_stammdaten_s7_3da62894.plan.md`
- Spec: `dokumentation/planung/epic-mpz-studio-v3-visual-polish.md` (Epic #205), `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/02-screens-v2.1-und-user-stories.md`, `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/mockups/SCREEN-MATRIX.md`
- Mockups: `s7_stammdaten_flat/code.html`, `s7_stammdaten_equirectangular/code.html`
- Code: `app/components/mpz-studio/station-stammdaten-form.tsx`, `app/components/mpz-studio/station-raumbild-upload.tsx`, `app/components/mpz-studio/station-detail-shell.tsx`, `app/components/mpz-studio/mpz-form-alert.tsx`, `app/components/mpz-studio/mpz-card.tsx`
- Lib/API: `app/app/api/mpz/stations/[slug]/stammdaten/route.ts`, `app/app/api/mpz/stations/[slug]/raumbild/route.ts`, `app/lib/mpz-station-stammdaten.ts`, `app/lib/mpz-station-raumbild-ingest.ts`, `app/lib/mpz-viewer-warnings.ts`, `app/lib/validate-stations.ts`, `app/lib/types.ts`
- Vorgänger: #206 ✅, #210 als Blocker geplant
- Gegenstück: [pre-mortem-1a-211-2026-06-23.md](./pre-mortem-1a-211-2026-06-23.md) (Implementierungs-Blocker)

---

Positiv: Der Plan hält die wichtigste Epic-Leitplanke für #211 ein: Die bestehenden PATCH-/POST-Routen haben bereits konkrete JSON-Fehlerformate mit `{ error, message }`, und die geplanten S7-Änderungen lassen diese Routen grundsätzlich unverändert. Die Domain-Konstanten für Raumbild-Uploads sind im Code eindeutig (`FLAT_MAX_BYTES`, `PANO360_MAX_BYTES`, `FLAT_UPLOAD_RATIO_MIN`, `PANO360_RATIO`) und passen zur Planentscheidung, keine Mockup-Fabelwerte zu übernehmen.

### Ungültiger `viewer` hat im API-Vertrag zwei Wahrheiten

- **Warum spaeter teuer:** Der Plan dokumentiert fuer PATCH `/api/mpz/stations/[slug]/stammdaten` bei ungueltigem `viewer` den Fehler `INVALID_VIEWER` mit HTTP 422 aus der Domain. Die Route laesst ungueltige Viewer-Werte aber gar nicht bis zur Domain durch: `parsePatch()` gibt bei einem Wert ausser `flat` oder `equirectangular` `null` zurueck, und die Route antwortet mit `{ error: 'INVALID_BODY' }` und HTTP 400. `INVALID_VIEWER` ist damit fuer externe API-Clients ueber diese Route praktisch nicht erreichbar.
- **Wann es beisst:** Sobald ein Client, Test oder spaeteres UI-Feature auf den dokumentierten `INVALID_VIEWER`-Code prueft. Besonders riskant ist das S7-Viewer-Select, weil die Mockups andere sichtbare Optionen zeigen (`panorama360`, `Video 360°`) als der echte `ViewerMode`-Typ. Wenn jemand die Mockup-Optionen direkt als Werte uebernimmt, bekommt er laut Plan `INVALID_VIEWER`, laut API aber `INVALID_BODY`.
- **Billige Gegenmassnahme jetzt:** Den Planvertrag korrigieren: Ungueltige `viewer`-Werte im HTTP-Body sind `INVALID_BODY`/400; `INVALID_VIEWER` bleibt ein Domain-Code fuer direkte Domain-Aufrufe oder zukuenftige Route-Parser, die ungueltige Werte bewusst weiterreichen. Zusaetzlich im Plan festhalten, dass Mockup-Labels nur Labels sind und auf die zwei echten Enum-Werte `flat` und `equirectangular` mappen.

### `panorama360`-Sichtbarkeit ist UI-Regel, aber kein Datenvertrag

- **Warum spaeter teuer:** Plan und Spec sagen: `panorama360`-Upload nur wenn `viewer === 'equirectangular'`. Der Plan entscheidet aber zugleich, dass dies nur eine UI-Verzweigung ist und die Upload-API unveraendert bleibt. Der Code bestaetigt: POST `/raumbild` akzeptiert `variant=pano360` unabhaengig vom gespeicherten `station.viewer`; `ingestStationRaumbild()` schreibt dann `station.panorama360`. Der Validator erzwingt `panorama360` zwar bei `equirectangular`, verbietet `panorama360` bei `flat` aber nicht. Damit kann eine Flat-Station per API oder per unsaved UI-State ein verstecktes `panorama360` bekommen.
- **Wann es beisst:** Im S7-Flow selbst: Wenn ein Autor im Formular von `flat` auf `equirectangular` umschaltet, erscheint laut Plan sofort die 360-Zone, obwohl der gespeicherte Viewer noch `flat` ist. Ein Upload schreibt dann bereits `panorama360`, bevor der Viewer-PATCH erfolgreich war. Umgekehrt kann beim Zurueckwechsel auf `flat` ein vorhandenes `panorama360` im JSON bleiben, obwohl die UI-Zone ausgeblendet ist. Folge-Issues wie #217 Sphere-Kalibrierung oder Asset-Aufraeumung muessen dann entscheiden, ob dieses versteckte Asset absichtlich, verwaist oder invalid ist.
- **Billige Gegenmassnahme jetzt:** Einen expliziten Vertrag notieren: Entweder `panorama360` ist ein erlaubtes optionales Asset auch fuer Flat-Stationen und die S7-Sichtbarkeit ist nur Authoring-UX; oder die Domain/API muss `variant=pano360` fuer gespeicherte Flat-Stationen ablehnen bzw. beim Wechsel zu `flat` `panorama360` entfernen. Ohne diese Entscheidung sollte der Plan nicht behaupten, `panorama360` sei fachlich nur bei `equirectangular` vorhanden.

### #210-Blocker-Annahme ist im Code nicht verifiziert

- **Warum spaeter teuer:** Der Plan markiert #210 als Blocker und sagt in den Annahmen, #210 sei auf dem Branch bereits umgesetzt. Der aktuelle Code widerspricht dem: `station-detail-shell.tsx` hat noch `max-w-4xl`, den Zurueck-Link, `h2`, lokale `healthDotClass()` mit `bg-brand-*` und boxed Tabs. Auch `.cursor/plans/#210_detail-header_1c8b4463.plan.md` zeigt die Todos noch als `pending`. #211 will aber den S7-Screenshot nur fuer Formularkarte und Upload-Zonen abgleichen und Header/Tabs aus #210 nicht erneut bewerten.
- **Wann es beisst:** Direkt bei der S7-Abnahme: Der Screenshot kann trotz korrektem Stammdaten-Formular deutlich vom S7-Mockup abweichen, weil Header und Tabs noch im alten Zustand sind. Zudem beruehrt #211 erneut `station-detail-shell.tsx` fuer den Stammdaten-Tab-Wrapper; wenn #210 parallel oder spaeter umgesetzt wird, konkurrieren beide Plaene um dieselbe Shell-Struktur.
- **Billige Gegenmassnahme jetzt:** Den Planstatus schaerfen: Entweder #211 bleibt wirklich blockiert, bis #210 implementiert und gemerged ist, oder #211 enthaelt eine explizite Rebase-/Scope-Regel fuer die Shell-Datei. Der Screenshot-Abgleich sollte dann absolut formuliert werden: S7-Abgleich nur nach #210, oder vor #210 ausschliesslich Formularinhalt ohne Header/Tabs bewerten.

### Mockup-Viewer-Optionen und `ViewerMode`-Typ driften semantisch

- **Warum spaeter teuer:** Die Spec nennt fuer S7 `viewer` als Select `flat / equirectangular`, und der Code-Typ `ViewerMode` erlaubt exakt diese zwei Werte. Die Mockups zeigen aber abweichende sichtbare Optionen: im Flat-Mockup `flat` und `panorama360`, im Equirectangular-Mockup `360° (Equirectangular)`, `Flachbild (2D)` und `Video 360°`. Der Plan sagt zwar "Viewer-Optionen ausser `flat`/`equirectangular` nicht umsetzen", definiert aber keinen Label-zu-Wert-Vertrag fuer das Select.
- **Wann es beisst:** Bei visueller S7-Nacharbeit oder einer spaeteren Erweiterung Richtung Video-360: Ein Implementierer koennte `panorama360` als dritten Modus oder als Ersatzwert fuer `equirectangular` verstehen. Das kollidiert mit `ViewerMode`, `parsePatch()`, `validateStationsFile()` und allen Hotspot-/Kalibrierungs-Verzweigungen, die nur zwei Viewer-Modi kennen.
- **Billige Gegenmassnahme jetzt:** Im Plan festlegen: Das Select hat genau zwei technische Werte, `flat` und `equirectangular`; sichtbare Labels duerfen menschenlesbar sein (`Flat`, `360°`) und Mockup-Optionen wie `panorama360`/`Video 360°` sind keine neuen Domain-Werte. Ein dritter Viewer-Modus braucht ein eigenes ADR/API-Issue.
