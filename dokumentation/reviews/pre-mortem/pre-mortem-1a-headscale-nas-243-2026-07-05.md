---
tags:
  - pre-mortem
  - 01a-code-praxis
  - headscale-nas
  - backup
  - issue-243
erstellt: 2026-07-05
plan: .cursor/plans/headscale_nas_backup_#243_2548ea44.plan.md
modell: claude-sonnet-5
gegenstück: pre-mortem-1b-headscale-nas-243-2026-07-05.md
---

# Pre-Mortem 1a — Headscale NAS Backup #243 (Code-Praxis / Ops-Ausführung)

**Geprüft:** Plan `headscale_nas_backup_#243_2548ea44.plan.md` Zeile für Zeile gegen die referenzierte SSOT-Anleitung (`~/Projekte/MPZ - Headscale/anleitungen/anleitung_headscale_synology_ds218_schulnavigator.md`), die Headscale-ACL (`~/Projekte/MPZ - Headscale/staging/headscale/config/acl.hujson`) und das rsync-Beispielskript (`anleitungen/backup-t5/scripts/nas-backup-rsync.example.sh`). Alle Dateien wurden vollständig gelesen, nicht nur referenziert. Fokus: Befehle, die beim tatsächlichen Tippen auf VPS/NAS sofort scheitern — nicht Architektur oder Spec-Widersprüche (siehe [[pre-mortem-1b-headscale-nas-243-2026-07-05|1b]], das bereits Berechtigungsmodell, ACL-Restore-Widerspruch und die `authorized_keys`-Mehrpfad-Restriktion abdeckt).

**Gesamturteil:** Drei Funde stoppen die Ausführung am ersten Tag, alle auf Ebene „Plan-Kurzform vs. tatsächlich lauffähiger Befehl" — kein einziger davon ist in 1b behandelt. Die ACL-Regel selbst und die rsync-Flag-Wahl sind solide (siehe Bestätigung am Ende).

---

## Funde (nach Zeitpunkt des Beißens sortiert)

### F1 — `headscale`-Befehle in Plan Phase 3.1/3.2 fehlt der `docker exec`-Wrapper (Blocker, buchstäblich erster Befehl)

