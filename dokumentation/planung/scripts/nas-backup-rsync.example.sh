#!/usr/bin/env bash
# Beispiel: Schüler-Medien-Backup VPS → Synology NAS über Headscale (#243)
# Auf dem NAS ausführen (DSM Task Scheduler → User-defined script).
# Anpassen: VPS_HEADSCALE_IP, SSH_KEY, Pfade.

set -euo pipefail

VPS_HEADSCALE_IP="${VPS_HEADSCALE_IP:-100.64.0.1}"
VPS_USER="${VPS_USER:-backup-read}"
SSH_KEY="${SSH_KEY:-/var/services/homes/admin/.ssh/schulnavigator_backup}"
RSYNC_SSH="ssh -i ${SSH_KEY} -o StrictHostKeyChecking=accept-new -o ConnectTimeout=30"

NAS_ROOT="${NAS_ROOT:-/volume1/schulnavigator-backup}"
REMOTE_ROOT="/data/schulnavigator"

for dir in media dialog-audio coach-audio; do
  mkdir -p "${NAS_ROOT}/${dir}"
  rsync -avz \
    --no-perms --no-owner --no-group \
    -e "${RSYNC_SSH}" \
    "${VPS_USER}@${VPS_HEADSCALE_IP}:${REMOTE_ROOT}/${dir}/" \
    "${NAS_ROOT}/${dir}/"
done

echo "Backup completed $(date -Iseconds)"
