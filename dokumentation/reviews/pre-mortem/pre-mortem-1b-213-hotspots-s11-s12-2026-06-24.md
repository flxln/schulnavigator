---
tags:
  - prompt
  - sparring
  - pre-mortem
  - 01b-logik-spec
erstellt: 2026-06-24
---
# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag: #213 Hotspots S11/S12

**Geprüfte Dokumente:**
- Plan: `.cursor/plans/#213_hotspots_s11_s12_3d33134e.plan.md`
- Spec: `dokumentation/planung/epic-mpz-studio-v3-visual-polish.md`, `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/02-screens-v2.1-und-user-stories.md`, `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/mockups/SCREEN-MATRIX.md`
- Code: `app/components/mpz-studio/station-hotspots-table.tsx`, `station-hotspot-add-form.tsx`, `station-hotspot-edit-form.tsx`, `hotspot-icon-upload.tsx`, `station-dialog-panel.tsx`
- Lib/API: `app/lib/mpz-studio-calib.ts`, `app/lib/mpz-station-hotspots.ts`, `app/lib/mpz-station-dialog.ts`, `app/app/api/mpz/stations/[slug]/hotspots/route.ts`, `app/app/api/mpz/stations/[slug]/hotspots/[hotspotId]/route.ts`, `app/app/api/mpz/hotspots/icon/route.ts`, `app/app/api/mpz/stations/[slug]/dialog/route.ts`, `app/app/mpz/calib/sphere/[slug]/page.tsx`

Positiv: Der zentrale Hotspot-API-Vertrag ist im Plan weitgehend konsistent mit dem Code: Fehler kommen als `{ error, message }`, `POST` mappt Domain-Clientfehler auf 400, `NOT_FOUND` auf 404 und `VALIDATION` auf 422; `PATCH/DELETE` ergänzen `NOT_EDITABLE` mit 403. Auch die Diskriminierung `viewer: flat/equirectangular` und `action: medium/dialog` ist in `mpz-station-hotspots.ts` vorhanden und erzwingt falsche Koordinatenfelder bzw. verbotene Typfelder.

### S14-Status hat drei Wahrheiten

- **Warum später teuer:** Der #213-Plan behandelt `/mpz/calib/sphere/{slug}` als bestehendes Link-Ziel, wenn `panorama360` vorhanden ist. Die Screen-Spec `02-screens` sagt aber weiterhin: S14 ist "geplant" und die Route sei "noch nicht implementiert". Der aktuelle Code hat die Route und rendert `SphereCalibShell`. Damit ist unklar, ob #213 nur Links restylt oder ob S14 weiterhin als nicht abnahmefaehig gilt.
- **Wann es beißt:** Bei Screenshot- und Flow-Abnahme fuer `daz?tab=hotspots`: Der Hotspots-Tab kann korrekt auf "Sphere kalibrieren" verlinken, waehrend die Referenzdoku den Zielscreen noch als Folge-Issue #217 ausweist. Ein Tester kann entweder einen nicht vorhandenen Screen erwarten oder #213 faelschlich fuer S14-Layoutprobleme verantwortlich machen.
- **Billige Gegenmaßnahme jetzt:** Im Plan eine kurze Verifikation ergaenzen: "S14-Route existiert als funktionaler Zielscreen; #213 aendert nur Linklabel/-Styling, nicht das S14-Layout." Danach `02-screens` oder zumindest die #213-Planannahme aktualisieren, damit #217 klar nur visuelles Layout/Polish an S14 ist.

### Dialog-Hotspot setzt Dialog-Block voraus, S15-Anlage ist aber bewusst out of scope

- **Warum später teuer:** S12 verlangt zwei Typ-Karten `medium/dialog`. Der bestehende Add-Form-Code zeigt `dialog` aber nur, wenn `station.dialog.figuren` existiert; ohne Dialog-Block geht das Formular in einen Blocked-State. Gleichzeitig sagt die S15-Spec, der Dialog-Tab sei bei allen Stationen sichtbar und koenne einen `dialog`-Block anlegen. #213 schliesst S15 jedoch aus. Der Uebergang "Dialog-Hotspot anlegen, wenn noch kein Dialog-Block existiert" ist damit nicht als #213- oder #216-Vertrag festgelegt.
- **Wann es beißt:** Bei Stationen ohne Dialog, aber mit Medien, kann die neue 2-Karten-UI nur die Medium-Karte zeigen oder eine deaktivierte Dialog-Karte brauchen. Wenn spaeter #216 den Dialog-Block anlegt, muss #213 wissen, ob die Dialog-Karte automatisch sichtbar wird, ob sie deaktiviert mit CTA bleibt, oder ob der Hotspot-Tab weiterhin nur auf den Dialog-Tab verweist.
- **Billige Gegenmaßnahme jetzt:** Den Plan explizit haerten: Dialog-Karte nur aktiv, wenn `station.dialog?.figuren.length > 0`; sonst entweder gar nicht rendern oder deaktiviert mit CTA "Dialog zuerst anlegen". Keine automatische `POST /api/mpz/stations/[slug]/dialog`-Ausloesung im Hotspot-Tab, weil S15/#216 out of scope bleibt.

### Screenshot-Slug-Vertrag ist nicht aus Plan/Spec abgesichert

- **Warum später teuer:** Der Plan fordert manuelle Screenshots fuer `kunst` (flat empty), `klassenzimmer` (list) und `daz` (dialog-hotspot). Diese Rollen haengen an aktuellen Content-Daten, nicht an einem dokumentierten Fixture-Vertrag. Die Spec nennt S11-Zustaende, aber keine verbindlichen Slugs; die Daten koennen sich durch vorherige MPZ-Authoring-Arbeit aendern, ohne dass #213-Code falsch ist.
- **Wann es beißt:** Direkt bei der visuellen Abnahme und spaeter bei E2/#217: Wenn `klassenzimmer` inzwischen leer ist oder `daz` keinen Dialog-Hotspot mehr hat, wirken S11-list oder S11-dialog fehlerhaft. Der Implementierer wuerde dann UI-Code debuggen, obwohl nur die Abnahme-Daten vom Plan abgewichen sind.
- **Billige Gegenmaßnahme jetzt:** Im Plan vor den Screenshots einen Content-Preflight aufnehmen: pro Slug `viewer`, `hotspots/hotspots360.length` und mindestens ein `action: "dialog"` fuer den Dialog-Fall pruefen. Wenn die Daten nicht passen, entweder temporäre Testdaten/Fixture benennen oder die Screenshot-Slugs vor Umsetzung aktualisieren.

### Positiver Vertragsbefund: Fehlerformat ist einheitlich genug fuer #213

Der Plan sagt "UI zeigt `json.message` aus bestehenden Responses"; die geprueften Routen liefern fuer relevante Fehler durchgaengig `message` plus `error`. Beim Icon-Upload sind `INVALID_FORM`, `MISSING_FILE`, `MISSING_FIELDS`, `VALIDATION`, `COLLISION`, `IO` und `INTERNAL_ERROR` ebenfalls als `{ error, message }` umgesetzt. Fuer #213 muss daher kein neues Frontend-Fehlerformat eingefuehrt werden.
