---
tags:
  - pre-mortem
  - 01a-code-praxis
  - runtime-port
erstellt: 2026-07-04
plan: .cursor/plans/runtime-port_nach_main_842d355c.plan.md
modell: claude-fable-5
---

# Pre-Mortem 1a — Runtime-Port nach main (Code-Praxis)

**Geprüft:** Plan `runtime-port_nach_main_842d355c` gegen den realen Stand von `main` (`8e5ffc4` lokal / `980939a` origin), `feature/mpz-studio` und `kunde/39-gs`. Alle genannten Quelldateien wurden gelesen (git show/diff), nicht nur referenziert.

**Gesamturteil:** Der Plan ist vom Zuschnitt her richtig (pfadbasierter Port, Studio ausgeklammert), aber **vier Funde stoppen die Implementierung am ersten Tag** — einer beim allerersten Befehl, zwei beim ersten `npm run build`/`test`, einer beim eigenen Akzeptanzkriterium.

---

## Funde (nach Zeitpunkt des Beißens sortiert)

### F1 — `git checkout main && git pull` läuft in die Pre-#232-History (Blocker, Schritt 1)

- **Was:** Lokaler `main` steht auf `8e5ffc4` (Pre-Rewrite), `origin/main` auf `980939a` (nach `git filter-repo`, #232). `git merge-base --is-ancestor` bestätigt: **kein Fast-Forward möglich.** Der erste Befehl des Ausführungsablaufs (`git pull`) erzeugt entweder einen Merge der beiden History-Linien oder bricht ab.
- **Warum teuer:** Ein Merge vermischt die bereinigte History wieder mit Pre-Rewrite-Objekten (Schüler-Medien, DSGVO-Regression von #232) — und der Port-Branch basiert dann auf dem falschen Stand. Das Post-Mortem #232 verlangt explizit „alle lokalen Klone verwerfen".
- **Wann es beißt:** Sofort, Zeile 1 des Bash-Blocks.
- **Gegenmaßnahme (billig):** Im Plan ersetzen durch `git fetch origin && git branch -f main origin/main && git checkout -b port/runtime-compliance-to-main origin/main`. Vorher `git stash`-freien Zustand sicherstellen.

### F2 — Block 6 vergisst `app/lib/access-token-constants.mjs` (Tests rot / falsches Verhalten)

- **Was:** Kunde-`access-tokens.ts` importiert `ENTRY_QR_SPECS` aus `access-token-constants.mjs` — die Datei steht **nicht** in der Block-6-Liste. Mains Version kompiliert zwar (Exporte vorhanden), ist aber semantisch alt: `mode: 'fest'` statt `FEST_ENTRY_HUB_MODE = 'heft'` (Post-Fest-Umstellung fehlt komplett) und `FEST_DEV_EXPIRES_AT = '2026-07-31'` — der fest-Dev-Token **läuft in 4 Wochen ab**.
- **Warum teuer:** `applyEntryQrHubModes` (der portierte Audit-Positivbefund) mappt dann auf main den fest-QR weiter auf den gesperrten Puzzle-Hub; kunde-`middleware.test.ts` (Block 6) testet gegen Post-Fest-Semantik. Entweder Tests rot — oder, schlimmer, grün mit main-Konstanten und stillschweigend falschem Hub-Verhalten ab dem 01.08. (Token abgelaufen, Dev-Unlock tot).
- **Wann es beißt:** `npm run test` in der Verify-Phase; spätestens am 1. August im Dev-Betrieb.
- **Gegenmaßnahme:** `app/lib/access-token-constants.mjs` (Quelle kunde) in die Block-6-Tabelle aufnehmen.

### F3 — Block 4: Import-Kette der Structure-Validatoren ist unvollständig (Build-Bruch)

- **Was:** Zwei Ketten, beide gerissen:
  1. `validate-station-assets-structure.ts` → `import { validateStationAssets } from './validate-station-assets'` → dieser importiert `@/lib/mpz-raumbild-limits` — **existiert auf main nicht** (nur auf feature). Der Plan macht den Port von `validate-station-assets.ts` von „nur falls Import für Limits geändert" abhängig — der Import *ist* geändert (45+/17− gegen main), und die Limits-Lib fehlt obendrein.
  2. `validate-coach-messages-structure.mjs` → `import { validateCoachMessages } from './validate-coach-messages.mjs'` — mains `validate-coach-messages.mjs` ist ein reines CLI-Skript **ohne Exporte**; feature hat es dafür umgebaut (139+/125−).
- **Warum teuer:** Beides sind Import-Fehler zur Modul-Ladezeit — `npm run build` stirbt im ersten Validator-Schritt, und die Ursache (transitive Abhängigkeit) ist aus der Fehlermeldung nicht offensichtlich.
- **Wann es beißt:** Erster `npm run build` auf dem Port-Branch.
- **Gegenmaßnahme:** Block-4-Liste ergänzen um `app/scripts/validate-station-assets.ts` (unbedingt, nicht konditional), `app/scripts/validate-coach-messages.mjs` und `app/lib/mpz-raumbild-limits.ts` (alle Quelle feature). main hat `mpz-upload-rules.ts` und `image-dimensions.ts` bereits — dort kein Handlungsbedarf.

### F4 — Akzeptanzkriterium „eingebettete Playlist zeigt Weiter" ist mit dem gelisteten Dateiset unerfüllbar

- **Was:** Der feature-Hook stoppt bei Text-only-Segmenten (`if (!segmentHasAudio(seg)) { setPlaying(false); return }`) und rückt nur per Audio-`ended` weiter. Die neuen Hook-Exporte `advanceFromUserGesture` / `currentSegmentIsTextOnly` haben **keinen einzigen Konsumenten** — auch auf feature nicht (`git grep` über `app/**`, exkl. Tests: nur der Hook selbst). `raum-station-client.tsx` (einziger Hook-Nutzer, identisch main↔feature) destrukturiert sie nicht und rendert kein „Weiter"; nur der Viewer-`DialogPlayer` hat einen eigenen, lokalen Weiter-Button.
- **Warum teuer:** Ein Text-only-Segment im **eingebetteten** Dialog hängt fest — der Besucher kommt ohne Reload nicht weiter. Die Prüfregel im Plan („nur portieren, wenn Diff gegen main das erfordert") liefert hier die falsche Antwort: Es *gibt* keinen Diff, weil die Lücke schon auf feature besteht. Das Kriterium schlägt beim manuellen Verify fehl, und die Reparatur reißt dann ungeplant `raum-station-client.tsx` in den Port-Scope.
- **Wann es beißt:** Manuelle Prüfung des Akzeptanzkriteriums 1 mit einer Station, deren Dialog ein Segment ohne `quelle` enthält und die den eingebetteten Bubble-Flow nutzt (Maskottchen-Hotspot im Flat-Viewer).
- **Gegenmaßnahme (Entscheidung vor Codebeginn):** Entweder (a) Kriterium ehrlich auf den Viewer-Cutscene-Player einschränken und die Embedded-Lücke als bekanntes ADR-026-Restthema notieren, oder (b) einen kleinen, bewussten Zusatz-Patch in `raum-station-client.tsx` einplanen (Hook-Felder konsumieren + Weiter im Bubble) — dann aber als expliziter Scope-Punkt, nicht als Port.

### F5 — `text-brand-green` in `legal-blocks.tsx` ist auf main eine tote Klasse (stiller UI-Defekt)

- **Was:** Kunde-`legal-blocks.tsx` (Block 5) stylt Links mit `text-brand-green`. Das Tailwind-v4-Mapping `--color-brand-green` kommt erst mit kunde-`globals.css` (+18 Zeilen) — und die wird bewusst **nicht** portiert, weil sie `@import './mpz-studio-tokens.css'` (Studio v3, explizit out of scope) enthält.
- **Warum teuer:** Kein Build-Fehler, kein Test-Fehler — die Klasse wird einfach nicht generiert, Legal-Links rendern in Default-Farbe. Exakt das bekannte brand-green/red-Token-Gap-Muster (Ampel-Dots, Juni).
- **Wann es beißt:** Erst beim Sichttest von `/impressum`/`/datenschutz` — oder gar nicht, und es lebt als Inkonsistenz weiter.
- **Gegenmaßnahme:** Die zwei Mapping-Zeilen (`--color-brand-green: var(--brand-green);` und `--color-brand-red: var(--brand-red);`) manuell in mains `globals.css`-`@theme`-Block übernehmen — **ohne** den v3-Import und ohne die `mpz-*`-Spacing-Zeilen. Als eigenen Stichpunkt in Block 5 aufnehmen.

### F6 — Kleinigkeiten, die kurz aufhalten

- **S1-Snippet passt nicht 1:1 auf die Route-Signatur:** Die media-Route nimmt `Request` (Web-API), das Dialog-Muster nutzt `cookieStore` (`await cookies()` aus `next/headers`). Funktioniert beides — aber der Implementierer muss sich entscheiden; Snippet im Plan suggeriert Copy-Paste.
- **`no-store` vs. Video-Seeking:** Der Plan schreibt `Cache-Control: private, no-store` vor („wie Dialog-Route"). Die Dialog-Route liefert kleine WAVs; die media-Route streamt MP4s mit Range/206 — `no-store` erzwingt bei jedem Seek einen vollen Refetch. `private, max-age=3600` erfüllt den S1-Zweck (kein Shared-Cache) ohne die Seek-Performance zu opfern.
- **Plan-Link-Tippfehler:** `.gitattributes` liegt unter `app/.gitattributes`; der Link im Plan zeigt auf `app/app/.gitattributes`. Nur kosmetisch — die Checkout-Pfadliste muss den richtigen Pfad nehmen.
- **Block-2-Quelle Wrapper:** `app/components/audio/audio-autoplay-unlock.tsx` existiert **nur auf kunde** (feature hat ihn entfernt). Der Plan sourct ihn korrekt von kunde — wer den Block stur von feature checkt, bekommt „pathspec did not match".

---

## Bestätigungen (geprüft, solide)

- **main trägt die kunde-Middleware:** `mpz-studio-guard.ts` auf main exportiert bereits `MPZ_STUDIO_UNLOCK_PATH`, `mpzStudioPageGuard`, `MPZ_STUDIO_COOKIE` — kunde-`middleware.ts` und `middleware.test.ts` kompilieren (Test-Imports `resetAccessConfigCacheForTests`, `ACCESS_COOKIE`, `FEST_DEV_TOKEN` … alle vorhanden, sofern F2 behoben ist).
- **Block 2 kompiliert gegen main:** `components/ui`-Index, `hub-mode.ts`, `home-cta.ts`, `next-station.ts`, `schoolhouse-hub-map.ts` sind main↔feature **identisch**; `HomeFestScanCta`, `FestiveDecor`, `Gs39Chip*` existieren auf main.
- **Block 3 Quellwahl egal:** media-Route + `public-media-file.ts` sind feature↔kunde byte-identisch; `getStationsPaths` existiert in mains `mpz-content-io.ts:855`. Plan-Annahme „Route neu auf main" stimmt (kein `app/app/media/` auf main).
- **Block 1 Diff-Umfang klein und additiv:** Hook-Erweiterung bricht den bestehenden main-Aufrufer nicht (nur neue Rückgabefelder); `dialog-audio-naming.ts` ist korrekt als Port gelistet (fehlt auf main); `DialogPlayer`-Weiter im Viewer funktioniert eigenständig.
- **package.json-Merge ist klein:** mains `build`-Script hat bereits alle sechs `validate:*`-Aufrufe — es sind wirklich nur zwei Script-Einträge plus zwei Umbenennungen im `build`-String; `deploy:content` sauber ausklammerbar.

## Empfohlene Plan-Änderungen vor Start (Kurzliste)

1. Ausführungsablauf: `main` per `git fetch` + `branch -f` auf `origin/main` setzen (F1).
2. Block 6 + `app/lib/access-token-constants.mjs` (kunde) (F2).
3. Block 4 + `validate-station-assets.ts`, `validate-coach-messages.mjs`, `app/lib/mpz-raumbild-limits.ts` (feature), Konditionalsatz streichen (F3).
4. Akzeptanzkriterium 1 entscheiden: Viewer-only oder `raum-station-client`-Patch als expliziter Scope (F4).
5. Block 5 + zwei `--color-brand-*`-Mapping-Zeilen in mains `globals.css` (F5).
6. Block 3: Cache-Header `private, max-age=3600` statt `no-store`; Snippet an `Request`/`cookies()` anpassen (F6).
