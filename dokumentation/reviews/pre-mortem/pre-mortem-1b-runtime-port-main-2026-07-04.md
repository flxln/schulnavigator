---
tags:
  - pre-mortem
  - 01b-logik-spec
  - runtime-port
erstellt: 2026-07-04
plan: .cursor/plans/runtime-port_nach_main_842d355c.plan.md
gegenstück: "[[pre-mortem-1a-runtime-port-main-2026-07-04]]"
---

# Pre-Mortem 1b — Runtime-Port nach main (Logik, Spec, API-Vertrag)

**Geprüft:** Plan `runtime-port_nach_main_842d355c` gegen `origin/main`, `feature/mpz-studio`, `kunde/39-gs`. Code-Belege via `git show`/`git diff`. Das [[pre-mortem-1a-runtime-port-main-2026-07-04|1a-Pre-Mortem]] deckt Implementierungs-Blocker ab — dieser Fundus hier behandelt nur Logik, Spec-Konsistenz und API-Verträge.

**Gesamturteil:** Die drei scharfen Funde betreffen alle den Media-Block 3 (S1-Fix) oder die Dokumentations-Konsistenz. Keiner verhindert den Port, aber Fund 1 beißt sich bei jedem Video-Seek, Fund 2 erzeugt eine dauerhafte Doku-Lücke, Fund 3 wird bei der nächsten Komponenten-Integration teuer.

---

## Funde

### [S1-Cache-Control] — Plan überschärft die Audit-Vorgabe; `no-store` bricht Video-Seeking

- **Was widersprüchlich ist:** Drei Wahrheiten im Raum:
  - **Audit S1** (referenzierte Spec, `audit-phase-5-2026-07-04.md`): *„`Cache-Control` auf `private` stellen"* — nur das Wort `private`, kein `no-store`.
  - **Plan** (Block 3): *„`Cache-Control: public, max-age=3600` → `private, no-store` (wie Dialog-Route)"* — Verschärfung zu `no-store`.
  - **Dialog-Route** (das Vorbild, `app/app/api/dialog/[slug]/[clip]/route.ts:49`): `private, no-store` — aber für kleine WAV-Clips (ein paar hundert KB, kein Seeking).

  Die Media-Route streamt MP4s mit Range-Requests (`route.ts:44–72`, `Accept-Ranges: bytes`, 206-Partial-Content). `no-store` instruiert den Browser, **jeden Seek neu vom Server zu holen** — bei einem 50-MB-Video und typischer Scrub-Nutzung werden dutzende Full-Range-Requests statt eines einzigen mit lokalem Partial-Cache.

- **Warum später teuer:** Die Verschärfung ist für den Schulfestbetrieb ein Performance- und Datenvolumen-Problem (mobile Netzwerke, mehrere Tablets gleichzeitig). Sie ist außerdem **semantisch falsch**: `private` reicht bereits aus, um Shared Proxies/CDNs auszuschließen (das eigentliche S1-Risiko), während der Browser-Cache das persönliche Gerät ist, auf dem das Zugangstoken ohnehin liegt.

- **Wann es beißt:** Erste Schulfest-Generalprobe mit mehreren Tablets, die Videos scrubben — oder wenn ein Entwickler später das Caching „optimieren" will und nicht mehr weiß, ob `no-store` bewusst oder versehentlich reinkam.

