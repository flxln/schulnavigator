# Audit Phase 5 — Schulnavigator (2026-07-04)

**Auditor:** unabhängiger Technical & Compliance Review (read-only, kein Pentest)
**Referenzstände:** Live/Prod = Branch `kunde/39-gs` (39-gs.mpz.schule); Plattform = Branch `feature/mpz-studio`. Zitate ohne Branch-Vermerk beziehen sich auf `kunde/39-gs`, da dort der Prod-Stand liegt.
**Methodik:** Repo-/Doku-Analyse beider Branches (`git show`, kein Checkout), Code-Review der Zugangs-/Media-/Studio-Pfade, passive Prod-Checks (nur GET, keine Token-Versuche). Nicht Prüfbares ist als *„nicht verifizierbar ohne Prod-Zugang"* markiert.

---

## Executive Summary

- **Solides Security-Grundgerüst, verifiziert:** Middleware fail-closed (`app/lib/access-tokens.ts`: ohne `SN_ACCESS_TOKENS` in Production leere Token-Liste), 100 % Guard-Abdeckung auf `/api/mpz/*`, zweistufiger Path-Traversal-Schutz, CSP/Permissions-Policy enforced, `/mpz/studio` liefert in Prod 404 (live geprüft).
- **P0 (H): Schüler-Medien unter `/media/*` sind in Prod ohne Entry-Cookie abrufbar** — verifiziert per 1-Byte-Range-Request (HTTP 206, `Cache-Control: public`) auf ein Schülervideo. Das Zugangs-Gate schützt nur HTML-Routen; die Medienpfade stehen in `data/stations.json` (GitHub). Widerspricht Impressum („Zugang ist durch Eintritts-QR-Codes beschränkt") und schwächt die Einwilligungsgrundlage.
- **P0: AVV (#43) seit 21.05.2026 unsigniert** — vor Lehrkräfte-Zugang via Directus (#47) zwingend; der GitHub-Subprozessor-Textbaustein liegt fertig in `dokumentation/dsgvo.md`.
- **P1: DSB-Benennung fragwürdig** — `app/content/legal/dsb-contact.ts` benennt die Schulleitung selbst als Datenschutzbeauftragte; Interessenkonflikt nach Art. 38 Abs. 6 DSGVO (Schulleitung legt Zwecke/Mittel fest).
- **P1: #232 Git-History** — Rewrite und Force-Push abgeschlossen (24.06.), aber 7 Pre-Rewrite-Commits (inkl. Kinder-Dialog-Audio, `f45f9a4`) via `refs/pull/*` noch erreichbar; GitHub-Support-Follow-up (Ticket #4510440) unbeantwortet; Pre-Rewrite-Mirror liegt ungeregelt in `/tmp/` auf dem MPZ-Rechner.
- **M: HSTS-Header fehlt in Prod-Responses** (live geprüft) — laut Issue #143 Aufgabe des Proxys (Coolify/Traefik), dort aber nicht konfiguriert.
- **Branch-Drift als Betriebsrisiko:** Datenschutzerklärung, Impressum, ADR-027 und die gesamte Schüler-Medien-Doku existieren **nur** auf `kunde/39-gs` (66 Commits vor `feature/mpz-studio`) — ein künftiges Deployment vom Feature-Branch hätte keine Legal-Seiten.
- **Entry-Tokens:** bewusster Einladungslink-Charakter (ADR-005); Prod-Token-Strings sind identisch mit den Repo-Konstanten (`access-token-constants.mjs`, gedruckte QRs, gültig bis 31.07.2027). Vertretbar, aber `?t=`-URLs landen in Proxy-Logs — Log-Retention klären.
- **Schulfest ohne Auswertungs-Doku:** kein Post-Mortem zum 26.06.; #89 (Sonnentest), #90 (schriftliche Freigabe) und #91 (WLAN-Test) sind laut Repo nie protokolliert worden. Die kunde-Commits vom 25.–27.06. (Audio-Autoplay-Unlock, Scan-CTA-Umformulierung, Coach-Texte) zeigen real gefundene Reibungspunkte — Rohmaterial für #44/#45.
- **Vor Directus (#47):** acht Abhängigkeiten identifiziert (Abschnitt unten) — AVV, DSB-Klärung, Media-Gate, Verarbeitungsverzeichnis, DSE-Update, Backups, Auth-Konzept, Branch-Konsolidierung.

---

## Teil A — DSGVO

Status: **OK** / **Lücke** / **Unklar** · Priorität P0 (sofort) – P3 (Gelegenheit).

| # | Prüffrage | Status | Beleg | Empfehlung | Prio |
|---|-----------|--------|-------|------------|------|
| D1 | Rollen Verantwortlicher/AV | **OK mit Lücke** | `dokumentation/dsgvo.md` („MPZ betreibt die App als Auftragsverarbeiter für die 39. Grundschule"); DSE-Abschnitte `verantwortlicher`/`auftragsverarbeiter` in `app/content/legal/datenschutz.ts` konsistent | Rollen sind klar. Aber: `dsgvo.md` ist als „Entwurf" markiert und der Abschnitt „Personenbezogene Daten" besteht nur aus drei **unbeantworteten Fragen**. Kein Verarbeitungsverzeichnis (Art. 30). Vor #47: dsgvo.md zu einem beschlossenen v1.0 konsolidieren + VVT-Eintrag (kann kurz sein) anlegen | P1 |
| D2 | AVV #43 | **Lücke** | `dsgvo.md`: „Entwurf versendet 21.05.2026 … Unterschrift ausstehend". Subprozessor-Textbaustein GitHub liegt vollständig vor (dsgvo.md, Abschnitt „Textbaustein für papierbasierten AVV-Anhang"). DSE wurde am 25.06. entschärft (Commit `eebdc1e`: „Removed reference to pending signature") | Für die Unterschrift fehlt nichts Inhaltliches — nur Nachverfolgung. Prüfen, ob der Mai-Entwurf die seit 24.06. umgesetzte Deploy-Trennung (Speicherorte!) schon korrekt beschreibt; sonst Anhang aktualisieren. **Blocker für #47** | **P0** |
| D3 | Einwilligungen vs. Speicherorte | **Unklar** | Einwilligungen bei der Schule dokumentiert (O4, `05-offene-punkte.md`, 2026-06-24). Speicherort-Tabelle in `dsgvo.md` (Bahn A/B) stimmt mit Code überein (`.gitignore`, Volumes, `/api/dialog`, `/api/coach`) | Konsistenz Doku↔Technik gut — **außer** `/media/*` (siehe S1): Bahn-B-Fotos/-Videos sind faktisch ohne Zugangs-Gate im Internet. Ob die Einwilligungstexte „Veröffentlichung mit QR-Zugangsbeschränkung" oder „öffentlich" abdecken, ist *nicht verifizierbar ohne Einsicht in die Papier-Einwilligungen*. Mit Schule klären; technisch Gate nachrüsten | **P0** (via S1) |
| D4 | Besucherdaten serverseitig | **OK** | DSE `server`-Abschnitt (Logs, kein Analytics); Code: kein Tracking-Skript, Fortschritt nur `localStorage` (DSE `local`); einziges Cookie `sn_access` (`middleware.ts:16-23`), Studio-Cookie nur Dev | Log-Aufbewahrung bei Coolify/Traefik (IP-Adressen) ist nirgends dokumentiert — Retention beim Server-Admin erfragen und in dsgvo.md notieren (siehe S9) | P2 |
| D5 | Cookie-Einordnung | **OK** | `sn_access`: HttpOnly, `secure` in Prod, SameSite=Lax, `maxAge` = Token-Ablauf (`middleware.ts:15-23`); DSE `cookie`-Abschnitt beschreibt Zweck, HttpOnly, Laufzeit („endet mit Eintritts-Zeitraum") korrekt; Rechtsgrundlage Art. 6 (1) f | Deckungsgleich. Anmerkung: Laufzeit inzwischen bis **31.07.2027** (`access-token-constants.mjs`) — „z. B. Schulfest oder Schuljahr" in der DSE bleibt korrekt, aber 13 Monate sind die Obergrenze dessen, was „technisch notwendig" trägt. Bei nächster Rotation kürzere Laufzeit erwägen | P3 |
| D6 | Drittanbieter | **Lücke (klein)** | DSE `drittanbieter`-Abschnitt deckt Link-Typ + Embeds (Delightex, Book Creator) ab; CSP-Allowlist live nur `delightex.com`/`bookcreator.com` (Prod-Header geprüft). Aber `dsgvo.md`: Book Creator „DSB-Freigabe … noch zu klären"; #128: „Offen: DSB/Datenschutzerklärung Book Creator". YouTube: nicht aktiv, nur Stub (ADR-004) | DSE ist inhaltlich da; die **DSB-Freigabe für Book Creator** fehlt formal. Nachziehen (analog Delightex) oder Lesewelt-Embed bis dahin auf `typ: link` stellen. `dsgvo.md`-Sätze („noch offen") mit dem erledigten DSE-Stand synchronisieren | P2 |
| D7 | `open`-Modus + Einbettung | **OK (dokumentiert offen)** | Prod ist `gated` (live: `/raum/musik` → 307 `/eintritt`); `frame-ancestors 'none'` live. `dsgvo.md` verlangt explizit DSB-Einordnung **vor** Aktivierung von `open`/`SN_EMBED_ANCESTORS` | Kein Handlungsbedarf, solange `gated`. Der Vorbehalt ist sauber dokumentiert — bei Aktivierung als Gate behandeln (DSB-Vermerk einholen) | P3 |
| D8 | Git-History #232 | **Lücke (Restarbeit)** | Post-Mortem `post-mortem-232-2026-06-24.md`: V1–V8, V10 grün; **V9 offen**. `08-github-support-ticket-232.md`: Ticket #4510440, GC erfolgt, **7 SHAs via `refs/pull/*` noch erreichbar** (u. a. `f45f9a4` mit Kinder-WAVs), Follow-up 25.06. unbeantwortet. Mirror `/tmp/schulnavigator-pre-232-mirror.git` (Pre-Rewrite inkl. LFS) | (1) Support-Ticket nachfassen (>1 Woche alt); (2) nach Bestätigung V9 grün setzen + dsgvo.md-Hinweis entfernen; (3) **Mirror-Governance**: `/tmp` ist flüchtig und ungesichert zugleich — bewusst entscheiden: verschlüsselt archivieren mit Löschdatum oder nach Support-Bestätigung löschen, Entscheidung in `05-offene-punkte.md` protokollieren | P1 |
| D9 | Informationspflichten | **Lücke** | Impressum vollständig (Anbieter, Schulträger, Schule, Inhalte-Verantwortliche, Bildrechte FLVG/Zänker); `/impressum`, `/datenschutz` öffentlich (Middleware `LEGAL_PUBLIC`, live 200). **Aber:** `dsb-contact.ts` = „Ines Schubert (Schulleitung, Datenschutzbeauftragte)" — Schulleitung darf wegen Interessenkonflikt regelmäßig nicht DSB sein (Art. 38 Abs. 6); für Dresdner Schulen existiert i. d. R. ein behördlicher DSB des Schulträgers. Zudem `dsgvo.md` letzter offener Punkt: „Schulleitung/DSB informieren" unerledigt | Zuständigen behördlichen DSB (Schulträger LHD) erfragen und `dsb-contact.ts` korrigieren; Impressum-Satz „Zugang ist durch Eintritts-QR-Codes beschränkt" erst nach S1-Fix wieder zutreffend | P1 |
| D10 | Vorbereitung Directus #47 | **Lücke (geplant)** | #47 in `issues-phase-5.md`: „Login nur für Lehrkräfte, keine Schülerdaten im CMS" — mehr DSGVO-Vorgaben existieren nicht | Siehe Abschnitt „Abhängigkeiten vor Directus" unten — Directus führt erstmals **Accounts** (Lehrkräfte-PII: Name, E-Mail, Passwort-Hashes, Login-Logs) ein; das ist eine neue Verarbeitung, die AVV/VVT/DSE-Update **vor** dem ersten Login braucht | P1 |

### Top-5-Maßnahmen DSGVO

1. **`/media/*` hinter das Entry-Cookie legen** (Deckung mit Einwilligung + Impressum-Aussage herstellen) — technische Umsetzung siehe Teil B/S1. *(P0)*
2. **AVV-Unterschrift #43 aktiv nachverfolgen**; vorher Speicherort-Anhang gegen ADR-027-Stand prüfen, GitHub-Textbaustein beilegen. *(P0)*
3. **DSB-Benennung klären** und `dsb-contact.ts` + DSE korrigieren. *(P1)*
4. **#232 abschließen:** Support nachfassen, V9 verifizieren, Mirror-Aufbewahrung entscheiden und protokollieren. *(P1)*
5. **dsgvo.md v1.0:** Entwurfs-Fragen beantworten, Mini-VVT ergänzen, D6-Inkonsistenzen (Book Creator) bereinigen — und die Datei auf `feature/mpz-studio` portieren (Branch-Drift). *(P1)*

---

## Teil B — Security & Production

Format: Befund → Risiko (H/M/L) → Empfehlung → Aufwand. Positivbefunde am Ende.

| # | Bereich | Befund | Risiko | Empfehlung | Aufwand |
|---|---------|--------|--------|------------|---------|
| S1 | Middleware / öffentliche Medien | Matcher (`middleware.ts:149-162`) schützt nur HTML-Routen; `/media/[...path]` (Route-Handler) prüft **kein** Cookie und setzt `Cache-Control: public, max-age=3600`. Live verifiziert: Schülervideo per Range-Request ohne Cookie → **HTTP 206**. Pfade stehen in `data/stations.json` auf GitHub (O1) | **H** (DSGVO-Exposure von Kinder-Fotos/-Videos; Proxy-/Browser-Caches speichern `public`-Antworten) | In `app/app/media/[...path]/route.ts` `validateToken(cookies.get('sn_access'))` prüfen, bei `isAccessGated()` sonst 403/Redirect; `Cache-Control` auf `private` stellen. Muster existiert bereits: `/api/dialog/*` ist Cookie-gated (ADR-010). Test in `middleware.test.ts`-Stil ergänzen | **S** (½ Tag inkl. Tests) |
| S2 | Token-Handling | Prod liest ausschließlich `SN_ACCESS_TOKENS`; ohne/mit kaputtem ENV → leere Liste → fail-closed (`access-tokens.ts:98-109`, kunde). Dev-Fallback greift **nur** außerhalb `production`. Aber: Prod-Token-Strings = Repo-Konstanten (`access-token-constants.mjs`: „müssen in SN_ACCESS_TOKENS enthalten sein"), Playbook Abschnitt 8 druckt sie als Coolify-Beispiel ab; Gültigkeit bis 2027-07-31. Rotation vorhanden (`rotate:access-tokens`, #141), aber durch gedruckte QRs eingefroren | **M** (bewusster Einladungslink-Charakter per ADR-005 — Token sind auf Papier-QRs ohnehin halböffentlich; Repo-Leak ≠ neuer Angriffsvektor, aber die Kopplung sollte als akzeptiertes Risiko dokumentiert sein) | In ADR-021 oder dsgvo.md einen Satz ergänzen: „Token-Strings sind Einladungslinks, kein Geheimnis; Schutzziel ist das Gate, nicht die Vertraulichkeit des Tokens." Bei nächstem QR-Neudruck: Rotation + kürzere expiresAt | XS |
| S3 | Path-Traversal | `public-media-file.ts`: Segment-Regex `^[a-zA-Z0-9][a-zA-Z0-9._-]*$` **plus** normalisierter Prefix-Check gegen `public/media/` — `../`, encodete Punkte, absolute Pfade scheitern. Range-Parser mit Bounds-Check. Dialog-/Coach-/Icon-APIs nur hinter Studio-Guard (dev-only) | **L** | Kein Handlungsbedarf | — |
| S4 | MPZ Studio / APIs | `withMpzStudioAccess` auf allen `/api/mpz/*`-Routen (grep-verifiziert, >30 Handler); `NODE_ENV=development`-Gate; Secret aus ENV, fail-closed bei leerem Secret; live: `/mpz/studio` → 404. Zwei Anmerkungen: (a) `setMpzStudioSessionCookie` hardcodiert `secure: false` (`mpz-studio-guard.ts:76`); (b) Session-Cookie enthält das Secret selbst | **L** (Studio existiert nur im Dev-Build; Prod-Bundle enthält die Routen als 404) | (a) `secure` an `NODE_ENV` koppeln — kostenlos, konsistent mit `middleware.ts:18`; (b) bei Gelegenheit abgeleiteten Session-Wert statt Secret-Klartext setzen. Spec `mpz-studio.md` um Cookie-Fallback-Auth ergänzen (ist dort nicht beschrieben) | XS |
| S5 | CSP / Headers | Live-Header verifiziert: CSP enforced (frame-src exakt Delightex+Book Creator = Allowlist, konsistent ADR-017), `frame-ancestors 'none'` (ADR-021, kein `SN_EMBED_ANCESTORS` gesetzt), nosniff, Referrer-Policy, Permissions-Policy (camera/gyro self). **Fehlt: `Strict-Transport-Security`** — #143 delegierte HSTS an den Proxy, dort aber nicht aktiv. `unsafe-inline` in script/style-src (Next.js-Zwang, dokumentiert in `security-headers.ts:8-11`) | **M** (HSTS fehlt: SSL-Stripping bei Erstbesuch möglich; Rest L) | HSTS in Coolify/Traefik aktivieren (`max-age=15552000` zum Start, ohne `includeSubDomains` wegen `*.mpz.schule`-Nachbarn prüfen). *Proxy-Konfiguration nicht verifizierbar ohne Prod-Zugang — Befund basiert auf fehlendem Response-Header* | XS (Config) |
| S6 | Deploy-Trennung | `deploy-content.sh`: Push-Pfad nur von `DEPLOY_BRANCH` (Default `kunde/39-gs`, Zeile 57-62); rsync ohne `--delete` (T2), SSH-Key je Laptop, `accept-new` (T6). Lücken: `--media-only` umgeht den Branch-Check (dokumentiert, für Tests); **T5 Volume-Backups offen** (`05-offene-punkte.md`) — VPS-Volumes + MPZ-Laptop sind die einzigen Kopien der Schüler-Medien | **M** (Datenverlust-Szenario: VPS-Ausfall + Laptop-Defekt; kein Angriffs-, aber Verfügbarkeitsrisiko) | T5 entscheiden: Server-seitiges Backup der drei Volumes (verschlüsselt, DE) oder dokumentierte Zweitkopie am MPZ; `accept-new` beim Erst-Connect einmalig Host-Key verifizieren | S |
| S7 | Build-Pipeline | Build erzwingt 6 Validatoren (`package.json` „build"-Script); Coolify nutzt `:structure`-Varianten (kein `existsSync`) — **fehlende rsync-Medien erzeugen bewusst Prod-404** statt Build-Bruch (T4-Entscheidung). 404-Fenster möglich, wenn Code mit neuen Medien-Referenzen vor dem Medien-Sync deployt | **L** (by design; `deploy-content.sh` koppelt Push+Sync in einem Lauf) | Reihenfolge im Skript beibehalten (Medien-Sync **vor** Coolify-Webhook); als Regel in `fuer-entwickler.md` festhalten | XS |
| S8 | Dependencies | `next@16.2.6`, `react@19.2.4`, `@photo-sphere-viewer/core@^5.14.1`, `html5-qrcode@^2.3.8`, Tailwind 4 — aktuelle Majors, keine offensichtlichen Critical-CVEs (kein vollständiger Scan). Hinweis: `html5-qrcode` wird seit ~2023 kaum gepflegt | **L** | `npm audit` in den Deploy-Ablauf oder als monatlichen Check aufnehmen; `html5-qrcode` beobachten (läuft nur client-seitig hinter dem Gate) | XS |
| S9 | Logging / PII | Kein `console.log` mit Tokens/Pfaden in Middleware, Media-Route, `/api/mpz/*` (grep-verifiziert). Aber: Entry-Scans laufen als `GET /eintritt?t=<token>` — **Token landet in Proxy-/Access-Logs**; dazu IPs in Coolify-Logs. Kein Error-Tracking (bewusst kein Drittanbieter). *Log-Retention nicht verifizierbar ohne Prod-Zugang* | **M**→L (Tokens sind Einladungslinks, s. S2 — dennoch: Logs + lange Gültigkeit = leises Leak-Risiko) | Retention der Traefik/Coolify-Access-Logs erfragen, kurz halten (≤14 Tage) und in dsgvo.md dokumentieren; optional Token-Redaction im Proxy-Log-Format | XS–S |

**Positiv (keine Maßnahme):** fail-closed Token-Parsing inkl. `applyEntryQrHubModes` (ENV-`mode` nicht bindend — verhindert Konfigurations-Drift zwischen Coolify und gedruckten QRs); `EINTRITT_BYPASS` als Exact-Match statt `startsWith`; Legal-Routen bewusst vor dem Gate; Runtime-Validierung der Token-Config beim Container-Start (#136); 22 Middleware-Tests.

### Top-5-Maßnahmen Security/Prod

1. **`/media/*` Cookie-Gate + `Cache-Control: private`** — der einzige H-Befund. *(S1, ½ Tag)*
2. **HSTS am Proxy aktivieren.** *(S5, Minuten)*
3. **Volume-Backup-Entscheidung T5** dokumentieren und umsetzen. *(S6)*
4. **Log-Retention klären** (IPs, `?t=`-URLs) und in dsgvo.md aufnehmen. *(S9)*
5. **Kleinkram bündeln:** `secure`-Flag Studio-Cookie, Spec-Ergänzung Cookie-Auth, `npm audit`-Routine, Token-Risiko-Vermerk in ADR-021. *(S2/S4/S8, <½ Tag gesamt)*

---

## Teil C — Schulfest

### C.1 Interview-Leitfaden für Schul-Meeting (#44, Sten/Tina)

**A — Begeisterung & Verwirrung**
1. Welcher Moment am Schulfest hat euch (oder Eltern/Kindern) am meisten Freude mit der App gemacht — was wurde weitererzählt?
2. Wo habt ihr Besucher beobachtet, die hängen geblieben sind (Eintritts-Scan, Hub, Raum-Ansicht)? Was genau haben sie versucht?
3. Haben Besucher verstanden, dass sie **zuerst** den Entry-QR am Eingang scannen müssen? Wer hat es erklärt — und musste das oft passieren?
4. Kam die Puzzle-Mechanik (Hub schaltet pro Scan frei, 0/12) an — oder wirkte sie wie eine Hürde?
5. Gab es Altersgruppen, für die die App gar nicht funktioniert hat (Großeltern, kleine Geschwister)?

**B — Technik vor Ort**
6. Wie war die Netzabdeckung auf dem Hof und in der Turnhalle — gab es Stellen, an denen nichts lud? (#91 wurde vorab nie protokolliert)
7. Wie lange haben Videos zum Starten gebraucht? Haben Besucher abgebrochen?
8. Der In-App-Scanner vs. System-Kamera: Was haben die Leute tatsächlich benutzt, und hat beides funktioniert?
9. Gyro/360°-Räume: Haben Besucher die Wisch-/Schwenk-Bedienung entdeckt, oder blieb das Bild statisch?
10. Dialog-Audio (Frieda/Otto) und Coach-Stimmen: War Ton zu hören (Lautstärke, iOS-Autoplay)? — *Hintergrund: am 25.06. wurde noch ein Audio-Autoplay-Fix eingespielt (Commit `cf63e0b`); hat das am Fest gehalten?*
11. Musste jemand den Tablet-Fallback (#41) benutzen?

**C — Content / Stationen**
12. Welche drei Stationen kamen am besten an — und welche wurden nach dem Öffnen sofort geschlossen?
13. Waren die Hof-virtualisierten Stationen (geschlossene Räume per Hof-QR) verständlich — oder haben Besucher den echten Raum gesucht?
14. Fehlte eine Station, nach der Besucher gefragt haben (Außenbereich, Robotik, …)? → Kandidaten für #49
15. Waren Texte/Audio-Längen passend für die Fest-Situation (viel Trubel, wenig Zeit)?

**D — Betrieb & Organisation**
16. QR-Platzierung: Welche Hänge-Orte haben funktioniert, welche nicht (Höhe, Sonne, Gedränge)? Konnte man die Hof-QRs bei Mittagssonne scannen? (#89-Sonnentest wurde nie protokolliert)
17. Wie viel Personal hat die App-Betreuung real gebunden (Buddy am Hof, Erklärer am Eingang)? War das leistbar?
18. Gab es beschädigte/abgefallene QRs im Laufe des Tages?

**E — Ausblick Herbst / Schuljahr**
19. Was soll zum Tag der offenen Tür anders laufen als am Schulfest?
20. Wollt ihr Inhalte künftig selbst pflegen (Directus, #47) — wer aus dem Kollegium würde das tun, und wie viel Zeit ist realistisch?

### C.2 Repo-basierte Voranalyse (geplant vs. live)

**Geplant** (Playbook `anleitungen/schulfest-gs39-playbook.md`, Epic #86):
- Modus `fest`, 1 Entry-QR + 12 Raum-QRs (Druckset komplett, PDFs #130 ✅), 5 physische Räume + Hof-Virtualisierung, Outdoor-Spec (5×5 cm, Level H, matt laminiert), Buddy-Station, Tablet-Fallback, Notfall-Matrix.

**Belegt umgesetzt:**
- Abschlusstest #38 (15.06., `2026-06-15-abschlusstest-geraete.md`): 4 Geräte, kompletter fest-Flow grün; offen blieben „12/12-Sparkle" und „Raum-QR in neuem Tab".
- Post-Fest-Umstellung (Playbook Abschn. 8) am 27.06. umgesetzt: Entry-fest-QR liefert jetzt Heft-Hub ohne QR-Neudruck (`FEST_ENTRY_HUB_MODE='heft'`, Commits `3a8525a`/`c1e5990`) — sauber gelöst.
- Fixes rund um Projekttag/Fest (kunde-Log 25.–27.06.): Audio-Autoplay-Unlock (`cf63e0b`), Legal-Seiten global erreichbar (`d79d994`), Scan-CTA umformuliert zu „Scanne einen beliebigen Code" (`65a1119`), Coach-Willkommenstexte vereinfacht, Raumbild Schulsozialarbeit nachgeliefert, Embeds „Schulhof der Zukunft"/„Klassenraum" ergänzt. → Diese Änderungen sind de facto die ersten #45-Einträge; die zugrundeliegenden Beobachtungen sind aber **nirgends dokumentiert**.

**Nicht belegt / Lücken (vor dem Meeting klären):**

| Punkt | Issue | Repo-Stand |
|-------|-------|-----------|
| Sonnentest Outdoor-QR | #89 | „offen (Sonnentest)" — kein Protokoll gefunden |
| Schriftliche Playbook-Freigabe Schule | #90 | Akzeptanzkriterium „freigegeben am … + Namen" unerfüllt |
| Mobilfunk-/WLAN-Test Hof | #91 | Tabelle im Issue leer; auch Abschlusstest verweist nur darauf |
| Content-Checkliste 11 Stationen | #88 | offen |
| Schulfest-Post-Mortem | — | 48 Post-Mortems im Index (`reviews/README.md`), **keins zum 26.06.** |
| 12/12-Abschluss (Sparkle) real erlebt? | #38-Rest | ungetestet |

**Bekannte technische Risiken, die am Fest relevant gewesen sein können:** Outdoor-Lesbarkeit (#89), Hof-Netzkapazität bei Video-Last (#91, Council-Einschätzung), iOS-Audio-Autoplay (Fix erst 25.06.), Scan-Verständnis ohne Buddy (Playbook: „ohne Buddy niedrige Scan-Rate einplanen").

### C.3 Priorisierte Phase-5-Roadmap

*Es lagen dem Audit keine Gesprächsnotizen bei.* Sobald Notizen aus #44 vorliegen: Synthese als Must/Should/Could mit Mapping auf #45 (Bugs), #49 (Stationen), #47 (Directus), #48 (Englisch) — der Leitfaden in C.1 ist so gruppiert, dass sich die Antworten direkt zuordnen lassen.

---

## Abhängigkeiten vor Directus (#47)

Reihenfolge-Empfehlung; (1)–(3) sind harte Gates:

1. **AVV #43 unterschrieben** — inkl. aktualisiertem Speicherort-Anhang (ADR-027) und GitHub-Baustein; Directus erweitert die Verarbeitung (Lehrkräfte-Accounts) und braucht eine AVV-Grundlage. *(D2)*
2. **DSB-Benennung geklärt** — der künftige Lehrkräfte-Login ist genau der Punkt, an dem ein echter DSB einzubinden ist. *(D9)*
3. **`/media/*`-Gate live** — bevor Lehrkräfte Medien hochladen können, muss der Auslieferungspfad geschützt sein; sonst skaliert die Lücke mit jedem Upload. *(S1)*
4. **VVT/dsgvo.md v1.0** mit neuem Eintrag „Lehrkräfte-Accounts" (Zweck, Rechtsgrundlage — Wahrnehmung schulischer Aufgaben —, Löschfristen bei Ausscheiden). *(D1/D10)*
5. **Auth-Konzept Directus:** starke Passwörter/2FA, Rollenmodell (Redaktion vs. Admin), Session-Dauer, kein Schüler-PII in Collections (steht in #47 — technisch durch Schema erzwingen). 
6. **DSE-Update:** neuer Abschnitt Lehrkräfte-Login (Accounts, Cookies/Sessions von Directus).
7. **Backup T5** — mit Directus-DB wird das Backup-Thema von „Medien" auf „Datenbank" erweitert; vorher entscheiden. *(S6)*
8. **Branch-Konsolidierung:** Legal-Content, ADR-027, Schüler-Medien-Doku und access-tokens-Refactoring von `kunde/39-gs` nach `feature/mpz-studio` portieren — Directus wird auf dem Feature-Branch entwickelt und darf nicht hinter den Prod-Compliance-Stand zurückfallen.

## Offene Fragen an Felix / MPZ / Schule

1. **An Schule:** Decken die Papier-Einwilligungen (O4) eine Auslieferung ohne Zugangs-Gate ab, oder setzen sie „QR-beschränkter Zugang" voraus? *(entscheidet Dringlichkeit von S1 zusätzlich zur technischen Empfehlung)*
2. **An MPZ/Server-Admin:** Log-Retention Coolify/Traefik? HSTS am Proxy konfigurierbar? Volume-Backup-Stand? *(nicht verifizierbar ohne Prod-Zugang)*
3. **An Felix:** Ist der Pre-Rewrite-Mirror in `/tmp/` noch vorhanden — und soll er archiviert oder gelöscht werden?
4. **An Schule/LHD:** Wer ist der formell benannte (behördliche) Datenschutzbeauftragte der 39. GS?
5. **An MPZ:** Antwort von GitHub-Support auf das Follow-up vom 25.06. eingegangen?
6. **An Felix:** Sollen die 25.–27.06.-Hotfixes rückwirkend als #45-Issues dokumentiert werden (Beobachtung → Fix), damit die Schulfest-Erkenntnisse nicht nur in Commit-Messages leben?

## Vorgeschlagene GitHub-Issues

| Titel (Vorschlag) | Labels | Prio | Bezug |
|--------------------|--------|------|-------|
| `/media/*` hinter Entry-Cookie legen + Cache-Control private | `tech`, `dsgvo`, `blocker` | P0 | S1/D3; Muster ADR-010 |
| AVV #43: Anhang auf ADR-027-Stand prüfen, Unterschrift einholen | `org`, `dsgvo` | P0 | D2 (bestehendes #43 aktualisieren) |
| DSB-Benennung korrigieren (dsb-contact.ts, DSE) | `org`, `dsgvo` | P1 | D9 |
| #232-Restarbeit: Support-Follow-up, V9 verifizieren, Mirror-Governance | `org`, `dsgvo` | P1 | D8 |
| HSTS am Proxy (Coolify/Traefik) aktivieren | `tech` | P1 | S5 |
| Schulfest-Post-Mortem 26.06. nachziehen (inkl. #89/#90/#91-Protokolle) | `org` | P1 | C.2, Zulieferung für #44 |
| kunde→feature: Legal-Content, ADR-027, DSGVO-Doku portieren | `tech`, `doku` | P1 | Branch-Drift |
| Volume-Backup-Strategie (T5) entscheiden und umsetzen | `tech`, `org` | P2 | S6 |
| Log-Retention dokumentieren, optional Token-Redaction | `tech`, `dsgvo` | P2 | S9/D4 |
| Book-Creator-DSB-Freigabe nachziehen oder Embed→Link | `org`, `content` | P2 | D6 |
| Kleinkram Security: Studio-Cookie secure-Flag, Spec-Update, npm-audit-Routine | `tech` | P3 | S2/S4/S8 |

---

*Erstellt read-only am 2026-07-04; Datei ist unversioniert (kein Commit ohne Freigabe). Keine Secrets gelesen, keine Schüler-Binärinhalte analysiert (nur ein 1-Byte-Range-Statuscheck zur Gate-Verifikation).*
