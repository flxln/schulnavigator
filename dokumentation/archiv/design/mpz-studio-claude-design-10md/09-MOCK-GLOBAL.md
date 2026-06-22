# Mock-Daten — Global

## 12 Hub-Stationen

Quelle: `10-hub-stationen-liste.json`

```json
{
  "description": "12 kanonische Stationen für die Studio-Übersicht (Hub-Nr aus schoolhouse-hub-map.ts)",
  "stations": [
    { "slug": "klassenzimmer", "hubNr": 1, "titel": "Klassenzimmer" },
    { "slug": "musik", "hubNr": 2, "titel": "Musik" },
    { "slug": "daz", "hubNr": 3, "titel": "DaZ-Zimmer" },
    { "slug": "kunst", "hubNr": 4, "titel": "Kunst" },
    { "slug": "pc-raum", "hubNr": 5, "titel": "PC-Raum" },
    { "slug": "lesewelt", "hubNr": 6, "titel": "Lesewelt" },
    { "slug": "werken", "hubNr": 7, "titel": "Werken" },
    { "slug": "speiseraum", "hubNr": 8, "titel": "Speiseraum" },
    { "slug": "hort", "hubNr": 9, "titel": "Hort" },
    { "slug": "turnhalle", "hubNr": 10, "titel": "Turnhalle" },
    { "slug": "schulsozialarbeit", "hubNr": 11, "titel": "Schulsozialarbeit" },
    { "slug": "schulhof", "hubNr": 12, "titel": "Schulhof" }
  ]
}
```


## Coach-Nachrichten

Quelle: `13-coach-messages-auszug.json`

```json
{
  "messages": [
    {
      "id": "welcome-hub",
      "trigger": "hub-milestone",
      "milestone": 0,
      "mascot": "frieda",
      "placement": "left",
      "text": "Willkommen beim Schulrundgang! Tippe auf ein Fenster, den Wegweiser für Hof und Turnhalle oder scanne den QR-Code an der Raumtür.",
      "modes": [
        "fest",
        "heft"
      ],
      "quelle": "/api/coach/welcome-hub"
    },
    {
      "id": "first-visit",
      "trigger": "hub-milestone",
      "milestone": 1,
      "mascot": "otto",
      "placement": "right",
      "text": "Super, deine erste Station! Schau dich um — im Schulhaus findest du alle Räume.",
      "modes": [
        "fest",
        "heft"
      ]
    },
    {
      "id": "halfway",
      "trigger": "hub-milestone",
      "milestone": 6,
      "mascot": "frieda",
      "placement": "right",
      "text": "Halbzeit! Du hast schon viele Räume entdeckt. Weiter so!",
      "modes": [
        "fest",
        "heft"
      ]
    },
    {
      "id": "complete",
      "trigger": "hub-complete",
      "mascot": "duo",
      "placement": "duo-split",
      "text": "Wow — alle Stationen entdeckt! Danke, dass du unsere Schule erkundet hast.",
      "modes": [
        "fest",
        "heft"
      ]
    },
    {
      "id": "room-first-klassenzimmer",
      "trigger": "room-first",
      "slug": "klassenzimmer",
      "mascot": "otto",
      "placement": "left",
      "text": "Hier startet der Rundgang — unser Klassenzimmer. Wische nach oben, um mehr zu lesen."
    },
    {
      "id": "room-first-musik",
      "trigger": "room-first",
      "slug": "musik",
      "mascot": "frieda",
      "placement": "right",
      "text": "Willkommen im Musikraum! Schau dich im Raum um und entdecke die Hotspots."
    },
    {
      "id": "room-first-hort",
      "trigger": "room-first",
      "slug": "hort",
      "mascot": "otto",
      "placement": "left",
      "text": "Das ist unser Hort. Hier kannst du nach dem Unterricht spielen und ausruhen."
    }
  ]
}
```


## Embed-Allowlist

Quelle: `14-embed-allowlist.json`

```json
{
  "suffixes": [
    "bookcreator.com",
    "delightex.com"
  ]
}
```
