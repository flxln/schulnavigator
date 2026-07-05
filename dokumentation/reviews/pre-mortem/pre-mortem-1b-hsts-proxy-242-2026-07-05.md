---
tags:
  - pre-mortem
  - 01b-logik-spec
  - hsts-proxy
  - issue-242
erstellt: 2026-07-05
plan: .cursor/plans/hsts_proxy_#242_9e537be9.plan.md
gegenstück: "(noch nicht angelegt — 1a Codepraxis)"
---

# Pre-Mortem 1b — HSTS Proxy #242 (Logik, Spec-Konsistenz & API-Vertrag)

**Geprüft:** Plan `hsts_proxy_#242_9e537be9.plan.md` gegen den aktuellen Code- und Dokumentationsstand (`app/next.config.ts`, `app/lib/security-headers.ts`, `anleitungen/fuer-entwickler.md`, `dokumentation/dsgvo.md`, `dokumentation/planung/offen.md`, `dokumentation/adr/001-hosting-coolify.md`, Audit Phase 5). Code- und Doku-Belege via `view_file` verifiziert. Dieses Gutachten fokussiert sich ausschließlich auf Widersprüche zwischen Dokumenten, unvollständige Diskriminierung, API-/Config-Verträge und nie verifizierte Annahmen.

**Gesamturteil:** Vier scharfe Funde im Bereich der Infrastruktur- und Config-Verträge. Keiner blockiert die eigentliche Zielsetzung (HSTS am Proxy für GS39-Prod), aber Fund 1 birgt das unmittelbare Risiko, in Produktion bestehende Coolify-Schutzfunktionen (wie Gzip-Komprimierung oder Redirects) unbemerkt zu überschreiben. Fund 2 lässt den im Plan genannten Alternativpfad für den Server-Admin komplett ungelöst. Fund 3 erzeugt beim geplanten Doku-Mirroring auf `main` einen Widerspruch zwischen Dokumentation und realer Legacy-Config. Fund 4 birgt das Risiko eines normativen RFC-Verstoßes bei HTTP-Redirects. Alle vier Funde lassen sich mit minimalen Anpassungen im Plan vorab präzise entschärfen.

---

## Funde

### [Überschreiben bestehender Middlewares] — Unvollständige Diskriminierung bei Zuweisung des Traefik-Router-Labels

- **Was widersprüchlich/undefiniert ist:** Plan Zeile 128 fordert das Setzen des Labels:
  `traefik.http.routers.https-0-<APPLICATION_UUID>.middlewares=sn-hsts`
  In Traefik (und Coolify-Labels) ist das `middlewares`-Label am Router eine kommagetrennte Liste aller aktiven Middlewares. Der Plan definiert eine harte Zuweisung (`=sn-hsts`), spezifiziert aber nicht, was passiert, wenn Coolify an diesem Router bereits standardmäßig oder projektbezogen andere Middlewares (z. B. `gzip@docker`, Rate-Limiting, Headers oder Redirects) angehängt hat. Eine harte Zuweisung überschreibt die gesamte bestehende Liste, anstatt die neue Middleware anzuhängen.

- **Warum später teuer:** Ein anschließender Smoke-Test (`curl -sI https://39-gs.mpz.schule/ | grep -i strict-transport`) ist grün — HTTP 200 und der HSTS-Header sind da. Dass zeitgleich durch das Überschreiben des Router-Labels z. B. die Gzip-Komprimierung auf der gesamten Prod-Domain oder andere Traefik-Schutzmechanismen unbemerkt abgeschaltet wurden, fällt erst unter Last oder durch Zufall auf.

- **Wann es beißt:** Unmittelbar nach dem Restart der Application in Phase 1 (beim ersten Client, der größere Payloads lädt und keine Komprimierung mehr erhält).

- **Billige Gegenmaßnahme jetzt:** In Phase 1 explizit vorschreiben: *Vor* dem Einfügen des Labels in der Coolify-UI müssen unter **Application → Links / Proxy / generierte Labels** die bestehenden Labels des Routers `https-0-<APPLICATION_UUID>` geprüft werden. Falls dort bereits ein `middlewares`-Label existiert (z. B. `middlewares=gzip@docker`), muss `sn-hsts` als Komma-Liste angehängt bzw. vorangestellt werden (`middlewares=gzip@docker,sn-hsts`), statt den Wert blind zu überschreiben.

