---
tags:
  - pre-mortem
  - 01b-logik-spec
  - directus-spike
  - issue-251
erstellt: 2026-07-06
ziel-artefakt: .cursor/plans/directus_spike_#251_3e5a9c41.plan.md
artefakt-typ: plan
issue: "#251"
modell: claude-fable-5
harness: claude-code (effort high)
gegenstück: pre-mortem-1a-directus-spike-251-2026-07-06.md
---

# Pre-Mortem 1b — Directus-Spike #251 (Logik, Spec-Konsistenz & API-Vertrag)

**Geprüft:** Plan `directus_spike_#251_3e5a9c41.plan.md` als System mit: Epic `epic-directus.md` (Leitplanken, E1–E3, Gates), Auth-Konzept `directus-auth-konzept.md` (beschlossen, Gate 5), Validator `validate-stations.ts` (938 Z.), Typen `types.ts`, Media-Route `media/[...path]/route.ts`, Stations-Import `stations.ts`, `klassenzimmer`-Datenstand in `data/stations.json`. Fokus: Wo widersprechen Plan, Spec und Code einander? Welche API-Verträge sind unterspezifiziert? Welche Annahmen sind nie verifiziert?

**Gesamturteil:** Die Plan-Logik ist in den meisten Klassen solide — Verzweigungen 1–4 im Datenfluss sind vollständig, die Varianten-Priorisierung (b bauen, a messen, c optional) ist stimmig, die Epic-Leitplanken (Build-Kontext `app/`, kein Lehrkräfte-Login, Media-Gate intakt) werden korrekt referenziert. Es gibt aber **vier scharfe Funde an den Vertragsschnittstellen**, die bei der Integration oder im Bericht beißen werden: (L1) die S1-Beweis-Rahmung liest sich positiv, ist aber eine Regression-Bestätigung — der Bericht würde das E3-Ergebnis invertieren; (L2) der Directus-API-Vertrag ist nur auf Request-Seite spezifiziert, Response-Envelope und Error-Format fehlen; (L3) der statische API-Token ist eine Auth-Rolle, die das beschlossene Auth-Konzept nicht abdeckt; (L4) der zeitliche Geltungsbereich von `SN_STATIONS_SOURCE` (Build vs. Runtime) ist nicht spezifiziert. Keiner kippt den Spike, aber L1 und L3 erzeugen falsche Bericht-Deliverables, wenn jetzt nicht präzisiert.

---

## Funde

### L1 — S1-Beweis-Rahmung: Plan positioniert `/assets/*` 200 als „Beweis für #254", Epic definiert es als S1-Regression

