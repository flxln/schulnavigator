---
tags:
  - review
  - pre-mortem
  - 1b-logik-spec
  - issue-200
erstellt: 2026-06-23
---
# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag: Dialog-Editor (#200)

**Plan:** `.cursor/plans/dialog-editor_#200_ec35f5cf.plan.md`
**Gegenstück:** [[pre-mortem-1a-200-dialog-editor-2026-06-23]] (1a — Code-Praxis, sofern vorhanden)

Stell dir vor, Frontend und Backend werden unabhängig implementiert und
integriert. Hier sind die vertraglichen Bruchstellen, die dann beißen.

---

### [`DELETE /clip` — Spec sagt "API bleibt", Plan fügt neue Route hinzu] — Widerspruch zwischen Dokumenten

- **Was widersprüchlich ist:** Die Spec ([`15-dialog-segment-zeilenmodell.md`](dokumentation/archiv/design/mpz-studio-claude-design-cleanup/15-dialog-segment-zeilenmodell.md) Z. 120) sagt wörtlich:
  > „API bleibt: `POST /api/mpz/dialog-audio/ingest`, `GET …/status` — nur UI-Einstieg ändert sich."

  Der Plan #200 (Z. 140, 196–209) führt jedoch einen **neuen** `DELETE /api/mpz/dialog-audio/clip` ein und begründet ihn mit der UX-Anforderung „Clip entfernen (nur Datei)" (AK #4, Z. 77). Die Spec listet unter „Aktionen pro Zeile" (Z. 105) zwar „Clip entfernen" als Wunsch, schreibt aber nicht, dass dafür eine **neue Backend-Route** nötig ist. Es gibt zwei Wahrheiten: Spec = „keine API-Änderung", Plan = „neue DELETE-Route".
- **Warum später teuer:** Ein Reviewer oder Folge-Issue, der sich an die Spec hält, wird die Existenz der `clip`-Route nicht erwarten. API-Dokumentation, OpenAPI-Schema und Integrationstests werden inkonsistent. Wenn jemand die Spec als „Source of Truth" nimmt und die Route entfernt, bricht das Frontend stillschweigend (Fetch auf 404).
- **Wann es beißt:** Spätestens beim API-Review nach Merge von #200 oder wenn ein externer Client (z. B. CLI-Script, Deploy-Hook) die Clip-Route nutzen soll, ohne zu wissen, dass sie existiert — weil die Spec sie nicht erwähnt.
- **Billige Gegenmaßnahme jetzt:** Die Spec ([`15-dialog-segment-zeilenmodell.md`](dokumentation/archiv/design/mpz-studio-claude-design-cleanup/15-dialog-segment-zeilenmodell.md) Z. 120) aktualisieren: „API wird erweitert um `DELETE …/clip` (nur Datei-Löschung, kein JSON-Write)". Alternativ: im Plan explizit als Spec-Abweichung markieren und ein Spec-Update-Ticket nachziehen. Nicht stillschweigend vorbei an der Spec implementieren.

---

### [`VALIDATION` statt `VALIDATION_FAILED`] — #200 perpetuiert Konventionsverstoß aus #199

