# Kurz-Checkliste: Issue #247 — NAS Backup: Btrfs Snapshot Replication (30 Tage)

**Stufe:** LIGHT · **Pipeline:** klassisch  
**Follow-up zu:** #243 · #246  
**Triage:** 2026-07-06 (Score 2/8, A=0 B=1 C=1 D=0)  
**Status:** ✅ abgeschlossen (2026-07-06) — [Post-Mortem](../reviews/post-mortem/post-mortem-247-2026-07-06.md): Go

## Ziel & Akzeptanzkriterien

- [x] Snapshot Replication für den **tatsächlichen** Backup-Zielordner aktiv (Pfad in Schritt 1 bestätigt).
- [x] Zeitplan: **täglich**, Aufbewahrung **30** Snapshots/Tage.
- [x] Erster manueller Snapshot erfolgreich; in DSM sichtbar mit Datum und Größe.
- [x] Snapshot-Zeitpunkt liegt **nach** dem Nightly-rsync (02:00) — 03:30.
- [x] Kurzdoku in `backup-t5-nas-headscale.md` (E4 abgehakt, Pfad + Zeitplan notiert).
- [x] Bei Backup unter `homes`: Restore-Regel „nur Dateiebene, **kein** Ordner-Revert" in `backup-t5-nas-headscale.md` dokumentiert.¹

## Ausführungs-Checkliste

1. **Backup-Zielpfad bestätigen** — NAS SSH (`felixlein@192.168.0.239`, Port 2222): `grep '^NAS_ROOT=' /var/services/homes/felixlein/bin/nas-backup-rsync.sh` → erwartet `/var/services/homes/felixlein/schulnavigator-backup`; `du -sh` auf diesen Pfad → ~2,8 GB+ sichtbar. Abweichender Pfad? Notieren und Schritt 4 anpassen.
2. **Btrfs-Voraussetzung** — DSM → Speicher-Manager → Volume: Dateisystem **btrfs**. Falls ext4: Snapshot Replication nicht möglich → Issue kommentieren, Triage neu (Migration Shared Folder wäre Voraussetzung).
3. **Snapshot Replication installieren** — Paket-Zentrum → `Snapshot Replication` installiert und geöffnet. Falls bereits vorhanden: Version notieren.
4. **Shared Folder für Snapshot bestimmen** — Pfad aus Schritt 1 auf DSM-Shared-Folder mappen:
   - `/var/services/homes/felixlein/…` → Shared Folder **`homes`**
   - `/volume1/schulnavigator-backup/…` → Shared Folder **`schulnavigator-backup`**
   Nur diesen Shared Folder konfigurieren — kein Snapshot auf falschem Volume.
   ⚠️ **Restore-Regel bei `homes`:** Ein „Wiederherstellen" (Revert/Rollback) in Snapshot Replication wirkt **immer atomar auf den gesamten Shared Folder**. Liegt das Backup unter `homes`, würde ein Ordner-Revert **alle** Home-Verzeichnisse (`~/.ssh`, SSH-Keys, `~/bin/nas-backup-rsync.sh`, Synology-Drive-Daten) auf den Snapshot-Stand zurücksetzen. Ein Restore darf daher **ausschließlich auf Dateiebene** erfolgen (Browse/File Station, Kopieren aus `…/#snapshot/…`) — **nie** der Ordner-Revert. Diese Regel in Schritt 7 dokumentieren.¹
