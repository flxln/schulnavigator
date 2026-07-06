---
tags:
  - pre-mortem
  - 01b-logik-spec
  - directus
  - gates-4-6
  - issue-250
erstellt: 2026-07-06
ziel-artefakt: dokumentation/planung/plans/checkliste-250-directus-gates-4-6.md
artefakt-typ: checkliste
issue: "#250"
modell: gemini-3.5-flash
harness: keiner
gegenstück: keiner
---

# Pre-Mortem 01b — Directus Gates 4–6 formal abschließen #250 (Logik & Spec-Konsistenz)

**Geprüft:** Kurz-Checkliste [`checkliste-250-directus-gates-4-6.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/plans/checkliste-250-directus-gates-4-6.md) gegen die referenzierten Quellen: Spezifikation [`directus-auth-konzept.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/spezifikationen/directus-auth-konzept.md), [`epic-directus.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus.md), [`epic-directus-issues.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus-issues.md), das Datenschutzkonzept [`dsgvo.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/dsgvo.md) sowie die Implementierung [`datenschutz.ts`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/app/content/legal/datenschutz.ts).

**Gesamturteil:** Die formale Konsolidierung der Gates ist überfällig und die Checkliste räumt mit den widersprüchlichen Gate-Ständen im Repo gut auf. Es gibt jedoch vier konkrete logische Schwachstellen: Ein **zirkulärer Abhängigkeitskonflikt (F1)** betrifft die Finalisierung der Datenschutzerklärung (DSE) direkt beim ersten Login. Eine **Lücke in der Folgeaktivität (F2)** lässt den VVT-Eintrag nach dem Deploy dauerhaft unvollständig. Ein **Compliance-Risiko (F3)** betrifft das Übergehen des AVV-Hard-Gates, falls die Prüfung ein negatives Ergebnis liefert. Und ein **Dokumentationsdrift (F4)** führt zu unvollständigen Updates der Epic-Gate-Tabelle.

---

## Funde (nach logischer Tragweite sortiert)

### F1 — Zirkulärer Freigabe-Lock & Compliance-Lücke bei DSE-Finalisierung (Schritt 5 vs. Gate 6 & #261)

- **Was:** In Schritt 5 (Zeile 20) wird festgelegt, dass die Formulierung „geplant“ in [`datenschutz.ts`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/app/content/legal/datenschutz.ts) erst mit [#261](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus-issues.md#L227-L242) (erster Pilot-Login) auf final geändert wird. Gleichzeitig ist Gate 6 („DSE-Abschnitt Lehrkräfte-Login live“) laut [`epic-directus.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus.md#L73) ein *Hard Gate vor dem ersten Login*.
- **Warum später teuer:** Wenn die Finalisierung erst *durch* den ersten Login getriggert wird, entsteht ein Zirkelbezug. Wird dieser unsauber gelöst, indem Lehrkräfte sich einloggen, bevor die DSE-Änderung in Produktion live ist, liegt ein formaler Datenschutzverstoß vor (Verarbeitung ohne vorherige transparente Information).
- **Wann es beißt:** Bei der Ausführung von [#261](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus-issues.md#L227-L242).
- **Billige Gegenmaßnahme jetzt:** In Schritt 5 präzisieren, dass die DSE-Finalisierung die *erste, blockierende Teilaufgabe* innerhalb von [#261](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus-issues.md#L227-L242) sein muss, die vor der Generierung jeglicher Lehrkräfte-Accounts in der produktiven Directus-Instanz auf Production deployed sein muss.

### F2 — Fehlende Task-Kopplung für VVT-Finalisierung nach Deploy (Schritt 4 vs. #255)

- **Was:** Schritt 4 (Zeile 19) fügt einen Verweis in [`dsgvo.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/dsgvo.md) hinzu, dass Speicherort-DB und Log-Retention erst mit dem Deploy ([#255](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus-issues.md#L128-L143)) konkretisiert werden. Im Issue-Body von [#255](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus-issues.md#L128-L143) fehlt jedoch jeder Hinweis darauf, diesen Eintrag in [`dsgvo.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/dsgvo.md) tatsächlich anzupassen.
- **Warum später teuer:** Nach dem Deploy von Directus bleibt der VVT-Eintrag in [`dsgvo.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/dsgvo.md) dauerhaft im Zustand „geplant“ mit der Fußnote stehen. Dies führt bei künftigen Audits oder Überprüfungen zu einer unvollständigen und veralteten Dokumentation.
- **Wann es beißt:** Nach erfolgreichem Abschluss von [#255](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus-issues.md#L128-L143).
- **Billige Gegenmaßnahme jetzt:** Die Checkliste um einen Schritt erweitern, der in der Issue-Beschreibung von [#255](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus-issues.md#L128-L143) die Teilaufgabe `- [ ] VVT-Eintrag Lehrkräfte-Accounts in dsgvo.md von geplant auf final heben (Speicherort, IP-Retention)` ergänzt.

### F3 — Bypassing-Risiko des AVV-Hard-Gates (Schritt 6 vs. Gate 1)

- **Was:** Schritt 6 (Zeile 22) fordert die Prüfung, ob der AVV-Anhang die Directus-Verarbeitung abdeckt. Falls nicht, soll dies lediglich als offener Punkt in [`dsgvo.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/dsgvo.md) aufgenommen werden („kein neuer Papierprozess in diesem Issue“).
- **Warum später teuer:** Wenn die Prüfung ergibt, dass der AVV die CMS-Verarbeitung *nicht* abdeckt, und man dies nur als offenen Punkt notiert, wird das Hard Gate 1 („AVV unterschrieben“) für den Directus-Kontext gerissen. Das Einrichten von Accounts und Logins im Pilotbetrieb ohne gültige vertragliche Grundlage stellt ein rechtliches Risiko für das MPZ dar.
- **Wann es beißt:** Spätestens beim ersten Login im Pilotbetrieb ([#261](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus-issues.md#L227-L242)).
- **Billige Gegenmaßnahme jetzt:** Festlegen, dass ein negatives Prüfergebnis beim AVV-Anhang zwingend ein neues Blocker-Issue für die Welle 3 (vor [#261](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus-issues.md#L227-L242)) erzeugen muss, um die rechtliche Freigabe (z. B. durch einen Nachtrag oder eine schriftliche Bestätigung) herbeizuführen, statt es als rein informativen offenen Punkt laufen zu lassen.

### F4 — Drift in der Gate-Status-Tabelle des Epics (Schritt 7 vs. `epic-directus.md` Zeilen 66–76)

- **Was:** Schritt 7 (Zeile 23) verlangt, den Widerspruchs-Hinweis in [`epic-directus.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus.md) zu entfernen/aktualisieren. Die Checkliste fordert jedoch nicht explizit auf, die Spalte „Laut Auth-Konzept“ in der eigentlichen Gate-Tabelle von [`epic-directus.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus.md#L66-L76) für die Gates 4, 5 und 6 anzupassen.
- **Warum später teuer:** Die Tabelle in [`epic-directus.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus.md) zeigt weiterhin veraltete Werte („offen“ laut Auth-Konzept) an, was den Widerspruch zwischen den Dokumenten beim nächsten Doku-Review wiederbelebt.
- **Wann es beißt:** Bei zukünftigen Status-Audits oder Epic-Reviews.
- **Billige Gegenmaßnahme jetzt:** In Schritt 7 explizit ergänzen, dass die Spalte „Laut Auth-Konzept“ in der Tabelle von [`epic-directus.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/planung/epics/epic-directus.md#L66-L76) für die Gates 4, 5 und 6 auf den neuen Stand aktualisiert wird.

---

## Bestätigung: Solide Logik-Entscheidungen

- **Löschfristen-Konsistenz:** Die Festlegung auf 90 Tage Deaktivierung vor Löschung für Accounts und ≤ 14 Tage für Login-Logs im CMS steht im Einklang mit den allgemeinen Retentionsvorgaben des Projekts und ist in sich widerspruchsfrei formuliert.
- **Verifikations-Grep:** Die Verifikationsliste fordert einen systemweiten Grep über die Doku- und Codebestände, um sicherzustellen, dass Gate 5 nirgendwo mehr fälschlicherweise als „offen“ deklariert ist. Das verhindert verbleibende Textleichen.
