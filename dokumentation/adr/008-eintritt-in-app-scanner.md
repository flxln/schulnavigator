# ADR-008 — Eintritt: In-App-Scanner auf `/eintritt`

**Datum:** 2026-05-22  
**Status:** entschieden

## Kontext

[ADR-005](./005-zugangskontrolle-token.md) sieht Entry über `/eintritt?t=<token>` vor; der erste Zugang erfolgt typischerweise per **System-Kamera** auf den Entry-QR am Eingang oder im Heft. Issue **#23** setzt Cookie + Middleware um und liefert den **Raum-Scanner** unter `/scan` (nur `/raum/<slug>`).

Nutzer ohne gültiges Cookie landen auf `/eintritt` (Hinweisseite). `/scan` ist **geschützt** und ohne Entry nicht erreichbar — wer die App manuell öffnet oder ein abgelaufenes Cookie hat, muss heute die System-Kamera nutzen. Das ist zusätzlicher Reibungsverlust und widerspricht dem Ziel aus ADR-005 („In-App-Scanner reduziert Reibung“), gilt dort aber erst **nach** Entry für Raum-QRs.

## Entscheidung

- Auf **`/eintritt`** (Hinweisseite, ohne gültiges Cookie) wird ein **In-App-QR-Scanner** angeboten — gleiche Technik wie `/scan` (`html5-qrcode`, dynamischer Import, Kamera nach Nutzer-Geste).
- Der Scanner akzeptiert nur **Entry-URLs** im Sinne von Struktur: same-origin, Pfad `/eintritt`, Query-Parameter `t` nicht leer.
- Bei Treffer: `window.location.replace` zu `/eintritt?t=<token>` → bestehende **Middleware** (#23) setzt Cookie und leitet auf `/` um.
- **`/scan`** bleibt unverändert: nur Raum-QRs, nur mit gültigem Cookie erreichbar. Kein Entry-Scan auf `/scan`.

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
