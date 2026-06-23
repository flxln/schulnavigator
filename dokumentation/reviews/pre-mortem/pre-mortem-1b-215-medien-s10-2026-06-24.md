---
tags:
  - prompt
  - sparring
  - pre-mortem
  - 01b-logik-spec
erstellt: 2026-06-24
---
# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag: #215 Medien S10

**Geprüfte Dokumente:**
- Plan: `.cursor/plans/#215_medien_s10_f0de95f7.plan.md`
- Spec: `dokumentation/planung/epic-mpz-studio-v3-visual-polish.md`, `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/02-screens-v2.1-und-user-stories.md`, `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/05-typendefinitionen.md`, `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/mockups/SCREEN-MATRIX.md`
- Code: `app/components/mpz-studio/station-medien-table.tsx`, `station-medium-edit-form.tsx`, `medium-asset-upload-field.tsx`, `media-ingest-form.tsx`
- Lib/API: `app/lib/mpz-station-medien.ts`, `app/lib/mpz-medium-replace.ts`, `app/lib/mpz-medium-asset-upload.ts`, `app/lib/mpz-upload-rules.ts`, `app/lib/validate-stations.ts`, `app/app/api/mpz/stations/[slug]/medien/[mediumId]/route.ts`, `file/route.ts`, `thumbnail/route.ts`, `poster/route.ts`

Positiv: Der Fehlervertrag fuer die drei relevanten Schreibpfade ist einheitlich genug fuer #215. PATCH, Datei-Ersetzen und Thumbnail/Poster-Upload liefern bei Domain-, Upload- und Content-IO-Fehlern jeweils `{ error, message }`; der MPZ-Guard liefert nur `{ error: 'UNAUTHORIZED' }`, was die bestehende Edit-Form mit `json.message ?? json.error ?? Fehler(status)` bereits abdeckt.

### Text-Thumbnails haben drei Wahrheiten

- **Warum später teuer:** Der #215-Plan listet `text` in `PATCH_KEYS_BY_TYP` mit `thumbnail` und rendert wegen `quelleReadOnly` auch fuer Textmedien `MediumAssetUploadField`. Die Typenspec `05-typendefinitionen.md` sagt dagegen: `text` hat optional nur `untertitel`. Der Validator `validate-stations.ts` akzeptiert `thumbnail` aktuell fuer jeden Medium-Typ. Damit ist unklar, ob Text-Thumbnails ein bewusstes neues Datenmodell sind oder ein Nebeneffekt der breiten UI-/Validator-Regel.
- **Wann es beißt:** Bei #215 selbst im Text-Medium-Edit-Screen und spaeter bei Viewer/Hotspot-Darstellung: Ein Textmedium kann ein Thumbnail bekommen, obwohl die Referenzdoku sagt, dass dieses Feld fuer `text` nicht existiert. Folge-Issues koennen entweder eine Thumbnail-Vorschau erwarten oder das Feld beim Aufraeumen wieder entfernen.
- **Billige Gegenmaßnahme jetzt:** Im Plan eine verbindliche Entscheidung ergaenzen: Entweder `text.thumbnail` als erlaubtes v2.1-Feld dokumentieren und `05-typendefinitionen.md` aktualisieren, oder Text in UI und Domain aus Thumbnail-PATCH/Asset-Upload ausschliessen. Ohne diese Entscheidung sollte #215 keine neuen Text-Thumbnails erzeugen.

### YouTube → Upload erzeugt einen semantischen Zwischenzustand

