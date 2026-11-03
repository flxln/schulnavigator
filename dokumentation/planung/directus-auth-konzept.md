> **Überholt durch [ADR-032](../adr/032-mpz-studio-produktions-admin.md)** (3. November 2026). Die Gates zu AVV, VVT, Datenschutzerklärung und Backup gelten sinngemäß für Lehrkräfte-Konten im Studio-Produktionsmodus (Stufe 2, [#273](https://github.com/flxln/schulnavigator/issues/273)); Directus-spezifische Teile entfallen.

# Directus — Auth- und Datenschutz-Konzept (Vorbereitung #47)

**Stand:** 2026-07-05 · **Status:** Entwurf — erst nach Gates 1–3 aus [Audit Phase 5](../reviews/audit-phase-5-2026-07-04.md) umsetzen

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

## Auth-Anforderungen

- Starke Passwörter (Mindestlänge, Komplexität)
- 2FA für Admin-Rolle (empfohlen ab erstem Prod-Login)
- Rollen: **Redaktion** (Content) vs. **Admin** (Schema, User)
- Session-Dauer: kurz (z. B. 8 h), HttpOnly-Cookies
- Keine Schüler-Accounts

## Hosting

- Directus auf MPZ-VPS (DE), gleicher Betriebskontext wie Schulnavigator
- TLS über Traefik; HSTS am Proxy (#143)
- Backup: Directus-DB in T5-Strategie aufnehmen

## Rechtsgrundlage

Art. 6 Abs. 1 lit. e DSGVO — Wahrnehmung schulischer Aufgaben durch Lehrkräfte.

## Löschfristen

- Bei Ausscheiden aus dem Kollegium: Account deaktivieren, nach 90 Tagen löschen
- Login-Logs: ≤ 14 Tage (analog Besucher-Logs)

## Referenzen

- Issue [#47](https://github.com/flxln/schulnavigator/issues/47)
- [dsgvo.md](../dsgvo.md) — VVT-Eintrag Lehrkräfte-Accounts
- [datenschutz.ts](../../app/content/legal/datenschutz.ts) — Abschnitt `lehrkraefte-login`
