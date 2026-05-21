# Schulnavigator — Datenschutzkonzept

*Status: Entwurf | Stand: 2026-05-21*

## Personenbezogene Daten

- Werden Besucher-Daten gespeichert? (z. B. via Analytics)
- Werden Fotos von Schülerinnen/Schülern veröffentlicht?
- Werden Fotos von Lehrkräften veröffentlicht?

## Einwilligungen

- Verantwortliche Person für Einwilligungserklärungen:
- Vorlage Einwilligungserklärung: —

## Zugriffsschutz (Besucher)

Entscheidung: [ADR-005](./adr/005-zugangskontrolle-token.md)

- Kein öffentliches Login; Zugang über **Entry-QR** (Einladungslink-Charakter, kein starkes Auth-Verfahren)
- Token im Browser (`localStorage`), Ablaufdatum je Profil (Schulfest vs. Schuljahr)
- Keine Besucher-Accounts; Stempel-Fortschritt nur lokal auf dem Gerät

## Hosting & Datenspeicherung

- Serverstandort: Deutschland (MPZ-Hetzner, siehe ADR-001)
- Drittanbieter (Video-Hosting, Analytics, …): Video vorerst MPZ; YouTube nur nach Klärung (ADR-004)

## Auftragsverarbeitung (AVV)

- **Verhältnis:** MPZ betreibt die App als Auftragsverarbeiter für die 39. Grundschule Dresden
- **Entwurf:** An die Schule **versendet am 21.05.2026** (Thomas, MPZ)
- **Unterschrift:** Bis Schulfest (26.06.2026) erforderlich — GitHub Issue #43 (Phase 4)
- **Inhalt (Kern):** Hosting in Deutschland, Verantwortlichkeiten, Speicherort der Daten, Verarbeitung von Schüler-Medien nur mit Einwilligung

## Offene Punkte

- [ ] AVV von der Schule unterschrieben zurück
- [ ] Datenschutzerklärung für die Website erstellen
- [ ] Einwilligungen einholen (Projekttag 24./25.06.)
- [ ] Schulleitung / Datenschutzbeauftragten informieren