- **Was widersprüchlich ist:** Kriterium 7 und die Fehlercode-Tabelle (Plan Z. 67, 147) sagen: *„Dummy-Asset in Directus hochladen und `GET /assets/<id>` ohne Cookie dokumentiert (erwartet: `200` = S1-Beweis für #254)."* Die Formulierung liest sich so, als sei `200` ein **positives** Ergebnis — ein Beweis, dass etwas funktioniert. Das Epic sagt das Gegenteil: Leitplanke Z. 83 — *„Directus-Asset-URLs (`/assets/*`) dürfen das Gate nicht umgehen"* — und E3 Option b (Z. 117): *„⚠️ `/assets/*` kennt das Entry-Cookie nicht — sonst S1-Regression."* Ein `200` ohne Cookie ist der **Beweis der Regression**, nicht der Konformität. Der Bericht würde mit der aktuellen Formulierung eine bestätigte S1-Regression als „S1-Beweis" — klingt wie bestanden — in die ADR-Vorlage #254 eintragen.
- **Warum später teuer:** #254 (ADR Medien-Storage) bekommt eine falsche Datenbasis: Option b (Directus-Assets) wird im Bericht als „S1-bewiesen" markiert, obwohl der Beweis **gegen** Option b spricht. Die ADR-Entscheidung fällt dann möglicherweise für Option b aus — und erst im Prod-Deploy (#255) oder im Pilot (#261) fällt auf, dass `/assets/*` das Media-Gate umgeht und Schüler-Medien ungeschützt ausliefert.
- **Wann es beißt:** Phase 7 (Bericht schreiben — falsche Rahmung wird Text); danach #254 (ADR entscheidet auf Basis des Berichts); spätestens #255 (Prod-Deploy mit Option b = Gate-Bruch).
- **Billige Gegenmaßnahme jetzt:** Kriterium 7 und Fehlercode-Tabelle umformulieren: *„`GET /assets/<id>` ohne Cookie → `200` erwartet = **Beweis, dass Option b (Directus-Assets) das Entry-Cookie-Gate umgeht → S1-Regression bestätigt → Argument für Option a oder c**."* Das verkürzt die Bericht-Empfehlung auf das, was der Beweis tatsächlich sagt, und macht die E3-Empfehlung resistent gegen Missverständnisse.

### L2 — Directus-API-Vertrag nur auf Request-Seite spezifiziert: Response-Envelope und Error-Format fehlen

- **Was undefiniert ist:** Das Mermaid-Sequenzdiagramm (Plan Z. 113) spezifiziert die Request-Seite präzise: `GET /items/stations?filter[slug]=klassenzimmer&fields=*.* (Bearer Static Token)`. Die Response-Seite — der eigentliche Transform-Vertrag — fehlt: (1) Directus REST antwortet immer mit einem **Envelope** `{ "data": [...], "meta": { "total_count": N } }` — `validateStationsFile` erwartet aber `{ "stations": [...] }` (`validate-stations.ts:920`). Der Transform muss Envelope auflösen **und** Key-Mapping (`data` → `stations`) leisten — dieser Schritt ist nirgends spezifiziert. (2) Directus-Fehler haben ein eigenes Format `{ "errors": [{ "message": "...", "extensions": { "code": "..." } }] }` — der Plan spricht von „Fetch schlägt fehl" (Verzweigung 3), spezifiziert aber nicht, wie der Transform zwischen *Netzwerkfehler*, *HTTP 4xx/5xx mit Error-Body* und *HTTP 200 mit leerem `data: []` (Slug nicht gefunden)* unterscheidet. Alle drei landen im selben Fallback-Zweig, haben aber unterschiedliche Diagnose-Werte für den Bericht. (3) `fields=*.*` resolved O2M-Relationen eine Ebene tief — ob das für `medien[]`, `hotspots360[]` **und** `dialog.segmente[]` (geschachtelt unter `dialog`) ausreicht, ist nicht verifiziert; verschachtelte Sub-Objekte brauchen ggf. `*.*.*`.
- **Warum später teuer:** Der Transform wird in Phase 3 mit einer unvollständigen Vertragsspezifikation gebaut. Fehlt der Envelope-Unwrap, scheitert `validateStationsFile` am ersten Guard (`'Root muss Objekt sein'` mit `data` statt `stations` als Key). Fehlt die Error-Differenzierung, liefert der Bericht „Directus down" statt „Slug nicht gefunden" oder umgekehrt — die Fallback-Bewertung (Kriterium 4) bekommt falsche Ursachen.
- **Wann es beißt:** Phase 3 (Transform steht vor drei ungespecifizierten Verträgen gleichzeitig); Phase 5 (Fallback-Messung liefert kryptische Diagnosen, wenn Error-Format nicht geparsed wird).
- **Billige Gegenmaßnahme jetzt:** Datenfluss um drei Zeilen ergänzen: (1) *„Transform: Directus-Envelope `{ data: [...] }` → `StationsFile`-Form `{ stations: [...] }` (Key-Map, Feld-Pick, null-Strip)."* (2) *„Fetch-Fehler differenzieren: Netzwerkfehler/Timeout → Fallback + Log `DIRECTUS_UNREACHABLE`; HTTP 4xx/5xx → Fallback + Log `DIRECTUS_ERROR_<code>`; leeres `data: []` → Fallback + Log `DIRECTUS_SLUG_NOT_FOUND`."* (3) *„`fields=*.*` genügt für O2M (medien, hotspots360); falls `dialog` als M2O oder Singleton modelliert, separat fetchen oder `fields=*,dialog.segmente.*` prüfen — in Phase 2 notieren."*

### L3 — Statischer API-Token ist eine Auth-Rolle, die das beschlossene Auth-Konzept nicht abdeckt

- **Was widersprüchlich ist:** Das Auth-Konzept (`directus-auth-konzept.md`, beschlossen Gate 5, Z. 30–33) definiert zwei Rollen: **Redaktion** (Content) und **Admin** (Schema, User), mit 2FA verpflichtend für Admin ab erstem Prod-Login. Der Plan (Z. 113, 166) nutzt einen **statischen Bearer-Token** server-seitig für den Directus-Fetch. Directus-Static-Tokens sind an einen User gebunden, **umgehen aber 2FA** (sie sind langlebige Shared Secrets, keine Challenge-Response). Das erzeugt eine de facto dritte Auth-Rolle — *API-Token-Bearer* — die im Auth-Konzept nicht existiert. Der Plan sagt zwar „nur ein Admin-Account" (Z. 61), spezifiziert aber nicht, ob der Token an diesen Admin gebunden ist (dann 2FA-Adjazent, aber token-leak = Admin-Zugriff) oder an einen separaten Service-User (dann eine Rolle, die das Konzept nicht vorsieht). Der Spike ist wegwerfbar, aber sein Bericht speist #255 (Prod-Deploy) — ein dort unkommentiert übernommenes Token-Muster konterkariert ggf. das 2FA-Requirement.
- **Warum später teuer:** Wenn der Bericht den Token-Ansatz als „funktionierte im Spike" dokumentiert, ohne das 2FA-Spannungsfeld zu benennen, übernimmt #255 das Muster unkommentiert. Das Auth-Konzept ist beschlossen (Gate 5) — ein Deploy mit statischem Token am Admin-Account ohne 2FA-Dokumentation ist dann ein Compliance-Rückfragenpunkt, spätestens bei #261 (Pilot mit echten Lehrkräften).
- **Wann es beißt:** Phase 7 (Bericht ohne Token-Auth-Einordnung); #255 (Prod-Deploy übernimmt Muster); #261 (Pilot — Auth-Konzept wird eingemessen).
- **Billige Gegenmaßnahme jetzt:** Zwei Sätze in den Plan: (1) *„Statischer Token im Spike ist an den Admin-Account gebunden (kein separater Service-User — zuweisbar)."* (2) *„Bericht muss dokumentieren: Token-Ansatz ist Spike-only; #255 muss entscheiden, ob ein separater API-Only-User (ohne UI-Login, ohne 2FA-Pflicht, nur Leserechte auf Stations-Collections) ins Auth-Konzept aufgenommen wird — oder ob der Token entfällt und die App mit Admin-Session arbeitet."* Das macht die Auth-Lücke im Bericht explizit, statt sie zu vererben.

### L4 — `SN_STATIONS_SOURCE` zeitlicher Geltungsbereich (Build vs. Runtime) nicht spezifiziert — `generateStaticParams` könnte zur Build-Zeit Directus fordern

- **Was unvollständig spezifiziert ist:** Der Plan (Z. 85, 166) sagt `SN_STATIONS_SOURCE=directus` als ENV für die Spike-App — ohne zu spezifizieren, ob das eine **Build-Zeit**- oder **Runtime-only**-Variable ist. Coolify setzt ENV-Variablen per Default für Build **und** Runtime. Die Raum-Seite `page.tsx` hat `generateStaticParams()` (Z. 19–21), das `getAllSlugs()` aus `stations.ts` aufruft — und der Plan plant eine Weiche in `stations.ts` (Z. 84: *„Quellen-Weiche per `SN_STATIONS_SOURCE=json|directus`"*). Wenn die Weiche auf Modulebene greift und `SN_STATIONS_SOURCE=directus` zur Build-Zeit gesetzt ist, versucht `generateStaticParams` Directus zur Build-Zeit zu erreichen — und der Build bricht, wenn Directus gestoppt ist (Phase 5: *„Directus-Container gestoppt"* ist ein planmäßiger Test). Verzweigung 4 (*„lokale Entwicklung ohne `SN_STATIONS_SOURCE` → exakt heutiger Pfad"*) impliziert, dass die Variable nicht gesetzt ist — sagt aber nicht, was bei *„gesetzt zur Build-Zeit"* passiert.
- **Warum später teuer:** In Phase 5 wird Directus gestoppt, um das Fallback-Verhalten (Kriterium 4) zu messen. Wenn der Coolify-Redeploy in diesem Moment die Weiche zur Build-Zeit trifft, bricht der Build — nicht weil der Code falsch ist, sondern weil der **Vertrag** (Build-Env vs. Runtime-Env) nicht spezifiziert ist. Der Entwickler sucht dann nach einem Code-Bug, der eigentlich ein ENV-Scoping-Problem ist.
- **Wann es beißt:** Phase 4 (erster Deploy — wenn `SN_STATIONS_SOURCE` build-seitig greift, scheitert schon `next build`); Phase 5 (Redeploy bei gestopptem Directus).
- **Billige Gegenmaßnahme jetzt:** Einen Satz in den Plan: *„`SN_STATIONS_SOURCE` ist **Runtime-only** — in Coolify als Runtime-ENV setzen, nicht als Build-ENV. Begründung: `generateStaticParams()` läuft zur Build-Zeit gegen `stations.json` (gleicher Slugs wie heute), nur der Request-Pfad liest zur Runtime aus Directus."* Alternativ: die Weiche nicht in `stations.ts` (wie 1a F2 empfiehlt), sondern nur in `stations-directus.ts` — dann ist `generateStaticParams` per Konstruktion JSON-only. Beide Lösungen machen den Build von Directus unabhängig.

---

## Bestätigte Konsistenz (kein Fund, aber explizit geprüft)

- **E1/E2/E3-Optionen-Numerierung:** Plan und Epic verwenden identische Optionen-Bezeichnungen (E1 a/b/c, E3 a/b/c). Keine Drift.
- **Fehlercode-Tabelle (`SCREAMING_SNAKE_CASE`):** Die Media-Gate-Response ist korrekt dokumentiert (403 ohne Body, `Cache-Control: no-store` in der 403-Zeile, `private, max-age=3600` in der Erfolgs-Zeile) — deckungsgleich mit `route.ts:13, 27, 55` und Epic Z. 71.
- **Gates 1–8 Scope-Treue:** Der Spike respektiert alle harten Gates (kein Lehrkräfte-Login, keine Schüler-Medien in Directus, Media-Gate intakt, Build-Kontext `app/`). Keine Gate-Verletzung im Plan.
- **`validateStationsFile` als wiederverwendbares Prüfwerkzeug:** Die Plan-Aussage (Z. 47) stimmt — der Validator exportiert die Funktion mit `ValidateStationsFileOptions` (`validate-stations.ts:913`) und ist bewusst generisch gehalten. Die Spec-Lücke liegt nicht im Validator, sondern in Kriterium 3 (1a F1 / unten).

---

## Überschneidung mit 1a (implementierungsseitig bereits gedeckt)

- **Validator akzeptiert nur 12-Stationen-Gesamtdokumente** (1a F1) — Spec-Seite: Kriterium 3 (*„Directus-Output durch `validateStationsFile`"*) ist als Vertrag logisch unmöglich mit *„1 Station aus Directus"*, weil `validateStationsFile` ein **Gesamtdokument-Vertrag** ist: Cross-Station-Validierung gegen Hub-Mapping (Z. 929: `stations.length === expectedStationCount`), nicht Einzelfeld-Prüfung. 1a liefert die Implementierungs-Gegenmaßnahme (Merge-Strategie); 1b stellt fest: das Akzeptanzkriterium selbst ist in seiner jetzigen Formulierung spec-intern widersprüchlich und muss in Schritt 02 (Härtung) präzisiert werden, nicht nur der Code.

---

**Empfehlung an Schritt 02 (Plan-Härten):** L1 ist eine Umformulierung von Kriterium 7 / Fehlercode-Tabelle (drei Zeilen); L2 sind drei Sätze im Datenfluss; L3 sind zwei Sätze in den Entscheidungen oder im Bericht-Template; L4 ist ein Satz zur ENV-Scoping. Kein Fund erfordert Scope- oder Zeitbox-Änderung. L1 ist am dringlichsten — sie verhindert einen falschen Bericht.