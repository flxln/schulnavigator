---
tags:
  - pre-mortem
  - 01b-logik-spec
  - audit-phase-5
erstellt: 2026-07-04
plan: .cursor/plans/audit_phase_5_umsetzung_fe564923.plan.md
gegenstück: "[[pre-mortem-1a-audit-phase-5-umsetzung-2026-07-04]]"
---

# Pre-Mortem 1b — Audit Phase 5 Umsetzung (Logik, Spec, API-Vertrag)

**Geprüft:** Plan `audit_phase_5_umsetzung_fe564923` gegen `main`-Stand (Code, ADRs, `dsgvo.md`, `.cursor/rules/`, `dokumentation/planung/`). Code-Belege via `read_file`/`search_files`/`list_files`. Das [[pre-mortem-1a-audit-phase-5-umsetzung-2026-07-04|1a-Pre-Mortem]] deckt Implementierungs-Blocker ab — dieser Fundus hier behandelt nur Widersprüche zwischen Dokumenten, unvollständige Diskriminierung, API-Verträge, Typsystem und nie verifizierte Annahmen.

**Gesamturteil:** Vier scharfe Funde, alle in der Kategorie „Annahme nie verifiziert" oder „Widerspruch ohne festgelegten Winner". Keiner blockiert den P0-Media-Gate-Port physisch, aber Fund 1 und 2 führen bei der Umsetzung sofort in Sackgassen (referenzierte Dateien/Regeln existieren nicht), Fund 3 erzeugt einen stillen Verhaltensbruch beim Studio-Cookie, Fund 4 lässt den Book-Creator-Status nach der nächsten Änderung wieder inkonsistent werden. Alle vier sind mit je einer Plan-Zeile preiswert zu schließen.

---

## Funde

### [branch-freeze-Regel fehlt] — Plan stützt Pfad-Port-Vorgehen auf nicht existierende `.cursor/rules`-Datei

- **Was widersprüchlich ist:** Plan 0.1 (Zeile 90) begründet das „pfadbasiert, kein Merge"-Vorgehen mit einem Verweis auf `[branch-freeze-kunde.mdc](.cursor/rules/branch-freeze-kunde.mdc)`. Diese Datei existiert auf `main` **nicht** — `.cursor/rules/` enthält nur `build-kontext-submodule.mdc` und `error-conventions.mdc`. Die Regel ist vermutlich historisch auf `kunde/39-gs` entstanden und nie nach `main` portiert worden. Der Plan referenziert eine Konvention, die im Arbeitsbaum, auf dem er liegt, nicht verifizierbar ist.

- **Warum später teuer:** Die Begründung „kein Merge" steht auf tönernen Füßen. Ein Entwickler, der Phase 0.1 oder 1.4 umsetzt, sucht die Regel, findet sie nicht und hat drei Optionen — (a) Merge machen, weil die Begründung nicht auffindbar ist, (b) blind pfadbasiert portieren, ohne die Warum-Frage zu verstehen, (c) abbrechen und nachfragen. Keine ist gut. Zusätzlich enthält die vermisste Regel vermutlich die Begründung, *warum* `kunde/*` nicht nach `main` gemergt werden darf (kunde-spezifische Tokens/Geheimnisse im Code) — ohne diese Begründung ist der nächste Dev im Dunkeln.

- **Wann es beißt:** Phase 0.1 (Media-Gate-Port) — erster Schritt, erste Verwirrung. Oder bei PR-Review, wenn ein Reviewer die „vgl. branch-freeze"-Begründung anfragt und ins Leere läuft.

- **Billige Gegenmaßnahme:** Entweder die Regel von `kunde/39-gs` nach `main` portieren (ein Commit) und den Verweis validieren, oder — falls die Freeze-Konvention woanders lebt (ADR, `CLAUDE.md`, `offen.md`) — den Verweis auf die tatsächliche Fundstelle umleiten. Kostet eine Verifizierung + einen Datei-Port oder eine Link-Korrektur.

