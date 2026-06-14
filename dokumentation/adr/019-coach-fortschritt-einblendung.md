# ADR-019 — Coach: fortschritts-getriggerte Maskottchen-Einblendungen (getrennt vom Dialog)

**Datum:** 2026-06-14
**Status:** entschieden

## Kontext

Frieda und Otto erscheinen heute nur als **Dialog-Maskottchen** im Panorama (Tap auf Hotspot, ADR-010/011). Ergänzend soll es **fortschritts-getriggerte Einblendungen** geben („Coach"): kurze Motivations-/Orientierungstexte, die viewport-fix einschieben — auf dem Hub bei Meilensteinen (Begrüßung, erster Besuch, Halbzeit, alle Stationen) und einmalig beim ersten Öffnen ausgewählter Räume.

Diese Einblendungen sind etwas anderes als der Dialog: sie hängen am Fortschritt, nicht an Hotspots; sie haben eigenen Content; und sie dürfen den Dialog nicht stören. Bei „alle Stationen entdeckt" existiert bereits ein `SparkleBurst` auf der Fortschrittskarte ([`home-screen.tsx`](../../app/components/home/home-screen.tsx)) — Coach und Sparkle müssen sich vertragen.

Rahmenbedingungen, die die Entscheidungen prägen:

- **Start 26.06.2026, keine Bestandsnutzer** — am Starttag trägt kein Gerät Alt-State. Es gibt keinen Migrationsbedarf von `sn_sparkle_done`.
- **Schulstartheft (Heft-Modus) ab August 2026**, über ~1 Schuljahr nutzbar — der „gesehen"-State liegt langlebig auf den Geräten.
- **Zielgruppe Grundschulkinder** — tippen viel, schließen Overlays selten bewusst.
- **Fest-Modus markiert Räume nicht beim Öffnen als „visited"** (`station-visit-recorder.tsx:25` — `if (mode === 'fest') return`); „visited" entsteht dort nur über den QR-Scanner.

Detail-Umsetzung: [Coach-Sparkle-MVP-Plan](../../.cursor/plans/coach_sparkle_mvp_d9e82ce2.plan.md); Kurzidee: [`maskottchen-fortschritt-einblendung.md`](../kurzfristige-ideen/maskottchen-fortschritt-einblendung.md).

## Entscheidung

Eigenes Content- und Storage-Modell, getrennt vom Dialog (ADR-010/011). Sieben Festlegungen (Pre-Mortem-Sparring 2026-06-14):

| Thema | Entscheidung |
|-------|--------------|
| **Trennung** | Eigene Datei [`app/content/coach-messages.json`](../../app/content/coach-messages.json), **kein** Missbrauch von `stations.json → dialog`. Eigene Lib- und UI-Schicht (`coach-*`) |
| **Trigger-Semantik** | **Schwellwert statt exaktem Treffer:** höchste noch nicht gesehene Marke mit `milestone <= visitedCount` gewinnt. Übersprungene Marken (z. B. Sprung über 6/11 ohne Hub-Zwischenstopp) werden beim nächsten Hub-Besuch nachgeholt. **Datengetrieben** — keine hartcodierte Priorität/Zahl |
| **Complete** | Eigener Trigger `hub-complete`, gegen die **echte** `totalStations` aufgelöst (statt magischer `milestone: 11`). Bleibt im Gleichschritt mit der dynamischen Sparkle-Bedingung `visitedCount === hubStations.length` |
| **Duo-Auftritt** | Beim Abschluss erscheinen beide Figuren: **`placement: "duo-split"`** — Frieda von links, Otto von rechts, gemeinsame Blase mittig. `mascot: "duo"` erfordert `duo-split` (und umgekehrt); andere Kombis sind invalid |
| **„gesehen" markieren** | **Beim Anzeigen** (nicht erst beim Schließen) — robust gegen Wegtippen bei Kindern. In-Memory-Guard verhindert Re-Pop in derselben Session |
| **Modus-Trennung** | Seen-State **pro Modus getrennt**: `sn_coach_seen_fest` / `sn_coach_seen_heft`. Heft und Fest sind eigene Anlässe |
| **Room-Coach** | Hängt an `roomCoachSeen(slug)`, **nie** an `sn_visited_slugs` — sonst bräche der Fest-Modus, wo „Raum geöffnet" ≠ „visited" |
| **Migration** | **Keine.** Kein `sn_sparkle_done`-Hydrate-Migrationsblock (keine Bestandsnutzer am Start) |

**Storage-Struktur** (langlebiges Heft): `{ version: 1, seen: string[], suppressed: string[] }` je Modus-Key. `seen` = real gezeigt; `suppressed` = wegen „höchste Marke gewinnt" bewusst übersprungen (kein Retro-Coach). Lese-/Schreibzugriff **try/catch** nach dem `visited-stations`-Muster (Default ohne Crash bei korruptem/Altformat-`localStorage`), **nicht** das nackte `sparkle-done`-Muster.

**11/11-Sequenz:** Coach `complete` zuerst (kein Sparkle), nach Schließen `SparkleBurst` wie bisher → `markSparkleDone()`. `complete` wird schon beim Anzeigen als `seen` markiert; bei Refresh dazwischen erscheint kein erneuter Coach, der Sparkle zeigt sich beim nächsten `/` (gewünschtes Endverhalten) — kein dedizierter `sequence_step`-Storage.

**Layer-Vertrag** (verifizierte z-Index-Landschaft `1/2/10/20/35/40`):

| Ebene | z-index | Regel |
|-------|---------|-------|
| Raum-TopBar | 10 | bleibt sichtbar (Coach unten/seitlich verankert) |
| Gyro-Berechtigung | 10 | Coach blockiert während `checking` / `needs-gesture` (Viewer-Gate) |
| Pan-Onboarding | 20 | Coach blockiert, solange Pan-Hinweis sichtbar |
| Dialog-Bubble | 1–2 | Coach blockiert, solange `dialogUiActive` |
| Medienpanel | 35/40 | Coach blockiert, solange `panelOpen` |
| Coach-Overlay | 50 | nur wenn keine andere modale UI offen |
| Sparkle | Card-Kontext | nach Coach-`complete` (sequenziell) |

**Raum-Priorität:** Gyro-Dialog → Pan-Onboarding → Room-Coach (gleicher Besuch). Terminales `unsupported` (kein Sensor, z. B. Desktop) blockiert den Coach nicht.

`useCoachNudge`-Prop `blocked` deckt Dialog, Medienpanel und den Viewer-Gate (`onViewerCoachGateChange`) ab. Künftige Layer (Toast `fest-locked-tap`) werden hier ergänzt, statt z-index hochzuschrauben.

## Begründung

- **Schwellwert statt exakt:** Bei einem Eintages-Event gibt es keine zweite Chance — exakte `visitedCount`-Treffer fielen bei nicht-linearem Fortschritt (Heft frei, schnelle Mehrfach-Scans) lautlos aus. Schwellwert ist selbstheilend.
- **`hub-complete` datengetrieben:** Der Sparkle nutzt bereits die dynamische `hubStations.length`. Eine hartcodierte `11` würde bei jeder Stationszahl-Änderung (z. B. #17 für `kunst`/`hort`/`schulsozialarbeit`) lautlos von der Sparkle-Bedingung abdriften — genau dann, wenn niemand mehr in den Coach-Code schaut. Der Validator verriegelt beide gegen die echte Stationszahl.
- **Seen beim Anzeigen:** Kinder tippen weiter, statt zu schließen — „seen erst bei Schließen" führte zu nervigem Wiederauftauchen.
- **Modus-getrennt + versioniert + try/catch:** Das Heft liegt über ein Schuljahr auf den Geräten. Ein Versionsfeld erlaubt späteres gezieltes Nachsteuern (Texte korrigieren, Marke ergänzen); try/catch verhindert Crashs bei Safari-Private/Speicher-Limit/korruptem Storage.
- **Room-Coach slug-basiert:** Würde er an `visited` hängen, bräche der Hauptfall (Fest-QR-Rundgang), weil dort das Öffnen keinen Besuch markiert.
- **Keine Migration:** Ohne Bestandsnutzer entfällt ein ganzer, fehleranfälliger Hydrate-Block — die schlankste sichere Lösung.
- **Layer-Vertrag vorab:** Ohne expliziten Vertrag werden Overlay-Konflikte später per z-index-Eskalation „gelöst". Eine Matrix im ADR ist die billige Versicherung.

## Verworfene Alternativen

- **Exakter `visitedCount`-Treffer:** einfacher, aber verliert Meilensteine lautlos bei nicht-linearem Fortschritt — am Eventtag nicht debuggbar.
- **Hartcodierte Meilenstein-Zahlen (6, 11):** driften lautlos von der dynamischen Sparkle-Bedingung ab, sobald sich die Stationszahl ändert.
- **`sn_sparkle_done`→`coach_seen`-Migration:** unnötig (keine Bestandsnutzer) und ein riskantes Einmal-Fenster beim Deploy.
- **Gemeinsamer Seen-State über beide Modi:** Fest würde sich „leer" anfühlen, wenn zuhause im Heft schon alles gesehen wurde.
- **„seen" erst bei bewusstem Schließen:** führt bei tippfreudigen Kindern zu Wiederholungen.
- **Dedizierter `sequence_step`-Storage für Coach→Sparkle:** Over-Engineering; das bestehende `sn_sparkle_done` + `seen` liefert das gewünschte Endverhalten auch nach Refresh.
- **Dialog-Datenmodell wiederverwenden (`stations.json → dialog`):** koppelt zwei unabhängige Features; eigenes Modell hält spätere Änderungen billig.

## Konsequenzen

- **Neue Dateien:** `app/content/coach-messages.json`; `app/lib/coach-seen.ts`, `app/lib/coach-triggers.ts` (+ Vitest); `app/scripts/validate-coach-messages.mjs`; `app/components/coach/mascot-peek-overlay.tsx`, `app/components/coach/coach-nudge-layer.tsx`; `app/hooks/use-coach-nudge.ts`.
- **Geändert:** `app/lib/types.ts` (Coach-Message-Typen); `app/app/sn-theme.css` (Keyframes `bottom`/`left`/`right`, `duo-split`, `prefers-reduced-motion`); `app/components/home/home-screen.tsx` (Hub-Coach + Sparkle-Orchestrierung); `app/components/raum-station-client.tsx` (Room-Coach, `blocked` inkl. Viewer-Gate); `app/lib/raum-viewer/viewer-coach-gate.ts`; `app/package.json` (`validate:coach` vor `build`).
- **Validator-Regeln:** IDs eindeutig; Room-Slugs in `stations.json`; genau **eine** `hub-complete`-Message; höchste `hub-milestone` < Stationszahl; `placement` ∈ `bottom`/`left`/`right`; `mascot: "duo"` ⇔ `placement: "duo-split"`.
- **Storage-Keys:** `sn_coach_seen_fest`, `sn_coach_seen_heft` (`{version, seen, suppressed}`); bestehender `sn_sparkle_done` bleibt unverändert.
- **Seed-Räume (MVP):** `klassenzimmer`, `musik`, `hort` (kurze Orientierungstexte, mit MPZ nachziehbar); **keine** `daz`/`pc-raum` (Dialog-Hotspots).
- **Abgegrenzt zu ADR-010/011:** Dialog (Hotspot-getriggert, Audio) bleibt unberührt; Coach ist text-only, fortschritts-getriggert. Kein Autoplay-Audio (iOS-sicher).
- **Bewusst nicht jetzt:** `fest-locked-tap`-Toast (Follow-up), Coach-Audio/„Anhören", placement-Umschalten per Breakpoint, Directus-Anbindung.
- **Offen:** finale Coach-Texte inhaltlich mit MPZ; ggf. weitere Seed-Räume nach Festerfahrung.