- **Was:** Plan-Zeile 142 (Phase 3.1, Schritt 3): `` `headscale users create mpz-vps@headscale` (falls fehlend) ``. Plan-Zeile 146 (Verify): `` `headscale nodes list` ``. Plan-Zeile 150 (Phase 3.2, Schritt 1): `` `headscale users create schulnavigator-nas@headscale` ``. Alle drei sind bare CLI-Aufrufe, ausgeführt „auf dem VPS" nach `ssh coolify-server`. Die eigene SSOT-Anleitung, auf die der Plan verweist, zeigt aber durchgängig die tatsächlich lauffähige Form (Zeilen 58–61, 98–100, 177–178, 192): `sudo docker exec -it headscale-q14bvzpnnfcy8mc9oybu46rj headscale ...` — weil Headscale im Docker-Container läuft (Anleitung Zeile 47: „Headscale läuft **im Docker-Container**"), nicht als Host-Binary. Ein Host, der gerade erst frisch Tailscale per `curl | sh` bekommen hat (Phase 3.1, Schritt 2), hat so gut wie sicher **kein** `headscale`-Server-Binary im PATH.
- **Warum später teuer:** Wer den Plan als Ausführungs-Skript liest (er ist dafür geschrieben — Schritt-für-Schritt-Nummerierung, keine Prosa), tippt `headscale users create ...` direkt auf dem Host-Prompt ein. Ergebnis: `command not found`. Kein Logikfehler, aber ein vermeidbarer Stopp, der bei jedem der drei Aufrufe (User anlegen ×2, Nodes-Verify) erneut zuschlägt, wenn man sich die Anleitung nicht parallel aufhält.
- **Wann es beißt:** Sofort bei Phase 3.1 Schritt 3 — vor jedem weiteren Schritt der Pipeline, da `mpz-vps@headscale` ohne diesen Befehl nicht existiert und Schritt 4 (`tailscale up --auth-key=...`) einen gültigen Pre-Auth-Key für genau diesen User voraussetzt.
- **Gegenmaßnahme (billig):** Die drei Plan-Zeilen (142, 146, 150) 1:1 durch die Docker-exec-Form aus der Anleitung ersetzen, inklusive `sudo docker exec -it headscale-q14bvzpnnfcy8mc9oybu46rj` davor. Gleichzeitig ergänzen, dass die Pre-Auth-Key-Erzeugung (Phase 3.1 Schritt „Pre-Auth-Key", Anleitung Zeile 64–69) die **numerische** User-ID voraussetzt — die man nur über ein vorheriges `headscale users list` bekommt. Der Plan-Text springt direkt zu `<ID_mpz-vps>`, als läge sie schon vor.

### F2 — SSH-Schlüsselpaar für `backup-read` wird an keiner Stelle erzeugt

- **Was:** Plan Phase 3.4 (Zeile 170–176) sagt „User `backup-read`, Key nur auf NAS" und „`authorized_keys` eingeschränkt" — aber nirgendwo in Plan, Anleitung oder Spec (`backup-t5-nas-headscale.md` Zeile 78: „Key nur auf NAS, `authorized_keys` auf VPS ... empfohlen") steht ein `ssh-keygen`-Schritt. Das rsync-Beispielskript (`nas-backup-rsync.example.sh` Zeile 10) referenziert den privaten Schlüssel bereits als gegeben: `SSH_KEY="${SSH_KEY:-/var/services/homes/admin/.ssh/schulnavigator_backup}"`. Phase 3.4 ist als VPS-seitiger Schritt gerahmt (User + `authorized_keys` anlegen), Phase 3.5 ist NAS-seitig (Skript anpassen, Cron) — an der Naht zwischen beiden fehlt der Schritt „auf dem NAS `ssh-keygen -t ed25519 -f .../schulnavigator_backup` ausführen, Public Key nach VPS kopieren, in `authorized_keys` von `backup-read` eintragen".
- **Warum später teuer:** Man kommt bis Phase 3.5, startet das angepasste Skript, und `ssh -i /var/services/homes/admin/.ssh/schulnavigator_backup ...` scheitert mit „No such file" — der Fehler taucht erst nach Abschluss der VPS-Phase auf, wenn man vermutlich schon zum nächsten Terminal-Fenster (NAS statt VPS) gewechselt hat und die Ursache woanders sucht (ACL? Tailscale? Firewall?) als beim eigentlich fehlenden Schlüsselpaar.
- **Wann es beißt:** Erster Testlauf des rsync-Skripts in Phase 3.5, nicht früher — die Verify-Zeile aus Phase 3.4 (`ssh backup-read@<VPS_TAILNET_IP> echo ok`) läuft ja typischerweise vom Admin-Rechner mit einem anderen, bereits vorhandenen Schlüssel und verdeckt das Fehlen des dedizierten NAS-Schlüssels.
- **Gegenmaßnahme (billig):** In Phase 3.4 einen expliziten Schritt „0. Auf dem NAS: `ssh-keygen -t ed25519 -f /var/services/homes/admin/.ssh/schulnavigator_backup -N ''`, Public Key (`.pub`) nach VPS kopieren" ergänzen — vor „`authorized_keys` eingeschränkt". Sonst hängt Schritt 2 in der Luft.

### F3 — rsync-Loop mit `set -euo pipefail` bricht beim ersten Fehler komplett ab, ohne Log/Alert

- **Was:** `nas-backup-rsync.example.sh` Zeile 6 setzt `set -euo pipefail`; die drei Verzeichnisse (`media`, `dialog-audio`, `coach-audio`) laufen in einer `for`-Schleife (Zeile 16–23), jede Iteration macht `mkdir -p` + `rsync`. Mit `set -e` beendet **jeder** nicht-null Exit-Code (ein einzelner verlorener Netzwerk-Packet-Timeout, eine gesperrte Datei, ENOSPC in genau einem Unterordner) das gesamte Skript sofort — die restlichen Verzeichnisse in der Schleife werden für diese Nacht gar nicht mehr angefasst. Das Skript schreibt kein eigenes Log, keinen strukturierten Exit-Status, keine Benachrichtigung; die einzige Spur ist der DSM-Task-Scheduler-Log-Eintrag (Plan Post-Mortem-Abschnitt, Zeile 190: „Tailnet-IPs ... Abweichungen ... offene Punkte" — Verifikation ist dort rein manuell vorgesehen).
- **Warum später teuer:** Ein einmaliger, transienter Netzwerkfehler (Tailscale-Reconnect, DSM-Update-Reboot mitten in der Nacht) reicht, damit `coach-audio` oder `dialog-audio` tagelang nicht mehr gesichert wird — und niemand merkt es, weil kein Alerting existiert und der Plan als einzige Kontrolle einen manuellen Dateianzahl-Vergleich nach dem *ersten* Lauf vorsieht (Spec `backup-t5-nas-headscale.md` Zeile 82), nicht danach.
- **Wann es beißt:** Frühestens Wochen nach Inbetriebnahme, bei der ersten transienten Störung während des nächtlichen Zeitfensters — genau dann, wenn niemand mehr aktiv hinschaut, weil „das Backup ja seit dem ersten Test läuft".
- **Gegenmaßnahme (billig):** Schleife robust machen, ohne die Fail-Fast-Absicht zu verlieren — pro Verzeichnis Exit-Code einsammeln statt das Skript abzubrechen, am Ende non-zero exiten wenn irgendein Verzeichnis fehlschlug (DSM Task Scheduler markiert den Task dann korrekt als fehlgeschlagen, alle drei Verzeichnisse wurden trotzdem versucht):
  ```bash
  status=0
  for dir in media dialog-audio coach-audio; do
    mkdir -p "${NAS_ROOT}/${dir}"
    rsync -avz --no-perms --no-owner --no-group -e "${RSYNC_SSH}" \
      "${VPS_USER}@${VPS_HEADSCALE_IP}:${REMOTE_ROOT}/${dir}/" "${NAS_ROOT}/${dir}/" \
      || { echo "FEHLER bei ${dir}" >&2; status=1; }
  done
  exit "${status}"
  ```
  (`set -e` dafür lokal um die Schleife herum deaktivieren oder wie oben mit `||`-Fänger arbeiten.)

### F4 — Kleinigkeiten, die kurz aufhalten

- **Boot-Task-Servicename ungeprüft (niedrige Konfidenz):** Anleitung Teil D, Zeile 211: `synosystemctl restart pkgctl-Tailscale.service`. Plausibel korrekt für DSM-7-Paketdienste, aber nicht gegen die konkrete installierte Tailscale-SPK-Version verifiziert — falls der Dienstname abweicht, merkt man das erst beim ersten NAS-Reboot-Test (Anleitung Zeile 214 empfiehlt genau diesen Test), also nicht „silent", aber ein unnötiger zweiter Anlauf. Vor Ausführung einmal `synosystemctl list-units | grep -i tailscale` (oder Äquivalent) zur Bestätigung.
- **`mkey:`-Fallback in Teil C ist ein bedingter Zweig, kein linearer Schritt:** Anleitung Zeile 174–179 sagt „Falls `mkey:` ausgegeben wird" — der Plan (Phase 3.3) verkürzt das auf „NAS Tailscale-SPK, tailscale up, Boot-Task" ohne den bedingten Registrierungs-Schritt zu erwähnen. Wer nur den Plan liest, weiß nicht, dass `tailscale up` auf dem NAS ins Leere laufen kann, bis man auf dem VPS manuell `headscale nodes register` nachschiebt.

---

## Bestätigung: Klassen, die solide sind

- **rsync-Flags (`--no-perms --no-owner --no-group`):** Verhindert genau die UID/GID-Mismatch-Fehler, die sonst zwischen VPS-Host-User und NAS-`admin`-User beim Transfer selbst auftreten würden (unabhängig vom in 1b behandelten Lesezugriffs-Problem auf der VPS-Quellseite) — saubere, bewusste Wahl.
- **ACL-Struktur (`acl.hujson`):** `group:backup` exklusiv auf `mpz-vps@headscale:22`, kein Zugriff auf `group:clients`-Ziele — als Config-Objekt syntaktisch und strukturell in sich konsistent, keine verwaisten Referenzen (`schulnavigator-nas@headscale` einziges Mitglied, `mpz-vps@headscale` einziges Dst-Ziel).
