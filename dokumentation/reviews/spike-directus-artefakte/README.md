# Spike-Artefakte — Directus-Wegwerf-Instanz (#251)

Dieser Ordner enthält Referenz-Artefakte aus dem technischen Spike [#251](https://github.com/flxln/schulnavigator/issues/251), bevor die Wegwerf-Directus-Instanz zurückgebaut wurde (Phase 8, siehe [Spike-Bericht](../spike-directus-2026-07.md)).

## `directus-postgres-dump-2026-07-06.sql`

`pg_dump` der Directus-Postgres-Datenbank (`directus`) direkt vor dem Rückbau des Coolify-Services `directus-spike-251`. Enthält das per API angelegte Schema (Collections `stations`, `medien`, `hotspots360`, `dialog_segmente` + Directus-Systemtabellen) und die Demo-Daten der Station `klassenzimmer`.

**Zweck:** Referenz für #255/#256, falls das Datenmodell aus dem Spike als Ausgangspunkt für die produktive Directus-Instanz dienen soll — kein Restore-Ziel für ein Produktivsystem (Admin-Zugangsdaten und statischer Token darin sind Spike-only und wurden nach dem Dump ungültig, da die Instanz gelöscht wurde).

**Nicht enthalten:** Medien-Binärdateien (Directus-`uploads`-Volume), da für die Demo-Station nur das eine Dummy-Testbild aus Phase 6 hochgeladen und noch vor dem Dump wieder gelöscht wurde.