5. **Snapshot-Zeitplan anlegen** — Snapshot Replication → **Snapshot** → Shared Folder aus Schritt 4 → **Einstellungen**: geplante Snapshots **aktiv**, Intervall **täglich** (z. B. 03:30), Aufbewahrung **30**. **Benachrichtigung:** Der Ordner-Zeitplan hat **keine** eigene Fehler-Checkbox — stattdessen in **Systemsteuerung → Benachrichtigung → Regeln → Snapshot Replication** prüfen, dass die Fehler-Ereignisse (z. B. „Erstellung des Snapshots fehlgeschlagen", „Löschen des Snapshots fehlgeschlagen") für den in #246 aktivierten Kanal (E-Mail/Push) angehakt sind (in DSM 7 global vergeben, nicht im Zeitplan).³
6. **Manuellen Snapshot mit Nachweis-Datei auslösen** — Zuerst eine Marker-Datei im Live-Backup-Ordner (Pfad aus Schritt 1) anlegen: `echo "snapshot-test $(date)" > <Backup-Pfad>/snapshot-test.txt`. Dann „Snapshot erstellen" / „Jetzt ausführen" → Abschluss ohne Fehler in der Aufgabenhistorie. Danach die Marker-Datei im Live-Ordner **löschen** (`rm <Backup-Pfad>/snapshot-test.txt`) — sie muss im Snapshot erhalten bleiben (Nachweis in Verifikation).²
7. **Doku aktualisieren** — `dokumentation/planung/backup-t5-nas-headscale.md`: E4-Zeile abhaken, tatsächlicher Shared-Folder-Name, Uhrzeit und Retention eintragen; bei Backup unter `homes` die **Restore-Regel aus Schritt 4** („nur Dateiebene, kein Ordner-Revert") als Warnhinweis festhalten; offene-Punkte-Liste (#247) aktualisieren.¹

## Verifikation

- [x] In Snapshot Replication: mindestens ein Snapshot mit heutigem Datum für den Shared Folder aus Schritt 4.
- [x] `ls /var/services/homes/felixlein/schulnavigator-backup/media` unverändert lesbar, ~2,8 GB (via SSH bestätigt).
- [x] **Point-in-Time nachgewiesen:** Die in Schritt 6 gelöschte `snapshot-test.txt` im Snapshot sichtbar (DSM Browse bestätigt), im Live-Ordner nicht mehr vorhanden (via SSH bestätigt).²
- [x] Bei Backup unter `homes`: `backup-t5-nas-headscale.md` enthält die Restore-Regel „nur Dateiebene, kein Ordner-Revert".¹
- [x] `backup-t5-nas-headscale.md` zeigt E4 als erledigt mit konkretem Pfad und Zeitplan.

## Referenzen

- Issue [#247](https://github.com/flxln/schulnavigator/issues/247)
- Entscheidung E4: [post-mortem-243-2026-07-05.md](../reviews/post-mortem/post-mortem-243-2026-07-05.md)
- [post-mortem-246-2026-07-05.md](../reviews/post-mortem/post-mortem-246-2026-07-05.md) — Nightly-rsync 02:00
- [backup-t5-nas-headscale.md](backup-t5-nas-headscale.md) — Zeile 151 (E4-Vorgabe)
- [nas-backup-rsync.example.sh](scripts/nas-backup-rsync.example.sh) — `NAS_ROOT` Default
- Pre-Mortem 1b #243: Schutz vor stillem rsync-Überschreiben (Btrfs-Snapshots als Gegenmaßnahme)

## Nicht in Scope

- Migration zu dediziertem Shared Folder `/volume1/schulnavigator-backup` (optional, #243)
- [x] Headscale-Node `100.64.0.8` bereinigen → #248 (2026-07-06)
- Änderungen am rsync-Skript, VPS `backup-read` oder Nightly-Cron (#246)
- Remote-Replikation auf zweites NAS (nur lokale Snapshots)

## Offene Punkte

- Wenn Backup weiter unter `homes` liegt: Snapshots gelten für den gesamten Shared Folder `homes`, nicht nur `schulnavigator-backup` — für den **Snapshot-Umfang** akzeptabel für Phase 1; der dedizierte Ordner bleibt optional. **Geschlossen für den Restore-Fall:** Ordner-Revert ist verboten, nur Datei-Restore erlaubt (Schritt 4/7 + Kriterium oben).¹
- Pre-Mortem 1a eingearbeitet (F1/F2/F3, siehe Änderungslog); keine offenen Blocker mehr.

## Änderungslog

**2026-07-06:** Abschluss — Checkliste `[x]`, Status „abgeschlossen", Post-Mortem verlinkt. Backup-Pfad via SSH bestätigt (`NAS_ROOT=/var/services/homes/felixlein/schulnavigator-backup`, 2,8 GB). Filesystem btrfs (`/volume1`). Shared Folder `homes`, täglich 03:30, 30 Snapshots. Point-in-Time via DSM Browse bestätigt. `backup-t5-nas-headscale.md` E4 abgehakt, Restore-Regel dokumentiert.

Gehärtet nach Pre-Mortem 1a (2026-07-06):

- ¹ 1a F1: Ordner-Revert auf `homes` überschreibt alle Home-Verzeichnisse → Restore nur auf Dateiebene erlaubt; als Akzeptanzkriterium, in Schritt 4/7, Verifikation und Offenen Punkten verankert.
- ² 1a F2: Snapshot-Inhalt ist ohne Live-Änderung byte-identisch → Schritt 6 legt eine Marker-Datei an und löscht sie nach dem Snapshot; Verifikation weist deren Persistenz im Snapshot nach (statt „Inhalt unterscheidbar").
- ³ 1a F3: Fehler-Benachrichtigung wird nicht im Ordner-Zeitplan, sondern global über Systemsteuerung → Benachrichtigung → Regeln vergeben → Schritt 5 präzisiert den Konfigurationsort.
