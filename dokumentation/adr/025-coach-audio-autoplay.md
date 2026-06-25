# ADR-025 — Coach-Audio: Autoplay mit iOS-Fallback (Ergänzung zu ADR-019)

**Datum:** 2026-06-20
**Status:** entschieden
**Ergänzt:** [ADR-019](./019-coach-fortschritt-einblendung.md) (Coach-MVP text-only)

## Kontext

Der Coach-MVP (ADR-019) liefert fortschritts-getriggerte Text-Einblendungen ohne Audio — bewusst iOS-sicher. Für Schulfest und Heft-Betrieb soll MPZ optional **gesprochene Kurzclips** (ca. 5–20 s) pro Coach-Message anbieten. Grundschulkinder lesen oft nicht; der Coach soll hörbar sein, wenn ein Clip hinterlegt ist.

Technische Rahmenbedingungen:

- Coach triggert **ohne Nutzer-Tap** (Hub-Meilenstein, erster Raumbesuch) — Safari kann `play()` ohne kürzliche Geste blockieren (anders als Dialog, ADR-010).
- Dialog-Audio nutzt Tap-gated Playlist; Coach braucht **Autoplay** mit akzeptiertem Fallback.
- Ein Clip pro Message — keine Playlist (Abgrenzung ADR-010).
- Layer-Vertrag ADR-019 bleibt: kein Coach während Dialog, Medienpanel, Viewer-Gate.

## Entscheidung

1. **Schema:** Optionales Feld `quelle` an `CoachMessage` in [`app/content/coach-messages.json`](../../app/content/coach-messages.json). Konvention: `/api/coach/{messageId}` (ohne `.wav`-Suffix).
2. **Ablage:** `app/content/coach-audio/{messageId}.wav` — ein Clip pro Message-ID (global, nicht stationsgebunden).
3. **Auslieferung:** `GET /api/coach/[messageId]` — Cookie-Gate wie Dialog (ADR-010), Range/206 für iOS, `Cache-Control: private, no-store`. Keine Message-Existenzprüfung gegen JSON; WAV-Datei ist Source of Truth (404 wenn fehlend).
4. **Runtime:** Autoplay beim Overlay-Mount wenn `quelle` gesetzt; Text bleibt parallel sichtbar. `play().catch` → Replay-Icon (User-Geste), kein Fehlerdialog.
5. **Dismiss:** Schließen stoppt Audio (`pause()`, Quelle leeren).
6. **Studio (ADR-022):** MPZ Coach-Tab — WAV-Upload, Audit-Badge; Ingest setzt `quelle` automatisch.
7. **Validierung:** Format in Domain/TS-Validator; Datei-Existenz nur im Build-Validator (`validate:coach`).
8. **`prefers-reduced-motion`:** Nur Animationen reduzieren — Autoplay bleibt (konsistent mit Layout #192).

## Begründung

- **Autoplay-Ziel + Fallback:** Produktentscheidung MPZ (2026-06-19); akzeptierter Kompromiss für iOS statt Pflicht-Tap wie beim Dialog.
- **Spiegel Dialog-Infrastruktur:** Gated Route, LFS-WAV, MPZ-Ingest — bewährtes Muster, geringeres Risiko.
- **Kein Message-Cache in GET-Route:** `coach-messages.json` wird zur Laufzeit vom Studio geschrieben; modul-load-Cache wäre veraltet.
- **ADR-019 nicht überschreiben:** MVP-Historie bleibt lesbar; Ergänzungs-ADR dokumentiert bewusste Regeländerung.

## Verworfene Alternativen

- **Pflicht-Tap „Anhören“:** Kinder tippen selten auf Audio-Buttons; Coach bliebe oft stumm.
- **Gemeinsame Clips mit Dialog:** unterschiedliche Trigger, IDs und Ablage — Kopplung würde beide Features teurer machen.
- **Öffentliche Static-URLs:** defense-in-depth wie Dialog — Cookie-Gate auf API-Route.
- **Globales Session-„Audio freigeschaltet“:** Over-Engineering für MVP; optional später.

## Konsequenzen

- **Neue Dateien:** `app/lib/coach-audio.ts`, `app/lib/mpz-coach-audio-ingest.ts`, `app/hooks/use-coach-audio.ts`, `app/app/api/coach/[messageId]/route.ts`, MPZ-Routes `/api/mpz/coach-audio/*`, `content/coach-audio/`.
- **Geändert:** `CoachMessage`-Typ, `MascotPeekOverlay`, MPZ Coach-Editor, `validate-coach-messages.mjs`.
- **Abgegrenzt zu ADR-010:** Dialog = Tap-gated Playlist; Coach = Autoplay ein Clip, fortschritts-getriggert.
- **Bewusst nicht:** Playlist, Lip-Sync, YouTube (ADR-004), globales „Ton aus“, Directus.

## Nachtrag (2026-06-25, `kunde/39-gs`)

Pragmatische **Audio-Unlock-Kette** ergänzt (abweichend von der verworfenen Alternative „globales Session-Freischalten“ als Over-Engineering):

- `unlockAudioPlayback()` nach synchroner User-Geste (Eintritt, Scan, Hub-CTA) + passiver Capture-Listener im Root-Layout (`sn-audio-unlocked`).
- `useCoachAudio` retryt Autoplay nach Unlock; Replay-Icon bleibt iOS-Fallback (ADR-Kernentscheidung unverändert).
- SSR: `onClick` nur in Client-Komponente `EintrittScanLink` — kein Handler in Server-`EintrittScreen`.

Details: [Post-Mortem Coach-Unlock & Eintritt-SSR](../reviews/post-mortem/post-mortem-coach-unlock-eintritt-ssr-2026-06-25.md).
