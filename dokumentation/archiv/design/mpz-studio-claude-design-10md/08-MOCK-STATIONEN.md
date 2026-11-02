# Mock-Daten — Stationen

## klassenzimmer (Medien + Hotspots 360°)

Quelle: `06-referenz-station-klassenzimmer.json`

```json
{
  "slug": "klassenzimmer",
  "titel": "Klassenzimmer",
  "beschreibung": "Hallo und willkommen in unserem Klassenzimmer! Hier lernen wir jeden Tag spannende Sachen und manchmal sogar freiwillig. Unsere Stifte machen gern Urlaub unter den Tischen, aber wir finden sie meistens wieder. Viel Spaß beim Rundgang!",
  "viewer": "equirectangular",
  "panorama360": "/stations/360/klassenzimmer.jpg",
  "bild": "/stations/klassenzimmer.jpg",
  "medien": [
    {
      "id": "demo-audio",
      "typ": "audio",
      "quelle": "/media/klassenzimmer/audio/grundschule_demo.mp3",
      "untertitel": "Mein Schultag (Audio)"
    },
    {
      "id": "demo-video",
      "typ": "video",
      "videoSource": "upload",
      "quelle": "/media/klassenzimmer/video/grundschule_demo.mp4",
      "poster": "/media/klassenzimmer/fotos/grundschule_demo.jpg",
      "thumbnail": "/media/klassenzimmer/fotos/grundschule_demo.jpg",
      "untertitel": "Mein Schultag (Video)"
    },
    {
      "id": "demo-foto",
      "typ": "foto",
      "quelle": "/media/klassenzimmer/fotos/grundschule_demo.jpg",
      "untertitel": "Schulfoto"
    },
    {
      "id": "demo-text",
      "typ": "text",
      "quelle": "/media/klassenzimmer/texte/grundschule_demo.md",
      "untertitel": "Mein Schultag"
    }
  ],
  "hotspots360": [
    {
      "id": "hs-text",
      "label": "Korkpinnwand",
      "yaw": -32,
      "pitch": -4,
      "mediumId": "demo-text",
      "iconSize": 0.2
    },
    {
      "id": "hs-video",
      "label": "Tafel",
      "yaw": -18,
      "pitch": 0,
      "mediumId": "demo-video",
      "icon": "/media/klassenzimmer/icons/play.svg",
      "iconSize": 0.2
    },
    {
      "id": "hs-audio",
      "label": "Klassentische",
      "yaw": 4,
      "pitch": -8,
      "mediumId": "demo-audio",
      "iconSize": 0.2
    },
    {
      "id": "hs-foto",
      "label": "Fensterseite",
      "yaw": 28,
      "pitch": -2,
      "mediumId": "demo-foto",
      "iconSize": 0.2
    }
  ]
}
```


## daz (Dialog + Dialog-Hotspots)

Quelle: `07-referenz-station-daz.json`

```json
{
  "slug": "daz",
  "titel": "DaZ-Zimmer",
  "beschreibung": "Hi! Im DaZ-Zimmer lernen Kinder aus vielen Ländern Deutsch. Wir üben Wörter, Sätze und manchmal auch, wie man \"Schmetterling\" ohne Knoten in der Zunge sagt. Schön, dass Sie vorbeischauen!",
  "viewer": "equirectangular",
  "panorama360": "/stations/360/daz.jpg",
  "bild": "/stations/daz.jpg",
  "medien": [],
  "hotspots360": [
    {
      "id": "hs-frieda",
      "label": "Frieda",
      "yaw": 21.1,
      "pitch": -30.7,
      "action": "dialog",
      "mascot": "frieda",
      "mascotSize": 0.3,
      "mascotFlipX": false,
      "bubblePitchOffset": 14
    },
    {
      "id": "hs-otto",
      "label": "Otto",
      "yaw": -18.7,
      "pitch": -27.7,
      "action": "dialog",
      "mascot": "otto",
      "mascotSize": 0.2,
      "mascotFlipX": true,
      "bubblePitchOffset": 14
    }
  ],
  "dialog": {
    "figuren": [
      "frieda",
      "otto"
    ],
    "gruppen": [
      {
        "id": "gruesse",
        "text": "Hello! · Hola! · Bonjour! · Merhaba! · Ciao!"
      }
    ],
    "segmente": [
      {
        "id": "d1",
        "rolle": "frieda",
        "quelle": "/api/dialog/daz/01-frieda.wav",
        "text": "Hallo, willkommen in unserem DaZ-Zimmer. Hier lernen Kinder aus vielen Ländern zusammen Deutsch."
      },
      {
        "id": "d2",
        "rolle": "otto",
        "quelle": "/api/dialog/daz/02-otto.wav",
        "text": "Wir haben ein kleines Sprachrätsel für euch. Könnt ihr raten, was diese Wörter bedeuten?"
      },
      {
        "id": "d3",
        "rolle": "frieda",
        "quelle": "/api/dialog/daz/03-frieda.wav",
        "text": "Hello!",
        "gruppe": "gruesse"
      },
      {
        "id": "d4",
        "rolle": "otto",
        "quelle": "/api/dialog/daz/04-otto.wav",
        "text": "Hola!",
        "gruppe": "gruesse"
      },
      {
        "id": "d5",
        "rolle": "frieda",
        "quelle": "/api/dialog/daz/05-frieda.wav",
        "text": "Bonjour!",
        "gruppe": "gruesse"
      },
      {
        "id": "d6",
        "rolle": "otto",
        "quelle": "/api/dialog/daz/06-otto.wav",
        "text": "Merhaba!",
        "gruppe": "gruesse"
      },
      {
        "id": "d7",
        "rolle": "frieda",
        "quelle": "/api/dialog/daz/07-frieda.wav",
        "text": "Ciao!",
        "gruppe": "gruesse"
      },
      {
        "id": "d8",
        "rolle": "otto",
        "quelle": "/api/dialog/daz/08-otto.wav",
        "text": "Na, wisst ihr es schon?"
      },
      {
        "id": "d9",
        "rolle": "beide",
        "quelle": "/api/dialog/daz/09-beide.wav",
        "text": "Das heißt überall: \"Hallo, schön dass du da bist!\""
      }
    ]
  }
}
```
