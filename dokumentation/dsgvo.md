# Schulnavigator — Datenschutzkonzept

*Status: v1.0 (beschlossen) — Deploy-Trennung umgesetzt (ADR-027); Media-Gate live (Audit S1, 2026-07-05); AVV unterschrieben 25.06.2026 (#43) | Stand: 2026-07-06*

## Personenbezogene Daten

- **Besucher-Daten:** Kein Analytics, kein Tracking. Fortschritt (Hub-Stempel) nur im `localStorage` des Geräts. Serverseitig: HttpOnly-Cookie `sn_access` für den Eintritt (ADR-007), Access-Logs (IP, URL inkl. `?t=` beim Scan) — siehe Abschnitt Server-Logs.
- **Schülerinnen/Schüler (Foto/Video/Audio):** Ja, mit dokumentierter Einwilligung der Schule (O4, 2026-06-24). Auslieferung über `/media/*` und `/api/dialog/*` nur mit gültigem Entry-Cookie (Middleware + Route, Audit S1).
- **Lehrkräfte (Foto/Video):** Derzeit keine Lehrkräfte-Bilder in der Besucher-App. Geplant: Lehrkräfte-Accounts im CMS (#47) — siehe VVT-Eintrag unten.

## Einwilligungen

- **Schüler-Medien (Foto/Video/Audio):** Einwilligungen bei der Schule **dokumentiert** (Phase 0, O4, 2026-06-24)
- Verantwortliche Person für Einwilligungserklärungen: Schule (39. Grundschule Dresden)
- Vorlage Einwilligungserklärung: Projekttag / Schule

## Zugriffsschutz (Besucher)

Entscheidung: [ADR-005](./adr/005-zugangskontrolle-token.md), Speicher/Durchsetzung [ADR-007](./adr/007-zugangskontrolle-cookie.md), konfigurierbar [ADR-021](./adr/021-zugangsmodus-konfigurierbar.md)

- Kein öffentliches Login; Zugang über **Entry-QR** (Einladungslink-Charakter — siehe ADR-021; kein Geheimnis, Schutzziel ist das Gate)
- HttpOnly-Cookie `sn_access` (ADR-007), Ablaufdatum je Profil (Schulfest vs. Schuljahr)
- Production: Token-Liste aus `SN_ACCESS_TOKENS` (nicht im Quellcode); Default-Modus `gated`
- Keine Besucher-Accounts; Stempel-Fortschritt nur lokal auf dem Gerät
- **`SN_ACCESS_MODE=open`:** Kein Zugangs-Gate — nur für bewusst offene Deployments (z. B. Website-Einbettung); DSB-Einordnung vor Aktivierung klären
- **Einbettung der App** (`SN_EMBED_ANCESTORS`, CSP `frame-ancestors`): Parent-Seite kann Nutzungskontext ändern — Datenschutzerklärung und Verantwortlichkeit der einbettenden Schulwebsite prüfen

## Hosting & Datenspeicherung

- Serverstandort Live-Betrieb: Deutschland (MPZ-VPS bei IONOS, siehe [ADR-001](./adr/001-hosting-coolify.md))
- **Deploy-Trennung umgesetzt** ([ADR-027](./adr/027-schuelermedien-nicht-in-git.md), Epic [#226](https://github.com/flxln/schulnavigator/issues/226)): Code über GitHub + Coolify; Schüler-Binärmedien nur auf VPS-Volumes (IONOS) per rsync vom MPZ-Rechner. **DSB-Freigabe Phase 1–4** liegt schriftlich vor (Papier, 2026-06-24). MPZ-Workflow: [anleitungen/fuer-entwickler.md](../anleitungen/fuer-entwickler.md) (Abschnitt „Alltags-Deploy").
- Drittanbieter (Video-Hosting, Analytics, …): Video vorerst MPZ; YouTube nur nach Klärung (ADR-004)
- Externe Links (`typ: link`, ADR-017): Die App lädt keine Drittanbieter-Inhalte ein; erst ein expliziter Nutzer-Tap öffnet die HTTPS-Zielseite in einem neuen Tab.
- Delightex-Einbettung (`typ: embed`, ADR-017 Stufe 3): Beim Öffnen eines Embed-Mediums lädt die App Inhalte von Delightex in einem iframe (nur Allowlist-Domain `delightex.com`). DSB-Freigabe liegt vor; Datenschutzerklärung enthält Drittanbieter-Absatz.
- Book Creator (Lesewelt): **Stand 2026-07-05:** als `typ: link` (externer Tab) — kein iframe bis formale DSB-Freigabe für Einbettung. DSE und VVT synchron gehalten.

### Speicherorte nach Deploy-Trennung

| Datenart | Speicherort | Transport | Anmerkung |
|----------|-------------|-----------|-----------|
| App-Code, JSON, Konfiguration | GitHub (privat) | `git push` → Coolify | Keine Schüler-Binärdateien (Bahn A) |
| `stations.json`, Coach-Texte | GitHub | wie oben | DSB Option A (O1) |
| Hotspot-/UI-Icons (personenfrei) | GitHub `public/stations-icons/` | Build im Image | Bahn A |
| Raumbilder ohne erkennbare Kinder | GitHub LFS `public/stations/` | Build + LFS | O5 |
| Fotos/Videos mit Schülerinnen/Schülern | VPS-Volume `/data/schulnavigator/media` (IONOS) | rsync vom MPZ-Rechner (Übergang) | Bahn B; Backup-Kopie NAS (Headscale, #243) |
| Dialog-Audio (Kinderstimmen) | VPS-Volume `/data/schulnavigator/dialog-audio` (IONOS) | rsync | Bahn B; Backup NAS |
| Coach-Audio | VPS-Volume `/data/schulnavigator/coach-audio` (IONOS) | rsync | Bahn B; Backup NAS |
| Historische Schüler-Medien in Git/LFS | — | Bereinigt 2026-06-24 ([#232](https://github.com/flxln/schulnavigator/issues/232)); V9 (refs/pull/*) offen — siehe [offen.md](./planung/offen.md) |

Ab Phase 1 (#228, 2026-06-24) werden keine neuen Schüler-Binärdateien mehr in Git getrackt oder gepusht.

## Server-Logs

- **Traefik/Coolify Access-Logs:** IP-Adressen, angeforderte URLs (inkl. `GET /eintritt?t=<token>` beim QR-Scan). Token sind Einladungslinks (ADR-021), dennoch kurze Aufbewahrung anstreben.
- **Ziel-Retention:** ≤ 14 Tage — Bestätigung durch Server-Admin ausstehend (Audit S9, 2026-07-05).
- **Kein Error-Tracking-Drittanbieter** (bewusste Entscheidung).

## Verarbeitungsverzeichnis (Art. 30, Kurzfassung)

| Verarbeitung | Betroffene | Zweck | Rechtsgrundlage | Speicherort | Löschfrist |
|--------------|------------|-------|-----------------|-------------|------------|
| Entry-Cookie `sn_access` | Besucher | Zugangskontrolle Schulfest/TOT | Art. 6 (1) f | Browser (HttpOnly) | Token-Ablauf (z. B. 31.07.2027) |
| Hub-Fortschritt | Besucher | Gamification im Rundgang | Art. 6 (1) f | `localStorage` (Gerät) | Nutzer löscht Browserdaten |
| Access-Logs | Besucher | Betrieb, Fehleranalyse | Art. 6 (1) f | Traefik/Coolify (VPS) | ≤ 14 Tage (Ziel) |
| Schüler-Medien | Schüler | Virtueller Schulrundgang | Einwilligung + Art. 6 (1) a | VPS-Volumes DE; Backup NAS MPZ | Projektende + Schulfristen |
| Lehrkräfte-Accounts (geplant) | Lehrkräfte | Content-Pflege CMS | Art. 6 (1) e | Directus-DB (DE, geplant) | Bei Ausscheiden aus Kollegium |

Details Directus: [directus-auth-konzept.md](./spezifikationen/directus-auth-konzept.md)

## Datenschutzbeauftragter

- **Für die Schule (Verantwortliche):** Datenschutzbeauftragter des Landesamtes für Schule und Bildung (LaSuB) — nicht die Schulleitung in Personalunion (Art. 38 Abs. 6 DSGVO). Kontakt in DSE/Impressum via `dsb-contact.ts`.
- **Schulleitung** (Ines Schubert): Verantwortlich für **Inhalte**, nicht als behördlicher DSB benannt.

## Auftragsverarbeitung (AVV)

- **Verhältnis:** MPZ betreibt die App als Auftragsverarbeiter für die 39. Grundschule Dresden
- **Entwurf:** An die Schule **versendet am 21.05.2026** (Thomas, MPZ)
- **Unterschrift:** **25.06.2026** — beidseitig; Ablage MPZ (Hefter). GitHub [#43](https://github.com/flxln/schulnavigator/issues/43) geschlossen (2026-07-06). Anhang Speicherorte inkl. ADR-027 bestätigt.
- **Inhalt (Kern):** Hosting in Deutschland, Verantwortlichkeiten, Speicherort der Daten (ADR-027), Verarbeitung von Schüler-Medien nur mit Einwilligung
- **Prüfung vor Unterschrift:** Anhang Speicherorte gegen ADR-027-Stand (Juni 2026) abgleichen; GitHub-Subprozessor-Textbaustein beilegen

### Subprozessor GitHub (nur Quellcode)

GitHub, Inc. wird als Subprozessor **ausschließlich** für die Speicherung von Anwendungsquellcode, Konfigurationsdateien und strukturierten Inhaltsdaten (z. B. `stations.json`) im **privaten** Repository genutzt. **Keine** Schüler-Foto-, Video- oder Audio-Binärdateien werden dort gespeichert (DSB O2, 2026-06-24). Schüler-Medien liegen ausschließlich auf dem IONOS-VPS des MPZ in Deutschland ([ADR-027](./adr/027-schuelermedien-nicht-in-git.md)).

**Textbaustein für papierbasierten AVV-Anhang** (außerhalb des Repos übernehmen):

> Subprozessor: GitHub, Inc. (privates Repository `flxln/schulnavigator`). Zweck: Versionsverwaltung und Bereitstellung von Anwendungsquellcode, Konfigurationsdateien und strukturierten Inhaltsdaten (z. B. `stations.json`, Hotspot-Koordinaten, Texte). Es werden **keine** Schüler-Foto-, Video- oder Audio-Binärdateien auf GitHub gespeichert. Schüler-Medien werden ausschließlich auf dem IONOS-VPS des Medienpädagogischen Zentrums Dresden in Deutschland gehostet und per gesichertem Übertragungsweg (SSH/rsync) vom autorisierten MPZ-Rechner auf den VPS synchronisiert (Übergang bis NAS-Master oder Directus). Stand der technischen Umsetzung: Juni 2026 (ADR-027).

## Backup (T5)

- **Live:** VPS-Volumes `media`, `dialog-audio`, `coach-audio` unter `/data/schulnavigator/` (IONOS, DE).
- **Zweitkopie (entschieden 2026-07-05, [#243](https://github.com/flxln/schulnavigator/issues/243)):** Synology NAS am MPZ-Standort, verschlüsselter Shared Folder; Sync **VPS → NAS** über **Headscale** (WireGuard-Mesh), einseitiges **rsync** (Phase 1). Details: [backup-t5-nas-headscale.md](../anleitungen/backup-t5/backup-t5-nas-headscale.md).
- **Entwickler-Laptop:** keine institutionelle Medien-Kopie — nur Deploy-Transport (`deploy:content`), bis Upload auf NAS oder Directus (#47).
- **Phase 2 optional:** Syncthing (NAS Master, VPS Receive Only) — nur bei direktem NAS-Upload.
- **Vor Directus (#47):** Backup-Konzept um Directus-Datenbank erweitern.

## Offene Punkte

- [x] AVV von der Schule unterschrieben zurück (25.06.2026); Anhang ADR-027/GitHub-Subprozessor enthalten
- [x] Datenschutzerklärung für die App (`/datenschutz`, Juni 2026); Delightex-Absatz; Book Creator als Link bis DSB-Embed-Freigabe
- [ ] Bei `open` + Website-Einbettung (ADR-021): DSB-Einordnung Parent-Seite / eingebettete App
- [x] Einwilligungen für Schüler-Medien dokumentiert (Schule, 2026-06-24)
- [x] DSB/Schule: Freigabe technische Umsetzung Deploy-Trennung (schriftlich, Papier, 2026-06-24)
- [x] Deploy-Trennung Code vs. Schüler-Medien umgesetzt (ADR-027, #228–#230)
- [x] Git-History: Schüler-Medien aus LFS/GitHub entfernt ([#232](https://github.com/flxln/schulnavigator/issues/232), 2026-06-24); V9 (refs/pull/*) offen
- [x] DSB-Kontakt: LaSuB-DSB in App/DSE (2026-07-05); Schulleitung nur für Inhalte
- [x] Media-Gate `/media/*` live (Middleware + Route, Prod 2026-07-05)
- [ ] Log-Retention Traefik/Coolify bestätigen (Ziel ≤ 14 Tage)
- [x] HSTS am Proxy aktivieren (#242, 2026-07-05)
- [ ] Volume-Backup T5 umsetzen ([#243](https://github.com/flxln/schulnavigator/issues/243) — Entscheidung NAS/Headscale: [backup-t5-nas-headscale.md](../anleitungen/backup-t5/backup-t5-nas-headscale.md); Cron/Restore ausstehend)
