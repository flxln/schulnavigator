#!/usr/bin/env node
/**
 * Baut das 10-MD-Upload-Paket für Claude Design aus mpz-studio-claude-design-cleanup/.
 * Ausführen: node build-package.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(__dirname, '../mpz-studio-claude-design-cleanup')
const OUT = __dirname

function read(name) {
  return fs.readFileSync(path.join(SRC, name), 'utf8')
}

function write(name, content) {
  fs.writeFileSync(path.join(OUT, name), content)
}

function embedJson(title, filename, jsonText) {
  return `## ${title}\n\nQuelle: \`${filename}\`\n\n\`\`\`json\n${jsonText.trim()}\n\`\`\`\n`
}

function embedCss(title, cssText) {
  return `## ${title}\n\n\`\`\`css\n${cssText.trim()}\n\`\`\`\n`
}

const tokens = read('03-design-system-gs39-tokens.css')
const schema = read('04-stations-schema.json')
const klassenzimmer = read('06-referenz-station-klassenzimmer.json')
const daz = read('07-referenz-station-daz.json')
const hub = read('10-hub-stationen-liste.json')
const coach = read('13-coach-messages-auszug.json')
const embed = read('14-embed-allowlist.json')

// 01
write(
  '01-ANLEITUNG-UND-PROMPT.md',
  `# MPZ Studio — Claude Design (10-MD-Paket)

**Datum:** 2026-06-22  
**Zweck:** UI-Cleanup MPZ Studio v2.1 — angepasst an **max. 10 Markdown-Uploads** in Claude Design

---

## Claude-Design-Upload-Limits (Recherche)

| Limit | Wert | Quelle |
|-------|------|--------|
| Markdown-Dateien (Design-System-Kontext) | **max. 10** | Nutzerbestätigung Claude Design UI |
| Dateien pro Chat (allgemein) | bis 20 | [Claude Help / Drittanbieter-Docs](https://support.claude.com) |
| Größe pro Datei | 30 MB | Claude.ai Chat |
| Bilder (PNG/JPG) | separat, bis 30 MB | Vision-Modelle |

**Strategie dieses Pakets:** Alle Inhalte (Tokens, Schema, Mock-JSON) in **10 MD-Dateien** eingebettet. Screenshots optional als **PNG** zusätzlich hochladen (zählen nicht als MD).

**Alternative bei mehr Kontext:** GitHub-Subfolder \`app/components/mpz-studio/\` in Claude Design verlinken (laut Anthropic-Docs Juni 2026).

---

## Upload — genau diese 10 Dateien

1. \`01-ANLEITUNG-UND-PROMPT.md\` (diese Datei)
2. \`02-BRIEF.md\`
3. \`03-SCREENS-UND-PROBLEME.md\`
4. \`04-QUALITAETSREGELN.md\`
5. \`05-DESIGN-SYSTEM.md\`
6. \`06-DATENMODELL.md\`
7. \`07-SPEZIFIKATION-UND-IST.md\`
8. \`08-MOCK-STATIONEN.md\`
9. \`09-MOCK-GLOBAL.md\`
10. \`10-SCREENSHOTS.md\`

Optional: PNG-Screenshots (siehe \`10-SCREENSHOTS.md\`).

---

## Prompt (nach Upload kopieren)

\`\`\`
Du bist Interface-Architekt im Modus SE 13 (UI-Design-Konzept). Leitplanken: Klarheit, Zurückhaltung, Tiefe (Apple HIG). Du lieferst UI-Konzept und High-Fidelity-Mockups — **keinen** React-/HTML-/CSS-Implementierungscode.

## Auftrag

Räume **MPZ Studio v2.1** auf: klare IA, gruppierte Navigation, einheitliche Muster — volle Funktionsabdeckung.

MPZ Studio = internes Content-Ingest-Tool für den Schulnavigator (39. Grundschule Dresden). Nur lokal, nur MPZ/Felix, kein CMS für Lehrkräfte.

Lies alle 10 hochgeladenen MD-Dateien vollständig. Verbindlich:
- 02-BRIEF.md — Ziel, Scope
- 03-SCREENS-UND-PROBLEME.md — Screens S1–S24 + Ist-Probleme
- 04-QUALITAETSREGELN.md
- 05-DESIGN-SYSTEM.md — GS39-Tokens (eingebettet)
- 06-DATENMODELL.md — Typen + JSON-Schema (eingebettet)
- 07-SPEZIFIKATION-UND-IST.md — Spec + Komponenten-Inventar
- 08-MOCK-STATIONEN.md, 09-MOCK-GLOBAL.md — Mock-Daten

## Design-System

Farben/Typo/Spacing **ausschließlich** aus 05-DESIGN-SYSTEM.md (GS39-Tokens). Kein Dark Mode. Werkzeug-UI, dichter als Besucher-App.

## Cleanup-Pflicht (03-SCREENS-UND-PROBLEME.md)

1. 9-Punkte-Nav → gruppierte IA
2. Dialog-Audio doppelt → ein Modell
3. Medien-Upload → einheitlicher Einstieg
4. Brand vs. Hub → sinnvolle Bündelung
5. Dialog-Editor entlasten
6. Save & Validate — Dirty-State klarer
7. Mobile Sidebar scanbar

## Screens v2.1 (Empty, Filled, Error, Loading)

Shell S1–S4 · Stationen S5–S16 · Global S17–S22 (Details in 03)

## Kern-User-Stories + Fehlerpfade

Medien ingestieren · Hotspot kalibrieren · Dialog pflegen · Coach · Deploy · Validierung fehlgeschlagen

## Lieferformat

1. Informationsarchitektur
2. Lösungen für alle Probleme in 03
3. Komponenteninventar mit Zuständen
4. Interaktionsflüsse
5. Visuelle Systematik (Token-Namen)
6. High-Fidelity-Mockups, Desktop 1280 px
7. Abweichungen Besucher-App

Kein Scope über v2.1. Kein Code. Offene Fragen in 03 beantworten.
\`\`\`

---

## Nach dem Design

Umsetzung in \`app/components/mpz-studio/\`. Vollspec: \`dokumentation/spezifikationen/mpz-studio.md\`.
`,
)

// 02 — brief with updated refs
write(
  '02-BRIEF.md',
  read('00-cleanup-brief.md')
    .replace(
      'Tokens: `03-design-system-gs39-tokens.css`',
      'Tokens: siehe `05-DESIGN-SYSTEM.md`',
    )
    .replace(
      'siehe `09-ui-komponenten-referenz.md`',
      'siehe `05-DESIGN-SYSTEM.md`',
    )
    .replace(
      'Details: `02-screens-v2.1-und-user-stories.md`, Probleme: `08-bekannte-ui-probleme.md`',
      'Details: `03-SCREENS-UND-PROBLEME.md`',
    )
    .replace(
      'für die Probleme in `08-bekannte-ui-probleme.md`',
      'für die Probleme in `03-SCREENS-UND-PROBLEME.md`',
    )
    .replace(
      'alle Screens aus `02-screens-v2.1-und-user-stories.md`',
      'alle Screens aus `03-SCREENS-UND-PROBLEME.md`',
    ),
)

// 03 — screens + problems
write(
  '03-SCREENS-UND-PROBLEME.md',
  `# MPZ Studio v2.1 — Screens, User-Stories und Ist-Probleme

${read('02-screens-v2.1-und-user-stories.md').replace(/^# .+\n\n/, '')}

---

# Bekannte UI-Probleme (Cleanup-Auftrag)

${read('08-bekannte-ui-probleme.md').replace(/^# .+\n\n/, '')}`,
)

// 04
write('04-QUALITAETSREGELN.md', read('11-se13-qualitaetsregeln.md'))

// 05
write(
  '05-DESIGN-SYSTEM.md',
  `# GS39 Design-System — Referenz für MPZ Studio

${read('09-ui-komponenten-referenz.md').replace(/^# .+\n\n/, '')}

---

${embedCss('GS39 Design Tokens (vollständig)', tokens)}`,
)

// 06
write(
  '06-DATENMODELL.md',
  `# Datenmodell — Typen und JSON-Schema

${read('05-typendefinitionen.md').replace(/^# .+\n\n/, '')}

---

${embedJson('stations.schema.json (vollständig)', 'app/data/stations.schema.json', schema)}`,
)

// 07
write(
  '07-SPEZIFIKATION-UND-IST.md',
  `# Spezifikation und Ist-Komponenten

${read('01-spezifikation-auszug.md').replace(/^# .+\n\n/, '')}

---

${read('12-komponenten-inventar-ist.md').replace(/^# .+\n\n/, '')}`,
)

// 08
write(
  '08-MOCK-STATIONEN.md',
  `# Mock-Daten — Stationen

${embedJson('klassenzimmer (Medien + Hotspots 360°)', '06-referenz-station-klassenzimmer.json', klassenzimmer)}

${embedJson('daz (Dialog + Dialog-Hotspots)', '07-referenz-station-daz.json', daz)}`,
)

// 09
write(
  '09-MOCK-GLOBAL.md',
  `# Mock-Daten — Global

${embedJson('12 Hub-Stationen', '10-hub-stationen-liste.json', hub)}

${embedJson('Coach-Nachrichten', '13-coach-messages-auszug.json', coach)}

${embedJson('Embed-Allowlist', '14-embed-allowlist.json', embed)}`,
)

// 10
write(
  '10-SCREENSHOTS.md',
  read('assets/README.md').replace(
    /^# Assets — Screenshots für Claude Design\n\nOptional, aber \*\*stark empfohlen\*\*/,
    '# Screenshots — optional (PNG, nicht MD)\n\n**Stark empfohlen**',
  ),
)

console.log('Paket gebaut:', OUT)
for (const f of fs.readdirSync(OUT).filter((n) => n.endsWith('.md')).sort()) {
  const kb = (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1)
  console.log(`  ${f} (${kb} KB)`)
}
