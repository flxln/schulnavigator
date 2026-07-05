---
tags:
  - pre-mortem
  - 01a-code-praxis
  - audit-phase-5
erstellt: 2026-07-04
plan: .cursor/plans/audit_phase_5_umsetzung_fe564923.plan.md
---

# Pre-Mortem 1a — Audit Phase 5 Umsetzung (Code-Praxis & Implementierbarkeit)

**Geprüft:** Plan `audit_phase_5_umsetzung_fe564923.plan.md` gegen den realen Code-Stand von `main` (`8e5ffc4`/`origin/main`), `kunde/39-gs` und `feature/mpz-studio`. Alle im Plan referenzierten und tangierten Quelldateien sowie Deploy-Skripte wurden gelesen (`view_file` / `git show` / `git diff`).

**Senior-Developer-Blick:** Der Plan ist strukturell gut aufgebaut und trennt sauber zwischen S1-Blockern (Media-Gate), organisatorischen Hard-Gates (AVV #43, DSB) und nachgelagertem Directus-Start (#47). Bei der konkreten Umsetzung am ersten Tag und im weiteren Sprint stoppt der Entwickler jedoch an **fünf konkreten Code- und Skript-Fallen**: Eine bringt den Prod-Deploy zum Scheitern oder erzeugt ein 404-Race-Condition-Fenster, zwei führen zum Ablauf der Tokens bzw. zum Fehlen kompletter Legal-Strukturen auf dem Feature-Branch vor Directus-Start, eine führt in die Irre bei der DSB-Synchronisation und eine erzeugt toten Security-Code.

---

## Funde (nach Zeitpunkt des Beißens sortiert)

### F1 — `deploy-content.sh` bricht auf Hotfix-Branch ab & Webhook-Race-Condition bei GitHub-Merge (Phase 0.1, Schritt 4–5)
- **Was übersehen/unterspezifiziert ist:** Der Plan schreibt für das Prod-Deploy in Phase 0.1 vor: `5. PR → kunde/39-gs, danach npm run deploy:content (Medien-Sync vor Coolify-Webhook — Audit S7)`. Wer das als Entwickler exakt so ausführt, läuft in zwei Fallen im Skript `app/scripts/deploy-content.sh`:
  1. **Branch-Check-Abbruch:** Wer `npm run deploy:content` noch auf dem Hotfix-Branch (`hotfix/media-gate-kunde`) ausführt, bricht auf Zeile 65 mit Exit 1 ab: `if [ "$CURRENT_BRANCH" != "$DEPLOY_BRANCH" ]; then ... exit 1; fi` (`DEPLOY_BRANCH` ist fest `kunde/39-gs`).
  2. **Webhook-Race auf GitHub:** Wenn der PR auf GitHub gemergt wird und Coolify per GitHub-Webhook auf Pushes reagiert, startet der Container-Neubau **sofort beim Klick auf „Merge PR“** – noch bevor der Entwickler lokal `npm run deploy:content` (für den Medien-`rsync`) starten kann! Damit entsteht genau das 404-Fenster für Medien, das Audit S7 verhindern wollte. Selbst wenn Coolify nur über den manuellen Skript-Webhook (`COOLIFY_DEPLOY_WEBHOOK_URL`) triggert: Nach dem PR-Merge auf GitHub ist der lokale Branch `kunde/39-gs` veraltet. Wer nicht vor `deploy:content` erst auscheckt und pullt (`git checkout kunde/39-gs && git pull origin kunde/39-gs`), schlägt beim `git push origin HEAD` im Skript fehl oder pusht einen veralteten Stand.
- **Warum später teuer:** Der Hotfix-Deploy scheitert mit unklaren Skript-Abbrüchen oder (schlimmer) erzeugt auf Prod 403/404-Fehler bei Medienabrufen, weil Code und Medien-Dateien auf dem Server asynchron deployt werden.
- **Wann es beißt:** Am ersten Tag, direkt bei der Ausführung von Schritt 5 der Phase 0.1 im Terminal oder bei der Prod-Verifikation.
- **Billige Gegenmaßnahme jetzt:** Im Plan den Arbeitsablauf für Schritt 5 präzisieren:
  1. Auf GitHub gemergte PRs erfordern lokal zwingend: `git checkout kunde/39-gs && git pull origin kunde/39-gs`.
  2. Danach erst `npm run deploy:content` (welches validiert, pusht, Medien per `rsync` synchronisiert und erst ganz am Ende den Coolify-Webhook ruft).
  3. Falls Coolify ein Auto-Deploy auf GitHub-Push aktiv hat: Dieses im Coolify-Dashboard für `kunde/39-gs` deaktivieren, damit ausschließlich der synchrone Webhook aus `deploy-content.sh` nach abgeschlossenem Medien-Sync auslöst.

### F2 — Sync nach `feature/mpz-studio` vergisst `access-token-constants.mjs` – Tokens laufen am 31.07.2026 ab (Phase 0.1 & 1.4)
- **Was übersehen/unterspezifiziert ist:** Der Plan fordert in Phase 0.1 den Port des Media-Gates nach `feature/mpz-studio` und in Phase 1.4 eine Branch-Konsolidierung (`ADR-026`, `ADR-027`, `dsgvo.md`). Weder in Phase 0.1 noch in Phase 1.4 ist die Datei `app/lib/access-token-constants.mjs` (bzw. `access-tokens.ts`) für den Sync nach `feature/mpz-studio` aufgeführt! Ein `git show feature/mpz-studio:app/lib/access-token-constants.mjs` zeigt: Auf dem Feature-Branch steht `FEST_DEV_EXPIRES_AT` noch auf `'2026-07-31'` und `FEST_ENTRY_HUB_MODE` auf `'fest'` (während `main` und `kunde/39-gs` bereits auf `'2027-07-31'` und `'heft'` aktualisiert wurden).
- **Warum später teuer:** Wenn im August die Phase 4 (#47 Directus-Integration) auf `feature/mpz-studio` startet, sind dort sämtliche Dev-Eintrittstokens abgelaufen (`validateToken` liefert `null`, 403 auf alle Schülermedien, Entry-Gate sperrt). Zudem testet man auf `feature` gegen den alten Puzzle-Hub statt den neuen Schulhaus-Heft-Hub. Entwickler suchen den Bug dann fälschlicherweise in der neuen Directus-Auth-Logik oder Middleware, statt in den veralteten Branch-Konstanten.
- **Wann es beißt:** Spätestens am 1. August 2026 beim ersten `npm run dev` auf `feature/mpz-studio` für die Directus-Entwicklung – oder bei jedem Hub-Rundgang-Test auf dem Feature-Branch.
- **Billige Gegenmaßnahme jetzt:** In Phase 1.4 (Tabelle Branch-Konsolidierung) oder direkt in Phase 0.1 die Datei `app/lib/access-token-constants.mjs` als obligatorischen Sync-Pfad von `main` nach `feature/mpz-studio` ergänzen.

### F3 — Legal-Sync vergisst den Branch `feature/mpz-studio` komplett (Phase 1.4)
- **Was übersehen/unterspezifiziert ist:** In der Tabelle in Phase 1.4 steht: `Legal (Impressum, DSE, dsb-contact) | main / kunde | gegenseitig angleichen`. Der Branch `feature/mpz-studio` wird hierbei komplett ignoriert. Ein Prüf-Diff (`git diff main feature/mpz-studio -- app/content/legal/`) belegt: Auf `feature/mpz-studio` existieren weder das Verzeichnis `app/content/legal/` noch die zugehörigen UI-Routen (`app/app/impressum/`, `app/app/datenschutz/`, `app/components/legal-blocks.tsx`), da diese erst in PR #237 auf `main` und `kunde` entstanden sind.
- **Warum später teuer:** Wenn in Phase 4 (Directus-Vorbereitung #47) auf `feature/mpz-studio` gearbeitet wird, wo laut Plan ausdrücklich das „DSE-Update: Abschnitt Lehrkräfte-Login“ und die Auth-Integration umgesetzt werden sollen, fehlen die kompletten Legal-Strukturen, Typen und Seiten! Ein späterer Merge von `feature/mpz-studio` nach `main` würde zu massiven Merge-Konflikten oder 404-Fehlern bei den Legal-Links führen.
- **Wann es beißt:** Beim Start von Phase 4 auf `feature/mpz-studio` (wenn der DSE-Abschnitt für Lehrkräfte-Login hinzugefügt werden soll) oder beim finalen Merge des Studio-Branches.
- **Billige Gegenmaßnahme jetzt:** In der Tabelle von Phase 1.4 als explizites Ziel aufnehmen: Port von `app/content/legal/`, `app/app/impressum/`, `app/app/datenschutz/` und `app/components/legal-blocks.tsx` von `main` nach `feature/mpz-studio`.

### F4 — Schritt 3 in Phase 1.1 ist ein Leerschritt (DSB wird in `datenschutz.ts` bereits dynamisch referenziert)
- **Was übersehen/unterspezifiziert ist:** Phase 1.1 Schritt 3 fordert: `3. DSE-Abschnitt Datenschutzbeauftragter in datenschutz.ts synchronisieren`. Wer `datenschutz.ts` öffnet, um dort den neuen DSB einzutragen, findet keinen hardcodierten Namen. Die Datei importiert bereits `LEGAL_DSB_CONTACT` aus `dsb-contact.ts` (Zeile 1) und interpoliert dynamisch:
  `text: "Datenschutzbeauftragte/r: ${LEGAL_DSB_CONTACT.name}\nE-Mail: ${LEGAL_DSB_CONTACT.email}\nTelefon: ${LEGAL_DSB_CONTACT.phone}"` (Zeile 25).
- **Warum später teuer:** Der Entwickler sucht unnötig nach einer zu ändernden Stelle in `datenschutz.ts` oder vermutet eine fehlende Verknüpfung. Gleichzeitig übersieht der Plan, dass in `impressum.ts` (Zeile 76, unter „Verantwortlich für die Inhalte“) die Schulleitung (`Ines Schubert`) namentlich hardcodiert ist. Falls die Schulleitung/DSB-Rolle sich ändert, muss `impressum.ts` geprüft werden, nicht `datenschutz.ts`.
- **Wann es beißt:** Bei der Umsetzung von Phase 1.1 im Editor.
- **Billige Gegenmaßnahme jetzt:** Schritt 3 in Phase 1.1 streichen bzw. präzisieren: „`datenschutz.ts` aktualisiert sich via `LEGAL_DSB_CONTACT` automatisch; stattdessen prüfen, ob in `impressum.ts` (Abschnitt ‚Verantwortlich für die Inhalte‘) Textanpassungen nötig sind.“

### F5 — `secure: process.env.NODE_ENV === 'production'` in `mpz-studio-guard.ts` ist toter Code (Phase 2.4)
- **Was übersehen/unterspezifiziert ist:** Phase 2.4 fordert für `mpz-studio-guard.ts:76`: `secure: process.env.NODE_ENV === 'production'`. In derselben Datei (Zeilen 8–10) ist jedoch definiert:
  `export function isMpzStudioEnabled(): boolean { return process.env.NODE_ENV === 'development' }`.
  In Production (`NODE_ENV === 'production'`) ist das gesamte MPZ Studio hart deaktiviert (`assertMpzStudioAccess` liefert 404). Die Funktion `setMpzStudioSessionCookie` wird in Production also **niemals** aufgerufen! In Development (`NODE_ENV === 'development'`) hingegen evaluiert die vorgeschlagene Bedingung zu `false`, womit das Cookie weiterhin unsecure ist – selbst wenn der Entwickler lokal oder im LAN über HTTPS testet (`npm run dev` nutzt per `package.json` standardmäßig `--experimental-https`!).
- **Warum später teuer:** Es wird eine Scheinsicherheit („Cookie ist in Prod abgesichert“) in den Code eingebaut, die zu 100 % toter Code ist. Wenn das Studio künftig (z. B. für Redakteure in Phase 4) auf einem Staging- oder Prod-Server unter HTTPS aktiviert wird, greift diese Logik erst, wenn gleichzeitig `isMpzStudioEnabled()` umgeschrieben wird – und lokal unter HTTPS bleibt das Cookie unsecure.
- **Wann es beißt:** Bei einem Security-Audit, bei HTTPS-Tests im LAN oder sobald das Studio in Phase 4 für Lehrkräfte auf Servern freigeschaltet wird.
- **Billige Gegenmaßnahme jetzt:** In Phase 2.4 notieren, dass Studio aktuell rein dev-gated ist. Für eine zukunftssichere HTTPS-Absicherung in `setMpzStudioSessionCookie` stattdessen `secure: req?.nextUrl?.protocol === 'https:' || process.env.NODE_ENV === 'production'` (bzw. Übergabe eines `isHttps`-Flags aus dem Request) spezifizieren.

---

## Bestätigungen (solide Code-Praxis im Plan)

- **Fehlerbehandlung & Abgrenzung (Phase 0.1 Media-Gate):** Die Portierung von `app/app/media/[...path]/route.ts` von `main` nach `kunde/39-gs` ist architektonisch und vom Code her solide: Die Route nutzt bewusst `new Response(null, { status: 403 })` ohne Body oder Redirect, weil `<video>`- und `<img>`-Tags einem 307-Redirect der Middleware nicht folgen können und sonst HTML statt Binärdaten streamen würden. Auch die Range-Request-Logik (HTTP 206) sowie die Abhängigkeiten (`validateToken`, `isAccessGated`, `ACCESS_COOKIE`) sind auf `kunde/39-gs` durch die Middleware bereits vollständig vorhanden und testbar.
- **Infrastruktur & Compliance (Phase 1 & 2):** Die Trennung zwischen organisatorischen Blockern (AVV #43, DSB) und technischen Gates vor Directus (#47) ist logisch sauber gegliedert. Auch der Verzicht auf ein Merge bei `kunde/39-gs` (pfadbasierter Port gemäß `branch-freeze-kunde.mdc`) ist strikt und korrekt eingehalten.
