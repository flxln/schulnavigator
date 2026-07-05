# Kurz-Checkliste: Issue #246 — NAS Backup: Boot-Task Tailscale + nightly rsync-Cron

**Stufe:** LIGHT · **Pipeline:** klassisch  
**Follow-up zu:** #243  
**Triage:** 2026-07-05 (Score 2/8, A=0 B=1 C=0 D=1)  
**Status:** ✅ abgeschlossen (2026-07-06) — [Post-Mortem](../reviews/post-mortem/post-mortem-246-2026-07-05.md): Go

## Ziel & Akzeptanzkriterien

- [x] Boot-Task `Tailscale Headscale Boot` (Benutzer `root`, Ereignis Boot-up) führt `configure-host` und `pkgctl-Tailscale.service`-Restart aus.
- [x] Geplanter Task `Schulnavigator Backup` (Benutzer `felixlein`, täglich 02:00) ruft das in Schritt 1 bestätigte rsync-Skript auf.
- [x] DSM-Benachrichtigung „bei abnormaler Beendigung" ist für den Backup-Task aktiv **und** ein global konfigurierter, per Testnachricht bestätigter Zustellkanal (E-Mail/SMTP oder Push) ist im DSM-Benachrichtigungscenter vorhanden.³
- [x] `~/headscale-nas-setup.sh` auf dem NAS existiert nicht mehr (Pre-Auth-Key entfernt).
- [x] Nach NAS-Reboot: `tailscale status` zeigt Node online (`100.64.0.9`); manueller oder erster Cron-Lauf endet mit Exit 0.

## Ausführungs-Checkliste

