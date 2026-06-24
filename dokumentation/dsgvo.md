# Schulnavigator — Datenschutzkonzept

*Status: Entwurf — Deploy-Trennung umgesetzt (ADR-027); AVV-Unterschrift ausstehend (#43) | Stand: 2026-06-24*

## Personenbezogene Daten

- Werden Besucher-Daten gespeichert? (z. B. via Analytics)
- Werden Fotos von Schülerinnen/Schülern veröffentlicht?
- Werden Fotos von Lehrkräften veröffentlicht?

## Einwilligungen

- **Schüler-Medien (Foto/Video/Audio):** Einwilligungen bei der Schule **dokumentiert** (Phase 0, O4, 2026-06-24)
- Verantwortliche Person für Einwilligungserklärungen: Schule (39. Grundschule Dresden)
- Vorlage Einwilligungserklärung: Projekttag / Schule

## Zugriffsschutz (Besucher)

Entscheidung: [ADR-005](./adr/005-zugangskontrolle-token.md), Speicher/Durchsetzung [ADR-007](./adr/007-zugangskontrolle-cookie.md), konfigurierbar [ADR-021](./adr/021-zugangsmodus-konfigurierbar.md)

- Kein öffentliches Login; Zugang über **Entry-QR** (Einladungslink-Charakter, kein starkes Auth-Verfahren)
- HttpOnly-Cookie `sn_access` (ADR-007), Ablaufdatum je Profil (Schulfest vs. Schuljahr)
- Production: Token-Liste aus `SN_ACCESS_TOKENS` (nicht im Quellcode); Default-Modus `gated`
- Keine Besucher-Accounts; Stempel-Fortschritt nur lokal auf dem Gerät
- **`SN_ACCESS_MODE=open`:** Kein Zugangs-Gate — nur für bewusst offene Deployments (z. B. Website-Einbettung); DSB-Einordnung vor Aktivierung klären
- **Einbettung der App** (`SN_EMBED_ANCESTORS`, CSP `frame-ancestors`): Parent-Seite kann Nutzungskontext ändern — Datenschutzerklärung und Verantwortlichkeit der einbettenden Schulwebsite prüfen

## Hosting & Datenspeicherung

- Serverstandort Live-Betrieb: Deutschland (MPZ-Hetzner, siehe [ADR-001](./adr/001-hosting-coolify.md))
- **Deploy-Trennung umgesetzt** ([ADR-027](./adr/027-schuelermedien-nicht-in-git.md), Epic [#226](https://github.com/flxln/schulnavigator/issues/226)): Code über GitHub + Coolify; Schüler-Binärmedien nur auf Hetzner-Volumes per rsync vom MPZ-Rechner. **DSB-Freigabe Phase 1–4** liegt schriftlich vor (Papier, 2026-06-24). MPZ-Workflow: [anleitungen/fuer-entwickler.md](../anleitungen/fuer-entwickler.md) (Abschnitt „Alltags-Deploy").
- Drittanbieter (Video-Hosting, Analytics, …): Video vorerst MPZ; YouTube nur nach Klärung (ADR-004)
- Externe Links (`typ: link`, ADR-017): Die App lädt keine Drittanbieter-Inhalte ein; erst ein expliziter Nutzer-Tap öffnet die HTTPS-Zielseite in einem neuen Tab.
- Delightex-Einbettung (`typ: embed`, ADR-017 Stufe 3): Beim Öffnen eines Embed-Mediums lädt die App Inhalte von Delightex in einem iframe (nur Allowlist-Domain `delightex.com`). DSB-Freigabe liegt vor; **Datenschutzerklärung** um Drittanbieter-Absatz ergänzen (analog YouTube, ADR-004) — noch offen.
- Book-Creator-Einbettung (`typ: embed`, Lesewelt): Beim Öffnen lädt die App das veröffentlichte Buch von `read.bookcreator.com` im iframe (Allowlist `bookcreator.com`). DSB-Freigabe und Datenschutzerklärung-Absatz noch zu klären.

### Speicherorte nach Deploy-Trennung

| Datenart | Speicherort | Transport | Anmerkung |
|----------|-------------|-----------|-----------|
| App-Code, JSON, Konfiguration | GitHub (privat) | `git push` → Coolify | Keine Schüler-Binärdateien (Bahn A) |
| `stations.json`, Coach-Texte | GitHub | wie oben | DSB Option A (O1) |
| Hotspot-/UI-Icons (personenfrei) | GitHub `public/stations-icons/` | Build im Image | Bahn A |
| Raumbilder ohne erkennbare Kinder | GitHub LFS `public/stations/` | Build + LFS | O5 |
| Fotos/Videos mit Schülerinnen/Schülern | Hetzner Volume `/data/schulnavigator/media` | rsync vom MPZ-Rechner | Bahn B; Auslieferung `/media/…` |
| Dialog-Audio (Kinderstimmen) | Hetzner Volume `/data/schulnavigator/dialog-audio` | rsync | Bahn B; Auslieferung `/api/dialog/…` |
| Coach-Audio | Hetzner Volume `/data/schulnavigator/coach-audio` | rsync | Bahn B; Auslieferung `/api/coach/…` |
| Historische Schüler-Medien in Git/LFS | — | Bereinigt 2026-06-24 ([#232](https://github.com/flxln/schulnavigator/issues/232)); Post-Mortem: [post-mortem-232](../reviews/post-mortem/post-mortem-232-2026-06-24.md) |

Ab Phase 1 (#228, 2026-06-24) werden keine neuen Schüler-Binärdateien mehr in Git getrackt oder gepusht.

## Auftragsverarbeitung (AVV)

- **Verhältnis:** MPZ betreibt die App als Auftragsverarbeiter für die 39. Grundschule Dresden
- **Entwurf:** An die Schule **versendet am 21.05.2026** (Thomas, MPZ)
- **Unterschrift:** Ausstehend — GitHub Issue [#43](https://github.com/flxln/schulnavigator/issues/43)
- **Inhalt (Kern):** Hosting in Deutschland, Verantwortlichkeiten, Speicherort der Daten, Verarbeitung von Schüler-Medien nur mit Einwilligung

### Subprozessor GitHub (nur Quellcode)

GitHub, Inc. wird als Subprozessor **ausschließlich** für die Speicherung von Anwendungsquellcode, Konfigurationsdateien und strukturierten Inhaltsdaten (z. B. `stations.json`) im **privaten** Repository genutzt. **Keine** Schüler-Foto-, Video- oder Audio-Binärdateien werden dort gespeichert (DSB O2, 2026-06-24). Schüler-Medien liegen ausschließlich auf MPZ-Hetzner-Servern in Deutschland ([ADR-027](./adr/027-schuelermedien-nicht-in-git.md)).

**Textbaustein für papierbasierten AVV-Anhang** (außerhalb des Repos übernehmen):

> Subprozessor: GitHub, Inc. (privates Repository `flxln/schulnavigator`). Zweck: Versionsverwaltung und Bereitstellung von Anwendungsquellcode, Konfigurationsdateien und strukturierten Inhaltsdaten (z. B. `stations.json`, Hotspot-Koordinaten, Texte). Es werden **keine** Schüler-Foto-, Video- oder Audio-Binärdateien auf GitHub gespeichert. Schüler-Medien werden ausschließlich auf Servern des Medienpädagogischen Zentrums Dresden in Deutschland gehostet und per gesichertem Übertragungsweg (SSH/rsync) vom autorisierten MPZ-Rechner synchronisiert. Stand der technischen Umsetzung: Juni 2026 (ADR-027).

## Offene Punkte

- [ ] AVV von der Schule unterschrieben zurück; GitHub-Anhang aus Textbaustein oben einfügen
- [ ] Datenschutzerklärung für die Website erstellen (inkl. Absatz Delightex/Book Creator bei `typ: embed`)
- [ ] Bei `open` + Website-Einbettung (ADR-021): DSB-Einordnung Parent-Seite / eingebettete App
- [x] Einwilligungen für Schüler-Medien dokumentiert (Schule, 2026-06-24)
- [x] DSB/Schule: Freigabe technische Umsetzung Deploy-Trennung (schriftlich, Papier, 2026-06-24)
- [x] Deploy-Trennung Code vs. Schüler-Medien umgesetzt (ADR-027, #228–#230)
- [x] Git-History: Schüler-Medien aus LFS/GitHub entfernt ([#232](https://github.com/flxln/schulnavigator/issues/232), 2026-06-24; GitHub-Support LFS-Purge ausstehend)
- [ ] Schulleitung / Datenschutzbeauftragten informieren