---

### [Unspezifizierter Fallback auf Dynamic Config] — Unvollständige Diskriminierung des Alternativpfads

- **Was widersprüchlich/undefiniert ist:** Der Plan benennt in Zeile 133, 140 und 200 das Risiko, dass Application-Labels in Coolify nicht greifen oder zu Traefik-Race-Conditions führen (`middleware "sn-hsts@docker" does not exist`). Als Lösung verweist der Plan auf: *„Alternative: Middleware per Dynamic Configuration auf dem Proxy-Server (persistiert über Redeploys) — nur falls Application-Labels nicht greifen."* Dieser Alternativpfad ist jedoch zu 0 % spezifiziert: Es fehlt der Dateipfad im System des MPZ-VPS (`217.154.120.240`), die YAML-/TOML-Syntax für den Traefik-File-Provider (die sich fundamental von Docker-Labels unterscheidet) und die Zuweisungslogik.

- **Warum später teuer:** In Zeile 190 nimmt der Plan an, dass Phase 1 mangels eigenem Coolify-Zugang per Copy-Paste-Ticket an den MPZ-Server-Admin delegiert werden könnte. Wenn der Admin die Labels aus Phase 1 einfügt, der Traefik-Fehler aus Zeile 140 auftritt und im Issue nur steht „dann bitte per Dynamic Config machen", steht der Admin ohne Anleitung da. Er weiß nicht, welche Datei im Coolify-Proxy-Verzeichnis wie zu editieren ist. Das führt zu Rückfragen, Verzögerungen und potenziell fehlerhaften manuellen Eingriffen in die globale Proxy-Config des MPZ.

- **Wann es beißt:** In Phase 1, falls Coolify v4 die Middleware-Referenzierung über Container-Labels hinweg nicht sauber auflöst (oder wenn der Admin den Fallback anwenden muss).

- **Billige Gegenmaßnahme jetzt:** Den Fallback in Phase 1 präzisieren: Entweder ein konkretes Traefik-File-Provider-Snippet für die Coolify-Proxy-Config (UI → Proxy → Custom Configuration) bereitstellen:
  ```yaml
  http:
    middlewares:
      sn-hsts:
        headers:
          stsSeconds: 15552000
          stsIncludeSubdomains: false
          forceSTSHeader: true
  ```
  Oder klar definieren, wo genau im Dateisystem / in welcher UI-Maske der Admin diesen Fallback einträgt.

---

### [Widerspruch bei Doku-Mirror auf `main` ohne Legacy-Proxy-Config] — Widerspruch zwischen Dokumenten