- [x] 1. **NAS SSH** (`felixlein@192.168.0.239`, Port 2222): Skript vorhanden und ausführbar — `test -x ~/bin/nas-backup-rsync.sh && head -3 ~/bin/nas-backup-rsync.sh` → Exit 0. Schlägt das fehl, tatsächlichen Ablageort ermitteln: `find /var/services/homes/felixlein -maxdepth 3 -iname 'nas-backup-rsync.sh' 2>/dev/null` — gefundenen Pfad notieren, Schritt 6 nutzt ihn.¹
- [x] 2. **Servicename prüfen** (als root — `ssh felixlein@192.168.0.239 -p 2222`, danach `sudo -i`; derselbe Login-Weg gilt für Schritt 3): `synosystemctl list-units | grep -i tailscale` → `pkgctl-Tailscale.service` sichtbar (PM #243 F4).² ⚠️ *Abweichung A — siehe Post-Mortem.*
- [x] 3. **Boot-Task anlegen** — DSM → Systemsteuerung → Aufgabenplanung → Erstellen → Ausgelöste Aufgabe → Benutzerdefiniertes Script: Name `Tailscale Headscale Boot`, Benutzer `root`, Ereignis `Boot-up`, Script wie in Teil D der SSOT-Anleitung (`configure-host` + `synosystemctl restart pkgctl-Tailscale.service`).
- [x] 4. **Reboot-Test** — NAS neu starten; nach ~3 min SSH: `/var/packages/Tailscale/target/bin/tailscale ip -4` → `100.64.0.9`; `tailscale status` → `mpz-vps` erreichbar. Beim ersten Versuch nicht grün? Zuerst einen zweiten Reboot abwarten (Boot-up-Trigger feuert ggf. vor dem Tailscale-Daemon-Socket), dann erst tiefer suchen.⁴
- [x] 5. **Benachrichtigungskanal prüfen** (vor Nightly-Task) — DSM → Systemsteuerung → Benachrichtigung: mindestens ein aktiver Kanal (E-Mail/SMTP oder Push) konfiguriert und per „Testnachricht senden" bestätigt. Ohne globalen Kanal bleibt die Per-Task-Checkbox in Schritt 6 wirkungslos.³
- [x] 6. **Nightly-Task anlegen** — DSM → Aufgabenplanung → Geplant → Benutzerdefiniertes Script: Name `Schulnavigator Backup`, Benutzer `felixlein`, täglich 02:00, Script = der in Schritt 1 bestätigte Pfad (Default `/var/services/homes/felixlein/bin/nas-backup-rsync.sh`, sonst der per `find` ermittelte), Benachrichtigung bei abnormaler Beendigung aktivieren.¹
- [x] 7. **Manueller Probelauf** — Task einmal „Ausführen" oder das in Schritt 1 bestätigte Skript per SSH → Ausgabe `Backup completed …`, Exit 0.
- [x] 8. **Setup-Skript löschen** — `rm ~/headscale-nas-setup.sh`; `test ! -f ~/headscale-nas-setup.sh` → Exit 0.

## Verifikation

- [x] Boot-Task in Aufgabenplanung sichtbar (Ausgelöste Aufgabe, `root`, Boot-up).
- [x] Backup-Task sichtbar (Geplant, `felixlein`, 02:00, Benachrichtigung an).
- [x] Nach Reboot: Tailscale online, Ping/SSH zu `backup-read@100.64.0.7` vom NAS OK.
- [x] Letzter Task-Log des Backup-Jobs endet mit Erfolg **und** ein bewusst fehlgeschlagener Testlauf löst nachweislich eine DSM-Mail/Benachrichtigung aus — Zustellung im Postfach/Push bestätigt, nicht nur die Checkbox gesetzt.³

**Letzter dokumentierter Abgleich:** 2026-07-06 — Post-Mortem „Go", alle Akzeptanzkriterien erfüllt. Abweichung A (`synosystemctl list-units`) dokumentiert, nicht blockierend.

## Referenzen

- Issue [#246](https://github.com/flxln/schulnavigator/issues/246)
- Post-Mortem [#246](../reviews/post-mortem/post-mortem-246-2026-07-05.md) — Go, 2026-07-06
- Post-Mortem [#243](dokumentation/reviews/post-mortem/post-mortem-243-2026-07-05.md) — offene Ops-Punkte
- [backup-t5-nas-headscale.md](backup-t5-nas-headscale.md) — DSM-Felder (Zeilen 130–147)
- [nas-backup-rsync.example.sh](scripts/nas-backup-rsync.example.sh) · [nas-headscale-configure-host.example.sh](scripts/nas-headscale-configure-host.example.sh)
- SSOT: `~/Projekte/MPZ - Headscale/anleitungen/anleitung_headscale_synology_ds218_schulnavigator.md` (Teil D)
- Pre-Mortem 1a #243 F4 (Boot-Task-Servicename)
- Pre-Mortem 1a #246: `dokumentation/reviews/pre-mortem/pre-mortem-1a-nas-boot-cron-246-2026-07-05.md`

## Nicht in Scope

- Btrfs Snapshot Replication → #247
- Headscale-Node `100.64.0.8` bereinigen → #248
- Shared Folder `/volume1/schulnavigator-backup` statt Home-Pfad (optional, #243)
- Änderungen am rsync-Skript oder VPS/`backup-read`

## Offene Punkte

- keine (Follow-ups in #247/#248)

## Änderungslog

Gehärtet nach Pre-Mortem 1a (2026-07-05):

- ¹ 1a F1 (Blocker): Schritt 1 um `find`-Fallback ergänzt und Schritt 6 auf den dort bestätigten Skript-Pfad umgestellt — kein Vorgänger-Artefakt belegt `~/bin/` als Ablageort.
- ² 1a F2 (Hinweis): Schritt 2 nennt den zweistufigen Root-Login (`ssh felixlein@… -p 2222` → `sudo -i`), gilt auch für Schritt 3 — DSM erlaubt keinen direkten Root-SSH-Login.
- ³ 1a F3 (Blocker): Akzeptanzkriterium erweitert + neuer Schritt 5 prüft den global konfigurierten, getesteten DSM-Zustellkanal; Verifikation hebt den bewusst fehlgeschlagenen Testlauf von „oder" auf verpflichtend — die Per-Task-Checkbox allein garantiert keine Zustellung.
- ⁴ 1a F4 (Hinweis, niedrige Konfidenz): Schritt 4 mit Notiz zum zweiten Reboot vor tieferer Fehlersuche — Boot-up-Trigger feuert ggf. vor dem Tailscale-Socket.

**2026-07-06:** Abschluss — Checkliste `[x]`, Status „abgeschlossen", Post-Mortem verlinkt. Abweichung A dokumentiert (Service-Name korrekt, nur nicht via `list-units` sichtbar).