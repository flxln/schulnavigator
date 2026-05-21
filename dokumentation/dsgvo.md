# Schulnavigator — Datenschutzkonzept

*Status: Entwurf*

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

## Offene Punkte

- [ ] Datenschutzerklärung für die Website erstellen
- [ ] Einwilligungen einholen
- [ ] Schulleitung / Datenschutzbeauftragten informieren
