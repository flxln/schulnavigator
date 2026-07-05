#!/usr/bin/env bash
# VPS-Setup für backup-read (#243) — auf coolify-server als root/sudo ausführen.
# Voraussetzung: Public Key vom NAS liegt in /tmp/schulnavigator_backup.pub

set -euo pipefail

if ! command -v setfacl >/dev/null 2>&1; then
  sudo apt-get install -y acl
fi

BACKUP_USER="backup-read"
VOLUME_BASE="/data/schulnavigator"
RRSYNC="$(command -v rrsync || true)"
if [[ -z "${RRSYNC}" ]] && [[ -x /usr/bin/rrsync ]]; then
  RRSYNC="/usr/bin/rrsync"
fi
if [[ -z "${RRSYNC}" ]]; then
  echo "rrsync nicht gefunden — openssh-client/rsync-Paket prüfen" >&2
  exit 1
fi

if ! id "${BACKUP_USER}" &>/dev/null; then
  sudo useradd --system --home-dir "/var/lib/${BACKUP_USER}" --shell /bin/sh "${BACKUP_USER}"
fi

sudo mkdir -p "/var/lib/${BACKUP_USER}/.ssh"
sudo chmod 700 "/var/lib/${BACKUP_USER}/.ssh"

PUB_KEY_FILE="${1:-/tmp/schulnavigator_backup.pub}"
if [[ ! -f "${PUB_KEY_FILE}" ]]; then
  echo "Usage: $0 /path/to/schulnavigator_backup.pub" >&2
  exit 1
fi

PUB_KEY="$(tr -d '\n' < "${PUB_KEY_FILE}")"
FORCED="command=\"${RRSYNC} -ro ${VOLUME_BASE}/\",no-agent-forwarding,no-port-forwarding,no-pty,no-user-rc,no-X11-forwarding ${PUB_KEY}"

echo "${FORCED}" | sudo tee "/var/lib/${BACKUP_USER}/.ssh/authorized_keys" >/dev/null
sudo chmod 600 "/var/lib/${BACKUP_USER}/.ssh/authorized_keys"
sudo chown -R "${BACKUP_USER}:${BACKUP_USER}" "/var/lib/${BACKUP_USER}/.ssh"

for dir in media dialog-audio coach-audio; do
  path="${VOLUME_BASE}/${dir}"
  if [[ -d "${path}" ]]; then
    sudo setfacl -R -m "u:${BACKUP_USER}:r-X" "${path}"
    sudo setfacl -R -d -m "u:${BACKUP_USER}:r-X" "${path}"
    echo "ACL gesetzt: ${path}"
  else
    echo "WARNUNG: ${path} fehlt" >&2
  fi
done

echo "backup-read eingerichtet. Verify vom NAS:"
echo "  rsync -e \"ssh -i <key>\" backup-read@<VPS_TAILNET_IP>:media/ --list-only | head"
