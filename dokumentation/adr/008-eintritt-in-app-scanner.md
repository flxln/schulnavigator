# ADR-008 — Eintritt: In-App-Scanner auf `/eintritt`

**Datum:** 2026-05-22  
**Status:** entschieden (Nachtrag 2026-05-30: Scanner auf eigene Route `/eintritt/scan` verschoben)

## Kontext

[ADR-005](./005-zugangskontrolle-token.md) sieht Entry über `/eintritt?t=<token>` vor; der erste Zugang erfolgt typischerweise per **System-Kamera** auf den Entry-QR am Eingang oder im Heft. Issue **#23** setzt Cookie + Middleware um und liefert den **Raum-Scanner** unter `/scan` (nur `/raum/<slug>`).

Nutzer ohne gültiges Cookie landen auf `/eintritt` (Hinweisseite). `/scan` ist **geschützt** und ohne Entry nicht erreichbar — wer die App manuell öffnet oder ein abgelaufenes Cookie hat, muss heute die System-Kamera nutzen. Das ist zusätzlicher Reibungsverlust und widerspricht dem Ziel aus ADR-005 („In-App-Scanner reduziert Reibung“), gilt dort aber erst **nach** Entry für Raum-QRs.

## Entscheidung

- Auf **`/eintritt/scan`** (eigene Vollbild-Route, ohne gültiges Cookie erreichbar) läuft der **In-App-QR-Scanner** für Entry — gleiche Technik und Shell wie `/scan` (`ScanFullscreenShell`, `html5-qrcode`, dynamischer Import, Kamera nach Nutzer-Geste). **`/eintritt`** zeigt nur die Hinweisseite; die Willkommens-Karte verlinkt auf `/eintritt/scan` (Nachtrag 2026-05-30, Issue #82).
- Der Scanner akzeptiert nur **Entry-URLs** im Sinne von Struktur: same-origin, Pfad `/eintritt`, Query-Parameter `t` nicht leer.
- Bei Treffer: `window.location.replace` zu `/eintritt?t=<token>` → bestehende **Middleware** (#23) setzt Cookie und leitet auf `/` um.
- **`/scan`** bleibt unverändert in der Rolle: nur Raum-QRs, nur mit gültigem Cookie erreichbar. Kein Entry-Scan auf `/scan`.

Parsing als reine Funktion + Vitest (`parseEntryScan` in `lib/scan-url.ts`).

### Client vs. Middleware (Nachtrag #57)

Die ursprüngliche Formulierung „Token aus `access-tokens.ts`" bezieht sich auf die **Middleware**, nicht auf eine Client-Whitelist.

| Schicht | Prüfung |
|---------|---------|
| **Client** (`parseEntryScan`) | same-origin, Pfad `/eintritt`, `t` nicht leer — **keine** Membership gegen `ACCESS_TOKENS` |
| **Middleware** (`validateToken`) | Token bekannt und nicht abgelaufen → Cookie; sonst `?reason=invalid\|expired` |

**Begründung:** `/eintritt` ist ohne Zugang erreichbar. Eine Token-Liste als React-Prop würde gültige Token-Strings ins JS-Bundle der Seite legen und das Gate umgehbar machen. Unbekannte `t`-Werte navigieren zuerst; die Middleware lehnt sie ab.

## Begründung

- Schließt die UX-Lücke: Hinweisseite + Scan in **einer** App, ohne App-Wechsel zur System-Kamera.
- Wiederverwendung von #23-Infrastruktur (Middleware, Token-Liste, `html5-qrcode`) — geringer Zusatzaufwand.
- Klare Trennung: `/eintritt` = Zugang, `/scan` = Stationen nach Zugang (ADR-005 unverändert in der Rollenlogik).

## Verworfene Alternativen

- **Nur System-Kamera für Entry (Status quo nach #23):** funktioniert, aber schlechtere UX auf der Hinweisseite.
- **Entry auch auf `/scan`:** Route ist ohne Cookie gesperrt; müsste Middleware-Ausnahme und gemischte Scan-Logik — verwirrend.
- **Token manuell eingeben:** zu fehleranfällig für Zielgruppe.

## Konsequenzen

- Issue **#57** (Folge zu #23); Abhängigkeit: #23 abgeschlossen.
- ADR-005 Abschnitt „System-Kamera“ bleibt gültig als **Fallback**; In-App-Scan auf `/eintritt` ist **zusätzlicher** Standardweg.
- Doku: `issues-phase-2.md`, `fuer-lehrkraefte.md`, `lokal-testen-und-anschauen.md` bei Umsetzung anpassen.

---

## Nachtrag 2026-05-30 — Scanner auf eigene Route `/eintritt/scan`

### Änderung gegenüber der ursprünglichen Entscheidung

Der Entry-Scanner läuft nicht mehr als **Inline-Block** auf `/eintritt`, sondern als **eigene Vollbild-Route** `/eintritt/scan` — dasselbe Muster wie der Raum-Scanner auf `/scan`.

**Begründung:** Ein früher evaluierter Overlay-Ansatz (Vollbild-Modal mit `history.pushState`, Body-Scroll-Lock, Focus-Restore) hätte erhebliches Mobile-/A11y-Hardening erfordert. Die bestehende `ScanScreen`-Komponente ist bereits eine Page-Komponente, kein Overlay — dieses Pattern ist robuster, weil der Browser History, Scroll und Focus nativ übernimmt. In einem Aufwasch wurde das gemeinsame Vollbild-Layout in `ScanFullscreenShell` extrahiert, das beide Routen nutzen.

### Konkrete Änderungen

| Datei | Änderung |
|-------|----------|
| `app/components/scan/scan-fullscreen-shell.tsx` | Neue gemeinsame Shell (Layout + TopBar) |
| `app/components/scan/scan-screen.tsx` | Nutzt Shell statt eigenes Layout |
| `app/components/eintritt/eintritt-scan-screen.tsx` | Neue Entry-Variante via Shell |
| `app/app/eintritt/scan/page.tsx` | Server-Wrapper für `/eintritt/scan` |
| `app/components/eintritt/eintritt-screen.tsx` | Willkommens-Karte als `<Link href="/eintritt/scan">` |
| `app/app/eintritt/page.tsx` | Inline-Scanner entfernt; nur noch `EintrittScreen` |
| `app/middleware.ts` | Matcher um `/eintritt/:path*` erweitert; Bypass-Whitelist `['/eintritt', '/eintritt/scan']` |

### Middleware-Bypass

`/eintritt/scan` muss ohne Cookie erreichbar sein (Entry-Flow). Die Whitelist ist **explizit** (kein `startsWith('/eintritt')`), damit zukünftig versehentlich angelegte Pfade unter `/eintritt/*` nicht automatisch cookie-frei werden.
