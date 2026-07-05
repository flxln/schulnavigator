---
tags:
  - pre-mortem
  - 01a-code-praxis
  - nas-snapshot-replication
  - backup
  - issue-247
erstellt: 2026-07-06
ziel-artefakt: anleitungen/backup-t5/checkliste-#247-nas-snapshot-replication.md
artefakt-typ: checkliste
issue: "#247"
modell: gemini-3.1-pro-high
gegenstück: keiner (LIGHT-Checkliste, kein 1b vorgesehen)
---

# Pre-Mortem 1a — NAS Backup: Btrfs Snapshot Replication #247 (Code-Praxis / Ops-Ausführung)

**Geprüft:** Checkliste [`checkliste-#247-nas-snapshot-replication.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/anleitungen/backup-t5/checkliste-#247-nas-snapshot-replication.md) Zeile für Zeile mit Developer- und Operator-Blick gegen alle referenzierten Quellen: [`backup-t5-nas-headscale.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/anleitungen/backup-t5/backup-t5-nas-headscale.md), das rsync-Beispielskript [`nas-backup-rsync.example.sh`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/anleitungen/backup-t5/scripts/nas-backup-rsync.example.sh), die Post-Mortems [#243](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/reviews/post-mortem/post-mortem-243-2026-07-05.md) und [#246](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/reviews/post-mortem/post-mortem-246-2026-07-05.md) sowie das Pre-Mortem 1a zu #246. Fokus: Stellen, an denen ein Operator, der die Checkliste morgen auf dem Synology NAS (DSM 7) abarbeitet, ins Stocken gerät oder im späteren Betrieb in gefährliche Fallen tappt.

**Gesamturteil:** Der Plan ist pragmatisch und solide aufgestellt (insbesondere das Timing nach dem Nightly-rsync und die klare Scope-Abgrenzung). Es gibt jedoch drei konkrete Funde: Ein **kritischer Betriebsbefund (F1)** betrifft das Rollback-Verhalten von Synology DSM, wenn Snapshots auf dem Shared Folder `homes` liegen (Gefahr des Überschreibens aller Nutzer-Homes bei einem Revert). Ein **logischer Stocker in der Verifikation (F2)** verlangt einen unterscheidbaren Dateiinhalt direkt nach dem Snapshot, was ohne Live-Änderung naturgemäß unmöglich ist. Ein **UI-Stocker in Schritt 5 (F3)** betrifft die Fehlerbenachrichtigungen, die in Snapshot Replication über globale DSM-Regeln und nicht im Ordner-Zeitplan konfiguriert werden.

---

## Funde (nach Zeitpunkt des Beißens sortiert)

### F1 — Voll-Restore (Revert) auf Shared-Folder-Ebene (`homes`) überschreibt alle Nutzer-Homes auf dem NAS (Kritisches Ops-Risiko bei Schritt 4/5 und im Betrieb)

- **Was:** In Schritt 4 (Zeile 21) und in den *Offenen Punkten* (Zeile 53) wird korrekt festgestellt, dass Snapshots bei Beibehalten des Pfades `/var/services/homes/felixlein/...` für den **gesamten Shared Folder `homes`** gelten. Es wird als „akzeptabel für Phase 1" eingestuft. Was jedoch komplett fehlt, ist eine Warnung vor der Funktionsweise der Wiederherstellung in der Synology Snapshot Replication App: Ein Klick auf **„Wiederherstellen" (Revert/Rollback)** in der Snapshot-App wirkt *immer atomar auf den gesamten Shared Folder*.
- **Warum später teuer:** Wenn es in Zukunft zu einem Notfall kommt (z. B. versehentliche Löschung auf dem VPS oder fehlerhafter rsync-Lauf) und ein Admin schnell den letzten Stand wiederherstellen will, öffnet er Snapshot Replication, wählt den Snapshot von `homes` und klickt auf „Wiederherstellen". Damit setzt DSM den *kompletten Shared Folder `homes`* auf den Zeitstempel des Snapshots zurück! Alle Home-Verzeichnisse aller Nutzer auf dem NAS (`~/.ssh`, `~/bin/nas-backup-rsync.sh`, SSH-Keys, nach 03:30 Uhr geänderte Skripte oder Synology-Drive-Daten) werden rückwirkend überschrieben oder gelöscht.
- **Wann es beißt:** Im Ernstfall / Notfall-Restore nach der Einrichtung.
- **Billige Gegenmaßnahme jetzt:** In Schritt 4/5 und in der Dokumentation ([`backup-t5-nas-headscale.md`](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/anleitungen/backup-t5/backup-t5-nas-headscale.md)) eine strikte Betriebsvorschrift aufnehmen:  
  > ⚠️ **WICHTIG:** Bei Backup unter `homes`: In der App *Snapshot Replication* **NIEMALS** die Funktion „Wiederherstellen" (Rollback auf Ordnerebene) nutzen! Ein Restore darf **ausschließlich auf Dateiebene** erfolgen (durch Durchsuchen / *Browse* via File Station bzw. Kopieren aus `/volume1/homes/#snapshot/...`), da ein Rollback sonst die Home-Verzeichnisse und Skripte aller Nutzer auf dem NAS überschreibt.

### F2 — Verifikation fordert „Inhalt vom Live-Ordner unterscheidbar", was direkt nach dem Snapshot ohne Live-Änderung fehlschlägt (Stocker in Verifikation Bullet 3)

- **Was:** Verifikation Bullet 3 (Zeile 32) fordert nach dem manuellen Snapshot aus Schritt 6: *„Test: eine Datei im Backup-Ordner in DSM Snapshot Replication → Browse des letzten Snapshots öffnen — Inhalt vom Live-Ordner unterscheidbar (Snapshot-Punkt erkennbar)."* Da zwischen Schritt 6 (Snapshot manuell auslösen) und Schritt 7 / Verifikation keine Datei im Live-Ordner geändert oder gelöscht wird, ist der Inhalt der Datei im Snapshot naturgemäß **100 % byte-identisch** mit dem Live-Ordner.
- **Warum später teuer:** Der Operator stutzt bei der Verifikation, hält den Snapshot für defekt (oder für einen bloßen Symlink/Live-View auf den Ordner) und verschwendet Zeit mit Fehlersuche — oder er winkt den Punkt ab, ohne die wirkliche Point-in-Time-Eigenschaft (Unveränderlichkeit) getestet zu haben.
- **Wann es beißt:** Direkt bei der Ausführung von Verifikation Bullet 3.
- **Billige Gegenmaßnahme jetzt:** In Schritt 6 einen konkreten Mini-Test definieren: Vor Schritt 6 eine temporäre Datei im Live-Ordner anlegen (z. B. `echo "test" > /var/services/homes/felixlein/schulnavigator-backup/snapshot-test.txt`), den Snapshot auslösen, die Datei im Live-Ordner danach löschen — und in Bullet 3 verifizieren, dass sie im Snapshot-Ordner (`#snapshot/...`) weiterhin unverändert existiert. Alternativ das Kriterium in Bullet 3 präzisieren auf: *„Pfad (`#snapshot/...`) und Read-Only-Status in File Station erkennbar (Inhalt ist ohne Zwischenänderung identisch)."*

### F3 — Benachrichtigung bei Fehler wird in Snapshot Replication nicht pro Ordner konfiguriert, sondern über globale DSM-Ereignisregeln (Stocker in Schritt 5)

- **Was:** Schritt 5 (Zeile 24) verlangt: *„Benachrichtigung bei Fehler aktivieren (gleicher Kanal wie #246)."* Bei Issue #246 (Task Scheduler / Aufgabenplanung) gab es dafür direkt in der Aufgabe eine eigene Checkbox (*„Benachrichtigung bei abnormaler Beendigung"*). In der Synology *Snapshot Replication* App gibt es in den Zeitplan- und Aufbewahrungseinstellungen eines Shared Folders jedoch **keine solche Checkbox** für E-Mail- oder Push-Benachrichtigungen.
- **Warum später teuer:** Der Operator sucht in Schritt 5 vergeblich nach der Checkbox im Dialog der Snapshot-App oder geht fälschlicherweise davon aus, dass Fehler automatisch an den Kanal aus #246 gemeldet werden. Wenn die Snapshot-Erstellung später im Betrieb geräuschlos fehlschlägt (z. B. weil der Speicherplatz auf dem Volume voll läuft), geht keine Warnung raus.
- **Wann es beißt:** Bei der Ausführung von Schritt 5 (Suche/Verwirrung) sowie bei späteren Laufzeitfehlern im Betrieb.
- **Billige Gegenmaßnahme jetzt:** In Schritt 5 den exakten DSM-Konfigurationsort angeben:  
  *„Benachrichtigung: In DSM **Systemsteuerung → Benachrichtigung → Regeln → Snapshot Replication** prüfen, ob Fehler-Ereignisse (z. B. 'Erstellung des Snapshots fehlgeschlagen', 'Löschen des Snapshots fehlgeschlagen') für den in #246 aktivierten Kanal (E-Mail/Push) angehakt sind (wird in DSM 7 global vergeben, nicht im Ordner-Zeitplan)."*

---

## Bestätigung: Klassen, die solide sind

- **Zusammenspiel der Zeitpläne:** Das Nightly-rsync läuft laut [#246](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/dokumentation/reviews/post-mortem/post-mortem-246-2026-07-05.md) um 02:00 Uhr. Da der erste Voll-Lauf in #243 ca. 87 Minuten gedauert hat und die nächtlichen inkrementellen Läufe nur noch Sekunden bis wenige Minuten brauchen, ist 03:30 Uhr als Snapshot-Zeitpunkt mit einem sehr komfortablen Sicherheitspuffer (90 Minuten) gewählt (Akzeptanzkriterium 4).
- **Abgleich der Shared-Folder-Mappings:** Schritt 4 benennt präzise die beiden möglichen Mapping-Pfade (`homes` vs. dedizierter Ordner `schulnavigator-backup`) und schützt durch die klare Anweisung vor dem versehentlichen Aktivieren von Snapshots auf falschen Volumes.
- **Klare Scope-Abgrenzung:** Die *Nicht-in-Scope*-Liste und die *Offenen Punkte* grenzen das Issue sauber ab (keine Zwangsmigration auf dedizierten Shared Folder vor Phase 1, keine unnötigen Änderungen am rsync-Skript oder Cron im Rahmen dieses Tasks).