- **Was widersprüchlich/undefiniert ist:** Der Plan belässt in Zeile 188 als offene Frage, ob die eingefrorene Legacy-App auf Branch `main` (`schulnavigator.mpz.schule`) ebenfalls den HSTS-Header bekommen soll (*„gleiche HSTS-Middleware mitsetzen oder bewusst auslassen?"*). Gleichzeitig fordert Phase 3 in Zeile 164 einen *„optionalen Mirror nach `main` im selben PR-Stil"* für die aktualisierten Compliance-Dokumente (`dsgvo.md`, `offen.md`, `fuer-entwickler.md`).

- **Warum später teuer:** Wenn die Doku nach `main` gemirrort wird und dort dann steht `- [x] HSTS am Proxy aktivieren (#242)` sowie in `fuer-entwickler.md` *„aktiv seit YYYY-MM-DD"*, während die Frage in Z. 188 mit „bewusst auslassen" beantwortet (oder gar nicht geklärt) wurde, entstehen drei Wahrheiten: Die Doku auf `main` behauptet, HSTS sei aktiv; der Code/Proxy für `main` hat kein HSTS; auf `kunde/39-gs` stimmt beides. Ein künftiges Audit oder ein Entwickler auf `main` verlässt sich auf die falsche Dokumentation.

- **Wann es beißt:** Beim nächsten Review oder wenn jemand die Legacy-Domain `schulnavigator.mpz.schule` testet und feststellt, dass die auf `main` als erledigt dokumentierte Maßnahme dort gar nicht existiert.

- **Billige Gegenmaßnahme jetzt:** In Phase 3 (oder bei Klärung von Z. 188) eine klare Regel festlegen: Entweder wird HSTS in Coolify *auch* für die Legacy-App konfiguriert, bevor die Doku nach `main` gemirrort wird — oder die Doku auf `main` muss beim Mirroring explizit differenzieren: *„HSTS ist ausschließlich auf GS39-Prod (`39-gs.mpz.schule`) aktiv; Legacy-App auf `main` bleibt ohne HSTS eingefroren."*

---

### [Unverifizierte Annahme zu `forceSTSHeader=true`] — Annahme, die nie verifiziert wurde / API-Vertrag

- **Was widersprüchlich/undefiniert ist:** Plan Zeile 127 setzt `traefik.http.middlewares.sn-hsts.headers.forceSTSHeader=true`. In Traefik dient dieser Parameter dazu, den HSTS-Header auch dann auszuliefern, wenn Traefik die Verbindung *nicht* als HTTPS erkennt (z. B. hinter einem unkonfigurierten Upstream-Load-Balancer ohne sauberes `X-Forwarded-Proto`). Der Plan übernimmt diesen Parameter, ohne zu verifizieren, ob er in der Coolify-Architektur (wo Traefik selbst TLS terminiert) nötig ist oder welche Nebenwirkungen er hat.

- **Warum später teuer:** Nach RFC 6797 (Section 7.2) **darf** der `Strict-Transport-Security`-Header auf unverschlüsselten HTTP-Antworten (wie dem 301/308-Redirect von HTTP auf HTTPS) **nicht** gesendet werden. Wenn `forceSTSHeader=true` dazu führt, dass Traefik den HSTS-Header bereits auf die unverschlüsselte HTTP-Redirect-Antwort (`http://39-gs.mpz.schule/`) stülpt, ist das ein normativer RFC-Verstoß, den automatisierte Security-Scanner (z. B. SSL Labs, Mozilla Observatory, BSI-Checklisten) als Fehler monieren.

- **Wann es beißt:** Bei einem formalen Security-Scan oder Audit der Domain — der HSTS-Check schlägt trotz vorhandenem Header mit einer Warnung (*"HSTS header transmitted over HTTP"*) fehl.

- **Billige Gegenmaßnahme jetzt:** Da Traefik in Coolify direkt TLS terminiert und `X-Forwarded-Proto: https` kennt, ist `forceSTSHeader=true` im Normalfall überflüssig und sollte weggelassen werden (`stsSeconds` allein reicht bei HTTPS-Requests aus). Wenn es gesetzt bleibt, in Phase 2 explizit als Verifikationsregel aufnehmen:
  `curl -sI http://39-gs.mpz.schule/ | grep -i strict-transport` darf **keinen** Treffer liefern (HSTS darf ausschließlich auf HTTPS erscheinen).

---

## Bestätigung: Positivbefunde & Konsistenz

- **Delegations-Architektur:** Die bewusste Entscheidung aus #143, HSTS nicht in Next.js (`app/lib/security-headers.ts`), sondern am Proxy (Coolify/Traefik) zu terminieren, ist architektonisch sauber. Da der Next.js-Container in Coolify über unverschlüsseltes HTTP hinter dem Proxy angebunden ist, gehört TLS-Header-Management auf den TLS-terminierenden Reverse Proxy.
- **Konservative Policy:** Die Wahl von `max-age=15552000` (180 Tage) ohne `includeSubDomains` und ohne `preload` deckt sich exakt mit den Vorgaben aus Audit Phase 5 und `fuer-entwickler.md` Z. 314–316. Die Begründung, dass unter der Wildcard `*.mpz.schule` andere Nachbar-Dienste gehostet werden, die durch `includeSubDomains` potentiell unerreichbar würden, ist absolut vertragstreu und schützt vor Kollateralschäden.
- **Unveränderte App-Header:** Die Absicherung, dass bestehende Header aus `app/next.config.ts` (CSP, Permissions-Policy, nosniff, Referrer-Policy) unangetastet bleiben und nach dem Deploy weiterhin in der Proxy-Response sichtbar sein müssen (Plan Phase 2, Z. 100 & 149), verhindert Regressionen an den bestehenden Security-Gates.
