---
tags:
  - pre-mortem
  - 01b-logik-spec
  - headscale-nas
  - backup
  - issue-243
erstellt: 2026-07-05
plan: .cursor/plans/headscale_nas_backup_#243_2548ea44.plan.md
gegenstück: pre-mortem-1a-headscale-nas-243-2026-07-05.md
---

# Pre-Mortem 1b — Headscale NAS Backup #243 (Logik, Spec-Konsistenz & API-Vertrag)

**Geprüft:** Plan `headscale_nas_backup_#243_2548ea44.plan.md` gegen die Entscheidungsspezifikation (`dokumentation/planung/backup-t5-nas-headscale.md`), das rsync-Beispielskript (`dokumentation/planung/scripts/nas-backup-rsync.example.sh`), die Headscale-ACL-Vorlage (`~/Projekte/MPZ - Headscale/staging/headscale/config/acl.hujson`) und die Betriebsanleitung (`~/Projekte/MPZ - Headscale/anleitungen/anleitung_headscale_synology_ds218_schulnavigator.md`). Code- und Doku-Belege wurden via `view_file` verifiziert. Dieses Gutachten fokussiert sich ausschließlich auf Widersprüche zwischen Dokumenten, unvollständige Diskriminierung, API-/Config-Verträge und nie verifizierte Annahmen.

**Gesamturteil:** Vier scharfe Funde im Bereich der Berechtigungs-, Netzwerk- und Datenintegritäts-Verträge. Fund 1 auf dem Coolify-VPS birgt das Risiko, dass der Backup-User an neu erstellten Docker-Mediendateien wegen fehlender Leserechte scheitert. Fund 2 deckt einen fundamentalen logischen Widerspruch zwischen der strikt unidirektionalen Headscale-ACL und dem im Plan geforderten Restore-Test (`NAS → VPS /tmp`) auf. Fund 3 zeigt, dass der bloße Verzicht auf `--delete` bei Fehlerkosten B=2 (Schüler-Medien) unzureichend vor stummen Überschreibungen und Datei-Korruption auf dem VPS schützt. Fund 4 benennt einen unvollständigen API-Vertrag bei der Einschränkung von `authorized_keys` über mehrere Verzeichnisse hinweg. Alle vier Funde lassen sich durch präzise Ergänzungen im Plan (Schritt 2: Plan härten) mit minimalem Aufwand entschärfen.

---

## Funde

### [Unvollständiges Berechtigungskonzept auf dem VPS] — Unvollständige Diskriminierung beim Lesezugriff für `backup-read` auf dynamische Docker-Volumes

- **Was widersprüchlich/undefiniert ist:** Plan Phase 3.4 fordert für den neuen SSH-User `backup-read` auf dem VPS: *„3. Lesezugriff `/data/schulnavigator/{media,dialog-audio,coach-audio}`"*. Der Plan spezifiziert jedoch nicht den Mechanismus, wie dieser Lesezugriff dauerhaft und für *neu erstellte* Dateien gewährleistet wird. Auf dem Coolify-VPS werden Mediendateien dynamisch durch Container-Prozesse (z. B. Next.js oder Directus) mit deren spezifischen UIDs/GIDs (z. B. `root` oder `node` UID 1000) und restriktiven Umasks (z. B. `022`/`644` oder `077`/`600`) in den Volume-Verzeichnissen angelegt. Wenn `backup-read` ein normaler Linux-Host-User ist und kein kontinuierlicher ACL-/Gruppen-Mechanismus definiert wird, greift ein einmaliges `chown`/`chmod` bei der Einrichtung nur für Bestandsdateien.

- **Warum später teuer:** Das nächtliche Backup scheitert mit `Permission denied` an allen seit der Einrichtung neu hochgeladenen Schüler-Aufnahmen – oder überspringt unlesbare Dateien und Verzeichnisse stillschweigend, falls das Error-Handling im DSM Task Scheduler nicht proaktiv alarmiert. Damit entsteht eine trügerische Sicherheit: Das Backup läuft scheinbar durch, enthält aber keine aktuellen Schüler-Medien.