- **Was widersprüchlich ist:** Der Pre-Mortem 1b #199 ([`pre-mortem-1b-199-dialog-lifecycle-2026-06-22.md`](dokumentation/reviews/pre-mortem/pre-mortem-1b-199-dialog-lifecycle-2026-06-22.md) Z. 19–29) hat bereits identifiziert: Die projektweite Konvention ([`.cursor/rules/error-conventions.mdc`](.cursor/rules/error-conventions.mdc) Z. 32) fordert `VALIDATION_FAILED`, aber der Domain-Code ([`mpz-dialog-audio-ingest.ts`](app/lib/mpz-dialog-audio-ingest.ts) Z. 100, 106, 113, 163, 168, 250, 266, 274, 289) wirft durchgängig `MpzUploadError('VALIDATION', …)`. Der Plan #200 dokumentiert diesen Zustand als „bestehend" (Z. 178) und wendet ihn auf die **neue** `DELETE /clip`-Route an (Z. 203: `VALIDATION` für unbekannter slug, Station ohne Dialog, Index out of range). Damit wird ein bekannter Konventionsverstoß auf eine neue Route ausgeweitet.
- **Warum später teuer:** Jeder Frontend-Error-Handler, der sich an die `.cursor/rules`-Konvention hält, wird `case 'VALIDATION_FAILED'` schreiben — und nie matchen. Der Clip-DELETE wirft stillschweigend ins Catch. Wenn später ein Tech-Debt-Issue die Codebase normalisiert, wird der neue Code (und seine Tests) nachziehen müssen — Breaking Change über alle Assertions.
- **Wann es beißt:** Bei Integration des neuen Clip-DELETE-Frontend mit einem generischen Error-Handler, oder wenn das Konventions-Normalisierungs-Issue (#199-Erkenntnis) umgesetzt wird und alle #200-Tests rot werden.
- **Billige Gegenmaßnahme jetzt:** In #200 den neuen Clip-DELETE-Code von Anfang an konform schreiben: `MpzUploadError('VALIDATION_FAILED', …)` oder zumindest einen `FIXME`-Kommentar hinterlegen, dass der Code die Konvention verletzt und mit #199 gemeinsam normalisiert werden muss. Nicht den bestehenden Verstoß stillschweigend kopieren.

---

### [Play-URL bei `drift` — Annahme „Studio-Cookie reicht" nie für `gated` verifiziert] — Unverifizierte Annahme + irreführender API-Vertrag

- **Was widersprüchlich ist:** Der Plan (Z. 76, 121–126) leitet die Play-URL bei `state === 'drift'` über `dialogApiQuelle(slug, expectedClip)` ab und begründet: „Datei liegt am Konventionspfad". Das ist korrekt für den Audittyp ([`DialogSegmentAudit`](app/lib/mpz-dialog-audio-ingest.ts) Z. 54–64: `drift` = `fileExists && !quelleMatchesConvention`). Aber die Annahme in Z. 228:
  > „Lokales Abspielen über `/api/dialog/…` funktioniert nach `/mpz/unlock` (Studio-Cookie reicht für API)"

  ist **falsch** für `SN_ACCESS_MODE=gated`. Die Play-Route ([`/api/dialog/[slug]/[clip]/route.ts`](app/app/api/dialog/[slug]/[clip]/route.ts) Z. 24–28) prüft ausschließlich das `ACCESS_COOKIE` (Entry-Token via [`access-tokens.ts`](app/lib/access-tokens.ts)), **nicht** den Studio-Cookie (`sn-mpz-studio` aus [`mpz-studio-guard.ts`](app/lib/mpz-studio-guard.ts) Z. 4). Ein Redakteur im Studio (Studio-Cookie vorhanden) bekommt `403`, wenn kein Entry-Token-Cookie existiert. Der Plan thematisiert das zwar als „Offene Frage #3" (Z. 237), aber Z. 228 formuliert es als verifizierte Annahme, nicht als Risiko.
- **Warum später teuer:** Beim Abnahme-Test in einem prod-ähnlichen Deployment (`SN_ACCESS_MODE=gated`) schlägt das Abspielen im Studio-Tab fehl — das `<audio>`-Element zeigt stillschweigend einen Fehler, kein Feedback an den Redakteur. Der Bug-Report wird „Play-Button kaputt im Studio" lauten, und die Ursache (zwei verschiedene Cookie-Systeme) ist nicht offensichtlich.
- **Wann es beißt:** Sobald der Studio-Tab in einem Deployment getestet wird, in dem `isAccessGated()` (aus [`access-config.ts`](app/lib/access-config.ts)) `true` zurückgibt — z. B. Staging oder Produktion. In reinem Dev (`NODE_ENV === 'development'`) fällt es nicht auf.
- **Billige Gegenmaßnahme jetzt:** Die Annahme in Z. 228 streichen und durch eine verifizierte Aussage ersetzen: „Die Play-Route prüft `ACCESS_COOKIE`, nicht den Studio-Cookie. In Dev (`SN_ACCESS_MODE` nicht gesetzt) funktioniert Play ohne weiteres Cookie; in `gated` muss der Redakteur zusätzlich `/eintritt` durchlaufen haben oder `SN_DEV_UNLOCK_ALL` aktiv sein." Die Sub-Zeile sollte bei `gated` ohne Entry-Cookie einen Hinweis zeigen („Zugangstoken fehlt — /eintritt scannen"), nicht stillschweigend fehlschlagen.

---

## Was stabil ist

Die **`DialogSegmentAudit`-Felder** für die Play-URL-Ableitung sind vollständig und konsistent: Der Typ in [`mpz-dialog-audio-ingest.ts`](app/lib/mpz-dialog-audio-ingest.ts) Z. 54–64 enthält alle Felder, die der Plan voraussetzt (`quelle`, `expectedClip`, `fileExists`, `quelleMatchesConvention`, `state`). Die `deriveSegmentState`-Funktion (Z. 77–85) definiert `drift` präzise als `fileExists && !quelleMatchesConvention` — damit ist die Annahme „Datei liegt am Konventionspfad bei drift" korrekt für die Play-URL-Konstruktion (nicht für das Access-Gate, siehe Fund 3). Hier stimmen Plan, Typsystem und Audit-Logik überein.