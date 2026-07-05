---
tags:
  - pre-mortem
  - 01a-code-praxis
  - nas-boot-cron
  - backup
  - issue-246
erstellt: 2026-07-05
ziel-artefakt: anleitungen/backup-t5/checkliste-#246-nas-boot-cron.md
artefakt-typ: checkliste
issue: "#246"
modell: claude-sonnet-5
gegenstück: keiner (LIGHT-Checkliste, kein 1b vorgesehen)
---

# Pre-Mortem 1a — NAS Boot-Task + Nightly Cron #246 (Code-Praxis / Ops-Ausführung)

**Geprüft:** Checkliste `checkliste-#246-nas-boot-cron.md` Zeile für Zeile gegen alle referenzierten Quellen: `backup-t5-nas-headscale.md`, die beiden Beispielskripte (`nas-backup-rsync.example.sh`, `nas-headscale-configure-host.example.sh`), Post-Mortem #243, Pre-Mortem 1a #243, den gehärteten Plan `headscale_nas_backup_#243_2548ea44.plan.md` sowie die SSOT-Anleitung (`~/Projekte/MPZ - Headscale/anleitungen/anleitung_headscale_synology_ds218_schulnavigator.md`, Teil D). Alle Dateien vollständig gelesen, inkl. Commit `e4f184e` („Backup T5 umgesetzt..."), nicht nur referenziert. Fokus: Stellen, an denen ein Operator, der die Checkliste morgen Zeile für Zeile abarbeitet, ins Stocken gerät — nicht Architektur oder Scope (Snapshot Replication, Shared-Folder-Migration etc. sind bereits explizit als „Nicht in Scope" markiert und bleiben unangetastet).

**Gesamturteil:** Ein Fund stoppt Schritt 1 potenziell sofort (Pfad-Annahme ohne Beleg in irgendeiner Vorgänger-Quelle), einer erzeugt einen typischen kurzen Stocker bei Schritt 2/3 (root-Login-Weg fehlt), einer ist eine stille Lücke, die erst beim ersten echten Fehlerfall auffällt (DSM-Benachrichtigungskanal). Die bereits umgesetzte Fehlerbehandlung im rsync-Skript und der vorgezogene Servicename-Check sind solide (siehe Bestätigung am Ende).

---

## Funde (nach Zeitpunkt des Beißens sortiert)

### F1 — Skript-Pfad `~/bin/nas-backup-rsync.sh` wird in keinem Vorgänger-Artefakt bestätigt (Schritt 1, potenzieller Sofort-Stopp)

- **Was:** Checkliste Zeile 17 (Schritt 1): `test -x ~/bin/nas-backup-rsync.sh && head -3 ~/bin/nas-backup-rsync.sh` → Exit 0. Zeile 21 (Schritt 5) baut direkt darauf auf: Script-Feld im Nightly-Task `/var/services/homes/felixlein/bin/nas-backup-rsync.sh`. Ich habe alle Quellen durchsucht, die diesen Pfad belegen müssten — `backup-t5-nas-headscale.md` (Todos, Zeile 124: „rsync-cron Skript deployed, erster Lauf OK ✅ (Cron DSM manuell)"), Post-Mortem #243 (Todos-Tabelle, identischer Wortlaut), der gehärtete Plan (Phase 3.5, Schritt 2: „Skript ... anpassen") und Commit `e4f184e` (ändert nur die Repo-Beispieldateien, keine Remote-Pfad-Angabe in der Commit-Message) — keine einzige Stelle nennt `~/bin/` als Zielverzeichnis auf dem NAS. Belegt ist nur, dass irgendwo ein angepasstes Skript lag, mit dem der erste Voll-Lauf (~2,8 GB) erfolgreich war.
- **Warum später teuer:** Wenn das Skript während #243 tatsächlich direkt im Home-Verzeichnis (`~/nas-backup-rsync.sh`) oder unter anderem Namen/Pfad abgelegt wurde, scheitert Schritt 1 mit Exit ≠ 0 — und Schritt 5 verweist im Nightly-Task auf einen nicht existierenden Pfad, was DSM entweder beim Anlegen ablehnt oder erst beim ersten nächtlichen Lauf sichtbar macht.
- **Wann es beißt:** Sofort bei Schritt 1 — vor jedem weiteren Schritt der Checkliste, da Schritt 5/6 direkt auf dem dort verifizierten Pfad aufbauen.
- **Billige Gegenmaßnahme jetzt:** Vor Schritt 1 einen Fallback ergänzen: `find /var/services/homes/felixlein -maxdepth 3 -iname 'nas-backup-rsync.sh' 2>/dev/null`, um den tatsächlichen Ablageort zu bestätigen, falls `~/bin/` nicht trifft — Schritt 5 entsprechend anpassen statt den Pfad blind zu übernehmen.

### F2 — „als root" in Schritt 2/3 nennt den Login-Weg nicht (kurzer Stocker)