- **Wann es beißt:** Unmittelbar nach dem ersten Datei-Upload durch Lehrkräfte oder Schüler nach Abschluss der Phase-3-Einrichtung.

- **Billige Gegenmaßnahme jetzt:** In Phase 3.4 den exakten Mechanismus für den Lese-Vertrag auf dem Host-Dateisystem vorschreiben. Entweder Linux POSIX Access Control Lists (ACLs) verwenden, um dem User und künftigen Dateien Leserechte zu vererben:
  ```bash
  sudo setfacl -R -m u:backup-read:r-X /data/schulnavigator/{media,dialog-audio,coach-audio}
  sudo setfacl -d -m u:backup-read:r-X /data/schulnavigator/{media,dialog-audio,coach-audio}
  ```
  Oder (falls das Dateisystem keine ACLs unterstützt) im rsync-Skript den Aufruf über sudo konfigurieren (`--rsync-path="sudo rsync"`) und in `/etc/sudoers.d/backup-read` eine passwortlose sudo-Regel exklusiv für den rsync-Lesebefehl hinterlegen.

---

### [Logischer Widerspruch beim Restore-Test] — Widerspruch zwischen ACL-Einbahnstraße, Read-Only-Key und Test-Spezifikation (`NAS → VPS /tmp`)

- **Was widersprüchlich/undefiniert ist:** Plan Phase 5a und die Entscheidungsspezifikation (`backup-t5-nas-headscale.md`) definieren als Akzeptanzkriterium: *„Restore-Test: eine Datei von NAS nach `/tmp` auf VPS zurückkopieren und Hash prüfen"*. Dies widerspricht gleich zwei harten Sicherheitsverträgen im System:
  1. **Netzwerk-ACL:** In `acl.hujson` ist die Berechtigung strikt unidirektional definiert: `"src": ["group:backup"], "dst": ["mpz-vps@headscale:22"]`. Der VPS-Host (`mpz-vps`) darf nach dem Least-Privilege-Prinzip *keine* Verbindungen zum NAS (`schulnavigator-nas`) initiieren – ein Pull von VPS-Seite ist netzwerkseitig blockiert.
  2. **SSH-Key-Restriktion:** Wenn das NAS (als erlaubter Initiator) versucht, eine Datei per rsync/scp aktiv auf den VPS in den Ordner `/tmp` zu schieben (`NAS → VPS /tmp`), scheitert dies an Phase 3.4 Punkt 2: Der SSH-Key von `backup-read` ist in `authorized_keys` auf *„rsync read-only auf drei Volume-Pfade"* eingeschränkt. Ein Schreibzugriff auf `/tmp` (oder beliebige andere Pfade) ist durch den SSH-Befehlsfilter untersagt.

