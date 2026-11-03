> **Überholt durch [ADR-032](../../adr/032-mpz-studio-produktions-admin.md)** (3. November 2026), auf GitHub als „not planned“ geschlossen. Nachfolger-Epic: [#273](https://github.com/flxln/schulnavigator/issues/273). Text unten ist Historie.

## Kontext

- Epic-Parent: #47
- Ausgelöst durch Gate-Prüfung in #250 (Schritt 6 der Kurz-Checkliste, `dokumentation/planung/plans/checkliste-250-directus-gates-4-6.md`)
- Auth-Konzept: `dokumentation/spezifikationen/directus-auth-konzept.md` (Gate 1: AVV #43)

## Befund (2026-07-06)

Der AVV (#43, unterschrieben 25.06.2026, Anhang ADR-027) deckt laut `dsgvo.md` inhaltlich ab: Hosting in Deutschland, Verantwortlichkeiten, Speicherort der Daten (ADR-027), Verarbeitung von Schüler-Medien nur mit Einwilligung. Die Unterschrift liegt vor der Anlage des Directus-Epics (#47, 2026-07-06). Eine Verarbeitung von Lehrkräfte-Accounts in einer Directus-DB ist im dokumentierten AVV-Inhalt nicht erkennbar erfasst.

Vorläufige Einschätzung: negativ. Der bestehende AVV deckt die Directus-Verarbeitung von Lehrkräfte-Accounts voraussichtlich nicht ab. Muss mit dem tatsächlichen AVV-Wortlaut gegengeprüft werden, nicht nur mit der `dsgvo.md`-Kurzfassung.

## Befund (2026-11-02)

Geprüft an `auftraggeber/verträge/Auftragsverarbeitungsvertrag (AVV 39.GS) .pdf`. 3 Seiten, erzeugt am 13.05.2026. Unterschriftszeile leer. Kein Anhang zu ADR-027 oder GitHub.

§ 1: App „Besucherkompass“, Tag der offenen Tür, Hosting beim MPZ. § 2: keine Namen, Geburtsdaten oder E-Mail-Adressen. § 3: keine Unterauftragnehmer, Löschung der Mediendaten nach der Veranstaltung. Lehrkräfte nur als betroffene Personen von Bild und Ton.

Lehrkräfte-Accounts in Directus sind nicht abgedeckt. Nachtrag vor #261 bleibt nötig. Die unterschriebene Ausfertigung vom 25.06.2026 liegt laut #43 im MPZ-Hefter und ist nicht diese PDF.

## Aufgaben

- [x] Wortlaut geprüft (Repo-PDF vom 13.05.2026). Directus/Lehrkräfte-Accounts als Verarbeitungszweck: nein
- [ ] Falls nein: AVV-Nachtrag mit der Schule abstimmen (Verarbeitungszweck Lehrkräfte-Accounts, Speicherort Directus-DB, Subprozessor-Angaben falls relevant)
- [x] Ergebnis in `dsgvo.md` (Abschnitt Auftragsverarbeitung) nachtragen
- [ ] Gate 1 im Auth-Konzept für den Directus-Kontext bestätigen, sobald der Nachtrag vorliegt

## Akzeptanzkriterium

AVV deckt Directus-Verarbeitung von Lehrkräfte-Accounts nachweislich ab (Original-Prüfung oder Nachtrag unterschrieben), dokumentiert in `dsgvo.md`.

## Blockiert

- #261 (kein Lehrkräfte-Login ohne geklärte AVV-Grundlage, Gate 1 im Directus-Kontext)
