# Directus — Auth- und Datenschutz-Konzept (Vorbereitung #47)

**Stand:** 2026-11-02 · **Status:** beschlossen (Gate 5, 2026-07-06 — [#250](https://github.com/flxln/schulnavigator/issues/250))

**Gate-Stand:** 1 ✅ AVV Hosting (25.06.2026, Anhang ADR-027); Directus-Accounts vom Wortlaut nicht gedeckt ([#263](https://github.com/flxln/schulnavigator/issues/263)) · 2 ✅ DSB LaSuB · 3 ✅ Media-Gate · 4 weitgehend erfüllt (VVT-Rest bei Deploy → #255) · 5 ✅ beschlossen (dieses Dokument, 2026-07-06) · 6 teilerfüllt (DSE final vor erstem Login → Trigger in #261, siehe unten) · 7 teilerfüllt (Directus-DB-Aufnahme nach Deploy → #258) · 8 im Kern erledigt (Rest-Drift dokumentiert, Branch-Entscheidung → #251)

## Hard Gates vor erstem Lehrkräfte-Login

1. AVV #43 unterschrieben (inkl. ADR-027-Anhang)
2. DSB-Benennung geklärt (LaSuB-DSB in App)
3. `/media/*`-Gate live
4. `dsgvo.md` v1.0 + VVT (dieses Dokument ergänzt Eintrag Lehrkräfte-Accounts)
5. Dieses Auth-Konzept beschlossen
6. DSE-Abschnitt Lehrkräfte-Login live
7. Backup T5 inkl. Directus-DB
8. Branch-Konsolidierung (Legal auf `feature/mpz-studio`)

## Verarbeitung Lehrkräfte-Accounts

| Feld | Zweck | Speicher |
|------|-------|----------|
| Name, E-Mail | Identifikation, Passwort-Reset | Directus `users` |
| Passwort-Hash | Authentifizierung | Directus (bcrypt/argon2) |
| Login-Zeitstempel, IP | Sicherheit, Missbrauchserkennung | Directus-Logs / Server |

**Kein Schüler-PII** in Directus-Collections — technisch durch Schema und Validatoren erzwingen (#47).

## Auth-Anforderungen (beschlossen — Gate 5)

- Starke Passwörter (Mindestlänge, Komplexität)
- 2FA **verpflichtend** für die Admin-Rolle ab erstem Prod-Login (kein „empfohlen" mehr — Beschluss Gate 5)
- Rollen: **Redaktion** (Content) vs. **Admin** (Schema, User)
- Session-Dauer: kurz (8 h), HttpOnly-Cookies
- Keine Schüler-Accounts

## Hosting

- Directus auf MPZ-VPS (DE), gleicher Betriebskontext wie Schulnavigator
- TLS über Traefik; HSTS am Proxy (#143)
- Backup: Directus-DB in T5-Strategie aufnehmen

## AVV und Lehrkräfte-Accounts (#263)

Gate 1 für den unterschriebenen Hosting-AVV bleibt erfüllt. Der Wortlaut in [`auftraggeber/verträge/Auftragsverarbeitungsvertrag (AVV 39.GS) .pdf`](../../auftraggeber/verträge/Auftragsverarbeitungsvertrag%20(AVV%2039.GS)%20.pdf) (erzeugt 13.05.2026, Unterschriftszeile leer) deckt Directus-Accounts nicht ab. § 2 schließt Namen und E-Mail-Adressen aus. Der Nachtrag bleibt Blocker vor dem ersten Lehrkräfte-Login ([#263](https://github.com/flxln/schulnavigator/issues/263), [#261](https://github.com/flxln/schulnavigator/issues/261)). Detail: [dsgvo.md](../dsgvo.md).

## Rechtsgrundlage

Art. 6 Abs. 1 lit. e DSGVO — Wahrnehmung schulischer Aufgaben durch Lehrkräfte.

## Löschfristen

- Bei Ausscheiden aus dem Kollegium: Account deaktivieren, nach 90 Tagen löschen
- Login-Logs: ≤ 14 Tage (analog Besucher-Logs)

## Referenzen

- [Epic Directus #47](../planung/epics/epic-directus.md) — Unterissues [#249](https://github.com/flxln/schulnavigator/issues/249)–[#262](https://github.com/flxln/schulnavigator/issues/262)
- Gates abschließen: [#250](https://github.com/flxln/schulnavigator/issues/250) · optional Gate 9 (Champion): [#249](https://github.com/flxln/schulnavigator/issues/249)
- [Council Directus-Planung (Grundlage)](../reviews/council-directus-planung-2026-07-06.md)
- Issue [#47](https://github.com/flxln/schulnavigator/issues/47) (Epic-Parent)
- [dsgvo.md](../dsgvo.md) — VVT-Eintrag Lehrkräfte-Accounts
- [datenschutz.ts](../../app/content/legal/datenschutz.ts) — Abschnitt `lehrkraefte-login`
