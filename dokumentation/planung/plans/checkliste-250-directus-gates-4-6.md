# Kurz-Checkliste: Issue #250 — Gates 4–6 formal abschließen (Auth-Konzept beschließen, VVT/DSE finalisieren)

**Stufe:** LIGHT · **Pipeline:** klassisch
**Follow-up zu:** Epic #47, Council [council-directus-planung-2026-07-06.md](../reviews/council-directus-planung-2026-07-06.md)
**Triage:** 2026-07-06, Score A1 B2 C1 D1 = 5/8, LIGHT + Härtung (B=2)
**Gehärtet:** 2026-07-06 nach Pre-Mortem 1b (Logik & Spec) — siehe Änderungslog und Fußnoten ¹²³⁴.

## Ziel & Akzeptanzkriterien

- `directus-auth-konzept.md` trägt Status **„beschlossen"** statt „Entwurf" (Rollenmodell Redaktion/Admin, 2FA-Pflicht Admin, Session 8 h, Löschfristen bestätigt).
- Gate-Tabelle im Kopf des Auth-Konzepts stimmt mit dem verifizierten Stand aus `epic-directus.md` überein (Gate 4 „weitgehend erfüllt", Gate 6 „teilerfüllt", statt pauschal „4–8 offen").
- Gate-4-Rest (VVT-Eintrag „Lehrkräfte-Accounts" konkretisieren) und Gate-6-Rest (DSE-Abschnitt `lehrkraefte-login` von „geplant" auf final) tragen je einen **benannten Trigger** (Deploy #255 bzw. erster Login #261), nicht „irgendwann". Der Gate-6-Trigger ist dabei die **erste, blockierende Teilaufgabe von #261** — finale DSE auf Production, **bevor** der erste Lehrkräfte-Account entsteht (kein Zirkelbezug „Login triggert DSE").¹
- Dokumentiert, ob der bestehende AVV-Anhang (ADR-027-Stand, #43) die Directus-Verarbeitung (Lehrkräfte-Accounts, Directus-DB) bereits abdeckt oder ein Nachtrag nötig ist; ein **negatives** Prüfergebnis erzeugt ein Blocker-Issue vor #261, keinen bloßen Merkposten.³
- Issue #250 kann geschlossen werden, ohne dass #261 (Pilot-Login) auf unklare Gates trifft.

## Ausführungs-Checkliste

1. `directus-auth-konzept.md`: Kopfzeile „Status: Entwurf" → „Status: beschlossen (Gate 5)", Datum ergänzen.
2. `directus-auth-konzept.md`: Gate-Tabelle im Kopf (`Gate-Stand: 1 ✅ … 4–8 offen`) durch den verifizierten Stand aus `epic-directus.md` (Zeilen 68–74) ersetzen — Gate 4 „weitgehend erfüllt (Rest: VVT-Eintrag bei Deploy)", Gate 6 „teilerfüllt (Rest: DSE final vor Login)".
3. `directus-auth-konzept.md`, Abschnitt „Auth-Anforderungen": Rollenmodell (Redaktion/Admin), 2FA-Pflicht Admin, Session 8 h, Löschfristen (90 Tage / ≤14 Tage Logs) als **entschieden** markieren, nicht als Vorschlag.
4. `dsgvo.md`, VVT-Zeile „Lehrkräfte-Accounts (geplant)": Fußnote/Verweis ergänzen, dass Speicherort-DB und Log-Retention erst mit Deploy (#255) final eingetragen werden — Trigger explizit benennen.
5. `app/content/legal/datenschutz.ts`, Abschnitt `lehrkraefte-login`: Kommentar/Notiz (kein Text-Change für Besucher) ergänzen, dass die Formulierung „geplant" auf final wechselt. **Trigger präzise:** Die DSE-Finalisierung ist die **erste, blockierende Teilaufgabe von #261** und muss **auf Production deployed sein, bevor der erste Lehrkräfte-Account** in der produktiven Directus-Instanz angelegt wird — Gate 6 ist ein Hard Gate *vor* dem Login, „erster Login triggert DSE" wäre ein formaler Datenschutzverstoß (Verarbeitung ohne vorherige transparente Information). Trigger im Code-Kommentar **und** in `dsgvo.md` verankern, nicht nur mündlich.¹
6. Prüfen: Deckt der papierbasierte AVV-Anhang (ADR-027-Stand, #43, 25.06.2026) die Verarbeitung von Lehrkräfte-Accounts in einer Directus-DB ab?
   - **Positiv:** in `dsgvo.md` als abgedeckt vermerken (Fundstelle/Datum), Gate 1 bleibt für den Directus-Kontext belegt.
   - **Negativ:** **zwingend** ein Blocker-Issue für Welle 3 anlegen, das **vor #261** die vertragliche Grundlage herstellt (AVV-Nachtrag oder schriftliche Bestätigung), und es als „Blockiert #261" verlinken — **nicht** als rein informativen Punkt in „Offene Punkte" laufen lassen (sonst ist Gate 1 „AVV unterschrieben" für den Directus-Kontext gerissen).³
7. `epic-directus.md`, Abschnitt „Gate-Status": Widerspruchs-Hinweis (Zeile 64, „Kopf nennt 4–8 offen") entfernen/aktualisieren **und** in der Gate-Tabelle (Zeilen 66–75) die Spalte **„Laut Auth-Konzept"** für Gate 4, 5 und 6 (Zeilen 71–73) vom Wert „offen" auf den beschlossenen Stand heben, sobald Schritt 1–2 erledigt sind — sonst zeigt die Tabelle veraltete Werte und der Widerspruch lebt beim nächsten Doku-Review wieder auf.⁴
8. `epic-directus-issues.md`, Body von **#261** (Aufgabe „Accounts … anlegen; DSE-Finalisierung (#250-Trigger) live schalten", Zeile 234): in zwei Teilaufgaben trennen und die **DSE-Finalisierung als erste, blockierende** Teilaufgabe **vor** die Account-Anlage stellen, damit der Doku-Vertrag die Deploy-vor-Account-Regel aus Schritt 5 abbildet (beim späteren Anlegen auf GitHub übernehmen).¹
9. `epic-directus-issues.md`, Body von **#255** (Zeilen 132–138): Teilaufgabe ergänzen — `- [ ] VVT-Eintrag „Lehrkräfte-Accounts" in dsgvo.md von „geplant" auf final heben (Speicherort-DB, Log-/IP-Retention)`, damit der in Schritt 4 gesetzte Trigger nach dem Deploy tatsächlich ausgeführt wird und der Eintrag nicht dauerhaft „geplant" bleibt (beim späteren Anlegen auf GitHub übernehmen).²
10. Issue #250 auf GitHub: Aufgaben-Checkbox-Liste abhaken, Kommentar mit Diff-Links (Dateien aus Schritt 1–9) hinterlassen.

## Verifikation

- `directus-auth-konzept.md` Kopf und `epic-directus.md` Gate-Tabelle widersprechen sich nicht mehr — **inklusive Spalte „Laut Auth-Konzept" für Gate 4/5/6** (Diff-Review).⁴
- Grep über `directus-auth-konzept.md`, `dsgvo.md`, `datenschutz.ts` bestätigt: keine der drei Dateien nennt Gate 5 noch als offen.
- Beide Trigger (Gate 4 → #255, Gate 6 → #261) sind als Text in Doku auffindbar, nicht nur in dieser Checkliste. Der Gate-6-Trigger steht in `datenschutz.ts` **und** im #261-Body als *erste, blockierende* Teilaufgabe vor der Account-Anlage.¹
- Der #255-Body enthält die Teilaufgabe zur VVT-Finalisierung in `dsgvo.md` (Schritt 9) — der VVT-Eintrag hat nach dem Deploy einen ausführenden Task, bleibt also nicht dauerhaft „geplant".²
- Für den AVV-Negativfall ist ein Blocker-Issue (Welle 3, vor #261) als fester Ausgang dokumentiert und mit #261 verlinkt, nicht nur ein offener Punkt.³
- Epic-Checkliste in `epic-directus.md` (Zeile „#250 Gates 4–6 formal abgeschlossen") kann abgehakt werden.

## Referenzen

- Issue [#250](https://github.com/flxln/schulnavigator/issues/250) · Epic [#47](https://github.com/flxln/schulnavigator/issues/47)
- [directus-auth-konzept.md](../spezifikationen/directus-auth-konzept.md)
- [epic-directus.md](./epics/epic-directus.md) (Gate-Status-Tabelle, Zeilen 63–75)
- [epic-directus-issues.md](./epics/epic-directus-issues.md) (Issue-Body #250, Zeilen 45–61; #255, Zeilen 128–140; #261, Zeilen 227–240)
- [dsgvo.md](../dsgvo.md) (VVT-Kurzfassung, Offene Punkte)
- [council-directus-planung-2026-07-06.md](../reviews/council-directus-planung-2026-07-06.md)

## Nicht in Scope

- Kein Directus-Deploy, keine Collections, kein Code (#251, #255, #256 — separate Issues).
- Keine DSE-Finalisierung für Besucher sichtbar vor erstem Login (#261) — in diesem Issue nur den Trigger dokumentieren; die Ausführung selbst gehört als erste, blockierende Teilaufgabe in #261 (Schritt 5/8).
- Dieses Issue führt **selbst keinen** AVV-Nachtrag/Papierprozess durch — aber ein negatives Prüfergebnis wird als Blocker-Issue vor #261 nachgehalten (Schritt 6), nicht als bloßer Merkposten absorbiert.³
- Kein Beschluss zu Mandantenfähigkeit oder Rollenerweiterung über Redaktion/Admin hinaus.

## Offene Punkte

- Ob der bestehende AVV-Anhang die Directus-Verarbeitung abdeckt, ist ohne Rücksprache mit der Schule/MPZ (Thomas) nicht abschließend klärbar — die **Prüfung** ist Teil dieses Issues (Schritt 6), der **Ausgang ist jedoch deterministisch geregelt:** positiv → in `dsgvo.md` vermerken; negativ → Blocker-Issue Welle 3 vor #261 (kein Login ohne AVV-Grundlage). Damit ist dies keine offene Blocker-Frage mehr, sondern eine terminierte externe Klärung mit definiertem Nein-Pfad.³

## Fußnoten

- **¹ Pre-Mortem 1b F1** (Zirkulärer Freigabe-Lock DSE ↔ erster Login): DSE-Finalisierung als erste, blockierende Teilaufgabe von #261, deployed **vor** jeder Account-Anlage (Schritt 5 und 8; AK; Verifikation).
- **² Pre-Mortem 1b F2** (fehlende Task-Kopplung VVT ↔ #255): VVT-Finalisierungs-Teilaufgabe in den #255-Body aufnehmen (Schritt 9; Verifikation).
- **³ Pre-Mortem 1b F3** (Bypassing-Risiko AVV-Hard-Gate 1): negatives AVV-Prüfergebnis erzeugt zwingend ein Blocker-Issue vor #261 (Schritt 6; AK; Nicht in Scope; Offene Punkte; Verifikation).
- **⁴ Pre-Mortem 1b F4** (Drift in Gate-Status-Tabelle): Spalte „Laut Auth-Konzept" für Gate 4/5/6 in `epic-directus.md` mitpflegen (Schritt 7; Verifikation).

## Änderungslog

- 2026-07-06 — Härtung nach Pre-Mortem 1b (Logik & Spec-Konsistenz):
  - ¹ **F1** (Blocker): Schritt 5 präzisiert (DSE-Finalisierung = erste, blockierende Teilaufgabe von #261, Prod-Deploy vor Account-Anlage; kein Zirkelbezug) + neuer Schritt 8 (#261-Body-Reihenfolge trennen); AK-Bullet zum Gate-6-Trigger geschärft; Verifikation ergänzt.
  - ² **F2** (Blocker): neuer Schritt 9 — VVT-Finalisierungs-Teilaufgabe in #255-Body, damit der Trigger nach dem Deploy ausgeführt wird und der Eintrag nicht dauerhaft „geplant" bleibt; Verifikation ergänzt.
  - ³ **F3** (Blocker): Schritt 6 um deterministischen Nein-Pfad erweitert (Blocker-Issue Welle 3 vor #261 statt bloßem Merkposten); „Offene Punkte" und „Nicht in Scope" entsprechend angepasst; AK und Verifikation ergänzt.
  - ⁴ **F4** (Hinweis): Schritt 7 erweitert (Spalte „Laut Auth-Konzept" für Gate 4/5/6 in `epic-directus.md` mitpflegen, Zeilen 71–73); Verifikation ergänzt.
  - Referenzen um #255-/#261-Zeilen ergänzt; frühere Schritt-8 („Issue #250 abhaken") ist jetzt Schritt 10, Diff-Link-Verweis auf „Schritt 1–9" aktualisiert.

## Umsetzung (Schritt 3 — 03_implementieren, 2026-07-06)

Ausführungs-Checkliste (Schritte 1–10) vollständig abgearbeitet, in Reihenfolge:

1.–3. `directus-auth-konzept.md`: Status „beschlossen", Gate-Kopf aktualisiert, Auth-Anforderungen als entschieden markiert (2FA jetzt Pflicht statt „empfohlen").
4. `dsgvo.md`: Trigger-Fußnote bei der VVT-Zeile ergänzt (Deploy #255 → DSE final vor #261-Account-Anlage).
5. `app/content/legal/datenschutz.ts`: Trigger als Code-Kommentar bei `lehrkraefte-login` verankert — **kein** sichtbarer Text für Besucher geändert.
6. AVV-Prüfung: **negativ** (AVV #43 unterschrieben vor Epic-Anlage, Inhalt deckt nur Schüler-Medien/Hosting ab) → Blocker-Issue [#263](https://github.com/flxln/schulnavigator/issues/263) angelegt, `Blockiert: #261`, in `dsgvo.md` und `epic-directus.md` verlinkt.
7. `epic-directus.md`: Widerspruchs-Hinweis aufgelöst, Spalte „Laut Auth-Konzept" für alle Gates auf den jetzt deckungsgleichen Stand gehoben.
8. `epic-directus-issues.md` #261-Body: DSE-Finalisierung als erste, blockierende Teilaufgabe **vor** Account-Anlage getrennt; `#263` zu „Blockiert durch" ergänzt.
9. `epic-directus-issues.md` #255-Body: Teilaufgabe „VVT-Eintrag final heben" ergänzt.
10. Kommentar auf [Issue #250](https://github.com/flxln/schulnavigator/issues/250#issuecomment-4896245046) hinterlassen (Aufgaben als erledigt markiert, Dateipfade statt Diff-Links — Änderungen sind noch **nicht committed/gepusht**); Epic-Checkliste in `epic-directus.md` abgehakt.

**Verifikation:**
- Grep auf „Entwurf" / „4–8 offen" / „Gate 5 … offen" in `directus-auth-konzept.md`: keine Treffer mehr.
- Grep auf „Widerspruch" in `epic-directus.md`: keine Treffer mehr (Abschnitt in „aufgelöst" umbenannt).
- `git status`: alle neun Dateien als geändert erkannt, keine unbeabsichtigten Nebenwirkungen.
- Trigger Gate 4 → #255 (neue Teilaufgabe im Body) und Gate 6 → #261 (Reihenfolge getrennt) sind als Text in den jeweiligen Dateien auffindbar.
- AVV-Negativfall hat einen dokumentierten, verlinkten Ausgang (#263) statt eines offenen Merkpostens.

**Nicht erledigt (bewusst, außerhalb Scope):** Kein Commit/Push — Nutzer hat das nicht angefordert (Git-Sicherheitsregel). Die tatsächliche DSE-/VVT-Finalisierung und die reale AVV-Nachtrag-Klärung mit der Schule sind Aufgaben von #255/#261/#263, nicht dieses Issues.