### [#232-Doku-Verweis ins Leere] — Phase 1.2 aktualisiert eine Datei, die auf `main` nicht existiert

- **Was widersprüchlich ist:** Plan 1.2 (Zeile 143) fordert: „Status in [08-github-support-ticket-232.md](dokumentation/planung/archiv/) aktualisieren". Die Datei existiert auf `main` **nicht** — `dokumentation/planung/archiv/` enthält nur `issues-phase-0.md` bis `issues-phase-5.md`, `sync-log-2026-06.md` und `epics/`. Die ausführliche #232-Doku liegt laut `search_files` ausschließlich auf `kunde/39-gs` und wurde nie nach `main` überführt. Der Plan erkennt das Muster bei `05-offene-punkte.md` (Zeile 145: „existiert nicht — `offen.md` nutzen"), wendet diese Korrektur aber bei der #232-Datei **nicht** an.

- **Warum später teuer:** Wer Phase 1.2 umsetzt, sucht eine Datei, die nicht da ist. Drei Folgen: (a) Er legt `08-github-support-ticket-232.md` neu an — Duplikat der `kunde/39-gs`-Version, inkonsistent. (b) Er portiert sie von `kunde/39-gs` — aber ohne #232-Git-History-Kontext, weil der Rewrite auf `main` die Pfade bereinigt hat. (c) Er bricht ab und lagert das in `offen.md` aus — aber das steht nicht im Plan. Die Support-Ticket-Nummer `#4510440` und die V9-SHAs sind dann auf `main` nirgends nachvollziehbar.

- **Wann es beißt:** Bei der Umsetzung von Phase 1.2 — unmittelbar, sobald jemand die Datei öffnen will. Oder schlimmer: Das GitHub-Support-Follow-up (Ticket `#4510440`) wird vergessen, weil die Tracking-Datei fehlt.

- **Billige Gegenmaßnahme:** Verweis in Phase 1.2 korrigieren: Entweder `dokumentation/planung/offen.md` um einen #232-Detail-Block erweitern (analog der `05-offene-punkte.md`-Korrektur) oder — falls die `kunde/39-gs`-Version kanonisch sein soll — einen Port-Schritt in Phase 1.4 (Branch-Sync) aufnehmen. Kostet eine Plan-Zeile.

### [Studio-Cookie secure-Flag] — Plan beschreibt `NODE_ENV`-Ausdruck, Code hat hartcodiert `false`

- **Was widersprüchlich ist:** Plan 2.4 (Zeile 211) beschreibt die Änderung als: `[mpz-studio-guard.ts]:76 → secure: process.env.NODE_ENV === 'production'`. Das liest sich wie eine kleine Korrektur eines bestehenden Ausdrucks. Code-Beleg (`mpz-studio-guard.ts` ~Zeile 73–81):

  ```ts
  res.cookies.set(MPZ_STUDIO_COOKIE, secret, {
    httpOnly: true,
    secure: false,          // ⚠ HARTCODIERT
    sameSite: 'lax',
    path: '/',
    maxAge: MPZ_STUDIO_COOKIE_MAX_AGE,
  })
  ```

  `secure: false` ist **hartcodiert**, kein Ausdruck. Der Plan verschweigt, dass das Verhalten sich ändert: Von „Cookie immer über HTTP und HTTPS" zu „Cookie nur über HTTPS in PROD". Das ist ein **Verhaltensbruch**, keine Kosmetik.

- **Warum später teuer:** Falls die Studio-Route über einen HTTP-Hop angesprochen wird (internes Netz, Reverse-Proxy-Terminierung mit HTTP-Backend, Localhost-Dev), wird das Cookie mit `secure: true` nicht gesendet — der Studio-Zugang schweigt still, ohne Fehlermeldung. Der Plan prüft nicht, ob HTTPS End-to-End gilt (Coolify/Traefik-Terminierung mit HTTP zum Container ist ein gängiges Pattern).

