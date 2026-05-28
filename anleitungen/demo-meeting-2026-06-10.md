# Demo MPZ-Meeting — 10.06.2026

Kurzablauf für Sten/Tina auf echtem Gerät (**HTTPS**, z. B. `https://schulnavigator.mpz.schule`).

## Vorbereitung

- Entry-QR oder Link: `/eintritt?t=fest-2026` (Schulfest-Modus)
- Optional: `heft-2026-27` zum Gegenüberstellen (alle Räume sofort klickbar)
- iPhone: Lautstärke an, nicht stumm

## Ablauf (ca. 10–15 Min.)

1. **Eintritt & Hub**  
   `/eintritt?t=fest-2026` → Startseite. Hub zeigt isometrisches Schulhaus; im Modus `fest` sind Räume noch gesperrt („0 von 11“).

2. **Scan & Freischaltung**  
   `/scan` → Raum-QR scannen (z. B. `musik`). Zurück zur Startseite: Fenster freigeschaltet, Fortschritt sichtbar.

3. **Technik-Station `musik`**  
   `/raum/musik` — Gyro (Armschwenk), Hotspots, **Stations-Chip** zum Zentrieren. Medienliste unten: **Audio, Video (Poster), Foto, Text** — vier Typen, keine Platzhalter-UI-Lücken.

4. **Story-Station `daz`**  
   `/raum/daz` → **Frieda oder Otto** im Raumbild antippen (links/rechts). Sprechblase oben, Gyro bleibt an; Dialog durchspielen. Grüße-Block: Sprechblase bleibt, Stimmen wechseln. Audio nur mit gültigem Cookie (kein direkter Dateilink). **X** neben Zurück beendet die Wiedergabe; **Stations-Chip** zentriert die Raumansicht.

5. **Zweiter Dialog `pc-raum`**  
   Gleicher Flow — Regeln am Computer.

6. **Beliebiger anderer Raum** (z. B. `klassenzimmer`, `werken`, `turnhalle`)  
   Gleiche Raum-Shell: TopBar, Gyro, **Chip zentriert** — oft noch leere Medien-Slots („Hier kommen später Audio/Video der Kinder“).

7. **Optional: 11/11 & Sparkle**  
   Weitere Räume scannen bis `SparkleBurst` auf `/` (einmalig).

## Mündliche Botschaft

- Material (Fotos, Texte, Dialoge DaZ/PC) **kommt von der Schule** — App zeigt das echte Konzept.
- **Content-Lieferplan** bis 12.06.: welche Klasse liefert welchen Raum in welchem Format.
- Echte Kinder-Aufnahmen ersetzen Demo-Dateien unter `/demo/`; Dialog-Clips werden bei Bedarf ausgetauscht (`content/dialog-audio/`).
- Figuren als **Hotspots im Panorama** (ADR-011); Positionen ggf. am echten Foto nachjustieren.

## Technische Smoke-Checks (Felix, vor dem Termin)

```bash
cd app
npm run validate:stations
npm run test
npm run build
```

- Ohne Cookie: `curl -sI https://…/api/dialog/daz/01-frieda.wav` → **403**
- Mit Cookie (nach Eintritt): gleiche URL → **200** oder **206** (Range)
- `clip=../x` → **400**

Siehe auch [`lokal-testen-und-anschauen.md`](./lokal-testen-und-anschauen.md).
