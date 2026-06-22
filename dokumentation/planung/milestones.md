# Milestones

Jede Phase des Projektplans wird ein GitHub Milestone mit Fälligkeitsdatum.
Der Fortschrittsbalken in GitHub ergibt sich automatisch aus den geschlossenen Issues.

---

## Phase 0 — Architektur-Entscheidungen

**Fällig:** 14.05.2026
**Beschreibung:** Alle Grundsatzentscheidungen schriftlich treffen, bevor Code entsteht. Blockiert Phase 1.

---

## Phase 1 — Foundation

**Fällig:** 28.05.2026
**Beschreibung:** Lauffähiges Grundgerüst ohne echten Content. Alle Stationsseiten erreichbar, Deploy auf MPZ-Server umgesetzt. **Ist:** Issues **#9–#16** erledigt; **#27** (Raumfotos einpflegen) geschlossen (8/11 Panorama, 08.06.2026). **#17** (Lieferung Schule) offen für `kunst`, `hort`, `schulsozialarbeit`.

---

## Phase 2 — Content-Struktur + UI

**Fällig:** 12.06.2026
**Beschreibung:** Fertige App-Shell mit allen UI-Komponenten inkl. Raum-Viewer (Gyro, Hotspots, ADR-006, #56), GS39-Jubiläums-UI (#58, ADR-009: isometrischer Hub) und Medien-Player (#18–#20: Audio, Video, Foto). Gleichzeitig muss die Schule den Content-Lieferplan abgeben — das ist der härteste Abhängigkeitspunkt.

---

## Phase 3 — Content-Integration

**Fällig:** 24.06.2026
**Beschreibung:** Echter Kinder-Content in der App, QR-Codes gedruckt, WLAN-Test vor Ort abgeschlossen.

---

## Phase 4 — Live am Schulfest

**Fällig:** 26.06.2026
**Beschreibung:** Hard Deadline. Schulfest-Pilot (`fest`: Hub + Scanner, ADR-009): Entry-QR am Eingang, **12** Raum-QRs generiert (Platzierung Tür vs. Hof laut Playbook — nicht jeder QR an der Klassentür) — [issues-schulfest-gs39-nachtrag.md](./issues-schulfest-gs39-nachtrag.md). Tablet-Fallback.

---

## Phase 5 — Post-Fest

**Fällig:** 31.10.2026
**Beschreibung:** Directus, Mehrsprachigkeit, Mandanten-Vorbereitung. **ADR-017:** Epic [#97](https://github.com/flxln/schulnavigator/issues/97) abgeschlossen (#98–#100). Kein harter Termin — Prioritäten nach Auswertung.

---

## MPZ Studio v0 — internes Ingest-Tool (ADR-022)

**Fällig:** 22.06.2026 · **Status:** abgeschlossen (2026-06-17, PR #156)
**Beschreibung:** Ausnahme zur Phasen-Konvention — bewusst **eigener** Milestone, weil MPZ Studio als initiative über v0 (vor Fest) / v1 / v2 (Post-Fest) spannt und in keine einzelne Phase passt. v0-Scope: schmales, MPZ-internes Dev-only-Pflege-UI (ADR-022) als optionaler **Plan B** zum CLI/JSON-Workflow — Medien-Ingest, Dialog-Audio, Hotspot-Kalibrierung; schreibt nur lokale Repo-Dateien, **nie** auf Coolify. Epic [#144](https://github.com/flxln/schulnavigator/issues/144), Unterissues #145–#151 — [epic-mpz-studio.md](./epic-mpz-studio.md). Optional; Plan A bleibt Pflicht + Fallback und darf nicht blockiert werden.

---

## MPZ Studio v1 — Station-Detail & Content-Pflege (ADR-022)

**Fällig:** 31.07.2026 · **Status:** abgeschlossen (2026-06-18); **0 offene Issues** im Milestone
**Beschreibung:** Station-Detail unter `/mpz/studio/stationen/[slug]` mit Tabs Stammdaten, Medien, Hotspots, Dialog-Audio. Epic [#158](https://github.com/flxln/schulnavigator/issues/158) geschlossen; Unterissues #159–#168 erledigt — [epic-mpz-studio-v1.md](./epic-mpz-studio-v1.md). **Nächster Schritt:** Merge Branch `mpz-studio-v1` → `main` (PR).

---

## MPZ Studio v2 — Content-Vollständigkeit & Betrieb (ADR-022)

**Fällig:** 31.08.2026 · **Status:** abgeschlossen (2026-06-20); **GitHub-Milestone:** [#9](https://github.com/flxln/schulnavigator/milestone/9)
**Beschreibung:** Raumbild-Upload, Medien bearbeiten/link/embed, Dialog-Editor, Dialog-Hotspots, Coach-CRUD, Deploy-Tab, Config-Extraktion (Allowlist, Hub, Brand). Epic [#170](https://github.com/flxln/schulnavigator/issues/170) geschlossen; Unterissues #171–#181 erledigt — [epic-mpz-studio-v2.md](./epic-mpz-studio-v2.md). Gemerged nach `main` ([PR #183](https://github.com/flxln/schulnavigator/pull/183), 2026-06-20).

---

## MPZ Studio v2.1 — Medien-Datei ersetzen (ADR-022)

**Fällig:** 31.08.2026 · **Status:** abgeschlossen (2026-06-20) · **GitHub-Milestone:** [#10](https://github.com/flxln/schulnavigator/milestone/10)
**Beschreibung:** Datei-Inhalt für `audio`/`video`/`foto`/`text` im Studio ersetzen (gleiche `medium.id`), Thumbnail-/Poster-Upload. Schließt v2-Lücke nach #171 (nur Metadaten-PATCH). Epic [#186](https://github.com/flxln/schulnavigator/issues/186) geschlossen; Unterissues #187–#190 erledigt — [epic-mpz-studio-v2.1.md](./archiv/epics/epic-mpz-studio-v2.1.md). Gemerged nach `main` ([PR #194](https://github.com/flxln/schulnavigator/pull/194), 2026-06-20). **Nicht:** Markdown-Editor, YouTube (v3).

---

## Coach Erweiterungen (ADR-019)

**Fällig:** 31.07.2026 · **Status:** abgeschlossen (2026-06-20) · **GitHub-Milestone:** [#11](https://github.com/flxln/schulnavigator/milestone/11)
**Beschreibung:** Layout pro Coach-Message (Figur + Sprechblase, Blase relativ zur Figur) und optionales Audio mit Autoplay. Epic [#191](https://github.com/flxln/schulnavigator/issues/191) geschlossen; Unterissues #192–#193 erledigt — [epic-coach-erweiterungen.md](./archiv/epics/epic-coach-erweiterungen.md). Gemerged nach `main` ([PR #194](https://github.com/flxln/schulnavigator/pull/194), 2026-06-20).

---

## MPZ Studio UI-Cleanup — IA & Navigation (ADR-022)

**Fällig:** 31.07.2026 · **Status:** offen (2026-06-22) · **GitHub-Milestone:** [#12](https://github.com/flxln/schulnavigator/milestone/12)
**Beschreibung:** Refactor der Studio-Oberfläche bei voller v2.1-Funktionsabdeckung: gruppierte Sidebar, Redundanzen entfernen, Dialog-Lifecycle (Create-API), Sphere-Kalibrierung ins MPZ-Tool, Formular-Patterns, Mobile. Epic [#195](https://github.com/flxln/schulnavigator/issues/195), Unterissues #196–#204 — [epic-mpz-studio-ui-cleanup.md](./epic-mpz-studio-ui-cleanup.md). Roadmap: [ROADMAP.md](../archiv/design/mpz-studio-claude-design-cleanup/ROADMAP.md). **Nicht:** v3 Polish, Directus.