- **Billige Gegenmaßnahme jetzt:** Block 3 im Plan ändern auf `Cache-Control: private, max-age=3600` (wie von 1a empfohlen). Damit erfüllt man die Audit-Vorgabe („private") ohne die Range-Performance zu opfern. Die Änderung ist ein Wort im Plan, das einen Folgeticket spart.

### [ADR-026 fehlt in Block 7] — Code-Port ohne dazugehörige Architektur-Entscheidung

- **Was widersprüchlich ist:** Block 1 portiert `DialogSegment.quelle` als optionales Feld (`types.ts:32`: *„Fehlt → Text-only-Segment ohne Audio (ADR-026)"*) von `feature/mpz-studio`. Aber ADR-026 (`026-dialog-text-only-segmente.md`) existiert:
  - **nicht** auf `origin/main` (nur bis ADR-025)
  - **nicht** auf `feature/mpz-studio` (Quelle von Block 1)
  - **nur** auf `kunde/39-gs`

  Block 7 des Plans listet in der Doku-Tabelle explizit nur **ADR-027** (von kunde), nicht aber ADR-026. Die `entscheidungen.md`-Aktualisierung erwähnt nur *„Zeile ADR-027"*. Nach dem Merge steht auf `main`: optionales `quelle` im Typsystem + `segmentHasAudio`-Diskriminierung, aber **kein ADR**, das erklärt, warum das so ist.

- **Warum später teuer:** ADR-026 ist nicht nur Doku — es enthält die **build-Gate-Regel** (Punkt 5: *„Fehlende WAV bei gesetzter `quelle` bleibt Deploy-Error"*). Die Structure-Validatoren in Block 4 (die ebenfalls portiert werden) setzen diese Regel voraus. Ohne ADR auf `main` ist die Verbindung zwischen Code-Verhalten (`quelle?: string`), Validator-Logik und Architekturentscheidung gerissen. Beim nächsten Refactor des Dialog-Systems fehlt die Begründung.

- **Wann es beißt:** Sobald jemand `quelle` wieder zu Pflicht machen will (z. B. für ein neues Audio-Feature) oder den Structure-Validator anpasst — es gibt dann keine ADR-Referenz mehr, die warnt, dass Text-only-Segmente ein bewusstes Feature sind.

- **Billige Gegenmaßnahme jetzt:** Block-7-Tabelle um ADR-026 ergänzen (Quelle: `kunde/39-gs`, Pfad `dokumentation/adr/026-dialog-text-only-segmente.md`). Zusätzlich `entscheidungen.md`-Update auf *„Zeilen ADR-026 und ADR-027"* erweitern. Kostet einen Eintrag in der Plan-Tabelle.

### [403 vs. 307] — Media-Route und Middleware haben unterschiedlichen Zugangsvertrag, nicht dokumentiert

- **Was undefiniert ist:** Der Plan portiert das Dialog-Route-Muster (`403` ohne Body) auf die Media-Route. Gleichzeitig portiert Block 6 die Middleware, die bei fehlendem Cookie einen **`307` Redirect nach `/eintritt?reason=...`** macht. Zwei Zugangskontrollen, zwei Verträge:

  | Route | Gated, kein Cookie | Response |
  |-------|-------------------|----------|
  | HTML-Routen (Middleware) | `307 → /eintritt` | Redirect, HTML-Body |
  | `/media/*` (geplant) | `403` | leerer Body |

  Dass das **bewusst** unterschiedlich ist (Browser können mit 307 auf `<video>`/`<img>`-Tags nichts anfangen — sie folgen dem Redirect und bekommen HTML statt Binärdaten), steht nirgendwo. Weder im Plan, noch in ADR-010 (Dialog-Gate), noch in der Audit-Empfehlung S1 (die *„403/Redirect"* schreibt — also beide Optionen lässt).

- **Warum später teuer:** Bei der nächsten Komponenten-Integration (z. B. ein neues `<audio>`-Element, das `fetch('/media/...')` nutzt, statt `src=`) wird ein Entwickler das 307-Middleware-Muster kopieren — und sich wundern, warum der Fetch HTML zurückgibt statt 403. Oder er versucht, die Media-Route ins Middleware-Matcher-Array aufzunehmen, was die Range-Requests bricht.

- **Wann es beißt:** Nächste Komponente, die `/media/*`-Ressourcen lädt und die Fehlerbehandlung vereinheitlichen will. Auch relevant für den geplanten Directus-Umstieg (ADR-003), bei dem die Zugangslogik zentralisiert wird.

- **Billige Gegenmaßnahme jetzt:** Einen Kommentar in der Media-Route ergänzen: *„Absichtlich 403 ohne Redirect — `<video>`/`<img>`-Elemente können 307 nicht folgen (HTML statt Binär). Entspricht Dialog-Route-Muster (ADR-010)."* und in ADR-010 oder ADR-027 einen Satz aufnehmen: *„Media- und Audio-Routen schlagen bei fehlendem Cookie mit 403 fehl, nicht mit 307 — damit HTML-Redirects nicht Binär-Streams verunreinigen."* Kostet 2 Zeilen Code + 1 Satz Doku.

---

## Kleinere Beobachtungen (unter der Schwelle für „scharfe Funde")

### [Leeres `text` bei Text-only] — Validator erlaubt leeren String

`validateDialogSegment` (`validate-stations.ts:642`) prüft nur `typeof raw.text === 'string'` — nicht `.length > 0`. Ein Segment ohne `quelle` **und** ohne `text`-Inhalt passiert den Validator und rendert eine leere Sprechblase. Das ist keine Blockade (Content-Review-Thema), aber der Plan sollte die Akzeptanzkriterien-Hinweise aus 1a (F4) ernst nehmen: Wenn Text-only-Segmente produktiv gehen, sollte der Validator `text.length > 0` fordern, wenn `quelle` fehlt.

### [Error-Format leerer Body] — Abweichung von `.cursor/rules/error-conventions.mdc`

Sowohl die Dialog-Route als auch die geplante Media-Route liefern bei 403 `new Response(null, { status: 403 })` — einen **leeren Body**. Die projektspezifische Konvention (`error-conventions.mdc`) fordert JSON-Antworten mit `error: 'SCREAMING_SNAKE_CASE'`. Für binäre Routes (Video/Audio) ist der leere Body korrekt (Client-Elemente erwarten keine JSON-Fehler), aber dieser bewusste Ausnahmefall ist nicht dokumentiert. Bei der nächsten JSON-API-Route, die das Media-Muster kopiert, entsteht eine lückenhafte Fehler-API.

### [DEV_UNLOCK_ALL-Verhalten] — Middleware-Test semantisch geändert

Der Test *„DEV_UNLOCK_ALL: Post-Fest-Entry-Cookie ist bereits heft — kein Upgrade"* (diff feature→main) ändert das getestete Verhalten von *„hebt fest auf heft"* zu *„heft bleibt heft"*. Das ist mit dem Post-Fest-Umstellungs-Scope (F2 in 1a) konsistent, aber der Plan erwähnt diese Test-Semantik-Änderung nicht explizit — sie „fährt im Kofferraum" des Middleware-Ports mit.

---

## Bestätigung: Positivbefund Fehler-Mapping

Die Domain-Fehlercodes der MPZ-Komponenten (`MpzStationHotspotsError.code`, etc.) sind durchgängig `SCREAMING_SNAKE_CASE` und werden unverändert durchgereicht. Die Transport-Fehler der bestehenden JSON-APIs (`/api/mpz/*`) folgen der `.cursor/rules/error-conventions.mdc`. Der Plan fügt keine neue Fehler-Art hinzu, die diese Konvention brechen würde.

---

## Empfohlene Plan-Änderungen (1b-Scope)

1. **Block 3:** `Cache-Control: private, max-age=3600` statt `no-store` (S1-Cache-Control).
2. **Block 7:** ADR-026 in die Doku-Tabelle aufnehmen; `entscheidungen.md` um ADR-026-Zeile erweitern (ADR-026 fehlt).
3. **Block 3 + ADR-010/027:** Kommentar in Media-Route + Doku-Satz: 403 bewusst statt 307 Redirect (403 vs. 307).
4. **Optional:** Validator-Verschärfung `text.length > 0` bei fehlendem `quelle` (leeres text).