- **Warum später teuer:** Beim Abschluss des Issues (#243) in Phase 5a schlägt der geforderte Restore-Test unweigerlich fehl. Der Operator verliert Stunden mit der Fehlersuche zwischen Headscale-ACLs, Tailscale-Firewalls und SSH-Forced-Commands. Im schlechtesten Fall wird zur „Behebung" des Tests die Read-Only-Einschränkung in `authorized_keys` entfernt oder dem NAS bidirektionaler Zugriff im Tailnet gewährt, was das Sicherheitsmodell der gesamten T5-Architektur untergräbt.

- **Wann es beißt:** In Phase 5a bei der Durchführung des Restore-Tests zur Verifikation vor dem Schließen von Issue #243.

- **Billige Gegenmaßnahme jetzt:** Den Verifikationsvertrag für den Restore-Test in Phase 5a sauber diskriminieren und an die Sicherheitsarchitektur anpassen:
  - **Variante A (Empfohlen - Integritätsprüfung ohne Schreibzugriff):** Der Test prüft die Integrität direkt vom NAS aus durch Vergleich der Hashes:
    ```bash
    # Auf dem NAS: Hash der lokalen Backup-Kopie berechnen und mit dem Original auf dem VPS vergleichen
    sha256sum /volume1/schulnavigator-backup/media/test.mp3
    ssh -i ~/.ssh/schulnavigator_backup backup-read@<VPS_HEADSCALE_IP> "sha256sum /data/schulnavigator/media/test.mp3"
    ```
  - **Variante B (Echter File-Restore im Notfall):** Explizit dokumentieren, dass ein physischer Datei-Restore auf den VPS nicht über das automatisierte rsync-Konto (`schulnavigator-nas`), sondern ausschließlich durch einen MPZ-Admin von dessen Arbeitsgerät (via `group:admin` / `felix@headscale`, welches laut ACL `*:*` darf) durchgeführt wird.

---

### [Fehlender Schutz vor stummen Überschreibungen / Korruption] — Unvollständige Diskriminierung bei rsync ohne `--delete` (Fehlerkosten B=2)

- **Was widersprüchlich/undefiniert ist:** Der Plan adressiert in Phase 3.5 die für Schüler-Medien festgestellte **Fehlerkosten-Einstufung B=2** ausschließlich mit der Maßgabe: *„DSM Aufgabenplanung nightly — kein `--delete`"* (in Einklang mit `backup-t5-nas-headscale.md`). Der Verzicht auf `--delete` verhindert zwar, dass auf dem VPS gelöschte Dateien auf dem NAS entfernt werden; der Plan übersieht jedoch vollständig den Fall von **Dateiveränderungen, Korruption oder Verkürzung auf 0 Bytes** (z. B. durch App-Bugs, Fehlbedienung, Abstürze oder Ransomware auf dem VPS). Bei einem Standard-Aufruf von `rsync -avz` werden bestehende Dateien mit gleichem Namen und neuerem Zeitstempel (oder abweichender Dateigröße) auf dem Ziel blind überschrieben.

- **Warum später teuer:** Wenn eine Mediendatei auf dem VPS durch einen Softwarefehler auf 0 Bytes verkürzt oder inhaltlich korrumpiert wird, überschreibt der nächtliche rsync-Lauf auf dem NAS die intakte Sicherungskopie mit der defekten Version. Da der Plan für Phase 1 keine Versionierung oder Snapshots auf dem NAS vorsieht (dies wird in der Spec erst für Phase 2 „optional" erwähnt), ist der einzige verbleibende Datenträger für diese Schüler-Medien unwiderruflich zerstört.

- **Wann es beißt:** Beim ersten unbemerkten Applikationsfehler oder Datenintegritäts-Vorfall auf dem Live-VPS, sobald der nächtliche Cronjob gelaufen ist.

- **Billige Gegenmaßnahme jetzt:** Bei Fehlerkosten B=2 in Phase 3.5 (Shared Folder + rsync-Cron) als Pflichtmaßnahme vorschreiben: Auf dem Synology NAS (`DS218+`) für den gemeinsamen Ordner `/volume1/schulnavigator-backup` im DSM die native **Snapshot Replication (Btrfs-Snapshots)** aktivieren (z. B. automatische tägliche Snapshots mit einer Aufbewahrung von 30 oder 60 Tagen). Dadurch kostet die Versionierung keinen doppelten Speicherplatz, und selbst wenn rsync eine korrumpierte Datei überschreibt, lässt sich der intakte Zustand aus dem Btrfs-Snapshot des Vortags mit einem Klick wiederherstellen.

---

### [Unspezifizierter API-Vertrag für `authorized_keys`-Einschränkung] — API-Vertrag ohne Format bei Multi-Directory rsync

- **Was widersprüchlich/undefiniert ist:** Plan Phase 3.4 fordert: *„2. `authorized_keys` eingeschränkt (rsync read-only auf drei Volume-Pfade)"*. In der OpenSSH-Syntax für `authorized_keys` lässt sich über die Option `command="..."` jedoch nur genau *ein* fester Befehl erzwingen. Das rsync-Beispielskript (`nas-backup-rsync.example.sh`) iteriert in einer Schleife über drei verschiedene Verzeichnisse (`media`, `dialog-audio`, `coach-audio`). Wird in `command="..."` ein starrer rsync-Aufruf für `media/` hinterlegt, scheitern die nachfolgenden Schleifendurchläufe für `dialog-audio` und `coach-audio` unweigerlich (oder kopieren dreimal den Inhalt von `media/`). Der Plan spezifiesiert nicht, wie der SSH-Befehlsfilter über mehrere dynamische Verzeichnisse hinweg rechtssicher und read-only formatiert werden soll.

- **Warum später teuer:** Der ausführende Admin steht vor dem Dilemma, dass die in der Doku geforderte SSH-Restriktion das Backup-Skript bricht. In der Praxis führt dies meist dazu, dass der `command="..."`-Filter aus Frustration komplett weggelassen wird – womit dem NAS-Schlüssel (entgegen der Sicherheits-Spec) voller interaktiver Shell- und Lesezugriff auf das gesamte Dateisystem des VPS gewährt wird.

- **Wann es beißt:** Während Phase 3.5 bei der ersten Ausführung des Multi-Directory-Skripts gegen den eingerichteten `backup-read`-Account.

- **Billige Gegenmaßnahme jetzt:** Den exakten API-Vertrag für den `authorized_keys`-Eintrag in Phase 3.4 spezifizieren. Hierzu den offiziellen, bei rsync mitgelieferten Wrapper **`rrsync` (Restricted rsync)** verwenden, der Unterverzeichnisse abdeckt und Schreibzugriffe zuverlässig blockiert:
  ```text
  command="/usr/share/rsync/scripts/rrsync -ro /data/schulnavigator/",no-agent-forwarding,no-port-forwarding,no-pty,no-user-rc,no-X11-forwarding ssh-ed25519 AAAA...
  ```
  *(Hinweis: Falls `rrsync` unter Debian/Ubuntu in `/usr/bin/rrsync` oder `/usr/lib/rsync/rrsync` liegt, Pfad beim Setup per `which rrsync` verifizieren).* Durch den Aufruf mit `-ro` (Read-Only) und dem Basisverzeichnis `/data/schulnavigator/` erlaubt der Wrapper dem NAS legitime Lesezugriffe auf die drei Unterordner, blockiert aber jeden Ausbruch aus diesem Verzeichnis sowie sämtliche Schreibversuche.

---

## Bestätigung: Positivbefunde & Konsistenz

- **Netzwerk-Isolation über Headscale:** Die Entscheidung aus #243, den rsync-Traffic nicht über das öffentliche Internet und Port 22 des VPS zu leiten, sondern ausschließlich über das private Tailscale-Mesh (`100.x` / Headscale-IP) zu führen, schützt die Schüler-Medien vor Man-in-the-Middle-Angriffen und Brute-Force im öffentlichen Netz.
- **Saubere Separation of Concerns (Live vs. Backup):** Der Verzicht auf ein bidirektionales Sync-Tool (wie Syncthing ohne Master) in Phase 1 und die klare Festlegung auf ein einseitiges Pull-Prinzip (`VPS → NAS`) verhindern Split-Brain-Szenarien und unbeabsichtigtes Löschen auf Produktionsseite.
- **Least-Privilege in der Headscale-ACL:** Die Regelung in `acl.hujson`, für das NAS eine dedizierte Gruppe (`group:backup`) anzulegen und dieser exklusiv Zugriff auf Port 22 des VPS-Hosts (`mpz-vps@headscale:22`) zu gewähren, verhindert eine seitliche Ausbreitung (Lateral Movement): Das NAS hat im Tailnet keinerlei Zugriff auf Open WebUI, andere Server oder Clients der Lehrkräfte/Entwickler (`group:clients`).
