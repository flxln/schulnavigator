<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Build- und Laufzeitkontext (Schulnavigator)

Dieses Verzeichnis (`app/`) ist der **einzige** Docker-Build-Kontext und die Laufzeit-App. Die Git-Submodule **`auftraggeber/`** und **`protokolle/`** (eine Ebene darüber) dürfen **nicht** in Build-Skripte, Imports oder Deploy-Schritte eingebunden werden, ohne dass die benötigten Dateien **hier** liegen (z. B. `scripts/reference/`, `public/`, `data/`).

Regeln, Ursache des Deploy-Fehlers `validate:tokens` / `/auftraggeber/...` und Checkliste: [`../dokumentation/build-kontext-submodule-regeln.md`](../dokumentation/build-kontext-submodule-regeln.md).