- **Was:** Checkliste Zeile 18 („Servicename prüfen, als root, vor Boot-Task") und Zeile 19 (Boot-Task, Benutzer `root`) sagen nur „als root", ohne den Weg dorthin zu nennen. DSM deaktiviert direkten Root-SSH-Login standardmäßig; das in #243 etablierte Muster (SSOT-Anleitung Teil C, Zeile 176–177: `ssh admin@192.168.0.239` dann `sudo -i`) nutzt einen zweistufigen Login — in diesem Projekt mit `felixlein` statt `admin` (Post-Mortem #243, Scope-Abschnitt: „felixlein statt admin als NAS-Account").
- **Warum später teuer:** Wer nur die Checkliste liest, ohne parallel die SSOT-Anleitung offen zu haben, probiert `ssh root@192.168.0.239` direkt und bekommt „Permission denied" — kein Blocker, aber ein vermeidbarer Fehlversuch bei jedem der zwei root-Schritte.
- **Wann es beißt:** Schritt 2, vor dem ersten `synosystemctl list-units`-Aufruf.
- **Billige Gegenmaßnahme jetzt:** Schritt 2 um „(`ssh felixlein@192.168.0.239 -p 2222`, danach `sudo -i`)" ergänzen — einmal hingeschrieben, deckt es auch Schritt 3 ab.

### F3 — DSM-Benachrichtigung „bei abnormaler Beendigung" setzt einen konfigurierten Kanal voraus, der nirgends geprüft wird (stille Lücke)

- **Was:** Akzeptanzkriterium (Zeile 11) und Schritt 5 (Zeile 21) verlangen nur, dass die Checkbox „Benachrichtigung bei abnormaler Beendigung" für den Backup-Task aktiviert ist. Das ist eine Per-Task-Einstellung, die einen bereits global konfigurierten Zustellkanal in DSMs Benachrichtigungscenter voraussetzt (E-Mail-SMTP oder Push). Keine der referenzierten Quellen (Checkliste, `backup-t5-nas-headscale.md`, SSOT-Anleitung) erwähnt, dass dieser globale Kanal existiert oder verifiziert wurde.
- **Warum später teuer:** Die Checkbox lässt sich unabhängig vom globalen Kanal aktivieren — DSM meldet beim Setzen keinen Fehler, wenn kein Kanal konfiguriert ist. Das Akzeptanzkriterium „ist aktiv" wird damit formal erfüllt, ohne dass im Fehlerfall tatsächlich eine Nachricht ankommt. Genau das ist der Sinn dieses Tasks (unbeaufsichtigtes Nacht-Backup) — ein stiller Ausfall über Wochen wäre die Folge.
- **Wann es beißt:** Erster echter Fehlerfall nach Abschluss der Checkliste — vermutlich Wochen später, wenn niemand mehr hinschaut, weil „die Checkbox ja gesetzt ist".
- **Billige Gegenmaßnahme jetzt:** Vor Schritt 5 einen Check ergänzen: DSM → Systemsteuerung → Benachrichtigung → aktiver Kanal (E-Mail/Push) vorhanden und getestet. Die in der Verifikation (Zeile 30) als Alternative („oder") vorgesehene „(Test) bewusst fehlgeschlagener Lauf" von optional auf verpflichtend heben, statt nur den Erfolgsfall zu prüfen.

### F4 — Kleinigkeit: Boot-Task ohne Wartezyklus (niedrige Konfidenz)

Das Boot-Task-Script (Teil D / Schritt 3) ruft `configure-host` und den Service-Restart direkt beim `Boot-up`-Event ohne Wartezyklus, während das einmalig manuell ausgeführte Pendant (`nas-headscale-configure-host.example.sh`) danach noch `sleep 2` vor der Status-Prüfung einbaut. Falls der `Boot-up`-Trigger von DSM früher feuert als der Tailscale-Daemon-Socket bereit ist, könnte `configure-host` beim ersten Durchlauf fehlschlagen — sichtbar erst beim Reboot-Test (Schritt 4), ohne dass die Checkliste einen zweiten Versuch vorsieht. Da das Restart-Muster selbst der dokumentierte Tailscale-Synology-Workaround ist (Quellen-Abschnitt der SSOT-Anleitung, KB 1131) und DSM-„Boot-up"-Trigger erfahrungsgemäß spät im Bootvorgang feuern, ist das Risiko gering — falls Schritt 4 beim ersten Versuch nicht grün ist, lohnt sich vor tieferer Fehlersuche einfach ein zweiter Reboot.

---

## Bestätigung: Klassen, die solide sind

- **Fehlerbehandlung im rsync-Skript:** Die in PM 1a #243 (F3) geforderte Exit-Code-Sammlung pro Verzeichnis statt `set -e`-Vollabbruch ist im aktuellen `nas-backup-rsync.example.sh` bereits umgesetzt (Zeilen 19–37) — Schritt 6 der Checkliste kann sich darauf verlassen, dass ein Teilfehler nicht die übrigen zwei Verzeichnisse verschluckt.
- **Servicename-Verifikation vorgezogen:** Schritt 2 greift die in PM 1a #243 (F4) offen gelassene, ungeprüfte Annahme zum Dienstnamen `pkgctl-Tailscale.service` explizit auf und prüft sie vor dem Boot-Task-Anlegen — genau die dort empfohlene Gegenmaßnahme.
- **Scope-Abgrenzung:** Die „Nicht in Scope"-Liste (Snapshot Replication, Node-Bereinigung, Shared-Folder-Migration, rsync-Skript-Änderungen) deckt sich exakt mit den offenen Punkten aus Post-Mortem #243 und verhindert Scope-Creep in diesem LIGHT-Task.
