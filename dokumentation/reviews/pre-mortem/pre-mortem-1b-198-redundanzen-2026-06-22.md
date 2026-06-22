---
tags:
  - pre-mortem
  - 1b-logik-spec
erstellt: 2026-06-22
---

# Pre-Mortem 1b — Logik, Spec & API-Vertrag: Issue #198 (Redundanzen)

Basierend auf dem Implementierungsplan `mpz_redundanzen_#198_ac3fbffd.plan.md` und der Vorlage `1b_pre-mortem-logik.md`.
Gegenstück zu [[pre-mortem-1a-198-redundanzen-2026-06-22]] (Code-Praxis).

## Funde zur Logik, Spec-Konsistenz und zum API-Vertrag

### 1. Query-Redirect-Kollision: `next.config.ts` übersteuert `ingest/page.tsx`
- **Was widersprüchlich ist:** Der Plan fordert in der Datei-Tabelle (Z. 98) einen `next.config.ts`-Redirect `/mpz/studio/ingest → /mpz/studio/stationen` (`permanent: true`) **und** gleichzeitig (Z. 100 + Z. 153) eine Query-abhängige Logik in `ingest/page.tsx`: `/ingest?slug={hubSlug} → /stationen/{slug}?tab=medien`. Next.js `redirects()` aus `next.config.ts` matchen jedoch unabhängig von der Query, solange kein `has`-Matcher definiert wird. Der konfigurierte Redirect feuert also auch bei `/ingest?slug=x` und leitet stur auf `/stationen` weiter — die Page-Komponente wird nie erreicht, die Query-Logik ist tot.
- **Warum später teuer:** Akzeptanzkriterium 3 („mit `?slug={hubSlug}` → `/…/?tab=medien`") ist zur Implementierungszeit nicht erfüllbar. Der Entwickler baut die Page-Logik, stellt beim manuellen Test fest, dass sie ignoriert wird, und muss entweder den `next.config`-Redirect mit `has`-Matchern verfeinern (fehleranfällig, da Next.js keine Negation unterstützt) oder ihn ganz streichen und alles in die Page verlagern. Letzteres bricht zudem das `permanent: true`-Versprechen für Suchmaschinen/Bookmarks ohne Query.
- **Wann es beißt:** Direkt bei der Umsetzung von Todo `redirects` bzw. beim manuellen Smoke-Test `curl -I '/mpz/studio/ingest?slug=musik'`. Erwartet: 307/308 auf `/stationen/musik?tab=medien`. Tatsächlich: Redirect auf `/stationen` ohne Query.
- **Billige Gegenmaßnahme jetzt:** Im Plan eine der beiden Varianten verbindlich machen und die andere streichen:
  - **(A) Empfohlen:** Gar keinen `next.config`-Redirect für `/ingest`. Stattdessen `ingest/page.tsx` als alleinige Stelle mit serverseitigem `redirect()` — ohne Query → `/stationen`, mit gültigem `slug` → `/stationen/{slug}?tab=medien`. Nachteil: kein HTTP-308 für Bookmarks ohne Query (akzeptabel, da interne Route).
  - **(B)** `next.config`-Redirect **nur** für den Fall ohne Query, via `has: [{ type: 'query', key: 'slug', value: '' }]` ist nicht negierbar — daher müssten zwei Redirects mit unterschiedlichen `has`-Matchern definiert werden. Unübersichtlich, nicht empfohlen.

### 2. Falsche Analogie „Redirect-Muster analog #197" — Query-Fall nicht abgedeckt
- **Was widersprüchlich ist:** Der Plan begründet das Redirect-Muster mit „Analog #197" (Z. 207). Prüfung von `next.config.ts` zeigt: Die #197-Redirects sind `/hub → /design?tab=hub` und `/brand → /design?tab=brand` — beides **statische Redirects ohne eingehende Query**. Die #197-Pages (`hub/page.tsx`, `brand/page.tsx`) sind reine `redirect()`-Fallbacks ohne Query-Verzweigung. #198 dagegen braucht für `/ingest` eine **Query-abhängige** Verzweigung (`slug` vorhanden/valid vs. absent) — dieser Fall ist in #197 **nicht** implementiert und damit auch nicht als Analogie tauglich.
- **Warum später teuer:** Ein Entwickler, der „analog #197" liest, kopiert das statische Muster und übersieht die Query-Logik. Folge: Entweder bricht Akzeptanzkriterium 3 (siehe Fund 1) oder der Entwickler improvisiert und das Muster divergiert zwischen den Routes.
- **Wann es beißt:** Code-Review oder Implementierung von Todo `redirects`; spätestens, wenn der erste externe Link mit `?slug=` getestet wird.
- **Billige Gegenmaßnahme jetzt:** Die Analogie explizit eingrenzen: „Analog #197 **nur für `dialog-audio` und `[slug]?tab=dialog-audio`** (statisch). Für `/ingest` Query-Verzweigung **neu** in `ingest/page.tsx`, kein Vorbild in #197."

### 3. Tab-Diskriminierung `dialog-audio` → Server- vs. Client-Fallback (öffentlicher URL-Vertrag)
- **Was unvollständig spezifiziert ist:** Der Plan definiert **zwei** Mechanismen für `?tab=dialog-audio`: (a) serverseitiger Redirect in `[slug]/page.tsx` (Z. 102, 155) und (b) Client-Fallback in `resolveTab` (Z. 103, 206). Die Reihenfolge und das Zusammenspiel sind nicht spezifiziert. Aktuell fällt `resolveTab` bei einem aus `VALID_TABS` entfernten Wert auf `'stammdaten'` zurück (Code Z. 33–38). Der Plan fordert „`dialog-audio` → `dialog`", ohne zu sagen, ob diese Regel **vor** dem `VALID_TABS`-Check greifen muss. Zudem: Server-Redirects greifen nicht bei reiner Client-Navigation (z. B. `<Link prefetch>` ohne Server-Roundtrip). Die URL `?tab=dialog-audio` ist ein **öffentlicher Vertrag** — alte Bookmarks, geteilte Links, Browser-History.
- **Warum später teuer:** Wenn der Client-Fallback den Server-Redirect „verdeckt" oder umgekehrt, landen Nutzer je nach Navigationsart auf unterschiedlichen Tabs (`stammdaten` vs. `dialog`). Das ist kein Breaking Change im engeren Sinn, aber eine inkonsistente Nutzererfahrung, die in Bug-Reports schwer zu reproduzieren ist („manchmal Tab A, manchmal Tab B"). Zudem: Wenn `resolveTab` nicht explizit vor dem `VALID_TABS`-Check prüft, greift der Default-Fallback und das Akzeptanzkriterium „`dialog-audio` → `dialog`" ist verletzt.
- **Wann es beißt:** Nach Go-Live, wenn Nutzer mit alten Bookmarks/History auf die Station-Detail-Seite kommen. Je nach Navigation (direkt vs. Client-Side) unterschiedliches Verhalten. Auch: Die Tests in `station-detail-shell.test.tsx` müssen beide Pfade abdecken — sonst ist der Fallback grün, der Server-Redirect aber defekt (oder umgekehrt).
- **Billige Gegenmaßnahme jetzt:** Im Plan festhalten:
  1. `resolveTab` muss **explizit** `if (raw === 'dialog-audio') return 'dialog'` **vor** dem `VALID_TABS`-Check enthalten (wie auch im 1a-Pre-Mortem angemerkt).
  2. Klarstellen: „Server-Redirect ist Primary (HTTP 308 für Bookmarks), Client-Fallback ist Defense-in-Depth für Client-Navigation. Beide müssen unabhängig voneinander korrekt arbeiten und getestet werden."

