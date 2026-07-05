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

1. Auf dem VPS: Headscale-Admin (bereits als Coolify-Service `headscale-…` erreichbar).
2. Am NAS: Tailscale-Client mit **Headscale** als Coordination Server (DSM Paket oder `tailscale` CLI) — nur MPZ-Admin-Geräte.
3. **ACL:** Nur NAS + VPS (optional ein Admin-Laptop für Wartung), keine weiteren Peers im Schulnavigator-Mesh.

Notiere die **Headscale-IP des VPS** (z. B. `100.x.y.z`) — rsync nutzt diese statt der öffentlichen VPS-IP.

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
- **Restore-Test:** eine Datei von NAS nach `/tmp` auf VPS zurückkopieren und Hash prüfen.
- Eintrag in Task Scheduler-Log + jährlicher Restore-Test in Kalender.

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

- [ ] NAS in Headscale eingebunden
- [ ] Dedizierter SSH-Backup-User auf VPS (optional, empfohlen)
- [ ] Cron/Task Scheduler auf NAS aktiv
- [ ] Erster Backup-Lauf + Restore-Test dokumentiert
- [ ] Issue #243 schließen nach Verifikation

---

## Referenzen

- [ADR-027](../adr/027-schuelermedien-nicht-in-git.md) — Bahn B, Volumes
- [fuer-entwickler.md](../../anleitungen/fuer-entwickler.md) — Abschnitt „Backup T5“
- Audit S6 / T5: [audit-phase-5 (Pre-Mortem)](../reviews/pre-mortem/audit-phase-5-2026-07-04.md)