- **Wann es beißt:** Beim Deploy auf Prod nach Umsetzung von Phase 2.4 — der Studio-Zugang funktioniert plötzlich nicht mehr, und die Debug-Suche führt über HTTPS/Terminierung, nicht über Code-Logik. Alternativ: Dev-Setup bricht, falls Dev versehentlich mit `NODE_ENV=production` läuft (z. B. Docker-Local) — dann ist das Cookie weg.

- **Billige Gegenmaßnahme:** Plan 2.4 ergänzen um einen Verifikationsschritt: „Prüfen, ob Studio-Route hinter HTTPS-Terminierung liegt (Coolify/Traefik) — falls HTTP-Hop zum Container existiert, `secure: true` bricht das Cookie. Alternativ `secure: process.env.NODE_ENV === 'production'` nur setzen, wenn HTTPS End-to-End sichergestellt." Kostet eine Verifikationszeile.

### [Book Creator Status] — Plan sagt „bereinigen", spezifiziert aber nicht, welche Wahrheit gewinnt

- **Was widersprüchlich ist:** Plan 1.3 (Zeile 154) und 5.1 (Zeile 281–283) behandeln die D6-Inkonsistenz: `dsgvo.md` und `datenschutz.ts` (DSE) widersprechen sich im Book-Creator-Status (DSB-Freigabe ja/nein, Embed erlaubt/gesperrt). Der Plan sagt nur „bereinigen" bzw. „DSB-Freigabe einholen oder Embed auf `typ: link` umstellen" — definiert aber nicht, **welche Datei die kanonische Wahrheit ist** und welche nachgezogen wird. Das ist ein klassischer „Widerspruch zwischen Dokumenten" ohne festgelegten Winner.

- **Warum später teuer:** Wenn die DSB-Freigabe kommt (Plan 5.1, Option 1), müssen zwei Dateien synchron aktualisiert werden — ohne festgelegte Reihenfolge und kanonische Quelle. Wenn die Freigabe ausbleibt und auf `typ: link` umgestellt wird (Option 2), muss die DSE angepasst werden, aber die `dsgvo.md` könnte vergessen werden (oder umgekehrt). Das Resultat: Nach dem nächsten Schuljahr ist der Status wieder inkonsistent, und niemand weiß, welche Datei zählt.

- **Wann es beißt:** Bei der nächsten DSB-Anfrage oder Elternteil-Rückfrage zum Book Creator — oder wenn die Entscheidung (Freigabe vs. Link-Fallback) in Phase 5.1 getroffen wird und die Umsetzung in nur einer der beiden Dateien landet.

- **Billige Gegenmaßnahme:** Plan 1.3 ergänzen: „Kanonische Quelle ist `dsgvo.md` (VVT-relevant); `datenschutz.ts` (DSE) wird nachgezogen." Und: „Entscheidung aus Phase 5.1 (Freigabe oder Link) wird in **beiden** Dateien gleichzeitig aktualisiert — PR muss beide Dateien touchen." Kostet zwei Sätze im Plan.

---

## Kleinere Beobachtungen (unter der Schwelle für „scharfe Funde")

### [ADR-021 Token-Vermerk bereits vorhanden] — Plan 2.4 geht von fehlendem Vermerk aus

Plan 2.4 (Zeile 213) will den Vermerk „Token = Einladungslink, kein Geheimnis" in ADR-021 ergänzen. ADR-021 (`021-zugangsmodus-konfigurierbar.md`) Zeile 15 sagt bereits: *„Für ein weiches Gate (DSGVO: **Einladungslink-Charakter**, ADR-007) ist das tolerierbar"*. Der Vermerk existiert — Plan 2.4 sollte prüfen, ob er ausreicht oder ob die `dsgvo.md` ihn zusätzlich braucht (für DSB-sichtbare Doku). Doppeldokumentation ohne Single-Source-of-Truth.

### [403 ohne Cache-Control] — Prod-Verifikation prüft nur 206-Fall