### 4. `station-dialog-panel.tsx`: Link-Ziel wird zu Redirect-Schleife-UX
- **Was widersprüchlich ist:** Die aktuelle `station-dialog-panel.tsx` (Tab `dialog`) enthält einen Link `→ Dialog-Audio-Tab` mit `href={…/stationen/{slug}?tab=dialog-audio}` (Code Z. 196–201). Der Plan fordert (Z. 108): „Link zu `?tab=dialog-audio` durch statischen Hinweis ersetzen (fehlende Clips)." Gleichzeitig wird `?tab=dialog-audio` serverseitig auf `?tab=dialog` redirectet (Z. 155). Würde der Link nicht ersetzt, entstünde eine nutzerseitige „Schleife": Klick im Tab `dialog` → Redirect zurück auf `?tab=dialog`. Der Plan löst das durch Ersetzen — **aber** der Ersatzhinweis muss semantisch klar machen, dass der Upload **bis #200** nicht möglich ist, sonst wirkt der Hinweis wie „kaputter Button".
- **Warum später teuer:** Wenn der Entwickler nur den Link entfernt, aber keinen klaren Hinweis auf die temporäre Lücke (#200) einbaut, entstehen Support-Tickets („wo kann ich Dialog-Audio hochladen?"). Das ist kein Breaking Change, aber eine Lücke im Vertrag zwischen Plan und Nutzerkommunikation.
- **Wann es beißt:** Zwischen Go-Live von #198 und #200 — die funktionale Upload-Lücke für Dialog-WAVs im Studio-UI (im Plan Z. 89 explizit akzeptiert) muss für den Nutzer erkennbar kommuniziert werden.
- **Billige Gegenmaßnahme jetzt:** Im Plan den Ersatzhinweis konkretisieren: „Statischer Text: ‚Dialog-Audio-Upload folgt mit Issue #200. Bis dahin via CLI/curl (siehe Entwickler-Doku).'" — nicht nur „durch statischen Hinweis ersetzen".

---

## Konsistenz-Bestätigung (kein Fund, aber explizit geprüft)

**API-Fehlercodes & JSON-Format sind konsistent.** Beide Ingest-Routen (`/api/mpz/media/ingest`, `/api/mpz/dialog-audio/ingest`) verwenden durchgehend `{ error: <SCREAMING_SNAKE_CASE>, message: <Text> }` und die Codes stimmen mit der Plan-Tabelle (Z. 166–187) überein — inkl. `INVALID_FORM`, `MISSING_FILE`, `MISSING_FIELDS`, `UNSUPPORTED_UPLOAD_TYP`, `INVALID_SEGMENT`, `COLLISION`, `VALIDATION`, `IO`, `INTERNAL_ERROR`. Keine Abweichung zwischen Plan, Spec und Code. Die `.cursor/rules/error-conventions.mdc` wird eingehalten.

---

**Fazit:** Fund 1 (Query-Redirect-Kollision) ist **blockierend** für Akzeptanzkriterium 3 und muss vor Implementierungsbeginn entschieden werden. Fund 2 ist die Ursache für Fund 1 (fehlerhafte Analogie). Fund 3 und 4 sind **nicht blockierend**, sollten aber im Plan präzisiert werden, um Inkonsistenzen in der Nutzererfahrung und unklare Test-Requirements zu vermeiden. Die API-Schicht ist sauber und unverändert.