- **Warum später teuer:** Der Plan uebernimmt den bestehenden Flow: Bei persistiertem YouTube-Video und Dropdown `videoSource=upload` soll erst gespeichert werden, danach wird Datei-Ersetzen erlaubt. Der PATCH-Vertrag erlaubt fuer `video` aber nur `videoSource`, nicht `quelle`; `normalizeMediumPatch` validiert nicht, dass `videoSource='upload'` auch eine lokale Upload-Quelle hat. `validate-stations.ts` prueft ebenfalls nur, ob `videoSource` `upload` oder `youtube` ist. Nach dem ersten Speichern kann also `videoSource='upload'` mit einer YouTube-URL in `quelle` persistiert sein.
- **Wann es beißt:** Direkt im Zwei-Schritt-Flow von S10: Zwischen "Speichern" und "Datei ersetzen" steht ein formal gueltiger, aber fachlich widerspruechlicher Medienzustand in `stations.json`. Wenn der Nutzer den Flow abbricht, der Dev-Server refreshed oder ein Viewer/Export auf diesen Zustand trifft, ist nicht klar, ob die Quelle als lokale Datei oder YouTube behandelt werden muss.
- **Billige Gegenmaßnahme jetzt:** Den Plan haerten: Entweder `videoSource`-Wechsel von `youtube` zu `upload` im Metadaten-PATCH sperren und nur zusammen mit erfolgreichem Datei-Replace erlauben, oder den Zwischenzustand explizit als erlaubt dokumentieren und Viewer/Validator darauf ausrichten. Pragmativer fuer #215: Dropdown fuer persistierte YouTube-Videos nicht als speicherbare Aenderung anbieten, sondern nur den bestehenden Hinweis anzeigen.

### Replace-Erfolg: Plan widerspricht sich beim Schließen des Panels

- **Warum später teuer:** Im Datenfluss sagt der Plan fuer PATCH: `onSuccess(message)` schliesst das Panel im Parent. Fuer Datei-Ersetzen steht aber: "Erfolg: gleicher Nachbearbeitungs-Flow wie PATCH; Panel bleibt offen (bestehendes Verhalten)". Der aktuelle Parent `station-medien-table.tsx` setzt in `onSuccess` immer `setEditingId(null)`, also schliesst auch Replace und Asset-Uploads das Inline-Panel. Das ist kein API-Problem, aber ein UI-Vertrag, den Tests und manuelle Abnahme unterschiedlich interpretieren koennen.
- **Wann es beißt:** Bei S10 replace-file-Abnahme und Tests: Soll nach erfolgreichem Datei-Ersetzen die neue Quelle im gleichen Panel sichtbar bleiben, oder ist die Rueckkehr zur Tabelle korrekt? Ein Implementierer kann den Plan wortgetreu umstellen und damit das bestehende Parent-Verhalten fuer PATCH/Asset-Upload unbeabsichtigt auseinanderziehen.
- **Billige Gegenmaßnahme jetzt:** Im Plan genau einen Vertrag festlegen. Entweder alle erfolgreichen Schreibaktionen im Inline-Edit schliessen das Panel wie heute, oder `onSuccess` bekommt einen Grund/Modus (`metadata`, `replace`, `asset`) und nur bestimmte Aktionen schliessen. Ohne solche API-Aenderung sollte #215 "Panel schliesst nach Erfolg" als Ist-Vertrag akzeptieren.

### Datei-Ersetzen garantiert Medium-ID, aber nicht Pfadstabilität

- **Warum später teuer:** Der Plan betont "Medium-ID bleibt gleich" und lehnt API-Aenderungen ab. `replaceStationMediumFile` erhaelt zwar `medium.id`, kann aber `quelle` aendern: Bei anderer Extension oder geteilter alter Quelle wird ein neuer Pfad erzeugt; nur bei gleicher Extension und nicht geteilter Quelle wird eher in-place ersetzt. Das ist korrekt implementiert, aber im S10-Vertrag nicht sichtbar.
- **Wann es beißt:** Bei Hotspots ist die ID-Stabilitaet ausreichend, weil sie auf `mediumId` referenzieren. Andere Clients, manuelle Screenshots oder Autor:innen koennen aber erwarten, dass "Datei ersetzen" auch die oeffentliche URL stabil haelt. Bei geteilten Quellen oder Extensionwechseln bekommen sie stattdessen eine neue `quelle`.
- **Billige Gegenmaßnahme jetzt:** Im Plan und in der UI-Microcopy ergaenzen: "Medium-ID bleibt gleich; der Dateipfad kann sich je nach Dateityp/Kollision aendern." Tests sollten auf die Response-`quelle` und nicht auf Pfadstabilitaet pruefen.
