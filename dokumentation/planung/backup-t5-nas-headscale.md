# Backup T5 — Synology NAS über Headscale (Entscheidung #243)

**Stand:** 2026-07-05 · **Issue:** [#243](https://github.com/flxln/schulnavigator/issues/243) · **Audit:** S6 (T5)

---

## Entscheidung (Operator 2026-07-05)

| Frage | Entscheidung |
|-------|----------------|
| Zweitkopie wo? | **Synology NAS am MPZ-Standort** (Deutschland), nicht auf dem Entwickler-Laptop |
| Transport | **Headscale** (WireGuard-Mesh, bereits auf MPZ-VPS) — kein rsync/SSH über öffentliches Internet |
| Sync-Mechanismus Phase 1 | **Einseitiges rsync:** VPS (Live) → NAS (Backup, Receive Only) |
| Sync-Mechanismus Phase 2 (optional) | **Syncthing** nur wenn NAS kanonische Upload-Ablage wird — dann Receive Only auf VPS, Versionierung auf NAS |
| Laptop | **Keine dauerhafte Medien-Kopie** — nur Transport/Deploy bis Directus (#47) oder NAS-Master (Phase 2) |

**Verworfen für T5:**

- IONOS-Server-Backup als alleinige Zweitkopie (Kosten/Komplexität; NAS bereits vorhanden)
- Bidirektionales Syncthing ohne festen Master (Lösch-/Konfliktrisiko bei Schüler-Medien)
- Backup auf Entwickler-Laptop als institutionelle Zweitkopie

---

## Zielarchitektur

```text
┌──────────────────┐   deploy:content (Übergang)   ┌─────────────────────┐
│ MPZ-Rechner      │ ─── rsync öffentl. SSH ──────►│ IONOS-VPS (Live)    │
│ (kein Archiv)    │                               │ /data/schulnavigator│
└──────────────────┘                               └──────────┬──────────┘
                                                              │
                              Headscale 100.x (privat)        │ rsync Pull
                                                              │ (nightly)
                                                   ┌──────────▼──────────┐
                                                   │ Synology NAS (MPZ)  │
                                                   │ verschl. Shared Vol.│
                                                   │ …/backup/schulnav…  │
                                                   └─────────────────────┘
```

**Live-Betrieb** bleibt auf dem VPS (Coolify-Volumes). **Backup** ist die NAS-Kopie. Der Laptop ist nicht Bestandteil der Backup-Kette.

---

## Phase 1 — Umsetzung (jetzt)

### 1. Headscale: NAS anmelden

**SSOT:** `~/Projekte/MPZ - Headscale/anleitungen/anleitung_headscale_synology_ds218_schulnavigator.md`  
ACL-Vorlage: `~/Projekte/MPZ - Headscale/staging/headscale/config/acl.hujson`

Kurz:

1. VPS-Host: Tailscale als `mpz-vps@headscale` (Host, nicht Container).
2. NAS: User `schulnavigator-nas@headscale` + Pre-Auth-Key; Tailscale-SPK per SSH mit `--login-server=https://headscale.mpz.schule`.
3. ACL deployen (`group:backup` → `mpz-vps@headscale:22`); Container `headscale-q14bvzpnnfcy8mc9oybu46rj` neu starten.

Notiere die **Headscale-IP des VPS** (`sudo tailscale ip -4` auf dem Host) — rsync nutzt diese statt `217.154.120.240`.

### 2. Synology: Zielordner

| NAS-Pfad (Beispiel) | Quelle VPS |
|---------------------|------------|
| `/volume1/schulnavigator-backup/media` | `/data/schulnavigator/media` |
| `/volume1/schulnavigator-backup/dialog-audio` | `/data/schulnavigator/dialog-audio` |
| `/volume1/schulnavigator-backup/coach-audio` | `/data/schulnavigator/coach-audio` |

- Shared Folder **verschlüsselt** (DSM).
- Kein SMB nach außen; Zugriff nur lokal + über Headscale-Wartung.

### 3. rsync vom NAS (Pull, einseitig)

Auf dem **NAS** (Task Scheduler oder `synocrond`), Beispielskript: [`scripts/nas-backup-rsync.example.sh`](./scripts/nas-backup-rsync.example.sh).

- Richtung: **VPS → NAS** (NAS zieht).
- **Kein `--delete`** im Default (Backup behält ältere Dateien bei VPS-Löschung bis manueller Bereinigung — Löschkonzept mit Schule abstimmen).
- SSH über Headscale-IP des VPS; Key nur auf NAS, `authorized_keys` auf VPS für dedizierten Backup-User empfohlen.

### 4. Verifikation

- Nach erstem Lauf: Dateianzahl/Größe VPS vs. NAS grob vergleichen.
- **Integritäts-Check (E2):** `sha256sum` der NAS-Kopie vs. `ssh -i <Key> backup-read@<VPS_TAILNET_IP> "sha256sum <relativer Pfad>"` — kein Schreib-Restore über `backup-read`.
- Echter Notfall-Restore: MPZ-Admin vom Arbeitsgerät (`group:admin`, ACL `*:*`).
- Task Scheduler: Benachrichtigung bei abnormaler Beendigung aktivieren.

### 5. Doku / AVV

- [`dsgvo.md`](../dsgvo.md) Backup-Abschnitt (erledigt mit dieser Entscheidung).
- Bei AVV-Unterschrift #43: NAS als MPZ-Backup-Speicherort erwähnen.

---

## Phase 2 — Optional (NAS als Master, ohne Laptop-Speicher)

Nur wenn Upload/Ingest **direkt aufs NAS** verlagert wird:

| Knoten | Syncthing-Rolle |
|--------|-----------------|
| NAS | Send & Receive (Master) + **File Versioning** (z. B. 30 Tage) |
| VPS | **Receive Only** — Live-Auslieferung unverändert |

Headscale bleibt Transport-VPN; Syncthing ersetzt dann den Deploy-rsync **von Laptop zu VPS**, nicht die Backup-Richtung.

**Vor Phase 2:** Directus-Gates (#47) oder MPZ-Studio-Upload-Pfad klären.

---

## Directus (#47)

Vor CMS-Einführung Backup-Konzept um **PostgreSQL-Dump** erweitern (gleicher NAS-Pfad oder separates Volume). Medien-Volumes bleiben parallel.

---

## Offen (Umsetzung Phase 1)

- [x] VPS-Host Tailscale `mpz-vps@headscale` — **Tailnet-IP `100.64.0.7`** (2026-07-05)
- [x] Headscale-User `schulnavigator-nas@headscale` angelegt
- [x] ACL mit `group:backup` deployt, Container neu gestartet
- [x] SSH-User `backup-read` auf VPS (rrsync Forced-Command, POSIX-ACLs, Shell `/bin/sh`)
- [x] NAS in Headscale — **Tailnet-IP `100.64.0.9`**, Tailscale-SPK (2026-07-05)
- [x] SSH-Schlüssel auf NAS (`~/.ssh/schulnavigator_backup`)
- [x] Erster Backup-Lauf (~2,8 GB, ~87 min) + Hash-Stichprobe OK
- [ ] Boot-Task `configure-host` in DSM Aufgabenplanung
- [ ] Nightly Task Scheduler (`~/bin/nas-backup-rsync.sh`, Fehler-Benachrichtigung)
- [ ] Optional: Shared Folder `/volume1/schulnavigator-backup` statt Home-Pfad
- [ ] Btrfs Snapshot Replication (30 Tage)
- [x] Issue #243 — nach Verifikation schließen

### DSM — noch manuell (Ops)

**Nightly Backup** — Systemsteuerung → Aufgabenplanung → Geplant → Benutzerdefiniertes Script:

| Feld | Wert |
|------|------|
| Aufgabe | `Schulnavigator Backup` |
| Benutzer | `felixlein` |
| Zeitplan | täglich z. B. 02:00 |
| Script | `/var/services/homes/felixlein/bin/nas-backup-rsync.sh` |
| Benachrichtigung | bei abnormaler Beendigung |

**Boot Tailscale** — Ausgelöste Aufgabe → Boot-up → Benutzer `root`:

```bash
/var/packages/Tailscale/target/bin/tailscale configure-host
synosystemctl restart pkgctl-Tailscale.service
```

**Snapshot Replication** — Btrfs, Ziel `schulnavigator-backup`, täglich, 30 Tage Aufbewahrung (E4).

---

## Referenzen

- [ADR-027](../adr/027-schuelermedien-nicht-in-git.md) — Bahn B, Volumes
- [fuer-entwickler.md](../../anleitungen/fuer-entwickler.md) — Abschnitt „Backup T5“
- Audit S6 / T5: [audit-phase-5 (Pre-Mortem)](../reviews/pre-mortem/audit-phase-5-2026-07-04.md)
