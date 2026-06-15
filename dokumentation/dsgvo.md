# Schulnavigator — Datenschutzkonzept

*Status: Entwurf | Stand: 2026-06-15*

## Personenbezogene Daten

- Werden Besucher-Daten gespeichert? (z. B. via Analytics)
- Werden Fotos von Schülerinnen/Schülern veröffentlicht?
- Werden Fotos von Lehrkräften veröffentlicht?

## Einwilligungen

- Verantwortliche Person für Einwilligungserklärungen:
- Vorlage Einwilligungserklärung: —

## Zugriffsschutz (Besucher)

Entscheidung: [ADR-005](./adr/005-zugangskontrolle-token.md), Speicher/Durchsetzung [ADR-007](./adr/007-zugangskontrolle-cookie.md), konfigurierbar [ADR-021](./adr/021-zugangsmodus-konfigurierbar.md)

- Kein öffentliches Login; Zugang über **Entry-QR** (Einladungslink-Charakter, kein starkes Auth-Verfahren)
- HttpOnly-Cookie `sn_access` (ADR-007), Ablaufdatum je Profil (Schulfest vs. Schuljahr)
- Production: Token-Liste aus `SN_ACCESS_TOKENS` (nicht im Quellcode); Default-Modus `gated`
- Keine Besucher-Accounts; Stempel-Fortschritt nur lokal auf dem Gerät
- **`SN_ACCESS_MODE=open`:** Kein Zugangs-Gate — nur für bewusst offene Deployments (z. B. Website-Einbettung); DSB-Einordnung vor Aktivierung klären
- **Einbettung der App** (`SN_EMBED_ANCESTORS`, CSP `frame-ancestors`): Parent-Seite kann Nutzungskontext ändern — Datenschutzerklärung und Verantwortlichkeit der einbettenden Schulwebsite prüfen

## Hosting & Datenspeicherung

- Serverstandort: Deutschland (MPZ-Hetzner, siehe ADR-001)
- Drittanbieter (Video-Hosting, Analytics, …): Video vorerst MPZ; YouTube nur nach Klärung (ADR-004)
- Externe Links (`typ: link`, ADR-017): Die App lädt keine Drittanbieter-Inhalte ein; erst ein expliziter Nutzer-Tap öffnet die HTTPS-Zielseite in einem neuen Tab.
- Delightex-Einbettung (`typ: embed`, ADR-017 Stufe 3): Beim Öffnen eines Embed-Mediums lädt die App Inhalte von Delightex in einem iframe (nur Allowlist-Domain `delightex.com`). DSB-Freigabe liegt vor; **Datenschutzerklärung** um Drittanbieter-Absatz ergänzen (analog YouTube, ADR-004) — noch offen.
- Book-Creator-Einbettung (`typ: embed`, Lesewelt): Beim Öffnen lädt die App das veröffentlichte Buch von `read.bookcreator.com` im iframe (Allowlist `bookcreator.com`). DSB-Freigabe und Datenschutzerklärung-Absatz noch zu klären.

## Auftragsverarbeitung (AVV)

- **Verhältnis:** MPZ betreibt die App als Auftragsverarbeiter für die 39. Grundschule Dresden
- **Entwurf:** An die Schule **versendet am 21.05.2026** (Thomas, MPZ)
- **Unterschrift:** Bis Schulfest (26.06.2026) erforderlich — GitHub Issue #43 (Phase 4)
- **Inhalt (Kern):** Hosting in Deutschland, Verantwortlichkeiten, Speicherort der Daten, Verarbeitung von Schüler-Medien nur mit Einwilligung

## Offene Punkte

- [ ] AVV von der Schule unterschrieben zurück
- [ ] Datenschutzerklärung für die Website erstellen (inkl. Absatz Delightex/Book Creator bei `typ: embed`)
- [ ] Bei `open` + Website-Einbettung (ADR-021): DSB-Einordnung Parent-Seite / eingebettete App
- [ ] Einwilligungen einholen (Projekttag 24./25.06.)
- [ ] Schulleitung / Datenschutzbeauftragten informieren
