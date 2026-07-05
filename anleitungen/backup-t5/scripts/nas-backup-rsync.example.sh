#!/usr/bin/env bash
# Schüler-Medien-Backup VPS → Synology NAS über Headscale (#243)
# DSM Task Scheduler → User-defined script (Benutzer: felixlein oder root)
#
# DSM 7: Outbound-Traffic nutzt tailscale nc (userspace/SPK-Standard).
# Einmalig: nas-headscale-configure-host.example.sh als root → danach optional ProxyCommand entfernen.

set -uo pipefail

VPS_HEADSCALE_IP="${VPS_HEADSCALE_IP:-100.64.0.7}"
VPS_USER="${VPS_USER:-backup-read}"
SSH_KEY="${SSH_KEY:-/var/services/homes/felixlein/.ssh/schulnavigator_backup}"
TS_BIN="${TS_BIN:-/var/packages/Tailscale/target/bin/tailscale}"
TS_SOCK="${TS_SOCK:-/volume1/@appdata/Tailscale/tailscaled.sock}"
NAS_ROOT="${NAS_ROOT:-/var/services/homes/felixlein/schulnavigator-backup}"

RSYNC_SSH="ssh -i ${SSH_KEY} -o StrictHostKeyChecking=accept-new -o ConnectTimeout=30 -o ProxyCommand='${TS_BIN} --socket=${TS_SOCK} nc %h %p'"

status=0

for dir in media dialog-audio coach-audio; do
  mkdir -p "${NAS_ROOT}/${dir}"
  if ! rsync -avz \
    --no-perms --no-owner --no-group \
    -e "${RSYNC_SSH}" \
    "${VPS_USER}@${VPS_HEADSCALE_IP}:${dir}/" \
    "${NAS_ROOT}/${dir}/"; then
    echo "FEHLER bei ${dir}" >&2
    status=1
  fi
done

if [[ "${status}" -eq 0 ]]; then
  echo "Backup completed $(date -Iseconds)"
else
  echo "Backup mit Fehlern beendet $(date -Iseconds)" >&2
fi

exit "${status}"