Die Media-Route liefert bei 403 (`route.ts:25`) `new Response(null, { status: 403 })` — **ohne** `Cache-Control`-Header. Die Prod-Verifikation (Plan 0.1, Schritt 6) prüft nur den 206-Fall auf `Cache-Control: private`, nicht den 403-Fall auf Caching-Ausschluss. Ein Shared Proxy/CDN könnte die 403 cachen und bei einem nachfolgenden Request mit Cookie die gecachte 403 ausliefern. Geringes Risiko (Tokens sind langlebig, Cookie kommt schnell nach Entry-Scan), aber der Verifikationsvertrag ist unvollständig — ein Satz „403-Response darf nicht gecacht werden, ggf. `Cache-Control: no-store` bei 403 ergänzen" würde das schließen.

### [DSB in Personalunion] — Rechtliches Risiko, keine Logik-Lücke

`dsb-contact.ts` benennt die Schulleiterin als DSB (*„Ines Schubert (Schulleitung, Datenschutzbeauftragte)"*). Art. 38 Abs. 3 DSGVO verlangt Unabhängigkeit des DSB — Personalunion bei einer öffentlichen Stelle ist zulässig, aber audit-relevant (Anweisungsbefugnis vs. Kontrollfunktion). Plan 1.1 klärt das org-seitig; das ist kein Logik/Spec/API-Problem, aber das Datenschutzkonzept sollte diese Konstellation begründen (aktuell steht das nirgends).

---

## Bestätigung: Positivbefunde

### Fehler-Mapping (`error-conventions.mdc`)

Der Plan fügt keine neuen JSON-API-Routen hinzu. Die Media-Route liefert binär (403 ohne Body — bewusste Ausnahme, bereits im [[pre-mortem-1b-runtime-port-main-2026-07-04|Runtime-Port-Pre-Mortem]] Fund 3 dokumentiert). Die `dsb-contact.ts`- und `datenschutz.ts`-Änderungen sind Content, keine API-Verträge. Die `SCREAMING_SNAKE_CASE`-Konvention wird nicht gebrochen.

### Directus-Gate-Reihenfolge

Die Mermaid-Gates (Phase 4, Zeile 251–269) sind logisch konsistent: AVV und Media-Gate als P0-Blocker vor Directus, DSB/VVT/Backup/Branch-Sync als nachgelagerte Gates. Kein Gate steht fälschlich vor einer Abhängigkeit. Die Reihenfolge „AVV → DSB → Media-Gate → VVT → Auth → DSE → Backup → Branch" spiegelt die echten Abhängigkeiten korrekt wider.

---

## Empfohlene Plan-Änderungen (1b-Scope)

1. **Phase 0.1 + 1.4:** `branch-freeze-kunde.mdc`-Verweis korrigieren — Datei von `kunde/39-gs` portieren oder Verweis auf tatsächliche Fundstelle umleiten ([branch-freeze-Regel fehlt]).
2. **Phase 1.2:** #232-Doku-Verweis von `archiv/08-github-support-ticket-232.md` auf `offen.md` oder einen Port-Schritt korrigieren ([#232-Doku-Verweis ins Leere]).
3. **Phase 2.4:** Studio-Cookie-Verifikationsschritt ergänzen — HTTPS End-to-End prüfen vor `secure: true` ([Studio-Cookie secure-Flag]).
4. **Phase 1.3 + 5.1:** Book-Creator-kanonische Quelle festlegen (`dsgvo.md` führt, DSE folgt) und Synchronisationspflicht für beide Dateien bei Statuswechsel ([Book Creator Status]).
5. **Optional:** ADR-021-Vermerk auf Existenz prüfen, Doppeldokumentation vermeiden ([ADR-021 Token-Vermerk]).
6. **Optional:** 403-Response `Cache-Control: no-store` ergänzen oder in Prod-Verifikation aufnehmen ([403 ohne Cache-Control]).